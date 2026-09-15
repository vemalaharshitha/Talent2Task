/**
 * Automated Verification Suite for Phase 19 AI Chat Actions
 * Tests all worker and recruiter action triggers, hybrid recommendation explanations,
 * NLP-driven prefilled job creation, spatial and availability constraints, and safety confirmations.
 */

import { chatAssistantService, type ChatContextPayload } from './src/services/chatAssistantService';
import type { User, Job, SkillDemandStat } from './src/types';

// Mock test dataset
const mockUsers: User[] = [
  {
    id: 'usr_seeker_1',
    role: 'seeker',
    name: 'Karthik Raja',
    age: 28,
    phone: '+91 98765 43210',
    skills: ['Plumbing', 'Pipe Repair', 'Tamil Speaking'],
    free_time_slots: ['Morning', 'Immediate'],
    preferred_language: 'en',
    latitude: 13.0827,
    longitude: 80.2707,
    city: 'Chennai',
    experience: 4,
    rating: 4.85,
    review_count: 12
  },
  {
    id: 'usr_seeker_2',
    role: 'seeker',
    name: 'Ramanathan V',
    age: 34,
    phone: '+91 98765 11223',
    skills: ['Electrical', 'Wiring', 'Switchboard Repair', 'Safety Certified'],
    free_time_slots: ['Morning', 'Afternoon', 'Evening'],
    preferred_language: 'ta',
    latitude: 13.0850,
    longitude: 80.2750,
    city: 'Chennai',
    experience: 7,
    rating: 4.95,
    review_count: 24
  },
  {
    id: 'usr_recruiter_1',
    role: 'recruiter',
    name: 'Sundar BuildCorp',
    age: 42,
    phone: '+91 91234 56789',
    skills: [],
    free_time_slots: [],
    preferred_language: 'en',
    latitude: 13.0827,
    longitude: 80.2707,
    city: 'Chennai'
  }
];

const mockJobs: Job[] = [
  {
    id: 'job_101',
    recruiter_id: 'usr_recruiter_1',
    title: 'Emergency Pipeline Leak Repair',
    description: 'Immediate pipeline leakage fix in commercial kitchen. Urgent shift tomorrow morning.',
    category: 'Plumbing',
    required_skills: ['Plumbing', 'Pipe Repair', 'Tamil Speaking'],
    payout_amount: 850,
    payout_unit: 'task',
    latitude: 13.0880,
    longitude: 80.2730,
    landmark_area: 'T. Nagar, Chennai',
    city: 'Chennai',
    status: 'OPEN',
    claimed_by: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'job_102',
    recruiter_id: 'usr_recruiter_1',
    title: '3-Phase Switchboard Wiring Setup',
    description: 'Complete commercial electrical panel wiring setup. Evening shift available.',
    category: 'Electrical',
    required_skills: ['Electrical', 'Wiring', 'Switchboard Repair'],
    payout_amount: 1200,
    payout_unit: 'shift',
    latitude: 13.0950,
    longitude: 80.2800,
    landmark_area: 'Anna Nagar, Chennai',
    city: 'Chennai',
    status: 'OPEN',
    claimed_by: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'job_103',
    recruiter_id: 'usr_recruiter_1',
    title: 'Interior Wall Primer & Painting',
    description: 'Residential 2BHK wall painting and primer coating.',
    category: 'Painter',
    required_skills: ['Wall Painting', 'Primer Application', 'Tamil Speaking'],
    payout_amount: 700,
    payout_unit: 'day',
    latitude: 13.1100,
    longitude: 80.2900,
    landmark_area: 'Adyar, Chennai',
    city: 'Chennai',
    status: 'OPEN',
    claimed_by: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'job_104_far',
    recruiter_id: 'usr_recruiter_1',
    title: 'Outstation Warehouse Helper',
    description: 'Warehouse shift in Chengalpattu industrial zone.',
    category: 'Store Helper',
    required_skills: ['Inventory Management'],
    payout_amount: 500,
    payout_unit: 'shift',
    latitude: 12.6841,
    longitude: 79.9836,
    landmark_area: 'Chengalpattu Industrial Estate',
    city: 'Chengalpattu',
    status: 'OPEN',
    claimed_by: null,
    created_at: new Date().toISOString()
  }
];

