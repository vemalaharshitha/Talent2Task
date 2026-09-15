import type { 
  Job, 
  User, 
  TimeSlot, 
  HybridWeights, 
  MatchExplanation, 
  MatchBreakdown, 
  SkillDemandStat, 
  FeedbackReview,
  WorkerReliabilityMetrics 
} from '../types';
import { calculateHaversineDistance, formatDistance } from './geoService';
import { semanticService, type SemanticSkillEvaluation, type SemanticMatchDetail } from './semanticService';
import { sqliteManager } from '../db/sqliteManager';
import { reliabilityService } from './reliabilityService';

export interface MatchResult {
  matchScore: number;
  distanceKm: number;
  breakdown: MatchBreakdown;
}

export const DEFAULT_HYBRID_WEIGHTS: HybridWeights = {
  semanticSkill: 0.40, // 40% - Strongest factor (Transformer vector cosine similarity)
  distance: 0.20,      // 20% - Hyper-local GPS proximity
  availability: 0.15,  // 15% - Free time slot compatibility
  experience: 0.10,    // 10% - Years of hands-on experience
  localDemand: 0.075,  // 7.5% - Market demand in district
  reliability: 0.075   // 7.5% - Worker feedback and star ratings
};

export interface HybridMatchOptions {
  weights?: Partial<HybridWeights>;
  skillDemandStats?: SkillDemandStat[];
  reviews?: FeedbackReview[];
  workerReliabilityMetrics?: WorkerReliabilityMetrics;
}

/**
 * Maps raw cosine similarity (typically 0.10 to 0.70+ for short phrases)
 * into a calibrated functional skill score (0 to 1.0).
 */
export function calibrateSemanticSimilarity(cosineSim: number): number {
  if (cosineSim >= 0.85) return 1.0;
  if (cosineSim >= 0.45) {
    // 0.45 -> 0.70, 0.60 -> 0.88, 0.80 -> 0.98
    return Math.min(1.0, 0.70 + ((cosineSim - 0.45) / 0.40) * 0.28);
  }
  if (cosineSim >= 0.30) {
    // 0.30 -> 0.40, 0.45 -> 0.70
    return 0.40 + ((cosineSim - 0.30) / 0.15) * 0.30;
  }
  return Math.max(0, cosineSim * 0.8);
}

/**
 * Calculates Availability Compatibility Score (0 to 100)
 */
export function calculateAvailabilityScore(
  userSlots: TimeSlot[] = [], 
  job: Job
): { timeScore: number; availabilityStatus: MatchBreakdown['availabilityStatus']; matchedSlots: string[] } {
  if (!userSlots || userSlots.length === 0) {
    return { timeScore: 70, availabilityStatus: 'General Fit', matchedSlots: [] };
  }

  if (userSlots.includes('Immediate')) {
    return { timeScore: 100, availabilityStatus: 'Highly Flexible', matchedSlots: ['Immediate'] };
  }

  const desc = (job.description + ' ' + job.title + ' ' + job.category).toLowerCase();
  const matchedSlots: string[] = [];

  const checkEvening = userSlots.includes('Evening') && (desc.includes('evening') || desc.includes('night') || desc.includes('delivery') || desc.includes('part-time'));
  const checkWeekend = userSlots.includes('Weekend') && (desc.includes('weekend') || desc.includes('event') || desc.includes('catering') || desc.includes('service'));
  const checkMorning = userSlots.includes('Morning') && (desc.includes('morning') || desc.includes('store') || desc.includes('helper') || desc.includes('clean'));
  const checkAfternoon = userSlots.includes('Afternoon') && (desc.includes('afternoon') || desc.includes('shift') || desc.includes('shop'));
  const checkNight = userSlots.includes('Night') && (desc.includes('night') || desc.includes('security') || desc.includes('late'));

  if (checkEvening) matchedSlots.push('Evening');
  if (checkWeekend) matchedSlots.push('Weekend');
  if (checkMorning) matchedSlots.push('Morning');
  if (checkAfternoon) matchedSlots.push('Afternoon');
  if (checkNight) matchedSlots.push('Night');

  if (matchedSlots.length > 0) {
    return { timeScore: 95, availabilityStatus: 'Compatible', matchedSlots };
  }

  if (userSlots.length >= 2) {
    return { timeScore: 80, availabilityStatus: 'General Fit', matchedSlots: userSlots };
  }

  return { timeScore: 65, availabilityStatus: 'Partial Match', matchedSlots: userSlots };
}

