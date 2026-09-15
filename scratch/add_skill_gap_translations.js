import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/i18n/translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Interface
const interfaceTarget = `  allStarDesc: string;`;
const interfaceReplacement = `  allStarDesc: string;

  // Phase 4 — AI Skill Understanding & Skill-Gap Engine
  skillGapCurrentSkills: string;
  skillGapRelatedSkills: string;
  skillGapMissingSkills: string;
  skillGapUpskillingPath: string;
  skillGapCoverage: string;
  skillGapUnlockedGigs: string;
  skillGapPotentialBoost: string;
  skillGapWhyRecommended: string;
  skillGapStep: string;
  skillGapAffinity: string;
  skillGapDemand: string;
  skillGapBridge: string;
  skillGapHighDemandBadge: string;
  skillGapHighPayBadge: string;
  skillGapExploreSteps: string;
  skillGapAllStages: string;
  skillGapAddSkillBtn: string;`;

// 2. English (en)
const enTarget = `    allStarDesc: 'Your profile covers 100% of the active skills requested across nearby Tamil Nadu gigs.',`;
const enReplacement = `    allStarDesc: 'Your profile covers 100% of the active skills requested across nearby Tamil Nadu gigs.',

    // Phase 4 — AI Skill Understanding & Skill-Gap Engine
    skillGapCurrentSkills: 'Current Skills',
    skillGapRelatedSkills: 'Related Skills',
    skillGapMissingSkills: 'Missing High-Demand Skills',
    skillGapUpskillingPath: 'Recommended Upskilling Path',
    skillGapCoverage: 'Market Skill Coverage',
    skillGapUnlockedGigs: 'Gigs Unlocked',
    skillGapPotentialBoost: 'Potential Pay Boost',
    skillGapWhyRecommended: 'Why this is recommended',
    skillGapStep: 'Step',
    skillGapAffinity: 'AI Affinity',
    skillGapDemand: 'Market Demand',
    skillGapBridge: 'Bridge Skill',
    skillGapHighDemandBadge: 'High Demand',
    skillGapHighPayBadge: 'Top Earning',
    skillGapExploreSteps: 'Upskilling Path',
    skillGapAllStages: 'Full Skill Analysis',
    skillGapAddSkillBtn: 'Add to My Skills',`;

// 3. Tamil (ta)
const taTarget = `    allStarDesc: 'அருகிலுள்ள வேலூர் வேலைகளில் கேட்கப்படும் அனைத்து திறன்களையும் உங்கள் விவரக்குறிப்பு கொண்டுள்ளது.',`;
const taReplacement = `    allStarDesc: 'அருகிலுள்ள வேலூர் வேலைகளில் கேட்கப்படும் அனைத்து திறன்களையும் உங்கள் விவரக்குறிப்பு கொண்டுள்ளது.',

    // Phase 4 — AI Skill Understanding & Skill-Gap Engine
    skillGapCurrentSkills: 'தற்போதைய திறன்கள்',
    skillGapRelatedSkills: 'தொடர்புடைய திறன்கள்',
    skillGapMissingSkills: 'அதிக தேவை கொண்ட விடுபட்ட திறன்கள்',
    skillGapUpskillingPath: 'பரிந்துரைக்கப்பட்ட திறன் மேம்பாட்டுப் பாதை',
    skillGapCoverage: 'சந்தை திறன் பாதுகாப்பு',
    skillGapUnlockedGigs: 'திறக்கப்படும் வேலைகள்',
    skillGapPotentialBoost: 'கூடுதல் வருவாய் வாய்ப்பு',
    skillGapWhyRecommended: 'இது ஏன் பரிந்துரைக்கப்படுகிறது',
    skillGapStep: 'படி',
    skillGapAffinity: 'AI பொருத்தம்',
    skillGapDemand: 'சந்தை தேவை',
    skillGapBridge: 'இணைப்புத் திறன்',
    skillGapHighDemandBadge: 'அதிக தேவை',
    skillGapHighPayBadge: 'அதிக வருவாய்',
    skillGapExploreSteps: 'மேம்பாட்டுப் பாதை',
    skillGapAllStages: 'முழு திறன் பகுப்பாய்வு',
    skillGapAddSkillBtn: 'என் திறன்களில் சேர்',`;

