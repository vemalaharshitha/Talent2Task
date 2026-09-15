import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Cpu, 
  Users, 
  Building2, 
  Globe2, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import type { Language } from '../../types';
import logoImg from '../../assets/logo.png';

export interface SdgImpactRotatorProps {
  language: Language;
  className?: string;
  variant?: 'desktop-panel' | 'mobile-card' | 'compact';
}

interface SdgData {
  id: number;
  sdgNumber: string;
  sdgShort: string;
  cardIndex: string;
  colorHex: string;
  bgGradient: string;
  borderClass: string;
  badgeBg: string;
  badgeText: string;
  accentText: string;
  lightBg: string;
  pillBg: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  unTarget: {
    en: string;
    ta: string;
    hi: string;
    te: string;
  };
  title: {
    en: string;
    ta: string;
    hi: string;
    te: string;
  };
  statement: {
    en: string;
    ta: string;
    hi: string;
    te: string;
  };
  impactBadge: {
    en: string;
    ta: string;
    hi: string;
    te: string;
  };
  keyPillars: {
    en: string[];
    ta: string[];
    hi: string[];
    te: string[];
  };
}

const SDG_LIST: SdgData[] = [
  {
    id: 8,
    sdgNumber: 'SDG 8',
    sdgShort: '8',
    cardIndex: '1 / 4',
    colorHex: '#A21942', // Official UN SDG 8 Burgundy
    bgGradient: 'from-rose-500/10 via-pink-500/5 to-amber-500/5',
    borderClass: 'border-rose-200',
    badgeBg: 'bg-[#A21942]',
    badgeText: 'text-white',
    accentText: 'text-[#A21942]',
    lightBg: 'bg-rose-50/90',
    pillBg: 'bg-rose-100 text-rose-900 border-rose-200',
    icon: TrendingUp,
    unTarget: {
      en: 'Target 8.5 • Decent Work & Equal Pay',
      ta: 'இலக்கு 8.5 • கண்ணியமான வேலை & சம ஊதியம்',
      hi: 'लक्ष्य 8.5 • सम्मानजनक कार्य और समान वेतन',
      te: 'లక్ష్యం 8.5 • మంచి పని మరియు సమాన వేతనం'
    },
    title: {
      en: 'DECENT WORK & ECONOMIC GROWTH',
      ta: 'கண்ணியமான வேலை & பொருளாதார வளர்ச்சி',
      hi: 'सम्मानजनक कार्य और आर्थिक विकास',
      te: 'మంచి పని మరియు ఆర్థిక వృద్ధి'
    },
    statement: {
      en: 'Connecting people with local work opportunities and helping skills become income.',
      ta: 'மக்களுக்கு உள்ளூர் வேலை வாய்ப்புகளை வழங்கி, அவர்களின் திறமைகளை நேரடி வருமானமாக மாற்ற உதவுகிறோம்.',
      hi: 'लोगों को स्थानीय कार्य अवसरों से जोड़ना और कौशल को सीधे आय में बदलना।',
      te: 'ప్రజలను స్థానిక పని అవకాశాలతో అనుసంధానించడం మరియు నైపుణ్యాలను ఆదాయంగా మార్చడం.'
    },
    impactBadge: {
      en: 'Skill-to-Income Matching',
      ta: 'திறன்-வருமான பொருத்தம்',
      hi: 'कौशल-से-आय मिलान',
      te: 'నైపుణ్యం-ஆదాయ సరిపోలిక'
    },
    keyPillars: {
      en: ['Hyperlocal Gigs', 'Verified Skills', 'Fair Daily Wage'],
      ta: ['உள்ளூர் பணிகள்', 'சரிபார்க்கப்பட்ட திறன்கள்', 'நியாயமான ஊதியம்'],
      hi: ['स्थानीय कार्य', 'सत्यापित कौशल', 'उचित दैनिक वेतन'],
      te: ['స్థానిక పనులు', 'ధృవీకరించబడిన నైపుణ్యాలు', 'సమంజసమైన వేతనం']
    }
  },
  {
    id: 9,
    sdgNumber: 'SDG 9',
    sdgShort: '9',
    cardIndex: '2 / 4',
    colorHex: '#FD6925', // Official UN SDG 9 Rust Orange
    bgGradient: 'from-orange-500/10 via-amber-500/5 to-sky-500/5',
    borderClass: 'border-orange-200',
    badgeBg: 'bg-[#FD6925]',
    badgeText: 'text-white',
    accentText: 'text-[#E05316]',
    lightBg: 'bg-orange-50/90',
    pillBg: 'bg-orange-100 text-orange-950 border-orange-200',
    icon: Cpu,
    unTarget: {
      en: 'Target 9.c • Universal Digital Access & Innovation',
      ta: 'இலக்கு 9.c • டிஜிட்டல் அணுகல் & புதுமை',
      hi: 'लक्ष्य 9.c • डिजिटल पहुंच और नवाचार',
      te: 'లక్ష్యం 9.c • డిజిటల్ సదుపాయం & ఆవిష్కరణ'
    },
    title: {
      en: 'INDUSTRY, INNOVATION & INFRASTRUCTURE',
      ta: 'தொழில், புதுமை & உள்கட்டமைப்பு',
      hi: 'उद्योग, नवाचार और बुनियादी ढांचा',
      te: 'పరిశ్రమ, ఆవిష్కరణ మరియు మౌలిక సదుపాయాలు'
    },
    statement: {
      en: 'Using AI and digital infrastructure to connect local talent with local demand.',
      ta: 'செயற்கை நுண்ணறிவு மற்றும் டிஜிட்டல் உள்கட்டமைப்பு மூலம் உள்ளூர் திறமைகளை உள்ளூர் தேவைகளுடன் இணைக்கிறோம்.',
      hi: 'एआई और डिजिटल बुनियादी ढांचे का उपयोग करके स्थानीय प्रतिभा को स्थानीय मांग से जोड़ना।',
      te: 'AI మరియు డిజిటల్ మౌలిక సదుపాయాలను ఉపయోగించి స్థానిక ప్రతిభను స్థానిక డిమాండ్‌తో అనుసంధానించడం.'
    },
    impactBadge: {
      en: 'AI Matchmaking Engine',
      ta: 'AI பொருத்துதல் தொழில்நுட்பம்',
      hi: 'एआई मिलान इंजन',
      te: 'AI సరిపోలిక ఇంజిన్'
    },
    keyPillars: {
      en: ['AI Talent Radar', 'Instant Dispatch', 'Smart Map Search'],
      ta: ['AI திறனாளர் ரேடார்', 'உடனடி பணி ஒதுக்கீடு', 'ஸ்மார்ட் வரைபட தேடல்'],
      hi: ['एआई टैलेंट रडार', 'तत्काल प्रेषण', 'स्मार्ट मैप खोज'],
      te: ['AI టాలెంట్ రాడార్', 'తక్షణ కేటాయింపు', 'స్మార్ట్ మ్యాప్ శోధన']
    }
  },
  {
    id: 10,
    sdgNumber: 'SDG 10',
    sdgShort: '10',
    cardIndex: '3 / 4',
    colorHex: '#DD1367', // Official UN SDG 10 Magenta
    bgGradient: 'from-fuchsia-500/10 via-pink-500/5 to-purple-500/5',
    borderClass: 'border-pink-200',
    badgeBg: 'bg-[#DD1367]',
    badgeText: 'text-white',
    accentText: 'text-[#C20E57]',
    lightBg: 'bg-pink-50/90',
    pillBg: 'bg-pink-100 text-pink-950 border-pink-200',
    icon: Users,
    unTarget: {
      en: 'Target 10.2 • Inclusive Economic Opportunities for All',
      ta: 'இலக்கு 10.2 • அனைவருக்கும் சமமான வாய்ப்புகள்',
      hi: 'लक्ष्य 10.2 • सभी के लिए समावेशी अवसर',
      te: 'లక్ష్యం 10.2 • అందరికీ సమాన అవకాశాలు'
    },
    title: {
      en: 'REDUCED INEQUALITIES',
      ta: 'சமத்துவமின்மையைக் குறைத்தல்',
      hi: 'असमानताओं में कमी',
      te: 'అసమానతలను తగ్గించడం'
    },
    statement: {
      en: 'Making work opportunities more accessible across languages, locations and communities.',
      ta: 'மொழிகள், இருப்பிடங்கள் மற்றும் சமூகங்களை கடந்து அனைவருக்கும் வேலை வாய்ப்புகளை எளிதாகக் கிடைக்கச் செய்தல்.',
      hi: 'भाषाओं, स्थानों और समुदायों के बीच काम के अवसरों को अधिक सुलभ बनाना।',
      te: 'భాషలు, ప్రాంతాలు மற்றும் సంఘాలలో పని అవకాశాలను మరింత అందుబాటులోకి తీసుకురావడం.'
    },
    impactBadge: {
      en: 'Multilingual & Equal Access',
      ta: 'பல்மொழி & சமவாய்ப்பு',
      hi: 'बहुभाषी और समान पहुंच',
      te: 'బహుభాషా & సమాన ప్రాప్యత'
    },
    keyPillars: {
      en: ['4 Native Languages', 'Zero Entry Barriers', 'Voice-First Access'],
      ta: ['4 தாய்மொழிகள்', 'தடையில்லா நுழைவு', 'குரல்வழி அணுகல்'],
      hi: ['4 मातृभाषाएं', 'शून्य बाधा', 'आवाज-आधारित पहुंच'],
      te: ['4 మాతృభాషలు', 'అడ్డంకులు లేని ప్రవేశం', 'వాయిస్ ఆధారిత ప్రాప్యత']
    }
  },
  {
    id: 11,
    sdgNumber: 'SDG 11',
    sdgShort: '11',
    cardIndex: '4 / 4',
    colorHex: '#FD9D24', // Official UN SDG 11 Golden Amber
    bgGradient: 'from-amber-500/10 via-yellow-500/5 to-emerald-500/5',
    borderClass: 'border-amber-200',
    badgeBg: 'bg-[#FD9D24]',
    badgeText: 'text-slate-950 font-black',
    accentText: 'text-[#D97706]',
    lightBg: 'bg-amber-50/90',
    pillBg: 'bg-amber-100 text-amber-950 border-amber-200',
    icon: Building2,
    unTarget: {
      en: 'Target 11.a • Strong Hyperlocal Economic Links',
      ta: 'இலக்கு 11.a • உள்ளூர் பொருளாதார இணைப்பு',
      hi: 'लक्ष्य 11.a • मजबूत हाइपरलोकल आर्थिक संबंध',
      te: 'లక్ష్యం 11.a • బలమైన స్థానిక ఆర్థిక సంబంధాలు'
    },
    title: {
      en: 'SUSTAINABLE CITIES & COMMUNITIES',
      ta: 'நிலையான நகரங்கள் & சமூகங்கள்',
      hi: 'टिकाऊ शहर और समुदाय',
      te: 'సుస్థిర నగరాలు మరియు సమాజాలు'
    },
    statement: {
      en: 'Strengthening local communities through hyperlocal employment and skill-based opportunities.',
      ta: 'ஹைப்பர்லோகல் வேலைவாய்ப்பு மற்றும் திறன் அடிப்படையிலான வாய்ப்புகள் மூலம் உள்ளூர் சமூகங்களை வலுப்படுத்துதல்.',
      hi: 'हाइपरलोकल रोजगार और कौशल-आधारित अवसरों के माध्यम से स्थानीय समुदायों को मजबूत बनाना।',
      te: 'హైపర్‌లోకల్ ఉపాధి మరియు నైపుణ్య ఆధారిత అవకాశాల ద్వారా స్థానిక సంఘాలను బలోపేతం చేయడం.'
    },
    impactBadge: {
      en: 'Hyperlocal Community Resiliency',
      ta: 'உள்ளூர் சமூக மேம்பாடு',
      hi: 'ஹாइपरलोकल सामुदायिक लचीलापन',
      te: 'స్థానిక సమాజ బలోపేతం'
    },
    keyPillars: {
      en: ['Neighborhood Hiring', 'Zero Long Commutes', 'Local Circular Economy'],
      ta: ['அருகாமை பணியமர்த்தல்', 'நீண்ட பயணங்கள் தவிர்ப்பு', 'உள்ளூர் சுழற்சி பொருளாதாரம்'],
      hi: ['पड़ोस में भर्ती', 'लंबी यात्रा से मुक्ति', 'स्थानीय चक्रीय अर्थव्यवस्था'],
      te: ['సమీప నియామకం', 'సుదూర ప్రయాణాలు లేవు', 'స్థానిక వృత్తాకార ఆర్థిక వ్యవస్థ']
    }
  }
];