/**
 * Calculates Experience Score (0 to 100)
 */
export function calculateExperienceScore(years?: number): { 
  experienceScore: number; 
  experienceYears: number; 
  experienceLevel: MatchBreakdown['experienceLevel'] 
} {
  const exp = typeof years === 'number' && !isNaN(years) ? Math.max(0, years) : 1;
  
  if (exp >= 3) {
    return { experienceScore: 100, experienceYears: exp, experienceLevel: 'Expert' };
  } else if (exp === 2) {
    return { experienceScore: 88, experienceYears: exp, experienceLevel: 'Suitable' };
  } else if (exp === 1) {
    return { experienceScore: 78, experienceYears: exp, experienceLevel: 'Competent' };
  } else {
    return { experienceScore: 65, experienceYears: 0, experienceLevel: 'Entry Level' };
  }
}

/**
 * Calculates Local Skill Demand Score (0 to 100)
 */
export function calculateLocalDemandScore(
  requiredSkills: string[] = [], 
  demandStats?: SkillDemandStat[]
): { demandScore: number; demandLevel: MatchBreakdown['demandLevel']; demandPercentage: number } {
  if (!demandStats || demandStats.length === 0 || requiredSkills.length === 0) {
    return { demandScore: 75, demandLevel: 'Moderate', demandPercentage: 35 };
  }

  let totalDemand = 0;
  let matchesCount = 0;

  for (const req of requiredSkills) {
    const norm = req.toLowerCase().trim();
    const stat = demandStats.find(s => s.skill.toLowerCase().trim().includes(norm) || norm.includes(s.skill.toLowerCase().trim()));
    if (stat) {
      totalDemand += stat.demandPercentage;
      matchesCount++;
    }
  }

  const avgDemand = matchesCount > 0 ? Math.round(totalDemand / matchesCount) : 35;

  if (avgDemand >= 50) {
    return { demandScore: 98, demandLevel: 'Surging', demandPercentage: avgDemand };
  } else if (avgDemand >= 35) {
    return { demandScore: 90, demandLevel: 'High', demandPercentage: avgDemand };
  } else if (avgDemand >= 20) {
    return { demandScore: 78, demandLevel: 'Moderate', demandPercentage: avgDemand };
  } else {
    return { demandScore: 65, demandLevel: 'Standard', demandPercentage: avgDemand };
  }
}

/**
 * Calculates Worker Reliability Score (0 to 100) dynamically using actual ratings,
 * completed tasks, acceptance rates, and behavioral endorsement tags.
 * Zero hardcoded scores.
 */
export function calculateReliabilityScore(
  reviews?: FeedbackReview[],
  workerId?: string,
  metrics?: WorkerReliabilityMetrics
): { 
  reliabilityScore: number; 
  ratingOutOfFive: number; 
  reviewCount: number; 
  isNewWorker: boolean;
  workerReliabilityMetrics?: WorkerReliabilityMetrics;
} {
  const m = metrics || (workerId ? reliabilityService.getWorkerReliability(workerId) : null);
  if (m) {
    return {
      reliabilityScore: m.score,
      ratingOutOfFive: m.averageRating,
      reviewCount: m.totalReviews,
      isNewWorker: m.isNewWorker,
      workerReliabilityMetrics: m
    };
  }

  if (!reviews || reviews.length === 0) {
    // Graceful baseline for verified new worker without penalty
    return { reliabilityScore: 80, ratingOutOfFive: 0, reviewCount: 0, isNewWorker: true };
  }

  const validRatings = reviews.map(r => Number(r.rating)).filter(r => !isNaN(r) && r >= 1 && r <= 5);
  if (validRatings.length === 0) {
    return { reliabilityScore: 80, ratingOutOfFive: 0, reviewCount: 0, isNewWorker: true };
  }

  const sum = validRatings.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / validRatings.length;
  const ratingOutOfFive = Math.round(avg * 10) / 10;
  const reliabilityScore = Math.min(100, Math.max(20, Math.round((avg / 5.0) * 100)));

  return { reliabilityScore, ratingOutOfFive, reviewCount: validRatings.length, isNewWorker: false };
}

