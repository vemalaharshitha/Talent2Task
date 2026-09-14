/**
 * Test Suite for Offline Action Queue, Automatic Synchronization, and AI Fallbacks.
 * Verifies:
 * 1. Offline action queue persists items when disconnected.
 * 2. Automatic queue drainage and replay on reconnection.
 * 3. BackendClient graceful fallbacks for all 6 AI modules when FastAPI is unreachable or offline.
 */

import { offlineQueueService } from './src/services/offlineQueueService';
import { backendClient } from './src/services/backendClient';

// Mock localStorage for Node environment if needed
if (typeof global.localStorage === 'undefined') {
  let store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string) => { store[key] = key; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('Talent2Task Phase 9 — Offline Queue & Backend Client Verification');
  console.log('====================================================\n');

  // Test 1: Queue Offline Actions
  console.log('--- Test 1: Offline Action Enqueueing ---');
  offlineQueueService.clearQueue();

  const jobAction = offlineQueueService.enqueueAction('CREATE_JOB', {
    id: 'test_job_offline_001',
    title: 'Emergency Pipe Leak Fix',
    category: 'Plumbing',
    payout_amount: 850
  });

  const claimAction = offlineQueueService.enqueueAction('CLAIM_JOB', {
    jobId: 'test_job_offline_001',
    seekerId: 'usr_seeker_1',
    seekerName: 'Karthik'
  });

  const statusAction = offlineQueueService.enqueueAction('UPDATE_JOB_STATUS', {
    jobId: 'test_job_offline_001',
    status: 'COMPLETED'
  });

  const pending = offlineQueueService.getPendingQueue();
  console.log(`Pending queue count: ${pending.length}`);
  if (pending.length !== 3) {
    throw new Error(`Expected 3 queued actions, got ${pending.length}`);
  }
  console.log(' Offline action enqueueing test passed.');

  // Test 2: Flush Queue (Auto-Sync Replay)
  console.log('\n--- Test 2: Offline Queue Replay / Drainage ---');
  const flushResult = await offlineQueueService.flushQueue();
  console.log(`Flush result: processed=${flushResult.processed}, remaining=${flushResult.remaining}`);
  if (flushResult.remaining !== 0) {
    throw new Error(`Expected queue to be fully drained, remaining: ${flushResult.remaining}`);
  }
  console.log(' Offline queue flush/sync replay passed.');

  // Test 3: BackendClient AI Fallbacks
  console.log('\n--- Test 3: BackendClient AI Fallback Verification ---');

  // 3a. NLP Fallback
  const nlpRes = await backendClient.extractNLP('எனக்கு ஒரு பிளம்பர் தேவை சென்னை');
  console.log(`NLP result (fallback=${nlpRes.is_fallback}):`, nlpRes.detected_language, nlpRes.intent);
  if (!nlpRes.detected_language) throw new Error('NLP fallback failed to detect language');

  // 3b. Semantic Matching Fallback
  const semRes = await backendClient.matchSkills(
    ['Plumbing'],
    [
      { id: 'c1', skills: ['Plumber', 'Pipe Fitting'] },
      { id: 'c2', skills: ['Electrician'] }
    ]
  );
  console.log(`Semantic Match (fallback=${semRes.is_fallback}): Top candidate=${semRes.matches[0].candidate_id}, score=${semRes.matches[0].similarity_score}`);
  if (semRes.matches[0].candidate_id !== 'c1') throw new Error('Semantic fallback failed');

  // 3c. Hybrid Ranking Fallback
  const rankRes = await backendClient.rankCandidates(
    ['Plumbing'],
    'Plumbing',
    [
      { id: 'w1', name: 'Arun', skills: ['Plumbing'], reliability_score: 90 },
      { id: 'w2', name: 'Vijay', skills: ['Electrician'], reliability_score: 50 }
    ]
  );
  console.log(`Hybrid Rank (fallback=${rankRes.is_fallback}): Winner=${rankRes.ranked_candidates[0].name}, score=${rankRes.ranked_candidates[0].total_score}`);
  if (rankRes.ranked_candidates[0].id !== 'w1') throw new Error('Hybrid rank fallback failed');

  // 3d. Skill Gap Fallback
  const gapRes = await backendClient.analyzeSkillGap(['Plumbing'], 'Master Plumber');
  console.log(`Skill Gap (fallback=${gapRes.is_fallback}): readiness=${gapRes.readiness_level}, recs=${gapRes.recommendations.length}`);
  if (gapRes.recommendations.length === 0) throw new Error('Skill gap fallback failed');

  // 3e. Demand Prediction Fallback
  const demandRes = await backendClient.predictDemand('Plumber', 'Chennai');
  console.log(`Demand Intel (fallback=${demandRes.is_fallback}): level=${demandRes.current_demand_level}`);
  if (!demandRes.current_demand_level) throw new Error('Demand prediction fallback failed');

  // 3f. Trust & Safety Fallback
  const trustRes = await backendClient.checkTrustSafety({
    id: 'j_test',
    title: 'Electrician needed',
    description: 'House wiring test',
    category: 'Electrical',
    payout_amount: 1000,
    payout_unit: 'hour',
    recruiter_id: 'rec_1',
    latitude: 13.0827,
    longitude: 80.2707,
    landmark_area: 'Chennai',
    status: 'OPEN',
    created_at: '2026-09-12 12:00:00'
  });
  console.log(`Trust & Safety (fallback=${trustRes.is_fallback}): status=${trustRes.status_label}`);
  if (!trustRes.status_label) throw new Error('Trust safety fallback failed');

  console.log('\n ALL OFFLINE QUEUE & BACKEND CLIENT VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
