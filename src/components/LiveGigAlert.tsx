import React, { useEffect, useState } from 'react';
import { Sparkles, MapPin, ArrowRight, X, Radio, IndianRupee } from 'lucide-react';
import type { Job } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { localizeContent } from '../i18n/translations';

interface LiveGigAlertProps {
  job: Job | null;
  onViewJob: (job: Job) => void;
  onDismiss: () => void;
}

export const LiveGigAlert: React.FC<LiveGigAlertProps> = ({ job, onViewJob, onDismiss }) => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (job) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [job, onDismiss]);

  if (!job || !isVisible) return null;

  return (
    <aside aria-label="Real-time Gig Alert" className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-bounce-short pointer-events-auto">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-0.5 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="bg-slate-900/95 text-white p-4 rounded-[15px] flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                Real-Time Gig Radar
              </span>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onDismiss, 300);
              }}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Job Details */}
          <div>
            <h4 className="font-bold text-base text-white line-clamp-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              {job.title}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-300">
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <IndianRupee className="w-3.5 h-3.5" />
                {job.payout_amount} / {job.payout_unit}
              </span>
              <span className="flex items-center gap-1 text-slate-300 truncate">
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                {job.landmark_area ? localizeContent(job.landmark_area, language) : 'Vellore'}
              </span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => {
              onViewJob(job);
              setIsVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="mt-1 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md transition transform active:scale-95 cursor-pointer"
          >
            <span>View & Claim Instantly</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
