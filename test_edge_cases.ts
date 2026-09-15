import { nlpService } from './src/services/nlpService';

const tests = [
  'I need an experienced painter in Chennai tomorrow evening for ₹800.',
  'Need a painter for ₹800',
  'Need a painter for Rs. 800 per day',
  'Need a painter with 3 years experience in Chennai',
  'Need a painter with 2-3 yrs experience in Madurai',
  'Need a painter with experience in Coimbatore',
  'Need a painter with prior experience in Trichy',
  'Need a painter tomorrow in the evening in Salem',
  'Need a painter tomorrow 6pm in Vellore',
  'Need a painter for night shift in Hosur',
  'Need a painter for full time in Erode',
  'Need a painter for part time in Tiruppur',
  'Need a painter in Anna Nagar, Chennai',
  'Need a painter in Gandhipuram, Coimbatore',
  'Need an electrician for ₹500/hr in Chennai',
  'Need a plumber for 600 per shift in Madurai',
  'Looking for a fresher cook in Chennai',
  'Looking for a cook with no experience in Salem',
  'Need a cleaner for ₹1000/day this weekend in Chennai'
];

console.log('Testing NLP Extraction on Edge Cases:\n');

for (const t of tests) {
  const res = nlpService.parseJobRequirement(t, 'Chennai');
  console.log(`INPUT: "${t}"`);
  console.log(`  -> Category:   ${res.category}`);
  console.log(`  -> Skills:     ${res.skills.join(', ')}`);
  console.log(`  -> Location:   ${res.location.displayText} (isDetected: ${res.location.isDetected})`);
  console.log(`  -> Experience: ${res.experience.description} (isExplicit: ${res.experience.isExplicit})`);
  console.log(`  -> Timing:     ${res.availability.timingText} (isExplicit: ${res.availability.isExplicit})`);
  console.log(`  -> Pay Rate:   ${res.payout.displayText} (isExplicit: ${res.payout.isExplicit})`);
  console.log(`  -> Intent:     ${res.intent}`);
  console.log(`  -> Confidence: ${Math.round(res.confidence * 100)}%\n`);
}
