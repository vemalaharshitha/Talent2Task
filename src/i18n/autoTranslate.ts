import type { Language } from '../types/index.ts';

/**
 * Universal Any-to-Any Multilingual Auto-Translation Engine.
 * Seamlessly translates text between English, Tamil, Hindi, and Telugu
 * both locally & offline, and dynamically via online free translation memory.
 */

// Check if text contains any Indic script characters (Tamil, Telugu, Devanagari)
export const hasIndicCharacters = (text: string | undefined | null): boolean => {
  if (!text) return false;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if ((code >= 0x0900 && code <= 0x097f) || // Devanagari / Hindi
        (code >= 0x0b80 && code <= 0x0bff) || // Tamil
        (code >= 0x0c00 && code <= 0x0c7f)) { // Telugu
      return true;
    }
  }
  return false;
};

// Script-based Unicode Language Detection
export const detectLanguageFromScript = (text: string): Language => {
  if (!text || !text.trim()) return 'en';
  let tamilCount = 0;
  let teluguCount = 0;
  let devanagariCount = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x0b80 && code <= 0x0bff) tamilCount++;
    else if (code >= 0x0c00 && code <= 0x0c7f) teluguCount++;
    else if (code >= 0x0900 && code <= 0x097f) devanagariCount++;
  }

  // If no Indic characters are present, it is English/Latin script
  if (tamilCount === 0 && teluguCount === 0 && devanagariCount === 0) {
    return 'en';
  }

  // Otherwise, the dominant Indic script determines the language
  if (tamilCount >= teluguCount && tamilCount >= devanagariCount) return 'ta';
  if (teluguCount >= tamilCount && teluguCount >= devanagariCount) return 'te';
  if (devanagariCount >= tamilCount && devanagariCount >= teluguCount) return 'hi';
  return 'en';
};

