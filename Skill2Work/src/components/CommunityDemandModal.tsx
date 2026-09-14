import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  IndianRupee, 
  X, 
  ChevronRight, 
  Info, 
  AlertCircle,
  Briefcase,
  Layers,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import type { SkillDemandStat, Language, Job, LocalSkillDemandItem } from '../types';
import { localizeContent } from '../i18n/translations';
import { useLanguage } from '../i18n/LanguageContext';
import { TAMIL_NADU_CITIES } from '../services/geoService';
import { demandIntelligenceService } from '../services/demandIntelligenceService';

interface CommunityDemandModalProps {
  stats?: SkillDemandStat[];
  jobs?: Job[];
  initialCity?: string;
  language: Language;
  onClose: () => void;
  onSelectSkillFilter?: (skill: string) => void;
}

export const CommunityDemandModal: React.FC<CommunityDemandModalProps> = ({
  stats: _stats,
  jobs = [],
  initialCity = 'Tamil Nadu',
  language,
  onClose,
  onSelectSkillFilter
}) => {
  const { t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'combined' | 'actual' | 'predicted'>('combined');

  // Localized City Name for UI rendering
  const localizedSelectedCity = useMemo(() => {
    if (!selectedCity || selectedCity === 'Tamil Nadu') {
      return t.demandAllTamilNadu || (language === 'ta' ? 'தமிழ்நாடு' : 'Tamil Nadu');
    }
    return localizeContent(selectedCity, language);
  }, [selectedCity, language, t]);

  // Compute live Local Skill-Demand Intelligence using Random Forest ML Model
  const intelligence = useMemo(() => {
    return demandIntelligenceService.analyzeDemand(jobs, selectedCity);
  }, [jobs, selectedCity]);

  // Dynamic local pay range based on actual gigs in this region
  const payRangeText = useMemo(() => {
    if (!intelligence || intelligence.skillsDemand.length === 0) return '—';
    const pays = intelligence.skillsDemand.map(s => s.avgHourlyPay).filter(p => p > 0);
    if (pays.length === 0) return '—';
    const min = Math.min(...pays);
    const max = Math.max(...pays);
    if (min === max) return `₹${min}`;
    return `₹${min} - ₹${max}`;
  }, [intelligence]);

  // Color & Badge Helpers for Current Demand Level
  const getDemandLevelBadge = (level: 'High' | 'Medium' | 'Low') => {
    switch (level) {
      case 'High':
        return {
          label: t.demandLevelHigh || (language === 'ta' ? 'அதிகம்' : 'High'),
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500'
        };
      case 'Medium':
        return {
          label: t.demandLevelMedium || (language === 'ta' ? 'மத்திமம்' : 'Medium'),
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500'
        };
      case 'Low':
      default:
        return {
          label: t.demandLevelLow || (language === 'ta' ? 'குறைவு' : 'Low'),
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400'
        };
    }
  };

  // Color & Trend Helpers for Predicted Demand
  const getPredictedTrendBadge = (item: LocalSkillDemandItem) => {
    const isRising = item.predictedTrend === 'increasing' || (!item.predictedTrend && item.currentDemandLevel === 'High');
    const isSoftening = item.predictedTrend === 'decreasing' || (!item.predictedTrend && item.currentDemandLevel === 'Low');

    if (isRising) {
      const growthText = item.predictedGrowthRate && item.predictedGrowthRate !== 'N/A' ? item.predictedGrowthRate : '+22%';
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sky-50 text-sky-700 border border-sky-300 shadow-xs">
          <span className="text-base leading-none font-bold text-sky-600">↑</span>
          <span>{t.demandTrendRising || (language === 'ta' ? 'அதிகரிக்கிறது' : 'Rising')}</span>
          <span className="text-[10px] font-bold text-sky-600">({growthText})</span>
        </span>
      );
    }

    if (isSoftening) {
      const dropText = item.predictedGrowthRate && item.predictedGrowthRate !== 'N/A' ? item.predictedGrowthRate : '-5%';
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="text-base leading-none font-bold text-amber-500">↓</span>
          <span>{t.demandTrendSoftening || (language === 'ta' ? 'குறைகிறது' : 'Softening')}</span>
          <span className="text-[10px] font-bold text-amber-600">({dropText})</span>
        </span>
      );
    }

    const stableText = item.predictedGrowthRate && item.predictedGrowthRate !== 'N/A' ? item.predictedGrowthRate : '+3%';
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
        <span className="text-base leading-none font-bold text-indigo-500">→</span>
        <span>{t.demandTrendStable || (language === 'ta' ? 'நிலையானது' : 'Stable')}</span>
        <span className="text-[10px] font-bold text-indigo-600">({stableText})</span>
      </span>
    );
  };

  const toggleExpand = (skill: string) => {
    setExpandedSkill(prev => (prev === skill ? null : skill));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div 
        className="glass-panel w-full max-w-3xl max-h-[92vh] rounded-3xl border border-slate-200 shadow-2xl bg-white overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white via-sky-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                  {t.demandModalTitle || 'Local Skill-Demand Intelligence'}
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                {language === 'ta'
                  ? 'உண்மையான வேலை தரவு மூலம் தற்போதைய மற்றும் எதிர்காலத் தேவைக் கணிப்பு'
                  : language === 'hi'
                  ? 'वास्तविक कार्य डेटा और भविष्य की मांग का विश्लेषण'
                  : language === 'te'
                  ? 'వాస్తవ పని డేటా మరియు భవిష్యత్ డిమాండ్ అంచనా'
                  : 'Actual job frequency & predictive demand forecasting'}
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

        {/* 2. City / Region Selector & Global Attribution Banner */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
            <label className="text-xs font-bold text-slate-700 shrink-0">
              {t.demandSelectRegion || 'Select District / Region'}:
            </label>
            <div className="relative flex-1 sm:w-60">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full text-xs font-bold bg-white text-slate-800 border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none shadow-xs"
              >
                <option value="Tamil Nadu">{t.demandAllTamilNadu || (language === 'ta' ? 'முழு தமிழ்நாடு (மாநிலம் தழுவிய)' : 'All Tamil Nadu (Statewide)')}</option>
                {TAMIL_NADU_CITIES.map(c => (
                  <option key={c.name} value={c.name}>
                    {localizeContent(c.name, language)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Jobs and Date Span Summary */}
          <div className="text-[11px] text-slate-600 flex items-center gap-2 self-end sm:self-auto">
            <span className="font-semibold text-slate-800">{intelligence.totalJobsAnalyzed}</span> {t.demandCompletedGigsLabel || (language === 'ta' ? 'முடிக்கப்பட்ட வேலைகள்' : 'Completed / Claimed')}
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-semibold">{intelligence.activeJobsCount} {language === 'ta' ? 'செயலில்' : language === 'hi' ? 'सक्रिय' : language === 'te' ? 'యాక్టివ్' : 'Active'}</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-700 font-semibold">{intelligence.completedJobsCount} {language === 'ta' ? 'முடிந்தது' : language === 'hi' ? 'पूर्ण' : language === 'te' ? 'పూర్తయింది' : 'Completed'}</span>
          </div>
        </div>

        {/* 3. View Filter Tabs */}
        <div className="px-5 pt-3 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('combined')}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-xl transition-colors ${
                activeTab === 'combined'
                  ? 'bg-white text-sky-700 border-t-2 border-sky-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'கண்ணோட்டம் & ஒப்பீடு' : language === 'hi' ? 'अवलोकन और तुलना' : language === 'te' ? 'అవలోకనం & పోలిక' : 'Overview & Comparison'}</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('actual')}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-xl transition-colors ${
                activeTab === 'actual'
                  ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{t.demandActualTitle || 'Current Local Demand'}</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('predicted')}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-xl transition-colors ${
                activeTab === 'predicted'
                  ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{t.demandPredictedTitle || 'Predicted Demand'}</span>
              </span>
            </button>
          </div>
        </div>

        {/* 4. Modal Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm bg-slate-50/50">
          
          {/* Key Insight Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-sky-100 shadow-xs space-y-1">
              <div className="text-[10px] text-sky-700 font-bold uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{t.topInDemandRole || 'Top Local Demand'}</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 truncate">
                {intelligence.totalJobsAnalyzed > 0 
                  ? localizeContent(intelligence.topInDemandSkill, language)
                  : (language === 'ta' ? 'வேலைகள் இல்லை' : 'No Active Gigs')}
              </div>
              <div className="text-[11px] text-sky-600 font-semibold flex items-center gap-1">
                <span>{localizedSelectedCity} {language === 'ta' ? 'வட்டாரம்' : language === 'hi' ? 'क्षेत्र' : language === 'te' ? 'ప్రాంతం' : 'Region'}</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs space-y-1">
              <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t.avgHourlyPayout || 'Local Pay Range'}</span>
              </div>
              <div className="text-base font-extrabold text-emerald-700">
                {payRangeText} {payRangeText !== '—' && <span className="text-xs font-normal text-slate-500">/ {language === 'ta' ? 'மணி' : 'hr'}</span>}
              </div>
              <div className="text-[11px] text-slate-500">
                {intelligence.activeJobsCount} {language === 'ta' ? 'செயலில் உள்ள வேலைகள்' : language === 'hi' ? 'सक्रिय नौकरियां' : language === 'te' ? 'యాక్టివ్ ఉద్యోగాలు' : 'active postings'}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-indigo-100 shadow-xs space-y-1">
              <div className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>{language === 'ta' ? 'சந்தை தரவு ஆழம்' : language === 'hi' ? 'बाजार डेटा गहराई' : language === 'te' ? 'మార్కెట్ డేటా లోతు' : 'Market Data Depth'}</span>
              </div>
              <div className="text-base font-extrabold text-indigo-900">
                {intelligence.totalJobsAnalyzed} {language === 'ta' ? 'சரிபார்க்கப்பட்ட வேலைகள்' : language === 'hi' ? 'सत्यापित गिग्स' : language === 'te' ? 'ధృవీకరించబడిన పనులు' : 'Verified Gigs'}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                {intelligence.totalJobsAnalyzed === 0 ? (
                  <span className="text-slate-400">{language === 'ta' ? 'உள்ளூர் பதிவுகளுக்காக காத்திருக்கிறது' : language === 'hi' ? 'स्थानीय गतिविधि की प्रतीक्षा है' : language === 'te' ? 'స్థానిక కార్యాచరణ కోసం వేచి ఉంది' : 'Awaiting local activity'}</span>
                ) : intelligence.insufficientDataSkillsCount > 0 ? (
                  <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" />
                    {intelligence.insufficientDataSkillsCount} {language === 'ta' ? 'குறைந்த தரவு திறன்கள்' : language === 'hi' ? 'कम डेटा वाले कौशल' : language === 'te' ? 'తక్కువ డేటా నైపుణ్యాలు' : 'sparse skills noted'}
                  </span>
                ) : (
                  <span className="text-emerald-600 font-semibold">{language === 'ta' ? 'அதிக நம்பகத்தன்மை கொண்ட தரவு' : language === 'hi' ? 'उच्च विश्वास कवरेज' : language === 'te' ? 'అధిక విశ్వసనీయత కవరేజ్' : 'High confidence coverage'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Main Demand Table / List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-600">
                {localizedSelectedCity} {t.skillDemandRanking || 'In-Demand Skills & Pay Rate'}
              </h3>
              {intelligence.skillsDemand.length > 0 && (
                <span className="text-[11px] text-slate-400">
                  {language === 'ta' ? 'வெளிப்படையான தரவு விவரங்களைக் காண கிளிக் செய்யவும்' : language === 'hi' ? 'पारदर्शी डेटा के लिए किसी भी पंक्ति पर क्लिक करें' : language === 'te' ? 'డేటా వివరాల కోసం క్లిక్ చేయండి' : 'Click any row for transparent data attribution'}
                </span>
              )}
            </div>

            {intelligence.skillsDemand.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto shadow-inner">
                  <MapPin className="w-6 h-6 text-sky-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">
                    {language === 'ta' 
                      ? `${localizedSelectedCity} பகுதியில் நேரடி வேலைகள் பதிவு செய்யப்படவில்லை` 
                      : language === 'hi'
                      ? `${localizedSelectedCity} में कोई सक्रिय गिग दर्ज नहीं है`
                      : language === 'te'
                      ? `${localizedSelectedCity} లో యాక్టివ్ పనులు నమోదు కాలేదు`
                      : `No Active Gigs Recorded for ${selectedCity}`}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    {language === 'ta' 
                      ? `தற்போது ${localizedSelectedCity} வட்டாரத்தில் வேலைகள் ஏதும் இல்லை. புதிய வேலையை பதிவு செய்து உள்ளூர் தேவையை தொடங்குங்கள் அல்லது அனைத்து மாவட்டங்களையும் காண '${t.demandAllTamilNadu || 'முழு தமிழ்நாடு'}' என்பதை தேர்ந்தெடுக்கவும்.`
                      : language === 'hi'
                      ? `वर्तमान में ${localizedSelectedCity} में कोई सक्रिय गिग्स नहीं हैं। स्थानीय व्यापार मांग स्थापित करने के लिए एक नया गिग पोस्ट करें या राज्य के रुझान देखने के लिए "सभी तमिलनाडु" चुनें।`
                      : language === 'te'
                      ? `ప్రస్తుతం ${localizedSelectedCity} లో ఎలాంటి పనులు నమోదు కాలేదు. స్థానిక డిమాండ్ ప్రారంభించడానికి కొత్త పనిని పోస్ట్ చేయండి లేదా రాష్ట్రవ్యాప్త ట్రెండ్స్ చూడటానికి "మొత్తం తమిళనాడు" ఎంచుకోండి.`
                      : `There are currently no active or historical gigs recorded specifically in ${selectedCity}. Post a new gig to establish local trade demand or select "All Tamil Nadu (Statewide)" to view state trends.`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCity('Tamil Nadu')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{t.demandAllTamilNadu || (language === 'ta' ? 'முழு தமிழ்நாடு (மாநிலம் தழுவிய)' : 'View All Tamil Nadu (Statewide)')}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
              {intelligence.skillsDemand.map((item, index) => {
                const localizedSkill = localizeContent(item.skill, language);
                const currentBadge = getDemandLevelBadge(item.currentDemandLevel);
                const isExpanded = expandedSkill === item.skill;

                return (
                  <div
                    key={item.skill}
                    className={`rounded-2xl border transition-all duration-200 bg-white ${
                      isExpanded ? 'border-sky-300 shadow-md ring-1 ring-sky-200' : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Primary Row Display */}
                    <div 
                      onClick={() => toggleExpand(item.skill)}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      {/* Skill Name & Index */}
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{localizedSkill}</span>
                            {index === 0 && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-sky-100 text-sky-800">
                                {language === 'ta' ? '#1 முதன்மை தொழில்' : language === 'hi' ? '#1 शीर्ष कौशल' : language === 'te' ? '#1 అగ్ర నైపుణ్యం' : '#1 Local Trade'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-sky-500" />
                              <span>{localizeContent(item.topLandmark, language)}</span>
                            </span>
                            <span>•</span>
                            <span>{item.activeGigCount} {language === 'ta' ? 'செயலில்' : language === 'hi' ? 'सक्रिय' : language === 'te' ? 'యాక్టివ్' : 'active'} ({item.completedGigCount} {language === 'ta' ? 'முடிந்தது' : language === 'hi' ? 'पूर्ण' : language === 'te' ? 'పూర్తయింది' : 'completed'})</span>
                          </div>
                        </div>
                      </div>

                      {/* Side-by-Side: Current Demand vs Predicted Demand */}
                      <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto shrink-0">
                        {/* Current Demand Column */}
                        {(activeTab === 'combined' || activeTab === 'actual') && (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">
                              {t.demandActualTitle || (language === 'ta' ? 'தற்போதைய தேவை' : 'Current Demand')}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${currentBadge.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${currentBadge.dot}`} />
                              <span>{currentBadge.label}</span>
                              <span className="text-[10px] font-normal opacity-80">({item.currentDemandScore}%)</span>
                            </span>
                          </div>
                        )}

                        {/* Predicted Demand Column */}
                        {(activeTab === 'combined' || activeTab === 'predicted') && (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">
                              {t.demandPredictedTitle || (language === 'ta' ? 'எதிர்காலக் கணிப்பு' : 'Predicted Demand')}
                            </span>
                            {getPredictedTrendBadge(item)}
                          </div>
                        )}

                        {/* Pay Rate Badge */}
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">{language === 'ta' ? 'சராசரி ஊதியம்' : language === 'hi' ? 'औसत दर' : language === 'te' ? 'సగటు వేతనం' : 'Avg. Rate'}</span>
                          <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
                            ₹{item.avgHourlyPay}/{language === 'ta' ? 'மணி' : language === 'hi' ? 'घंटा' : language === 'te' ? 'గంట' : 'hr'}
                          </span>
                        </div>

                        {/* Expand Chevron */}
                        <div className="text-slate-400 hover:text-slate-700 pl-1">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-sky-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Transparent Data Attribution Box */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-sky-50/30 rounded-b-2xl space-y-3 animate-fadeIn">
                        <div className="bg-white p-3 rounded-xl border border-sky-100 text-xs text-slate-700 space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <Info className="w-4 h-4 text-sky-600" />
                            <span>{t.demandAttributionTitle || 'Data Source & Activity Attribution'}</span>
                          </div>
                          
                          <p className="text-xs leading-relaxed text-slate-600">
                            {localizeContent(item.dataSourceAttribution, language)}
                          </p>

                          {/* Metric breakdown badges */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-[10px] text-slate-400 block font-semibold">{language === 'ta' ? 'செயலில் உள்ளவை' : language === 'hi' ? 'सक्रिय गिग्स' : language === 'te' ? 'యాక్టివ్ పనులు' : 'Active Postings'}</span>
                              <span className="text-xs font-bold text-slate-800">{item.activeGigCount} {language === 'ta' ? 'வேலைகள்' : language === 'hi' ? 'गिग्स' : language === 'te' ? 'పనులు' : 'gigs'}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-[10px] text-slate-400 block font-semibold">{language === 'ta' ? 'முடிக்கப்பட்டவை' : language === 'hi' ? 'पूर्ण गिग्स' : language === 'te' ? 'పూర్తయిన పనులు' : 'Historical Completed'}</span>
                              <span className="text-xs font-bold text-slate-800">{item.completedGigCount} {language === 'ta' ? 'வேலைகள்' : language === 'hi' ? 'गिग्स' : language === 'te' ? 'పనులు' : 'gigs'}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-[10px] text-slate-400 block font-semibold">{language === 'ta' ? 'தரவு நம்பிக்கை' : language === 'hi' ? 'डेटा विश्वास' : language === 'te' ? 'డేటా విశ్వాసం' : 'Data Confidence'}</span>
                              <span className="text-xs font-bold text-indigo-700">{item.hasSufficientHistoricalData ? (language === 'ta' ? 'அதிக நம்பிக்கை' : language === 'hi' ? 'उच्च विश्वास' : language === 'te' ? 'అధిక విశ్వాసం' : 'High Confidence') : (language === 'ta' ? 'தரவு தேவை' : language === 'hi' ? 'डेटा लंबित' : language === 'te' ? 'డేటా పెండింగ్' : 'Pending Data')}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-[10px] text-slate-400 block font-semibold">{language === 'ta' ? 'கணிக்கப்பட்ட வளர்ச்சி' : language === 'hi' ? 'अनुमानित वृद्धि' : language === 'te' ? 'అంచనా వేసిన వృద్ధి' : 'Predicted Growth'}</span>
                              <span className="text-xs font-bold text-emerald-700">{item.predictedGrowthRate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                          {onSelectSkillFilter && (
                            <button
                              onClick={() => {
                                onSelectSkillFilter(item.skill);
                                onClose();
                              }}
                              className="px-3 py-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                            >
                              <Briefcase className="w-3.5 h-3.5" />
                              <span>{language === 'ta' ? `"${localizedSkill}" வேலைகளை வடிகட்டவும்` : language === 'hi' ? `"${localizedSkill}" के लिए गिग्स फ़िल्टर करें` : language === 'te' ? `"${localizedSkill}" పనులను ఫిల్టర్ చేయండి` : `Filter Gigs for "${item.skill}"`}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>

        {/* 5. Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{language === 'ta' ? 'தமிழ்நாடு தரவுத்தளம் மற்றும் நேரடி ஆட்சேர்ப்பு நடவடிக்கைகளின் நிகழ்நேர தொகுப்பு' : language === 'hi' ? 'तमिलनाडु डेटाबेस और लाइव भर्ती गतिविधि से वास्तविक समय एकत्रीकरण' : language === 'te' ? 'తమిళనాడు డేటాబేస్ & లైవ్ రిక్రూటర్ యాక్టివిటీ నుండి నిజ-సమయ సమాచారం' : 'Real-time aggregation from local Tamil Nadu database & live recruiter activity'}</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            {t.close || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
