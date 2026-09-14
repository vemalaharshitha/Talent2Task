import { sqliteManager } from './src/db/sqliteManager';
import { reliabilityService } from './src/services/reliabilityService';
import { calculateJobMatch } from './src/services/matchingService';
import type { User, Job } from './src/types';

async function runReliabilityTests() {
  console.log('\n======================================================');
  console.log('⚡ PHASE 8: RELIABILITY & CONTINUOUS FEEDBACK TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      if (detail) console.error(`   Details: ${detail}`);
      failed++;
    }
  }

  // TEST 1: Dynamic Worker Reliability Score Calculation (Zero Hardcoding)
  console.log('--- TEST 1: Dynamic Worker Reliability Score ---');
  const seeker1Reliability = reliabilityService.getWorkerReliability('usr_seeker_1');
  console.log('Seeker 1 Reliability:', {
    score: seeker1Reliability.score,
    tier: seeker1Reliability.reliabilityTier,
    rating: seeker1Reliability.averageRating,
    reviews: seeker1Reliability.totalReviews,
    completed: seeker1Reliability.tasksCompleted,
    completionRate: `${seeker1Reliability.completionRate}%`,
    tags: seeker1Reliability.positiveTags,
    summary: seeker1Reliability.dataSourceSummary
  });

  assert(seeker1Reliability.score > 0 && seeker1Reliability.score <= 100, 'Score is bounded between 10 and 100');
  assert(seeker1Reliability.averageRating === 5.0, 'Average rating matches actual 5.0 rating from seed data');
  assert(seeker1Reliability.totalReviews >= 1, 'Reflects actual reviews in database');
  assert(seeker1Reliability.completionRate === 100, 'Accurately computes 100% completion rate');
  assert(seeker1Reliability.positiveTags && seeker1Reliability.positiveTags.includes('Punctual'), 'Extracts behavioral review tags (Punctual)');
  assert(!seeker1Reliability.isNewWorker, 'Correctly identifies worker with established history');

  // TEST 2: New Worker Baseline (Graceful non-penalizing inclusion)
  console.log('\n--- TEST 2: New Worker Non-Penalizing Baseline ---');
  const dummyNewSeekerId = 'usr_seeker_new_untested';
  const newSeekerReliability = reliabilityService.getWorkerReliability(dummyNewSeekerId);
  console.log('New Seeker Reliability:', {
    score: newSeekerReliability.score,
    tier: newSeekerReliability.reliabilityTier,
    isNewWorker: newSeekerReliability.isNewWorker,
    summary: newSeekerReliability.dataSourceSummary
  });

  assert(newSeekerReliability.score === 80, 'New worker receives fair neutral 80/100 baseline');
  assert(newSeekerReliability.reliabilityTier === 'New Worker', 'Tier is classified as New Worker');
  assert(newSeekerReliability.isNewWorker === true, 'isNewWorker flag is set to true');

  // TEST 3: Full Closed-Loop Feedback Cycle
  // Recommendation -> Accepted -> Completed -> Rated -> Reliability Updated
  console.log('\n--- TEST 3: Complete Closed-Loop Feedback Pipeline ---');
  
  const testJobId = 'job_chn_003';
  const testWorkerId = 'usr_seeker_test_worker';

  // Step 3.1: Recommendation
  const recOutcome = sqliteManager.recordRecommendationOutcome(testJobId, testWorkerId, 91, 'usr_recruiter_1');
  assert(recOutcome.status === 'recommended', 'Step 1: Recommendation recorded with status "recommended"');
  assert(recOutcome.match_score === 91, 'Match score stored with recommendation');

  // Step 3.2: User accepts task
  sqliteManager.claimJob(testJobId, testWorkerId);
  const workerOutcomesAfterClaim = sqliteManager.getOutcomesForWorker(testWorkerId);
  const claimedOutcome = workerOutcomesAfterClaim.find(o => o.job_id === testJobId);
  assert(claimedOutcome?.status === 'accepted', 'Step 2: Task acceptance transitions outcome to "accepted"');
  assert(Boolean(claimedOutcome?.accepted_at), 'Timestamp recorded for task acceptance');

  // Step 3.3: Task completed
  sqliteManager.updateJobStatus(testJobId, 'COMPLETED');
  const workerOutcomesAfterComplete = sqliteManager.getOutcomesForWorker(testWorkerId);
  const completedOutcome = workerOutcomesAfterComplete.find(o => o.job_id === testJobId);
  assert(completedOutcome?.status === 'completed', 'Step 3: Task completion transitions outcome to "completed"');
  assert(Boolean(completedOutcome?.completed_at), 'Timestamp recorded for task completion');

  // Step 3.4: User provides rating/feedback
  sqliteManager.addReview({
    job_id: testJobId,
    job_title: 'OMR Tech Park Morning Food Distribution Coordinator',
    from_user_id: 'usr_recruiter_1',
    from_user_name: 'Tamil Nadu Logistics',
    to_user_id: testWorkerId,
    rating: 5,
    tags: ['Punctual', 'High Skill'],
    comment: 'Exceptional worker! Handled the crowd seamlessly on time.'
  });

  const workerOutcomesAfterRating = sqliteManager.getOutcomesForWorker(testWorkerId);
  const ratedOutcome = workerOutcomesAfterRating.find(o => o.job_id === testJobId);
  assert(ratedOutcome?.status === 'rated', 'Step 4: Review submission transitions outcome to "rated"');
  assert(ratedOutcome?.rating === 5, 'Rating score 5 saved to outcome');
  assert(Boolean(ratedOutcome?.feedback_comment), 'Feedback comment saved in outcome');

  // Step 3.5: Verify worker reliability updated dynamically from new outcome
  const updatedReliability = reliabilityService.getWorkerReliability(testWorkerId);
  console.log('Worker Reliability After Cycle:', {
    score: updatedReliability.score,
    tier: updatedReliability.reliabilityTier,
    completed: updatedReliability.tasksCompleted,
    completionRate: `${updatedReliability.completionRate}%`,
    rating: updatedReliability.averageRating
  });
  assert(updatedReliability.tasksCompleted >= 1, 'Reliability engine dynamically reflects completed task');
  assert(updatedReliability.averageRating === 5.0, 'Average rating updated to 5.0');
  assert(!updatedReliability.isNewWorker, 'Worker transitioned from new to verified track record');

  // TEST 4: Hybrid AI Ranking Engine Integration
  console.log('\n--- TEST 4: Integration with Hybrid AI Ranking Engine ---');
  const sampleSeeker: User = {
    id: 'usr_seeker_1',
    name: 'Karthik Raja',
    role: 'seeker',
    age: 24,
    experience: 2,
    phone: '+91 98401 23456',
    skills: ['Driving', 'Tamil Speaking', 'Smartphone Proficient'],
    free_time_slots: ['morning', 'evening'],
    preferred_language: 'ta',
    latitude: 13.0067,
    longitude: 80.2030,
    city: 'Chennai'
  };

  const sampleJob: Job = {
    id: 'job_chn_001',
    recruiter_id: 'usr_recruiter_1',
    title: 'Instant Delivery Rider',
    description: 'Guindy tech corridor deliveries',
    category: 'Delivery',
    required_skills: ['Driving', 'Tamil Speaking'],
    payout_amount: 190,
    payout_unit: 'hour',
    latitude: 13.0067,
    longitude: 80.2030,
    landmark_area: 'Guindy Industrial Estate, Chennai',
    status: 'OPEN',
    created_at: '2026-09-10 09:30:00'
  };

  const matchResult = calculateJobMatch(sampleSeeker, sampleJob);
  console.log('Hybrid Match with Dynamic Reliability:', {
    matchScore: matchResult.matchScore,
    reliabilityScore: matchResult.breakdown.reliabilityScore,
    workerReliabilityMetrics: matchResult.breakdown.workerReliabilityMetrics ? {
      score: matchResult.breakdown.workerReliabilityMetrics.score,
      tier: matchResult.breakdown.workerReliabilityMetrics.reliabilityTier,
      completionRate: matchResult.breakdown.workerReliabilityMetrics.completionRate
    } : null,
    explanation: matchResult.breakdown.explanation.reasons.find(r => r.startsWith('Reliability:'))
  });

  assert(matchResult.breakdown.workerReliabilityMetrics !== undefined, 'Breakdown contains workerReliabilityMetrics');
  assert(matchResult.breakdown.reliabilityScore > 0, 'Reliability score feeds into hybrid ranking formula');
  assert(
    matchResult.breakdown.explanation.reasons.some(r => r.includes('Reliability:')),
    'Explainable AI reasoning includes detailed transparent reliability rationale'
  );

  // Summary
  console.log('\n======================================================');
  console.log(`Test Execution Finished: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runReliabilityTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
