const fs = require('fs');
let code = fs.readFileSync('src/services/chatAssistantService.ts', 'utf8');

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

if (!code.includes('getWelcomeMessage')) {
  code = code.replace('class ChatAssistantService {', 'class ChatAssistantService {\n' + welcomeFunc);
}

if (!code.includes('if (typeof window ===')) {
  code = code.replace(
    'private async queryGeminiBackend(query: string, context: ChatContextPayload): Promise<ChatMessage | null> {',
    'private async queryGeminiBackend(query: string, context: ChatContextPayload): Promise<ChatMessage | null> {\n    if (typeof window === "undefined") return null;'
  );
}

fs.writeFileSync('src/services/chatAssistantService.ts', code, 'utf8');
console.log('Successfully patched chatAssistantService.ts');
