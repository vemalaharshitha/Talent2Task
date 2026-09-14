import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  Navigation, 
  Building2, 
  ShieldCheck,
  Clock,
  Award,
  TrendingUp,
  Star,
  HelpCircle,
  Flag,
  AlertTriangle,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Job, User } from '../../types';
import { formatDistance, buildNavigationUrl } from '../../services/geoService';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizeContent } from '../../i18n/translations';
import { triggerOfflineSms } from '../../utils/smsHelper';
import { sqliteManager } from '../../db/sqliteManager';
import { TrustSafetyBadge } from '../common/TrustSafetyBadge';
import { ReportJobModal } from '../common/ReportJobModal';

interface JobDetailsModalProps {
  job: Job | null;
  currentUser: User | null;
  onClose: () => void;
  onClaim: (jobId: string) => void;
  onGetDirections?: (job: Job) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  currentUser,
  onClose,
  onClaim,
  onGetDirections
}) => {
  const { t, language } = useLanguage();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  if (!job) return null;

  const isClaimedByMe = currentUser && job.claimed_by === currentUser.id;

  const recruiterObj = sqliteManager.getUserById(job.recruiter_id);
  const recruiterPhone = recruiterObj?.phone || job.recruiter_phone || '+91 99440 11223';
  const recruiterName = recruiterObj?.name || job.recruiter_name || 'Tamil Nadu Business Partner';
  const recruiterAddress = 
    recruiterObj?.address || 
    (job as any).recruiter_address || 
    (recruiterObj?.landmark ? `${recruiterObj.landmark}, ${recruiterObj.city || 'Tamil Nadu'}` : '') ||
    job.landmark_area || 
    `${recruiterName}, ${recruiterObj?.city || job.city || 'Tamil Nadu'}`;

  const handleClaim = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
    onClaim(job.id);
  };

  const openGoogleMapsDirections = () => {
    if (onGetDirections) {
      onGetDirections(job);
      return;
    }
    const originLat = currentUser?.latitude || 12.9165;
    const originLng = currentUser?.longitude || 79.1325;
    const destLat = recruiterObj?.latitude || job.latitude;
    const destLng = recruiterObj?.longitude || job.longitude;
    const url = buildNavigationUrl(
      originLat,
      originLng,
      destLat,
      destLng,
      'bike',
      'google',
      recruiterAddress,
      currentUser?.address
    );
    window.open(url, '_blank');
  };

  const openWhatsApp = () => {
    const cleanPhone = recruiterPhone.replace(/[^0-9]/g, '');
    const localizedTitle = localizeContent(job.title, language);
    const msg = encodeURIComponent(`Hello ${recruiterName}, I saw your part-time gig listing "${localizedTitle}" on Talent2Task Tamil Nadu and would like to connect.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      
      <div 
        className="glass-panel w-full max-w-2xl max-h-[90vh] rounded-3xl border border-slate-200 shadow-2xl bg-white overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-white">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                {localizeContent(job.category, language)}
              </span>
              {job.matchScore && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  {job.matchScore}% {t.matchScore}
                </span>
              )}
              {job.status === 'CLAIMED' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {isClaimedByMe ? t.claimedBadge : t.claimedOtherBadge}
                </span>
              )}
              {job.trustAssessment && (
                <TrustSafetyBadge 
                  assessment={job.trustAssessment} 
                  onClick={() => {
                    const el = document.getElementById('trust-safety-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              )}
            </div>

            <h2 className="font-heading text-lg sm:text-2xl font-bold text-slate-900 leading-tight">
              {localizeContent(job.title, language)}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{t.payRate}</div>
              <div className="text-lg font-extrabold text-sky-600 mt-0.5">
                ₹{job.payout_amount} <span className="text-xs font-normal text-slate-500">/ {localizeContent(job.payout_unit, language)}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{t.distance}</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
                <Navigation className="w-4 h-4 text-sky-500" />
                <span>{job.distanceKm !== undefined ? formatDistance(job.distanceKm) : 'Vellore'}</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{t.postedDate}</div>
              <div className="text-sm font-bold text-slate-800 mt-1 truncate">
                {job.created_at?.split(' ')[0] || 'Today'}
              </div>
            </div>

          </div>

          {/* Hybrid AI Recommendation & Explainability Card */}
          {job.matchBreakdown && (
            <div className="bg-gradient-to-br from-sky-50/90 via-blue-50/40 to-slate-50 p-4 sm:p-5 rounded-3xl border border-sky-200/90 space-y-3.5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                      {t.whyRecommended || 'Why this match?'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {t.hybridMatchBreakdown || 'Hybrid AI Ranking Breakdown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-sky-100 text-sky-800 border border-sky-200 shadow-2xs">
                    {job.matchBreakdown.explanation?.badgeTag || 'Top AI Match'}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-sky-500 text-white shadow-xs">
                    {job.matchScore}% Match
                  </span>
                </div>
              </div>

              {job.matchBreakdown.explanation?.headline && (
                <p className="text-xs sm:text-sm font-semibold text-slate-800 bg-white/80 p-3 rounded-2xl border border-sky-100 leading-relaxed shadow-2xs">
                  {job.matchBreakdown.explanation.headline}
                </p>
              )}

              {/* 6 Hybrid Factors Mini Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                {/* 1. Skill Similarity */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-sky-500" />
                    {t.skillSimilarityLabel || 'Skill Similarity'} (40%)
                  </div>
                  <div className="font-extrabold text-sky-600 text-sm mt-0.5">
                    {job.matchBreakdown.skillScore}%
                  </div>
                </div>

                {/* 2. Distance */}
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

                {/* 3. Availability */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-sky-500" />
                    {t.availabilityFactorLabel || 'Availability'} (15%)
                  </div>
                  <div className="font-extrabold text-sky-600 text-xs mt-1">
                    {job.matchBreakdown.availabilityStatus || 'Compatible'}
                  </div>
                </div>

                {/* 4. Experience */}
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

                {/* 5. Local Demand */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3 text-sky-500" />
                    {t.localDemandFactorLabel || 'Local Demand'} (7.5%)
                  </div>
                  <div className="font-extrabold text-sky-600 text-xs mt-1">
                    {job.matchBreakdown.demandLevel || 'High'}
                  </div>
                </div>

                {/* 6. Reliability */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 text-sky-500" />
                    {t.reliabilityFactorLabel || 'Reliability'} (7.5%)
                  </div>
                  <div className="font-extrabold text-slate-900 text-xs mt-1">
                    {job.matchBreakdown.workerReliabilityMetrics 
                      ? `${job.matchBreakdown.workerReliabilityMetrics.score}/100` 
                      : job.matchBreakdown.ratingOutOfFive 
                      ? `${job.matchBreakdown.ratingOutOfFive}/5` 
                      : '80/100'}
                  </div>
                  {job.matchBreakdown.workerReliabilityMetrics && (
                    <div className="text-[10px] text-sky-700 font-semibold mt-0.5">
                      {job.matchBreakdown.workerReliabilityMetrics.reliabilityTier}
                    </div>
                  )}
                </div>
              </div>

              {/* Bulleted Explanation Reasons */}
              {job.matchBreakdown.explanation?.reasons && job.matchBreakdown.explanation.reasons.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {job.matchBreakdown.explanation.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-white/70 p-2 rounded-xl border border-sky-100">
                      <HelpCircle className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Trust & Safety Assessment Card (Phase 7) */}
          {job.trustAssessment && (
            <div 
              id="trust-safety-section"
              className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                job.trustAssessment.status === 'potential_risk_detected'
                  ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-50 border-amber-500/40 shadow-xs'
                  : 'bg-slate-50/90 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    job.trustAssessment.status === 'potential_risk_detected'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-emerald-600 text-white shadow-xs'
                  }`}>
                    {job.trustAssessment.status === 'potential_risk_detected' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                      Trust & Safety Assessment
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Transparent screening & recruiter integrity analysis
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrustSafetyBadge assessment={job.trustAssessment} />
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 transition-colors shadow-2xs"
                  >
                    <Flag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Report Job</span>
                  </button>
                </div>
              </div>

              {/* Headline & Guidance */}
              <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed mb-3 ${
                job.trustAssessment.status === 'potential_risk_detected'
                  ? 'bg-amber-50 border-amber-200 text-amber-950 font-medium'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <div className="font-bold text-sm mb-1">{job.trustAssessment.headline}</div>
                <div>{job.trustAssessment.recommendedAction}</div>
              </div>

              {/* Detected Risk Signals */}
              {job.trustAssessment.riskSignals.length > 0 && (
                <div className="space-y-2 mb-3">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Detected Risk Signals ({job.trustAssessment.riskSignals.length}):
                  </div>
                  {job.trustAssessment.riskSignals.map((sig, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            sig.severity === 'high' ? 'bg-rose-500' : sig.severity === 'medium' ? 'bg-amber-500' : 'bg-sky-500'
                          }`} />
                          <span>{sig.label}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          sig.severity === 'high'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : sig.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sig.severity} priority
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{sig.description}</p>
                      {sig.evidence && (
                        <div className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 truncate">
                          Detected text: &ldquo;{sig.evidence}&rdquo;
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Insufficient Recruiter History Note */}
              {!job.trustAssessment.hasSufficientRecruiterHistory && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-white text-slate-600 text-xs border border-slate-200">
                  <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <span>
                    New recruiter account — standard security checks passed. Ratings build over time with completed gigs.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              {t.descriptionLabel}
            </h3>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {localizeContent(job.description, language)}
            </p>
          </div>

          {/* Required Skills */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              {t.requiredSkillsLabel}
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.required_skills.map((skill, idx) => {
                const semanticMatch = job.matchBreakdown?.skillMatches?.find(
                  m => m.requiredSkill.toLowerCase() === skill.toLowerCase()
                );
                const isDirect = semanticMatch?.isExactMatch || currentUser?.skills.some(
                  s => s.toLowerCase() === skill.toLowerCase()
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${
                      isDirect
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : isSemantic
                        ? 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-800 border-sky-300 shadow-2xs'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isDirect ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                    ) : isSemantic ? (
                      <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    )}
                    <span>{localizeContent(skill, language)}</span>
                    {isSemantic && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-200/80 text-sky-900">
                        {simPct}% AI
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Claimed Navigation Highlight Banner */}
          {isClaimedByMe && (
            <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 p-4 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-sky-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>{t.claimedBadge}</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {t.readyToGoBanner}
                </div>
              </div>
              <button
                type="button"
                onClick={openGoogleMapsDirections}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-white hover:bg-sky-50 text-sky-700 shrink-0 flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-sky-600 animate-pulse" />
                <span>{t.directionsBtn}</span>
              </button>
            </div>
          )}

          {/* Location & Directions */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t.gigLocation}</div>
                <div className="text-sm font-bold text-slate-900 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <div>{recruiterAddress}</div>
                    <div className="text-xs font-normal text-slate-500 mt-0.5">
                      {recruiterObj?.name ? `${recruiterObj.name} • ` : ''}{localizeContent(job.landmark_area, language)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {t.coordinates}: {(recruiterObj?.latitude || job.latitude).toFixed(4)}° N, {(recruiterObj?.longitude || job.longitude).toFixed(4)}° E
                </div>
              </div>

              <button
                onClick={openGoogleMapsDirections}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-sky-700 border border-slate-200 flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-500" />
                <span>{t.directionsBtn}</span>
              </button>
            </div>
          </div>

          {/* Recruiter Contact Box */}
          <div className="bg-gradient-to-r from-sky-50 via-sky-100/30 to-white p-4 rounded-2xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-[11px] text-sky-700 font-semibold uppercase tracking-wider">{t.postedByRecruiter}</div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>{recruiterName}</span>
              </div>
              <div className="text-xs text-slate-500">{recruiterPhone}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(`tel:${recruiterPhone}`, '_self')}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-sky-600" />
                <span>{t.callRecruiterBtn}</span>
              </button>

              <button
                onClick={openWhatsApp}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-sky-500/20"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t.whatsappRecruiterBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const msg = `Hi ${recruiterName}, I am interested in your gig '${job.title}' on Talent2Task. My Name: ${currentUser?.name || 'Job Seeker'}, Phone: ${currentUser?.phone || ''}. Please contact me!`;
                  triggerOfflineSms(recruiterPhone, msg);
                }}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Offline SMS</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            {t.close}
          </button>

          {job.status === 'OPEN' ? (
            <button
              onClick={handleClaim}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md shadow-sky-500/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.claimJobBtn}</span>
            </button>
          ) : isClaimedByMe ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-3 py-2 rounded-xl border border-sky-200">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>{t.claimedBadge}</span>
              </div>
              <button
                type="button"
                onClick={openGoogleMapsDirections}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t.directionsBtn}</span>
              </button>
            </div>
          ) : (
            <span className="text-xs font-semibold text-slate-500">
              {job.status === 'COMPLETED' ? t.completedBadge : t.claimedOtherBadge}
            </span>
          )}
        </div>

      </div>

      <ReportJobModal
        job={job}
        currentUser={currentUser}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

    </div>
  );
};
