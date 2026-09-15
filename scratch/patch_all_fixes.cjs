const fs = require('fs');
let code = fs.readFileSync('src/services/chatAssistantService.ts', 'utf8');

// 1. Add allSkills to ExtractedQueryEntities
code = code.replace(
  '  skill: string | null;\n',
  '  skill: string | null;\n  allSkills: string[];\n'
);

// 2. In extractEntities, compute allSkills and isPostJobIntent before isHelp
const oldExtractEntitiesHead = `    // Detect Skill / Role
    let detectedSkill = this.detectSkillInText(query);`;

const newExtractEntitiesHead = `    // Detect Skills / Roles
    const allSkills = this.detectAllSkillsInText(query);
    let detectedSkill = this.detectSkillInText(query);`;

code = code.replace(oldExtractEntitiesHead, newExtractEntitiesHead);

// Replace the intent block in extractEntities
const oldIntentBlock = `    const isHelp = (
      /(who are you|what can you do|how to use|features|commands|guide|help\\b|help me\\b|உதவி|సహాయం|మదद)/i.test(qLower) &&
      !detectedSkill &&
      !isNearMe &&
      !radiusKm &&
      !availability &&
      !isHighRating
    );

    const isUnrelated = /(weather|temperature|joke|capital of|who won|president|movie|song|வானிலை|காலநிலை|मौसम|వాతావరణం)/i.test(qLower);

    const isDestructiveIntent = /(delete|remove|cancel|நீக்கு|ரத்து|हटाएं|రद्द|తొలగించు|రద్దు)\\s*(?:my\\s*)?(job|gig|post|posting|account|listing|application|வேலை|பணி|कार्य|नौकरी|పని)/i.test(qLower) ||
      /(delete job|delete gig|delete my post|remove job|cancel gig|cancel job)/i.test(qLower);

    const isExplanationIntent = /(why was this|why recommended|why this worker|why this job|how match score|explain score|recommendation reason|ஏன் பரிந்துரைக்கப்பட்டது|ஏன் இந்த வேலை|எப்படி பொருத்தம்|क्यों अनुशंसित|ఎందుకు సిఫార్సు)/i.test(qLower);

    const isPostJobIntent = /(create a job|create.*job|create.*gig|post a job|post a gig|help me post|help me create|need to hire|need someone to|post gig|create gig|வேலை போஸ்ட்|வேலை உருவாக்க|வேலை அறிவிப்பு|ஜாப் పోస్ట్|नौकरी पोस्ट|काम पोस्ट)/i.test(qLower);`;

const newIntentBlock = `    const isPostJobIntent = /(create a job|create.*job|create.*gig|post a job|post a gig|help me post|help me create|need to hire|need someone to|post gig|create gig|வேலை போஸ்ட்|வேலை உருவாக்க|வேலை அறிவிப்பு|ஜாப் పోస్ట్|नौकरी पोस्ट|काम पोस्ट)/i.test(qLower);

    const isDestructiveIntent = /(delete|remove|cancel|நீக்கு|ரத்து|हटाएं|రद्द|తొలగించు|రద్దు)\\s*(?:my\\s*)?(job|gig|post|posting|account|listing|application|வேலை|பணி|कार्य|नौकरी|పని)/i.test(qLower) ||
      /(delete job|delete gig|delete my post|remove job|cancel gig|cancel job)/i.test(qLower);

    const isExplanationIntent = /(why was this|why recommended|why this worker|why this job|how match score|explain score|recommendation reason|ஏன் பரிந்துரைக்கப்பட்டது|ஏன் இந்த வேலை|எப்படி பொருத்தம்|क्यों अनुशंसित|ఎందుకు సిఫార్సు)/i.test(qLower);

    const isHelp = (
      /(who are you|what can you do|how to use|features|commands|guide|help\\b|help me\\b|help me|உதவி|సహాయం|మదद)/i.test(qLower) &&
      !detectedSkill &&
      !isNearMe &&
      !radiusKm &&
      !availability &&
      !isHighRating &&
      !isPostJobIntent
    );

    const isUnrelated = /(weather|temperature|joke|capital of|who won|president|movie|song|வானிலை|காலநிலை|मौसम|వాతావరణం)/i.test(qLower);`;

code = code.replace(oldIntentBlock, newIntentBlock);

// In return of extractEntities:
code = code.replace(
  '      skill: detectedSkill,\n',
  '      skill: detectedSkill,\n      allSkills,\n'
);

// In buildFindWorkersActionResponse:
const oldFindWorkers = `    let matchedWorkers = context.users.filter(u => u.role === 'seeker');

    if (entities.skill) {
      const skillLower = entities.skill.toLowerCase();
      const synonyms = KNOWN_SKILL_SYNONYMS[entities.skill] || [skillLower];
      matchedWorkers = matchedWorkers.filter(w => {
        const skillsJoined = (w.skills || []).join(' ').toLowerCase();
        const nameLower = w.name.toLowerCase();
        return (
          skillsJoined.includes(skillLower) ||
          nameLower.includes(skillLower) ||
          synonyms.some(s => skillsJoined.includes(s) || nameLower.includes(s))
        );
      });
    }`;

const newFindWorkers = `    const activeSkills = (entities.allSkills && entities.allSkills.length > 0)
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
    }`;

code = code.replace(oldFindWorkers, newFindWorkers);

// And the worker description string:
code = code.replace(
  `const skillDesc = entities.skill ? \`**\${entities.skill}**\` : 'verified';`,
  `const skillDesc = (entities.allSkills && entities.allSkills.length > 1)
      ? entities.allSkills.map(s => \`**\${s}**\`).join(' and ')
      : (entities.skill ? \`**\${entities.skill}**\` : 'verified');`
);

fs.writeFileSync('src/services/chatAssistantService.ts', code, 'utf8');
console.log('Successfully updated chatAssistantService.ts with allSkills & isPostJobIntent fixes');
