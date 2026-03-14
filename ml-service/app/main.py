# ml-service/app/main.py
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os

# Import services
from app.services import location_extractor
from app.services.text_classifier import classify_text, classifier
from app.services.speech_to_text import transcribe_audio
from app.services.image_analyzer import analyze_image
from app.services.priority_calculator import analyze_complaint_priority
from app.services.sentiment_analyzer import get_sentiment_analyzer, analyze_sentiment


# ============================================================================
# INITIALIZE APP
# ============================================================================

app = FastAPI(
    title="TN Grievance ML Service", 
    version="1.0",
    description="AI-powered grievance classification, location extraction, and priority scoring"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# REQUEST MODELS
# ============================================================================

class ExtractRequest(BaseModel):
    text: str


class ClassifyRequest(BaseModel):
    text: str


class PriorityRequest(BaseModel):
    text: str
    image_severity: Optional[float] = None
    voice_urgency: Optional[float] = None
    sentiment_score: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class TextAnalysisRequest(BaseModel):
    text: str


# ============================================================================
# STARTUP EVENT
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Load districts data and initialize services on startup"""
    # Get the absolute path to districts.json
    current_file_dir = os.path.dirname(os.path.abspath(__file__))
    ml_service_dir = os.path.dirname(current_file_dir)
    districts_path = os.path.join(ml_service_dir, 'districts.json')
    
    print(f"🔍 Startup: Looking for districts.json at: {districts_path}")
    print(f"📁 File exists: {os.path.exists(districts_path)}")
    
    success = location_extractor.load_districts(districts_path)
    if success:
        print(f"✅ SUCCESS: {len(location_extractor.DISTRICTS_DATA)} districts loaded!")
    else:
        print("❌ FAILED: Check districts.json permissions/path")
    
    # Initialize sentiment analyzer
    analyzer = get_sentiment_analyzer()
    print("✅ Sentiment Analyzer initialized!")


# ============================================================================
# ROOT AND HEALTH CHECK
# ============================================================================

@app.get("/")
async def root():
    """Welcome message and API info"""
    return {
        "message": "TN Grievance ML Service API",
        "version": "1.0",
        "description": "AI-powered grievance classification and routing",
        "docs": "/docs",
        "health": "/health",
        "features": [
            "Text Classification (6 departments)",
            "Location Extraction (38 districts, 3-tier matching)",
            "Voice Processing (Google STT)",
            "Image Analysis (Computer Vision)",
            "Priority Scoring (Multi-factor algorithm)",
            "Sentiment Analysis (VADER + TextBlob)"
        ]
    }


@app.get("/health")
async def health():
    """Health check endpoint - verify all services are loaded"""
    return {
        "status": "OK",
        "service": "TN Grievance ML Service",
        "version": "1.0",
        "districts_loaded": bool(location_extractor.DISTRICTS_DATA),
        "districts_count": len(location_extractor.DISTRICTS_DATA),
        "district_sample": list(location_extractor.DISTRICTS_DATA.keys())[:3] if location_extractor.DISTRICTS_DATA else [],
        "categories_loaded": bool(classifier.departments),
        "categories_count": len(classifier.departments),
        "categories": list(classifier.departments.keys()) if classifier.departments else [],
        "sentiment_analyzer": get_sentiment_analyzer() is not None,
        "endpoints": {
            "location": "/location/extract",
            "classification": "/classify/text",
            "sentiment": "/sentiment/analyze",
            "voice": "/voice/process",
            "image": "/image/analyze",
            "priority": "/priority/calculate",
            "health": "/health",
            "docs": "/docs"
        },
        "features": {
            "sentiment_analysis": True,
            "priority_calculation": True,
            "emotion_detection": True
        }
    }


# ============================================================================
# LOCATION EXTRACTION
# ============================================================================

@app.post("/location/extract")
async def location_extract(request: ExtractRequest):
    """
    Extract location (district) from complaint text
    
    Example:
        POST /location/extract
        {"text": "Pothole in Madurai near hospital"}
        
        Response:
        {
            "districtId": "TN_MDU_001",
            "districtName": "Madurai",
            "confidence": 0.99,
            "method": "exact_match"
        }
    """
    result = location_extractor.extract_location(request.text)
    return result


# ============================================================================
# SENTIMENT ANALYSIS
# ============================================================================

@app.post("/sentiment/analyze")
async def analyze_sentiment_endpoint(request: TextAnalysisRequest):
    """
    Analyze sentiment and urgency from text
    
    Uses VADER and TextBlob for comprehensive sentiment analysis.
    Returns sentiment score, urgency score, and emotion classification.
    
    Example:
        POST /sentiment/analyze
        {"text": "URGENT! Large pothole near hospital!"}
        
        Response:
        {
            "success": true,
            "sentiment_score": 8.5,
            "urgency_score": 9.0,
            "emotion": "urgent",
            "vader_scores": {...},
            "analysis_details": {...}
        }
    """
    try:
        result = analyze_sentiment(request.text)
        return {
            'success': True,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# TEXT CLASSIFICATION
# ============================================================================

@app.post("/classify/text")
async def classify_complaint(request: ClassifyRequest):
    """
    Classify complaint text into department categories
    
    Example:
        POST /classify/text
        {"text": "Pothole on main road"}
        
        Response:
        {
            "department": "PUBLIC_WORKS",
            "confidence": 0.87,
            "all_scores": {...}
        }
    """
    result = classify_text(request.text)
    return result


# ============================================================================
# PRIORITY CALCULATION
# ============================================================================

@app.post("/priority/calculate")
async def calculate_priority_endpoint(request: PriorityRequest):
    """
    Calculate complaint priority score using multi-factor algorithm
    
    Formula:
        Priority = (Sentiment × 0.20) + (Urgency × 0.20) + (Severity × 0.25) +
                   (Location Risk × 0.20) + (Safety Hazard × 0.15)
    
    Levels:
        - CRITICAL (8.5-10.0): 2-hour SLA (red)
        - HIGH (6.5-8.4): 4-hour SLA (orange)
        - MEDIUM (4.0-6.4): 24-hour SLA (yellow)
        - LOW (0.0-3.9): 72-hour SLA (green)
    
    Example:
        POST /priority/calculate
        {
            "text": "Large pothole near hospital, child fell and injured",
            "image_severity": 8.0,
            "voice_urgency": 7.0
        }
        
        Response:
        {
            "priority_score": 8.75,
            "priority_level": "CRITICAL",
            "sla_hours": 2,
            "color": "red",
            "components": {...},
            "sentiment_analysis": {...}
        }
    """
    try:
        # First analyze sentiment if not provided
        sentiment_analysis_result = None
        sentiment_score = request.sentiment_score
        urgency_from_sentiment = request.voice_urgency
        
        if sentiment_score is None:
            sentiment_analysis_result = analyze_sentiment(request.text)
            sentiment_score = sentiment_analysis_result['sentiment_score']
            urgency_from_sentiment = sentiment_analysis_result['urgency_score']
        
        result = analyze_complaint_priority(
            text=request.text,
            image_severity=request.image_severity,
            voice_urgency=urgency_from_sentiment,
            sentiment_score=sentiment_score,
            latitude=request.latitude,
            longitude=request.longitude
        )
        
        # Add sentiment analysis to response
        result['sentiment_analysis'] = {
            'sentiment_score': sentiment_score,
            'urgency_score': urgency_from_sentiment or 5.0
        }
        
        if sentiment_analysis_result:
            result['sentiment_analysis']['emotion'] = sentiment_analysis_result.get('emotion', 'neutral')
            result['sentiment_analysis']['polarity'] = sentiment_analysis_result.get('polarity', 0.0)
            result['sentiment_analysis']['subjectivity'] = sentiment_analysis_result.get('subjectivity', 0.0)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Priority calculation failed: {str(e)}")


# ============================================================================
# VOICE PROCESSING
# ============================================================================

@app.post("/voice/process")
async def process_voice(
    audio: UploadFile = File(..., description="Audio file from microphone (webm/mp3/wav)"),
    language: str = "en-IN"
):
    """
    Process voice input from browser microphone
    
    Flow: Voice → Text → District + Department Classification
    
    Args:
        audio: Audio file from browser's MediaRecorder API
        language: 'en-IN' for English, 'ta-IN' for Tamil
    
    Returns:
        Combined STT + ML pipeline results
    """
    try:
        # Read audio bytes from uploaded file
        audio_bytes = await audio.read()
        
        # 1. Speech to Text
        stt_result = transcribe_audio(audio_bytes, language)
        
        # Check for STT errors
        if not stt_result.get("success", False):
            return {
                "success": False,
                "error": stt_result.get("error", "Speech recognition failed"),
                "error_code": stt_result.get("error_code", "UNKNOWN")
            }
        
        transcribed_text = stt_result["transcribed_text"]
        
        # 2. Extract location from transcribed text
        location_result = location_extractor.extract_location(transcribed_text)
        
        # 3. Classify department from transcribed text
        classification_result = classify_text(transcribed_text)
        
        # 4. Analyze sentiment from transcribed text
        sentiment_result = analyze_sentiment(transcribed_text)
        
        # Return combined results
        return {
            "success": True,
            "stt": {
                "transcribed_text": transcribed_text,
                "language": stt_result["language"],
                "confidence": stt_result["confidence"],
                "audio_duration_ms": stt_result["audio_duration_ms"]
            },
            "location": location_result,
            "classification": classification_result,
            "sentiment": sentiment_result,
            "pipeline_output": {
                "text": transcribed_text,
                "districtId": location_result.get("districtId"),
                "districtName": location_result.get("districtName"),
                "department": classification_result.get("department"),
                "classification_confidence": classification_result.get("confidence"),
                "sentiment_score": sentiment_result.get("sentiment_score"),
                "urgency_score": sentiment_result.get("urgency_score"),
                "emotion": sentiment_result.get("emotion")
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice processing failed: {str(e)}")


# ============================================================================
# IMAGE ANALYSIS
# ============================================================================

@app.post("/image/analyze")
async def analyze_complaint_image(
    image: UploadFile = File(..., description="Image of damage/issue (jpg/png)"),
):
    """
    Analyze uploaded image for infrastructure damage
    
    Flow: Image → Computer Vision Analysis → Department + Severity
    """
    try:
        image_bytes = await image.read()
        
        # Validate image
        if not image.content_type.startswith('image/'):
            raise HTTPException(400, "File must be an image (jpg/png)")
        
        # Analyze
        result = analyze_image(image_bytes)
        
        if not result.get("success"):
            raise HTTPException(500, result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Image analysis failed: {str(e)}")


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
