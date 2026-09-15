import fs from 'fs';

const filePath = 'e:/Talent2Task/Skill2Work/Skill2Work/src/i18n/translations.ts';
let content = fs.readFileSync(filePath, 'utf8');

const interfaceInsertion = `  demandActualTitle: string;
  demandPredictedTitle: string;
  demandLevelHigh: string;
  demandLevelMedium: string;
  demandLevelLow: string;
  demandTrendRising: string;
  demandTrendStable: string;
  demandTrendSoftening: string;
  demandInsufficientData: string;
  demandAttributionTitle: string;
  demandSelectRegion: string;
  demandActiveGigsLabel: string;
  demandCompletedGigsLabel: string;
  demandModelArchitecture: string;
  demandWhyThisPrediction: string;
  demandFilterGigsBtn: string;
  demandAllTamilNadu: string;
`;

const enValues = `    demandActualTitle: 'Current Local Demand',
    demandPredictedTitle: 'Predicted Demand',
    demandLevelHigh: 'High',
    demandLevelMedium: 'Medium',
    demandLevelLow: 'Low',
    demandTrendRising: 'Rising',
    demandTrendStable: 'Stable',
    demandTrendSoftening: 'Softening',
    demandInsufficientData: 'Insufficient historical data',
    demandAttributionTitle: 'Data Source & ML Model Transparency',
    demandSelectRegion: 'Select District / Region',
    demandActiveGigsLabel: 'Active Gigs',
    demandCompletedGigsLabel: 'Completed / Claimed',
    demandModelArchitecture: 'Random Forest Ensemble (10 Decision Trees)',
    demandWhyThisPrediction: 'Data & Prediction Attribution',
    demandFilterGigsBtn: 'Explore Jobs',
    demandAllTamilNadu: 'All Tamil Nadu (Statewide)',
`;

const taValues = `    demandActualTitle: 'தற்போதைய உள்ளூர் தேவை',
    demandPredictedTitle: 'எதிர்காலக் கணிக்கப்பட்ட தேவை',
    demandLevelHigh: 'அதிகம்',
    demandLevelMedium: 'நடுத்தரம்',
    demandLevelLow: 'குறைவு',
    demandTrendRising: 'அதிகரிக்கும்',
    demandTrendStable: 'நிலையானது',
    demandTrendSoftening: 'குறையும்',
    demandInsufficientData: 'போதிய முந்தைய தரவு இல்லை',
    demandAttributionTitle: 'தரவு மூலம் & ML மாதிரி வெளிப்படைத்தன்மை',
    demandSelectRegion: 'மாவட்டம் / பகுதியைத் தேர்ந்தெடுக்கவும்',
    demandActiveGigsLabel: 'செயலில் உள்ள வேலைகள்',
    demandCompletedGigsLabel: 'முடிக்கப்பட்ட வேலைகள்',
    demandModelArchitecture: 'ரேண்டம் ஃபாரஸ்ட் குழுமம் (10 முடிவெடுக்கும் மரங்கள்)',
    demandWhyThisPrediction: 'தரவு & கணிப்பு விளக்கம்',
    demandFilterGigsBtn: 'வேலைகளைப் பார்க்கவும்',
    demandAllTamilNadu: 'முழு தமிழ்நாடு (மாநிலம் தழுவிய)',
`;

const hiValues = `    demandActualTitle: 'वर्तमान स्थानीय मांग',
    demandPredictedTitle: 'पूर्वानुमानित मांग',
    demandLevelHigh: 'उच्च',
    demandLevelMedium: 'मध्यम',
    demandLevelLow: 'कम',
    demandTrendRising: 'बढ़ता हुआ',
    demandTrendStable: 'स्थिर',
    demandTrendSoftening: 'घटता हुआ',
    demandInsufficientData: 'अपर्याप्त ऐतिहासिक डेटा',
    demandAttributionTitle: 'डेटा स्रोत और एमएल मॉडल पारदर्शिता',
    demandSelectRegion: 'जिला / क्षेत्र चुनें',
    demandActiveGigsLabel: 'सक्रिय काम',
    demandCompletedGigsLabel: 'पूर्ण किए गए काम',
    demandModelArchitecture: 'रैंडम फ़ॉरेस्ट एन्सेम्बल (10 डिसीजन ट्री)',
    demandWhyThisPrediction: 'डेटा और भविष्यवाणी विवरण',
    demandFilterGigsBtn: 'नौकरियां देखें',
    demandAllTamilNadu: 'पूरा तमिलनाडु (राज्यव्यापी)',
`;

const teValues = `    demandActualTitle: 'ప్రస్తుత స్థానిక డిమాండ్',
    demandPredictedTitle: 'అంచనా వేసిన డిమాండ్',
    demandLevelHigh: 'అధికం',
    demandLevelMedium: 'మధ్యస్థం',
    demandLevelLow: 'తక్కువ',
    demandTrendRising: 'పెరుగుతోంది',
    demandTrendStable: 'స్థిరంగా ఉంది',
    demandTrendSoftening: 'తగ్గుతోంది',
    demandInsufficientData: 'సరిపోని చారిత్రక డేటా',
    demandAttributionTitle: 'డేటా మూలం & ML మోడల్ పారదర్శకత',
    demandSelectRegion: 'జిల్లా / ప్రాంతాన్ని ఎంచుకోండి',
    demandActiveGigsLabel: 'యాక్టివ్ పనులు',
    demandCompletedGigsLabel: 'పూర్తయిన పనులు',
    demandModelArchitecture: 'ర్యాండమ్ ఫారెస్ట్ ఎంసెంబుల్ (10 డెసిషన్ ట్రీస్)',
    demandWhyThisPrediction: 'డేటా & అంచనా వివరణ',
    demandFilterGigsBtn: 'పనులను చూడండి',
    demandAllTamilNadu: 'మొత్తం తమిళనాడు (రాష్ట్రవ్యాప్తంగా)',
`;

// 1. Insert into interface Translations
const interfaceMarker = '  growthLabel: string;\n';
if (!content.includes('demandActualTitle: string;')) {
  content = content.replace(interfaceMarker, interfaceMarker + interfaceInsertion);
}

// 2. Insert into English
const enMarker = "    growthLabel: 'Growth:',\n";
if (!content.includes("demandActualTitle: 'Current Local Demand',")) {
  content = content.replace(enMarker, enMarker + enValues);
}

// 3. Insert into Tamil
const taMarker = "    growthLabel: 'வளர்ச்சி:',\n";
if (!content.includes("demandActualTitle: 'தற்போதைய உள்ளூர் தேவை',")) {
  content = content.replace(taMarker, taMarker + taValues);
}

// 4. Insert into Hindi
const hiMarker = "  growthLabel: 'वृद्धि:',\n";
if (!content.includes("demandActualTitle: 'वर्तमान स्थानीय मांग',")) {
  content = content.replace(hiMarker, hiMarker + hiValues);
}

// 5. Insert into Telugu
const teMarker = "    growthLabel: 'వృద్ధి:',\n";
if (!content.includes("demandActualTitle: 'ప్రస్తుత స్థానిక డిమాండ్',")) {
  content = content.replace(teMarker, teMarker + teValues);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected Phase 5 translations!');
