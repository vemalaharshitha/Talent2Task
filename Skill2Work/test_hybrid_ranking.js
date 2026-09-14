if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
}

import assert from 'node:assert';
import { 
  DEFAULT_HYBRID_WEIGHTS,
  calculateAvailabilityScore,
  calculateExperienceScore,
  calculateLocalDemandScore,
  calculateReliabilityScore,
  generateMatchExplanation,
  calculateJobMatchWithSemantic,
  calibrateSemanticSimilarity
} from './src/services/matchingService.ts';
import seedEmbeddingsJson from './src/services/seedEmbeddings.json' with { type: 'json' };

console.log('====================================================');
console.log('🧪 RUNNING HYBRID AI RANKING & EXPLAINABILITY TESTS');
console.log('====================================================\n');

// --- TEST 1: Configurable Weights Validation ---
console.log('TEST 1: Configurable Weights Validation');
const totalWeight = Object.values(DEFAULT_HYBRID_WEIGHTS).reduce((a, b) => a + b, 0);
console.log(`Weights sum: ${totalWeight} (Semantic Skill: ${DEFAULT_HYBRID_WEIGHTS.semanticSkill * 100}%, Distance: ${DEFAULT_HYBRID_WEIGHTS.distance * 100}%, Availability: ${DEFAULT_HYBRID_WEIGHTS.availability * 100}%, Experience: ${DEFAULT_HYBRID_WEIGHTS.experience * 100}%, Local Demand: ${DEFAULT_HYBRID_WEIGHTS.localDemand * 100}%, Reliability: ${DEFAULT_HYBRID_WEIGHTS.reliability * 100}%)`);
assert.strictEqual(Math.round(totalWeight * 1000) / 1000, 1.0, 'Weights must sum to 1.0');
assert.strictEqual(DEFAULT_HYBRID_WEIGHTS.semanticSkill, 0.40, 'Semantic skill must be strongest factor (40%)');
console.log('✅ TEST 1 PASSED: Weights are balanced and sum to 100%.\n');

// --- TEST 2: Individual Factor Scorers ---
console.log('TEST 2: Factor Scorers & Edge Case Handling');

// 2a. Availability Score
const mockJob = {
  id: 'job_test_01',
  recruiter_id: 'rec_01',
  title: 'Evening Delivery Rider',
  description: 'Need two-wheeler rider for evening shift deliveries',
  category: 'Delivery',
  required_skills: ['Two-wheeler driving', 'Delivery'],
  payout_amount: 500,
  payout_unit: 'task',
  latitude: 13.0067,
  longitude: 80.2030,
  landmark_area: 'Guindy, Chennai',
  city: 'Chennai',
  status: 'OPEN',
  claimed_by: null,
  created_at: '2026-09-12 10:00:00'
};

const availImmediate = calculateAvailabilityScore(['Immediate'], mockJob);
assert.strictEqual(availImmediate.timeScore, 100);
assert.strictEqual(availImmediate.availabilityStatus, 'Highly Flexible');

const availMatching = calculateAvailabilityScore(['Evening', 'Weekend'], mockJob);
assert.strictEqual(availMatching.timeScore, 95);
assert.strictEqual(availMatching.availabilityStatus, 'Compatible');

const availEmpty = calculateAvailabilityScore([], mockJob);
assert.strictEqual(availEmpty.timeScore, 70);
assert.strictEqual(availEmpty.availabilityStatus, 'General Fit');

console.log('  • Availability Scorer: Immediate (100%), Evening match (95%), Empty (70% fallback) -> PASS');

// 2b. Experience Score
const expExpert = calculateExperienceScore(4);
assert.strictEqual(expExpert.experienceScore, 100);
assert.strictEqual(expExpert.experienceLevel, 'Expert');

const expSuitable = calculateExperienceScore(2);
assert.strictEqual(expSuitable.experienceScore, 88);
assert.strictEqual(expSuitable.experienceLevel, 'Suitable');

const expZero = calculateExperienceScore(0);
assert.strictEqual(expZero.experienceScore, 65);
assert.strictEqual(expZero.experienceLevel, 'Entry Level');

const expUndefined = calculateExperienceScore(undefined);
assert.strictEqual(expUndefined.experienceScore, 78); // Defaults to 1 yr competent baseline
console.log('  • Experience Scorer: 4 yrs (100%), 2 yrs (88%), 0 yrs (65%), undefined (78% fallback) -> PASS');

