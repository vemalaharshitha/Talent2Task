import React from 'react';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2
} from 'lucide-react';
import type { SafeGigSession } from '../../types';
import { sqliteManager } from '../../db/sqliteManager';

interface SafeGigHistoryModalProps {
  sessions?: SafeGigSession[];
  workerId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SafeGigHistoryModal: React.FC<SafeGigHistoryModalProps> = ({
  sessions,
  workerId,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const allSessions = sessions || (workerId ? sqliteManager.getSafeGigSessionsByWorker(workerId) : sqliteManager.getSafeGigSessions());
  const completedSessions = allSessions.filter(s => s.status === 'COMPLETED' || s.status === 'SOS_TRIGGERED');

  const formatDuration = (totalSeconds: number): string => {
    if (!totalSeconds || totalSeconds < 60) {
      return `${totalSeconds || 0} secs`;
    }
    const mins = Math.floor(totalSeconds / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) {
      return `${hrs} hr ${remMins} mins`;
    }
    return `${mins} mins`;
  };

  const formatDate = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  const formatTime = (isoString?: string): string => {
    if (!isoString) return '--:--';
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="glass-panel w-full max-w-xl max-h-[85vh] rounded-3xl border border-slate-200 shadow-2xl bg-white overflow-hidden flex flex-col p-5 sm:p-6 space-y-4 animate-scaleUp"
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
                SafeGig Safety History
              </h2>
              <p className="text-xs text-slate-500">
                Completed worker safety sessions & check-outs
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

        {/* Scrollable List */}
        <div className="overflow-y-auto space-y-3 pr-1 max-h-[60vh]">
          {completedSessions.length === 0 ? (
            <div className="py-12 text-center space-y-2 text-slate-400">
              <ShieldCheck className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-sm text-slate-600">
                No SafeGig sessions yet.
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                When you accept a gig and start work with SafeGig, your completed safety sessions will be recorded here.
              </p>
            </div>
          ) : (
            completedSessions.map((s) => {
              const isSos = s.status === 'SOS_TRIGGERED' || s.sos_activated;

              return (
                <div 
                  key={s.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {s.job_title}
                      </h4>
                      <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                        <MapPin className="w-3 h-3 text-sky-500" />
                        <span className="truncate">{s.job_location || 'Assigned Location'}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${
                      isSos 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isSos ? (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          <span>SOS Alert Recorded</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed Safely</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Date</span>
                      <span className="font-semibold text-slate-700">{formatDate(s.started_at)}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Time Span</span>
                      <span className="font-semibold text-slate-700">
                        {formatTime(s.started_at)} - {formatTime(s.checked_out_at)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Work Duration</span>
                      <span className="font-semibold text-sky-700">
                        {formatDuration(s.duration_seconds)}
                      </span>
                    </div>
                  </div>

                  {s.safety_note && (
                    <div className="text-[11px] text-slate-500 italic bg-white/80 p-2 rounded-lg border border-slate-200/50">
                      &ldquo;{s.safety_note}&rdquo;
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
