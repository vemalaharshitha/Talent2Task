"""
Talent2Task Context-Aware AI Chat Assistant Service.
Handles contextual queries for both Workers and Employers with full multilingual support (English, Tamil, Telugu, Hindi).
"""

import re
from typing import Dict, Any, List, Optional
from ..models import ChatQueryRequest, ChatQueryResponse, ChatAction
from .nlp_service import detect_language, extract_entities

GREETING_PATTERNS = [
    r"^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|hola|namaste|vanakkam|namaskaram)\b",
    r"^(வணக்கம்|ஹலோ|ஹாய்)",
    r"^(నమస్కారం|హలో|హాయ్)",
    r"^(नमस्ते|नमस्कार|हैलो|हाय)"
]

HELP_PATTERNS = [
    r"(who are you|what can you do|how can you help|features|help me|commands|guide)"
]

def is_greeting(text: str) -> bool:
    clean = text.strip().lower()
    for pat in GREETING_PATTERNS:
        if re.search(pat, clean, re.IGNORECASE):
            return True
    return clean in ["hi", "hello", "hey", "test"]

def is_help_query(text: str) -> bool:
    clean = text.strip().lower()
    for pat in HELP_PATTERNS:
        if re.search(pat, clean, re.IGNORECASE):
            return True
    return False

def is_platform_about(text: str) -> bool:
    return bool(re.search(r"(what is talent2task|about talent2task|what does this app do|tell me about talent2task)", text, re.IGNORECASE))

def is_matching_how(text: str) -> bool:
    return bool(re.search(r"(how does.*matching work|how is match.*calculated|how match.*work|explain matching|formula)", text, re.IGNORECASE))

def is_unrelated_query(text: str) -> bool:
    return bool(re.search(r"(weather|temperature|joke|capital of|who won|president|movie|song)", text, re.IGNORECASE))

def is_ambiguous_job_search(text: str, skills: List[str]) -> bool:
    return bool(re.search(r"^(find me a job|i need a job|i need work|show me work|find work|get a job)$", text.strip(), re.IGNORECASE)) and len(skills) == 0

