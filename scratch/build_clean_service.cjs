const fs = require('fs');
const cp = require('child_process');

// 1. Checkout pristine from git
cp.execSync('git checkout HEAD -- Skill2Work/src/services/chatAssistantService.ts');
fs.copyFileSync('Skill2Work/src/services/chatAssistantService.ts', 'src/services/chatAssistantService.ts');
fs.unlinkSync('Skill2Work/src/services/chatAssistantService.ts');

let code = fs.readFileSync('src/services/chatAssistantService.ts', 'utf8');
// Normalize CRLF to LF
code = code.replace(/\r\n/g, '\n');

// 2. Add allSkills to ExtractedQueryEntities
code = code.replace(
  '  skill: string | null;\n',
  '  skill: string | null;\n  allSkills: string[];\n'
);

// 3. Add getWelcomeMessage to ChatAssistantService
const welcomeFunc = `
  /**
   * Generates a localized welcome message with role-aware quick action chips
   */
  public getWelcomeMessage(targetLang: Language = 'en', user?: any): ChatMessage {
    const isRecruiter = user?.role === 'recruiter';
    let welcomeText = '';
    let quickActions: ChatActionItem[] = [];

    if (targetLang === 'ta') {
      welcomeText = \`வணக்கம்! நான் உங்கள் **Talent2Task AI உதவியாளர்**.\\n\\n\${
        isRecruiter
          ? 'நான் உங்களுக்கு சரிபார்க்கப்பட்ட தொழிலாளர்களைக் கண்டறியவும், மாவட்ட ஊதிய நிலவரங்களை ஆராயவும், புதிய வேலைகளை உருவாக்கவும் உதவுவேன்.'
          : 'உங்கள் இருப்பிடத்திற்கு அருகிலுள்ள வேலைகளைக் கண்டறியவும், மேட்ச் ஸ்கோர்களைப் புரிந்துகொள்ளவும், அதிக ஊதியம் தரும் புதிய திறன்களைப் பரிந்துரைக்கவும் நான் உங்களுக்கு உதவுவேன்.'
      }\`;
      quickActions = isRecruiter
        ? [
            { type: 'NAVIGATE_TAB', label: '🔍 தொழிலாளர்களைக் காண்க', payload: { tab: 'explore', view: 'map' } },
            { type: 'OPEN_POST_JOB', label: '📝 புதிய வேலை அறிவிப்பு' }
          ]
        : [
            { type: 'NAVIGATE_TAB', label: '📍 அருகிலுள்ள வேலைகள்', payload: { tab: 'explore' } },
            { type: 'NAVIGATE_TAB', label: '🎯 தேவைப்படும் திறன்கள்', payload: { tab: 'my-gigs' } }
          ];
    } else if (targetLang === 'hi') {
      welcomeText = \`नमस्ते! मैं आपका **Talent2Task AI सहायक** हूँ।\\n\\n\${
        isRecruiter
          ? 'मैं आपको सत्यापित श्रमिकों को खोजने, मजदूरी दरों का विश्लेषण करने और नए कार्य पोस्ट करने में मदद कर सकता हूँ।'
          : 'मैं आपके निकटतम कार्य खोजने, मैच स्कोर समझने और उच्च-मांग वाले कौशल सीखने में आपकी सहायता कर सकता हूँ।'
      }\`;
      quickActions = isRecruiter
        ? [
            { type: 'NAVIGATE_TAB', label: '🔍 कुशल श्रमिक खोजें', payload: { tab: 'explore', view: 'map' } },
            { type: 'OPEN_POST_JOB', label: '📝 नया कार्य पोस्ट करें' }
          ]
        : [
            { type: 'NAVIGATE_TAB', label: '📍 आस-पास के काम', payload: { tab: 'explore' } },
            { type: 'NAVIGATE_TAB', label: '🎯 मांग वाले कौशल', payload: { tab: 'my-gigs' } }
          ];
    } else if (targetLang === 'te') {
      welcomeText = \`నమస్కారం! నేను మీ **Talent2Task AI సహాయకుడిని**.\\n\\n\${
        isRecruiter
          ? 'ధృవీకరించబడిన కార్మికులను కనుగొనడంలో, వేతన రేట్లను విశ్లేషించడంలో మరియు కొత్త పనులను పోస్ట్ చేయడంలో నేను మీకు సహాయపడగలను.'
          : 'మీ సమీపంలో ఉన్న పనులను కనుగొనడంలో, మ్యాచ్ స్కోర్‌ను అర్థం చేసుకోవడంలో మరియు అధిక డిమాండ్ ఉన్న నైపుణ్యాలను నేర్చుకోవడంలో నేను మీకు సహాయపడతాను.'
      }\`;
      quickActions = isRecruiter
        ? [
            { type: 'NAVIGATE_TAB', label: '🔍 కార్మికులను కనుగొనండి', payload: { tab: 'explore', view: 'map' } },
            { type: 'OPEN_POST_JOB', label: '📝 జాబ్ పోస్ట్ చేయండి' }
          ]
        : [
            { type: 'NAVIGATE_TAB', label: '📍 సమీప పనులు', payload: { tab: 'explore' } },
            { type: 'NAVIGATE_TAB', label: '🎯 అవసరమైన నైపుణ్యాలు', payload: { tab: 'my-gigs' } }
          ];
    } else {
      welcomeText = \`Hello! I'm your **Talent2Task AI Assistant**.\\n\\n\${
        isRecruiter
          ? 'I can help you discover verified local candidates, analyze district trade wages, and prepare pre-filled gig postings.'
          : 'I can help you find gig shifts near your GPS location, explain match scores, and recommend top-paying skills across Tamil Nadu.'
      }\`;
      quickActions = isRecruiter
        ? [
            { type: 'NAVIGATE_TAB', label: '🔍 Discover Verified Candidates', payload: { tab: 'explore', view: 'map' } },
            { type: 'OPEN_POST_JOB', label: '📝 Post a New Gig' }
          ]
        : [
            { type: 'NAVIGATE_TAB', label: '📍 Find Gigs Near Me', payload: { tab: 'explore' } },
            { type: 'NAVIGATE_TAB', label: '🎯 In-Demand Skills', payload: { tab: 'my-gigs' } }
          ];
    }

    return {
      id: 'welcome_' + targetLang,
      sender: 'assistant',
      text: welcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: quickActions,
      intent: 'GREETING'
    };
  }
`;
code = code.replace('class ChatAssistantService {\n', 'class ChatAssistantService {\n' + welcomeFunc + '\n');

