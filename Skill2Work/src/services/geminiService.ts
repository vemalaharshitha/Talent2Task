import fs from 'fs';
import path from 'path';
import { autoTranslateString, detectLanguageFromScript, hasIndicCharacters } from '../i18n/autoTranslate.ts';

/**
 * Reusable Backend Gemini Service for Live Multilingual Translation,
 * Language Detection, and Text Processing.
 * 
 * IMPORTANT: This file runs on the backend (Vite middleware / Node.js server).
 * The GEMINI_API_KEY is read securely from environment/.env and NEVER exposed to frontend clients.
 */

// Helper to load GEMINI_API_KEY from process.env or .env file
function getGeminiApiKey(): string {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }

  // Fallback: Read .env from project root if not already populated in process.env
  try {
    const cwd = process.cwd();
    const dir = import.meta.dirname || cwd;
    const envPaths = [
      path.join(cwd, '.env'),
      path.join(cwd, 'Talent2Task', 'Skill2Work', 'Skill2Work', '.env'),
      path.resolve(dir, '../../.env'),
      path.resolve(dir, '../../../.env')
    ];

    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const match = content.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m);
        if (match && match[1]) {
          const key = match[1].trim().replace(/^["']|["']$/g, '');
          if (key) {
            process.env.GEMINI_API_KEY = key;
            return key;
          }
        }
      }
    }
  } catch (e) {
    console.warn('[GeminiService] Could not read .env file:', e);
  }

  return 'AQ.Ab8RN6KgA4iByw13__efjczYVBa-uykgnshYGYjApIvxvzJW9g';
}

function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-3.6-flash';
}

// In-memory backend cache for fast recurring lookups
const backendTranslationCache = new Map<string, string>();
const backendMultiCache = new Map<string, Record<string, string>>();

const SUPPORTED_LANGUAGES = ['en', 'ta', 'te', 'hi'] as const;
type SupportedLang = typeof SUPPORTED_LANGUAGES[number];

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  hi: 'Hindi (हिन्दी)'
};

// Cooldown timestamp for API quota limit to avoid latency & console spam
let quotaCooldownUntil = 0;

/**
 * Call Gemini API with automatic model fallback
 */
async function callGeminiRaw(prompt: string, expectJson: boolean = false): Promise<string> {
  if (Date.now() < quotaCooldownUntil) {
    throw new Error('Gemini API quota currently in cooldown, utilizing instant offline translation engine');
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const primaryModel = getGeminiModel();
  const modelsToTry = [
    primaryModel,
    'gemini-2.5-flash',
    'gemini-2.0-flash'
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      
      const bodyPayload: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          maxOutputTokens: 2048,
          ...(expectJson ? { responseMimeType: 'application/json' } : {})
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!res.ok) {
        if (res.status === 429) {
          // Set 30-second cooldown so subsequent requests don't delay the UI
          quotaCooldownUntil = Date.now() + 30000;
          console.warn(`[GeminiService] Free tier quota limit reached (429). Gracefully engaging instant offline local translation.`);
          throw new Error('Gemini API quota exceeded (429)');
        }
        const errorText = await res.text();
        lastError = new Error(`Gemini API error ${res.status}: ${errorText}`);
        continue; // Try next model fallback
      }

      const data: any = await res.json();
      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidate && candidate.trim()) {
        return candidate.trim();
      }
    } catch (err: any) {
      if (err?.message?.includes('429')) {
        throw err;
      }
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate content from Gemini API');
}

/**
 * Detect language of text using Gemini with fast script fallback
 */
export async function detectLanguage(text: string): Promise<SupportedLang | string> {
  if (!text || !text.trim()) return 'en';
  
  // Quick script check
  const scriptDetected = detectLanguageFromScript(text);
  if (scriptDetected !== 'en') {
    return scriptDetected;
  }

  // If text contains Romanized / Latin characters, check if Gemini can detect whether it's English, Tanglish, Hinglish, etc.
  try {
    const prompt = `Identify the ISO 639-1 language code (e.g., 'en', 'ta', 'te', 'hi') of the following text.
If it is in English, reply 'en'. If Tamil, reply 'ta'. If Telugu, reply 'te'. If Hindi, reply 'hi'.
Reply ONLY with the 2-letter code in lowercase, nothing else.

Text:
"""
${text.slice(0, 300)}
"""`;

    const result = await callGeminiRaw(prompt);
    const cleaned = result.toLowerCase().replace(/[^a-z]/g, '').slice(0, 2);
    if (SUPPORTED_LANGUAGES.includes(cleaned as SupportedLang)) {
      return cleaned as SupportedLang;
    }
  } catch (err) {
    console.warn('[GeminiService] detectLanguage fallback to script detection:', err);
  }

  return scriptDetected;
}

