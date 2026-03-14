import React, { useState } from 'react';

interface ImageAnalysisResult {
    success: boolean;
    primary_issue?: string;
    department?: string;
    severity?: string;
    confidence?: number;
    detections?: Array<{ type: string; confidence: number }>;
    count?: number;
    error?: string;
}

const ImageUpload: React.FC = () => {
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<ImageAnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setResult(null);

        // Preview
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch('http://localhost:5000/image/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data: ImageAnalysisResult = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Image analysis failed:', error);
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            });
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity?: string) => {
        switch (severity) {
            case 'critical': return '#d32f2f';
            case 'high': return '#f57c00';
            case 'medium': return '#fbc02d';
            case 'low': return '#388e3c';
            default: return '#757575';
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h2>📷 Image Complaint Analysis</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Upload an image of infrastructure damage (pothole, water leak, garbage, etc.)
            </p>

            {/* File Input */}
            <div style={{ marginBottom: '1.5rem' }}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{
                        padding: '0.75rem',
                        border: '2px dashed #ccc',
                        borderRadius: '8px',
                        width: '100%',
                        cursor: 'pointer'
                    }}
                />
            </div>

            {/* Preview & Analyze Button */}
            {preview && (
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '400px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    />
                    <br />
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            padding: '0.75rem 2rem',
                            fontSize: '1rem',
                            backgroundColor: loading ? '#ccc' : '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? '🔍 Analyzing...' : '🤖 Analyze with AI'}
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#2196F3' }}>
                    <div className="spinner" style={{ fontSize: '2rem' }}>⏳</div>
                    <p>Processing image with YOLO...</p>
                </div>
            )}

            {/* Success Result */}
            {result?.success && (
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '8px',
                    border: '2px solid #4CAF50'
                }}>
                    <h3>✅ Analysis Complete</h3>

                    <div style={{ marginTop: '1rem' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            marginTop: '1rem'
                        }}>
                            <div>
                                <strong>Primary Issue:</strong>
                                <p style={{
                                    fontSize: '1.2rem',
                                    margin: '0.25rem 0',
                                    textTransform: 'capitalize'
                                }}>
                                    {result.primary_issue || 'Unknown'}
                                </p>
                            </div>

                            <div>
                                <strong>Department:</strong>
                                <p style={{
                                    fontSize: '1.2rem',
                                    margin: '0.25rem 0',
                                    color: '#1976d2',
                                    fontWeight: 'bold'
                                }}>
                                    {result.department || 'GENERAL'}
                                </p>
                            </div>

                            <div>
                                <strong>Severity:</strong>
                                <p style={{
                                    fontSize: '1.2rem',
                                    margin: '0.25rem 0',
                                    color: getSeverityColor(result.severity),
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}>
                                    {result.severity || 'Low'}
                                </p>
                            </div>

                            <div>
                                <strong>Confidence:</strong>
                                <p style={{ fontSize: '1.2rem', margin: '0.25rem 0' }}>
                                    {result.confidence ? `${(result.confidence * 100).toFixed(0)}%` : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {result.detections && result.detections.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <strong>Detections ({result.count}):</strong>
                                <ul style={{ marginTop: '0.5rem' }}>
                                    {result.detections.map((det, idx) => (
                                        <li key={idx}>
                                            {det.type} ({(det.confidence * 100).toFixed(0)}% confidence)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Error Result */}
            {result && !result.success && (
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#ffebee',
                    borderRadius: '8px',
                    border: '2px solid #f44336'
                }}>
                    <h3>❌ Analysis Failed</h3>
                    <p>{result.error}</p>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
