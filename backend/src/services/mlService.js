// backend/src/services/mlService.js
const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

class MLService {
    /**
     * Extract district from complaint text using ML service
     * @param {string} text - The complaint text
     * @returns {Promise<Object|null>} - Location data with districtId, districtName, confidence
     */
    static async extractDistrict(text) {
        if (!text) return null;

        try {
            console.log(`🤖 ML Extracting location from: "${text}"`);
            const { data } = await axios.post(
                `${ML_URL}/location/extract`,
                { text },
                { timeout: 5000 }
            );

            console.log(`✅ ML → ${data.districtName} (conf: ${data.confidence})`);

            // Return full location data
            return {
                districtId: data.districtId,
                districtName: data.districtName,
                confidence: data.confidence,
                latitude: data.latitude,
                longitude: data.longitude,
                matchedWords: data.matchedWords,
                useResult: data.confidence > 0.75 // Helper flag
            };
        } catch (error) {
            console.error('❌ ML location extraction failed:', error.message);
            return null;
        }
    }

    /**
     * Classify complaint into department categories using ML service
     * @param {string} text - The complaint text
     * @returns {Promise<Object|null>} - Classification data with department, confidence, scores
     */
    static async classifyComplaint(text) {
        if (!text) return null;

        try {
            console.log(`🤖 ML Classifying: "${text}"`);
            const { data } = await axios.post(
                `${ML_URL}/classify/text`,
                { text },
                { timeout: 5000 }
            );

            console.log(`📋 ML → ${data.department} (conf: ${data.confidence})`);

            // Return full classification data
            return {
                department: data.department,
                confidence: data.confidence,
                allScores: data.all_scores,
                useResult: data.confidence > 0.7 // Helper flag
            };
        } catch (error) {
            console.error('❌ ML classification failed:', error.message);
            return null;
        }
    }

    /**
     * Calculate priority using ML service
     * @param {Object} params - Priority calculation parameters
     * @param {string} params.text - The complaint text
     * @param {number} [params.imageSeverity] - Image severity score (0-10)
     * @param {number} [params.voiceUrgency] - Voice urgency score (0-10)
     * @param {number} [params.sentimentScore] - Sentiment score (0-10)
     * @param {number} [params.latitude] - Location latitude
     * @param {number} [params.longitude] - Location longitude
     * @returns {Promise<Object|null>} - Priority calculation result
     */
    static async calculatePriority(params) {
        if (!params.text) return null;

        try {
            console.log(`🎯 ML Calculating priority for: "${params.text}"`);

            const { data } = await axios.post(
                `${ML_URL}/priority/calculate`, // Fixed endpoint
                {
                    text: params.text,
                    image_severity: params.imageSeverity || null,
                    voice_urgency: params.voiceUrgency || null,
                    sentiment_score: params.sentimentScore || null,
                    latitude: params.latitude || null,
                    longitude: params.longitude || null
                },
                { timeout: 5000 }
            );

            console.log(`⚡ ML Priority → ${data.priority_level} (score: ${data.priority_score})`);

            return {
                priorityLevel: data.priority_level,
                priorityScore: data.priority_score,
                slaHours: data.sla_hours,
                color: data.color,
                components: data.components,
                emergencyBoost: data.emergency_boost_applied
            };
        } catch (error) {
            console.error('❌ ML priority calculation failed:', error.message);
            return null;
        }
    }

