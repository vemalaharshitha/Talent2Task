import type { Language } from '../types';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'permission_denied' | 'unsupported' | 'error';

export interface VoiceError {
  type: 'permission_denied' | 'no_speech' | 'network_error' | 'unsupported' | 'aborted' | 'unknown';
  message: string;
  originalError?: any;
}

export interface VoiceListenOptions {
  language?: Language;
  continuous?: boolean;
  interimResults?: boolean;
  onInterimResult?: (transcript: string) => void;
  onFinalResult?: (transcript: string, detectedLang?: Language) => void;
  onError?: (error: VoiceError) => void;
  onStateChange?: (state: VoiceState) => void;
}

export interface SampleVoicePreset {
  id: string;
  language: Language;
  label: string;
  transcript: string;
  description: string;
}

export const SAMPLE_VOICE_PRESETS: SampleVoicePreset[] = [
  {
    id: 'te_plumber_wage',
    language: 'te',
    label: 'తెలుగు — ప్లంబర్ & వేతనం',
    transcript: 'నాకు దగ్గర్లో ప్లంబర్ కావాలి వేతనం 600 రూపాయలు రేపటికి',
    description: 'Telugu: Plumber needed near me, ₹600 wage tomorrow'
  },
  {
    id: 'te_skill_gap',
    language: 'te',
    label: 'తెలుగు — నైపుణ్య గైడ్',
    transcript: 'ఎక్కువ సంపాదించడానికి నేను ఏ నైపుణ్యాలు నేర్చుకోవాలి?',
    description: 'Telugu: What skills should I learn to earn more?'
  },
  {
    id: 'ta_plumber_wage',
    language: 'ta',
    label: 'தமிழ் — பிளம்பர் & ஊதியம்',
    transcript: 'எனக்கு காலை 9:00 மணி அளவில் பிளம்பர் தேவை அனுபவம் இரண்டு வருடம் ஊதியம் ஐந்தாறு ரூபாய் எனக்கு அருகில்.',
    description: 'Tamil: Plumber needed morning shift, 2y exp, ₹500 wage near me'
  },
  {
    id: 'ta_delivery',
    language: 'ta',
    label: 'தமிழ் — டெலிவரி & சம்பளம்',
    transcript: 'கோயம்புத்தூரில் பைக் டெலிவரி ஆட்கள் தேவை சம்பளம் 800 ரூபாய் ஒரு நாளுக்கு',
    description: 'Tamil: Bike delivery in Coimbatore, ₹800/day'
  },
  {
    id: 'hi_electrician_wage',
    language: 'hi',
    label: 'हिन्दी — इलेक्ट्रीशियन & वेतन',
    transcript: 'मुझे एक इलेक्ट्रीशियन चाहिए वेतन 500 रुपये प्रति दिन',
    description: 'Hindi: Electrician needed with ₹500/day wage'
  },
  {
    id: 'hi_cook',
    language: 'hi',
    label: 'हिन्दी — कैटरिंग हेल्पर',
    transcript: 'चेन्नई में शादी के लिए खाना बनाने वाला रसोइया चाहिए पगार 1000 रुपये',
    description: 'Hindi: Catering cook in Chennai, ₹1000 wage'
  },
  {
    id: 'en_ac_wage',
    language: 'en',
    label: 'English — AC & Budget',
    transcript: 'I need an experienced AC technician near Madurai tomorrow evening budget Rs. 1500',
    description: 'English: Experienced AC technician with ₹1500 budget'
  },
  {
    id: 'en_skill_trends',
    language: 'en',
    label: 'English — Skill Trends & Demand',
    transcript: 'What are the top paying skills in Chennai right now?',
    description: 'English: Top paying skills in Chennai'
  }
];

class VoiceService {
  private recognition: any = null;
  private isListeningActive: boolean = false;
  private isSessionStarting: boolean = false;
  private isSessionRunning: boolean = false;
  private currentState: VoiceState = 'idle';
  private accumulatedTranscript: string = '';
  private currentLiveTranscript: string = '';
  private currentOptions: VoiceListenOptions = {};
  private restartTimer: any = null;

  constructor() {
    this.initRecognition();
  }

