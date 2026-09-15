const fs = require('fs');

const file = 'src/services/chatAssistantService.ts';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find extractEntities line
const startLineIdx = lines.findIndex(l => l.includes('private extractEntities(query: string, context: ChatContextPayload)'));
console.log('startLineIdx:', startLineIdx);

const endLineIdx = lines.findIndex((l, idx) => idx > startLineIdx && l.includes('private recoverPreviousSearchContext('));
console.log('endLineIdx:', endLineIdx);

const newExtractEntitiesCode = `  private extractEntities(query: string, context: ChatContextPayload): ExtractedQueryEntities {
    const qLower = query.toLowerCase();
    const cleanText = query.trim();
    const user = context.currentUser;
    const isRecruiter = user?.role === 'recruiter';

    // Multi-turn History Context Recovery
    const previousContext = this.recoverPreviousSearchContext(context.history);

    // Detect Skills / Roles
    const allSkills = this.detectAllSkillsInText(query);
    let detectedSkill = this.detectSkillInText(query);

    const isFollowUpFilter = (
      /(only|within|available|in\\s+[a-z]+|rating|rated|tomorrow|today|weekend)/i.test(qLower) &&
      !detectedSkill &&
      Boolean(previousContext.skill)
    );

    if (isFollowUpFilter && previousContext.skill) {
      detectedSkill = previousContext.skill;
    }

    // Detect Location
    let detectedLocation: string | null = null;
    for (const city of TAMIL_NADU_CITIES) {
      if (qLower.includes(city.name.toLowerCase()) || qLower.includes(city.district.toLowerCase())) {
        detectedLocation = city.name;
        break;
      }
    }
    const isNearMe = /(near me|around me|nearby|my area|my location|அருகில்|என்னைச் சுற்றி|मेरे पास|నా దగ్గర)/i.test(qLower);
    if (!detectedLocation && isFollowUpFilter && previousContext.location) {
      detectedLocation = previousContext.location;
    }

    // Detect Radius
    const radiusMatch = qLower.match(/(\\d+(?:\\.\\d+)?)\\s*(?:km|k\\.m|kilometer|கிலோமீட்டர்|किमी|కి.మీ)/i);
    let radiusKm: number | null = radiusMatch ? parseFloat(radiusMatch[1]) : null;
    if (!radiusKm && isNearMe) {
      radiusKm = 5;
    }
    if (!radiusKm && isFollowUpFilter && previousContext.radiusKm) {
      radiusKm = previousContext.radiusKm;
    }

    // Detect Availability / Timing (Sessions, Immediate, Clock Times)
    let availability: ExtractedQueryEntities['availability'] = null;
    const timeMatch12 = qLower.match(/(?:at|by|around|from)?\\s*(\\d{1,2})(?:[:.](\\d{2}))?\\s*(am|pm|a\\.m\\.|p\\.m\\.)\\b/i);
    const timeMatch24 = qLower.match(/(?:at|by|around|from)\\s+(\\d{1,2})[:.](\\d{2})\\b/i);

    if (timeMatch12) {
      let h = parseInt(timeMatch12[1], 10);
      const period = timeMatch12[3].toLowerCase().replace(/\\./g, '');
      if (period === 'pm' && h < 12) h += 12;
      if (period === 'am' && h === 12) h = 0;
      if (h >= 5 && h < 12) availability = 'morning';
      else if (h >= 12 && h < 17) availability = 'afternoon';
      else if (h >= 17 && h < 23) availability = 'evening';
      else availability = 'night';
    } else if (timeMatch24) {
      const h = parseInt(timeMatch24[1], 10);
      if (h >= 5 && h < 12) availability = 'morning';
      else if (h >= 12 && h < 17) availability = 'afternoon';
      else if (h >= 17 && h < 23) availability = 'evening';
      else availability = 'night';
    } else if (/(immediate|urgent|right now|asap|now|உடனடி|உடனே|இப்போதே|இப்பவே|तुरंत|अभी|తక్షణ|వెంటనే|ఇప్పుడే)/i.test(qLower)) {
      availability = 'immediate';
    } else if (/(morning|early morning|காலை|सुबह|ఉదయం|మార్నింగ్)/i.test(qLower)) {
      availability = 'morning';
    } else if (/(afternoon|post lunch|noon|midday|மதியம்|பிற்பகல்|दोपहर|మధ్యాహ్నం)/i.test(qLower)) {
      availability = 'afternoon';
    } else if (/(evening|sunset|மாலை|शाम|సాయంత్రం)/i.test(qLower)) {
      availability = 'evening';
    } else if (/(night|tonight|இரவு|রাত|రాత్రి)/i.test(qLower)) {
      availability = 'night';
    } else if (/(tomorrow|நாளை|कल|రేపు)/i.test(qLower)) {
      availability = 'tomorrow';
    } else if (/(today|இன்று|आज|ఈరోజు)/i.test(qLower)) {
      availability = 'today';
    } else if (/(weekend|வார இறுதி|सप्ताहांत|వీకెండ్)/i.test(qLower)) {
      availability = 'weekend';
    }

    if (!availability && isFollowUpFilter && previousContext.availability) {
      availability = previousContext.availability;
    }

    // Detect Rating / Reliability Filter
    const isHighRating = /(highly rated|top rated|high rating|best rating|5 star|4.5\\+|good rating|அதிக ரேட்டிங்|சிறந்த|उच्च रेटिंग|అత్యధిక రేటింగ్)/i.test(qLower) ||
      (isFollowUpFilter && previousContext.isHighRating);

    // Intent Classifications
    const isGreeting = /^(hi|hello|hey|greetings|good\\s+(morning|afternoon|evening)|hola|namaste|vanakkam|namaskaram|வணக்கம்|ஹலோ|ஹாய்|నమస్కారం|హలో|नमस्ते|नमस्कार|हैलो)\\b/i.test(qLower) ||
      ['hi', 'hello', 'hey', 'start'].includes(qLower);

    const isPlatformAbout = /(what is talent2task|about talent2task|what does this app do|tell me about talent2task|என்ன தளம்|டேலண்ட்2டாஸ்க் என்றால் என்ன|टैलेंट2टास्क क्या है)/i.test(qLower);
    
    const isPlatformMatchingHow = /(how does.*matching work|how is match.*calculated|how match.*work|explain matching|formula|பொருத்தம் எவ்வாறு|மேட்ச் ஸ்கோர் எப்படி|मैचिंग कैसे काम करती है)/i.test(qLower);

    const isPostJobIntent = /(create a job|create.*job|create.*gig|post a job|post a gig|help me post|help me create|need to hire|need someone to|post gig|create gig|வேலை போஸ்ட்|வேலை உருவாக்க|வேலை அறிவிப்பு|ஜாப் పోస్ట్|नौकरी पोस्ट|काम पोस्ट)/i.test(qLower);

    const isHelp = (
      /(who are you|what can you do|how to use|features|commands|guide|help\\b|help me\\b|help me|உதவி|సహాయం|मदद)/i.test(qLower) &&
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

    return {
      skill: detectedSkill,
      allSkills,
      location: detectedLocation,
      isNearMe,
      radiusKm,
      availability,
      isHighRating,
      isPostJobIntent,
      isWorkerSearchIntent,
      isJobSearchIntent,
      isSkillGapIntent,
      isDemandIntent,
      isExplanationIntent,
      isDestructiveIntent,
      isGreeting,
      isPlatformAbout,
      isPlatformMatchingHow,
      isHelp,
      isUnrelated,
      isAmbiguousSearch,
      isFollowUpFilter,
      rawText: cleanText
    };
  }`;

// Replace lines between startLineIdx and endLineIdx
lines.splice(startLineIdx, (endLineIdx - 3) - startLineIdx, newExtractEntitiesCode);

// Now update buildFindWorkersActionResponse
let fullText = lines.join('\n');

const findWorkersStart = fullText.indexOf('private buildFindWorkersActionResponse(');
const findWorkersEnd = fullText.indexOf('private buildPostJobActionResponse(');

const oldFindWorkersCode = fullText.substring(findWorkersStart, findWorkersEnd);

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

fullText = fullText.substring(0, findWorkersStart) + newFindWorkersCode + fullText.substring(findWorkersEnd);

fs.writeFileSync(file, fullText, 'utf8');
console.log('Successfully replaced extractEntities & buildFindWorkersActionResponse!');
