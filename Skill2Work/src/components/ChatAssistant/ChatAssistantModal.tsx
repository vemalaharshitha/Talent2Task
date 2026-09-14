import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Minus, 
  RotateCcw, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Star,
  Volume2,
  Copy,
  Check,
  MapPin,
  Briefcase,
  Clock,
  ShieldCheck,
  ArrowDown,
  Plus,
  TrendingUp,
  Play,
  Pause,
  Mic,
  MicOff
} from 'lucide-react';
import type { Job, User, SkillDemandStat, Language } from '../../types';
import { chatAssistantService, type ChatMessage, type ChatActionItem } from '../../services/chatAssistantService';
import { voiceService, SAMPLE_VOICE_PRESETS, type VoiceState } from '../../services/voiceService';
import { useLanguage } from '../../i18n/LanguageContext';
import { autoTranslateString, detectLanguageFromScript, hasIndicCharacters } from '../../i18n/autoTranslate';
import { translateText } from '../../services/translationService';

interface ChatAssistantModalProps {
  currentUser: User | null;
  jobs: Job[];
  users: User[];
  skillDemandStats: SkillDemandStat[];
  currentCoords?: { latitude: number; longitude: number } | null;
  radiusKm?: number;
  selectedJob?: Job | null;
  onSelectJob: (job: Job) => void;
  onClaimJob?: (jobId: string) => void;
  onOpenPostJob: (initialData?: any) => void;
  onNavigateTab: (tab: 'explore' | 'my-gigs' | 'post-manage', view?: 'both' | 'list' | 'map') => void;
  onSetRadius?: (radiusKm: number) => void;
  onSelectCity?: (city: string) => void;
  onRequestLiveGps?: () => Promise<void>;
  onFilterJobs?: (query?: string, category?: string) => void;
  onAddSkillToProfile?: (skill: string) => void;
  onOpenCommunityDemand?: () => void;
  onOpenProfile?: () => void;
  onDeleteJob?: (jobId: string) => void;
}

