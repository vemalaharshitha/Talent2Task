import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';
import type { SafeGigSession, Job } from '../../types';

interface SafeGigPanelProps {
  session: SafeGigSession;
  job?: Job | null;
  onOpenCheckOut?: () => void;
  onCheckOut?: () => void;
  onOpenSos?: () => void;
  onTriggerSos?: () => void;
}

export const SafeGigPanel: React.FC<SafeGigPanelProps> = ({
  session,
  job,
  onOpenCheckOut,
  onCheckOut,
  onOpenSos,
  onTriggerSos
}) => {
  const handleCheckOut = onCheckOut || onOpenCheckOut || (() => {});
  const handleSos = onTriggerSos || onOpenSos || (() => {});
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Reliable timestamp-based timer (handles app backgrounding, reopening, refresh)
  useEffect(() => {
    const calculateElapsed = () => {
      const startMs = new Date(session.started_at).getTime();
      const nowMs = Date.now();
      const diff = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setElapsedSeconds(diff);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [session.started_at]);

  const formatTimer = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedStartTime = new Date(session.started_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const displayTitle = job?.title || session.job_title || 'Active Task';
  const displayLocation = job?.landmark_area || session.job_location || 'Assigned Location';

  return (
    <aside 
      aria-label="SafeGig Active Work Safety Panel"
      className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-slideUp transition-all"
    >
      <div className="bg-slate-900/95 backdrop-blur-xl text-white rounded-3xl border border-sky-500/30 shadow-2xl overflow-hidden p-4 sm:p-5 space-y-3.5">
        
        {/* Top bar: Status & Minimize toggle */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span className="font-extrabold text-xs tracking-wider uppercase text-sky-400 font-mono">
                SafeGig
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Work Started
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title={isMinimized ? 'Expand Safety Panel' : 'Minimize Safety Panel'}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Body content */}
        {!isMinimized ? (
          <>
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <span>Task:</span>
                <span className="text-white font-bold truncate">{displayTitle}</span>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{displayLocation}</span>
              </div>
            </div>

            {/* Live Work Timer Metric */}
            <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Work Started
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">
                  {formattedStartTime}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-sky-400 uppercase font-bold tracking-wider flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3 text-sky-400 animate-pulse" />
                  <span>Elapsed Time</span>
                </div>
                <div className="font-mono text-lg font-black text-white tracking-widest mt-0.5">
                  {formatTimer(elapsedSeconds)}
                </div>
              </div>
            </div>

            {/* Action Buttons: CHECK OUT & SOS */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCheckOut}
                className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CHECK OUT</span>
              </button>

              <button
                type="button"
                onClick={handleSos}
                className="py-2.5 px-3 rounded-xl font-extrabold text-xs bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
              >
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>🚨 SOS</span>
              </button>
            </div>
          </>
        ) : (
          /* Minimized view */
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-mono text-sm font-black text-white">
                {formatTimer(elapsedSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCheckOut}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all cursor-pointer"
              >
                Check Out
              </button>

              <button
                type="button"
                onClick={handleSos}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer"
              >
                🚨 SOS
              </button>
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
