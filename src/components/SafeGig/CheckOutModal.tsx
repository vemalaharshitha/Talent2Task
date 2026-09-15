import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin
} from 'lucide-react';
import type { SafeGigSession, Job } from '../../types';

interface CheckOutModalProps {
  session: SafeGigSession | null;
  job?: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCheckOut: (safetyNote?: string) => void;
  onNeedHelp?: () => void;
  onTriggerSos?: () => void;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({
  session,
  job,
  isOpen,
  onClose,
  onConfirmCheckOut,
  onNeedHelp,
  onTriggerSos
}) => {
  const handleNeedHelp = onTriggerSos || onNeedHelp || (() => {});
  const [elapsedDuration, setElapsedDuration] = useState<string>('00:00:00');
  const [safetyNote, setSafetyNote] = useState<string>('');

  useEffect(() => {
    if (!session || !isOpen) return;

    const startMs = new Date(session.started_at).getTime();
    const diff = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
    const hrs = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;
    setElapsedDuration(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  const displayTitle = job?.title || session.job_title || 'Active Task';
  const displayLocation = job?.landmark_area || session.job_location || 'Assigned Location';
  const formattedStartTime = new Date(session.started_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

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
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">
                SafeGig Check-Out
              </h2>
              <p className="text-xs text-slate-500">
                Are you safe? Check out.
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

        {/* Task Summary Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Task</div>
            <div className="font-bold text-slate-900 text-sm">{displayTitle}</div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="truncate">{displayLocation}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Started At</span>
              <p className="font-semibold text-slate-800">{formattedStartTime}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Duration</span>
              <p className="font-mono font-bold text-sky-700">{elapsedDuration}</p>
            </div>
          </div>
        </div>

        {/* Optional Safety Note */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Safety Note (Optional)
          </label>
          <input
            type="text"
            value={safetyNote}
            onChange={(e) => setSafetyNote(e.target.value)}
            placeholder="e.g. Task completed without safety issues"
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Main Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => onConfirmCheckOut(safetyNote)}
            className="w-full py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>✓ I’m Safe — Check Out</span>
          </button>

          <button
            type="button"
            onClick={handleNeedHelp}
            className="w-full py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>⚠ Need Help</span>
          </button>
        </div>

        {/* Reassurance note */}
        <p className="text-[11px] text-center text-slate-400">
          Checking out safely stops your SafeGig timer and saves this safety record.
        </p>

      </div>
    </div>
  );
};
