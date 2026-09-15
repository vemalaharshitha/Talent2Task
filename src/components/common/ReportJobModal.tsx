import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Flag, Info, CheckCircle2 } from 'lucide-react';
import type { Job, User } from '../../types';
import { sqliteManager } from '../../db/sqliteManager';

interface ReportJobModalProps {
  job: Job;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted?: () => void;
}

const REPORT_REASONS = [
  {
    id: 'advance_fee',
    label: 'Request for Upfront Payment / Deposit',
    description: 'Asked for registration fee, uniform deposit, or money before starting work.'
  },
  {
    id: 'sensitive_info',
    label: 'Request for Sensitive Info or OTP',
    description: 'Asked for OTP, banking password, ATM PIN, or full Aadhaar card copy.'
  },
  {
    id: 'unrealistic_pay',
    label: 'Unrealistic or Deceptive Compensation',
    description: 'Promises unrealistic earnings or deceptive payout terms.'
  },
  {
    id: 'duplicate_spam',
    label: 'Duplicate, Fake or Spam Posting',
    description: 'Repeated identical listings or advertisement unrelated to real work.'
  },
  {
    id: 'inappropriate',
    label: 'Unsafe or Inappropriate Work Conditions',
    description: 'Job description or terms feel unsafe or inappropriate.'
  },
  {
    id: 'other',
    label: 'Other Suspicious Behavior',
    description: 'Any other concern not covered above.'
  }
];

export const ReportJobModal: React.FC<ReportJobModalProps> = ({
  job,
  currentUser,
  isOpen,
  onClose,
  onReportSubmitted
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('advance_fee');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    setIsSubmitting(true);
    const reporterId = currentUser?.id || 'anonymous_reporter';
    const reasonLabel = REPORT_REASONS.find(r => r.id === selectedReason)?.label || selectedReason;

    try {
      sqliteManager.submitReport(job.id, reporterId, reasonLabel, details.trim());
      setSubmitted(true);
      if (onReportSubmitted) {
        onReportSubmitted();
      }
    } catch (err) {
      console.error('Failed to submit job report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setDetails('');
    setSelectedReason('advance_fee');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100">Report Job Posting</h3>
              <p className="text-xs text-slate-400 line-clamp-1">{job.title}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-100">Report Logged for Review</h4>
                <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  Thank you for helping keep the Talent2Task community safe. Your report has been securely saved to our review queue.
                </p>
              </div>

              {/* Safety notice */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 text-left text-xs text-slate-300 space-y-2 mt-4">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Important Safety Reminders:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>Never pay money or deposits for job applications or equipment.</li>
                  <li>Never disclose OTPs, PINs, or net banking passwords to anyone.</li>
                  <li>Recruiters are never automatically banned solely based on reports; each report is reviewed fairly.</li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium text-sm transition-all shadow-md shadow-sky-500/20"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs text-sky-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <span>
                  Our Trust & Safety system evaluates reports transparently. To prevent abuse, jobs and recruiters are never banned automatically without human review.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Why are you reporting this posting?
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {REPORT_REASONS.map(reason => (
                    <label
                      key={reason.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedReason === reason.id
                          ? 'bg-amber-500/10 border-amber-500/50 text-slate-100'
                          : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="report_reason"
                        value={reason.id}
                        checked={selectedReason === reason.id}
                        onChange={() => setSelectedReason(reason.id)}
                        className="mt-0.5 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-900"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-slate-200">{reason.label}</div>
                        <div className="text-slate-400 mt-0.5">{reason.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Provide context or paste specific messages or requests..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-slate-200 text-xs placeholder-slate-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedReason}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-md shadow-amber-900/30 transition-all disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Submitting...' : 'Submit Report for Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