// Comprehensive English-to-Tamil vocabulary dictionary
export const TA_VOCAB: Record<string, string> = {
  // Action & Matching Terms
  'needed': 'தேவைப்படுகிறது',
  'need': 'தேவை',
  'required': 'தேவைப்படுகிறது',
  'urgent': 'அவசர',
  'urgently': 'அவசரமாக',
  'immediate': 'உடனடி',
  'immediately': 'உடனடியாக',
  'looking for': 'தேடுகிறோம்',
  'wanted': 'தேவை',
  'available': 'கிடைக்கும்',
  'helper': 'உதவியாளர்',
  'assistant': 'உதவியாளர்',
  'worker': 'பணியாளர்',
  'hand': 'உதவியாளர்',
  'boy': 'ஊழியர்',
  'girl': 'ஊழியர்',
  'staff': 'ஊழியர்கள்',
  'person': 'நபர்',
  'people': 'ஆட்கள்',
  'skill match': 'திறன் பொருத்தம்',
  'match score': 'பொருத்த மதிப்பெண்',
  'matching skills': 'பொருந்திய திறன்கள்',
  'missing skills': 'தேவைப்படும் திறன்கள்',
  'skill gap': 'திறன் இடைவெளி',
  'recommended': 'பரிந்துரைக்கப்பட்டது',
  'recommendation': 'பரிந்துரை',
  'high demand': 'அதிக தேவை',
  'verified': 'சரிபார்க்கப்பட்டது',
  'claim': 'ஏற்றுக்கொள்',
  'claimed': 'ஏற்றுக்கொள்ளப்பட்டது',
  'open for claim': 'விண்ணப்பிக்கலாம்',
  'waiting for nearby seeker': 'அருகிலுள்ள பணியாளருக்காக காத்திருக்கிறது',

  // Driving & Logistics
  'driving': 'ஓட்டுநர் பணி',
  'driver': 'ஓட்டுநர்',
  'delivery': 'டெலிவரி',
  'delivery boy': 'டெலிவரி பாய்',
  'delivery rider': 'டெலிவரி ரைடர்',
  'rider': 'ரைடர்',
  'bike rider': 'பைக் ரைடர்',
  'two wheeler': 'இருசக்கர வாகனம்',
  'two-wheeler': 'இருசக்கர வாகனம்',
  'auto driving': 'ஆட்டோ ஓட்டுநர்',
  'car driving': 'கார் ஓட்டுநர்',
  'van driver': 'வேன் ஓட்டுநர்',
  'truck driver': 'லாரி ஓட்டுநர்',
  'courier delivery': 'கூரியர் டெலிவரி',
  'food delivery': 'உணவு டெலிவரி',
  'grocery delivery': 'மளிகை டெலிவரி',
  'route knowledge': 'வழி அறிவு',
  'driving license': 'ஓட்டுநர் உரிமம்',
  'loading & unloading': 'சரக்கு ஏற்றுதல் மற்றும் இறக்குதல்',
  'loading': 'சரக்கு ஏற்றுதல்',
  'unloading': 'சரக்கு இறக்குதல்',
  'parcel sorter': 'பார்சல் வரிசைப்படுத்துபவர்',
  'parcel': 'பார்சல்',
  'dispatcher': 'ஏற்று அனுப்புபவர்',
  'warehouse': 'கிடங்கு',
  'pallet handling': 'பொருட்கள் கையாளுதல்',
  'heavy lifting': 'பளு தூக்குதல்',

  // Retail, Store & Billing
  'store helper': 'கடை உதவியாளர்',
  'store': 'கடை',
  'shop': 'கடை',
  'retail': 'சில்லறை விற்பனை',
  'supermarket': 'சூப்பர் மார்க்கெட்',
  'billing': 'பில்லிங்',
  'cashier & billing': 'பணப்பரிவர்த்தனை & பில்லிங்',
  'cashier': 'பணப்பரிவர்த்தனையாளர்',
  'inventory': 'சரக்கு மேலாண்மை',
  'stock management': 'சரக்கு மேலாண்மை',
  'stock': 'சரக்கு',
  'barcode scanning': 'பார்கோடு ஸ்கேனிங்',
  'shelf restocking': 'அலமாரி அடுக்குதல்',
  'restocking': 'அடுக்குதல்',
  'packing & restocking': 'பேக்கிங் மற்றும் அடுக்குதல்',
  'packing': 'பேக்கிங்',
  'packaging': 'பொட்டலமிடுதல்',
  'counter sales': 'விற்பனை கவுண்டர்',
  'weighing & labeling': 'எடை மற்றும் லேபிளிடுதல்',
  'customer service': 'வாடிக்கையாளர் சேவை',
  'customer handling': 'வாடிக்கையாளர் மேலாண்மை',

  // Office & Digital Skills
  'data entry': 'தரவு உள்ளீடு',
  'computer basics': 'கணினி அடிப்படைகள்',
  'basic accounts': 'அடிப்படை கணக்குகள்',
  'computer': 'கணினி',
  'typing': 'தட்டச்சு',
  'ms excel': 'எம்.எஸ் எக்செல்',
  'excel': 'எக்செல்',
  'spreadsheet': 'விரிதாள்',
  'smartphone proficient': 'ஸ்மார்ட்போன் பயன்பாடு',
  'internet browsing': 'இணைய பயன்பாடு',
  'tally erp': 'டேலி ஈஆர்பி',
  'invoice generation': 'ரசீது தயாரித்தல்',
  'document filing': 'ஆவணக் கோப்பு',
  'office assistant': 'அலுவலக உதவியாளர்',
  'office': 'அலுவலகம்',

  // Trades, Maintenance & Construction
  'electrician basics': 'மின்சார பணி அடிப்படைகள்',
  'electrician': 'எலக்ட்ரீசியன்',
  'electrical': 'மின்சார பணி',
  'wiring & switchboard': 'வயரிங் மற்றும் சுவிட்ச்போர்டு',
  'wiring': 'வயரிங்',
  'switchboard': 'சுவிட்ச்போர்டு',
  'switch board': 'சுவிட்ச்போர்டு',
  'plumbing & pipe repair': 'பிளம்பிங் மற்றும் குழாய் பழுதுபார்ப்பு',
  'plumbing': 'பிளம்பிங்',
  'plumber': 'பிளம்பர்',
  'pipe repair': 'குழாய் பழுதுபார்ப்பு',
  'pipe leakage': 'குழாய் கசிவு',
  'leakage': 'கசிவு',
  'pipe fitting': 'குழாய் பொருத்துதல்',
  'sanitary fittings': 'சானிட்டரி பொருத்துதல்',
  'carpentry': 'தச்சு பணி',
  'carpenter': 'தச்சர்',
  'woodwork': 'மர வேலை',
  'furniture repair': 'மரச்சாமான்கள் பழுதுபார்ப்பு',
  'ac maintenance': 'ஏசி பராமரிப்பு',
  'ac repair': 'ஏசி பழுதுபார்ப்பு',
  'ac technician': 'ஏசி மெக்கானிக்',
  'air conditioner': 'குளிர்சாதன பெட்டி',
  'refrigerator repair': 'பிரிட்ஜ் பழுதுபார்ப்பு',
  'washing machine': 'வாஷிங் மெஷின்',
  'appliance servicing': 'சாதன பழுதுபார்ப்பு',
  'welding': 'வெல்டிங்',
  'welder': 'வெல்டர்',
  'metal fabrication': 'இரும்பு வேலை',
  'painting & whitewashing': 'வர்ணம் பூசுதல்',
  'painting': 'வர்ணம் பூசுதல்',
  'painter': 'வர்ணம் பூசுபவர்',
  'masonry': 'கொத்தனார் பணி',
  'mason': 'கொத்தனார்',
  'construction': 'கட்டுமான பணி',
  'tile laying': 'டைல்ஸ் பதித்தல்',
  'cctv installation': 'சிசிடிவி பொருத்துதல்',
  'mobile repair': 'மொபைல் பழுதுபார்ப்பு',
  'tailoring': 'தையல் கலை',
  'tailor': 'தையல்காரர்',
  'stitching': 'தையல் வேலை',
  'mechanic': 'மெக்கானிக்',

  // Food, Kitchen & Hospitality
  'cooking / catering': 'சமையல் மற்றும் கேட்டரிங்',
  'cooking': 'சமையல் பணி',
  'catering': 'கேட்டரிங்',
  'cook': 'சமையல்காரர்',
  'kitchen helper': 'சமையலறை உதவியாளர்',
  'kitchen': 'சமையலறை',
  'food serving': 'உணவு பரிமாறுதல்',
  'server': 'உணவு பரிமாறுபவர்',
  'food': 'உணவு',
  'vegetable cutting': 'காய்கறி நறுக்குதல்',
  'dishwashing': 'பாத்திரம் கழுவுதல்',
  'tea & coffee maker': 'டீ & காபி தயாரிப்பாளர்',
  'bakery assistant': 'பேக்கரி உதவியாளர்',
  'fast food cook': 'துரித உணவு சமையல்காரர்',

  // Healthcare & Caregiving
  'patient helper': 'நோயாளி உதவியாளர்',
  'patient': 'நோயாளி',
  'hospital ward assistant': 'மருத்துவமனை வார்டு உதவியாளர்',
  'hospital': 'மருத்துவமனை',
  'clinic': 'மருத்துவமனை',
  'opd guide': 'புறநோயாளி வழிகாட்டி',
  'opd': 'புறநோயாளி பகுதி',
  'guide': 'வழிகாட்டி',
  'queue coordinator': 'வரிசை ஒருங்கிணைப்பாளர்',
  'queue': 'வரிசை',
  'elderly care': 'முதியோர் பராமரிப்பு',
  'childcare': 'குழந்தை பராமரிப்பு',
  'wheelchair assistance': 'வீல்சேர் உதவி',
  'first aid': 'முதலுதவி',
  'medicine delivery': 'மருந்து டெலிவரி',

  // Cleaning, Facilities & Security
  'cleaning & housekeeping': 'சுத்தம் செய்தல் மற்றும் வீட்டுப் பராமரிப்பு',
  'cleaning': 'சுத்தம் செய்தல்',
  'housekeeping': 'வீட்டுப் பராமரிப்பு',
  'floor mopping': 'தரை துடைத்தல்',
  'restroom sanitation': 'கழிவறை சுத்தம்',
  'waste segregation': 'குப்பை பிரித்தல்',
  'gardening': 'தோட்டக்கலை',
  'gardener': 'தோட்டக்காரர்',
  'security guard': 'பாதுகாப்பு காவலர்',
  'security': 'பாதுகாப்பு',
  'guard': 'காவலர்',
  'night watchman': 'இரவு காவலாளி',
  'gatekeeper': 'வாயில் காப்பாளர்',

  // Events, Media & Arts
  'event setup': 'நிகழ்வு அமைப்பு',
  'event': 'நிகழ்வு',
  'setup': 'அமைப்பு',
  'pamphlet distribution': 'துண்டுப் பிரசுரம் விநியோகம்',
  'stage decoration': 'மேடை அலங்காரம்',
  'stage': 'மேடை',
  'sound & audio': 'ஒலி அமைப்பு',
  'sound': 'ஒலி அமைப்பு',
  'lighting assistant': 'ஒளி அமைப்பு உதவியாளர்',
  'music': 'இசை',
  'musician': 'இசைக்கலைஞர்',
  'crowd management': 'கூட்ட நெரிசல் மேலாண்மை',
  'stall helper': 'அரங்கு உதவியாளர்',
  'stall': 'அரங்கு',
  'exhibition': 'கண்காட்சி',
  'tutoring': 'பயிற்றுவிப்பு',
  'tutor': 'ஆசிரியர்',
  'teacher': 'ஆசிரியர்',

  // Experience, Qualifications & Attributes
  'years of experience': 'வருட அனுபவம்',
  'years experience': 'வருட அனுபவம்',
  'year experience': 'வருட அனுபவம்',
  'experienced': 'அனுபவமுள்ள',
  'experience': 'அனுபவம்',
  'fresher': 'புதியவர்',
  'entry level': 'தொடக்க நிலை',
  'expert': 'நிபுணர்',
  'years': 'வருடங்கள்',
  'year': 'வருடம்',
  'months': 'மாதங்கள்',

  // Soft Skills & Languages
  'tamil speaking': 'தமிழ் பேசுதல்',
  'english speaking': 'ஆங்கிலம் பேசுதல்',
  'hindi speaking': 'ஹிந்தி பேசுதல்',
  'telugu speaking': 'தெலுங்கு பேசுதல்',
  'physically active': 'உடல் தகுதி & சுறுசுறுப்பு',
  'punctual': 'நேரம் தவறாமை',
  'hardworking': 'கடின உழைப்பு',
  'fast learner': 'விரைவாகக் கற்றுக்கொள்பவர்',
  'reliable': 'நம்பகமான',
  'polite': 'கண்ணியமான',
  'team worker': 'குழுப் பணியாளர்',

  // Times, Locations, Pricing & General Grammar
  'morning': 'காலை',
  'early morning': 'அதிகாலை',
  'afternoon': 'மதியம்',
  'evening': 'மாலை',
  'night': 'இரவு',
  'weekend': 'வார இறுதி',
  'daily': 'தினசரி',
  'tomorrow': 'நாளை',
  'today': 'இன்று',
  'shift': 'ஷிஃப்ட்',
  'task': 'பணி',
  'work': 'பணி',
  'job': 'வேலை',
  'gig': 'வேலை',
  'hours': 'மணிநேரம்',
  'hour': 'மணி',
  'day': 'நாள்',
  'near me': 'எனக்கு அருகில்',
  'nearby': 'அருகில்',
  'near': 'அருகில்',
  'for': 'க்கான',
  'in': 'இல்',
  'at': 'இல்',
  'and': '&',
  'with': 'உடன்',
  'budget': 'பட்ஜெட்',
  'pay': 'ஊதியம்',
  'payout': 'ஊதியம்',
  'rupees': 'ரூபாய்',
  'rs': 'ரூ',
  'rs.': 'ரூ.'
};

