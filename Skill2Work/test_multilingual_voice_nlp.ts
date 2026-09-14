import { nlpService } from './src/services/nlpService';
import { voiceService, SAMPLE_VOICE_PRESETS } from './src/services/voiceService';
import { semanticService } from './src/services/semanticService';
import { calculateJobMatchAsync } from './src/services/matchingService';
import type { Job, User } from './src/types';

async function runMultilingualVoiceTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING PHASE 6: MULTILINGUAL & VOICE AI TEST SUITE');
  console.log('======================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (details) console.error(`     Details: ${details}`);
    }
  }

  // TEST 1: Language Detection
  console.log('--- TEST GROUP 1: Dynamic Language Detection ---');
  const langTa = nlpService.detectLanguage('எனக்கு ஒரு பிளம்பர் வேண்டும்');
  assert(langTa === 'ta', 'Detects Tamil script correctly', `Expected "ta", got "${langTa}"`);

  const langTe = nlpService.detectLanguage('నాకు ఒక ప్లంబర్ కావాలి');
  assert(langTe === 'te', 'Detects Telugu script correctly', `Expected "te", got "${langTe}"`);

  const langHi = nlpService.detectLanguage('मुझे मदुरै में एसी तकनीशियन चाहिए शाम को');
  assert(langHi === 'hi', 'Detects Devanagari/Hindi script correctly', `Expected "hi", got "${langHi}"`);

  const langEn = nlpService.detectLanguage('I need an experienced AC technician near Madurai tomorrow evening');
  assert(langEn === 'en', 'Detects English script correctly', `Expected "en", got "${langEn}"`);

  // TEST 2: Tamil Natural Language Understanding (Requirement Example: "எனக்கு ஒரு பிளம்பர் வேண்டும்")
  console.log('\n--- TEST GROUP 2: Tamil NLP & Intent Understanding ---');
  const reqTamil = nlpService.parseJobRequirement('எனக்கு ஒரு பிளம்பர் வேண்டும்');
  console.log('   Tamil Parse Output:', {
    detectedLanguage: reqTamil.detectedLanguage,
    intent: reqTamil.intent,
    category: reqTamil.category,
    skills: reqTamil.skills,
    confidence: reqTamil.confidence
  });

  assert(reqTamil.detectedLanguage === 'ta', 'Tamil Requirement: Language detected as "ta"');
  assert(reqTamil.intent === 'hire_worker', 'Tamil Requirement: Intent classified as "hire_worker"');
  assert(
    reqTamil.skills.includes('Plumbing and pipe fitting'),
    'Tamil Requirement: Extracted canonical skill "Plumbing and pipe fitting"',
    `Skills: ${JSON.stringify(reqTamil.skills)}`
  );
  assert(reqTamil.category === 'Home Services', 'Tamil Requirement: Classified into "Home Services" category');

  // TEST 3: Telugu Natural Language Understanding (Example: "నాకు ఒక ప్లంబర్ కావాలి")
  console.log('\n--- TEST GROUP 3: Telugu NLP & Intent Understanding ---');
  const reqTelugu = nlpService.parseJobRequirement('నాకు ఒక ప్లంబర్ కావాలి');
  console.log('   Telugu Parse Output:', {
    detectedLanguage: reqTelugu.detectedLanguage,
    intent: reqTelugu.intent,
    category: reqTelugu.category,
    skills: reqTelugu.skills
  });

  assert(reqTelugu.detectedLanguage === 'te', 'Telugu Requirement: Language detected as "te"');
  assert(reqTelugu.intent === 'hire_worker', 'Telugu Requirement: Intent classified as "hire_worker"');
  assert(
    reqTelugu.skills.includes('Plumbing and pipe fitting'),
    'Telugu Requirement: Extracted canonical skill "Plumbing and pipe fitting"',
    `Skills: ${JSON.stringify(reqTelugu.skills)}`
  );

  // TEST 4: Hindi Natural Language Understanding (Example: "मुझे मदुरै में एसी तकनीशियन चाहिए शाम को")
  console.log('\n--- TEST GROUP 4: Hindi NLP & Entity Extraction ---');
  const reqHindi = nlpService.parseJobRequirement('मुझे मदुरै में एसी तकनीशियन चाहिए शाम को');
  console.log('   Hindi Parse Output:', {
    detectedLanguage: reqHindi.detectedLanguage,
    intent: reqHindi.intent,
    city: reqHindi.location.city,
    skills: reqHindi.skills,
    slots: reqHindi.availability.slots
  });

  assert(reqHindi.detectedLanguage === 'hi', 'Hindi Requirement: Language detected as "hi"');
  assert(reqHindi.intent === 'hire_worker', 'Hindi Requirement: Intent classified as "hire_worker"');
  assert(reqHindi.location.city.toLowerCase() === 'madurai', 'Hindi Requirement: Extracted city "Madurai" from "मदुरै"');
  assert(
    reqHindi.skills.includes('Air-conditioner servicing technician'),
    'Hindi Requirement: Extracted skill "Air-conditioner servicing technician"'
  );
  assert(reqHindi.availability.slots.includes('Evening'), 'Hindi Requirement: Extracted shift "Evening" from "शाम को"');

  // TEST 5: English NLP Understanding (Example: "I need an experienced AC technician near Madurai tomorrow evening")
  console.log('\n--- TEST GROUP 5: English NLP & Full Entity Extraction ---');
  const reqEnglish = nlpService.parseJobRequirement('I need an experienced AC technician near Madurai tomorrow evening');
  console.log('   English Parse Output:', {
    detectedLanguage: reqEnglish.detectedLanguage,
    intent: reqEnglish.intent,
    city: reqEnglish.location.city,
    skills: reqEnglish.skills,
    experience: reqEnglish.experience.level,
    slots: reqEnglish.availability.slots
  });

  assert(reqEnglish.detectedLanguage === 'en', 'English Requirement: Language detected as "en"');
  assert(reqEnglish.location.city.toLowerCase() === 'madurai', 'English Requirement: Location detected as "Madurai"');
  assert(reqEnglish.experience.level === 'Experienced', 'English Requirement: Experience level detected as "Experienced"');
  assert(reqEnglish.availability.slots.includes('Evening'), 'English Requirement: Availability contains "Evening"');
  assert(
    reqEnglish.skills.includes('Air-conditioner servicing technician'),
    'English Requirement: Extracted skill "Air-conditioner servicing technician"'
  );

  // TEST 6: Multilingual Cities & Delivery/Cooking/Electrical Entities
  console.log('\n--- TEST GROUP 6: Cross-Lingual Delivery & Cooking Entities ---');
  const reqTaDelivery = nlpService.parseJobRequirement('கோயம்புத்தூரில் பைக் டெலிவரி ஆட்கள் தேவை காலை ஷிப்ட்');
  assert(reqTaDelivery.location.city.toLowerCase() === 'coimbatore', 'Tamil: Extracted city Coimbatore from "கோயம்புத்தூரில்"');
  assert(reqTaDelivery.skills.includes('Two-wheeler delivery rider'), 'Tamil: Extracted delivery rider skill');
  assert(reqTaDelivery.availability.slots.includes('Morning'), 'Tamil: Extracted morning slot from "காலை"');

  const reqHiCook = nlpService.parseJobRequirement('चेन्नई में शादी के लिए खाना बनाने वाला रसोइया चाहिए');
  assert(reqHiCook.location.city.toLowerCase() === 'chennai', 'Hindi: Extracted city Chennai from "चेन्नई"');
  assert(reqHiCook.skills.includes('Cooking / Catering'), 'Hindi: Extracted cooking skill from "रसोइया"');

  // TEST 7: End-to-End Pipeline: Voice STT -> NLP Extraction -> Semantic Matching -> Hybrid Ranking
  console.log('\n--- TEST GROUP 7: Full End-to-End Pipeline Validation ---');
  console.log('   Simulating Voice Speech-to-Text: "எனக்கு ஒரு பிளம்பர் வேண்டும்"');

  // Step A: Voice STT Output
  const voiceTranscript = 'எனக்கு ஒரு பிளம்பர் வேண்டும்';
  
  // Step B: Language Detection
  const voiceLang = nlpService.detectLanguage(voiceTranscript);
  assert(voiceLang === 'ta', 'Pipeline Step 1: Speech-to-Text language identified as "ta"');

  // Step C: NLP Understanding & Extraction
  const voiceParsed = nlpService.parseJobRequirement(voiceTranscript, 'Madurai');
  assert(voiceParsed.skills.includes('Plumbing and pipe fitting'), 'Pipeline Step 2: Extracted canonical skill');

  // Step D: Semantic Matching with Sentence Transformer
  const candidateSeekerSkill = 'Water leakage pipe technician';
  const semanticSim = await semanticService.calculateSimilarity(voiceParsed.skills[0], candidateSeekerSkill);
  console.log(`   Semantic Similarity between "${voiceParsed.skills[0]}" and "${candidateSeekerSkill}": ${(semanticSim * 100).toFixed(1)}%`);
  assert(semanticSim >= 0.50, 'Pipeline Step 3: Sentence Transformer yields high semantic similarity (>=50%)');

  // Step E: Hybrid AI Ranking Calculation
  const mockSeeker: User = {
    id: 'seeker_plumber_01',
    name: 'Muthuvel K',
    phone: '9840123456',
    role: 'seeker',
    skills: ['Plumbing and pipe fitting', 'Water leakage pipe technician', 'Tamil Speaking'],
    experience_years: 3,
    preferred_location: 'Madurai Central',
    preferred_radius: 10,
    hourly_rate: 250,
    rating: 4.8,
    review_count: 24,
    created_at: new Date().toISOString(),
    latitude: 9.9252,
    longitude: 78.1198
  };

  const mockJob: Job = {
    id: 'job_voice_01',
    recruiter_id: 'rec_01',
    title: voiceParsed.title,
    category: voiceParsed.category,
    description: voiceParsed.rawText,
    required_skills: voiceParsed.skills,
    payout_amount: 350,
    payout_unit: 'hour',
    latitude: 9.9250,
    longitude: 78.1190,
    landmark_area: 'Madurai Central',
    preferred_slots: voiceParsed.availability.slots,
    status: 'OPEN',
    created_at: new Date().toISOString()
  };

  const hybridResult = await calculateJobMatchAsync(mockSeeker, mockJob);
  console.log('   Hybrid Ranking Score:', `${hybridResult.matchScore}% match`);
  console.log('   Hybrid Breakdown:', {
    skillScore: hybridResult.breakdown.skillScore,
    distanceScore: hybridResult.breakdown.distanceScore,
    timeScore: hybridResult.breakdown.timeScore,
    experienceScore: hybridResult.breakdown.experienceScore
  });

  assert(hybridResult.matchScore >= 80, 'Pipeline Step 4: Hybrid Ranking computes dynamic match percentage (>=80%)');
  assert(hybridResult.breakdown.skillScore >= 85, 'Pipeline Step 5: High skill similarity factor recorded in breakdown');

  // TEST 8: Voice Service Language Tag Mapping & Presets
  console.log('\n--- TEST GROUP 8: Voice Service Language Configurations ---');
  assert(voiceService.getRecognitionLanguageTag('ta') === 'ta-IN', 'Voice Service: Tamil maps to "ta-IN"');
  assert(voiceService.getRecognitionLanguageTag('te') === 'te-IN', 'Voice Service: Telugu maps to "te-IN"');
  assert(voiceService.getRecognitionLanguageTag('hi') === 'hi-IN', 'Voice Service: Hindi maps to "hi-IN"');
  assert(voiceService.getRecognitionLanguageTag('en') === 'en-IN', 'Voice Service: English maps to "en-IN"');
  assert(SAMPLE_VOICE_PRESETS.length >= 4, 'Voice Service: Presets provided across all 4 supported languages');

  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL PHASE 6 MULTILINGUAL & VOICE AI TESTS PASSED PERFECTLY!');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
  console.log('======================================================\n');
}

runMultilingualVoiceTests().catch(err => {
  console.error('Unhandled error running test suite:', err);
  process.exit(1);
});
