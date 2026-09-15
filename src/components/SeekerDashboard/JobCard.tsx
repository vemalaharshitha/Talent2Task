import React, { useState } from 'react';
import { 
  MapPin, 
  Sparkles, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Navigation, 
  ShieldCheck,
  Clock,
  Award,
  TrendingUp,
  Star,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Job, User } from '../../types';
import { formatDistance } from '../../services/geoService';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizeContent, getLocalizedJobText } from '../../i18n/translations';
import { TrustSafetyBadge } from '../common/TrustSafetyBadge';

interface JobCardProps {
  job: Job;
  currentUser: User | null;
  onClaim: (jobId: string) => void;
  onViewDetails: (job: Job) => void;
  onGetDirections?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  currentUser,
  onClaim,
  onViewDetails,
  onGetDirections
}) => {
  const { t, language } = useLanguage();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const isCompleted = job.status === 'COMPLETED';
  const isAssigned = job.status === 'CLAIMED' || Boolean(job.claimed_by);
  const isStatic = isCompleted || isAssigned;
  const isClaimedByMe = Boolean(currentUser && job.claimed_by === currentUser.id && !isCompleted);
  const isClaimedByOther = Boolean(job.status === 'CLAIMED' && !isClaimedByMe && !isCompleted);

  const matchScore = job.matchScore || 50;

  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClaiming(true);
    
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#38bdf8', '#0ea5e9', '#ffffff', '#e0f2fe']
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      onClaim(job.id);
      setIsClaiming(false);
    }, 250);
  };

  const getMatchScoreBadge = () => {
    if (matchScore >= 85) {
      return 'bg-sky-50 text-sky-700 border-sky-200 shadow-xs';
    } else if (matchScore >= 70) {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    } else {
      return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div 
      onClick={() => {
        if (!isStatic) {
          onViewDetails(job);
        }
      }}
      className={`glass-panel rounded-2xl p-4 sm:p-5 relative bg-white border border-slate-200 ${
        isStatic 
          ? 'cursor-default' 
          : 'transition-all duration-200 hover:border-sky-400 hover:shadow-md hover:shadow-sky-500/10 cursor-pointer group'
      }`}
    >
      {/* Top row: Category, Landmark & Match Score */}
      <div className="flex items-start justify-between gap-2.5 mb-3">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
            {getLocalizedJobText(job, 'category', language)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium truncate max-w-full">
            <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="truncate">{getLocalizedJobText(job, 'landmark_area', language)}</span>
          </span>
          {job.trustAssessment && (
            <TrustSafetyBadge assessment={job.trustAssessment} compact className="shrink-0" />
          )}
        </div>

        {/* Match score pill */}
        <div className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border flex items-center gap-1 shadow-xs shrink-0 whitespace-nowrap ${getMatchScoreBadge()}`}>
          <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span>{matchScore}% {t.matchScore}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className={`font-heading text-base sm:text-lg font-bold text-slate-900 mb-2 line-clamp-2 ${
        !isStatic ? 'group-hover:text-sky-600 transition-colors' : ''
      }`}>
        {getLocalizedJobText(job, 'title', language)}
      </h3>

      {/* Description Snippet */}
      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
        {getLocalizedJobText(job, 'description', language)}
      </p>

      {/* Required Skills Chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.required_skills.map((skill, idx) => {
          const semanticMatch = job.matchBreakdown?.skillMatches?.find(
            m => m.requiredSkill.toLowerCase() === skill.toLowerCase()
          );
          const isDirect = semanticMatch?.isExactMatch || currentUser?.skills.some(
            us => us.toLowerCase() === skill.toLowerCase()
          );
          const isSemantic = semanticMatch?.isSemanticMatch && !isDirect;
          const simPct = semanticMatch ? Math.round(semanticMatch.similarity * 100) : null;

          return (
            <span
              key={idx}
              title={
                isSemantic
                  ? `✨ AI Semantic Match (${simPct}% similarity with "${semanticMatch?.matchedUserSkill}")`
                  : isDirect
                  ? 'Exact Skill Match'
                  : undefined
              }
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                isDirect
                  ? 'bg-sky-50 text-sky-700 border-sky-200 font-semibold'
                  : isSemantic
                  ? 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-800 border-sky-300 font-semibold shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {isDirect && <CheckCircle className="w-3 h-3 text-sky-500" />}
              {isSemantic && <Sparkles className="w-3 h-3 text-sky-500 animate-pulse" />}
              <span>{localizeContent(skill, language)}</span>
              {isSemantic && (
                <span className="text-[9px] font-extrabold px-1 py-0.2 rounded bg-sky-200/80 text-sky-900 ml-0.5">
                  {simPct}%
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Distance, Payout & Claim Action */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex items-center gap-3 shrink-0">
          {/* Pay Rate */}
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{t.payout}</div>
            <div className="text-base sm:text-lg font-extrabold text-sky-600 flex items-center">
              <span>₹{job.payout_amount}</span>
              <span className="text-xs font-normal text-slate-500 ml-1">/ {localizeContent(job.payout_unit, language)}</span>
            </div>
          </div>

          {/* Distance */}
          {job.distanceKm !== undefined && (
            <div className="border-l border-slate-200 pl-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{t.proximity}</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>{formatDistance(job.distanceKm)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 ml-auto">
          
          {!isStatic && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowBreakdown(!showBreakdown);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0 cursor-pointer"
              title="Toggle Match Score Breakdown"
            >
              {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {job.status === 'OPEN' && (
            <button
              type="button"
              onClick={handleClaim}
              disabled={isClaiming}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md shadow-sky-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isClaiming ? t.claiming : t.claimJobBtn}</span>
            </button>
          )}

          {isClaimedByMe && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1.5 shadow-xs shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                <span>{t.claimedBadge}</span>
              </span>
              {onGetDirections && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGetDirections(job);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white flex items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
                  title={t.directionsBtn}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{t.directionsBtn}</span>
                </button>
              )}
            </div>
          )}

          {isClaimedByOther && (
            <span className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              {t.claimedOtherBadge}
            </span>
          )}

          {isCompleted && (
            <span className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.completedBadge}</span>
            </span>
          )}

        </div>

      </div>

      {/* Match Score Breakdown Accordion */}
      {!isStatic && showBreakdown && job.matchBreakdown && (
        <div className="mt-4 pt-3 border-t border-slate-200 text-xs space-y-2.5 bg-slate-50 p-3.5 rounded-2xl">
          <div className="font-bold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              {t.hybridMatchBreakdown || 'Hybrid AI Ranking Breakdown'}
            </span>
            <span className="text-sky-600 font-extrabold text-sm">{job.matchScore}% {t.overall}</span>
          </div>
          
          {/* 6 Hybrid AI Factors Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-center">
            {/* 1. Skill Similarity (40%) */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-500" />
                {t.skillSimilarityLabel || 'Skill Similarity'} (40%)
              </div>
              <div className="font-extrabold text-sky-600 text-sm mt-0.5">{job.matchBreakdown.skillScore}%</div>
            </div>

            {/* 2. Distance (20%) */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                <Navigation className="w-3 h-3 text-sky-500" />
                {t.distanceFactorLabel || 'Distance'} (20%)
              </div>
              <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                {job.matchBreakdown.distanceScore}%
                {job.distanceKm !== undefined && (
                  <span className="text-[10px] font-normal text-slate-500 ml-1">({formatDistance(job.distanceKm)})</span>
                )}
              </div>
            </div>

            {/* 3. Availability (15%) */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-sky-500" />
                {t.availabilityFactorLabel || 'Availability'} (15%)
              </div>
              <div className="font-extrabold text-sky-600 text-xs mt-1">
                {job.matchBreakdown.availabilityStatus || 'Compatible'}
              </div>
            </div>

            {/* 4. Experience (10%) */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-sky-500" />
                {t.experienceFactorLabel || 'Experience'} (10%)
              </div>
              <div className="font-extrabold text-slate-900 text-xs mt-1">
                {job.matchBreakdown.experienceLevel || 'Suitable'}
                {job.matchBreakdown.experienceYears !== undefined && (
                  <span className="text-[10px] font-normal text-slate-500 ml-1">({job.matchBreakdown.experienceYears}y)</span>
                )}
              </div>
            </div>

            {/* 5. Local Demand (7.5%) */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-sky-500" />
                {t.localDemandFactorLabel || 'Local Demand'} (7.5%)
              </div>
              <div className="font-extrabold text-sky-600 text-xs mt-1">
                {job.matchBreakdown.demandLevel || 'High'}
              </div>
            </div>

            {/* 6. Reliability (7.5%) */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                <Star className="w-3 h-3 text-sky-500" />
                {t.reliabilityFactorLabel || 'Reliability'} (7.5%)
              </div>
              <div className="font-extrabold text-slate-900 text-xs mt-1">
                {job.matchBreakdown.ratingOutOfFive ? `${job.matchBreakdown.ratingOutOfFive}/5` : '4.8/5'}
              </div>
            </div>
          </div>

          {/* Explainable AI: Why this match? / Why recommended? */}
          {job.matchBreakdown.explanation && (
            <div className="bg-gradient-to-r from-sky-50/90 to-blue-50/70 p-3 rounded-xl border border-sky-200/90 space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-sky-950 text-xs">
                  <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                  {t.whyRecommended || 'Why this match?'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200">
                  {job.matchBreakdown.explanation.badgeTag || 'Top AI Match'}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-700 leading-relaxed">
                {job.matchBreakdown.explanation.headline}
              </p>
              <div className="space-y-1 pt-1 border-t border-sky-100">
                {job.matchBreakdown.explanation.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <span className="text-sky-500 font-bold">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sentence Transformer AI Semantic Breakdown */}
          {job.matchBreakdown.isAiPowered && (
            <div className="bg-sky-50/80 p-2.5 rounded-xl border border-sky-200/80 space-y-1.5 mt-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-sky-950">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  Sentence Transformer AI Semantic Fit
                </span>
                <span className="text-sky-700 font-extrabold">{job.matchBreakdown.semanticSkillScore ?? job.matchBreakdown.skillScore}% Cosine Sim</span>
              </div>
              {job.matchBreakdown.skillMatches && job.matchBreakdown.skillMatches.filter(m => m.isSemanticMatch && !m.isExactMatch).length > 0 && (
                <div className="space-y-1 pt-1">
                  {job.matchBreakdown.skillMatches.filter(m => m.isSemanticMatch && !m.isExactMatch).map((m, i) => (
                    <div key={i} className="text-[11px] bg-white p-2 rounded-lg border border-sky-100 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-slate-900">{localizeContent(m.requiredSkill, language)}</span>
                        <span className="text-slate-400">↔</span>
                        <span className="text-sky-700 font-medium italic truncate">{localizeContent(m.matchedUserSkill || '', language)}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-extrabold text-[10px] shrink-0 ml-2">
                        {Math.round(m.similarity * 100)}% Sim
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {job.matchBreakdown.missingSkills.length > 0 && (
            <div className="text-[11px] text-slate-600 pt-1">
              <span className="text-sky-600 font-medium">{t.missingSkillsLabel}: </span>
              {job.matchBreakdown.missingSkills.map(s => localizeContent(s, language)).join(', ')}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