// 2c. Local Demand Score
const mockDemandStats = [
  { skill: 'Two-wheeler driving', demandPercentage: 55, openGigsCount: 12, avgHourlyPay: 450, topLandmark: 'Guindy', growthRate: '+24%' },
  { skill: 'Delivery', demandPercentage: 45, openGigsCount: 10, avgHourlyPay: 400, topLandmark: 'Velachery', growthRate: '+18%' }
];
const demandHigh = calculateLocalDemandScore(['Two-wheeler driving', 'Delivery'], mockDemandStats);
assert.strictEqual(demandHigh.demandScore, 98); // avg = 50% -> Surging (98)
assert.strictEqual(demandHigh.demandLevel, 'Surging');

const demandFallback = calculateLocalDemandScore(['Rare Niche Skill'], []);
assert.strictEqual(demandFallback.demandScore, 75);
console.log('  • Local Demand Scorer: High demand skills (98%), Empty fallback (75%) -> PASS');

// 2d. Reliability / Ratings Score
const mockReviews = [
  { id: 'rev_1', job_id: 'j1', job_title: 'Gig 1', from_user_id: 'r1', from_user_name: 'Store', to_user_id: 'u1', rating: 5, tags: [], comment: 'Great', created_at: '' },
  { id: 'rev_2', job_id: 'j2', job_title: 'Gig 2', from_user_id: 'r2', from_user_name: 'Shop', to_user_id: 'u1', rating: 4.6, tags: [], comment: 'Good', created_at: '' }
];
const relScored = calculateReliabilityScore(mockReviews);
assert.strictEqual(relScored.ratingOutOfFive, 4.8);
assert.strictEqual(relScored.reliabilityScore, 96);
assert.strictEqual(relScored.isNewWorker, false);

const relNew = calculateReliabilityScore([]);
assert.strictEqual(relNew.ratingOutOfFive, 4.0);
assert.strictEqual(relNew.reliabilityScore, 80);
assert.strictEqual(relNew.isNewWorker, true);
console.log('  • Reliability Scorer: 4.8/5.0 reviews (96%), New worker (80% baseline, no penalty) -> PASS');
console.log('✅ TEST 2 PASSED: All individual factor scorers behave accurately.\n');

// --- TEST 3: Dynamic Score Calculation & Rank Reordering ---
console.log('TEST 3: Dynamic Score Changes & Rank Sensitivity');

const baseWorker = {
  id: 'usr_karthik',
  role: 'seeker',
  name: 'Karthik Raja',
  age: 23,
  phone: '+91 98401 23456',
  skills: ['AC repair and maintenance', 'Electrical safety'],
  free_time_slots: ['Evening', 'Weekend'],
  preferred_language: 'ta',
  latitude: 13.0067, // Guindy, Chennai
  longitude: 80.2030,
  experience: 2,
  city: 'Chennai'
};

const acJob = {
  id: 'job_ac_01',
  recruiter_id: 'rec_chn_01',
  title: 'Split AC Servicing & Refrigeration Technician',
  description: 'Evening split AC repair and compressor maintenance',
  category: 'Technician',
  required_skills: ['Air-conditioner servicing technician', 'Electrical safety'],
  payout_amount: 750,
  payout_unit: 'task',
  latitude: 13.0100, // 0.8 km from worker
  longitude: 80.2050,
  landmark_area: 'Guindy Industrial Estate, Chennai',
  city: 'Chennai',
  status: 'OPEN',
  claimed_by: null,
  created_at: '2026-09-12 11:00:00'
};

// Mock semantic eval from Phase 1 Sentence Transformer
const semanticEval = {
  semanticSkillScore: 0.80, // ~60% cosine sim calibrated to 88%
  matches: [
    { requiredSkill: 'Air-conditioner servicing technician', matchedUserSkill: 'AC repair and maintenance', similarity: 0.6004, isSemanticMatch: true, isExactMatch: false },
    { requiredSkill: 'Electrical safety', matchedUserSkill: 'Electrical safety', similarity: 1.0, isSemanticMatch: true, isExactMatch: true }
  ],
  matchedSkills: ['Air-conditioner servicing technician', 'Electrical safety'],
  missingSkills: [],
  isAiPowered: true
};

const matchBase = calculateJobMatchWithSemantic(baseWorker, acJob, semanticEval, {
  reviews: mockReviews,
  skillDemandStats: [
    { skill: 'Air-conditioner servicing technician', demandPercentage: 45, openGigsCount: 8, avgHourlyPay: 700, topLandmark: 'Guindy', growthRate: '+24%' }
  ]
});

console.log(`Base Hybrid Match Score: ${matchBase.matchScore}%`);
console.log(`  • Skill Similarity: ${matchBase.breakdown.skillScore}%`);
console.log(`  • Distance: ${matchBase.breakdown.distanceScore}% (${matchBase.distanceKm.toFixed(2)} km)`);
console.log(`  • Availability: ${matchBase.breakdown.availabilityStatus}`);
console.log(`  • Experience: ${matchBase.breakdown.experienceLevel} (${matchBase.breakdown.experienceYears} yrs)`);
console.log(`  • Local Demand: ${matchBase.breakdown.demandLevel}`);
console.log(`  • Reliability: ${matchBase.breakdown.ratingOutOfFive}/5`);
assert(matchBase.matchScore >= 90, 'Base match should be 90%+');

