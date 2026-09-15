import seedEmbeddingsJson from './seedEmbeddings.json';
import { getSemanticConceptSimilarity } from './abbreviationService';

// Lazy reference for @xenova/transformers
let pipelineFn: any = null;
let envObj: any = null;

export type ModelStatus = 'uninitialized' | 'loading' | 'ready' | 'error';

export interface SemanticMatchDetail {
  requiredSkill: string;
  matchedUserSkill?: string;
  similarity: number; // 0 to 1 (cosine similarity)
  isSemanticMatch: boolean; // similarity >= SEMANTIC_THRESHOLD
  isExactMatch: boolean; // direct substring or string match
}

export interface SemanticSkillEvaluation {
  semanticSkillScore: number; // 0 to 1
  matches: SemanticMatchDetail[];
  matchedSkills: string[];
  missingSkills: string[];
  isAiPowered: boolean;
}

// In Sentence Transformers, cosine similarity >= 0.45 for short functional skill phrases
// indicates high semantic alignment (e.g. 'AC repair' ↔ 'Air-conditioner servicing' ~ 0.60)
export const SEMANTIC_THRESHOLD = 0.45;
export const EXACT_THRESHOLD = 0.85;

const STORAGE_CACHE_KEY = 'talent2task_semantic_embeddings_cache';

