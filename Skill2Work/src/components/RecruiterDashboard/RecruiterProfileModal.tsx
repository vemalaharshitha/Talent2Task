import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Navigation, 
  Save,
  Briefcase,
  Phone,
  UserCheck,
  Compass,
  Home,
  Signpost
} from 'lucide-react';
import type { User, TamilNaduLocation } from '../../types';
import { localizeContent } from '../../i18n/translations';
import { 
  TAMIL_NADU_CITIES, 
  getLocationsByCity, 
  getClosestLandmark, 
  requestBrowserLocation 
} from '../../services/geoService';
import { useLanguage } from '../../i18n/LanguageContext';
import { SearchableSelect } from '../common/SearchableSelect';

const RECRUITER_INDUSTRIES = [
  'Retail & Supermarket',
  'Logistics & Courier Delivery',
  'Hospitality, Restaurant & Catering',
  'Automobile & Manufacturing',
  'Garments, Textile & Weaving',
  'Construction & Electrical Works',
  'Healthcare & Medical Clinic',
  'IT, BPO & Data Operations',
  'Education & Training Institute',
  'Agriculture & Poultry Trading'
];

interface RecruiterProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export const RecruiterProfileModal: React.FC<RecruiterProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave
}) => {
  const { t, language } = useLanguage();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [industry, setIndustry] = useState(() => {
    return (user.skills && user.skills[0]) || RECRUITER_INDUSTRIES[0];
  });
  
  // Structured Recruiter Location Fields
  const [doorNo, setDoorNo] = useState<string>(user.door_no || '');
  const [streetName, setStreetName] = useState<string>(user.street_name || '');
  const [landmark, setLandmark] = useState<string>(user.landmark || '');
  const [city, setCity] = useState<string>(user.city || user.district || 'Chennai');
  const [address, setAddress] = useState<string>(user.address || '');
  const [latitude, setLatitude] = useState(user.latitude || 13.0418);
  const [longitude, setLongitude] = useState(user.longitude || 80.2341);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsFeedback, setGpsFeedback] = useState<string | null>(null);

  // Sync state when user prop changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setIndustry((user.skills && user.skills[0]) || RECRUITER_INDUSTRIES[0]);
      setDoorNo(user.door_no || '');
      setStreetName(user.street_name || '');
      setLandmark(user.landmark || '');
      setCity(user.city || user.district || 'Chennai');
      setAddress(user.address || '');
      setLatitude(user.latitude || 13.0418);
      setLongitude(user.longitude || 80.2341);
    }
  }, [user]);

  if (!isOpen) return null;

  // Helper to compose full address from structured fields
  const buildComposedAddress = (dNo: string, sName: string, lMark: string, cName: string) => {
    const parts = [
      dNo.trim(),
      sName.trim(),
      lMark.trim(),
      cName.trim() ? `${cName.trim()}, Tamil Nadu` : 'Tamil Nadu'
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const cityObj = TAMIL_NADU_CITIES.find(c => c.name === newCity);
    if (cityObj) {
      setLatitude(cityObj.lat);
      setLongitude(cityObj.lng);
    }
    const locs = getLocationsByCity(newCity);
    const primaryLandmark = locs.length > 0 ? locs[0].name : '';
    if (primaryLandmark) {
      setLatitude(locs[0].lat);
      setLongitude(locs[0].lng);
      setLandmark(primaryLandmark);
    }
    setAddress(buildComposedAddress(doorNo, streetName, primaryLandmark || landmark, newCity));
  };

  const setLocationByLandmark = (loc: TamilNaduLocation) => {
    setLatitude(loc.lat);
    setLongitude(loc.lng);
    setCity(loc.city);
    setLandmark(loc.name);
    setAddress(buildComposedAddress(doorNo, streetName, loc.name, loc.city));
  };

  const handleDoorNoChange = (val: string) => {
    setDoorNo(val);
    setAddress(buildComposedAddress(val, streetName, landmark, city));
  };

  const handleStreetNameChange = (val: string) => {
    setStreetName(val);
    setAddress(buildComposedAddress(doorNo, val, landmark, city));
  };

  const handleLandmarkChange = (val: string) => {
    setLandmark(val);
    setAddress(buildComposedAddress(doorNo, streetName, val, city));
  };

  const fetchLiveGPS = async () => {
    setIsLocating(true);
    setGpsFeedback(null);
    try {
      const loc = await requestBrowserLocation();
      setLatitude(loc.latitude);
      setLongitude(loc.longitude);
      const detectedCity = loc.city || city;
      if (loc.city) {
        setCity(loc.city);
      }
      const nearestLandmark = getClosestLandmark(loc.latitude, loc.longitude);
      if (nearestLandmark) {
        setLandmark(nearestLandmark);
      }
      const updatedAddr = buildComposedAddress(doorNo, streetName, nearestLandmark || landmark, detectedCity);
      setAddress(updatedAddr);
      setGpsFeedback(`GPS: ${loc.latitude.toFixed(4)}° N, ${loc.longitude.toFixed(4)}° E (±${loc.accuracy || 10}m)`);
    } catch (e: any) {
      alert(e.message || 'Could not fetch live GPS. Please select your district manually.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLandmark = landmark.trim() || getClosestLandmark(latitude, longitude);
    const finalAddress = address.trim() || buildComposedAddress(doorNo, streetName, finalLandmark, city);

    onSave({
      ...user,
      name: name.trim(),
      phone: phone.trim(),
      door_no: doorNo.trim(),
      street_name: streetName.trim(),
      landmark: finalLandmark,
      city: city.trim(),
      district: city.trim(),
      address: finalAddress,
      latitude,
      longitude,
      skills: [industry, 'Recruiter', 'Business Hiring']
    });
    onClose();
  };

  const cityLandmarks = getLocationsByCity(city);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl animate-scaleUp p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {t.recruiterLocationTitle || 'Job Recruiter Profile'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                  Hiring Account
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t.recruiterLocationSubtitle || 'Manage door no, street name, landmark, and district for accurate navigation'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Full Name & Phone in 2-column on sm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Full Name / Representative *</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar / Chennai Retail"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-600" />
                <span>{t.phoneNumber} *</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Primary Hiring Industry */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Primary Hiring Industry / Business Sector *</span>
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer"
            >
              {RECRUITER_INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* RECRUITER WORKPLACE LOCATION CARD (Door No, Street Name, Landmark, City/District) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50/70 via-slate-50/70 to-blue-50/50 border border-sky-200/80 shadow-xs space-y-3.5">
            
            <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {t.recruiterLocationTitle || 'Workplace & Business Location'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Tamil Nadu District & Precise Physical Address
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchLiveGPS}
                disabled={isLocating}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-sky-500 hover:bg-sky-600 active:scale-95 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? t.locating : t.useCurrentGps}</span>
              </button>
            </div>

            {gpsFeedback && (
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{gpsFeedback}</span>
              </div>
            )}

            {/* 1. City or District (Searchable Dropdown) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Signpost className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t.cityOrDistrictLabel || 'City or District'} *</span>
                </span>
                <span className="text-[10px] text-sky-700 font-medium bg-sky-100/80 px-1.5 py-0.5 rounded">
                  Tamil Nadu
                </span>
              </label>
              <SearchableSelect
                value={city}
                onChange={handleCityChange}
                placeholder={t.selectCity || 'Search district / city in Tamil Nadu...'}
                searchPlaceholder="Type district name (e.g. Chennai, Vellore, Coimbatore)..."
                options={TAMIL_NADU_CITIES.map((c) => ({
                  value: c.name,
                  label: localizeContent(c.name, language),
                  sublabel: c.district !== c.name ? `${localizeContent(c.district, language)} District` : 'District Hub',
                  badge: c.isPopular ? 'Popular' : undefined
                }))}
              />
            </div>

            {/* 2. Door No & Street Name (2 Column Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Door No / Building No / Shop No */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t.doorNoLabel || 'Door / Flat / Shop No.'} *</span>
                </label>
                <input
                  type="text"
                  required
                  value={doorNo}
                  onChange={(e) => handleDoorNoChange(e.target.value)}
                  placeholder={t.doorNoPlaceholder || 'e.g. Door No. 14/B, 2nd Floor, Apex Complex'}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Street Name / Road / Area */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Signpost className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t.streetNameLabel || 'Street Name / Road / Area'} *</span>
                </label>
                <input
                  type="text"
                  required
                  value={streetName}
                  onChange={(e) => handleStreetNameChange(e.target.value)}
                  placeholder={t.streetNamePlaceholder || 'e.g. Anna Salai, Gandhi Street, Mount Road'}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* 3. Landmark: Direct Text + Quick Pickers */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t.landmarkFieldLabel || 'Landmark (Closest Hub)'} *</span>
                </span>
                <span className="text-[10px] text-sky-600 font-semibold bg-sky-100/60 px-2 py-0.5 rounded-md">
                  {cityLandmarks.length} hubs in {localizeContent(city, language)}
                </span>
              </label>

              <input
                type="text"
                required
                value={landmark}
                onChange={(e) => handleLandmarkChange(e.target.value)}
                placeholder={t.landmarkFieldPlaceholder || 'e.g. Near Old Bus Stand / Opp. HDFC Bank'}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 mb-1.5"
              />

              {/* Quick Select Buttons from Local District Landmarks */}
              {cityLandmarks.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium">Or pick landmark preset:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-1 bg-white/70 rounded-xl border border-slate-200/80">
                    {cityLandmarks.map((loc) => {
                      const isSelected = landmark === loc.name || (Math.abs(loc.lat - latitude) < 0.001 && Math.abs(loc.lng - longitude) < 0.001);
                      return (
                        <button
                          type="button"
                          key={loc.id}
                          onClick={() => setLocationByLandmark(loc)}
                          className={`p-2 rounded-lg text-[11px] text-left transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold shadow-xs'
                              : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="truncate font-semibold">{localizeContent(loc.name, language)}</div>
                          <div className="text-[10px] text-slate-400 truncate">{localizeContent(loc.area || loc.district, language)}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Complete Formatted Workplace Address (Generated & Editable) */}
            <div className="space-y-1 pt-1 border-t border-sky-100">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>{t.workplaceAddressLabel || 'Complete Workplace Address (For Turn-by-Turn Navigation)'}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
                </span>
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Door No, Street Name, Landmark, City/District, Tamil Nadu"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none"
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                💡 {t.workplaceAddressHint || 'Candidates who claim your gigs will receive accurate turn-by-turn navigation directly to this workplace address.'}
              </p>
            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-sky-500 via-sky-400 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveProfileBtn || 'Save Recruiter Profile'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
