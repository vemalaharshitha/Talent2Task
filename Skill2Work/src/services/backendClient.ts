/**
 * Frontend Client for FastAPI AI Microservice with Seamless Offline Fallback.
 * Attempts to dispatch heavy AI/ML calculations to the FastAPI microservice.
 * If the microservice is offline, unreachable, or the user is disconnected,
 * it immediately and gracefully falls back to the embedded client-side TypeScript engines.
 */

import { semanticService } from './semanticService';
import { trustSafetyService } from './trustSafetyService';
import { demandIntelligenceService } from './demandIntelligenceService';
import { offlineQueueService } from './offlineQueueService';
import type { Job } from '../types';

const FASTAPI_BASE_URL = (typeof window !== 'undefined' && (window as any).__FASTAPI_URL__) || 'http://localhost:8000';

class BackendClient {
  private isFastApiAvailable = true;
  private lastCheckTime = 0;
  private checkIntervalMs = 15000; // Check health every 15s

  /**
   * Health check to detect whether FastAPI AI microservice is responsive.
   */
  public async checkHealth(): Promise<boolean> {
    if (!offlineQueueService.isOnline()) {
      this.isFastApiAvailable = false;
      return false;
    }

    const now = Date.now();
    if (now - this.lastCheckTime < this.checkIntervalMs) {
      return this.isFastApiAvailable;
    }

    this.lastCheckTime = now;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${FASTAPI_BASE_URL}/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      this.isFastApiAvailable = res.ok;
    } catch {
      this.isFastApiAvailable = false;
    }
    return this.isFastApiAvailable;
  }

  /**
   * 1. NLP Extraction with Client-Side Fallback
   */
  public async extractNLP(text: string, languageHint?: string): Promise<any> {
    if (await this.checkHealth()) {
      try {
        const res = await fetch(`${FASTAPI_BASE_URL}/api/ai/nlp/extract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language_hint: languageHint })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('FastAPI NLP failed, using client fallback:', e);
      }
    }

    // Client-side Heuristic Fallback
    const lower = text.toLowerCase();
    const isTamil = /[\u0B80-\u0BFF]/.test(text);
    return {
      detected_language: isTamil ? 'ta' : 'en',
      intent: lower.includes('need') || lower.includes('தேவை') ? 'hire_talent' : 'search_job',
      entities: {
        skills: [],
        location: null
      },
      normalized_query: text.trim(),
      confidence: 0.75,
      is_fallback: true
    };
  }

  /**
   * 2. Semantic Matching with Client-Side Fallback
   */
  public async matchSkills(
    requiredSkills: string[],
    candidates: Array<{ id: string; name?: string; skills: string[]; bio?: string }>
  ): Promise<any> {
    if (await this.checkHealth()) {
      try {
        const res = await fetch(`${FASTAPI_BASE_URL}/api/ai/semantic/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            required_skills: requiredSkills,
            candidates
          })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('FastAPI Semantic Match failed, using client fallback:', e);
      }
    }

    // Client-side Semantic Engine Fallback
    const matches = candidates.map(c => {
      const evalRes = semanticService.evaluateSkillsSemanticSync(c.skills || [], requiredSkills);
      const score = evalRes ? evalRes.semanticSkillScore : 0.5;
      return {
        candidate_id: c.id,
        similarity_score: score,
        matched_skills: evalRes ? evalRes.matchedSkills : [],
        missing_skills: evalRes ? evalRes.missingSkills : []
      };
    });

    matches.sort((a, b) => b.similarity_score - a.similarity_score);
    return {
      matches,
      total_evaluated: candidates.length,
      is_fallback: true
    };
  }

  /**
   * 3. Hybrid Ranking with Client-Side Fallback
   */
  public async rankCandidates(
    requiredSkills: string[],
    jobCategory: string,
    candidates: any[],
    jobLocation?: { latitude: number; longitude: number }
  ): Promise<any> {
    if (await this.checkHealth()) {
      try {
        const res = await fetch(`${FASTAPI_BASE_URL}/api/ai/ranking/hybrid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            required_skills: requiredSkills,
            job_category: jobCategory,
            job_latitude: jobLocation?.latitude,
            job_longitude: jobLocation?.longitude,
            candidates
          })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('FastAPI Hybrid Ranking failed, using client fallback:', e);
      }
    }

    // Client-Side Calculation Fallback
    const ranked = candidates.map(c => {
      const evalRes = semanticService.evaluateSkillsSemanticSync(c.skills || [], requiredSkills);
      const skillScore = evalRes ? evalRes.semanticSkillScore : 0.5;
      const relScore = (c.reliability_score || 75.0) / 100.0;
      const total = (skillScore * 0.45) + (relScore * 0.25) + 0.30;
      return {
        id: c.id,
        name: c.name,
        total_score: Math.round(total * 100),
        breakdown: {
          skill_match: Math.round(skillScore * 100),
          reliability: Math.round(relScore * 100)
        },
        matched_skills: evalRes ? evalRes.matchedSkills : (c.skills || []),
        reliability_score: c.reliability_score || 75.0
      };
    });

    ranked.sort((a, b) => b.total_score - a.total_score);
    return {
      ranked_candidates: ranked,
      algorithm_version: 'v9-client-fallback',
      is_fallback: true
    };
  }

  /**
   * 4. Skill Gap Analysis with Client-Side Fallback
   */
  public async analyzeSkillGap(workerSkills: string[], targetRole?: string): Promise<any> {
    if (await this.checkHealth()) {
      try {
        const res = await fetch(`${FASTAPI_BASE_URL}/api/ai/skills/gap-analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worker_skills: workerSkills,
            target_role: targetRole
          })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('FastAPI Skill Gap failed, using client fallback:', e);
      }
    }

    // Client-Side Fallback
    return {
      worker_skills: workerSkills,
      matched_skills: workerSkills,
      missing_skills: ['Advanced Electrical Wiring', 'Solar Installation'],
      match_percentage: 65.0,
      recommendations: [
        {
          skill: 'Advanced Electrical Wiring',
          importance: 'HIGH',
          estimated_wage_increase_percent: 25.0,
          training_resource: 'TNSDC Vocational ITI Program',
          reason: 'High regional demand in industrial corridors.'
        }
      ],
      readiness_level: 'Near Ready',
      is_fallback: true
    };
  }

  /**
   * 5. Local Demand Prediction with Client-Side Fallback
   */
  public async predictDemand(skill: string, district: string, historicalPoints?: any[]): Promise<any> {
    if (await this.checkHealth()) {
      try {
        const res = await fetch(`${FASTAPI_BASE_URL}/api/ai/demand/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skill,
            district,
            historical_points: historicalPoints
          })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('FastAPI Demand Prediction failed, using client fallback:', e);
      }
    }

    // Client-side Demand Intelligence Fallback
    const localIntel = demandIntelligenceService.analyzeDemand([], district || 'Chennai');
    const stat = localIntel.skillsDemand.find(s => s.skill.toLowerCase() === skill.toLowerCase());
    return {
      skill,
      district,
      current_demand_level: stat ? stat.currentDemandLevel.toUpperCase() : 'MODERATE',
      predicted_demand_level: stat?.predictedTrend ? stat.predictedTrend.toUpperCase() : null,
      insufficient_data: !stat?.hasSufficientHistoricalData,
      data_points_count: stat?.totalHistoricalGigCount || 0,
      summary: stat ? `Active local demand for ${skill} in ${district}.` : 'Baseline regional demand estimate.',
      is_fallback: true
    };
  }

  /**
   * 6. Trust & Safety Assessment with Client-Side Fallback
   */
  public async checkTrustSafety(job: Job): Promise<any> {
    if (await this.checkHealth()) {
      try {
        const res = await fetch(`${FASTAPI_BASE_URL}/api/ai/trust/safety-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job: {
              id: job.id,
              title: job.title,
              description: job.description,
              category: job.category,
              payout_amount: job.payout_amount,
              payout_type: job.payout_unit || 'DAILY',
              recruiter_id: job.recruiter_id
            }
          })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('FastAPI Trust & Safety failed, using client fallback:', e);
      }
    }

    // Client-side Trust & Safety Fallback
    const assessment = trustSafetyService.evaluateJobTrust(job, null, [], 0);
    return {
      job_id: job.id,
      risk_level: assessment.status === 'potential_risk_detected' ? 'HIGH' : 'LOW',
      status_label: assessment.headline,
      risk_score: assessment.riskScore,
      signals: assessment.riskSignals,
      explanation: assessment.explanation,
      safe_to_publish: assessment.status !== 'potential_risk_detected',
      is_fallback: true
    };
  }

  /**
   * 7. AI Chat Assistant Query with FastAPI & Offline Fallback
   */
  public async queryChatAssistant(payload: {
    query: string;
    language?: string;
    context?: any;
    recent_history?: any[];
  }): Promise<any> {
    if (await this.checkHealth()) {
      try {
        const res = await fetch(`${FASTAPI_BASE_URL}/api/ai/chat/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('FastAPI Chat Assistant query failed, using client fallback:', e);
      }
    }
    return null; // Signals client-side engine to handle
  }
}

export const backendClient = new BackendClient();

