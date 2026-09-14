import type { TimeSlot, Language } from '../types';
import { TAMIL_NADU_CITIES, TAMIL_NADU_LOCATIONS, getLocationsByCity } from './geoService.ts';
import { ALL_SKILL_OPTIONS } from '../i18n/translations.ts';
import { expandAbbreviations, matchSemanticConcept } from './abbreviationService.ts';

export interface ExtractedLocation {
  city: string | null;
  district: string | null;
  landmark: string | null;
  latitude?: number;
  longitude?: number;
  isDetected: boolean;
  isNearMe?: boolean;
  confidence: number;
  displayText: string;
}

export interface ExtractedExperience {
  level: 'Entry Level' | 'Suitable' | 'Experienced' | 'Expert' | 'Not Specified';
  years: number | null;
  isExplicit: boolean;
  description: string;
}

export interface ExtractedAvailability {
  slots: TimeSlot[];
  timingText: string;
  isExplicit: boolean;
}

export interface ExtractedPayout {
  amount: number | null;
  unit: 'hour' | 'task' | 'day' | 'shift' | null;
  isExplicit: boolean;
  displayText: string;
}

export interface MissingFieldPrompt {
  field: 'skills' | 'location' | 'payout' | 'availability' | 'experience';
  label: string;
  prompt: string;
  isCritical: boolean;
}

export interface ExtractedJobRequirement {
  rawText: string;
  detectedLanguage: Language;
  languageName: string;
  intent: 'hire_worker' | 'seek_job' | 'general_inquiry';
  title: string;
  category: string;
  skills: string[];
  location: ExtractedLocation;
  experience: ExtractedExperience;
  availability: ExtractedAvailability;
  payout: ExtractedPayout;
  confidence: number; // 0 to 1
  missingFields: MissingFieldPrompt[];
}

// Multilingual City Mapping Table (Tamil Nadu Cities & Districts)
interface CitySynonym {
  canonicalName: string;
  district: string;
  synonyms: string[];
}

const MULTILINGUAL_CITY_MAP: CitySynonym[] = [
  {
    canonicalName: 'Chennai',
    district: 'Chennai',
    synonyms: ['chennai', 'madras', 'சென்னை', 'சென்னையி', 'சென்னையில்', 'மெட்ராஸ்', 'చెన్నై', 'चेन्नई', 'मद्रास']
  },
  {
    canonicalName: 'Madurai',
    district: 'Madurai',
    synonyms: ['madurai', 'மதுரை', 'மதுரையி', 'மதுரையில்', 'మధురై', 'मदुरै', 'मदुराई']
  },
  {
    canonicalName: 'Coimbatore',
    district: 'Coimbatore',
    synonyms: ['coimbatore', 'kovai', 'கோயம்புத்தூர்', 'கோயம்புத்தூ', 'கோயம்பத்தூ', 'கோவை', 'கோவையில்', 'కోయంబత్తూర్', 'కోయంబత్తూ', 'कोयंबटूर', 'कोवई']
  },
  {
    canonicalName: 'Tiruchirappalli',
    district: 'Tiruchirappalli',
    synonyms: ['trichy', 'tiruchirappalli', 'tiruchi', 'திருச்சி', 'திருச்சியில்', 'திருச்சிராப்பள்ளி', 'తిరుచిరాపల్లి', 'त्रिची', 'तिरुचिरापल्ली']
  },
  {
    canonicalName: 'Salem',
    district: 'Salem',
    synonyms: ['salem', 'சேலம்', 'சேலத்தில்', 'சேல', 'సేలం', 'सेलम']
  },
  {
    canonicalName: 'Vellore',
    district: 'Vellore',
    synonyms: ['vellore', 'வேலூர்', 'வேலூரில்', 'வேலு', 'வேலூரி', 'వేలూరు', 'వేలూ', 'वेल्लोर']
  },
  {
    canonicalName: 'Tirunelveli',
    district: 'Tirunelveli',
    synonyms: ['tirunelveli', 'nellai', 'திருநெல்வேலி', 'நெல்லை', 'நெல்லையில்', 'తిరునెల్వేలి', 'तिरुनेलवेली']
  },
  {
    canonicalName: 'Erode',
    district: 'Erode',
    synonyms: ['erode', 'ஈரோடு', 'ஈரோட்டில்', 'ఈరోడ్', 'इरोड']
  },
  {
    canonicalName: 'Thanjavur',
    district: 'Thanjavur',
    synonyms: ['thanjavur', 'tanjore', 'தஞ்சாவூர்', 'தஞ்சாவூரில்', 'தஞ்சை', 'तंजावూరు', 'तंजावुर']
  },
  {
    canonicalName: 'Dindigul',
    district: 'Dindigul',
    synonyms: ['dindigul', 'திண்டுக்கல்', 'திண்டுக்கல்லில்', 'దిండిగల్', 'डिंडीगुल']
  },
  {
    canonicalName: 'Kanchipuram',
    district: 'Kanchipuram',
    synonyms: ['kanchipuram', 'காஞ்சிபுரம்', 'காஞ்சிபுரத்தில்', 'காஞ்சி', 'కాంచీపురం', 'कांचीपुरम']
  },
  {
    canonicalName: 'Cuddalore',
    district: 'Cuddalore',
    synonyms: ['cuddalore', 'கடலூர்', 'கடலூரில்', 'కడలూరు', 'कडलूर']
  },
  {
    canonicalName: 'Karur',
    district: 'Karur',
    synonyms: ['karur', 'கரூர்', 'கரூரில்', 'కరూర్', 'करूर']
  },
  {
    canonicalName: 'Tiruppur',
    district: 'Tiruppur',
    synonyms: ['tiruppur', 'திருப்பூர்', 'திருப்பூரில்', 'తిరుప్పూర్', 'तिरुपुर']
  },
  {
    canonicalName: 'Hosur',
    district: 'Krishnagiri',
    synonyms: ['hosur', 'ஓசூர்', 'ஓசூரில்', 'హోసూర్', 'होसुर']
  },
  {
    canonicalName: 'Nagercoil',
    district: 'Kanyakumari',
    synonyms: ['nagercoil', 'நாகர்கோவில்', 'நாகர்கோவிலில்', 'నాగర్‌కోయిల్', 'नागरकोइल']
  },
  {
    canonicalName: 'Thoothukudi',
    district: 'Thoothukudi',
    synonyms: ['thoothukudi', 'tuticorin', 'தூத்துக்குடி', 'தூத்துக்குடியில்', 'తూత్తుకుడి', 'तूतीकोरिन']
  },
  {
    canonicalName: 'Puducherry',
    district: 'Puducherry',
    synonyms: ['puducherry', 'pondicherry', 'புதுச்சேரி', 'புதுச்சேரியில்', 'పాండిచ్చేరి', 'पुडुचेरी']
  }
];

// Comprehensive Multilingual Trade Definitions
interface TradeDefinition {
  canonicalCategory: string;
  keywords: string[];
  canonicalSkills: string[];
  titleGenerator: (trade: string, lang: Language) => string;
}