// Comprehensive English-to-Hindi vocabulary dictionary
export const HI_VOCAB: Record<string, string> = {
  // Action & Matching Terms
  'needed': 'की आवश्यकता है',
  'need': 'आवश्यकता है',
  'required': 'की आवश्यकता है',
  'urgent': 'तत्काल',
  'urgently': 'तुरंत',
  'immediate': 'तत्काल',
  'immediately': 'तुरंत',
  'looking for': 'तलाश है',
  'wanted': 'चाहिए',
  'available': 'उपलब्ध',
  'helper': 'सहायक',
  'assistant': 'सहायक',
  'worker': 'कर्मचारी',
  'hand': 'सहायक',
  'staff': 'कर्मचारी',
  'person': 'व्यक्ति',
  'skill match': 'कौशल मिलान',
  'match score': 'मिलान स्कोर',
  'matching skills': 'मिलते-जुलते कौशल',
  'missing skills': 'अपेक्षित कौशल',
  'skill gap': 'कौशल अंतर',
  'recommended': 'अनुशंसित',
  'recommendation': 'सिफारिश',
  'high demand': 'उच्च मांग',
  'verified': 'सत्यापित',
  'claim': 'स्वीकार करें',
  'claimed': 'स्वीकृत',
  'open for claim': 'आवेदन के लिए खुला',

  // Driving & Logistics
  'driving': 'ड्राइविंग',
  'driver': 'ड्राइवर',
  'delivery': 'डिलीवरी',
  'delivery boy': 'डिलीवरी बॉय',
  'delivery rider': 'डिलीवरी राइडर',
  'rider': 'राइडर',
  'bike rider': 'बाइक राइडर',
  'two wheeler': 'दोपहिया वाहन',
  'auto driving': 'ऑटो ड्राइविंग',
  'car driving': 'कार ड्राइविंग',
  'courier delivery': 'कूरियर डिलीवरी',
  'food delivery': 'फूड डिलीवरी',
  'grocery delivery': 'किराना डिलीवरी',
  'loading & unloading': 'लोडिंग और अनलोडिंग',
  'loading': 'लोडिंग',
  'unloading': 'अनलोडिंग',
  'parcel sorter': 'पार्सल छंटाई',
  'parcel': 'पार्सल',
  'warehouse': 'गोदाम',
  'heavy lifting': 'वजन उठाना',

  // Retail, Store & Billing
  'store helper': 'दुकान सहायक',
  'store': 'दुकान',
  'shop': 'दुकान',
  'retail': 'खुदरा बिक्री',
  'supermarket': 'सुपरमार्केट',
  'billing': 'बिलिंग',
  'cashier & billing': 'कैशियर और बिलिंग',
  'cashier': 'कैशियर',
  'inventory': 'स्टॉक प्रबंधन',
  'stock management': 'स्टॉक प्रबंधन',
  'stock': 'स्टॉक',
  'barcode scanning': 'बारकोड स्कैनिंग',
  'shelf restocking': 'शेल्फ स्टॉकिंग',
  'packing & restocking': 'पैकिंग और रीस्टॉकिंग',
  'packing': 'पैकिंग',
  'customer service': 'ग्राहक सेवा',

  // Office & Digital Skills
  'data entry': 'डेटा एंट्री',
  'computer basics': 'कंप्यूटर बेसिक',
  'basic accounts': 'बुनियादी लेखा',
  'computer': 'कंप्यूटर',
  'typing': 'टाइपिंग',
  'ms excel': 'एमएस एक्सेल',
  'excel': 'एक्सेल',
  'smartphone proficient': 'स्मार्टफोन में निपुण',
  'tally erp': 'टैली ईआरपी',
  'office assistant': 'कार्यालय सहायक',
  'office': 'कार्यालय',

  // Trades, Maintenance & Construction
  'electrician basics': 'इलेक्ट्रीशियन कार्य',
  'electrician': 'इलेक्ट्रीशियन',
  'electrical': 'इलेक्ट्रिकल',
  'wiring': 'वायरिंग',
  'switchboard': 'स्विचबोर्ड',
  'plumbing & pipe repair': 'प्लंबिंग और पाइप मरम्मत',
  'plumbing': 'प्लंबिंग',
  'plumber': 'प्लंबर',
  'pipe repair': 'पाइप मरम्मत',
  'pipe leakage': 'पाइप लीकेज',
  'leakage': 'लीकेज',
  'carpentry': 'बढ़ई का काम',
  'carpenter': 'बढ़ई',
  'woodwork': 'लकड़ी का काम',
  'furniture repair': 'फर्नीचर मरम्मत',
  'ac maintenance': 'एसी मरम्मत',
  'ac repair': 'एसी रिपेयर',
  'ac technician': 'एसी मैकेनिक',
  'welding': 'वेल्डिंग',
  'painting': 'पेंटिंग',
  'painter': 'पेंटर',
  'masonry': 'राजमिस्त्री का काम',
  'mason': 'राजमिस्त्री',
  'cctv installation': 'सीसीटीवी इंस्टालेशन',
  'tailoring': 'सिलाई',
  'tailor': 'दर्जी',

  // Food, Kitchen & Hospitality
  'cooking / catering': 'खाना बनाना / कैटरिंग',
  'cooking': 'खाना बनाना',
  'catering': 'कैटरिंग',
  'cook': 'रसोइया',
  'kitchen helper': 'रसोई सहायक',
  'kitchen': 'रसोई',
  'food serving': 'खाना परोसना',
  'food': 'भोजन',

  // Healthcare & Caregiving
  'patient helper': 'रोगी सहायक',
  'patient': 'रोगी',
  'hospital': 'अस्पताल',
  'opd guide': 'ओपीडी गाइड',
  'elderly care': 'बुजुर्गों की देखभाल',

  // Cleaning, Facilities & Security
  'cleaning & housekeeping': 'सफाई और हाउसकीपिंग',
  'cleaning': 'सफाई',
  'housekeeping': 'हाउसकीपिंग',
  'gardening': 'बागवानी',
  'security guard': 'सुरक्षा गार्ड',
  'security': 'सुरक्षा',
  'guard': 'गार्ड',

  // Events, Media & Arts
  'event setup': 'इवेंट सेटअप',
  'event': 'इवेंट',
  'pamphlet distribution': 'पंपलेट वितरण',
  'music': 'संगीत',
  'musician': 'संगीतकार',
  'tutoring': 'ट्यूशन',
  'tutor': 'ट्यूटर',
  'teacher': 'शिक्षक',

  // Experience, Qualifications & Attributes
  'years of experience': 'साल का अनुभव',
  'years experience': 'साल का अनुभव',
  'year experience': 'साल का अनुभव',
  'experienced': 'अनुभवी',
  'experience': 'अनुभव',
  'years': 'साल',
  'year': 'साल',

  // Soft Skills & Languages
  'tamil speaking': 'तमिल बोलना',
  'english speaking': 'अंग्रेज़ी बोलना',
  'hindi speaking': 'हिन्दी बोलना',
  'telugu speaking': 'तेलुगू बोलना',
  'physically active': 'शारीरिक रूप से सक्रिय',
  'punctual': 'समयनिष्ठ',
  'reliable': 'विश्वसनीय',

  // Times, Locations, Pricing & General Grammar
  'morning': 'सुबह',
  'early morning': 'सुबह जल्दी',
  'afternoon': 'दोपहर',
  'evening': 'शाम',
  'night': 'रात',
  'weekend': 'सप्ताहांत',
  'tomorrow': 'कल',
  'today': 'आज',
  'shift': 'शिफ्ट',
  'task': 'कार्य',
  'work': 'कार्य',
  'job': 'काम',
  'gig': 'गिग',
  'hour': 'घंटा',
  'hours': 'घंटे',
  'day': 'दिन',
  'near me': 'मेरे पास',
  'nearby': 'के पास',
  'near': 'के पास',
  'for': 'के लिए',
  'in': 'में',
  'at': 'पर',
  'and': 'और',
  'with': 'के साथ',
  'rupees': 'रुपये',
  'rs': 'रु',
  'rs.': 'रु.'
};

