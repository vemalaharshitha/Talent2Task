import React, { useState } from 'react';
import type { WorkerReliabilityMetrics } from '../../types';
import { ShieldCheck, Award, Star, CheckCircle, Info, UserCheck } from 'lucide-react';

interface ReliabilityBadgeProps {
  metrics: WorkerReliabilityMetrics;
  compact?: boolean;
  showDetailsModal?: boolean;
}

export const ReliabilityBadge: React.FC<ReliabilityBadgeProps> = ({
  metrics,
  compact = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Exceptional':
        return {
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          scoreColor: 'text-emerald-700',
          icon: Award
        };
      case 'Reliable':
      case 'Solid':
      case 'High':
        return {
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
          scoreColor: 'text-indigo-700',
          icon: ShieldCheck
        };
      case 'Needs Improvement':
        return {
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          scoreColor: 'text-amber-700',
          icon: Info
        };
      case 'High Risk':
        return {
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          scoreColor: 'text-rose-700',
          icon: Info
        };
      case 'New Worker':
      default:
        return {
          badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
          scoreColor: 'text-sky-700',
          icon: UserCheck
        };
    }
  };

  const style = getTierColor(metrics.reliabilityTier);
  const IconComponent = style.icon;

  if (compact) {
    return (
      <div 
        className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.badgeBg} shadow-xs cursor-pointer transition-all hover:scale-105`}
        onClick={() => setShowTooltip(!showTooltip)}
        title={metrics.dataSourceSummary}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
        <IconComponent className="w-3.5 h-3.5" />
        <span>{metrics.score}/100</span>
        <span className="text-gray-400 font-normal">|</span>
        <span className="font-medium">{metrics.reliabilityTier}</span>

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-auto">
            <div className="font-bold flex items-center gap-1.5 text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Reliability Intelligence</span>
            </div>
            <p className="text-gray-300 leading-relaxed text-[11px] mb-2">
              {metrics.dataSourceSummary}
            </p>
            <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-800 pt-1.5">
              <span>Completion: {metrics.completionRate}%</span>
              <span>{metrics.totalReviews} Reviews</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl border ${style.badgeBg} bg-opacity-40 transition-all`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-xs border ${style.badgeBg}`}>
            <IconComponent className={`w-5 h-5 ${style.scoreColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                Worker Reliability Score
              </h4>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${style.badgeBg}`}>
                {metrics.reliabilityTier}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Continuous feedback cycle & task history
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-xl font-black ${style.scoreColor} flex items-baseline justify-end gap-0.5`}>
            <span>{metrics.score}</span>
            <span className="text-xs font-semibold text-gray-400">/100</span>
          </div>
          <span className="text-[10px] text-gray-500 font-medium">Dynamic Metric</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200/60 text-center">
        <div className="bg-white/80 rounded-xl p-2 border border-gray-100">
          <div className="text-xs font-bold text-gray-900 flex items-center justify-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{metrics.completionRate}%</span>
          </div>
          <span className="text-[10px] text-gray-500">Completion</span>
        </div>

        <div className="bg-white/80 rounded-xl p-2 border border-gray-100">
          <div className="text-xs font-bold text-gray-900 flex items-center justify-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : 'New'}</span>
          </div>
          <span className="text-[10px] text-gray-500">{metrics.totalReviews} Reviews</span>
        </div>

        <div className="bg-white/80 rounded-xl p-2 border border-gray-100">
          <div className="text-xs font-bold text-gray-900 flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>{metrics.tasksCompleted}</span>
          </div>
          <span className="text-[10px] text-gray-500">Completed Gigs</span>
        </div>
      </div>

      {/* Behavioral Tags */}
      {metrics.positiveTags && metrics.positiveTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Endorsed:</span>
          {metrics.positiveTags.map((tag, idx) => (
            <span 
              key={idx} 
              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200 shadow-2xs"
            >
              ✓ {tag}
            </span>
          ))}
        </div>
      )}

      {/* Attribution info note */}
      <div className="mt-3 flex items-start gap-1.5 text-[11px] text-gray-500 bg-white/60 p-2 rounded-lg border border-gray-100">
        <Info className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
        <span className="leading-snug">{metrics.dataSourceSummary}</span>
      </div>
    </div>
  );
};