export const SdgImpactRotator: React.FC<SdgImpactRotatorProps> = ({
  language,
  className = '',
  variant = 'desktop-panel'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Pure 6-second continuous auto-rotation loop through all 4 SDGs
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % SDG_LIST.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const currentSdg = SDG_LIST[currentIndex];
  const IconComponent = currentSdg.icon;

  // Calculate underlay cards in the 3D stack
  const nextSdg = SDG_LIST[(currentIndex + 1) % SDG_LIST.length];
  const thirdSdg = SDG_LIST[(currentIndex + 2) % SDG_LIST.length];

  const headerTitle = 
    language === 'ta' ? 'டேலன்ட்2டாஸ்க்' :
    language === 'hi' ? 'टैलेंट2टास्क' :
    language === 'te' ? 'టాలెంట్2టాస్క్' :
    'TALENT2TASK';


  // ----------------------------------------------------
  // Variant 1: Desktop Panel Layout (Left 5-col panel)
  // ----------------------------------------------------
  if (variant === 'desktop-panel') {
    return (
      <div 
        className={`flex flex-col justify-between h-full p-8 lg:p-9 bg-gradient-to-br from-slate-50 via-white to-sky-50/40 border-r border-slate-200 transition-colors duration-700 relative overflow-hidden select-none ${className}`}
      >
        {/* Subtle Ambient Gradient Glow based on active SDG color */}
        <div 
          className={`absolute -top-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-br ${currentSdg.bgGradient} blur-3xl pointer-events-none transition-all duration-1000`}
        />
        <div 
          className={`absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-tl ${currentSdg.bgGradient} blur-3xl pointer-events-none transition-all duration-1000`}
        />

        {/* Top Header with Logo, Title & Badge */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-slate-200 shadow-2xs backdrop-blur-md">
              <Globe2 className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-800">
                {headerTitle}
              </span>
            </div>
          </div>

          {/* Project Logo & Title */}
          <div className="flex items-center gap-3.5 pt-0.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-400 to-sky-200 shadow-md shadow-sky-500/15 p-[2px] shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] overflow-hidden flex items-center justify-center p-0.5">
                <img 
                  src={logoImg} 
                  alt="Talent2Task Logo" 
                  className="w-full h-full object-contain" 
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
            <div>
              <div className="font-heading text-2xl lg:text-3xl font-black tracking-tight text-slate-900 flex items-center leading-tight">
                <span>Talent</span>
                <span className="text-sky-500 font-black mx-0.5">2</span>
                <span>Task</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'ta' ? 'உள்ளூர் திறனாளர் & வேலைவாய்ப்பு தளம்' :
                 language === 'hi' ? 'स्थानीय प्रतिभा और गिग कार्य मंच' :
                 language === 'te' ? 'స్థానిక నైపుణ్యాలు & గిగ్ వేదిక' :
                 'Hyperlocal Talent & Gig Matching Platform'}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            3D FLASHCARD STACK DECK MOCKUP (CONTINUOUS 6S AUTO-FLIP)
            ======================================================== */}
        <div className="relative z-10 my-auto py-6 flashcard-3d-scene">
          <div className="flashcard-deck-stack relative">
            
            {/* 3rd Layer Card Mockup in Background (Depth Layer) */}
            <div 
              style={{ borderColor: `${thirdSdg.colorHex}40` }}
              className="absolute inset-0 rounded-3xl bg-slate-100/70 border border-slate-200/80 shadow-md transform translate-y-4 scale-92 rotate-2 pointer-events-none opacity-40 transition-all duration-700"
            />

            {/* 2nd Layer Card Mockup (Physical Stack Depth) */}
            <div 
              style={{ borderColor: `${nextSdg.colorHex}60` }}
              className="absolute inset-0 rounded-3xl bg-slate-50/90 border border-slate-200 shadow-lg transform translate-y-2 scale-96 -rotate-1 pointer-events-none opacity-70 transition-all duration-700"
            >
              {/* Peek of next card top color ribbon */}
              <div 
                style={{ backgroundColor: nextSdg.colorHex }}
                className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl opacity-80"
              />
            </div>

            {/* Top Active Flashcard (In full 3D focus) */}
            <div 
              key={currentSdg.id}
              className={`p-6 sm:p-7 rounded-3xl bg-white/98 backdrop-blur-xl border ${currentSdg.borderClass} flashcard-emboss-border transition-all duration-500 ease-out transform animate-flashcard-3d relative overflow-hidden`}
            >
              {/* Official UN Color Top Ribbon Header */}
              <div 
                style={{ backgroundColor: currentSdg.colorHex }}
                className="absolute top-0 left-0 right-0 h-1.5 shadow-xs"
              />

              {/* Flashcard Header: SDG Badge, Impact Pill & Card Index */}
              <div className="flex items-center justify-between gap-2 mb-4 pt-1">
                <div className="flex items-center gap-2">
                  <span 
                    style={{ backgroundColor: currentSdg.colorHex }}
                    className="px-3 py-1.5 rounded-xl text-white text-xs font-black tracking-wider uppercase shadow-sm flex items-center gap-1.5"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-white" />
                    <span>{currentSdg.sdgNumber}</span>
                  </span>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${currentSdg.pillBg}`}>
                    {currentSdg.impactBadge[language] || currentSdg.impactBadge.en}
                  </span>
                </div>

                <div 
                  style={{ color: currentSdg.colorHex }}
                  className="text-xs font-black opacity-35 font-heading"
                >
                  #{currentSdg.sdgShort}
                </div>
              </div>

              {/* SDG Title */}
              <h2 className="font-heading text-lg lg:text-xl font-black text-slate-900 leading-snug tracking-tight uppercase mb-3">
                {currentSdg.title[language] || currentSdg.title.en}
              </h2>

              {/* Impact Statement */}
              <div className="relative pl-3.5 border-l-2 mb-4" style={{ borderColor: currentSdg.colorHex }}>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                  "{currentSdg.statement[language] || currentSdg.statement.en}"
                </p>
              </div>

              {/* 3D Flashcard Key Impact Pillars */}
              {currentSdg.keyPillars && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(currentSdg.keyPillars[language] || currentSdg.keyPillars.en).map((pillar, pIdx) => (
                    <span 
                      key={pIdx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/90 text-slate-800 text-[10px] font-bold border border-slate-200 shadow-2xs"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                      <span>{pillar}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* UN Target Metadata Tag Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{currentSdg.unTarget[language] || currentSdg.unTarget.en}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Variant 2: Mobile Card Layout (Shown on Mobile)
  // ----------------------------------------------------
  return (
    <div 
      className={`w-full rounded-2xl p-4 bg-gradient-to-br from-slate-50 via-white to-sky-50/40 border border-slate-200 shadow-sm relative overflow-hidden select-none ${className}`}
    >
      {/* Top Banner Tag with Logo & Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-sky-300 p-[1px] shrink-0">
            <div className="w-full h-full bg-white rounded-[7px] overflow-hidden flex items-center justify-center p-0.5">
              <img src={logoImg} alt="Talent2Task" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="font-heading text-sm font-black text-slate-900 leading-tight">
            Talent<span className="text-sky-500">2</span>Task
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 border border-slate-200">
          <Globe2 className="w-3 h-3 text-sky-600" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
            {headerTitle}
          </span>
        </div>
      </div>

      {/* Main Flashcard Card with 3D Entrance */}
      <div className="flashcard-3d-scene">
        <div 
          key={currentSdg.id}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-md animate-flashcard-3d space-y-2 relative overflow-hidden"
        >
          <div 
            style={{ backgroundColor: currentSdg.colorHex }}
            className="absolute top-0 left-0 right-0 h-1"
          />

          <div className="flex items-center justify-between gap-1 pt-1">
            <h4 className="font-heading text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
              <IconComponent className="w-3.5 h-3.5 shrink-0" style={{ color: currentSdg.colorHex } as React.CSSProperties} />
              <span className="line-clamp-1">{currentSdg.title[language] || currentSdg.title.en}</span>
            </h4>
          </div>

          <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed font-medium">
            "{currentSdg.statement[language] || currentSdg.statement.en}"
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-slate-600">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{currentSdg.unTarget[language] || currentSdg.unTarget.en}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