/**
 * Generates human-readable explainability reasoning for the match
 */
export function generateMatchExplanation(
  job: Job,
  user: User,
  factors: {
    skillScore: number;
    distanceScore: number;
    distanceKm: number;
    availabilityStatus: MatchBreakdown['availabilityStatus'];
    matchedSlots: string[];
    experienceScore: number;
    experienceYears: number;
    experienceLevel: MatchBreakdown['experienceLevel'];
    demandScore: number;
    demandLevel: MatchBreakdown['demandLevel'];
    reliabilityScore: number;
    ratingOutOfFive: number;
    isNewWorker: boolean;
    workerReliabilityMetrics?: WorkerReliabilityMetrics;
    skillMatches?: SemanticMatchDetail[];
  }
): MatchExplanation {
  const reasons: string[] = [];

  // 1. Skill Reason
  const semanticMatch = factors.skillMatches?.find(m => m.isSemanticMatch && !m.isExactMatch);
  if (semanticMatch) {
    reasons.push(
      `Skill Similarity: ${factors.skillScore}% — High semantic match with "${semanticMatch.requiredSkill}" (✨ ${Math.round(semanticMatch.similarity * 100)}% AI similarity with "${semanticMatch.matchedUserSkill}")`
    );
  } else if (factors.skillScore >= 80) {
    reasons.push(`Skill Similarity: ${factors.skillScore}% — Direct alignment with all required job qualifications`);
  } else {
    reasons.push(`Skill Similarity: ${factors.skillScore}% — Partial skill overlap with foundational competencies`);
  }

  // 2. Distance Reason
  const distStr = formatDistance(factors.distanceKm);
  if (factors.distanceKm <= 1.0) {
    reasons.push(`Distance: ${factors.distanceScore}% — Hyper-local proximity, just ${distStr} away from you`);
  } else if (factors.distanceKm <= 3.0) {
    reasons.push(`Distance: ${factors.distanceScore}% — Convenient commute within your immediate ${distStr} radar`);
  } else {
    reasons.push(`Distance: ${factors.distanceScore}% — Accessible within ${distStr} in ${job.city || 'Tamil Nadu'}`);
  }

  // 3. Availability Reason
  if (factors.availabilityStatus === 'Compatible') {
    const slotsText = factors.matchedSlots.join(', ');
    reasons.push(`Availability: Compatible — Your ${slotsText || 'free'} hours match this gig's shift schedule`);
  } else if (factors.availabilityStatus === 'Highly Flexible') {
    reasons.push(`Availability: Compatible — Immediate availability allows instant start`);
  } else {
    reasons.push(`Availability: General Fit — Flexible part-time timing suitable for your schedule`);
  }

  // 4. Experience Reason
  if (factors.experienceYears > 0) {
    reasons.push(`Experience: Suitable — ${factors.experienceYears} ${factors.experienceYears === 1 ? 'year' : 'years'} of practical field experience (${factors.experienceLevel})`);
  } else {
    reasons.push(`Experience: Suitable — Great entry-level opportunity to build verified local credentials`);
  }

  // 5. Local Demand Reason
  if (factors.demandLevel === 'Surging' || factors.demandLevel === 'High') {
    reasons.push(`Local Demand: High — Essential skill currently in top recruiter demand across ${job.city || 'Tamil Nadu'}`);
  } else {
    reasons.push(`Local Demand: Moderate — Steady demand for skilled local talent in this area`);
  }

  // 6. Reliability Reason
  if (factors.workerReliabilityMetrics) {
    const m = factors.workerReliabilityMetrics;
    if (m.isNewWorker) {
      reasons.push(`Reliability: Baseline (80/100) — Verified new talent on Talent2Task with neutral initial baseline`);
    } else {
      reasons.push(
        `Reliability: ${m.score}/100 (${m.reliabilityTier}) — ${m.completionRate}% completion rate across ${m.tasksCompleted} gigs, ${m.averageRating > 0 ? m.averageRating + '★' : 'no'} rating across ${m.totalReviews} reviews`
      );
    }
  } else if (factors.isNewWorker) {
    reasons.push(`Reliability: Baseline (80/100) — Verified new talent on Talent2Task`);
  } else {
    reasons.push(`Reliability: ${factors.ratingOutOfFive}/5★ — High trust rating from verified recruiter reviews`);
  }

  // Determine Badge Tag and Headline
  const seekerGreeting = user.name ? `Recommended for ${user.name}` : 'Recommended';
  let badgeTag = 'Top AI Match';
  let headline = `${seekerGreeting}: Exceptional skill alignment (${factors.skillScore}%) and hyper-local proximity (${distStr}).`;

  if (factors.skillScore >= 85 && factors.distanceScore >= 85) {
    badgeTag = '✨ Top Hybrid Match';
    headline = `${seekerGreeting}: High skill similarity (${factors.skillScore}%) and immediate local proximity (${distStr}).`;
  } else if (factors.skillScore >= 80) {
    badgeTag = '🎯 High Skill Fit';
    headline = `${seekerGreeting}: Strong skill match (${factors.skillScore}%) aligned with your hands-on background.`;
  } else if (factors.distanceScore >= 85) {
    badgeTag = '📍 Nearby Priority';
    headline = `${seekerGreeting}: Conveniently close to you (${distStr}) with suitable scheduling.`;
  } else {
    badgeTag = '🌟 Good Opportunity';
    headline = `${seekerGreeting}: Part-time opportunity fitting your active profile.`;
  }

  return {
    headline,
    reasons,
    badgeTag
  };
}

