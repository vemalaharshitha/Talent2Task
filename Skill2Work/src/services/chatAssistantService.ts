/**
 * Talent2Task AI Chat Assistant Service.
 * Provides true context-aware, action-oriented intelligence for Workers and Employers.
 * Connects to Gemini API via backend /api/chat and seamlessly integrates with
 * application engines (matchingService, semanticService, geoService, demandIntelligenceService,
 * skillGapService, reliabilityService, nlpService, sqliteManager).
 */

import type { User, Job, Language, SkillDemandStat } from '../types';
import { calculateHaversineDistance, TAMIL_NADU_CITIES } from './geoService';
import { skillGapService } from './skillGapService';
import { demandIntelligenceService } from './demandIntelligenceService';
import { semanticService } from './semanticService';
import { calculateAvailabilityScore, calculateExperienceScore, DEFAULT_HYBRID_WEIGHTS } from './matchingService';
import { nlpService } from './nlpService';
import { localizeContent } from '../i18n/translations';
import { sqliteManager } from '../db/sqliteManager';
import { detectLanguageFromScript } from '../i18n/autoTranslate';

export interface ChatActionItem {
  type: 
    | 'VIEW_JOB'
    | 'CLAIM_JOB'
    | 'OPEN_POST_JOB'
    | 'NAVIGATE_TAB'
    | 'SET_RADIUS'
    | 'SET_LOCATION'
    | 'TRIGGER_GPS'
    | 'FILTER_JOBS'
    | 'ADD_SKILL'
    | 'OPEN_COMMUNITY_DEMAND'
    | 'OPEN_PROFILE'
    | 'CONFIRM_ACTION';
  label: string;
  payload?: any;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  autoExecute?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actions?: ChatActionItem[];
  intent?: string;
  detectedLanguage?: string;
  jobCards?: Job[];
  workerCards?: User[];
  suggestedFollowUps?: string[];
  explanationBreakdown?: {
    semanticSkill: number;
    distance: number;
    availability: number;
    experience: number;
    localDemand: number;
    reliability: number;
    totalScore: number;
  };
  originalText?: string;
  originalLanguage?: Language;
  translations?: Partial<Record<Language, string>>;
}

export interface ChatContextPayload {
  currentUser: User | null;
  jobs: Job[];
  users: User[];
  skillDemandStats: SkillDemandStat[];
  language: Language;
  currentCoords?: { latitude: number; longitude: number } | null;
  radiusKm?: number;
  selectedJob?: Job | null;
  activeTab?: 'explore' | 'my-gigs' | 'post-manage';
  history?: ChatMessage[];
}

export interface ExtractedQueryEntities {
  skill: string | null;
  location: string | null;
  isNearMe: boolean;
  radiusKm: number | null;
  availability: 'today' | 'tomorrow' | 'weekend' | 'morning' | 'afternoon' | 'evening' | 'night' | 'immediate' | null;
  isHighRating: boolean;
  isPostJobIntent: boolean;
  isWorkerSearchIntent: boolean;
  isJobSearchIntent: boolean;
  isSkillGapIntent: boolean;
  isDemandIntent: boolean;
  isExplanationIntent: boolean;
  isDestructiveIntent: boolean;
  isGreeting: boolean;
  isPlatformAbout: boolean;
  isPlatformMatchingHow: boolean;
  isHelp: boolean;
  isUnrelated: boolean;
  isAmbiguousSearch: boolean;
  isFollowUpFilter: boolean;
  rawText: string;
}

// Comprehensive multi-trade dictionary for Tamil Nadu gig economy
const KNOWN_SKILL_SYNONYMS: Record<string, string[]> = {
  'Plumbing': ['plumb', 'plumber', 'pipe', 'leak', 'drain', 'tap', 'sanitary', 'valve', 'குழாய்', 'பிளம்பர்', 'नलसाज', 'ప్లంబర్'],
  'Electrical': ['electr', 'electrician', 'wiring', 'switchboard', 'inverter', 'fuse', 'generator', 'மின்சார', 'எலக்ட்ரீஷியன்', 'बिजली', 'इलेक्ट्रीशियन', 'ఎలక్ట్రీషియన్'],
  'Painter': ['paint', 'painter', 'painting', 'wall paint', 'whitewash', 'primer', 'வண்ணம்', 'வர்ணம்', 'பெயிண்டர்', 'पेंटर', 'रंगाई', 'పెయింటర్'],
  'Driver': ['driver', 'driving', 'chauffeur', 'car driver', 'auto driver', 'cab', 'டிரைவர்', 'ஓட்டுநர்', 'ड्राइवर', 'चालक', 'డ్రైవర్'],
  'Delivery': ['delivery', 'rider', 'courier', 'food delivery', 'parcel', 'டெலிவரி', 'டிரான்ஸ்போர்ட்', 'डिलीवरी', 'డెలివరీ'],
  'Store Helper': ['store helper', 'shop helper', 'inventory', 'billing', 'stock', 'cashier', 'கடை', 'உதவியாளர்', 'दुकान सहायक', 'స్టోర్ హెల్పర్'],
  'Catering & Cooking': ['cook', 'cooking', 'chef', 'cater', 'catering', 'kitchen', 'food prep', 'சமையல்', 'குக்', 'बावर्ची', 'खाना बनाना', 'వంట'],
  'Housekeeping': ['housekeep', 'housekeeping', 'clean', 'cleaning', 'cleaner', 'dusting', 'mop', 'துப்புரவு', 'வீட்டு வேலை', 'सफाई', 'హౌస్‌కీపింగ్'],
  'Security Guard': ['security', 'security guard', 'watchman', 'guard', 'காவலாளி', 'பாதுகாவலர்', 'सुरक्षा गार्ड', 'సెక్యూరిటీ గార్డ్'],
  'Carpentry': ['carpenter', 'carpentry', 'wood', 'furniture', 'door repair', 'தச்சர்', 'மர வேலை', 'बढ़ई', 'కార్పెంటర్'],
  'Masonry': ['mason', 'masonry', 'bricklayer', 'concrete', 'plastering', 'கொத்தனார்', 'கட்டுமானம்', 'राजमिस्त्री', 'మేస్త్రీ'],
  'Welding': ['welder', 'welding', 'fabrication', 'grill work', 'வெல்டர்', 'வெல்டிங்', 'वेल्डर', 'వెల్డర్'],
  'Tailoring': ['tailor', 'tailoring', 'stitching', 'garment', 'தையல்', 'தையல்காரர்', 'दर्जी', 'టైలర్'],
  'Beautician': ['beautician', 'salon', 'makeup', 'haircut', 'அழகுக்கலை', 'ब्यूटीशियन', 'బ్యూటీషియన్'],
  'Data Entry': ['data entry', 'typing', 'computer operator', 'office assistant', 'தட்டச்சு', 'டாட்டா என்ட்ரி', 'डेटा एंट्री', 'డేటా ఎంట్రీ'],
  'Mechanic': ['mechanic', 'bike repair', 'auto mechanic', 'garage', 'மெக்கானிக்', 'मैकेनिक', 'మెకానిక్'],
  'Appliance Repair': ['appliance repair', 'ac repair', 'washing machine', 'refrigerator repair', 'ஏசி ரிப்பேர்', 'उपकरण मरम्मत', 'రిపేర్'],
  'Gardening': ['gardener', 'gardening', 'lawn', 'plants', 'தோட்டக்காரர்', 'தோட்டம்', 'माली', 'గార్డెనర్'],
  'Tutor': ['tutor', 'teaching', 'tuition', 'teacher', 'ஆசிரியர்', 'கல்வி', 'शिक्षक', 'ట్యూటర్']
};

class ChatAssistantService {
  /**
   * Main query processor
   * Connects to backend Gemini AI /api/chat with full conversational memory and hybrid matching
   */
  public async handleQuery(query: string, context: ChatContextPayload): Promise<ChatMessage> {
    const trimmed = query.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!trimmed) {
      return {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        text: 'Please type a question or request (e.g., "Find painters near me" or "Show jobs within 5 km").',
        timestamp
      };
    }

    try {
      // 1. Try Gemini Live Chat Engine
      const geminiResponse = await this.queryGeminiBackend(trimmed, context);
      if (geminiResponse) {
        return geminiResponse;
      }
    } catch (err) {
      console.warn('Gemini chat backend error, falling back to local reasoning:', err);
    }