    /**
     * Process voice complaint (speech-to-text + analysis)
     * @param {Object} audioFile - Multer file object
     * @param {string} [language='en-IN'] - Language code
     * @returns {Promise<Object|null>} - Voice processing results
     */
    static async processVoice(audioFile, language = 'en-IN') {
        if (!audioFile) return null;

        try {
            console.log(`🎤 Processing voice complaint: ${audioFile.originalname}`);

            const FormData = require('form-data');
            const fs = require('fs');

            const formData = new FormData();
            formData.append('audio', fs.createReadStream(audioFile.path));
            formData.append('language', language);

            const { data } = await axios.post(
                `${ML_URL}/voice/process`,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: 30000 // 30s for audio processing
                }
            );

            // Check if transcription was successful
            if (!data.success) {
                console.error(`❌ Voice transcription failed: ${data.error || 'Unknown error'}`);
                return null;
            }

            // Extract text from the nested response structure
            // ML service returns: { stt: { transcribed_text: "..." }, pipeline_output: { text: "..." } }
            const transcribedText = data.stt?.transcribed_text || data.pipeline_output?.text || data.text;

            if (!transcribedText) {
                console.error('❌ No transcribed text in response');
                return null;
            }

            console.log(`✅ Voice transcribed: "${transcribedText.substring(0, 50)}..."`);

            return {
                text: transcribedText,
                language: data.stt?.language || language,
                sentiment: data.sentiment?.sentiment_score || data.pipeline_output?.sentiment_score,
                urgency: data.sentiment?.urgency_score || data.pipeline_output?.urgency_score,
                keywords: data.sentiment?.keywords_detected || [],
                duration: data.stt?.audio_duration_ms
            };
        } catch (error) {
            console.error('❌ Voice processing failed:', error.message);
            return null;
        }
    }

    /**
     * Analyze damage image using computer vision
     * @param {Object} imageFile - Multer file object
     * @returns {Promise<Object|null>} - Image analysis results
     */
    static async analyzeImage(imageFile) {
        if (!imageFile) return null;

        try {
            console.log(`📸 Analyzing image: ${imageFile.originalname}`);

            const FormData = require('form-data');
            const fs = require('fs');

            const formData = new FormData();
            formData.append('image', fs.createReadStream(imageFile.path));

            const { data } = await axios.post(
                `${ML_URL}/image/analyze`,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: 20000 // 20s for image analysis
                }
            );

            // Map severity text to numeric scale
            const severityMap = { 'critical': 9, 'high': 7, 'medium': 5, 'low': 3 };
            const numericSeverity = severityMap[data.severity] || 5;

            console.log(`✅ Image analyzed: ${data.primary_issue} (${data.severity})`);

            return {
                severity: numericSeverity,
                severityText: data.severity,
                primaryIssue: data.primary_issue,
                department: data.department,
                issues: data.detections || [],
                confidence: data.confidence,
                description: data.description || null
            };
        } catch (error) {
            console.error('❌ Image analysis failed:', error.message);
            return null;
        }
    }

    /**
     * Full ML pipeline - analyze complete complaint
     * @param {Object} complaintData - Complete complaint data
     * @param {string} complaintData.text - Complaint text
     * @param {Object} [complaintData.audioFile] - Audio file (Multer object)
     * @param {Object} [complaintData.imageFile] - Image file (Multer object)
     * @param {number} [complaintData.latitude] - Location latitude
     * @param {number} [complaintData.longitude] - Location longitude
     * @returns {Promise<Object>} - Complete ML analysis
     */
    static async analyzeComplaint(complaintData) {
        try {
            console.log('\n🤖 ===== ML PIPELINE START =====');

            const results = {
                text: complaintData.text,
                mlUsed: true,
                timestamp: new Date()
            };

            // 1. Process voice if provided (gets text + sentiment)
            if (complaintData.audioFile) {
                const voiceResult = await this.processVoice(complaintData.audioFile);
                if (voiceResult) {
                    results.voice = voiceResult;
                    // Use transcribed text if original text is empty
                    if (!results.text) {
                        results.text = voiceResult.text;
                    }
                }
            }

            // 2. Analyze image if provided (gets severity)
            if (complaintData.imageFile) {
                const imageResult = await this.analyzeImage(complaintData.imageFile);
                if (imageResult) {
                    results.image = imageResult;
                }
            }

            // 3. Extract location (district)
            if (results.text) {
                const locationResult = await this.extractDistrict(results.text);
                if (locationResult) {
                    results.location = locationResult;
                }
            }

            // 4. Classify department
            if (results.text) {
                const classificationResult = await this.classifyComplaint(results.text);
                if (classificationResult) {
                    results.classification = classificationResult;
                }
            }

            // 5. Calculate priority (using all available data)
            if (results.text) {
                const priorityResult = await this.calculatePriority({
                    text: results.text,
                    imageSeverity: results.image?.severity,
                    voiceUrgency: results.voice?.urgency,
                    sentimentScore: results.voice?.sentiment,
                    latitude: complaintData.latitude,
                    longitude: complaintData.longitude
                });
                if (priorityResult) {
                    results.priority = priorityResult;
                }
            }

            console.log('✅ ===== ML PIPELINE COMPLETE =====\n');

            return {
                success: true,
                ...results,
                // Quick access fields for database
                districtId: results.location?.districtId,
                districtName: results.location?.districtName,
                department: results.classification?.department,
                priorityLevel: results.priority?.priorityLevel || 'MEDIUM',
                priorityScore: results.priority?.priorityScore,
                slaHours: results.priority?.slaHours || 24
            };

        } catch (error) {
            console.error('❌ ML Pipeline Error:', error.message);
            return {
                success: false,
                error: error.message,
                mlUsed: false,
                // Fallback values
                priorityLevel: 'MEDIUM',
                slaHours: 24
            };
        }
    }

    /**
     * Health check for ML service
     * @returns {Promise<Object>} - ML service health status
     */
    static async healthCheck() {
        try {
            const { data } = await axios.get(`${ML_URL}/health`, { timeout: 3000 });
            return {
                status: 'OK',
                ...data
            };
        } catch (error) {
            return {
                status: 'ERROR',
                error: error.message
            };
        }
    }
}

module.exports = MLService;
