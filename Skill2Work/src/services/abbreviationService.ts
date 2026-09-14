import type { Language } from '../types';

export interface SemanticConcept {
  id: string;
  canonicalName: string;
  category: string;
  abbreviations: string[];
  synonymsEn: string[];
  synonymsTa: string[];
  synonymsTe: string[];
  synonymsHi: string[];
  canonicalSkills: string[];
  titleGenerator: (lang: Language) => string;
}

export const SEMANTIC_CONCEPTS: SemanticConcept[] = [
  {
    id: 'air_conditioner',
    canonicalName: 'Air Conditioner / AC Repair',
    category: 'Appliance Repair',
    abbreviations: ['ac', 'a/c', 'a.c', 'a c', 'hvac', 'split ac', 'window ac', 'inverter ac', 'cassette ac', 'aircon'],
    synonymsEn: [
      'air conditioner', 'air conditioning', 'ac repair', 'ac mechanic', 'ac service',
      'ac servicing', 'ac technician', 'ac gas filling', 'ac maintenance', 'ac repair and maintenance',
      'air cooler', 'chiller', 'air conditioning repair', 'ac installation'
    ],
    synonymsTa: [
      'ஏசி', 'ஏ/சி', 'ஏசி மெக்கானிக்', 'ஏசி சர்வீஸ்', 'ஏசி ரிப்பேர்', 'குளிர்சாதனம்',
      'ஏர் கண்டிஷனர்', 'ஏசி பழுது', 'குளிர்சாதனப் பழுது', 'ஏசி பராமரிப்பு'
    ],
    synonymsTe: [
      'ఏసీ', 'ఏ/సీ', 'ఎయిర్ కండీషనర్', 'ఏసీ సర్వీస్', 'కూలర్', 'ఏసీ మెకానిక్',
      'ఏసీ రిపేర్', 'ఏసీ మరమ్మతు', 'ఎయిర్ కూలర్'
    ],
    synonymsHi: [
      'एसी', 'ए/सी', 'एयर कंडीLशनर', 'एयर कंडीशनिंग', 'एसी मैकेनिक', 'एसी सर्विस',
      'कूलर', 'वातानुकूलक', 'एसी मरम्मत', 'एयर कूलर'
    ],
    canonicalSkills: ['AC Repair', 'Air Conditioner Servicing', 'AC Maintenance', 'Appliance Maintenance'],
    titleGenerator: (lang) => {
      switch (lang) {
        case 'ta': return 'ஏசி மற்றும் குளிர்சாதன பழுதுபார்ப்பு தேவை';
        case 'te': return 'ఏసీ మరియు కూలర్ సర్వీస్ అవసరం';
        case 'hi': return 'एसी एवं एयर कंडीशनर मरम्मत तकनीशियन चाहिए';
        default: return 'AC & Air Conditioner Repair Needed';
      }
    }
  },
  {
    id: 'television',
    canonicalName: 'Television / TV Repair',
    category: 'Appliance Repair',
    abbreviations: ['tv', 't.v', 't v', 'led tv', 'lcd tv', 'smart tv', 'oled tv', 'qled tv', 'crt tv', 'dth', 'stb'],
    synonymsEn: [
      'television', 'tv repair', 'tv mechanic', 'tv technician', 'led television',
      'smart television', 'display repair', 'tv service', 'television maintenance',
      'tv wall mount', 'tv installation'
    ],
    synonymsTa: [
      'டிவி', 'தொலைக்காட்சி', 'ஸ்மார்ட் டிவி', 'டிவி ரிப்பேர்', 'டிவி மெக்கானிக்',
      'டிவி சர்வீஸ்', 'எல்இடி டிவி'
    ],
    synonymsTe: [
      'టీవీ', 'టెలివిజన్', 'స్మార్ట్ టీవీ', 'టీవీ రిపేర్', 'టీవీ మెకానిక్',
      'టీవీ సర్వీస్', 'ఎల్ఈడీ టీవీ'
    ],
    synonymsHi: [
      'टीवी', 'टेलीविजन', 'स्मार्ट टीवी', 'टीवी मरम्मत', 'टीवी मैकेनिक',
      'टीवी सर्विस', 'दूरदर्शन'
    ],
    canonicalSkills: ['TV Repair', 'Television & Electronics', 'Appliance Maintenance'],
    titleGenerator: (lang) => {
      switch (lang) {
        case 'ta': return 'டிவி & எலக்ட்ரானிக்ஸ் பழுதுபார்ப்பு தேவை';
        case 'te': return 'టీవీ & ఎలక్ట్రానిక్స్ రిపేర్ అవసరం';
        case 'hi': return 'टीवी एवं इलेक्ट्रॉनिक्स तकनीशियन चाहिए';
        default: return 'TV & Television Repair Technician Needed';
      }
    }
  },
  {
    id: 'refrigerator',
    canonicalName: 'Refrigerator / Fridge Repair',
    category: 'Appliance Repair',
    abbreviations: ['fridge', 'refridgerator', 'refrigerator', 'deep freezer', 'freezer', 'cooler box'],
    synonymsEn: [
      'refrigerator', 'fridge repair', 'fridge mechanic', 'refrigerator repair',
      'deep freezer repair', 'fridge gas filling', 'freezer service', 'fridge service',
      'double door fridge', 'single door fridge'
    ],
    synonymsTa: [
      'பிரிட்ஜ்', 'ஃபிரிட்ஜ்', 'குளிர்சாதனப் பெட்டி', 'பிரிட்ஜ் ரிப்பேர்',
      'பிரிட்ஜ் மெக்கானிக்', 'பிரிட்ஜ் சர்வீஸ்', 'குளிர்சாதன பெட்டி பழுது'
    ],
    synonymsTe: [
      'ఫ్రిజ్', 'శీతలీకరణి', 'ఫ్రిజ్ రిపేర్', 'ఫ్రిజ్ మెకానిక్', 'డీప్ ఫ్రీజర్', 'ఫ్రిజ్ సర్వీస్'
    ],
    synonymsHi: [
      'फ्रिज', 'रेफ्रिजरेटर', 'फ्रीजर', 'फ्रिज मरम्मत', 'फ्रिज मैकेनिक', 'फ्रिज सर्विस'
    ],
    canonicalSkills: ['Fridge Repair', 'Refrigerator Repair', 'Appliance Maintenance'],
    titleGenerator: (lang) => {
      switch (lang) {
        case 'ta': return 'பிரிட்ஜ் / குளிர்சாதனப் பெட்டி பழுதுபார்ப்பு தேவை';
        case 'te': return 'ఫ్రిజ్ / రిఫ్రిజిరేటర్ రిపేర్ అవసరం';
        case 'hi': return 'फ्रिज एवं रेफ्रिजरेटर मैकेनिक चाहिए';
        default: return 'Refrigerator & Fridge Repair Needed';
      }
    }
  },
  {
    id: 'washing_machine',
    canonicalName: 'Washing Machine Repair',
    category: 'Appliance Repair',
    abbreviations: ['wm', 'w/m', 'w.m', 'washing machine', 'washer', 'dryer', 'front load', 'top load'],
    synonymsEn: [
      'washing machine', 'washing machine repair', 'washing machine mechanic',
      'washer repair', 'laundry machine', 'washing machine service', 'dryer repair'
    ],
    synonymsTa: [
      'வாஷிங் மெஷின்', 'துணி துவைக்கும் இயந்திரம்', 'வாஷிங் மெஷின் ரிப்பேர்', 'வாஷிங் மெஷின் மெக்கானிக்'
    ],
    synonymsTe: [
      'వాషింగ్ మెషిన్', 'వాషింగ్ మెషీన్ రిపేర్', 'వాషింగ్ మెషిన్ మెకానిక్'
    ],
    synonymsHi: [
      'वाशिंग मशीन', 'कपड़े धोने की मशीन', 'वाशिंग मशीन मरम्मत', 'वाशिंग मशीन मैकेनिक'
    ],
    canonicalSkills: ['Washing Machine Repair', 'Appliance Maintenance'],
    titleGenerator: (lang) => {
      switch (lang) {
        case 'ta': return 'வாஷிங் மெஷின் பழுதுபார்ப்பு தேவை';
        case 'te': return 'వాషింగ్ మెషిన్ రిపేర్ అవసరం';
        case 'hi': return 'वाशिंग मशीन मरम्मत तकनीशियन चाहिए';
        default: return 'Washing Machine Repair Needed';
      }
    }
  },
  {
    id: 'water_purifier',
    canonicalName: 'Water Purifier / RO Service',
    category: 'Appliance Repair',
    abbreviations: ['ro', 'r.o', 'r o', 'water purifier', 'uv filter', 'water filter', 'aquaguard', 'kent'],
    synonymsEn: [
      'water purifier', 'ro service', 'ro repair', 'water filter repair',
      'filter change', 'purifier membrane change', 'drinking water filter'
    ],
    synonymsTa: [
      'ஆர்ஓ', 'வாட்டர் பியூரிபையர்', 'நீர் வடிகட்டி', 'ஆர்ஓ சர்வீஸ்', 'ஆர்ஓ ரிப்பேர்'
    ],
    synonymsTe: [
      'ఆర్వో', 'వాటర్ ప్యూరిఫైయర్', 'నీటి ఫిల్టర్', 'ఆర్వో సర్వీస్'
    ],
    synonymsHi: [
      'आरओ', 'वाटर प्यूरीफायर', 'पानी का फिल्टर', 'आरओ सर्विस', 'आरओ मरम्मत'
    ],
    canonicalSkills: ['RO & Water Purifier Service', 'Appliance Maintenance', 'Plumbing'],
    titleGenerator: () => 'RO & Water Purifier Service Needed'
  },
  {
    id: 'cctv_security',
    canonicalName: 'CCTV & Security Camera',
    category: 'Electrical',
    abbreviations: ['cctv', 'cc camera', 'ip camera', 'dvr', 'nvr', 'security camera', 'surveillance'],
    synonymsEn: [
      'cctv', 'cctv camera', 'cctv installation', 'security camera', 'camera repair',
      'surveillance camera', 'cctv wiring', 'dvr setup'
    ],
    synonymsTa: [
      'சிசிடிவி', 'சிசி கேமரா', 'பாதுகாப்பு கேமரா', 'சிசிடிவி பொருத்துதல்'
    ],
    synonymsTe: [
      'సిసిటివి', 'సిసి కెమెరా', 'సెక్యూరిటీ కెమెరా', 'సిసిటివి ఇన్‌స్టాలేషన్'
    ],
    synonymsHi: [
      'सीसीटीवी', 'सीसी कैमरा', 'सुरक्षा कैमरा', 'सीसीटीवी इंस्टॉलेशन'
    ],
    canonicalSkills: ['CCTV Installation', 'Electrical & Wiring', 'Security Systems'],
    titleGenerator: () => 'CCTV Camera Installation & Repair Needed'
  },
  {
    id: 'electrical_wiring',
    canonicalName: 'Electrician & Wiring',
    category: 'Electrical',
    abbreviations: ['eb', 'elec', 'electrician', 'wiring', 'inverter', 'ups', 'mcb', 'fuse', 'switchboard'],
    synonymsEn: [
      'electrician', 'electrical', 'wiring', 'house wiring', 'short circuit',
      'inverter repair', 'ups battery', 'fuse repair', 'switchboard repair',
      'fan repair', 'lighting installation', 'power line repair'
    ],
    synonymsTa: [
      'எலக்ட்ரீசியன்', 'எலக்ட்ரீஷியன்', 'மின்சார', 'வயரிங்', 'மின்பழுது', 'சுவிட்ச்',
      'இன்வெர்ட்டர்', 'மின்விசிறி பழுது', 'மின் இணைப்பு'
    ],
    synonymsTe: [
      'ఎలక్ట్రీషియన్', 'వైరింగ్', 'కరెంట్ పని', 'విద్యుత్', 'ఇన్వర్టర్',
      'ఫ్యాన్ రిపేర్', 'స్విచ్‌బోర్డ్'
    ],
    synonymsHi: [
      'इलेक्ट्रीशियन', 'बिजली मिस्त्री', 'वायरिंग', 'बिजली काम', 'इन्वर्टर',
      'पंखा मरम्मत', 'स्विच बोर्ड'
    ],
    canonicalSkills: ['Electrician Basics', 'Electrical & Wiring', 'Switchboard Repair'],
    titleGenerator: () => 'Electrical & Wiring Technician Needed'
  },
  {
    id: 'plumbing_pipe',
    canonicalName: 'Plumbing & Pipe Repair',
    category: 'Plumbing',
    abbreviations: ['plumb', 'plumber', 'pipe', 'leak', 'drain', 'tap', 'sanitary', 'motor pump'],
    synonymsEn: [
      'plumber', 'plumbing', 'pipe repair', 'pipe leak', 'tap repair',
      'sanitary work', 'drainage cleaning', 'water line repair', 'bathroom plumbing',
      'water tank fitting', 'motor pump installation'
    ],
    synonymsTa: [
      'பிளம்பர்', 'குழாய்', 'தண்ணீர் குழாய்', 'கசிவு', 'பிளம்பிங்', 'குழாய் பழுது',
      'ப்ளம்பர்', 'தண்ணீர் மோட்டார்'
    ],
    synonymsTe: [
      'ప్లంబర్', 'పైపు', 'లీకేజీ', 'ప్లంబింగ్', 'పైపుల మరమ్మతు', 'నీటి పైపు', 'వాటర్ మోటార్'
    ],
    synonymsHi: [
      'प्लंबर', 'नलसाज', 'पाइप', 'लीकेज', 'नल', 'प्लंबिंग', 'पानी का पाइप', 'मोटर पंप'
    ],
    canonicalSkills: ['Plumbing', 'Pipe Repair', 'Pipe Leakage Repair'],
    titleGenerator: () => 'Plumbing & Pipe Repair Needed'
  },
  {
    id: 'carpentry_wood',
    canonicalName: 'Carpentry & Furniture',
    category: 'Carpentry',
    abbreviations: ['carp', 'carpenter', 'wood', 'furniture', 'door repair', 'lock repair'],
    synonymsEn: [
      'carpenter', 'carpentry', 'woodwork', 'furniture repair', 'door lock repair',
      'cabinet making', 'table repair', 'wooden cot repair', 'cupboard work'
    ],
    synonymsTa: [
      'தச்சர்', 'மர வேலை', 'பர்னிச்சர்', 'மரவேலை', 'கதவு பழுது', 'பீரோ பழுது'
    ],
    synonymsTe: [
      'వడ్రంగి', 'చెక్క పని', 'ఫర్నిచర్', 'తలుపు రిపేర్'
    ],
    synonymsHi: [
      'बढ़ई', 'लकड़ी का काम', 'फर्नीचर', 'दरवाजा मरम्मत'
    ],
    canonicalSkills: ['Carpentry', 'Furniture Repair'],
    titleGenerator: () => 'Carpenter & Furniture Repair Needed'
  },
  {
    id: 'painting_whitewash',
    canonicalName: 'Painting & Wall Polish',
    category: 'Painting',
    abbreviations: ['paint', 'painter', 'whitewash', 'wall paint', 'primer', 'putty'],
    synonymsEn: [
      'painter', 'painting', 'whitewash', 'wall painting', 'house painting',
      'interior painting', 'exterior painting', 'wood polish', 'wall putty'
    ],
    synonymsTa: [
      'பெயிண்ட்', 'பெயிண்டர்', 'வர்ணம்', 'வண்ணம்', 'சுவர் பெயிண்ட்', 'பெயிண்டிங்', 'சுண்ணாம்பு பூச்சு'
    ],
    synonymsTe: [
      'పెయింటర్', 'పెయింటింగ్', 'రంగులు', 'గోడ పెయింటింగ్', 'సున్నం వేయడం'
    ],
    synonymsHi: [
      'पेंटर', 'पेंटिंग', 'पुताई', 'रंग रोगन', 'दीवार पेंटिंग'
    ],
    canonicalSkills: ['Painting', 'Wall Painting', 'Primer Application'],
    titleGenerator: () => 'House & Wall Painter Needed'
  },
  {
    id: 'vehicle_mechanic',
    canonicalName: 'Vehicle Mechanic (Bike & Car)',
    category: 'Mechanic',
    abbreviations: ['2w', '4w', 'bike mechanic', 'car mechanic', 'auto mechanic', 'garage', 'puncture'],
    synonymsEn: [
      'mechanic', 'bike mechanic', 'car mechanic', 'two wheeler mechanic',
      'four wheeler mechanic', 'auto repair', 'bike servicing', 'car servicing',
      'engine repair', 'brake repair', 'wheel puncture'
    ],
    synonymsTa: [
      'மெக்கானிக்', 'பைக் ரிப்பேர்', 'கார் மெக்கானிக்', 'இருசக்கர வாகன பழுது', 'வாகன மெக்கானிக்'
    ],
    synonymsTe: [
      'మెకానిక్', 'బైక్ రిపేర్', 'కార్ మెకానిక్', 'వాహన మరమ్మతు'
    ],
    synonymsHi: [
      'मैकेनिक', 'बाइक मरम्मत', 'कार मैकेनिक', 'गाड़ी मैकेनिक', 'बाइक सर्विस'
    ],
    canonicalSkills: ['Mechanic', 'Vehicle Maintenance', 'Two Wheeler Repair'],
    titleGenerator: () => 'Vehicle Mechanic Needed'
  },
  {
    id: 'driver_transport',
    canonicalName: 'Driver & Transportation',
    category: 'Driver',
    abbreviations: ['dl', 'driver', 'chauffeur', 'car driver', 'auto driver', 'heavy driver'],
    synonymsEn: [
      'driver', 'driving', 'chauffeur', 'car driver', 'tempo driver', 'truck driver',
      'auto driver', 'cab driver', 'personal driver', 'call driver'
    ],
    synonymsTa: [
      'டிரைவர்', 'ஓட்டுநர்', 'கார் டிரைவர்', 'டிரைவிங்', 'கால் டிரைவர்', 'ஆட்டோ டிரைவர்'
    ],
    synonymsTe: [
      'డ్రైవర్', 'కారు డ్రైవర్', 'డ్రైవింగ్', 'ఆటో డ్రైవర్'
    ],
    synonymsHi: [
      'ड्राइवर', 'चालक', 'गाड़ी चालक', 'ड्राइविंग', 'कार चालक'
    ],
    canonicalSkills: ['Driver', 'Driving', 'Two Wheeler Driving'],
    titleGenerator: () => 'Driver Needed'
  },
  {
    id: 'delivery_rider',
    canonicalName: 'Delivery Rider & Courier',
    category: 'Delivery',
    abbreviations: ['delivery', 'courier', 'parcel', 'delivery boy', 'rider'],
    synonymsEn: [
      'delivery', 'delivery rider', 'courier delivery', 'food delivery', 'parcel delivery',
      'delivery executive', 'delivery partner'
    ],
    synonymsTa: [
      'டெலிவரி', 'டெலிவரி பாய்', 'பார்சல்', 'டெலிவரி ரைடர்'
    ],
    synonymsTe: [
      'డెలివరీ', 'డెలివరీ బాయ్', 'పార్శిల్', 'డెలివరీ రైడర్'
    ],
    synonymsHi: [
      'डिलीवरी', 'डिलीवरी बॉय', 'कूरियर', 'डिलीवरी राइडर'
    ],
    canonicalSkills: ['Delivery', 'Two Wheeler Driving', 'Bike Rider'],
    titleGenerator: () => 'Delivery Rider Needed'
  },
  {
    id: 'housekeeping_cleaning',
    canonicalName: 'Housekeeping & Cleaning',
    category: 'Housekeeping',
    abbreviations: ['maid', 'cleaner', 'housekeeping', 'sweeper', 'mopping', 'house maid'],
    synonymsEn: [
      'cleaner', 'cleaning', 'housekeeping', 'house cleaning', 'maid', 'dusting',
      'office cleaning', 'deep cleaning', 'sweeping and mopping'
    ],
    synonymsTa: [
      'சுத்தம்', 'வீட்டு வேலை', 'துப்புரவு', 'வீடு சுத்தம்', 'சுத்தம் செய்பவர்', 'வேலைக்காரி'
    ],
    synonymsTe: [
      'క్లీనర్', 'ఇంటి పని', 'శుభ్రత', 'హౌస్‌కీపింగ్', 'పనిమనిషి'
    ],
    synonymsHi: [
      'सफाई', 'सफाईकर्मी', 'हाउसकीपिंग', 'घर का काम', 'झाड़ू-पोंछा', 'बाई'
    ],
    canonicalSkills: ['Housekeeping', 'Cleaning', 'Cleaning & Housekeeping'],
    titleGenerator: () => 'Housekeeping & Cleaning Assistant Needed'
  },
  {
    id: 'cooking_catering',
    canonicalName: 'Cooking & Catering',
    category: 'Catering & Cooking',
    abbreviations: ['cook', 'chef', 'catering', 'f&b', 'kitchen hand'],
    synonymsEn: [
      'cook', 'cooking', 'chef', 'catering', 'kitchen helper', 'food preparation',
      'meal cook', 'party cook', 'tea master'
    ],
    synonymsTa: [
      'சமையல்', 'கேட்டரிங்', 'சமையல்காரர்', 'குக்', 'சமையல் கலைஞர்', 'சமையல் வேலை'
    ],
    synonymsTe: [
      'వంట', 'కేటరింగ్', 'వంటమనిషి', 'వంట పని', 'చెఫ్'
    ],
    synonymsHi: [
      'खाना बनाना', 'रसोइया', 'कैटरिंग', 'कुक', 'बावर्ची', 'रसोई सहायक'
    ],
    canonicalSkills: ['Cooking / Catering', 'Kitchen Helper', 'Food Serving'],
    titleGenerator: () => 'Cook & Catering Helper Needed'
  },
  {
    id: 'store_retail',
    canonicalName: 'Store Helper & Billing',
    category: 'Store Helper',
    abbreviations: ['pos', 'billing', 'cashier', 'inventory', 'stock boy', 'retail helper'],
    synonymsEn: [
      'store helper', 'shop assistant', 'billing clerk', 'cashier', 'supermarket helper',
      'grocery helper', 'stock keeper', 'inventory assistant'
    ],
    synonymsTa: [
      'கடை உதவியாளர்', 'பில்லிங்', 'ஸ்டோர்', 'ஸ்டோர் உதவியாளர்', 'கேஷியர்'
    ],
    synonymsTe: [
      'స్టోర్ హెల్పర్', 'దుకాణం సహాయకుడు', 'బిల్లింగ్', 'క్యాషియర్'
    ],
    synonymsHi: [
      'स्टोर हेल्पर', 'दुकान सहायक', 'बिलिंग', 'कैशियर', 'स्टॉक सहायक'
    ],
    canonicalSkills: ['Store Helper', 'Cashier & Billing', 'Inventory', 'Packing & Restocking'],
    titleGenerator: () => 'Store & Billing Helper Needed'
  },
  {
    id: 'data_entry_office',
    canonicalName: 'Data Entry & Computer Operator',
    category: 'Data Entry',
    abbreviations: ['deo', 'data entry', 'typing', 'dtp', 'excel', 'back office', 'bpo'],
    synonymsEn: [
      'data entry', 'computer operator', 'typing operator', 'excel operator',
      'back office assistant', 'data clerk', 'dtp operator', 'office assistant'
    ],
    synonymsTa: [
      'டேட்டா என்ட்ரி', 'கம்ப்யூட்டர் ஆபரேட்டர்', 'டைப்பிங்', 'அலுவலக உதவியாளர்'
    ],
    synonymsTe: [
      'డేటా ఎంట్రీ', 'కంప్యూటర్ ఆపరేటర్', 'టైపింగ్', 'ఆఫీస్ అసిస్టెంట్'
    ],
    synonymsHi: [
      'डाटा एंट्री', 'कंप्यूटर ऑपरेटर', 'टाइपिंग', 'ऑफिस असिस्टेंट'
    ],
    canonicalSkills: ['Data Entry', 'Computer Basics', 'Basic Accounts', 'Office Assistant'],
    titleGenerator: () => 'Data Entry & Office Assistant Needed'
  },
  {
    id: 'security_guard',
    canonicalName: 'Security Guard & Watchman',
    category: 'Security & Guard',
    abbreviations: ['security', 'guard', 'security guard', 'watchman', 'gatekeeper', 'sec guard', 'chowkidar', 'bouncer'],
    synonymsEn: [
      'security', 'security guard', 'guard', 'watchman', 'gatekeeper',
      'night watchman', 'day guard', 'night guard', 'security officer',
      'premises security', 'building security', 'apartment security', 'bouncer', 'security personnel'
    ],
    synonymsTa: [
      'செக்யூரிட்டி', 'செக்யூரிடி', 'காவலாளி', 'காவலர்', 'வாட்ச்மேன்',
      'இரவு காவலாளி', 'பந்தோபஸ்து', 'பாதுகாவலர்', 'செக்யூரிட்டி கார்டு'
    ],
    synonymsTe: [
      'సెక్యూరిటీ', 'సెక్యూరిటీ గార్డ్', 'కాపలాదారు', 'వాచ్‌మెన్',
      'రాత్రి కాపలా', 'సెక్యూరిటీ మనిషి', 'వాచ్మన్'
    ],
    synonymsHi: [
      'सुरक्षा गार्ड', 'सिक्योरिटी', 'चौकीदार', 'गार्ड', 'सुरक्षाकर्मी',
      'पहरेदार', 'नाइट गार्ड', 'सिक्योरिटी गार्ड'
    ],
    canonicalSkills: ['Security Guard', 'Premises Surveillance'],
    titleGenerator: (lang) => {
      switch (lang) {
        case 'ta': return 'செக்யூரிட்டி / காவலாளி தேவை';
        case 'te': return 'సెక్యూరిటీ గార్డ్ అవసరం';
        case 'hi': return 'सुरक्षा गार्ड / चौकीदार चाहिए';
        default: return 'Security Guard Needed';
      }
    }
  },
  {
    id: 'event_hand',
    canonicalName: 'Event Hand & Helper',
    category: 'Event Hand',
    abbreviations: ['event hand', 'event helper', 'stage setup', 'stall helper', 'exhibition hand'],
    synonymsEn: [
      'event hand', 'event helper', 'event staff', 'stage decoration', 'seating setup',
      'marriage helper', 'banquet helper', 'stall helper', 'pamphlet distribution'
    ],
    synonymsTa: [
      'நிகழ்வு உதவி', 'ஈவென்ட் ஹெல்ப்பர்', 'மேடை அமைப்பு', 'மண்டப வேலை', 'விழா வேலை'
    ],
    synonymsTe: [
      'ఈవెంట్ హెల్పర్', 'ఫంక్షన్ హెల్పర్', 'స్టేజ్ డెకరేషన్'
    ],
    synonymsHi: [
      'इवेंट हेल्पर', 'समारोह सहायक', 'स्टेज सेटअप', 'इवेंट सहायक'
    ],
    canonicalSkills: ['Event Setup', 'Pamphlet Distribution'],
    titleGenerator: () => 'Event Hand & Helper Needed'
  },
  {
    id: 'logistics_loading',
    canonicalName: 'Logistics & Loading',
    category: 'Logistics & Loading',
    abbreviations: ['loader', 'unloader', 'loading', 'unloading', 'hamali', 'coolie', 'shifting helper'],
    synonymsEn: [
      'loading', 'unloading', 'loading worker', 'goods loader', 'warehouse loader',
      'shifting helper', 'house shifting', 'tempo loading', 'lorry loading', 'packing and loading'
    ],
    synonymsTa: [
      'சுமை தூக்குபவர்', 'லோடிங்', 'அன்லோடிங்', 'பொருட்கள் ஏற்றுதல்', 'வீடு மாற்றுதல் உதவி'
    ],
    synonymsTe: [
      'లోడింగ్', 'అన్‌లోడింగ్', 'కూలీ', 'వస్తువుల లోడింగ్'
    ],
    synonymsHi: [
      'लोडिंग', 'अनलोडिंग', 'हमाली', 'कुली', 'सामान चढ़ाना'
    ],
    canonicalSkills: ['Loading & Unloading', 'Packing & Restocking'],
    titleGenerator: () => 'Loading & Shifting Helper Needed'
  },
  {
    id: 'healthcare_assistant',
    canonicalName: 'Healthcare & Patient Assistant',
    category: 'Healthcare Assistant',
    abbreviations: ['patient helper', 'attender', 'home nurse', 'elderly care', 'bedside assistant'],
    synonymsEn: [
      'patient helper', 'hospital attender', 'home attender', 'elderly care',
      'senior care', 'patient care', 'bedside care', 'home nurse'
    ],
    synonymsTa: [
      'நோயாளி பராமரிப்பு', 'முதியோர் பராமரிப்பு', 'மருத்துவ உதவியாளர்', 'அட்டெண்டர்'
    ],
    synonymsTe: [
      'రోగి సహాయకుడు', 'వృద్ధుల సంరక్షణ', 'అటెండర్'
    ],
    synonymsHi: [
      'मरीज सहायक', 'बुजुर्गों की देखभाल', 'अटेंडेंट', 'रोगी देखभाल'
    ],
    canonicalSkills: ['Patient Helper', 'Customer Service'],
    titleGenerator: () => 'Healthcare & Patient Assistant Needed'
  }
];