// 3a. Skill Change Sensitivity
const unskilledWorker = { ...baseWorker, skills: ['Cooking and catering chef'] };
const unskilledSemanticEval = {
  semanticSkillScore: 0.20,
  matches: [
    { requiredSkill: 'Air-conditioner servicing technician', matchedUserSkill: 'Cooking and catering chef', similarity: 0.10, isSemanticMatch: false, isExactMatch: false },
    { requiredSkill: 'Electrical safety', similarity: 0.0, isSemanticMatch: false, isExactMatch: false }
  ],
  matchedSkills: [],
  missingSkills: ['Air-conditioner servicing technician', 'Electrical safety'],
  isAiPowered: true
};
const matchUnskilled = calculateJobMatchWithSemantic(unskilledWorker, acJob, unskilledSemanticEval);
console.log(`Unskilled Worker Match Score: ${matchUnskilled.matchScore}% (Delta: ${matchBase.matchScore - matchUnskilled.matchScore}%)`);
assert(matchBase.matchScore - matchUnskilled.matchScore >= 30, 'Skill difference should alter score by 30+ points');

// 3b. Distance Change Sensitivity
const farWorker = { ...baseWorker, latitude: 12.8342, longitude: 79.7036 }; // 50km away in Kanchipuram
const matchFar = calculateJobMatchWithSemantic(farWorker, acJob, semanticEval);
console.log(`Far Worker (50km) Match Score: ${matchFar.matchScore}% (Delta: ${matchBase.matchScore - matchFar.matchScore}%)`);
assert(matchBase.matchScore - matchFar.matchScore >= 12, 'Distance difference should alter score by 12+ points');

// 3c. Experience Change Sensitivity
const veteranWorker = { ...baseWorker, experience: 5 };
const noviceWorker = { ...baseWorker, experience: 0 };
const matchVeteran = calculateJobMatchWithSemantic(veteranWorker, acJob, semanticEval);
const matchNovice = calculateJobMatchWithSemantic(noviceWorker, acJob, semanticEval);
console.log(`Veteran (5 yrs) Score: ${matchVeteran.matchScore}% vs Novice (0 yrs) Score: ${matchNovice.matchScore}% (Delta: ${matchVeteran.matchScore - matchNovice.matchScore}%)`);
assert(matchVeteran.matchScore > matchNovice.matchScore, 'Veteran must score higher than novice');

// 3d. Availability Change Sensitivity
const busyWorker = { ...baseWorker, free_time_slots: ['Morning'] }; // Mismatches evening shift
const matchBusy = calculateJobMatchWithSemantic(busyWorker, acJob, semanticEval);
console.log(`Compatible Slots Score: ${matchBase.matchScore}% vs Clashing Slots Score: ${matchBusy.matchScore}% (Delta: ${matchBase.matchScore - matchBusy.matchScore}%)`);
assert(matchBase.matchScore > matchBusy.matchScore, 'Slot match must score higher than clashing slot');

console.log('✅ TEST 3 PASSED: Rankings dynamically change across skill, distance, experience, and availability.\n');

// --- TEST 4: Explainability & Reasoning Output ---
console.log('TEST 4: Explainable AI Recommendations ("Why this match?")');
const explanation = matchBase.breakdown.explanation;
console.log(`Headline: "${explanation.headline}"`);
console.log(`Badge Tag: "${explanation.badgeTag}"`);
console.log('Reasons:');
explanation.reasons.forEach(r => console.log(`  - ${r}`));

assert(explanation.headline.length > 10, 'Headline must be populated');
assert(explanation.reasons.length >= 5, 'Must provide detailed breakdown across factors');
assert(explanation.reasons.some(r => r.includes('Skill Similarity:')), 'Must explain skill similarity');
assert(explanation.reasons.some(r => r.includes('Distance:')), 'Must explain distance');
assert(explanation.reasons.some(r => r.includes('Availability:')), 'Must explain availability');
assert(explanation.reasons.some(r => r.includes('Experience:')), 'Must explain experience');
assert(explanation.reasons.some(r => r.includes('Local Demand:')), 'Must explain local demand');
assert(explanation.reasons.some(r => r.includes('Reliability:')), 'Must explain reliability');
console.log('✅ TEST 4 PASSED: Explainable AI output cleanly generated.\n');

console.log('====================================================');
console.log('🎉 ALL PHASE 2 HYBRID AI RANKING TESTS PASSED (4/4)!');
console.log('====================================================');
