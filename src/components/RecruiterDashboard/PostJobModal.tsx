import React, { useState, useEffect } from 'react';
import { 
  X, 
  Briefcase, 
  MapPin, 
  Plus, 
  Check, 
  Save, 
  Layers,
  Sparkles,
  Wand2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Award,
  AlertTriangle,
  Navigation,
  Loader2
} from 'lucide-react';
import type { Job, User, TamilNaduLocation } from '../../types';
import { ALL_SKILL_OPTIONS, CATEGORIES, localizeContent } from '../../i18n/translations';
import { nlpService, type ExtractedJobRequirement } from '../../services/nlpService';
import { trustSafetyService } from '../../services/trustSafetyService';
import { 
  TAMIL_NADU_LOCATIONS, 
  TAMIL_NADU_CITIES, 
  getLocationsByCity, 
  getClosestLandmark,
  requestBrowserLocation 
} from '../../services/geoService';
import { useLanguage } from '../../i18n/LanguageContext';
import { SearchableSelect } from '../common/SearchableSelect';
import { VelloreMapView } from '../MapView/VelloreMapView';
import { VoiceInputButton } from '../common/VoiceInputButton';

export interface PostJobInitialData {
  category?: string;
  title?: string;
  skills?: string[];
  description?: string;
  payoutAmount?: number;
  payoutUnit?: 'hour' | 'task' | 'shift' | 'day';
  selectedCity?: string;
  landmarkArea?: string;
  nlText?: string;
}

