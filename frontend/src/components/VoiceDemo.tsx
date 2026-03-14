import React, { useState } from 'react';
import VoiceInput from './VoiceInput';

interface VoiceProcessingResult {
    success: boolean;
    stt?: {
        transcribed_text: string;
        language: string;
    };
    pipeline_output?: {
        text: string;
        districtId?: string;
        districtName?: string;
        department?: string;
    };
    error?: string;
}

function VoiceDemo() {
    const [result, setResult] = useState<VoiceProcessingResult | null>(null);
    const [language, setLanguage] = useState<'en-IN' | 'ta-IN'>('en-IN');

    const handleTranscription = (voiceResult: VoiceProcessingResult) => {
        console.log('Voice processing result:', voiceResult);
        setResult(voiceResult);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
            <h1>🎤 Voice Complaint System</h1>

            <div style={{ marginBottom: '1rem' }}>
                <label>
                    Language:
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'en-IN' | 'ta-IN')}
                        style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
                    >
                        <option value="en-IN">English (India)</option>
                        <option value="ta-IN">தமிழ் (Tamil)</option>
                    </select>
                </label>
            </div>

            <VoiceInput
                onTranscription={handleTranscription}
                language={language}
                maxRecordingSeconds={10}
            />

            {result && result.success && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '8px',
                    border: '1px solid #4CAF50'
                }}>
                    <h3>✅ Processing Complete</h3>

                    <div style={{ marginTop: '1rem' }}>
                        <strong>Transcribed Text:</strong>
                        <p style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>
                            {result.stt?.transcribed_text}
                        </p>
                    </div>

                    {result.pipeline_output && (
                        <div style={{ marginTop: '1rem' }}>
                            <strong>ML Analysis:</strong>
                            <ul style={{ marginTop: '0.5rem' }}>
                                <li><strong>District:</strong> {result.pipeline_output.districtName || 'Not detected'} ({result.pipeline_output.districtId || 'N/A'})</li>
                                <li><strong>Department:</strong> {result.pipeline_output.department || 'Not classified'}</li>
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {result && !result.success && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    backgroundColor: '#ffebee',
                    borderRadius: '8px',
                    border: '1px solid #f44336'
                }}>
                    <h3>❌ Error</h3>
                    <p>{result.error}</p>
                </div>
            )}
        </div>
    );
}

export default VoiceDemo;