/**
 * Normalizes input text and expands recognized abbreviations to their rich semantic forms.
 * Example: 'NEED AC Mechanic' -> expands to include 'Air Conditioner / AC Repair / AC Mechanic'
 */
export function expandAbbreviations(text: string): string {
  if (!text || !text.trim()) return '';

  let expanded = text;

  // Word boundary regex replacements for known abbreviations
  const ABBREV_EXPANSIONS: { regex: RegExp; replacement: string }[] = [
    { regex: /\b(ac|a\/c|a\.c)\s+mechanic\b/gi, replacement: 'AC Mechanic Air Conditioner Repair' },
    { regex: /\b(ac|a\/c|a\.c)\s+(repair|service|servicing|technician|gas|installation)\b/gi, replacement: 'Air Conditioner $2' },
    { regex: /\b(ac|a\/c|a\.c)\b/gi, replacement: 'Air Conditioner (AC)' },
    { regex: /\b(tv|t\.v)\s+(repair|mechanic|service|technician|mount)\b/gi, replacement: 'Television $2' },
    { regex: /\b(tv|t\.v)\b/gi, replacement: 'Television (TV)' },
    { regex: /\b(fridge|refridgerator)\s+(repair|mechanic|service|gas)\b/gi, replacement: 'Refrigerator $2' },
    { regex: /\b(fridge|refridgerator)\b/gi, replacement: 'Refrigerator (Fridge)' },
    { regex: /\b(wm|w\/m|w\.m)\s+(repair|service|mechanic)\b/gi, replacement: 'Washing Machine $2' },
    { regex: /\b(wm|w\/m|w\.m)\b/gi, replacement: 'Washing Machine' },
    { regex: /\b(ro|r\.o)\s+(repair|service|purifier|filter)\b/gi, replacement: 'Water Purifier $2' },
    { regex: /\b(ro|r\.o)\b/gi, replacement: 'Water Purifier (RO)' },
    { regex: /\b(cctv|cc\s*camera)\b/gi, replacement: 'CCTV Security Camera' },
    { regex: /\b(sec\s*guard|security\s*guard|watchman|gatekeeper)\b/gi, replacement: 'Security Guard' },
    { regex: /\b(eb)\s+(work|wiring|electrician)\b/gi, replacement: 'Electricity Board $2' },
    { regex: /\b(eb)\b/gi, replacement: 'Electrical' },
    { regex: /\b(deo)\b/gi, replacement: 'Data Entry Operator' },
    { regex: /\b(dtp)\b/gi, replacement: 'Desktop Publishing DTP' },
    { regex: /\b(2w|two\s*wheeler)\s+(mechanic|repair)\b/gi, replacement: 'Bike Motorcycle $2' },
    { regex: /\b(4w|four\s*wheeler)\s+(mechanic|repair|driver)\b/gi, replacement: 'Car Vehicle $2' }
  ];

  for (const exp of ABBREV_EXPANSIONS) {
    expanded = expanded.replace(exp.regex, exp.replacement);
  }

  return expanded;
}