// -------------------------------------------------------------
// Lightweight Rich Markdown Text Parser Component
// -------------------------------------------------------------
const MarkdownRenderer: React.FC<{ content: string; isUser?: boolean }> = ({ content, isUser }) => {
  const renderedNodes = useMemo(() => {
    const lines = content.split('\n');
    const nodes: React.ReactNode[] = [];

    const formatInline = (text: string, keyPrefix: string) => {
      const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
      return parts.map((part, index) => {
        const key = `${keyPrefix}_${index}`;
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={key} className={isUser ? 'font-bold' : 'font-bold text-slate-900'}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={key} className="px-1.5 py-0.5 rounded bg-slate-100 text-sky-700 font-mono text-[11px] font-semibold border border-slate-300">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={key}>{part}</span>;
      });
    };

    lines.forEach((rawLine, idx) => {
      const line = rawLine.trim();

      if (!line) {
        nodes.push(<div key={`blank_${idx}`} className="h-1.5" />);
        return;
      }

      // Headings
      if (line.startsWith('### ')) {
        nodes.push(
          <h4 key={`h3_${idx}`} className="font-bold text-slate-900 text-xs sm:text-sm mt-2 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
            {formatInline(line.replace(/^###\s+/, ''), `h3_${idx}`)}
          </h4>
        );
        return;
      }
      if (line.startsWith('## ') || line.startsWith('# ')) {
        nodes.push(
          <h3 key={`h2_${idx}`} className="font-bold text-slate-900 text-sm mt-2 mb-1">
            {formatInline(line.replace(/^#+\s+/, ''), `h2_${idx}`)}
          </h3>
        );
        return;
      }

      // Bullet List Items (•, -, *)
      if (/^[•\-*]\s+/.test(line)) {
        const itemText = line.replace(/^[•\-*]\s+/, '');
        nodes.push(
          <div key={`bullet_${idx}`} className="flex items-start gap-1.5 my-0.5 pl-0.5 leading-relaxed">
            <span className="text-sky-600 font-bold shrink-0 text-[12px] leading-4">•</span>
            <div className="text-slate-800 text-xs sm:text-[13px]">{formatInline(itemText, `bullet_item_${idx}`)}</div>
          </div>
        );
        return;
      }

      // Numbered List Items (1., 2.)
      const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        const [, num, numText] = numMatch;
        nodes.push(
          <div key={`num_${idx}`} className="flex items-start gap-1.5 my-0.5 pl-0.5 leading-relaxed">
            <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-800 font-bold shrink-0 text-[10px] flex items-center justify-center mt-0.5 border border-sky-300">
              {num}
            </span>
            <div className="text-slate-800 text-xs sm:text-[13px]">{formatInline(numText, `num_item_${idx}`)}</div>
          </div>
        );
        return;
      }

      // Regular Paragraph
      nodes.push(
        <p key={`p_${idx}`} className={`leading-relaxed my-1 text-xs sm:text-[13px] ${isUser ? 'text-white' : 'text-slate-800'}`}>
          {formatInline(line, `p_item_${idx}`)}
        </p>
      );
    });

    return nodes;
  }, [content, isUser]);

  return <div className="space-y-0.5">{renderedNodes}</div>;
};

// -------------------------------------------------------------
// Dynamic Thinking Indicator with progressive steps
// -------------------------------------------------------------
const ThinkingStepIndicator: React.FC<{ language: Language }> = ({ language }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => {
    if (language === 'ta') {
      return [
        'கேள்வியைப் புரிந்து கொள்கிறது...',
        'திறன்கள் மற்றும் இடங்களை ஆராய்கிறது...',
        'பொருத்தம் & தூரத்தை கணக்கிடுகிறது...',
        'பதிலைத் தயார் செய்கிறது...'
      ];
    }
    if (language === 'hi') {
      return [
        'अनुरोध को समझ रहा है...',
        'कुशल श्रमिक और कार्य खोज रहा है...',
        'मैच स्कोर की गणना कर रहा है...',
        'उत्तर तैयार कर रहा है...'
      ];
    }
    if (language === 'te') {
      return [
        'అభ్యర్థనను విశ్లేషిస్తోంది...',
        'పనులు మరియు నైపుణ్యాలను శోధిస్తోంది...',
        'స్కోర్‌ను లెక్కిస్తోంది...',
        'సమాధానాన్ని సిద్ధం చేస్తోంది...'
      ];
    }
    return [
      'Understanding intent & context...',
      'Searching skills & hyperlocal records...',
      'Calculating hybrid match & distances...',
      'Composing response...'
    ];
  }, [language]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1200);
    return () => clearInterval(timer);
  }, [steps]);

  return (
    <div className="flex items-start gap-2.5 animate-fadeIn">
      <div 
        className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
        style={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)' }}
      >
        <Sparkles className="w-3.5 h-3.5 animate-spin" />
      </div>
      <div className="bg-white border border-slate-300 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-sm max-w-[85%] space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
            Talent2Task AI
          </span>
        </div>
        <div className="text-xs text-slate-700 font-medium">
          {steps[stepIndex]}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Main ChatAssistantModal Component
// -------------------------------------------------------------
export const ChatAssistantModal: React.FC<ChatAssistantModalProps> = ({
  currentUser,
  jobs,
  users,
  skillDemandStats,
  currentCoords,
  radiusKm,
  selectedJob,
  onSelectJob,
  onClaimJob,
  onOpenPostJob,
  onNavigateTab,
  onSetRadius,
  onSelectCity,
  onRequestLiveGps,
  onFilterJobs,
  onAddSkillToProfile,
  onOpenCommunityDemand,
  onOpenProfile,
  onDeleteJob
}) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [activeLangFilter, setActiveLangFilter] = useState<Language>(language);

  // Read Aloud (TTS) State
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isTtsPaused, setIsTtsPaused] = useState(false);

  // Copy Feedback State
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Voice Input Recording Overlay State
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [showVoicePresets, setShowVoicePresets] = useState(false);

  // Collapsible Explanations map
  const [expandedBreakdowns, setExpandedBreakdowns] = useState<Record<string, boolean>>({});

  // Scroll to bottom management
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);

  const isRecruiter = currentUser?.role === 'recruiter';

  const getInitialMessage = (targetLang: Language = activeLangFilter): ChatMessage => {
    let welcomeText = '';
    let quickActions: ChatActionItem[] = [];

    if (targetLang === 'ta') {
      welcomeText = `வணக்கம்! நான் உங்கள் **Talent2Task AI உதவியாளர்**.\n\n${
        isRecruiter
          ? 'நான் தமிழ்நாட்டின் சரிபார்க்கப்பட்ட பணியாளர்களைக் கண்டறியவும், சந்தை ஊதியத்தை ஆராயவும், புதிய வேலை அறிவிப்புகளைத் தயார் செய்யவும் உதவுகிறேன்.'
          : 'உங்கள் இருப்பிடத்திற்கு அருகிலுள்ள வேலைகள், ஹைப்ரிட் பொருத்தம் மற்றும் அதிக வருமானம் தரும் திறன்களைக் கண்டறிய நான் உதவுகிறேன்.'
      }`;
      quickActions = isRecruiter
        ? [
            { type: 'NAVIGATE_TAB', label: '📍 அருகிலுள்ள பணியாளர்கள்', payload: { tab: 'explore', view: 'map' } },
            { type: 'OPEN_POST_JOB', label: '📝 வேலை அறிவிப்பு உருவாக்கு' }
          ]
        : [
            { type: 'NAVIGATE_TAB', label: '📍 அருகிலுள்ள வேலைகள்', payload: { tab: 'explore' } },
            { type: 'NAVIGATE_TAB', label: '📈 திறன் வழிகாட்டி', payload: { tab: 'my-gigs' } }
          ];
    } else if (targetLang === 'hi') {
      welcomeText = `नमस्ते! मैं आपका **Talent2Task AI सहायक** हूँ।\n\n${
        isRecruiter
          ? 'मैं स्थानीय कुशल श्रमिकों को खोजने, मजदूरी बेंचमार्क करने और नए कार्य पोस्ट करने में सहायता करता हूँ।'
          : 'मैं आपके निकटवर्ती कार्य, मैच स्कोर और उच्च मांग वाले कौशल खोजने में मदद करता हूँ।'
      }`;
      quickActions = isRecruiter
        ? [
            { type: 'NAVIGATE_TAB', label: '📍 कुशल श्रमिक खोजें', payload: { tab: 'explore', view: 'map' } },
            { type: 'OPEN_POST_JOB', label: '📝 नया कार्य पोस्ट करें' }
          ]
        : [
            { type: 'NAVIGATE_TAB', label: '📍 पास के काम', payload: { tab: 'explore' } },
            { type: 'NAVIGATE_TAB', label: '📈 कौशल अनुशंसाएँ', payload: { tab: 'my-gigs' } }
          ];
    } else if (targetLang === 'te') {
      welcomeText = `నమస్కారం! నేను మీ **Talent2Task AI సహాయకుడిని**.\n\n${
        isRecruiter
          ? 'ధృవీకరించబడిన స్థానిక కార్మికులను కనుగొనడానికి మరియు పనులను పోస్ట్ చేయడానికి నేను సహాయం చేస్తాను.'
          : 'మీ సమీపంలో పనులను మరియు డిమాండ్ నైపుణ్యాలను కనుగొనడంలో నేను సహాయపడతాను.'
      }`;
      quickActions = isRecruiter
        ? [
            { type: 'NAVIGATE_TAB', label: '📍 కార్మికులను చూడండి', payload: { tab: 'explore', view: 'map' } },
            { type: 'OPEN_POST_JOB', label: '📝 జాబ్ పోస్ట్ చేయండి' }
          ]
        : [
            { type: 'NAVIGATE_TAB', label: '📍 సమీప పనులు', payload: { tab: 'explore' } },
            { type: 'NAVIGATE_TAB', label: '📈 నైపుణ్య గైడ్', payload: { tab: 'my-gigs' } }
          ];
    } else {
      welcomeText = `Hello! I'm your **Talent2Task AI Assistant**.\n\n${
        isRecruiter
          ? 'I can help you discover verified local candidates, analyze district trade wages, and prepare pre-filled gig postings.'
          : 'I can help you find gig shifts near your GPS location, explain match scores, and recommend top-paying skills across Tamil Nadu.'
      }`;
      quickActions = isRecruiter
        ? [
            { type: 'NAVIGATE_TAB', label: '📍 Discover Verified Candidates', payload: { tab: 'explore', view: 'map' } },
            { type: 'OPEN_POST_JOB', label: '📝 Post a New Gig' }
          ]
        : [
            { type: 'NAVIGATE_TAB', label: '📍 Find Gigs Near Me', payload: { tab: 'explore' } },
            { type: 'NAVIGATE_TAB', label: '📈 In-Demand Skills', payload: { tab: 'my-gigs' } }
          ];
    }

    return {
      id: 'welcome_' + targetLang,
      sender: 'assistant',
      text: welcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: quickActions,
      intent: 'GREETING'
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage(language)]);

  // Synchronize language filter with context & auto-translate messages in place
  // Synchronize language filter with context & auto-translate all messages (user & assistant) in place
  const translateMessagesToLanguage = async (targetLang: Language) => {
    setActiveLangFilter(targetLang);
    setLanguage(targetLang);

    // If only initial welcome message is present, simply update to the target language welcome message
    if (messages.length === 1 && messages[0].id.startsWith('welcome_')) {
      setMessages([getInitialMessage(targetLang)]);
      return;
    }

    // Step 1: Immediate in-place translation update (Pass 1 - Instant zero-latency UI update)
    const pass1Messages: ChatMessage[] = messages.map(msg => {
      if (msg.id.startsWith('welcome_')) {
        return getInitialMessage(targetLang);
      }

      const origText = msg.originalText || msg.text;
      const origLang = msg.originalLanguage || detectLanguageFromScript(origText) || 'en';

      let directTrans = msg.translations?.[targetLang];
      if (!directTrans) {
        if (origLang === targetLang) {
          directTrans = origText;
        } else {
          directTrans = autoTranslateString(origText, targetLang, origLang);
        }
      }

      const transFollowUps = msg.suggestedFollowUps?.map(fu => {
        return autoTranslateString(fu, targetLang, origLang);
      });

      const transActions = msg.actions?.map(act => ({
        ...act,
        label: autoTranslateString(act.label, targetLang, origLang)
      }));

      return {
        ...msg,
        originalText: origText,
        originalLanguage: origLang,
        detectedLanguage: targetLang,
        text: directTrans,
        suggestedFollowUps: transFollowUps || msg.suggestedFollowUps,
        actions: transActions || msg.actions,
        translations: {
          ...(msg.translations || {}),
          [origLang]: origText,
          [targetLang]: directTrans
        }
      };
    });

    setMessages(pass1Messages);

    // Step 2: Asynchronously fetch high-precision Gemini API translations for all items (Pass 2 - High Quality)
    try {
      const pass2Messages = await Promise.all(
        pass1Messages.map(async (msg) => {
          if (msg.id.startsWith('welcome_')) return msg;
          const origText = msg.originalText || msg.text;
          const origLang = msg.originalLanguage || detectLanguageFromScript(origText) || 'en';

          if (origLang === targetLang) {
            return {
              ...msg,
              text: origText,
              detectedLanguage: targetLang,
              translations: { ...(msg.translations || {}), [targetLang]: origText }
            };
          }

          let finalTrans: string = msg.translations?.[targetLang] || '';
          // Check if dynamic translation is required
          const isTranslated = !!finalTrans && finalTrans !== origText && (targetLang !== 'en' || !hasIndicCharacters(finalTrans));

          if (!isTranslated) {
            try {
              finalTrans = await translateText(origText, targetLang, origLang);
            } catch {
              finalTrans = autoTranslateString(origText, targetLang, origLang);
            }
          }

          if (!finalTrans) {
            finalTrans = origText;
          }

          let finalFollowUps = msg.suggestedFollowUps;
          if (msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0) {
            finalFollowUps = await Promise.all(
              msg.suggestedFollowUps.map(async (fu) => {
                try {
                  return await translateText(fu, targetLang, origLang);
                } catch {
                  return autoTranslateString(fu, targetLang, origLang);
                }
              })
            );
          }

          let finalActions = msg.actions;
          if (msg.actions && msg.actions.length > 0) {
            finalActions = await Promise.all(
              msg.actions.map(async (act) => {
                try {
                  const transLabel = await translateText(act.label, targetLang, origLang);
                  return { ...act, label: transLabel };
                } catch {
                  return { ...act, label: autoTranslateString(act.label, targetLang, origLang) };
                }
              })
            );
          }

          return {
            ...msg,
            text: finalTrans,
            detectedLanguage: targetLang,
            suggestedFollowUps: finalFollowUps,
            actions: finalActions,
            translations: {
              ...(msg.translations || {}),
              [targetLang]: finalTrans
            }
          };
        })
      );

      setMessages(pass2Messages);
    } catch (e) {
      console.warn('Async translation update error in ChatAssistantModal:', e);
    }
  };

  // Synchronize language filter with context & auto-update initial message immediately
  useEffect(() => {
    if (language !== activeLangFilter) {
      translateMessagesToLanguage(language);
    }
  }, [language, currentUser?.role]);

  // HTML5 Audio stream & queue references for robust multi-language speech synthesis
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsQueueRef = useRef<{ chunks: string[]; currentIndex: number; lang: string; msgId: string }>({
    chunks: [],
    currentIndex: 0,
    lang: 'en',
    msgId: ''
  });

  // Read Aloud / TTS Manager
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current.currentTime = 0;
      ttsAudioRef.current.src = '';
    }
    ttsQueueRef.current = { chunks: [], currentIndex: 0, lang: 'en', msgId: '' };
    setSpeakingMsgId(null);
    setIsTtsPaused(false);
  };

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const toggleReadAloud = (msgId: string, text: string, msgLang?: string) => {
    if (typeof window === 'undefined') return;

    // If currently speaking this message, toggle pause/play
    if (speakingMsgId === msgId) {
      if (isTtsPaused) {
        if (ttsAudioRef.current && ttsAudioRef.current.src) {
          ttsAudioRef.current.play().catch(() => {});
        } else if ('speechSynthesis' in window) {
          window.speechSynthesis.resume();
        }
        setIsTtsPaused(false);
      } else {
        if (ttsAudioRef.current && ttsAudioRef.current.src) {
          ttsAudioRef.current.pause();
        } else if ('speechSynthesis' in window) {
          window.speechSynthesis.pause();
        }
        setIsTtsPaused(true);
      }
      return;
    }

    stopSpeech();

    // 1. Clean markdown, emojis, symbols, and formatting for crystal clear vocal reading
    const plainText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#+/g, '')
      .replace(/^[•\-*]\s+/gm, '')
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[✨📍📝📈📊🎯✅💡⭐•\-*]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!plainText) return;

    // Detect actual script in plainText (e.g. Tamil \u0B80-\u0BFF, Telugu \u0C00-\u0C7F, Hindi \u0900-\u097F)
    const scriptLang = detectLanguageFromScript(plainText);
    const targetLang: Language = scriptLang || (msgLang as Language) || activeLangFilter || 'en';

    // 2. Check if browser has a matching verified native voice installed for English
    const voices = 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
    const matchedVoice = targetLang === 'en' ? voices.find(v => (v.lang || '').toLowerCase().startsWith('en')) : undefined;

    // If English and native English voice is available, use SpeechSynthesis
    if (targetLang === 'en' && matchedVoice && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = 'en-IN';
      utterance.voice = matchedVoice;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setSpeakingMsgId(null);
        setIsTtsPaused(false);
      };

      utterance.onerror = () => {
        setSpeakingMsgId(null);
        setIsTtsPaused(false);
      };

      setSpeakingMsgId(msgId);
      setIsTtsPaused(false);
      window.speechSynthesis.speak(utterance);
      return;
    }

    // 3. For Indic languages (Tamil, Telugu, Hindi) or systems lacking native Indic voices:
    // Break into sentence segments and stream native neural audio from /api/tts
    const sentences = plainText
      .split(/(?<=[.!?।\n])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    const chunks: string[] = [];
    let currentChunk = '';

    for (const s of sentences) {
      if ((currentChunk + ' ' + s).trim().length > 150 && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = s;
      } else {
        currentChunk = (currentChunk + ' ' + s).trim();
      }
    }
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    if (chunks.length === 0) chunks.push(plainText.slice(0, 180));

    ttsQueueRef.current = {
      chunks,
      currentIndex: 0,
      lang: targetLang,
      msgId
    };

    setSpeakingMsgId(msgId);
    setIsTtsPaused(false);

    const playNextChunk = () => {
      const q = ttsQueueRef.current;
      if (!q || q.msgId !== msgId || q.currentIndex >= q.chunks.length) {
        setSpeakingMsgId(null);
        setIsTtsPaused(false);
        return;
      }

      const chunkToPlay = q.chunks[q.currentIndex];
      const audioUrl = `/api/tts?lang=${encodeURIComponent(q.lang)}&text=${encodeURIComponent(chunkToPlay)}`;

      if (!ttsAudioRef.current) {
        ttsAudioRef.current = new Audio();
      }

      const audio = ttsAudioRef.current;
      audio.src = audioUrl;
      audio.playbackRate = 1.0;

      audio.onended = () => {
        q.currentIndex++;
        playNextChunk();
      };

      audio.onerror = () => {
        console.warn('[TTS] Audio chunk playback error, advancing chunk');
        q.currentIndex++;
        playNextChunk();
      };

      audio.play().catch(err => {
        console.warn('[TTS] Audio play error:', err);
        setSpeakingMsgId(null);
        setIsTtsPaused(false);
      });
    };

    playNextChunk();
  };

  const handleCopyText = (msgId: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  const handleResetChat = () => {
    stopSpeech();
    voiceService.reset();
    setMessages([getInitialMessage(activeLangFilter)]);
    setInputQuery('');
    setLiveTranscript('');
    setIsVoiceRecording(false);
    setVoiceDuration(0);
    setShowVoicePresets(false);
    setExpandedBreakdowns({});
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setShowScrollBottomButton(false);
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShowScrollBottomButton(!isNearBottom);
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom('auto');
      setHasUnread(false);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (messages.length > 0 && isOpen && !isMinimized) {
      scrollToBottom('smooth');
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVoiceRecording) {
      setVoiceDuration(0);
      timer = setInterval(() => {
        setVoiceDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVoiceRecording]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const executeAction = (action: ChatActionItem, isAuto = false) => {
    switch (action.type) {
      case 'VIEW_JOB':
        if (action.payload?.job) {
          onSelectJob(action.payload.job);
        }
        break;
      case 'CLAIM_JOB':
        if (action.payload?.jobId && onClaimJob) {
          onClaimJob(action.payload.jobId);
        }
        break;
      case 'OPEN_POST_JOB':
        onOpenPostJob(action.payload);
        break;
      case 'NAVIGATE_TAB':
        onNavigateTab(action.payload?.tab || 'explore', action.payload?.view);
        break;
      case 'SET_RADIUS':
        if (action.payload?.radiusKm && onSetRadius) {
          onSetRadius(action.payload.radiusKm);
          if (!isAuto) onNavigateTab('explore');
        }
        break;
      case 'SET_LOCATION':
        if (action.payload?.city && onSelectCity) {
          onSelectCity(action.payload.city);
        }
        break;
      case 'TRIGGER_GPS':
        if (onRequestLiveGps) {
          onRequestLiveGps();
        }
        break;
      case 'FILTER_JOBS':
        if (onFilterJobs) {
          onFilterJobs(action.payload?.searchQuery, action.payload?.category);
          if (!isAuto) onNavigateTab('explore');
        }
        break;
      case 'ADD_SKILL':
        if (action.payload?.skill && onAddSkillToProfile) {
          onAddSkillToProfile(action.payload.skill);
        }
        break;
      case 'OPEN_COMMUNITY_DEMAND':
        if (onOpenCommunityDemand) {
          onOpenCommunityDemand();
        }
        break;
      case 'OPEN_PROFILE':
        if (onOpenProfile) {
          onOpenProfile();
        }
        break;
      case 'CONFIRM_ACTION':
        if (action.payload?.actionType === 'DELETE_JOB' && action.payload?.jobId && onDeleteJob) {
          onDeleteJob(action.payload.jobId);
          const confirmedMsg: ChatMessage = {
            id: 'sys_' + Date.now(),
            sender: 'assistant',
            text: `✅ Job posting "${action.payload.jobTitle || 'Gig'}" has been permanently removed.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, confirmedMsg]);
        }
        break;
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputQuery).trim();
    if (!textToSend || isTyping) return;

    stopSpeech();
    voiceService.reset();

    const userLang = detectLanguageFromScript(textToSend) || activeLangFilter || 'en';
    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      originalText: textToSend,
      originalLanguage: userLang,
      detectedLanguage: userLang,
      translations: {
        [userLang]: textToSend,
        [activeLangFilter]: textToSend
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setLiveTranscript('');
    setIsVoiceRecording(false);
    setVoiceDuration(0);
    setShowVoicePresets(false);
    setIsTyping(true);

    try {
      const response = await chatAssistantService.handleQuery(textToSend, {
        currentUser,
        jobs,
        users,
        skillDemandStats,
        language: activeLangFilter,
        currentCoords,
        radiusKm,
        selectedJob,
        history: messages
      });

      const detectedLang = (response.detectedLanguage as Language) || detectLanguageFromScript(response.text) || activeLangFilter;
      const enrichedResponse: ChatMessage = {
        ...response,
        originalText: response.originalText || response.text,
        originalLanguage: response.originalLanguage || detectedLang,
        detectedLanguage: activeLangFilter,
        translations: {
          ...(response.translations || {}),
          [detectedLang]: response.text,
          [activeLangFilter]: response.text
        }
      };

      setMessages(prev => [...prev, enrichedResponse]);

      if (response.actions) {
        response.actions.forEach(act => {
          if (act.autoExecute) {
            executeAction(act, true);
          }
        });
      }

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error('Chat Assistant Error:', err);
      const fallbackMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        text: activeLangFilter === 'ta'
          ? 'மன்னிக்கவும், தகவலைப் பெறுவதில் சிக்கல் ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
          : 'Sorry, I encountered an issue retrieving that information. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRegenerate = (msgIndex: number) => {
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        handleSend(messages[i].text);
        break;
      }
    }
  };

  // Voice recognition - populate text input continuously, manual send by user
  const handleToggleVoiceInput = () => {
    if (isVoiceRecording) {
      voiceService.stopListening();
      setIsVoiceRecording(false);
      setLiveTranscript('');
      setVoiceDuration(0);
      setTimeout(() => inputRef.current?.focus(), 150);
      return;
    }

    setLiveTranscript('');
    setVoiceDuration(0);
    setIsVoiceRecording(true);

    voiceService.startListening({
      language: activeLangFilter,
      continuous: true,
      interimResults: true,
      onStateChange: (state: VoiceState) => {
        if (state === 'error' || state === 'unsupported' || state === 'permission_denied') {
          setIsVoiceRecording(false);
          setVoiceDuration(0);
        }
      },
      onInterimResult: (text: string) => {
        setLiveTranscript(text);
        setInputQuery(text);
      },
      onFinalResult: (transcript: string) => {
        setIsVoiceRecording(false);
        setLiveTranscript('');
        setVoiceDuration(0);
        if (transcript.trim()) {
          setInputQuery(transcript.trim());
        }
        setTimeout(() => inputRef.current?.focus(), 150);
      },
      onError: () => {
        setIsVoiceRecording(false);
        setVoiceDuration(0);
      }
    });
  };

  const handleSelectPreset = (presetId: string) => {
    setShowVoicePresets(false);
    setLiveTranscript('');
    setVoiceDuration(0);
    setIsVoiceRecording(true);

    voiceService.simulateVoiceInput(presetId, {
      language: activeLangFilter,
      onStateChange: (state: VoiceState) => {
        if (state === 'idle') {
          setIsVoiceRecording(false);
          setVoiceDuration(0);
        }
      },
      onInterimResult: (text: string) => {
        setLiveTranscript(text);
        setInputQuery(text);
      },
      onFinalResult: (transcript: string) => {
        setIsVoiceRecording(false);
        setLiveTranscript('');
        setVoiceDuration(0);
        if (transcript.trim()) {
          setInputQuery(transcript.trim());
        }
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    });
  };

  const promptCategories = useMemo(() => {
    if (isRecruiter) {
      if (activeLangFilter === 'ta') {
        return [
          { title: 'பணியாளர்கள்', icon: <Briefcase className="w-3.5 h-3.5 text-sky-600" />, prompt: 'அருகிலுள்ள பிளம்பர்களைக் காட்டு' },
          { title: 'ரேட்டிங்', icon: <Star className="w-3.5 h-3.5 text-amber-500" />, prompt: 'அதிக ரேட்டிங் உள்ள எலக்ட்ரீஷியன் தேவை' },
          { title: 'சுற்றளவு', icon: <MapPin className="w-3.5 h-3.5 text-emerald-600" />, prompt: '5 கி.மீ சுற்றளவில் ஆட்கள்' },
          { title: 'வேலை உருவாக்கம்', icon: <Plus className="w-3.5 h-3.5 text-indigo-600" />, prompt: 'பெயிண்டர் வேலை உருவாக்க உதவு' }
        ];
      }
      if (activeLangFilter === 'hi') {
        return [
          { title: 'कुशल श्रमिक', icon: <Briefcase className="w-3.5 h-3.5 text-sky-600" />, prompt: 'मेरे पास प्लंबर खोजें' },
          { title: 'रेटिंग', icon: <Star className="w-3.5 h-3.5 text-amber-500" />, prompt: 'उच्च रेटिंग वाले इलेक्ट्रीशियन चाहिए' },
          { title: 'दायरा', icon: <MapPin className="w-3.5 h-3.5 text-emerald-600" />, prompt: '5 किमी के दायरे में श्रमिक' },
          { title: 'कार्य निर्माण', icon: <Plus className="w-3.5 h-3.5 text-indigo-600" />, prompt: 'पेंटर कार्य पोस्ट करने में सहायता करें' }
        ];
      }
      if (activeLangFilter === 'te') {
        return [
          { title: 'కార్మికులు', icon: <Briefcase className="w-3.5 h-3.5 text-sky-600" />, prompt: 'నా దగ్గర ప్లంబర్లను చూపించండి' },
          { title: 'రేటింగ్', icon: <Star className="w-3.5 h-3.5 text-amber-500" />, prompt: 'అధిక రేటింగ్ ఉన్న ఎలక్ట్రీషియన్ కావాలి' },
          { title: 'పరిధి', icon: <MapPin className="w-3.5 h-3.5 text-emerald-600" />, prompt: '5 కి.మీ పరిధిలో కార్మికులు' },
          { title: 'జాబ్ పోస్ట్', icon: <Plus className="w-3.5 h-3.5 text-indigo-600" />, prompt: 'పెయింటర్ జాబ్ పోస్ట్ చేయడానికి సహాయం చేయండి' }
        ];
      }
      return [
        { title: 'Verified Talent', icon: <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />, prompt: 'Find verified electricians near me' },
        { title: 'Proximity', icon: <MapPin className="w-3.5 h-3.5 text-emerald-600" />, prompt: 'Find workers within 5 km' },
        { title: 'Smart Creator', icon: <Plus className="w-3.5 h-3.5 text-indigo-600" />, prompt: 'Help me create a painter job in Chennai' },
        { title: 'Top Rated', icon: <Star className="w-3.5 h-3.5 text-amber-500" />, prompt: 'Find top-rated plumbers' }
      ];
    } else {
      if (activeLangFilter === 'ta') {
        return [
          { title: 'திறன் வேலைகள்', icon: <Briefcase className="w-3.5 h-3.5 text-sky-600" />, prompt: 'என் திறன்களுக்கு ஏற்ற வேலைகள்' },
          { title: 'அருகில்', icon: <MapPin className="w-3.5 h-3.5 text-emerald-600" />, prompt: '5 கி.மீ சுற்றளவில் உள்ள வேலைகள்' },
          { title: 'நாளை ஷிப்ட்', icon: <Clock className="w-3.5 h-3.5 text-amber-500" />, prompt: 'நாளை கிடைக்கும் வேலைகளைக் காட்டு' },
          { title: 'திறன் வளர்ச்சி', icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />, prompt: 'நான் என்ன திறன்களைக் கற்க வேண்டும்?' }
        ];
      }
      if (activeLangFilter === 'hi') {
        return [
          { title: 'कौशल कार्य', icon: <Briefcase className="w-3.5 h-3.5 text-sky-600" />, prompt: 'मेरे कौशल से मेल खाते काम दिखाएं' },
          { title: 'पास में', icon: <MapPin className="w-3.5 h-3.5 text-emerald-600" />, prompt: '5 किमी के दायरे में काम' },
          { title: 'कल की शिफ्ट', icon: <Clock className="w-3.5 h-3.5 text-amber-500" />, prompt: 'कल उपलब्ध काम खोजें' },
          { title: 'कौशल रुझान', icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />, prompt: 'मुझे अधिक कमाने के लिए कौन से कौशल सीखने चाहिए?' }
        ];
      }
      if (activeLangFilter === 'te') {
        return [
          { title: 'నైపుణ్య పనులు', icon: <Briefcase className="w-3.5 h-3.5 text-sky-600" />, prompt: 'నా నైపుణ్యాలకు సరిపోయే పనులు చూపించు' },
          { title: 'సమీపంలో', icon: <MapPin className="w-3.5 h-3.5 text-emerald-600" />, prompt: '5 కి.మీ పరిధిలో పనులు' },
          { title: 'రేపటి షిఫ్ట్', icon: <Clock className="w-3.5 h-3.5 text-amber-500" />, prompt: 'రేపు అందుబాటులో ఉన్న పనులు' },
          { title: 'నైపుణ్యాల డిమాండ్', icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />, prompt: 'ఎక్కువ సంపాదించడానికి నేను ఏ నైపుణ్యాలు నేర్చుకోవాలి?' }
        ];
      }
      return [
        { title: 'Smart Match', icon: <Sparkles className="w-3.5 h-3.5 text-sky-600" />, prompt: 'Show jobs matching my skills' },
        { title: 'Nearby Gigs', icon: <MapPin className="w-3.5 h-3.5 text-emerald-600" />, prompt: 'Find plumbers near me' },
        { title: 'Tomorrow', icon: <Clock className="w-3.5 h-3.5 text-amber-500" />, prompt: 'Find jobs available tomorrow' },
        { title: 'Skill Trends', icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />, prompt: 'What skills should I learn to earn more?' }
      ];
    }
  }, [isRecruiter, activeLangFilter]);

  const isWelcomeOnly = messages.length === 1 && messages[0].id.startsWith('welcome_');

  return (
    <>
      {/* 1. Floating Launcher Button (Fixed at Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[999]">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setHasUnread(false);
            }}
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #4338ca 100%)' }}
            className="group relative flex items-center gap-3 px-4 py-3 text-white font-semibold rounded-full shadow-2xl shadow-sky-600/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-sky-300/40 cursor-pointer"
            aria-label="Open Talent2Task AI Assistant"
          >
            {/* Glowing green online pulse ring */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>

            {/* Avatar icon */}
            <div className="relative p-1.5 bg-white/20 rounded-full border border-white/30 group-hover:rotate-12 transition-transform duration-300">
              <Bot className="w-5 h-5 text-white" />
            </div>

            <div className="text-left leading-tight hidden xs:block">
              <div className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                <span>Talent2Task AI</span>
                <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300 animate-pulse" />
              </div>
              <div className="text-[10px] text-sky-100 font-medium opacity-90">
                {isRecruiter ? 'Hiring & Benchmark Engine' : 'Hyperlocal Jobs & Skills'}
              </div>
            </div>

            {hasUnread && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse ring-2 ring-white" />
            )}
          </button>
        </div>
      )}

      {/* 2. Compact Portrait Rectangle Pop-up Window (Fixed at Right Bottom Corner) */}
      {isOpen && (
        <div 
          id="talent2task-ai-modal"
          className={`fixed z-[9999] transition-all duration-300 ease-out flex flex-col bg-white shadow-2xl rounded-3xl border border-slate-300 overflow-hidden font-sans bottom-4 right-4 sm:bottom-6 sm:right-6 ${
            isMinimized
              ? 'w-72 h-14'
              : 'w-[calc(100vw-32px)] max-w-[400px] h-[580px] max-h-[85vh]'
          }`}
          style={
            isMinimized
              ? { width: '280px', height: '56px' }
              : {
                  width: 'min(400px, calc(100vw - 32px))',
                  maxWidth: '400px',
                  height: 'min(580px, calc(100vh - 100px))',
                  maxHeight: '85vh',
                  boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(15, 23, 42, 0.12)'
                }
          }
        >
          {/* Header - Clean with No "Gemini 3.6" text and instant language switching */}
          <div 
            className="px-4 py-3 text-white flex items-center justify-between shadow-md select-none shrink-0"
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #4338ca 100%)' }}
          >
            <div className="flex items-center gap-2.5">
              {/* Avatar with speaking wave or online dot */}
              <div className="relative p-1.5 bg-white/20 rounded-xl border border-white/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
                {speakingMsgId ? (
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 border-2 border-sky-900"></span>
                  </span>
                ) : (
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-sky-900"></span>
                  </span>
                )}
              </div>

              <div>
                <div className="text-xs sm:text-sm font-bold tracking-wide flex items-center gap-1.5 text-white">
                  <span>Talent2Task AI</span>
                </div>
                <div className="text-[10px] text-sky-100/90 flex items-center gap-1 font-medium">
                  {speakingMsgId ? (
                    <span className="text-amber-200 font-semibold flex items-center gap-1 animate-pulse">
                      <Volume2 className="w-3 h-3" />
                      Reading aloud...
                    </span>
                  ) : (
                    <span>Hyperlocal • Multi-turn Memory</span>
                  )}
                </div>
              </div>
            </div>

            {/* Top Bar Controls */}
            <div className="flex items-center gap-1.5">
              {/* Language Selector Dropdown - Instant auto change */}
              <select
                value={activeLangFilter}
                onChange={(e) => {
                  const newLang = e.target.value as Language;
                  translateMessagesToLanguage(newLang);
                }}
                className="bg-sky-900/60 hover:bg-sky-900/80 text-white text-[11px] font-bold rounded-lg px-2 py-1 border border-white/30 outline-none transition-colors cursor-pointer appearance-none text-center"
                title="Select Assistant Language"
              >
                <option value="en" className="bg-slate-800 text-white font-medium">EN</option>
                <option value="ta" className="bg-slate-800 text-white font-medium">தமிழ் (TA)</option>
                <option value="te" className="bg-slate-800 text-white font-medium">తెలుగు (TE)</option>
                <option value="hi" className="bg-slate-800 text-white font-medium">हिन्दी (HI)</option>
              </select>

              {/* ＋ New Chat Button */}
              <button
                type="button"
                onClick={handleResetChat}
                title="Start new chat"
                className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Minimize */}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  voiceService.reset();
                  setIsVoiceRecording(false);
                  setLiveTranscript('');
                  setVoiceDuration(0);
                  setShowVoicePresets(false);
                  setIsOpen(false);
                }}
                title="Close chat"
                className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!isMinimized && (
            <>
              {/* Message List & Scroll Area */}
              <div 
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-100/70 text-xs relative"
              >
                {/* Centered Welcome Hero & Interactive Prompt Chips (when 1 message) */}
                {isWelcomeOnly && (
                  <div className="py-2 px-1 space-y-3 animate-fadeIn">
                    <div className="text-center space-y-1">
                      <div 
                        className="inline-flex p-2.5 rounded-2xl text-white shadow-md"
                        style={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)' }}
                      >
                        <Bot className="w-6 h-6" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                        {activeLangFilter === 'ta'
                          ? 'Talent2Task AI வழிகாட்டிக்கு நல்வரவு!'
                          : activeLangFilter === 'hi'
                          ? 'Talent2Task AI सहायक में आपका स्वागत है!'
                          : activeLangFilter === 'te'
                          ? 'Talent2Task AI సహాయకుడికి స్వాగతం!'
                          : 'How can Talent2Task AI assist you today?'}
                      </h3>
                      <p className="text-[10px] text-slate-600 max-w-xs mx-auto">
                        {activeLangFilter === 'ta'
                          ? (isRecruiter
                              ? 'சரிபார்க்கப்பட்ட பணியாளர்களை நியமிக்கவும், மாவட்ட ஊதியங்களை ஒப்பிடவும், உடனுக்குடன் வேலைகளை அறிவிக்கவும்.'
                              : 'உங்கள் ஜிபிஎஸ் அருகிலுள்ள வேலைகளைக் கண்டறியவும், சிறந்த திறன்களைக் கண்காணிக்கவும்.')
                          : activeLangFilter === 'hi'
                          ? (isRecruiter
                              ? 'सत्यापित प्रतिभा को काम पर रखें, जिला मजदूरी को बेंचमार्क करें और तुरंत कार्य पोस्ट करें।'
                              : 'जीपीएस के पास कार्य खोजें, मैच स्कोर बढ़ाएं और शीर्ष कौशल ट्रैक करें।')
                          : activeLangFilter === 'te'
                          ? (isRecruiter
                              ? 'ధృవీకరించబడిన ప్రతిభను నియమించండి, జిల్లా వేతనాలను సరిపోల్చండి మరియు తక్షణమే పనులను పోస్ట్ చేయండి.'
                              : 'మీ జీపీఎస్ దగ్గర పనులను కనుగొనండి, మ్యాచ్ స్కోర్‌ను పెంచుకోండి మరియు నైపుణ్యాలను ట్రాక్ చేయండి.')
                          : (isRecruiter
                              ? 'Hire verified talent, benchmark district wages, and prepare instant job broadcasts.'
                              : 'Discover verified shifts near your GPS radar, boost match scores, and track top skills.')}
                      </p>
                    </div>

                    {/* Quick Launch Cards Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {promptCategories.map((cat, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(cat.prompt)}
                          className="text-left p-2.5 bg-white hover:bg-sky-50 border border-slate-300 hover:border-sky-500 rounded-xl transition-all shadow-xs hover:shadow-md group cursor-pointer flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-700 group-hover:text-sky-800 flex items-center gap-1">
                              {cat.icon}
                              {cat.title}
                            </span>
                            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-0.5" />
                          </div>
                          <div className="text-[11px] font-medium text-slate-900 group-hover:text-sky-900 line-clamp-2 leading-snug">
                            "{cat.prompt}"
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Stream */}
                {messages.map((msg, index) => {
                  const isAssistant = msg.sender === 'assistant';
                  const isSpeakingThis = speakingMsgId === msg.id;
                  const isCopiedThis = copiedMsgId === msg.id;
                  const isExpandedThis = !!expandedBreakdowns[msg.id];

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} animate-fadeIn`}
                    >
                      <div
                        className={`max-w-[94%] rounded-2xl p-3 shadow-xs break-words transition-all ${
                          isAssistant
                            ? isSpeakingThis
                              ? 'bg-white text-slate-900 border-2 border-sky-500 shadow-md ring-2 ring-sky-200 rounded-tl-xs'
                              : 'bg-white text-slate-900 border border-slate-300 rounded-tl-xs'
                            : 'text-white rounded-tr-xs shadow-md'
                        }`}
                        style={!isAssistant ? { background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)' } : undefined}
                      >
                        {/* Assistant Header Tag */}
                        {isAssistant && (
                          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200 text-[10px] font-bold text-sky-800">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-sky-600 fill-sky-600" />
                              <span>Talent2Task AI</span>
                              {msg.detectedLanguage && msg.detectedLanguage !== 'en' && (
                                <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 uppercase font-extrabold text-[8px] border border-sky-300">
                                  {msg.detectedLanguage}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-500 font-normal">
                              {msg.timestamp}
                            </span>
                          </div>
                        )}

                        {/* Rich Markdown Formatted Text */}
                        <div className="leading-relaxed">
                          <MarkdownRenderer content={msg.text} isUser={!isAssistant} />
                        </div>

                        {/* Smart Matched Gig Cards */}
                        {msg.jobCards && msg.jobCards.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-2">
                            <div className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                              <span>{activeLangFilter === 'ta' ? 'பொருந்திய வேலைகள்' : activeLangFilter === 'hi' ? 'मैच किए गए कार्य' : activeLangFilter === 'te' ? 'సరిపోలిన పనులు' : 'Matched Hyperlocal Gigs'}</span>
                              <span className="text-sky-700 font-bold">{msg.jobCards.length} {activeLangFilter === 'ta' ? 'கிடைக்கிறது' : activeLangFilter === 'hi' ? 'उपलब्ध' : activeLangFilter === 'te' ? 'అందుబాటులో ఉంది' : 'Available'}</span>
                            </div>
                            {msg.jobCards.map((job) => (
                              <div 
                                key={job.id}
                                className="p-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-300 hover:border-sky-400 rounded-xl transition-all shadow-xs space-y-2"
                              >
                                <div className="flex items-start justify-between gap-1.5">
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-slate-900 truncate">
                                      {job.title}
                                    </div>
                                    <div className="text-[10px] text-slate-600 flex items-center gap-1.5 mt-0.5 font-medium">
                                      <span className="text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                                        ₹{job.payout_amount}/{job.payout_unit || 'shift'}
                                      </span>
                                      <span className="flex items-center gap-0.5 truncate">
                                        <MapPin className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                                        {job.landmark_area || job.city}
                                      </span>
                                      {job.distanceKm !== undefined && (
                                        <span className="text-sky-800 font-semibold shrink-0">
                                          {job.distanceKm.toFixed(1)} km
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {job.matchScore && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[9px] shrink-0">
                                      {job.matchScore}% Match
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200">
                                  <button
                                    type="button"
                                    onClick={() => onSelectJob(job)}
                                    className="flex-1 py-1 px-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                                  >
                                    <span>{activeLangFilter === 'ta' ? 'விவரங்களைக் காண்க' : activeLangFilter === 'hi' ? 'विवरण देखें' : activeLangFilter === 'te' ? 'వివరాలు చూడండి' : 'View Details'}</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>

                                  {onClaimJob && job.status === 'OPEN' && !job.claimed_by && (
                                    <button
                                      type="button"
                                      onClick={() => onClaimJob(job.id)}
                                      className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-xs cursor-pointer"
                                    >
                                      {activeLangFilter === 'ta' ? 'விண்ணப்பிக்கவும்' : activeLangFilter === 'hi' ? 'स्वीकार करें' : activeLangFilter === 'te' ? 'క్లెయిమ్ చేయండి' : 'Claim Shift'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Smart Verified Worker Cards */}
                        {msg.workerCards && msg.workerCards.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-2">
                            <div className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                              <span>{activeLangFilter === 'ta' ? 'சரிபார்க்கப்பட்ட பணியாளர்கள்' : activeLangFilter === 'hi' ? 'सत्यापित उम्मीदवार' : activeLangFilter === 'te' ? 'ధృవీకరించబడిన కార్మికులు' : 'Verified Candidates'}</span>
                              <span className="text-sky-700 font-bold">{msg.workerCards.length} {activeLangFilter === 'ta' ? 'கண்டறியப்பட்டது' : activeLangFilter === 'hi' ? 'मिले' : activeLangFilter === 'te' ? 'కనుగొనబడింది' : 'Found'}</span>
                            </div>
                            {msg.workerCards.map((w) => (
                              <div 
                                key={w.id}
                                className="p-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-300 hover:border-sky-400 rounded-xl transition-all shadow-xs space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                      {w.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                                        <span>{w.name}</span>
                                        <ShieldCheck className="w-3.5 h-3.5 text-sky-600 fill-sky-100" />
                                      </div>
                                      <div className="text-[10px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                                        <span className="flex items-center text-amber-800 font-bold bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 mr-0.5" />
                                          {w.rating?.toFixed(1) || '4.9'}
                                        </span>
                                        <span>•</span>
                                        <span>{w.city || 'Tamil Nadu'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => onOpenPostJob({ category: w.skills[0] || 'Helper', skills: w.skills })}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
                                  >
                                    {activeLangFilter === 'ta' ? 'பணியமர்த்து' : activeLangFilter === 'hi' ? 'नियुक्त करें' : activeLangFilter === 'te' ? 'నియమించండి' : 'Hire'}
                                  </button>
                                </div>

                                <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200">
                                  {(w.skills || []).slice(0, 3).map((sk, skIdx) => (
                                    <span key={skIdx} className="px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-800 font-medium text-[9px] border border-slate-300">
                                      {sk}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Collapsible 6-Factor Hybrid Match Breakdown */}
                        {msg.explanationBreakdown && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200">
                            <button
                              type="button"
                              onClick={() => setExpandedBreakdowns(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                              className="w-full flex items-center justify-between text-[10px] font-bold text-sky-800 hover:text-sky-900 bg-sky-100/70 hover:bg-sky-200/70 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer border border-sky-300"
                            >
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-sky-600" />
                                <span>{activeLangFilter === 'ta' ? 'ஏன் இந்த பொருத்தம்? (6-காரணி AI விளக்கம்)' : activeLangFilter === 'hi' ? 'यह मैच क्यों? (6-कारक AI विश्लेषण)' : activeLangFilter === 'te' ? 'ఈ సరిపోలిక ఎందుకు? (6-కారకాల AI వివరణ)' : 'Why this match? (6-Factor AI Breakdown)'}</span>
                              </span>
                              {isExpandedThis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {isExpandedThis && (
                              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-[10px] space-y-2 animate-fadeIn">
                                <div className="grid grid-cols-2 gap-1.5">
                                  <div className="p-1.5 bg-white rounded-lg border border-slate-300">
                                    <div className="text-slate-600 text-[9px]">{activeLangFilter === 'ta' ? 'திறன் பொருத்தம் (40%)' : activeLangFilter === 'hi' ? 'कौशल मैच (40%)' : activeLangFilter === 'te' ? 'నైపుణ్య సరిపోలిక (40%)' : 'Semantic Skills (40%)'}</div>
                                    <div className="text-xs font-bold text-sky-700">{msg.explanationBreakdown.semanticSkill}%</div>
                                  </div>
                                  <div className="p-1.5 bg-white rounded-lg border border-slate-300">
                                    <div className="text-slate-600 text-[9px]">{activeLangFilter === 'ta' ? 'அருகாமை (20%)' : activeLangFilter === 'hi' ? 'निकटता (20%)' : activeLangFilter === 'te' ? 'దగ్గరతనం (20%)' : 'Proximity (20%)'}</div>
                                    <div className="text-xs font-bold text-emerald-700">{msg.explanationBreakdown.distance}%</div>
                                  </div>
                                  <div className="p-1.5 bg-white rounded-lg border border-slate-300">
                                    <div className="text-slate-600 text-[9px]">{activeLangFilter === 'ta' ? 'கிடைக்கும் நேரம் (15%)' : activeLangFilter === 'hi' ? 'उपलब्धता (15%)' : activeLangFilter === 'te' ? 'లభ్యత (15%)' : 'Availability (15%)'}</div>
                                    <div className="text-xs font-bold text-indigo-700">{msg.explanationBreakdown.availability}%</div>
                                  </div>
                                  <div className="p-1.5 bg-white rounded-lg border border-slate-300">
                                    <div className="text-slate-600 text-[9px]">{activeLangFilter === 'ta' ? 'அனுபவம் (10%)' : activeLangFilter === 'hi' ? 'अनुभव (10%)' : activeLangFilter === 'te' ? 'అనుభవం (10%)' : 'Experience (10%)'}</div>
                                    <div className="text-xs font-bold text-amber-700">{msg.explanationBreakdown.experience}%</div>
                                  </div>
                                </div>
                                <div className="text-center font-bold text-slate-800 pt-1 border-t border-slate-200">
                                  {activeLangFilter === 'ta' ? 'மொத்த மதிப்பெண்:' : activeLangFilter === 'hi' ? 'कुल स्कोर:' : activeLangFilter === 'te' ? 'మొత్తం స్కోర్:' : 'Overall Score:'} <span className="text-sky-700 font-extrabold">{msg.explanationBreakdown.totalScore}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Interactive Action Buttons */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                            {msg.actions.map((act, i) => {
                              const isDanger = act.variant === 'danger';
                              const isSuccess = act.variant === 'success';
                              const isOutline = act.variant === 'outline';
                              
                              const btnClasses = isDanger
                                ? 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300 font-bold'
                                : isSuccess
                                ? 'bg-emerald-100 hover:emerald-200 text-emerald-800 border-emerald-300 font-bold'
                                : isOutline
                                ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 font-medium'
                                : 'bg-sky-100 hover:bg-sky-200 text-sky-800 border-sky-300 font-bold';

                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => executeAction(act, false)}
                                  className={`px-2.5 py-1 border rounded-lg text-[10px] transition-all flex items-center gap-1 shadow-xs cursor-pointer ${btnClasses}`}
                                >
                                  <span>{act.label}</span>
                                  <ArrowRight className={`w-3 h-3 ${isDanger ? 'text-red-700' : isSuccess ? 'text-emerald-700' : 'text-sky-700'}`} />
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Suggested Follow-up Prompts */}
                        {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                          <div className="mt-2 pt-1.5 border-t border-slate-200 space-y-1">
                            <div className="text-[9px] font-bold text-slate-500 uppercase">{activeLangFilter === 'ta' ? 'பரிந்துரைக்கப்பட்டவை:' : activeLangFilter === 'hi' ? 'सुझावित:' : activeLangFilter === 'te' ? 'సూచించబడినవి:' : 'SUGGESTED:'}</div>
                            <div className="flex flex-wrap gap-1">
                              {msg.suggestedFollowUps.map((fu, fuIdx) => (
                                <button
                                  key={fuIdx}
                                  type="button"
                                  onClick={() => handleSend(fu)}
                                  className="px-2 py-0.5 bg-slate-100 hover:bg-sky-100 text-slate-800 hover:text-sky-900 rounded-md text-[9px] font-medium border border-slate-300 transition-colors cursor-pointer"
                                >
                                  ✨ {fu}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Bar (Read Aloud, Copy, Regenerate) */}
                        {isAssistant && !msg.id.startsWith('welcome_') && (
                          <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-slate-500 text-[10px]">
                            <div className="flex items-center gap-1.5">
                              {/* Read Aloud Button */}
                              <button
                                type="button"
                                onClick={() => toggleReadAloud(msg.id, msg.text, msg.detectedLanguage)}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer border ${
                                  isSpeakingThis 
                                    ? 'bg-amber-100 text-amber-900 font-bold border-amber-300' 
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                                }`}
                                title={isSpeakingThis ? (isTtsPaused ? 'Resume speaking' : 'Pause speech') : 'Read response aloud'}
                              >
                                {isSpeakingThis ? (
                                  isTtsPaused ? (
                                    <>
                                      <Play className="w-2.5 h-2.5 text-amber-700 fill-amber-700" />
                                      <span>{activeLangFilter === 'ta' ? 'தொடர்' : activeLangFilter === 'hi' ? 'पुनः शुरू' : activeLangFilter === 'te' ? 'కొనసాగించు' : 'Resume'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Pause className="w-2.5 h-2.5 text-amber-700" />
                                      <span>{activeLangFilter === 'ta' ? 'நிறுத்து' : activeLangFilter === 'hi' ? 'रोकें' : activeLangFilter === 'te' ? 'ఆపు' : 'Pause'}</span>
                                    </>
                                  )
                                ) : (
                                  <>
                                    <Volume2 className="w-2.5 h-2.5" />
                                    <span>{activeLangFilter === 'ta' ? 'வாசித்துக் காட்டு' : activeLangFilter === 'hi' ? 'बोलकर सुनाएं' : activeLangFilter === 'te' ? 'చదివి వినిపించండి' : 'Read Aloud'}</span>
                                  </>
                                )}
                              </button>

                              {/* Copy Button */}
                              <button
                                type="button"
                                onClick={() => handleCopyText(msg.id, msg.text)}
                                className="flex items-center gap-1 hover:text-slate-900 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                title="Copy message"
                              >
                                {isCopiedThis ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                                    <span className="text-emerald-700 font-medium">{activeLangFilter === 'ta' ? 'நகலெடுக்கப்பட்டது' : activeLangFilter === 'hi' ? 'कॉपी किया गया' : activeLangFilter === 'te' ? 'కాపీ చేయబడింది' : 'Copied!'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-2.5 h-2.5" />
                                    <span>{activeLangFilter === 'ta' ? 'நகலெடு' : activeLangFilter === 'hi' ? 'कॉपी' : activeLangFilter === 'te' ? 'కాపీ' : 'Copy'}</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Regenerate Button */}
                            <button
                              type="button"
                              onClick={() => handleRegenerate(index)}
                              className="flex items-center gap-1 hover:text-sky-800 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                              title="Regenerate this response"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>{activeLangFilter === 'ta' ? 'மறுஉருவாக்கு' : activeLangFilter === 'hi' ? 'पुनः बनाएं' : activeLangFilter === 'te' ? 'మళ్లీ సృష్టించు' : 'Regenerate'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Timestamp for user messages */}
                      {!isAssistant && (
                        <span className="text-[9px] text-slate-500 mt-1 px-1">
                          {msg.timestamp}
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Progressive Thinking Indicator */}
                {isTyping && <ThinkingStepIndicator language={activeLangFilter} />}

                {/* Invisible Anchor for Auto Scroll */}
                <div ref={messagesEndRef} />

                {/* Floating "Scroll to Bottom" badge if user scrolled up */}
                {showScrollBottomButton && (
                  <button
                    type="button"
                    onClick={() => scrollToBottom('smooth')}
                    className="sticky bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white rounded-full text-xs font-semibold shadow-xl flex items-center gap-1.5 hover:bg-slate-800 transition-all cursor-pointer animate-fadeIn"
                  >
                    <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                    <span>New messages</span>
                  </button>
                )}
              </div>

              {/* Voice Recording Active Floating Overlay Bar with Live Caption Subtitle */}
              {isVoiceRecording && (
                <div className="p-3 bg-gradient-to-r from-rose-50 via-rose-50/90 to-amber-50/60 border-t-2 border-rose-400 flex flex-col gap-2 shrink-0 animate-fadeIn shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 shadow-xs"></span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-rose-950 tracking-wide uppercase">
                          {activeLangFilter === 'ta' ? 'குரல் பதிவு நடக்கிறது' : activeLangFilter === 'hi' ? 'आवाज रिकॉर्डिंग जारी है' : activeLangFilter === 'te' ? 'వాయిస్ రికార్డింగ్ జరుగుతోంది' : 'Live Voice Recording'}
                        </span>
                        <span className="font-mono text-[11px] bg-rose-200/90 text-rose-950 font-extrabold px-2 py-0.5 rounded-full border border-rose-300 shadow-2xs">
                          {formatSeconds(voiceDuration)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          voiceService.stopListening();
                          setIsVoiceRecording(false);
                          setLiveTranscript('');
                          setVoiceDuration(0);
                          setTimeout(() => inputRef.current?.focus(), 150);
                        }}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{activeLangFilter === 'ta' ? 'முடிந்தது' : activeLangFilter === 'hi' ? 'पूर्ण' : activeLangFilter === 'te' ? 'పూర్తయింది' : 'Done'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          voiceService.reset();
                          setIsVoiceRecording(false);
                          setLiveTranscript('');
                          setVoiceDuration(0);
                          setTimeout(() => inputRef.current?.focus(), 150);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                        title="Cancel recording"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Live Caption Display in Small Letters Below Timer */}
                  <div className="px-2.5 py-1.5 bg-white/90 rounded-xl border border-rose-200 text-[11px] leading-relaxed shadow-2xs">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-rose-700/80 mb-0.5 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-rose-600" />
                      <span>{activeLangFilter === 'ta' ? 'நேரடி வசனம் (லைவ் கேப்ஷன்):' : activeLangFilter === 'hi' ? 'लाइव कैप्शन:' : activeLangFilter === 'te' ? 'లైవ్ క్యాప్షన్:' : 'Live Caption:'}</span>
                    </div>
                    <div className="text-slate-800 font-medium break-words min-h-[18px]">
                      {liveTranscript ? (
                        <span className="text-slate-950 font-semibold">{liveTranscript}</span>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">
                          {activeLangFilter === 'ta'
                            ? 'உங்கள் கோரிக்கையை தமிழில் பேசுங்கள் (இடைவெளி விட்டாலும் பதிவு தொடரும்)...'
                            : activeLangFilter === 'hi'
                            ? 'कृपया बोलें (रुकने पर भी रिकॉर्डिंग जारी रहेगी)...'
                            : activeLangFilter === 'te'
                            ? 'దయచేసి మాట్లాడండి (విరామం ఇచ్చినా రికార్డింగ్ కొనసాగుతుంది)...'
                            : 'Speak your query naturally (recording continues across pauses)...'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Voice Presets Dropdown Popover */}
              {showVoicePresets && (
                <div className="p-2.5 bg-white border-t border-slate-300 shadow-xl space-y-1.5 shrink-0 animate-fadeIn max-h-44 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>{activeLangFilter === 'ta' ? 'குரல் மாதிரி சோதனைகள்' : activeLangFilter === 'hi' ? 'आवाज परीक्षण प्रीसेट' : activeLangFilter === 'te' ? 'వాయిస్ టెస్ట్ ప్రీసెట్లు' : '1-Click Voice Test Presets'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowVoicePresets(false)}
                      className="text-slate-500 hover:text-slate-800 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {SAMPLE_VOICE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p.id)}
                        className="text-left p-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 border border-slate-300 hover:border-sky-400 transition-all text-[11px] group cursor-pointer flex items-center justify-between"
                      >
                        <div className="truncate mr-2">
                          <span className="font-bold text-slate-900 group-hover:text-sky-900 block text-[10px]">
                            {p.label}
                          </span>
                          <span className="text-[10px] text-slate-600 truncate block italic">
                            "{p.transcript}"
                          </span>
                        </div>
                        <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-slate-200 text-slate-700 font-bold shrink-0">
                          {p.language}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Bar with Voice & Send */}
              <div className="p-2 sm:p-2.5 bg-slate-100 border-t border-slate-300 flex items-center gap-1.5 shrink-0">
                {/* Voice Input Mic Button */}
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  title={isVoiceRecording ? 'Stop recording' : 'Speak your request'}
                  className={`p-2 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer ${
                    isVoiceRecording
                      ? 'bg-rose-600 text-white shadow-rose-600/40 ring-2 ring-rose-300 animate-pulse'
                      : 'bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-300 hover:border-sky-400'
                  }`}
                >
                  {isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Sample voice presets toggle */}
                <button
                  type="button"
                  onClick={() => setShowVoicePresets(!showVoicePresets)}
                  title="Voice simulation presets"
                  className="px-2 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 hover:border-slate-400 transition-colors shrink-0 text-[10px] font-bold cursor-pointer"
                >
                  {activeLangFilter === 'ta' ? 'மாதிரிகள்' : activeLangFilter === 'hi' ? 'प्रीसेट' : activeLangFilter === 'te' ? 'ప్రీసెట్లు' : 'Presets'}
                </button>

                {/* Text input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    activeLangFilter === 'ta'
                      ? 'வேலை, திறன்கள் அல்லது ஆட்களைப் பற்றி கேளுங்கள்...'
                      : activeLangFilter === 'hi'
                      ? 'काम, कौशल या श्रमिकों के बारे में पूछें...'
                      : activeLangFilter === 'te'
                      ? 'పని, నైపుణ్యాలు లేదా కార్మికుల గురించి అడగండి...'
                      : 'Ask about local gigs, workers, skills, or wages...'
                  }
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 focus:border-sky-600 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
                />

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputQuery.trim() || isTyping}
                  className="p-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:hover:bg-sky-600 text-white rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
