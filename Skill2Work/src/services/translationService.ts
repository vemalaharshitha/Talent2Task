import type { Language } from '../types';
import { autoTranslateString, detectLanguageFromScript, hasIndicCharacters } from '../i18n/autoTranslate.ts';

/**
 * Frontend Translation Service.
 * Securely communicates with the backend /api/translate endpoint powered by Gemini API.
 * Features:
 * - In-memory and localStorage translation caching
 * - Request deduplication / in-flight promise sharing
 * - Graceful fallback to offline translation engine on network/API failure
 * - CustomEvent dispatching for live UI re-rendering
 */

const STORAGE_CACHE_KEY = 't2t_gemini_trans_cache_v2';
const memoryCache = new Map<string, string>();
const inFlightPromises = new Map<string, Promise<string>>();

// Initialize cache from localStorage, discarding any broken partial translations
try {
  const stored = localStorage.getItem(STORAGE_CACHE_KEY);
  if (stored) {
    const parsed: Record<string, string> = JSON.parse(stored);
    for (const [k, v] of Object.entries(parsed)) {
      // If cached for English but contains Indic characters, skip it
      if (k.includes('->en:') && hasIndicCharacters(v)) {
        continue;
      }
      memoryCache.set(k, v);
    }
  }
} catch {
  // localStorage might be unavailable or restricted
}

function persistCacheEntry(key: string, value: string) {
  if (!value || !value.trim()) return;
  // If target is English, do not cache broken translations that still contain Indic characters
  if (key.includes('->en:') && hasIndicCharacters(value)) {
    return;
  }

  memoryCache.set(key, value);
  try {
    const obj: Record<string, string> = {};
    let count = 0;
    for (const [k, v] of memoryCache.entries()) {
      obj[k] = v;
      count++;
      if (count > 500) break;
    }
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Detect language of given text.
 */
export async function detectLanguage(text: string): Promise<Language> {
  if (!text || !text.trim()) return 'en';

  const scriptLang = detectLanguageFromScript(text);
  if (scriptLang !== 'en') return scriptLang;

  try {
    const res = await fetch('/api/detect-language', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 300) })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && ['en', 'ta', 'te', 'hi'].includes(data.language)) {
        return data.language as Language;
      }
    }
  } catch {
    // Fallback to script detection
  }

  return scriptLang;
}

/**
 * Translate a single string to the target language.
 */
export async function translateText(
  text: string,
  targetLanguage: Language,
  sourceLanguage?: Language
): Promise<string> {
  if (!text || !text.trim()) return '';

  const trimmed = text.trim();
  let detectedSource = sourceLanguage || detectLanguageFromScript(trimmed);

  // If detectedSource is 'en' but text contains Indic characters, fix detected source
  if (detectedSource === 'en' && hasIndicCharacters(trimmed)) {
    detectedSource = detectLanguageFromScript(trimmed);
    if (detectedSource === 'en') detectedSource = 'te'; // default fallback for Indic
  }

  if (detectedSource === targetLanguage && (targetLanguage !== 'en' || !hasIndicCharacters(trimmed))) {
    return trimmed;
  }

  const cacheKey = `${detectedSource}->${targetLanguage}:${trimmed}`;
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey)!;
    if (targetLanguage !== 'en' || !hasIndicCharacters(cached)) {
      return cached;
    }
    memoryCache.delete(cacheKey);
  }

  // Deduplicate in-flight requests
  if (inFlightPromises.has(cacheKey)) {
    return inFlightPromises.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          targetLanguage,
          sourceLanguage: detectedSource
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.text) {
          const result = data.text;
          persistCacheEntry(cacheKey, result);

          // Dispatch update event for live UI reaction across all components
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('talent2task_translation_updated', {
              detail: { key: cacheKey, text: trimmed, translated: result, targetLanguage }
            }));
          }

          return result;
        }
      }
    } catch (err) {
      console.warn('[TranslationService] Backend translation call failed, falling back to local:', err);
    } finally {
      inFlightPromises.delete(cacheKey);
    }

    // Graceful offline fallback
    const fallback = autoTranslateString(trimmed, targetLanguage, detectedSource);
    if (targetLanguage !== 'en' || !hasIndicCharacters(fallback)) {
      persistCacheEntry(cacheKey, fallback);
    }
    return fallback;
  })();

  inFlightPromises.set(cacheKey, promise);
  return promise;
}

/**
 * Translate text into all supported languages (en, ta, te, hi) in parallel or via backend multi-translate.
 */