// Comprehensive English-to-Telugu vocabulary dictionary
export const TE_VOCAB: Record<string, string> = {
  // Action & Matching Terms
  'needed': 'అవసరం',
  'need': 'అవసరం',
  'required': 'అవసరం',
  'urgent': 'అత్యవసరం',
  'urgently': 'అత్యవసరంగా',
  'immediate': 'తక్షణమే',
  'immediately': 'తక్షణమే',
  'looking for': 'వెతుకుతున్నాము',
  'wanted': 'కావాలి',
  'available': 'అందుబాటులో ఉంది',
  'helper': 'సహాయకుడు',
  'assistant': 'సహాయకుడు',
  'worker': 'కార్మికుడు',
  'hand': 'సహాయకుడు',
  'staff': 'సిబ్బంది',
  'person': 'వ్యక్తి',
  'skill match': 'నైపుణ్య సరిపోలిక',
  'match score': 'మ్యాచ్ స్కోరు',
  'matching skills': 'సరిపోలిన నైపుణ్యాలు',
  'missing skills': 'అవసరమైన నైపుణ్యాలు',
  'skill gap': 'నైపుణ్య లోపం',
  'recommended': 'సిఫార్సు చేయబడింది',
  'recommendation': 'సిఫార్సు',
  'high demand': 'అధిక డిమాండ్',
  'verified': 'ధృవీకరించబడింది',
  'claim': 'స్వీకరించు',
  'claimed': 'స్వీకరించబడింది',
  'open for claim': 'దరఖాస్తుకు సిద్ధం',

  // Driving & Logistics
  'driving': 'డ్రైవింగ్',
  'driver': 'డ్రైవర్',
  'delivery': 'డెలివరీ',
  'delivery boy': 'డెలివరీ బాయ్',
  'delivery rider': 'డెలివరీ రైడర్',
  'rider': 'రైడర్',
  'bike rider': 'బైక్ రైడర్',
  'two wheeler': 'ద్విచక్ర వాహనం',
  'auto driving': 'ఆటో డ్రైవింగ్',
  'car driving': 'కార్ డ్రైవింగ్',
  'courier delivery': 'కొరియర్ డెలివరీ',
  'food delivery': 'ఫుడ్ డెలివరీ',
  'grocery delivery': 'కిరాణా డెలివరీ',
  'loading & unloading': 'లోడింగ్ & అన్‌లోడింగ్',
  'loading': 'లోడింగ్',
  'unloading': 'అన్‌లోడింగ్',
  'parcel sorter': 'పార్సెల్ క్రమబద్ధీకరణ',
  'parcel': 'పార్సెల్',
  'warehouse': 'గిడ్డంగి',
  'heavy lifting': 'బరువులు ఎత్తడం',

  // Retail, Store & Billing
  'store helper': 'షాప్ సహాయకుడు',
  'store': 'స్టోర్',
  'shop': 'షాప్',
  'retail': 'రిటైల్ అమ్మకాలు',
  'supermarket': 'సూపర్‌మార్కెట్',
  'billing': 'బిల్లింగ్',
  'cashier & billing': 'క్యాషియర్ & బిల్లింగ్',
  'cashier': 'క్యాషియర్',
  'inventory': 'స్టాక్ నిర్వహణ',
  'stock management': 'స్టాక్ నిర్వహణ',
  'stock': 'స్టాక్',
  'barcode scanning': 'బార్‌కోడ్ స్కానింగ్',
  'shelf restocking': 'షెల్ఫ్ స్టాకింగ్',
  'packing & restocking': 'ప్యాకింగ్ & రీస్టాకింగ్',
  'packing': 'ప్యాకింగ్',
  'customer service': 'కస్టమర్ సర్వీస్',

  // Office & Digital Skills
  'data entry': 'డేటా ఎంట్రీ',
  'computer basics': 'కంప్యూటర్ బేసిక్స్',
  'basic accounts': 'ప్రాథమిక లెక్కలు',
  'computer': 'కంప్యూటర్',
  'typing': 'టైపింగ్',
  'ms excel': 'ఎంఎస్ ఎక్సెల్',
  'excel': 'ఎక్సెల్',
  'smartphone proficient': 'స్మార్ట్‌ఫోన్ నైపుణ్యం',
  'tally erp': 'ట్యాలీ ఈఆర్‌పీ',
  'office assistant': 'ఆఫీస్ అసిస్టెంట్',
  'office': 'కార్యాలయం',

  // Trades, Maintenance & Construction
  'electrician basics': 'ఎలక్ట్రీషియన్ బేసిక్స్',
  'electrician': 'ఎలక్ట్రీషియన్',
  'electrical': 'ఎలక్ట్రికల్',
  'wiring': 'వైరింగ్',
  'switchboard': 'స్విచ్ బోర్డ్',
  'plumbing & pipe repair': 'ప్లంబింగ్ మరియు పైప్ రిపేర్',
  'plumbing': 'ప్లంబింగ్',
  'plumber': 'ప్లంబర్',
  'pipe repair': 'పైప్ రిపేర్',
  'pipe leakage': 'పైప్ లీకేజీ',
  'leakage': 'లీకేజీ',
  'carpentry': 'వడ్రంగి పని',
  'carpenter': 'వడ్రంగి',
  'woodwork': 'చెక్క పని',
  'furniture repair': 'ఫర్నిచర్ మరమ్మతు',
  'ac maintenance': 'ఏసీ నిర్వహణ',
  'ac repair': 'ఏసీ రిపేర్',
  'ac technician': 'ఏసీ టెక్నీషియన్',
  'welding': 'వెల్డింగ్',
  'painting': 'పెయింటింగ్',
  'painter': 'పెయింటర్',
  'masonry': 'తాపీ పని',
  'mason': 'తాపీ మేస్త్రీ',
  'cctv installation': 'సీసీటీవీ ఇన్‌స్టాలేషన్',
  'tailoring': 'టైలరింగ్',
  'tailor': 'దర్జీ',

  // Food, Kitchen & Hospitality
  'cooking / catering': 'వంట / క్యాటరింగ్',
  'cooking': 'వంట పని',
  'catering': 'క్యాటరింగ్',
  'cook': 'వంట మనిషి',
  'kitchen helper': 'కిచెన్ హెల్పర్',
  'kitchen': 'వంటగది',
  'food serving': 'ఆహారం వడ్డించడం',
  'food': 'ఆహారం',

  // Healthcare & Caregiving
  'patient helper': 'రోగి సహాయకుడు',
  'patient': 'రోగి',
  'hospital': 'ఆసుపత్రి',
  'opd guide': 'ఓపీడీ గైడ్',
  'elderly care': 'వృద్ధుల సంరక్షణ',

  // Cleaning, Facilities & Security
  'cleaning & housekeeping': 'శుభ్రపరచడం & ఇంటి నిర్వహణ',
  'cleaning': 'శుభ్రపరచడం',
  'housekeeping': 'ఇంటి నిర్వహణ',
  'gardening': 'తోటపని',
  'security guard': 'సెక్యూరిటీ గార్డ్',
  'security': 'సెక్యూరిటీ',
  'guard': 'గార్డ్',

  // Events, Media & Arts
  'event setup': 'ఈవెంట్ సెటప్',
  'event': 'ఈవెంట్',
  'pamphlet distribution': 'కరపత్రాల పంపిణీ',
  'music': 'సంగీతం',
  'musician': 'సంగీతకారుడు',
  'tutoring': 'ట్యూషన్',
  'tutor': 'ట్యూటర్',
  'teacher': 'ఉపాధ్యాయుడు',

  // Experience, Qualifications & Attributes
  'years of experience': 'సంవత్సరాల అనుభవం',
  'years experience': 'సంవత్సరాల అనుభవం',
  'year experience': 'సంవత్సరాల అనుభవం',
  'experienced': 'అనుభవం ఉన్న',
  'experience': 'అనుభవం',
  'years': 'సంవత్సరాలు',
  'year': 'సంవత్సరం',

  // Soft Skills & Languages
  'tamil speaking': 'తమిళం మాట్లాడటం',
  'english speaking': 'ఆంగ్లం మాట్లాడటం',
  'hindi speaking': 'హిందీ మాట్లాడటం',
  'telugu speaking': 'తెలుగు మాట్లాడటం',
  'physically active': 'శారీరకంగా చురుకైన',
  'punctual': 'సమయపాలన',
  'reliable': 'నమ్మకమైన',

  // Times, Locations, Pricing & General Grammar
  'morning': 'ఉదయం',
  'early morning': 'తెల్లవారుజామున',
  'afternoon': 'మధ్యాహ్నం',
  'evening': 'సాయంత్రం',
  'night': 'రాత్రి',
  'weekend': 'వారాంతం',
  'tomorrow': 'రేపు',
  'today': 'ఈరోజు',
  'shift': 'షిఫ్ట్',
  'task': 'పని',
  'work': 'పని',
  'job': 'పని',
  'gig': 'గిగ్',
  'hour': 'గంట',
  'hours': 'గంటలు',
  'day': 'రోజు',
  'near me': 'నా దగ్గర',
  'nearby': 'సమీపంలో',
  'near': 'సమీపంలో',
  'for': 'కోసం',
  'in': 'లో',
  'at': 'వద్ద',
  'and': '&',
  'with': 'తో',
  'rupees': 'రూపాయలు',
  'rs': 'రూ',
  'rs.': 'రూ.'
};

