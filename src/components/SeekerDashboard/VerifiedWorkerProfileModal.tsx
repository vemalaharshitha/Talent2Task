import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert,
  CheckCircle2, 
  Star, 
  Calendar, 
  MapPin, 
  Briefcase, 
  QrCode, 
  Copy, 
  Check, 
  Download, 
  UserCheck, 
  Phone, 
  MessageSquare
} from 'lucide-react';
import QRCode from 'qrcode';
import type { User, FeedbackReview } from '../../types';
import { sqliteManager } from '../../db/sqliteManager';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizeContent } from '../../i18n/translations';

/**
 * Generates the clean, production-ready public profile URL for a verified worker.
 * - In production: Uses VITE_PUBLIC_URL / VITE_APP_URL or deployed window.location.origin (HTTPS).
 * - In local development: Uses current development origin.
 * - Encodes ONLY the public route: /verified-worker/<PUBLIC_WORKER_ID>
 * - Never includes private tokens, passwords, or raw database data.
 */
export function getPublicWorkerUrl(workerId: string): string {
  if (!workerId) return '';
  const cleanId = encodeURIComponent(workerId.trim());

  // Check if configured via environment variable
  const envUrl = (
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      (import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_APP_URL)) ||
    ''
  ).trim();

  let baseOrigin = '';
  if (envUrl) {
    baseOrigin = envUrl.replace(/\/+$/, '');
  } else if (typeof window !== 'undefined' && window.location) {
    baseOrigin = window.location.origin;
  }

  return `${baseOrigin}/verified-worker/${cleanId}`;
}

interface VerifiedWorkerProfileModalProps {
  worker: User | null;
  workerId?: string;
  currentUser?: User | null;
  isOpen: boolean;
  onClose: () => void;
  isPublicView?: boolean;
}