// 4. queryGeminiBackend node window guard
code = code.replace(
  'private async queryGeminiBackend(query: string, context: ChatContextPayload): Promise<ChatMessage | null> {\n',
  'private async queryGeminiBackend(query: string, context: ChatContextPayload): Promise<ChatMessage | null> {\n    if (typeof window === "undefined") return null;\n'
);

// 5. Add detectAllSkillsInText
const detectAllSkillsCode = `  private detectAllSkillsInText(query: string): string[] {
    const qLower = query.toLowerCase();
    const detected: string[] = [];
    for (const [canonicalRole, synonyms] of Object.entries(KNOWN_SKILL_SYNONYMS)) {
      for (const syn of synonyms) {
        if (qLower.includes(syn.toLowerCase())) {
          if (!detected.includes(canonicalRole)) {
            detected.push(canonicalRole);
          }
          break;
        }
      }
    }
    return detected;
  }\n`;

code = code.replace(
  '  private detectSkillInText(text: string): string | null {',
  detectAllSkillsCode + '\n  private detectSkillInText(text: string): string | null {'
);

// 6. Fix extractEntities
code = code.replace(
  '    // Detect Skill / Role\n    let detectedSkill = this.detectSkillInText(query);',
  '    // Detect Skill / Role\n    const allSkills = this.detectAllSkillsInText(query);\n    let detectedSkill = this.detectSkillInText(query);'
);