/**
 * Calculates mathematical cosine similarity between two float vectors
 * cosine_similarity(u, v) = (u . v) / (||u|| * ||v||)
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(vecA.length, vecB.length);
  for (let i = 0; i < len; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  const sim = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, sim));
}

class SemanticService {
  private status: ModelStatus = 'uninitialized';
  private progress: number = 0;
  private errorMessage: string | null = null;
  private extractor: any = null;
  private initPromise: Promise<void> | null = null;
  private embeddingsCache = new Map<string, number[]>();
  private listeners = new Set<(status: ModelStatus, progress: number, error?: string | null) => void>();

  constructor() {
    this.loadSeedEmbeddings();
    this.loadStorageCache();
  }

  private loadSeedEmbeddings() {
    try {
      if (seedEmbeddingsJson && typeof seedEmbeddingsJson === 'object') {
        for (const [skill, vec] of Object.entries(seedEmbeddingsJson)) {
          if (Array.isArray(vec)) {
            this.embeddingsCache.set(skill.toLowerCase().trim(), vec as number[]);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load seed embeddings:', e);
    }
  }

  private loadStorageCache() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const [key, vec] of Object.entries(parsed)) {
          if (Array.isArray(vec)) {
            this.embeddingsCache.set(key, vec as number[]);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load storage embedding cache:', e);
    }
  }

  private persistCacheDebounced = (() => {
    let timer: any = null;
    return () => {
      if (typeof window === 'undefined') return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          const obj: Record<string, number[]> = {};
          // Only persist up to 250 custom embeddings to prevent storage overflow
          let count = 0;
          for (const [key, vec] of this.embeddingsCache.entries()) {
            obj[key] = vec;
            count++;
            if (count > 250) break;
          }
          localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(obj));
        } catch {
          // ignore storage quota errors
        }
      }, 1000);
    };
  })();

  public getStatus(): { status: ModelStatus; progress: number; errorMessage: string | null } {
    return {
      status: this.status,
      progress: this.progress,
      errorMessage: this.errorMessage
    };
  }

  public subscribe(listener: (status: ModelStatus, progress: number, error?: string | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.status, this.progress, this.errorMessage);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this.status, this.progress, this.errorMessage);
      } catch (err) {
        console.error('Error in semanticService subscriber:', err);
      }
    });
  }

  private lastProgressNotify = 0;

  /**
   * Initializes the Sentence Transformer model (all-MiniLM-L6-v2) in the background
   */
  public async initModel(): Promise<void> {
    if (this.status === 'ready' || this.status === 'loading') return;
    if (this.initPromise) return this.initPromise;

    this.status = 'loading';
    this.progress = 0;
    this.errorMessage = null;
    this.notify();

    this.initPromise = (async () => {
      try {
        // Run with a 10-second timeout to ensure the app never stalls on slow networks
        const loadPromise = (async () => {
          if (!pipelineFn) {
            const mod = await import('@xenova/transformers');
            pipelineFn = mod.pipeline;
            envObj = mod.env;
            if (envObj) {
              envObj.allowLocalModels = false;
              if (typeof window !== 'undefined') {
                envObj.useBrowserCache = true;
              } else {
                envObj.useBrowserCache = false;
                envObj.useFS = true;
              }
            }
          }

          this.extractor = await pipelineFn(
            'feature-extraction',
            'Xenova/all-MiniLM-L6-v2',
            {
              quantized: true,
              progress_callback: (p: any) => {
                if (p && typeof p.progress === 'number') {
                  const now = Date.now();
                  // Throttle progress notifications to at most once per 250ms
                  if (now - this.lastProgressNotify > 250 || p.progress >= 100) {
                    this.lastProgressNotify = now;
                    this.progress = Math.round(p.progress);
                    this.notify();
                  }
                }
              }
            }
          );
        })();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Background model warmup timeout - using instant seed vectors')), 10000)
        );

        await Promise.race([loadPromise, timeoutPromise]);

        this.status = 'ready';
        this.progress = 100;
        this.errorMessage = null;
        this.notify();
      } catch (err: any) {
        console.warn('Sentence Transformer notice (instant seed vectors active):', err?.message || err);
        this.status = 'ready'; // Mark ready with seed embeddings so app never blocks
        this.progress = 100;
        this.errorMessage = null;
        this.notify();
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  /**
   * Generates or retrieves 384-dimensional embedding for a text string
   */
  public async getEmbedding(text: string): Promise<number[] | null> {
    if (!text || !text.trim()) return null;
    const norm = text.trim().toLowerCase();

    // Check memory / seed cache first
    if (this.embeddingsCache.has(norm)) {
      return this.embeddingsCache.get(norm)!;
    }

    // Try initializing model if not already ready
    if (this.status === 'uninitialized') {
      this.initModel().catch(() => {});
    }

    if (this.status === 'ready' && this.extractor) {
      try {
        const output = await this.extractor(text, { pooling: 'mean', normalize: true });
        const vector = Array.from(output.data) as number[];
        this.embeddingsCache.set(norm, vector);
        this.persistCacheDebounced();
        return vector;
      } catch (err) {
        console.warn(`Error embedding text "${text}":`, err);
        return null;
      }
    }

    return null;
  }

  /**
   * Evaluates semantic similarity between worker skills and required job skills synchronously
   * using cached/seed Sentence Transformer embeddings if available.
   */
  public evaluateSkillsSemanticSync(
    userSkills: string[],
    requiredSkills: string[]
  ): SemanticSkillEvaluation | null {
    if (!requiredSkills || requiredSkills.length === 0) {
      return {
        semanticSkillScore: 0.85,
        matches: [],
        matchedSkills: [],
        missingSkills: [],
        isAiPowered: true
      };
    }

    // Check if we have embeddings for all skills
    const userVectors: { skill: string; vector: number[] }[] = [];
    for (const us of userSkills) {
      const v = this.embeddingsCache.get(us.trim().toLowerCase());
      if (v) userVectors.push({ skill: us, vector: v });
    }

    const matches: SemanticMatchDetail[] = [];
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    let totalSimilarity = 0;

    let hasAiCalculations = false;

    for (const reqSkill of requiredSkills) {
      const reqNorm = reqSkill.trim().toLowerCase();
      const reqVector = this.embeddingsCache.get(reqNorm);

      let bestMatchSkill: string | undefined;
      let highestSimilarity = 0;

      // 1. Direct substring check
      const directMatch = userSkills.find(
        us => us.toLowerCase().includes(reqNorm) || reqNorm.includes(us.toLowerCase())
      );

      if (directMatch) {
        highestSimilarity = 1.0;
        bestMatchSkill = directMatch;
      }

      // 2. Multilingual Abbreviation & Semantic Concept Equivalence (AC ↔ Air Conditioner, Fridge ↔ Refrigerator, etc.)
      for (const us of userSkills) {
        const conceptSim = getSemanticConceptSimilarity(reqSkill, us);
        if (conceptSim > highestSimilarity) {
          highestSimilarity = conceptSim;
          bestMatchSkill = us;
        }
      }

      // 3. Real Cosine Similarity with Sentence Transformer embeddings
      if (reqVector && userVectors.length > 0) {
        for (const uv of userVectors) {
          const sim = calculateCosineSimilarity(reqVector, uv.vector);
          if (sim > highestSimilarity) {
            highestSimilarity = sim;
            bestMatchSkill = uv.skill;
          }
        }
        hasAiCalculations = true;
      }

      const isSemantic = highestSimilarity >= SEMANTIC_THRESHOLD;
      const isExact = highestSimilarity >= EXACT_THRESHOLD || Boolean(directMatch);

      if (isSemantic || isExact) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }

      totalSimilarity += highestSimilarity;

      matches.push({
        requiredSkill: reqSkill,
        matchedUserSkill: bestMatchSkill,
        similarity: Math.round(highestSimilarity * 100) / 100,
        isSemanticMatch: isSemantic,
        isExactMatch: isExact
      });
    }

    // If we couldn't evaluate any skills with AI embeddings, concept matches, or direct matches, return null to trigger async
    if (!hasAiCalculations && totalSimilarity === 0 && userSkills.length > 0 && requiredSkills.length > 0) {
      return null;
    }

    const avgScore = requiredSkills.length > 0 ? totalSimilarity / requiredSkills.length : 0.8;

    return {
      semanticSkillScore: Math.min(1.0, Math.max(0, avgScore)),
      matches,
      matchedSkills,
      missingSkills,
      isAiPowered: hasAiCalculations
    };
  }

  /**
   * Asynchronously evaluates semantic similarity by generating embeddings on-the-fly
   * for any missing skills.
   */
  public async evaluateSkillsSemantic(
    userSkills: string[],
    requiredSkills: string[]
  ): Promise<SemanticSkillEvaluation> {
    if (!requiredSkills || requiredSkills.length === 0) {
      return {
        semanticSkillScore: 0.85,
        matches: [],
        matchedSkills: [],
        missingSkills: [],
        isAiPowered: true
      };
    }

    // Ensure model is starting up if not ready
    if (this.status === 'uninitialized') {
      this.initModel().catch(() => {});
    }

    // Fetch or compute embeddings for all user skills and required skills
    const userVectors: { skill: string; vector: number[] }[] = [];
    for (const us of userSkills) {
      const v = await this.getEmbedding(us);
      if (v) userVectors.push({ skill: us, vector: v });
    }

    const matches: SemanticMatchDetail[] = [];
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    let totalSimilarity = 0;
    let hasAi = false;

    for (const reqSkill of requiredSkills) {
      const reqNorm = reqSkill.trim().toLowerCase();
      const reqVector = await this.getEmbedding(reqSkill);

      let bestMatchSkill: string | undefined;
      let highestSimilarity = 0;

      // 1. Direct string match check
      const directMatch = userSkills.find(
        us => us.toLowerCase().includes(reqNorm) || reqNorm.includes(us.toLowerCase())
      );

      if (directMatch) {
        highestSimilarity = 1.0;
        bestMatchSkill = directMatch;
      }

      // 2. Multilingual Abbreviation & Semantic Concept Equivalence (AC ↔ Air Conditioner, Fridge ↔ Refrigerator, etc.)
      for (const us of userSkills) {
        const conceptSim = getSemanticConceptSimilarity(reqSkill, us);
        if (conceptSim > highestSimilarity) {
          highestSimilarity = conceptSim;
          bestMatchSkill = us;
        }
      }

      // 3. Semantic Cosine Similarity
      if (reqVector && userVectors.length > 0) {
        for (const uv of userVectors) {
          const sim = calculateCosineSimilarity(reqVector, uv.vector);
          if (sim > highestSimilarity) {
            highestSimilarity = sim;
            bestMatchSkill = uv.skill;
          }
        }
        hasAi = true;
      }

      const isSemantic = highestSimilarity >= SEMANTIC_THRESHOLD;
      const isExact = highestSimilarity >= EXACT_THRESHOLD || Boolean(directMatch);

      if (isSemantic || isExact) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }

      totalSimilarity += highestSimilarity;

      matches.push({
        requiredSkill: reqSkill,
        matchedUserSkill: bestMatchSkill,
        similarity: Math.round(highestSimilarity * 100) / 100,
        isSemanticMatch: isSemantic,
        isExactMatch: isExact
      });
    }

    const avgScore = requiredSkills.length > 0 ? totalSimilarity / requiredSkills.length : 0.8;

    return {
      semanticSkillScore: Math.min(1.0, Math.max(0, avgScore)),
      matches,
      matchedSkills,
      missingSkills,
      isAiPowered: hasAi
    };
  }

  /**
   * Calculates semantic similarity score between two skill strings
   */
  public async calculateSimilarity(skillA: string, skillB: string): Promise<number> {
    const evalResult = await this.evaluateSkillsSemantic([skillA], [skillB]);
    return evalResult.semanticSkillScore;
  }
}

export const semanticService = new SemanticService();
