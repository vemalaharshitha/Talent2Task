"""
Multilingual Natural Language Processing (NLP) Service.
Supports English, Tamil, Telugu, and Hindi entity extraction and intent recognition.
"""

import re
from typing import Dict, Any, List, Optional
from ..models import NLPExtractRequest, NLPExtractResponse, ExtractedEntities

# Multilingual Skill Taxonomy
SKILL_TAXONOMY = {
    "plumbing": [
        "plumber", "plumbing", "pipe", "leak", "tap", "drainage",
        "பிளம்பர்", "குழாய்", "தண்ணீர் குழாய்", "பிளம்பிங்",
        "ప్లంబర్", "పైపు", "ప్లంబింగ్",
        "प्लम्बर", "नलसाज", "पाइप"
    ],
    "electrical": [
        "electrician", "wiring", "electrical", "fuse", "short circuit", "fan repair",
        "எலக்ட்ரீஷியன்", "மின்சார வேலை", "வயரிங்",
        "ఎలక్ట్రీషియన్", "వైరింగ్", "కరెంట్ పని",
        "इलेक्ट्रीशियन", "बिजली मिस्त्री", "वायरिंग"
    ],
    "carpentry": [
        "carpenter", "woodwork", "furniture", "door repair",
        "தச்சர்", "மரவேலை", "மரவேலைக்காரர்",
        "వడ్రంగి", "చెక్క పని",
        "बढ़ई", "लकड़ी का काम"
    ],
    "welding": [
        "welder", "welding", "metal fabrication", "iron gate",
        "வெல்டர்", "வெல்டிங்",
        "వెల్డర్", "వెల్డింగ్",
        "वेल्डर", "वेल्डिंग"
    ],
    "driving": [
        "driver", "driving", "chauffeur", "car driver", "truck driver",
        "டிரைவர்", "ஓட்டுநர்", "கார் டிரைவர்",
        "డ్రైవర్", "కారు డ్రైవర్",
        "ड्राइवर", "चालक", "गाड़ी चालक"
    ],
    "painting": [
        "painter", "painting", "whitewash", "wall painting",
        "பெயிண்டர்", "வர்ணம் பூசுபவர்",
        "పెయింటర్", "రంగులు వేసేవారు",
        "पेंटर", "रंगाई"
    ],
    "cooking": [
        "cook", "chef", "catering", "kitchen helper",
        "சமையல்காரர்", "சமையல்",
        "వంటమనిషి", "వంట",
        "रसोइया", "खाना बनाने वाला"
    ],
    "masonry": [
        "mason", "construction", "bricklayer", "cement work",
        "கொத்தனார்", "கட்டுமான வேலை",
        "మేస్త్రీ", "తాపీ పని",
        "राजमिस्त्री", "चिनाई"
    ],
    "tailoring": [
        "tailor", "stitching", "alteration", "dressmaker",
        "தையல்காரர்", "தையல்",
        "దర్జీ", "కుట్లు",
        "दर्जी", "सिलाई"
    ],
    "cleaning": [
        "cleaner", "housekeeping", "sweeper", "maid",
        "சுத்தம் செய்பவர்", "வீட்டு வேலை",
        "క్లీనర్", "ఇంటి పని",
        "सफाईकर्मी", "हाउसकीपिंग"
    ],
    "security": [
        "security", "guard", "security guard", "watchman", "gatekeeper", "chowkidar",
        "செக்யூரிட்டி", "காவலாளி", "காவலர்", "வாட்ச்மேன்",
        "సెక్యూరిటీ", "సెక్యూరిటీ గార్డ్", "కాపలాదారు", "వాచ్‌మెన్",
        "सुरक्षा गार्ड", "सिक्योरिटी", "चौकीदार", "गार्ड", "सुरक्षाकर्मी"
    ],
    "loading": [
        "loading", "unloading", "loader", "coolie", "hamali",
        "லோடிங்", "அன்லோடிங்", "சுமை தூக்குபவர்",
        "లోడింగ్", "అన్‌లోడింగ్", "కూలీ",
        "लोडिंग", "अनलोडिंग", "हमाली", "कुली"
    ],
    "event": [
        "event hand", "event helper", "stage decoration", "stall helper",
        "நிகழ்வு உதவி", "ஈவென்ட் ஹெல்ப்பர்",
        "ఈవెంట్ హెల్పర్",
        "इवेंट हेल्पर"
    ],
    "data_entry": [
        "data entry", "computer operator", "typing",
        "டேட்டா என்ட்ரி", "கம்ப்யூட்டர் ஆபரேட்டர்",
        "డేటా ఎంట్రీ", "కంప్యూటర్ ఆపరేటర్",
        "डाटा एंट्री", "कंप्यूटर ऑपरेटर"
    ]
}