/**
 * Translate a single piece of text from source language to target language
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<{ text: string; source: 'gemini' | 'cache' | 'offline_fallback'; detectedLanguage: string }> {
  if (!text || !text.trim()) {
    return { text: '', source: 'cache', detectedLanguage: targetLanguage };
  }

  const trimmed = text.trim();
  let detectedLang = (sourceLanguage && sourceLanguage !== 'auto') 
    ? sourceLanguage 
    : detectLanguageFromScript(trimmed);

  if (detectedLang === 'en' && hasIndicCharacters(trimmed)) {
    detectedLang = detectLanguageFromScript(trimmed);
    if (detectedLang === 'en') detectedLang = 'te';
  }

  if (detectedLang === targetLanguage && (targetLanguage !== 'en' || !hasIndicCharacters(trimmed))) {
    return { text: trimmed, source: 'cache', detectedLanguage: detectedLang };
  }

  const cacheKey = `${detectedLang}->${targetLanguage}:${trimmed}`;
  if (backendTranslationCache.has(cacheKey)) {
    const cached = backendTranslationCache.get(cacheKey)!;
    if (targetLanguage !== 'en' || !hasIndicCharacters(cached)) {
      return {
        text: cached,
        source: 'cache',
        detectedLanguage: detectedLang
      };
    }
    backendTranslationCache.delete(cacheKey);
  }

  // Attempt live Gemini translation
  try {
    const targetName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
    const sourceName = detectedLang ? (LANGUAGE_NAMES[detectedLang] || detectedLang) : 'Auto-detect';

    const prompt = `You are a professional multilingual translation engine for Talent2Task.
Translate the provided text accurately and completely into the target language: ${targetName} (${targetLanguage}).

CRITICAL TRANSLATION RULES:
1. Translate EVERY word and sentence completely into fluent, natural ${targetName}.
2. If translating to English ('en'), ensure NO Tamil, Telugu, or Hindi words remain untranslated.
3. Preserve all specific proper names (e.g. people or district names like 'Tamil Nadu', 'Hosur', 'Chennai'), monetary amounts (e.g. ₹, Rs), numbers, shift timings, and formatting.
4. Do not include quotes, markdown wrappers, preambles, or conversational commentary. Return ONLY the direct translation.

Source Language: ${sourceName}
Target Language: ${targetName}
Text to translate:
"""
${trimmed}
"""`;

    const translated = await callGeminiRaw(prompt);
    // Strip possible wrapping quotes or backticks
    const cleaned = translated.replace(/^["'`]|["'`]$/g, '').trim();

    if (cleaned && (targetLanguage !== 'en' || !hasIndicCharacters(cleaned))) {
      backendTranslationCache.set(cacheKey, cleaned);
      return {
        text: cleaned,
        source: 'gemini',
        detectedLanguage: detectedLang
      };
    }
  } catch (err) {
    console.warn('[GeminiService] Live translation failed, trying secondary online translator:', err);
  }

  // Secondary Online Translation Fallback
  try {
    const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLanguage)}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const gRes = await fetch(gUrl);
    if (gRes.ok) {
      const gData: any = await gRes.json();
      const onlineTrans = gData[0]?.map((part: any) => part[0]).join('') || '';
      if (onlineTrans && (targetLanguage !== 'en' || !hasIndicCharacters(onlineTrans))) {
        backendTranslationCache.set(cacheKey, onlineTrans);
        return {
          text: onlineTrans,
          source: 'gemini',
          detectedLanguage: detectedLang
        };
      }
    }
  } catch (err) {
    console.warn('[GeminiService] Secondary online translation failed:', err);
  }

  // Graceful Offline Fallback
  const fallback = autoTranslateString(trimmed, targetLanguage as any, detectedLang as any);
  if (targetLanguage !== 'en' || !hasIndicCharacters(fallback)) {
    backendTranslationCache.set(cacheKey, fallback);
  }
  return {
    text: fallback,
    source: 'offline_fallback',
    detectedLanguage: detectedLang
  };
}

/**
 * Multi-target translation: Translates text into all target languages simultaneously in one shot.
 * Returns structured JSON with translations for 'en', 'ta', 'te', 'hi'.
 */
