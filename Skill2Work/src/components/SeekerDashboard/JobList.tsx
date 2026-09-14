import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import type { Job, User } from '../../types';
import { JobCard } from './JobCard';
import { CATEGORIES, localizeContent } from '../../i18n/translations';
import { useLanguage } from '../../i18n/LanguageContext';
import { nlpService, type ExtractedJobRequirement } from '../../services/nlpService';
import { VoiceInputButton } from '../common/VoiceInputButton';

interface JobListProps {
  jobs: Job[];
  currentUser: User | null;
  onClaimJob: (jobId: string) => void;
  onViewDetails: (job: Job) => void;
  onGetDirections?: (job: Job) => void;
  radiusKm: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  currentUser,
  onClaimJob,
  onViewDetails,
  onGetDirections,
  radiusKm,
  searchQuery: controlledSearchQuery,
  onSearchChange,
  selectedCategory: controlledCategory,
  onCategoryChange
}) => {
  const { t, language } = useLanguage();
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<string>('ALL');

  const searchQuery = controlledSearchQuery !== undefined ? controlledSearchQuery : internalSearchQuery;
  const selectedCategory = controlledCategory !== undefined ? controlledCategory : internalSelectedCategory;

  const setSearchQuery = (val: string) => {
    if (onSearchChange) onSearchChange(val);
    else setInternalSearchQuery(val);
  };

  const setSelectedCategory = (val: string) => {
    if (onCategoryChange) onCategoryChange(val);
    else setInternalSelectedCategory(val);
  };

  const [sortBy, setSortBy] = useState<'match' | 'distance' | 'pay'>('match');
  const [parsedAiRequirement, setParsedAiRequirement] = useState<ExtractedJobRequirement | null>(null);
  const [isAiParsing, setIsAiParsing] = useState(false);

  // Debounced NLP requirement understanding for search queries
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 4) {
      setParsedAiRequirement(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAiParsing(true);
      try {
        const extracted = await nlpService.parseJobRequirement(searchQuery);
        // Only set if user hasn't cleared the query in the meantime
        if (extracted.skills.length > 0 || extracted.location.isDetected || extracted.category !== 'Other') {
          setParsedAiRequirement(extracted);
        } else {
          setParsedAiRequirement(null);
        }
      } catch (err) {
        console.warn('NLP search parse failed:', err);
      } finally {
        setIsAiParsing(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // 1. Radius Filter
    result = result.filter(j => {
      if (j.distanceKm === undefined) return true;
      return j.distanceKm <= radiusKm;
    });

    // 2. Cross-Language Search query (English, Tamil, Telugu, Hindi + NLP understanding)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const qWords = q.split(/\s+/).filter(w => w.length > 1);

      result = result.filter(j => {
        const trans = j.translations;
        
        // Collect representations across English, Tamil, Telugu, and Hindi
        const allTitles = [
          j.title,
          trans?.title?.en,
          trans?.title?.ta,
          trans?.title?.te,
          trans?.title?.hi,
          localizeContent(j.title, 'en'),
          localizeContent(j.title, 'ta'),
          localizeContent(j.title, 'te'),
          localizeContent(j.title, 'hi')
        ].filter(Boolean).map(s => s!.toLowerCase());

        const allCategories = [
          j.category,
          trans?.category?.en,
          trans?.category?.ta,
          trans?.category?.te,
          trans?.category?.hi,
          localizeContent(j.category, 'en'),
          localizeContent(j.category, 'ta'),
          localizeContent(j.category, 'te'),
          localizeContent(j.category, 'hi')
        ].filter(Boolean).map(s => s!.toLowerCase());

        const allDescriptions = [
          j.description,
          trans?.description?.en,
          trans?.description?.ta,
          trans?.description?.te,
          trans?.description?.hi,
          localizeContent(j.description, 'en'),
          localizeContent(j.description, 'ta'),
          localizeContent(j.description, 'te'),
          localizeContent(j.description, 'hi')
        ].filter(Boolean).map(s => s!.toLowerCase());

        const allSkills = j.required_skills.flatMap(s => [
          s,
          localizeContent(s, 'en'),
          localizeContent(s, 'ta'),
          localizeContent(s, 'te'),
          localizeContent(s, 'hi')
        ]).map(s => s.toLowerCase());

        const allLandmarks = [
          j.landmark_area,
          trans?.landmark_area?.en,
          trans?.landmark_area?.ta,
          trans?.landmark_area?.te,
          trans?.landmark_area?.hi,
          localizeContent(j.landmark_area, 'en'),
          localizeContent(j.landmark_area, 'ta'),
          localizeContent(j.landmark_area, 'te'),
          localizeContent(j.landmark_area, 'hi')
        ].filter(Boolean).map(s => s!.toLowerCase());

        // Direct full string or substring match across all languages
        const directMatch = (
          allTitles.some(t => t.includes(q)) ||
          allCategories.some(c => c.includes(q)) ||
          allDescriptions.some(d => d.includes(q)) ||
          allSkills.some(s => s.includes(q)) ||
          allLandmarks.some(l => l.includes(q))
        );

        if (directMatch) return true;

        // Word-level token match (e.g. searching "Need a plumber in Chennai" or "சென்னையில் ஒரு பிளம்பர் வேண்டும்")
        const wordMatch = qWords.some(w => 
          allTitles.some(t => t.includes(w)) ||
          allCategories.some(c => c.includes(w)) ||
          allSkills.some(s => s.includes(w)) ||
          allLandmarks.some(l => l.includes(w))
        );

        if (wordMatch) return true;

        // NLP understanding matches
        if (parsedAiRequirement) {
          // Check extracted skills
          const skillMatch = parsedAiRequirement.skills.some(skill => {
            const skLower = skill.toLowerCase();
            return (
              allSkills.some(s => s.includes(skLower) || skLower.includes(s)) ||
              allTitles.some(t => t.includes(skLower))
            );
          });
          if (skillMatch) return true;

          // Check extracted location
          if (parsedAiRequirement.location.isDetected && parsedAiRequirement.location.city) {
            const locCity = parsedAiRequirement.location.city.toLowerCase();
            const locLandmark = parsedAiRequirement.location.landmark ? parsedAiRequirement.location.landmark.toLowerCase() : '';
            if (allLandmarks.some(l => l.includes(locCity) || (locLandmark && l.includes(locLandmark)))) {
              return true;
            }
          }

          // Check category match
          if (parsedAiRequirement.category && parsedAiRequirement.category !== 'Other') {
            const catLower = parsedAiRequirement.category.toLowerCase();
            if (allCategories.some(c => c.includes(catLower) || catLower.includes(c))) {
              return true;
            }
          }
        }

        return false;
      });
    }

    // 3. Category Filter
    if (selectedCategory !== 'ALL') {
      result = result.filter(j => j.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === 'match') {
        return (b.matchScore || 0) - (a.matchScore || 0);
      } else if (sortBy === 'distance') {
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      } else if (sortBy === 'pay') {
        return b.payout_amount - a.payout_amount;
      }
      return 0;
    });

    return result;
  }, [jobs, radiusKm, searchQuery, selectedCategory, sortBy, language]);

  return (
    <div className="space-y-4">
      
      {/* Search, Filter Bar & Sort */}
      <div className="glass-panel-light p-3 sm:p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-2.5">
          
          {/* Search Input with Voice Button */}
          <div className="relative flex-1">
            {isAiParsing ? (
              <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500 animate-spin" />
            ) : (
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder || 'Search jobs, skills or speak naturally (e.g. எனக்கு ஒரு பிளம்பர் வேண்டும்)...'}
              className="w-full pl-10 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all"
            />
            
            {/* Right Action Icons: Clear & Voice Input Button */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setParsedAiRequirement(null); }}
                  className="text-xs text-slate-400 hover:text-slate-700 px-1 py-0.5"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
              <VoiceInputButton
                size="sm"
                onInterimTranscript={(text) => setSearchQuery(text)}
                onTranscript={(transcript) => setSearchQuery(transcript)}
              />
            </div>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-500" />
            <span className="text-slate-500 hidden sm:inline">{t.sortBy}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="match" className="bg-white text-slate-900">{t.sortMatchScore}</option>
              <option value="distance" className="bg-white text-slate-900">{t.sortDistance}</option>
              <option value="pay" className="bg-white text-slate-900">{t.sortHighestPay}</option>
            </select>
          </div>

        </div>

        {/* AI Parsed Query Badge Bar (Active when NLP extracts criteria) */}
        {parsedAiRequirement && (parsedAiRequirement.skills.length > 0 || parsedAiRequirement.location.isDetected || parsedAiRequirement.availability.isExplicit) && (
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl text-xs animate-in fade-in duration-200">
            <span className="flex items-center gap-1 font-bold text-sky-800 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
              {language === 'ta' ? 'AI புரிதல்:' : language === 'hi' ? 'AI समझा:' : language === 'te' ? 'AI గ్రహించినవి:' : 'AI Understood:'}
            </span>
            {parsedAiRequirement.languageName && (
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md font-bold text-[10px] border border-indigo-200 shadow-2xs">
                🌐 {parsedAiRequirement.languageName}
              </span>
            )}
            {parsedAiRequirement.skills.map(s => (
              <span key={s} className="px-2 py-0.5 bg-sky-600 text-white rounded-md font-medium text-[11px] shadow-xs">
                🎯 {s}
              </span>
            ))}
            {parsedAiRequirement.location.isDetected && (
              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-md font-medium text-[11px] shadow-xs">
                📍 {parsedAiRequirement.location.landmark ? `${localizeContent(parsedAiRequirement.location.landmark, language)}, ` : ''}{localizeContent(parsedAiRequirement.location.city, language)}
              </span>
            )}
            {parsedAiRequirement.availability.isExplicit && (
              <span className="px-2 py-0.5 bg-amber-600 text-white rounded-md font-medium text-[11px] shadow-xs">
                🕒 {parsedAiRequirement.availability.timingText}
              </span>
            )}
            {parsedAiRequirement.experience.isExplicit && (
              <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md font-medium text-[11px] shadow-xs">
                ⭐ {parsedAiRequirement.experience.level}
              </span>
            )}
            <button
              onClick={() => { setSearchQuery(''); setParsedAiRequirement(null); }}
              className="ml-auto text-[11px] text-slate-500 hover:text-red-600 font-semibold underline cursor-pointer shrink-0"
            >
              ✕ {language === 'ta' ? 'அழி' : language === 'hi' ? 'हटाएं' : language === 'te' ? 'తొలగించు' : 'Clear'}
            </button>
          </div>
        )}


        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-sky-500 text-white font-bold shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {t.allCategories}
          </button>
          
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white font-bold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {localizeContent(cat, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              currentUser={currentUser}
              onClaim={onClaimJob}
              onViewDetails={onViewDetails}
              onGetDirections={onGetDirections}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-3 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto text-sky-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-base font-bold text-slate-900">
            {language === 'ta'
              ? `உங்கள் ${radiusKm} கி.மீ வரம்பில் அல்லது வடிகட்டலில் வேலைகள் இல்லை.`
              : language === 'hi'
              ? `आपके ${radiusKm} किमी दायरे या फ़िल्टर में कोई गिग नहीं मिला।`
              : language === 'te'
              ? `మీ ${radiusKm} కిమీ పరిధిలో లేదా ఫిల్టర్‌లలో పనులు లేవు.`
              : `No gigs match your ${radiusKm}km radius or filter criteria.`}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'ta'
              ? `ரேடார் தூரத்தை (${radiusKm} கி.மீ இலிருந்து அதிகரிக்கவும்) அல்லது தேடல் வடிகட்டல்களை அழிக்கவும்!`
              : language === 'hi'
              ? `रडार की दूरी (${radiusKm} किमी से आगे बढ़ाएं) या खोज फ़िल्टर साफ़ करें!`
              : language === 'te'
              ? `రాడార్ దూరాన్ని (${radiusKm} కిమీ కంటే పెంచండి) లేదా ఫిల్టర్‌లను క్లియర్ చేయండి!`
              : `Try expanding the radar distance beyond ${radiusKm}km or clearing search filters!`}
          </p>
        </div>
      )}

    </div>
  );
};