const KNOWN_TRADES: TradeDefinition[] = [
  {
    canonicalCategory: 'Plumbing',
    keywords: [
      'plumb', 'plumber', 'pipe', 'leak', 'drain', 'tap', 'sanitary', 'water pipe', 'pipe repair', 'pipe leakage',
      'பிளம்பர்', 'குழாய்', 'தண்ணீர் குழாய்', 'கசிவு', 'பிளம்பிங்', 'குழாய் பழுது', 'ப்ளம்பர்',
      'ప్లంబర్', 'పైపు', 'లీకేజీ', 'ప్లంబింగ్', 'పైపుల మరమ్మతు', 'నీటి పైపు',
      'प्लंबर', 'नलसाज', 'पाइप', 'लीकेज', 'नल', 'प्लंबिंग'
    ],
    canonicalSkills: ['Plumbing', 'Pipe Repair'],
    titleGenerator: () => 'Plumbing & Pipe Repair Needed'
  },
  {
    canonicalCategory: 'Painting',
    keywords: [
      'paint', 'painter', 'painting', 'whitewash', 'wall paint', 'house paint', 'primer', 'interior paint', 'exterior paint',
      'பெயிண்ட்', 'பெயிண்டர்', 'வர்ணம்', 'வண்ணம்', 'சுவர் பெயிண்ட்', 'பெயிண்டிங்',
      'పెయింటర్', 'పెయింటింగ్', 'రంగులు', 'గోడ పెయింటింగ్',
      'पेंटर', 'पेंटिंग', 'पुताई', 'रंग रोगन'
    ],
    canonicalSkills: ['Painting', 'Wall Painting'],
    titleGenerator: () => 'House & Wall Painter Needed'
  },
  {
    canonicalCategory: 'Electrical',
    keywords: [
      'electr', 'electrician', 'wiring', 'inverter', 'fuse', 'switchboard', 'short circuit', 'power line', 'fan repair',
      'எலக்ட்ரீசியன்', 'எலக்ட்ரீஷியன்', 'மின்சார', 'வயரிங்', 'மின்பழுது', 'சுவிட்ச்', 'எலக்ட்ரிக்கல்',
      'ఎలక్ట్రీషియన్', 'వైరింగ్', 'కరెంట్ పని', 'విద్యుత్', 'ఇలెక్ట్రీషియన్',
      'इलेक्ट्रीशियन', 'बिजली मिस्त्री', 'वायरिंग', 'बिजली काम'
    ],
    canonicalSkills: ['Electrical', 'Wiring'],
    titleGenerator: () => 'Electrician & Wiring Worker Needed'
  },
  {
    canonicalCategory: 'Carpentry',
    keywords: [
      'carpenter', 'carpentry', 'wood', 'woodwork', 'furniture', 'door repair', 'cabinet', 'table repair',
      'தச்சர்', 'மர வேலை', 'பர்னிச்சர்', 'மரவேலை',
      'వడ్రంగి', 'చెక్క పని', 'ఫర్నిచర్',
      'बढ़ई', 'लकड़ी का काम', 'फर्नीचर'
    ],
    canonicalSkills: ['Carpentry', 'Furniture Repair'],
    titleGenerator: () => 'Carpenter & Furniture Repair Needed'
  },
  {
    canonicalCategory: 'Driver',
    keywords: [
      'driver', 'driving', 'chauffeur', 'car driver', 'auto driver', 'cab', 'truck driver', 'tempo driver',
      'டிரைவர்', 'ஓட்டுநர்', 'கார் டிரைவர்', 'டிரைவிங்',
      'డ్రైవర్', 'కారు డ్రైవర్', 'డ్రైవింగ్',
      'ड्राइवर', 'चालक', 'गाड़ी चालक', 'ड्राइविंग'
    ],
    canonicalSkills: ['Driver', 'Driving'],
    titleGenerator: () => 'Driver Needed'
  },
  {
    canonicalCategory: 'Housekeeping',
    keywords: [
      'clean', 'cleaner', 'cleaning', 'housekeep', 'housekeeping', 'maid', 'sweeper', 'dusting', 'mop', 'house cleaning',
      'சுத்தம்', 'வீட்டு வேலை', 'துப்புரவு', 'வீடு சுத்தம்', 'சுத்தம் செய்பவர்',
      'క్లీనర్', 'ఇంటి పని', 'శుభ్రత', 'హౌస్‌కీపింగ్',
      'सफाई', 'सफाईकर्मी', 'हाउसकीपिंग', 'घर का काम', 'झाड़ू-पोंछा'
    ],
    canonicalSkills: ['Housekeeping', 'Cleaning'],
    titleGenerator: () => 'Housekeeping & Cleaning Assistant Needed'
  },
  {
    canonicalCategory: 'Catering & Cooking',
    keywords: [
      'cook', 'cooking', 'chef', 'cater', 'catering', 'kitchen', 'food prep', 'meal prep',
      'சமையல்', 'கேட்டரிங்', 'சமையல்காரர்', 'குக்', 'சமையல் கலைஞர்',
      'వంట', 'కేటరింగ్', 'వంటమనిషి', 'వంట పని',
      'खाना बनाना', 'रसोइया', 'कैटरिंग', 'कुक', 'बावर्ची'
    ],
    canonicalSkills: ['Cooking / Catering', 'Kitchen Helper'],
    titleGenerator: () => 'Cook & Catering Helper Needed'
  },
  {
    canonicalCategory: 'Delivery',
    keywords: [
      'delivery', 'rider', 'courier', 'food delivery', 'parcel', 'delivery boy', 'delivery partner',
      'டெலிவரி', 'டெலிவரி பாய்', 'பார்சல்',
      'డెలివరీ', 'డెలివరీ బాయ్', 'పార్శిల్',
      'डिलीवरी', 'डिलीवरी बॉय', 'कूरियर'
    ],
    canonicalSkills: ['Delivery', 'Two Wheeler Driving'],
    titleGenerator: () => 'Delivery Rider Needed'
  },
  {
    canonicalCategory: 'Store Helper',
    keywords: [
      'store helper', 'shop helper', 'billing', 'inventory', 'cashier', 'stock', 'retail helper',
      'கடை உதவியாளர்', 'பில்லிங்', 'ஸ்டோர்', 'ஸ்டோர் உதவியாளர்',
      'స్టోర్ హెల్పర్', 'దుకాణం సహాయకుడు', 'బిల్లింగ్',
      'स्टोर हेल्पर', 'दुकान सहायक', 'बिलिंग', 'कैशियर'
    ],
    canonicalSkills: ['Store Helper', 'Cashier & Billing'],
    titleGenerator: () => 'Store & Billing Helper Needed'
  },
  {
    canonicalCategory: 'Mechanic',
    keywords: [
      'mechanic', 'bike repair', 'auto mechanic', 'garage', 'car repair', 'two wheeler mechanic',
      'மெக்கானிக்', 'பைக் ரிப்பேர்', 'கார் மெக்கானிக்',
      'మెకానిక్', 'బైక్ రిపేర్', 'కార్ మెకానిక్',
      'मैकेनिक', 'बाइक मरम्मत', 'कार मैकेनिक'
    ],
    canonicalSkills: ['Mechanic', 'Vehicle Maintenance'],
    titleGenerator: () => 'Mechanic Needed'
  },
  {
    canonicalCategory: 'Appliance Repair',
    keywords: [
      'ac technician', 'ac mechanic', 'ac repair', 'air conditioner', 'appliance repair', 'refrigerator repair', 'washing machine', 'ac service',
      'ஏசி மெக்கானிக்', 'ஏசி சர்வீஸ்', 'குளிர்சாதன', 'ஏசி ரிப்பேர்',
      'ఏసీ సర్వీస్', 'కూలర్ రిపేర్', 'ఏసీ మెకానిక్',
      'एसी मैकेनिक', 'एसी सर्विस', 'कूलर मरम्मत'
    ],
    canonicalSkills: ['AC Repair', 'Appliance Maintenance'],
    titleGenerator: () => 'AC & Appliance Repair Technician Needed'
  },
  {
    canonicalCategory: 'Tutoring',
    keywords: [
      'tutor', 'tuition', 'teacher', 'teaching', 'math tutor', 'science tutor',
      'ஆசிரியர்', 'கல்வி', 'டியூஷன்', 'ஆசிரியை',
      'ట్యూటర్', 'టీచర్', 'బోధన',
      'शिक्षक', 'ट्यूशन', 'ट्यूटर', 'पढ़ाना'
    ],
    canonicalSkills: ['Tutoring', 'Subject Guidance'],
    titleGenerator: () => 'Tutor / Teacher Needed'
  },
  {
    canonicalCategory: 'Masonry',
    keywords: [
      'mason', 'masonry', 'bricklayer', 'concrete', 'plastering', 'construction worker', 'builder',
      'கொத்தனார்', 'கட்டுமானம்', 'கட்டுமான வேலை',
      'మేస్త్రీ', 'తాపీ పని', 'నిర్మాణ పని',
      'राजमिस्त्री', 'चिनाई', 'निर्माण कार्य'
    ],
    canonicalSkills: ['Masonry', 'Construction Work'],
    titleGenerator: () => 'Mason & Construction Worker Needed'
  },
  {
    canonicalCategory: 'Welding',
    keywords: [
      'welder', 'welding', 'fabrication', 'grill work', 'metal gate',
      'வெல்டர்', 'வெல்டிங்', 'இரும்பு வேலை',
      'వెల్డర్', 'వెల్டிంగ్', 'இనుప పని',
      'वेल्डर', 'वेल्डिंग', 'लोहे का काम'
    ],
    canonicalSkills: ['Welding', 'Metal Fabrication'],
    titleGenerator: () => 'Welder & Fabrication Worker Needed'
  },
  {
    canonicalCategory: 'Tailoring',
    keywords: [
      'tailor', 'tailoring', 'stitching', 'garment', 'alteration', 'dressmaker',
      'தையல்', 'தையல்காரர்', 'தையல் வேலை',
      'దర్జీ', 'కుట్లు', 'టైలర్',
      'दर्जी', 'सिलाई', 'सिलाई काम'
    ],
    canonicalSkills: ['Tailoring', 'Garment Stitching'],
    titleGenerator: () => 'Tailor & Stitching Worker Needed'
  },
  {
    canonicalCategory: 'Security & Guard',
    keywords: [
      'security', 'guard', 'watchman', 'gatekeeper', 'security guard', 'night guard', 'night watchman', 'chowkidar', 'bouncer', 'security officer',
      'செக்யூரிட்டி', 'செக்யூரிடி', 'காவலாளி', 'காவலர்', 'வாட்ச்மேன்', 'இரவு காவலாளி', 'பந்தோபஸ்து', 'பாதுகாவலர்',
      'సెక్యూరిటీ', 'సెక్యూరిటీ గార్డ్', 'కాపలాదారు', 'వాచ్‌మెన్', 'వాచ్మన్',
      'सुरक्षा गार्ड', 'सिक्योरिटी', 'चौकीदार', 'गार्ड', 'सुरक्षाकर्मी', 'पहरेदार'
    ],
    canonicalSkills: ['Security Guard', 'Premises Surveillance'],
    titleGenerator: () => 'Security Guard Needed'
  },
  {
    canonicalCategory: 'Event Hand',
    keywords: [
      'event hand', 'event helper', 'stage setup', 'stall helper', 'exhibition hand', 'marriage helper',
      'நிகழ்வு உதவி', 'ஈவென்ட் ஹெல்ப்பர்', 'மேடை அமைப்பு', 'மண்டப வேலை',
      'ఈవెంట్ హెల్పర్', 'ఫంక్షన్ హెల్పర్',
      'इवेंट हेल्पर', 'समारोह सहायक', 'स्टेज सेटअप'
    ],
    canonicalSkills: ['Event Setup', 'Pamphlet Distribution'],
    titleGenerator: () => 'Event Hand & Helper Needed'
  },
  {
    canonicalCategory: 'Logistics & Loading',
    keywords: [
      'loader', 'unloader', 'loading', 'unloading', 'hamali', 'coolie', 'shifting helper', 'warehouse loading',
      'சுமை தூக்குபவர்', 'லோடிங்', 'அன்லோடிங்', 'பொருட்கள் ஏற்றுதல்',
      'లోడింగ్', 'అన్‌లోడింగ్', 'కూలీ',
      'लोडिंग', 'अनलोडिंग', 'हमाली', 'कुली'
    ],
    canonicalSkills: ['Loading & Unloading', 'Packing & Restocking'],
    titleGenerator: () => 'Loading & Shifting Helper Needed'
  },
  {
    canonicalCategory: 'Healthcare Assistant',
    keywords: [
      'patient helper', 'hospital attender', 'home attender', 'elderly care', 'home nurse', 'patient care',
      'நோயாளி பராமரிப்பு', 'முதியோர் பராமரிப்பு', 'மருத்துவ உதவியாளர்', 'அட்டெண்டர்',
      'రోగి సహాయకుడు', 'వృద్ధుల సంరక్షణ', 'అటెండర్',
      'मरीज सहायक', 'बुजुर्गों की देखभाल', 'अटेंडेंट', 'रोगी देखभाल'
    ],
    canonicalSkills: ['Patient Helper', 'Customer Service'],
    titleGenerator: () => 'Healthcare & Patient Assistant Needed'
  },
  {
    canonicalCategory: 'Data Entry',
    keywords: [
      'data entry', 'computer operator', 'typing operator', 'excel operator', 'back office', 'deo',
      'டேட்டா என்ட்ரி', 'கம்ப்யூட்டர் ஆபரேட்டர்', 'டைப்பிங்',
      'డేటా ఎంట్రీ', 'కంప్యూటర్ ఆపరేటర్',
      'डाटा एंट्री', 'कंप्यूटर ऑपरेटर'
    ],
    canonicalSkills: ['Data Entry', 'Computer Basics', 'Basic Accounts'],
    titleGenerator: () => 'Data Entry Operator Needed'
  }
];

