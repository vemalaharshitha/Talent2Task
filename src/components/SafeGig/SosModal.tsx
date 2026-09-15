import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  Phone, 
  PhoneCall, 
  MapPin, 
  ShieldAlert, 
  Share2, 
  Check, 
  Copy,
  Info
} from 'lucide-react';
import type { SafeGigSession, Job, User } from '../../types';
import { triggerOfflineSms } from '../../utils/smsHelper';

interface SosModalProps {
  session: SafeGigSession | null;
  job?: Job | null;
  currentUser?: User | null;
  worker?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSos: (locationData?: { lat?: number; lng?: number; address?: string }) => void;
}

export const SosModal: React.FC<SosModalProps> = ({
  session,
  job,
  currentUser,
  worker,
  isOpen,
  onClose,
  onConfirmSos
}) => {
  const activeUser = worker || currentUser || null;
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat?: number; lng?: number; address?: string } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'loading' | 'success' | 'denied'>('prompt');
  const [copied, setCopied] = useState<boolean>(false);

  // If session is already in SOS state when opening, show activated view
  useEffect(() => {
    if (isOpen && session?.sos_activated) {
      setIsActivated(true);
      if (session.location_lat && session.location_lng) {
        setGpsLocation({
          lat: session.location_lat,
          lng: session.location_lng,
          address: session.location_address
        });
        setLocationStatus('success');
      }
    } else if (isOpen) {
      setIsActivated(false);
      setGpsLocation(null);
      setLocationStatus('prompt');
      setCopied(false);
    }
  }, [isOpen, session]);

  if (!isOpen || !session) return null;

  const workerName = activeUser?.name || 'Worker';
  const displayTitle = job?.title || session.job_title || 'Active Task';
  const displayLocation = job?.landmark_area || session.job_location || activeUser?.landmark || 'Task Location';
  const startTime = new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const emergencyName = activeUser?.emergency_contact_name;
  const emergencyPhone = activeUser?.emergency_contact_phone;

  const handleActivateSos = () => {
    setIsActivated(true);
    setLocationStatus('loading');

    // Attempt to retrieve location with explicit user permission
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: `Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`
          };
          setGpsLocation(loc);
          setLocationStatus('success');
          onConfirmSos(loc);
        },
        () => {
          setLocationStatus('denied');
          onConfirmSos(undefined);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocationStatus('denied');
      onConfirmSos(undefined);
    }
  };

  const generateSosMessage = (): string => {
    const locStr = gpsLocation?.lat && gpsLocation?.lng
      ? `\nGPS: https://maps.google.com/?q=${gpsLocation.lat},${gpsLocation.lng}`
      : '';
    return `EMERGENCY ALERT (Talent2Task SafeGig)\nWorker: ${workerName}\nTask: ${displayTitle}\nTask Location: ${displayLocation}\nStarted: ${startTime}\nAlert Time: ${currentTime}${locStr}\nPlease provide immediate assistance!`;
  };

  const handleCopyDetails = () => {
    const text = generateSosMessage();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleShareDetails = () => {
    const text = generateSosMessage();
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      navigator.share({
        title: 'SafeGig Emergency Alert',
        text
      }).catch(() => {});
    } else {
      handleCopyDetails();
    }
  };

  const handleSmsDraft = () => {
    if (emergencyPhone) {
      triggerOfflineSms(emergencyPhone, generateSosMessage());
    } else {
      triggerOfflineSms('112', generateSosMessage());
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="glass-panel w-full max-w-lg rounded-3xl border border-rose-300 shadow-2xl bg-white overflow-hidden p-5 sm:p-6 space-y-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >

        {/* STEP 1: Confirmation Dialog */}
        {!isActivated ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-900">
                    Emergency SOS Confirmation
                  </h2>
                  <p className="text-xs text-slate-500">
                    SafeGig Safety Assistance
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

            <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 text-xs text-rose-900 space-y-2">
              <p className="font-bold text-sm text-rose-900">
                Are you sure you want to activate SOS?
              </p>
              <p className="text-rose-800 leading-relaxed">
                Activating SOS will prepare your task details, worker identity, and location information, giving you direct one-touch access to dial <strong>112 (National Emergency Helpline)</strong> and your emergency contact.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleActivateSos}
                className="py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>ACTIVATE SOS</span>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: Activated SOS Screen */
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center animate-bounce shadow-md">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-black text-rose-600 tracking-wide">
                    🚨 SOS ACTIVATED
                  </h2>
                  <p className="text-xs text-slate-500">
                    Your emergency information is prepared.
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

            {/* Realistic Capability Fallback Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Automatic emergency messaging is unavailable on this device. Please use the direct one-touch call and alert options below:
              </span>
            </div>

            {/* Emergency Information Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span>SOS ALERT DETAILS</span>
                <span className="text-[10px] text-rose-600 font-mono font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">ACTIVE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Worker</span>
                  <p className="font-bold text-slate-800">{workerName}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Task</span>
                  <p className="font-bold text-slate-800 truncate">{displayTitle}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Task Location</span>
                  <p className="text-slate-700 truncate">{displayLocation}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Started / Current Time</span>
                  <p className="text-slate-700">{startTime} / <span className="font-semibold text-rose-600">{currentTime}</span></p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Emergency Contact</span>
                {emergencyName || emergencyPhone ? (
                  <p className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <span>{emergencyName || 'Emergency Contact'}:</span>
                    <span className="font-mono text-sky-700">{emergencyPhone}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 italic mt-0.5">
                    No emergency contact set. (You can add one anytime in your Profile).
                  </p>
                )}
              </div>

              {/* Location Status */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Location Status</span>
                {locationStatus === 'loading' ? (
                  <p className="text-slate-600 flex items-center gap-1 animate-pulse mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-500" />
                    <span>Acquiring device GPS coordinates...</span>
                  </p>
                ) : locationStatus === 'success' && gpsLocation?.lat ? (
                  <p className="text-emerald-700 font-semibold flex items-center gap-1 mt-0.5 font-mono text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lat: {gpsLocation.lat.toFixed(5)}, Lng: {gpsLocation.lng?.toFixed(5)}</span>
                  </p>
                ) : (
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Location access is unavailable. SOS can still provide task and worker information.
                  </p>
                )}
              </div>
            </div>

            {/* Direct Calling & Action Buttons */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 112 National Helpline */}
                <a
                  href="tel:112"
                  className="py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>CALL 112 (POLICE / MEDICAL)</span>
                </a>

                {/* Emergency Contact Call */}
                {emergencyPhone ? (
                  <a
                    href={`tel:${emergencyPhone.replace(/[^0-9+]/g, '')}`}
                    className="py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Phone className="w-4 h-4 text-sky-400" />
                    <span>CALL CONTACT</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleSmsDraft}
                    className="py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-sky-400" />
                    <span>DRAFT EMERGENCY SMS</span>
                  </button>
                )}
              </div>

              {/* Share & Copy Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleShareDetails}
                  className="py-2.5 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Share SOS Text</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyDetails}
                  className="py-2.5 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy SOS Text'}</span>
                </button>
              </div>
            </div>

            {/* Close / Dismiss */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Close SOS Window
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