  /**
   * Initializes SpeechRecognition instance if supported by the browser
   */
  private initRecognition(): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      try {
        if (this.recognition) {
          try { this.recognition.abort(); } catch {}
        }
        this.recognition = new SpeechRecognitionAPI();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        return true;
      } catch (e) {
        console.warn('Could not initialize SpeechRecognition:', e);
        this.recognition = null;
        return false;
      }
    }
    return false;
  }

  /**
   * Checks if actual Web Speech API is supported in the current environment
   */
  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  /**
   * Maps application Language ('en' | 'ta' | 'te' | 'hi') to BCP-47 SpeechRecognition language tag
   */
  public getRecognitionLanguageTag(lang: Language = 'en'): string {
    switch (lang) {
      case 'ta':
        return 'ta-IN'; // Tamil (India)
      case 'te':
        return 'te-IN'; // Telugu (India)
      case 'hi':
        return 'hi-IN'; // Hindi (India)
      case 'en':
      default:
        return 'en-IN'; // Indian English (standard for regional accents)
    }
  }

  /**
   * Starts listening continuously for voice input across pauses and silence gaps
   */
  public async startListening(options: VoiceListenOptions = {}): Promise<void> {
    if (!this.isSupported()) {
      this.currentState = 'unsupported';
      options.onStateChange?.('unsupported');
      options.onError?.({
        type: 'unsupported',
        message: 'Speech recognition is not supported in this browser. Please use Chrome, Edge, Safari, or type your query.'
      });
      return;
    }

    // Stop any existing session and reset accumulated buffers
    this.stopListening();
    this.accumulatedTranscript = '';
    this.currentLiveTranscript = '';
    this.currentOptions = options;
    this.isListeningActive = true;

    // Proactively request / verify microphone permission
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Close temporary stream immediately; SpeechRecognition will use the audio device
        stream.getTracks().forEach(track => track.stop());
      } catch (permErr: any) {
        if (permErr?.name === 'NotAllowedError' || permErr?.name === 'PermissionDeniedError') {
          this.isListeningActive = false;
          this.currentState = 'permission_denied';
          this.currentOptions.onStateChange?.('permission_denied');
          this.currentOptions.onError?.({
            type: 'permission_denied',
            message: 'Microphone permission was denied. Please allow microphone access in your browser settings to speak.',
            originalError: permErr
          });
          return;
        }
      }
    }

    this.startSession();
  }

  private startSession(): void {
    if (!this.isListeningActive || this.isSessionStarting || this.isSessionRunning) return;

    try {
      this.isSessionStarting = true;
      const initialized = this.initRecognition();
      if (!initialized || !this.recognition) {
        this.isSessionStarting = false;
        return;
      }

      const langTag = this.getRecognitionLanguageTag(this.currentOptions.language || 'en');
      this.recognition.lang = langTag;
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isSessionStarting = false;
        this.isSessionRunning = true;
        this.currentState = 'listening';
        this.currentOptions.onStateChange?.('listening');
      };

      this.recognition.onresult = (event: any) => {
        let sessionFinal = '';
        let sessionInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            sessionFinal += item[0].transcript + ' ';
          } else {
            sessionInterim += item[0].transcript + ' ';
          }
        }

        const combined = (this.accumulatedTranscript + ' ' + sessionFinal + ' ' + sessionInterim)
          .replace(/\s+/g, ' ')
          .trim();

        if (combined) {
          this.currentLiveTranscript = combined;
          this.currentOptions.onInterimResult?.(combined);
        }
      };

      this.recognition.onerror = (event: any) => {
        const errType = event.error;

        // Non-fatal errors like 'no-speech' (silence gaps/pauses) - continue listening
        if (errType === 'no-speech') {
          return;
        }

        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          this.isListeningActive = false;
          this.isSessionRunning = false;
          this.currentState = 'permission_denied';
          this.currentOptions.onStateChange?.('permission_denied');
          this.currentOptions.onError?.({
            type: 'permission_denied',
            message: 'Microphone permission was denied. Please allow microphone access in your browser settings to speak.',
            originalError: event
          });
          return;
        }

        if (errType === 'aborted') {
          return;
        }

        console.warn('[VoiceService] Recognition notice:', errType);
      };

      this.recognition.onend = () => {
        this.isSessionStarting = false;
        this.isSessionRunning = false;

        // If user is still actively recording, commit any live transcript and restart recognition seamlessly
        if (this.isListeningActive) {
          if (this.currentLiveTranscript) {
            this.accumulatedTranscript = this.currentLiveTranscript;
          }

          clearTimeout(this.restartTimer);
          this.restartTimer = setTimeout(() => {
            if (this.isListeningActive) {
              this.startSession();
            }
          }, 150);
          return;
        }

        this.currentState = 'idle';
        this.currentOptions.onStateChange?.('idle');

        const finalResultText = this.currentLiveTranscript || this.accumulatedTranscript;
        if (finalResultText.trim()) {
          this.currentOptions.onFinalResult?.(finalResultText.trim(), this.currentOptions.language);
        }
      };

      this.recognition.start();
    } catch (err: any) {
      this.isSessionStarting = false;
      this.isSessionRunning = false;
      if (this.isListeningActive) {
        clearTimeout(this.restartTimer);
        this.restartTimer = setTimeout(() => {
          if (this.isListeningActive) this.startSession();
        }, 250);
      }
    }
  }

  /**
   * Stops active voice listening session and delivers final complete transcript
   */
  public stopListening(): void {
    this.isListeningActive = false;
    this.isSessionStarting = false;
    clearTimeout(this.restartTimer);

    if (this.recognition && this.isSessionRunning) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }
    this.isSessionRunning = false;

    const finalResultText = this.currentLiveTranscript || this.accumulatedTranscript;
    if (finalResultText.trim()) {
      this.currentOptions.onFinalResult?.(finalResultText.trim(), this.currentOptions.language);
    }

    this.currentState = 'idle';
    this.currentOptions.onStateChange?.('idle');
  }

  /**
   * Immediately resets and clears all voice recognition buffers and stops recording
   * without firing any final transcript callbacks.
   */
  public reset(): void {
    this.isListeningActive = false;
    this.isSessionStarting = false;
    this.isSessionRunning = false;
    clearTimeout(this.restartTimer);
    this.accumulatedTranscript = '';
    this.currentLiveTranscript = '';

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // Ignore abort errors
      }
    }

    this.currentState = 'idle';
    this.currentOptions = {};
  }

  /**
   * Simulates a voice input transcript (useful for quick testing, testing presets, or automated QA)
   */
  public simulateVoiceInput(
    presetIdOrText: string, 
    options: VoiceListenOptions = {}
  ): void {
    const preset = SAMPLE_VOICE_PRESETS.find(p => p.id === presetIdOrText);
    const transcript = preset ? preset.transcript : presetIdOrText;
    const lang = preset ? preset.language : (options.language || 'en');

    options.onStateChange?.('listening');
    
    // Simulate short speech stream
    setTimeout(() => {
      options.onInterimResult?.(transcript);
      options.onStateChange?.('processing');

      setTimeout(() => {
        options.onFinalResult?.(transcript, lang);
        options.onStateChange?.('idle');
      }, 200);
    }, 250);
  }

  /**
   * Speaks vocal confirmation in user's language using Web Speech Synthesis or high-fidelity neural TTS
   */
  public speakFeedback(text: string, lang: Language = 'en'): void {
    if (typeof window === 'undefined') return;

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      const clean = this.cleanTextForSpeech(text);
      if (!clean) return;

      const matchedVoice = this.getVoiceForLanguage(lang);

      if (matchedVoice && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = this.getRecognitionLanguageTag(lang);
        utterance.voice = matchedVoice;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } else {
        const audio = new Audio(`/api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(clean.slice(0, 260))}`);
        audio.play().catch(() => {});
      }
    } catch (e) {
      console.warn('Speech feedback fallback triggered:', e);
    }
  }

  /**
   * Cleans markdown formatting, backticks, URLs, and symbols for speech synthesis
   */
  public cleanTextForSpeech(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#+/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^[•\-*]\s+/gm, '')
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[✨📍📝📈📊🎯✅💡⭐•\-*ℹ️⚠️🗑️🔹]/gu, ' ')
      .replace(/₹\s*(\d+)/g, '$1 rupees')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Resolves browser synthesis voice matching language (Telugu, Tamil, Hindi, English)
   */
  public getVoiceForLanguage(lang: Language = 'en'): any {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    return voices.find(v => {
      const l = (v.lang || '').toLowerCase();
      const n = (v.name || '').toLowerCase();
      if (lang === 'te') return l.startsWith('te') || n.includes('telugu') || n.includes('mohan');
      if (lang === 'ta') return l.startsWith('ta') || n.includes('tamil') || n.includes('valluvar');
      if (lang === 'hi') return l.startsWith('hi') || n.includes('hindi') || n.includes('swara') || n.includes('madhur');
      return l.startsWith('en-in') || l.startsWith('en') || n.includes('india') || n.includes('ravi') || n.includes('heera');
    }) || null;
  }

  /**
   * Speaks vocal feedback
   */
  public speak(text: string, lang: Language = 'en'): void {
    this.speakFeedback(text, lang);
  }

  public getState(): VoiceState {
    return this.currentState;
  }

  public getCurrentState(): VoiceState {
    return this.currentState;
  }
}

export const voiceService = new VoiceService();
