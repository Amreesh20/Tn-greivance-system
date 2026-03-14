import cv2
import numpy as np
from PIL import Image
import io
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class ImageAnalyzer:
    def __init__(self):
        self.damage_rules = self._load_detection_rules()
        logger.info("✅ ImageAnalyzer: Multi-category detector loaded (6 departments)")
    
    def _load_detection_rules(self) -> Dict:
        """Define visual patterns for each damage category"""
        return {
            "pothole": {
                "department": "PUBLIC_WORKS",
                "features": ["dark_holes", "road_surface", "irregular_edges"],
                "color_range": {"gray": (50, 150), "brown": (10, 100)},
                "severity_base": "high"
            },
            "road_crack": {
                "department": "PUBLIC_WORKS",
                "features": ["thin_lines", "road_surface", "high_edges"],
                "severity_base": "medium"
            },
            "drainage_block": {
                "department": "PUBLIC_WORKS",
                "features": ["water_pooling", "dark_areas", "road_surface"],
                "severity_base": "medium"
            },
            "water_leak": {
                "department": "WATER_SUPPLY",
                "features": ["blue_tones", "wet_surface", "irregular_stains"],
                "color_range": {"blue": (90, 130), "cyan": (80, 100)},
                "severity_base": "high"
            },
            "pipe_burst": {
                "department": "WATER_SUPPLY",
                "features": ["water_spray", "blue_dominant", "high_motion"],
                "severity_base": "critical"
            },
            "garbage_pile": {
                "department": "SANITATION",
                "features": ["varied_colors", "irregular_shapes", "green_tones"],
                "color_range": {"green": (35, 85), "multi": True},
                "severity_base": "medium"
            },
            "waste_overflow": {
                "department": "SANITATION",
                "features": ["dark_mass", "irregular_texture", "no_road"],
                "severity_base": "high"
            },
            "fallen_wire": {
                "department": "ELECTRICITY",
                "features": ["thin_black_lines", "sky_background", "metal_texture"],
                "severity_base": "critical"
            },
            "transformer_damage": {
                "department": "ELECTRICITY",
                "features": ["metal_structure", "height", "sparks"],
                "severity_base": "critical"
            },
            "damaged_building": {
                "department": "EDUCATION",
                "features": ["wall_cracks", "building_structure", "concrete"],
                "severity_base": "high"
            },
            "wall_collapse": {
                "department": "EDUCATION",
                "features": ["rubble", "bricks", "destruction"],
                "severity_base": "critical"
            },
            "stagnant_water": {
                "department": "HEALTH",
                "features": ["green_water", "still_surface", "algae"],
                "color_range": {"green": (40, 80), "brown": (20, 60)},
                "severity_base": "medium"
            }
        }
    
    def analyze_image(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Analyze image for ALL infrastructure damage types
        """
        try:
            # Convert to OpenCV
            image = Image.open(io.BytesIO(image_bytes))
            img_rgb = np.array(image.convert('RGB'))
            img_gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
            img_hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
            
            # Extract comprehensive features
            features = self._extract_all_features(img_rgb, img_gray, img_hsv)
            
            # Score all damage types
            scores = self._score_all_categories(features)
            
            # Get top detection
            if not scores:
                return self._no_detection_response()
            
            best_match = max(scores, key=lambda x: x['confidence'])
            
            logger.info(f"🔍 Detected: {best_match['type']} → {best_match['department']} ({best_match['severity']})")
            
            # Generate human-readable description
            description = self._generate_description(best_match, scores)
            
            return {
                "success": True,
                "detections": scores[:3],  # Top 3 matches
                "primary_issue": best_match['type'],
                "department": best_match['department'],
                "severity": best_match['severity'],
                "confidence": best_match['confidence'],
                "count": len(scores),
                "description": description,
                "analysis_method": "multi_category_cv"
            }
            
        except Exception as e:
            logger.error(f"Analysis error: {e}")
            return {"success": False, "error": str(e)}
    
    def _extract_all_features(self, img_rgb, img_gray, img_hsv) -> Dict:
        """Extract comprehensive visual features"""
        h, w = img_gray.shape
        total_pixels = h * w
        
        features = {}
        
        # 1. DARKNESS & HOLES (pothole detection)
        dark_mask = img_gray < 60
        features['dark_ratio'] = np.sum(dark_mask) / total_pixels
        features['dark_clusters'] = self._count_clusters(dark_mask.astype(np.uint8))
        
        # 2. EDGE PATTERNS (cracks, wires)
        edges = cv2.Canny(img_gray, 30, 100)
        features['edge_ratio'] = np.sum(edges > 0) / total_pixels
        features['edge_density'] = cv2.Laplacian(img_gray, cv2.CV_64F).var()
        
        # 3. COLOR ANALYSIS
        # Road/concrete (gray/brown)
        road_mask = cv2.inRange(img_hsv, (0, 0, 40), (180, 50, 160))
        features['road_ratio'] = np.sum(road_mask > 0) / total_pixels
        
        # Water/blue tones
        blue_mask = cv2.inRange(img_hsv, (90, 40, 40), (130, 255, 255))
        features['blue_ratio'] = np.sum(blue_mask > 0) / total_pixels
        
        # Green (garbage, algae, vegetation)
        green_mask = cv2.inRange(img_hsv, (35, 30, 30), (85, 255, 255))
        features['green_ratio'] = np.sum(green_mask > 0) / total_pixels
        
        # Brown/dirty water
        brown_mask = cv2.inRange(img_hsv, (10, 20, 20), (30, 180, 120))
        features['brown_ratio'] = np.sum(brown_mask > 0) / total_pixels
        
        # Sky (for wire detection)
        sky_mask = cv2.inRange(img_hsv, (90, 20, 100), (130, 150, 255))
        features['sky_ratio'] = np.sum(sky_mask > 0) / total_pixels
        
        # 4. TEXTURE & STRUCTURE
        features['texture_variance'] = cv2.Laplacian(img_gray, cv2.CV_64F).var()
        features['color_variance'] = np.std(img_rgb)
        
        # 5. SPATIAL PATTERNS
        # Top half vs bottom (sky vs ground)
        top_half = img_gray[:h//2, :]
        bottom_half = img_gray[h//2:, :]
        features['brightness_top'] = np.mean(top_half)
        features['brightness_bottom'] = np.mean(bottom_half)
        
        # 6. OBJECT DETECTION (simple)
        # Detect continuous regions
        _, thresh = cv2.threshold(img_gray, 127, 255, cv2.THRESH_BINARY)
        features['object_count'] = self._count_clusters(thresh)
        
        return features
    
    def _count_clusters(self, binary_mask: np.ndarray) -> int:
        """Count distinct regions in binary image"""
        num_labels, _ = cv2.connectedComponents(binary_mask)
        return num_labels - 1  # Subtract background
    
    def _score_all_categories(self, features: Dict) -> List[Dict]:
        """Score each damage category"""
        scores = []
        
        # PUBLIC WORKS - Pothole
        pothole_score = (
            features['dark_ratio'] * 0.35 +
            min(features['dark_clusters'] / 5, 1.0) * 0.25 +
            features['road_ratio'] * 0.25 +
            (features['edge_ratio'] * 2) * 0.15
        )
        if pothole_score > 0.3:
            scores.append(self._create_detection("pothole", pothole_score))
        
        # PUBLIC WORKS - Road Crack
        crack_score = (
            features['edge_ratio'] * 0.45 +
            features['road_ratio'] * 0.35 +
            min(features['edge_density'] / 500, 1.0) * 0.20
        )
        if crack_score > 0.35:
            scores.append(self._create_detection("road_crack", crack_score))
        
        # WATER SUPPLY - Water Leak
        water_score = (
            features['blue_ratio'] * 0.50 +
            features['brown_ratio'] * 0.30 +
            (1 - features['road_ratio']) * 0.20
        )
        if water_score > 0.25:
            scores.append(self._create_detection("water_leak", water_score))
        
        # SANITATION - Garbage
        garbage_score = (
            features['green_ratio'] * 0.30 +
            features['color_variance'] / 100 * 0.35 +
            (1 - features['road_ratio']) * 0.20 +
            min(features['object_count'] / 10, 1.0) * 0.15
        )
        if garbage_score > 0.30:
            scores.append(self._create_detection("garbage_pile", garbage_score))
        
        # ELECTRICITY - Fallen Wire
        wire_score = (
            features['edge_ratio'] * 0.40 +
            features['sky_ratio'] * 0.35 +
            (features['brightness_top'] - features['brightness_bottom']) / 100 * 0.25
        )
        if wire_score > 0.35 and features['sky_ratio'] > 0.2:
            scores.append(self._create_detection("fallen_wire", wire_score))
        
        # EDUCATION - Building Damage
        building_score = (
            features['edge_ratio'] * 0.35 +
            min(features['texture_variance'] / 1000, 1.0) * 0.35 +
            (features['road_ratio'] * 0.5) * 0.30  # Concrete/wall color
        )
        if building_score > 0.35:
            scores.append(self._create_detection("damaged_building", building_score))
        
        # HEALTH - Stagnant Water
        stagnant_score = (
            features['green_ratio'] * 0.40 +
            features['brown_ratio'] * 0.35 +
            (1 - features['edge_ratio']) * 0.25  # Still surface = low edges
        )
        if stagnant_score > 0.30:
            scores.append(self._create_detection("stagnant_water", stagnant_score))
        
        # Sort by confidence
        scores.sort(key=lambda x: x['confidence'], reverse=True)
        return scores
    
    def _create_detection(self, damage_type: str, score: float) -> Dict:
        """Create detection result"""
        rules = self.damage_rules[damage_type]
        confidence = min(score, 0.95)  # Cap at 95%
        
        # Adjust severity based on confidence
        base_severity = rules['severity_base']
        if confidence < 0.4:
            severity = "low"
        elif confidence < 0.6:
            severity = "medium"
        elif base_severity == "critical":
            severity = "critical"
        else:
            severity = "high"
        
        return {
            "type": damage_type,
            "department": rules['department'],
            "confidence": round(confidence, 2),
            "severity": severity
        }
    
    def _no_detection_response(self) -> Dict:
        """Return when no damage detected"""
        return {
            "success": True,
            "detections": [],
            "primary_issue": "no_damage_detected",
            "department": "GENERAL",
            "severity": "low",
            "confidence": 0.5,
            "description": "No visible infrastructure damage or issues detected in the uploaded image.",
            "message": "No infrastructure damage detected in image"
        }
    
    def _generate_description(self, best_match: Dict, all_detections: list) -> str:
        """Generate human-readable description from detection results"""
        issue_descriptions = {
            "pothole": "a pothole or road cavity on the road surface",
            "road_crack": "cracks and damage on the road surface",
            "drainage_block": "a blocked or clogged drainage system",
            "water_leak": "a water leakage or pipe damage",
            "pipe_burst": "a burst water pipe with active leakage",
            "garbage_pile": "accumulated garbage and waste materials",
            "waste_overflow": "overflowing waste and sanitation issues",
            "fallen_wire": "fallen or damaged electrical wires",
            "transformer_damage": "damage to electrical transformer infrastructure",
            "damaged_building": "structural damage to a building",
            "wall_collapse": "a collapsed or severely damaged wall",
            "stagnant_water": "stagnant water which may pose health risks",
            "no_damage_detected": "no visible damage"
        }
        
        department_names = {
            "PUBLIC_WORKS": "Public Works Department",
            "WATER_SUPPLY": "Water Supply Department",
            "SANITATION": "Sanitation Department",
            "ELECTRICITY": "Electricity Department",
            "EDUCATION": "Education/Buildings Department",
            "HEALTH": "Health Department",
            "GENERAL": "General Administration"
        }
        
        issue_type = best_match['type']
        issue_desc = issue_descriptions.get(issue_type, issue_type.replace('_', ' '))
        dept_name = department_names.get(best_match['department'], best_match['department'])
        severity = best_match['severity']
        confidence = int(best_match['confidence'] * 100)
        
        # Build description
        description = f"Image analysis detected {issue_desc} with {severity} severity ({confidence}% confidence). "
        description += f"This issue falls under the jurisdiction of {dept_name}."
        
        # Add additional detections if present
        if len(all_detections) > 1:
            other_issues = [d['type'].replace('_', ' ') for d in all_detections[1:3]]
            description += f" Additional possible issues: {', '.join(other_issues)}."
        
        return description

# Global instance
_analyzer = None

def get_image_analyzer():
    global _analyzer
    if _analyzer is None:
        _analyzer = ImageAnalyzer()
    return _analyzer

def analyze_image(image_bytes: bytes):
    return get_image_analyzer().analyze_image(image_bytes)
