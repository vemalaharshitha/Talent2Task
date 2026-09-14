import React, { useState, useRef, useEffect } from 'react';
import { 
  Briefcase, 
  UserCircle, 
  Radio, 
  Bell,
  BarChart3,
  Languages,
  ChevronDown,
  LogOut,
  UserCheck,
  Wifi,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  Mic,
  Receipt
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { localizeContent } from '../i18n/translations';
import type { User, Language } from '../types';
import logoImg from '../assets/logo.png';

export type MainNavTab = 'explore' | 'my-gigs' | 'post-manage';

interface NavbarProps {
  currentUser: User | null;
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  unreadNotifsCount?: number;
  isOnline: boolean;
  onToggleOnline: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenCommunityDemand: () => void;
  onOpenPaymentHistory?: () => void;
  onLogout: () => void;
}

const LANGUAGE_OPTIONS: { code: Language; label: string; nativeName: string }[] = [
  { code: 'en', label: 'EN', nativeName: 'English' },
  { code: 'ta', label: 'தமிழ்', nativeName: 'தமிழ் (Tamil)' },
  { code: 'hi', label: 'हिन्दी', nativeName: 'हिन्दी (Hindi)' },
  { code: 'te', label: 'తెలుగు', nativeName: 'తెలుగు (Telugu)' }
];

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  unreadNotifsCount = 0,
  isOnline,
  onToggleOnline,
  onOpenProfile,
  onOpenNotifications,
  onOpenCommunityDemand,
  onOpenPaymentHistory,
  onLogout
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isRecruiter = currentUser?.role === 'recruiter';
  const isSeeker = currentUser?.role === 'seeker' || !currentUser;

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = LANGUAGE_OPTIONS.find(l => l.code === language) || LANGUAGE_OPTIONS[0];

  const handleSelectNavTab = (tab: MainNavTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-400 to-sky-200 shadow-md shadow-sky-500/15 p-[2px] transition-transform hover:scale-105">
              <div className="w-full h-full bg-white rounded-[14px] overflow-hidden flex items-center justify-center p-0.5">
                <img 
                  src={logoImg} 
                  alt="Talent2Task Logo" 
                  className="w-full h-full object-contain" 
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-heading text-lg sm:text-2xl font-black tracking-tight text-slate-900 flex items-center">
                  <span>Talent</span>
                  <span className="text-sky-500 font-extrabold mx-0.5">2</span>
                  <span>Task</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden md:flex items-center gap-1.5 font-medium">
                <span className="text-sky-600 font-bold tracking-wider uppercase text-[10px]">{t.footerTagline}</span>
              </p>
            </div>
          </div>

          {/* Center: Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            {isSeeker && (
              <>
                <button
                  onClick={() => handleSelectNavTab('explore')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'explore'
                      ? 'bg-white text-sky-600 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Radio className={`w-4 h-4 ${activeTab === 'explore' ? 'text-sky-500 animate-pulse' : 'text-slate-400'}`} />
                  <span>{t.exploreGigsTab}</span>
                </button>

                <button
                  onClick={() => handleSelectNavTab('my-gigs')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'my-gigs'
                      ? 'bg-white text-sky-600 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 ${activeTab === 'my-gigs' ? 'text-sky-500' : 'text-slate-400'}`} />
                  <span>{t.myGigsTab}</span>
                </button>
              </>
            )}

            {isRecruiter && (
              <button
                onClick={() => handleSelectNavTab('post-manage')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'post-manage'
                    ? 'bg-white text-sky-600 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Briefcase className={`w-4 h-4 ${activeTab === 'post-manage' ? 'text-sky-500' : 'text-slate-400'}`} />
                <span>{t.manageGigsTab}</span>
              </button>
            )}
          </nav>

          {/* Right: Actions & Mobile Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Selector Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Change Language"
              >
                <Languages className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-slate-900 font-extrabold">{currentLangObj.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn space-y-1">
                  <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    <span>Select Language</span>
                    <span className="flex items-center gap-0.5 text-sky-600 font-extrabold text-[9px] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI Voice
                    </span>
                  </div>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setLanguage(opt.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
                        language === opt.code
                          ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{opt.nativeName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-slate-400 font-mono">
                          {opt.code === 'en' ? 'en-IN' : opt.code === 'ta' ? 'ta-IN' : opt.code === 'hi' ? 'hi-IN' : 'te-IN'}
                        </span>
                        {language === opt.code && (
                          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        )}
                      </div>
                    </button>
                  ))}
                  <div className="pt-1.5 border-t border-slate-100 px-2 py-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Mic className="w-3 h-3 text-sky-500 shrink-0" />
                    <span>STT & NLP auto-adapts to language</span>
                  </div>
                </div>
              )}
            </div>

            {/* Network Online / Offline Interactive Toggle Switch (Desktop) */}
            <button 
              type="button"
              onClick={onToggleOnline}
              className={`hidden md:flex px-3 py-1.5 rounded-xl text-[11px] font-extrabold border items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                isOnline 
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-amber-500/20'
              }`}
              title={isOnline ? "Online Mode (Click to switch to Offline SMS Mode)" : "Offline SMS Mode Active"}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-white'}`} />
              <Wifi className="w-3.5 h-3.5" />
              <span>{isOnline ? 'Online' : 'Offline SMS'}</span>
            </button>

            {/* Community Skill Trends Analytics Trigger (Desktop) */}
            <button
              type="button"
              onClick={onOpenCommunityDemand}
              className="hidden md:flex p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all items-center gap-1 cursor-pointer"
              title={t.demandModalTitle}
            >
              <BarChart3 className="w-4 h-4 text-sky-600" />
              <span className="hidden xl:inline">{t.trends}</span>
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
              title={t.notificationsTitle}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* User Profile & Account Dropdown Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all shadow-xs cursor-pointer"
              >
                <UserCircle className="w-4 h-4 text-sky-500" />
                <span className="hidden md:inline font-bold">{currentUser?.name?.split(' ')[0] || t.profileBtn}</span>
                <ChevronDown className="w-3 h-3 text-sky-500" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name || 'User'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser?.phone}</p>
                    <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                      {currentUser?.role === 'recruiter' 
                        ? `${t.roleRecruiter || 'Recruiter'} • ${localizeContent(currentUser?.city || 'Tamil Nadu', language)}`
                        : `${localizeContent(currentUser?.city || 'Tamil Nadu', language)} • ${currentUser?.experience ?? 0} ${t.detectedExperience || 'yrs exp'}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-sky-500" />
                    <span>View / Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (onOpenPaymentHistory) onOpenPaymentHistory();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Payment History</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left mt-1 border-t border-slate-100 pt-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Clean Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all cursor-pointer flex items-center justify-center"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer / Slide-Down Panel */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-2 animate-fadeIn">
            {/* Nav Tabs */}
            <div className={`grid ${isRecruiter ? 'grid-cols-1' : 'grid-cols-2'} gap-1.5 bg-slate-100 p-1 rounded-xl`}>
              {isSeeker && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSelectNavTab('explore')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold text-center transition-all flex flex-col items-center gap-1 ${
                      activeTab === 'explore'
                        ? 'bg-white text-sky-600 shadow-sm font-extrabold'
                        : 'text-slate-600'
                    }`}
                  >
                    <Radio className="w-4 h-4 text-sky-500" />
                    <span>{t.exploreGigsTab}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectNavTab('my-gigs')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold text-center transition-all flex flex-col items-center gap-1 ${
                      activeTab === 'my-gigs'
                        ? 'bg-white text-sky-600 shadow-sm font-extrabold'
                        : 'text-slate-600'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-sky-500" />
                    <span>{t.myGigsTab}</span>
                  </button>
                </>
              )}

              {isRecruiter && (
                <button
                  type="button"
                  onClick={() => handleSelectNavTab('post-manage')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold text-center transition-all flex flex-col items-center gap-1 ${
                    activeTab === 'post-manage'
                      ? 'bg-white text-sky-600 shadow-sm font-extrabold'
                      : 'text-slate-600'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-sky-500" />
                  <span>{t.manageGigsTab}</span>
                </button>
              )}
            </div>

            {/* Action buttons inside mobile drawer */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between gap-2">
                <button 
                  type="button"
                  onClick={onToggleOnline}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    isOnline 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-500 text-white border-amber-600'
                  }`}
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>{isOnline ? 'Online Mode' : 'Offline SMS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenCommunityDemand();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t.trends}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