// Build reverse dictionaries (Target -> English) automatically
const buildReverseMap = (dict: Record<string, string>): [string, string][] => {
  const pairs: [string, string][] = [];
  for (const [en, target] of Object.entries(dict)) {
    if (target && target.trim()) {
      pairs.push([target.trim(), en.trim()]);
    }
  }
  // Sort reverse dictionary by phrase length descending
  return pairs.sort((a, b) => b[0].length - a[0].length);
};

const TA_TO_EN = buildReverseMap(TA_VOCAB);
const HI_TO_EN = buildReverseMap(HI_VOCAB);
const TE_TO_EN = buildReverseMap(TE_VOCAB);

// Additional conversational phrases mapping directly across non-English languages
const CONVERSATIONAL_MAPS: Record<string, { en: string; ta: string; hi: string; te: string }> = {
  'plumber_needed': {
    en: 'Plumber Needed',
    ta: 'பிளம்பர் தேவை',
    hi: 'प्लंबर की आवश्यकता है',
    te: 'ప్లంబర్ అవసరం'
  },
  'electrician_needed': {
    en: 'Electrician Needed',
    ta: 'எலக்ட்ரீசியன் தேவை',
    hi: 'इलेक्ट्रीशियन की आवश्यकता है',
    te: 'ఎలక్ట్రీషియన్ అవసరం'
  },
  'delivery_boy_needed': {
    en: 'Delivery Rider Needed',
    ta: 'டெலிவரி ரைடர் தேவை',
    hi: 'डिलीवरी राइडर चाहिए',
    te: 'డెలివరీ బాయ్ అవసరం'
  },
  'store_helper_needed': {
    en: 'Store Helper Needed',
    ta: 'கடை உதவியாளர் தேவை',
    hi: 'दुकान सहायक चाहिए',
    te: 'స్టోర్ హెల్పర్ అవసరం'
  },
  'cook_needed': {
    en: 'Cook / Kitchen Helper Needed',
    ta: 'சமையல் / சமையலறை உதவியாளர் தேவை',
    hi: 'रसोइया / रसोई सहायक चाहिए',
    te: 'వంట మనిషి / కిచెన్ హెల్పర్ అవసరం'
  },
  'security_guard_needed': {
    en: 'Security Guard Needed',
    ta: 'பாதுகாப்பு காவலர் தேவை',
    hi: 'सुरक्षा गार्ड चाहिए',
    te: 'సెక్యూరిటీ గార్డ్ అవసరం'
  },
  'housekeeping_needed': {
    en: 'Housekeeping & Cleaning Staff Needed',
    ta: 'சுத்தம் மற்றும் வீட்டுப் பராமரிப்பாளர் தேவை',
    hi: 'सफाई और हाउसकीपिंग स्टाफ चाहिए',
    te: 'హౌస్‌కీపింగ్ & క్లీనింగ్ సిబ్బంది అవసరం'
  },
  'tailor_needed': {
    en: 'Tailor & Stitching Worker Needed',
    ta: 'தையல்காரர் தேவை',
    hi: 'दर्जी की आवश्यकता है',
    te: 'దర్జీ / టైలర్ అవసరం'
  },
  'painter_needed': {
    en: 'Painter Needed',
    ta: 'பெயிண்டர் தேவை',
    hi: 'पेंटर की आवश्यकता है',
    te: 'పెయింటర్ అవసరం'
  },
  'carpenter_needed': {
    en: 'Carpenter Needed',
    ta: 'தச்சர் தேவை',
    hi: 'बढ़ई की आवश्यकता है',
    te: 'వడ్రంగి అవసరం'
  }
};

