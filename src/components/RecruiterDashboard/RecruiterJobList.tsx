import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  UserCircle, 
  Phone, 
  MessageSquare, 
  Trash2, 
  Star,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import type { Job, User } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizeContent } from '../../i18n/translations';
import { triggerOfflineSms } from '../../utils/smsHelper';
import { ReliabilityBadge } from '../common/ReliabilityBadge';
import { reliabilityService } from '../../services/reliabilityService';
import { sqliteManager } from '../../db/sqliteManager';

interface RecruiterJobListProps {
  jobs: Job[];
  recruiter: User;
  onOpenPostModal: () => void;
  onUpdateStatus: (jobId: string, status: 'OPEN' | 'CLAIMED' | 'COMPLETED') => void;
  onDeleteJob: (jobId: string) => void;
  onOpenReviewModal?: (job: Job) => void;
  onOpenPayModal?: (job: Job) => void;
  onViewWorkerProfile?: (workerId: string) => void;
}

export const RecruiterJobList: React.FC<RecruiterJobListProps> = ({
  jobs,
  recruiter,
  onOpenPostModal,
  onUpdateStatus,
  onDeleteJob,
  onOpenReviewModal,
  onOpenPayModal,
  onViewWorkerProfile
}) => {
  const { t, language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLAIMED' | 'COMPLETED'>('ALL');

  // Filter only jobs posted by this recruiter
  const myPostedJobs = useMemo(() => {
    return jobs.filter(j => j.recruiter_id === recruiter.id);
  }, [jobs, recruiter.id]);

  const filteredJobs = useMemo(() => {
    if (statusFilter === 'ALL') return myPostedJobs;
    return myPostedJobs.filter(j => j.status === statusFilter);
  }, [myPostedJobs, statusFilter]);

  const openCount = myPostedJobs.filter(j => j.status === 'OPEN').length;
  const claimedCount = myPostedJobs.filter(j => j.status === 'CLAIMED').length;
  const completedCount = myPostedJobs.filter(j => j.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{t.metricTotalGigs}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{myPostedJobs.length}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-sky-200 bg-sky-50/60 shadow-xs">
          <div className="text-[11px] text-sky-700 font-semibold uppercase tracking-wider">{t.metricOpenGigs}</div>
          <div className="text-2xl font-black text-sky-600 mt-1">{openCount}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{t.metricAssignedGigs}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{claimedCount}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-slate-50 shadow-xs">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{t.metricCompletedGigs}</div>
          <div className="text-2xl font-black text-slate-700 mt-1">{completedCount}</div>
        </div>
      </div>

      {/* Filter Tabs & Post Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
          {(['ALL', 'OPEN', 'CLAIMED', 'COMPLETED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? t.allGigsFilter : tab === 'OPEN' ? t.statusOpen : tab === 'CLAIMED' ? t.statusClaimed : (t.paidStatus || 'Paid')}
            </button>
          ))}
        </div>
      </div>

      {/* Gigs List */}
      {filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const isClaimed = job.status === 'CLAIMED';
            const isCompleted = job.status === 'COMPLETED';
            const isPaid = job.payment_status === 'PAID' || Boolean(job.payment_transaction_id) || sqliteManager.isJobPaid(job.id);

            const claimantPhone = job.claimed_by_phone || '+91 98401 23456';
            const claimantName = job.claimed_by_name || 'Vellore Gig Seeker';
            const localizedTitle = localizeContent(job.title, language);

            return (
              <div
                key={job.id}
                className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-sm space-y-4 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {localizeContent(job.category, language)}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-500" />
                        <span>{localizeContent(job.landmark_area, language)}</span>
                      </span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-slate-900">
                      {localizedTitle}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${
                      job.status === 'OPEN'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : isPaid
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : isClaimed
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {job.status === 'OPEN' 
                        ? t.statusOpen 
                        : isPaid 
                        ? (t.paidStatus || 'Paid') 
                        : isClaimed 
                        ? t.statusClaimed 
                        : (t.paymentCompleted || 'Payment Completed')}
                    </span>

                    <button
                      onClick={() => onDeleteJob(job.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title={t.deleteGigBtn}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {localizeContent(job.description, language)}
                </p>

                {/* Skills & Pay Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1.5">
                    {job.required_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {localizeContent(s, language)}
                      </span>
                    ))}
                  </div>

                  <div className="text-base font-extrabold text-sky-600">
                    ₹{job.payout_amount} <span className="text-xs font-normal text-slate-500">/ {localizeContent(job.payout_unit, language)}</span>
                  </div>
                </div>

                {/* Claimant Section / Action */}
                <div className="pt-3 border-t border-slate-100">
                  {isClaimed || isCompleted ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sky-50/70 p-4 rounded-xl border border-sky-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
                          <UserCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-[11px] text-sky-700 font-bold uppercase tracking-wider">{t.claimantDetails}</div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-bold text-slate-900 text-sm">{claimantName}</div>
                            {job.claimed_by && (
                              <ReliabilityBadge 
                                metrics={reliabilityService.getWorkerReliability(job.claimed_by)} 
                                compact 
                              />
                            )}
                            {job.claimed_by && onViewWorkerProfile && (
                              <button
                                type="button"
                                onClick={() => onViewWorkerProfile(job.claimed_by!)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-full transition cursor-pointer"
                                title="View candidate's verified digital work passport"
                              >
                                <ShieldCheck className="w-3 h-3 text-sky-600" />
                                <span>Verified Passport</span>
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{claimantPhone}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => window.open(`tel:${claimantPhone}`, '_self')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-sky-600" />
                          <span>{t.callClaimantBtn}</span>
                        </button>

                        <button
                          onClick={() => {
                            const cleanPhone = claimantPhone.replace(/[^0-9]/g, '');
                            const msg = encodeURIComponent(`Hello ${claimantName}, regarding your application for "${localizedTitle}" on Talent2Task.`);
                            window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{t.whatsappClaimantBtn}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const smsMsg = `Hi ${claimantName}, regarding your application for "${localizedTitle}" on Talent2Task. I have accepted your request. Please contact me!`;
                            triggerOfflineSms(claimantPhone, smsMsg);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                          title="Send Offline SMS text message"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Offline SMS</span>
                        </button>

                        {/* Pay Now Button / Completed Payment Button */}
                        {!isPaid && onOpenPayModal ? (
                          <button
                            type="button"
                            onClick={() => onOpenPayModal(job)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
                            style={{ backgroundColor: '#059669', color: '#ffffff' }}
                            title="Pay seeker for this gig"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{t.payNowBtn || 'Pay Now'}</span>
                          </button>
                        ) : isPaid ? (
                          <button
                            type="button"
                            onClick={() => onOpenPayModal && onOpenPayModal(job)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1.5 shadow-2xs opacity-95 transition-all cursor-pointer select-none"
                            title="Payment has been completed — click to view receipt"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Completed Payment</span>
                          </button>
                        ) : null}

                        {isClaimed && !isPaid && (
                          <button
                            onClick={() => onUpdateStatus(job.id, 'COMPLETED')}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.markCompletedBtn}</span>
                          </button>
                        )}

                        {isCompleted && onOpenReviewModal && (
                          <button
                            onClick={() => onOpenReviewModal(job)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{t.rateClaimantBtn}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-500 animate-spin" />
                        <span>{t.noClaimantYet}</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-4 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto text-sky-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-base font-bold text-slate-900">
            {t.noRecruiterGigs}
          </h3>
          <button
            onClick={onOpenPostModal}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20"
          >
            {t.postNewGigBtn}
          </button>
        </div>
      )}

    </div>
  );
};