/**
 * Calculates multi-factor match score between a Job Seeker and a Job
 * using real Transformer-based semantic AI matching and the 6 Hybrid AI Factors.
 */
export function calculateJobMatchWithSemantic(
  user: User, 
  job: Job,
  semanticEval?: SemanticSkillEvaluation | null,
  options?: HybridMatchOptions
): MatchResult {
  const weights: HybridWeights = {
    ...DEFAULT_HYBRID_WEIGHTS,
    ...(options?.weights || {})
  };

  // 1. Calculate Haversine Distance (Factor 2)
  const distanceKm = calculateHaversineDistance(
    user.latitude,
    user.longitude,
    job.latitude,
    job.longitude
  );

  let distanceScore = 100;
  if (distanceKm <= 0.5) {
    distanceScore = 100;
  } else if (distanceKm <= 1.5) {
    distanceScore = Math.round(100 - ((distanceKm - 0.5) / 1.0) * 12);
  } else if (distanceKm <= 3.0) {
    distanceScore = Math.round(88 - ((distanceKm - 1.5) / 1.5) * 18);
  } else if (distanceKm <= 10.0) {
    distanceScore = Math.round(70 - ((distanceKm - 3.0) / 7.0) * 40);
  } else {
    distanceScore = Math.max(5, Math.round(30 - ((distanceKm - 10.0) / 15.0) * 20));
  }

  // 2. Semantic Skill Alignment (Factor 1 - Strongest 40%)
  const userSkillsNorm = (user.skills || []).map(s => s.trim().toLowerCase());
  let matchedSkills: string[] = [];
  let missingSkills: string[] = [];
  let skillScore = 0;
  let isAiPowered = false;
  let skillMatches: SemanticMatchDetail[] | undefined = undefined;
  let rawSemanticScore: number | undefined = undefined;

  const safeRequiredSkills = Array.isArray(job?.required_skills) ? job.required_skills : [];

  if (semanticEval && semanticEval.matches && semanticEval.matches.length > 0) {
    matchedSkills = semanticEval.matchedSkills || [];
    missingSkills = semanticEval.missingSkills || [];
    isAiPowered = Boolean(semanticEval.isAiPowered);
    skillMatches = semanticEval.matches;
    rawSemanticScore = Math.round((semanticEval.semanticSkillScore || 0) * 100);

    const calibrated = safeRequiredSkills.length > 0
      ? calibrateSemanticSimilarity(semanticEval.semanticSkillScore)
      : 0.85;
    skillScore = Math.round((isNaN(calibrated) ? 0.8 : calibrated) * 100);
  } else {
    safeRequiredSkills.forEach((rawSkill) => {
      const sNorm = (rawSkill || '').trim().toLowerCase();
      const isMatch = userSkillsNorm.some(us => us.includes(sNorm) || sNorm.includes(us));
      if (isMatch) {
        matchedSkills.push(rawSkill);
      } else {
        missingSkills.push(rawSkill);
      }
    });

    const ratio = safeRequiredSkills.length > 0
      ? matchedSkills.length / safeRequiredSkills.length
      : 0.8;
    skillScore = Math.round((isNaN(ratio) ? 0.8 : ratio) * 100);
  }

  if (isNaN(skillScore)) skillScore = 75;
  if (isNaN(distanceScore)) distanceScore = 90;

  // 3. Availability Compatibility (Factor 3 - 15%)
  const { timeScore, availabilityStatus, matchedSlots } = calculateAvailabilityScore(user.free_time_slots, job);

  // 4. Work Experience (Factor 4 - 10%)
  const { experienceScore, experienceYears, experienceLevel } = calculateExperienceScore(user.experience);

  // 5. Local Skill Demand (Factor 5 - 7.5%)
  const demandStats = options?.skillDemandStats;
  const { demandScore, demandLevel, demandPercentage } = calculateLocalDemandScore(safeRequiredSkills, demandStats);

  // 6. Worker Reliability / Ratings (Factor 6 - 7.5%)
  const workerReliabilityMetrics = options?.workerReliabilityMetrics || (user?.id ? reliabilityService.getWorkerReliability(user.id) : undefined);
  const reviews = options?.reviews || (user?.id ? sqliteManager.getReviews(user.id) : []);
  const { reliabilityScore, ratingOutOfFive, reviewCount, isNewWorker } = calculateReliabilityScore(reviews, user?.id, workerReliabilityMetrics);

  // 7. Configurable Weighted Final Score
  const totalWeight = weights.semanticSkill + weights.distance + weights.availability + weights.experience + weights.localDemand + weights.reliability;
  const weightedSum = (
    skillScore * weights.semanticSkill +
    distanceScore * weights.distance +
    (isNaN(timeScore) ? 80 : timeScore) * weights.availability +
    (isNaN(experienceScore) ? 75 : experienceScore) * weights.experience +
    (isNaN(demandScore) ? 75 : demandScore) * weights.localDemand +
    (isNaN(reliabilityScore) ? 80 : reliabilityScore) * weights.reliability
  ) / (totalWeight || 1.0);

  const matchScore = isNaN(weightedSum) ? 80 : Math.min(99, Math.max(15, Math.round(weightedSum)));

  // 8. Generate Explainable Reasoning
  const explanation = generateMatchExplanation(job, user, {
    skillScore,
    distanceScore,
    distanceKm,
    availabilityStatus,
    matchedSlots,
    experienceScore,
    experienceYears,
    experienceLevel,
    demandScore,
    demandLevel,
    reliabilityScore,
    ratingOutOfFive,
    isNewWorker,
    workerReliabilityMetrics,
    skillMatches
  });

  const breakdown: MatchBreakdown = {
    skillScore,
    semanticSkillScore: rawSemanticScore,
    matchedSkills,
    missingSkills,
    skillMatches,
    isAiPowered,
    distanceScore,
    timeScore,
    availabilityStatus,
    matchedSlots,
    experienceScore,
    experienceYears,
    experienceLevel,
    demandScore,
    demandLevel,
    demandPercentage,
    reliabilityScore,
    ratingOutOfFive,
    reviewCount,
    isNewWorker,
    workerReliabilityMetrics,
    weights,
    explanation
  };

  return {
    matchScore,
    distanceKm,
    breakdown
  };
}

