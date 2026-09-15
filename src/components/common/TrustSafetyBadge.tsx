import React from 'react';
import { AlertTriangle, ShieldCheck, Shield } from 'lucide-react';
import type { TrustAssessment } from '../../types';

interface TrustSafetyBadgeProps {
  assessment?: TrustAssessment;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

export const TrustSafetyBadge: React.FC<TrustSafetyBadgeProps> = ({
  assessment,
  compact = false,
  onClick,
  className = ''
}) => {
  if (!assessment) return null;

  const { status, headline, riskSignals, hasSufficientRecruiterHistory } = assessment;

  let badgeColor = 'bg-slate-100 text-slate-800 border-slate-300';
  let icon: React.ReactNode = <Shield className="w-3.5 h-3.5 text-slate-600" />;
  let label = headline;

  if (status === 'potential_risk_detected') {
    badgeColor = 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100/80';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 animate-pulse" />;
    label = 'Potential Risk Detected';
  } else if (status === 'verified') {
    badgeColor = 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100/80';
    icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />;
    label = 'Verified Recruiter';
  } else if (status === 'insufficient_data') {
    badgeColor = 'bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100/80';
    icon = null;
    label = 'Standard Verification';
  } else {
    badgeColor = 'bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100/80';
    icon = <Shield className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />;
    label = 'Verified Listing';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all duration-200 shadow-2xs ${badgeColor} ${
        onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'
      } ${className}`}
      title={`${headline} — Click for safety assessment breakdown`}
    >
      {icon}
      <span>{label}</span>
      {!compact && status === 'potential_risk_detected' && riskSignals.length > 0 && (
        <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-950 text-[10px] font-black border border-amber-400">
          {riskSignals.length} {riskSignals.length === 1 ? 'Signal' : 'Signals'}
        </span>
      )}
      {!hasSufficientRecruiterHistory && status !== 'potential_risk_detected' && (
        <span className="text-[10px] text-sky-700 font-bold ml-0.5">• New</span>
      )}
    </button>
  );
};
