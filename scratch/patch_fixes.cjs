const fs = require('fs');
let code = fs.readFileSync('src/services/chatAssistantService.ts', 'utf8');

// 1. Update isHelp check in extractEntities so isPostJobIntent is excluded from isHelp
code = code.replace(
  `    const isHelp = (\n      /(who are you|what can you do|how to use|features|commands|guide|help me|help\\b|உதவி|సహాయం|మదद)/i.test(qLower) &&\n      !detectedSkill &&\n      !isNearMe &&`,
  `    const isHelp = (\n      /(who are you|what can you do|how to use|features|commands|guide|help\\b|உதவி|సహాయం|మదद)/i.test(qLower) &&\n      !detectedSkill &&\n      !isNearMe &&\n      !isPostJobIntent &&`
);

// 2. Also ensure "help me post" or "help me create" is recognized as isPostJobIntent
code = code.replace(
  `const isPostJobIntent = /(create a job|create.*job|create.*gig|post a job|post a gig|need to hire|need someone to|post gig|create gig|help me create|வேலை போஸ்ட்|வேலை உருவாக்க|வேலை அறிவிப்பு|ஜாப் పోస్ట్|नौकरी पोस्ट|काम पोस्ट)/i.test(qLower);`,
  `const isPostJobIntent = /(create a job|create.*job|create.*gig|post a job|post a gig|help me post|help me create|need to hire|need someone to|post gig|create gig|வேலை போஸ்ட்|வேலை உருவாக்க|வேலை அறிவிப்பு|ஜாப் పోస్ట్|नौकरी पोस्ट|काम पोस्ट)/i.test(qLower);`
);

// 3. In buildPostJobActionResponse, ensure the word "post" is clearly included in English reply
code = code.replace(
  `reply = \`🎨 **Ready to create a gig for \${targetRole}!**\\n\\n\`;`,
  `reply = \`🎨 **Ready to post a gig for \${targetRole}!**\\n\\n\`;`
);

// 4. In buildJobSearchActionResponse, include timingDesc for availability
code = code.replace(
  `const radiusDesc = entities.radiusKm ? \` (within **\${entities.radiusKm} km**)\` : '';`,
  `const radiusDesc = entities.radiusKm ? \` (within **\${entities.radiusKm} km**)\` : '';\n    const timingDesc = entities.availability ? \` for **\${entities.availability}**\` : '';`
);

code = code.replace(
  `: \`I couldn't find any matching \${skillDesc} gigs \${locDesc}\${radiusDesc} right now. You can expand your search radius or check nearby districts.\`;`,
  `: \`I couldn't find any matching \${skillDesc} gigs \${locDesc}\${radiusDesc}\${timingDesc} right now. You can expand your search radius or check nearby districts.\`;`
);

// 5. In buildFindWorkersActionResponse, support multi-role labor requests
const oldFindWorkersHeader = `    let matchedWorkers = context.users.filter(u => u.role === 'seeker');

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

const newFindWorkersHeader = `    const allDetectedSkills = this.detectAllSkillsInText(query);
    const primarySkills = allDetectedSkills.length > 0 ? allDetectedSkills : (entities.skill ? [entities.skill] : []);

    let matchedWorkers = context.users.filter(u => u.role === 'seeker');

    if (primarySkills.length > 0) {
      matchedWorkers = matchedWorkers.filter(w => {
        const skillsJoined = (w.skills || []).join(' ').toLowerCase();
        const nameLower = w.name.toLowerCase();
        return primarySkills.some(sk => {
          const skLower = sk.toLowerCase();
          const syns = KNOWN_SKILL_SYNONYMS[sk] || [skLower];
          return skillsJoined.includes(skLower) || nameLower.includes(skLower) || syns.some(s => skillsJoined.includes(s) || nameLower.includes(s));
        });
      });
    }`;

code = code.replace(oldFindWorkersHeader, newFindWorkersHeader);

// In English multi-role worker response text:
const oldWorkerEnglishReply = `      reply = \`👷 Found **\${topWorkers.length}** verified \${skillDesc} workers \${locDesc} ranked by reliability and client ratings:\\n\\n\`;`;
const newWorkerEnglishReply = `      const skillDescDisplay = primarySkills.length > 1 ? primarySkills.map(s => \`**\${s}**\`).join(' and ') : skillDesc;
      reply = \`👷 Found **\${topWorkers.length}** verified \${skillDescDisplay} workers \${locDesc} ranked by reliability and client ratings:\\n\\n\`;`;

code = code.replace(oldWorkerEnglishReply, newWorkerEnglishReply);

fs.writeFileSync('src/services/chatAssistantService.ts', code, 'utf8');
console.log('Successfully updated chatAssistantService.ts with fixes');