def process_chat_query(request: ChatQueryRequest) -> ChatQueryResponse:
    query = request.query.strip()
    lang = request.language or detect_language(query) or "en"
    context = request.context
    role = context.role if context else "seeker"
    user_city = (context.city if context and context.city else "Tamil Nadu")
    user_skills = (context.skills if context and context.skills else [])
    
    query_lower = query.lower()
    entities = extract_entities(query)
    detected_skills = entities.skills
    detected_location = entities.location or user_city

    # 1. Greetings
    if is_greeting(query):
        if lang == "ta":
            reply = f"வணக்கம்! நான் உங்கள் Talent2Task AI உதவியாளர். உங்களுக்கு பகுதிநேர வேலைகள், திறமையான பணியாளர்கள் அல்லது உள்ளூர் தேவை விவரங்களை கண்டறிய உதவ முடியும். நான் உங்களுக்கு எவ்வாறு உதவட்டும்?"
            suggestions = ["என் அருகிலுள்ள வேலைகளைக் காட்டு", "நான் என்ன திறன்களைக் கற்க வேண்டும்?", "இன்றைய வேலைகள் என்ன?"]
        elif lang == "hi":
            reply = f"नमस्ते! मैं आपका Talent2Task AI सहायक हूँ। मैं आपको स्थानीय काम, कुशल श्रमिक, और कौशल मांग ढूंढने में मदद कर सकता हूँ। मैं आज आपकी क्या सहायता करूँ?"
            suggestions = ["मेरे पास के काम दिखाएं", "मुझे कौन से कौशल सीखने चाहिए?", "आज उपलब्ध काम"]
        elif lang == "te":
            reply = f"నమస్కారం! నేను మీ Talent2Task AI సహాయకుడిని. స్థానిక పనులు, నైపుణ్యం కలిగిన కార్మికులు మరియు డిమాండ్ వివరాలను కనుగొనడంలో నేను మీకు సహాయపడతాను. నేను మీకు ఎలా సహాయం చేయగలను?"
            suggestions = ["నా దగ్గర ఉన్న పనులను చూపించండి", "నేను ఏ నైపుణ్యాలు నేర్చుకోవాలి?", "అత్యధిక రేటింగ్ ఉన్న కార్మికులు"]
        else:
            role_hint = "worker gigs and skills" if role == "seeker" else "local candidates and gig postings"
            reply = f"Hello! I am your Talent2Task AI Assistant. I can help you find {role_hint}, understand local demand, and guide your shift tasks. How can I help you today?"
            suggestions = (
                ["Find jobs near me", "What skills should I learn?", "Show gigs available today"]
                if role == "seeker"
                else ["Find top rated workers near me", "Help me create a job post", "Find a plumber in 5 km"]
            )
        
        return ChatQueryResponse(
            reply=reply,
            intent="GREETING",
            detected_language=lang,
            actions=[],
            suggested_followups=suggestions,
            sources=["talent2task_identity"]
        )

    # 2. General Help
    if is_help_query(query):
        if lang == "ta":
            reply = "நான் Talent2Task தளத்தில் பின்வருவனவற்றில் உங்களுக்கு உதவ முடியும்:\n1. உங்கள் அருகிலுள்ள வேலைகளை கண்டுபிடித்தல்\n2. உங்கள் திறன்களுக்கு ஏற்ற வேலை பொருத்தங்களை விளக்குதல்\n3. உங்கள் மாவட்டத்தில் அதிகம் தேவைப்படும் திறன்களை பரிந்துரைத்தல்\n4. முதலாளிகளுக்கு நம்பகமான பணியாளர்களை கண்டறிதல் மற்றும் புதிய வேலைகளை உருவாக்குதல்."
        elif lang == "hi":
            reply = "मैं Talent2Task पर आपकी इन बातों में मदद कर सकता हूँ:\n1. आपके पास उपलब्ध काम ढूंढना\n2. आपके कौशल से मेल खाने वाले काम की व्याख्या करना\n3. आपके जिले में उच्च मांग वाले कौशल बताना\n4. नियोक्ताओं के लिए कुशल कारीगर ढूंढना और नई नौकरी पोस्ट करना।"
        elif lang == "te":
            reply = "నేను Talent2Taskలో మీకు సహాయం చేయగలను:\n1. మీ సమీపంలో పనులను కనుగొనడం\n2. మీ నైపుణ్యాలకు సరిపోయే ఉద్యోగాల వివరణ\n3. మీ ప్రాంతంలో అధిక డిమాండ్ ఉన్న నైపుణ్యాలను తెలియజేయడం\n4. యజమానులకు కార్మికులను కనుగొనడం మరియు ఉద్యోగాలను పోస్ట్ చేయడం."
        else:
            reply = "Here is what I can do for you:\n• **Find Jobs & Shifts**: Search gigs near your GPS location or selected city.\n• **Explain Match Scores**: Explain why a job was recommended based on your skills and distance.\n• **Skill Gap Intelligence**: Tell you which skills are trending in your district and estimate wage boosts.\n• **Employer Hiring**: Help you discover top-rated local workers and assist in creating gig postings."
        
        return ChatQueryResponse(
            reply=reply,
            intent="HELP",
            detected_language=lang,
            actions=[],
            suggested_followups=["Find jobs near me", "What skills are in demand?", "Help me post a job"],
            sources=["system_capabilities"]
        )

    # 3. What is Talent2Task?
    if is_platform_about(query):
        reply = "🌐 **Talent2Task** is Tamil Nadu's Hyperlocal AI & Offline-First Gig Platform. It connects skilled local workers with immediate shift opportunities using Sentence Transformer semantic vectors, Haversine GPS proximity, and SQLite offline synchronization."
        return ChatQueryResponse(
            reply=reply,
            intent="PLATFORM_ABOUT",
            detected_language=lang,
            actions=[ChatAction(action_type="NAVIGATE_TAB", label="Explore Gigs on Radar", payload={"tab": "explore"})],
            suggested_followups=["How does matching work?", "Find jobs near me", "What skills are in demand?"],
            sources=["talent2task_architecture"]
        )

    # 4. How does matching work?
    if is_matching_how(query):
        reply = "📊 **How Talent2Task Hybrid AI Matching Works**:\n\n1. 🎯 **Semantic Skill Match (40%)**: Vector similarity via Sentence Transformers.\n2. 📍 **GPS Proximity (20%)**: Precise distance calculation (km).\n3. ⏰ **Availability Match (15%)**: Shift compatibility with your schedule.\n4. 💼 **Experience Level (10%)**: Years in trade.\n5. 🔥 **District Demand (7.5%)**: Regional demand deficit.\n6. ⭐ **Reliability & Ratings (7.5%)**: Verified completion history."
        return ChatQueryResponse(
            reply=reply,
            intent="EXPLAIN_MATCH_ALGORITHM",
            detected_language=lang,
            actions=[ChatAction(action_type="NAVIGATE_TAB", label="View Recommended Gigs", payload={"tab": "explore"})],
            suggested_followups=["Why was this job recommended?", "Find jobs near me", "What skills should I learn?"],
            sources=["hybrid_ranking_engine"]
        )

    # 5. Unrelated / General Questions (e.g., weather)
    if is_unrelated_query(query) and len(detected_skills) == 0:
        reply = f"I am your Talent2Task Gig & Career Assistant! While I don't track general external web queries like \"{query}\", I can help you search local gig shifts, benchmark trade wages, or connect with verified workers across Tamil Nadu."
        return ChatQueryResponse(
            reply=reply,
            intent="UNRELATED_CONVERSATIONAL",
            detected_language=lang,
            actions=[ChatAction(action_type="NAVIGATE_TAB", label="Explore Local Gigs", payload={"tab": "explore"})],
            suggested_followups=["Find jobs near me", "What skills should I learn?", "Show gigs within 5 km"],
            sources=["assistant_scope"]
        )

    # 6. Ambiguous Clarification ("Find me a job")
    if is_ambiguous_job_search(query, detected_skills):
        reply = "Sure! What type of work or trade are you looking for? (e.g., Plumbing, Electrical, Painting, Delivery, Driver, Store Helper, Carpentry)"
        return ChatQueryResponse(
            reply=reply,
            intent="AMBIGUOUS_CLARIFICATION",
            detected_language=lang,
            actions=[
                ChatAction(action_type="FILTER_SKILL", label="Plumbing", payload={"skill": "Plumbing"}),
                ChatAction(action_type="FILTER_SKILL", label="Electrical", payload={"skill": "Electrical"}),
                ChatAction(action_type="FILTER_SKILL", label="Painting", payload={"skill": "Painter"}),
                ChatAction(action_type="FILTER_SKILL", label="Delivery", payload={"skill": "Delivery"})
            ],
            suggested_followups=["Plumbing jobs", "Electrical jobs", "Painting jobs", "Driver jobs"],
            sources=["clarification_engine"]
        )

    # 7. Worker: What skills should I learn? / Skill Demand
    if any(k in query_lower for k in ["what should i learn", "skills should i learn", "skill to learn", "skills to learn", "in demand", "demand in my city", "high demand", "கற்க வேண்டும்", "தேவைப்படும் திறன்", "कौशल", "నేర్చుకోవాలి"]):
        target_city = detected_location or user_city
        if lang == "ta":
            reply = f"{target_city} பகுதியில் தற்போது அதிக தேவை உள்ள திறன்கள்:\n• **எலக்ட்ரீஷியன் & வயரிங்** (மதிப்பிடப்பட்ட வருமான உயர்வு +25%)\n• **பிளம்பிங் & சானிட்டரி பராமரிப்பு** (அதிக வாய்ப்புகள்)\n• **டெலிவரி & டிரைவிங்** (தினசரி பகுதிநேர ஷிப்ட் பணிகள்)\n\nஉங்கள் சுயவிவரத்தில் இந்த திறன்களைச் சேர்ப்பதன் மூலம் அதிக வாய்ப்புகளைப் பெறலாம்!"
        elif lang == "hi":
            reply = f"{target_city} में इस समय सबसे अधिक मांग वाले कौशल हैं:\n• **इलेक्ट्रीशियन और वायरिंग** (अनुमानित +25% वेतन वृद्धि)\n• **प्लंबिंग और पाइपलाइन मरम्मत** (सक्रिय मांग)\n• **डिलीवरी और ड्राइविंग** (दैनिक शिफ्ट कार्य)\n\nइन्हें सीखने से आपकी मैचिंग स्कोर और कमाई में वृद्धि होगी!"
        elif lang == "te":
            reply = f"{target_city}లో ప్రస్తుతం అధిక డిమాండ్ ఉన్న నైపుణ్యాలు:\n• **ఎలక్ట్రీషియన్ మరియు వైరింగ్** (+25% అదనపు సంపాదన)\n• **ప్లంబింగ్ మరియు పైప్‌లైన్ పనులు**\n• **డెలివరీ మరియు డ్రైవింగ్**\n\nఈ నైపుణ్యాలు నేర్చుకోవడం వల్ల ఎక్కువ అవకాశాలు లభిస్తాయి!"
        else:
            reply = f"Based on live demand analytics for **{target_city}**, top high-demand skills are:\n1. **Electrical Basics & Wiring**: High demand with an estimated **+25% to +35% wage boost**.\n2. **Plumbing & Sanitary Maintenance**: Consistent shift calls across residential and commercial sectors.\n3. **Delivery & Two-Wheeler Riding**: Rapid local fulfillment roles with daily payout.\n4. **Store Inventory & Billing**: Growing retail opportunities.\n\nUpskilling in these areas will maximize your Hybrid Match Score on Talent2Task!"

        return ChatQueryResponse(
            reply=reply,
            intent="SKILL_GAP_RECOMMENDATION",
            detected_language=lang,
            actions=[
                ChatAction(action_type="NAVIGATE_TAB", label="View Skill Gap Tab", payload={"tab": "my-gigs"})
            ],
            suggested_followups=["Show jobs for Electricians", "Find plumbing jobs near me", "What is my match score?"],
            sources=["demand_forecaster", "skill_gap_analyzer"]
        )

    # 8. Employer: Help me create / post a job
    if any(k in query_lower for k in ["create a job", "post a job", "post a gig", "help me create", "need to hire", "போஸ்ட்", "வேலை அறிவிப்பு", "नौकरी पोस्ट", "పోస్ట్ జాబ్"]):
        cat = detected_skills[0].title() if detected_skills else "Painter"
        if lang == "ta":
            reply = f"நிச்சயமாக! {cat} பணிக்கான புதிய வேலை அறிவிப்பை (Gig Posting) உருவாக்க உங்களுக்கு உதவுகிறேன். கீழே உள்ள பொத்தானை கிளிக் செய்து வினாடிகளில் வெளியிடலாம்."
        elif lang == "hi":
            reply = f"बिल्कुल! मैं आपके लिए {cat} कार्य की पोस्ट तैयार करने में सहायता करूँगा। नीचे दिए गए बटन पर क्लिक करके विवरण भरें और पोस्ट करें।"
        elif lang == "te":
            reply = f"ఖచ్చితంగా! {cat} పని కొరకు జాబ్ పోస్ట్ చేయడానికి నేను మీకు సహాయం చేస్తాను. వివరాలను నమోదు చేయడానికి క్రింది బటన్ నొక్కండి."
        else:
            reply = f"I'd be glad to help you create a gig post for **{cat}** in **{user_city}**. Click below to open the guided Job Creator with automatic skill tagging and wage benchmarks."

        return ChatQueryResponse(
            reply=reply,
            intent="CREATE_JOB",
            detected_language=lang,
            actions=[
                ChatAction(action_type="OPEN_POST_JOB", label="Open Job Creator", payload={"category": cat})
            ],
            suggested_followups=["What is the average wage?", "Find top rated workers", "Show my active gigs"],
            sources=["nlp_job_parser"]
        )

    # 9. Match Score / Why Recommended
    if any(k in query_lower for k in ["why recommended", "match score", "how match", "why this job", "why this worker", "பொருத்தம்", "மதிப்பீடு", "स्कोर", "ఎందుకు సిఫార్సు"]):
        if lang == "ta":
            reply = "வேலை பரிந்துரைகள் உங்கள் திறன்கள் (Skill Similarity), உங்கள் தற்போதைய தூரம் (Proximity km), மற்றும் வழங்குநரின் நம்பகத்தன்மை மதிப்பீடு (Recruiter Trust Score) ஆகியவற்றின் அடிப்படையில் கணக்கிடப்படுகின்றன."
        elif lang == "hi":
            reply = "नौकरी का मिलान स्कोर आपके कौशल (कौशल मिलान), दूरी (किलोमीटर में निकटता) और नियोक्ता के विश्वसनीयता स्कोर के संयोजन से निर्धारित होता है।"
        elif lang == "te":
            reply = "జాబ్ సిఫార్సులు మీ నైపుణ్యాల సరిపోలిక, దూరం (కి.మీ) மற்றும் రిక్రూటర్ విశ్వసనీయత ఆధారంగా లెక్కించబడతాయి."
        else:
            reply = "Talent2Task calculates recommendation match scores using a transparent 6-factor Hybrid AI formula:\n• **Skill Semantic Match (40%)**: Overlap between required skills and your profile.\n• **Distance Proximity (20%)**: Calculated from your live GPS/district to the job site.\n• **Shift Availability (15%)**: Registered schedule match.\n• **Experience Level (10%)**: Years in trade.\n• **District Demand & Reliability (15%)**: Regional deficit + Trust & Safety score."

        return ChatQueryResponse(
            reply=reply,
            intent="EXPLAIN_MATCH",
            detected_language=lang,
            actions=[
                ChatAction(action_type="NAVIGATE_TAB", label="View Recommended Gigs", payload={"tab": "explore"})
            ],
            suggested_followups=["Find jobs near me", "What skills should I learn?", "How to increase my score?"],
            sources=["hybrid_ranking_engine"]
        )

    # 10. Employer: Find Workers / Plumber / Painter / Highly Rated
    if any(k in query_lower for k in ["find worker", "find a plumber", "find a painter", "find a carpenter", "find a driver", "find electrician", "need a", "workers near", "highly rated", "top rated", "பணியாளர்", "ஆட்கள்", "श्रमिक", "कारीगर", "కార్మికుడు"]):
        skill_str = detected_skills[0].title() if detected_skills else "Verified Workers"
        loc_str = detected_location or user_city
        if lang == "ta":
            reply = f"{loc_str} பகுதியில் நம்பகமான {skill_str} தொழிலாளர்களைத் தேடுகிறேன். அதிக நம்பகத்தன்மை மதிப்பீடு (Reliability Score) பெற்ற தொழிலாளர்கள் முன்னுரிமை அளிக்கப்படுகிறார்கள்."
        elif lang == "hi":
            reply = f"{loc_str} में कुशल {skill_str} की खोज की गई है। 4.5+ रेटिंग और उच्च विश्वसनीयता स्कोर वाले कारीगर उपलब्ध हैं।"
        elif lang == "te":
            reply = f"{loc_str}లో నైపుణ్యం కలిగిన {skill_str} కార్మికులు అందుబాటులో ఉన్నారు. అధిక రేటింగ్ மற்றும் రిలయబిలిటీ స్కోర్ ఉన్నవారికి ప్రాధాన్యత ఇవ్వబడుతుంది."
        else:
            reply = f"Found available, verified **{skill_str}** near **{loc_str}**. Ranked by reliability score, completion history, and proximity to your location."

        return ChatQueryResponse(
            reply=reply,
            intent="WORKER_SEARCH",
            detected_language=lang,
            actions=[
                ChatAction(action_type="NAVIGATE_TAB", label="View Workers on Map", payload={"tab": "explore", "view": "map"})
            ],
            suggested_followups=["Help me create a job post", "Show workers within 5 km", "Who has highest rating?"],
            sources=["reliability_engine", "semantic_vector_matcher"]
        )

    # 11. Job Search / Find Jobs Near Me
    if any(k in query_lower for k in ["find job", "jobs near", "jobs match", "show job", "work near", "plumbing job", "delivery job", "electrical job", "painting job", "வேலை", "பணி", "नौकरी", "काम", "పని", "ఉద్యోగం"]) or len(detected_skills) > 0:
        skill_str = ", ".join(detected_skills) if detected_skills else "active categories"
        loc_str = detected_location or user_city
        if lang == "ta":
            reply = f"{loc_str} பகுதியில் {skill_str} தொடர்பான வேலைகளை தேடுகிறேன். உங்கள் இருப்பிடம் மற்றும் திறன் பொருத்தத்தின் அடிப்படையில் சிறந்த வேலைகள் கீழே வரிசைப்படுத்தப்பட்டுள்ளன."
        elif lang == "hi":
            reply = f"{loc_str} में {skill_str} से संबंधित नौकरियों की खोज की गई है। निकटतम और सर्वोत्तम मैच वाले कार्य नीचे दिए गए हैं।"
        elif lang == "te":
            reply = f"{loc_str}లో {skill_str} కొరకు సరిపోయే పనులు కనుగొనబడ్డాయి. మీ నైపుణ్యాలు మరియు సామీప్యత ఆధారంగా పనులు సిద్ధంగా ఉన్నాయి."
        else:
            reply = f"Searching for active gigs in **{loc_str}** matching **{skill_str}**. Results are ranked using our Hybrid AI Engine factoring in distance, skills match, and verified recruiter ratings."

        actions = [
            ChatAction(action_type="NAVIGATE_TAB", label="Explore Gigs on Radar", payload={"tab": "explore"}),
        ]
        if detected_skills:
            actions.append(ChatAction(action_type="FILTER_SKILL", label=f"Filter: {detected_skills[0]}", payload={"skill": detected_skills[0]}))

        return ChatQueryResponse(
            reply=reply,
            intent="JOB_SEARCH",
            detected_language=lang,
            actions=actions,
            suggested_followups=["Show gigs within 5 km", "Why was this job recommended?", "What skills should I learn?"],
            sources=["hybrid_ranking_engine", "postgis_proximity"]
        )

    # 12. Fallback / Conversational Response
    if lang == "ta":
        reply = f"உங்கள் கேள்வி புரிந்தது: \"{query}\". நீங்கள் தமிழ்நாடு பகுதிநேர வேலைகளை தேடலாம், திறன்களை அறியலாம் அல்லது முதலாளியாக ஆட்களை தேடலாம். நான் உங்களுக்கு எவ்வாறு உதவ வேண்டும்?"
    elif lang == "hi":
        reply = f"मैं आपके प्रश्न: \"{query}\" को समझता हूँ। आप स्थानीय काम ढूंढ सकते हैं, आवश्यक कौशल जान सकते हैं या नए कार्य पोस्ट कर सकते हैं। बताएं मैं कैसे सहायता करूँ?"
    elif lang == "te":
        reply = f"మీ ప్రశ్న: \"{query}\" అందింది. మీరు స్థానిక పనులను వెతకవచ్చు அல்லது కొత్త పనులను పోస్ట్ చేయవచ్చు. మీకు ఏ సహాయం కావాలి?"
    else:
        reply = f"I hear you! Regarding \"{query}\" — I can help you search local gig shifts, check skill demand across Tamil Nadu districts, or discover high-rated workers. Let me know what you'd like to do!"

    return ChatQueryResponse(
        reply=reply,
        intent="CONVERSATIONAL",
        detected_language=lang,
        actions=[
            ChatAction(action_type="NAVIGATE_TAB", label="Explore Local Gigs", payload={"tab": "explore"})
        ],
        suggested_followups=["Find jobs near me", "What skills are in demand?", "Help me post a job"],
        sources=["general_assistant"]
    )