LOCATION_CANONICAL_MAP = {
    "chennai": "Chennai", "coimbatore": "Coimbatore", "madurai": "Madurai", "salem": "Salem",
    "tiruchirappalli": "Tiruchirappalli", "trichy": "Tiruchirappalli", "tirunelveli": "Tirunelveli",
    "tiruppur": "Tiruppur", "vellore": "Vellore", "erode": "Erode", "thoothukudi": "Thoothukudi",
    "dindigul": "Dindigul", "thanjavur": "Thanjavur", "ranipet": "Ranipet", "sivaganga": "Sivaganga",
    "karur": "Karur", "ramanathapuram": "Ramanathapuram", "virudhunagar": "Virudhunagar",
    "ambattur": "Ambattur", "guindy": "Guindy", "t nagar": "T Nagar", "velachery": "Velachery",
    "tambaram": "Tambaram", "omr": "OMR",
    # Tamil
    "சென்னை": "Chennai", "கோயம்புத்தூர்": "Coimbatore", "மதுரை": "Madurai", "சேலம்": "Salem",
    "திருச்சி": "Tiruchirappalli", "அம்பத்தூர்": "Ambattur", "கிண்டி": "Guindy",
    # Telugu
    "చెన్నై": "Chennai", "కోయంబత్తూరు": "Coimbatore", "హైదరాబాద్": "Hyderabad",
    # Hindi
    "चेन्नई": "Chennai", "कोयंबटूर": "Coimbatore", "मदुरै": "Madurai", "दिल्ली": "Delhi", "मुंबई": "Mumbai"
}

def detect_language(text: str) -> str:
    """Detects primary language using Unicode script ranges."""
    tamil_chars = sum(1 for c in text if 0x0B80 <= ord(c) <= 0x0BFF)
    telugu_chars = sum(1 for c in text if 0x0C00 <= ord(c) <= 0x0C7F)
    hindi_chars = sum(1 for c in text if 0x0900 <= ord(c) <= 0x097F)
    
    counts = {
        "ta": tamil_chars,
        "te": telugu_chars,
        "hi": hindi_chars
    }
    top_lang, top_count = max(counts.items(), key=lambda x: x[1])
    if top_count > 2:
        return top_lang
    return "en"