/**
 * Calculates a match score (0 to 1) for semantic equivalence between any two skill names
 * Handles abbreviations like AC ↔ Air Conditioner, Fridge ↔ Refrigerator, TV ↔ Television.
 */
export function getSemanticConceptSimilarity(skillA: string, skillB: string): number {
  if (!skillA || !skillB) return 0;
  const aNorm = skillA.trim().toLowerCase();
  const bNorm = skillB.trim().toLowerCase();

  // 1. Exact string match
  if (aNorm === bNorm) return 1.0;

  // 2. Direct substring match
  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) return 0.92;

  // 3. Concept synonym / abbreviation equivalence
  for (const concept of SEMANTIC_CONCEPTS) {
    const allSynonyms = [
      concept.canonicalName.toLowerCase(),
      concept.category.toLowerCase(),
      ...concept.abbreviations.map(s => s.toLowerCase()),
      ...concept.synonymsEn.map(s => s.toLowerCase()),
      ...concept.synonymsTa.map(s => s.toLowerCase()),
      ...concept.synonymsTe.map(s => s.toLowerCase()),
      ...concept.synonymsHi.map(s => s.toLowerCase()),
      ...concept.canonicalSkills.map(s => s.toLowerCase())
    ];

    const aInConcept = allSynonyms.some(syn => syn === aNorm || aNorm.includes(syn) || syn.includes(aNorm));
    const bInConcept = allSynonyms.some(syn => syn === bNorm || bNorm.includes(syn) || syn.includes(bNorm));

    if (aInConcept && bInConcept) {
      return 0.95; // High semantic confidence
    }
  }

  return 0;
}