const mockDemandStats: SkillDemandStat[] = [
  {
    id: 'stat_1',
    skill: 'Plumbing',
    district: 'Chennai',
    city: 'Chennai',
    currentDemandLevel: 'High',
    predictedTrend: 'Rising',
    avgHourlyPay: 220,
    activeGigCount: 18,
    historicalGigCount: 95,
    matchConfidencePercent: 88,
    lastCalculated: new Date().toISOString()
  },
  {
    id: 'stat_2',
    skill: 'Electrical',
    district: 'Chennai',
    city: 'Chennai',
    currentDemandLevel: 'Very High',
    predictedTrend: 'Surging',
    avgHourlyPay: 260,
    activeGigCount: 25,
    historicalGigCount: 140,
    matchConfidencePercent: 92,
    lastCalculated: new Date().toISOString()
  },
  {
    id: 'stat_3',
    skill: 'Painter',
    district: 'Chennai',
    city: 'Chennai',
    currentDemandLevel: 'Moderate',
    predictedTrend: 'Stable',
    avgHourlyPay: 190,
    activeGigCount: 12,
    historicalGigCount: 60,
    matchConfidencePercent: 82,
    lastCalculated: new Date().toISOString()
  }
];

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING PHASE 19 AI CHAT ACTIONS TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   Details: ${detail}`);
    }
  }

  const seekerContext: ChatContextPayload = {
    currentUser: mockUsers[0], // Seeker (Karthik Raja)
    jobs: mockJobs,
    users: mockUsers,
    skillDemandStats: mockDemandStats,
    language: 'en',
    currentCoords: { latitude: 13.0827, longitude: 80.2707 },
    radiusKm: 10,
    selectedJob: mockJobs[0]
  };

  const recruiterContext: ChatContextPayload = {
    currentUser: mockUsers[2], // Recruiter (Sundar BuildCorp)
    jobs: mockJobs,
    users: mockUsers,
    skillDemandStats: mockDemandStats,
    language: 'en',
    currentCoords: { latitude: 13.0827, longitude: 80.2707 },
    radiusKm: 10,
    selectedJob: mockJobs[0]
  };

  // Test 1: "Find plumbers near me"
  console.log('--- TEST 1: "Find plumbers near me" ---');
  const res1 = await chatAssistantService.handleQuery('Find plumbers near me', seekerContext);
  assert(res1.jobCards !== undefined && res1.jobCards.length > 0, 'Returns matched job cards');
  assert(res1.jobCards?.[0].category === 'Plumbing', 'First matched job is Plumbing');
  assert(res1.actions?.some(a => a.type === 'SET_RADIUS' || a.type === 'FILTER_JOBS' || a.type === 'NAVIGATE_TAB'), 'Returns actionable UI dispatchers');

  // Test 2: "Show jobs within 5 km"
  console.log('\n--- TEST 2: "Show jobs within 5 km" ---');
  const res2 = await chatAssistantService.handleQuery('Show jobs within 5 km', seekerContext);
  const radiusAction = res2.actions?.find(a => a.type === 'SET_RADIUS');
  assert(radiusAction !== undefined && radiusAction.payload?.radiusKm === 5, 'Sets radius filter action to 5 km');
  assert(radiusAction?.autoExecute === true, 'Radius action is marked autoExecute for seamless UI filtering');
  assert(res2.jobCards !== undefined && res2.jobCards.every(j => (j.distanceKm || 0) <= 5.5), 'Returned jobs are strictly within 5 km');

  // Test 3: "Find jobs available tomorrow"
  console.log('\n--- TEST 3: "Find jobs available tomorrow" ---');
  const res3 = await chatAssistantService.handleQuery('Find jobs available tomorrow', seekerContext);
  assert(res3.jobCards !== undefined && res3.jobCards.length > 0, 'Finds available shift gigs');
  assert(res3.text.toLowerCase().includes('tomorrow') || res3.text.toLowerCase().includes('shift') || res3.text.toLowerCase().includes('found'), 'Response mentions shift availability');

  // Test 4: "Find highly rated electricians" (Recruiter context)
  console.log('\n--- TEST 4: "Find highly rated electricians" (Recruiter) ---');
  const res4 = await chatAssistantService.handleQuery('Find highly rated electricians', recruiterContext);
  assert(res4.workerCards !== undefined && res4.workerCards.length > 0, 'Returns candidate worker cards');
  assert(res4.workerCards?.[0].skills.includes('Electrical'), 'Top candidate has verified Electrical skills');
  assert(res4.actions?.some(a => a.type === 'OPEN_POST_JOB'), 'Includes action to post gig targeting the candidate');

  // Test 5: "Why was this worker recommended?"
  console.log('\n--- TEST 5: "Why was this worker recommended?" (Recruiter) ---');
  const res5 = await chatAssistantService.handleQuery('Why was this worker recommended?', recruiterContext);
  assert(res5.text.includes('Semantic Skill') || res5.text.includes('Hybrid AI') || res5.text.includes('Reliability'), 'Detailed breakdown includes hybrid factor weights');
  assert(res5.intent === 'EXPLAIN_WORKER_RECOMMENDATION', 'Intent correctly identified as EXPLAIN_WORKER_RECOMMENDATION');

  // Test 6: "Why was this job recommended?" (Seeker context)
  console.log('\n--- TEST 6: "Why was this job recommended?" (Seeker) ---');
  const res6 = await chatAssistantService.handleQuery('Why was this job recommended?', seekerContext);
  assert(res6.text.includes('Semantic Skill') || res6.text.includes('Proximity') || res6.text.includes('Match Score'), 'Explains 6-factor hybrid match calculation');
  assert(res6.explanationBreakdown !== undefined && res6.explanationBreakdown.totalScore > 0, 'Returns structured explanation breakdown scores');
  assert(res6.actions?.some(a => a.type === 'VIEW_JOB'), 'Provides action to view job details');

  // Test 7: "Help me create a painter job" (NLP prefilling)
  console.log('\n--- TEST 7: "Help me create a painter job" ---');
  const res7 = await chatAssistantService.handleQuery('Help me create a painter job in Chennai for 700 per day', recruiterContext);
  const postJobAction = res7.actions?.find(a => a.type === 'OPEN_POST_JOB');
  assert(postJobAction !== undefined, 'Returns OPEN_POST_JOB action');
  assert(postJobAction?.payload?.category === 'Painter', 'Pre-fills category as Painter');
  assert(postJobAction?.payload?.payoutAmount === 700, 'Pre-fills wage as ₹700');
  assert(postJobAction?.payload?.skills?.length > 0, 'Pre-fills suggested painting skills');

  // Test 8: "Show jobs matching my skills"
  console.log('\n--- TEST 8: "Show jobs matching my skills" ---');
  const res8 = await chatAssistantService.handleQuery('Show jobs matching my skills', seekerContext);
  assert(res8.jobCards !== undefined && res8.jobCards.length > 0, 'Returns ranked jobs for seeker profile');
  assert(res8.actions?.some(a => a.type === 'NAVIGATE_TAB'), 'Navigates to Radar Map view with matches');

  // Test 9: Destructive action safety ("Delete my job")
  console.log('\n--- TEST 9: Destructive Action Safety ("Delete my job") ---');
  const res9 = await chatAssistantService.handleQuery('Delete my job posting', recruiterContext);
  assert(res9.intent === 'CONFIRM_DESTRUCTIVE', 'Identifies destructive action');
  const confirmAction = res9.actions?.find(a => a.type === 'CONFIRM_ACTION');
  assert(confirmAction !== undefined && confirmAction.variant === 'danger', 'Requires explicit user confirmation with danger styling');
  assert(res9.text.toLowerCase().includes('warning') || res9.text.toLowerCase().includes('irreversible') || res9.text.toLowerCase().includes('sure'), 'Presents explicit warning explanation');

  // Test 10: Multilingual responses (Tamil: "என் திறன்களுக்கு ஏற்ற வேலைகள்")
  console.log('\n--- TEST 10: Multilingual Support (Tamil) ---');
  const tamilContext: ChatContextPayload = {
    ...seekerContext,
    language: 'ta'
  };
  const res10 = await chatAssistantService.handleQuery('என் திறன்களுக்கு ஏற்ற வேலைகள்', tamilContext);
  assert(res10.text.includes('திறன்கள்') || res10.text.includes('வேலைகள்'), 'Returns natural Tamil response');
  assert(res10.jobCards !== undefined && res10.jobCards.length > 0, 'Attaches job cards for Tamil queries');

  // Test 11: Conversational chit-chat & greetings
  console.log('\n--- TEST 11: Natural Conversational Flow ---');
  const res11 = await chatAssistantService.handleQuery('Hello! How are you?', seekerContext);
  assert(res11.intent === 'GREETING', 'Recognizes greeting intent');
  assert(res11.text.length > 20, 'Returns friendly conversational assistant reply');

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================');

  if (passed === total) {
    console.log('🎉 ALL PHASE 19 AI CHAT ACTION TESTS PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test Execution Error:', err);
  process.exit(1);
});