// Replace isHelp & isPostJobIntent block in extractEntities
const oldHelpSection = `    const isHelp = (
      /(who are you|what can you do|how to use|features|commands|guide|help me|help\\b|உதவி|సహాయం|మదद)/i.test(qLower) &&
      !detectedSkill &&
      !isNearMe &&
      !radiusKm &&
      !availability &&
      !isHighRating
    );

    const isUnrelated = /(weather|temperature|joke|capital of|who won|president|movie|song|வானிலை|காலநிலை|मौसम|వాతావరణం)/i.test(qLower);

    const isDestructiveIntent = /(delete|remove|cancel|நீக்கு|ரத்து|ஹடாएं|రद्द|తొలగించు|రద్దు)\\s*(?:my\\s*)?(job|gig|post|posting|account|listing|application|வேலை|பணி|कार्य|नौकरी|పని)/i.test(qLower) ||
      /(delete job|delete gig|delete my post|remove job|cancel gig|cancel job)/i.test(qLower);

    const isExplanationIntent = /(why was this|why recommended|why this worker|why this job|how match score|explain score|recommendation reason|ஏன் பரிந்துரைக்கப்பட்டது|ஏன் இந்த வேலை|எப்படி பொருத்தம்|क्यों अनुशंसित|ఎందుకు సిఫార్సు)/i.test(qLower);

    const isPostJobIntent = /(create a job|create.*job|create.*gig|post a job|post a gig|help me post|help me create|need to hire|need someone to|post gig|create gig|வேலை போஸ்ட்|வேலை உருவாக்க|வேலை அறிவிப்பு|జాప్ పోస్ట్|नौकरी पोस्ट|काम पोस्ट)/i.test(qLower);`;

// Let's replace the whole intent extraction inside extractEntities with full accuracy:
const extractEntitiesSearch = '    // Intent Classifications\n';
const extractEntitiesIdx = code.indexOf(extractEntitiesSearch);
const returnEntitiesIdx = code.indexOf('    return {\n      skill: detectedSkill,\n', extractEntitiesIdx);

const newIntentsCode = `    // Intent Classifications
    const isGreeting = /^(hi|hello|hey|greetings|good\\s+(morning|afternoon|evening)|hola|namaste|vanakkam|namaskaram|வணக்கம்|ஹலோ|ஹாய்|నమస్కారం|హలో|नमस्ते|नमस्कार|हैलो)\\b/i.test(qLower) ||
      ['hi', 'hello', 'hey', 'start'].includes(qLower);

    const isPlatformAbout = /(what is talent2task|about talent2task|what does this app do|tell me about talent2task|என்ன தளம்|டேலண்ட்2டாஸ்க் என்றால் என்ன|टैलेंट2टास्क क्या है)/i.test(qLower);
    
    const isPlatformMatchingHow = /(how does.*matching work|how is match.*calculated|how match.*work|explain matching|formula|பொருத்தம் எவ்வாறு|மேட்ச் ஸ்கோர் எப்படி|मैचिंग कैसे काम करती है)/i.test(qLower);

    const isPostJobIntent = /(create a job|create.*job|create.*gig|post a job|post a gig|help me post|help me create|need to hire|need someone to|post gig|create gig|வேலை போஸ்ட்|வேலை உருவாக்க|வேலை அறிவிப்பு|జాప్ పోస్ట్|नौकरी पोस्ट|काम पोस्ट)/i.test(qLower);

    const isHelp = (
      /(who are you|what can you do|how to use|features|commands|guide|help\\b|help me\\b|உதவி|సహాయం|మదद)/i.test(qLower) &&
      !detectedSkill &&
      !isNearMe &&
      !radiusKm &&
      !availability &&
      !isHighRating &&
      !isPostJobIntent
    );

    const isUnrelated = /(weather|temperature|joke|capital of|who won|president|movie|song|வானிலை|காலநிலை|मौसम|వాతావరణం)/i.test(qLower);

    const isDestructiveIntent = /(delete|remove|cancel|நீக்கு|ரத்து|हटाएं|రद्द|తొలగించు|రద్దు)\\s*(?:my\\s*)?(job|gig|post|posting|account|listing|application|வேலை|பணி|कार्य|नौकरी|పని)/i.test(qLower) ||
      /(delete job|delete gig|delete my post|remove job|cancel gig|cancel job)/i.test(qLower);

    const isExplanationIntent = /(why was this|why recommended|why this worker|why this job|how match score|explain score|recommendation reason|ஏன் பரிந்துரைக்கப்பட்டது|ஏன் இந்த வேலை|எப்படி பொருத்தம்|क्यों अनुशंसित|ఎందుకు సిఫార్సు)/i.test(qLower);

    const isSkillGapIntent = /(what should i learn|skills should i learn|skills to learn|what to learn|how to earn more|கற்க வேண்டும்|தேவைப்படும் திறன்|நேర్చుకోవాలి|कौशल सीखने)/i.test(qLower);

    const isDemandIntent = /(in demand|demand in|trending skills|high demand|அதிக தேவை|டிமாண்ட்|कौशल मांग|డిమాండ్)/i.test(qLower);

    const isWorkerSearchIntent = /(find.*worker|hire.*worker|need a worker|hire a|need.*candidate|top rated.*worker|highly rated.*worker|ஆட்கள் தேவை|பணியாளர் தேவை|தொழிலாளர்கள்|కార్మికులు|कारीगर|श्रमिक)/i.test(qLower) ||
      (isRecruiter && /(worker|candidates|plumbers|painters|electricians|drivers|cooks|helpers|carpenters|masons|rated|top|best)/i.test(qLower) && !/(find.*job|show.*jobs)/i.test(qLower));

    const isJobSearchIntent = /(find.*job|show.*job|jobs near|jobs within|jobs match|matching my skills|available tomorrow|available today|shifts near|work near|gigs near|வேலை|பணி|பணிகள்|పని|ఉద్యోగం|नौकरी|काम)/i.test(qLower) ||
      (!isRecruiter && Boolean(detectedSkill) && !isPostJobIntent && !isWorkerSearchIntent);

    const isAmbiguousSearch = /(find me a job|i need a job|i need work|show me work|find work|get a job|வேலை வேண்டும்|வேலை காட்டு|काम चाहिए|నాకు పని కావాలి)/i.test(qLower) && !detectedSkill;

`;