export async function translateMulti(
  text: string,
  targetLanguages: string[] = ['en', 'ta', 'te', 'hi'],
  sourceLanguage?: string
): Promise<{
  translations: Record<string, string>;
  detectedLanguage: string;
  source: 'gemini' | 'cache' | 'offline_fallback';
}> {
  if (!text || !text.trim()) {
    const emptyResult: Record<string, string> = {};
    for (const lang of targetLanguages) emptyResult[lang] = '';
    return { translations: emptyResult, detectedLanguage: 'en', source: 'cache' };
  }

  const trimmed = text.trim();
  let detectedLang = (sourceLanguage && sourceLanguage !== 'auto')
    ? sourceLanguage
    : detectLanguageFromScript(trimmed);

  if (detectedLang === 'en' && hasIndicCharacters(trimmed)) {
    detectedLang = detectLanguageFromScript(trimmed);
    if (detectedLang === 'en') detectedLang = 'te';
  }

  const cacheKey = `MULTI:${detectedLang}:${targetLanguages.sort().join(',')}:${trimmed}`;
  if (backendMultiCache.has(cacheKey)) {
    return {
      translations: backendMultiCache.get(cacheKey)!,
      detectedLanguage: detectedLang,
      source: 'cache'
    };
  }

  // Try live Gemini translation for all languages in one prompt
  try {
    const prompt = `You are a professional multilingual translation engine for the Talent2Task platform.
Translate the provided text accurately, completely, and fluently into all requested target languages: ${targetLanguages.map(l => `${LANGUAGE_NAMES[l] || l} ('${l}')`).join(', ')}.

CRITICAL RULES:
- For 'en' (English): Provide a 100% complete, natural, and fluent English translation. Ensure NO Tamil, Telugu, or Hindi words remain untranslated.
- For 'ta' (Tamil): Provide natural, grammatically correct Tamil script translation.
- For 'te' (Telugu): Provide natural, grammatically correct Telugu script translation.
- For 'hi' (Hindi): Provide natural, grammatically correct Devanagari Hindi script translation.
- Preserve all numerical values, monetary amounts (₹), phone numbers, locations, and formatting.
- Return ONLY a valid JSON object matching this schema:
{
  "detectedLanguage": "en | ta | te | hi",
  "translations": {
    ${targetLanguages.map(l => `"${l}": "complete translated text in ${LANGUAGE_NAMES[l] || l}"`).join(',\n    ')}
  }
}

Text to translate:
"""
${trimmed}
"""`;

    const jsonStr = await callGeminiRaw(prompt, true);
    // Parse JSON
    let parsed: any;
    try {
      // Find JSON block if wrapped in markdown
      const match = jsonStr.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : jsonStr);
    } catch {
      // JSON parse failed
    }

    if (parsed && parsed.translations) {
      const resTranslations: Record<string, string> = {};
      for (const lang of targetLanguages) {
        if (parsed.translations[lang] && typeof parsed.translations[lang] === 'string') {
          resTranslations[lang] = parsed.translations[lang].trim();
          if (lang !== 'en' || !hasIndicCharacters(resTranslations[lang])) {
            backendTranslationCache.set(`${detectedLang}->${lang}:${trimmed}`, resTranslations[lang]);
          }
        } else if (lang === detectedLang && (lang !== 'en' || !hasIndicCharacters(trimmed))) {
          resTranslations[lang] = trimmed;
        } else {
          resTranslations[lang] = autoTranslateString(trimmed, lang as any, detectedLang as any);
        }
      }

      backendMultiCache.set(cacheKey, resTranslations);
      return {
        translations: resTranslations,
        detectedLanguage: parsed.detectedLanguage || detectedLang,
        source: 'gemini'
      };
    }
  } catch (err) {
    console.warn('[GeminiService] Multi-translation Gemini failed, falling back to local autoTranslate:', err);
  }

  // Offline Fallback for multi
  const fallbackTranslations: Record<string, string> = {};
  for (const lang of targetLanguages) {
    if (lang === detectedLang && (lang !== 'en' || !hasIndicCharacters(trimmed))) {
      fallbackTranslations[lang] = trimmed;
    } else {
      const fallback = autoTranslateString(trimmed, lang as any, detectedLang as any);
      fallbackTranslations[lang] = fallback;
      if (lang !== 'en' || !hasIndicCharacters(fallback)) {
        backendTranslationCache.set(`${detectedLang}->${lang}:${trimmed}`, fallback);
      }
    }
  }

  backendMultiCache.set(cacheKey, fallbackTranslations);
  return {
    translations: fallbackTranslations,
    detectedLanguage: detectedLang,
    source: 'offline_fallback'
  };
}

