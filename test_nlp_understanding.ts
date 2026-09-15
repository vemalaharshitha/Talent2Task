import { nlpService } from './src/services/nlpService';
import { calculateJobMatchAsync, formatMatchExplanation } from './src/services/matchingService';
import { semanticService } from './src/services/semanticService';
import type { Job, User } from './src/types';

async function runNLPTests() {
  console.log('====================================================');
  console.log('🧪 TESTING PHASE 3: NLP / LLM REQUIREMENT UNDERSTANDING');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  // TEST 1: The user's exact specification prompt
  total++;
  console.log('📌 Test 1: Exact specification example');
  const prompt1 = 'I need an experienced AC technician near Madurai tomorrow evening.';
  console.log(`Input: "${prompt1}"`);
  
  const res1 = await nlpService.parseJobRequirement(prompt1);
  console.log('Extracted Structured Data:');
  console.log(`  • Intent: ${res1.intent}`);
  console.log(`  • Category: ${res1.category}`);
  console.log(`  • Skills: ${JSON.stringify(res1.skills)}`);
  console.log(`  • Location: City=${res1.location.city}, District=${res1.location.district}, Lat=${res1.location.latitude}, Lon=${res1.location.longitude}, Confidence=${res1.location.confidence}`);
  console.log(`  • Experience: Level=${res1.experience.level}, Years=${res1.experience.years}, Explicit=${res1.experience.isExplicit}`);
  console.log(`  • Availability: TimingText="${res1.availability.timingText}", Slots=${JSON.stringify(res1.availability.slots)}`);
  console.log(`  • Payout: Explicit=${res1.payout.isExplicit}, Amount=${res1.payout.amount}`);
  console.log(`  • Missing Fields: ${res1.missingFields.map(m => m.field).join(', ')}`);

  const t1SkillsValid = res1.skills.some(s => s.toLowerCase().includes('ac') || s.toLowerCase().includes('air-conditioner'));
  const t1LocValid = res1.location.city.toLowerCase() === 'madurai';
  const t1ExpValid = res1.experience.level === 'Experienced' && res1.experience.years >= 2;
  const t1AvailValid = res1.availability.slots.includes('Evening');
  const t1IntentValid = res1.intent === 'hire_worker';

  if (t1SkillsValid && t1LocValid && t1ExpValid && t1AvailValid && t1IntentValid) {
    console.log('✅ Test 1 PASSED: Skills, location, experience, availability, and intent accurately extracted.\n');
    passed++;
  } else {
    console.error('❌ Test 1 FAILED:', { t1SkillsValid, t1LocValid, t1ExpValid, t1AvailValid, t1IntentValid });
  }

  // TEST 2: Logistics gig with explicit landmark, rate, and timing
  total++;
  console.log('📌 Test 2: Multi-entity logistics prompt with landmark and payout');
  const prompt2 = 'Looking for 2 bike delivery riders in Coimbatore RS Puram for weekend morning shift, 200/hr';
  console.log(`Input: "${prompt2}"`);

  const res2 = await nlpService.parseJobRequirement(prompt2);
  console.log('Extracted Structured Data:');
  console.log(`  • Category: ${res2.category}`);
  console.log(`  • Skills: ${JSON.stringify(res2.skills)}`);
  console.log(`  • Location: City=${res2.location.city}, Landmark=${res2.location.landmark}`);
  console.log(`  • Availability: TimingText="${res2.availability.timingText}", Slots=${JSON.stringify(res2.availability.slots)}`);
  console.log(`  • Payout: Amount=${res2.payout.amount}/${res2.payout.unit}`);

  const t2CatValid = res2.category === 'Delivery';
  const t2CityValid = res2.location.city.toLowerCase() === 'coimbatore';
  const t2LandmarkValid = res2.location.landmark.toLowerCase().includes('puram');
  const t2PayoutValid = res2.payout.amount === 200 && res2.payout.unit === 'hour';
  const t2AvailValid = res2.availability.slots.includes('Morning');

  if (t2CatValid && t2CityValid && t2LandmarkValid && t2PayoutValid && t2AvailValid) {
    console.log('✅ Test 2 PASSED: Category, landmark, payout, and shift parsed successfully.\n');
    passed++;
  } else {
    console.error('❌ Test 2 FAILED:', { t2CatValid, t2CityValid, t2LandmarkValid, t2PayoutValid, t2AvailValid });
  }

  // TEST 3: Incomplete prompt handling (Graceful missing field prompts)
  total++;
  console.log('📌 Test 3: Incomplete input & missing fields detection');
  const prompt3 = 'Need someone for plumbing urgently';
  console.log(`Input: "${prompt3}"`);

  const res3 = await nlpService.parseJobRequirement(prompt3);
  console.log(`  • Extracted Skills: ${JSON.stringify(res3.skills)}`);
  console.log(`  • Missing Fields: ${res3.missingFields.map(m => `${m.field} (${m.label})`).join(', ')}`);

  const t3HasMissingLoc = res3.missingFields.some(m => m.field === 'location');
  const t3HasMissingPayout = res3.missingFields.some(m => m.field === 'payout');
  const t3HasSkills = res3.skills.some(s => s.toLowerCase().includes('plumb'));

  if (t3HasMissingLoc && t3HasMissingPayout && t3HasSkills) {
    console.log('✅ Test 3 PASSED: System gracefully prompts only for critical missing info (location, payout).\n');
    passed++;
  } else {
    console.error('❌ Test 3 FAILED:', { t3HasMissingLoc, t3HasMissingPayout, t3HasSkills });
  }

  // TEST 4: Seeker Intent Extraction
  total++;
  console.log('📌 Test 4: Seeker intent extraction');
  const prompt4 = 'I am looking for part time electrician work in Salem';
  console.log(`Input: "${prompt4}"`);

  const res4 = await nlpService.parseJobRequirement(prompt4);
  console.log(`  • Intent: ${res4.intent}`);
  console.log(`  • Skills: ${JSON.stringify(res4.skills)}`);
  console.log(`  • City: ${res4.location.city}`);

  const t4IntentValid = res4.intent === 'seek_job';
  const t4SkillsValid = res4.skills.some(s => s.toLowerCase().includes('electr'));
  const t4CityValid = res4.location.city.toLowerCase() === 'salem';

  if (t4IntentValid && t4SkillsValid && t4CityValid) {
    console.log('✅ Test 4 PASSED: Seeker intent, trade, and city identified.\n');
    passed++;
  } else {
    console.error('❌ Test 4 FAILED:', { t4IntentValid, t4SkillsValid, t4CityValid });
  }

  // TEST 5: Downstream Pipeline Integration (NLP -> Semantic Matching -> Hybrid Ranking)
  total++;
  console.log('📌 Test 5: Downstream integration with Semantic Matching & Hybrid Ranking');
  
  // Construct a synthetic job from NLP extracted data (Prompt 1)
  const syntheticJobFromNlp: Job = {
    id: 'nlp-job-1',
    recruiter_id: 'recruiter-1',
    title: res1.title,
    category: res1.category,
    description: res1.rawText,
    landmark_area: `${res1.location.landmark ? res1.location.landmark + ', ' : ''}${res1.location.city}`,
    latitude: res1.location.latitude,
    longitude: res1.location.longitude,
    payout_amount: 500,
    payout_unit: 'task',
    status: 'OPEN',
    claimed_by: null,
    required_skills: res1.skills,
    created_at: new Date().toISOString()
  };

  // Construct test worker profiles in Madurai
  const qualifiedWorker: User = {
    id: 'worker-ac-expert',
    phone: '9876543210',
    role: 'seeker',
    name: 'Karthik AC Specialist',
    age: 28,
    skills: ['Air-conditioner servicing technician', 'HVAC compressor repair'],
    experience: 4,
    latitude: 9.9250, // Near Madurai center
    longitude: 78.1190,
    city: 'Madurai',
    free_time_slots: ['Evening', 'Afternoon'],
    preferred_language: 'en'
  };

  const unrelatedWorker: User = {
    id: 'worker-gardener',
    phone: '9876543211',
    role: 'seeker',
    name: 'Muthu Gardener',
    age: 32,
    skills: ['Gardening and Landscaping'],
    experience: 1,
    latitude: 13.0827, // Chennai (far away)
    longitude: 80.2707,
    city: 'Chennai',
    free_time_slots: ['Morning'],
    preferred_language: 'en'
  };

  console.log('Evaluating Candidate 1 (Karthik AC Specialist in Madurai)...');
  const fit1 = await calculateJobMatchAsync(qualifiedWorker, syntheticJobFromNlp);
  console.log(`Candidate 1 Overall Match: ${fit1.matchScore}%`);
  console.log(`  - Semantic Skill Score: ${fit1.breakdown.semanticSkillScore}% (${fit1.breakdown.matchedSkills.join(', ')})`);
  console.log(`  - Distance Score: ${fit1.breakdown.distanceScore}% (${fit1.breakdown.distanceKm} km)`);
  console.log(`  - Experience Score: ${fit1.breakdown.experienceScore}% (${fit1.breakdown.experienceLevel})`);
  console.log(`  - Availability Score: ${fit1.breakdown.timeScore}% (${fit1.breakdown.availabilityStatus})`);

  console.log('Evaluating Candidate 2 (Muthu Gardener in Chennai)...');
  const fit2 = await calculateJobMatchAsync(unrelatedWorker, syntheticJobFromNlp);
  console.log(`Candidate 2 Overall Match: ${fit2.matchScore}%`);

  if (fit1.breakdown.explanation) {
    console.log('\nAI Explanation for Candidate 1:');
    console.log(`  Headline: ${fit1.breakdown.explanation.headline}`);
    console.log(`  Badge: [${fit1.breakdown.explanation.badgeTag}]`);
    (fit1.breakdown.explanation.reasons || []).forEach(r => console.log(`   • ${r}`));
  }

  const t5Fit1Superior = fit1.matchScore > 75;
  const t5Fit2Lower = fit2.matchScore < 50;
  const t5SkillMatched = fit1.breakdown.skillScore >= 75;

  if (t5Fit1Superior && t5Fit2Lower && t5SkillMatched) {
    console.log('✅ Test 5 PASSED: Extracted NLP job seamlessly powered Semantic AI Matching & Hybrid Ranking!\n');
    passed++;
  } else {
    console.error('❌ Test 5 FAILED:', { t5Fit1Superior, t5Fit2Lower, t5SkillMatched });
  }

  console.log('====================================================');
  console.log(`🏁 TEST SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================');

  if (passed === total) {
    console.log('✨ All NLP Understanding & Downstream Integration tests PASSED successfully!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runNLPTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
