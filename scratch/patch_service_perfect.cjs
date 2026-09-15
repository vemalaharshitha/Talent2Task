const fs = require('fs');

let code = fs.readFileSync('src/services/chatAssistantService.ts', 'utf8');

// Ensure ExtractedQueryEntities has allSkills
if (!code.includes('allSkills: string[];')) {
  code = code.replace(
    'skill: string | null;\n',
    'skill: string | null;\n  allSkills: string[];\n'
  );
}

// In extractEntities, move isPostJobIntent up before isHelp, add !isPostJobIntent to isHelp, and return allSkills
const oldExtractFunc = code.substring(
  code.indexOf('private extractEntities('),
  code.indexOf('private recoverPreviousSearchContext(')
);

// We replace inside extractEntities
let newExtractFunc = oldExtractFunc;

newExtractFunc = newExtractFunc.replace(
  '// Detect Skill / Role\n    let detectedSkill = this.detectSkillInText(query);',
  '// Detect Skill / Role\n    const allSkills = this.detectAllSkillsInText(query);\n    let detectedSkill = this.detectSkillInText(query);'
);

// Replace isHelp definition
newExtractFunc = newExtractFunc.replace(
  `    const isHelp = (
      /(who are you|what can you do|how to use|features|commands|guide|help me|help\\b|உதவி|సహాయం|మదद)/i.test(qLower) &&
      !detectedSkill &&
      !isNearMe &&
      !radiusKm &&
      !availability &&
      !isHighRating
    );`,
  `    const isPostJobIntent = /(create a job|create.*job|create.*gig|post a job|post a gig|help me post|help me create|need to hire|need someone to|post gig|create gig|வேலை போஸ்ட்|வேலை உருவாக்க|வேலை அறிவிப்பு|ஜாப் పోస్ట్|नौकरी पोस्ट|काम पोस्ट)/i.test(qLower);

    const isHelp = (
      /(who are you|what can you do|how to use|features|commands|guide|help\\b|help me\\b|help me|உதவி|సహాయం|మదद)/i.test(qLower) &&
      !detectedSkill &&
      !isNearMe &&
      !radiusKm &&
      !availability &&
      !isHighRating &&
      !isPostJobIntent
    );`
);

// Remove duplicate isPostJobIntent if present below
newExtractFunc = newExtractFunc.replace(
  `    const isPostJobIntent = /(create a job|create.*job|create.*gig|post a job|post a gig|help me post|help me create|need to hire|need someone to|post gig|create gig|வேலை போஸ்ட்|வேலை உருவாக்க|வேலை அறிவிப்பு|ஜாப் పోస్ట్|नौकरी पोस्ट|काम पोस्ट)/i.test(qLower);\n`,
  ''
);

// Add allSkills to returned object
newExtractFunc = newExtractFunc.replace(
  'return {\n      skill: detectedSkill,\n',
  'return {\n      skill: detectedSkill,\n      allSkills,\n'
);

code = code.replace(oldExtractFunc, newExtractFunc);

// Now update buildFindWorkersActionResponse to support multi-skill
const oldFindFunc = code.substring(
  code.indexOf('private buildFindWorkersActionResponse('),
  code.indexOf('private buildPostJobActionResponse(')
);

let newFindFunc = oldFindFunc;

const oldMatchWorkersLogic = `    let matchedWorkers = context.users.filter(u => u.role === 'seeker');

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

const newMatchWorkersLogic = `    const activeSkills = (entities.allSkills && entities.allSkills.length > 0)
      ? entities.allSkills
      : (entities.skill ? [entities.skill] : []);

    let matchedWorkers = context.users.filter(u => u.role === 'seeker');

    if (activeSkills.length > 0) {
      matchedWorkers = matchedWorkers.filter(w => {
        const skillsJoined = (w.skills || []).join(' ').toLowerCase();
        const nameLower = w.name.toLowerCase();
        return activeSkills.some(sk => {
          const skLower = sk.toLowerCase();
          const synonyms = KNOWN_SKILL_SYNONYMS[sk] || [skLower];
          return (
            skillsJoined.includes(skLower) ||
            nameLower.includes(skLower) ||
            synonyms.some(s => skillsJoined.includes(s) || nameLower.includes(s))
          );
        });
      });
    }`;

newFindFunc = newFindFunc.replace(oldMatchWorkersLogic, newMatchWorkersLogic);

// Replace topWorkers slice with multi-skill representative selection
const oldTopSlice = `    const topWorkers = matchedWorkers.slice(0, 3);
    const skillDesc = (entities.allSkills && entities.allSkills.length > 1)
      ? entities.allSkills.map(s => \`**\${s}**\`).join(' and ')
      : (entities.skill ? \`**\${entities.skill}**\` : 'verified');`;

const newTopSlice = `    let topWorkers: any[] = [];
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
      : (entities.skill ? \`**\${entities.skill}**\` : 'verified');`;

newFindFunc = newFindFunc.replace(oldTopSlice, newTopSlice);

code = code.replace(oldFindFunc, newFindFunc);

fs.writeFileSync('src/services/chatAssistantService.ts', code, 'utf8');
console.log('Successfully updated chatAssistantService.ts');
