# ml-service/app/services/priority_calculator.py
from typing import Optional
import re


class PriorityCalculator:
    """
    Enhanced priority calculator with sentiment analysis
    
    Priority Score Formula:
        Priority = (Sentiment × 0.20) + (Urgency × 0.20) + (Severity × 0.25) +
                   (Location Risk × 0.20) + (Safety Hazard × 0.15)
    
    Priority Levels:
        - CRITICAL (8.5-10.0): 2-hour SLA (red)
        - HIGH (6.5-8.4): 4-hour SLA (orange)
        - MEDIUM (4.0-6.4): 24-hour SLA (yellow)
        - LOW (0.0-3.9): 72-hour SLA (green)
    """
    
    # Safety/emergency keywords
    EMERGENCY_KEYWORDS = [
        'fire', 'flood', 'accident', 'injury', 'death', 'collapse',
        'explosion', 'gas leak', 'electric shock', 'burning',
        'child', 'baby', 'died', 'bleeding', 'unconscious'
    ]
    
    # High-risk location keywords
    HIGH_RISK_LOCATIONS = {
        'hospital': 9,
        'school': 9,
        'college': 8,
        'temple': 8,
        'church': 8,
        'mosque': 8,
        'market': 7,
        'bus stand': 7,
        'railway': 8,
        'station': 7,
        'bridge': 8,
        'main road': 7,
        'highway': 8,
        'junction': 7,
        'signal': 6,
    }
    
    def calculate_priority(
        self,
        text: str,
        sentiment_score: float = None,
        urgency_score: float = None,
        image_severity: float = None,
        voice_urgency: float = None,
        latitude: float = None,
        longitude: float = None
    ) -> dict:
        """
        Calculate priority score with sentiment analysis integration
        
        Args:
            text: Complaint text
            sentiment_score: Sentiment/distress score (0-10) from sentiment analyzer
            urgency_score: Urgency score (0-10) from sentiment analyzer
            image_severity: Image severity score (0-10) from CV model
            voice_urgency: Voice urgency score (0-10) from speech analysis
            latitude: Location latitude
            longitude: Location longitude
            
        Returns:
            Dictionary with priority score, level, SLA, and component breakdown
        """
        
        text_lower = text.lower() if text else ""
        
        # ============================================================================
        # 1. SENTIMENT COMPONENT (0-10) - 20% weight
        # ============================================================================
        sentiment_component = sentiment_score if sentiment_score is not None else 5.0
        
        # ============================================================================
        # 2. URGENCY COMPONENT (0-10) - 20% weight
        # ============================================================================
        urgency_component = urgency_score if urgency_score is not None else 5.0
        
        # Boost from voice urgency if available
        if voice_urgency is not None and voice_urgency > urgency_component:
            urgency_component = voice_urgency
        
        # ============================================================================
        # 3. SEVERITY COMPONENT from image (0-10) - 25% weight
        # ============================================================================
        severity_component = image_severity if image_severity is not None else 5.0
        
        # ============================================================================
        # 4. LOCATION RISK SCORE (0-10) - 20% weight
        # ============================================================================
        location_risk = 3.0  # Base score
        
        # Check for high-risk locations
        for location, score in self.HIGH_RISK_LOCATIONS.items():
            if location in text_lower:
                location_risk = max(location_risk, score)
        
        # ============================================================================
        # 5. SAFETY HAZARD SCORE (0-10) - 15% weight
        # ============================================================================
        safety_hazard = 0
        emergency_keywords_found = []
        
        for keyword in self.EMERGENCY_KEYWORDS:
            if keyword in text_lower:
                safety_hazard += 3
                emergency_keywords_found.append(keyword)
        
        safety_hazard = min(10, safety_hazard)
        
        # ============================================================================
        # CALCULATE WEIGHTED PRIORITY SCORE
        # ============================================================================
        priority_score = (
            sentiment_component * 0.20 +   # Citizen distress
            urgency_component * 0.20 +     # Time urgency
            severity_component * 0.25 +    # Physical damage severity
            location_risk * 0.20 +         # Location criticality
            safety_hazard * 0.15           # Safety/emergency factors
        )
        
        # ============================================================================
        # EMERGENCY BOOST (for life-threatening situations)
        # ============================================================================
        emergency_boost = False
        critical_keywords = ['fire', 'death', 'injury', 'collapse', 'explosion', 'died', 'bleeding']
        
        if any(word in text_lower for word in critical_keywords):
            priority_score = min(10, priority_score + 2)
            emergency_boost = True
        
        # ============================================================================
        # DETERMINE PRIORITY LEVEL AND SLA
        # ============================================================================
        if priority_score >= 8.5:
            priority_level = "CRITICAL"
            sla_hours = 2
            color = "red"
        elif priority_score >= 6.5:
            priority_level = "HIGH"
            sla_hours = 4
            color = "orange"
        elif priority_score >= 4.0:
            priority_level = "MEDIUM"
            sla_hours = 24
            color = "yellow"
        else:
            priority_level = "LOW"
            sla_hours = 72
            color = "green"
        
        return {
            'priority_score': round(priority_score, 2),
            'priority_level': priority_level,
            'sla_hours': sla_hours,
            'color': color,
            'components': {
                'sentiment': round(sentiment_component, 1),
                'urgency': round(urgency_component, 1),
                'severity': round(severity_component, 1),
                'location_risk': round(location_risk, 1),
                'safety_hazard': round(safety_hazard, 1)
            },
            'emergency_boost_applied': emergency_boost,
            'emergency_keywords_found': emergency_keywords_found if emergency_keywords_found else None
        }


# ============================================================================
# HELPER FUNCTION (for backward compatibility)
# ============================================================================

def analyze_complaint_priority(
    text: str,
    image_severity: float = None,
    voice_urgency: float = None,
    sentiment_score: float = None,
    latitude: float = None,
    longitude: float = None
) -> dict:
    """
    Helper function to calculate priority without instantiating class
    
    Args:
        text: Complaint text
        image_severity: Image severity score (0-10)
        voice_urgency: Voice urgency score (0-10)
        sentiment_score: Sentiment score (0-10)
        latitude: Location latitude
        longitude: Location longitude
        
    Returns:
        Priority calculation result
    """
    calculator = PriorityCalculator()
    
    # If sentiment_score is provided but urgency is not, use sentiment as urgency
    urgency_score = voice_urgency if voice_urgency is not None else sentiment_score
    
    return calculator.calculate_priority(
        text=text,
        sentiment_score=sentiment_score,
        urgency_score=urgency_score,
        image_severity=image_severity,
        voice_urgency=voice_urgency,
        latitude=latitude,
        longitude=longitude
    )