/**
 * Escapes regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Safely tests whether a concept term occurs as a distinct word/phrase in text.
 * Prevents subword false matches (e.g., 'ro' inside 'from', 'eb' inside 'celebrate').
 */
function testTermInText(term: string, text: string, lower: string): boolean {
  const termLower = term.trim().toLowerCase();
  if (!termLower) return false;

  const isAscii = /^[a-z0-9\s/.-]+$/i.test(termLower);
  if (isAscii) {
    const escaped = escapeRegex(termLower);
    // Requires word/non-alphanumeric boundary on both sides
    const reg = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i');
    return reg.test(lower);
  }

  // Non-ASCII (Tamil, Telugu, Hindi, etc.)
  const escaped = escapeRegex(term.trim());
  try {
    const reg = new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?:$|[^\\p{L}\\p{N}])`, 'u');
    if (reg.test(text) || reg.test(lower)) return true;
  } catch {
    // Fallback if unicode property escape is unavailable
  }
  return text.includes(term) || lower.includes(termLower);
}

/**
 * Intelligently analyzes input text against semantic concepts with compound priority weighting.
 * Prioritizes specific compound phrases like 'AC Mechanic', 'Air Conditioning Repair', 'TV Repair', 'Fridge Repair'
 * over generic individual keywords like 'Mechanic'.
 */
export function matchSemanticConcept(
  text: string,
  _lang?: Language
): { concept: SemanticConcept; matchScore: number; matchedKeywords: string[] } | null {
  if (!text || !text.trim()) return null;

  const lower = text.toLowerCase();
  let bestConcept: SemanticConcept | null = null;
  let highestScore = 0;
  let bestKeywords: string[] = [];

  for (const concept of SEMANTIC_CONCEPTS) {
    let score = 0;
    const matched: string[] = [];

    // Collect all search terms for this concept
    const terms = [
      ...concept.synonymsEn,
      ...concept.synonymsTa,
      ...concept.synonymsTe,
      ...concept.synonymsHi,
      ...concept.abbreviations,
      ...concept.canonicalSkills
    ];

    for (const term of terms) {
      const termLower = term.toLowerCase().trim();
      if (!termLower) continue;

      if (testTermInText(term, text, lower)) {
        const wordCount = termLower.split(/\s+/).length;
        const isMultiWord = wordCount > 1;
        const termScore = isMultiWord ? (wordCount * 15) : (termLower.length <= 2 ? 6 : (termLower.length <= 4 ? 8 : 10));
        score += termScore;
        matched.push(term);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestConcept = concept;
      bestKeywords = matched;
    }
  }

  if (bestConcept && highestScore > 0) {
    return {
      concept: bestConcept,
      matchScore: highestScore,
      matchedKeywords: bestKeywords
    };
  }

  return null;
}