export interface GeminiChatRequest {
  message: string;
  history?: Array<{ sender: 'user' | 'assistant'; text: string }>;
  language?: string;
  userContext?: {
    role?: 'seeker' | 'recruiter';
    name?: string;
    city?: string;
    skills?: string[];
    latitude?: number;
    longitude?: number;
  };
  platformContext?: {
    openGigsCount?: number;
    workersCount?: number;
    gigsSummary?: string;
    workersSummary?: string;
    topDemandSkills?: string[];
  };
}

export interface GeminiChatResponse {
  reply: string;
  intent: string;
  detectedLanguage: string;
  extractedParameters: {
    skill?: string | null;
    location?: string | null;
    radiusKm?: number | null;
    minExperience?: number | null;
    availability?: string | null;
    minPay?: number | null;
    maxPay?: number | null;
    isVerifiedOnly?: boolean;
  };
  actions?: Array<{
    type: string;
    label: string;
    payload?: any;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  }>;
  suggestedFollowUps?: string[];
  source: 'gemini' | 'offline_fallback';
}

/**
 * Conversational AI Assistant endpoint powered by Gemini API.
 * Understands multi-turn conversational context, extracts intent & parameters across
 * English, Tamil, Telugu, and Hindi, and responds with clean structured JSON.
 */
