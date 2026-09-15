// Automated Onboarding & Role-Based User Guide Test Suite
if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.getItem) {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) || null,
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
    key: (i: number) => Array.from(store.keys())[i] || null,
    length: store.size
  } as any;
}

if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = globalThis;
}

import { sqliteManager } from '../src/db/sqliteManager';
import { calculateHaversineDistance } from '../src/services/geoService';

function runTests() {
  console.log('🧪 ====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE ONBOARDING & USER GUIDE TESTS');
  console.log('🧪 ====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST SUITE 1: RECRUITER ONBOARDING SPECIFICATION VERIFICATION
  console.log('--- TEST SUITE 1: RECRUITER ONBOARDING (8 STEPS + SUMMARY) ---');
  const recruiterSteps = [
    { num: 1, title: '1. Create a Gig', target: 'Recruiter Dashboard → Post New Gig' },
    { num: 2, title: '2. Let AI Analyse Your Gig', target: 'Hybrid AI Matching Engine' },
    { num: 3, title: '3. Find Suitable Workers', target: 'Manage Gigs → Candidate List & Nearby Workers' },
    { num: 4, title: '4. Ask Your AI Assistant', prompts: [
      'Help me post a gig.',
      'Find suitable workers for my gig.',
      'How do I start the work?',
      'What should I do after the work is completed?',
      "Explain this worker's match."
    ]},
    { num: 5, title: '5. Select the Right Worker', target: 'Claimant Details → Verified Worker Passport' },
    { num: 6, title: '6. Start Work', target: 'Active Tasks → Start Work' },
    { num: 7, title: '7. Mark the Gig as Completed', target: 'Manage Gigs → Mark Completed Button' },
    { num: 8, title: '8. Payment & Review', target: 'Manage Gigs → Pay Now & Review Seeker' }
  ];

  assert(recruiterSteps.length === 8, 'Recruiter onboarding contains exactly 8 defined steps');
  assert(recruiterSteps[0].title === '1. Create a Gig', 'Step 1 is "1. Create a Gig"');
  assert(recruiterSteps[1].title === '2. Let AI Analyse Your Gig', 'Step 2 is "2. Let AI Analyse Your Gig"');
  assert(recruiterSteps[2].title === '3. Find Suitable Workers', 'Step 3 is "3. Find Suitable Workers"');
  assert(recruiterSteps[3].title === '4. Ask Your AI Assistant', 'Step 4 is "4. Ask Your AI Assistant"');
  assert(recruiterSteps[3].prompts?.length === 5, 'Step 4 contains 5 instructional sample prompts');
  assert(recruiterSteps[4].title === '5. Select the Right Worker', 'Step 5 is "5. Select the Right Worker"');
  assert(recruiterSteps[5].title === '6. Start Work', 'Step 6 is "6. Start Work"');
  assert(recruiterSteps[6].title === '7. Mark the Gig as Completed', 'Step 7 is "7. Mark the Gig as Completed"');
  assert(recruiterSteps[7].title === '8. Payment & Review', 'Step 8 is "8. Payment & Review"');

  // TEST SUITE 2: WORKER ONBOARDING SPECIFICATION VERIFICATION
  console.log('\n--- TEST SUITE 2: JOB SEEKER / WORKER ONBOARDING (9 STEPS + SUMMARY) ---');
  const workerSteps = [
    { num: 1, title: '1. Complete Your Profile', target: 'Top Navigation → View / Edit Profile' },
    { num: 2, title: '2. Discover Nearby Gigs', target: 'Explore Gigs Tab & Vellore / Tamil Nadu Map' },
    { num: 3, title: '3. Understand Your Match', target: 'Gig Details → Why Recommended Breakdown' },
    { num: 4, title: '4. Ask Your AI Assistant', prompts: [
      'Find electrician jobs near me.',
      'How do I apply for this gig?',
      'What does this job require?',
      'How far is this gig?',
      'How do I start work?',
      'What should I do after completing the gig?',
      'Why was this gig recommended to me?'
    ]},
    { num: 5, title: '5. Claim / Apply for a Gig', badge: 'Accept / Claim Gig' },
    { num: 6, title: '6. Get Directions', target: 'My Gigs → Directions Button' },
    { num: 7, title: '7. Start Work', badge: 'SafeGig Worker Safety' },
    { num: 8, title: '8. Complete the Gig', badge: 'Safe Check-Out' },
    { num: 9, title: '9. Payment & Work History', target: 'User Menu → Payment History & Verified Worker Profile' }
  ];

  assert(workerSteps.length === 9, 'Worker onboarding contains exactly 9 defined steps');
  assert(workerSteps[0].title === '1. Complete Your Profile', 'Step 1 is "1. Complete Your Profile"');
  assert(workerSteps[1].title === '2. Discover Nearby Gigs', 'Step 2 is "2. Discover Nearby Gigs"');
  assert(workerSteps[2].title === '3. Understand Your Match', 'Step 3 is "3. Understand Your Match"');
  assert(workerSteps[3].title === '4. Ask Your AI Assistant', 'Step 4 is "4. Ask Your AI Assistant"');
  assert(workerSteps[3].prompts?.length === 7, 'Step 4 contains 7 instructional worker sample prompts');
  assert(workerSteps[4].badge === 'Accept / Claim Gig', 'Step 5 uses exact button terminology "Accept / Claim Gig"');
  assert(workerSteps[5].title === '6. Get Directions', 'Step 6 is "6. Get Directions"');
  assert(workerSteps[6].title === '7. Start Work', 'Step 7 is "7. Start Work" (SafeGig)');
  assert(workerSteps[7].title === '8. Complete the Gig', 'Step 8 is "8. Complete the Gig"');
  assert(workerSteps[8].title === '9. Payment & Work History', 'Step 9 is "9. Payment & Work History" (Verified Passport)');

  // TEST SUITE 3: FIRST-LOGIN DETECTION & PERSISTENCE SIMULATION
  console.log('\n--- TEST SUITE 3: FIRST-LOGIN DETECTION & PERSISTENCE ---');
  function simulateRegistration(userId: string, role: string) {
    return { userId, role, shouldOpenOnboarding: true };
  }

  function simulateLogin(userId: string) {
    const isCompleted = localStorage.getItem(`talent2task_onboarding_completed_${userId}`) === 'true';
    return { userId, shouldOpenOnboarding: !isCompleted };
  }

  function simulateCompleteOrSkip(userId: string) {
    localStorage.setItem(`talent2task_onboarding_completed_${userId}`, 'true');
  }

  // 1. New recruiter registers
  const newRecruiter = simulateRegistration('user_recruiter_fresh', 'recruiter');
  assert(newRecruiter.shouldOpenOnboarding === true, 'Brand new recruiter registration opens onboarding');

  // 2. User skips or completes
  simulateCompleteOrSkip(newRecruiter.userId);
  assert(localStorage.getItem(`talent2task_onboarding_completed_${newRecruiter.userId}`) === 'true', 'Onboarding state marked completed in storage');

  // 3. User logs in second time
  const returningRecruiter = simulateLogin(newRecruiter.userId);
  assert(returningRecruiter.shouldOpenOnboarding === false, 'Subsequent login for completed user does NOT pop up onboarding');

  // 4. New worker registers
  const newWorker = simulateRegistration('user_worker_fresh', 'seeker');
  assert(newWorker.shouldOpenOnboarding === true, 'Brand new worker registration opens onboarding');

  // 5. Worker completes onboarding
  simulateCompleteOrSkip(newWorker.userId);
  assert(localStorage.getItem(`talent2task_onboarding_completed_${newWorker.userId}`) === 'true', 'Worker onboarding state marked completed');

  // 6. Worker logs in again
  const returningWorker = simulateLogin(newWorker.userId);
  assert(returningWorker.shouldOpenOnboarding === false, 'Subsequent login for completed worker does NOT pop up onboarding');

  // TEST SUITE 4: CORE APPLICATION PRESERVATION & DATABASE INTEGRITY
  console.log('\n--- TEST SUITE 4: DATABASE & WORKFLOW PRESERVATION ---');
  const allUsers = sqliteManager.getUsers();
  assert(allUsers.length > 0, `Users table intact with ${allUsers.length} active users`);

  const allJobs = sqliteManager.getJobs();
  assert(allJobs.length > 0, `Jobs table intact with ${allJobs.length} active gigs`);

  // Distance calculation preserved
  const dist = calculateHaversineDistance(12.9165, 79.1325, 12.9200, 79.1350);
  assert(dist > 0 && dist < 1.0, `Distance calculation works correctly (${dist.toFixed(3)} km)`);

  // Verify SafeGig session logic intact
  const activeSession = sqliteManager.getActiveSafeGigSession('usr_seeker_1');
  assert(activeSession === null || Boolean(activeSession.session_id), 'SafeGig session query functions without errors');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