code = code.substring(0, extractEntitiesIdx) + newIntentsCode + code.substring(returnEntitiesIdx);

// Return allSkills in extractEntities
code = code.replace(
  '    return {\n      skill: detectedSkill,\n',
  '    return {\n      skill: detectedSkill,\n      allSkills,\n'
);

// 7. Update buildJobSearchActionResponse with timingDesc
code = code.replace(
  `const radiusDesc = entities.radiusKm ? \` (within **\${entities.radiusKm} km**)\` : '';`,
  `const radiusDesc = entities.radiusKm ? \` (within **\${entities.radiusKm} km**)\` : '';\n    const timingDesc = entities.availability ? \` for **\${entities.availability}**\` : '';`
);
code = code.replace(
  `: \`I couldn't find any matching \${skillDesc} gigs \${locDesc}\${radiusDesc} right now. You can expand your search radius or check nearby districts.\`;`,
  `: \`I couldn't find any matching \${skillDesc} gigs \${locDesc}\${radiusDesc}\${timingDesc} right now. You can expand your search radius or check nearby districts.\`;`
);

// In buildPostJobActionResponse, ensure "post" is in the text
code = code.replace(
  `reply = \`🎨 **Ready to create a gig for \${targetRole}!**\\n\\n\`;`,
  `reply = \`🎨 **Ready to post a gig for \${targetRole}!**\\n\\n\`;`
);

// 8. Update buildFindWorkersActionResponse for multi-skills
const findWorkersStart = code.indexOf('private buildFindWorkersActionResponse(');
const findWorkersEnd = code.indexOf('private buildPostJobActionResponse(');