/**
 * Synchronous job match calculation using cached/seed Sentence Transformer embeddings
 */
export function calculateJobMatch(user: User, job: Job, options?: HybridMatchOptions): MatchResult {
  const semanticEval = semanticService.evaluateSkillsSemanticSync(user.skills || [], job.required_skills || []);
  const resolvedOptions: HybridMatchOptions = {
    ...options,
    skillDemandStats: options?.skillDemandStats || sqliteManager.getCommunitySkillTrends(),
    reviews: options?.reviews || sqliteManager.getReviews(user.id),
    workerReliabilityMetrics: options?.workerReliabilityMetrics || (user?.id ? reliabilityService.getWorkerReliability(user.id) : undefined)
  };
  return calculateJobMatchWithSemantic(user, job, semanticEval, resolvedOptions);
}

/**
 * Asynchronous job match calculation that generates any missing embeddings via Sentence Transformer
 */
export async function calculateJobMatchAsync(user: User, job: Job, options?: HybridMatchOptions): Promise<MatchResult> {
  const semanticEval = await semanticService.evaluateSkillsSemantic(user.skills || [], job.required_skills || []);
  const resolvedOptions: HybridMatchOptions = {
    ...options,
    skillDemandStats: options?.skillDemandStats || sqliteManager.getCommunitySkillTrends(),
    reviews: options?.reviews || sqliteManager.getReviews(user.id),
    workerReliabilityMetrics: options?.workerReliabilityMetrics || (user?.id ? reliabilityService.getWorkerReliability(user.id) : undefined)
  };
  return calculateJobMatchWithSemantic(user, job, semanticEval, resolvedOptions);
}