export async function chatWithGemini(req: GeminiChatRequest): Promise<GeminiChatResponse> {
  const { message, history = [], language = 'auto', userContext = {}, platformContext = {} } = req;
  const userMsg = message.trim();
  const detectedLang = language !== 'auto' ? language : detectLanguageFromScript(userMsg);

  // Prepare system prompt & contextual background
  const prompt = `You are Talent2Task AI, an expert, context-aware AI assistant for Talent2Task — a hyper-local informal gig and skill matching platform across Tamil Nadu (Chennai, Coimbatore, Madurai, Hosur, Vellore, Salem, Tiruchirappalli, Tirunelveli, etc.).

PLATFORM CONTEXT:
- User Role: ${userContext.role || 'Job Seeker / Recruiter'}
- User Name: ${userContext.name || 'User'}
- User City / Location: ${userContext.city || 'Tamil Nadu'}
- User Skills: ${(userContext.skills || []).join(', ') || 'General'}
- Open Gigs Available: ${platformContext.openGigsCount || 50}
- Verified Workers Registered: ${platformContext.workersCount || 100}
- Top In-Demand Skills in Market: ${(platformContext.topDemandSkills || ['Electrical', 'Plumbing', 'Delivery', 'Catering & Cooking', 'Store Helper', 'Security Guard']).join(', ')}

CONVERSATION HISTORY (Multi-turn memory):
${history.slice(-8).map(h => `${((h as any).sender || (h as any).role || 'user').toUpperCase()}: ${h.text || ''}`).join('\n')}
USER: ${userMsg}

TASK & INSTRUCTIONS:
1. Understand the user's intent across English, Tamil (தமிழ்), Telugu (తెలుగు), or Hindi (हिन्दी).
2. If the user refers to previous context (e.g. "Only with 3 years experience", "Within 5 km", "Show the best one"), retain and update the extracted parameters from the prior conversation.
3. Respond in the user's conversation language (${language !== 'auto' ? language : 'same language as query: ' + detectedLang}).
4. Use clean Markdown formatting: use bolding for emphasis (**Key Point**), bullet points for multiple items, and concise, warm, professional phrasing. Do NOT generate huge empty paragraphs.
5. Extract structured parameters for the platform matching engine:
   - intent: one of [GENERAL_CHAT, FIND_WORKER, FIND_JOB, POST_GIG, EDIT_GIG, SEARCH, LOCATION_SEARCH, SKILL_SEARCH, SKILL_GAP, DEMAND_ANALYSIS, WAGE_QUERY, PROFILE_QUERY, MATCH_QUERY, PLATFORM_HELP, FOLLOW_UP]
   - skill: canonical English skill name if mentioned (e.g., 'Plumbing', 'Electrical', 'Delivery', 'Store Helper', 'Catering & Cooking', 'Security Guard', 'Housekeeping', 'Carpentry', 'Masonry', 'Data Entry', 'Tailoring', 'Painter', 'Mechanic', 'AC Technician') or null
   - location: city/district name in Tamil Nadu if mentioned or null
   - radiusKm: radius number in km if mentioned (e.g. 5) or null
   - minExperience: years of experience requested or null
   - availability: 'today' | 'tomorrow' | 'weekend' | 'morning' | 'afternoon' | 'evening' | 'night' | 'immediate' | null
   - isVerifiedOnly: boolean
6. Suggest 2-4 contextual follow-up chips (in the response language) for immediate user selection.

Return ONLY a valid JSON object strictly matching this schema:
{
  "reply": "Your complete, natural, and helpful response text with Markdown formatting.",
  "intent": "FIND_WORKER | FIND_JOB | POST_GIG | SKILL_GAP | DEMAND_ANALYSIS | GENERAL_CHAT | etc.",
  "detectedLanguage": "en | ta | te | hi",
  "extractedParameters": {
    "skill": "Plumbing" or null,
    "location": "Chennai" or null,
    "radiusKm": 5 or null,
    "minExperience": null,
    "availability": null,
    "minPay": null,
    "maxPay": null,
    "isVerifiedOnly": false
  },
  "actions": [
    { "type": "NAVIGATE_TAB | OPEN_POST_JOB | SET_RADIUS | FILTER_JOBS | ADD_SKILL | OPEN_COMMUNITY_DEMAND", "label": "Action button text", "payload": {} }
  ],
  "suggestedFollowUps": [
    "Follow-up chip 1",
    "Follow-up chip 2"
  ]
}`;

  try {
    const rawResult = await callGeminiRaw(prompt, true);
    let parsed: any;
    try {
      const match = rawResult.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : rawResult);
    } catch {
      // json parse fallback
    }

    if (parsed && parsed.reply) {
      return {
        reply: parsed.reply,
        intent: parsed.intent || 'GENERAL_CHAT',
        detectedLanguage: parsed.detectedLanguage || detectedLang,
        extractedParameters: parsed.extractedParameters || {},
        actions: parsed.actions || [],
        suggestedFollowUps: parsed.suggestedFollowUps || [],
        source: 'gemini'
      };
    }
  } catch (err) {
    console.warn('[GeminiService] chatWithGemini API call failed:', err);
  }

  // Graceful offline fallback
  return {
    reply: detectedLang === 'ta'
      ? `நான் உங்கள் Talent2Task AI உதவியாளர். ${userMsg} தொடர்பான விவரங்களைச் சரிபார்க்கிறேன்.`
      : detectedLang === 'te'
      ? `నేను మీ Talent2Task AI సహాయకుడిని. ${userMsg} సంబంధించిన సమాచారాన్ని పరిశీలిస్తున్నాను.`
      : detectedLang === 'hi'
      ? `मैं आपका Talent2Task AI सहायक हूँ। ${userMsg} से संबंधित जानकारी की जांच कर रहा हूँ।`
      : `I'm your Talent2Task AI assistant. I'm checking the latest local data for: "${userMsg}".`,
    intent: 'GENERAL_CHAT',
    detectedLanguage: detectedLang,
    extractedParameters: {
      skill: null,
      location: null,
      radiusKm: null,
      minExperience: null,
      availability: null,
      minPay: null,
      maxPay: null,
      isVerifiedOnly: false
    },
    actions: [],
    suggestedFollowUps: ['Find Workers', 'Find Gigs Near Me', 'Check Market Demand'],
    source: 'offline_fallback'
  };
}
