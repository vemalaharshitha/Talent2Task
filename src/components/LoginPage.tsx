import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, 
  Eye, 
  EyeOff, 
  LockKeyhole, 
  MapPin,
  UserRound,
  Languages,
  ChevronDown,
  Sparkles,
  Phone,
  Navigation,
  Plus,
  UserPlus,
  LogIn,
  Check,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Home,
  Signpost
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Language, User, TimeSlot, Role } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  TAMIL_NADU_CITIES, 
  TAMIL_NADU_LOCATIONS,
  requestBrowserLocation,
  getLocationsByCity,
  getClosestLandmark 
} from '../services/geoService';
import { ALL_SKILL_OPTIONS, TIME_SLOT_OPTIONS, localizeContent } from '../i18n/translations';
import { SearchableSelect } from './common/SearchableSelect';
import { SdgImpactRotator } from './common/SdgImpactRotator';
import logoImg from '../assets/logo.png';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onCreateAccount: (userData: Omit<User, 'id' | 'created_at'>) => User;
  users: User[];
}

const LANGUAGE_OPTIONS: { code: Language; label: string; nativeName: string }[] = [
  { code: 'en', label: 'EN', nativeName: 'English' },
  { code: 'ta', label: 'தமிழ்', nativeName: 'தமிழ் (Tamil)' },
  { code: 'hi', label: 'हिन्दी', nativeName: 'हिन्दी (Hindi)' },
  { code: 'te', label: 'తెలుగు', nativeName: 'తెలుగు (Telugu)' }
];

const RECRUITER_INDUSTRIES = [
  'Retail & Supermarket',
  'Delivery & Logistics',
  'Restaurant & Catering',
  'Electrical & Plumbing Services',
  'Security & Facility Management',
  'Housekeeping & Cleaning',
  'Education & Tutoring',
  'General Business & Events'
];

// Password Policy: 8-12 characters, at least 1 number, at least 1 special character
export const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]).{8,12}$/;