interface PostJobModalProps {
  recruiter: User;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: Omit<Job, 'id' | 'created_at'>) => void;
  initialData?: PostJobInitialData | null;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  recruiter,
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const { t, language } = useLanguage();

  const [title, setTitle] = useState('');
  const [categoriesList, setCategoriesList] = useState<string[]>(CATEGORIES);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [payoutAmount, setPayoutAmount] = useState<number>(180);
  const [payoutUnit, setPayoutUnit] = useState<'hour' | 'task' | 'shift'>('hour');
  const [skillsList, setSkillsList] = useState<string[]>(ALL_SKILL_OPTIONS);
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Tamil Speaking']);
  const [customSkill, setCustomSkill] = useState('');
  const [selectedCity, setSelectedCity] = useState(recruiter.city || 'Chennai');
  const [latitude, setLatitude] = useState(recruiter.latitude || 13.0827);
  const [longitude, setLongitude] = useState(recruiter.longitude || 80.2707);
  const [landmarkArea, setLandmarkArea] = useState(
    recruiter.address || recruiter.landmark || (recruiter.city ? `${recruiter.city} Central, Tamil Nadu` : 'T. Nagar, Chennai')
  );
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);

  // NLP Assistant State
  const [nlInput, setNlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedJobRequirement | null>(null);
  const [extractionApplied, setExtractionApplied] = useState(false);

  // Synchronize initial data from AI Chat Assistant or parent callers
  useEffect(() => {
    if (isOpen && initialData) {
      if (initialData.title) setTitle(initialData.title);
      if (initialData.category) {
        if (!categoriesList.includes(initialData.category)) {
          setCategoriesList(prev => [...prev, initialData.category!]);
        }
        setCategory(initialData.category);
      }
      if (initialData.description) setDescription(initialData.description);
      if (initialData.payoutAmount) setPayoutAmount(initialData.payoutAmount);
      if (initialData.payoutUnit) {
        const unit = initialData.payoutUnit === 'day' ? 'shift' : initialData.payoutUnit;
        setPayoutUnit(unit as any);
      }
      if (initialData.skills && initialData.skills.length > 0) {
        setRequiredSkills(initialData.skills);
        initialData.skills.forEach(s => {
          if (!skillsList.includes(s)) {
            setSkillsList(prev => [s, ...prev]);
          }
        });
      }
      if (initialData.selectedCity) setSelectedCity(initialData.selectedCity);
      if (initialData.landmarkArea) setLandmarkArea(initialData.landmarkArea);
      if (initialData.nlText) {
        setNlInput(initialData.nlText);
      }
    }
  }, [isOpen, initialData]);

  const handleAnalyzeWithAI = (textToAnalyze?: string) => {
    const text = (textToAnalyze !== undefined ? textToAnalyze : nlInput).trim();
    setAiErrorMessage(null);

    if (!text) {
      setAiErrorMessage('Please describe the job or task first.');
      return;
    }

    setIsAnalyzing(true);
    setExtractionApplied(false);
    setExtractedData(null); // Clear previous extraction to ensure fresh analysis

    setTimeout(() => {
      try {
        const result = nlpService.parseJobRequirement(text, selectedCity);
        if (!result) {
          throw new Error('Analysis returned no result');
        }
        setExtractedData(result);
      } catch (err) {
        console.error('NLP requirement analysis error:', err);
        setAiErrorMessage('AI analysis is temporarily unavailable. Please try again.');
        setExtractedData(null);
      } finally {
        setIsAnalyzing(false);
      }
    }, 250);
  };

  const handleApplyExtractedData = () => {
    if (!extractedData) return;

    if (extractedData.title) setTitle(extractedData.title);
    if (extractedData.category) {
      if (!categoriesList.includes(extractedData.category)) {
        setCategoriesList(prev => [...prev, extractedData.category]);
      }
      setCategory(extractedData.category);
    }
    if (extractedData.rawText) setDescription(extractedData.rawText);

    // Apply skills
    if (extractedData.skills.length > 0) {
      setRequiredSkills(extractedData.skills);
      extractedData.skills.forEach(s => {
        if (!skillsList.includes(s)) {
          setSkillsList(prev => [s, ...prev]);
        }
      });
    }

    // Apply location only if explicitly detected
    if (extractedData.location.isDetected && extractedData.location.city) {
      setSelectedCity(extractedData.location.city);
      if (extractedData.location.latitude) setLatitude(extractedData.location.latitude);
      if (extractedData.location.longitude) setLongitude(extractedData.location.longitude);
      setLandmarkArea(extractedData.location.landmark || `${extractedData.location.city} Central, Tamil Nadu`);
    }

    // Apply payout only if explicitly detected
    if (extractedData.payout.isExplicit && extractedData.payout.amount) {
      setPayoutAmount(extractedData.payout.amount);
      const unit = extractedData.payout.unit === 'day' ? 'task' : (extractedData.payout.unit || 'hour');
      setPayoutUnit(unit);
    }

    setExtractionApplied(true);
  };

  const handleRemoveExtractedSkill = (skillToRemove: string) => {
    if (!extractedData) return;
    const updatedSkills = extractedData.skills.filter(s => s !== skillToRemove);
    setExtractedData({
      ...extractedData,
      skills: updatedSkills
    });
    if (extractionApplied) {
      setRequiredSkills(updatedSkills);
    }
  };

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (requiredSkills.includes(skill)) {
      setRequiredSkills(requiredSkills.filter(s => s !== skill));
    } else {
      setRequiredSkills([...requiredSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed) {
      if (!skillsList.includes(trimmed)) {
        setSkillsList(prev => [trimmed, ...prev]);
      }
      if (!requiredSkills.includes(trimmed)) {
        setRequiredSkills(prev => [...prev, trimmed]);
      }
      setCustomSkill('');
    }
  };

  // Helper to suggest job title based on category & language
  const getSuggestedJobTitle = (catName: string, lang: typeof language): string => {
    const localizedCat = localizeContent(catName, lang);
    if (lang === 'ta') return `${localizedCat} ஆள் தேவைப்படுகிறது`;
    if (lang === 'hi') return `${localizedCat} सहायक की आवश्यकता है`;
    if (lang === 'te') return `${localizedCat} సహాయకుడు అవసరం`;
    return `${catName} Helper Needed`;
  };

  // Helper to suggest job description template relatively based on category & language
  const getSuggestedDescription = (catName: string, lang: typeof language): string => {
    const localizedCat = localizeContent(catName, lang);
    const catLower = catName.toLowerCase();

    // Plumbing
    if (catLower.includes('plumb')) {
      if (lang === 'ta') return 'தமிழ்நாட்டில் பைப்லைன் பழுதுபார்த்தல், கசிவு சரிசெய்தல் மற்றும் சானிட்டரி பொருத்துதல் பணிகளுக்கான நம்பகமான பிளம்பர் தேவை.';
      if (lang === 'hi') return 'तमिलनाडु में पाइपलाइन रिपेयर, लीकेज फिक्सिंग और सेनेटरी फिटिंग कार्यों के लिए कुशल प्लंबर की आवश्यकता है।';
      if (lang === 'te') return 'తమిళనాడులో పైప్‌లైన్ మరమ్మతులు, లీకేజీ సమస్యలు మరియు శానిటరీ అమరికల కొరకు నమ్మకమైన ప్లంబర్ అవసరం.';
      return 'Looking for a reliable Plumber in Tamil Nadu for pipe repairs, leakage fixes, sanitary fittings, and bathroom maintenance.';
    }

    // Electrical
    if (catLower.includes('electric')) {
      if (lang === 'ta') return 'தமிழ்நாட்டில் வயரிங், சுவிட்ச் போர்டு பழுதுபார்த்தல் மற்றும் மின் உபகரணங்கள் பராமரிப்பு பணிகளுக்கான எலக்ட்ரீஷியன் தேவை.';
      if (lang === 'hi') return 'तमिलनाडु में वायरिंग, उपकरण सेटअप और विद्युत रखरखाव कार्यों के लिए कुशल इलेक्ट्रीशियन की आवश्यकता है।';
      if (lang === 'te') return 'తమిళనాడులో వైరింగ్, విద్యుత్ ఉపకరణాల మరమ్మత్తు మరియు నిర్వహణ పనులకు ఎలక్ట్రీషియన్ అవసరం.';
      return 'Looking for a qualified Electrician in Tamil Nadu for wiring, switchboard repairs, appliance setup, and routine electrical work.';
    }

    // Delivery
    if (catLower.includes('delivery') || catLower.includes('rider')) {
      if (lang === 'ta') return 'தமிழ்நாட்டில் சரியான நேரத்தில் பார்சல்களை பிக்அப் செய்து வாடிக்கையாளர்களிடம் பாதுகாப்பாக டெலிவரி செய்ய டெலிவரி பார்ட்னர் தேவை.';
      if (lang === 'hi') return 'तमिलनाडु में समय पर पार्सल पिकअप और सुरक्षित ऑर्डर डिलीवरी के लिए जिम्मेदार डिलीवरी पार्टनर की आवश्यकता है।';
      if (lang === 'te') return 'తమిళనాడులో సమయానికి ఆర్డర్లు డెలివరీ చేయడానికి బాధ్యతాయుతమైన డెలివరీ పార్టనర్ అవసరం.';
      return 'Seeking a responsible Delivery partner / rider in Tamil Nadu for timely order pickups, safe deliveries, and route navigation.';
    }

    // Store Helper
    if (catLower.includes('store') || catLower.includes('billing')) {
      if (lang === 'ta') return 'தமிழ்நாட்டில் பொருட்கள் அடுக்கி வைத்தல், சரக்கு சரிபார்த்தல் மற்றும் வாடிக்கையாளர் உதவிக்கான சுறுசுறுப்பான ஸ்டோர் உதவியாளர் தேவை.';
      if (lang === 'hi') return 'तमिलनाडु में दुकान का सामान व्यवस्थित करने, इन्वेंटरी संभालने और बिलिंग सहायता के लिए स्टोर हेल्पर की आवश्यकता है।';
      if (lang === 'te') return 'తమిళనాడులో దుకాణంలో వస్తువుల సర్దుబాటు, బిల్లింగ్ మరియు కస్టమర్ సహాయానికి స్టోర్ హెల్పర్ అవసరం.';
      return 'Looking for an active Store Helper in Tamil Nadu for inventory stocking, shelf arrangement, billing support, and customer assistance.';
    }

    // Catering & Cooking
    if (catLower.includes('cater') || catLower.includes('cook')) {
      if (lang === 'ta') return 'தமிழ்நாட்டில் சுவையான உணவு சமைத்தல், சமையலறை உதவி மற்றும் உணவு பரிமாறுதல் பணிகளுக்கான சமையல் உதவியாளர் தேவை.';
      if (lang === 'hi') return 'तमिलनाडु में भोजन तैयार करने, रसोई सहायता और कैटरिंग कार्यों के लिए कुशल कुक / कैटरिंग सहायक की आवश्यकता है।';
      if (lang === 'te') return 'తమిళనాడులో భోజనం తయారు చేయడం, కిచెన్ సహాయం మరియు వడ్డన పనుల కొరకు క్యాటరింగ్ సహాయకుడు అవసరం.';
      return 'Looking for skilled Catering & Cooking staff in Tamil Nadu for meal preparation, kitchen assistance, and food serving.';
    }

    // Security & Guard
    if (catLower.includes('security') || catLower.includes('guard')) {
      if (lang === 'ta') return 'தமிழ்நாட்டில் வளாக பாதுகாப்பு, பார்வையாளர்கள் பதிவு மற்றும் இரவு/பகல் கண்காணிப்பு பணிகளுக்கான விழிப்புணர்வுள்ள பாதுகாப்பு காவலர் தேவை.';
      if (lang === 'hi') return 'तमिलनाडु में परिसर की सुरक्षा, आगंतुकों के प्रबंधन और निगरानी के लिए सतर्क सुरक्षा गार्ड की आवश्यकता है।';
      if (lang === 'te') return 'తమిళనాడులో భవన భద్రత, సందర్శకుల నిర్వహణ మరియు నిఘా పనుల కొరకు సెక్యూరిటీ గార్డ్ అవసరం.';
      return 'Looking for an alert Security Guard in Tamil Nadu for premises surveillance, visitor access management, and property safety.';
    }

    // Housekeeping / Cleaning
    if (catLower.includes('housekeep') || catLower.includes('clean')) {
      if (lang === 'ta') return 'தமிழ்நாட்டில் தரை சுத்தம் செய்தல், தூசி அகற்றுதல் மற்றும் வளாக தூய்மை பராமரிப்பு பணிகளுக்கான ஹவுஸ்கீப்பிங் பணியாளர் தேவை.';
      if (lang === 'hi') return 'तमिलनाडु में फर्श की सफाई, धूल पोंछने और कमरे के रख-रखाव के लिए हाउसकीपिंग स्टाफ की आवश्यकता है।';
      if (lang === 'te') return 'తమిళనాడులో ఇల్లు/ఆఫీస్ శుభ్రత మరియు పరిశుభ్రత పనుల కొరకు హౌస్‌కీపింగ్ సిబ్బంది అవసరం.';
      return 'Looking for dependable Housekeeping staff in Tamil Nadu for dusting, floor mopping, sanitization, and room cleaning.';
    }

    // Data Entry
    if (catLower.includes('data entry') || catLower.includes('data')) {
      if (lang === 'ta') return 'தமிழ்நாட்டில் கணினியில் விரிதாள் தரவு உள்ளீடு மற்றும் ஆவணங்கள் சரிபார்ப்பு பணிகளுக்கான டேட்டா என்ட்ரி ஆபரேட்டர் தேவை.';
      if (lang === 'hi') return 'तमिलनाडु में स्प्रेडशीट प्रविष्टि, कंप्यूटर रिकॉर्ड और दस्तावेज सत्यापन के लिए डेटा एंट्री ऑपरेटर चाहिए।';
      if (lang === 'te') return 'తమిళనాడులో కంప్యూటర్ డేటా ఎంట్రీ మరియు రికార్డుల నమోదు కొరకు డేటా ఎంట్రీ ఆపరేటర్ అవసరం.';
      return 'Looking for an accurate Data Entry operator in Tamil Nadu for spreadsheet entry, digital record keeping, and verification.';
    }

    // Tutoring
    if (catLower.includes('tutor') || catLower.includes('teach')) {
      if (lang === 'ta') return 'தமிழ்நாட்டில் மாணவர்களுக்கு பாடம் கற்பித்தல், சந்தேகம் தீர்த்தல் மற்றும் தேர்வு வழிகாட்டலுக்கான தகுதியான ஆசிரியர் தேவை.';
      if (lang === 'hi') return 'तमिलनाडु में छात्रों को विषय पढ़ाने, संदेह दूर करने और परीक्षा की तैयारी के लिए शिक्षक / ट्यूटर की आवश्यकता है।';
      if (lang === 'te') return 'తమిళనాడులో విద్యార్థులకు సబ్జెక్ట్ బోధన మరియు పరీక్షల మార్గదర్శనం కొరకు ట్యూటర్ అవసరం.';
      return 'Looking for a knowledgeable Tutor in Tamil Nadu for student guidance, exam preparation, and homework assistance.';
    }

    // Event Hand
    if (catLower.includes('event')) {
      if (lang === 'ta') return 'தமிழ்நாட்டில் விழா மேடை அமைப்பு, இருக்கை ஒழுங்கமைத்தல் மற்றும் நிகழ்வு ஒருங்கிணைப்பு பணிகளுக்கான உதவியாளர் தேவை.';
      if (lang === 'hi') return 'तमिलनाडु में कार्यक्रम स्थल की तैयारी, बैठने की व्यवस्था और स्टेज सहायता के लिए इवेंट हेल्पर की आवश्यकता है।';
      if (lang === 'te') return 'తమిళనాడులో ఈవెంట్ వేదిక ఏర్పాట్లు, సీటింగ్ అమరిక మరియు స్టేజ్ సహాయం కొరకు ఈవెంట్ హ్యాండ్ అవసరం.';
      return 'Looking for energetic Event Hands in Tamil Nadu for stage decoration, seating setup, guest coordination, and logistics.';
    }

    // Logistics & Loading
    if (catLower.includes('logistics') || catLower.includes('load')) {
      if (lang === 'ta') return 'தமிழ்நாட்டில் லாரி சுமை ஏற்றுதல், இறக்குதல் மற்றும் கிடங்கு சரக்கு நகர்த்தல் பணிகளுக்கான உடல்திறன் கொண்ட தொழிலாளி தேவை.';
      if (lang === 'hi') return 'तमिलनाडु में ट्रक लोडिंग/अनलोडिंग, माल ढुलाई और वेयरहाउस में सामान रखने के लिए लॉजिस्टिक्स हेल्पर की आवश्यकता है।';
      if (lang === 'te') return 'తమిళనాడులో లారీలలో లోడింగ్, అన్‌లోడింగ్ మరియు గోదాము పనుల కొరకు లాజిస్టిక్స్ వర్కర్ అవసరం.';
      return 'Looking for physically capable Logistics & Loading workers in Tamil Nadu for cargo handling, truck loading/unloading, and warehouse moving.';
    }

    // Healthcare Assistant
    if (catLower.includes('health') || catLower.includes('care') || catLower.includes('patient')) {
      if (lang === 'ta') return 'தமிழ்நாட்டில் நோயாளிகள் கவனிப்பு, உடல்நல உதவி மற்றும் மருத்துவமனை பணிகளுக்கான பரிவுள்ள சுகாதார உதவியாளர் தேவை.';
      if (lang === 'hi') return 'तमिलनाडु में मरीज की देखभाल, सहायता और क्लिनिक कार्यों के लिए संवेदनशील स्वास्थ्य सहायक की आवश्यकता है।';
      if (lang === 'te') return 'తమిళనాడులో రోగుల సంరక్షణ మరియు ఆసుపత్రి సహాయ పనుల కొరకు హెల్త్‌కేర్ అసిస్టెంట్ అవసరం.';
      return 'Looking for a compassionate Healthcare Assistant in Tamil Nadu for patient care, mobility support, and clinic assistance.';
    }

    // Generic / Custom Category Fallback
    if (lang === 'ta') return `தமிழ்நாட்டில் ${localizedCat} பணிக்கான பகுதிநேர பணியாளர் தேவை. விருப்பமுள்ளவர்கள் தொடர்பு கொள்ளவும்.`;
    if (lang === 'hi') return `तमिलनाडु में ${localizedCat} कार्य के लिए भाग-समय सहायक की आवश्यकता है।`;
    if (lang === 'te') return `తమిళనాడులో ${localizedCat} పని కొరకు పార్ట్-టైమ్ సహాయకుడు అవసరం.`;
    return `Looking for a reliable ${catName} helper in Tamil Nadu for local shift and task work.`;
  };

  // Helper to suggest default skills for category
  const getCategoryDefaultSkills = (catName: string): string[] => {
    const catLower = catName.toLowerCase();
    if (catLower.includes('delivery') || catLower.includes('rider')) return ['Delivery', 'Driving', 'Bike Rider', 'Tamil Speaking'];
    if (catLower.includes('store') || catLower.includes('billing')) return ['Store Helper', 'Cashier & Billing', 'Inventory', 'Tamil Speaking'];
    if (catLower.includes('electrical') || catLower.includes('electrician')) return ['Electrician Basics', 'Physically Active', 'Tamil Speaking'];
    if (catLower.includes('plumbing')) return ['Plumbing', 'Physically Active', 'Tamil Speaking'];
    if (catLower.includes('catering') || catLower.includes('cook')) return ['Cooking / Catering', 'Kitchen Helper', 'Food Serving'];
    if (catLower.includes('security') || catLower.includes('guard')) return ['Security Guard', 'Physically Active', 'Tamil Speaking'];
    if (catLower.includes('cleaning') || catLower.includes('housekeeping')) return ['Cleaning & Housekeeping', 'Physically Active'];
    if (catLower.includes('tutoring') || catLower.includes('teach')) return ['Tutoring', 'English Speaking', 'Tamil Speaking'];
    if (catLower.includes('data entry') || catLower.includes('data')) return ['Data Entry', 'Computer Basics', 'Tamil Speaking'];
    if (catLower.includes('event')) return ['Event Setup', 'Physically Active', 'Tamil Speaking'];
    if (catLower.includes('logistics') || catLower.includes('loading')) return ['Loading & Unloading', 'Physically Active', 'Tamil Speaking'];
    if (catLower.includes('health') || catLower.includes('care')) return ['Patient Helper', 'Physically Active', 'Tamil Speaking'];
    return ['Tamil Speaking', catName];
  };

  // Handle Category Selection & Auto-Fill
  const handleSelectCategory = (catName: string) => {
    setCategory(catName);
    
    // Auto fill Job Title only if user has not provided one yet (preserves custom title)
    if (!title.trim()) {
      const autoTitle = getSuggestedJobTitle(catName, language);
      setTitle(autoTitle);
    }

    // Update Description relatively based on the selected job category
    const autoDesc = getSuggestedDescription(catName, language);
    setDescription(autoDesc);

    // Auto select skills
    const defaultSkills = getCategoryDefaultSkills(catName);
    setRequiredSkills(defaultSkills);

    // Add category to skillsList if custom
    if (!skillsList.includes(catName)) {
      setSkillsList(prev => [catName, ...prev]);
    }
  };

  const addCustomCategory = () => {
    const trimmed = customCategory.trim();
    if (trimmed) {
      if (!categoriesList.includes(trimmed)) {
        setCategoriesList(prev => [...prev, trimmed]);
      }
      handleSelectCategory(trimmed);
      setCustomCategory('');
    }
  };

  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    const cityLocs = getLocationsByCity(newCity);
    if (cityLocs.length > 0) {
      setLatitude(cityLocs[0].lat);
      setLongitude(cityLocs[0].lng);
      setLandmarkArea(cityLocs[0].name + ', ' + (cityLocs[0].area || newCity));
    }
  };

  const selectLandmarkPreset = (loc: TamilNaduLocation) => {
    setLatitude(loc.lat);
    setLongitude(loc.lng);
    setLandmarkArea(loc.name + ', ' + (loc.area || loc.district || selectedCity));
    if (loc.city) setSelectedCity(loc.city);
  };

  const handleLiveGps = async () => {
    setIsLocatingGps(true);
    setGpsStatusMessage(null);
    try {
      const loc = await requestBrowserLocation();
      setLatitude(loc.latitude);
      setLongitude(loc.longitude);
      setGpsAccuracy(loc.accuracy);
      if (loc.city) {
        setSelectedCity(loc.city);
      }
      const closest = getClosestLandmark(loc.latitude, loc.longitude);
      setLandmarkArea(closest);
      setGpsStatusMessage(`Live GPS locked (±${loc.accuracy}m)`);
      setShowMapPicker(true);
    } catch (err: any) {
      console.warn('Live GPS error:', err);
      setGpsStatusMessage(err?.message || 'Unable to access live GPS. You can enter landmark manually.');
      const cityLocs = getLocationsByCity(selectedCity);
      if (cityLocs.length > 0 && (!latitude || !longitude)) {
        setLatitude(cityLocs[0].lat);
        setLongitude(cityLocs[0].lng);
        setLandmarkArea(cityLocs[0].name + ', ' + (cityLocs[0].area || selectedCity));
      }
    } finally {
      setIsLocatingGps(false);
    }
  };

  const handleManualLandmarkChange = (value: string) => {
    setLandmarkArea(value);
    const match = TAMIL_NADU_LOCATIONS.find(
      l => l.name.toLowerCase() === value.trim().toLowerCase()
    );
    if (match) {
      setLatitude(match.lat);
      setLongitude(match.lng);
      if (match.city) setSelectedCity(match.city);
    }
  };

  const handleMapCoordinateSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    const closest = getClosestLandmark(lat, lng);
    setLandmarkArea(closest);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      recruiter_id: recruiter.id,
      title: title.trim(),
      description: description.trim(),
      category,
      required_skills: requiredSkills,
      payout_amount: Number(payoutAmount),
      payout_unit: payoutUnit,
      latitude,
      longitude,
      landmark_area: landmarkArea || `${selectedCity} Central, Tamil Nadu`,
      status: 'OPEN',
      claimed_by: null
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      
      <div 
        className="glass-panel w-full max-w-2xl max-h-[92vh] rounded-3xl border border-slate-200 shadow-2xl bg-white overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">
                {t.postModalTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {t.postModalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          
          {/* ===================== AI NATURAL LANGUAGE REQUIREMENT ASSISTANT ===================== */}
          <div className="bg-gradient-to-br from-sky-50/90 via-blue-50/40 to-slate-50 p-4 rounded-2xl border border-sky-200/90 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {t.aiFastDraftTitle || 'Fast-Draft with Natural Language'}
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200">
                      NLP / LLM
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Describe your gig in natural conversational words. AI extracts skills, city, experience, and shifts.
                  </p>
                </div>
              </div>
            </div>

              {/* Conversational Textarea Input with Voice Button */}
              <div className="relative">
                <textarea
                  value={nlInput}
                  onChange={(e) => {
                    setNlInput(e.target.value);
                    if (aiErrorMessage) setAiErrorMessage(null);
                  }}
                  placeholder={t.aiInputPlaceholder || 'e.g., I need an experienced AC technician near Madurai tomorrow evening. (Or speak in தமிழ் / తెలుగు / हिन्दी / English)'}
                  rows={2}
                  className="w-full pl-3.5 pr-20 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all resize-none shadow-2xs"
                />

                {/* Embedded Voice Button inside textarea corner */}
                <div className="absolute right-2.5 bottom-3 flex items-center gap-1.5">
                  <VoiceInputButton
                    size="sm"
                    onInterimTranscript={(text) => {
                      setNlInput(text);
                      if (aiErrorMessage) setAiErrorMessage(null);
                    }}
                    onTranscript={(transcript) => {
                      setNlInput(transcript);
                      if (aiErrorMessage) setAiErrorMessage(null);
                      handleAnalyzeWithAI(transcript);
                    }}
                  />
                </div>
              </div>

              {/* Sample Quick-Prompts */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Try:</span>
                {[
                  'எனக்கு காலை 9:00 மணி அளவில் பிளம்பர் தேவை அனுபவம் இரண்டு வருடம் ஊதியம் ஐந்தாறு ரூபாய் எனக்கு அருகில்.',
                  'கோயம்புத்தூரில் பைக் டெலிவரி ஆட்கள் தேவை சம்பளம் 800 ரூபாய் / நாள்',
                  'I NEED A AC MECHANIC FOR RS.2500 NEAR ME WITH EXPERIENCE OF 2 YEARS AT 02 PM.',
                  'Need an experienced electrician in Coimbatore tomorrow morning for ₹600',
                  'Looking for a painter urgently for Rs. 800/day',
                  'मुझे एक इलेक्ट्रीशियन चाहिए वेतन 500 रुपये प्रति दिन',
                  'నాకు పెయింటర్ కావాలి వేతనం 600 రూపాయలు',
                  'I need an experienced plumber in Madurai tomorrow morning for pipe leakage repair. Budget is 800 rupees.'
                ].map((sample, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setNlInput(sample);
                      if (aiErrorMessage) setAiErrorMessage(null);
                      handleAnalyzeWithAI(sample);
                    }}
                    className="text-[10px] font-medium px-2 py-1 rounded-lg bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200 hover:border-sky-300 transition-colors truncate max-w-[320px]"
                  >
                    ✨ {sample}
                  </button>
                ))}
              </div>

              {/* AI Validation / Error Alert */}
              {aiErrorMessage && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{aiErrorMessage}</div>
                  <button
                    type="button"
                    onClick={() => setAiErrorMessage(null)}
                    className="text-rose-400 hover:text-rose-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  <span>{t.voiceListeningPrompt || 'Speak or type in Tamil, Telugu, Hindi, or English'}</span>
                </div>
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => handleAnalyzeWithAI()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:opacity-50 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? (t.analyzingWithAi || 'Analyzing...') : (t.extractWithAiBtn || 'Analyze with AI')}</span>
                </button>
              </div>

            {/* Interactive Verification & Edit Card */}
            {extractedData && (
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-sky-200 space-y-3 mt-2 shadow-xs animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-500" />
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {t.extractedDetailsTitle || 'AI Extracted Details — Review & Edit'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {extractedData.languageName && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        🌐 {extractedData.languageName}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200">
                      {Math.round(extractedData.confidence * 100)}% Confidence
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  {t.confirmBeforePostNotice || 'AI information is never posted without your confirmation. Please review the details below:'}
                </p>

                {/* Extracted Fields Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  
                  {/* Category & Title */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{t.categoryLabel || 'Category'}</div>
                    <div className="font-bold text-sky-600 truncate mt-0.5">{localizeContent(extractedData.category, language)}</div>
                    <div className="text-[11px] text-slate-700 font-medium truncate mt-0.5">{localizeContent(extractedData.title, language)}</div>
                  </div>

                  {/* Location */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{t.detectedLocation || 'Location'}</div>
                    {extractedData.location.isDetected && extractedData.location.city ? (
                      <>
                        <div className="font-bold text-slate-900 truncate mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
                          <span>{localizeContent(extractedData.location.city, language)}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">{localizeContent(extractedData.location.landmark, language)}</div>
                      </>
                    ) : (
                      <div className="font-medium text-slate-400 mt-1">{localizeContent('Not specified', language)}</div>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{t.detectedExperience || 'Experience'}</div>
                    {extractedData.experience.isExplicit ? (
                      <>
                        <div className="font-bold text-slate-900 truncate mt-0.5 flex items-center gap-1">
                          <Award className="w-3 h-3 text-sky-500 shrink-0" />
                          <span>{localizeContent(extractedData.experience.level, language)} {extractedData.experience.years !== null ? `(${extractedData.experience.years}y)` : ''}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">{localizeContent(extractedData.experience.description, language)}</div>
                      </>
                    ) : (
                      <div className="font-medium text-slate-400 mt-1">{localizeContent('Not specified', language)}</div>
                    )}
                  </div>

                  {/* Availability */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{t.detectedShift || 'Shift'}</div>
                    {extractedData.availability.isExplicit ? (
                      <div className="font-bold text-sky-600 truncate mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-500 shrink-0" />
                        <span>{localizeContent(extractedData.availability.timingText, language)}</span>
                      </div>
                    ) : (
                      <div className="font-medium text-slate-400 mt-1">{localizeContent('Not specified', language)}</div>
                    )}
                  </div>

                  {/* Payout */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{t.detectedPayout || 'Pay Rate'}</div>
                    {extractedData.payout.isExplicit && extractedData.payout.amount ? (
                      <div className="font-extrabold text-sky-600 text-sm mt-0.5">
                        ₹{extractedData.payout.amount} <span className="text-[10px] font-normal text-slate-500">{extractedData.payout.unit ? `/ ${localizeContent(extractedData.payout.unit, language)}` : ''}</span>
                      </div>
                    ) : (
                      <div className="font-medium text-slate-400 mt-1">{localizeContent('Not specified', language)}</div>
                    )}
                  </div>

                  {/* Intent */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{t.detectedIntent || 'Intent'}</div>
                    <div className="font-bold text-slate-700 mt-0.5">
                      {extractedData.intent === 'seek_job' 
                        ? (language === 'ta' ? 'வேலை தேடுபவர்' : language === 'hi' ? 'नौकरी की तलाश' : language === 'te' ? 'ఉద్యోగం కోసం చూస్తున్నారు' : 'Looking for Work')
                        : (language === 'ta' ? 'பணியமர்த்துபவர்' : language === 'hi' ? 'कार्यकर्ता की नियुक्ति' : language === 'te' ? 'కార్మికుడిని నియమించడం' : 'Hiring Worker')}
                    </div>
                  </div>

                </div>

                {/* Extracted Skills Chips with (X) remove */}
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    SELECTED (CONNECTED TO PHASE 1 SEMANTIC MATCHING):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {extractedData.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200"
                      >
                        <span>{localizeContent(skill, language)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExtractedSkill(skill)}
                          className="hover:text-red-500 ml-1 text-slate-400 font-bold"
                          title="Remove skill"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Fields Alerts */}
                {extractedData.missingFields.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    {extractedData.missingFields.map((mf, mIdx) => (
                      <div key={mIdx} className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>{mf.label}:</strong> {mf.prompt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions: Apply to Form / Clear */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setExtractedData(null);
                      setExtractionApplied(false);
                      setNlInput('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    {t.dismissExtractedBtn || 'Clear'}
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyExtractedData}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.applyExtractedBtn || 'Apply to Form'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Application success feedback */}
            {extractionApplied && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Extracted details applied to form! Review all fields below before posting.</span>
              </div>
            )}
          </div>

          {/* Job Title & Category */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{t.jobTitleLabel}</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.jobTitlePlaceholder}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{t.categoryLabel}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categoriesList.map(cat => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left truncate ${
                      category === cat
                        ? 'bg-sky-500 text-white font-bold shadow-xs border-sky-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {localizeContent(cat, language)}
                  </button>
                ))}
              </div>

              {/* Add Custom Category Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Add custom category (e.g. Plumbing, Security, Catering)..."
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomCategory();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addCustomCategory}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold border border-sky-200 flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Category</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">{t.descriptionLabel}</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPlaceholder}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Payout */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">{t.payoutLabel}</label>
            <input
              type="number"
              min="50"
              step="10"
              required
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          {/* Required Skills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t.requiredSkillsLabel}
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              {skillsList.map((skill) => {
                const isSelected = requiredSkills.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-sky-500 text-white font-bold shadow-xs'
                        : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white font-black" />}
                    <span>{localizeContent(skill, language)}</span>
                  </button>
                );
              })}
            </div>

            {/* Add Custom Skill */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder={t.addCustomSkillPlaceholder}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCustomSkill}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-sky-700 rounded-lg text-xs font-bold border border-slate-200 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.add}</span>
              </button>
            </div>
          </div>

          {/* Landmark & Map Coordinates */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {t.landmarkAreaLabel}
                </label>
                <div className="text-xs text-sky-600 font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[280px] sm:max-w-md">{localizeContent(landmarkArea, language) || `${selectedCity} Central, Tamil Nadu`}</span>
                </div>
              </div>

              {/* Live GPS & Map Pin Options */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleLiveGps}
                  disabled={isLocatingGps}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-600 active:scale-95 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  title="Detect live device GPS location"
                >
                  {isLocatingGps ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Locating...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Live GPS</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 shadow-xs transition-colors ${
                    showMapPicker
                      ? 'bg-sky-50 text-sky-700 border-sky-300'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title={showMapPicker ? 'Close Map' : 'Open Pin Map'}
                >
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>{showMapPicker ? t.close : 'Map'}</span>
                </button>
              </div>
            </div>

            {/* GPS Status Alert */}
            {gpsStatusMessage && (
              <div
                className={`text-[11px] font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-xl animate-fadeIn ${
                  gpsAccuracy !== null
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {gpsAccuracy !== null ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
                <span>{gpsStatusMessage}</span>
              </div>
            )}

            {/* City Selector */}
            <div className="space-y-1 pt-0.5">
              <label className="text-xs font-semibold text-slate-700">{t.cityLabel}</label>
              <SearchableSelect
                value={selectedCity}
                onChange={handleCityChange}
                placeholder={t.selectCity || 'Search district / city in Tamil Nadu...'}
                searchPlaceholder="Type district name..."
                options={TAMIL_NADU_CITIES.map((c) => ({
                  value: c.name,
                  label: localizeContent(c.name, language),
                  sublabel: c.district !== c.name ? `${localizeContent(c.district, language)} District` : 'District Hub',
                  badge: c.isPopular ? 'Popular' : undefined
                }))}
              />
            </div>

            {/* Manual Landmark Entry Input */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Landmark / Specific Area (Manual Entry):
                </label>
                {landmarkArea && (
                  <button
                    type="button"
                    onClick={() => setLandmarkArea('')}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-sky-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={landmarkArea}
                  onChange={(e) => handleManualLandmarkChange(e.target.value)}
                  placeholder="Type manual landmark, street name, or building..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-2xs transition-all"
                />
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between px-0.5">
                <span>Type exact landmark above, or pick from popular presets below:</span>
                {latitude && longitude ? (
                  <span className="font-mono text-slate-400 hidden sm:inline">
                    📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Landmark Presets for Selected City */}
            <div className="space-y-1 pt-1">
              <div className="text-xs text-slate-500 font-medium">{t.selectLandmark}:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
                {getLocationsByCity(selectedCity).map((loc) => (
                  <button
                    type="button"
                    key={loc.id}
                    onClick={() => selectLandmarkPreset(loc)}
                    className={`p-2 rounded-lg text-[11px] font-medium text-left transition-all border ${
                      landmarkArea.includes(loc.name)
                        ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold shadow-xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                    }`}
                  >
                    <div className="truncate font-semibold">{localizeContent(loc.name, language)}</div>
                    <div className="text-[10px] text-slate-400 truncate">{localizeContent(loc.area || loc.district, language)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Embedded Interactive Map for Exact Pinning */}
            {showMapPicker && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[11px] text-slate-500 italic">
                  {t.clickMapInstruction}
                </p>
                <div className="h-48 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                  <VelloreMapView
                    user={recruiter}
                    jobs={[]}
                    radiusKm={5}
                    selectableLocation={true}
                    selectedCoordinates={{ lat: latitude, lng: longitude }}
                    onSelectCoordinates={handleMapCoordinateSelect}
                    quickLocations={TAMIL_NADU_LOCATIONS.filter(l => l.popular)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Trust & Safety Pre-flight Advisory */}
          {(() => {
            const draftJob: Job = {
              id: 'draft',
              recruiter_id: recruiter.id,
              title: title.trim() || 'Job Posting',
              description: description.trim(),
              category,
              required_skills: requiredSkills,
              payout_amount: Number(payoutAmount) || 0,
              payout_unit: payoutUnit,
              latitude,
              longitude,
              landmark_area: landmarkArea || `${selectedCity} Central, Tamil Nadu`,
              status: 'OPEN',
              claimed_by: null,
              created_at: new Date().toISOString()
            };
            const assessment = (title.trim() && (description.trim() || payoutAmount))
              ? trustSafetyService.evaluateJobTrust(draftJob, recruiter, [], 0)
              : null;

            if (assessment && assessment.status === 'potential_risk_detected') {
              return (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Trust & Safety Advisory: Potential Risk Signals Detected</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    {assessment.recommendedAction}
                  </p>
                  <div className="space-y-1 pt-1">
                    {assessment.riskSignals.map((sig, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 font-medium text-amber-900">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                        <span><strong>{sig.label}:</strong> {sig.description}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-amber-700 italic pt-0.5">
                    Note: You may still post your job. Talent2Task transparently displays safety advisories to help workers evaluate gigs safely.
                  </p>
                </div>
              );
            }
            return null;
          })()}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-sky-500 via-sky-400 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{t.publishJobBtn}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
