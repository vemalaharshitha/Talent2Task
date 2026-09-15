import React from 'react';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import type { Job } from '../../types';

interface StartWorkConfirmModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmStart?: () => void;
  onConfirm?: (job: Job) => void;
}

export const StartWorkConfirmModal: React.FC<StartWorkConfirmModalProps> = ({
  job,
  isOpen,
  onClose,
  onConfirmStart,
  onConfirm
}) => {
  if (!isOpen || !job) return null;

  const handleStart = () => {
    if (onConfirm) onConfirm(job);
    else if (onConfirmStart) onConfirmStart();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="glass-panel w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl bg-white overflow-hidden p-5 sm:p-6 space-y-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Start Work with SafeGig
              </h2>
              <p className="text-xs text-slate-500">
                Confirm your active task session
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Details Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Confirmed Task</span>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5">{job.title}</h3>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="truncate">{job.landmark_area || 'Location'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Compensation</span>
              <p className="font-bold text-sky-600 text-xs mt-0.5">
                ₹{job.payout_amount} / {job.payout_unit}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Status</span>
              <p className="font-bold text-slate-800 text-xs mt-0.5">
                Accepted Gig
              </p>
            </div>
          </div>
        </div>

        {/* Safety feature explanation */}
        <div className="p-3 bg-sky-50/70 border border-sky-200/70 rounded-xl text-[11px] text-sky-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <span>
            SafeGig tracks your elapsed work duration locally and keeps an emergency SOS action readily available. Your privacy is protected and you will not be tracked continuously.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStart}
            className="py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>START WORK</span>
          </button>
        </div>

      </div>
    </div>
  );
};
