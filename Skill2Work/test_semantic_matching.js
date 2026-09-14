import { semanticService, calculateCosineSimilarity } from './src/services/semanticService.ts';
import { calculateJobMatchWithSemantic, calculateJobMatch } from './src/services/matchingService.ts';

async function runTests() {
  console.log('====================================================');
  console.log('TEST SUITE: PHASE 1 — REAL SEMANTIC AI MATCHING');
  console.log('====================================================\n');

  // Test 1: Math Verification of Cosine Similarity
  console.log('--- TEST 1: MATHEMATICAL COSINE SIMILARITY ---');
  const vecA = [1, 0, 0];
  const vecB = [1, 0, 0];
  const vecC = [0, 1, 0];
  const vecD = [0.7071, 0.7071, 0];

  const simIdentical = calculateCosineSimilarity(vecA, vecB);
  const simOrthogonal = calculateCosineSimilarity(vecA, vecC);
  const sim45Deg = calculateCosineSimilarity(vecA, vecD);

  console.log(`Identical vectors: ${simIdentical} (Expected: 1.0) -> ${simIdentical === 1 ? 'PASS' : 'FAIL'}`);
  console.log(`Orthogonal vectors: ${simOrthogonal} (Expected: 0.0) -> ${simOrthogonal === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`45-degree vectors: ${sim45Deg.toFixed(4)} (Expected: ~0.7071) -> ${Math.abs(sim45Deg - 0.7071) < 0.001 ? 'PASS' : 'FAIL'}\n`);

  // Test 2: Pre-computed & Live Sentence Transformer Embeddings
  console.log('--- TEST 2: SENTENCE TRANSFORMER SKILL EMBEDDINGS ---');
  const evalPairs = [
    {
      userSkill: "AC repair and maintenance",
      jobSkill: "Air-conditioner servicing technician",
      expectHigh: true
    },
    {
      userSkill: "Two-wheeler delivery rider",
      jobSkill: "Bike courier package delivery",
      expectHigh: true
    },
    {
      userSkill: "House painting and whitewashing",
      jobSkill: "Home interior wall painter",
      expectHigh: true
    },
    {
      userSkill: "Plumbing and pipe fitting",
      jobSkill: "Water leakage pipe technician",
      expectHigh: true
    },
    {
      userSkill: "Cooking and catering chef",
      jobSkill: "Air-conditioner servicing technician",
      expectHigh: false
    }
  ];

  for (const pair of evalPairs) {
    const evalResult = await semanticService.evaluateSkillsSemantic([pair.userSkill], [pair.jobSkill]);
    const match = evalResult.matches[0];
    const simPct = (match.similarity * 100).toFixed(1);
    const passed = pair.expectHigh ? match.isSemanticMatch : !match.isSemanticMatch;

    console.log(`Worker: "${pair.userSkill}" vs Job: "${pair.jobSkill}"`);
    console.log(`  -> Cosine Similarity: ${simPct}%`);
    console.log(`  -> Semantic Match: ${match.isSemanticMatch ? 'YES' : 'NO'}`);
    console.log(`  -> Expected High: ${pair.expectHigh ? 'YES' : 'NO'} | Result: ${passed ? 'PASS' : 'FAIL'}\n`);
  }

  // Test 3: End-to-End Job Match Calculation for User's Example
  console.log('--- TEST 3: END-TO-END WORKER VS JOB MATCH SCORING ---');
  const workerAC = {
    id: 'test_worker_1',
    role: 'seeker',
    name: 'Suresh Kumar',
    age: 26,
    phone: '+91 98401 99999',
    skills: ['AC repair and maintenance', 'Electrical safety'],
    free_time_slots: ['Immediate', 'Morning'],
    preferred_language: 'ta',
    latitude: 13.0067,
    longitude: 80.2030,
    experience: 3,
    city: 'Chennai'
  };

  const jobAC = {
    id: 'job_test_ac',
    recruiter_id: 'rec_1',
    title: 'HVAC Air Conditioner Servicing Specialist',
    description: 'Looking for a skilled technician for residential split AC servicing, gas pressure checking, and filter maintenance.',
    category: 'Technician',
    required_skills: ['Air-conditioner servicing technician', 'Electrical safety'],
    payout_amount: 550,
    payout_unit: 'hour',
    latitude: 13.0100,
    longitude: 80.2050,
    landmark_area: 'Guindy, Chennai',
    status: 'OPEN',
    claimed_by: null,
    created_at: '2026-09-12 10:00:00'
  };

  const matchResult = await semanticService.evaluateSkillsSemantic(workerAC.skills, jobAC.required_skills);
  const fullMatch = calculateJobMatchWithSemantic(workerAC, jobAC, matchResult);

  console.log(`Worker Skills: ${JSON.stringify(workerAC.skills)}`);
  console.log(`Job Required Skills: ${JSON.stringify(jobAC.required_skills)}`);
  console.log(`Overall Match Score: ${fullMatch.matchScore}%`);
  console.log(`Skill Score: ${fullMatch.breakdown.skillScore}%`);
  console.log(`Distance Score: ${fullMatch.breakdown.distanceScore}% (${fullMatch.distanceKm.toFixed(2)} km)`);
  console.log(`AI Powered: ${fullMatch.breakdown.isAiPowered ? 'YES' : 'NO'}`);
  console.log(`Semantic Skill Matches:`, fullMatch.breakdown.skillMatches);

  if (fullMatch.matchScore >= 80 && fullMatch.breakdown.matchedSkills.includes('Air-conditioner servicing technician')) {
    console.log('\n>>> FULL TEST SUITE PASSED SUCCESSFULLY! <<<\n');
  } else {
    console.error('\n>>> TEST SUITE FAILED! <<<');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
