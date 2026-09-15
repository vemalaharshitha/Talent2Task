import React from 'react';
import type { Job, User, SafeGigSession } from '../../types';
import { 
  ShieldCheck, 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare,
  CheckCircle2,
  Play,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { formatDistance } from '../../services/geoService';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizeContent } from '../../i18n/translations';
import { triggerOfflineSms } from '../../utils/smsHelper';
import { sqliteManager } from '../../db/sqliteManager';

interface MyClaimedJobsProps {
  jobs: Job[];
  currentUser: User;
  onViewDetails: (job: Job) => void;
  onExploreGigs: () => void;
  onGetDirections?: (job: Job) => void;
  activeSession?: SafeGigSession | null;
  onStartWork?: (job: Job) => void;
  onOpenCheckOut?: (job: Job) => void;
  onOpenSos?: (job: Job) => void;
}

export const MyClaimedJobs: React.FC<MyClaimedJobsProps> = ({
  jobs,
  currentUser,
  onViewDetails,
  onExploreGigs,
  onGetDirections,
  activeSession,
  onStartWork,
  onOpenCheckOut,
  onOpenSos
}) => {
  const { t, language } = useLanguage();

  const myClaimed = jobs.filter(j => j.claimed_by === currentUser.id);

  if (myClaimed.length === 0) {
    return (
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-4 bg-white">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto text-sky-600">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h3 className="font-heading text-lg font-bold text-slate-900">
          {t.noClaimedGigsTitle}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          {t.noClaimedGigsDesc}
        </p>
        <button
          onClick={onExploreGigs}
          className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 transition-all cursor-pointer"
        >
          {t.allGigsTab}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-500" />
            <span>{t.myGigsTab} ({myClaimed.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            {t.myClaimedSubtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myClaimed.map((job) => {
          const isCompleted = job.status === 'COMPLETED';
          const isPaid = job.payment_status === 'PAID' || (isCompleted && job.payment_transaction_id);
          const recruiterObj = sqliteManager.getUserById(job.recruiter_id);
          const recruiterPhone = recruiterObj?.phone || job.recruiter_phone || '9944011223';
          const recruiterName = recruiterObj?.name || job.recruiter_name || 'Vellore Recruiter';
          const localizedTitle = localizeContent(job.title, language);

          return (
            <div
              key={job.id}
              onClick={() => {
                if (!isCompleted) {
                  onViewDetails(job);
                }
              }}
              className={`glass-panel rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 relative overflow-hidden bg-white ${
                isCompleted ? 'cursor-default' : 'hover:border-sky-300 hover:shadow-md transition-all cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                    {localizeContent(job.category, language)}
                  </span>
                  <h3 className="font-heading text-base font-bold text-slate-900 mt-1">
                    {localizedTitle}
                  </h3>
                </div>

                <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${
                  isPaid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isCompleted
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-sky-50 text-sky-700 border-sky-200'
                }`}>
                  {isPaid ? (t.paidStatus || 'Paid') : (isCompleted ? (t.paymentCompleted || t.completedBadge) : t.statusClaimed)}
                </span>
              </div>

              {/* Landmark & Distance */}
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  <span>{localizeContent(job.landmark_area, language)}</span>
                </div>
                {job.distanceKm !== undefined && (
                  <div className="flex items-center gap-1 text-sky-600 font-semibold">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{formatDistance(job.distanceKm)}</span>
                  </div>
                )}
              </div>

              {/* Payment Received Banner if Paid */}
              {isPaid && (
                <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Payment Received</span>
                    </div>
                    <span className="font-bold text-emerald-700">₹{job.payout_amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-700/80 pt-0.5">
                    <span>From: <span className="font-semibold text-emerald-900">{recruiterName}</span></span>
                    <span className="font-mono text-[10px]">{job.payment_transaction_id || 'T2T-TXN-VERIFIED'}</span>
                  </div>
                </div>
              )}

              {/* Pay & Recruiter */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">{t.earnings}</div>
                  <div className="text-base font-extrabold text-sky-600">
                    ₹{job.payout_amount} <span className="text-xs font-normal text-slate-500">/ {localizeContent(job.payout_unit, language)}</span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {onGetDirections && (
                    <button
                      type="button"
                      onClick={() => onGetDirections(job)}
                      className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
                      title={t.directionsBtn}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{t.directionsBtn}</span>
                    </button>
                  )}

                  <button
                    onClick={() => window.open(`tel:${recruiterPhone}`, '_self')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    title={t.callRecruiterBtn}
                  >
                    <Phone className="w-4 h-4 text-sky-600" />
                  </button>

                  <button
                    onClick={() => {
                      const cleanPhone = recruiterPhone.replace(/[^0-9]/g, '');
                      const msg = encodeURIComponent(`Hello ${recruiterName}, regarding "${localizedTitle}" that I accepted on Talent2Task.`);
                      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
                    }}
                    className="p-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-colors shadow-sm cursor-pointer"
                    title={t.whatsappRecruiterBtn}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      const msg = `Hi ${recruiterName}, I have claimed your gig "${localizedTitle}" on Talent2Task. My Name: ${currentUser.name}, Phone: ${currentUser.phone}. Please contact me!`;
                      triggerOfflineSms(recruiterPhone, msg);
                    }}
                    className="px-2.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-xs active:scale-95 cursor-pointer"
                    title="Send direct offline cellular SMS to recruiter"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>SMS</span>
                  </button>
                </div>
              </div>

              {/* SafeGig Worker Safety Action Area (Only for accepted/claimed jobs that are not completed) */}
              {!isCompleted && (
                <div 
                  className="mt-3 pt-3 border-t border-slate-100/90" 
                  onClick={(e) => e.stopPropagation()}
                >
                  {activeSession?.job_id === job.id ? (
                    /* Currently Active SafeGig Session Banner */
                    <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-300 flex flex-wrap items-center justify-between gap-2.5 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                        </span>
                        <div>
                          <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                            <span>🟢 Work Started</span>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-medium">SafeGig Safety Session Active</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenCheckOut?.(job)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Check Out</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenSos?.(job)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>🚨 SOS</span>
                        </button>
                      </div>
                    </div>
                  ) : !activeSession ? (
                    /* SafeGig START WORK Button */
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-700">SafeGig Protection</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onStartWork?.(job)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>START WORK</span>
                      </button>
                    </div>
                  ) : (
                    /* Another task active */
                    <div className="flex items-center justify-between text-[11px] text-slate-400 py-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Another SafeGig session is active</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};