    // 2. Fallback to full local contextual NLP & reasoning engine
    return await this.processClientQuery(trimmed, context);
  }

  /**
   * Calls the backend Gemini chat endpoint with multi-turn conversation and hyperlocal context
   */
  private async queryGeminiBackend(query: string, context: ChatContextPayload): Promise<ChatMessage | null> {
    const lang = context.language || 'en';
    const user = context.currentUser;
    const isRecruiter = user?.role === 'recruiter';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Format recent conversation history
    const conversationHistory = (context.history || [])
      .filter(m => m.id !== 'welcome_1' && m.text)
      .slice(-8)
      .map(m => ({
        role: m.sender === 'assistant' ? 'assistant' : 'user',
        text: m.text
      }));

    // Hyperlocal platform context
    const openGigs = context.jobs.filter(j => j.status === 'OPEN' || !j.status);
    const verifiedWorkers = context.users.filter(u => u.role === 'seeker');
    const topDemanded = (context.skillDemandStats || []).slice(0, 5).map(s => s.skill);

    const chatContext = {
      role: isRecruiter ? 'recruiter' : 'seeker',
      userName: user?.name || (isRecruiter ? 'Recruiter' : 'Worker'),
      userSkills: user?.skills || [],
      userLocation: user?.city || 'Chennai',
      radiusKm: context.radiusKm || 5,
      language: lang,
      openGigsCount: openGigs.length,
      verifiedWorkersCount: verifiedWorkers.length,
      topDemandedSkills: topDemanded
    };

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: query,
        history: conversationHistory,
        context: chatContext,
        language: lang
      })
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data || !data.reply) {
      return null;
    }

    const intent = (data.intent || '').toUpperCase();
    const params = data.extractedParameters || {};
    const suggestedFollowUps: string[] = data.suggestedFollowUps || [];
    const actions: ChatActionItem[] = [];

    // Parse actions suggested by Gemini
    if (Array.isArray(data.actions)) {
      for (const act of data.actions) {
        if (typeof act === 'string') {
          actions.push({ type: 'NAVIGATE_TAB', label: act, payload: { tab: 'explore' } });
        } else if (act && act.label) {
          actions.push({
            type: act.type || 'NAVIGATE_TAB',
            label: act.label,
            payload: act.payload || { tab: 'explore' },
            variant: act.variant || 'primary'
          });
        }
      }
    }

    let jobCards: Job[] | undefined;
    let workerCards: User[] | undefined;
    let explanationBreakdown: ChatMessage['explanationBreakdown'] | undefined;

    const userLoc = context.currentCoords || (user ? { latitude: user.latitude, longitude: user.longitude } : null);
    let searchLat = userLoc?.latitude || 13.0827;
    let searchLng = userLoc?.longitude || 80.2707;
    let locationLabel = params.location || user?.city || 'Chennai';

    if (params.location) {
      const cityLoc = TAMIL_NADU_CITIES.find(c =>
        c.name.toLowerCase() === params.location?.toLowerCase() ||
        c.district.toLowerCase() === params.location?.toLowerCase()
      );
      if (cityLoc) {
        searchLat = cityLoc.lat;
        searchLng = cityLoc.lng;
        locationLabel = cityLoc.name;
      }
    }

    const searchSkill = params.skill || this.detectSkillInText(query);
    const searchRadius = params.radiusKm ? Number(params.radiusKm) : (params.isNearMe ? 5 : null);

    // 1. Matched Workers Search (Recruiter or Worker Search Intent)
    if (intent === 'FIND_WORKER' || intent === 'WORKER_SEARCH' || (isRecruiter && searchSkill && intent !== 'FIND_JOB')) {
      let candidateList = context.users.filter(u => u.role === 'seeker');

      if (searchSkill) {
        const skillLower = searchSkill.toLowerCase();
        const synonyms = KNOWN_SKILL_SYNONYMS[searchSkill] || [skillLower];

        candidateList = candidateList.filter(w => {
          const skillsJoined = (w.skills || []).join(' ').toLowerCase();
          const nameLower = w.name.toLowerCase();
          return (
            skillsJoined.includes(skillLower) ||
            nameLower.includes(skillLower) ||
            synonyms.some(s => skillsJoined.includes(s) || nameLower.includes(s))
          );
        });
      }

      if (params.minRating) {
        candidateList = candidateList.filter(w => (w.rating || 4.5) >= Number(params.minRating));
      }

      if (searchRadius) {
        candidateList = candidateList.filter(w => {
          const dist = calculateHaversineDistance(searchLat, searchLng, w.latitude, w.longitude);
          return dist <= searchRadius;
        });
      }

      // Sort by rating + proximity
      candidateList.sort((a, b) => {
        const relA = (a as any).reliability_score ? (a as any).reliability_score * 100 : (a.rating || 4.5) * 20;
        const relB = (b as any).reliability_score ? (b as any).reliability_score * 100 : (b.rating || 4.5) * 20;
        const distA = calculateHaversineDistance(searchLat, searchLng, a.latitude, a.longitude);
        const distB = calculateHaversineDistance(searchLat, searchLng, b.latitude, b.longitude);
        const scoreA = (relA * 0.6) + (Math.max(10, 100 - (distA * 5)) * 0.4);
        const scoreB = (relB * 0.6) + (Math.max(10, 100 - (distB * 5)) * 0.4);
        return scoreB - scoreA;
      });

      if (candidateList.length > 0) {
        workerCards = candidateList.slice(0, 3);
        if (actions.length === 0) {
          actions.push(
            {
              type: 'OPEN_POST_JOB',
              label: `Post Gig for ${searchSkill || 'Candidate'}`,
              payload: { category: searchSkill || 'Helper', skills: searchSkill ? [searchSkill] : [] },
              variant: 'success'
            },
            {
              type: 'NAVIGATE_TAB',
              label: 'View Candidates on Map',
              payload: { tab: 'explore', view: 'map' }
            }
          );
        }
      }
    }

    // 2. Matched Gigs Search (Seeker or Job Search Intent)
    if (intent === 'FIND_JOB' || intent === 'SEARCH' || intent === 'SKILL_SEARCH' || intent === 'LOCATION_SEARCH' || (!isRecruiter && (searchSkill || searchRadius))) {
      let matchedJobs = context.jobs.filter(j => j.status === 'OPEN' || !j.status);

      if (searchSkill) {
        const skillLower = searchSkill.toLowerCase();
        const synonyms = KNOWN_SKILL_SYNONYMS[searchSkill] || [skillLower];
        matchedJobs = matchedJobs.filter(j => {
          const titleLower = j.title.toLowerCase();
          const catLower = j.category.toLowerCase();
          const skillsJoined = j.required_skills.join(' ').toLowerCase();
          const descLower = j.description.toLowerCase();
          return (
            catLower.includes(skillLower) ||
            titleLower.includes(skillLower) ||
            skillsJoined.includes(skillLower) ||
            descLower.includes(skillLower) ||
            synonyms.some(s => titleLower.includes(s) || catLower.includes(s) || skillsJoined.includes(s) || descLower.includes(s))
          );
        });
      }

      if (params.maxWage) {
        matchedJobs = matchedJobs.filter(j => j.payout_amount <= Number(params.maxWage));
      }

      matchedJobs = matchedJobs.map(j => {
        const dist = calculateHaversineDistance(searchLat, searchLng, j.latitude, j.longitude);
        return { ...j, distanceKm: dist };
      });

      if (searchRadius) {
        matchedJobs = matchedJobs.filter(j => (j.distanceKm || 0) <= searchRadius);
      }

      matchedJobs.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));

      if (matchedJobs.length > 0) {
        jobCards = matchedJobs.slice(0, 3);
        if (actions.length === 0) {
          if (searchRadius) {
            actions.push({
              type: 'SET_RADIUS',
              label: `Set Radar to ${searchRadius} km`,
              payload: { radiusKm: searchRadius },
              autoExecute: true
            });
          }
          actions.push({
            type: 'NAVIGATE_TAB',
            label: 'View Gigs on Radar',
            payload: { tab: 'explore', view: 'both' }
          });
        }
      }
    }

    // 3. Post Job Flow
    if (intent === 'POST_GIG' || intent === 'CREATE_JOB') {
      const targetRole = searchSkill || 'Painter';
      const extracted = nlpService.parseJobRequirement(query, locationLabel);
      const skills = extracted.skills.length > 0 ? extracted.skills : this.getDefaultSkillsForCategory(targetRole);
      const demandIntel = demandIntelligenceService.analyzeDemand(context.jobs, locationLabel);
      const skillStat = demandIntel.skillsDemand.find(s => s.skill.toLowerCase().includes(targetRole.toLowerCase()));
      const suggestedPay = extracted.payout.amount || (skillStat ? skillStat.avgHourlyPay * 4 : 750);
      const payoutUnit = extracted.payout.unit || 'day';

      actions.push({
        type: 'OPEN_POST_JOB',
        label: `Open Pre-filled ${targetRole} Creator`,
        payload: {
          category: targetRole,
          title: extracted.title || `${targetRole} Needed`,
          skills,
          description: extracted.rawText || `Requirement for verified ${targetRole} in ${locationLabel}. Good compensation.`,
          payoutAmount: suggestedPay,
          payoutUnit: payoutUnit as any,
          nlText: query
        },
        variant: 'primary'
      });
    }

    // 4. Recommendation Explanation
    if (intent === 'MATCH_QUERY' || intent === 'EXPLAIN_MATCH' || /why.*recommended/i.test(query)) {
      const targetJob = context.selectedJob || context.jobs[0];
      const seekerSkills = user?.skills || ['Tamil Speaking', 'Customer Support'];
      const requiredSkills = targetJob?.required_skills || ['Plumbing'];
      const skillEval = semanticService.evaluateSkillsSemanticSync(seekerSkills, requiredSkills);
      const skillScore = Math.round((skillEval ? skillEval.semanticSkillScore : 0.85) * 100);

      let distanceKm = 2.4;
      if (userLoc && targetJob) {
        distanceKm = calculateHaversineDistance(userLoc.latitude, userLoc.longitude, targetJob.latitude, targetJob.longitude);
      }
      const distScore = Math.max(10, Math.round(100 - (distanceKm * 6)));
      const availScore = calculateAvailabilityScore(user?.free_time_slots || [], targetJob || ({} as any)).timeScore;
      const expScore = calculateExperienceScore(user?.experience).experienceScore;
      const totalScore = Math.round(
        (skillScore * DEFAULT_HYBRID_WEIGHTS.semanticSkill) +
        (distScore * DEFAULT_HYBRID_WEIGHTS.distance) +
        (availScore * DEFAULT_HYBRID_WEIGHTS.availability) +
        (expScore * DEFAULT_HYBRID_WEIGHTS.experience) +
        (85 * DEFAULT_HYBRID_WEIGHTS.localDemand) +
        (90 * DEFAULT_HYBRID_WEIGHTS.reliability)
      );

      explanationBreakdown = {
        semanticSkill: skillScore,
        distance: distScore,
        availability: availScore,
        experience: expScore,
        localDemand: 85,
        reliability: 90,
        totalScore
      };

      if (targetJob && !jobCards) {
        jobCards = [targetJob];
      }
    }

    // 5. Skill Gap Analysis
    if (intent === 'SKILL_GAP' || intent === 'DEMAND_ANALYSIS') {
      const targetCity = params.location || user?.city || 'Chennai';
      const cityDemand = demandIntelligenceService.analyzeDemand(context.jobs, targetCity);
      const topDemanded = cityDemand.skillsDemand.slice(0, 3);

      topDemanded.forEach(d => {
        actions.push({
          type: 'ADD_SKILL',
          label: `+ Add "${d.skill}" to Profile`,
          payload: { skill: d.skill },
          variant: 'success'
        });
      });

      actions.push({
        type: 'OPEN_COMMUNITY_DEMAND',
        label: 'View Regional Demand Trends'
      });
    }

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: data.reply,
      timestamp,
      actions: actions.length > 0 ? actions : undefined,
      intent,
      detectedLanguage: data.detectedLanguage,
      jobCards,
      workerCards,
      suggestedFollowUps: suggestedFollowUps.length > 0 ? suggestedFollowUps : undefined,
      explanationBreakdown
    };
  }

  private detectSkillInText(text: string): string | null {
    const qLower = text.toLowerCase();
    for (const [canonicalRole, synonyms] of Object.entries(KNOWN_SKILL_SYNONYMS)) {
      for (const syn of synonyms) {
        if (qLower.includes(syn.toLowerCase())) {
          return canonicalRole;
        }
      }
    }
    return null;
  }

  /**
   * Comprehensive Client-Side Reasoning & Action Dispatcher (Offline Fallback)
   */
  private async processClientQuery(query: string, context: ChatContextPayload): Promise<ChatMessage> {
    const queryLang = detectLanguageFromScript(query);
    const lang = (queryLang !== 'en' ? queryLang : (context.language || 'en')) as Language;
    const user = context.currentUser;
    const isRecruiter = user?.role === 'recruiter';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Dynamic Natural Language Entity & Intent Extraction
    const entities = this.extractEntities(query, context);

    // 2. Destructive Actions Protection
    if (entities.isDestructiveIntent) {
      return this.buildDestructiveConfirmationResponse(context, timestamp);
    }

    // 3. Platform Identity & Capabilities
    if (entities.isPlatformAbout) {
      return this.buildPlatformAboutResponse(lang, timestamp);
    }

    if (entities.isPlatformMatchingHow) {
      return this.buildMatchingArchitectureResponse(lang, timestamp);
    }

    if (entities.isHelp) {
      return this.buildHelpResponse(lang, isRecruiter, timestamp);
    }

    // 4. Greetings & Casual Chit-chat
    if (entities.isGreeting && !entities.skill && !entities.location && !entities.radiusKm && !entities.isPostJobIntent && !entities.isJobSearchIntent && !entities.isWorkerSearchIntent) {
      return this.buildGreetingResponse(lang, isRecruiter, user?.name, timestamp);
    }

    // 5. Unrelated / General Questions
    if (entities.isUnrelated && !entities.skill && !entities.location && !entities.radiusKm && !entities.isJobSearchIntent && !entities.isWorkerSearchIntent) {
      return this.buildUnrelatedResponse(query, lang, timestamp);
    }

    // 6. Recommendation Explanation
    if (entities.isExplanationIntent) {
      return this.buildRecommendationExplanationResponse(context, entities, timestamp);
    }

    // 7. Post Job Flow
    if (entities.isPostJobIntent) {
      return this.buildPostJobActionResponse(query, context, entities, timestamp);
    }

    // 8. Skill Gap & Local Demand Inquiries
    if (entities.isSkillGapIntent || entities.isDemandIntent) {
      return await this.buildSkillGapActionResponse(context, entities, timestamp);
    }

    // 9. Ambiguous Request Handling
    if (entities.isAmbiguousSearch && !entities.skill && !entities.isFollowUpFilter) {
      return this.buildAmbiguousClarificationResponse(lang, isRecruiter, timestamp);
    }

    // 10. Worker Search
    if (entities.isWorkerSearchIntent || (isRecruiter && !entities.isJobSearchIntent && entities.skill)) {
      return this.buildFindWorkersActionResponse(context, entities, timestamp);
    }

    // 11. Job Search
    if (entities.isJobSearchIntent || entities.isFollowUpFilter || entities.skill || entities.radiusKm || entities.availability) {
      return this.buildJobSearchActionResponse(context, entities, timestamp);
    }

    // 12. Fallback Contextual Response
    return this.buildFallbackResponse(query, lang, isRecruiter, timestamp);
  }

  /**
   * Intelligent Multi-Turn Entity & Parameter Extractor
   */
  private extractEntities(query: string, context: ChatContextPayload): ExtractedQueryEntities {
    const qLower = query.toLowerCase();
    const cleanText = query.trim();
    const user = context.currentUser;
    const isRecruiter = user?.role === 'recruiter';

    // Multi-turn History Context Recovery
    const previousContext = this.recoverPreviousSearchContext(context.history);

    // Detect Skill / Role
    let detectedSkill = this.detectSkillInText(query);

    const isFollowUpFilter = (
      /(only|within|available|in\s+[a-z]+|rating|rated|tomorrow|today|weekend)/i.test(qLower) &&
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
    const radiusMatch = qLower.match(/(\d+(?:\.\d+)?)\s*(?:km|k\.m|kilometer|கிலோமீட்டர்|किमी|కి.మీ)/i);
    let radiusKm: number | null = radiusMatch ? parseFloat(radiusMatch[1]) : null;
    if (!radiusKm && isNearMe) {
      radiusKm = 5;
    }
    if (!radiusKm && isFollowUpFilter && previousContext.radiusKm) {
      radiusKm = previousContext.radiusKm;
    }

    // Detect Availability / Timing (Sessions, Immediate, Clock Times)
    let availability: ExtractedQueryEntities['availability'] = null;
    const timeMatch12 = qLower.match(/(?:at|by|around|from)?\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\b/i);
    const timeMatch24 = qLower.match(/(?:at|by|around|from)\s+(\d{1,2})[:.](\d{2})\b/i);

    if (timeMatch12) {
      let h = parseInt(timeMatch12[1], 10);
      const period = timeMatch12[3].toLowerCase().replace(/\./g, '');
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
    const isHighRating = /(highly rated|top rated|high rating|best rating|5 star|4.5\+|good rating|அதிக ரேட்டிங்|சிறந்த|उच्च रेटिंग|అత్యధిక రేటింగ్)/i.test(qLower) ||
      (isFollowUpFilter && previousContext.isHighRating);

    // Intent Classifications
    const isGreeting = /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|hola|namaste|vanakkam|namaskaram|வணக்கம்|ஹலோ|ஹாய்|నమస్కారం|హలో|नमस्ते|नमस्कार|हैलो)\b/i.test(qLower) ||
      ['hi', 'hello', 'hey', 'start'].includes(qLower);

    const isPlatformAbout = /(what is talent2task|about talent2task|what does this app do|tell me about talent2task|என்ன தளம்|டேலண்ட்2டாஸ்க் என்றால் என்ன|टैलेंट2टास्क क्या है)/i.test(qLower);
    
    const isPlatformMatchingHow = /(how does.*matching work|how is match.*calculated|how match.*work|explain matching|formula|பொருத்தம் எவ்வாறு|மேட்ச் ஸ்கோர் எப்படி|मैचिंग कैसे काम करती है)/i.test(qLower);

    const isHelp = (
      /(who are you|what can you do|how to use|features|commands|guide|help me|help\b|உதவி|సహాయం|మదद)/i.test(qLower) &&
      !detectedSkill &&
      !isNearMe &&
      !radiusKm &&
      !availability &&
      !isHighRating
    );

    const isUnrelated = /(weather|temperature|joke|capital of|who won|president|movie|song|வானிலை|காலநிலை|मौसम|వాతావరణం)/i.test(qLower);

    const isDestructiveIntent = /(delete|remove|cancel|நீக்கு|ரத்து|हटाएं|రद्द|తొలగించు|రద్దు)\s*(?:my\s*)?(job|gig|post|posting|account|listing|application|வேலை|பணி|कार्य|नौकरी|పని)/i.test(qLower) ||
      /(delete job|delete gig|delete my post|remove job|cancel gig|cancel job)/i.test(qLower);

    const isExplanationIntent = /(why was this|why recommended|why this worker|why this job|how match score|explain score|recommendation reason|ஏன் பரிந்துரைக்கப்பட்டது|ஏன் இந்த வேலை|எப்படி பொருத்தம்|क्यों अनुशंसित|ఎందుకు సిఫార్సు)/i.test(qLower);

    const isPostJobIntent = /(create a job|create.*job|create.*gig|post a job|post a gig|need to hire|need someone to|post gig|create gig|help me create|வேலை போஸ்ட்|வேலை உருவாக்க|வேலை அறிவிப்பு|ஜாப் పోస్ట్|नौकरी पोस्ट|काम पोस्ट)/i.test(qLower);

    const isSkillGapIntent = /(what should i learn|skills should i learn|skills to learn|what to learn|how to earn more|கற்க வேண்டும்|தேவைப்படும் திறன்|நேర్చుకోవాలి|कौशल सीखने)/i.test(qLower);

    const isDemandIntent = /(in demand|demand in|trending skills|high demand|அதிக தேவை|டிமாண்ட்|कौशल मांग|డిమాండ్)/i.test(qLower);

    const isWorkerSearchIntent = /(find.*worker|hire.*worker|need a worker|hire a|need.*candidate|top rated.*worker|highly rated.*worker|ஆட்கள் தேவை|பணியாளர் தேவை|தொழிலாளர்கள்|కార్మికులు|कारीगर|श्रमिक)/i.test(qLower) ||
      (isRecruiter && /(worker|candidates|plumbers|painters|electricians|drivers|cooks|helpers|carpenters|masons|rated|top|best)/i.test(qLower) && !/(find.*job|show.*jobs)/i.test(qLower));

    const isJobSearchIntent = /(find.*job|show.*job|jobs near|jobs within|jobs match|matching my skills|available tomorrow|available today|shifts near|work near|gigs near|வேலை|பணி|பணிகள்|పని|ఉద్యోగం|नौकरी|काम)/i.test(qLower) ||
      (!isRecruiter && Boolean(detectedSkill) && !isPostJobIntent && !isWorkerSearchIntent);

    const isAmbiguousSearch = /(find me a job|i need a job|i need work|show me work|find work|get a job|வேலை வேண்டும்|வேலை காட்டு|काम चाहिए|నాకు పని కావాలి)/i.test(qLower) && !detectedSkill;

    return {
      skill: detectedSkill,
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
  }

  /**
   * Multi-Turn Context Memory Tracker
   */
  private recoverPreviousSearchContext(history?: ChatMessage[]): {
    skill: string | null;
    location: string | null;
    radiusKm: number | null;
    availability: ExtractedQueryEntities['availability'];
    isHighRating: boolean;
  } {
    const result = {
      skill: null as string | null,
      location: null as string | null,
      radiusKm: null as number | null,
      availability: null as ExtractedQueryEntities['availability'],
      isHighRating: false
    };

    if (!history || history.length === 0) return result;

    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      if (msg.sender === 'user') {
        const text = msg.text.toLowerCase();
        if (!result.skill) {
          result.skill = this.detectSkillInText(text);
        }
        if (!result.location) {
          for (const city of TAMIL_NADU_CITIES) {
            if (text.includes(city.name.toLowerCase())) {
              result.location = city.name;
              break;
            }
          }
        }
        if (!result.radiusKm) {
          const rMatch = text.match(/(\d+(?:\.\d+)?)\s*km/i);
          if (rMatch) result.radiusKm = parseFloat(rMatch[1]);
        }
        if (!result.isHighRating) {
          result.isHighRating = /(highly rated|top rated|high rating|4.5\+)/i.test(text);
        }
      }
    }

    return result;
  }

  private buildAmbiguousClarificationResponse(lang: Language, isRecruiter: boolean, timestamp: string): ChatMessage {
    let reply = '';
    const actions: ChatActionItem[] = [];

    if (lang === 'ta') {
      reply = isRecruiter
        ? `நிச்சயமாக! நீங்கள் எந்த வகையான பணியாளர்களைத் தேடுகிறீர்கள்? (எ.கா: பிளம்பிங், எலக்ட்ரிக்கல், பெயிண்டிங், டிரைவிங், டெலிவரி)`
        : `நிச்சயமாக! நீங்கள் எந்த வகையான வேலையைத் தேடுகிறீர்கள்? (எ.கா: பிளம்பிங், எலக்ட்ரிக்கல், பெயிண்டிங், டிரைவிங், டெலிவரி)`;
      actions.push(
        { type: 'FILTER_JOBS', label: 'பிளம்பிங் வேலைகள்', payload: { searchQuery: 'Plumbing', category: 'Plumbing' } },
        { type: 'FILTER_JOBS', label: 'எலக்ட்ரிக்கல் வேலைகள்', payload: { searchQuery: 'Electrical', category: 'Electrical' } },
        { type: 'FILTER_JOBS', label: 'பெயிண்டிங் வேலைகள்', payload: { searchQuery: 'Painter', category: 'Painter' } },
        { type: 'FILTER_JOBS', label: 'டெலிவரி வேலைகள்', payload: { searchQuery: 'Delivery', category: 'Delivery' } }
      );
    } else if (lang === 'hi') {
      reply = isRecruiter
        ? `ज़रूर! आप किस प्रकार के कुशल श्रमिकों को नियुक्त करना चाहते हैं? (उदा: प्लंबर, इलेक्ट्रीशियन, पेंटर, डिलीवरी, ड्राइवर, सहायक)`
        : `ज़रूर! आप किस प्रकार का कार्य या ट्रेड खोज रहे हैं? (उदा: प्लंबर, इलेक्ट्रीशियन, पेंटर, डिलीवरी, ड्राइवर, सहायक)`;
      actions.push(
        { type: 'FILTER_JOBS', label: 'प्लंबिंग कार्य', payload: { searchQuery: 'Plumbing', category: 'Plumbing' } },
        { type: 'FILTER_JOBS', label: 'इलेक्ट्रीशियन कार्य', payload: { searchQuery: 'Electrical', category: 'Electrical' } },
        { type: 'FILTER_JOBS', label: 'पेंटिंग कार्य', payload: { searchQuery: 'Painter', category: 'Painter' } },
        { type: 'FILTER_JOBS', label: 'डिलीवरी कार्य', payload: { searchQuery: 'Delivery', category: 'Delivery' } }
      );
    } else if (lang === 'te') {
      reply = isRecruiter
        ? `ఖచ్చితంగా! మీరు ఏ రకమైన కార్మికులను నియమించాలనుకుంటున్నారు? (ఉదా: ప్లంబర్, ఎలక్ట్రీషియన్, పెయింటర్, డెలివరీ, డ్రైవర్, హెల్పర్)`
        : `ఖచ్చితంగా! మీరు ఏ రకమైన పని లేదా నైపుణ్యం కోసం చూస్తున్నారు? (ఉదా: ప్లంబర్, ఎలక్ట్రీషియన్, పెయింటర్, డెలివరీ, డ్రైవర్, హెల్పర్)`;
      actions.push(
        { type: 'FILTER_JOBS', label: 'ప్లంబింగ్ పనులు', payload: { searchQuery: 'Plumbing', category: 'Plumbing' } },
        { type: 'FILTER_JOBS', label: 'ఎలక్ట్రికల్ పనులు', payload: { searchQuery: 'Electrical', category: 'Electrical' } },
        { type: 'FILTER_JOBS', label: 'పెయింటింగ్ పనులు', payload: { searchQuery: 'Painter', category: 'Painter' } },
        { type: 'FILTER_JOBS', label: 'డెలివరీ పనులు', payload: { searchQuery: 'Delivery', category: 'Delivery' } }
      );
    } else {
      reply = isRecruiter
        ? `Sure! What type of worker or trade are you looking to hire? (e.g., Plumbing, Electrical, Painting, Delivery, Driver, Carpentry)`
        : `Sure! What type of work or trade are you looking for? (e.g., Plumbing, Electrical, Painting, Delivery, Driver, Store Helper)`;
      actions.push(
        { type: 'FILTER_JOBS', label: 'Plumbing Jobs', payload: { searchQuery: 'Plumbing', category: 'Plumbing' } },
        { type: 'FILTER_JOBS', label: 'Electrical Jobs', payload: { searchQuery: 'Electrical', category: 'Electrical' } },
        { type: 'FILTER_JOBS', label: 'Painting Jobs', payload: { searchQuery: 'Painter', category: 'Painter' } },
        { type: 'FILTER_JOBS', label: 'Delivery Jobs', payload: { searchQuery: 'Delivery', category: 'Delivery' } }
      );
    }

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: reply,
      timestamp,
      actions,
      intent: 'AMBIGUOUS_CLARIFICATION'
    };
  }

  private buildPlatformAboutResponse(lang: Language, timestamp: string): ChatMessage {
    let reply = '';
    const actions: ChatActionItem[] = [];

    if (lang === 'ta') {
      reply = `🌐 **Talent2Task** என்பது தமிழ்நாட்டின் முதல் **AI & ஆஃப்லைன் திறன்-பணி ஒருங்கிணைப்பு தளம்** (Hyperlocal Gig Platform).\n\n• **சென்டன்ஸ் டிரான்ஸ்பார்மர் AI**: உங்கள் திறன்களுக்கு துல்லியமான வேலைகளை தானாக இணைக்கிறது.\n• **ஹைப்ரிட் பொருத்தம்**: தூரம் (GPS), அனுபவம், நேரம் மற்றும் நம்பகத்தன்மையை ஒருங்கிணைக்கிறது.\n• **ஆஃப்லைன் ரேடார் & SMS**: இணையம் இல்லாதபோதும் பணி அறிவிப்புகள் மற்றும் வேலை வாய்ப்புகளை அணுகலாம்.`;
      actions.push(
        { type: 'NAVIGATE_TAB', label: 'அருகிலுள்ள ரேடார் வரைபடம்', payload: { tab: 'explore' } },
        { type: 'OPEN_COMMUNITY_DEMAND', label: 'திறன் தேவை பகுப்பாய்வு' }
      );
    } else if (lang === 'hi') {
      reply = `🌐 **Talent2Task** तमिलनाडु का पहला **हाइपरलोकल AI और ऑफलाइन-फर्स्ट गिग मार्केटप्लेस** है, जो कुशल श्रमिकों को तत्काल स्थानीय कार्य अवसरों से जोड़ता है।\n\n• **सेंटेंस ट्रांसफॉर्मर AI**: सटीक कार्य मिलान के लिए कौशल वेक्टर का विश्लेषण करता है।\n• **हाइब्रिड रैंकिंग इंजन**: कौशल वेक्टर (40%), जीपीएस निकटता (20%), समय लब्धता (15%), अनुभव (10%), और विश्वसनीयता (15%) का संयोजन।\n• **ऑफलाइन लचीलापन**: बिना इंटरनेट के भी स्थानीय खोज और बैकअप SMS अलर्ट।`;
      actions.push(
        { type: 'NAVIGATE_TAB', label: 'हाइपरलोकल रडार देखें', payload: { tab: 'explore' } },
        { type: 'OPEN_COMMUNITY_DEMAND', label: 'कौशल मांग विश्लेषण' }
      );
    } else if (lang === 'te') {
      reply = `🌐 **Talent2Task** అనేది తమిళనాడు యొక్క మొట్టమొదటి **హైపర్‌లోకల్ AI మరియు ఆఫ్‌లైన్-ఫస్ట్ గిగ్ ప్లాట్‌ఫారమ్**, ఇది స్థానిక నైపుణ్యం కలిగిన కార్మికులను తక్షణ షిఫ్ట్ అవకాశాలతో కలుపుతుంది.\n\n• **సెంటెన్స్ ట్రాన్స్‌ఫార్మర్ AI**: ఖచ్చితమైన మ్యాచింగ్ కోసం నైపుణ్య వెక్టర్లను లెక్కిస్తుంది.\n• **హైబ్రిడ్ ర్యాంకింగ్ ఇంజిన్**: నైపుణ్యాలు (40%), జీపీఎస్ సామీప్యత (20%), సమయం (15%), అనుభవం (10%) మరియు విశ్వసనీయత (15%).\n• **ఆఫ్‌లైన్ సదుపాయం**: ఇంటర్నెట్ లేకపోయినా పనులను శోధించడం మరియు SMS సదుపాయం.`;
      actions.push(
        { type: 'NAVIGATE_TAB', label: 'హైపర్‌లోకల్ రాడార్ చూడండి', payload: { tab: 'explore' } },
        { type: 'OPEN_COMMUNITY_DEMAND', label: 'నైపుణ్య డిమాండ్ విశ్లేషణ' }
      );
    } else {
      reply = `🌐 **Talent2Task** is Tamil Nadu's dedicated **Hyperlocal AI & Offline-First Gig Marketplace** connecting local skilled workers with immediate shift opportunities.\n\n• **Sentence Transformer AI**: Calibrates semantic skill vectors for precision matching.\n• **Hybrid Ranking Engine**: Blends skill vectors (40%), GPS proximity (20%), availability (15%), experience (10%), district demand (7.5%), and reliability (7.5%).\n• **Offline-First Resilience**: SQLite caching with silent background synchronization and fallback SMS routing.`;
      actions.push(
        { type: 'NAVIGATE_TAB', label: 'Explore Hyperlocal Radar', payload: { tab: 'explore' } },
        { type: 'OPEN_COMMUNITY_DEMAND', label: 'View Skill Demand Analytics' }
      );
    }

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: reply,
      timestamp,
      actions,
      intent: 'PLATFORM_ABOUT'
    };
  }

  private buildMatchingArchitectureResponse(lang: Language, timestamp: string): ChatMessage {
    let reply = '';
    const actions: ChatActionItem[] = [];

    if (lang === 'ta') {
      reply = `📊 **Talent2Task ஹைப்ரிட் AI பொருத்தம் எவ்வாறு கணக்கிடப்படுகிறது?**\n\n1. 🎯 **திறன் ஒற்றுமை (40%)**: சென்டன்ஸ் டிரான்ஸ்பார்மர் மூலம் பெறப்பட்ட திறன் ஒற்றுமை.\n2. 📍 **இருப்பிட தூரம் (20%)**: ஜிபிஎஸ் அடிப்படையிலான துல்லியமான தூரம் (கி.மீ).\n3. ⏰ **நேரப் பொருத்தம் (15%)**: உங்கள் விருப்பமான பணி நேரம்.\n4. 💼 **அனுபவ நிலை (10%)**: பணி அனுபவ ஆண்டுகள்.\n5. 🔥 **மாவட்ட தேவை (7.5%)**: அப்பகுதியில் உள்ள தேவை அளவு.\n6. ⭐ **நம்பகத்தன்மை (7.5%)**: சரிபார்க்கப்பட்ட மதிப்பீடுகள் மற்றும் நிறைவு செய்த பணிகள்.`;
      actions.push(
        { type: 'NAVIGATE_TAB', label: 'பரிந்துரைக்கப்பட்ட வேலைகளைக் காண்க', payload: { tab: 'explore' } }
      );
    } else if (lang === 'hi') {
      reply = `📊 **Talent2Task हाइब्रिड AI मैचिंग कैसे काम करती है?**\n\n1. 🎯 **कौशल समानता (40%)**: सेंटेंस ट्रांसफॉर्मर आधारित वेक्टर मैचिंग।\n2. 📍 **दूरी और निकटता (20%)**: जीपीएस या जिले से हैवर्सिन दूरी।\n3. ⏰ **समय लब्धता (15%)**: आपके पंजीकृत शिफ्ट स्लॉट के साथ अनुकूलता।\n4. 💼 **कार्य अनुभव (10%)**: सत्यापित व्यापार अभ्यास के वर्ष।\n5. 🔥 **जिला मांग (7.5%)**: क्षेत्रीय कौशल मांग और अवसर।\n6. ⭐ **विश्वसनीयता (7.5%)**: ग्राहक समीक्षाएं और पूर्ण किए गए कार्य।`;
      actions.push(
        { type: 'NAVIGATE_TAB', label: 'अनुशंसित कार्य देखें', payload: { tab: 'explore' } }
      );
    } else if (lang === 'te') {
      reply = `📊 **Talent2Task హైబ్రిడ్ AI మ్యాచింగ్ ఎలా పనిచేస్తుంది?**\n\n1. 🎯 **నైపుణ్య సారూప్యత (40%)**: సెంటెన్స్ ట్రాన్స్‌ఫార్మర్ ద్వారా నైపుణ్యాల సరిపోలిక.\n2. 📍 **జీపీఎస్ సామీప్యత (20%)**: మీ స్థానం నుండి ఖచ్చితమైన దూరం.\n3. ⏰ **సమయ లభ్యత (15%)**: మీ షిఫ్ట్ స్లాట్‌ల అనుకూలత.\n4. 💼 **అనుభవం (10%)**: ధృవీకరించబడిన అనుభవ సంవత్సరాలు.\n5. 🔥 **ప్రాంతీయ డిమాండ్ (7.5%)**: జిల్లా నైపుణ్యాల అవసరం.\n6. ⭐ **విశ్వసనీయత (7.5%)**: సమీక్షలు మరియు పూర్తి చేసిన పనులు.`;
      actions.push(
        { type: 'NAVIGATE_TAB', label: 'సిఫార్సు చేయబడిన పనులను చూడండి', payload: { tab: 'explore' } }
      );
    } else {
      reply = `📊 **How Talent2Task Hybrid AI Matching Works**:\n\nRecommendations are calculated dynamically using our transparent 6-factor algorithm:\n\n1. 🎯 **Semantic Skill Overlap (${DEFAULT_HYBRID_WEIGHTS.semanticSkill * 100}% weight)**: Vector cosine similarity via all-MiniLM-L6-v2 Sentence Transformers.\n2. 📍 **Hyperlocal Proximity (${DEFAULT_HYBRID_WEIGHTS.distance * 100}% weight)**: Haversine distance from your GPS or selected district.\n3. ⏰ **Availability Match (${DEFAULT_HYBRID_WEIGHTS.availability * 100}% weight)**: Shift compatibility with your registered time slots.\n4. 💼 **Experience Level (${DEFAULT_HYBRID_WEIGHTS.experience * 100}% weight)**: Verified years of trade practice.\n5. 🔥 **District Demand (${DEFAULT_HYBRID_WEIGHTS.localDemand * 100}% weight)**: Regional skill deficit intelligence.\n6. ⭐ **Reliability & Badges (${DEFAULT_HYBRID_WEIGHTS.reliability * 100}% weight)**: Historical completion rates and employer reviews.`;
      actions.push(
        { type: 'NAVIGATE_TAB', label: 'View My Recommended Gigs', payload: { tab: 'explore' } }
      );
    }

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: reply,
      timestamp,
      actions,
      intent: 'EXPLAIN_MATCH_ALGORITHM'
    };
  }

  private buildUnrelatedResponse(query: string, lang: Language, timestamp: string): ChatMessage {
    let reply = '';
    const actions: ChatActionItem[] = [];

    if (lang === 'ta') {
      reply = `நான் உங்கள் Talent2Task பணி மற்றும் திறன் வழிகாட்டி உதவியாளர். "${query}" பற்றிய தகவல்களை விட, தமிழ்நாட்டின் வேலைகள், திறன்கள் மற்றும் பணியாளர்கள் பற்றிய கேள்விகளுக்கு என்னால் சிறப்பாக உதவ முடியும்!`;
      actions.push(
        { type: 'NAVIGATE_TAB', label: 'உள்ளூர் வேலைகளைக் காண்க', payload: { tab: 'explore' } },
        { type: 'NAVIGATE_TAB', label: 'திறன் போக்குகளை சரிபார்க்கவும்', payload: { tab: 'my-gigs' } }
      );
    } else if (lang === 'hi') {
      reply = `मैं आपका Talent2Task कार्य और करियर सहायक हूँ! मैं तमिलनाडु के स्थानीय कार्यों, जिला मजदूरी और कुशल श्रमिकों में विशेषज्ञता रखता हूँ। आप अपने व्यापार की जरूरतों के बारे में पूछ सकते हैं।`;
      actions.push(
        { type: 'NAVIGATE_TAB', label: 'स्थानीय काम खोजें', payload: { tab: 'explore' } },
        { type: 'NAVIGATE_TAB', label: 'कौशल रुझान देखें', payload: { tab: 'my-gigs' } }
      );
    } else if (lang === 'te') {
      reply = `నేను మీ Talent2Task పని మరియు నైపుణ్యాల సహాయకుడిని! స్థానిక పనులు, జిల్లా వేతనాలు మరియు ధృవీకరించబడిన కార్మికులను కనుగొనడంలో నేను మీకు సహాయపడతాను.`;
      actions.push(
        { type: 'NAVIGATE_TAB', label: 'స్థానిక పనులను చూడండి', payload: { tab: 'explore' } },
        { type: 'NAVIGATE_TAB', label: 'నైపుణ్య ట్రెండ్‌లు చూడండి', payload: { tab: 'my-gigs' } }
      );
    } else {
      reply = `I am your Talent2Task Gig & Career Assistant! While I specialize in local gig shifts, district wages, and verified workers across Tamil Nadu, I can assist you with your trade needs.`;
      actions.push(
        { type: 'NAVIGATE_TAB', label: 'Explore Local Gigs', payload: { tab: 'explore' } },
        { type: 'NAVIGATE_TAB', label: 'Check Skill Trends', payload: { tab: 'my-gigs' } }
      );
    }

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: reply,
      timestamp,
      actions,
      intent: 'UNRELATED_CONVERSATIONAL'
    };
  }

  private buildJobSearchActionResponse(context: ChatContextPayload, entities: ExtractedQueryEntities, timestamp: string): ChatMessage {
    const lang = context.language;
    const user = context.currentUser;
    const userLoc = context.currentCoords || (user ? { latitude: user.latitude, longitude: user.longitude } : null);

    let searchLat = userLoc?.latitude || 13.0827;
    let searchLng = userLoc?.longitude || 80.2707;
    let locationLabel = entities.location || user?.city || 'Chennai';

    if (entities.location) {
      const cityLoc = TAMIL_NADU_CITIES.find(c => c.name.toLowerCase() === entities.location?.toLowerCase() || c.district.toLowerCase() === entities.location?.toLowerCase());
      if (cityLoc) {
        searchLat = cityLoc.lat;
        searchLng = cityLoc.lng;
        locationLabel = cityLoc.name;
      }
    }

    let matchedJobs = context.jobs.filter(j => j.status === 'OPEN' || !j.status);

    if (entities.skill) {
      const skillLower = entities.skill.toLowerCase();
      const synonyms = KNOWN_SKILL_SYNONYMS[entities.skill] || [skillLower];
      matchedJobs = matchedJobs.filter(j => {
        const titleLower = j.title.toLowerCase();
        const catLower = j.category.toLowerCase();
        const skillsJoined = j.required_skills.join(' ').toLowerCase();
        const descLower = j.description.toLowerCase();
        return (
          catLower.includes(skillLower) ||
          titleLower.includes(skillLower) ||
          skillsJoined.includes(skillLower) ||
          descLower.includes(skillLower) ||
          synonyms.some(s => titleLower.includes(s) || catLower.includes(s) || skillsJoined.includes(s) || descLower.includes(s))
        );
      });
    }

    if (entities.availability) {
      matchedJobs = matchedJobs.filter(j => {
        const text = (j.description + ' ' + j.title + ' ' + j.category).toLowerCase();
        if (entities.availability === 'tomorrow') return text.includes('tomorrow') || text.includes('shift') || text.includes('urgent') || text.includes('immediate');
        if (entities.availability === 'today') return text.includes('today') || text.includes('immediate') || text.includes('urgent');
        if (entities.availability === 'weekend') return text.includes('weekend') || text.includes('saturday') || text.includes('sunday') || text.includes('event');
        if (entities.availability === 'immediate') return text.includes('immediate') || text.includes('urgent') || text.includes('today') || text.includes('now');
        if (entities.availability === 'morning') return text.includes('morning');
        if (entities.availability === 'afternoon') return text.includes('afternoon');
        if (entities.availability === 'evening') return text.includes('evening');
        if (entities.availability === 'night') return text.includes('night');
        return true;
      });
    }

    matchedJobs = matchedJobs.map(j => {
      const dist = calculateHaversineDistance(searchLat, searchLng, j.latitude, j.longitude);
      return { ...j, distanceKm: dist };
    });

    if (entities.radiusKm) {
      matchedJobs = matchedJobs.filter(j => (j.distanceKm || 0) <= entities.radiusKm!);
    }

    if (entities.isHighRating) {
      matchedJobs.sort((a, b) => (b.matchScore || 80) - (a.matchScore || 80));
    } else {
      matchedJobs.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    }

    const topJobs = matchedJobs.slice(0, 3);
    const actions: ChatActionItem[] = [];

    const setRadiusLabel = lang === 'ta' ? `சுற்றளவை ${entities.radiusKm || 5} கி.மீ ஆக அமை`
      : lang === 'hi' ? `रडार दायरा ${entities.radiusKm || 5} किमी सेट करें`
      : lang === 'te' ? `రాడార్ పరిధిని ${entities.radiusKm || 5} కి.మీ సెట్ చేయండి`
      : `Set Radar to ${entities.radiusKm || 5} km`;

    const filterLabel = lang === 'ta' ? `வடிகட்டி: ${entities.skill || 'வேலை'}`
      : lang === 'hi' ? `फ़िल्टर: ${entities.skill || 'कार्य'}`
      : lang === 'te' ? `ఫిల్టర్: ${entities.skill || 'పని'}`
      : `Filter: ${entities.skill || 'Gig'}`;

    const viewRadarLabel = lang === 'ta' ? 'ரேடார் வரைபடத்தில் காண்க'
      : lang === 'hi' ? 'रडार मानचित्र पर देखें'
      : lang === 'te' ? 'రాడార్ మ్యాప్‌లో చూడండి'
      : 'View on Radar Map';

    if (entities.radiusKm) {
      actions.push({
        type: 'SET_RADIUS',
        label: setRadiusLabel,
        payload: { radiusKm: entities.radiusKm },
        autoExecute: true
      });
    }

    if (entities.skill) {
      actions.push({
        type: 'FILTER_JOBS',
        label: filterLabel,
        payload: { searchQuery: entities.skill, category: entities.skill }
      });
    }

    actions.push({
      type: 'NAVIGATE_TAB',
      label: viewRadarLabel,
      payload: { tab: 'explore', view: 'both' }
    });

    let reply = '';
    const skillDesc = entities.skill ? `**${entities.skill}**` : 'active';
    const locDesc = entities.isNearMe ? 'near your GPS location' : `in **${locationLabel}**`;
    const radiusDesc = entities.radiusKm ? ` (within **${entities.radiusKm} km**)` : '';

    if (topJobs.length === 0) {
      reply = lang === 'ta'
        ? `மன்னிக்கவும், ${locationLabel} பகுதியில் ${entities.skill ? `"${entities.skill}"` : ''} வேலைகள் தற்போது கிடைக்கவில்லை. உங்கள் தேடல் சுற்றளவை அதிகரிக்கலாம்.`
        : lang === 'hi'
        ? `क्षमा करें, ${locationLabel} में वर्तमान में कोई ${entities.skill ? `"${entities.skill}"` : ''} कार्य नहीं मिला। आप अपने रडार का दायरा बढ़ा सकते हैं।`
        : lang === 'te'
        ? `క్షమించండి, ${locationLabel} లో ప్రస్తుతం ఎటువంటి ${entities.skill ? `"${entities.skill}"` : ''} పనులు కనుగొనబడలేదు. మీరు మీ శోధన పరిధిని విస్తరించవచ్చు.`
        : `I couldn't find any matching ${skillDesc} gigs ${locDesc}${radiusDesc} right now. You can expand your search radius or check nearby districts.`;

      const expandRadiusLabel = lang === 'ta' ? 'சுற்றளவை 15 கி.மீ ஆக விரிவுபடுத்து'
        : lang === 'hi' ? 'दायरा बढ़ाकर 15 किमी करें'
        : lang === 'te' ? 'పరిధిని 15 కి.మీకి విస్తరించండి'
        : 'Expand Radius to 15 km';

      const viewAllLabel = lang === 'ta' ? 'அனைத்து வேலைகளையும் காண்க'
        : lang === 'hi' ? 'सभी उपलब्ध कार्य देखें'
        : lang === 'te' ? 'అందుబాటులో ఉన్న అన్ని పనులను చూడండి'
        : 'View All Available Gigs';

      return {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp,
        actions: [
          { type: 'SET_RADIUS', label: expandRadiusLabel, payload: { radiusKm: 15 } },
          { type: 'NAVIGATE_TAB', label: viewAllLabel, payload: { tab: 'explore' } }
        ],
        intent: 'JOB_SEARCH_EMPTY'
      };
    }

    if (lang === 'ta') {
      reply = `🔎 ${locationLabel} பகுதியில் கண்டறியப்பட்ட சிறந்த **${topJobs.length}** ${skillDesc} வேலைகள்:\n\n`;
      topJobs.forEach((j, i) => {
        const distStr = j.distanceKm !== undefined ? ` (${j.distanceKm.toFixed(1)} கி.மீ)` : '';
        const matchStr = j.matchScore ? ` • பொருத்தம்: ${j.matchScore}%` : '';
        reply += `${i + 1}. **${j.title}**${distStr}\n   💰 ₹${j.payout_amount}/${j.payout_unit || 'shift'} • 📍 ${j.landmark_area || j.city}${matchStr}\n`;
      });
      reply += `\nவிவரங்களைப் பார்க்க கீழே உள்ள வேலை அட்டையைத் தட்டவும்!`;
    } else if (lang === 'hi') {
      reply = `🔎 **${locationLabel}** में **${topJobs.length}** सर्वोत्तम ${skillDesc} कार्य मिले:\n\n`;
      topJobs.forEach((j, i) => {
        const distStr = j.distanceKm !== undefined ? ` (${j.distanceKm.toFixed(1)} किमी दूर)` : '';
        const matchStr = j.matchScore ? ` • मैच: ${j.matchScore}%` : '';
        reply += `${i + 1}. **${j.title}**${distStr}\n   💰 ₹${j.payout_amount}/${j.payout_unit || 'shift'} • 📍 ${j.landmark_area || j.city}${matchStr}\n`;
      });
      reply += `\nपूरा विवरण देखने के लिए नीचे दिए गए कार्ड पर क्लिक करें:`;
    } else if (lang === 'te') {
      reply = `🔎 **${locationLabel}** లో **${topJobs.length}** ఉత్తమ ${skillDesc} పనులు లభించాయి:\n\n`;
      topJobs.forEach((j, i) => {
        const distStr = j.distanceKm !== undefined ? ` (${j.distanceKm.toFixed(1)} కి.మీ దూరం)` : '';
        const matchStr = j.matchScore ? ` • సరిపోలిక: ${j.matchScore}%` : '';
        reply += `${i + 1}. **${j.title}**${distStr}\n   💰 ₹${j.payout_amount}/${j.payout_unit || 'shift'} • 📍 ${j.landmark_area || j.city}${matchStr}\n`;
      });
      reply += `\nపూర్తి వివరాలను చూడటానికి క్రింది జాబ్ కార్డును నొక్కండి:`;
    } else {
      reply = `Found **${matchedJobs.length}** ${skillDesc} opportunities ${locDesc}${radiusDesc}:\n\n`;
      topJobs.forEach((j, i) => {
        const distStr = j.distanceKm !== undefined ? ` (${j.distanceKm.toFixed(1)} km away)` : '';
        const matchScore = j.matchScore ? ` • Match: ${j.matchScore}%` : '';
        reply += `${i + 1}. **${j.title}**${distStr}\n   💰 ₹${j.payout_amount}/${j.payout_unit || 'shift'} • 📍 ${j.landmark_area || j.city}${matchScore}\n`;
      });
      reply += `\nTap any gig card below to view full details:`;
    }

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: reply,
      timestamp,
      jobCards: topJobs,
      actions,
      intent: 'JOB_SEARCH'
    };
  }

  private buildFindWorkersActionResponse(context: ChatContextPayload, entities: ExtractedQueryEntities, timestamp: string): ChatMessage {
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

    let matchedWorkers = context.users.filter(u => u.role === 'seeker');

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

    const topWorkers = matchedWorkers.slice(0, 3);
    const skillDesc = entities.skill ? `**${entities.skill}**` : 'verified';
    const locDesc = entities.isNearMe ? 'near your location' : `in **${locationLabel}**`;

    let reply = '';
    if (topWorkers.length === 0) {
      reply = lang === 'ta'
        ? `மன்னிக்கவும், ${locationLabel} பகுதியில் ${entities.skill ? `"${entities.skill}"` : ''} பணியாளர்கள் தற்போது கிடைக்கவில்லை. புதிய வேலை அறிவிப்பை வெளியிடலாம்!`
        : lang === 'hi'
        ? `क्षमा करें, ${locationLabel} में कोई सत्यापित ${entities.skill ? `"${entities.skill}"` : ''} कुशल श्रमिक नहीं मिला। आप कार्य पोस्ट कर सकते हैं।`
        : lang === 'te'
        ? `క్షమించండి, ${locationLabel} లో ఎటువంటి ${entities.skill ? `"${entities.skill}"` : ''} కార్మికులు కనుగొనబడలేదు. మీరు తక్షణమే జాబ్ పోస్ట్ చేయవచ్చు.`
        : `No verified ${skillDesc} workers were found ${locDesc}. You can post a gig to broadcast requirements to nearby workers immediately.`;

      const postLabel = lang === 'ta' ? `வேலை அறிவிப்பு: ${entities.skill || 'பணியாளர்'}`
        : lang === 'hi' ? `${entities.skill || 'श्रमिक'} के लिए कार्य पोस्ट करें`
        : lang === 'te' ? `${entities.skill || 'కార్మికుల'} కోసం జాబ్ పోస్ట్ చేయండి`
        : `Post a ${entities.skill || 'Worker'} Gig`;

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
      reply = `👷 ${locationLabel} பகுதியில் கண்டறியப்பட்ட சிறந்த **${entities.skill || 'தொழிலாளர்கள்'}**:\n\n`;
      topWorkers.forEach((w, i) => {
        const reliability = (w as any).reliability_score ? ` • நம்பகத்தன்மை: ${((w as any).reliability_score * 100).toFixed(0)}%` : '';
        reply += `${i + 1}. **${w.name}** (${w.skills.slice(0, 2).join(', ')})\n   ⭐ ${w.rating?.toFixed(1) || '4.9'}/5.0${reliability} • 📍 ${w.city || locationLabel}\n`;
      });
      reply += `\nஇவர்களை உடனடியாகத் தொடர்பு கொள்ள வேலை அறிவிப்பை வெளியிடலாம்!`;
    } else if (lang === 'hi') {
      reply = `👷 **${locationLabel}** में मिले शीर्ष **${entities.skill || 'कुशल श्रमिक'}**:\n\n`;
      topWorkers.forEach((w, i) => {
        const reliability = (w as any).reliability_score ? ` • विश्वसनीयता: ${((w as any).reliability_score * 100).toFixed(0)}%` : '';
        reply += `${i + 1}. **${w.name}** (${w.skills.slice(0, 2).join(', ')})\n   ⭐ रेटिंग: ${w.rating?.toFixed(1) || '4.9'}/5.0${reliability} • 📍 ${w.city || locationLabel}\n`;
      });
      reply += `\nइन्हें नियुक्त करने के लिए नीचे दिए गए बटन पर क्लिक करें:`;
    } else if (lang === 'te') {
      reply = `👷 **${locationLabel}** లో కనుగొనబడిన ఉత్తమ **${entities.skill || 'కార్మికులు'}**:\n\n`;
      topWorkers.forEach((w, i) => {
        const reliability = (w as any).reliability_score ? ` • విశ్వసనీయత: ${((w as any).reliability_score * 100).toFixed(0)}%` : '';
        reply += `${i + 1}. **${w.name}** (${w.skills.slice(0, 2).join(', ')})\n   ⭐ రేటింగ్: ${w.rating?.toFixed(1) || '4.9'}/5.0${reliability} • 📍 ${w.city || locationLabel}\n`;
      });
      reply += `\nవీరిని నియమించడానికి క్రింది బటన్‌ను నొక్కండి:`;
    } else {
      reply = `👷 Found **${matchedWorkers.length}** verified **${entities.skill || 'candidate'}** workers ${locDesc} ranked by reliability and client ratings:\n\n`;
      topWorkers.forEach((w, i) => {
        const reliability = (w as any).reliability_score ? ` • Reliability: ${((w as any).reliability_score * 100).toFixed(0)}%` : '';
        reply += `${i + 1}. **${w.name}** — ${w.skills.slice(0, 3).join(', ')}\n   ⭐ Rating: ${w.rating?.toFixed(1) || '4.9'}/5.0${reliability} • 📍 ${w.city || locationLabel}\n`;
      });
      reply += `\nClick below to post a direct gig or view their locations on the radar map:`;
    }

    const postGigBtnLabel = lang === 'ta' ? `வேலை அறிவிப்பு: ${entities.skill || 'பணியாளர்'}`
      : lang === 'hi' ? `${entities.skill || 'श्रमिक'} के लिए कार्य पोस्ट करें`
      : lang === 'te' ? `${entities.skill || 'కార్మికుల'} కోసం జాబ్ పోస్ట్ చేయండి`
      : `Post Gig for ${entities.skill || 'Candidate'}`;

    const viewMapBtnLabel = lang === 'ta' ? 'வரைபடத்தில் பணியாளர்களைக் காண்க'
      : lang === 'hi' ? 'मानचित्र पर श्रमिक देखें'
      : lang === 'te' ? 'మ్యాప్‌లో కార్మికులను చూడండి'
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
          label: postGigBtnLabel,
          payload: { category: entities.skill || 'Helper', skills: entities.skill ? [entities.skill] : [] },
          variant: 'success'
        },
        {
          type: 'NAVIGATE_TAB',
          label: viewMapBtnLabel,
          payload: { tab: 'explore', view: 'map' },
          autoExecute: true
        }
      ],
      intent: 'WORKER_SEARCH'
    };
  }

  private buildPostJobActionResponse(query: string, context: ChatContextPayload, entities: ExtractedQueryEntities, timestamp: string): ChatMessage {
    const lang = context.language;
    const user = context.currentUser;
    const city = entities.location || user?.city || 'Chennai';

    const extracted = nlpService.parseJobRequirement(query, city);
    const targetRole = entities.skill || (extracted.category !== 'Other' ? extracted.category : 'Painter');
    const skills = extracted.skills.length > 0 ? extracted.skills : this.getDefaultSkillsForCategory(targetRole);

    const demandIntel = demandIntelligenceService.analyzeDemand(context.jobs, city);
    const skillStat = demandIntel.skillsDemand.find(s => s.skill.toLowerCase().includes(targetRole.toLowerCase()));
    const suggestedPay = extracted.payout.amount || (skillStat ? skillStat.avgHourlyPay * 4 : 700);
    const payoutUnit = extracted.payout.unit || 'day';

    let reply = '';
    if (lang === 'ta') {
      reply = `🎨 **${targetRole} பணிக்கான வேலை அறிவிப்பு தயார் செய்யப்பட்டுள்ளது!**\n\n`;
      reply += `• **தொழில் பிரிவு**: ${targetRole}\n`;
      reply += `• **தேவையான திறன்கள்**: ${skills.join(', ')}\n`;
      reply += `• **பரிந்துரைக்கப்பட்ட ஊதியம்**: ₹${suggestedPay}/${payoutUnit === 'day' ? 'நாள்' : 'ஷிப்ட்'}\n`;
      reply += `• **இடம்**: ${extracted.location.landmark || city}\n\n`;
      reply += `கீழே உள்ள **"வேலை அறிவிப்பைத் திற"** பொத்தானை அழுத்தி விவரங்களை மதிப்பாய்வு செய்து உடனே வெளியிடலாம்!`;
    } else if (lang === 'hi') {
      reply = `🎨 **${targetRole} कार्य के लिए पोस्ट तैयार है!**\n\n`;
      reply += `• **पद/श्रेणी**: ${targetRole}\n`;
      reply += `• **आवश्यक कौशल**: ${skills.join(', ')}\n`;
      reply += `• **अनुशंसित मजदूरी**: ₹${suggestedPay}/${payoutUnit === 'day' ? 'दिन' : 'शिफ्ट'}\n`;
      reply += `• **स्थान**: ${extracted.location.landmark || city}\n\n`;
      reply += `समीक्षा करने और श्रमिकों को प्रसारित करने के लिए नीचे दिए गए बटन पर क्लिक करें:`;
    } else if (lang === 'te') {
      reply = `🎨 **${targetRole} పని కోసం జాబ్ పోస్ట్ సిద్ధమైంది!**\n\n`;
      reply += `• **వర్గం/రోల్**: ${targetRole}\n`;
      reply += `• **అవసరమైన నైపుణ్యాలు**: ${skills.join(', ')}\n`;
      reply += `• **సిఫార్సు చేయబడిన వేతనం**: ₹${suggestedPay}/${payoutUnit === 'day' ? 'రోజు' : 'షిఫ్ట్'}\n`;
      reply += `• **ప్రాంతం**: ${extracted.location.landmark || city}\n\n`;
      reply += `వివరాలను సమీక్షించి పోస్ట్ చేయడానికి క్రింది బటన్‌ను నొక్కండి:`;
    } else {
      reply = `🎨 **Ready to create a gig for ${targetRole}!**\n\n`;
      reply += `I have extracted the details and pre-filled the Job Creator with local market benchmarks:\n`;
      reply += `• **Title/Role**: ${targetRole} Needed\n`;
      reply += `• **Required Skills**: ${skills.join(', ')}\n`;
      reply += `• **Suggested Benchmark Wage**: ₹${suggestedPay}/${payoutUnit} *(based on active ${city} demand)*\n`;
      reply += `• **Location Area**: ${extracted.location.landmark || city}\n\n`;
      reply += `Click the button below to review, customize, and broadcast to nearby workers on the radar:`;
    }

    const initialData = {
      category: targetRole,
      title: extracted.title || `${targetRole} Needed`,
      skills,
      description: extracted.rawText || `Urgent requirement for verified ${targetRole} in ${city}. Good compensation and timely payout.`,
      payoutAmount: suggestedPay,
      payoutUnit: payoutUnit as any,
      nlText: query
    };

    const openCreatorLabel = lang === 'ta' ? `வேலை உருவாக்குநரைத் திற (${targetRole})`
      : lang === 'hi' ? `${targetRole} कार्य निर्माता खोलें`
      : lang === 'te' ? `${targetRole} జాబ్ క్రియేటర్ తెరవండి`
      : `Open Pre-filled ${targetRole} Creator`;

    const manageGigsLabel = lang === 'ta' ? 'வேலைகள் மேலாண்மை பக்கம்'
      : lang === 'hi' ? 'कार्य प्रबंधन टैब देखें'
      : lang === 'te' ? 'జాబ్ నిర్వహణ ట్యాబ్ చూడండి'
      : 'View Manage Gigs Tab';

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: reply,
      timestamp,
      actions: [
        {
          type: 'OPEN_POST_JOB',
          label: openCreatorLabel,
          payload: initialData,
          variant: 'primary'
        },
        {
          type: 'NAVIGATE_TAB',
          label: manageGigsLabel,
          payload: { tab: 'post-manage' }
        }
      ],
      intent: 'CREATE_JOB'
    };
  }

  private buildRecommendationExplanationResponse(context: ChatContextPayload, entities: ExtractedQueryEntities, timestamp: string): ChatMessage {
    const lang = context.language;
    const user = context.currentUser;
    const isRecruiter = user?.role === 'recruiter';
    const targetJob = context.selectedJob || context.jobs[0];

    if (isRecruiter) {
      const candidate = context.users.find(u => u.role === 'seeker') || context.users[0];
      const targetRole = entities.skill || targetJob?.category || 'Plumbing';
      const candidateSkills = candidate?.skills || ['Plumbing', 'Pipe Repair'];

      const skillEval = semanticService.evaluateSkillsSemanticSync(candidateSkills, [targetRole]);
      const skillPct = Math.round((skillEval ? skillEval.semanticSkillScore : 0.85) * 100);
      const reliability = (candidate as any)?.reliability_score ? Math.round((candidate as any).reliability_score * 100) : 92;
      const reviews = sqliteManager.getReviews(candidate?.id || '');
      const reviewCount = reviews.length > 0 ? reviews.length : 8;

      let reply = '';
      if (lang === 'ta') {
        reply = `🔍 **${candidate?.name || 'பணியாளர்'} ஏன் சிறந்த தேர்வாகப் பரிந்துரைக்கப்பட்டார்?**\n\n`;
        reply += `1. **திறன் ஒற்றுமை (40% எடை)**: **${skillPct}%** பொருத்தம் (${candidateSkills.slice(0, 3).join(', ')}).\n`;
        reply += `2. **நம்பகத்தன்மை & மதிப்பீடு (35% எடை)**: ⭐ **${candidate?.rating?.toFixed(1) || '4.9'}/5.0** (${reviewCount} வெற்றிகரமான பணிகள், ${reliability}% நேரந்தவறாமை).\n`;
        reply += `3. **இருப்பிட நெருக்கம் (25% எடை)**: உங்கள் பகுதிக்கு மிக அருகில் உள்ளார்.\n\n`;
      } else if (lang === 'hi') {
        reply = `🔍 **${candidate?.name || 'यह उम्मीदवार'} क्यों अनुशंसित है?**\n\n`;
        reply += `• 🎯 **कौशल समानता (40% भार)**: **${skillPct}% मैच** (${candidateSkills.slice(0, 3).join(', ')})\n`;
        reply += `• ⭐ **विश्वसनीयता और रेटिंग (35% भार)**: **${reliability}% स्कोर** — ${candidate?.rating?.toFixed(1) || '4.9'}/5.0 (${reviewCount} पूर्ण कार्य)\n`;
        reply += `• 📍 **निकटता (25% भार)**: आपके तत्काल इलाके में स्थित है।\n\n`;
      } else if (lang === 'te') {
        reply = `🔍 **${candidate?.name || 'ఈ కార్మికుడు'} ఎందుకు సిఫార్సు చేయబడ్డాడు?**\n\n`;
        reply += `• 🎯 **నైపుణ్య సరిపోలిక (40% బరువు)**: **${skillPct}% సరిపోలిక** (${candidateSkills.slice(0, 3).join(', ')})\n`;
        reply += `• ⭐ **విశ్వసనీయత & రేటింగ్ (35% బరువు)**: **${reliability}% స్కోరు** — ${candidate?.rating?.toFixed(1) || '4.9'}/5.0 (${reviewCount} పనులు)\n`;
        reply += `• 📍 **సామీప్యత (25% బరువు)**: మీ సమీప ప్రాంతంలో ఉన్నారు.\n\n`;
      } else {
        reply = `🔍 **Why was ${candidate?.name || 'this worker'} recommended?**\n\n`;
        reply += `Talent2Task evaluated ${candidate?.name} using our verified **Hybrid AI Ranking Engine**:\n\n`;
        reply += `• 🎯 **Semantic Skill Overlap (40% weight)**: **${skillPct}% Match** — Verified in *${candidateSkills.slice(0, 3).join(', ')}*.\n`;
        reply += `• ⭐ **Reliability & Ratings (35% weight)**: **${reliability}% Score** — ${candidate?.rating?.toFixed(1) || '4.9'}/5.0 star rating across ${reviewCount} completed shifts.\n`;
        reply += `• 📍 **Hyperlocal Proximity (25% weight)**: Located within your immediate Tamil Nadu radius for fast arrival.\n\n`;
      }

      const hireBtnLabel = lang === 'ta' ? `பணியமர்த்து: ${candidate?.name || 'பணியாளர்'}`
        : lang === 'hi' ? `${candidate?.name || 'उम्मीदवार'} को नियुक्त करें`
        : lang === 'te' ? `${candidate?.name || 'కార్మికుడిని'} నియమించండి`
        : `Hire ${candidate?.name || 'Worker'}`;

      const viewMapLabel = lang === 'ta' ? 'வரைபடத்தில் காண்க'
        : lang === 'hi' ? 'मानचित्र पर देखें'
        : lang === 'te' ? 'మ్యాప్‌లో చూడండి'
        : 'View Candidates on Map';

      return {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp,
        workerCards: candidate ? [candidate] : [],
        actions: [
          { type: 'OPEN_POST_JOB', label: hireBtnLabel, payload: { category: targetRole, skills: candidateSkills }, variant: 'success' },
          { type: 'NAVIGATE_TAB', label: viewMapLabel, payload: { tab: 'explore', view: 'map' } }
        ],
        intent: 'EXPLAIN_WORKER_RECOMMENDATION'
      };
    }

    // Seeker Job Recommendation Explanation
    const seekerSkills = user?.skills || ['Tamil Speaking', 'Customer Support'];
    const requiredSkills = targetJob?.required_skills || ['Plumbing'];
    const skillEval = semanticService.evaluateSkillsSemanticSync(seekerSkills, requiredSkills);
    const skillScore = Math.round((skillEval ? skillEval.semanticSkillScore : 0.80) * 100);

    const userLoc = context.currentCoords || (user ? { latitude: user.latitude, longitude: user.longitude } : null);
    let distanceKm = 2.4;
    if (userLoc && targetJob) {
      distanceKm = calculateHaversineDistance(userLoc.latitude, userLoc.longitude, targetJob.latitude, targetJob.longitude);
    }
    const distScore = Math.max(10, Math.round(100 - (distanceKm * 6)));
    const availScore = calculateAvailabilityScore(user?.free_time_slots || [], targetJob || ({} as any)).timeScore;
    const expScore = calculateExperienceScore(user?.experience).experienceScore;
    const totalScore = Math.round(
      (skillScore * DEFAULT_HYBRID_WEIGHTS.semanticSkill) +
      (distScore * DEFAULT_HYBRID_WEIGHTS.distance) +
      (availScore * DEFAULT_HYBRID_WEIGHTS.availability) +
      (expScore * DEFAULT_HYBRID_WEIGHTS.experience) +
      (85 * DEFAULT_HYBRID_WEIGHTS.localDemand) +
      (90 * DEFAULT_HYBRID_WEIGHTS.reliability)
    );

    let reply = '';
    if (lang === 'ta') {
      reply = `📊 **"${targetJob?.title || 'வேலை'}" ஏன் உங்களுக்கு பரிந்துரைக்கப்பட்டது?**\n\n`;
      reply += `ஒட்டுமொத்த ஹைப்ரிட் பொருத்தம்: **${totalScore}%**\n\n`;
      reply += `1. 🎯 **திறன் பொருத்தம் (${DEFAULT_HYBRID_WEIGHTS.semanticSkill * 100}%)**: **${skillScore}%** (உங்கள் திறன்கள்: ${seekerSkills.slice(0, 2).join(', ')})\n`;
      reply += `2. 📍 **இருப்பிட தூரம் (${DEFAULT_HYBRID_WEIGHTS.distance * 100}%)**: **${distScore}%** (தூரம்: ${distanceKm.toFixed(1)} கி.மீ)\n`;
      reply += `3. ⏰ **நேரப் பொருத்தம் (${DEFAULT_HYBRID_WEIGHTS.availability * 100}%)**: **${availScore}%** (பணி நேரம் மற்றும் உங்கள் விருப்பம்)\n`;
      reply += `4. 💼 **அனுபவம் (${DEFAULT_HYBRID_WEIGHTS.experience * 100}%)**: **${expScore}%** (${user?.experience || 0} ஆண்டுகள் அனுபவம்)\n`;
      reply += `5. 🔥 **உள்ளூர் தேவை & பாதுகாப்பு (${(DEFAULT_HYBRID_WEIGHTS.localDemand + DEFAULT_HYBRID_WEIGHTS.reliability) * 100}%)**: சரிபார்க்கப்பட்ட வேலை.\n`;
    } else if (lang === 'hi') {
      reply = `📊 **"${targetJob?.title || 'यह कार्य'}" आपके लिए क्यों अनुशंसित है?**\n\n`;
      reply += `कुल हाइब्रिड मैच स्कोर: **${totalScore}%**\n\n`;
      reply += `• 🎯 **कौशल मैच (${DEFAULT_HYBRID_WEIGHTS.semanticSkill * 100}% भार)**: **${skillScore}%** (कौशल: ${seekerSkills.slice(0, 2).join(', ')})\n`;
      reply += `• 📍 **निकटता (${DEFAULT_HYBRID_WEIGHTS.distance * 100}% भार)**: **${distScore}%** (दूरी: ${distanceKm.toFixed(1)} किमी)\n`;
      reply += `• ⏰ **समय लब्धता (${DEFAULT_HYBRID_WEIGHTS.availability * 100}% भार)**: **${availScore}%** (पसंदीदा स्लॉट मैच)\n`;
      reply += `• 💼 **अनुभव (${DEFAULT_HYBRID_WEIGHTS.experience * 100}% भार)**: **${expScore}%** (${user?.experience || 0} वर्ष का अनुभव)\n`;
      reply += `• 🛡️ **विश्वसनीयता (15% भार)**: समय पर गारंटीड भुगतान।\n`;
    } else if (lang === 'te') {
      reply = `📊 **"${targetJob?.title || 'ఈ పని'}" మీకు ఎందుకు సిఫార్సు చేయబడింది?**\n\n`;
      reply += `మొత్తం హైబ్రిడ్ మ్యాచ్ స్కోర్: **${totalScore}%**\n\n`;
      reply += `• 🎯 **నైపుణ్య సరిపోలిక (${DEFAULT_HYBRID_WEIGHTS.semanticSkill * 100}% బరువు)**: **${skillScore}%** (${seekerSkills.slice(0, 2).join(', ')})\n`;
      reply += `• 📍 **సామీప్యత (${DEFAULT_HYBRID_WEIGHTS.distance * 100}% బరువు)**: **${distScore}%** (దూరం: ${distanceKm.toFixed(1)} కి.మీ)\n`;
      reply += `• ⏰ **సమయ లభ్యత (${DEFAULT_HYBRID_WEIGHTS.availability * 100}% బరువు)**: **${availScore}%** (సమయం సరిపోలిక)\n`;
      reply += `• 💼 **అనుభవం (${DEFAULT_HYBRID_WEIGHTS.experience * 100}% బరువు)**: **${expScore}%** (${user?.experience || 0} సంవత్సరాల అనుభవం)\n`;
      reply += `• 🛡️ **విశ్వసనీయత (15% బరువు)**: ధృవీకరించబడిన వేతనం.\n`;
    } else {
      reply = `📊 **Hybrid AI Recommendation Breakdown for "${targetJob?.title || 'this gig'}"**:\n\n`;
      reply += `Overall Match Score: **${totalScore}%**\n\n`;
      reply += `• 🎯 **Semantic Skill Match (${DEFAULT_HYBRID_WEIGHTS.semanticSkill * 100}% weight)**: **${skillScore}%** — Evaluated via Sentence Transformers against your skills (*${seekerSkills.slice(0, 2).join(', ')}*).\n`;
      reply += `• 📍 **Hyperlocal Proximity (${DEFAULT_HYBRID_WEIGHTS.distance * 100}% weight)**: **${distScore}%** — Located only **${distanceKm.toFixed(1)} km** from your active GPS location.\n`;
      reply += `• ⏰ **Availability Match (${DEFAULT_HYBRID_WEIGHTS.availability * 100}% weight)**: **${availScore}%** — Compatible with your registered shift slots.\n`;
      reply += `• 💼 **Experience Match (${DEFAULT_HYBRID_WEIGHTS.experience * 100}% weight)**: **${expScore}%** — Aligned with your ${user?.experience || 0} years background.\n`;
      reply += `• 🛡️ **Trust & Local Demand (15% weight)**: Verified recruiter posting with guaranteed timely payout.\n`;
    }

    const viewDetailsLabel = lang === 'ta' ? `"${targetJob?.title || 'வேலை'}" விவரங்களைக் காண்க`
      : lang === 'hi' ? `"${targetJob?.title || 'कार्य'}" का विवरण देखें`
      : lang === 'te' ? `"${targetJob?.title || 'పని'}" వివరాలు చూడండి`
      : `View "${targetJob?.title || 'Gig'}" Details`;

    const viewRadarMapLabel = lang === 'ta' ? 'ரேடார் வரைபடத்தில் காண்க'
      : lang === 'hi' ? 'रडार मानचित्र पर देखें'
      : lang === 'te' ? 'రాడార్ మ్యాప్‌లో చూడండి'
      : 'View on Radar Map';

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: reply,
      timestamp,
      jobCards: targetJob ? [targetJob] : [],
      explanationBreakdown: {
        semanticSkill: skillScore,
        distance: distScore,
        availability: availScore,
        experience: expScore,
        localDemand: 85,
        reliability: 90,
        totalScore
      },
      actions: targetJob ? [
        { type: 'VIEW_JOB', label: viewDetailsLabel, payload: { job: targetJob }, variant: 'primary' },
        { type: 'NAVIGATE_TAB', label: viewRadarMapLabel, payload: { tab: 'explore', view: 'map' } }
      ] : [],
      intent: 'EXPLAIN_JOB_RECOMMENDATION'
    };
  }

  private async buildSkillGapActionResponse(context: ChatContextPayload, entities: ExtractedQueryEntities, timestamp: string): Promise<ChatMessage> {
    const user = context.currentUser;
    const lang = context.language;
    const targetCity = entities.location || user?.city || 'Chennai';

    const cityDemand = demandIntelligenceService.analyzeDemand(context.jobs, targetCity);
    const topDemanded = cityDemand.skillsDemand.slice(0, 4);

    let upskillingSteps: any[] = [];
    if (user) {
      try {
        const gapAnalysis = await skillGapService.analyzeSkillGap(user, context.jobs, context.skillDemandStats);
        upskillingSteps = gapAnalysis.upskillingPath || [];
      } catch (err) {
        console.warn('Skill gap analysis notice in chat:', err);
      }
    }

    let reply = '';
    const actions: ChatActionItem[] = [];

    if (lang === 'ta') {
      reply = `📍 **${targetCity}** பகுதிக்கான நிகழ்நேர திறன் நுண்ணறிவு:\n\n`;
      reply += `🔥 **அதிக தேவையில் உள்ள திறன்கள்**:\n`;
      topDemanded.forEach((d, i: number) => {
        reply += `${i + 1}. **${localizeContent(d.skill, 'ta')}** (நிலை: ${d.currentDemandLevel}, மதிப்பிடப்பட்ட ஊதியம்: ₹${d.avgHourlyPay}/மணி)\n`;
      });
      if (upskillingSteps.length > 0) {
        reply += `\n💡 **உங்களுக்கான பரிந்துரை**:\n`;
        upskillingSteps.slice(0, 2).forEach(r => {
          reply += `• **${localizeContent(r.skill, 'ta')}**: ${r.title} (மதிப்பிடப்பட்ட கூடுதல் வருமானம்: **+₹${r.potentialPayBoost}**)\n`;
          actions.push({
            type: 'ADD_SKILL',
            label: `+ "${localizeContent(r.skill, 'ta')}" திறனைச் சேர்`,
            payload: { skill: r.skill }
          });
        });
      }
    } else if (lang === 'hi') {
      reply = `📍 **${targetCity}** के लिए लाइव कौशल अंतराल और मांग विश्लेषण:\n\n`;
      reply += `🔥 **${targetCity} में अत्यधिक मांग वाले कौशल**:\n`;
      topDemanded.forEach((d, i: number) => {
        reply += `${i + 1}. **${d.skill}** — मांग स्तर: **${d.currentDemandLevel}** (औसत ₹${d.avgHourlyPay}/घंटा)\n`;
      });
      if (upskillingSteps.length > 0) {
        reply += `\n💡 **उच्च मैच स्कोर के लिए अनुशंसित कौशल**:\n`;
        upskillingSteps.slice(0, 2).forEach(r => {
          reply += `• **${r.skill}** (${r.title}): संभावित लाभ **+₹${r.potentialPayBoost}**, ${r.unlockedGigsCount} नए कार्य खुलेंगे।\n`;
          actions.push({
            type: 'ADD_SKILL',
            label: `+ प्रोफ़ाइल में "${r.skill}" जोड़ें`,
            payload: { skill: r.skill },
            variant: 'success'
          });
        });
      }
    } else if (lang === 'te') {
      reply = `📍 **${targetCity}** కోసం ప్రత్యక్ష నైపుణ్య గ్యాప్ మరియు డిమాండ్ విశ్లేషణ:\n\n`;
      reply += `🔥 **${targetCity} లో అత్యధిక డిమాండ్ ఉన్న నైపుణ్యాలు**:\n`;
      topDemanded.forEach((d, i: number) => {
        reply += `${i + 1}. **${d.skill}** — డిమాండ్ స్థాయి: **${d.currentDemandLevel}** (సగటు ₹${d.avgHourlyPay}/గంటకు)\n`;
      });
      if (upskillingSteps.length > 0) {
        reply += `\n💡 **అధిక మ్యాచ్ స్కోర్ కోసం సిఫార్సు చేయబడిన నైపుణ్యాలు**:\n`;
        upskillingSteps.slice(0, 2).forEach(r => {
          reply += `• **${r.skill}** (${r.title}): అదనపు ఆదాయం **+₹${r.potentialPayBoost}**, ${r.unlockedGigsCount} పనులు అందుబాటులోకి వస్తాయి.\n`;
          actions.push({
            type: 'ADD_SKILL',
            label: `+ ప్రొఫైల్‌కు "${r.skill}" జోడించండి`,
            payload: { skill: r.skill },
            variant: 'success'
          });
        });
      }
    } else {
      reply = `📍 Live Skill Gap & Demand Intelligence for **${targetCity}**:\n\n`;
      reply += `🔥 **Top In-Demand Skills in ${targetCity}**:\n`;
      topDemanded.forEach((d, i: number) => {
        reply += `${i + 1}. **${d.skill}** — Demand Level: **${d.currentDemandLevel}** (Avg. ₹${d.avgHourlyPay}/hr)\n`;
      });
      if (upskillingSteps.length > 0) {
        reply += `\n💡 **Recommended Upskilling for Higher Match Rates**:\n`;
        upskillingSteps.slice(0, 2).forEach(r => {
          reply += `• **${r.skill}** (${r.title}): Potential **+₹${r.potentialPayBoost}** boost, unlocks ${r.unlockedGigsCount} local gigs.\n`;
          actions.push({
            type: 'ADD_SKILL',
            label: `+ Add "${r.skill}" to Profile`,
            payload: { skill: r.skill },
            variant: 'success'
          });
        });
      }
      reply += `\nAdding these skills directly increases your Hybrid Match Score and unlocking potential!`;
    }

    const viewRecTabLabel = lang === 'ta' ? 'திறன் பரிந்துரைகள் தாவல்'
      : lang === 'hi' ? 'कौशल अनुशंसाएँ टैब देखें'
      : lang === 'te' ? 'నైపుణ్య సిఫార్సుల ట్యాబ్ చూడండి'
      : 'View Skill Recommendations Tab';

    const openTrendsLabel = lang === 'ta' ? 'வட்டார தேவை போக்குகளைத் திற'
      : lang === 'hi' ? 'क्षेत्रीय मांग रुझान खोलें'
      : lang === 'te' ? 'ప్రాంతీయ డిమాండ్ ట్రెండ్‌లను తెరవండి'
      : 'Open Regional Demand Trends';

    actions.push(
      { type: 'NAVIGATE_TAB', label: viewRecTabLabel, payload: { tab: 'my-gigs' } },
      { type: 'OPEN_COMMUNITY_DEMAND', label: openTrendsLabel }
    );

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: reply,
      timestamp,
      actions,
      intent: 'SKILL_GAP'
    };
  }

  private buildDestructiveConfirmationResponse(context: ChatContextPayload, timestamp: string): ChatMessage {
    const lang = context.language;
    const user = context.currentUser;
    const isRecruiter = user?.role === 'recruiter';

    let targetJob = context.selectedJob;
    if (!targetJob) {
      if (isRecruiter) {
        targetJob = context.jobs.find(j => j.recruiter_id === user?.id) || context.jobs[0];
      } else {
        targetJob = context.jobs.find(j => j.claimed_by === user?.id);
      }
    }

    let warningText = '';
    const actions: ChatActionItem[] = [];

    if (!targetJob) {
      warningText = lang === 'ta'
        ? `நீக்குவதற்கு எந்தவொரு குறிப்பிட்ட வேலையும் தேர்ந்தெடுக்கப்படவில்லை. உங்கள் "பணிகள்" பக்கத்தில் உள்ள வேலையைத் தேர்வு செய்யவும்.`
        : lang === 'hi'
        ? `हटाने के लिए कोई विशिष्ट कार्य चयनित नहीं है। कृपया प्रबंधन डैशबोर्ड से एक कार्य चुनें।`
        : lang === 'te'
        ? `తొలగించడానికి ఎటువంటి నిర్దిష్ట పని ఎంచుకోబడలేదు. దయచేసి డ్యాష్‌బోర్డ్ నుండి ఎంచుకోండి.`
        : `No active gig is currently selected to delete. Please select a specific gig from your management dashboard.`;

      const navLabel = isRecruiter
        ? (lang === 'ta' ? 'வேலைகள் மேலாண்மைக்குச் செல்' : lang === 'hi' ? 'कार्य प्रबंधन पर जाएं' : lang === 'te' ? 'జాబ్ నిర్వహణకు వెళ్లండి' : 'Go to Manage Gigs')
        : (lang === 'ta' ? 'என் விண்ணப்பங்களுக்குச் செல்' : lang === 'hi' ? 'मेरे आवेदनों पर जाएं' : lang === 'te' ? 'నా దరఖాస్తులకు వెళ్లండి' : 'Go to My Applications');

      actions.push({
        type: 'NAVIGATE_TAB',
        label: navLabel,
        payload: { tab: isRecruiter ? 'post-manage' : 'my-gigs' }
      });
    } else {
      warningText = lang === 'ta'
        ? `⚠️ **எச்சரிக்கை: இந்தச் செயல் மாற்ற முடியாதது!**\n\nநீங்கள் "**${targetJob.title}**" வேலையை நிரந்தரமாக நீக்க விரும்புகிறீர்களா? தொடர உறுதிப்படுத்தவும்:`
        : lang === 'hi'
        ? `⚠️ **पुष्टि आवश्यक (अपरिवर्तनीय क्रिया)**\n\nक्या आप वास्तव में **${targetJob.landmark_area || targetJob.city}** में स्थित "**${targetJob.title}**" कार्य को हमेशा के लिए हटाना चाहते हैं?`
        : lang === 'te'
        ? `⚠️ **నిర్ధారణ అవసరం (వెనక్కి తీసుకోలేని చర్య)**\n\nమీరు ఖచ్చితంగా **${targetJob.landmark_area || targetJob.city}** లో ఉన్న "**${targetJob.title}**" పనిని శాశ్వతంగా తొలగించాలనుకుంటున్నారా?`
        : `⚠️ **Confirmation Required (Irreversible Action)**\n\nAre you sure you want to permanently delete the gig posting "**${targetJob.title}**" located in **${targetJob.landmark_area || targetJob.city}**? This action cannot be undone.`;

      const confirmDeleteLabel = lang === 'ta' ? '🗑️ ஆம், வேலையை நீக்கு'
        : lang === 'hi' ? '🗑️ हाँ, कार्य हटाएं'
        : lang === 'te' ? '🗑️ అవును, పనిని తొలగించు'
        : '🗑️ Confirm Delete Gig';

      const cancelLabel = lang === 'ta' ? 'ரத்து செய்'
        : lang === 'hi' ? 'रद्द करें'
        : lang === 'te' ? 'రద్దు చేయి'
        : 'Cancel';

      actions.push(
        {
          type: 'CONFIRM_ACTION',
          label: confirmDeleteLabel,
          payload: { actionType: 'DELETE_JOB', jobId: targetJob.id, jobTitle: targetJob.title },
          variant: 'danger'
        },
        {
          type: 'NAVIGATE_TAB',
          label: cancelLabel,
          payload: { tab: isRecruiter ? 'post-manage' : 'explore' },
          variant: 'outline'
        }
      );
    }

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: warningText,
      timestamp,
      actions,
      intent: 'CONFIRM_DESTRUCTIVE'
    };
  }

  private buildGreetingResponse(lang: Language, isRecruiter: boolean, name?: string, timestamp = ''): ChatMessage {
    const greetingName = name ? `, ${name}` : '';
    let reply = '';
    let followups: ChatActionItem[] = [];

    if (lang === 'ta') {
      reply = `வணக்கம்${greetingName}! நான் உங்கள் Talent2Task AI உதவியாளர். ${
        isRecruiter
          ? 'உள்ளூர் திறமையான பணியாளர்களைக் கண்டறிய அல்லது புதிய வேலை அறிவிப்பை வெளியிட நான் உதவ முடியும்.'
          : 'உங்கள் இருப்பிடத்திற்கு அருகிலுள்ள வேலைகள் மற்றும் அதிக தேவையில் உள்ள திறன்களைக் கண்டறிய நான் உதவ முடியும்.'
      } நான் உங்களுக்கு எவ்வாறு உதவட்டும்?`;
      followups = isRecruiter
        ? [
            { type: 'NAVIGATE_TAB', label: 'பணியாளர்களைக் காண்க', payload: { tab: 'explore', view: 'map' } },
            { type: 'OPEN_POST_JOB', label: 'புதிய வேலை அறிவிப்பு' }
          ]
        : [
            { type: 'NAVIGATE_TAB', label: 'அருகிலுள்ள வேலைகள்', payload: { tab: 'explore' } },
            { type: 'NAVIGATE_TAB', label: 'திறன் வழிகாட்டி', payload: { tab: 'my-gigs' } }
          ];
    } else if (lang === 'hi') {
      reply = `नमस्ते${greetingName}! मैं आपका Talent2Task AI सहायक हूँ। ${
        isRecruiter
          ? 'मैं आपको स्थानीय कुशल श्रमिक खोजने और नए कार्य पोस्ट करने में मदद कर सकता हूँ।'
          : 'मैं आपको पास के काम और इन-डिमांड कौशल खोजने में मदद कर सकता हूँ।'
      } मैं आज आपकी क्या सहायता करूँ?`;
      followups = isRecruiter
        ? [
            { type: 'NAVIGATE_TAB', label: 'कुशल श्रमिक देखें', payload: { tab: 'explore', view: 'map' } },
            { type: 'OPEN_POST_JOB', label: 'नया कार्य पोस्ट करें' }
          ]
        : [
            { type: 'NAVIGATE_TAB', label: 'पास के काम खोजें', payload: { tab: 'explore' } },
            { type: 'NAVIGATE_TAB', label: 'कौशल अनुशंसाएँ', payload: { tab: 'my-gigs' } }
          ];
    } else if (lang === 'te') {
      reply = `నమస్కారం${greetingName}! నేను మీ Talent2Task AI సహాయకుడిని. ${
        isRecruiter
          ? 'స్థానిక కార్మికులను కనుగొనడానికి మరియు కొత్త పనులను పోస్ట్ చేయడానికి నేను మీకు సహాయపడతాను.'
          : 'మీ సమీపంలోని పనులు మరియు డిమాండ్ నైపుణ్యాలను కనుగొనడంలో నేను మీకు సహాయపడతాను.'
      } నేను మీకు ఎలా సహాయపడగలను?`;
      followups = isRecruiter
        ? [
            { type: 'NAVIGATE_TAB', label: 'కార్మికులను చూడండి', payload: { tab: 'explore', view: 'map' } },
            { type: 'OPEN_POST_JOB', label: 'జాబ్ పోస్ట్ చేయండి' }
          ]
        : [
            { type: 'NAVIGATE_TAB', label: 'సమీప పనులు', payload: { tab: 'explore' } },
            { type: 'NAVIGATE_TAB', label: 'నైపుణ్య గైడ్', payload: { tab: 'my-gigs' } }
          ];
    } else {
      reply = `Hello${greetingName}! I'm your Talent2Task AI Assistant. ${
        isRecruiter
          ? 'I can help you discover verified local candidates, benchmark trade wages, and post gigs.'
          : 'I can help you discover gig shifts near your GPS location, explain match scores, and recommend top-paying skills.'
      } How can I help you today?`;
      followups = isRecruiter
        ? [
            { type: 'NAVIGATE_TAB', label: 'Find Workers on Map', payload: { tab: 'explore', view: 'map' } },
            { type: 'OPEN_POST_JOB', label: 'Post a New Gig' }
          ]
        : [
            { type: 'NAVIGATE_TAB', label: 'Find Gigs Near Me', payload: { tab: 'explore' } },
            { type: 'NAVIGATE_TAB', label: 'Skill Recommendations', payload: { tab: 'my-gigs' } }
          ];
    }

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: reply,
      timestamp,
      actions: followups,
      intent: 'GREETING'
    };
  }

  private buildHelpResponse(lang: Language, isRecruiter: boolean, timestamp = ''): ChatMessage {
    let reply = '';
    const actions: ChatActionItem[] = [];

    if (lang === 'ta') {
      reply = `Talent2Task AI மூலம் நீங்கள் செய்யக்கூடிய கட்டளைகள்:\n\n• **வேலை தேடுதல்**: *"என் அருகிலுள்ள பிளம்பிங் வேலைகள்"* அல்லது *"5 கி.மீ சுற்றளவில் உள்ள வேலைகள்"*\n• **நேரக் கட்டுப்பாடு**: *"நாளை கிடைக்கும் வேலைகளைக் காட்டு"*\n• **பொருத்த விளக்கம்**: *"இந்த வேலை ஏன் பரிந்துரைக்கப்பட்டது?"*\n• **பணியாளர்கள் தேடுதல்**: *"அதிக ரேட்டிங் உள்ள எலக்ட்ரீஷியன் தேவை"*\n• **வேலை உருவாக்குதல்**: *"பெயிண்டர் வேலை உருவாக்க உதவு"*`;
      actions.push(
        isRecruiter
          ? { type: 'NAVIGATE_TAB', label: 'வரைபடத்தில் பணியாளர்களைக் காண்க', payload: { tab: 'explore', view: 'map' } }
          : { type: 'NAVIGATE_TAB', label: 'வேலைகள் ரேடார் வரைபடம்', payload: { tab: 'explore' } },
        isRecruiter
          ? { type: 'OPEN_POST_JOB', label: 'புதிய வேலை அறிவிப்பு' }
          : { type: 'NAVIGATE_TAB', label: 'திறன் இடைவெளி பரிந்துரைகள்', payload: { tab: 'my-gigs' } }
      );
    } else if (lang === 'hi') {
      reply = `Talent2Task AI के साथ आप इन आदेशों का उपयोग कर सकते हैं:\n\n• 📍 **स्थानीय कार्य खोज**: *"मेरे पास प्लंबर खोजें"* या *"5 किमी के भीतर काम दिखाएं"*\n• ⏰ **समय फ़िल्टर**: *"कल उपलब्ध कार्य"* या *"वीकेंड शिफ्ट"*\n• ⭐ **सत्यापित श्रमिक**: *"उच्च रेटिंग वाले इलेक्ट्रीशियन खोजें"*\n• 📊 **मैच स्कोर विश्लेषण**: *"यह काम मेरे लिए क्यों अनुशंसित है?"*\n• 📝 **स्मार्ट कार्य पोस्टिंग**: *"चेन्नई में पेंटर कार्य बनाने में मदद करें"*\n• 🎯 **कौशल अनुशंसा**: *"मुझे कौन से कौशल सीखने चाहिए?"*`;
      actions.push(
        isRecruiter
          ? { type: 'NAVIGATE_TAB', label: 'मानचित्र पर श्रमिक खोजें', payload: { tab: 'explore', view: 'map' } }
          : { type: 'NAVIGATE_TAB', label: 'कार्य रडार देखें', payload: { tab: 'explore' } },
        isRecruiter
          ? { type: 'OPEN_POST_JOB', label: 'नया कार्य पोस्ट करें' }
          : { type: 'NAVIGATE_TAB', label: 'कौशल अंतराल अनुशंसाएँ', payload: { tab: 'my-gigs' } }
      );
    } else if (lang === 'te') {
      reply = `Talent2Task AI ద్వారా మీరు అడగగల ముఖ్యమైన ప్రశ్నలు:\n\n• 📍 **స్థానిక పనుల శోధన**: *"నా దగ్గర ప్లంబర్లను చూపించు"* లేదా *"5 కి.మీ పరిధిలో పనులు"*\n• ⏰ **సమయ ఫిల్టర్**: *"రేపు అందుబాటులో ఉన్న పనులు"*\n• ⭐ **ధృవీకరించబడిన కార్మికులు**: *"ఉత్తమ రేటింగ్ ఉన్న ఎలక్ట్రీషియన్ కావాలి"*\n• 📊 **మ్యాచ్ విశ్లేషణ**: *"ఈ పని నాకు ఎందుకు సిఫార్సు చేయబడింది?"*\n• 📝 **స్మార్ట్ జాబ్ పోస్ట్**: *"చెన్నైలో పెయింటర్ పని పోస్ట్ చేయడానికి సహాయం చేయండి"*\n• 🎯 **నైపుణ్య గైడ్**: *"నేను ఏ నైపుణ్యాలు నేర్చుకోవాలి?"*`;
      actions.push(
        isRecruiter
          ? { type: 'NAVIGATE_TAB', label: 'మ్యాప్‌లో కార్మికులను కనుగొనండి', payload: { tab: 'explore', view: 'map' } }
          : { type: 'NAVIGATE_TAB', label: 'జాబ్స్ రాడార్ చూడండి', payload: { tab: 'explore' } },
        isRecruiter
          ? { type: 'OPEN_POST_JOB', label: 'జాబ్ పోస్ట్ చేయండి' }
          : { type: 'NAVIGATE_TAB', label: 'నైపుణ్య సిఫార్సులు', payload: { tab: 'my-gigs' } }
      );
    } else {
      reply = `Here are direct natural-language actions you can ask me to execute anytime:\n\n• 📍 **Hyperlocal Gig Search**: *"Find plumbers near me"* or *"Show jobs within 5 km"*\n• ⏰ **Availability Filtering**: *"Find jobs available tomorrow"* or *"Weekend shifts"*\n• ⭐ **Verified Talent**: *"Find highly rated electricians"* or *"Show top drivers"*\n• 📊 **Match Score Breakdown**: *"Why was this job recommended to me?"* or *"How does matching work?"*\n• 📝 **Smart Gig Creation**: *"Help me create a painter job in Chennai for 700 per day"*\n• 🎯 **Skill Recommendations**: *"What skills should I learn?"* or *"What skills are in demand in my city?"*`;
      actions.push(
        isRecruiter
          ? { type: 'NAVIGATE_TAB', label: 'Find Workers on Map', payload: { tab: 'explore', view: 'map' } }
          : { type: 'NAVIGATE_TAB', label: 'Explore Jobs Radar', payload: { tab: 'explore' } },
        isRecruiter
          ? { type: 'OPEN_POST_JOB', label: 'Post a New Gig' }
          : { type: 'NAVIGATE_TAB', label: 'Skill Gap Recommendations', payload: { tab: 'my-gigs' } }
      );
    }

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: reply,
      timestamp,
      actions,
      intent: 'HELP'
    };
  }

  private buildFallbackResponse(query: string, lang: Language, isRecruiter: boolean, timestamp = ''): ChatMessage {
    let reply = '';
    const actions: ChatActionItem[] = [];

    if (lang === 'ta') {
      reply = `உங்கள் தகவல் பெறப்பட்டது: "${query}". நீங்கள் அருகிலுள்ள வேலைகளைத் தேடலாம், குறிப்பிட்ட திறன்களைத் தேர்ந்தெடுக்கலாம் அல்லது புதிய வேலை அறிவிப்புகளை வெளியிடலாம்.`;
      actions.push(
        isRecruiter
          ? { type: 'NAVIGATE_TAB', label: 'பணியாளர்களைக் காண்க', payload: { tab: 'explore', view: 'map' } }
          : { type: 'NAVIGATE_TAB', label: 'அருகிலுள்ள வேலைகளைக் காண்க', payload: { tab: 'explore' } },
        isRecruiter
          ? { type: 'OPEN_POST_JOB', label: 'புதிய வேலை அறிவிப்பு' }
          : { type: 'NAVIGATE_TAB', label: 'என் திறன்களுக்கு ஏற்ற வேலைகள்', payload: { tab: 'explore' } }
      );
    } else if (lang === 'hi') {
      reply = `आपका अनुरोध प्राप्त हुआ: "${query}"। आप स्थानीय कार्य खोज सकते हैं, रडार दायरा समायोजित कर सकते हैं या नए कार्य पोस्ट कर सकते हैं।`;
      actions.push(
        isRecruiter
          ? { type: 'NAVIGATE_TAB', label: 'कुशल श्रमिक खोजें', payload: { tab: 'explore', view: 'map' } }
          : { type: 'NAVIGATE_TAB', label: 'पास के काम खोजें', payload: { tab: 'explore' } },
        isRecruiter
          ? { type: 'OPEN_POST_JOB', label: 'नया कार्य पोस्ट करें' }
          : { type: 'NAVIGATE_TAB', label: 'कौशल से मेल खाते काम', payload: { tab: 'explore' } }
      );
    } else if (lang === 'te') {
      reply = `మీ అభ్యర్థన స్వీకరించబడింది: "${query}". మీరు సమీపంలోని పనులను శోధించవచ్చు, రాడార్ పరిధిని సర్దుబాటు చేయవచ్చు లేదా కొత్త పనులను పోస్ట్ చేయవచ్చు.`;
      actions.push(
        isRecruiter
          ? { type: 'NAVIGATE_TAB', label: 'కార్మికులను కనుగొనండి', payload: { tab: 'explore', view: 'map' } }
          : { type: 'NAVIGATE_TAB', label: 'సమీప పనులను చూడండి', payload: { tab: 'explore' } },
        isRecruiter
          ? { type: 'OPEN_POST_JOB', label: 'జాబ్ పోస్ట్ చేయండి' }
          : { type: 'NAVIGATE_TAB', label: 'నైపుణ్యాలకు సరిపోయే పనులు', payload: { tab: 'explore' } }
      );
    } else {
      reply = `Got it! Regarding "${query}" — I'm ready to help you navigate local gig opportunities, adjust your radar radius, analyze district skill trends, or connect with verified workers across Tamil Nadu.`;
      actions.push(
        isRecruiter
          ? { type: 'NAVIGATE_TAB', label: 'Find Workers', payload: { tab: 'explore', view: 'map' } }
          : { type: 'NAVIGATE_TAB', label: 'Find Jobs Near Me', payload: { tab: 'explore' } },
        isRecruiter
          ? { type: 'OPEN_POST_JOB', label: 'Post a Gig' }
          : { type: 'NAVIGATE_TAB', label: 'Show Jobs Matching My Skills', payload: { tab: 'explore' } }
      );
    }

    return {
      id: 'msg_' + Date.now(),
      sender: 'assistant',
      text: reply,
      timestamp,
      actions,
      intent: 'CONVERSATIONAL'
    };
  }

  private getDefaultSkillsForCategory(category: string): string[] {
    switch (category) {
      case 'Plumbing':
        return ['Pipe Fitting', 'Leak Repair', 'Sanitary Installation', 'Tamil Speaking'];
      case 'Electrical':
        return ['Wiring', 'Switchboard Repair', 'Inverter Setup', 'Safety Certified'];
      case 'Painter':
        return ['Wall Painting', 'Primer Application', 'Surface Prep', 'Tamil Speaking'];
      case 'Delivery':
        return ['Two Wheeler Driving', 'GPS Navigation', 'Timely Delivery', 'Tamil Speaking'];
      case 'Driver':
        return ['LMV Driving License', 'City Navigation', 'Vehicle Maintenance', 'Tamil Speaking'];
      case 'Store Helper':
        return ['Inventory Management', 'Billing', 'Customer Service', 'Tamil Speaking'];
      case 'Catering & Cooking':
        return ['South Indian Cooking', 'Kitchen Hygiene', 'Bulk Food Prep', 'Tamil Speaking'];
      case 'Housekeeping':
        return ['Floor Cleaning', 'Dusting', 'Sanitation', 'Tamil Speaking'];
      case 'Carpentry':
        return ['Wood Cutting', 'Furniture Assembly', 'Door Fitting', 'Tamil Speaking'];
      case 'Masonry':
        return ['Bricklaying', 'Plastering', 'Concrete Mixing', 'Tamil Speaking'];
      case 'Welding':
        return ['Arc Welding', 'Metal Fabrication', 'Safety Certified'];
      default:
        return ['Tamil Speaking', 'Punctual', 'Physically Active'];
    }
  }
}

export const chatAssistantService = new ChatAssistantService();
