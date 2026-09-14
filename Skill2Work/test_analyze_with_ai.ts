import { nlpService } from './src/services/nlpService.ts';

const testCases = [
  'எனக்கு காலை 9:00 மணி அளவில் பிளம்பர் தேவை அனுபவம். இரண்டு வருடம் ஊதியம், ஐந்தாறு ரூபாய் எனக்கு அருகில்.',
  'எனக்கு ஒரு எலக்ட்ரீஷியன் தேவை சம்பளம் 500 ரூபாய் / நாள்',
  'சமையல்காரர் வேண்டும் கூலி ஐநூறு ரூபாய் காலை ஷிப்ட்',
  'டிரைவர் தேவை ஊதியம் ₹800/நாள்',
  'I NEED A AC MECHANIC FOR RS.2500 NEAR ME WITH EXPERIENCE OF 2 YEARS AT 02 PM.',
  'Need AC mechanic immediately in Chennai',
  'Looking for a painter urgently for Rs. 800/day',
  'I need an experienced painter in Chennai tomorrow evening for ₹800.',
  'எனக்கு ஒரு பிளம்பர் உடனடியாக வேண்டும்',
  'நாளை மதியம் 2 மணிக்கு எலக்ட்ரீஷியன் தேவை',
  'मुझे एक इलेक्ट्रीशियन चाहिए वेतन 500 रुपये प्रति दिन',
  'నాకు పెయింటర్ కావాలి వేతనం 600 రూపాయలు',
  'I need an experienced plumber in Madurai tomorrow morning for pipe leakage repair. Budget is 800 rupees.',
  'need a security for rupees 500 per day from 10 p.m. with an experience of 5 years near me',
  'need a security guard from 10 p.m. to 6 a.m.',
  'வாட்ச்மேன் தேவை இரவு 10 மணிக்கு சம்பளம் 500/நாள்',
  'need an ro water purifier service in Coimbatore'
];

console.log('====================================================');
console.log('TESTING "ANALYZE WITH AI" DYNAMIC EXTRACTION ENGINE');
console.log('====================================================\n');

for (const input of testCases) {
  console.log(`\n----------------------------------------------------`);
  console.log(`INPUT: "${input}"`);
  const result = nlpService.parseJobRequirement(input, 'Chennai');
  
  console.log(`Language:    ${result.languageName} (${result.detectedLanguage})`);
  console.log(`Category:    ${result.category}`);
  console.log(`Title:       ${result.title}`);
  console.log(`Skills:      ${result.skills.join(', ')}`);
  console.log(`Location:    ${result.location.displayText} (isDetected: ${result.location.isDetected})`);
  console.log(`Experience:  ${result.experience.description} (isExplicit: ${result.experience.isExplicit})`);
  console.log(`Timing:      ${result.availability.timingText} (isExplicit: ${result.availability.isExplicit})`);
  console.log(`Pay Rate:    ${result.payout.displayText} (isExplicit: ${result.payout.isExplicit})`);
  console.log(`Intent:      ${result.intent}`);
  console.log(`Confidence:  ${Math.round(result.confidence * 100)}%`);
  console.log(`Missing:     ${result.missingFields.map(m => m.field).join(', ') || 'None'}`);
}
