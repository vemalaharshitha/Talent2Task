import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Job, User, VelloreLocation } from '../../types';
import { formatDistance, TAMIL_NADU_DEFAULT_CENTER } from '../../services/geoService';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizeContent } from '../../i18n/translations';
import { 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Navigation
} from 'lucide-react';

// Custom Map click handler component
interface MapClickHandlerProps {
  onLocationSelect?: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
};

// Component to dynamically re-center map when seeker moves
interface RecenterMapProps {
  center: [number, number];
  zoom?: number;
}
const RecenterMap: React.FC<RecenterMapProps> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, map, zoom]);
  return null;
};

interface VelloreMapViewProps {
  user: User | null;
  jobs: Job[];
  radiusKm: number;
  selectedJobId?: string | null;
  onSelectJob?: (job: Job) => void;
  onClaimJob?: (jobId: string) => void;
  onGetDirections?: (job: Job) => void;
  selectableLocation?: boolean;
  selectedCoordinates?: { lat: number; lng: number } | null;
  onSelectCoordinates?: (lat: number, lng: number) => void;
  quickLocations?: VelloreLocation[];
}

export const VelloreMapView: React.FC<VelloreMapViewProps> = ({
  user,
  jobs,
  radiusKm,
  selectedJobId,
  onSelectJob,
  onClaimJob,
  onGetDirections,
  selectableLocation = false,
  selectedCoordinates,
  onSelectCoordinates,
  quickLocations = []
}) => {
  const { t, language } = useLanguage();

  const centerPos: [number, number] = useMemo(() => {
    if (selectedCoordinates) {
      return [selectedCoordinates.lat, selectedCoordinates.lng];
    }
    if (user && user.latitude && user.longitude) {
      return [user.latitude, user.longitude];
    }
    return [TAMIL_NADU_DEFAULT_CENTER.lat, TAMIL_NADU_DEFAULT_CENTER.lng];
  }, [user, selectedCoordinates]);

  // Create custom Seeker Beacon HTML Icon
  const seekerIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-seeker-icon',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full bg-sky-400/40 animate-ping"></div>
          <div class="relative flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 border-2 border-white shadow-lg text-white font-bold text-xs">
            📍
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  }, []);

  // Function to create Job HTML Icon
  const getJobIcon = (job: Job, isSelected: boolean) => {
    const isClaimedByMe = user && job.claimed_by === user.id;
    const isClaimed = job.status === 'CLAIMED';
    const isCompleted = job.status === 'COMPLETED';

    let bgBg = 'bg-sky-500';
    let bgBorder = 'border-white';
    let extra = '';

    if (isCompleted) {
      bgBg = 'bg-slate-700';
      bgBorder = 'border-slate-500';
    } else if (isClaimedByMe) {
      bgBg = 'bg-sky-600';
      bgBorder = 'border-white';
      extra = 'ring-4 ring-sky-400/40';
    } else if (isClaimed) {
      bgBg = 'bg-slate-500';
      bgBorder = 'border-slate-300';
    } else if (job.matchScore && job.matchScore >= 80) {
      bgBg = 'bg-sky-500';
      bgBorder = 'border-white';
      extra = 'shadow-sky-500/50';
    }

    return L.divIcon({
      className: 'custom-job-icon',
      html: `
        <div class="relative group cursor-pointer transition-transform hover:scale-110 ${isSelected ? 'scale-125 z-50' : ''}">
          <div class="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md border-2 ${bgBg} text-white ${bgBorder} ${extra}">
            <span>₹${job.payout_amount}</span>
            ${job.matchScore ? `<span class="opacity-90 text-[10px]">(${job.matchScore}%)</span>` : ''}
          </div>
          <div class="w-2 h-2 mx-auto rotate-45 -mt-1 ${bgBg} border-r-2 border-b-2 ${bgBorder}"></div>
        </div>
      `,
      iconSize: [64, 32],
      iconAnchor: [32, 32]
    });
  };

  // Selected Pin icon for Location Picker
  const pinPickerIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-pin-picker',
      html: `
        <div class="flex items-center justify-center w-9 h-9 rounded-full bg-sky-500 text-white border-3 border-white shadow-2xl animate-bounce text-base font-bold">
          📍
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36]
    });
  }, []);

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-50">
      
      {/* Quick Vellore Landmark Jump Chips */}
      {quickLocations.length > 0 && (
        <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1 shrink-0 shadow-sm">
            <MapPin className="w-3 h-3 text-sky-500" />
            <span>{t.regionTag}:</span>
          </div>
          {quickLocations.map(loc => (
            <button
              key={loc.id}
              onClick={() => onSelectCoordinates && onSelectCoordinates(loc.lat, loc.lng)}
              className="bg-white/90 hover:bg-sky-500 hover:text-white backdrop-blur-md text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 shrink-0 transition-all shadow-xs flex items-center gap-1"
            >
              <span>{localizeContent(loc.name.split(' ')[0], language)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Map instructions banner for location picker */}
      {selectableLocation && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-xl border border-sky-300 text-sky-800 text-xs font-semibold text-center shadow-lg">
          👉 {t.clickMapInstruction}
        </div>
      )}

      {/* Offline Radar Mode Banner */}
      {typeof navigator !== 'undefined' && !navigator.onLine && (
        <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-lg select-none pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Offline Radar Mode (Local Pins & Radius Active)</span>
        </div>
      )}

      <MapContainer
        key={selectableLocation ? 'picker-map' : 'radar-map'}
        center={centerPos}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={centerPos} />

        {/* Map Click Handler */}
        {selectableLocation && <MapClickHandler onLocationSelect={onSelectCoordinates} />}

        {/* Seeker GPS Marker & Haversine Radius Circle */}
        {user && user.latitude && user.longitude && (
          <>
            <Marker position={[user.latitude, user.longitude]} icon={seekerIcon}>
              <Popup>
                <div className="p-3 bg-white text-slate-900 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-sky-600 text-sm flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5" />
                    {user.name} ({t.roleSeeker})
                  </div>
                  <div className="text-slate-600">
                    {t.radiusSlider}: <span className="font-bold text-slate-900">{radiusKm} km</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {user.skills.map(s => localizeContent(s, language)).join(', ')}
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* 3 km / Selected Radius Circle */}
            <Circle
              center={[user.latitude, user.longitude]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#0ea5e9',
                fillColor: '#38bdf8',
                fillOpacity: 0.12,
                weight: 2,
                dashArray: '5, 8'
              }}
            />
          </>
        )}

        {/* Custom Location Picker Selected Coordinates Pin */}
        {selectedCoordinates && (
          <Marker position={[selectedCoordinates.lat, selectedCoordinates.lng]} icon={pinPickerIcon}>
            <Popup>
              <div className="p-2 bg-white text-slate-900 rounded text-xs font-semibold">
                📍 {t.gigLocation} ({selectedCoordinates.lat.toFixed(4)}, {selectedCoordinates.lng.toFixed(4)})
              </div>
            </Popup>
          </Marker>
        )}

        {/* Job Markers */}
        {jobs.map((job) => {
          const isSelected = selectedJobId === job.id;
          return (
            <Marker
              key={job.id}
              position={[job.latitude, job.longitude]}
              icon={getJobIcon(job, isSelected)}
              eventHandlers={{
                click: () => onSelectJob && onSelectJob(job)
              }}
            >
              <Popup>
                <div className="p-3 bg-white text-slate-900 rounded-xl max-w-[260px] space-y-2 border border-slate-200">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                      {localizeContent(job.category, language)}
                    </span>
                    {job.matchScore && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-sky-500" />
                        {job.matchScore}% {t.matchScore}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-2">
                    {localizeContent(job.title, language)}
                  </h4>

                  {/* Landmark & Distance */}
                  <div className="text-[11px] text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className="truncate">{localizeContent(job.landmark_area, language)}</span>
                  </div>

                  {job.distanceKm !== undefined && (
                    <div className="text-[11px] text-sky-600 font-semibold flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{formatDistance(job.distanceKm)} {t.withinRadius}</span>
                    </div>
                  )}

                  {/* Pay */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                    <div className="text-sm font-extrabold text-sky-600">
                      ₹{job.payout_amount} <span className="text-[10px] font-normal text-slate-500">/ {localizeContent(job.payout_unit, language)}</span>
                    </div>

                    {job.status === 'OPEN' && onClaimJob && user && (
                      <button
                        onClick={() => onClaimJob(job.id)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t.claimJobBtn}</span>
                      </button>
                    )}

                    {job.status === 'CLAIMED' && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {job.claimed_by === user?.id ? t.claimedBadge : t.claimedOtherBadge}
                        </span>
                        {job.claimed_by === user?.id && onGetDirections && (
                          <button
                            onClick={() => onGetDirections(job)}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500 hover:bg-sky-600 text-white flex items-center gap-1 cursor-pointer"
                            title={t.directionsBtn}
                          >
                            <Navigation className="w-2.5 h-2.5" />
                            <span>{t.directionsBtn}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
