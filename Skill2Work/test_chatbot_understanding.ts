/**
 * Automated Verification Script for Phase 25: AI Chatbot Understanding
 * Tests that all queries return genuine intent-matched responses without defaulting to plumbers or hardcoded replies.
 */

import { chatAssistantService, ChatMessage, ChatContextPayload } from './src/services/chatAssistantService';
import type { User, Job, SkillDemandStat } from './src/types';

// Mock context with diverse jobs across different trades & cities
const mockJobs: Job[] = [
  {
    id: 'job_plumb_1',
    title: 'Urgent Pipeline Repair',
    description: 'Fix bathroom pipe leak and drainage in T Nagar',
    category: 'Plumbing',
    required_skills: ['Pipe Fitting', 'Leak Repair'],
    payout_amount: 600,
    payout_unit: 'shift',
    latitude: 13.0418,
    longitude: 80.2341,
    city: 'Chennai',
    landmark_area: 'T Nagar',
    status: 'OPEN',
    recruiter_id: 'rec_1',
    created_at: new Date().toISOString(),
    expires_at: new Date().toISOString()
  },
  {
    id: 'job_paint_1',
    title: 'Exterior Wall Painting Shift',
    description: 'Looking for 2 painters for apartment primer and wall painting tomorrow',
    category: 'Painter',
    required_skills: ['Wall Painting', 'Primer Application'],
    payout_amount: 850,
    payout_unit: 'day',
    latitude: 13.0827,
    longitude: 80.2707,
    city: 'Chennai',
    landmark_area: 'Anna Nagar',
    status: 'OPEN',
    recruiter_id: 'rec_2',
    created_at: new Date().toISOString(),
    expires_at: new Date().toISOString()
  },
  {
    id: 'job_elec_1',
    title: 'Commercial Wiring & Switchboard Setup',
    description: 'Electrician needed for retail shop power lines and fuse fitting in Chennai',
    category: 'Electrical',
    required_skills: ['Wiring', 'Switchboard Repair'],
    payout_amount: 900,
    payout_unit: 'shift',
    latitude: 13.0827,
    longitude: 80.2707,
    city: 'Chennai',
    landmark_area: 'Guindy',
    status: 'OPEN',
    recruiter_id: 'rec_3',
    created_at: new Date().toISOString(),
    expires_at: new Date().toISOString()
  },
  {
    id: 'job_driver_1',
    title: 'Immediate Two-Wheeler / Car Driver',
    description: 'Driver for morning logistics shift and transport delivery tomorrow',
    category: 'Driver',
    required_skills: ['LMV Driving License', 'City Navigation'],
    payout_amount: 750,
    payout_unit: 'day',
    latitude: 13.0827,
    longitude: 80.2707,
    city: 'Chennai',
    landmark_area: 'Velachery',
    status: 'OPEN',
    recruiter_id: 'rec_4',
    created_at: new Date().toISOString(),
    expires_at: new Date().toISOString()
  },
  {
    id: 'job_carp_1',
    title: 'Door Frame & Furniture Carpentry',
    description: 'Carpenter for fitting custom wooden cabinets',
    category: 'Carpentry',
    required_skills: ['Wood Cutting', 'Furniture Assembly'],
    payout_amount: 800,
    payout_unit: 'shift',
    latitude: 13.0600,
    longitude: 80.2500,
    city: 'Chennai',
    landmark_area: 'Nungambakkam',
    status: 'OPEN',
    recruiter_id: 'rec_5',
    created_at: new Date().toISOString(),
    expires_at: new Date().toISOString()
  }
];

const mockUsers: User[] = [
  {
    id: 'user_seeker_1',
    name: 'Karthik Subramanian',
    email: 'karthik@talent2task.test',
    role: 'seeker',
    phone: '9876543210',
    skills: ['Plumbing', 'Electrical'],
    city: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    rating: 4.8,
    is_verified: true,
    preferred_language: 'en',
    experience: 3,
    free_time_slots: ['morning', 'evening']
  },
  {
    id: 'user_painter_1',
    name: 'Murugan S',
    email: 'murugan@talent2task.test',
    role: 'seeker',
    phone: '9876543211',
    skills: ['Painter', 'Wall Painting', 'Primer Application'],
    city: 'Chennai',
    latitude: 13.0800,
    longitude: 80.2600,
    rating: 4.9,
    is_verified: true,
    preferred_language: 'en',
    experience: 5,
    free_time_slots: ['full_day']
  },
  {
    id: 'user_driver_1',
    name: 'Selvam R',
    email: 'selvam@talent2task.test',
    role: 'seeker',
    phone: '9876543212',
    skills: ['Driver', 'LMV Driving License'],
    city: 'Chennai',
    latitude: 13.0700,
    longitude: 80.2500,
    rating: 4.9,
    is_verified: true,
    preferred_language: 'en',
    experience: 7,
    free_time_slots: ['morning', 'afternoon']
  }
];