def extract_entities(text: str) -> ExtractedEntities:
    """Extracts skills, location, radius, wages, timing from text."""
    lower = text.lower()
    
    # 1. Skills
    matched_skills = set()
    for standard_skill, variants in SKILL_TAXONOMY.items():
        for var in variants:
            # Enforce whole word matching for Latin words
            if var.isascii():
                if re.search(r'\b' + re.escape(var) + r'\b', lower):
                    display_name = "Security Guard" if standard_skill == "security" else standard_skill.replace('_', ' ').title()
                    matched_skills.add(display_name)
                    break
            else:
                if var in lower:
                    display_name = "Security Guard" if standard_skill == "security" else standard_skill.replace('_', ' ').title()
                    matched_skills.add(display_name)
                    break
                
    # 2. Location
    detected_loc = None
    for loc_key, canonical_name in LOCATION_CANONICAL_MAP.items():
        if loc_key in lower:
            detected_loc = canonical_name
            break
            
    # 3. Distance / Radius
    distance_km = None
    dist_match = re.search(r'(\d+)\s*(?:km|kms|kilometer|கிலோமீட்டர்|కిమీ|किमी)', lower)
    if dist_match:
        try:
            distance_km = float(dist_match.group(1))
        except ValueError:
            pass

    # 4. Wage / Pay
    min_pay = None
    payout_type = None
    pay_match = re.search(r'(?:rs\.?|₹|inr|rupees?|rupee)?\s*(\d{3,6})\s*(?:per\s*(?:day|month|hour)|/day|/month|ரூபாய்|రూపాయలు|रुपये)?', lower)
    if pay_match:
        try:
            min_pay = float(pay_match.group(1))
            if "month" in lower:
                payout_type = "MONTHLY"
            elif "hour" in lower:
                payout_type = "HOURLY"
            else:
                payout_type = "DAILY"
        except ValueError:
            pass

    # 5. Timing (Clock Time, Immediate, Sessions)
    timing = None
    time_12 = re.search(r'(?:at|by|around|from)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)(?![a-zA-Z])', lower)
    time_24 = re.search(r'(?:at|by|around|from)\s+(\d{1,2}):(\d{2})\b', lower)
    if time_12:
        h = int(time_12.group(1))
        p = time_12.group(3).lower().replace('.', '')
        if p == 'pm' and h < 12:
            h += 12
        elif p == 'am' and h == 12:
            h = 0
        if 5 <= h < 12:
            timing = "MORNING"
        elif 12 <= h < 17:
            timing = "AFTERNOON"
        elif 17 <= h < 21:
            timing = "EVENING"
        else:
            timing = "NIGHT"
    elif time_24:
        h = int(time_24.group(1))
        if 5 <= h < 12:
            timing = "MORNING"
        elif 12 <= h < 17:
            timing = "AFTERNOON"
        elif 17 <= h < 21:
            timing = "EVENING"
        else:
            timing = "NIGHT"
    elif any(w in lower for w in ["night shift", "இரவு ஷிப்ட்", "నైట్ షిఫ్ట్", "नाइट शिफ्ट"]):
        timing = "NIGHT"
    elif any(w in lower for w in ["day shift", "morning shift", "பகல் ஷிப்ட்", "காலை ஷிப்ட்", "డే షిఫ్ట్", "डे शिफ्ट"]):
        timing = "MORNING"
    elif any(w in lower for w in ["urgent", "immediately", "immediate", "right now", "asap", "today", "இன்றே", "உடனடியாக", "உடனே", "వెంటనే", "तुरंत", "अभी"]):
        timing = "IMMEDIATE"
    elif any(w in lower for w in ["afternoon", "மதியம்", "మధ్యాహ్నం", "दोपहर"]):
        timing = "AFTERNOON"
    elif any(w in lower for w in ["evening", "மாலை", "సాయంత్రం", "शाम"]):
        timing = "EVENING"
    elif any(w in lower for w in ["morning", "காலை", "ఉదయం", "सुबह"]):
        timing = "MORNING"
    elif any(w in lower for w in ["night", "இரவு", "రాత్రి", "रात"]):
        timing = "NIGHT"

    return ExtractedEntities(
        skills=list(matched_skills),
        location=detected_loc,
        max_distance_km=distance_km,
        min_pay=min_pay,
        payout_type=payout_type,
        timing=timing
    )

def extract_nlp(request: NLPExtractRequest) -> NLPExtractResponse:
    """Main NLP pipeline handler."""
    lang = request.language_hint or detect_language(request.text)
    entities = extract_entities(request.text)
    
    # Classify intent
    lower = request.text.lower()
    intent = "search_job"
    if any(w in lower for w in ["need", "hiring", "want", "require", "தேவை", "కావాలి", "चाहिए"]):
        intent = "hire_talent"
    elif any(w in lower for w in ["rate", "wage", "salary", "சம்பளம்", "వేతనం", "वेतन"]):
        intent = "wage_inquiry"
        
    return NLPExtractResponse(
        detected_language=lang,
        intent=intent,
        entities=entities,
        normalized_query=request.text.strip(),
        confidence=0.92 if len(entities.skills) > 0 else 0.75
    )
