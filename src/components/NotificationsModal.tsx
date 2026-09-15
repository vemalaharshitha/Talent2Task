import React from 'react';
import { Bell, Check, CheckCheck, Clock, ExternalLink, Sparkles, Star, X, Phone, MessageSquare, CreditCard } from 'lucide-react';
import type { NotificationItem, Language } from '../types';
import { localizeContent } from '../i18n/translations';
import { useLanguage } from '../i18n/LanguageContext';
import { triggerOfflineSms } from '../utils/smsHelper';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  language: Language;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectJob?: (jobId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  language,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectJob
}) => {
  const { t } = useLanguage();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Extract phone number from text if present
  const extractPhone = (text: string): string | null => {
    const match = text.match(/(\+91\s?\d{5}\s?\d{5}|\d{10})/);
    return match ? match[0] : null;
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="glass-panel w-full max-w-lg max-h-[85vh] rounded-3xl border border-slate-200 shadow-2xl bg-white overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg font-bold text-slate-900">
                  {t.notificationsTitle}
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200">
                    {unreadCount} {t.all}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {t.notificationsSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="p-2 rounded-xl text-xs font-semibold text-sky-600 hover:bg-sky-50 transition-colors flex items-center gap-1"
                title={t.markAllRead}
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">{t.markAllRead}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notif) => {
              const isJobAlert = notif.type === 'job_alert';
              const isRating = notif.type === 'rating';
              const isClaim = notif.type === 'claim';
              const isPayment = notif.type === 'payment';
              const phoneMatch = extractPhone(notif.message);

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.is_read) onMarkAsRead(notif.id);
                    if (notif.linkJobId && onSelectJob) {
                      onSelectJob(notif.linkJobId);
                      onClose();
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    notif.is_read
                      ? 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                      : isPayment
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-xs hover:border-emerald-400'
                      : 'bg-sky-50/70 border-sky-200 shadow-xs hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isPayment
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : isJobAlert
                          ? 'bg-sky-500 text-white'
                          : isRating
                          ? 'bg-amber-500 text-white'
                          : isClaim
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {isPayment ? <CreditCard className="w-4 h-4" /> : isJobAlert ? <Sparkles className="w-4 h-4" /> : isRating ? <Star className="w-4 h-4 fill-current" /> : isClaim ? <Phone className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 leading-tight">
                            {localizeContent(notif.title, language)}
                          </h4>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                          {localizeContent(notif.message, language)}
                        </p>

                        {/* Direct Action Buttons for Call, WhatsApp & Offline SMS */}
                        {phoneMatch && (
                          <div className="flex flex-wrap items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                            <a
                              href={`tel:${phoneMatch}`}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1 shadow-xs"
                            >
                              <Phone className="w-3 h-3 text-sky-600" />
                              <span>Call {phoneMatch}</span>
                            </a>
                            <a
                              href={`https://wa.me/${phoneMatch.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello, regarding your gig on Talent2Task!')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1 shadow-xs"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                triggerOfflineSms(phoneMatch, 'Hi, contacting you regarding the gig on Talent2Task.');
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 shadow-xs active:scale-95"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Offline SMS</span>
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium pt-1">
                          <Clock className="w-3 h-3" />
                          <span>{notif.created_at}</span>
                          {notif.linkJobId && (
                            <span className="text-sky-600 font-bold flex items-center gap-0.5 ml-2">
                              <span>{t.jobDetailsTitle}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!notif.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notif.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-white transition-colors"
                        title={t.markAllRead}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2 text-slate-400">
              <Bell className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">{t.noNotifications}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