// 4. Hindi (hi)
const hiTarget = `  allStarDesc: 'आपकी प्रोफ़ाइल आस-पास के तमिलनाडु गिग्स में मांगे गए 100% कौशलों को पूरा करती है।',`;
const hiReplacement = `  allStarDesc: 'आपकी प्रोफ़ाइल आस-पास के तमिलनाडु गिग्स में मांगे गए 100% कौशलों को पूरा करती है।',

  // Phase 4 — AI Skill Understanding & Skill-Gap Engine
  skillGapCurrentSkills: 'वर्तमान कौशल',
  skillGapRelatedSkills: 'संबंधित कौशल',
  skillGapMissingSkills: 'अनुपस्थित उच्च-मांग कौशल',
  skillGapUpskillingPath: 'अनुशंसित कौशल उन्नयन पथ',
  skillGapCoverage: 'बाजार कौशल कवरेज',
  skillGapUnlockedGigs: 'अनलॉक किए गए गिग्स',
  skillGapPotentialBoost: 'संभावित वेतन वृद्धि',
  skillGapWhyRecommended: 'यह क्यों अनुशंसित है',
  skillGapStep: 'चरण',
  skillGapAffinity: 'AI संबंध',
  skillGapDemand: 'बाजार मांग',
  skillGapBridge: 'ब्रिज कौशल',
  skillGapHighDemandBadge: 'उच्च मांग',
  skillGapHighPayBadge: 'शीर्ष कमाई',
  skillGapExploreSteps: 'उन्नयन पथ',
  skillGapAllStages: 'पूर्ण कौशल विश्लेषण',
  skillGapAddSkillBtn: 'मेरे कौशल में जोड़ें',`;

// 5. Telugu (te)
const teTarget = `    allStarDesc: 'మీ ప్రొఫైల్ సమీపంలోని తమిళనాడు గిగ్‌లలో అభ్యర్థించిన 100% నైపుణ్యాలను కలిగి ఉంది.',`;
const teReplacement = `    allStarDesc: 'మీ ప్రొఫైల్ సమీపంలోని తమిళనాడు గిగ్‌లలో అభ్యర్థించిన 100% నైపుణ్యాలను కలిగి ఉంది.',

    // Phase 4 — AI Skill Understanding & Skill-Gap Engine
    skillGapCurrentSkills: 'ప్రస్తుత నైపుణ్యాలు',
    skillGapRelatedSkills: 'సంబంధిత నైపుణ్యాలు',
    skillGapMissingSkills: 'అధిక డిమాండ్ ఉన్న తప్పిపోయిన నైపుణ్యాలు',
    skillGapUpskillingPath: 'సిఫార్సు చేయబడిన నైపుణ్యాభివృద్ధి మార్గం',
    skillGapCoverage: 'మార్కెట్ నైపుణ్య కవరేజ్',
    skillGapUnlockedGigs: 'అన్‌లాక్ చేయబడిన పనులు',
    skillGapPotentialBoost: 'సంభావ్య వేతన పెరుగుదల',
    skillGapWhyRecommended: 'ఇది ఎందుకు సిఫార్సు చేయబడింది',
    skillGapStep: 'దశ',
    skillGapAffinity: 'AI సారూప్యత',
    skillGapDemand: 'మార్కెట్ డిమాండ్',
    skillGapBridge: 'బ్రిడ్జ్ నైపుణ్యం',
    skillGapHighDemandBadge: 'అధిక డిమాండ్',
    skillGapHighPayBadge: 'అత్యధిక సంపాదన',
    skillGapExploreSteps: 'అభివృద్ధి మార్గం',
    skillGapAllStages: 'పూర్తి నైపుణ్య విశ్లేషణ',
    skillGapAddSkillBtn: 'నా నైపుణ్యాలకు జోడించు',`;

content = content.replace(interfaceTarget, interfaceReplacement);
content = content.replace(enTarget, enReplacement);
content = content.replace(taTarget, taReplacement);
content = content.replace(hiTarget, hiReplacement);
content = content.replace(teTarget, teReplacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Skill Gap translations successfully injected into translations.ts!');