export const validatePassword = (pwd: string, fallbackMsg?: string): { isValid: boolean; error?: string } => {
  if (!pwd) {
    return { isValid: false, error: 'Please enter a password.' };
  }
  if (pwd.length < 8 || pwd.length > 12) {
    return { isValid: false, error: fallbackMsg || 'Password must be 8 to 12 characters in length.' };
  }
  if (!/[0-9]/.test(pwd)) {
    return { isValid: false, error: 'Password must contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(pwd)) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&* etc.).' };
  }
  if (!PASSWORD_REGEX.test(pwd)) {
    return { isValid: false, error: fallbackMsg || 'Password must be 8-12 characters with at least 1 number and 1 special character.' };
  }
  return { isValid: true };
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onCreateAccount, users }) => {
  const { language, setLanguage, t } = useLanguage();
  
  // Auth Mode: 'signin' or 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Role: 'seeker' (Job Seeker) or 'recruiter' (Job Recruiter)
  const [selectedRole, setSelectedRole] = useState<Role>('seeker');

  // Multi-step registration: Step 1 (Account Info) -> Step 2 (Experience & Location)
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Common Form Fields
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  
  // Step 1 Signup Fields
  const [name, setName] = useState('');

  // Step 2 Signup Fields
  const [age, setAge] = useState<number>(24);
  const [experience, setExperience] = useState<number>(2);
  const [selectedCity, setSelectedCity] = useState<string>('Chennai');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('chn_guindy');
  const [latitude, setLatitude] = useState<number>(13.0067);
  const [longitude, setLongitude] = useState<number>(80.2030);
  const [skillsList, setSkillsList] = useState<string[]>(ALL_SKILL_OPTIONS);
  const [skills, setSkills] = useState<string[]>(['Driving', 'Delivery', 'Tamil Speaking']);
  const [customSkill, setCustomSkill] = useState('');
  const [freeTimeSlots, setFreeTimeSlots] = useState<TimeSlot[]>(['Evening', 'Weekend', 'Immediate']);
  const [recruiterIndustry] = useState<string>(RECRUITER_INDUSTRIES[0]);
  // Dedicated Recruiter Workplace Location Fields
  const [recruiterDoorNo, setRecruiterDoorNo] = useState<string>('');
  const [recruiterStreetName, setRecruiterStreetName] = useState<string>('');
  const [recruiterLandmark, setRecruiterLandmark] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsSuccessNote, setGpsSuccessNote] = useState<string | null>(null);
  const [gpsErrorNote, setGpsErrorNote] = useState<string | null>(null);

  // Dropdown UI
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = LANGUAGE_OPTIONS.find(l => l.code === language) || LANGUAGE_OPTIONS[0];

  // Mode change handler
  const handleModeChange = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setSignupStep(1);
    setStep1Error(null);
    setSignInError(null);
  };

  // Phone number change handler (STRICT: only digits, max 10 digits)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(digitsOnly);
    setStep1Error(null);
    setSignInError(null);
  };

  // City change handler
  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    setGpsSuccessNote(null);
    setGpsErrorNote(null);
    const cityObj = TAMIL_NADU_CITIES.find(c => c.name === cityName);
    if (cityObj) {
      setLatitude(cityObj.lat);
      setLongitude(cityObj.lng);
    }
    const cityLocs = getLocationsByCity(cityName);
    if (cityLocs.length > 0) {
      setSelectedLocationId(cityLocs[0].id);
      setLatitude(cityLocs[0].lat);
      setLongitude(cityLocs[0].lng);
      setRecruiterLandmark(cityLocs[0].name);
    }
  };

  // Landmark change handler
  const handleLocationChange = (locId: string) => {
    setSelectedLocationId(locId);
    const loc = TAMIL_NADU_LOCATIONS.find(l => l.id === locId);
    if (loc) {
      setLatitude(loc.lat);
      setLongitude(loc.lng);
      setRecruiterLandmark(loc.name);
    }
  };

  // Accurate Live GPS Fetch
  const handleFetchGps = async () => {
    setIsLocating(true);
    setGpsSuccessNote(null);
    setGpsErrorNote(null);
    try {
      const res = await requestBrowserLocation();
      setLatitude(res.latitude);
      setLongitude(res.longitude);
      if (res.city) {
        setSelectedCity(res.city);
        const cityLocs = getLocationsByCity(res.city);
        if (cityLocs.length > 0) {
          setSelectedLocationId(cityLocs[0].id);
          setRecruiterLandmark(cityLocs[0].name);
        }
      }
      setGpsSuccessNote(`GPS Live: ${res.latitude.toFixed(4)}° N, ${res.longitude.toFixed(4)}° E (±${res.accuracy}m • ${res.city || 'Tamil Nadu'})`);
    } catch (err: any) {
      setGpsErrorNote(err.message || 'Unable to access GPS. Please select your city manually.');
    } finally {
      setIsLocating(false);
    }
  };

  // Toggle Skill
  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed) {
      if (!skillsList.includes(trimmed)) {
        setSkillsList(prev => [trimmed, ...prev]);
      }
      if (!skills.includes(trimmed)) {
        setSkills(prev => [...prev, trimmed]);
      }
      setCustomSkill('');
    }
  };

  // Toggle Time Slot
  const toggleTimeSlot = (slot: TimeSlot) => {
    if (freeTimeSlots.includes(slot)) {
      setFreeTimeSlots(freeTimeSlots.filter(s => s !== slot));
    } else {
      setFreeTimeSlots([...freeTimeSlots, slot]);
    }
  };

  // Step 1 Validation -> Next Step
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep1Error(null);

    if (!name.trim()) {
      setStep1Error('Please enter your full name.');
      return;
    }
    if (name.trim().length < 2) {
      setStep1Error('Full name must be at least 2 characters.');
      return;
    }
    if (!phoneNumber) {
      setStep1Error('Please enter your 10-digit mobile phone number.');
      return;
    }
    if (phoneNumber.length !== 10) {
      setStep1Error(t.phoneExact10DigitsError || 'Mobile phone number must be exactly 10 digits.');
      return;
    }
    // Validate password with regex: 8-12 characters, at least 1 number, at least 1 special character
    const pwdValidation = validatePassword(password, t.passwordRegexError);
    if (!pwdValidation.isValid) {
      setStep1Error(pwdValidation.error || t.passwordRegexError);
      return;
    }

    setSignupStep(2);
  };

  // Handle Form Final Submit
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (mode === 'signup') {
      if (signupStep === 1) {
        handleNextStep(event);
        return;
      }

      // Final Step 2 submission
      let finalSkills = [...skills];
      if (selectedRole === 'seeker') {
        if (customSkill.trim()) {
          const trimmed = customSkill.trim();
          if (!finalSkills.includes(trimmed)) {
            finalSkills.push(trimmed);
          }
        }
      } else {
        // Recruiter: add industry
        finalSkills = [recruiterIndustry, 'Recruiter', 'Business Hiring'];
      }

      // Format mobile number as: +91 98401 23456
      const formattedPhone = `+91 ${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`;

      let chosenLandmark = '';
      let recruiterFullAddress = '';
      if (selectedRole === 'recruiter') {
        const selectedLocObj = TAMIL_NADU_LOCATIONS.find(l => l.id === selectedLocationId);
        chosenLandmark = recruiterLandmark.trim() || selectedLocObj?.name || getClosestLandmark(latitude, longitude);
        recruiterFullAddress = [
          recruiterDoorNo.trim(),
          recruiterStreetName.trim(),
          chosenLandmark,
          selectedCity ? `${selectedCity}, Tamil Nadu` : 'Tamil Nadu'
        ].filter(Boolean).join(', ');
      }

      // Create new user in SQLite Database
      const newUser = onCreateAccount({
        role: selectedRole,
        name: name.trim(),
        age: selectedRole === 'seeker' ? (Number(age) || 24) : 0,
        phone: formattedPhone,
        skills: finalSkills,
        free_time_slots: selectedRole === 'seeker' ? freeTimeSlots : ['Morning', 'Evening'],
        preferred_language: language,
        latitude,
        longitude,
        experience: selectedRole === 'seeker' ? Math.max(0, Number(experience) || 0) : 0,
        city: selectedCity,
        district: selectedCity,
        door_no: selectedRole === 'recruiter' ? recruiterDoorNo.trim() : undefined,
        street_name: selectedRole === 'recruiter' ? recruiterStreetName.trim() : undefined,
        landmark: selectedRole === 'recruiter' ? chosenLandmark : (TAMIL_NADU_LOCATIONS.find(l => l.id === selectedLocationId)?.name || getClosestLandmark(latitude, longitude)),
        address: selectedRole === 'recruiter' ? (recruiterFullAddress || `${chosenLandmark}, ${selectedCity}, Tamil Nadu`) : `${selectedCity}, Tamil Nadu`
      });

      // Confetti Effect
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }

      onLogin(newUser);
    } else {
      // Sign In mode
      setSignInError(null);

      if (!phoneNumber) {
        setSignInError('Please enter your 10-digit mobile phone number.');
        return;
      }
      if (phoneNumber.length !== 10) {
        setSignInError(t.phoneExact10DigitsError || 'Mobile phone number must be exactly 10 digits.');
        return;
      }
      if (!password) {
        setSignInError('Please enter your password.');
        return;
      }
      const pwdValidation = validatePassword(password, t.passwordRegexError);
      if (!pwdValidation.isValid) {
        setSignInError(pwdValidation.error || t.passwordRegexError);
        return;
      }

      // Strict phone matching: ONLY match against 10-digit mobile number!
      // u.phone in DB may be "+91 98401 23456" or "+919840123456" or "9840123456"
      let matchedUser = users.find(u => {
        if (u.role !== selectedRole) return false;
        const userDigits = u.phone.replace(/\D/g, '');
        return userDigits.endsWith(phoneNumber) || userDigits === phoneNumber;
      });

      // If not found in selected role, check if registered under the other role
      if (!matchedUser) {
        const otherRoleUser = users.find(u => {
          const userDigits = u.phone.replace(/\D/g, '');
          return userDigits.endsWith(phoneNumber) || userDigits === phoneNumber;
        });
        if (otherRoleUser) {
          const otherRoleName = otherRoleUser.role === 'seeker' ? t.roleSeeker : t.roleRecruiter;
          setSignInError(
            `Mobile number +91 ${phoneNumber} is registered as ${otherRoleName}. Please switch role above to sign in.`
          );
          return;
        }
      }

      if (matchedUser) {
        onLogin(matchedUser);
      } else {
        // If user entered demo or custom credentials, check if any user exists or create temporary seeker
        const fallbackMatch = users.find(u => u.role === selectedRole);
        if (fallbackMatch && (phoneNumber === '9840123456' || phoneNumber === '9944011223' || phoneNumber === '9443267890')) {
          onLogin(fallbackMatch);
          return;
        }
        setSignInError(
          `No account registered with +91 ${phoneNumber}. Please click "Create Account" to register.`
        );
      }
    }
  };

  const availableLandmarks = getLocationsByCity(selectedCity);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 relative overflow-x-hidden flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(14,165,233,.12),transparent_32%),radial-gradient(circle_at_85%_82%,rgba(56,189,248,.08),transparent_28%)] pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full border border-sky-500/10 -top-36 -left-24 pointer-events-none" />
      <div className="absolute w-80 h-80 rounded-full border border-slate-200 -bottom-28 -right-16 pointer-events-none" />

      {/* Language Selector in top right corner of login screen */}
      <div className="absolute top-4 right-4 z-20" ref={langDropdownRef}>
        <button
          type="button"
          onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/95 hover:bg-white text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold transition-all shadow-sm backdrop-blur-md cursor-pointer"
        >
          <Languages className="w-4 h-4 text-sky-600" />
          <span>{currentLangObj.nativeName}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {isLangDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 animate-fadeIn">
            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
              Language / மொழி / भाषा / భాష
            </div>
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLanguage(opt.code);
                  setIsLangDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
                  language === opt.code
                    ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{opt.nativeName}</span>
                {language === opt.code && (
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
        
        {/* Left SDG Impact Panel (5 cols on desktop - Both Sign In & Sign Up) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col h-full">
          <SdgImpactRotator language={language} variant="desktop-panel" />
        </div>

        {/* Right Form Panel (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 bg-white flex flex-col justify-between overflow-y-auto max-h-[92vh]">
          <div>
            <div className="lg:hidden flex items-center justify-center gap-2 mb-5 font-heading text-2xl font-black text-slate-900">
              <img src={logoImg} alt="Talent2Task" className="w-9 h-9 object-contain" />
              Talent<span className="text-sky-500">2</span>Task
            </div>

            {/* Mode Switcher Tabs: Sign In vs Create Account */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => handleModeChange('signin')}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white text-sky-600 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{t.tabSignIn}</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('signup')}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.tabCreateAccount}</span>
              </button>
            </div>

            {/* Header Titles */}
            <p className="text-sky-600 text-xs font-bold tracking-wider uppercase">
              {mode === 'signin' ? t.loginWelcome : t.newUserRegistration}
            </p>
            <h2 className="font-heading text-xl sm:text-2xl font-bold mt-1 text-slate-900">
              {mode === 'signin' ? t.loginHeading : t.joinTalent2Task}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {mode === 'signin' 
                ? t.loginSubtitle 
                : t.createAccountSubtitle}
            </p>

            {/* In Signup Mode: 2-Step Progress Indicator */}
            {mode === 'signup' && (
              <div className="flex items-center gap-2 mt-4 mb-2">
                <div 
                  onClick={() => setSignupStep(1)}
                  className={`flex-1 py-2 px-3 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                    signupStep === 1 
                      ? 'bg-sky-500 text-white shadow-xs' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {signupStep > 1 ? '✓ ' + t.stepAccountInfo : t.stepAccountInfo}
                </div>
                <div 
                  className={`flex-1 py-2 px-3 rounded-xl text-center text-xs font-bold transition-all ${
                    signupStep === 2 
                      ? 'bg-sky-500 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {selectedRole === 'seeker' ? t.stepLocationExperience : t.stepLocationDetails}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              
              {/* ===================== ROLE SELECTOR (SIGN IN & SIGNUP STEP 1) ===================== */}
              {(mode === 'signin' || (mode === 'signup' && signupStep === 1)) && (
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    {t.selectRoleLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('seeker')}
                      className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedRole === 'seeker'
                          ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <UserRound className="w-4 h-4" />
                      <span>{t.roleSeeker}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('recruiter')}
                      className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedRole === 'recruiter'
                          ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>{t.roleRecruiter}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ===================== STEP 1 FIELDS (SIGNUP OR SIGNIN) ===================== */}
              {(mode === 'signin' || (mode === 'signup' && signupStep === 1)) && (
                <>
                  {/* Full Name (Signup only) */}
                  {mode === 'signup' && (
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                      {t.fullNameLabel} *
                      <div className="relative mt-1.5">
                        <UserRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          value={name} 
                          onChange={event => setName(event.target.value)} 
                          required 
                          placeholder={selectedRole === 'seeker' ? t.fullNamePlaceholder : 'e.g. Ramesh Kumar / Chennai Mart'} 
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20" 
                        />
                      </div>
                    </label>
                  )}

                  {/* Mobile Phone Number with fixed +91 prefix and strict 10 digits */}
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                    {t.mobilePhoneLabel} *
                    <div className="relative mt-1.5 flex rounded-xl border border-slate-200 bg-slate-50 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20 transition-all overflow-hidden shadow-xs">
                      {/* +91 Country Code Prefix Badge */}
                      <div className="flex items-center gap-1.5 px-3 bg-slate-100/90 border-r border-slate-200 text-slate-800 font-bold text-xs sm:text-sm select-none shrink-0">
                        <span className="text-sm leading-none">🇮🇳</span>
                        <span className="font-mono text-slate-700 font-bold tracking-wide">+91</span>
                      </div>

                      {/* 10-Digit Mobile Input */}
                      <div className="relative flex-1 flex items-center">
                        <Phone className="absolute left-2.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input 
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]{10}"
                          maxLength={10}
                          value={phoneNumber} 
                          onChange={handlePhoneChange} 
                          required 
                          placeholder="98765 43210" 
                          className="w-full bg-transparent py-2.5 pl-9 pr-3 text-xs sm:text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal" 
                        />
                      </div>
                    </div>
                  </label>

                  {/* Password */}
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                    {t.loginPasswordLabel} *
                    <div className="relative mt-1.5">
                      <LockKeyhole className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        value={password} 
                        onChange={event => {
                          setPassword(event.target.value.slice(0, 12));
                          if (step1Error) setStep1Error(null);
                          if (signInError) setSignInError(null);
                        }} 
                        required 
                        maxLength={12}
                        type={showPassword ? 'text' : 'password'} 
                        placeholder={t.loginPasswordPlaceholder} 
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === 'signup' && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        {t.passwordRegexHint}
                      </p>
                    )}
                  </label>

                  {/* Sign In Error Message */}
                  {mode === 'signin' && signInError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{signInError}</span>
                    </div>
                  )}

                  {/* Step 1 Error Message */}
                  {mode === 'signup' && step1Error && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{step1Error}</span>
                    </div>
                  )}

                  {/* Remember me & Forgot Password (Signin only) */}
                  {mode === 'signin' && (
                    <div className="flex justify-between text-xs items-center pt-1">
                      <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                        <input type="checkbox" className="accent-sky-500 rounded" defaultChecked />
                        <span>{t.loginRememberMe}</span>
                      </label>
                      <button type="button" className="text-sky-600 hover:text-sky-700 font-medium cursor-pointer">
                        {t.loginForgotPassword}
                      </button>
                    </div>
                  )}

                  {/* Action Button: Sign In or Next -> */}
                  {mode === 'signin' ? (
                    <button 
                      type="submit" 
                      className="w-full rounded-xl py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg shadow-sky-500/20 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{t.tabSignIn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleNextStep}
                      className="w-full rounded-xl py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg shadow-sky-500/20 cursor-pointer"
                    >
                      <span>{t.nextStepBtn}</span>
                    </button>
                  )}
                </>
              )}

              {/* ===================== STEP 2: EXPERIENCE & LOCATION SETUP (SIGNUP ONLY) ===================== */}
              {mode === 'signup' && signupStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Role Confirmation Header Pill */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-800">
                    <span className="flex items-center gap-1.5">
                      {selectedRole === 'seeker' ? <UserRound className="w-3.5 h-3.5 text-sky-600" /> : <Briefcase className="w-3.5 h-3.5 text-sky-600" />}
                      <span>Role: <strong>{selectedRole === 'seeker' ? t.roleSeeker : t.roleRecruiter}</strong></span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="text-sky-600 hover:text-sky-700 underline font-bold cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {/* Experience & Age Grid (Seeker Only) */}
                  {selectedRole === 'seeker' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                        {t.yearsOfExperienceLabel} *
                        <div className="relative mt-1.5">
                          <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <input 
                            type="number"
                            min="0"
                            max="50"
                            value={experience} 
                            onChange={e => setExperience(Math.max(0, Math.min(50, Number(e.target.value) || 0)))} 
                            required={selectedRole === 'seeker'} 
                            placeholder="e.g. 2" 
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20" 
                          />
                        </div>
                      </label>

                      <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                        {t.ageLabel} *
                        <input 
                          type="number"
                          min="16"
                          max="80"
                          value={age} 
                          onChange={e => setAge(Number(e.target.value) || 18)} 
                          required={selectedRole === 'seeker'} 
                          className="w-full mt-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20" 
                        />
                      </label>
                    </div>
                  )}

                  {/* If Job Seeker: Standard Preferred Location Block */}
                  {selectedRole === 'seeker' ? (
                    <>
                      <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-sky-600" />
                            <span>{t.cityLabel}</span>
                          </span>

                          <button
                            type="button"
                            onClick={handleFetchGps}
                            disabled={isLocating}
                            className="text-[11px] font-bold text-white bg-sky-500 hover:bg-sky-600 px-3 py-1 rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-70"
                          >
                            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                            <span>{isLocating ? t.locating : t.useGpsBtn}</span>
                          </button>
                        </div>

                        {/* GPS Status feedback note */}
                        {gpsSuccessNote && (
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{gpsSuccessNote}</span>
                          </div>
                        )}
                        {gpsErrorNote && (
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{gpsErrorNote}</span>
                          </div>
                        )}

                        {/* Tamil Nadu District / City Searchable Dropdown */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            {t.cityLabel}
                          </label>
                          <SearchableSelect
                            value={selectedCity}
                            onChange={handleCityChange}
                            placeholder={t.selectCity || 'Search district / city in Tamil Nadu...'}
                            searchPlaceholder="Type district name (e.g. Salem, Madurai, Hosur)..."
                            emptyMessage="No districts found"
                            options={TAMIL_NADU_CITIES.map(city => ({
                              value: city.name,
                              label: localizeContent(city.name, language),
                              sublabel: city.district !== city.name ? `${localizeContent(city.district, language)} District` : 'District Hub',
                              badge: city.isPopular ? 'Popular' : undefined
                            }))}
                          />
                        </div>

                        {/* Accurate Landmarks for selected City / District with Search Option */}
                        {availableLandmarks.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-semibold text-slate-700">
                                {t.selectLandmark}
                              </label>
                              <span className="text-[10px] font-medium text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-md">
                                {availableLandmarks.length} in {localizeContent(selectedCity, language)}
                              </span>
                            </div>
                            <SearchableSelect
                              value={selectedLocationId}
                              onChange={handleLocationChange}
                              placeholder={`Search landmark in ${localizeContent(selectedCity, language)}...`}
                              searchPlaceholder={`Search landmark in ${localizeContent(selectedCity, language)}...`}
                              emptyMessage={`No landmarks found in ${localizeContent(selectedCity, language)}`}
                              options={availableLandmarks.map(loc => ({
                                value: loc.id,
                                label: localizeContent(loc.name, language),
                                sublabel: loc.area 
                                  ? `${localizeContent(loc.area, language)} • ${loc.category}`
                                  : `${loc.city} • ${loc.category}`,
                                badge: loc.popular ? 'Key Hub' : undefined
                              }))}
                            />
                          </div>
                        )}

                        <p className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>{t.coordinates}:</span>
                          <span className="font-mono font-bold text-slate-700">{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</span>
                        </p>
                      </div>

                      {/* Skills Selection */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                          {t.skillsOffered} ({skills.length} {t.skillsSelected})
                        </label>
                        
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                          {skillsList.map(skill => {
                            const isSelected = skills.includes(skill);
                            const localizedSkill = localizeContent(skill, language);
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => toggleSkill(skill)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                  isSelected
                                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                                <span>{localizedSkill}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Skill Adder */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <input
                            type="text"
                            placeholder={t.addCustomSkillPlaceholder}
                            value={customSkill}
                            onChange={e => setCustomSkill(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustomSkill();
                              }
                            }}
                            className="flex-1 rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs outline-none focus:border-sky-500"
                          />
                          <button
                            type="button"
                            onClick={addCustomSkill}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Time Slots */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                          {t.availableTimeSlots}
                        </label>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {TIME_SLOT_OPTIONS.map(slot => {
                            const isSelected = freeTimeSlots.includes(slot as TimeSlot);
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => toggleTimeSlot(slot as TimeSlot)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-sky-500 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                }`}
                              >
                                {localizeContent(slot, language)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* If Job Recruiter: Structured Workplace Location Card with Door No, Street Name, Landmark, City/District */
                    <>
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50/80 via-slate-50 to-blue-50/50 border border-sky-200/90 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs">
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-slate-900">
                              {t.recruiterLocationTitle || 'Workplace & Business Location'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={handleFetchGps}
                            disabled={isLocating}
                            className="text-[11px] font-bold text-white bg-sky-500 hover:bg-sky-600 px-3 py-1 rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-70"
                          >
                            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                            <span>{isLocating ? t.locating : t.useGpsBtn}</span>
                          </button>
                        </div>

                        {/* GPS Status feedback note */}
                        {gpsSuccessNote && (
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{gpsSuccessNote}</span>
                          </div>
                        )}
                        {gpsErrorNote && (
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{gpsErrorNote}</span>
                          </div>
                        )}

                        {/* 1. City or District */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            {t.cityOrDistrictLabel || 'City or District'} *
                          </label>
                          <SearchableSelect
                            value={selectedCity}
                            onChange={handleCityChange}
                            placeholder={t.selectCity || 'Search district / city in Tamil Nadu...'}
                            searchPlaceholder="Type district name (e.g. Chennai, Vellore, Coimbatore)..."
                            emptyMessage="No districts found"
                            options={TAMIL_NADU_CITIES.map(city => ({
                              value: city.name,
                              label: localizeContent(city.name, language),
                              sublabel: city.district !== city.name ? `${localizeContent(city.district, language)} District` : 'District Hub',
                              badge: city.isPopular ? 'Popular' : undefined
                            }))}
                          />
                        </div>

                        {/* 2. Door No & Street Name (2 Column Grid) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                              <Home className="w-3.5 h-3.5 text-sky-600" />
                              <span>{t.doorNoLabel || 'Door / Flat / Shop No.'} *</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={recruiterDoorNo}
                              onChange={e => setRecruiterDoorNo(e.target.value)}
                              placeholder={t.doorNoPlaceholder || 'e.g. Door No. 14/B, 2nd Floor'}
                              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-sky-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                              <Signpost className="w-3.5 h-3.5 text-sky-600" />
                              <span>{t.streetNameLabel || 'Street Name / Road'} *</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={recruiterStreetName}
                              onChange={e => setRecruiterStreetName(e.target.value)}
                              placeholder={t.streetNamePlaceholder || 'e.g. Anna Salai, Gandhi Street'}
                              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-sky-500"
                            />
                          </div>
                        </div>

                        {/* 3. Landmark */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-sky-600" />
                              <span>{t.landmarkFieldLabel || 'Landmark (Closest Hub)'} *</span>
                            </span>
                            <span className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
                              {availableLandmarks.length} in {localizeContent(selectedCity, language)}
                            </span>
                          </label>

                          <input
                            type="text"
                            required
                            value={recruiterLandmark}
                            onChange={e => setRecruiterLandmark(e.target.value)}
                            placeholder={t.landmarkFieldPlaceholder || 'e.g. Near Old Bus Stand / Opp. Bank'}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-sky-500"
                          />

                          {availableLandmarks.length > 0 && (
                            <div className="pt-1">
                              <SearchableSelect
                                value={selectedLocationId}
                                onChange={handleLocationChange}
                                placeholder={`Or pick preset landmark in ${localizeContent(selectedCity, language)}...`}
                                searchPlaceholder="Filter landmarks..."
                                emptyMessage="No preset landmarks"
                                options={availableLandmarks.map(loc => ({
                                  value: loc.id,
                                  label: localizeContent(loc.name, language),
                                  sublabel: loc.area ? `${localizeContent(loc.area, language)} • ${loc.category}` : `${loc.city}`,
                                  badge: loc.popular ? 'Key Hub' : undefined
                                }))}
                              />
                            </div>
                          )}
                        </div>

                        {/* Coordinates & GPS info */}
                        <div className="pt-1 border-t border-sky-100/80 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{t.coordinates}:</span>
                          <span className="font-mono font-bold text-slate-700">{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 2 Action Buttons: Back + Create Account */}
                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center transition cursor-pointer"
                    >
                      <span>{t.backStepBtn}</span>
                    </button>

                    <button 
                      type="submit" 
                      className="flex-1 rounded-xl py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg shadow-sky-500/20 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{t.tabCreateAccount}</span>
                    </button>
                  </div>

                </div>
              )}

            </form>

            {/* Toggle Sign In / Sign Up Link */}
            <p className="mt-6 text-center text-xs text-slate-500">
              {mode === 'signin' ? t.loginNewPrompt : t.alreadyRegisteredPrompt} {' '}
              <button 
                type="button" 
                onClick={() => handleModeChange(mode === 'signin' ? 'signup' : 'signin')}
                className="font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer"
              >
                {mode === 'signin' ? t.tabCreateAccount : t.tabSignIn}
              </button>
            </p>

            {/* Mobile / Tablet SDG Impact Rotator (Shown in Both Sign In & Sign Up) */}
            <div className="lg:hidden mt-6 pt-5 border-t border-slate-200">
              <SdgImpactRotator language={language} variant="mobile-card" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
