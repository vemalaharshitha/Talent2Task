import { trustSafetyService } from './src/services/trustSafetyService';
import { sqliteManager } from './src/db/sqliteManager';
import type { Job, User } from './src/types';

function runTests() {
  console.log('========================================================');
  console.log('🧪 TESTING PHASE 7 — TRUST & SAFETY INTELLIGENCE');
  console.log('========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}${details ? ` -> ${details}` : ''}`);
    }
  }

  // --- Test 1: Unrealistic Payment Detection ---
  console.log('\n--- 1. Unrealistic Payment Detection ---');
  const normalJob: Job = {
    id: 'job_test_normal',
    recruiter_id: 'usr_rec_1',
    title: 'AC Servicing Technician',
    description: 'Looking for an experienced AC technician to service residential split units in Katpadi.',
    category: 'Electrical & AC',
    required_skills: ['AC Repair', 'Electrical Wiring'],
    payout_amount: 350,
    payout_unit: 'hour',
    latitude: 12.9698,
    longitude: 79.1559,
    landmark_area: 'Katpadi, Vellore',
    status: 'OPEN'
  };

  const highPayJob: Job = {
    ...normalJob,
    id: 'job_test_high_pay',
    payout_amount: 50000,
    payout_unit: 'hour'
  };

  const lowPayJob: Job = {
    ...normalJob,
    id: 'job_test_low_pay',
    payout_amount: 15,
    payout_unit: 'hour'
  };

  const assessNormal = trustSafetyService.evaluateJobTrust(normalJob);
  const assessHighPay = trustSafetyService.evaluateJobTrust(highPayJob);
  const assessLowPay = trustSafetyService.evaluateJobTrust(lowPayJob);

  assert(
    !assessNormal.riskSignals.some(s => s.type === 'unrealistic_payment'),
    'Realistic wage (₹350/hr) raises no payment risk signals'
  );

  assert(
    assessHighPay.riskSignals.some(s => s.type === 'unrealistic_payment' && s.severity === 'high'),
    'Extremely high wage (₹50,000/hr) triggers high-severity unrealistic_payment signal'
  );

  assert(
    assessHighPay.status === 'potential_risk_detected',
    'High-risk pay results in non-accusatory status "potential_risk_detected"'
  );

  assert(
    assessHighPay.headline === 'Potential Risk Detected',
    'Headline matches exact requirement: "Potential Risk Detected"'
  );

  assert(
    assessLowPay.riskSignals.some(s => s.type === 'unrealistic_payment'),
    'Below minimum statutory wage (₹15/hr) raises payment warning signal'
  );

  // --- Test 2: Advance Fee & External Payment Detection ---
  console.log('\n--- 2. Advance Fee & Upfront Payment Detection ---');
  const advanceFeeJob: Job = {
    ...normalJob,
    id: 'job_test_fee',
    title: 'Data Entry Assistant',
    description: 'Work from home. Must transfer a refundable registration fee of Rs 500 via Google Pay / UPI deposit before receiving tasks.'
  };

  const assessAdvanceFee = trustSafetyService.evaluateJobTrust(advanceFeeJob);

  assert(
    assessAdvanceFee.riskSignals.some(s => s.type === 'external_payment_request' && s.severity === 'high'),
    'Request for registration fee / deposit detected with high severity'
  );

  assert(
    assessAdvanceFee.status === 'potential_risk_detected',
    'Advance fee job flagged with "potential_risk_detected"'
  );

  assert(
    Boolean(assessAdvanceFee.riskSignals.find(s => s.type === 'external_payment_request')?.evidence),
    'Detected signal includes explicit textual evidence for transparency'
  );

  // --- Test 3: Sensitive Info & OTP Request Detection ---
  console.log('\n--- 3. Sensitive Personal Info & Credential Demands ---');
  const sensitiveInfoJob: Job = {
    ...normalJob,
    id: 'job_test_sensitive',
    title: 'Bank KYC Helper',
    description: 'Immediate joining. Please share your Aadhaar OTP, ATM PIN, and banking password for background verification.'
  };

  const assessSensitive = trustSafetyService.evaluateJobTrust(sensitiveInfoJob);

  assert(
    assessSensitive.riskSignals.some(s => s.type === 'sensitive_info_request' && s.severity === 'high'),
    'Requests for Aadhaar OTP / banking password detected as high severity'
  );

  // --- Test 4: Suspicious Description & Get-Rich-Quick Schemes ---
  console.log('\n--- 4. Suspicious Descriptions & Schemes ---');
  const schemeJob: Job = {
    ...normalJob,
    id: 'job_test_scheme',
    title: 'Online Typing Work',
    description: 'Work 1 hour daily and earn 1 lakh per day guaranteed income. Contact our Telegram group for crypto investment.'
  };

  const assessScheme = trustSafetyService.evaluateJobTrust(schemeJob);

  assert(
    assessScheme.riskSignals.some(s => s.type === 'suspicious_description' || s.type === 'external_payment_request'),
    'Get-rich-quick claims and Telegram/crypto redirects flagged'
  );

  // --- Test 5: Repeated / Duplicate Content Analysis ---
  console.log('\n--- 5. Repeated / Duplicate Job Postings ---');
  const duplicate1: Job = {
    ...normalJob,
    id: 'dup_1',
    recruiter_id: 'rec_spammer_9',
    title: 'Urgent Delivery Boy Needed',
    description: 'Need delivery boy urgently with bike in Chennai.'
  };
  const duplicate2: Job = { ...duplicate1, id: 'dup_2' };
  const duplicate3: Job = { ...duplicate1, id: 'dup_3' };

  const allJobsPool = [duplicate1, duplicate2, duplicate3];
  const assessDuplicate = trustSafetyService.evaluateJobTrust(duplicate3, null, allJobsPool);

  assert(
    assessDuplicate.riskSignals.some(s => s.type === 'duplicate_content'),
    'Multiple identical postings from same recruiter detected as duplicate_content'
  );

  // --- Test 6: Recruiter History Depth & Insufficient Data State ---
  console.log('\n--- 6. Recruiter History Depth & Transparency ---');
  const newRecruiter: User = {
    id: 'usr_new_recruiter',
    role: 'recruiter',
    name: 'New Shop Owner',
    phone: '9876543210',
    skills: [],
    free_time_slots: [],
    preferred_language: 'en',
    experience: 0,
    created_at: new Date().toISOString()
  };

  const establishedRecruiter: User = {
    ...newRecruiter,
    id: 'usr_established_recruiter',
    name: 'Vellore Tech Park',
    rating: 4.9,
    experience: 3,
    created_at: '2024-01-01'
  };

  const assessNew = trustSafetyService.evaluateJobTrust(normalJob, newRecruiter, [normalJob]);
  const assessEstablished = trustSafetyService.evaluateJobTrust(normalJob, establishedRecruiter, [normalJob]);

  assert(
    !assessNew.hasSufficientRecruiterHistory,
    'New recruiter correctly identified as hasSufficientRecruiterHistory = false'
  );

  assert(
    assessNew.status === 'insufficient_data',
    'Clean job with new recruiter shows "insufficient_data" status rather than inventing a false high rating'
  );

  assert(
    assessNew.headline.includes('Standard Verification'),
    'Transparent headline for new recruiter: "New Recruiter (Standard Verification)"'
  );

  assert(
    assessEstablished.hasSufficientRecruiterHistory && assessEstablished.status === 'verified',
    'Established recruiter with 4.9 rating receives "verified" status'
  );

  // --- Test 7: Non-Accusatory Result Wording ---
  console.log('\n--- 7. Non-Accusatory Phrasing Compliance ---');
  const allAssessments = [assessHighPay, assessAdvanceFee, assessSensitive, assessScheme, assessDuplicate];
  
  for (const a of allAssessments) {
    assert(
      !a.headline.toLowerCase().includes('fraud') &&
      !a.headline.toLowerCase().includes('scam') &&
      !a.headline.toLowerCase().includes('fake user'),
      `Assessment headline "${a.headline}" does not use accusatory claims`
    );
  }

  // --- Test 8: User Reporting Mechanism & SQLite Storage ---
  console.log('\n--- 8. User Reporting & Persistence ---');
  const testJobId = 'job_report_test_1';
  const testReporterId = 'usr_seeker_tester';

  const createdReport = sqliteManager.submitReport(
    testJobId,
    testReporterId,
    'Request for Upfront Payment / Deposit',
    'Recruiter asked for Rs 300 uniform deposit in WhatsApp chat.'
  );

  assert(
    Boolean(createdReport.id) && createdReport.job_id === testJobId,
    'Report created with unique ID and correct job reference'
  );

  assert(
    createdReport.status === 'PENDING_REVIEW',
    'Report initialized in PENDING_REVIEW state (human review queue)'
  );

  const reportsForJob = sqliteManager.getReportsForJob(testJobId);
  assert(
    reportsForJob.length >= 1 && reportsForJob[0].reporter_id === testReporterId,
    'sqliteManager.getReportsForJob successfully retrieves persisted reports'
  );

  const allReports = sqliteManager.getAllReports();
  assert(
    allReports.some(r => r.id === createdReport.id),
    'sqliteManager.getAllReports includes the newly filed report'
  );

  // --- Test 9: Zero Automated Banning ---
  console.log('\n--- 9. Zero Automated Banning Verification ---');
  // Confirm that even when a job has risk signals or a report, sqliteManager still retains the job
  sqliteManager.createJob({
    recruiter_id: newRecruiter.id,
    title: 'High Pay Typing Work',
    description: 'Work from home Rs 50000/hr. Deposit Rs 1000.',
    category: 'Delivery',
    required_skills: ['Driving'],
    payout_amount: 50000,
    payout_unit: 'hour',
    latitude: 12.9698,
    longitude: 79.1559,
    landmark_area: 'Katpadi',
    status: 'OPEN',
    claimed_by: null
  });

  const jobsListAfter = sqliteManager.getJobs();
  const flaggedJob = jobsListAfter.find(j => j.title === 'High Pay Typing Work');

  assert(
    Boolean(flaggedJob),
    'Job with high risk signals remains active in database (zero automated deletion/banning)'
  );

  assert(
    flaggedJob?.trustAssessment?.status === 'potential_risk_detected',
    'Flagged job has trustAssessment attached automatically with status = "potential_risk_detected"'
  );

  console.log('\n========================================================');
  console.log(`🏁 PHASE 7 TEST RESULTS: ${passed}/${total} TESTS PASSED (${Math.round(passed / total * 100)}%)`);
  console.log('========================================================');

  if (passed === total) {
    console.log('🎉 ALL TRUST & SAFETY INTELLIGENCE TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED!\n');
    process.exit(1);
  }
}

runTests();
