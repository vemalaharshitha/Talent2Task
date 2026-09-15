/**
 * Utility to trigger cross-platform Offline SMS links and copy text fallback for Desktop & Low-end mobile devices.
 */
export const triggerOfflineSms = (phone: string, message: string, onNotify?: (msg: string) => void) => {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const encodedBody = encodeURIComponent(message);
  
  // iOS devices use '&body=' while Android & Windows use '?body='
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const smsUrl = isIOS 
    ? `sms:${cleanPhone}&body=${encodedBody}` 
    : `sms:${cleanPhone}?body=${encodedBody}`;

  // 1. Copy formatted message and phone number to Clipboard for Desktop / Web fallback
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(`To: ${cleanPhone}\nMessage: ${message}`).catch(() => {});
  }

  // 2. Open native messaging application via sms: URI scheme
  window.location.href = smsUrl;

  // 3. Show helpful user notification toast
  if (onNotify) {
    onNotify(`📱 Offline SMS triggered for ${cleanPhone}! Text copied to clipboard.`);
  }
};
