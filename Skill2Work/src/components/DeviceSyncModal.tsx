import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Smartphone, 
  Laptop, 
  Tablet, 
  Wifi, 
  Copy, 
  Check, 
  X, 
  Radio, 
  Activity, 
  RefreshCw,
  QrCode,
  ShieldCheck,
  Send
} from 'lucide-react';
import { syncService, type ConnectionStatus } from '../services/syncService';
import { sqliteManager } from '../db/sqliteManager';
import { VELLORE_LOCATIONS } from '../services/geoService';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostSampleGig?: () => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  isOpen,
  onClose
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [status, setStatus] = useState<ConnectionStatus>(syncService.getConnectionStatus());
  const [deviceCount, setDeviceCount] = useState<number>(syncService.getConnectedDevicesCount());
  const [copied, setCopied] = useState(false);
  const [testLog, setTestLog] = useState<Array<{ id: string; time: string; text: string; type: 'in' | 'out' | 'info' }>>([]);
  const deviceType = syncService.getDeviceType();
  const deviceId = syncService.getDeviceId();

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (!isOpen) return;

    // Generate QR Code for easy smartphone camera connection
    QRCode.toDataURL(currentUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.warn('QR code generation failed:', err));

    // Subscribe to connection status
    const unsubStatus = syncService.subscribeStatus((newStatus, count) => {
      setStatus(newStatus);
      setDeviceCount(count);
    });

    // Subscribe to sync events for live audit log
    const unsubEvents = syncService.subscribe((msg) => {
      const now = new Date().toLocaleTimeString();
      let text = '';
      if (msg.type === 'JOB_CREATED') {
        text = `📢 New Gig Broadcast: "${msg.data?.title || 'Gig'}" in ${msg.data?.landmark_area || 'Vellore'}`;
      } else if (msg.type === 'JOB_CLAIMED') {
        text = `🤝 Gig Claimed: "${msg.data?.jobId}" by ${msg.data?.seekerName || 'Seeker'}`;
      } else if (msg.type === 'JOB_STATUS_UPDATED') {
        text = `🔄 Status Changed: "${msg.data?.jobId}" -> ${msg.data?.status}`;
      } else if (msg.type === 'USER_UPSERTED') {
        text = `👤 User Profile Synced: ${msg.data?.name || 'User'}`;
      } else if (msg.type === 'INITIAL_SYNC_RESPONSE') {
        text = `📥 Master Database Initialized (${msg.data?.jobs?.length || 0} gigs loaded)`;
      }

      if (text) {
        setTestLog(prev => [{ id: Math.random().toString(), time: now, text, type: 'in' }, ...prev.slice(0, 15)]);
      }
    });

    return () => {
      unsubStatus();
      unsubEvents();
    };
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateGigPost = () => {
    const randomLocation = VELLORE_LOCATIONS[Math.floor(Math.random() * VELLORE_LOCATIONS.length)];
    const titles = [
      'Store Assistant & Inventory Helper',
      'Urgent Delivery Rider (Evening Shift)',
      'Cafe Counter & Beverage Helper',
      'Hospital Front Desk & Attendant',
      'Event Catering & Setup Helper'
    ];
    const chosenTitle = titles[Math.floor(Math.random() * titles.length)];

    sqliteManager.createJob({
      recruiter_id: 'usr_recruiter_demo',
      title: `⚡ ${chosenTitle}`,
      description: 'Urgent shift helper required for immediate work in Vellore. On-the-spot verification and payout.',
      category: 'Delivery / Helper',
      required_skills: ['Tamil Speaking', 'Physically Active'],
      payout_amount: Math.floor(Math.random() * 80) + 160,
      payout_unit: 'hour',
      latitude: randomLocation.lat,
      longitude: randomLocation.lng,
      landmark_area: randomLocation.area || randomLocation.name,
      status: 'OPEN',
      claimed_by: null
    });

    const now = new Date().toLocaleTimeString();
    setTestLog(prev => [
      {
        id: Math.random().toString(),
        time: now,
        text: `🚀 [This Device] Broadcasted Gig: "${chosenTitle}" in ${randomLocation.name}`,
        type: 'out'
      },
      ...prev.slice(0, 15)
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-sm">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-lg flex items-center gap-2">
                Multi-Device Real-Time Sync Hub
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Simultaneous synchronization across Mobile Phones, Laptops & Tablets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Connection Status */}
            <div className="bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-2xl flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${status === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sync Status</p>
                <p className="text-sm font-black text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  {status === 'connected' ? 'Live WebSocket' : 'Peer / Tab Sync'}
                </p>
              </div>
            </div>

            {/* Current Device */}
            <div className="bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="bg-indigo-500/20 text-indigo-400 p-2.5 rounded-xl">
                {deviceType === 'Mobile Phone' ? <Smartphone className="w-5 h-5" /> : deviceType === 'Tablet' ? <Tablet className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">This Device</p>
                <p className="text-sm font-black text-white">{deviceType}</p>
              </div>
            </div>

            {/* Connected Count */}
            <div className="bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Devices</p>
                <p className="text-sm font-black text-emerald-400">{deviceCount} Online</p>
              </div>
            </div>
          </div>

          {/* QR Code & Mobile Connection Instructions */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-800/40 border border-slate-700/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6">
            {qrDataUrl ? (
              <div className="bg-white p-3 rounded-2xl shadow-xl shrink-0 flex flex-col items-center">
                <img src={qrDataUrl} alt="Connect Mobile Device QR Code" className="w-36 h-36 rounded-lg" />
                <span className="text-[10px] font-bold text-slate-700 mt-1 flex items-center gap-1">
                  <QrCode className="w-3 h-3" /> Scan with Mobile Camera
                </span>
              </div>
            ) : (
              <div className="w-36 h-36 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            )}

            <div className="space-y-2.5 text-left w-full">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Instant Multi-Device Testing:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. Point your <strong>Mobile Phone Camera</strong> at this QR code to open Talent2Task on your smartphone.<br />
                2. On your <strong>Laptop</strong>, post a new gig as a Recruiter.<br />
                3. Watch your <strong>Mobile Phone</strong> instantly play the audio radar chime, pop up the live alert, and show the gig simultaneously!
              </p>

              {/* URL bar */}
              <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700/80 rounded-xl p-2 mt-2">
                <span className="text-xs text-slate-400 truncate flex-1 font-mono">{currentUrl}</span>
                <button
                  onClick={handleCopy}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulate Action & Live Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Live Real-Time Sync Event Log
              </h4>
              <button
                onClick={handleSimulateGigPost}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition transform active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Live Gig Broadcast</span>
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 max-h-44 overflow-y-auto space-y-2 font-mono text-xs">
              {testLog.length === 0 ? (
                <div className="text-slate-500 text-center py-4 italic">
                  Waiting for live events... Post a gig or click "Test Live Gig Broadcast" above.
                </div>
              ) : (
                testLog.map(item => (
                  <div
                    key={item.id}
                    className={`p-2 rounded-xl text-[11px] flex items-start gap-2 ${
                      item.type === 'out'
                        ? 'bg-emerald-950/50 border border-emerald-800/40 text-emerald-300'
                        : 'bg-indigo-950/50 border border-indigo-800/40 text-indigo-300'
                    }`}
                  >
                    <span className="text-slate-500 text-[10px] shrink-0">{item.time}</span>
                    <span className="break-all">{item.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono truncate">
            ID: {deviceId.substring(0, 14)}...
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
