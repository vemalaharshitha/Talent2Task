import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Sparkles, Volume2, ChevronDown } from 'lucide-react';
import { voiceService, SAMPLE_VOICE_PRESETS, type VoiceState, type VoiceError } from '../../services/voiceService';
import type { Language } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface VoiceInputButtonProps {
  onTranscript: (transcript: string, detectedLang?: Language) => void;
  onInterimTranscript?: (transcript: string) => void;
  onListeningStateChange?: (isListening: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSampleMenu?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  onInterimTranscript,
  onListeningStateChange,
  size = 'md',
  className = '',
  showSampleMenu = true
}) => {
  const { language } = useLanguage();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [interimText, setInterimText] = useState<string>('');
  const menuRef = useRef<HTMLDivElement>(null);

  const isListening = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';
  const isPermissionDenied = voiceState === 'permission_denied';
  const isUnsupported = voiceState === 'unsupported';

  // Sync listening state to parent
  useEffect(() => {
    onListeningStateChange?.(isListening);
  }, [isListening, onListeningStateChange]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleVoice = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isListening) {
      voiceService.stopListening();
      setVoiceState('idle');
      return;
    }

    setErrorMessage(null);
    setInterimText('');

    voiceService.startListening({
      language,
      continuous: false,
      interimResults: true,
      onStateChange: (state) => {
        setVoiceState(state);
      },
      onInterimResult: (text) => {
        setInterimText(text);
        onInterimTranscript?.(text);
      },
      onFinalResult: (transcript, detectedLang) => {
        setInterimText('');
        onTranscript(transcript, detectedLang);
      },
      onError: (err: VoiceError) => {
        setErrorMessage(err.message);
        if (err.type === 'permission_denied') {
          setVoiceState('permission_denied');
        } else if (err.type === 'unsupported') {
          setVoiceState('unsupported');
        } else {
          setVoiceState('idle');
        }
      }
    });
  };

  const handleSelectPreset = (presetId: string) => {
    setIsMenuOpen(false);
    setErrorMessage(null);
    setInterimText('');

    voiceService.simulateVoiceInput(presetId, {
      language,
      onStateChange: (state) => {
        setVoiceState(state);
      },
      onInterimResult: (text) => {
        setInterimText(text);
        onInterimTranscript?.(text);
      },
      onFinalResult: (transcript, detectedLang) => {
        setInterimText('');
        onTranscript(transcript, detectedLang);
      }
    });
  };

  // Dimensions based on size prop
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs p-1',
    md: 'w-8 h-8 text-xs p-1.5',
    lg: 'w-10 h-10 text-sm p-2'
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size];

  return (
    <div className={`relative inline-flex items-center gap-1 ${className}`} ref={menuRef}>
      
      {/* Primary Voice Listening Button */}
      <button
        type="button"
        onClick={handleToggleVoice}
        title={
          isListening 
            ? 'Listening... Click to stop' 
            : isPermissionDenied 
            ? 'Microphone permission blocked. Click for options' 
            : `Click to speak (${language.toUpperCase()})`
        }
        className={`relative flex items-center justify-center rounded-xl transition-all shadow-xs cursor-pointer ${sizeClasses} ${
          isListening
            ? 'bg-rose-500 text-white shadow-rose-500/40 ring-4 ring-rose-200 animate-pulse'
            : isProcessing
            ? 'bg-sky-500 text-white ring-2 ring-sky-300 animate-spin'
            : isPermissionDenied
            ? 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200'
            : isUnsupported
            ? 'bg-slate-100 text-slate-500 border border-slate-200'
            : 'bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-600 border border-slate-200 hover:border-sky-300'
        }`}
      >
        {isListening ? (
          <>
            <Mic className={`${iconSizes} animate-bounce`} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
          </>
        ) : isProcessing ? (
          <Sparkles className={`${iconSizes}`} />
        ) : isPermissionDenied ? (
          <MicOff className={`${iconSizes}`} />
        ) : (
          <Mic className={`${iconSizes}`} />
        )}
      </button>

      {/* Preset Sample Menu Trigger */}
      {showSampleMenu && (
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="Voice AI Samples (Tamil, Telugu, Hindi, English)"
          className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Live Speech Interim Bubble */}
      {isListening && interimText && (
        <div className="absolute bottom-full left-0 mb-2 z-50 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 whitespace-nowrap flex items-center gap-1.5 animate-fadeIn">
          <Volume2 className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span className="font-medium text-slate-200">{interimText}...</span>
        </div>
      )}

      {/* Permission Denied Warning Popover */}
      {isPermissionDenied && (
        <div className="absolute top-full left-0 mt-2 z-50 w-64 bg-white p-3 rounded-xl border border-amber-200 shadow-xl text-xs text-slate-700 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-amber-800 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Microphone Blocked</span>
          </div>
          <p className="text-[11px] text-slate-600">
            {errorMessage || 'Please allow microphone permission in your browser URL bar or try sample voice inputs below:'}
          </p>
          <div className="pt-1 flex flex-col gap-1">
            {SAMPLE_VOICE_PRESETS.slice(0, 3).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className="text-left px-2 py-1 text-[10px] bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-md border border-slate-200 transition-colors truncate font-medium"
              >
                ✨ {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sample Voice Dropdown Modal / Popover */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Voice AI Sample Inputs</span>
            </div>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              4 Languages
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            Click any natural speech prompt to test the multilingual STT and NLP pipeline:
          </p>

          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {SAMPLE_VOICE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className="w-full text-left p-2 rounded-xl hover:bg-sky-50 border border-transparent hover:border-sky-200 transition-all text-xs group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 group-hover:text-sky-700 text-[11px]">
                    {preset.label}
                  </span>
                  <span className="text-[9px] uppercase px-1 rounded bg-slate-100 text-slate-500 font-bold">
                    {preset.language}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 font-medium line-clamp-1 italic">
                  "{preset.transcript}"
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