// Local storage translation memory cache for dynamic translations
const TRANSLATION_CACHE_KEY = 'talent2task_dynamic_translations_v2';

const getCache = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(TRANSLATION_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const setCacheEntry = (key: string, value: string) => {
  try {
    const cache = getCache();
    cache[key] = value;
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch { }
};

/**
 * Intelligent Multi-Sentence Job Parser & Synthesizer.
 * Decomposes conversational user gig descriptions (e.g., in Telugu, Tamil, Hindi, or English)
 * and synthesizes fluent, natural sentences in the target language.
 */
const synthesizeJobDescription = (text: string, _srcLang: Language, targetLang: Language): string | null => {
  const lower = text.toLowerCase();

  // 1. Detect Category / Role
  let role = '';
  if (lower.includes('ప్లంబర్') || lower.includes('பிளம்பர்') || lower.includes('प्लंबर') || lower.includes('plumb')) role = 'Plumber';
  else if (lower.includes('ఎలక్ట్రీషియన్') || lower.includes('எலக்ட்ரீசியன்') || lower.includes('इलेक्ट्रीशियन') || lower.includes('electric')) role = 'Electrician';
  else if (lower.includes('డెలివరీ') || lower.includes('டெலிவரி') || lower.includes('डिलीवरी') || lower.includes('delivery')) role = 'Delivery Rider';
  else if (lower.includes('స్టోర్') || lower.includes('షాప్') || lower.includes('கடை') || lower.includes('दुकान') || lower.includes('store')) role = 'Store Helper';
  else if (lower.includes('వంట') || lower.includes('క్యాటరింగ్') || lower.includes('சமையல்') || lower.includes('கேட்டரிங்') || lower.includes('रसोइया') || lower.includes('खाना') || lower.includes('cook')) role = 'Cook / Catering';
  else if (lower.includes('సెక్యూరిటీ') || lower.includes('గార్డ్') || lower.includes('பாதுகாப்பு') || lower.includes('सुरक्षा') || lower.includes('security')) role = 'Security Guard';
  else if (lower.includes('శుభ్రపరచడం') || lower.includes('సుబ్భర') || lower.includes('சுத்தம்') || lower.includes('सफाई') || lower.includes('clean') || lower.includes('housekeep')) role = 'Housekeeping';
  else if (lower.includes('పెయింటర్') || lower.includes('பெயிண்டர்') || lower.includes('पेंटर') || lower.includes('paint')) role = 'Painter';
  else if (lower.includes('వడ్రంగి') || lower.includes('தச்சர்') || lower.includes('बढ़ई') || lower.includes('carpent')) role = 'Carpenter';
  else if (lower.includes('దర్జీ') || lower.includes('టైలర్') || lower.includes('தையல்') || lower.includes('दर्जी') || lower.includes('tailor')) role = 'Tailor';
  else if (lower.includes('తాపీ') || lower.includes('మేస్త్రీ') || lower.includes('கொத்தனார்') || lower.includes('राजमिस्त्री') || lower.includes('mason')) role = 'Mason';
  else if (lower.includes('ఏసీ') || lower.includes('ஏசி') || lower.includes('एसी') || lower.includes('ac ')) role = 'AC Technician';

  if (!role) return null;

  // If no sentence attributes (experience, timing, proximity, amount) are present, let phrase dictionary handle it
  const hasSentenceAttributes = (
    text.match(/(\d+)\s*(సంవత్సరాల|సంవత్సరాలు|வருட|வருஷம்|ஆண்டு|ஆண்டுகள்|साल|वर्ष|years?|yrs?)/i) ||
    lower.includes('మధ్యాహ్నం') || lower.includes('மதியம்') || lower.includes('दोपहर') || lower.includes('afternoon') ||
    lower.includes('ఉదయం') || lower.includes('காலை') || lower.includes('सुबह') || lower.includes('morning') ||
    lower.includes('సాయంత్రం') || lower.includes('மாலை') || lower.includes('शाम') || lower.includes('evening') ||
    lower.includes('రాత్రి') || lower.includes('இரவு') || lower.includes('रात') || lower.includes('night') ||
    lower.includes('నా దగ్గర') || lower.includes('నా సమీపంలో') || lower.includes('எனக்கு அருகில்') || lower.includes('அருகில்') || lower.includes('मेरे पास') || lower.includes('near me') ||
    text.match(/(?:rs\.?|inr|₹|రూ\.?|ரூ\.?|रु\.?)\s*(\d+)/i) ||
    text.match(/(\d+)\s*(?:రూపాయలు|ரூபாய்|रुपये|rupees|rs|కి)/i)
  );

  if (!hasSentenceAttributes) {
    return null;
  }
  const expMatch = text.match(/(\d+)\s*(సంవత్సరాల|సంవత్సరాలు|வருட|வருஷம்|ஆண்டு|ஆண்டுகள்|साल|वर्ष|years?|yrs?)/i);
  const years = expMatch ? parseInt(expMatch[1], 10) : null;

  // 3. Extract Timing / Shift / Immediate
  let timing = '';
  const timeMatch12 = lower.match(/(?:at|by|around|from)?\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\b/i);
  const timeMatch24 = lower.match(/(?:at|by|around|from)\s+(\d{1,2})[:.](\d{2})\b/i);

  if (timeMatch12) {
    let h = parseInt(timeMatch12[1], 10);
    const period = timeMatch12[3].toLowerCase().replace(/\./g, '');
    if (period === 'pm' && h < 12) h += 12;
    if (period === 'am' && h === 12) h = 0;
    if (h >= 5 && h < 12) timing = 'morning';
    else if (h >= 12 && h < 17) timing = 'afternoon';
    else if (h >= 17 && h < 23) timing = 'evening';
    else timing = 'night';
  } else if (timeMatch24) {
    const h = parseInt(timeMatch24[1], 10);
    if (h >= 5 && h < 12) timing = 'morning';
    else if (h >= 12 && h < 17) timing = 'afternoon';
    else if (h >= 17 && h < 23) timing = 'evening';
    else timing = 'night';
  } else if (lower.includes('immediate') || lower.includes('urgent') || lower.includes('right now') || lower.includes('asap') || lower.includes('உடனடி') || lower.includes('உடனே') || lower.includes('तुरंत') || lower.includes('వెంటనే')) {
    timing = 'immediate';
  } else if (lower.includes('మధ్యాహ్నం') || lower.includes('மதியம்') || lower.includes('दोपहर') || lower.includes('afternoon')) {
    timing = 'afternoon';
  } else if (lower.includes('ఉదయం') || lower.includes('காலை') || lower.includes('सुबह') || lower.includes('morning')) {
    timing = 'morning';
  } else if (lower.includes('సాయంత్రం') || lower.includes('மாலை') || lower.includes('शाम') || lower.includes('evening')) {
    timing = 'evening';
  } else if (lower.includes('రాత్రి') || lower.includes('இரவு') || lower.includes('रात') || lower.includes('night')) {
    timing = 'night';
  }

  // 4. Extract Location Proximity
  let isNearMe = lower.includes('నా దగ్గర') || lower.includes('నా సమీపంలో') || lower.includes('எனக்கு அருகில்') || lower.includes('அருகில்') || lower.includes('मेरे पास') || lower.includes('near me') || lower.includes('nearby');

  // 5. Extract Amount (Rs / ₹)
  const payMatch = text.match(/(?:rs\.?|inr|₹|రూ\.?|ரூ\.?|रु\.?)\s*(\d+)/i) || text.match(/(\d+)\s*(?:రూపాయలు|ரூபாய்|रुपये|rupees|rs|కి)/i);
  const amount = payMatch ? payMatch[1] : null;

  // Synthesize Target Sentence
  if (targetLang === 'en') {
    let s = `Looking for an experienced ${role}`;
    if (years) s += ` (${years} years exp)`;
    if (isNearMe) s += ` near me`;
    if (timing) s += ` for ${timing} shift`;
    if (amount) s += `. Budget: Rs. ${amount}`;
    else s += '.';
    return s;
  }

  if (targetLang === 'ta') {
    const roleTa = TA_VOCAB[role.toLowerCase()] || role;
    let s = isNearMe ? 'எனக்கு அருகில் ' : '';
    if (timing) s += timing === 'afternoon' ? 'மதியம் ' : timing === 'morning' ? 'காலை ' : timing === 'evening' ? 'மாலை ' : 'இரவு ';
    if (years) s += `${years} வருட அனுபவமுள்ள `;
    s += `${roleTa} தேவை`;
    if (amount) s += `, ரூ. ${amount}`;
    s += '.';
    return s;
  }

  if (targetLang === 'hi') {
    const roleHi = HI_VOCAB[role.toLowerCase()] || role;
    let s = 'मुझे ';
    if (isNearMe) s += 'अपने पास ';
    if (timing) s += timing === 'afternoon' ? 'दोपहर में ' : timing === 'morning' ? 'सुबह ' : timing === 'evening' ? 'शाम को ' : 'रात में ';
    if (years) s += `${years} साल के अनुभव वाले `;
    s += `${roleHi} की आवश्यकता है`;
    if (amount) s += `, रु ${amount}`;
    s += '।';
    return s;
  }

  if (targetLang === 'te') {
    const roleTe = TE_VOCAB[role.toLowerCase()] || role;
    let s = isNearMe ? 'నాకు నా దగ్గర ' : 'నాకు ';
    if (timing) s += timing === 'afternoon' ? 'మధ్యాహ్నం ' : timing === 'morning' ? 'ఉదయం ' : timing === 'evening' ? 'సాయంత్రం ' : 'రాత్రి ';
    if (years) s += `${years} సంవత్సరాల అనుభవం ఉన్న `;
    s += `${roleTe} అవసరం`;
    if (amount) s += `, Rs. ${amount}కి`;
    return s;
  }

  return null;
};

/**
 * Universal Multi-Directional String Translator.
 * Automatically translates ANY string from ANY language to ANY other language.
 */
export const autoTranslateString = (
  text: string | undefined | null,
  targetLang: Language,
  sourceLangHint?: Language
): string => {
  if (!text || !text.trim()) return '';

  const trimmed = text.trim();
  const detectedSource = sourceLangHint || detectLanguageFromScript(trimmed);

  // If source and target are the same, return as is
  if (detectedSource === targetLang) {
    return text;
  }

  // Check cache
  const cacheKey = `${detectedSource}->${targetLang}:${trimmed.toLowerCase()}`;
  const cache = getCache();
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  // 1. Direct Conversational Map Match
  for (const entry of Object.values(CONVERSATIONAL_MAPS)) {
    const mapEntry = entry as Record<string, string>;
    if (mapEntry[detectedSource]?.toLowerCase() === trimmed.toLowerCase() || entry.en?.toLowerCase() === trimmed.toLowerCase()) {
      const direct = mapEntry[targetLang];
      if (direct) {
        setCacheEntry(cacheKey, direct);
        return direct;
      }
    }
  }

  // 2. Synthesize Structured Job Descriptions
  const synth = synthesizeJobDescription(trimmed, detectedSource, targetLang);
  if (synth) {
    setCacheEntry(cacheKey, synth);
    return synth;
  }

  // 3. Step A: Convert Source Language to English Interlingua (if source is not English)
  let engText = trimmed;
  if (detectedSource !== 'en') {
    const reversePairs = detectedSource === 'ta' ? TA_TO_EN : detectedSource === 'hi' ? HI_TO_EN : TE_TO_EN;
    let intermediate = trimmed;
    let replacedAny = false;

    for (const [targetWord, enWord] of reversePairs) {
      if (targetWord.length > 1 && intermediate.includes(targetWord)) {
        const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapeRegex(targetWord), 'gi');
        intermediate = intermediate.replace(regex, enWord);
        replacedAny = true;
      }
    }
    if (replacedAny) {
      engText = intermediate;
    }
  }

  // If target is English, return the normalized English text
  if (targetLang === 'en') {
    if (engText !== trimmed && !hasIndicCharacters(engText)) {
      setCacheEntry(cacheKey, engText);
      return engText;
    }
    return engText;
  }

  // 4. Step B: Convert English Interlingua to Target Language
  const targetVocab = targetLang === 'ta' ? TA_VOCAB : targetLang === 'hi' ? HI_VOCAB : TE_VOCAB;
  let translatedResult = engText;
  let translatedAny = false;

  const sortedKeys = Object.keys(targetVocab).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const translation = targetVocab[key];
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapeRegex(key)}\\b`, 'gi');
    if (regex.test(translatedResult)) {
      translatedResult = translatedResult.replace(regex, translation);
      translatedAny = true;
    }
  }

  if (!translatedAny) {
    for (const key of sortedKeys) {
      if (key.length >= 3 && translatedResult.toLowerCase().includes(key)) {
        const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapeRegex(key), 'gi');
        translatedResult = translatedResult.replace(regex, targetVocab[key]);
        translatedAny = true;
      }
    }
  }

  if (translatedAny) {
    setCacheEntry(cacheKey, translatedResult);
    return translatedResult;
  }

  return trimmed;
};

/**
 * Universal Online Auto-Translator with local cache fallback.
 * Queries free machine translation APIs when connected and updates memory.
 */
export const prefetchDynamicTranslation = async (
  text: string,
  targetLang: Language,
  sourceLangHint?: Language
): Promise<string> => {
  if (!text || !text.trim()) return '';

  const detectedSource = sourceLangHint || detectLanguageFromScript(text);
  if (detectedSource === targetLang) return text;

  const cacheKey = `${detectedSource}->${targetLang}:${text.trim().toLowerCase()}`;
  const cache = getCache();
  if (cache[cacheKey]) return cache[cacheKey];

  // Try fast offline dictionary first
  const localResult = autoTranslateString(text, targetLang, detectedSource);
  if (localResult !== text) {
    setCacheEntry(cacheKey, localResult);
  }

  // If online, query free translation API for maximum grammatical quality
  const isOnline = typeof (globalThis as any).navigator !== 'undefined' && Boolean((globalThis as any).navigator?.onLine);
  if (isOnline) {
    try {
      const srcPair = detectedSource === 'en' ? 'en' : detectedSource;
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${srcPair}|${targetLang}`
      );
      const data: any = await res.json();
      if (data?.responseData?.translatedText && !String(data.responseData.translatedText).includes('INVALID')) {
        const onlineTranslated = String(data.responseData.translatedText);
        setCacheEntry(cacheKey, onlineTranslated);
        // Dispatch translation update event so any mounted components can re-render
        if (typeof (globalThis as any).window !== 'undefined') {
          (globalThis as any).window.dispatchEvent(new CustomEvent('talent2task_translation_updated', {
            detail: { key: cacheKey, text, translated: onlineTranslated, targetLang }
          }));
        }
        return onlineTranslated;
      }
    } catch {
      // Fallback silently to offline engine
    }
  }

  return localResult;
};
