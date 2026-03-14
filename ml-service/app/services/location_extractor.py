# ml-service/app/services/location_extractor.py
import json
import re
from rapidfuzz import fuzz, process
from typing import Dict, Any

# Load districts data (export from your backend/src/data/districts.js)
DISTRICTS_DATA = {}  # Will be loaded from JSON

def load_districts(json_path: str = 'districts.json'):
    global DISTRICTS_DATA
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            DISTRICTS_DATA = json.load(f)
        print(f"Loaded {len(DISTRICTS_DATA)} districts successfully.")
        return True
    except FileNotFoundError:
        print("Error: districts.json not found. Create it from backend/src/data/districts.js")
        return False

def extract_location(text: str) -> Dict[str, Any]:
    """
    Extract district from complaint text using fuzzy matching on cities.
    Handles Tamil/English, typos, partial matches, and CASE-INSENSITIVE text.
    """
    if not DISTRICTS_DATA:
        return {"error": "Districts data not loaded"}

    # Strategy 1: Extract potential location words with title case conversion
    # Convert to title case first to handle lowercase input like "coimbatore"
    title_text = text.title()
    words = re.findall(r'\b[A-Z][a-z]+(?:\s+(?:Alli|Nagar|Pet|Puram|Kottai|Patti|Kulam|Kuppam|Mani))?|\b[A-Z]{2,}\b', title_text)
    
    # Strategy 2: Also extract all word tokens to catch any location
    all_words = re.findall(r'\b[a-zA-Z]{3,}\b', text)
    words = list(set(words + [w.title() for w in all_words]))
    
    best_match = None
    best_score = 0
    matches = []

    for word in words:
        for district_id, data in DISTRICTS_DATA.items():
            cities = data['cities']
            # Also check against district name itself
            all_locations = cities + [data['name']]
            
            # Fuzzy match against all cities and district name
            result = process.extractOne(word, all_locations, scorer=fuzz.ratio)
            if result:
                match, score, _ = result  # extractOne returns (match, score, index)
                if score > best_score and score > 70:  # Lowered threshold slightly
                    best_score = score
                    best_match = district_id
                    matches.append({"word": word, "matched_city": match, "district": data['name'], "score": score})

    if best_match:
        data = DISTRICTS_DATA[best_match]
        return {
            "districtId": best_match,
            "districtName": data['name'],
            "latitude": data['latitude'],
            "longitude": data['longitude'],
            "confidence": round(best_score / 100, 2),
            "matchedWords": matches
        }
    return {"districtId": None, "confidence": 0, "suggestion": "No location match found"}