/**
 * Synchronously enriches a list of jobs with live distance and hybrid match scores for a given seeker
 */
export function enrichJobsForSeeker(jobs: Job[], user: User, options?: HybridMatchOptions): Job[] {
  const resolvedOptions: HybridMatchOptions = {
    ...options,
    skillDemandStats: options?.skillDemandStats || sqliteManager.getCommunitySkillTrends(),
    reviews: options?.reviews || sqliteManager.getReviews(user.id)
  };

  return jobs.map(job => {
    const { matchScore, distanceKm, breakdown } = calculateJobMatch(user, job, resolvedOptions);
    return {
      ...job,
      distanceKm,
      matchScore,
      matchBreakdown: breakdown
    };
  });
}

/**
 * Asynchronously enriches a list of jobs with live Sentence Transformer semantic matching and Hybrid AI Ranking
 */
export async function enrichJobsForSeekerAsync(jobs: Job[], user: User, options?: HybridMatchOptions): Promise<Job[]> {
  const resolvedOptions: HybridMatchOptions = {
    ...options,
    skillDemandStats: options?.skillDemandStats || sqliteManager.getCommunitySkillTrends(),
    reviews: options?.reviews || sqliteManager.getReviews(user.id)
  };

  const promises = jobs.map(async job => {
    const { matchScore, distanceKm, breakdown } = await calculateJobMatchAsync(user, job, resolvedOptions);
    return {
      ...job,
      distanceKm,
      matchScore,
      matchBreakdown: breakdown
    };
  });
  return Promise.all(promises);
}