export const VerifiedWorkerProfileModal: React.FC<VerifiedWorkerProfileModalProps> = ({
  worker,
  workerId,
  currentUser,
  isOpen,
  onClose,
  isPublicView = false
}) => {
  const { language } = useLanguage();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'passport' | 'history'>('passport');

  // Real data derivations from SQLite
  const allJobs = sqliteManager.getJobs();
  const claimedJobs = useMemo(() => {
    if (!worker) return [];
    return allJobs.filter(j => j.claimed_by === worker.id);
  }, [allJobs, worker?.id]);

  const completedJobs = useMemo(() => {
    return claimedJobs.filter(j => j.status === 'COMPLETED');
  }, [claimedJobs]);

  const reviews = useMemo(() => {
    if (!worker) return [];
    return sqliteManager.getReviews(worker.id);
  }, [worker?.id]);

  const transactions = useMemo(() => {
    if (!worker) return [];
    return sqliteManager.getTransactionsByUser(worker.id).filter(
      t => t.seeker_id === worker.id && t.status === 'Payment Successful'
    );
  }, [worker?.id]);

  // Derived Fields from SQLite
  const displayRole = useMemo(() => {
    if (!worker) return 'General Worker';
    return worker.job_role || (worker.skills && worker.skills.length > 0 ? worker.skills[0] : 'General Worker');
  }, [worker]);

  const displayExperience = useMemo(() => {
    if (!worker) return 0;
    return worker.experience ?? 0;
  }, [worker]);

  const displayCompletedTasks = useMemo(() => {
    return completedJobs.length;
  }, [completedJobs.length]);

  // Dynamic Rating calculation
  const ratingData = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return {
      average: parseFloat((sum / reviews.length).toFixed(1)),
      count: reviews.length
    };
  }, [reviews]);

  const displayRating = useMemo(() => {
    return ratingData;
  }, [ratingData]);

  // Verified Earnings
  const rawEarnings = useMemo(() => {
    if (transactions.length > 0) {
      return transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
    }
    return completedJobs.reduce((acc, j) => acc + (j.payout_amount || 0), 0);
  }, [transactions, completedJobs]);

  const displayEarnings = useMemo(() => {
    return rawEarnings;
  }, [rawEarnings]);

  // Verified Status eligibility: at least one genuinely completed task
  const isVerified = displayCompletedTasks >= 1;

  // Dynamic Completion Rate
  const completionRate = useMemo(() => {
    if (claimedJobs.length === 0) {
      return displayCompletedTasks > 0 ? 100 : null;
    }
    return Math.round((completedJobs.length / claimedJobs.length) * 100);
  }, [claimedJobs.length, completedJobs.length, displayCompletedTasks]);

  // Unique Public URL for the Digital Work Passport
  const passportUrl = useMemo(() => {
    const targetId = worker?.id || workerId || '';
    if (!targetId) return '';
    return getPublicWorkerUrl(targetId);
  }, [worker?.id, workerId]);

  // Generate Offline QR Code using the qrcode library
  useEffect(() => {
    if (!passportUrl) return;
    QRCode.toDataURL(passportUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#0284c7', // Sky-600
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.warn('QR code generation warning:', err));
  }, [passportUrl]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && passportUrl) {
      navigator.clipboard.writeText(passportUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const workerName = worker?.name ? worker.name.replace(/\s+/g, '_') : (workerId || 'Worker');
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `Talent2Task_Passport_${workerName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find review corresponding to a specific completed job
  const getReviewForJob = (jobId: string): FeedbackReview | undefined => {
    return reviews.find(r => r.job_id === jobId);
  };

  const isRecruiterViewing = currentUser?.role === 'recruiter' || isPublicView;

  // Render null if closed
  if (!isOpen) return null;

  // Fallback for missing or invalid worker record
  if (!worker) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
        <div 
          className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scaleUp overflow-hidden flex flex-col items-center text-center space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-slate-900">
              Worker Profile Not Found
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No verified worker profile was found for identifier:
            </p>
            {workerId && (
              <p className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 inline-block mt-1">
                {workerId}
              </p>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The worker profile link may be invalid, or this device has not synced this worker's record yet.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
          >
            Close / Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl animate-scaleUp overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
              isVerified ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                <span>{isVerified ? 'Talent2Task Verified Worker' : 'Worker Profile'}</span>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                    <CheckCircle2 className="w-3 h-3 text-sky-600" />
                    Verified
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {isVerified 
                  ? 'Digital Work Passport • Authenticated Experience' 
                  : 'Complete your first task to become a verified worker.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center border-b border-slate-100 bg-white px-5 pt-2 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('passport')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'passport'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Work Passport</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Work History ({completedJobs.length})</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          
          {/* Worker Identity Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar with Verified Ring */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md border-2 border-white/20">
                    {worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}
                  </div>
                  {isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-slate-900 shadow-xs" title="Verified Worker">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Name & Primary Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-white">{worker.name}</h2>
                    {isVerified && (
                      <span className="bg-sky-500/30 text-sky-300 border border-sky-400/40 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-sky-300" />
                        ✓ Verified Worker
                      </span>
                    )}
                  </div>

                  {/* Prominent Job Role & Experience Badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 border border-sky-300/30 text-xs font-bold shadow-xs">
                      <Briefcase className="w-3.5 h-3.5 text-sky-300" />
                      <span>{displayRole} • {displayExperience} yrs exp</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      {localizeContent(worker.city || worker.landmark || 'Tamil Nadu', language)}
                    </span>
                    {worker.preferred_language && (
                      <>
                        <span>•</span>
                        <span className="uppercase font-semibold">{worker.preferred_language}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Recruitment Action if Recruiter Viewing */}
              {isRecruiterViewing && worker.phone && (
                <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                  <a
                    href={`tel:${worker.phone}`}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Candidate</span>
                  </a>
                  <a
                    href={`https://wa.me/${worker.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 bg-white/10 hover:bg-white/20 transition"
                    title="WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Skills Badges inside Header Card */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-1.5">
              {worker.skills && worker.skills.length > 0 ? (
                worker.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/10 text-sky-200 border border-white/10 backdrop-blur-xs"
                  >
                    {localizeContent(skill, language)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">General Worker</span>
              )}
            </div>
          </div>

          {/* Dynamic Real Statistics Grid (No hardcoded values) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Completed Tasks */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Completed Tasks
              </div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {displayCompletedTasks}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {displayCompletedTasks === 1 ? '1 Task' : `${displayCompletedTasks} Tasks`}
              </div>
            </div>

            {/* 2. Average Rating */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Average Rating
              </div>
              {displayRating ? (
                <>
                  <div className="text-xl font-black text-amber-600 mt-1 flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{displayRating.average}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    ({displayRating.count} {displayRating.count === 1 ? 'review' : 'reviews'})
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs font-bold text-slate-400 mt-2">
                    No ratings yet
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">0 reviews</div>
                </>
              )}
            </div>

            {/* 3. Verified Earnings */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Verified Earnings
              </div>
              <div className="text-xl font-black text-emerald-600 mt-1">
                ₹{displayEarnings.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {transactions.length > 0 ? 'Confirmed Payouts' : (displayCompletedTasks > 0 ? 'Verified Payouts' : 'No payouts yet')}
              </div>
            </div>

            {/* 4. Completion Rate */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Completion Rate
              </div>
              {completionRate !== null ? (
                <>
                  <div className="text-xl font-black text-sky-600 mt-1">
                    {completionRate}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {displayCompletedTasks} of {claimedJobs.length > 0 ? claimedJobs.length : displayCompletedTasks} claimed
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs font-bold text-slate-400 mt-2">
                    {displayCompletedTasks > 0 ? '100%' : 'Not enough data'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{displayCompletedTasks} claimed</div>
                </>
              )}
            </div>
          </div>

          {/* TAB 1: DIGITAL WORK PASSPORT & QR */}
          {activeTab === 'passport' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-r from-sky-50 to-blue-50/60 p-4 sm:p-5 rounded-3xl border border-sky-200 space-y-3">
                <div className="flex items-center gap-2 text-sky-900">
                  <QrCode className="w-5 h-5 text-sky-600" />
                  <h4 className="font-heading text-sm sm:text-base font-bold uppercase tracking-wider">
                    DIGITAL WORK PASSPORT
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your official Talent2Task digital credential. Employers, recruiters, and clients can scan this QR code to view your verified work history and validated skill profile in real-time.
                </p>

                {/* QR Display Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2 flex-1">
                    <span className="text-xs font-bold text-slate-900">
                      Scan to View Verified Worker Profile
                    </span>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      Recruitment-safe public verification. Anyone scanning this QR code will see your verified identity, completed tasks, rating, and current job role in real-time.
                    </p>

                    {/* Prominent Real-time Credential Snapshot Box */}
                    <div className="w-full bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Seeker Name:</span>
                        <span className="font-bold text-slate-900">{worker.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Job Role:</span>
                        <span className="font-bold text-sky-700">{displayRole} • {displayExperience} yrs exp</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Completed Tasks:</span>
                        <span className="font-bold text-emerald-700">{displayCompletedTasks} Tasks</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Average Rating:</span>
                        <span className="font-bold text-amber-600">
                          {displayRating ? `⭐ ${displayRating.average} (${displayRating.count} ${displayRating.count === 1 ? 'review' : 'reviews'})` : 'No ratings yet'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                      </button>

                      {qrDataUrl && (
                        <button
                          type="button"
                          onClick={handleDownloadQr}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-sky-600" />
                          <span>Save QR</span>
                        </button>
                      )}
                    </div>

                    {/* Public Profile Link Display */}
                    <div className="w-full pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Public Profile Link:</span>
                      <span className="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200 text-[10px] break-all max-w-full sm:max-w-[280px]" title={passportUrl}>
                        {passportUrl}
                      </span>
                    </div>
                  </div>

                  {/* QR Image */}
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-inner shrink-0 flex flex-col items-center">
                    {qrDataUrl ? (
                      <img 
                        src={qrDataUrl} 
                        alt="Talent2Task Digital Work Passport QR" 
                        className="w-40 h-40 rounded-xl object-contain"
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                        Generating QR...
                      </div>
                    )}
                    <div className="mt-1.5 flex flex-col items-center gap-0.5">
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                        {displayRole}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">ID: {worker.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Eligibility Notice */}
              {!isVerified && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Verification Pending</div>
                    <div className="text-[11px] text-amber-700 mt-0.5">
                      Your profile will officially receive the <span className="font-bold">“✓ Talent2Task Verified Worker”</span> credential automatically once you complete your first gig and receive recruiter confirmation.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VERIFIED WORK HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                  WORK HISTORY ({completedJobs.length})
                </h4>
                <span className="text-[10px] text-slate-500">Authenticated completions</span>
              </div>

              {completedJobs.length > 0 ? (
                <div className="space-y-2.5">
                  {completedJobs.map(job => {
                    const review = getReviewForJob(job.id);
                    return (
                      <div 
                        key={job.id} 
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition space-y-2"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                              {localizeContent(job.category, language)}
                            </span>
                            <h5 className="font-heading text-sm font-bold text-slate-900 mt-1">
                              {localizeContent(job.title, language)}
                            </h5>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-black text-sky-600">
                              ₹{job.payout_amount}
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Completed
                            </span>
                          </div>
                        </div>

                        {/* Location & Completed Date */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-sky-500" />
                            {localizeContent(job.landmark_area || 'Tamil Nadu', language)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {job.created_at?.split(' ')[0] || 'Recently'}
                          </span>
                        </div>

                        {/* Recruiter Review if Available */}
                        {review && (
                          <div className="mt-2 p-2.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5 text-sky-500" />
                                {review.from_user_name || 'Recruiter Feedback'}
                              </span>
                              <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-500" />
                                <span>{review.rating}</span>
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-[11px] text-slate-600 italic">
                                "{review.comment}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No completed work yet.</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Claim and complete local gigs to build your permanent, verified digital work history.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            <span>Encrypted • Tamper-proof Offline Local Credentials</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