/**
 * Natural Language Processing Pipeline for Job / Task Requirement Understanding
 * Supports Multilingual Voice & Text Input across English, Tamil, Telugu, and Hindi
 */
class NLPService {
  /**
   * Detects the language of a given text based on Unicode character script ranges
   */
  public detectLanguage(text: string): Language {
    if (!text || !text.trim()) return 'en';

    let tamilCount = 0;
    let teluguCount = 0;
    let devanagariCount = 0;

    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      // Tamil: 0x0B80 - 0x0BFF
      if (code >= 0x0B80 && code <= 0x0BFF) tamilCount++;
      // Telugu: 0x0C00 - 0x0C7F
      else if (code >= 0x0C00 && code <= 0x0C7F) teluguCount++;
      // Devanagari (Hindi): 0x0900 - 0x097F
      else if (code >= 0x0900 && code <= 0x097F) devanagariCount++;
    }

    if (tamilCount > 2 || (tamilCount > 0 && tamilCount >= teluguCount && tamilCount >= devanagariCount)) return 'ta';
    if (teluguCount > 2 || (teluguCount > 0 && teluguCount >= devanagariCount)) return 'te';
    if (devanagariCount > 2) return 'hi';
    return 'en';
  }

  /**
   * Main NLP pipeline: Extracts skills, location, experience, availability, payout, and missing fields.
   */
  public parseJobRequirement(text: string, currentCity?: string): ExtractedJobRequirement {
    if (!text || !text.trim()) {
      return this.getEmptyRequirement();
    }

    const detectedLanguage = this.detectLanguage(text);
    const languageNames: Record<Language, string> = {
      en: 'English',
      ta: 'Tamil',
      te: 'Telugu',
      hi: 'Hindi'
    };
    const languageName = languageNames[detectedLanguage] || 'English';

    const lower = text.toLowerCase();
    const clean = text;

    // 1. Intent Recognition
    const intent = this.detectIntent(lower, clean, detectedLanguage);

    // 2. Skills & Category Extraction (via semantic abbreviation lookup & rule taxonomy)
    const { category, skills, suggestedTitle } = this.extractSkillsAndCategory(clean, lower, detectedLanguage);

    // 3. Location Extraction
    const location = this.extractLocation(lower, clean, currentCity);

    // 4. Experience Level
    const experience = this.extractExperience(lower, clean);

    // 5. Availability & Timing (Sessions, Immediate, Clock Times)
    const availability = this.extractAvailability(lower, clean);

    // 6. Payout Amount & Unit
    const payout = this.extractPayout(lower, clean);

    // 7. Missing Fields Diagnostics
    const missingFields: MissingFieldPrompt[] = [];
    if (skills.length === 0) {
      missingFields.push({
        field: 'skills',
        label: 'Skill Category',
        prompt: 'What specific trade skill or job role are you looking for?',
        isCritical: true
      });
    }
    if (!location.isDetected) {
      missingFields.push({
        field: 'location',
        label: 'City / Location',
        prompt: 'Which city or area in Tamil Nadu is this gig located in?',
        isCritical: false
      });
    }
    if (!payout.isExplicit) {
      missingFields.push({
        field: 'payout',
        label: 'Pay Rate',
        prompt: 'Specify the budget or pay rate (e.g. ₹500/task or ₹200/hr)',
        isCritical: false
      });
    }
    if (!availability.isExplicit) {
      missingFields.push({
        field: 'availability',
        label: 'Time Shift',
        prompt: 'Shift timing not specified in text',
        isCritical: false
      });
    }
    if (!experience.isExplicit) {
      missingFields.push({
        field: 'experience',
        label: 'Experience',
        prompt: 'Preferred experience level not specified',
        isCritical: false
      });
    }

    let confidence = 0.5;
    if (skills.length > 0) confidence += 0.2;
    if (location.isDetected) confidence += 0.15;
    if (payout.isExplicit) confidence += 0.1;
    if (experience.isExplicit) confidence += 0.05;

    return {
      rawText: text,
      detectedLanguage,
      languageName,
      intent,
      title: suggestedTitle,
      category,
      skills,
      location,
      experience,
      availability,
      payout,
      confidence: Math.min(0.99, confidence),
      missingFields
    };
  }

  /**
   * Detects intent: hire_worker (recruiter) or seek_work (worker)
   */
  private detectIntent(lower: string, clean: string, _lang: Language): ExtractedJobRequirement['intent'] {
    if (
      /\b(looking for\s+(?:\w+\s+){0,4}(?:work|job|gigs?)|need job|want work|available for|hire me|i am a|i can do|seeking work)\b/i.test(lower) ||
      clean.includes('வேலை தேடுகிறேன்') || clean.includes('வேலை வேண்டும்') ||
      clean.includes('పని కావాలి') || clean.includes('ఉద్యోగం కావాలి') ||
      clean.includes('काम चाहिए') || clean.includes('नौकरी चाहिए')
    ) {
      return 'seek_job';
    }
    return 'hire_worker';
  }

  /**
   * Extracts location entity resolution.
   * If not mentioned, returns isDetected: false, displayText: 'Not specified'.
   */
  private extractLocation(
    lower: string,
    clean: string,
    currentCity?: string
  ): ExtractedLocation {
    // 1. Check "near me" or localized variants
    const isNearMe = (
      /\b(near me|nearby|around here|close by|my location|my place|in my area)\b/i.test(lower) ||
      clean.includes('என் அருகில்') || clean.includes('எனக்கு அருகில்') || clean.includes('அருகில்') || clean.includes('கிட்டே') ||
      clean.includes('నా దగ్గర') || clean.includes('నా సమీపంలో') || clean.includes('దగ్గర') ||
      clean.includes('मेरे पास') || clean.includes('पास में') || clean.includes('नजदीक')
    );

    if (isNearMe) {
      const cityObj = TAMIL_NADU_CITIES.find(
        c => c.name.toLowerCase() === (currentCity || 'Chennai').toLowerCase()
      ) || TAMIL_NADU_CITIES[0];

      return {
        city: cityObj.name,
        district: cityObj.district,
        landmark: `${cityObj.name} (Near GPS)`,
        latitude: cityObj.lat,
        longitude: cityObj.lng,
        isDetected: true,
        isNearMe: true,
        confidence: 0.90,
        displayText: `Near me (${cityObj.name})`
      };
    }

    // 2. Check Multilingual City Synonyms
    for (const cityMap of MULTILINGUAL_CITY_MAP) {
      const matchFound = cityMap.synonyms.some(syn => {
        if (clean.includes(syn) || lower.includes(syn.toLowerCase())) return true;
        const synRegex = new RegExp(`\\b${syn}\\b`, 'i');
        return synRegex.test(lower);
      });

      if (matchFound) {
        const canonicalCityObj = TAMIL_NADU_CITIES.find(
          c => c.name.toLowerCase() === cityMap.canonicalName.toLowerCase() ||
            c.district.toLowerCase() === cityMap.district.toLowerCase()
        ) || TAMIL_NADU_CITIES[0];

        const cityLandmarks = getLocationsByCity(canonicalCityObj.name);

        // Check if a specific landmark inside this city was mentioned
        for (const lm of cityLandmarks) {
          const lmParts = lm.name.split(/[,&/]/).map(p => p.trim().toLowerCase());
          if (lmParts.some(p => p.length >= 4 && (lower.includes(p) || clean.includes(p)))) {
            return {
              city: canonicalCityObj.name,
              district: canonicalCityObj.district,
              landmark: lm.name,
              latitude: lm.lat,
              longitude: lm.lng,
              isDetected: true,
              isNearMe: false,
              confidence: 0.95,
              displayText: lm.name.toLowerCase().includes(canonicalCityObj.name.toLowerCase()) ? lm.name : `${lm.name}, ${canonicalCityObj.name}`
            };
          }
        }

        const defaultLandmark = cityLandmarks.length > 0 ? cityLandmarks[0].name : canonicalCityObj.name;
        const lat = cityLandmarks.length > 0 ? cityLandmarks[0].lat : canonicalCityObj.lat;
        const lng = cityLandmarks.length > 0 ? cityLandmarks[0].lng : canonicalCityObj.lng;

        return {
          city: canonicalCityObj.name,
          district: canonicalCityObj.district,
          landmark: defaultLandmark,
          latitude: lat,
          longitude: lng,
          isDetected: true,
          isNearMe: false,
          confidence: 0.95,
          displayText: canonicalCityObj.name
        };
      }
    }

    // 3. Search landmark names directly across all Tamil Nadu locations
    const stopWords = ['tech', 'park', 'auto', 'main', 'east', 'west', 'near', 'from', 'with', 'work', 'jobs', 'side', 'gate', 'view', 'belt', 'road', 'rd'];
    const compactLower = lower.replace(/[^a-z0-9]/g, '');

    for (const lm of TAMIL_NADU_LOCATIONS) {
      const parts = lm.name.split(/[,&/]/).map(p => p.trim());
      const matched = parts.some(p => {
        const cleaned = p.replace(/\b(commercial|complex|hub|transit|industrial|station|estate|terminus|junction|market|corridor|zone|road|rd|temple|central|tech|auto|bus|rail|railway|old|new|cross|city|hall|town|college|univ|area|belt|hospital|collectorate|wholesal|trading|seaport|harbor|beach|lake)\b/gi, '').trim();
        const comp = cleaned.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (stopWords.includes(comp) || comp.length < 3) return false;
        return (comp.length >= 4 || comp === 'omr' || comp === 'vit') && compactLower.includes(comp);
      });

      if (matched) {
        return {
          city: lm.city,
          district: lm.district,
          landmark: lm.name,
          latitude: lm.lat,
          longitude: lm.lng,
          isDetected: true,
          isNearMe: false,
          confidence: 0.95,
          displayText: lm.name.toLowerCase().includes(lm.city.toLowerCase()) ? lm.name : `${lm.name}, ${lm.city}`
        };
      }
    }

    // 4. If NOT detected, do NOT invent a city!
    return {
      city: null,
      district: null,
      landmark: null,
      isDetected: false,
      isNearMe: false,
      confidence: 0.0,
      displayText: 'Not specified'
    };
  }

  /**
   * Extracts required work experience level and years.
   * If not mentioned, returns isExplicit: false, description: 'Not specified'.
   */
  private extractExperience(lower: string, clean: string): ExtractedExperience {
    // 1. Fresher / No Experience check first
    if (
      /\b(fresher|freshers|beginner|entry level|no experience|without experience|0 years? experience|no exp|no prior experience)\b/i.test(lower) ||
      clean.includes('புதியவர்') || clean.includes('தொடக்க நிலை') || clean.includes('அனுபவம் தேவையில்லை') || clean.includes('அனுபவம் இல்லாத') ||
      clean.includes('ఫ్రెషర్') || clean.includes('అనుభవం అవసరం లేదు') || clean.includes('అనుభవం లేని') ||
      clean.includes('फ्रेशर') || clean.includes('शुरुआती') || clean.includes('बिना अनुभव') || clean.includes('अनुभव की आवश्यकता नहीं')
    ) {
      return {
        level: 'Entry Level',
        years: 0,
        isExplicit: true,
        description: 'Entry Level (Fresher)'
      };
    }

    // 2. Numeric Range or Years (e.g., 2-3 years, 3 to 5 yrs, 3 years, 2 yrs exp, 3y exp, 2 ஆண்டுகள், இரண்டு வருடம், 3 साल, दो साल)
    const rangeMatch = lower.match(/(\d+)\s*(?:-|to)\s*(\d+)\s*(?:years?|yrs?|y)(?:\s*(?:of\s*)?(?:work\s*)?experience|\s*exp)?/i);
    if (rangeMatch) {
      const minYears = parseInt(rangeMatch[1], 10);
      const maxYears = parseInt(rangeMatch[2], 10);
      return {
        level: maxYears >= 3 ? 'Expert' : 'Experienced',
        years: minYears,
        isExplicit: true,
        description: `${minYears}-${maxYears} years experience`
      };
    }

    // Multilingual word numbers for years
    let wordYears: number | null = null;
    if (/(?:ஒரு|1)\s*(?:வருடம்|வருட|ஆண்டு)/i.test(clean) || /(?:ఒక|1)\s*(?:సంవత్సరం|సంవత్సర)/i.test(clean) || /(?:एक|1)\s*(?:साल|वर्ष)/i.test(clean) || /\b(?:one|1)\s*year\b/i.test(lower)) {
      wordYears = 1;
    } else if (/(?:இரண்டு|ரெண்டு|2)\s*(?:வருடம்|வருட|ஆண்டு|ஆண்டுகள்)/i.test(clean) || /(?:రెండు|2)\s*(?:సంవత్సరాలు|సంవత్సరాల)/i.test(clean) || /(?:दो|2)\s*(?:साल|वर्ष)/i.test(clean) || /\b(?:two|2)\s*years\b/i.test(lower)) {
      wordYears = 2;
    } else if (/(?:மூன்று|மூனு|3)\s*(?:வருடம்|வருட|ஆண்டு|ஆண்டுகள்)/i.test(clean) || /(?:మూడు|3)\s*(?:సంవత్సరాలు|సంవత్సరాల)/i.test(clean) || /(?:तीन|3)\s*(?:साल|वर्ष)/i.test(clean) || /\b(?:three|3)\s*years\b/i.test(lower)) {
      wordYears = 3;
    } else if (/(?:நான்கு|நாலு|4)\s*(?:வருடம்|வருட|ஆண்டு|ஆண்டுகள்)/i.test(clean) || /(?:నాలుగు|4)\s*(?:సంవత్సరాలు|సంవత్సరాల)/i.test(clean) || /(?:चार|4)\s*(?:साल|वर्ष)/i.test(clean) || /\b(?:four|4)\s*years\b/i.test(lower)) {
      wordYears = 4;
    } else if (/(?:ஐந்து|அஞ்சு|5)\s*(?:வருடம்|வருட|ஆண்டு|ஆண்டுகள்)/i.test(clean) || /(?:ఐదు|5)\s*(?:సంవత్సరాలు|సంవత్సరాల)/i.test(clean) || /(?:पांच|पाँच|5)\s*(?:साल|वर्ष)/i.test(clean) || /\b(?:five|5)\s*years\b/i.test(lower)) {
      wordYears = 5;
    }

    if (wordYears !== null) {
      return {
        level: wordYears >= 3 ? 'Expert' : wordYears >= 2 ? 'Experienced' : 'Suitable',
        years: wordYears,
        isExplicit: true,
        description: `${wordYears}+ years experience`
      };
    }

    const numMatch = (
      lower.match(/(\d+)\+?\s*(?:years?|yrs?|y)(?:\s*(?:of\s*)?(?:work\s*)?experience|\s*exp)?/i) ||
      lower.match(/(?:experience|exp)\s*(?:of\s*)?(\d+)\+?\s*(?:years?|yrs?|y)?/i) ||
      clean.match(/(\d+)\+?\s*(?:ஆண்டுகள்|ஆண்டு|வருடம்|வருட)/) ||
      clean.match(/(\d+)\+?\s*(?:సంవత్సరాలు|సంవత్సరాల)/) ||
      clean.match(/(\d+)\+?\s*(?:साल|वर्ष)/)
    );

    if (numMatch && numMatch[1]) {
      const years = parseInt(numMatch[1], 10);
      if (years >= 0 && years <= 30) {
        return {
          level: years >= 3 ? 'Expert' : years >= 2 ? 'Experienced' : 'Suitable',
          years,
          isExplicit: true,
          description: `${years}+ years experience`
        };
      }
    }

    // 3. Expert / Senior
    if (
      /\b(expert|specialist|senior|master|master craftsman|pro|lead|top rated)\b/i.test(lower) ||
      clean.includes('நிபுணர்') || clean.includes('வல்லுநர்') ||
      clean.includes('నిపుణుడు') || clean.includes('विशेषज्ञ')
    ) {
      return {
        level: 'Expert',
        years: 3,
        isExplicit: true,
        description: 'Expert'
      };
    }

    // 4. Experienced / Skilled / With experience / Prior experience
    if (
      /\b(experienced|skilled|trained|seasoned)\b/i.test(lower) ||
      /\b(with|having|prior|good|some|need|require|preferred|min)\s+experience\b/i.test(lower) ||
      /\bexperience\s+(required|needed|preferred|must|mandatory)\b/i.test(lower) ||
      clean.includes('அனுபவம்') || clean.includes('அனுபவமுள்ள') || clean.includes('முன் அனுபவம்') || clean.includes('அனுபவம் உள்ள') ||
      clean.includes('అనుభవం') || clean.includes('నైపుణ్యం') || clean.includes('అనుభవజ్ఞుడు') || clean.includes('అనుభవం ఉన్న') ||
      clean.includes('अनुभवी') || clean.includes('कुशल') || clean.includes('तजुर्बेकार') || clean.includes('अनुभव चाहिए') || clean.includes('अनुभव')
    ) {
      return {
        level: 'Experienced',
        years: 2,
        isExplicit: true,
        description: 'Experienced'
      };
    }

    // 5. Not specified
    return {
      level: 'Not Specified',
      years: null,
      isExplicit: false,
      description: 'Not specified'
    };
  }

  /**
   * Extracts availability, clock time (e.g. 02 PM, 10 AM), sessions (Morning, Afternoon, Evening, Night),
   * and Immediate status across English, Tamil, Telugu, and Hindi.
   * If not mentioned, returns isExplicit: false, timingText: 'Not specified'.
   */
  private extractAvailability(lower: string, clean: string): ExtractedAvailability {
    const isTomorrow = /\btomorrow\b/i.test(lower) || clean.includes('நாளை') || clean.includes('ரேபு') || clean.includes('कल');
    const isToday = /\btoday\b/i.test(lower) || clean.includes('இன்று') || clean.includes('இன்றே') || clean.includes('ఈరోజు') || clean.includes('ఈరోజే') || clean.includes('आज') || clean.includes('आज ही');

    // 1. Immediate / Urgently / Right now / ASAP / Multilingual Immediate
    const isImmediate = (
      /\b(immediately|immediate|right now|urgently|urgent|asap|at once|instant|emergency|now|fast)\b/i.test(lower) ||
      clean.includes('உடனடியாக') || clean.includes('உடனே') || clean.includes('இப்போதே') || clean.includes('இப்பவே') || clean.includes('அவசரம்') || clean.includes('அவசரமாக') ||
      clean.includes('వెంటనే') || clean.includes('వెంటనె') || clean.includes('ఇప్పుడే') || clean.includes('అత్యవసరం') || clean.includes('తక్షణం') || clean.includes('అర్జెంట్') ||
      clean.includes('तुरंत') || clean.includes('अभी') || clean.includes('जल्दी') || clean.includes('फौरन') || clean.includes('तत्काल') || clean.includes('तुरन्त') || clean.includes('अर्जेन्ट')
    );

    // 2. Specific Clock Time Extraction (e.g. "from 10 p.m.", "at 02 PM", "10 pm - 6 am", "2:30 pm", "14:00", "2 மணிக்கு", "2 बजे")
    // Pattern 0: Time Range e.g. "from 10 p.m. to 6 a.m.", "10 pm - 6 am", "from 9:00 am to 5:00 pm", "9am to 6pm"
    const timeRangeRegex = /(?:from\s+)?(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\s*(?:to|-|until|till|–|—)\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)(?![a-zA-Z])/i;
    const rangeMatch = lower.match(timeRangeRegex);
    if (rangeMatch) {
      let h1 = parseInt(rangeMatch[1], 10);
      const m1 = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : 0;
      const p1 = rangeMatch[3].toLowerCase().replace(/\./g, '');
      let h2 = parseInt(rangeMatch[4], 10);
      const m2 = rangeMatch[5] ? parseInt(rangeMatch[5], 10) : 0;
      const p2 = rangeMatch[6].toLowerCase().replace(/\./g, '');

      const dispStart = `${h1.toString().padStart(2, '0')}:${m1.toString().padStart(2, '0')} ${p1.toUpperCase()}`;
      const dispEnd = `${h2.toString().padStart(2, '0')}:${m2.toString().padStart(2, '0')} ${p2.toUpperCase()}`;

      if (p1 === 'pm' && h1 < 12) h1 += 12;
      if (p1 === 'am' && h1 === 12) h1 = 0;
      if (p2 === 'pm' && h2 < 12) h2 += 12;
      if (p2 === 'am' && h2 === 12) h2 = 0;

      const isNightRange = h1 >= 21 || h1 < 5 || (p1 === 'pm' && h1 >= 20);
      const slot = isNightRange ? 'Night' : (h1 >= 5 && h1 < 12 ? 'Morning' : (h1 >= 12 && h1 < 17 ? 'Afternoon' : 'Evening'));
      const label = isNightRange ? 'Night Shift' : 'Day Shift';

      return {
        slots: [slot as any],
        timingText: `${label} (${dispStart} – ${dispEnd})`,
        isExplicit: true
      };
    }

    // Pattern A: standard 12-hour AM/PM e.g. "from 10 p.m.", "at 02 PM", "at 2 pm", "2:30 pm", "02.30 pm", "10 am", "08:00 AM", "4pm"
    const timeMatch12 = lower.match(/(from|at|by|around)?\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)(?![a-zA-Z])/i);
    // Pattern B: 24-hour time or explicit clock e.g. "at 14:00", "at 02:00", "14:30", "15:00"
    const timeMatch24 = lower.match(/(?:at|by|around|from)\s+(\d{1,2})[:.](\d{2})\b/i) || lower.match(/\b([01]?\d|2[0-3])[:.](\d{2})\b/);
    // Pattern C: Indic clock hour with unit e.g. "2 மணிக்கு", "2 மணி", "2 மணியளவில்", "2 முதல", "2 గంటలకు", "2 బజే", "2 बजे"
    const timeMatchIndic = clean.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(?:மணிக்கு|மணியளவில்|மணி|முதல்|గంటలకు|బజే|बजे)/);
    // Pattern D: "at 2 o'clock"
    const timeMatchOClock = lower.match(/(?:at\s+)?(\d{1,2})\s*o['\s]?clock/i);

    let parsedHour: number | null = null;
    let formattedTimeStr = '';

    if (timeMatch12) {
      const hasFrom = timeMatch12[1]?.toLowerCase() === 'from';
      let h = parseInt(timeMatch12[2], 10);
      const m = timeMatch12[3] ? parseInt(timeMatch12[3], 10) : 0;
      const period = timeMatch12[4].toLowerCase().replace(/\./g, '');
      if (h >= 1 && h <= 12 && m >= 0 && m < 60) {
        const displayH = h.toString().padStart(2, '0');
        const displayM = m > 0 ? `:${m.toString().padStart(2, '0')}` : ':00';
        const rawTime = `${displayH}${displayM} ${period.toUpperCase()}`;
        formattedTimeStr = hasFrom ? `From ${rawTime}` : rawTime;
        if (period === 'pm' && h < 12) h += 12;
        if (period === 'am' && h === 12) h = 0;
        parsedHour = h;
      }
    } else if (timeMatch24) {
      const h = parseInt(timeMatch24[1], 10);
      const m = parseInt(timeMatch24[2], 10);
      if (h >= 0 && h <= 23 && m >= 0 && m < 60) {
        parsedHour = h;
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = (h % 12 === 0 ? 12 : h % 12).toString().padStart(2, '0');
        const displayM = m > 0 ? `:${m.toString().padStart(2, '0')}` : ':00';
        formattedTimeStr = `${displayH}${displayM} ${period}`;
      }
    } else if (timeMatchIndic) {
      const h = parseInt(timeMatchIndic[1], 10);
      const m = timeMatchIndic[2] ? parseInt(timeMatchIndic[2], 10) : 0;
      if (h >= 1 && h <= 24) {
        let isPM = false;
        if (lower.includes('மாலை') || lower.includes('மதியம்') || lower.includes('இரவு') ||
          lower.includes('சாயந்திரம்') || lower.includes('సాయంత్రం') || lower.includes('రాత్రి') ||
          lower.includes('दोपहर') || lower.includes('शाम') || lower.includes('रात') ||
          lower.includes('evening') || lower.includes('afternoon') || lower.includes('night')) {
          isPM = true;
        }
        let hr24 = h;
        if (isPM && h < 12) hr24 = h + 12;
        parsedHour = hr24;
        const period = isPM || hr24 >= 12 ? 'PM' : 'AM';
        const displayH = (hr24 % 12 === 0 ? 12 : hr24 % 12).toString().padStart(2, '0');
        const displayM = m > 0 ? `:${m.toString().padStart(2, '0')}` : ':00';
        formattedTimeStr = `${displayH}${displayM} ${period}`;
      }
    } else if (timeMatchOClock) {
      const h = parseInt(timeMatchOClock[1], 10);
      if (h >= 1 && h <= 12) {
        let isPM = false;
        if (lower.includes('afternoon') || lower.includes('evening') || lower.includes('night') || lower.includes('மதியம்') || lower.includes('மாலை') || lower.includes('இரவு')) {
          isPM = true;
        }
        let hr24 = h;
        if (isPM && h < 12) hr24 = h + 12;
        parsedHour = hr24;
        const period = isPM || hr24 >= 12 ? 'PM' : 'AM';
        formattedTimeStr = `${(hr24 % 12 === 0 ? 12 : hr24 % 12).toString().padStart(2, '0')}:00 ${period}`;
      }
    }

    // If explicit clock time was parsed, categorize into standard session (Morning, Afternoon, Evening, Night)
    if (parsedHour !== null) {
      // Morning: 05:00 to 11:59 (5 AM to 11 AM)
      if (parsedHour >= 5 && parsedHour < 12) {
        const prefix = isTomorrow ? 'Tomorrow Morning' : isToday ? 'Morning Shift (Today)' : 'Morning Shift';
        return {
          slots: ['Morning'],
          timingText: formattedTimeStr ? `${prefix} (${formattedTimeStr})` : prefix,
          isExplicit: true
        };
      }
      // Afternoon: 12:00 to 16:59 (12 PM to 4 PM)
      if (parsedHour >= 12 && parsedHour < 17) {
        const prefix = isTomorrow ? 'Tomorrow Afternoon' : isToday ? 'Afternoon Shift (Today)' : 'Afternoon Shift';
        return {
          slots: ['Afternoon'],
          timingText: formattedTimeStr ? `${prefix} (${formattedTimeStr})` : prefix,
          isExplicit: true
        };
      }
      // Evening: 17:00 to 20:59 (5 PM to 8:59 PM)
      if (parsedHour >= 17 && parsedHour < 21) {
        const prefix = isTomorrow ? 'Tomorrow Evening' : isToday ? 'Evening Shift (Today)' : 'Evening Shift';
        return {
          slots: ['Evening'],
          timingText: formattedTimeStr ? `${prefix} (${formattedTimeStr})` : prefix,
          isExplicit: true
        };
      }
      // Night: 21:00 to 04:59 (9 PM to 4:59 AM) - e.g. 10 PM (22:00) is standard Night Shift
      const prefix = isTomorrow ? 'Tomorrow Night' : isToday ? 'Night Shift (Today)' : 'Night Shift';
      return {
        slots: ['Night'],
        timingText: formattedTimeStr ? `${prefix} (${formattedTimeStr})` : prefix,
        isExplicit: true
      };
    }

    // 3. Immediate / Urgently takes high precedence if no clock time was provided
    if (isImmediate) {
      return {
        slots: ['Immediate'],
        timingText: 'Immediate',
        isExplicit: true
      };
    }

    // 4. Shift Keywords (Night Shift, Day Shift, Rotational Shift)
    const isNightShift = (
      /\b(night\s*shift|late\s*night\s*shift|graveyard\s*shift|third\s*shift)\b/i.test(lower) ||
      clean.includes('இரவு ஷிப்ட்') || clean.includes('இரவுப் பணி') ||
      clean.includes('నైట్ షిఫ్ట్') || clean.includes('రాత్రి షిఫ్ట్') ||
      clean.includes('नाइट शिफ्ट')
    );
    if (isNightShift) {
      return {
        slots: ['Night'],
        timingText: isTomorrow ? 'Tomorrow Night Shift' : 'Night Shift',
        isExplicit: true
      };
    }

    const isDayShift = (
      /\b(day\s*shift|general\s*shift|morning\s*shift)\b/i.test(lower) ||
      clean.includes('பகல் ஷிப்ட்') || clean.includes('காலை ஷிப்ட்') || clean.includes('ஜெனரல் ஷிப்ட்') ||
      clean.includes('డే షిఫ్ట్') || clean.includes('మార్నింగ్ షిఫ్ట్') ||
      clean.includes('डे शिफ्ट') || clean.includes('मॉर्निंग शिफ्ट')
    );
    if (isDayShift) {
      return {
        slots: ['Morning'],
        timingText: isTomorrow ? 'Tomorrow Day Shift' : 'Day Shift',
        isExplicit: true
      };
    }

    const isRotationalShift = (
      /\b(rotational\s*shift|rotation\s*shift|rotational)\b/i.test(lower) ||
      clean.includes('சுழற்சி ஷிப்ட்') || clean.includes('రొటేషనల్ షిఫ్ట్') || clean.includes('रोटेशनल शिफ्ट')
    );
    if (isRotationalShift) {
      return {
        slots: ['Morning', 'Night'],
        timingText: 'Rotational Shift',
        isExplicit: true
      };
    }

    // 4. Session keywords (Morning, Afternoon, Evening, Night) with or without Tomorrow/Today
    const isMorning = (
      /\b(morning|early morning|first half|dawn|breakfast time)\b/i.test(lower) ||
      clean.includes('காலை') || clean.includes('காலையில்') || clean.includes('உதயம்') ||
      clean.includes('ఉదయం') || clean.includes('మార్నింగ్') ||
      clean.includes('सुबह') || clean.includes('प्रातः')
    );

    const isAfternoon = (
      /\b(afternoon|post lunch|lunch time|midday|noon)\b/i.test(lower) ||
      clean.includes('மதியம்') || clean.includes('மதியத்தில்') || clean.includes('பிற்பகல்') || clean.includes('நண்பகல்') ||
      clean.includes('మధ్యాహ్నం') || clean.includes('ఆఫ్టర్‌నూన్') ||
      clean.includes('दोपहर')
    );

    const isEvening = (
      /\b(evening|sunset|dusk)\b/i.test(lower) ||
      clean.includes('மாலை') || clean.includes('மாலையில்') ||
      clean.includes('సాయந்திரம்') || clean.includes('సాయంత్రம்') ||
      clean.includes('शाम') || clean.includes('संध्या')
    );

    const isNight = (
      /\b(night|tonight|late evening|late night)\b/i.test(lower) ||
      clean.includes('இரவு') || clean.includes('இரவில்') ||
      clean.includes('రాత్రి') ||
      clean.includes('रात')
    );

    if (isMorning) {
      return {
        slots: ['Morning'],
        timingText: isTomorrow ? 'Tomorrow Morning' : isToday ? 'Morning Shift (Today)' : 'Morning Shift',
        isExplicit: true
      };
    }

    if (isAfternoon) {
      return {
        slots: ['Afternoon'],
        timingText: isTomorrow ? 'Tomorrow Afternoon' : isToday ? 'Afternoon Shift (Today)' : 'Afternoon Shift',
        isExplicit: true
      };
    }

    if (isEvening) {
      return {
        slots: ['Evening'],
        timingText: isTomorrow ? 'Tomorrow Evening' : isToday ? 'Evening Shift (Today)' : 'Evening Shift',
        isExplicit: true
      };
    }

    if (isNight) {
      return {
        slots: ['Night'],
        timingText: isTomorrow ? 'Tomorrow Night' : isToday ? 'Night Shift (Today)' : 'Night Shift',
        isExplicit: true
      };
    }

    // 5. Tomorrow (General)
    if (isTomorrow) {
      return {
        slots: ['Morning', 'Evening'],
        timingText: 'Tomorrow',
        isExplicit: true
      };
    }

    // 6. Today (General)
    if (isToday) {
      return {
        slots: ['Immediate'],
        timingText: 'Today / Immediate',
        isExplicit: true
      };
    }

    // 7. Weekend
    if (
      /\b(this weekend|weekend|weekends|saturday|sunday)\b/i.test(lower) ||
      clean.includes('வார இறுதி') || clean.includes('சனி') || clean.includes('ஞாயிறு') ||
      clean.includes('வారాంతం') || clean.includes('శనివారం') || clean.includes('వీకెండ్') ||
      clean.includes('वीकेंड') || clean.includes('शनिवार') || clean.includes('रविवार')
    ) {
      return {
        slots: ['Weekend'],
        timingText: 'Weekend',
        isExplicit: true
      };
    }

    // 8. Full-time / Part-time / Flexible
    if (
      /\b(full time|full-time|fulltime)\b/i.test(lower) ||
      clean.includes('முழு நேரம்') || clean.includes('పూర్తి సమయం') || clean.includes('फुल टाइम')
    ) {
      return {
        slots: ['Morning', 'Afternoon'],
        timingText: 'Full-Time',
        isExplicit: true
      };
    }

    if (
      /\b(part time|part-time|parttime)\b/i.test(lower) ||
      clean.includes('பகுதி நேரம்') || clean.includes('పార్ట్ టైమ్') || clean.includes('पार्ट टाइम')
    ) {
      return {
        slots: ['Morning', 'Evening'],
        timingText: 'Part-Time',
        isExplicit: true
      };
    }

    if (/\b(flexible|flexi shift)\b/i.test(lower)) {
      return {
        slots: ['Morning', 'Evening'],
        timingText: 'Flexible Timing',
        isExplicit: true
      };
    }

    // Not specified
    return {
      slots: [],
      timingText: 'Not specified',
      isExplicit: false
    };
  }

  /**
   * Helper: Parse Indic / Multilingual number words to numeric values.
   * Handles spoken numbers like Tamil 'ஐநூறு' (500), 'ஐந்தாறு' (500), 'ஆயிரம்' (1000), 'இரண்டாயிரம்' (2000),
   * Hindi 'पांच सौ' (500), 'हजार' (1000), Telugu 'ఐదు వందలు' (500), English 'five hundred' (500), etc.
   */
  private parseWordNumbers(text: string): { amount: number; matchedText: string } | null {
    const wordNumberPatterns: [RegExp, number][] = [
      // Tamil combinations (including spoken / voice-transcribed variations)
      [/(?:பத்தாயிரம்|10\s*ஆயிரம்|பத்து\s*ஆயிரம்)/i, 10000],
      [/(?:ஐந்தாயிரம்|5\s*ஆயிரம்|ஐந்து\s*ஆயிரம்)/i, 5000],
      [/(?:நான்காயிரம்|நாலாயிரம்|4\s*ஆயிரம்|நான்கு\s*ஆயிரம்)/i, 4000],
      [/(?:மூன்றாயிரம்|3\s*ஆயிரம்|மூன்று\s*ஆயிரம்)/i, 3000],
      [/(?:இரண்டாயிரம்|ரெண்டாயிரம்|2\s*ஆயிரம்|இரண்டு\s*ஆயிரம்)/i, 2000],
      [/(?:ஆயிரத்து\s*ஐநூறு|ஆயிரத்தி\s*ஐநூறு|1500)/i, 1500],
      [/(?:ஆயிரம்|ஓராயிரம்|ஒரு\s*ஆயிரம்|1\s*ஆயிரம்)/i, 1000],
      [/(?:தொள்ளாயிரம்|ஒன்பது\s*நூறு|900)/i, 900],
      [/(?:எண்ணூற்று\s*ஐம்பது|எண்ணூத்தி\s*ஐம்பது|850)/i, 850],
      [/(?:எண்ணூறு|எட்டு\s*நூறு|800)/i, 800],
      [/(?:எழுநூற்று\s*ஐம்பது|எழுநூத்தி\s*ஐம்பது|750)/i, 750],
      [/(?:எழுநூறு|ஏழு\s*நூறு|700)/i, 700],
      [/(?:அறுநூற்று\s*ஐம்பது|அறுநூத்தி\s*ஐம்பது|650)/i, 650],
      [/(?:அறுநூறு|ஆறு\s*நூறு|600)/i, 600],
      [/(?:ஐந்நூற்றி\s*ஐம்பது|ஐநூத்தி\s*ஐம்பது|550)/i, 550],
      [/(?:ஐநூறு|ஐந்நூறு|ஐந்தாறு|ஐந்து\s*நூறு|500)/i, 500],
      [/(?:நானூற்று\s*ஐம்பது|நானூத்தி\s*ஐம்பது|450)/i, 450],
      [/(?:நானூறு|நாலு\s*நூறு|400)/i, 400],
      [/(?:முந்நூற்று\s*ஐம்பது|முந்நூத்தி\s*ஐம்பது|350)/i, 350],
      [/(?:முந்நூறு|முன்னூறு|மூன்று\s*நூறு|300)/i, 300],
      [/(?:இருநூற்று\s*ஐம்பது|இருநூத்தி\s*ஐம்பது|250)/i, 250],
      [/(?:இருநூறு|இருநூற்று|ரெண்டு\s*நூறு|200)/i, 200],
      [/(?:நூற்றி\s*ஐம்பது|நூத்தி\s*ஐம்பது|150)/i, 150],
      [/(?:நூறு|ஒரு\s*நூறு|100)/i, 100],

      // Hindi combinations
      [/(?:दस\s*हजार|10\s*हजार)/i, 10000],
      [/(?:पांच\s*हजार|पाँच\s*हजार|5\s*हजार)/i, 5000],
      [/(?:चार\s*हजार|4\s*हजार)/i, 4000],
      [/(?:तीन\s*हजार|3\s*हजार)/i, 3000],
      [/(?:दो\s*हजार|2\s*हजार)/i, 2000],
      [/(?:पंद्रह\s*सौ|डेढ़\s*हजार|1500)/i, 1500],
      [/(?:हजार|एक\s*हजार|1\s*हजार)/i, 1000],
      [/(?:नौ\s*सौ|900)/i, 900],
      [/(?:आठ\s*सौ|800)/i, 800],
      [/(?:सात\s*सौ|700)/i, 700],
      [/(?:छह\s*सौ|छः\s*सौ|600)/i, 600],
      [/(?:पांच\s*सौ|पाँच\s*सौ|500)/i, 500],
      [/(?:चार\s*सौ|400)/i, 400],
      [/(?:तीन\s*सौ|300)/i, 300],
      [/(?:ढाई\s*सौ|250)/i, 250],
      [/(?:दो\s*सौ|200)/i, 200],
      [/(?:डेढ़\s*सौ|150)/i, 150],
      [/(?:सौ|एक\s*सौ|100)/i, 100],

      // Telugu combinations
      [/(?:పది\s*వేలు|10\s*వేలు)/i, 10000],
      [/(?:ఐదు\s*వేలు|5\s*వేలు)/i, 5000],
      [/(?:నాలుగు\s*వేలు|4\s*వేలు)/i, 4000],
      [/(?:మూడు\s*వేలు|3\s*వేలు)/i, 3000],
      [/(?:రెండు\s*వేలు|2\s*వేలు)/i, 2000],
      [/(?:పదిహేను\s*వందలు|1500)/i, 1500],
      [/(?:వెయ్యి|వేయి|ఒక\s*వెయ్యి|1\s*వెయ్యి)/i, 1000],
      [/(?:తొమ్మిది\s*వందలు|తొమ్మిదివందలు|900)/i, 900],
      [/(?:ఎనిమిది\s*వందలు|ఎనిమిదివందలు|800)/i, 800],
      [/(?:ఏడు\s*వందలు|ఏడువందలు|700)/i, 700],
      [/(?:ఆరు\s*వందలు|ఆరువందలు|600)/i, 600],
      [/(?:ఐదు\s*వందలు|ఐదువందలు|ఐదారొందలు|500)/i, 500],
      [/(?:నాలుగు\s*వందలు|నాలుగువందలు|400)/i, 400],
      [/(?:మూడు\s*వందలు|మూడువందలు|300)/i, 300],
      [/(?:రెండు\s*వందలు|రెండువందలు|200)/i, 200],
      [/(?:వంద|ఒక\s*వంద|100)/i, 100],

      // English spoken words
      [/\b(?:ten\s*thousand)\b/i, 10000],
      [/\b(?:five\s*thousand)\b/i, 5000],
      [/\b(?:four\s*thousand)\b/i, 4000],
      [/\b(?:three\s*thousand)\b/i, 3000],
      [/\b(?:two\s*thousand)\b/i, 2000],
      [/\b(?:fifteen\s*hundred)\b/i, 1500],
      [/\b(?:one\s*thousand|a\s*thousand|thousand)\b/i, 1000],
      [/\b(?:nine\s*hundred)\b/i, 900],
      [/\b(?:eight\s*hundred)\b/i, 800],
      [/\b(?:seven\s*hundred)\b/i, 700],
      [/\b(?:six\s*hundred)\b/i, 600],
      [/\b(?:five\s*hundred)\b/i, 500],
      [/\b(?:four\s*hundred)\b/i, 400],
      [/\b(?:three\s*hundred)\b/i, 300],
      [/\b(?:two\s*hundred)\b/i, 200],
      [/\b(?:one\s*hundred|hundred)\b/i, 100]
    ];

    for (const [pattern, val] of wordNumberPatterns) {
      const match = text.match(pattern);
      if (match) {
        return { amount: val, matchedText: match[0] };
      }
    }
    return null;
  }

  /**
   * Extracts monetary compensation figures across Tamil, Telugu, Hindi, and English.
   * Recognizes:
   * 1. Direct digits with currency (e.g., ₹500, Rs 500, 500 ரூபாய், 500 రూపాయలు, 500 रुपये)
   * 2. Multilingual wage keywords (ஊதியம், சம்பளம், கூலி, தொகை, ஜீతం, కూలీ, వేతనం, वेतन, सैलरी, मजदूरी, budget, pay, salary)
   * 3. Spoken / Written number words (ஐநூறு, ஐந்தாறு, ஆயிரம், இரண்டு வருடம், ஐந்து நூறு, ఐదు వందలు, पांच सौ, five hundred)
   * 4. Multi-language billing units (per hour/மணிக்கு/గంటకు/प्रति घंटा, per day/நாளைக்கு/రోజుకు/प्रति दिन, per task/பணிக்கு)
   */
  private extractPayout(lower: string, clean: string): ExtractedPayout {
    // 1. Detect Explicit Multilingual Unit
    const isHourly = (
      /\b(hour|hr|hourly|an hour|per hour)\b/i.test(lower) ||
      clean.includes('/மணி') || clean.includes('மணிக்கு') || clean.includes('ஒரு மணிக்கு') || clean.includes('மணி நேரத்திற்கு') || clean.includes('மணி நேரம்') ||
      clean.includes('/గంట') || clean.includes('గంటకు') || clean.includes('గంటకి') ||
      clean.includes('/घंटा') || clean.includes('प्रति घंटा') || clean.includes('घंटे के') || clean.includes('घंटा')
    );

    const isDaily = (
      /\b(day|daily|shift|per day|per shift)\b/i.test(lower) ||
      clean.includes('/நாள்') || clean.includes('நாளைக்கு') || clean.includes('ஒரு நாளுக்கு') || clean.includes('தினசரி') || clean.includes('நாளுக்கு') || clean.includes('ஷிப்ட்') || clean.includes('ஷிப்ட்டுக்கு') || clean.includes('/ஷிப்ட்') ||
      clean.includes('/రోజు') || clean.includes('రోజుకు') || clean.includes('రోజుకి') || clean.includes('దినసరి') || clean.includes('షిఫ్ట్‌కు') ||
      clean.includes('/दिन') || clean.includes('प्रति दिन') || clean.includes('दिन के') || clean.includes('दैनिक') || clean.includes('शिफ्ट के') || clean.includes('शिफ्ट')
    );

    const isTask = (
      /\b(task|job|for task|for job|per task|per job)\b/i.test(lower) ||
      clean.includes('/வேலை') || clean.includes('வேலைக்கு') || clean.includes('பணிக்கு') || clean.includes('ஒரு வேலைக்கு') ||
      clean.includes('/పని') || clean.includes('పనికి') || clean.includes('ఒక పనికి') ||
      clean.includes('/काम') || clean.includes('प्रति काम') || clean.includes('काम के')
    );

    // 2. Multilingual Wage / Salary / Currency Keyword Context
    const hasWageKeyword = (
      /\b(budget|pay|salary|rate|cost|wage|wages|compensation|fee|rupees|rupee|rs|inr)\b/i.test(lower) ||
      clean.includes('ஊதியம்') || clean.includes('சம்பளம்') || clean.includes('கூலி') || clean.includes('தொகை') || clean.includes('கட்டணம்') || clean.includes('விகிதம்') || clean.includes('ரூபாய்') || clean.includes('ரூ.') || clean.includes('ரூ') ||
      clean.includes('ஜீతం') || clean.includes('కూలీ') || clean.includes('వేతనం') || clean.includes('మొత్తం') || clean.includes('రూపాయలు') || clean.includes('రూ.') ||
      clean.includes('वेतन') || clean.includes('सैलरी') || clean.includes('मजदूरी') || clean.includes('पगार') || clean.includes('रुपये') || clean.includes('रुपए') || clean.includes('रु.') || clean.includes('रु')
    );

    // 3. Pattern 1: Wage Keyword followed by Number (digits or word numbers), with optional punctuation/colon/comma
    // E.g. "ஊதியம், ஐந்தாறு ரூபாய்", "ஊதியம் 500", "சம்பளம்: 600 ரூபாய்", "கூலி 400", "ஜீతం 500", "వేతనం 400", "वेतन 500 रुपये"
    const wageKeywordPattern = /(?:ஊதியம்|சம்பளம்|கூலி|தொகை|கட்டணம்|விகிதம்|ஜீతం|కూలీ|వేతనం|वेतन|सैलरी|मजदूरी|पगार|budget|pay|salary|rate|cost|wage|compensation|fee)\s*[,:=-]?\s*(?:ரூபாய்|ரூ\.?|రూపాయలు|రూ\.?|रुपये|रुपए|रु\.?|₹|rs\.?|inr|is|of)?\s*([^\s,.;]+(?:\s+[^\s,.;]+)?)/i;
    const kwMatch = clean.match(wageKeywordPattern);
    if (kwMatch && kwMatch[1]) {
      const targetSnippet = kwMatch[1].trim();
      const digitMatch = targetSnippet.match(/\b(\d{2,5})\b/);
      if (digitMatch) {
        const amount = parseInt(digitMatch[1], 10);
        if (amount >= 50 && amount <= 100000 && amount !== 2024 && amount !== 2025 && amount !== 2026) {
          const unit: ExtractedPayout['unit'] = isHourly ? 'hour' : isDaily ? 'day' : isTask ? 'task' : (amount <= 350 ? 'hour' : 'task');
          return {
            amount,
            unit,
            isExplicit: true,
            displayText: `₹${amount}${isHourly ? ' / hr' : isDaily ? ' / day' : ''}`
          };
        }
      }
      const parsedWord = this.parseWordNumbers(targetSnippet);
      if (parsedWord) {
        const amount = parsedWord.amount;
        const unit: ExtractedPayout['unit'] = isHourly ? 'hour' : isDaily ? 'day' : isTask ? 'task' : (amount <= 350 ? 'hour' : 'task');
        return {
          amount,
          unit,
          isExplicit: true,
          displayText: `₹${amount}${isHourly ? ' / hr' : isDaily ? ' / day' : ''}`
        };
      }
    }

    // 4. Pattern 2: Word number or Digits + Currency (E.g. "ஐந்தாறு ரூபாய்", "ஐநூறு ரூபாய்", "ஆயிரம் ரூபாய்", "500 ரூபாய்", "ఐదు వందల రూపాయలు", "पांच सौ रुपये", "five hundred rupees")
    const currencySuffixPattern = /(?:([^\s,.;]+(?:\s+[^\s,.;]+)?)\s*(?:ரூபாய்|ரூ\.?|ரூ|రూపాయలు|రూ\.?|रुपये|रुपए|रु\.?|rupees|rupee|rs\.?|inr))/i;
    const currMatch = clean.match(currencySuffixPattern);
    if (currMatch && currMatch[1]) {
      const targetSnippet = currMatch[1].trim();
      const digitMatch = targetSnippet.match(/\b(\d{2,5})\b/);
      if (digitMatch) {
        const amount = parseInt(digitMatch[1], 10);
        if (amount >= 50 && amount <= 100000 && amount !== 2024 && amount !== 2025 && amount !== 2026) {
          const unit: ExtractedPayout['unit'] = isHourly ? 'hour' : isDaily ? 'day' : isTask ? 'task' : (amount <= 350 ? 'hour' : 'task');
          return {
            amount,
            unit,
            isExplicit: true,
            displayText: `₹${amount}${isHourly ? ' / hr' : isDaily ? ' / day' : ''}`
          };
        }
      }
      const parsedWord = this.parseWordNumbers(targetSnippet);
      if (parsedWord) {
        const amount = parsedWord.amount;
        const unit: ExtractedPayout['unit'] = isHourly ? 'hour' : isDaily ? 'day' : isTask ? 'task' : (amount <= 350 ? 'hour' : 'task');
        return {
          amount,
          unit,
          isExplicit: true,
          displayText: `₹${amount}${isHourly ? ' / hr' : isDaily ? ' / day' : ''}`
        };
      }
    }

    // 5. Pattern 3: Explicit rate with slash/per unit: '₹500/task', 'rs 200/hr', '300/hour', '800 rs per day', '₹800/day', '200/மணி', '800/நாள்'
    const patternSlash = /(?:₹|rs\.?|inr|ரூ|ரூ\.|రూ|రూ\.|रुपये|रुपए|रु\.)?\s*(\d{2,5})\s*(?:₹|rs\.?|inr|ரூபாய்|ரூ|రూపాయలు|रुपये|रुपए)?\s*(?:\/|per|\s+a\s+|\s+per\s+)\s*(hour|hr|task|day|shift|month|week|job|மணி|நாள்|ஷிப்ட்|గంట|రోజు|घंटा|दिन)/i;
    const matchSlash = lower.match(patternSlash);
    if (matchSlash) {
      const amount = parseInt(matchSlash[1], 10);
      if (amount >= 50 && amount <= 100000) {
        let unit: ExtractedPayout['unit'] = 'hour';
        const u = matchSlash[2].toLowerCase();
        if (u === 'hr' || u === 'hour' || u.includes('மணி') || u.includes('గంట') || u.includes('घंटा')) unit = 'hour';
        else if (u === 'task' || u === 'job') unit = 'task';
        else if (u === 'day' || u.includes('நாள்') || u.includes('రోజు') || u.includes('दिन')) unit = 'day';
        else if (u === 'shift' || u.includes('ஷிப்ட்')) unit = 'shift';

        return {
          amount,
          unit,
          isExplicit: true,
          displayText: `₹${amount} / ${unit}`
        };
      }
    }

    // 6. Pattern 4: Currency Symbol / Prefix + Digits: '₹800', 'Rs. 800', 'ரூ 800', 'ரூ. 500', 'రూ 800', 'रु. 800'
    const patternPrefixDigits = /(?:₹|rs\.?|inr|ரூபாய்|ரூ\.|ரூ|రూపాయలు|రూ\.|రూ|रुपये|रुपए|रु\.|रु)\s*(\d{2,5})(?:\s*\/\-|\s*\.|\b)/i;
    const matchPrefixDigits = clean.match(patternPrefixDigits);
    if (matchPrefixDigits && matchPrefixDigits[1]) {
      const amount = parseInt(matchPrefixDigits[1], 10);
      if (amount >= 50 && amount <= 100000 && amount !== 2024 && amount !== 2025 && amount !== 2026) {
        const unit: ExtractedPayout['unit'] = isHourly ? 'hour' : isDaily ? 'day' : isTask ? 'task' : (amount <= 350 ? 'hour' : 'task');
        return {
          amount,
          unit,
          isExplicit: true,
          displayText: `₹${amount}${isHourly ? ' / hr' : isDaily ? ' / day' : ''}`
        };
      }
    }

    // 7. Pattern 5: Digits + Currency Suffix: '500 ரூபாய்', '500 ரூ', '500 rupees', '500 rs', '500/-'
    const patternSuffixDigits = /(\d{2,5})\s*(?:rupees|rupee|rs\.?|inr|ரூபாய்|ரூ\.|ரூ|రూపాయలు|రూ\.|రూ|रुपये|रुपए|रु\.|रु|\/\-)/i;
    const matchSuffixDigits = clean.match(patternSuffixDigits);
    if (matchSuffixDigits && matchSuffixDigits[1]) {
      const amount = parseInt(matchSuffixDigits[1], 10);
      if (amount >= 50 && amount <= 100000 && amount !== 2024 && amount !== 2025 && amount !== 2026) {
        const unit: ExtractedPayout['unit'] = isHourly ? 'hour' : isDaily ? 'day' : isTask ? 'task' : (amount <= 350 ? 'hour' : 'task');
        return {
          amount,
          unit,
          isExplicit: true,
          displayText: `₹${amount}${isHourly ? ' / hr' : isDaily ? ' / day' : ''}`
        };
      }
    }

    // 8. Pattern 6: Full text scan for word numbers if wage keywords or currency words are present
    if (hasWageKeyword) {
      const fullWordScan = this.parseWordNumbers(clean);
      if (fullWordScan) {
        const amount = fullWordScan.amount;
        const unit: ExtractedPayout['unit'] = isHourly ? 'hour' : isDaily ? 'day' : isTask ? 'task' : (amount <= 350 ? 'hour' : 'task');
        return {
          amount,
          unit,
          isExplicit: true,
          displayText: `₹${amount}${isHourly ? ' / hr' : isDaily ? ' / day' : ''}`
        };
      }
    }

    // 9. Pattern 7: Standalone hundred/thousand word numbers (E.g. "ஐநூறு", "ஐந்தாறு", "ஆயிரம்", "five hundred", "पांच सौ")
    const standaloneWord = this.parseWordNumbers(clean);
    if (standaloneWord && (clean.includes('ரூபாய்') || clean.includes('ஊதியம்') || clean.includes('சம்பளம்') || clean.includes('கூலி') || clean.includes('ஜீதம்') || clean.includes('వేతనం') || clean.includes('वेतन') || clean.includes('सैलरी') || clean.includes('pay') || clean.includes('wage') || clean.includes('salary') || standaloneWord.amount >= 300)) {
      const amount = standaloneWord.amount;
      const unit: ExtractedPayout['unit'] = isHourly ? 'hour' : isDaily ? 'day' : isTask ? 'task' : (amount <= 350 ? 'hour' : 'task');
      return {
        amount,
        unit,
        isExplicit: true,
        displayText: `₹${amount}${isHourly ? ' / hr' : isDaily ? ' / day' : ''}`
      };
    }

    // 10. Preposition 'for' / 'at' + numeric amount: 'for 800', 'at 800'
    const patternForAt = /\b(?:for|at)\s+(?:₹|rs\.?|inr)?\s*(\d{2,5})(?:\s*(?:rupees|rs\.?|inr|\/\-))?\b/i;
    const matchForAt = lower.match(patternForAt);
    if (matchForAt && matchForAt[1]) {
      const amount = parseInt(matchForAt[1], 10);
      if (amount >= 100 && amount <= 100000 && amount !== 2024 && amount !== 2025 && amount !== 2026) {
        if (!/(am|pm|o'clock|hours|மணி)/i.test(lower)) {
          const unit: ExtractedPayout['unit'] = isHourly ? 'hour' : isDaily ? 'day' : isTask ? 'task' : (amount <= 350 ? 'hour' : 'task');
          return {
            amount,
            unit,
            isExplicit: true,
            displayText: `₹${amount}`
          };
        }
      }
    }

    // Not specified
    return {
      amount: null,
      unit: null,
      isExplicit: false,
      displayText: 'Not specified'
    };
  }

  /**
   * Extracts skills and assigns a clean category and title with semantic mapping and abbreviation resolution.
   * Works for AC (Air Conditioner), TV (Television), Fridge (Refrigerator), WM (Washing Machine), RO, etc.
   */
  private extractSkillsAndCategory(
    cleanText: string,
    lower: string,
    lang: Language
  ): { skills: string[]; category: string; suggestedTitle: string } {
    // 1. High-precision semantic concept & abbreviation matching (AC, TV, Fridge, WM, RO, EB, CCTV, etc.)
    const semanticMatch = matchSemanticConcept(cleanText, lang);
    if (semanticMatch && semanticMatch.matchScore >= 8) {
      const { concept } = semanticMatch;
      const skills = [...concept.canonicalSkills];

      // Specific sub-skill enhancements
      if (concept.id === 'air_conditioner' && (lower.includes('gas') || cleanText.includes('கேஸ்'))) {
        if (!skills.includes('AC Gas Filling')) skills.push('AC Gas Filling');
      }
      if (concept.id === 'plumbing_pipe' && (lower.includes('leak') || cleanText.includes('கசிவு') || cleanText.includes('லீகேஜ்') || cleanText.includes('लीकेज'))) {
        if (!skills.includes('Pipe Leakage Repair')) skills.push('Pipe Leakage Repair');
      }
      if (concept.id === 'painting_whitewash' && (lower.includes('primer') || lower.includes('putty'))) {
        if (!skills.includes('Primer Application')) skills.push('Primer Application');
      }
      if (concept.id === 'refrigerator' && (lower.includes('gas') || cleanText.includes('கேஸ்'))) {
        if (!skills.includes('Fridge Gas Filling')) skills.push('Fridge Gas Filling');
      }

      return {
        skills,
        category: concept.category,
        suggestedTitle: concept.titleGenerator(lang)
      };
    }

    // 2. Expanded text check on KNOWN_TRADES
    const expandedLower = expandAbbreviations(cleanText).toLowerCase();
    for (const trade of KNOWN_TRADES) {
      const isMatch = trade.keywords.some(kw => {
        const kwLower = kw.toLowerCase().trim();
        const isAscii = /^[a-z0-9\s/.-]+$/i.test(kwLower);
        if (isAscii) {
          const escaped = kwLower.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&');
          const reg = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i');
          return reg.test(lower) || reg.test(expandedLower);
        }
        return cleanText.includes(kw) || lower.includes(kwLower) || expandedLower.includes(kwLower);
      });

      if (isMatch) {
        const skills = [...trade.canonicalSkills];

        // Specific sub-skill enhancements
        if (trade.canonicalCategory === 'Plumbing' && (lower.includes('leak') || cleanText.includes('கசிவு') || cleanText.includes('லீகேஜ்') || cleanText.includes('लीकेज'))) {
          if (!skills.includes('Pipe Leakage Repair')) {
            skills.push('Pipe Leakage Repair');
          }
        }
        if (trade.canonicalCategory === 'Painting' && (lower.includes('primer') || lower.includes('interior') || lower.includes('exterior'))) {
          if (!skills.includes('Primer Application')) {
            skills.push('Primer Application');
          }
        }
        if (trade.canonicalCategory === 'Electrical' && (lower.includes('fuse') || lower.includes('switchboard') || lower.includes('inverter'))) {
          if (!skills.includes('Switchboard Repair')) {
            skills.push('Switchboard Repair');
          }
        }
        if (trade.canonicalCategory === 'Carpentry' && (lower.includes('furniture') || cleanText.includes('பர்னிச்சர்') || cleanText.includes('ఫర్నిచర్') || cleanText.includes('फर्नीचर'))) {
          if (!skills.includes('Furniture Repair')) {
            skills.push('Furniture Repair');
          }
        }

        return {
          skills,
          category: trade.canonicalCategory,
          suggestedTitle: trade.titleGenerator(trade.canonicalCategory, lang)
        };
      }
    }

    // 3. Generic skill match from ALL_SKILL_OPTIONS
    const matchedSkills: string[] = [];
    for (const opt of ALL_SKILL_OPTIONS) {
      if (lower.includes(opt.toLowerCase()) || expandedLower.includes(opt.toLowerCase())) {
        matchedSkills.push(opt);
      }
    }

    if (matchedSkills.length > 0) {
      return {
        skills: matchedSkills,
        category: matchedSkills[0],
        suggestedTitle: `${matchedSkills[0]} Needed`
      };
    }

    // 4. Fallback for new/unseen occupations
    const roleMatch = lower.match(/(?:need|looking for|require|wanted|hire)\s+(?:an?\s+)?([a-z\s]{3,20}?)(?:\s+(?:in|for|near|tomorrow|today|this|urgent)|\.|$)/i);
    const dynamicRole = roleMatch && roleMatch[1].trim() ? roleMatch[1].trim() : cleanText.split(' ').slice(0, 3).join(' ');
    const capitalizedRole = dynamicRole.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
      skills: [capitalizedRole],
      category: capitalizedRole,
      suggestedTitle: `${capitalizedRole} Needed`
    };
  }

  private getEmptyRequirement(): ExtractedJobRequirement {
    return {
      rawText: '',
      detectedLanguage: 'en',
      languageName: 'English',
      intent: 'hire_worker',
      title: 'Local Gig Helper Needed',
      category: 'General Work',
      skills: ['General Helper'],
      location: {
        city: null,
        district: null,
        landmark: null,
        isDetected: false,
        isNearMe: false,
        confidence: 0.0,
        displayText: 'Not specified'
      },
      experience: {
        level: 'Not Specified',
        years: null,
        isExplicit: false,
        description: 'Not specified'
      },
      availability: {
        slots: [],
        timingText: 'Not specified',
        isExplicit: false
      },
      payout: {
        amount: null,
        unit: null,
        isExplicit: false,
        displayText: 'Not specified'
      },
      confidence: 0.0,
      missingFields: []
    };
  }
}

export const nlpService = new NLPService();
