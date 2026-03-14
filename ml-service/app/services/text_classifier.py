import json
import os
from collections import defaultdict
from rapidfuzz import fuzz
from typing import Dict, Any

class TextClassifier:
    def __init__(self):
        self.departments = {}
        self.load_categories()
    
    def load_categories(self):
        try:
            # Get the path relative to this file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            categories_path = os.path.join(current_dir, 'categories.json')
            
            with open(categories_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.departments = data['departments']
            print(f"✅ TextClassifier: {len(self.departments)} categories loaded")
        except FileNotFoundError:
            print("⚠️ categories.json missing - using defaults")
            self.departments = {}  # Fallback
        except Exception as e:
            print(f"❌ Error loading categories: {e}")
            self.departments = {}
    
    def classify(self, text: str) -> Dict[str, Any]:
        """
        Classify text into department categories using aggressive fuzzy keyword matching.
        
        Args:
            text: The complaint text to classify
            
        Returns:
            Dictionary with department, confidence, needsReview flag, and all scores.
            If confidence < 0.5, returns UNVERIFIED category with needsReview=True.
        """
        if not text or not text.strip():
            return {
                "department": "UNVERIFIED",
                "confidence": 0.0,
                "needsReview": True,
                "suggestedDepartment": None,
                "all_scores": {}
            }
        
        text_lower = text.lower()
        scores = defaultdict(float)
        
        for dept_id, dept in self.departments.items():
            score_sum = 0
            keyword_count = 0
            
            for keyword in dept['keywords']:
                # Multiple matching strategies
                exact_score = 1.0 if keyword in text_lower else 0
                fuzzy_score = fuzz.partial_ratio(text_lower, keyword) / 100
                
                match_score = max(exact_score, fuzzy_score)
                if match_score > 0.5:  # Lowered threshold
                    score_sum += match_score * dept['confidence_boost']
                    keyword_count += 1
            
            if keyword_count > 0:
                scores[dept_id] = score_sum / keyword_count
        
        if scores:
            best_dept = max(scores, key=scores.get)
            confidence = round(scores[best_dept], 2)
            
            # If confidence is below threshold, mark as UNVERIFIED
            if confidence < 0.5:
                return {
                    "department": "UNVERIFIED",
                    "confidence": confidence,
                    "needsReview": True,
                    "suggestedDepartment": best_dept,
                    "all_scores": dict(sorted(scores.items(), key=lambda x: x[1], reverse=True))
                }
            
            return {
                "department": best_dept,
                "confidence": confidence,
                "needsReview": False,
                "suggestedDepartment": None,
                "all_scores": dict(sorted(scores.items(), key=lambda x: x[1], reverse=True))
            }
        
        return {
            "department": "UNVERIFIED",
            "confidence": 0.0,
            "needsReview": True,
            "suggestedDepartment": None,
            "all_scores": {}
        }
    
    def classify_tamil(self, text: str) -> Dict[str, Any]:
        """
        Future: Tamil text classification with transliteration.
        Currently falls back to English classifier.
        """
        # TODO: Add Tamil transliteration and IndicBERT integration
        return self.classify(text)

# Global classifier instance
classifier = TextClassifier()

def classify_text(text: str) -> Dict[str, Any]:
    """
    Convenience function to classify text.
    
    Args:
        text: The complaint text to classify
        
    Returns:
        Classification result with department and confidence
    """
    return classifier.classify(text)
