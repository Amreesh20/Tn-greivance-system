import React, { useState, useRef } from 'react';

interface VoiceInputProps {
    onTranscription: (result: VoiceProcessingResult) => void;
    language?: 'en-IN' | 'ta-IN';
    maxRecordingSeconds?: number;
}

interface VoiceProcessingResult {
    success: boolean;
    stt?: {
        transcribed_text: string;
        language: string;
        confidence: number;
        audio_duration_ms: number;
    };
    location?: {
        districtId?: string;
        districtName?: string;
    };
    classification?: {
        department?: string;
        confidence?: number;
    };
    pipeline_output?: {
        text: string;
        districtId?: string;
        districtName?: string;
        department?: string;
        classification_confidence?: number;
    };
    error?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
    onTranscription,
    language = 'en-IN',
    maxRecordingSeconds = 5
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            setError(null);
            setRecordingTime(0);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                await processAudio();
            };

            mediaRecorder.start();
            setIsRecording(true);

            let seconds = 0;
            timerRef.current = setInterval(() => {
                seconds++;
                setRecordingTime(seconds);

                if (seconds >= maxRecordingSeconds) {
                    stopRecording();
                }
            }, 1000);

        } catch (err) {
            console.error('Error starting recording:', err);
            setError('Failed to access microphone. Please grant permission.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const processAudio = async () => {
        try {
            setIsProcessing(true);
            setError(null);

            const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            formData.append('language', language);

            const response = await fetch('http://localhost:5000/voice/process', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result: VoiceProcessingResult = await response.json();

            if (!result.success) {
                setError(result.error || 'Voice processing failed');
                return;
            }

            onTranscription(result);

        } catch (err) {
            console.error('Error processing audio:', err);
            setError('Failed to process audio. Please try again.');
        } finally {
            setIsProcessing(false);
            setRecordingTime(0);
        }
    };

    return (
        <div className="voice-input-container">
            <div className="voice-controls">
                {!isRecording && !isProcessing && (
                    <button
                        onClick={startRecording}
                        className="btn-record"
                        aria-label="Start voice recording"
                    >
                        🎤 {language === 'ta-IN' ? 'பதிவு செய்' : 'Start Recording'}
                    </button>
                )}

                {isRecording && (
                    <button
                        onClick={stopRecording}
                        className="btn-recording"
                        aria-label="Stop recording"
                    >
                        ⏹️ Stop ({recordingTime}s / {maxRecordingSeconds}s)
                    </button>
                )}

                {isProcessing && (
                    <div className="processing-indicator">
                        <span className="spinner">⏳</span> Processing voice...
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message" role="alert">
                    ❌ {error}
                </div>
            )}

            <style>{`
        .voice-input-container {
          padding: 1rem;
          margin: 1rem 0;
        }
        
        .voice-controls {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .btn-record, .btn-recording {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-record {
          background-color: #4CAF50;
          color: white;
        }
        
        .btn-record:hover {
          background-color: #45a049;
          transform: scale(1.05);
        }
        
        .btn-recording {
          background-color: #f44336;
          color: white;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .processing-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          color: #2196F3;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 0.75rem;
          border-radius: 4px;
          border-left: 4px solid #f44336;
        }
      `}</style>
        </div>
    );
};

export default VoiceInput;