const mockStats: SkillDemandStat[] = [
  {
    id: 'stat_1',
    skill: 'Electrical',
    currentDemandLevel: 'HIGH',
    avgHourlyPay: 120,
    activeJobsCount: 15,
    district: 'Chennai',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'stat_2',
    skill: 'Painter',
    currentDemandLevel: 'HIGH',
    avgHourlyPay: 110,
    activeJobsCount: 12,
    district: 'Chennai',
    lastUpdated: new Date().toISOString()
  }
];

const baseContext: ChatContextPayload = {
  currentUser: mockUsers[0],
  jobs: mockJobs,
  users: mockUsers,
  skillDemandStats: mockStats,
  language: 'en',
  currentCoords: { latitude: 13.0827, longitude: 80.2707 },
  radiusKm: 10,
  history: []
};

async function runTests() {
  console.log('====================================================');
  console.log('🚀 TESTING TALENT2TASK AI CHATBOT UNDERSTANDING (PHASE 25)');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function testCase(description: string, query: string, validator: (res: ChatMessage, history?: ChatMessage[]) => boolean, customHistory?: ChatMessage[]) {
    total++;
    const ctx: ChatContextPayload = {
      ...baseContext,
      history: customHistory || []
    };

    const res = await chatAssistantService.handleQuery(query, ctx);
    const ok = validator(res, customHistory);
    if (ok) {
      passed++;
      console.log(`✅ [PASS] "${query}" -> Intent: ${res.intent || 'N/A'}`);
      console.log(`   Sample Reply: ${res.text.slice(0, 100).replace(/\n/g, ' ')}...`);
    } else {
      console.error(`❌ [FAIL] "${query}"`);
      console.error(`   Intent: ${res.intent}`);
      console.error(`   Full Reply: ${res.text}`);
      console.error(`   Job Cards: ${res.jobCards?.map(j => j.title).join(', ') || 'None'}`);
    }
    console.log('----------------------------------------------------');
  }

  // 1. Greeting
  await testCase('Greeting', 'Hi', (res) => {
    return res.intent === 'GREETING' && (res.jobCards === undefined || res.jobCards.length === 0);
  });

  // 2. Plumbers search
  await testCase('Find plumbers near me', 'Find plumbers near me.', (res) => {
    const isPlumber = res.jobCards?.some(j => j.category === 'Plumbing' || j.title.includes('Pipeline')) ||
      res.text.toLowerCase().includes('plumb');
    return isPlumber && !res.text.toLowerCase().includes('carpenter');
  });

  // 3. Painters search - MUST NOT RETURN PLUMBER
  await testCase('Find painters near me', 'Find painters near me.', (res) => {
    const isPainter = res.jobCards?.some(j => j.category === 'Painter' || j.title.includes('Painting')) ||
      res.text.toLowerCase().includes('paint');
    const hasPlumber = res.jobCards?.some(j => j.category === 'Plumbing');
    return isPainter && !hasPlumber;
  });

  // 4. Electrician jobs in Chennai
  await testCase('Electrician jobs in Chennai', 'Are there electrician jobs in Chennai?', (res) => {
    const isElec = res.jobCards?.some(j => j.category === 'Electrical' || j.title.includes('Wiring')) ||
      res.text.toLowerCase().includes('electr');
    const hasPlumber = res.jobCards?.some(j => j.category === 'Plumbing');
    return isElec && !hasPlumber;
  });

  // 5. Carpenter search within 5 km
  await testCase('Find carpenter within 5 km', 'Find a carpenter within 5 km.', (res) => {
    const isCarp = res.jobCards?.some(j => j.category === 'Carpentry') || res.text.toLowerCase().includes('carpenter');
    const hasPlumber = res.jobCards?.some(j => j.category === 'Plumbing');
    const hasRadiusAction = res.actions?.some(a => a.type === 'SET_RADIUS' && a.payload?.radiusKm === 5);
    return isCarp && !hasPlumber && Boolean(hasRadiusAction);
  });

  // 6. Show highly rated drivers
  await testCase('Show highly rated drivers', 'Show highly rated drivers.', (res) => {
    const isDriver = res.jobCards?.some(j => j.category === 'Driver') || res.text.toLowerCase().includes('driver');
    const hasPlumber = res.jobCards?.some(j => j.category === 'Plumbing');
    return isDriver && !hasPlumber;
  });

  // 7. What jobs are available tomorrow?
  await testCase('Jobs available tomorrow', 'What jobs are available tomorrow?', (res) => {
    return res.intent === 'JOB_SEARCH' && res.text.toLowerCase().includes('tomorrow');
  });

  // 8. What skills should I learn?
  await testCase('What skills should I learn?', 'What skills should I learn?', (res) => {
    return res.intent === 'SKILL_GAP' && res.actions?.some(a => a.type === 'ADD_SKILL' || a.type === 'NAVIGATE_TAB');
  });

  // 9. What skills are in demand in my city?
  await testCase('What skills are in demand?', 'What skills are in demand in my city?', (res) => {
    return res.intent === 'SKILL_GAP' && res.text.toLowerCase().includes('demand');
  });

  // 10. Why was this job recommended to me?
  await testCase('Why was this job recommended?', 'Why was this job recommended to me?', (res) => {
    return res.intent === 'EXPLAIN_JOB_RECOMMENDATION' && Boolean(res.explanationBreakdown);
  });

  // 11. How does matching work?
  await testCase('How does Talent2Task matching work?', 'How does Talent2Task matching work?', (res) => {
    return res.intent === 'EXPLAIN_MATCH_ALGORITHM' && res.text.includes('Semantic Skill Overlap');
  });

  // 12. House painting job creation
  await testCase('Need someone to paint my house tomorrow', 'I need someone to paint my house tomorrow.', (res) => {
    return (res.intent === 'CREATE_JOB' || res.intent === 'WORKER_SEARCH') &&
      (res.text.toLowerCase().includes('paint') || res.actions?.some(a => a.payload?.category === 'Painter'));
  });

  // 13. Ambiguous search -> must ask clarification question
  await testCase('Find me a job', 'Find me a job.', (res) => {
    return res.intent === 'AMBIGUOUS_CLARIFICATION' && res.text.includes('What type of work');
  });

  // 14. What is Talent2Task?
  await testCase('What is Talent2Task?', 'What is Talent2Task?', (res) => {
    return res.intent === 'PLATFORM_ABOUT' && res.text.includes('Hyperlocal AI');
  });

  // 15. Unrelated question (e.g., weather) -> must not dump plumbers
  await testCase('What is the weather like?', "What's the weather like?", (res) => {
    return res.intent === 'UNRELATED_CONVERSATIONAL' && (res.jobCards === undefined || res.jobCards.length === 0);
  });

  // 16. Multi-turn Follow-up: "Find painters near Chennai" -> then "Only show jobs with high ratings."
  const historyTurn1: ChatMessage[] = [
    {
      id: 'm1',
      sender: 'user',
      text: 'Find painters near Chennai.',
      timestamp: '10:00'
    },
    {
      id: 'm2',
      sender: 'assistant',
      text: 'Found 1 painting opportunities in Chennai.',
      timestamp: '10:00'
    }
  ];

  await testCase('Follow-up: Only show jobs with high ratings', 'Only show jobs with high ratings.', (res) => {
    const isPainter = res.jobCards?.some(j => j.category === 'Painter') || res.text.toLowerCase().includes('paint');
    const hasPlumber = res.jobCards?.some(j => j.category === 'Plumbing');
    return isPainter && !hasPlumber;
  }, historyTurn1);

  // 17. Multi-turn Follow-up: "Find electrician jobs." -> then "Within 3 km."
  const historyTurn2: ChatMessage[] = [
    {
      id: 'm3',
      sender: 'user',
      text: 'Find electrician jobs.',
      timestamp: '10:05'
    },
    {
      id: 'm4',
      sender: 'assistant',
      text: 'Here are available electrician jobs.',
      timestamp: '10:05'
    }
  ];

  await testCase('Follow-up: Within 3 km', 'Within 3 km.', (res) => {
    const isElec = res.jobCards?.some(j => j.category === 'Electrical') || res.text.toLowerCase().includes('electr');
    const hasRadius = res.actions?.some(a => a.type === 'SET_RADIUS' && a.payload?.radiusKm === 3);
    const hasPlumber = res.jobCards?.some(j => j.category === 'Plumbing');
    return isElec && !hasPlumber && Boolean(hasRadius);
  }, historyTurn2);

  // 18. Conversational variation: "Can you help me find someone for pipe repair?"
  await testCase('Conversational pipe repair', 'Can you help me find someone for pipe repair?', (res) => {
    return res.text.toLowerCase().includes('plumb') || (res.jobCards !== undefined && res.jobCards.some(j => j.category === 'Plumbing'));
  });

  // 19. Conversational variation: "Is there any plumbing work nearby?"
  await testCase('Plumbing work nearby', 'Is there any plumbing work nearby?', (res) => {
    return res.intent === 'JOB_SEARCH' || res.intent === 'JOB_SEARCH_EMPTY';
  });

  // 20. Recruiter mode: "Find plumbers near me."
  const recruiterContext: ChatContextPayload = {
    ...baseContext,
    currentUser: {
      id: 'rec_1',
      name: 'Priya Narayanan',
      email: 'priya@recruiter.test',
      role: 'recruiter',
      phone: '9876543299',
      skills: ['Recruitment'],
      city: 'Chennai',
      latitude: 13.0827,
      longitude: 80.2707,
      is_verified: true,
      preferred_language: 'en'
    }
  };

  total++;
  const recRes = await chatAssistantService.handleQuery('Find plumbers near me.', recruiterContext);
  if (recRes.intent === 'WORKER_SEARCH' && recRes.workerCards && recRes.workerCards.some(w => w.skills.includes('Plumbing'))) {
    passed++;
    console.log(`✅ [PASS] Recruiter "Find plumbers near me." -> Intent: ${recRes.intent}`);
    console.log(`   Sample Reply: ${recRes.text.slice(0, 100).replace(/\n/g, ' ')}...`);
  } else {
    console.error(`❌ [FAIL] Recruiter "Find plumbers near me."`);
  }
  console.log('----------------------------------------------------');

  // 21. Recruiter mode: "Find a highly rated carpenter within 5 km."
  total++;
  const carpRes = await chatAssistantService.handleQuery('Find a highly rated carpenter within 5 km.', recruiterContext);
  if (carpRes.intent === 'WORKER_SEARCH' || carpRes.intent === 'WORKER_SEARCH_EMPTY') {
    passed++;
    console.log(`✅ [PASS] Recruiter "Find a highly rated carpenter within 5 km." -> Intent: ${carpRes.intent}`);
    console.log(`   Sample Reply: ${carpRes.text.slice(0, 100).replace(/\n/g, ' ')}...`);
  } else {
    console.error(`❌ [FAIL] Recruiter "Find a highly rated carpenter within 5 km."`);
  }
  console.log('----------------------------------------------------');

  // 22. Multilingual Tamil: "நான் என்ன திறன்களைக் கற்க வேண்டும்?"
  total++;
  const taContext: ChatContextPayload = {
    ...baseContext,
    language: 'ta'
  };
  const taRes = await chatAssistantService.handleQuery('நான் என்ன திறன்களைக் கற்க வேண்டும்?', taContext);
  if (taRes.intent === 'SKILL_GAP' && (taRes.text.includes('திறன்') || taRes.text.includes('தேவை'))) {
    passed++;
    console.log(`✅ [PASS] Tamil "நான் என்ன திறன்களைக் கற்க வேண்டும்?" -> Intent: ${taRes.intent}`);
    console.log(`   Sample Reply: ${taRes.text.slice(0, 100).replace(/\n/g, ' ')}...`);
  } else {
    console.error(`❌ [FAIL] Tamil "நான் என்ன திறன்களைக் கற்க வேண்டும்?"`);
  }
  console.log('----------------------------------------------------');

  console.log(`\n🎉 RESULTS: ${passed} / ${total} TESTS PASSED`);
  if (passed === total) {
    console.log('🏆 ALL CHATBOT UNDERSTANDING TESTS PASSED PERFECTLY!');
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