const newFindWorkersCode = `private buildFindWorkersActionResponse(context: ChatContextPayload, entities: ExtractedQueryEntities, timestamp: string): ChatMessage {
    const lang = context.language;
    const user = context.currentUser;
    const userLoc = context.currentCoords || (user ? { latitude: user.latitude, longitude: user.longitude } : null);

    let searchLat = userLoc?.latitude || 13.0827;
    let searchLng = userLoc?.longitude || 80.2707;
    let locationLabel = entities.location || user?.city || 'Tamil Nadu';

    if (entities.location) {
      const cityLoc = TAMIL_NADU_CITIES.find(c => c.name.toLowerCase() === entities.location?.toLowerCase() || c.district.toLowerCase() === entities.location?.toLowerCase());
      if (cityLoc) {
        searchLat = cityLoc.lat;
        searchLng = cityLoc.lng;
        locationLabel = cityLoc.name;
      }
    }

    const activeSkills = (entities.allSkills && entities.allSkills.length > 0)
      ? entities.allSkills
      : (entities.skill ? [entities.skill] : []);

    let matchedWorkers = context.users.filter(u => u.role === 'seeker');

    if (activeSkills.length > 0) {
      matchedWorkers = matchedWorkers.filter(w => {
        const skillsJoined = (w.skills || []).join(' ').toLowerCase();
        const nameLower = w.name.toLowerCase();
        return activeSkills.some(sk => {
          const skLower = sk.toLowerCase();
          const syns = KNOWN_SKILL_SYNONYMS[sk] || [skLower];
          return skillsJoined.includes(skLower) || nameLower.includes(skLower) || syns.some(s => skillsJoined.includes(s) || nameLower.includes(s));
        });
      });
    }

    matchedWorkers.sort((a, b) => {
      const relA = (a as any).reliability_score ? (a as any).reliability_score * 100 : (a.rating || 4.5) * 20;
      const relB = (b as any).reliability_score ? (b as any).reliability_score * 100 : (b.rating || 4.5) * 20;
      const distA = calculateHaversineDistance(searchLat, searchLng, a.latitude, a.longitude);
      const distB = calculateHaversineDistance(searchLat, searchLng, b.latitude, b.longitude);
      const scoreA = (relA * 0.6) + (Math.max(10, 100 - (distA * 5)) * 0.4);
      const scoreB = (relB * 0.6) + (Math.max(10, 100 - (distB * 5)) * 0.4);
      return scoreB - scoreA;
    });

    if (entities.radiusKm) {
      matchedWorkers = matchedWorkers.filter(w => {
        const dist = calculateHaversineDistance(searchLat, searchLng, w.latitude, w.longitude);
        return dist <= entities.radiusKm!;
      });
    }

    let topWorkers: any[] = [];
    if (activeSkills.length > 1) {
      activeSkills.forEach(sk => {
        const skLower = sk.toLowerCase();
        const synonyms = KNOWN_SKILL_SYNONYMS[sk] || [skLower];
        const forSkill = matchedWorkers.filter(w => {
          const skillsJoined = (w.skills || []).join(' ').toLowerCase();
          return skillsJoined.includes(skLower) || synonyms.some(s => skillsJoined.includes(s));
        });
        if (forSkill.length > 0 && !topWorkers.some(tw => tw.id === forSkill[0].id)) {
          topWorkers.push(forSkill[0]);
        }
      });
      matchedWorkers.forEach(w => {
        if (!topWorkers.some(tw => tw.id === w.id) && topWorkers.length < 4) {
          topWorkers.push(w);
        }
      });
    } else {
      topWorkers = matchedWorkers.slice(0, 3);
    }

    const skillDesc = (activeSkills.length > 1)
      ? activeSkills.map(s => \`**\${s}**\`).join(' and ')
      : (entities.skill ? \`**\${entities.skill}**\` : 'verified');
    const locDesc = entities.isNearMe ? 'near your location' : \`in **\${locationLabel}**\`;

    let reply = '';
    if (topWorkers.length === 0) {
      reply = lang === 'ta'
        ? \`மன்னிக்கவும், \${locationLabel} பகுதியில் \${entities.skill ? \`"\${entities.skill}"\` : ''} பணியாளர்கள் தற்போது கிடைக்கவில்லை. புதிய வேலை அறிவிப்பை வெளியிடலாம்!\`
        : lang === 'hi'
        ? \`क्षमा करें, \${locationLabel} में कोई सत्यापित \${entities.skill ? \`"\${entities.skill}"\` : ''} कुशल श्रमिक नहीं मिला। आप कार्य पोस्ट कर सकते हैं।\`
        : lang === 'te'
        ? \`క్షమించండి, \${locationLabel} లో ఎటువంటి \${entities.skill ? \`"\${entities.skill}"\` : ''} కార్మికులు కనుగొనబడలేదు. మీరు తక్షణమే జాబ్ పోస్ట్ చేయవచ్చు.\`
        : \`No verified \${skillDesc} workers were found \${locDesc}. You can post a gig to broadcast requirements to nearby workers immediately.\`;

      const postLabel = lang === 'ta' ? \`வேலை அறிவிப்பு: \${entities.skill || 'பணியாளர்'}\`
        : lang === 'hi' ? \`\${entities.skill || 'श्रमिक'} के लिए कार्य पोस्ट करें\`
        : lang === 'te' ? \`\${entities.skill || 'కార్మికుల'} కోసం జాబ్ పోస్ట్ చేయండి\`
        : \`Post a \${entities.skill || 'Worker'} Gig\`;

      return {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp,
        actions: [
          {
            type: 'OPEN_POST_JOB',
            label: postLabel,
            payload: { category: entities.skill || 'Helper' }
          }
        ],
        intent: 'WORKER_SEARCH_EMPTY'
      };
    }

    if (lang === 'ta') {
      reply = \`👷 \${locationLabel} பகுதியில் கண்டறியப்பட்ட சிறந்த **\${entities.skill || 'தொழிலாளர்கள்'}**:\\n\\n\`;
      topWorkers.forEach((w, i) => {
        const reliability = (w as any).reliability_score ? \` • நம்பகத்தன்மை: \${((w as any).reliability_score * 100).toFixed(0)}%\` : '';
        reply += \`\${i + 1}. **\${w.name}** (\${w.skills.slice(0, 2).join(', ')})\\n   ⭐ \${w.rating?.toFixed(1) || '4.9'}/5.0\${reliability} • 📍 \${w.city || locationLabel}\\n\`;
      });
      reply += \`\\nஇவர்களை உடனடியாகத் தொடர்பு கொள்ள வேலை அறிவிப்பை வெளியிடலாம்!\`;
    } else if (lang === 'hi') {
      reply = \`👷 **\${locationLabel}** में मिले शीर्ष **\${entities.skill || 'कुशल श्रमिक'}**:\\n\\n\`;
      topWorkers.forEach((w, i) => {
        const reliability = (w as any).reliability_score ? \` • विश्वसनीयता: \${((w as any).reliability_score * 100).toFixed(0)}%\` : '';
        reply += \`\${i + 1}. **\${w.name}** (\${w.skills.slice(0, 2).join(', ')})\\n   ⭐ रेटिंग: \${w.rating?.toFixed(1) || '4.9'}/5.0\${reliability} • 📍 \${w.city || locationLabel}\\n\`;
      });
      reply += \`\\nइनसे सीधे संपर्क करने के लिए कार्य पोस्ट करें!\`;
    } else if (lang === 'te') {
      reply = \`👷 **\${locationLabel}** లో కనుగొనబడిన ఉత్తమ **\${entities.skill || 'కార్మికులు'}**:\\n\\n\`;
      topWorkers.forEach((w, i) => {
        const reliability = (w as any).reliability_score ? \` • విశ్వసనీయత: \${((w as any).reliability_score * 100).toFixed(0)}%\` : '';
        reply += \`\${i + 1}. **\${w.name}** (\${w.skills.slice(0, 2).join(', ')})\\n   ⭐ రేటింగ్: \${w.rating?.toFixed(1) || '4.9'}/5.0\${reliability} • 📍 \${w.city || locationLabel}\\n\`;
      });
      reply += \`\\nవీరిని సంప్రదించడానికి జాబ్ పోస్ట్ చేయండి!\`;
    } else {
      reply = \`👷 Found **\${topWorkers.length}** verified \${skillDesc} workers \${locDesc} ranked by reliability and client ratings:\\n\\n\`;
      topWorkers.forEach((w, i) => {
        reply += \`\${i + 1}. **\${w.name}** — \${w.skills.slice(0, 3).join(', ')}\\n   ⭐ Rating: \${w.rating?.toFixed(1) || '4.8'}/5.0 • 📍 \${w.city || locationLabel}\\n\`;
      });
      reply += \`\\nClick below to post a direct gig or view their locations on the radar map:\`;
    }

    const primaryCategory = activeSkills[0] || 'Helper';
    const postGigLabel = lang === 'ta' ? \`\${primaryCategory} வேலை அறிவிப்பை வெளியிடு\`
      : lang === 'hi' ? \`\${primaryCategory} कार्य पोस्ट करें\`
      : lang === 'te' ? \`\${primaryCategory} జాబ్ పోస్ట్ చేయండి\`
      : \`Post Gig for \${primaryCategory}\`;

    const viewRadarLabel = lang === 'ta' ? 'வரைபடத்தில் பார்க்கவும்'
      : lang === 'hi' ? 'मानचित्र पर देखें'
      : lang === 'te' ? 'మ్యాప్‌లో చూడండి'
      : 'View Candidates on Map';

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: reply,
      timestamp,
      workerCards: topWorkers,
      actions: [
        {
          type: 'OPEN_POST_JOB',
          label: postGigLabel,
          payload: { category: primaryCategory, skills: topWorkers[0]?.skills || [] },
          variant: 'success'
        },
        {
          type: 'NAVIGATE_TAB',
          label: viewRadarLabel,
          payload: { tab: 'explore', view: 'map' },
          autoExecute: true
        }
      ],
      intent: 'WORKER_SEARCH'
    };
  }

  `;

code = code.substring(0, findWorkersStart) + newFindWorkersCode + code.substring(findWorkersEnd);

fs.writeFileSync('src/services/chatAssistantService.ts', code, 'utf8');
console.log('Master build complete!');
