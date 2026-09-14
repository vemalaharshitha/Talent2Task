import React from 'react';
import { 
  Radio, 
  MapPin, 
  SlidersHorizontal,
  Navigation,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { User } from '../../types';
import { getClosestLandmark, TAMIL_NADU_CITIES } from '../../services/geoService';
import { localizeContent } from '../../i18n/translations';

interface RadiusFilterProps {
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  currentUser: User | null;
  onOpenProfile: () => void;
  matchedCount: number;
  onCitySelect?: (cityName: string) => void;
  onLiveGpsClick?: () => void;
  isLocating?: boolean;
}

const PRESET_DISTANCES = [1, 2, 3, 5, 10];

export const RadiusFilter: React.FC<RadiusFilterProps> = ({
  radiusKm,
  onRadiusChange,
  currentUser,
  onOpenProfile,
  matchedCount,
  onCitySelect,
  onLiveGpsClick,
  isLocating = false
}) => {
  const { t, language } = useLanguage();

  const currentLandmark = currentUser
    ? getClosestLandmark(currentUser.latitude, currentUser.longitude)
    : 'Chennai, Tamil Nadu';

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-6 border border-slate-200 relative overflow-hidden shadow-sm bg-white">
      
      {/* Background visual */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-sky-100/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: GPS Indicator & Radar Title */}
        <div className="flex items-start sm:items-center gap-3">
          
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 shrink-0">
            <Radio className="w-6 h-6 animate-pulse text-sky-600" />
            <div className="absolute inset-0 rounded-2xl border border-sky-300 animate-radar-ping pointer-events-none"></div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                {t.radarHeading}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200">
                {matchedCount} {t.gigsFound}
              </span>
            </div>

            {/* Current user location pill & City selector */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span className="font-semibold text-slate-900">{localizeContent(currentLandmark, language)}</span>
              </div>

              {onCitySelect && (
                <div className="relative inline-flex items-center">
                  <select
                    value={currentUser?.city || 'Chennai'}
                    onChange={(e) => onCitySelect(e.target.value)}
                    className="appearance-none bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-800 text-[11px] font-bold py-1 pl-2.5 pr-6 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
                  >
                    {TAMIL_NADU_CITIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {localizeContent(c.name, language)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 pointer-events-none" />
                </div>
              )}

              {onLiveGpsClick && (
                <button
                  type="button"
                  onClick={onLiveGpsClick}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors shadow-xs"
                >
                  <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? t.locating : t.useCurrentGps}</span>
                </button>
              )}

              <button
                onClick={onOpenProfile}
                className="text-sky-600 hover:text-sky-700 font-semibold underline underline-offset-2"
              >
                {t.changeLocation}
              </button>
            </div>
          </div>

        </div>

        {/* Right: Distance presets & custom slider */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          
          {/* Distance buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto overflow-x-auto max-w-full">
            {PRESET_DISTANCES.map((dist) => {
              const isSelected = radiusKm === dist;
              const isRecommended = dist === 3;

              return (
                <button
                  key={dist}
                  onClick={() => onRadiusChange(dist)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                    isSelected
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{dist} km</span>
                  {isRecommended && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                  )}
                </button>
              );
            })}

            {/* All Tamil Nadu option */}
            <button
              onClick={() => onRadiusChange(500)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                radiusKm >= 25
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {t.allVellore}
            </button>
          </div>

          {/* Slider */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="range"
              min="0.5"
              max="25"
              step="0.5"
              value={radiusKm > 25 ? 25 : radiusKm}
              onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
              className="w-20 sm:w-24 accent-sky-500 cursor-pointer"
            />
            <span className="font-extrabold text-sky-600 min-w-[40px] text-right">
              {radiusKm >= 25 ? 'Statewide' : `${radiusKm} km`}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
