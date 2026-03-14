# ml-service/app/services/sentiment_analyzer.py
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
import re


class SentimentAnalyzer:
    """
    Advanced sentiment analysis for grievance complaints
    Optimized for detecting distress, urgency, and severity
    """
    
    def __init__(self):
        self.vader = SentimentIntensityAnalyzer()
        
        # High severity/distress keywords
        self.severity_keywords = {
            'urgent': 3.0,
            'emergency': 4.0,
            'critical': 3.5,
            'dangerous': 3.0,
            'severe': 2.5,
            'serious': 2.5,
            'badly': 2.5,
            'terrible': 2.5,
            'horrible': 2.5,
            'worst': 2.0,
            'major': 2.0,
            'broken': 1.5,
            'damaged': 1.5,
            'injured': 3.0,
            'hurt': 2.5,
            'pain': 2.0,
            'died': 4.0,
            'death': 4.0,
            'fire': 4.0,
            'flood': 3.5,
            'collapse': 3.5,
            'accident': 3.0,
            'leak': 2.0,
            'overflow': 2.0,
            'blocked': 1.5,
            'stuck': 1.5,
        }
        
        # Help-seeking phrases (indicate distress in complaint context)
        self.distress_phrases = [
            'please help',
            'need help',
            'help immediately',
            'help urgently',
            'please fix',
            'please solve',
            'do something',
            'take action',
        ]
        
        # Urgency keywords
        self.urgency_keywords = {
            'immediately': 3.0,
            'urgent': 2.5,
            'asap': 2.5,
            'quickly': 2.0,
            'fast': 2.0,
            'now': 2.0,
            'today': 1.5,
            'soon': 1.0,
        }
        
        # Victim/impact keywords (indicates high distress)
        self.victim_keywords = {
            'child': 2.5,
            'children': 2.5,
            'kids': 2.5,
            'baby': 3.0,
            'elderly': 2.0,
            'patient': 2.5,
            'injured': 3.0,
            'fell': 2.0,
            'accident': 3.0,
        }
        
        # High-risk location keywords
        self.location_risk_keywords = {
            'hospital': 2.0,
            'school': 2.0,
            'temple': 1.5,
            'market': 1.5,
            'main road': 1.5,
            'highway': 2.0,
            'bridge': 2.0,
        }
    
    def analyze_text(self, text: str) -> dict:
        """
        Comprehensive sentiment analysis for grievance complaints
        Returns scores from 0-10 where higher = more urgent/distressed
        """
        if not text:
            return {
                'sentiment_score': 5.0,
                'urgency_score': 5.0,
                'polarity': 0.0,
                'subjectivity': 0.0,
                'emotion': 'neutral'
            }
        
        text_lower = text.lower()
        
        # 1. VADER Analysis
        vader_scores = self.vader.polarity_scores(text)
        
        # 2. TextBlob Analysis
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        # 3. Calculate base distress score
        # For complaints, we treat ANY report as distress (base 5.0)
        distress_score = 5.0
        
        # 4. Check for severity keywords
        severity_boost = 0.0
        for keyword, weight in self.severity_keywords.items():
            if keyword in text_lower:
                severity_boost += weight
        
        # 5. Check for help-seeking phrases (indicates distress)
        for phrase in self.distress_phrases:
            if phrase in text_lower:
                severity_boost += 2.0
                break
        
        # 6. Check for victim/impact keywords
        for keyword, weight in self.victim_keywords.items():
            if keyword in text_lower:
                severity_boost += weight
        
        # 7. Check for location risk
        for keyword, weight in self.location_risk_keywords.items():
            if keyword in text_lower:
                severity_boost += weight * 0.5  # Half weight for location
        
        # 8. Negative polarity boost (actual negative sentiment)
        if polarity < -0.1:
            # More negative = more distress
            severity_boost += abs(polarity) * 3.0
        
        # 9. High subjectivity boost (emotional language)
        if subjectivity > 0.5:
            severity_boost += (subjectivity - 0.5) * 2.0
        
        # 10. Capital letters (shouting = distress)
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text) if len(text) > 0 else 0
        if caps_ratio > 0.15:  # More than 15% caps
            severity_boost += caps_ratio * 10.0
        
        # 11. Exclamation marks (urgency)
        exclamation_count = text.count('!')
        severity_boost += exclamation_count * 0.8
        
        # Calculate final sentiment score
        sentiment_score = min(10.0, distress_score + severity_boost)
        
        # ============================================================================
        # URGENCY SCORE (separate from sentiment)
        # ============================================================================
        
        urgency_score = 3.0  # Base urgency
        
        # Add urgency keywords
        for keyword, weight in self.urgency_keywords.items():
            if keyword in text_lower:
                urgency_score += weight
        
        # Add severity keywords (overlap with sentiment but relevant for urgency)
        for keyword, weight in self.severity_keywords.items():
            if keyword in text_lower:
                urgency_score += weight * 0.5
        
        # Caps boost for urgency
        if caps_ratio > 0.15:
            urgency_score += 2.0
        
        # Exclamation boost for urgency
        urgency_score += exclamation_count * 0.5
        
        # Cap urgency at 10
        urgency_score = min(10.0, urgency_score)
        
        # ============================================================================
        # EMOTION CLASSIFICATION
        # ============================================================================
        
        if urgency_score >= 8:
            emotion = 'urgent'
        elif sentiment_score >= 7:
            emotion = 'distressed'
        elif vader_scores['neg'] > 0.3:
            emotion = 'negative'
        elif vader_scores['pos'] > 0.3:
            emotion = 'concerned'  # Polite but still a complaint
        else:
            emotion = 'neutral'
        
        return {
            'sentiment_score': round(sentiment_score, 2),
            'urgency_score': round(urgency_score, 2),
            'polarity': round(polarity, 3),
            'subjectivity': round(subjectivity, 3),
            'emotion': emotion,
            'vader_scores': {
                'compound': vader_scores['compound'],
                'positive': vader_scores['pos'],
                'negative': vader_scores['neg'],
                'neutral': vader_scores['neu']
            },
            'analysis_details': {
                'caps_ratio': round(caps_ratio, 2),
                'exclamation_count': exclamation_count,
                'text_length': len(text),
                'severity_boost': round(severity_boost, 2)
            }
        }


# ============================================================================
# GLOBAL INSTANCE AND HELPER FUNCTIONS (for backward compatibility)
# ============================================================================

# Create a singleton instance
_sentiment_analyzer_instance = None


def get_sentiment_analyzer() -> SentimentAnalyzer:
    """
    Get or create the global SentimentAnalyzer instance
    """
    global _sentiment_analyzer_instance
    if _sentiment_analyzer_instance is None:
        _sentiment_analyzer_instance = SentimentAnalyzer()
    return _sentiment_analyzer_instance


def analyze_sentiment(text: str) -> dict:
    """
    Helper function to analyze sentiment without instantiating class
    
    Args:
        text: The complaint text to analyze
        
    Returns:
        Dictionary with sentiment scores and analysis
    """
    analyzer = get_sentiment_analyzer()
    return analyzer.analyze_text(text)