export async function translateAllLanguages(
  text: string,
  sourceLanguage?: Language
): Promise<Record<Language, string>> {
  if (!text || !text.trim()) {
    return { en: '', ta: '', te: '', hi: '' };
  }

  const trimmed = text.trim();
  let detectedSource = sourceLanguage || detectLanguageFromScript(trimmed);
  if (detectedSource === 'en' && hasIndicCharacters(trimmed)) {
    detectedSource = detectLanguageFromScript(trimmed);
    if (detectedSource === 'en') detectedSource = 'te';
  }

  const targetLanguages: Language[] = ['en', 'ta', 'te', 'hi'];

  // Check if all are already in cache
  const cachedResult: Partial<Record<Language, string>> = {};
  let allCached = true;

  for (const lang of targetLanguages) {
    if (lang === detectedSource && (lang !== 'en' || !hasIndicCharacters(trimmed))) {
      cachedResult[lang] = trimmed;
    } else {
      const cacheKey = `${detectedSource}->${lang}:${trimmed}`;
      if (memoryCache.has(cacheKey)) {
        const val = memoryCache.get(cacheKey)!;
        if (lang === 'en' && hasIndicCharacters(val)) {
          allCached = false;
        } else {
          cachedResult[lang] = val;
        }
      } else {
        allCached = false;
      }
    }
  }

  if (allCached) {
    return cachedResult as Record<Language, string>;
  }

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: trimmed,
        targetLanguages,
        sourceLanguage: detectedSource
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.translations) {
        const fullTranslations: Record<Language, string> = {
          en: data.translations.en || trimmed,
          ta: data.translations.ta || trimmed,
          te: data.translations.te || trimmed,
          hi: data.translations.hi || trimmed
        };

        for (const [lang, trans] of Object.entries(fullTranslations)) {
          const cacheKey = `${detectedSource}->${lang}:${trimmed}`;
          persistCacheEntry(cacheKey, trans);
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('talent2task_translation_updated', {
            detail: { text: trimmed, translations: fullTranslations }
          }));
        }

        return fullTranslations;
      }
    }
  } catch (err) {
    console.warn('[TranslationService] translateAllLanguages API failed, falling back:', err);
  }

  // Fallback: Compute offline for all languages
  const fallbackResult: Record<Language, string> = {
    en: (detectedSource === 'en' && !hasIndicCharacters(trimmed)) ? trimmed : autoTranslateString(trimmed, 'en', detectedSource),
    ta: detectedSource === 'ta' ? trimmed : autoTranslateString(trimmed, 'ta', detectedSource),
    te: detectedSource === 'te' ? trimmed : autoTranslateString(trimmed, 'te', detectedSource),
    hi: detectedSource === 'hi' ? trimmed : autoTranslateString(trimmed, 'hi', detectedSource)
  };

  for (const [lang, trans] of Object.entries(fallbackResult)) {
    const cacheKey = `${detectedSource}->${lang}:${trimmed}`;
    persistCacheEntry(cacheKey, trans);
  }

  return fallbackResult;
}

/**
 * Synchronous cached translator for immediate UI rendering without layout thrashing.
 * Triggers background Gemini API prefetch if translation is missing.
 */
export function getInstantOrPrefetch(
  text: string,
  targetLanguage: Language,
  sourceLanguage?: Language
): string {
  if (!text || !text.trim()) return '';

  const trimmed = text.trim();
  let detectedSource = sourceLanguage || detectLanguageFromScript(trimmed);

  if (detectedSource === 'en' && hasIndicCharacters(trimmed)) {
    detectedSource = detectLanguageFromScript(trimmed);
    if (detectedSource === 'en') detectedSource = 'te';
  }

  if (detectedSource === targetLanguage && (targetLanguage !== 'en' || !hasIndicCharacters(trimmed))) {
    return trimmed;
  }

  const cacheKey = `${detectedSource}->${targetLanguage}:${trimmed}`;
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey)!;
    if (targetLanguage !== 'en' || !hasIndicCharacters(cached)) {
      return cached;
    }
    memoryCache.delete(cacheKey);
  }

  // Use offline translation immediately to prevent UI blanking
  const instantFallback = autoTranslateString(trimmed, targetLanguage, detectedSource);
  
  // Background prefetch from Gemini API
  translateText(trimmed, targetLanguage, detectedSource).catch(() => {});

  return instantFallback || trimmed;
}
