import speech_recognition as sr
import io
from pydub import AudioSegment
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class SpeechToText:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 2000  # Lower = more sensitive
        self.recognizer.dynamic_energy_threshold = True
    
    def transcribe_audio(self, audio_bytes: bytes, language: str = 'en-IN') -> Dict[str, Any]:
        try:
            # Convert to WAV
            audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes))
            
            # DEBUG: Check audio properties
            duration_sec = len(audio_segment) / 1000.0
            logger.info(f"📊 Audio: {duration_sec:.2f}s, {audio_segment.frame_rate}Hz, {audio_segment.channels}ch")
            
            # Enhance audio quality
            audio_segment = audio_segment.set_channels(1)  # Mono
            audio_segment = audio_segment.set_frame_rate(16000)  # Standard STT rate
            
            # Increase volume if quiet
            audio_segment = audio_segment + 10  # +10dB boost
            
            wav_buffer = io.BytesIO()
            audio_segment.export(wav_buffer, format="wav")
            wav_buffer.seek(0)
            
            with sr.AudioFile(wav_buffer) as source:
                # Adjust for noise
                self.recognizer.adjust_for_ambient_noise(source, duration=0.3)
                audio_data = self.recognizer.record(source)
                
                # DEBUG: Check energy level
                logger.info(f"🔊 Energy threshold: {self.recognizer.energy_threshold}")
            
            # Try recognition
            logger.info(f"🎤 Calling Google STT ({language})...")
            text = self.recognizer.recognize_google(audio_data, language=language)
            
            logger.info(f"✅ SUCCESS: '{text}'")
            
            return {
                "success": True,
                "transcribed_text": text,
                "language": language,
                "confidence": 0.9,
                "audio_duration_ms": len(audio_segment)
            }
            
        except sr.UnknownValueError:
            logger.warning("❌ Speech not recognized (too quiet/unclear/silence)")
            return {
                "success": False,
                "error": "Could not understand audio. Please speak LOUDLY and CLEARLY.",
                "error_code": "UNCLEAR_AUDIO"
            }
        except sr.RequestError as e:
            logger.error(f"Google API error: {e}")
            return {
                "success": False,
                "error": f"Speech service error: {str(e)}",
                "error_code": "SERVICE_ERROR"
            }
        except Exception as e:
            logger.error(f"Processing error: {e}")
            return {
                "success": False,
                "error": f"Audio processing failed: {str(e)}",
                "error_code": "PROCESSING_ERROR"
            }

_stt_instance = None

def get_stt_service() -> SpeechToText:
    global _stt_instance
    if _stt_instance is None:
        _stt_instance = SpeechToText()
    return _stt_instance

def transcribe_audio(audio_bytes: bytes, language: str = 'en-IN') -> Dict[str, Any]:
    stt = get_stt_service()
    return stt.transcribe_audio(audio_bytes, language)
