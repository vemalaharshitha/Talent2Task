import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare, 
  Compass, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Building2,
  LocateFixed,
  Route
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Job, User } from '../../types';
import { 
  calculateHaversineDistance, 
  calculateBearing, 
  getCompassDirection, 
  getTravelEstimates, 
  buildNavigationUrl, 
  generateRoutePoints,
  type TravelMode
} from '../../services/geoService';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizeContent } from '../../i18n/translations';
import { sqliteManager } from '../../db/sqliteManager';
import { triggerOfflineSms } from '../../utils/smsHelper';

// Component to dynamically fit route bounds on the Leaflet Map
interface FitRouteBoundsProps {
  origin: [number, number];
  destination: [number, number];
}

const FitRouteBounds: React.FC<FitRouteBoundsProps> = ({ origin, destination }) => {
  const map = useMap();
  useEffect(() => {
    try {
      const bounds = L.latLngBounds([origin, destination]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } catch {}
  }, [origin, destination, map]);
  return null;
};

interface GigDirectionsModalProps {
  job: Job | null;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  isInitialClaim?: boolean;
}

export const GigDirectionsModal: React.FC<GigDirectionsModalProps> = ({
  job,
  currentUser,
  isOpen,
  onClose,
  isInitialClaim = false
}) => {
  const { t, language } = useLanguage();

  const [selectedMode, setSelectedMode] = useState<TravelMode>('bike');
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [onMyWaySent, setOnMyWaySent] = useState(false);

  // Fetch live browser GPS location for pinpoint accuracy
  useEffect(() => {
    if (!isOpen) return;
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLiveLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    }
  }, [isOpen]);

  // Determine origin coordinates: Live GPS > User profile > Fallback
  const originCoords = useMemo<[number, number]>(() => {
    if (liveLocation) {
      return [liveLocation.lat, liveLocation.lng];
    }
    if (currentUser?.latitude && currentUser?.longitude) {
      return [currentUser.latitude, currentUser.longitude];
    }
    // Fallback to Vellore Center
    return [12.9165, 79.1325];
  }, [liveLocation, currentUser]);

  // Recruiter Details fetched directly from Recruiter Profile who posted this gig
  const recruiterObj = useMemo(() => {
    return sqliteManager.getUserById(job?.recruiter_id || '');
  }, [job?.recruiter_id]);

  const recruiterName = recruiterObj?.name || job?.recruiter_name || 'Recruiter Partner';
  const recruiterPhone = recruiterObj?.phone || job?.recruiter_phone || '+91 99440 11223';
  const localizedTitle = job ? localizeContent(job.title, language) : '';
  const localizedLandmark = job ? localizeContent(job.landmark_area, language) : '';

  // Accurate Recruiter Work Address fetched from Recruiter's Profile
  const recruiterAddress = 
    recruiterObj?.address || 
    (job as any)?.recruiter_address || 
    (recruiterObj?.landmark ? `${recruiterObj.landmark}, ${recruiterObj.city || 'Tamil Nadu'}` : '') ||
    job?.landmark_area || 
    `${recruiterName}, ${recruiterObj?.city || job?.city || 'Tamil Nadu'}`;

  // Recruiter coordinates: prefer recruiter's profile coordinates if available
  const destCoords = useMemo<[number, number]>(() => {
    if (recruiterObj?.latitude && recruiterObj?.longitude) {
      return [recruiterObj.latitude, recruiterObj.longitude];
    }
    if (job?.latitude && job?.longitude) {
      return [job.latitude, job.longitude];
    }
    return [12.9165, 79.1325];
  }, [recruiterObj, job]);

  if (!isOpen || !job) return null;

  // Accurate Geodesic Distance in km
  const distanceKm = calculateHaversineDistance(
    originCoords[0],
    originCoords[1],
    destCoords[0],
    destCoords[1]
  );

  // Bearing & Cardinal Direction
  const bearingDegrees = calculateBearing(
    originCoords[0],
    originCoords[1],
    destCoords[0],
    destCoords[1]
  );
  const compassDir = getCompassDirection(bearingDegrees);

  // Multi-modal travel duration estimates
  const travelData = getTravelEstimates(distanceKm);
  const activeEstimate = travelData.estimates[selectedMode];

  // Route path waypoints for Leaflet polyline
  const routePoints = generateRoutePoints(
    originCoords[0],
    originCoords[1],
    destCoords[0],
    destCoords[1]
  );

  // Navigation URLs with exact recruiter profile address
  const googleMapsNavUrl = buildNavigationUrl(
    originCoords[0],
    originCoords[1],
    destCoords[0],
    destCoords[1],
    selectedMode,
    'google',
    recruiterAddress,
    currentUser?.address
  );

  const appleMapsNavUrl = buildNavigationUrl(
    originCoords[0],
    originCoords[1],
    destCoords[0],
    destCoords[1],
    selectedMode,
    'apple',
    recruiterAddress,
    currentUser?.address
  );

  // Custom Origin Icon (Pulsing Green Seeker)
  const originIcon = L.divIcon({
    className: 'custom-origin-icon',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-8 h-8 rounded-full bg-emerald-400/50 animate-ping"></div>
        <div class="relative flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-lg text-white font-bold text-xs">
          📍
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  // Custom Destination Icon (Sky Blue Pin)
  const destIcon = L.divIcon({
    className: 'custom-dest-icon',
    html: `
      <div class="relative flex items-center justify-center w-9 h-9">
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-sky-600 text-white border-2 border-white shadow-xl text-sm font-bold">
          🏁
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  // Handle "I'm On My Way" Notification to Recruiter
  const handleSendOnMyWay = () => {
    const cleanPhone = recruiterPhone.replace(/[^0-9+]/g, '');
    const msg = `Hi ${recruiterName}, I have accepted your gig "${localizedTitle}" on Talent2Task. I am on my way to ${recruiterAddress}! My ETA is approx ${activeEstimate.formattedDuration} (${activeEstimate.label}). My Phone: ${currentUser?.phone || ''}`;

    const waMsg = encodeURIComponent(msg);
    window.open(`https://wa.me/${cleanPhone.replace('+', '')}?text=${waMsg}`, '_blank');
    setOnMyWaySent(true);
  };

  const handleSendOnMyWaySms = () => {
    const msg = `Hi ${recruiterName}, I accepted "${localizedTitle}". I am on my way to ${recruiterAddress}! ETA ~${activeEstimate.formattedDuration}. Name: ${currentUser?.name || 'Job Seeker'}, Phone: ${currentUser?.phone || ''}`;
    triggerOfflineSms(recruiterPhone, msg);
    setOnMyWaySent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="glass-panel w-full max-w-2xl max-h-[92vh] rounded-3xl border border-slate-200 shadow-2xl bg-white overflow-hidden flex flex-col relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Banner */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 text-white flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                {localizeContent(job.category, language)}
              </span>
              {isInitialClaim ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400 text-slate-900 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  Gig Claimed!
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-white" />
                  {t.claimedBadge}
                </span>
              )}
            </div>

            <h2 className="font-heading text-lg sm:text-xl font-extrabold leading-tight text-white flex items-center gap-2">
              <Route className="w-5 h-5 text-sky-200" />
              <span>{t.directionsModalTitle}</span>
            </h2>
            <p className="text-xs text-sky-100 font-medium">
              {localizedTitle} • {recruiterName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm bg-slate-50/50">
          
          {/* Origin & Destination Coords Card */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></div>
                <div className="w-0.5 h-7 bg-dashed border-l-2 border-slate-300"></div>
                <div className="w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-xs"></div>
              </div>

              <div className="flex-1 space-y-3">
                {/* Origin */}
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>{t.yourLocationLabel}</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <LocateFixed className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                      {isLocating ? 'Locating GPS...' : liveLocation ? 'Live GPS Active' : 'Registered Location'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {currentUser?.address || currentUser?.city || 'Your Location'} ({originCoords[0].toFixed(4)}° N, {originCoords[1].toFixed(4)}° E)
                  </div>
                </div>

                {/* Destination */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>{t.gigLocationLabel}</span>
                    <span className="text-sky-700 font-semibold flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {recruiterName}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-sky-800 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-900 font-extrabold">{recruiterAddress}</div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        {destCoords[0].toFixed(4)}° N, {destCoords[1].toFixed(4)}° E • {recruiterObj?.city || job.city || 'Tamil Nadu'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Mode Selector & Live ETAs */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>{t.estimatedArrival}</span>
              </div>
              <div className="text-xs font-extrabold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                {travelData.formattedDistance} ({distanceKm.toFixed(1)} km)
              </div>
            </div>

            {/* Mode Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['bike', 'car', 'auto', 'walking'] as TravelMode[]).map((mode) => {
                const est = travelData.estimates[mode];
                const isSelected = selectedMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSelectedMode(mode)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{est.icon}</span>
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-sky-100' : 'text-slate-600'}`}>
                        ~{est.speedKmph} km/h
                      </span>
                    </div>
                    <div className={`text-xs font-bold mt-1 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {est.formattedDuration}
                    </div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-sky-100' : 'text-slate-600'}`}>
                      {mode === 'bike' ? t.travelModeBike : mode === 'car' ? t.travelModeCar : mode === 'auto' ? t.travelModeAuto : t.travelModeWalk}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Compass Guidance */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-sky-500" />
                <span>Head <strong>{compassDir.label} ({compassDir.code})</strong> towards {localizedLandmark}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-600">
                {bearingDegrees.toFixed(0)}° Bearing
              </span>
            </div>
          </div>

          {/* Interactive Leaflet Route Map */}
          <div className="h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
            <MapContainer
              center={originCoords}
              zoom={13}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitRouteBounds origin={originCoords} destination={destCoords} />

              {/* Origin Marker */}
              <Marker position={originCoords} icon={originIcon}>
                <Popup>
                  <div className="text-xs font-bold text-slate-800">
                    📍 {t.yourLocationLabel}
                  </div>
                </Popup>
              </Marker>

              {/* Destination Marker */}
              <Marker position={destCoords} icon={destIcon}>
                <Popup>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-sky-600">{localizedTitle}</div>
                    <div className="text-slate-600">🏁 {localizedLandmark}</div>
                    <div className="font-extrabold text-emerald-600">₹{job.payout_amount} / {job.payout_unit}</div>
                  </div>
                </Popup>
              </Marker>

              {/* Polyline Route */}
              <Polyline
                positions={routePoints}
                pathOptions={{
                  color: '#0284c7',
                  weight: 5,
                  opacity: 0.85,
                  dashArray: '8, 8'
                }}
              />
            </MapContainer>
          </div>

          {/* Primary Action: Turn-by-Turn GPS Navigation */}
          <div className="space-y-2">
            <a
              href={googleMapsNavUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98"
            >
              <Navigation className="w-5 h-5 text-sky-200 animate-pulse" />
              <span>{t.startNavigationBtn}</span>
              <ExternalLink className="w-4 h-4 text-sky-200 ml-1" />
            </a>

            <div className="flex items-center gap-2">
              <a
                href={appleMapsNavUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.openAppleMapsBtn}</span>
              </a>

              <a
                href={`https://waze.com/ul?ll=${destCoords[0]},${destCoords[1]}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5 text-cyan-600" />
                <span>Waze GPS</span>
              </a>
            </div>
          </div>

          {/* Recruiter Contact & "On My Way" Status Alert */}
          <div className="bg-gradient-to-r from-sky-50 via-sky-100/30 to-white p-3.5 sm:p-4 rounded-2xl border border-sky-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="text-[10px] text-sky-700 font-bold uppercase tracking-wider">{t.postedByRecruiter}</div>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>{recruiterName}</span>
                </div>
                <div className="text-xs text-slate-500">{recruiterPhone}</div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => window.open(`tel:${recruiterPhone}`, '_self')}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t.callRecruiterBtn}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-sky-200/60 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSendOnMyWay}
                className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                  onMyWaySent 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{onMyWaySent ? '✓ ETA Sent via WhatsApp' : `WhatsApp: ${t.onMyWayBtn}`}</span>
              </button>

              <button
                type="button"
                onClick={handleSendOnMyWaySms}
                className="py-2 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-1 transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Offline SMS ETA</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {t.close}
          </button>

          <a
            href={googleMapsNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-sky-500 hover:bg-sky-600 text-white flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open Navigation</span>
          </a>
        </div>

      </div>
    </div>
  );
};
