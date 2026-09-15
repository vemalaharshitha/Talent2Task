import type { Language, Job } from '../types';
import { autoTranslateString, detectLanguageFromScript, hasIndicCharacters, prefetchDynamicTranslation } from './autoTranslate.ts';
import { getInstantOrPrefetch } from '../services/translationService.ts';

export interface TranslationDictionary {
  // App header & Global
  appName: string;
  regionTag: string;
  tagline: string;
  offlineStatus: string;
  sqlTerminal: string;
  roleSeeker: string;
  roleRecruiter: string;
  switchRole: string;
  offlineAlert: string;
  marketDemand: string;
  notificationsTitle: string;
  notificationsSubtitle: string;
  markAllRead: string;
  noNotifications: string;
  trends: string;
  sqlInspector: string;
  splitView: string;
  close: string;
  cancel: string;
  save: string;
  delete: string;
  add: string;
  all: string;
  search: string;
  earnings: string;
  postedDate: string;
  payRate: string;
  distance: string;
  coordinates: string;
  gigLocation: string;
  postedByRecruiter: string;
  viewProfile: string;
  manageProfile: string;

  // Login Page
  loginWelcome: string;
  loginHeading: string;
  loginSubtitle: string;
  loginSeekerDesc: string;
  loginRecruiterDesc: string;
  loginEmailLabel: string;
  loginEmailPlaceholder: string;
  loginPasswordLabel: string;
  loginPasswordPlaceholder: string;
  loginRememberMe: string;
  loginForgotPassword: string;
  loginSignInSeeker: string;
  loginSignInRecruiter: string;
  loginNewPrompt: string;
  loginCreateAccount: string;
  loginHeroTitle1: string;
  loginHeroTitle2: string;
  loginHeroTitleHighlight: string;
  loginHeroDesc: string;
  loginStatRadar: string;
  loginStatRadarSub: string;
  loginStatOpp: string;
  loginStatOppSub: string;
  tabSignIn: string;
  tabCreateAccount: string;
  newUserRegistration: string;
  joinTalent2Task: string;
  createAccountSubtitle: string;
  fullNameLabel: string;
  companyNameLabel: string;
  fullNamePlaceholder: string;
  companyNamePlaceholder: string;
  mobilePhoneLabel: string;
  mobilePhonePlaceholder: string;
  ageLabel: string;
  yearsOfExperienceLabel: string;
  cityLabel: string;
  selectVelloreLocation: string;
  selectCity: string;
  useGpsBtn: string;
  gpsPromptTitle: string;
  gpsPromptSubtitle: string;
  skillsOffered: string;
  availableTimeSlots: string;
  createSeekerAccountBtn: string;
  createRecruiterAccountBtn: string;
  alreadyRegisteredPrompt: string;
  signInNowBtn: string;
  orSignInRegistered: string;
  sqliteSavedFeature: string;
  radar3kmFeature: string;
  exploreGigsTab: string;
  manageGigsTab: string;
  postGigTab: string;

  // Seeker Tab
  radarHeading: string;
  radarSubtitle: string;
  withinRadius: string;
  radiusSlider: string;
  allVellore: string;
  matchScore: string;
  claimJobBtn: string;
  claimedBadge: string;
  claimedOtherBadge: string;
  completedBadge: string;
  jobDetailsTitle: string;
  directionsBtn: string;
  directionsModalTitle: string;
  directionsModalSubtitle: string;
  yourLocationLabel: string;
  gigLocationLabel: string;
  startNavigationBtn: string;
  openGoogleMapsBtn: string;
  openAppleMapsBtn: string;
  onMyWayBtn: string;
  onMyWayAlertSent: string;
  travelModeBike: string;
  travelModeCar: string;
  travelModeAuto: string;
  travelModeWalk: string;
  liveGpsAccurate: string;
  estimatedArrival: string;
  turnByTurnGuide: string;
  readyToGoBanner: string;
  callRecruiterBtn: string;
  whatsappRecruiterBtn: string;
  myGigsTab: string;
  allGigsTab: string;
  mapViewTab: string;
  listViewTab: string;
  profileBtn: string;
  gigsFound: string;
  changeLocation: string;
  sortBy: string;
  sortMatchScore: string;
  sortDistance: string;
  sortHighestPay: string;
  payout: string;
  proximity: string;
  claiming: string;
  overall: string;
  noClaimedGigsTitle: string;
  noClaimedGigsDesc: string;
  myClaimedSubtitle: string;

  // Profile Modal
  profileTitle: string;
  profileDesc: string;
  fullName: string;
  age: string;
  phoneNumber: string;
  mySkills: string;
  skillsSelected: string;
  addCustomSkillPlaceholder: string;
  myAvailability: string;
  myLocation: string;
  useCurrentGps: string;
  locating: string;
  selectLandmark: string;
  saveProfileBtn: string;

  // Recruiter Profile Location Details
  doorNoLabel: string;
  doorNoPlaceholder: string;
  streetNameLabel: string;
  streetNamePlaceholder: string;
  cityOrDistrictLabel: string;
  landmarkFieldLabel: string;
  landmarkFieldPlaceholder: string;
  workplaceAddressLabel: string;
  workplaceAddressHint: string;
  recruiterLocationTitle: string;
  recruiterLocationSubtitle: string;

  // Phase 35 — Payment Feature UI Terminology
  payNowBtn: string;
  paymentSuccessful: string;
  paymentReceived: string;
  processingPayment: string;
  paymentCompleted: string;
  paidStatus: string;

  // Skill Gap & AI Recommendations
  skillGapTitle: string;
  skillGapBadge: string;
  skillGapDesc: string;
  addToMySkills: string;
  neededInGigs: string;
  allStarTitle: string;
  allStarDesc: string;

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
  skillGapAddSkillBtn: string;

  // Recruiter Portal
  recruiterHeading: string;
  recruiterSubtitle: string;
  activeRecruiter: string;
  postNewGigBtn: string;
  postedGigsCount: string;
  statusOpen: string;
  statusClaimed: string;
  statusCompleted: string;
  markCompletedBtn: string;
  deleteGigBtn: string;
  claimantDetails: string;
  noClaimantYet: string;
  rateClaimantBtn: string;
  callClaimantBtn: string;
  whatsappClaimantBtn: string;
  allGigsFilter: string;
  metricTotalGigs: string;
  metricOpenGigs: string;
  metricAssignedGigs: string;
  metricCompletedGigs: string;
  noRecruiterGigs: string;

  // Post Gig Form
  postModalTitle: string;
  postModalSubtitle: string;
  jobTitleLabel: string;
  jobTitlePlaceholder: string;
  categoryLabel: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  payoutLabel: string;
  payoutUnitLabel: string;
  perHour: string;
  perTask: string;
  perShift: string;
  perDay: string;
  requiredSkillsLabel: string;
  landmarkAreaLabel: string;
  clickMapInstruction: string;
  publishJobBtn: string;

  // Categories
  catDelivery: string;
  catStoreHelper: string;
  catDataEntry: string;
  catEventHand: string;
  catTutoring: string;
  catElectrical: string;

  // Filter & Search
  searchPlaceholder: string;
  categoryFilter: string;
  allCategories: string;
  minPayFilter: string;
  noJobsFound: string;

  // Match breakdown
  breakdownTitle: string;
  skillFit: string;
  distanceFit: string;
  scheduleFit: string;
  matchedSkillsLabel: string;
  missingSkillsLabel: string;

  // Hybrid AI Matching & Explainability
  whyRecommended: string;
  hybridMatchBreakdown: string;
  skillSimilarityLabel: string;
  distanceFactorLabel: string;
  availabilityFactorLabel: string;
  experienceFactorLabel: string;
  localDemandFactorLabel: string;
  reliabilityFactorLabel: string;

  // Phase 3 — NLP Requirement Understanding
  aiRequirementAssistant: string;
  aiFastDraftTitle: string;
  aiInputPlaceholder: string;
  extractWithAiBtn: string;
  analyzingWithAi: string;
  extractedDetailsTitle: string;
  extractedDetailsSubtitle: string;
  applyExtractedBtn: string;
  dismissExtractedBtn: string;
  detectedIntent: string;
  hiringWorkerIntent: string;
  detectedExperience: string;
  detectedShift: string;
  detectedLocation: string;
  detectedPayout: string;
  missingInformationAlert: string;
  confirmBeforePostNotice: string;
  aiSearchParsed: string;

  // Phase 6 — Voice & Multilingual AI
  voiceSearchBtn: string;
  voiceFastDraftBtn: string;
  voiceListening: string;
  voiceListeningPrompt: string;
  voicePermissionDenied: string;
  voicePermissionHelp: string;
  voiceUnsupported: string;
  voiceUnsupportedHelp: string;
  voiceSamplePhrases: string;
  voiceTrySample: string;
  voiceProcessing: string;
  aiMultilingualActive: string;
  aiLanguageDetected: string;

  // Phase 7 — Trust & Safety
  trustSafetyTitle: string;
  trustPotentialRisk: string;
  trustVerifiedRecruiter: string;
  trustStandardVerification: string;
  trustVerifiedListing: string;
  trustNewRecruiterNote: string;
  trustReportJobBtn: string;
  trustReportModalTitle: string;
  trustReportSuccessTitle: string;
  trustNoAutoBanNotice: string;

  // Phase 8 — Reliability & Continuous Feedback
  workerReliabilityTitle: string;
  reliabilityScoreLabel: string;
  reliabilityTierLabel: string;
  completionRateLabel: string;
  continuousFeedbackLabel: string;
  verifiedReviewsLabel: string;
  newWorkerBaselineNote: string;

  // Community Demand Modal
  demandModalTitle: string;
  demandModalSubtitle: string;
  demandRegionBadge: string;
  topInDemandRole: string;
  avgHourlyPayout: string;
  peakHiringWindows: string;
  hourlyPaySub: string;
  peakHiringSub: string;
  skillDemandRanking: string;
  openGigsSuffix: string;
  topAreaLabel: string;
  growthLabel: string;
  demandActualTitle: string;
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

  // Feedback Modal
  feedbackTitle: string;
  feedbackSubtitle: string;
  ratingScoreLabel: string;
  feedbackTagsLabel: string;
  commentLabel: string;
  commentPlaceholder: string;
  submitReviewBtn: string;

  // SQLite Console Modal
  sqlConsoleTitle: string;
  sqlConsoleSubtitle: string;
  sqlEngineBadge: string;
  presetQueriesLabel: string;
  executeBtn: string;
  exportBtn: string;
  resetBtn: string;
  execTime: string;
  rowsReturned: string;
  noResults: string;

  // Footer & Toasts
  footerTagline: string;
  footerEngineDesc: string;
  toastClaimSuccess: string;
  toastStatusUpdated: string;
  toastJobDeleted: string;
  toastJobPosted: string;
  toastProfileUpdated: string;
  toastSkillAdded: string;
  toastReviewSaved: string;
  nextStepBtn: string;
  backStepBtn: string;
  stepAccountInfo: string;
  stepLocationExperience: string;
  stepLocationDetails: string;
  selectRoleLabel: string;
  phoneExact10DigitsError: string;
  passwordRegexError: string;
  passwordRegexHint: string;
  [key: string]: any;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    // App header & Global
    appName: 'Talent2Task',
    regionTag: 'Tamil Nadu (தமிழ்நாடு)',
    tagline: 'Right Skills. Right Job. Real Impact. • Tamil Nadu',
    offlineStatus: 'Offline-First SQLite Mode',
    sqlTerminal: 'SQLite Inspector',
    roleSeeker: 'Job Seeker',
    roleRecruiter: 'Job Recruiter',
    switchRole: 'Switch Role',
    offlineAlert: 'You are offline. Your saved gigs and profiles are available locally; maps and external links will reconnect when internet returns.',
    marketDemand: 'Market Demand',
    notificationsTitle: 'Notifications & Alerts',
    notificationsSubtitle: 'Real-time gig alerts, match recommendations & rating updates',
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications at this time.',
    trends: 'Trends',
    sqlInspector: 'SQL Inspector',
    splitView: 'Split View',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    add: 'Add',
    all: 'All',
    search: 'Search',
    earnings: 'Earnings',
    postedDate: 'Posted Date',
    payRate: 'Pay Rate',
    distance: 'Distance',
    coordinates: 'Coordinates',
    gigLocation: 'Gig Location',
    postedByRecruiter: 'Posted by Recruiter',
    viewProfile: 'View Profile',
    manageProfile: 'Manage Profile',

    // Login Page
    loginWelcome: 'WELCOME BACK',
    loginHeading: 'Sign in to continue',
    loginSubtitle: 'Access your workspace across Tamil Nadu.',
    loginSeekerDesc: 'Find local gigs',
    loginRecruiterDesc: 'Post a gig',
    loginEmailLabel: 'Mobile Phone Number',
    loginEmailPlaceholder: '98765 43210',
    loginPasswordLabel: 'Password',
    loginPasswordPlaceholder: 'Enter your password',
    loginRememberMe: 'Remember me',
    loginForgotPassword: 'Forgot password?',
    loginSignInSeeker: 'Sign In',
    loginSignInRecruiter: 'Sign In',
    loginNewPrompt: 'New to Talent2Task?',
    loginCreateAccount: 'Create an account',
    loginHeroTitle1: 'Right skills.',
    loginHeroTitle2: 'Right job.',
    loginHeroTitleHighlight: 'Real impact.',
    loginHeroDesc: 'Discover trusted gigs or find skilled workers across Tamil Nadu, all in one unified platform.',
    loginStatRadar: 'Live GPS',
    loginStatRadarSub: 'Tamil Nadu radar',
    loginStatOpp: '24/7',
    loginStatOppSub: 'opportunities',
    tabSignIn: 'Sign In',
    tabCreateAccount: 'Create Account',
    newUserRegistration: 'New User Registration',
    joinTalent2Task: 'Join Talent2Task Tamil Nadu',
    createAccountSubtitle: 'Create your account to match with hyper-local gigs or post jobs across Tamil Nadu.',
    fullNameLabel: 'Full Name',
    companyNameLabel: 'Company / Business Name',
    fullNamePlaceholder: 'e.g. Karthik Raja',
    companyNamePlaceholder: 'e.g. Tamil Nadu Fresh Mart',
    mobilePhoneLabel: 'Mobile Phone Number',
    mobilePhonePlaceholder: '98765 43210',
    ageLabel: 'Age',
    yearsOfExperienceLabel: 'Years of Experience',
    cityLabel: 'City / Preferred Region',
    selectVelloreLocation: 'Select City / Preferred Region',
    selectCity: 'Select City in Tamil Nadu',
    useGpsBtn: 'Live GPS',
    gpsPromptTitle: 'Enable Live GPS for Accurate Nearby Jobs',
    gpsPromptSubtitle: 'Allow location access to match with gigs nearest to you across Tamil Nadu',
    skillsOffered: 'Skills & Services Offered',
    availableTimeSlots: 'Available Time Slots',
    createSeekerAccountBtn: 'Create Account',
    createRecruiterAccountBtn: 'Create Account',
    alreadyRegisteredPrompt: 'Already registered?',
    signInNowBtn: 'Sign In Now',
    orSignInRegistered: '',
    sqliteSavedFeature: 'Saved locally in SQLite WASM Database',
    radar3kmFeature: 'Live GPS & City Radar gig matching',
    exploreGigsTab: 'Explore Gigs',
    manageGigsTab: 'Post & Manage',
    postGigTab: 'Post a Gig',

    // Seeker Tab
    radarHeading: 'Live Gig Radar (Tamil Nadu)',
    radarSubtitle: 'Find informal gigs & part-time shifts nearest to you',
    withinRadius: 'within',
    radiusSlider: 'Radius Filter',
    allVellore: 'All Tamil Nadu',
    matchScore: 'Match',
    claimJobBtn: 'Accept / Claim Gig',
    claimedBadge: 'Claimed by You',
    claimedOtherBadge: 'Assigned',
    completedBadge: 'Completed',
    jobDetailsTitle: 'Gig Details & Contact',
    directionsBtn: 'Get Directions',
    directionsModalTitle: 'Route & Directions to Gig',
    directionsModalSubtitle: 'Accurate GPS Navigation & Live Route Guide',
    yourLocationLabel: 'Your Starting Location',
    gigLocationLabel: 'Recruiter Work Location',
    startNavigationBtn: 'Start Google Maps Navigation',
    openGoogleMapsBtn: 'Google Maps GPS',
    openAppleMapsBtn: 'Apple Maps',
    onMyWayBtn: "I'm On My Way",
    onMyWayAlertSent: 'Recruiter notified with your live ETA!',
    travelModeBike: 'Bike / Two-Wheeler',
    travelModeCar: 'Car / Taxi',
    travelModeAuto: 'Auto / Transit',
    travelModeWalk: 'Walking',
    liveGpsAccurate: 'Accurate GPS Geolocation Active',
    estimatedArrival: 'Estimated Travel Duration',
    turnByTurnGuide: 'Navigation Guidance',
    readyToGoBanner: 'Ready to go? Get Turn-by-Turn GPS Directions to Gig',
    callRecruiterBtn: 'Call Recruiter',
    whatsappRecruiterBtn: 'WhatsApp',
    myGigsTab: 'My Claimed Gigs',
    allGigsTab: 'Find Local Gigs',
    mapViewTab: 'Map Radar',
    listViewTab: 'List View',
    profileBtn: 'My Profile & GPS',
    gigsFound: 'Gigs Found',
    changeLocation: 'Change',
    sortBy: 'Sort:',
    sortMatchScore: '🔥 Match Score',
    sortDistance: '⚡ Distance (Nearest)',
    sortHighestPay: '💰 Highest Payout',
    payout: 'Payout',
    proximity: 'Proximity',
    claiming: 'Claiming...',
    overall: 'Overall',
    noClaimedGigsTitle: 'No Claimed Gigs Yet',
    noClaimedGigsDesc: 'Explore the live radar to accept quick hourly gigs across Tamil Nadu.',
    myClaimedSubtitle: 'Track your accepted gigs and connect with local recruiters',

    // Profile Modal
    profileTitle: 'Seeker Profile & Location',
    profileDesc: 'Set your skills and availability to maximize your 3km match score',
    fullName: 'Full Name',
    age: 'Age',
    phoneNumber: 'Phone Number (with WhatsApp)',
    mySkills: 'My Skill Set (Select all that apply)',
    skillsSelected: 'selected',
    addCustomSkillPlaceholder: 'Add other skill (e.g. Electrician, Tutoring)...',
    myAvailability: 'Free-Time Availability',
    myLocation: 'Current Location / GPS',
    useCurrentGps: 'Fetch Live GPS',
    locating: 'Locating...',
    selectLandmark: 'Or Pick Tamil Nadu Landmark',
    saveProfileBtn: 'Save Profile & Update Radar',

    // Recruiter Profile Location Details
    doorNoLabel: 'Door / Flat / Shop No.',
    doorNoPlaceholder: 'e.g. Door No. 14/B, 2nd Floor, Apex Complex',
    streetNameLabel: 'Street Name / Road / Area',
    streetNamePlaceholder: 'e.g. Anna Salai, Gandhi Street, Mount Road',
    cityOrDistrictLabel: 'City or District',
    landmarkFieldLabel: 'Landmark (Closest Hub)',
    landmarkFieldPlaceholder: 'e.g. Near Bus Terminus / Opp. Bank',
    workplaceAddressLabel: 'Complete Workplace Address (For Candidate Navigation)',
    workplaceAddressHint: 'Candidates who claim your gigs will receive accurate turn-by-turn navigation directly to this workplace address.',
    recruiterLocationTitle: 'Workplace & Business Location',
    recruiterLocationSubtitle: 'Manage door no, street name, landmark, and district for accurate navigation',

    // Phase 35 — Payment Feature UI Terminology
    payNowBtn: 'Pay Now',
    paymentSuccessful: 'Payment Successful',
    paymentReceived: 'Payment Received',
    processingPayment: 'Processing Payment...',
    paymentCompleted: 'Payment Completed',
    paidStatus: 'Paid',

    // Skill Gap & AI Recommendations
    skillGapTitle: 'AI Skill Gap & Career Recommendations',
    skillGapBadge: '+35% Match Score Boost',
    skillGapDesc: 'Add these high-demand skills to your profile to instantly unlock 90%+ match scores on top Tamil Nadu gigs.',
    addToMySkills: 'Add to My Skills',
    neededInGigs: 'Needed in',
    allStarTitle: 'All-Star Skill Profile!',
    allStarDesc: 'Your profile covers 100% of the active skills requested across nearby Tamil Nadu gigs.',

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
    skillGapAddSkillBtn: 'Add to My Skills',

    // Recruiter Portal
    recruiterHeading: 'Recruiter Management Hub',
    recruiterSubtitle: 'Post quick part-time gigs across Tamil Nadu cities and districts',
    activeRecruiter: 'Active Recruiter',
    postNewGigBtn: 'Post a New Gig',
    postedGigsCount: 'Active Posted Gigs',
    statusOpen: 'Open for Claim',
    statusClaimed: 'Claimed / Assigned',
    statusCompleted: 'Work Completed',
    markCompletedBtn: 'Mark as Completed',
    deleteGigBtn: 'Delete Gig',
    claimantDetails: 'Claimant Details',
    noClaimantYet: 'Waiting for nearby seeker to accept',
    rateClaimantBtn: 'Rate & Review',
    callClaimantBtn: 'Call',
    whatsappClaimantBtn: 'WhatsApp',
    allGigsFilter: 'All Gigs',
    metricTotalGigs: 'Total Gigs',
    metricOpenGigs: 'Open (Searching)',
    metricAssignedGigs: 'Assigned',
    metricCompletedGigs: 'Completed',
    noRecruiterGigs: 'You have not posted any gigs yet. Click "Post a New Gig" to get started!',

    // Post Gig Form
    postModalTitle: 'Post a Local Gig (Tamil Nadu)',
    postModalSubtitle: 'Post an informal gig with instant radar discovery across Tamil Nadu',
    jobTitleLabel: 'Job Title',
    jobTitlePlaceholder: 'e.g., Delivery Assistant, Store Billing Hand, Event Setup',
    categoryLabel: 'Category',
    descriptionLabel: 'Description & Instructions',
    descriptionPlaceholder: 'Explain what the helper will do, shift timings, and reporting point...',
    payoutLabel: 'Payout Amount (₹)',
    payoutUnitLabel: 'Payout Type',
    perHour: 'per hour',
    perTask: 'per task',
    perShift: 'per shift',
    perDay: 'per day',
    requiredSkillsLabel: 'Required Skills (Select tags)',
    landmarkAreaLabel: 'Landmark / Area / City in Tamil Nadu',
    clickMapInstruction: 'Click on the map or select a Tamil Nadu landmark below to set exact coordinates',
    publishJobBtn: 'Publish Gig',

    // Categories
    catDelivery: 'Delivery & Transport',
    catStoreHelper: 'Store Helper & Retail',
    catDataEntry: 'Data Entry & Office',
    catEventHand: 'Event & Catering Hand',
    catTutoring: 'Tutoring & Support',
    catElectrical: 'Technical & Maintenance',

    // Filter & Search
    searchPlaceholder: 'Search jobs, skills, or Tamil Nadu locations...',
    categoryFilter: 'Category',
    allCategories: 'All Categories',
    minPayFilter: 'Min Pay (₹)',
    noJobsFound: 'No gigs match your 3km radius or filter criteria. Try expanding the radar distance or clearing filters!',

    // Match breakdown
    breakdownTitle: 'Match Score Breakdown',
    skillFit: 'Skill Fit',
    distanceFit: 'Distance Fit',
    scheduleFit: 'Schedule Fit',
    matchedSkillsLabel: 'Matched Skills',
    missingSkillsLabel: 'Missing Skills',

    // Hybrid AI Matching & Explainability
    whyRecommended: 'Why this match?',
    hybridMatchBreakdown: 'Hybrid AI Ranking Breakdown',
    skillSimilarityLabel: 'Skill Similarity',
    distanceFactorLabel: 'Distance',
    availabilityFactorLabel: 'Availability',
    experienceFactorLabel: 'Experience',
    localDemandFactorLabel: 'Local Demand',
    reliabilityFactorLabel: 'Reliability',

    // Phase 3 — NLP Requirement Understanding
    aiRequirementAssistant: 'AI Requirement Assistant',
    aiFastDraftTitle: 'Fast-Draft with Natural Language',
    aiInputPlaceholder: 'e.g., I need an experienced AC technician near Madurai tomorrow evening',
    extractWithAiBtn: 'Analyze with AI',
    analyzingWithAi: 'Extracting...',
    extractedDetailsTitle: 'AI Extracted Details — Review & Edit',
    extractedDetailsSubtitle: 'Verify and refine any detected fields before applying to your gig posting',
    applyExtractedBtn: 'Apply Extracted Details',
    dismissExtractedBtn: 'Clear',
    detectedIntent: 'Intent',
    hiringWorkerIntent: 'Hiring Worker',
    detectedExperience: 'Experience',
    detectedShift: 'Timing / Shift',
    detectedLocation: 'Location',
    detectedPayout: 'Pay Rate',
    missingInformationAlert: 'Needs Attention',
    confirmBeforePostNotice: 'AI information is never posted without your confirmation. Please review the details below.',
    aiSearchParsed: 'AI Natural Language Search',
    // Phase 6 — Voice & Multilingual AI
    voiceSearchBtn: 'Voice Search',
    voiceFastDraftBtn: 'Speak Requirement',
    voiceListening: 'Listening... Speak now',
    voiceListeningPrompt: 'Speak or type in Tamil, Telugu, Hindi, or English',
    voicePermissionDenied: 'Microphone Access Blocked',
    voicePermissionHelp: 'Please enable microphone access in browser settings or try sample voice presets.',
    voiceUnsupported: 'Speech Recognition Unsupported',
    voiceUnsupportedHelp: 'Your browser does not support Web Speech API. Please type or use sample voice.',
    voiceSamplePhrases: 'Voice AI Sample Inputs',
    voiceTrySample: 'Try Sample Voice',
    voiceProcessing: 'Processing Voice AI...',
    aiMultilingualActive: 'AI Multilingual & Voice Active',
    aiLanguageDetected: 'Language Detected',
    // Phase 7 — Trust & Safety
    trustSafetyTitle: 'Trust & Safety Assessment',
    trustPotentialRisk: 'Potential Risk Detected',
    trustVerifiedRecruiter: 'Verified Recruiter',
    trustStandardVerification: 'Standard Verification',
    trustVerifiedListing: 'Verified Listing',
    trustNewRecruiterNote: 'New recruiter account — standard security checks passed. Ratings build over time with completed gigs.',
    trustReportJobBtn: 'Report Job',
    trustReportModalTitle: 'Report Job Posting',
    trustReportSuccessTitle: 'Report Logged for Review',
    trustNoAutoBanNotice: 'To prevent abuse, jobs and recruiters are never automatically banned solely based on reports or AI algorithms.',

    // Phase 8 — Reliability & Continuous Feedback
    workerReliabilityTitle: 'Worker Reliability & Reputation',
    reliabilityScoreLabel: 'Reliability Score',
    reliabilityTierLabel: 'Reputation Tier',
    completionRateLabel: 'Task Completion Rate',
    continuousFeedbackLabel: 'Continuous Feedback Cycle',
    verifiedReviewsLabel: 'Verified Reviews',
    newWorkerBaselineNote: 'New worker baseline applied — building verified track record on Talent2Task.',

    // Community Demand Modal
    demandModalTitle: 'Community Demand & Skill Trends',
    demandModalSubtitle: 'Live demand aggregation across Katpadi, CMC, VIT, and Sathuvachari',
    demandRegionBadge: 'Tamil Nadu Real-Time AI Radar',
    topInDemandRole: 'Top In-Demand Role',
    avgHourlyPayout: 'Avg. Hourly Payout',
    peakHiringWindows: 'Peak Hiring Windows',
    hourlyPaySub: 'Instant same-day completion',
    peakHiringSub: 'Part-time flexible shifts',
    skillDemandRanking: 'Tamil Nadu In-Demand Skills & Pay Rate',
    openGigsSuffix: 'open gigs',
    topAreaLabel: 'Top Area:',
    growthLabel: 'Growth:',
    demandActualTitle: 'Current Local Demand',
    demandPredictedTitle: 'Predicted Demand',
    demandLevelHigh: 'High',
    demandLevelMedium: 'Medium',
    demandLevelLow: 'Low',
    demandTrendRising: 'Rising',
    demandTrendStable: 'Stable',
    demandTrendSoftening: 'Softening',
    demandInsufficientData: 'Insufficient historical data',
    demandAttributionTitle: 'Data Source & Activity Attribution',
    demandSelectRegion: 'Select District / Region',
    demandActiveGigsLabel: 'Active Gigs',
    demandCompletedGigsLabel: 'Completed / Claimed',
    demandModelArchitecture: 'Statistical Predictive Engine',
    demandWhyThisPrediction: 'Data & Prediction Attribution',
    demandFilterGigsBtn: 'Explore Jobs',
    demandAllTamilNadu: 'All Tamil Nadu (Statewide)',

    // Feedback Modal
    feedbackTitle: 'Rate & Review Experience',
    feedbackSubtitle: 'Help build community trust and enhance future AI match scoring',
    ratingScoreLabel: 'Overall Rating',
    feedbackTagsLabel: 'What went well? (Select tags)',
    commentLabel: 'Detailed Feedback / Notes',
    commentPlaceholder: 'Share specific details about timeliness, skill accuracy, and work quality...',
    submitReviewBtn: 'Submit Feedback & Update Trust Score',

    // SQLite Console Modal
    sqlConsoleTitle: 'SQLite In-Browser WASM Console',
    sqlConsoleSubtitle: 'Execute live queries directly on the local offline-first SQLite database',
    sqlEngineBadge: 'SQLite 3 Engine Active',
    presetQueriesLabel: 'Quick SQL Presets',
    executeBtn: 'Execute SQL Query',
    exportBtn: 'Export .sqlite Database',
    resetBtn: 'Reset Seed Data',
    execTime: 'Execution Time',
    rowsReturned: 'rows returned',
    noResults: 'Query executed successfully with no rows returned.',

    // Footer & Toasts
    footerTagline: 'Right Talent. Right Task. Real Impact.',
    footerEngineDesc: 'Hyper-Local Gig Discovery Engine — Tamil Nadu',
    toastClaimSuccess: '🎉 Gig accepted! Contact info unlocked for recruiter.',
    toastStatusUpdated: 'Status updated to',
    toastJobDeleted: 'Gig removed.',
    toastJobPosted: '🚀 New gig posted and live on radar across Tamil Nadu!',
    toastProfileUpdated: '✅ Profile & GPS updated successfully.',
    toastSkillAdded: 'added! AI match scores recalculated.',
    toastReviewSaved: '⭐ Rating & feedback saved! Community trust updated.',
    nextStepBtn: 'Next',
    backStepBtn: 'Back',
    stepAccountInfo: '1. Account Info',
    stepLocationExperience: '2. Experience & Location',
    stepLocationDetails: '2. Location Details',
    selectRoleLabel: 'Select Account Role',
    phoneExact10DigitsError: 'Please enter exactly 10-digit mobile number.',
    passwordRegexError: 'Password must be 8-12 characters long and include at least one number and one special character.',
    passwordRegexHint: '8-12 characters, at least 1 number & 1 special character'
  },

  ta: {
    'Turmeric Root Sun-Drying & Bagging Hand': 'மஞ்சள் கிழங்கு உலர்த்துதல் மற்றும் மூட்டை கட்டுதல்',
    'Parboiled Rice Huller Mill Operator': 'புழுங்கல் அரிசி ஆலை ஹல்லர் ஆபரேட்டர்',
    'Sugar Mill Sugarcane Crusher Feeder': 'கள்ளக்குறிச்சி சர்க்கரை ஆலை கரும்பு அரவை ஆபரேட்டர்',
    'Shallot (Small Onion) Grading Sorter': 'சின்ன வெங்காயம் தரம் பிரித்து பேக்கிங் செய்பவர்',
    'Gypsum Mineral Processing Helper': 'ஜிப்சம் கனிம செயலாக்க உதவியாளர்',
    'Hybrid Maize Seed Sorting Specialist': 'பெரம்பலூர் மக்காச்சோள விதை தரம் பிரிக்கும் நிபுணர்',
    'Groundnut Decorticator & Oil Extraction Operator': 'மணப்பாறை நிலக்கடலை எண்ணெய் ஆலை எக்ஸ்பெல்லர்',
    'Synthetic Gemstone Faceting & Lapidary Polisher': 'செயற்கை வைர மற்றும் ரத்தின பாலிஷிங் கலைஞர்',
    'Irrigation Canal Sluice Gate Maintenance Hand': 'பாசன கால்வாய் மதகு பராமரிப்பு உதவியாளர்',
    'Tiruvarur Chariot Silk Border Weaving Artisan': 'திருவாரூர் ஆழித்தேர் பட்டு பார்டர் நெசவு கலைஞர்',
    'Certified Paddy Seed Moisture & Purity Sorter': 'சான்றளிக்கப்பட்ட நெல் விதை ஈரப்பதம் மற்றும் தூய்மை பரிசோதகர்',
    'Traditional Cotton Dhoti Handloom Weaver': 'பாரம்பரிய காட்டன் வேட்டி கைத்தறி நெசவாளர்',
    'Coastal Shrimp Hatchery Water Quality Tech': 'கடலோர இறால் குஞ்சு பொரிப்பக நீர் தர தொழில்நுட்ப வல்லுநர்',
    'Raw Cashew Decortication & Roasting Sorter': 'முந்திரி வறுத்தல் மற்றும் உடைக்கும் தரம் பிரிப்பவர்',
    'Limestone Quarry Mining Equipment Hand': 'சுண்ணாம்புக்கல் சுரங்க உபகரண உதவியாளர்',
    'Cement Rotary Kiln Monitoring Operator': 'அரியலூர் சிமெண்ட் சுழல் உலை கண்காணிப்பு ஆபரேட்டர்',
    'Automotive Sub-Assembly Line Fitter': 'மறைமலைநகர் கார் அசெம்பிளி லைன் பிட்டர்',
    'IT Server Room Power & HVAC Tech': 'மகிந்திரா வேர்ல்ட் சிட்டி சர்வர் ரூம் பவர் & ஏசி டெக்னீஷியன்',
    'Defense Vehicle Spare Quality Checker': 'ஆவடி ராணுவ வாகன உதிரிபாக தர பரிசோதகர்',
    'Heavy Metal Forging Drop-Hammer Operator': 'கும்மிடிப்பூண்டி கனரக மெட்டல் போForging ஆபரேட்டர்',
    'Tannery Drum Processing Operator': 'தோல் பதனிடும் மர டிரிரம் ஆபரேட்டர்',
    'Shoe Upper Zig-Zag Sewing Tailor': 'ஆம்பூர் தோல் காலணி தையல் மாஸ்டர்',
    'Railway Freight Transshipment Loader': 'ஜோலார்பேட்டை ரயில்வே சரக்கு டிரான்ஸ்ஷிப்மென்ட் உதவியாளர்',
    'Industrial Boiler Water Chemistry Tech': 'தொழில்துறை பாய்லர் நீர் வேதியியல் தொழில்நுட்ப வல்லுநர்',
    'Leather Shoe Upper Clicking & Skiving': 'தோல் காலணி மேல் பகுதி கட்டிங் & ஸ்கைவிங்',
    'High Voltage Switchyard Electrician': 'உயர் மின்னழுத்த சுவிட்ச்யார்டு எலக்ட்ரீசியன்',
    'Thermal Power Plant Maintenance Tech': 'அனல் மின் நிலைய பராமரிப்பு தொழில்நுட்ப வல்லுநர்',
    'Lignite Bucket Wheel Excavator Operator': 'நிலக்கரி பக்கெட் வீல் அகழ்வாராய்ச்சி ஆபரேட்டர்',
    'Plum & Pear Orchard Harvest Hand': 'பிளம்ஸ் மற்றும் பேரிக்காய் பறிக்கும் உதவியாளர்',
    'Homemade Chocolate Tempering Artisan': 'கொடைக்கானல் சாக்லேட் தயாரிப்பாளர்',
    'Timber Sawmill Machine Operator Helper': 'மரம் அறுக்கும் ஆலை இயந்திர உதவியாளர்',
    'Coir Pith Block Press Machine Operator': 'தேங்காய் நார் கழிவு பிரிக் கட்டை பிரஸ் ஆபரேட்டர்',
    'Tender Coconut Wholesale Sorting Specialist': 'பொள்ளாச்சி இளநீர் மட்டை உறித்தல் மற்றும் தரம் பிரித்தல்',
    'Temple Border Silk Dhoti Handloom Weaver': 'கோவில் பட்டு வேட்டி கைத்தறி நெசவாளர்',
    'Kumbakonam Degree Coffee Roaster & Barista': 'கும்பகோணம் டிகிரி காபி வறுக்கும் மாஸ்டர்',
    'Brass Temple Lamp (Kuthuvilakku) Artisan': 'பித்தளை குத்துவிளக்கு மற்றும் மணி கைவினைஞர்',
    'Chettinad Traditional Spice & Catering Master': 'செட்டிநாடு பாரம்பரிய சமையல் மற்றும் மசாலா மாஸ்டர்',
    'Athangudi Handmade Floor Tile Artisan': 'ஆத்தங்குடி பாரம்பரிய தரை ஓடு கைவினைஞர்',
    'Traditional Pottery & Musical Ghatam Maker': 'மானாமதுரை கடம் மற்றும் மண்பாண்ட கலைஞர்',
    'Graphite Mining Processing Helper': 'கிராஃபைட் தாது மிதவை ஆலை உதவியாளர்',
    'Seashell & Conch Handicraft Artisan': 'சங்கு மற்றும் சிப்பி கைவினைப் பொருட்கள் செதுக்குபவர்',
    'Island Pilgrimage Transit Coordinator': 'ராமேஸ்வரம் தீவு யாத்ரீகர்கள் உதவி ஒருங்கிணைப்பாளர்',
    'Solar PV Array Maintenance & Cleaning Tech': 'சூரிய மின் தகடு சுத்தம் மற்றும் பராமரிப்பு',
    'Dry Fish Salt-Curing & Solar Drying Specialist': 'கருவாடு உப்பு பதனிடுதல் மற்றும் சோலார் உலர் கூட உதவியாளர்',
    'Palm Jaggery (Karupatti) Boiling Master': 'பனை கருப்பட்டி காய்ச்சும் மாஸ்டர்',
    'Banana Fiber Extraction Machine Hand': 'வாழை நார் பிரித்தெடுக்கும் இயந்திர ஆபரேட்டர்',
    'Bodinayakanur Cardamom Auction Sorter': 'போடிநாயக்கனூர் ஏலக்காய் ஏல தரம் பிரிப்பவர்',
    'Cumbum Valley Grape Harvesting Specialist': 'கம்பம் பள்ளத்தாக்கு திராட்சை அறுவடை நிபுணர்',
    'Country Sugar (Nattu Sakkarai) Maker': 'நாட்டு சர்க்கரை தயாரிப்பாளர்',
    'Cotton Ginning Saw Machine Operator': 'பருத்தி பஞ்சு பிரித்தெடுக்கும் இயந்திர ஆபரேட்டர்',
    'Courtallam Season Tourism Assistant': 'குற்றாலம் சீசன் சுற்றுலா மற்றும் வழிகாட்டுதல்',
    'Wholesale Grain Mandi Logistics Handler': 'தானிய மண்டி மூட்டை தூக்குதல் மற்றும் தைத்தல்',
    'Oil Mill Expeller & Filter Press Operator': 'எண்ணெய் ஆலை எக்ஸ்பெல்லர் மற்றும் பில்டர் பிரஸ் ஆபரேட்டர்',
    'Wholesale Red Chilli & Spice Grader': 'மொத்த மிளகாய் மற்றும் மசாலா தரம் பிரிப்பவர்',
    'Sugar Mill Processing Operator': 'சர்க்கரை ஆலை செயலாக்க ஆபரேட்டர்',
    'Raw Cashew Decorticator Machine Operator': 'பச்சை முந்திரி பருப்பு உடைக்கும் இயந்திர ஆபரேட்டர்',
    'Arani Silk Saree Handloom Weaver': 'ஆரணி பட்டு சேலை கைத்தறி நெசவாளர்',
    'Traditional Wood Ghani Oil Press Operator': 'பாரம்பரிய மரச்செக்கு நல்லெண்ணெய் ஆலை ஆபரேட்டர்',
    'Girivalam Pilgrim Logistics Coordinator': 'கிரிவலம் பக்தர் சேவை மற்றும் அன்னதான ஒருங்கிணைப்பாளர்',
    'Granite Gangsaw Block Slicing Operator': 'கிரானைட் கேங்சா கல் அறுக்கும் ஆபரேட்டர்',
    'Floriculture Flower Sorter & Stringer': 'மலர் மாலை கட்டுதல் மற்றும் தரம் பிரித்தல்',
    'Mango Pulp Industrial Canning Operator': 'மாம்பழ கூழ் கேனிங் மற்றும் பாஸ்டுரைசேஷன் ஆபரேட்டர்',
    'Sericulture Silkworm Cocoon Rearing Hand': 'பட்டுப்புழு வளர்ப்பு மற்றும் கூடு அறுவடை உதவியாளர்',
    'Marine Fish Salting & Sun-Curing Hand': 'கருவாடு உப்பு பதனிடுதல் மற்றும் உலர்த்துதல்',
    'Cashew Decortication & Oven Roasting Operator': 'முந்திரி கொட்டை உடைத்தல் மற்றும் வறுக்கும் ஆபரேட்டர்',
    'Lignite Mine Conveyor Maintenance Tech': 'நெய்வேலி நிலக்கரி கன்வேயர் பெல்ட் பராமரிப்பு',
    'Harbor Fish Auction Sorting & Ice Packing': 'மீன்பிடி துறைமுக ஏல மீன் வகைப்படுத்துதல் மற்றும் ஐஸ் பேக்கிங்',
    'Deep-Sea Trawler Net Rigging & Deck Hand': 'ஆழ்கடல் மீன்பிடி படகு வலை கட்டும் டெக் குழு',
    'Deep Borewell Rig Machinery Operation': 'ஆழ்துளை கிணறு ரிக் இயந்திர ஆபரேட்டர்',
    'Heavy Lorry Chassis & Cabin Welding Tech': 'லாரி சேஸ் மற்றும் கேபின் வெல்டர்',
    'Commercial Poultry Egg Grading Specialist': 'வணிக கோழிப்பண்ணை முட்டை தரம் பிரிக்கும் நிபுணர்',
    'Yarn Dyeing & Hydro-Extraction Operator': 'நூல் சாயம் ஏற்றுதல் மற்றும் நீர் நீக்கும் ஆபரேட்டர்',
    'Commercial Bus Body MIG Welding Tech': 'பேருந்து பாடி பில்டிங் எம்ஐஜி வெல்டர்',
    'Home Textile Jacquard Linen Weaving Tech': 'வீட்டு ஜவுளி ஜாக்கார்டு லினன் நெசவாளர்',
    'Tannery Leather Buffing & Trimming Tech': 'தோல் பதனிடும் பஃபிங் மற்றும் டிரிம்மிங் டெக்னீஷியன்',
    'Sirumalai Mountain Banana & Cardamom Sorter': 'சிறுமலை மலை வாழைப்பழம் மற்றும் ஏலக்காய் தரம் பிரிப்பவர்',
    'Handcrafted Brass Lock Assembly Artisan': 'திண்டுக்கல் பித்தளை பூட்டு அசெம்பிளி கைவினைஞர்',
    'Hill Vegetable & Fruit Cold Packing Hand': 'மலைத்தோட்ட காய்கறி மற்றும் பழ பேக்கிங்',
    'Eucalyptus Essential Oil Distillation Worker': 'நீலகிரி தைல மர எண்ணெய் காய்ச்சி வடித்தல்',
    'Orthodox Tea Plucking & Processing Hand': 'தேயிலை கொழுந்து பறித்தல் மற்றும் பதப்படுத்துதல்',
    'Auto Sheet Metal Stamping Press Operator': 'வாகன உதிரிபாக ஸ்டாம்பிங் பிரஸ் ஆபரேட்டர்',
    'SMT Electronics Component Inspection': 'SMT எலக்ட்ரானிக்ஸ் போர்டு ஆய்வாளர்',
    'Kanchipuram Pure Silk Zari Weaving Master': 'காஞ்சிபுரம் பட்டு ஜரிகை நெசவு மாஸ்டர்',
    'Floriculture Dutch Rose Export Harvest Hand': 'டச்சு ரோஜா மலர் ஏற்றுமதி அறுவடை உதவியாளர்',
    'Precision Tool & Die Machine Operator': 'துல்லிய கருவி மற்றும் டை இயந்திர ஆபரேட்டர்',
    'EV Battery Module Assembly & Spot Welding': 'மின்சார வாகன பேட்டரி மாட்யூல் ஸ்பாட் வெல்டர்',
    'Fireworks Pyro-Mixing & Safety Fuse Setting': 'பட்டாசு வேதியியல் கலவை மற்றும் திரி பொருத்துதல்',
    'Cashew Kernel Peeling & Vacuum Grading Hand': 'முந்திரி பருப்பு உறித்தல் மற்றும் வெற்றிட பேக்கிங்',
    'Rubber Latex Tapping & Smoking Tech': 'ரப்பர் பால் வடித்தல் & புகைத்தாள் தயாரிப்பு',
    'Seafood Cold Storage Blast Freezer Packaging': 'கடல் உணவு பிளாஸ்ட் ப்ரீசர் பேக்கிங்',
    'Marine Salt Pan Raking & Refining Hand': 'கடல் உப்பு பாத்தி வார்ப்பு மற்றும் சுத்திகரிப்பு',
    'Harbor Crane Container Stevedore': 'துறைமுக கிரேன் கன்டெய்னர் ஸ்டீவ்டோர்',
    'Thanjavur Art Plate Embossing Craftsman': 'தஞ்சாவூர் கலை தட்டு செதுக்கும் கைவினைஞர்',
    'Bronze Chola Statue Casting & Engraving': 'சோழர் கால வெண்கல சிலை வார்ப்பு மற்றும் செதுக்குதல்',
    'Paddy Combine Harvester Machine Operator': 'நெல் அறுவடை இயந்திர ஆபரேட்டர்',
    'Powerloom Fabric Weaving & Maintenance': 'விசைத்தறி துணி நெசவு மற்றும் பராமரிப்பு',
    'Bhavani Jamakkalam Carpet Handloom Artisan': 'பவானி ஜமக்காளம் கைத்தறி நெசவாளர்',
    'Turmeric Grading & Moisture Testing Specialist': 'மஞ்சள் தரம் மற்றும் ஈரப்பதம் சோதனை நிபுணர்',
    'Export Apparel Finishing & Packing': 'ஏற்றுமதி ஆடை பினிஷிங் மற்றும் பேக்கிங்',
    'Fabric Screen Printing & Color Kitchen': 'துணி ரோட்டரி ஸ்கிரீன் பிரிண்டிங் & வண்ண கலவை',
    'Knitwear Garment Flatlock Tailoring Master': 'பின்னலாடை ஃப்ளாட்லாக் தையல் மாஸ்டர்',
    'Finished Leather Quality Inspection': 'முடிக்கப்பட்ட தோல் தர பரிசோதனை',
    'Transit Freight Logistics': 'ரயில்வே சரக்கு போக்குவரத்து லாஜிஸ்டிக்ஸ்',
    'Hospital Patient Desk Navigation': 'மருத்துவமனை நோயாளிகள் வழிகாட்டுதல்',
    'Paper Mill Pulp Processing Operator': 'காகித ஆலை கூழ் தயாரிப்பு உதவியாளர்',
    'Wind Turbine Blade Maintenance Tech': 'காற்றாலை பிளேடு ஆய்வு மற்றும் பராமரிப்பு',
    'Tirunelveli Halwa Clarified Ghee Cooking Master': 'திருநெல்வேலி அல்வா நெய் தயாரிப்பு மாஸ்டர்',
    'Silver Anklet Jewelry Polishing Artisan': 'வெள்ளி கொலுசு மெருகூட்டல் கைவினைஞர்',
    'Sago & Starch Processing Operator': 'ஜவ்வரிசி மற்றும் மரவள்ளிக்கிழங்கு மாவு ஆலை ஆபரேட்டர்',
    'Steel Furnace & Rolling Mill Operation': 'எஃகு உலை மற்றும் உருட்டாலை ஆபரேட்டர்',
    'Railway Locomotive Mechanical Maintenance': 'ரயில்வே இன்ஜின் மெக்கானிக்கல் பராமரிப்பு',
    'High-Pressure Boiler Tube TIG Welding': 'உயர் அழுத்த பாய்லர் டிஐஜி வெல்டர்',
    'Sungudi Cotton Saree Wax Dyeing': 'சுங்குடி காட்டன் புடவை மெழுகு டை கலைஞர்',
    'Madurai Malli Jasmine Stringing & Cold Chain': 'மதுரை மல்லி பூ கட்டுதல் மற்றும் குளிர்பதன பேக்கிங்',
    'Foundry Sand Moulding & Core Casting': 'ஃபவுண்டரி மணல் மோல்டிங் & வார்ப்பு கலைஞர்',
    'Textile Ring Spinning Maintenance': 'ஜவுளி மில் ரிங் ஸ்பின்னிங் பராமரிப்பு',
    'Agricultural Pump Assembly Technician': 'விவசாய மற்றும் மோனோபிளாக் பம்ப் அசெம்பிளி டெக்னீஷியன்',
    'Precision CNC Lathe & Milling Operator': 'துல்லிய CNC லேத் மற்றும் அரைக்கும் இயந்திர ஆபரேட்டர்',
    'Container Logistics': 'கன்டெய்னர் லாஜிஸ்டிக்ஸ்',
    // App header & Global
    appName: 'Talent2Task (திறமை2பணி)',
    regionTag: 'தமிழ்நாடு',
    tagline: 'சரியான திறன்கள். சரியான வேலை. உண்மையான தாக்கம். • தமிழ்நாடு',
    offlineStatus: 'ஆஃப்லைன் SQLite பயன்முறை',
    sqlTerminal: 'SQLite கன்சோல்',
    roleSeeker: 'வேலை தேடுபவர் (Job Seeker)',
    roleRecruiter: 'வேலை வழங்குபவர் (Job Recruiter)',
    switchRole: 'பங்கை மாற்று',
    offlineAlert: 'நீங்கள் ஆஃப்லைனில் உள்ளீர்கள். உங்கள் சேமிக்கப்பட்ட வேலைகள் மற்றும் விவரங்கள் உள்ளூரில் கிடைக்கின்றன.',
    marketDemand: 'சந்தை தேவை',
    notificationsTitle: 'அறிவிப்புகள் & எச்சரிக்கைகள்',
    notificationsSubtitle: 'நேரடி வேலை எச்சரிக்கைகள், பொருத்த பரிந்துரைகள் மற்றும் மதிப்பீடுகள்',
    markAllRead: 'அனைத்தையும் படித்ததாகக் குறிக்கவும்',
    noNotifications: 'தற்போது எந்த அறிவிப்பும் இல்லை.',
    trends: 'போக்குகள்',
    sqlInspector: 'SQL ஆய்வாளர்',
    splitView: 'பிரிவு காட்சி',
    close: 'மூடு',
    cancel: 'ரத்து செய்',
    save: 'சேமிக்க',
    delete: 'நீக்கு',
    add: 'சேர்',
    all: 'அனைத்தும்',
    search: 'தேடு',
    earnings: 'வருமானம்',
    postedDate: 'பதிவிடப்பட்ட தேதி',
    payRate: 'ஊதிய விகிதம்',
    distance: 'தூரம்',
    coordinates: 'ஆயத்தொலைவுகள்',
    gigLocation: 'வேலை இருப்பிடம்',
    postedByRecruiter: 'பணியமர்த்துபவர் விவரம்',
    viewProfile: 'விவரக்குறிப்பைக் காண்க',
    manageProfile: 'விவரக்குறிப்பை நிர்வகி',

    // Login Page
    loginWelcome: 'நல்வரவு',
    loginHeading: 'தொடர உள்நுழையவும்',
    loginSubtitle: 'உங்கள் தளத்தை அணுகவும்.',
    loginSeekerDesc: 'உள்ளூர் வேலைகளைக் கண்டறியவும்',
    loginRecruiterDesc: 'வேலையைப் பதிவிடவும்',
    loginEmailLabel: 'கைபேசி எண் (Mobile Number)',
    loginEmailPlaceholder: '98765 43210',
    loginPasswordLabel: 'கடவுச்சொல்',
    loginPasswordPlaceholder: 'கடவுச்சொல்லை உள்ளிடவும்',
    loginRememberMe: 'என்னை நினைவில் கொள்',
    loginForgotPassword: 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?',
    loginSignInSeeker: 'உள்நுழைக',
    loginSignInRecruiter: 'உள்நுழைக',
    loginNewPrompt: 'Talent2Task-க்கு புதியவரா?',
    loginCreateAccount: 'புதிய கணக்கை உருவாக்கவும்',
    loginHeroTitle1: 'சரியான திறன்கள்.',
    loginHeroTitle2: 'சரியான வேலை.',
    loginHeroTitleHighlight: 'உண்மையான தாக்கம்.',
    loginHeroDesc: 'நம்பகமான உள்ளூர் பகுதி நேர வேலைகளைக் கண்டறியுங்கள் அல்லது திறமையான பணியாளர்களை ஒரே இடத்தில் பணியமர்த்துங்கள்.',
    loginStatRadar: 'நேரடி GPS',
    loginStatRadarSub: 'தமிழ்நாடு ரேடார்',
    loginStatOpp: '24/7',
    loginStatOppSub: 'வாய்ப்புகள்',
    tabSignIn: 'உள்நுழைவு',
    tabCreateAccount: 'கணக்கை உருவாக்கு',
    newUserRegistration: 'புதிய பயனர் பதிவு',
    joinTalent2Task: 'டேலண்ட்2டாஸ்க் தமிழ்நாட்டில் இணையுங்கள்',
    createAccountSubtitle: 'தமிழ்நாடு முழுவதும் உள்ள பகுதிநேர வேலைகளை பெற அல்லது பதிவிட கணக்கை உருவாக்குங்கள்.',
    fullNameLabel: 'முழு பெயர்',
    companyNameLabel: 'நிறுவனம் / வணிக பெயர்',
    fullNamePlaceholder: 'எ.கா. கார்த்திக் ராஜா',
    companyNamePlaceholder: 'எ.கா. தமிழ்நாடு ஃப்ரெஷ் மார்ட்',
    mobilePhoneLabel: 'கைபேசி எண்',
    mobilePhonePlaceholder: '98765 43210',
    ageLabel: 'வயது',
    yearsOfExperienceLabel: 'பணி அனுபவம் (ஆண்டுகள்)',
    cityLabel: 'நகரம் / பகுதி (தமிழ்நாடு)',
    selectVelloreLocation: 'நகரம் / முதன்மை இடத்தை தேர்ந்தெடுக்கவும்',
    selectCity: 'நகரத்தைத் தேர்வுசெய்க',
    useGpsBtn: 'நேரடி ஜிபிஎஸ்',
    gpsPromptTitle: 'அருகிலுள்ள வேலைகளைப் பெற நேரடி ஜிபிஎஸ் இயக்கவும்',
    gpsPromptSubtitle: 'தமிழ்நாடு முழுவதும் உங்களுக்கு மிக அருகில் உள்ள வேலைகளைப் பெற இருப்பிட அனுமதியை வழங்கவும்',
    skillsOffered: 'திறன்கள் மற்றும் சேவைகள்',
    availableTimeSlots: 'கிடைக்கும் நேரங்கள்',
    createSeekerAccountBtn: 'கணக்கை உருவாக்கு',
    createRecruiterAccountBtn: 'கணக்கை உருவாக்கு',
    alreadyRegisteredPrompt: 'ஏற்கனவே பதிவு செய்துள்ளீர்களா?',
    signInNowBtn: 'இப்போது உள்நுழையவும்',
    orSignInRegistered: '',
    sqliteSavedFeature: 'SQLite தரவுத்தளத்தில் உடனடியாக சேமிக்கப்பட்டது',
    radar3kmFeature: 'நேரடி ஜிபிஎஸ் & நகர ரேடார் பொருத்தம்',
    exploreGigsTab: 'வேலைகளைத் தேடுங்கள்',
    manageGigsTab: 'பதிவிட்டு நிர்வகிக்கவும்',
    postGigTab: 'வேலையைப் பதிவிடவும்',

    // Seeker Tab
    radarHeading: 'நேரடி வேலை ரேடார் (தமிழ்நாடு)',
    radarSubtitle: 'உங்களுக்கு மிக அருகில் உள்ள பகுதி நேர வேலைகளைக் கண்டறியவும்',
    withinRadius: 'சுற்றளவிற்குள்',
    radiusSlider: 'தூர வடிகட்டி',
    allVellore: 'முழு தமிழ்நாடு',
    matchScore: 'பொருத்தம்',
    claimJobBtn: 'வேலையை ஏற்றுக்கொள்',
    claimedBadge: 'நீங்கள் ஏற்றுக்கொண்டவை',
    claimedOtherBadge: 'ஒதுக்கப்பட்டது',
    completedBadge: 'முடிக்கப்பட்டது',
    jobDetailsTitle: 'வேலை விவரங்கள் மற்றும் தொடர்பு',
    directionsBtn: 'வழிப்பாதை காண்க',
    directionsModalTitle: 'வேலைக்கான வழிப்பாதை & வரைபடம்',
    directionsModalSubtitle: 'துல்லியமான GPS வழிகாட்டல் & நேரலை பாதை',
    yourLocationLabel: 'நீங்கள் இருக்கும் தொடக்க இடம்',
    gigLocationLabel: 'வேலை நடைபெறும் இடம்',
    startNavigationBtn: 'Google Maps வழிசெலுத்தலைத் தொடங்கு',
    openGoogleMapsBtn: 'Google Maps GPS',
    openAppleMapsBtn: 'Apple Maps',
    onMyWayBtn: 'நான் கிளம்பிவிட்டேன் (On My Way)',
    onMyWayAlertSent: 'பணியளிப்பவருக்கு வருகை நேரம் தெரிவிக்கப்பட்டது!',
    travelModeBike: 'இருசக்கர வாகனம் (பைக்)',
    travelModeCar: 'கார் / டாக்ஸி',
    travelModeAuto: 'ஆட்டோ / போக்குவரத்து',
    travelModeWalk: 'நடந்து செல்லுதல்',
    liveGpsAccurate: 'துல்லியமான GPS இருப்பிடம் இயக்கத்தில் உள்ளது',
    estimatedArrival: 'பயண கால அளவு',
    turnByTurnGuide: 'வழிகாட்டுதல் குறிப்புகள்',
    readyToGoBanner: 'கிளம்பத் தயாரா? வேலைக்கான நேரலை GPS வழிப்பாதையைப் பெறுங்கள்',
    callRecruiterBtn: 'அழைக்கவும்',
    whatsappRecruiterBtn: 'வாட்ஸ்அப்',
    myGigsTab: 'என் வேலைகள்',
    allGigsTab: 'உள்ளூர் வேலைகள்',
    mapViewTab: 'வரைபட ரேடார்',
    listViewTab: 'பட்டியல் காட்சி',
    profileBtn: 'என் விவரக்குறிப்பு & GPS',
    gigsFound: 'வேலைகள் கிடைத்தன',
    changeLocation: 'மாற்று',
    sortBy: 'வரிசைப்படுத்து:',
    sortMatchScore: '🔥 பொருத்த மதிப்பெண்',
    sortDistance: '⚡ தூரம் (அருகில்)',
    sortHighestPay: '💰 அதிக ஊதியம்',
    payout: 'ஊதியம்',
    proximity: 'தொலைவு',
    claiming: 'ஏற்கப்படுகிறது...',
    overall: 'மொத்தம்',
    noClaimedGigsTitle: 'இன்னும் வேலைகள் ஏற்றுக்கொள்ளப்படவில்லை',
    noClaimedGigsDesc: 'காட்பாடி, சிஎம்சி மற்றும் வேலூரில் உடனடி வேலைகளை ஏற்க 3 கிமீ நேரடி ரேடாரை ஆராயுங்கள்.',
    myClaimedSubtitle: 'ஏற்றுக்கொண்ட வேலைகளைக் கண்காணித்து உள்ளூர் பணியமர்த்துபவரைத் தொடர்பு கொள்ளவும்',

    // Profile Modal
    profileTitle: 'பயனர் விவரம் மற்றும் இருப்பிடம்',
    profileDesc: 'அதிக வேலைப் பொருத்தத்தைப் பெற உங்கள் திறன்கள் மற்றும் நேரத்தைத் தேர்வுசெய்க',
    fullName: 'முழு பெயர்',
    age: 'வயது',
    phoneNumber: 'தொலைபேசி எண் (வாட்ஸ்அப் உடன்)',
    mySkills: 'எனது திறன்கள் (பொருத்தமானவற்றைத் தேர்வுசெய்க)',
    skillsSelected: 'தேர்ந்தெடுக்கப்பட்டது',
    addCustomSkillPlaceholder: 'பிற திறனைச் சேர்க்கவும் (எ.கா: எலக்ட்ரீஷியன், டியூஷன்)...',
    myAvailability: 'கிடைக்கும் நேரம்',
    myLocation: 'தற்போதைய இருப்பிடம் / GPS',
    useCurrentGps: 'நேரடி GPS பெறுக',
    locating: 'கண்டறிகிறது...',
    selectLandmark: 'முக்கிய இடத்தை தேர்வு செய்யவும்',
    saveProfileBtn: 'விவரங்களைச் சேமித்து ரேடாரைப் புதுப்பிக்கவும்',

    // Recruiter Profile Location Details
    doorNoLabel: 'கதவு / கடை / வளாக எண்',
    doorNoPlaceholder: 'எ.கா. கதவு எண் 14/B, 2வது மாடி',
    streetNameLabel: 'தெரு பெயர் / சாலை / பகுதி',
    streetNamePlaceholder: 'எ.கா. அண்ணா சாலை, காந்தி தெரு',
    cityOrDistrictLabel: 'நகரம் அல்லது மாவட்டம்',
    landmarkFieldLabel: 'அடையாள இடம் (முக்கிய மையம்)',
    landmarkFieldPlaceholder: 'எ.கா. பேருந்து நிலையம் அருகில் / வங்கி எதிரில்',
    workplaceAddressLabel: 'முழு பணியிட முகவரி (வரைபட வழிகாட்டுதல்)',
    workplaceAddressHint: 'உங்கள் வேலைகளை ஏற்கும் பணியாளர்கள் இந்த பணியிட முகவரிக்கு நேரடி வரைபட வழிகாட்டுதலைப் பெறுவார்கள்.',
    recruiterLocationTitle: 'பணியிட & வணிக இருப்பிடம்',
    recruiterLocationSubtitle: 'துல்லியமான வரைபட வழிகாட்டலுக்கு கதவு எண், தெரு, அடையாளம் மற்றும் மாவட்டத்தை நிர்வகிக்கவும்',

    // Phase 35 — Payment Feature UI Terminology
    payNowBtn: 'இப்போது செலுத்துக',
    paymentSuccessful: 'பணம் செலுத்துதல் வெற்றிகரமாக முடிந்தது',
    paymentReceived: 'பணம் பெறப்பட்டது',
    processingPayment: 'பணம் செலுத்தப்படுகிறது...',
    paymentCompleted: 'பணம் செலுத்துதல் முடிந்தது',
    paidStatus: 'செலுத்தப்பட்டது',

    // Skill Gap & AI Recommendations
    skillGapTitle: 'AI திறன் இடைவெளி & தொழில் பரிந்துரைகள்',
    skillGapBadge: '+35% பொருத்த மதிப்பெண் உயர்வு',
    skillGapDesc: 'முக்கிய வேலைகளில் 90%+ பொருத்த மதிப்பெண்ணைப் பெற இந்த அதிக தேவை கொண்ட திறன்களை உங்கள் விவரக்குறிப்பில் சேர்க்கவும்.',
    addToMySkills: 'எனது திறன்களில் சேர்',
    neededInGigs: 'தேவைப்படும் வேலைகள்:',
    allStarTitle: 'சிறந்த திறன் விவரக்குறிப்பு!',
    allStarDesc: 'அருகிலுள்ள வேலைகளில் கேட்கப்படும் அனைத்து திறன்களையும் உங்கள் விவரக்குறிப்பு கொண்டுள்ளது.',

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
    skillGapAddSkillBtn: 'என் திறன்களில் சேர்',

    // Recruiter Portal
    recruiterHeading: 'பணியமர்த்துபவர் கட்டுப்பாட்டு மையம்',
    recruiterSubtitle: 'காட்பாடி, சி.எம்.சி, வி.ஐ.டி மற்றும் வேலூரில் வேலைகளைப் பதிவிடவும்',
    activeRecruiter: 'செயலில் உள்ள பணியமர்த்துபவர்',
    postNewGigBtn: 'புதிய வேலை இடுக',
    postedGigsCount: 'பதிவிடப்பட்ட வேலைகள்',
    statusOpen: 'ஏற்றுக்கொள்ள தயார்',
    statusClaimed: 'ஏற்றுக்கொள்ளப்பட்டது',
    statusCompleted: 'பணி நிறைவடைந்தது',
    markCompletedBtn: 'பணி முடிந்தது என குறிக்க',
    deleteGigBtn: 'வேலையை நீக்கு',
    claimantDetails: 'பணியாளர் விவரங்கள்',
    noClaimantYet: 'வேலை தேடுபவர் ஏற்பிற்காக காத்திருக்கிறது',
    rateClaimantBtn: 'மதிப்பீடு வழங்குக',
    callClaimantBtn: 'அழை',
    whatsappClaimantBtn: 'வாட்ஸ்அப்',
    allGigsFilter: 'அனைத்து வேலைகள்',
    metricTotalGigs: 'மொத்த வேலைகள்',
    metricOpenGigs: 'திறந்தவை (தேடலில்)',
    metricAssignedGigs: 'ஒதுக்கப்பட்டவை',
    metricCompletedGigs: 'முடிந்தவை',
    noRecruiterGigs: 'நீங்கள் இன்னும் வேலைகளைப் பதிவிடவில்லை. தொடங்க "புதிய வேலை இடுக" என்பதை கிளிக் செய்யவும்!',

    // Post Gig Form
    postModalTitle: 'உள்ளூர் வேலை பதிவிடுதல்',
    postModalSubtitle: 'ரேடாரில் உடனடியாகக் கண்டறிய உள்ளூர் வேலையைப் பதிவிடவும்',
    jobTitleLabel: 'வேலை தலைப்பு',
    jobTitlePlaceholder: 'எ.கா: டெலிவரி உதவியாளர், கடை பில்லிங், நிகழ்வு உதவி',
    categoryLabel: 'பிரிவு',
    descriptionLabel: 'விளக்கம் மற்றும் வழிகாட்டுதல்கள்',
    descriptionPlaceholder: 'செய்ய வேண்டிய வேலை, நேரம் மற்றும் தொடர்பு இடம் குறித்து விளக்குக...',
    payoutLabel: 'ஊதியம் (₹)',
    payoutUnitLabel: 'ஊதிய வகை',
    perHour: 'மணிக்கு',
    perTask: 'பணிக்கு',
    perShift: 'ஷிஃப்ட்டிற்கு',
    perDay: 'நாளுக்கு',
    requiredSkillsLabel: 'தேவைப்படும் திறன்கள்',
    landmarkAreaLabel: 'பகுதி / இடம்',
    clickMapInstruction: 'சரியான இடத்தை தேர்ந்தெடுக்க வரைபடத்தில் கிளிக் செய்யவும் அல்லது தேர்வு செய்யவும்',
    publishJobBtn: 'வேலையை வெளியிடுக',

    // Categories
    catDelivery: 'டெலிவரி மற்றும் போக்குவரத்து',
    catStoreHelper: 'கடை உதவியாளர் & சில்லறை வர்த்தகம்',
    catDataEntry: 'தரவு உள்ளீடு & அலுவலகம்',
    catEventHand: 'நிகழ்வு மற்றும் கேட்டரிங்',
    catTutoring: 'பயிற்றுவிப்பு & கல்வி உதவி',
    catElectrical: 'தொழில்நுட்பம் & பராமரிப்பு',

    // Filter & Search
    searchPlaceholder: 'வேலை, திறன் அல்லது பகுதியைத் தேடுங்கள்...',
    categoryFilter: 'பிரிவு',
    allCategories: 'அனைத்து பிரிவுகளும்',
    minPayFilter: 'குறைந்தபட்ச ஊதியம் (₹)',
    noJobsFound: 'தேர்ந்தெடுக்கப்பட்ட தூரத்திற்குள் வேலைகள் இல்லை. ரேடார் தூரத்தை அதிகரிக்கவும்!',

    // Match breakdown
    breakdownTitle: 'பொருத்த மதிப்பெண் விவரம்',
    skillFit: 'திறன் பொருத்தம்',
    distanceFit: 'தூர பொருத்தம்',
    scheduleFit: 'நேரப் பொருத்தம்',
    matchedSkillsLabel: 'பொருந்திய திறன்கள்',
    missingSkillsLabel: 'இல்லாத திறன்கள்',

    // Hybrid AI Matching & Explainability
    whyRecommended: 'இந்த வேலை ஏன் பரிந்துரைக்கப்படுகிறது?',
    hybridMatchBreakdown: 'ஹைப்ரிட் AI பொருத்த விவரம்',
    skillSimilarityLabel: 'திறன் ஒற்றுமை',
    distanceFactorLabel: 'தூரம்',
    availabilityFactorLabel: 'நேரப் பொருத்தம்',
    experienceFactorLabel: 'அனுபவம்',
    localDemandFactorLabel: 'உள்ளூர் தேவை',
    reliabilityFactorLabel: 'நம்பகத்தன்மை',

    // Phase 3 — NLP Requirement Understanding
    aiRequirementAssistant: 'AI தேவை பகுப்பாய்வு உதவியாளர்',
    aiFastDraftTitle: 'இயற்கை மொழியில் விரைவு வரைவு',
    aiInputPlaceholder: 'உதாரணமாக: சிவகாசி அல்லது மதுரை அருகில் அனுபவமிக்க பணியாளர் தேவை...',
    extractWithAiBtn: 'AI மூலம் பகுப்பாய்வு செய்',
    analyzingWithAi: 'பகுப்பாய்வு செய்கிறது...',
    extractedDetailsTitle: 'AI கண்டறிந்த விவரங்கள் — சரிபார்த்து திருத்தவும்',
    extractedDetailsSubtitle: 'படிவத்தில் சேர்க்கும் முன் விவரங்களை சரிபார்த்து திருத்திக் கொள்ளலாம்',
    applyExtractedBtn: 'படிவத்தில் சேர்',
    dismissExtractedBtn: 'அழி',
    detectedIntent: 'நோக்கம்',
    hiringWorkerIntent: 'பணியாளர் நியமனம்',
    detectedExperience: 'அனுபவம்',
    detectedShift: 'நேர / பணி முறை',
    detectedLocation: 'இடம்',
    detectedPayout: 'ஊதியம்',
    missingInformationAlert: 'கவனத்திற்குரியவை',
    confirmBeforePostNotice: 'உங்கள் உறுதிப்படுத்தல் இல்லாமல் AI தகவல்கள் பதிவிடப்படாது. சரிபார்க்கவும்.',
    aiSearchParsed: 'AI மொழித் தேடல்',
    // Phase 6 — Voice & Multilingual AI
    voiceSearchBtn: 'குரல் தேடல்',
    voiceFastDraftBtn: 'தேவையை பேசுங்கள்',
    voiceListening: 'கேட்கிறது... இப்போது பேசுங்கள்',
    voiceListeningPrompt: 'தமிழ், தெலுங்கு, இந்தி அல்லது ஆங்கிலத்தில் பேசவும் அல்லது தட்டச்சு செய்யவும்',
    voicePermissionDenied: 'மைக்ரோஃபோன் அணுகல் தடுக்கப்பட்டது',
    voicePermissionHelp: 'உலாவி அமைப்புகளில் மைக்ரோஃபோன் அனுமதியை இயக்கவும் அல்லது மாதிரி குரல் உள்ளீடுகளை முயற்சிக்கவும்.',
    voiceUnsupported: 'குரல் அறிதல் ஆதரிக்கப்படவில்லை',
    voiceUnsupportedHelp: 'உங்கள் உலாவி Web Speech API-ஐ ஆதரிக்கவில்லை. தயவுசெய்து தட்டச்சு செய்யவும்.',
    voiceSamplePhrases: 'குரல் AI மாதிரி உள்ளீடுகள்',
    voiceTrySample: 'மாதிரி குரலை முயற்சிக்கவும்',
    voiceProcessing: 'குரல் செயலாக்கப்படுகிறது...',
    aiMultilingualActive: 'AI பன்மொழி & குரல் செயலில் உள்ளது',
    aiLanguageDetected: 'மொழி கண்டறியப்பட்டது',
    // Phase 7 — Trust & Safety
    trustSafetyTitle: 'நம்பகத்தன்மை & பாதுகாப்பு மதிப்பீடு',
    trustPotentialRisk: 'சாத்தியமான இடர் கண்டறியப்பட்டது',
    trustVerifiedRecruiter: 'சரிபார்க்கப்பட்ட பணியமர்த்துபவர்',
    trustStandardVerification: 'நிலையான சரிபார்ப்பு',
    trustVerifiedListing: 'சரிபார்க்கப்பட்ட பட்டியல்',
    trustNewRecruiterNote: 'புதிய பணியமர்த்துபவர் கணக்கு — நிலையான பாதுகாப்பு சோதனைகள் தேர்ச்சி பெற்றன. வேலைகள் முடிவடையும்போது மதிப்பீடுகள் உயரும்.',
    trustReportJobBtn: 'புகாரளிக்கவும்',
    trustReportModalTitle: 'வேலை வாய்ப்பைப் புகாரளிக்கவும்',
    trustReportSuccessTitle: 'புகார் பரிசீலனைக்கு பதிவு செய்யப்பட்டது',
    trustNoAutoBanNotice: 'தவறான பயன்பாட்டைத் தடுக்க, புகார்கள் அல்லது AI வழிமுறைகளின் அடிப்படையில் பயனர்கள் ஒருபோதும் தானாகத் தடை செய்யப்படுவதில்லை.',

    // Phase 8 — Reliability & Continuous Feedback
    workerReliabilityTitle: 'பணியாளர் நம்பகத்தன்மை & நற்பெயர்',
    reliabilityScoreLabel: 'நம்பகத்தன்மை மதிப்பெண்',
    reliabilityTierLabel: 'நற்பெயர் நிலை',
    completionRateLabel: 'பணி நிறைவு விகிதம்',
    continuousFeedbackLabel: 'தொடர்ச்சியான பின்னூட்ட சுழற்சி',
    verifiedReviewsLabel: 'சரிபார்க்கப்பட்ட மதிப்பாய்வுகள்',
    newWorkerBaselineNote: 'புதிய பணியாளர் அடிப்படை நிலை — Talent2Task இல் பணி வரலாற்றை உருவாக்குகிறது.',

    // Community Demand Modal
    demandModalTitle: 'சமூக தேவை மற்றும் திறன் போக்குகள்',
    demandModalSubtitle: 'உண்மையான வேலை தரவு மூலம் தற்போதைய மற்றும் எதிர்காலத் தேவைக் கணிப்பு',
    demandRegionBadge: 'தமிழ்நாடு நிகழ்நேர AI ரேடார்',
    topInDemandRole: 'அதிக தேவை கொண்ட வேலை',
    avgHourlyPayout: 'சராசரி மணிநேர ஊதியம்',
    peakHiringWindows: 'அதிக வேலைவாய்ப்பு நேரங்கள்',
    hourlyPaySub: 'அன்றைய தினமே உடனடி ஊதியம்',
    peakHiringSub: 'நெகிழ்வான பகுதி நேர ஷிப்டுகள்',
    skillDemandRanking: 'தேவைப்படும் திறன்கள் மற்றும் ஊதிய விகிதம்',
    openGigsSuffix: 'திறந்த வேலைகள்',
    topAreaLabel: 'முக்கிய பகுதி:',
    growthLabel: 'வளர்ச்சி:',
    demandActualTitle: 'தற்போதைய உள்ளூர் தேவை',
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

    // Feedback Modal
    feedbackTitle: 'அனுபவத்தை மதிப்பிட்டு விமர்சனம் செய்க',
    feedbackSubtitle: 'சமூக நம்பிக்கையை வளர்க்கவும் எதிர்கால AI பொருத்தத்தை மேம்படுத்தவும் உதவுங்கள்',
    ratingScoreLabel: 'ஒட்டுமொத்த மதிப்பீடு',
    feedbackTagsLabel: 'எது சிறப்பாக இருந்தது?',
    commentLabel: 'விரிவான கருத்துக்கள்',
    commentPlaceholder: 'நேரம் தவறாமை, திறன் துல்லியம் மற்றும் பணித்தரம் பற்றிய விவரங்களைப் பகிரவும்...',
    submitReviewBtn: 'மதிப்பீட்டைச் சமர்ப்பிக்கவும்',

    // SQLite Console Modal
    sqlConsoleTitle: 'SQLite உலாவி WASM கன்சோல்',
    sqlConsoleSubtitle: 'உள்ளூர் ஆஃப்லைன் SQLite தரவுத்தளத்தில் வினவல்களை இயக்கவும்',
    sqlEngineBadge: 'SQLite 3 இன்ஜின் செயலில் உள்ளது',
    presetQueriesLabel: 'முன் அமைக்கப்பட்ட SQL வினவல்கள்',
    executeBtn: 'வினவலை இயக்கு',
    exportBtn: 'தரவுத்தளத்தை ஏற்றுமதி செய்',
    resetBtn: 'தரவை மீட்டமைக்க',
    execTime: 'இயக்க நேரம்',
    rowsReturned: 'வரிசைகள் கிடைத்தன',
    noResults: 'வினவல் வெற்றிகரமாக இயங்கியது, முடிவுகள் எதுவும் இல்லை.',

    // Footer & Toasts
    footerTagline: 'சரியான திறமை. சரியான பணி. உண்மையான தாக்கம்.',
    footerEngineDesc: 'உள்ளூர் பகுதி நேர வேலை தேடுபொறி — தமிழ்நாடு',
    toastClaimSuccess: '🎉 வேலை ஏற்றுக்கொள்ளப்பட்டது! பணியமர்த்துபவருக்கு தொடர்பு விவரங்கள் பகிரப்பட்டன.',
    toastStatusUpdated: 'நிலை மாற்றப்பட்டது:',
    toastJobDeleted: 'வேலை நீக்கப்பட்டது.',
    toastJobPosted: '🚀 புதிய வேலை பதிவிடப்பட்டது மற்றும் தமிழ்நாடு ரேடாரில் நேரலையில் உள்ளது!',
    toastProfileUpdated: '✅ சுயவிவரம் மற்றும் GPS புதுப்பிக்கப்பட்டது.',
    toastSkillAdded: 'சேர்க்கப்பட்டது! AI பொருத்த மதிப்பெண் மறு கணக்கீடு செய்யப்பட்டது.',
    toastReviewSaved: '⭐ மதிப்பீடு சேமிக்கப்பட்டது! சமூக நம்பிக்கை புதுப்பிக்கப்பட்டது.',
    nextStepBtn: 'அடுத்து',
    backStepBtn: 'பின்செல்',
    stepAccountInfo: '1. கணக்கு விவரங்கள்',
    stepLocationExperience: '2. அனுபவம் & இருப்பிடம்',
    stepLocationDetails: '2. இருப்பிட விவரங்கள்',
    selectRoleLabel: 'உங்கள் பங்கை தேர்ந்தெடுக்கவும்',
    phoneExact10DigitsError: 'சரியாக 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.',
    passwordRegexError: 'கடவுச்சொல் 8-12 எழுத்துகள் நீளமாகவும், குறைந்தது ஒரு எண் மற்றும் ஒரு சிறப்பு குறியீட்டுடனும் இருக்க வேண்டும்.',
    passwordRegexHint: '8-12 எழுத்துகள், குறைந்தது 1 எண் & 1 சிறப்பு குறியீடு'
  },

  hi: {
    'Turmeric Root Sun-Drying & Bagging Hand': 'மஞ்சள் கிழங்கு உலர்த்துதல் மற்றும் மூட்டை கட்டுதல்',
    'Parboiled Rice Huller Mill Operator': 'புழுங்கல் அரிசி ஆலை ஹல்லர் ஆபரேட்டர்',
    'Sugar Mill Sugarcane Crusher Feeder': 'கள்ளக்குறிச்சி சர்க்கரை ஆலை கரும்பு அரவை ஆபரேட்டர்',
    'Shallot (Small Onion) Grading Sorter': 'சின்ன வெங்காயம் தரம் பிரித்து பேக்கிங் செய்பவர்',
    'Gypsum Mineral Processing Helper': 'ஜிப்சம் கனிம செயலாக்க உதவியாளர்',
    'Hybrid Maize Seed Sorting Specialist': 'பெரம்பலூர் மக்காச்சோள விதை தரம் பிரிக்கும் நிபுணர்',
    'Groundnut Decorticator & Oil Extraction Operator': 'மணப்பாறை நிலக்கடலை எண்ணெய் ஆலை எக்ஸ்பெல்லர்',
    'Synthetic Gemstone Faceting & Lapidary Polisher': 'செயற்கை வைர மற்றும் ரத்தின பாலிஷிங் கலைஞர்',
    'Irrigation Canal Sluice Gate Maintenance Hand': 'பாசன கால்வாய் மதகு பராமரிப்பு உதவியாளர்',
    'Tiruvarur Chariot Silk Border Weaving Artisan': 'திருவாரூர் ஆழித்தேர் பட்டு பார்டர் நெசவு கலைஞர்',
    'Certified Paddy Seed Moisture & Purity Sorter': 'சான்றளிக்கப்பட்ட நெல் விதை ஈரப்பதம் மற்றும் தூய்மை பரிசோதகர்',
    'Traditional Cotton Dhoti Handloom Weaver': 'பாரம்பரிய காட்டன் வேட்டி கைத்தறி நெசவாளர்',
    'Coastal Shrimp Hatchery Water Quality Tech': 'கடலோர இறால் குஞ்சு பொரிப்பக நீர் தர தொழில்நுட்ப வல்லுநர்',
    'Raw Cashew Decortication & Roasting Sorter': 'முந்திரி வறுத்தல் மற்றும் உடைக்கும் தரம் பிரிப்பவர்',
    'Limestone Quarry Mining Equipment Hand': 'சுண்ணாம்புக்கல் சுரங்க உபகரண உதவியாளர்',
    'Cement Rotary Kiln Monitoring Operator': 'அரியலூர் சிமெண்ட் சுழல் உலை கண்காணிப்பு ஆபரேட்டர்',
    'Automotive Sub-Assembly Line Fitter': 'மறைமலைநகர் கார் அசெம்பிளி லைன் பிட்டர்',
    'IT Server Room Power & HVAC Tech': 'மகிந்திரா வேர்ல்ட் சிட்டி சர்வர் ரூம் பவர் & ஏசி டெக்னீஷியன்',
    'Defense Vehicle Spare Quality Checker': 'ஆவடி ராணுவ வாகன உதிரிபாக தர பரிசோதகர்',
    'Heavy Metal Forging Drop-Hammer Operator': 'கும்மிடிப்பூண்டி கனரக மெட்டல் போForging ஆபரேட்டர்',
    'Tannery Drum Processing Operator': 'தோல் பதனிடும் மர டிரிரம் ஆபரேட்டர்',
    'Shoe Upper Zig-Zag Sewing Tailor': 'ஆம்பூர் தோல் காலணி தையல் மாஸ்டர்',
    'Railway Freight Transshipment Loader': 'ஜோலார்பேட்டை ரயில்வே சரக்கு டிரான்ஸ்ஷிப்மென்ட் உதவியாளர்',
    'Industrial Boiler Water Chemistry Tech': 'தொழில்துறை பாய்லர் நீர் வேதியியல் தொழில்நுட்ப வல்லுநர்',
    'Leather Shoe Upper Clicking & Skiving': 'தோல் காலணி மேல் பகுதி கட்டிங் & ஸ்கைவிங்',
    'High Voltage Switchyard Electrician': 'உயர் மின்னழுத்த சுவிட்ச்யார்டு எலக்ட்ரீசியன்',
    'Thermal Power Plant Maintenance Tech': 'அனல் மின் நிலைய பராமரிப்பு தொழில்நுட்ப வல்லுநர்',
    'Lignite Bucket Wheel Excavator Operator': 'நிலக்கரி பக்கெட் வீல் அகழ்வாராய்ச்சி ஆபரேட்டர்',
    'Plum & Pear Orchard Harvest Hand': 'பிளம்ஸ் மற்றும் பேரிக்காய் பறிக்கும் உதவியாளர்',
    'Homemade Chocolate Tempering Artisan': 'கொடைக்கானல் சாக்லேட் தயாரிப்பாளர்',
    'Timber Sawmill Machine Operator Helper': 'மரம் அறுக்கும் ஆலை இயந்திர உதவியாளர்',
    'Coir Pith Block Press Machine Operator': 'தேங்காய் நார் கழிவு பிரிக் கட்டை பிரஸ் ஆபரேட்டர்',
    'Tender Coconut Wholesale Sorting Specialist': 'பொள்ளாச்சி இளநீர் மட்டை உறித்தல் மற்றும் தரம் பிரித்தல்',
    'Temple Border Silk Dhoti Handloom Weaver': 'கோவில் பட்டு வேட்டி கைத்தறி நெசவாளர்',
    'Kumbakonam Degree Coffee Roaster & Barista': 'கும்பகோணம் டிகிரி காபி வறுக்கும் மாஸ்டர்',
    'Brass Temple Lamp (Kuthuvilakku) Artisan': 'பித்தளை குத்துவிளக்கு மற்றும் மணி கைவினைஞர்',
    'Chettinad Traditional Spice & Catering Master': 'செட்டிநாடு பாரம்பரிய சமையல் மற்றும் மசாலா மாஸ்டர்',
    'Athangudi Handmade Floor Tile Artisan': 'ஆத்தங்குடி பாரம்பரிய தரை ஓடு கைவினைஞர்',
    'Traditional Pottery & Musical Ghatam Maker': 'மானாமதுரை கடம் மற்றும் மண்பாண்ட கலைஞர்',
    'Graphite Mining Processing Helper': 'கிராஃபைட் தாது மிதவை ஆலை உதவியாளர்',
    'Seashell & Conch Handicraft Artisan': 'சங்கு மற்றும் சிப்பி கைவினைப் பொருட்கள் செதுக்குபவர்',
    'Island Pilgrimage Transit Coordinator': 'ராமேஸ்வரம் தீவு யாத்ரீகர்கள் உதவி ஒருங்கிணைப்பாளர்',
    'Solar PV Array Maintenance & Cleaning Tech': 'சூரிய மின் தகடு சுத்தம் மற்றும் பராமரிப்பு',
    'Dry Fish Salt-Curing & Solar Drying Specialist': 'கருவாடு உப்பு பதனிடுதல் மற்றும் சோலார் உலர் கூட உதவியாளர்',
    'Palm Jaggery (Karupatti) Boiling Master': 'பனை கருப்பட்டி காய்ச்சும் மாஸ்டர்',
    'Banana Fiber Extraction Machine Hand': 'வாழை நார் பிரித்தெடுக்கும் இயந்திர ஆபரேட்டர்',
    'Bodinayakanur Cardamom Auction Sorter': 'போடிநாயக்கனூர் ஏலக்காய் ஏல தரம் பிரிப்பவர்',
    'Cumbum Valley Grape Harvesting Specialist': 'கம்பம் பள்ளத்தாக்கு திராட்சை அறுவடை நிபுணர்',
    'Country Sugar (Nattu Sakkarai) Maker': 'நாட்டு சர்க்கரை தயாரிப்பாளர்',
    'Cotton Ginning Saw Machine Operator': 'பருத்தி பஞ்சு பிரித்தெடுக்கும் இயந்திர ஆபரேட்டர்',
    'Courtallam Season Tourism Assistant': 'குற்றாலம் சீசன் சுற்றுலா மற்றும் வழிகாட்டுதல்',
    'Wholesale Grain Mandi Logistics Handler': 'தானிய மண்டி மூட்டை தூக்குதல் மற்றும் தைத்தல்',
    'Oil Mill Expeller & Filter Press Operator': 'எண்ணெய் ஆலை எக்ஸ்பெல்லர் மற்றும் பில்டர் பிரஸ் ஆபரேட்டர்',
    'Wholesale Red Chilli & Spice Grader': 'மொத்த மிளகாய் மற்றும் மசாலா தரம் பிரிப்பவர்',
    'Sugar Mill Processing Operator': 'சர்க்கரை ஆலை செயலாக்க ஆபரேட்டர்',
    'Raw Cashew Decorticator Machine Operator': 'பச்சை முந்திரி பருப்பு உடைக்கும் இயந்திர ஆபரேட்டர்',
    'Arani Silk Saree Handloom Weaver': 'ஆரணி பட்டு சேலை கைத்தறி நெசவாளர்',
    'Traditional Wood Ghani Oil Press Operator': 'பாரம்பரிய மரச்செக்கு நல்லெண்ணெய் ஆலை ஆபரேட்டர்',
    'Girivalam Pilgrim Logistics Coordinator': 'கிரிவலம் பக்தர் சேவை மற்றும் அன்னதான ஒருங்கிணைப்பாளர்',
    'Granite Gangsaw Block Slicing Operator': 'கிரானைட் கேங்சா கல் அறுக்கும் ஆபரேட்டர்',
    'Floriculture Flower Sorter & Stringer': 'மலர் மாலை கட்டுதல் மற்றும் தரம் பிரித்தல்',
    'Mango Pulp Industrial Canning Operator': 'மாம்பழ கூழ் கேனிங் மற்றும் பாஸ்டுரைசேஷன் ஆபரேட்டர்',
    'Sericulture Silkworm Cocoon Rearing Hand': 'பட்டுப்புழு வளர்ப்பு மற்றும் கூடு அறுவடை உதவியாளர்',
    'Marine Fish Salting & Sun-Curing Hand': 'கருவாடு உப்பு பதனிடுதல் மற்றும் உலர்த்துதல்',
    'Cashew Decortication & Oven Roasting Operator': 'முந்திரி கொட்டை உடைத்தல் மற்றும் வறுக்கும் ஆபரேட்டர்',
    'Lignite Mine Conveyor Maintenance Tech': 'நெய்வேலி நிலக்கரி கன்வேயர் பெல்ட் பராமரிப்பு',
    'Harbor Fish Auction Sorting & Ice Packing': 'மீன்பிடி துறைமுக ஏல மீன் வகைப்படுத்துதல் மற்றும் ஐஸ் பேக்கிங்',
    'Deep-Sea Trawler Net Rigging & Deck Hand': 'ஆழ்கடல் மீன்பிடி படகு வலை கட்டும் டெக் குழு',
    'Deep Borewell Rig Machinery Operation': 'ஆழ்துளை கிணறு ரிக் இயந்திர ஆபரேட்டர்',
    'Heavy Lorry Chassis & Cabin Welding Tech': 'லாரி சேஸ் மற்றும் கேபின் வெல்டர்',
    'Commercial Poultry Egg Grading Specialist': 'வணிக கோழிப்பண்ணை முட்டை தரம் பிரிக்கும் நிபுணர்',
    'Yarn Dyeing & Hydro-Extraction Operator': 'நூல் சாயம் ஏற்றுதல் மற்றும் நீர் நீக்கும் ஆபரேட்டர்',
    'Commercial Bus Body MIG Welding Tech': 'பேருந்து பாடி பில்டிங் எம்ஐஜி வெல்டர்',
    'Home Textile Jacquard Linen Weaving Tech': 'வீட்டு ஜவுளி ஜாக்கார்டு லினன் நெசவாளர்',
    'Tannery Leather Buffing & Trimming Tech': 'தோல் பதனிடும் பஃபிங் மற்றும் டிரிம்மிங் டெக்னீஷியன்',
    'Sirumalai Mountain Banana & Cardamom Sorter': 'சிறுமலை மலை வாழைப்பழம் மற்றும் ஏலக்காய் தரம் பிரிப்பவர்',
    'Handcrafted Brass Lock Assembly Artisan': 'திண்டுக்கல் பித்தளை பூட்டு அசெம்பிளி கைவினைஞர்',
    'Hill Vegetable & Fruit Cold Packing Hand': 'மலைத்தோட்ட காய்கறி மற்றும் பழ பேக்கிங்',
    'Eucalyptus Essential Oil Distillation Worker': 'நீலகிரி தைல மர எண்ணெய் காய்ச்சி வடித்தல்',
    'Orthodox Tea Plucking & Processing Hand': 'தேயிலை கொழுந்து பறித்தல் மற்றும் பதப்படுத்துதல்',
    'Auto Sheet Metal Stamping Press Operator': 'வாகன உதிரிபாக ஸ்டாம்பிங் பிரஸ் ஆபரேட்டர்',
    'SMT Electronics Component Inspection': 'SMT எலக்ட்ரானிக்ஸ் போர்டு ஆய்வாளர்',
    'Kanchipuram Pure Silk Zari Weaving Master': 'காஞ்சிபுரம் பட்டு ஜரிகை நெசவு மாஸ்டர்',
    'Floriculture Dutch Rose Export Harvest Hand': 'டச்சு ரோஜா மலர் ஏற்றுமதி அறுவடை உதவியாளர்',
    'Precision Tool & Die Machine Operator': 'துல்லிய கருவி மற்றும் டை இயந்திர ஆபரேட்டர்',
    'EV Battery Module Assembly & Spot Welding': 'மின்சார வாகன பேட்டரி மாட்யூல் ஸ்பாட் வெல்டர்',
    'Fireworks Pyro-Mixing & Safety Fuse Setting': 'பட்டாசு வேதியியல் கலவை மற்றும் திரி பொருத்துதல்',
    'Safety Matchbox & Carton Assembly Packaging Hand': 'தீப்பெட்டி & அட்டைப்பெட்டி பேக்கிங் உதவியாளர்',
    'Offset Printing Machine Operator & Color Matcher': 'ஆஃப்செட் பிரிண்டிங் ஆபரேட்டர் & கலர் மேட்சர்',
    'Cashew Kernel Peeling & Vacuum Grading Hand': 'முந்திரி பருப்பு உறித்தல் மற்றும் வெற்றிட பேக்கிங்',
    'Rubber Latex Tapping & Smoking Tech': 'ரப்பர் பால் வடித்தல் & புகைத்தாள் தயாரிப்பு',
    'Seafood Cold Storage Blast Freezer Packaging': 'கடல் உணவு பிளாஸ்ட் ப்ரீசர் பேக்கிங்',
    'Marine Salt Pan Raking & Refining Hand': 'கடல் உப்பு பாத்தி வார்ப்பு மற்றும் சுத்திகரிப்பு',
    'Harbor Crane Container Stevedore': 'துறைமுக கிரேன் கன்டெய்னர் ஸ்டீவ்டோர்',
    'Thanjavur Art Plate Embossing Craftsman': 'தஞ்சாவூர் கலை தட்டு செதுக்கும் கைவினைஞர்',
    'Bronze Chola Statue Casting & Engraving': 'சோழர் கால வெண்கல சிலை வார்ப்பு மற்றும் செதுக்குதல்',
    'Paddy Combine Harvester Machine Operator': 'நெல் அறுவடை இயந்திர ஆபரேட்டர்',
    'Powerloom Fabric Weaving & Maintenance': 'விசைத்தறி துணி நெசவு மற்றும் பராமரிப்பு',
    'Bhavani Jamakkalam Carpet Handloom Artisan': 'பவானி ஜமக்காளம் கைத்தறி நெசவாளர்',
    'Turmeric Grading & Moisture Testing Specialist': 'மஞ்சள் தரம் மற்றும் ஈரப்பதம் சோதனை நிபுணர்',
    'Export Apparel Finishing & Packing': 'ஏற்றுமதி ஆடை பினிஷிங் மற்றும் பேக்கிங்',
    'Fabric Screen Printing & Color Kitchen': 'துணி ரோட்டரி ஸ்கிரீன் பிரிண்டிங் & வண்ண கலவை',
    'Knitwear Garment Flatlock Tailoring Master': 'பின்னலாடை ஃப்ளாட்லாக் தையல் மாஸ்டர்',
    'Finished Leather Quality Inspection': 'முடிக்கப்பட்ட தோல் தர பரிசோதனை',
    'Transit Freight Logistics': 'ரயில்வே சரக்கு போக்குவரத்து லாஜிஸ்டிக்ஸ்',
    'Hospital Patient Desk Navigation': 'மருத்துவமனை நோயாளிகள் வழிகாட்டுதல்',
    'Paper Mill Pulp Processing Operator': 'காகித ஆலை கூழ் தயாரிப்பு உதவியாளர்',
    'Wind Turbine Blade Maintenance Tech': 'காற்றாலை பிளேடு ஆய்வு மற்றும் பராமரிப்பு',
    'Tirunelveli Halwa Clarified Ghee Cooking Master': 'திருநெல்வேலி அல்வா நெய் தயாரிப்பு மாஸ்டர்',
    'Silver Anklet Jewelry Polishing Artisan': 'வெள்ளி கொலுசு மெருகூட்டல் கைவினைஞர்',
    'Sago & Starch Processing Operator': 'ஜவ்வரிசி மற்றும் மரவள்ளிக்கிழங்கு மாவு ஆலை ஆபரேட்டர்',
    'Steel Furnace & Rolling Mill Operation': 'எஃகு உலை மற்றும் உருட்டாலை ஆபரேட்டர்',
    'Railway Locomotive Mechanical Maintenance': 'ரயில்வே இன்ஜின் மெக்கானிக்கல் பராமரிப்பு',
    'High-Pressure Boiler Tube TIG Welding': 'உயர் அழுத்த பாய்லர் டிஐஜி வெல்டர்',
    'Sungudi Cotton Saree Wax Dyeing': 'சுங்குடி காட்டன் புடவை மெழுகு டை கலைஞர்',
    'Madurai Malli Jasmine Stringing & Cold Chain': 'மதுரை மல்லி பூ கட்டுதல் மற்றும் குளிர்பதன பேக்கிங்',
    'Foundry Sand Moulding & Core Casting': 'ஃபவுண்டரி மணல் மோல்டிங் & வார்ப்பு கலைஞர்',
    'Textile Ring Spinning Maintenance': 'ஜவுளி மில் ரிங் ஸ்பின்னிங் பராமரிப்பு',
    'Agricultural Pump Assembly Technician': 'விவசாய மற்றும் மோனோபிளாக் பம்ப் அசெம்பிளி டெக்னீஷியன்',
    'Precision CNC Lathe & Milling Operator': 'துல்லிய CNC லேத் மற்றும் அரைக்கும் இயந்திர ஆபரேட்டர்',
    'Container Logistics': 'கன்டெய்னர் லாஜிஸ்டிக்ஸ்',
    // App header & Global
    appName: 'Talent2Task (टैलेंट2टास्क)',
    regionTag: 'तमिलनाडु क्षेत्र',
    tagline: 'सही कौशल। सही काम। वास्तविक प्रभाव। • तमिलनाडु',
    offlineStatus: 'ऑफ़लाइन SQLite मोड',
    sqlTerminal: 'SQLite कंसोल',
    roleSeeker: 'जॉब सीकर (Job Seeker)',
    roleRecruiter: 'जॉब रिक्रूटर (Job Recruiter)',
    switchRole: 'भूमिका बदलें',
    offlineAlert: 'आप ऑफ़लाइन हैं। आपके सहेजे गए कार्य और प्रोफ़ाइल स्थानीय रूप से उपलब्ध हैं।',
    marketDemand: 'बाज़ार मांग',
    notificationsTitle: 'सूचनाएं और अलर्ट',
    notificationsSubtitle: 'रीयल-टाइम गिग अलर्ट, मिलान सुझाव और रेटिंग अपडेट',
    markAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
    noNotifications: 'इस समय कोई सूचना नहीं है।',
    trends: 'रुझान',
    sqlInspector: 'SQL इंस्पेक्टर',
    splitView: 'स्प्लिट दृश्य',
    close: 'बंद करें',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    add: 'जोड़ें',
    all: 'सभी',
    search: 'खोजें',
    earnings: 'कमाई',
    postedDate: 'पोस्ट तिथि',
    payRate: 'भुगतान दर',
    distance: 'दूरी',
    coordinates: 'निर्देशांक',
    gigLocation: 'कार्य स्थान',
    postedByRecruiter: 'नियोक्ता द्वारा पोस्ट किया गया',
    viewProfile: 'प्रोफ़ाइल देखें',
    manageProfile: 'प्रोफ़ाइल प्रबंधित करें',

    // Login Page
    loginWelcome: 'स्वागत है',
    loginHeading: 'जारी रखने के लिए साइन इन करें',
    loginSubtitle: 'तमिलनाडु भर में अपने कार्यक्षेत्र तक पहुंचें।',
    loginSeekerDesc: 'स्थानीय कार्य खोजें',
    loginRecruiterDesc: 'काम पोस्ट करें',
    loginEmailLabel: 'मोबाइल फोन नंबर',
    loginEmailPlaceholder: '98765 43210',
    loginPasswordLabel: 'पासवर्ड',
    loginPasswordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    loginRememberMe: 'मुझे याद रखें',
    loginForgotPassword: 'पासवर्ड भूल गए?',
    loginSignInSeeker: 'नौकरी खोजकर्ता के रूप में साइन इन करें',
    loginSignInRecruiter: 'नियोक्ता के रूप में साइन इन करें',
    loginNewPrompt: 'Talent2Task पर नए हैं?',
    loginCreateAccount: 'खाता बनाएं',
    loginHeroTitle1: 'सही कौशल।',
    loginHeroTitle2: 'सही काम।',
    loginHeroTitleHighlight: 'वास्तविक प्रभाव।',
    loginHeroDesc: 'तमिलनाडु भर में नौकरियां खोजें या प्रतिभाशाली लोगों को नियुक्त करें।',
    loginStatRadar: 'लाइव GPS',
    loginStatRadarSub: 'तमिलनाडु रडार',
    loginStatOpp: '24/7',
    loginStatOppSub: 'अवसर',
    tabSignIn: 'साइन इन करें',
    tabCreateAccount: 'खाता बनाएं',
    newUserRegistration: 'नया उपयोगकर्ता पंजीकरण',
    joinTalent2Task: 'Talent2Task तमिलनाडु से जुड़ें',
    createAccountSubtitle: 'तमिलनाडु में स्थानीय नौकरियों से जुड़ने या पोस्ट करने के लिए खाता बनाएं।',
    fullNameLabel: 'पूरा नाम',
    companyNameLabel: 'कंपनी / व्यवसाय का नाम',
    fullNamePlaceholder: 'उदा. कार्तिक राजा',
  companyNamePlaceholder: 'उदा. तमिलनाडु फ्रेश मार्ट',
  mobilePhoneLabel: 'मोबाइल फोन नंबर',
  mobilePhonePlaceholder: '98765 43210',
  ageLabel: 'आयु',
  yearsOfExperienceLabel: 'कार्य अनुभव (वर्ष)',
  cityLabel: 'शहर / क्षेत्र (तमिलनाडु)',
  selectVelloreLocation: 'शहर / प्राथमिक स्थान चुनें',
  selectCity: 'शहर चुनें',
  useGpsBtn: 'लाइव जीपीएस',
  gpsPromptTitle: 'सटीक नजदीकी नौकरियों के लिए लाइव जीपीएस सक्षम करें',
  gpsPromptSubtitle: 'तमिलनाडु भर में निकटतम गिग्स खोजने के लिए स्थान पहुंच की अनुमति दें',
  skillsOffered: 'कौशल और सेवाएं',
  availableTimeSlots: 'उपलब्ध समय',
  createSeekerAccountBtn: 'खाता बनाएं',
  createRecruiterAccountBtn: 'खाता बनाएं',
  alreadyRegisteredPrompt: 'क्या आप पहले से पंजीकृत हैं?',
  signInNowBtn: 'अब साइन इन करें',
  orSignInRegistered: '',
  sqliteSavedFeature: 'SQLite डेटाबेस में सहेजा गया',
  radar3kmFeature: 'लाइव जीपीएस और शहर रडार मैचिंग',
  exploreGigsTab: 'गिग्स खोजें',
  manageGigsTab: 'पोस्ट और प्रबंधित करें',
  postGigTab: 'गिग पोस्ट करें',

  // Seeker Tab
  radarHeading: 'लाइव गिग रडार (तमिलनाडु)',
  radarSubtitle: 'अपने सबसे नज़दीकी पार्ट-टाइम और अस्थायी काम खोजें',
  withinRadius: 'के दायरे में',
  radiusSlider: 'दूरी फ़िल्टर',
  allVellore: 'पूरा तमिलनाडु',
  matchScore: 'मैच',
  claimJobBtn: 'काम स्वीकार करें',
  claimedBadge: 'आपके द्वारा स्वीकृत',
  claimedOtherBadge: 'आवंटित',
  completedBadge: 'पूर्ण',
  jobDetailsTitle: 'काम का विवरण और संपर्क',
  directionsBtn: 'दिशा-निर्देश देखें',
  directionsModalTitle: 'कार्य स्थल का मार्ग और दिशा-निर्देश',
  directionsModalSubtitle: 'सटीक GPS नेविगेशन और लाइव रूट गाइड',
  yourLocationLabel: 'आपका वर्तमान स्थान',
  gigLocationLabel: 'रिक्रूटर का कार्य स्थल',
  startNavigationBtn: 'Google Maps नेविगेशन शुरू करें',
  openGoogleMapsBtn: 'Google Maps GPS',
  openAppleMapsBtn: 'Apple Maps',
  onMyWayBtn: 'मैं रास्ते में हूँ (On My Way)',
  onMyWayAlertSent: 'रिक्रूटर को आपके पहुंचने का समय भेज दिया गया है!',
  travelModeBike: 'बाइक / दोपहिया',
  travelModeCar: 'कार / टैक्सी',
  travelModeAuto: 'ऑटो / ट्रांजिट',
  travelModeWalk: 'पैदल',
  liveGpsAccurate: 'सटीक GPS स्थान सक्रिय',
  estimatedArrival: 'अनुमानित यात्रा समय',
  turnByTurnGuide: 'मार्गदर्शन विवरण',
  readyToGoBanner: 'जाने के लिए तैयार हैं? कार्य स्थल के लिए टर्न-बाय-टर्न GPS दिशा-निर्देश प्राप्त करें',
  callRecruiterBtn: 'कॉल करें',
  whatsappRecruiterBtn: 'व्हाट्सएप',
  myGigsTab: 'मेरे स्वीकृत कार्य',
  allGigsTab: 'स्थानीय कार्य खोजें',
  mapViewTab: 'मानचित्र रडार',
  listViewTab: 'सूची दृश्य',
  profileBtn: 'मेरी प्रोफाइल और GPS',
  gigsFound: 'कार्य मिले',
  changeLocation: 'बदलें',
  sortBy: 'क्रमबद्ध:',
  sortMatchScore: '🔥 मैच स्कोर',
  sortDistance: '⚡ दूरी (नजदीक)',
  sortHighestPay: '💰 सबसे अधिक भुगतान',
  payout: 'भुगतान',
  proximity: 'दूरी',
  claiming: 'स्वीकार किया जा रहा है...',
  overall: 'कुल',
  noClaimedGigsTitle: 'अभी तक कोई कार्य स्वीकृत नहीं',
  noClaimedGigsDesc: 'तमिलनाडु भर में त्वरित प्रति घंटे के कार्यों को स्वीकार करने के लिए लाइव रडार का उपयोग करें।',
  myClaimedSubtitle: 'अपने स्वीकृत कार्यों को ट्रैक करें और स्थानीय नियोक्ताओं से संपर्क करें',

  // Profile Modal
  profileTitle: 'प्रोफ़ाइल और स्थान सेटिंग',
  profileDesc: 'अपने 3 किमी मैच स्कोर को अधिकतम करने के लिए कौशल और समय चुनें',
  fullName: 'पूरा नाम',
  age: 'आयु',
  phoneNumber: 'फ़ोन नंबर (व्हाट्सएप सहित)',
  mySkills: 'मेरे कौशल (कौशल चुनें)',
  skillsSelected: 'चुने गए',
  addCustomSkillPlaceholder: 'अन्य कौशल जोड़ें (उदा. इलेक्ट्रीशियन, ट्यूशन)...',
  myAvailability: 'उपलब्ध समय',
  myLocation: 'वर्तमान स्थान / GPS',
  useCurrentGps: 'लाइव GPS प्राप्त करें',
  locating: 'स्थान खोजा जा रहा है...',
  selectLandmark: 'या तमिलनाडु का प्रमुख स्थान चुनें',
  saveProfileBtn: 'प्रोफ़ाइल सहेजें और रडार अपडेट करें',

  // Recruiter Profile Location Details
  doorNoLabel: 'मकान / दुकान / फ्लैट संख्या',
  doorNoPlaceholder: 'उदा. मकान सं. 14/B, दूसरी मंजिल, एपेक्स कॉम्प्लेक्स',
  streetNameLabel: 'सड़क का नाम / गली / क्षेत्र',
  streetNamePlaceholder: 'उदा. अन्ना सलाई, गांधी मार्ग, माउंट रोड',
  cityOrDistrictLabel: 'शहर या जिला',
  landmarkFieldLabel: 'प्रमुख लैंडमार्क (निकटतम केंद्र)',
  landmarkFieldPlaceholder: 'उदा. बस स्टैंड के पास / बैंक के सामने',
  workplaceAddressLabel: 'कार्यस्थल का पूरा पता (नेविगेशन के लिए)',
  workplaceAddressHint: 'आपके गिग्स को स्वीकार करने वाले उम्मीदवारों को इस कार्यस्थल पते पर सीधा नेविगेशन मिलेगा।',
  recruiterLocationTitle: 'कार्यस्थल और व्यावसायिक स्थान',
  recruiterLocationSubtitle: 'सटीक नेविगेशन के लिए मकान नंबर, सड़क, लैंडमार्क और जिला प्रबंधित करें',

  // Phase 35 — Payment Feature UI Terminology
  payNowBtn: 'अब भुगतान करें',
  paymentSuccessful: 'भुगतान सफल',
  paymentReceived: 'भुगतान प्राप्त हुआ',
  processingPayment: 'भुगतान संसाधित हो रहा है...',
  paymentCompleted: 'भुगतान पूर्ण हुआ',
  paidStatus: 'भुगतान किया',

  // Skill Gap & AI Recommendations
  skillGapTitle: 'AI कौशल अंतराल और करियर अनुशंसाएं',
  skillGapBadge: '+35% मैच स्कोर वृद्धि',
  skillGapDesc: 'शीर्ष तमिलनाडु गिग्स पर 90%+ मैच स्कोर प्राप्त करने के लिए इन उच्च-मांग वाले कौशलों को अपनी प्रोफ़ाइल में जोड़ें।',
  addToMySkills: 'कौशल में जोड़ें',
  neededInGigs: 'आवश्यकता:',
  allStarTitle: 'उत्कृष्ट कौशल प्रोफ़ाइल!',
  allStarDesc: 'आपकी प्रोफ़ाइल आस-पास के तमिलनाडु गिग्स में मांगे गए 100% कौशलों को पूरा करती है।',

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
  skillGapAddSkillBtn: 'मेरे कौशल में जोड़ें',

  // Recruiter Portal
  recruiterHeading: 'नियोक्ता प्रबंधन केंद्र',
  recruiterSubtitle: 'तमिलनाडु भर के शहरों में गिग्स पोस्ट करें',
  activeRecruiter: 'सक्रिय नियोक्ता',
  postNewGigBtn: 'नया काम पोस्ट करें',
  postedGigsCount: 'सक्रिय पोस्ट किए गए कार्य',
  statusOpen: 'स्वीकृति के लिए उपलब्ध',
  statusClaimed: 'स्वीकृत / सौंपा गया',
  statusCompleted: 'कार्य पूर्ण',
  markCompletedBtn: 'पूर्ण के रूप में चिह्नित करें',
  deleteGigBtn: 'काम हटाएं',
  claimantDetails: 'कार्यकर्ता विवरण',
  noClaimantYet: 'सहायक द्वारा स्वीकार किए जाने की प्रतीक्षा है',
  rateClaimantBtn: 'रेटिंग और समीक्षा दें',
  callClaimantBtn: 'कॉल करें',
  whatsappClaimantBtn: 'व्हाट्सएप',
  allGigsFilter: 'सभी कार्य',
  metricTotalGigs: 'कुल कार्य',
  metricOpenGigs: 'खुले (खोज जारी)',
  metricAssignedGigs: 'सौंपे गए',
  metricCompletedGigs: 'पूर्ण हुए',
  noRecruiterGigs: 'आपने अभी तक कोई काम पोस्ट नहीं किया है। शुरू करने के लिए "नया काम पोस्ट करें" पर क्लिक करें!',

  // Post Gig Form
  postModalTitle: 'स्थानीय तमिलनाडु कार्य पोस्ट करें',
  postModalSubtitle: 'तमिलनाडु में तत्काल रडार खोज के साथ एक काम पोस्ट करें',
  jobTitleLabel: 'कार्य शीर्षक',
  jobTitlePlaceholder: 'उदा. डिलीवरी सहायक, स्टोर बिलिंग, इवेंट सहायता',
  categoryLabel: 'श्रेणी',
  descriptionLabel: 'विवरण और निर्देश',
  descriptionPlaceholder: 'काम का विवरण, समय और मिलने का स्थान बताएं...',
  payoutLabel: 'भुगतान राशि (₹)',
  payoutUnitLabel: 'भुगतान प्रकार',
  perHour: 'प्रति घंटा',
  perTask: 'प्रति कार्य',
  perShift: 'प्रति शिफ्ट',
  perDay: 'प्रति दिन',
  requiredSkillsLabel: 'आवश्यक कौशल',
  landmarkAreaLabel: 'तमिलनाडु शहर / क्षेत्र / लैंडमार्क',
  clickMapInstruction: 'सटीक निर्देशांक सेट करने के लिए मानचित्र पर क्लिक करें या तमिलनाडु स्थान चुनें',
  publishJobBtn: 'कार्य प्रकाशित करें',

  // Categories
  catDelivery: 'डिलीवरी और परिवहन',
  catStoreHelper: 'दुकान सहायक और रिटेल',
  catDataEntry: 'डेटा एंट्री और ऑफिस',
  catEventHand: 'इवेंट और कैटरिंग सहायता',
  catTutoring: 'ट्यूशन और शिक्षण सहायता',
  catElectrical: 'तकनीकी और रखरखाव',

  // Filter & Search
  searchPlaceholder: 'कार्य, कौशल या तमिलनाडु स्थान खोजें...',
  categoryFilter: 'श्रेणी',
  allCategories: 'सभी श्रेणियां',
  minPayFilter: 'न्यूनतम भुगतान (₹)',
  noJobsFound: 'आपके 3 किमी दायरे में कोई काम नहीं मिला। रडार दूरी बढ़ाकर देखें!',

  // Match breakdown
  breakdownTitle: 'मैच स्कोर विश्लेषण',
  skillFit: 'कौशल मिलान',
  distanceFit: 'दूरी मिलान',
  scheduleFit: 'समय मिलान',
  matchedSkillsLabel: 'मिले हुए कौशल',
  missingSkillsLabel: 'अनुपस्थित कौशल',

  // Hybrid AI Matching & Explainability
  whyRecommended: 'यह मैच क्यों अनुशंसित है?',
  hybridMatchBreakdown: 'हाइब्रिड एआई मैच विश्लेषण',
  skillSimilarityLabel: 'कौशल समानता',
  distanceFactorLabel: 'दूरी',
  availabilityFactorLabel: 'उपलब्धता',
  experienceFactorLabel: 'कार्य अनुभव',
  localDemandFactorLabel: 'स्थानीय मांग',
  reliabilityFactorLabel: 'विश्वसनीयता',

  // Phase 3 — NLP Requirement Understanding
  aiRequirementAssistant: 'एआई आवश्यकता सहायक',
  aiFastDraftTitle: 'प्राकृतिक भाषा में त्वरित ड्राफ्ट',
  aiInputPlaceholder: 'उदा: मदुरै के पास कल शाम एक अनुभवी एसी तकनीशियन की आवश्यकता है',
  extractWithAiBtn: 'एआई से विश्लेषण करें',
  analyzingWithAi: 'विश्लेषण हो रहा है...',
  extractedDetailsTitle: 'एआई द्वारा प्राप्त विवरण — जांचें और संपादित करें',
  extractedDetailsSubtitle: 'फॉर्म में लागू करने से पहले विवरण की पुष्टि करें',
  applyExtractedBtn: 'विवरण लागू करें',
  dismissExtractedBtn: 'हटाएं',
  detectedIntent: 'इरादा',
  hiringWorkerIntent: 'काम पर रखना',
  detectedExperience: 'अनुभव',
  detectedShift: 'समय / शिफ्ट',
  detectedLocation: 'स्थान',
  detectedPayout: 'भुगतान',
  missingInformationAlert: 'ध्यान दें',
  confirmBeforePostNotice: 'आपकी पुष्टि के बिना कोई भी एआई जानकारी पोस्ट नहीं की जाएगी।',
  aiSearchParsed: 'एआई प्राकृतिक भाषा खोज',
    // Phase 6 — Voice & Multilingual AI
    voiceSearchBtn: 'वॉयस खोज',
    voiceFastDraftBtn: 'आवश्यकता बोलें',
    voiceListening: 'सुन रहा है... अब बोलें',
    voiceListeningPrompt: 'तमिल, तेलुगु, हिंदी या अंग्रेजी में बोलें या टाइप करें',
    voicePermissionDenied: 'माइक्रोफोन एक्सेस अवरुद्ध',
    voicePermissionHelp: 'कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन अनुमति सक्षम करें या नमूना वॉयस आज़माएं।',
    voiceUnsupported: 'स्पीच रिकॉग्निशन असमर्थित',
    voiceUnsupportedHelp: 'आपका ब्राउज़र Web Speech API का समर्थन नहीं करता है। कृपया टाइप करें।',
    voiceSamplePhrases: 'वॉयस AI नमूना इनपुट',
    voiceTrySample: 'नमूना वॉयस आज़माएं',
    voiceProcessing: 'वॉयस प्रोसेस हो रहा है...',
    aiMultilingualActive: 'AI बहुभाषी और वॉयस सक्रिय',
    aiLanguageDetected: 'भाषा पहचानी गई',
    // Phase 7 — Trust & Safety
    trustSafetyTitle: 'विश्वास और सुरक्षा मूल्यांकन',
    trustPotentialRisk: 'संभावित जोखिम का पता चला',
    trustVerifiedRecruiter: 'सत्यापित नियोक्ता',
    trustStandardVerification: 'मानक सत्यापन',
    trustVerifiedListing: 'सत्यापित सूची',
    trustNewRecruiterNote: 'नया नियोक्ता खाता — मानक सुरक्षा जांच पूरी हुई। काम पूरा होने के साथ रेटिंग बढ़ती है।',
    trustReportJobBtn: 'रिपोर्ट करें',
    trustReportModalTitle: 'जॉब पोस्टिंग की रिपोर्ट करें',
    trustReportSuccessTitle: 'समीक्षा के लिए रिपोर्ट दर्ज की गई',
    trustNoAutoBanNotice: 'दुरुपयोग को रोकने के लिए, केवल रिपोर्ट या AI के आधार पर उपयोगकर्ताओं को कभी भी स्वचालित रूप से प्रतिबंधित नहीं किया जाता है।',

    // Phase 8 — Reliability & Continuous Feedback
    workerReliabilityTitle: 'कार्यकर्ता विश्वसनीयता और प्रतिष्ठा',
    reliabilityScoreLabel: 'विश्वसनीयता स्कोर',
    reliabilityTierLabel: 'प्रतिष्ठा स्तर',
    completionRateLabel: 'कार्य समापन दर',
    continuousFeedbackLabel: 'निरंतर प्रतिक्रिया चक्र',
    verifiedReviewsLabel: 'सत्यापित समीक्षाएं',
    newWorkerBaselineNote: 'नए कार्यकर्ता के लिए निष्पक्ष आधार अंक लागू — Talent2Task पर सत्यापित इतिहास का निर्माण।',

  // Community Demand Modal
  demandModalTitle: 'समुदाय मांग और कौशल रुझान',
  demandModalSubtitle: 'चेन्नई, कोयंबटूर, मदुरै, त्रिची और तमिलनाडु भर में रीयल-टाइम मांग विश्लेषण',
  demandRegionBadge: 'तमिलनाडु रीयल-टाइम AI रडार',
  topInDemandRole: 'सबसे अधिक मांग वाली भूमिका',
  avgHourlyPayout: 'औसत प्रति घंटा भुगतान',
  peakHiringWindows: 'सर्वोच्च भर्ती समय',
  hourlyPaySub: 'उसी दिन तत्काल भुगतान',
  peakHiringSub: 'लचीली पार्ट-टाइम शिफ्ट',
  skillDemandRanking: 'तमिलनाडु में मांग वाले कौशल और भुगतान दर',
  openGigsSuffix: 'सक्रिय कार्य',
  topAreaLabel: 'प्रमुख क्षेत्र:',
  growthLabel: 'वृद्धि:',
    demandActualTitle: 'वर्तमान स्थानीय मांग',
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

  // Feedback Modal
  feedbackTitle: 'अनुभव को रेट करें और समीक्षा दें',
  feedbackSubtitle: 'सामुदायिक विश्वास बढ़ाने और भविष्य के AI मिलान को बेहतर बनाने में मदद करें',
  ratingScoreLabel: 'कुल रेटिंग',
  feedbackTagsLabel: 'क्या अच्छा रहा?',
  commentLabel: 'विस्तृत प्रतिक्रिया / नोट्स',
  commentPlaceholder: 'समय की पाबंदी, कौशल और कार्य गुणवत्ता के बारे में विवरण साझा करें...',
  submitReviewBtn: 'प्रतिक्रिया सबमिट करें',

  // SQLite Console Modal
  sqlConsoleTitle: 'SQLite इन-ब्राउज़र WASM कंसोल',
  sqlConsoleSubtitle: 'स्थानीय ऑफ़लाइन SQLite डेटाबेस पर सीधे क्वेरी निष्पादित करें',
  sqlEngineBadge: 'SQLite 3 इंजन सक्रिय',
  presetQueriesLabel: 'त्वरित SQL प्रीसेट',
  executeBtn: 'क्वेरी निष्पादित करें',
  exportBtn: 'डेटाबेस निर्यात करें',
  resetBtn: 'डेटा रीसेट करें',
  execTime: 'निष्पादन समय',
  rowsReturned: 'पंक्तियाँ प्राप्त हुईं',
  noResults: 'क्वेरी सफलतापूर्वक निष्पादित हुई, कोई पंक्ति वापस नहीं आई।',

  // Footer & Toasts
  footerTagline: 'सही प्रतिभा। सही काम। वास्तविक प्रभाव।',
  footerEngineDesc: 'हाइपर-लोकल गिग डिस्कवरी इंजन — तमिलनाडु',
  toastClaimSuccess: '🎉 काम स्वीकार कर लिया गया! नियोक्ता को संपर्क जानकारी भेज दी गई है।',
  toastStatusUpdated: 'स्थिति को अपडेट किया गया:',
  toastJobDeleted: 'काम हटा दिया गया।',
  toastJobPosted: '🚀 नया गिग पोस्ट किया गया और तमिलनाडु रडार पर लाइव है!',
  toastProfileUpdated: '✅ प्रोफ़ाइल और GPS अपडेट किया गया।',
  toastSkillAdded: 'जोड़ा गया! AI मैच स्कोर की पुनर्गणना की गई।',
  toastReviewSaved: '⭐ रेटिंग सहेजी गई! सामुदायिक विश्वास अपडेट किया गया।',
    nextStepBtn: 'आगे बढ़ें',
    backStepBtn: 'वापस',
    stepAccountInfo: '1. खाता विवरण',
    stepLocationExperience: '2. अनुभव और स्थान',
    stepLocationDetails: '2. स्थान विवरण',
    selectRoleLabel: 'अपनी भूमिका चुनें',
    phoneExact10DigitsError: 'कृपया ठीक 10 अंकों का मोबाइल नंबर दर्ज करें।',
    passwordRegexError: 'पासवर्ड 8-12 वर्ण लंबा होना चाहिए और इसमें कम से कम एक संख्या और एक विशेष वर्ण होना चाहिए।',
    passwordRegexHint: '8-12 वर्ण, कम से कम 1 संख्या और 1 विशेष वर्ण'
},

  te: {
    'Turmeric Root Sun-Drying & Bagging Hand': 'மஞ்சள் கிழங்கு உலர்த்துதல் மற்றும் மூட்டை கட்டுதல்',
    'Parboiled Rice Huller Mill Operator': 'புழுங்கல் அரிசி ஆலை ஹல்லர் ஆபரேட்டர்',
    'Sugar Mill Sugarcane Crusher Feeder': 'கள்ளக்குறிச்சி சர்க்கரை ஆலை கரும்பு அரவை ஆபரேட்டர்',
    'Shallot (Small Onion) Grading Sorter': 'சின்ன வெங்காயம் தரம் பிரித்து பேக்கிங் செய்பவர்',
    'Gypsum Mineral Processing Helper': 'ஜிப்சம் கனிம செயலாக்க உதவியாளர்',
    'Hybrid Maize Seed Sorting Specialist': 'பெரம்பலூர் மக்காச்சோள விதை தரம் பிரிக்கும் நிபுணர்',
    'Groundnut Decorticator & Oil Extraction Operator': 'மணப்பாறை நிலக்கடலை எண்ணெய் ஆலை எக்ஸ்பெல்லர்',
    'Synthetic Gemstone Faceting & Lapidary Polisher': 'செயற்கை வைர மற்றும் ரத்தின பாலிஷிங் கலைஞர்',
    'Irrigation Canal Sluice Gate Maintenance Hand': 'பாசன கால்வாய் மதகு பராமரிப்பு உதவியாளர்',
    'Tiruvarur Chariot Silk Border Weaving Artisan': 'திருவாரூர் ஆழித்தேர் பட்டு பார்டர் நெசவு கலைஞர்',
    'Certified Paddy Seed Moisture & Purity Sorter': 'சான்றளிக்கப்பட்ட நெல் விதை ஈரப்பதம் மற்றும் தூய்மை பரிசோதகர்',
    'Traditional Cotton Dhoti Handloom Weaver': 'பாரம்பரிய காட்டன் வேட்டி கைத்தறி நெசவாளர்',
    'Coastal Shrimp Hatchery Water Quality Tech': 'கடலோர இறால் குஞ்சு பொரிப்பக நீர் தர தொழில்நுட்ப வல்லுநர்',
    'Raw Cashew Decortication & Roasting Sorter': 'முந்திரி வறுத்தல் மற்றும் உடைக்கும் தரம் பிரிப்பவர்',
    'Limestone Quarry Mining Equipment Hand': 'சுண்ணாம்புக்கல் சுரங்க உபகரண உதவியாளர்',
    'Cement Rotary Kiln Monitoring Operator': 'அரியலூர் சிமெண்ட் சுழல் உலை கண்காணிப்பு ஆபரேட்டர்',
    'Automotive Sub-Assembly Line Fitter': 'மறைமலைநகர் கார் அசெம்பிளி லைன் பிட்டர்',
    'IT Server Room Power & HVAC Tech': 'மகிந்திரா வேர்ல்ட் சிட்டி சர்வர் ரூம் பவர் & ஏசி டெக்னீஷியன்',
    'Defense Vehicle Spare Quality Checker': 'ஆவடி ராணுவ வாகன உதிரிபாக தர பரிசோதகர்',
    'Heavy Metal Forging Drop-Hammer Operator': 'கும்மிடிப்பூண்டி கனரக மெட்டல் போForging ஆபரேட்டர்',
    'Tannery Drum Processing Operator': 'தோல் பதனிடும் மர டிரிரம் ஆபரேட்டர்',
    'Shoe Upper Zig-Zag Sewing Tailor': 'ஆம்பூர் தோல் காலணி தையல் மாஸ்டர்',
    'Railway Freight Transshipment Loader': 'ஜோலார்பேட்டை ரயில்வே சரக்கு டிரான்ஸ்ஷிப்மென்ட் உதவியாளர்',
    'Industrial Boiler Water Chemistry Tech': 'தொழில்துறை பாய்லர் நீர் வேதியியல் தொழில்நுட்ப வல்லுநர்',
    'Leather Shoe Upper Clicking & Skiving': 'தோல் காலணி மேல் பகுதி கட்டிங் & ஸ்கைவிங்',
    'High Voltage Switchyard Electrician': 'உயர் மின்னழுத்த சுவிட்ச்யார்டு எலக்ட்ரீசியன்',
    'Thermal Power Plant Maintenance Tech': 'அனல் மின் நிலைய பராமரிப்பு தொழில்நுட்ப வல்லுநர்',
    'Lignite Bucket Wheel Excavator Operator': 'நிலக்கரி பக்கெட் வீல் அகழ்வாராய்ச்சி ஆபரேட்டர்',
    'Plum & Pear Orchard Harvest Hand': 'பிளம்ஸ் மற்றும் பேரிக்காய் பறிக்கும் உதவியாளர்',
    'Homemade Chocolate Tempering Artisan': 'கொடைக்கானல் சாக்லேட் தயாரிப்பாளர்',
    'Timber Sawmill Machine Operator Helper': 'மரம் அறுக்கும் ஆலை இயந்திர உதவியாளர்',
    'Coir Pith Block Press Machine Operator': 'தேங்காய் நார் கழிவு பிரிக் கட்டை பிரஸ் ஆபரேட்டர்',
    'Tender Coconut Wholesale Sorting Specialist': 'பொள்ளாச்சி இளநீர் மட்டை உறித்தல் மற்றும் தரம் பிரித்தல்',
    'Temple Border Silk Dhoti Handloom Weaver': 'கோவில் பட்டு வேட்டி கைத்தறி நெசவாளர்',
    'Kumbakonam Degree Coffee Roaster & Barista': 'கும்பகோணம் டிகிரி காபி வறுக்கும் மாஸ்டர்',
    'Brass Temple Lamp (Kuthuvilakku) Artisan': 'பித்தளை குத்துவிளக்கு மற்றும் மணி கைவினைஞர்',
    'Chettinad Traditional Spice & Catering Master': 'செட்டிநாடு பாரம்பரிய சமையல் மற்றும் மசாலா மாஸ்டர்',
    'Athangudi Handmade Floor Tile Artisan': 'ஆத்தங்குடி பாரம்பரிய தரை ஓடு கைவினைஞர்',
    'Traditional Pottery & Musical Ghatam Maker': 'மானாமதுரை கடம் மற்றும் மண்பாண்ட கலைஞர்',
    'Graphite Mining Processing Helper': 'கிராஃபைட் தாது மிதவை ஆலை உதவியாளர்',
    'Seashell & Conch Handicraft Artisan': 'சங்கு மற்றும் சிப்பி கைவினைப் பொருட்கள் செதுக்குபவர்',
    'Island Pilgrimage Transit Coordinator': 'ராமேஸ்வரம் தீவு யாத்ரீகர்கள் உதவி ஒருங்கிணைப்பாளர்',
    'Solar PV Array Maintenance & Cleaning Tech': 'சூரிய மின் தகடு சுத்தம் மற்றும் பராமரிப்பு',
    'Dry Fish Salt-Curing & Solar Drying Specialist': 'கருவாடு உப்பு பதனிடுதல் மற்றும் சோலார் உலர் கூட உதவியாளர்',
    'Palm Jaggery (Karupatti) Boiling Master': 'பனை கருப்பட்டி காய்ச்சும் மாஸ்டர்',
    'Banana Fiber Extraction Machine Hand': 'வாழை நார் பிரித்தெடுக்கும் இயந்திர ஆபரேட்டர்',
    'Bodinayakanur Cardamom Auction Sorter': 'போடிநாயக்கனூர் ஏலக்காய் ஏல தரம் பிரிப்பவர்',
    'Cumbum Valley Grape Harvesting Specialist': 'கம்பம் பள்ளத்தாக்கு திராட்சை அறுவடை நிபுணர்',
    'Country Sugar (Nattu Sakkarai) Maker': 'நாட்டு சர்க்கரை தயாரிப்பாளர்',
    'Cotton Ginning Saw Machine Operator': 'பருத்தி பஞ்சு பிரித்தெடுக்கும் இயந்திர ஆபரேட்டர்',
    'Courtallam Season Tourism Assistant': 'குற்றாலம் சீசன் சுற்றுலா மற்றும் வழிகாட்டுதல்',
    'Wholesale Grain Mandi Logistics Handler': 'தானிய மண்டி மூட்டை தூக்குதல் மற்றும் தைத்தல்',
    'Oil Mill Expeller & Filter Press Operator': 'எண்ணெய் ஆலை எக்ஸ்பெல்லர் மற்றும் பில்டர் பிரஸ் ஆபரேட்டர்',
    'Wholesale Red Chilli & Spice Grader': 'மொத்த மிளகாய் மற்றும் மசாலா தரம் பிரிப்பவர்',
    'Sugar Mill Processing Operator': 'சர்க்கரை ஆலை செயலாக்க ஆபரேட்டர்',
    'Raw Cashew Decorticator Machine Operator': 'பச்சை முந்திரி பருப்பு உடைக்கும் இயந்திர ஆபரேட்டர்',
    'Arani Silk Saree Handloom Weaver': 'ஆரணி பட்டு சேலை கைத்தறி நெசவாளர்',
    'Traditional Wood Ghani Oil Press Operator': 'பாரம்பரிய மரச்செக்கு நல்லெண்ணெய் ஆலை ஆபரேட்டர்',
    'Girivalam Pilgrim Logistics Coordinator': 'கிரிவலம் பக்தர் சேவை மற்றும் அன்னதான ஒருங்கிணைப்பாளர்',
    'Granite Gangsaw Block Slicing Operator': 'கிரானைட் கேங்சா கல் அறுக்கும் ஆபரேட்டர்',
    'Floriculture Flower Sorter & Stringer': 'மலர் மாலை கட்டுதல் மற்றும் தரம் பிரித்தல்',
    'Mango Pulp Industrial Canning Operator': 'மாம்பழ கூழ் கேனிங் மற்றும் பாஸ்டுரைசேஷன் ஆபரேட்டர்',
    'Sericulture Silkworm Cocoon Rearing Hand': 'பட்டுப்புழு வளர்ப்பு மற்றும் கூடு அறுவடை உதவியாளர்',
    'Marine Fish Salting & Sun-Curing Hand': 'கருவாடு உப்பு பதனிடுதல் மற்றும் உலர்த்துதல்',
    'Cashew Decortication & Oven Roasting Operator': 'முந்திரி கொட்டை உடைத்தல் மற்றும் வறுக்கும் ஆபரேட்டர்',
    'Lignite Mine Conveyor Maintenance Tech': 'நெய்வேலி நிலக்கரி கன்வேயர் பெல்ட் பராமரிப்பு',
    'Harbor Fish Auction Sorting & Ice Packing': 'மீன்பிடி துறைமுக ஏல மீன் வகைப்படுத்துதல் மற்றும் ஐஸ் பேக்கிங்',
    'Deep-Sea Trawler Net Rigging & Deck Hand': 'ஆழ்கடல் மீன்பிடி படகு வலை கட்டும் டெக் குழு',
    'Deep Borewell Rig Machinery Operation': 'ஆழ்துளை கிணறு ரிக் இயந்திர ஆபரேட்டர்',
    'Heavy Lorry Chassis & Cabin Welding Tech': 'லாரி சேஸ் மற்றும் கேபின் வெல்டர்',
    'Commercial Poultry Egg Grading Specialist': 'வணிக கோழிப்பண்ணை முட்டை தரம் பிரிக்கும் நிபுணர்',
    'Yarn Dyeing & Hydro-Extraction Operator': 'நூல் சாயம் ஏற்றுதல் மற்றும் நீர் நீக்கும் ஆபரேட்டர்',
    'Commercial Bus Body MIG Welding Tech': 'பேருந்து பாடி பில்டிங் எம்ஐஜி வெல்டர்',
    'Home Textile Jacquard Linen Weaving Tech': 'வீட்டு ஜவுளி ஜாக்கார்டு லினன் நெசவாளர்',
    'Tannery Leather Buffing & Trimming Tech': 'தோல் பதனிடும் பஃபிங் மற்றும் டிரிம்மிங் டெக்னீஷியன்',
    'Sirumalai Mountain Banana & Cardamom Sorter': 'சிறுமலை மலை வாழைப்பழம் மற்றும் ஏலக்காய் தரம் பிரிப்பவர்',
    'Handcrafted Brass Lock Assembly Artisan': 'திண்டுக்கல் பித்தளை பூட்டு அசெம்பிளி கைவினைஞர்',
    'Hill Vegetable & Fruit Cold Packing Hand': 'மலைத்தோட்ட காய்கறி மற்றும் பழ பேக்கிங்',
    'Eucalyptus Essential Oil Distillation Worker': 'நீலகிரி தைல மர எண்ணெய் காய்ச்சி வடித்தல்',
    'Orthodox Tea Plucking & Processing Hand': 'தேயிலை கொழுந்து பறித்தல் மற்றும் பதப்படுத்துதல்',
    'Auto Sheet Metal Stamping Press Operator': 'வாகன உதிரிபாக ஸ்டாம்பிங் பிரஸ் ஆபரேட்டர்',
    'SMT Electronics Component Inspection': 'SMT எலக்ட்ரானிக்ஸ் போர்டு ஆய்வாளர்',
    'Kanchipuram Pure Silk Zari Weaving Master': 'காஞ்சிபுரம் பட்டு ஜரிகை நெசவு மாஸ்டர்',
    'Floriculture Dutch Rose Export Harvest Hand': 'டச்சு ரோஜா மலர் ஏற்றுமதி அறுவடை உதவியாளர்',
    'Precision Tool & Die Machine Operator': 'துல்லிய கருவி மற்றும் டை இயந்திர ஆபரேட்டர்',
    'EV Battery Module Assembly & Spot Welding': 'மின்சார வாகன பேட்டரி மாட்யூல் ஸ்பாட் வெல்டர்',
    'Fireworks Pyro-Mixing & Safety Fuse Setting': 'பட்டாசு வேதியியல் கலவை மற்றும் திரி பொருத்துதல்',
    'Cashew Kernel Peeling & Vacuum Grading Hand': 'முந்திரி பருப்பு உறித்தல் மற்றும் வெற்றிட பேக்கிங்',
    'Rubber Latex Tapping & Smoking Tech': 'ரப்பர் பால் வடித்தல் & புகைத்தாள் தயாரிப்பு',
    'Seafood Cold Storage Blast Freezer Packaging': 'கடல் உணவு பிளாஸ்ட் ப்ரீசர் பேக்கிங்',
    'Marine Salt Pan Raking & Refining Hand': 'கடல் உப்பு பாத்தி வார்ப்பு மற்றும் சுத்திகரிப்பு',
    'Harbor Crane Container Stevedore': 'துறைமுக கிரேன் கன்டெய்னர் ஸ்டீவ்டோர்',
    'Thanjavur Art Plate Embossing Craftsman': 'தஞ்சாவூர் கலை தட்டு செதுக்கும் கைவினைஞர்',
    'Bronze Chola Statue Casting & Engraving': 'சோழர் கால வெண்கல சிலை வார்ப்பு மற்றும் செதுக்குதல்',
    'Paddy Combine Harvester Machine Operator': 'நெல் அறுவடை இயந்திர ஆபரேட்டர்',
    'Powerloom Fabric Weaving & Maintenance': 'விசைத்தறி துணி நெசவு மற்றும் பராமரிப்பு',
    'Bhavani Jamakkalam Carpet Handloom Artisan': 'பவானி ஜமக்காளம் கைத்தறி நெசவாளர்',
    'Turmeric Grading & Moisture Testing Specialist': 'மஞ்சள் தரம் மற்றும் ஈரப்பதம் சோதனை நிபுணர்',
    'Export Apparel Finishing & Packing': 'ஏற்றுமதி ஆடை பினிஷிங் மற்றும் பேக்கிங்',
    'Fabric Screen Printing & Color Kitchen': 'துணி ரோட்டரி ஸ்கிரீன் பிரிண்டிங் & வண்ண கலவை',
    'Knitwear Garment Flatlock Tailoring Master': 'பின்னலாடை ஃப்ளாட்லாக் தையல் மாஸ்டர்',
    'Finished Leather Quality Inspection': 'முடிக்கப்பட்ட தோல் தர பரிசோதனை',
    'Transit Freight Logistics': 'ரயில்வே சரக்கு போக்குவரத்து லாஜிஸ்டிக்ஸ்',
    'Hospital Patient Desk Navigation': 'மருத்துவமனை நோயாளிகள் வழிகாட்டுதல்',
    'Paper Mill Pulp Processing Operator': 'காகித ஆலை கூழ் தயாரிப்பு உதவியாளர்',
    'Wind Turbine Blade Maintenance Tech': 'காற்றாலை பிளேடு ஆய்வு மற்றும் பராமரிப்பு',
    'Tirunelveli Halwa Clarified Ghee Cooking Master': 'திருநெல்வேலி அல்வா நெய் தயாரிப்பு மாஸ்டர்',
    'Silver Anklet Jewelry Polishing Artisan': 'வெள்ளி கொலுசு மெருகூட்டல் கைவினைஞர்',
    'Sago & Starch Processing Operator': 'ஜவ்வரிசி மற்றும் மரவள்ளிக்கிழங்கு மாவு ஆலை ஆபரேட்டர்',
    'Steel Furnace & Rolling Mill Operation': 'எஃகு உலை மற்றும் உருட்டாலை ஆபரேட்டர்',
    'Railway Locomotive Mechanical Maintenance': 'ரயில்வே இன்ஜின் மெக்கானிக்கல் பராமரிப்பு',
    'High-Pressure Boiler Tube TIG Welding': 'உயர் அழுத்த பாய்லர் டிஐஜி வெல்டர்',
    'Sungudi Cotton Saree Wax Dyeing': 'சுங்குடி காட்டன் புடவை மெழுகு டை கலைஞர்',
    'Madurai Malli Jasmine Stringing & Cold Chain': 'மதுரை மல்லி பூ கட்டுதல் மற்றும் குளிர்பதன பேக்கிங்',
    'Foundry Sand Moulding & Core Casting': 'ஃபவுண்டரி மணல் மோல்டிங் & வார்ப்பு கலைஞர்',
    'Textile Ring Spinning Maintenance': 'ஜவுளி மில் ரிங் ஸ்பின்னிங் பராமரிப்பு',
    'Agricultural Pump Assembly Technician': 'விவசாய மற்றும் மோனோபிளாக் பம்ப் அசெம்பிளி டெக்னீஷியன்',
    'Precision CNC Lathe & Milling Operator': 'துல்லிய CNC லேத் மற்றும் அரைக்கும் இயந்திர ஆபரேட்டர்',
    'Container Logistics': 'கன்டெய்னர் லாஜிஸ்டிக்ஸ்',
    // App header & Global
    appName: 'Talent2Task (టాలెంట్2టాస్క్)',
    regionTag: 'వెల్లూరు ప్రాంతం',
    tagline: 'సరైన నైపుణ్యాలు. సరైన పని. నిజమైన ప్రభావం. • వెల్లూరు',
    offlineStatus: 'ఆఫ్‌లైన్ SQLite మోడ్',
    sqlTerminal: 'SQLite కన్సోల్',
    roleSeeker: 'జాబ్ సీకర్ (Job Seeker)',
    roleRecruiter: 'జాబ్ రిక్రూటర్ (Job Recruiter)',
    switchRole: 'పాత్రను మార్చండి',
    offlineAlert: 'మీరు ఆఫ్‌లైన్‌లో ఉన్నారు. మీ సేవ్ చేయబడిన గిగ్‌లు మరియు ప్రొఫైల్‌లు స్థానికంగా అందుబాటులో ఉన్నాయి.',
    marketDemand: 'మార్కెట్ డిమాండ్',
    notificationsTitle: 'నోటిఫికేషన్‌లు & అలర్ట్‌లు',
    notificationsSubtitle: 'రియల్-టైమ్ గిగ్ అలర్ట్‌లు, మ్యాచ్ సిఫార్సులు మరియు రేటింగ్ అప్‌డేట్‌లు',
    markAllRead: 'అన్నీ చదివినట్లుగా గుర్తించండి',
    noNotifications: 'ప్రస్తుతం నోటిఫికేషన్‌లు లేవు.',
    trends: 'ట్రెండ్స్',
    sqlInspector: 'SQL ఇన్‌స్పెక్టర్',
    splitView: 'స్ప్లిట్ వీక్షణ',
    close: 'మూసివేయి',
    cancel: 'రద్దు చేయి',
    save: 'సేవ్ చేయి',
    delete: 'తొలగించు',
    add: 'జోడించు',
    all: 'అన్నీ',
    search: 'వెతకండి',
    earnings: 'సంపాదన',
    postedDate: 'పోస్ట్ చేసిన తేదీ',
    payRate: 'పారితోషిక రేటు',
    distance: 'దూరం',
    coordinates: 'కోఆర్డినేట్లు',
    gigLocation: 'పని ప్రదేశం',
    postedByRecruiter: 'నియామకదారు వివరాలు',
    viewProfile: 'ప్రొఫైల్ చూడండి',
    manageProfile: 'ప్రొఫైల్ నిర్వహించండి',

    // Login Page
    loginWelcome: 'స్వాగతం',
    loginHeading: 'కొనసాగడానికి సైన్ ఇన్ చేయండి',
    loginSubtitle: 'మీ ఖాతా రకాన్ని ఎంచుకుని మీ వర్క్‌స్పేస్‌ను యాక్సెస్ చేయండి.',
    loginSeekerDesc: 'స్థానిక గిగ్‌లను కనుగొనండి',
    loginRecruiterDesc: 'గిగ్‌ను పోస్ట్ చేయండి',
    loginEmailLabel: 'మొబైల్ ఫోన్ నంబర్',
    loginEmailPlaceholder: '98765 43210',
    loginPasswordLabel: 'పాస్‌వర్డ్',
    loginPasswordPlaceholder: 'మీ పాస్‌వర్డ్‌ను నమోదు చేయండి',
    loginRememberMe: 'నన్ను గుర్తుంచుకో',
    loginForgotPassword: 'పాస్‌వర్డ్ మర్చిపోయారా?',
    loginSignInSeeker: 'ఉద్యోగ అన్వేషకుడిగా సైన్ ఇన్ చేయండి',
    loginSignInRecruiter: 'నియామకదారుడిగా సైన్ ఇన్ చేయండి',
    loginNewPrompt: 'Talent2Task కు కొత్తవారా?',
    loginCreateAccount: 'ఖాతాను సృష్టించండి',
    loginHeroTitle1: 'సరైన నైపుణ్యాలు.',
    loginHeroTitle2: 'సరైన పని.',
    loginHeroTitleHighlight: 'నిజమైన ప్రభావం.',
    loginHeroDesc: 'నమ్మకమైన స్థానిక గిగ్‌లను కనుగొనండి లేదా మీ వ్యాపారానికి అవసరమైన నైపుణ్యం కలిగిన వ్యక్తులను ఒకే చోట పొందండి.',
    loginStatRadar: '3 కి.మీ',
    loginStatRadarSub: 'స్థానిక రాడార్',
    loginStatOpp: '24/7',
    loginStatOppSub: 'అవకాశాలు',
    tabSignIn: 'సైన్ ఇన్',
    tabCreateAccount: 'ఖాతాను సృష్టించండి',
    newUserRegistration: 'కొత్త వినియోగదారు నమోదు',
    joinTalent2Task: 'Talent2Task తమిళనాడులో చేరండి',
    createAccountSubtitle: 'తమిళనాడు వ్యాప్తంగా ఉద్యోగాలను కనుగొనడానికి లేదా పోస్ట్ చేయడానికి ఖాతాను సృష్టించండి.',
    fullNameLabel: 'పూర్తి పేరు',
    companyNameLabel: 'సంస్థ / వ్యాపార పేరు',
    fullNamePlaceholder: 'ఉదా. కార్తీక్ రాజా',
    companyNamePlaceholder: 'ఉదా. వెల్లూర్ ఫ్రెష్ మార్ట్',
    mobilePhoneLabel: 'మొబైల్ ఫోన్ నంబర్',
    mobilePhonePlaceholder: '98765 43210',
    ageLabel: 'వయస్సు',
    yearsOfExperienceLabel: 'పని అనుభవం (సంవత్సరాలు)',
    cityLabel: 'నగరం / ప్రాంతం (తమిళనాడు)',
    selectVelloreLocation: 'నగరం / ప్రాథమిక ప్రాంతాన్ని ఎంచుకోండి',
    selectCity: 'నగరాన్ని ఎంచుకోండి',
    useGpsBtn: 'లైవ్ జీపీఎస్',
    gpsPromptTitle: 'సమీప ఉద్యోగాల కోసం లైవ్ జీపీఎస్ ఎనేబుల్ చేయండి',
    gpsPromptSubtitle: 'తమిళనాడు వ్యాప్తంగా మీకు సమీపంలో ఉన్న గిగ్‌లను కనుగొనడానికి లొకేషన్ అనుమతించండి',
    skillsOffered: 'నైపుణ్యాలు & సేవలు',
    availableTimeSlots: 'అందుబాటులో ఉన్న సమయాలు',
    createSeekerAccountBtn: 'ఖాతాను సృష్టించండి',
    createRecruiterAccountBtn: 'ఖాతాను సృష్టించండి',
    alreadyRegisteredPrompt: 'ఇప్పటికే నమోదయ్యారా?',
    signInNowBtn: 'ఇప్పుడు సైన్ ఇన్ చేయండి',
    orSignInRegistered: '',
    sqliteSavedFeature: 'SQLite డేటాబేస్‌లో సేవ్ చేయబడింది',
    radar3kmFeature: 'లైవ్ జీపీఎస్ & నగర రాడార్ మ్యాచింగ్',
    exploreGigsTab: 'గిగ్‌లను అన్వేషించండి',
    manageGigsTab: 'పోస్ట్ & నిర్వహించండి',
    postGigTab: 'గిగ్‌ను పోస్ట్ చేయండి',

    // Seeker Tab
    radarHeading: 'లైవ్ గిగ్ రాడార్ (తమిళనాడు)',
    radarSubtitle: 'మీకు దగ్గరలోని పార్ట్-టైమ్ మరియు గిగ్ పనులను కనుగొనండి',
    withinRadius: 'లోపల',
    radiusSlider: 'దూరం ఫిల్టర్',
    allVellore: 'మొత్తం తమిళనాడు',
    matchScore: 'మ్యాచ్',
    claimJobBtn: 'గిగ్‌ను స్వీకరించండి',
    claimedBadge: 'మీరు స్వీకరించారు',
    claimedOtherBadge: 'కేటాయించినది',
    completedBadge: 'పూర్తయ్యింది',
    jobDetailsTitle: 'గిగ్ వివరాలు మరియు సంప్రదింపు',
    directionsBtn: 'మార్గం చూడండి',
    directionsModalTitle: 'గిగ్ మార్గం & దిశానిర్దేశాలు',
    directionsModalSubtitle: 'ఖచ్చితమైన GPS నావిగేషన్ & ప్రత్యక్ష రూట్ గైడ్',
    yourLocationLabel: 'మీ ప్రారంభ స్థానం',
    gigLocationLabel: 'రిక్రూటర్ పని ప్రదేశం',
    startNavigationBtn: 'Google Maps నావిగేషన్ ప్రారంభించండి',
    openGoogleMapsBtn: 'Google Maps GPS',
    openAppleMapsBtn: 'Apple Maps',
    onMyWayBtn: 'నేను బయలుదేరాను (On My Way)',
    onMyWayAlertSent: 'రిక్రూటర్‌కు మీ రాక సమయం తెలియజేయబడింది!',
    travelModeBike: 'బైక్ / ద్విచక్ర వాహనం',
    travelModeCar: 'కార్ / టాక్సీ',
    travelModeAuto: 'ఆటో / రవాణా',
    travelModeWalk: 'నడక',
    liveGpsAccurate: 'ఖచ్చితమైన GPS స్థానం సక్రియంగా ఉంది',
    estimatedArrival: 'అంచనా వేసిన ప్రయాణ సమయం',
    turnByTurnGuide: 'మార్గదర్శక వివరాలు',
    readyToGoBanner: 'బయలుదేరడానికి సిద్ధమా? గిగ్ స్థలానికి GPS దిశానిర్దేశాలను పొందండి',
    callRecruiterBtn: 'కాల్ చేయండి',
    whatsappRecruiterBtn: 'వాట్సాప్',
    myGigsTab: 'నా గిగ్‌లు',
    allGigsTab: 'స్థానిక గిగ్‌లు',
    mapViewTab: 'మ్యాప్ రాడార్',
    listViewTab: 'జాబితా వీక్షణ',
    profileBtn: 'నా ప్రొఫైల్ & GPS',
    gigsFound: 'గిగ్‌లు దొరికాయి',
    changeLocation: 'మార్చండి',
    sortBy: 'క్రమబద్ధీకరించు:',
    sortMatchScore: '🔥 మ్యాచ్ స్కోర్',
    sortDistance: '⚡ దూరం (దగ్గర)',
    sortHighestPay: '💰 అధిక పారితోషికం',
    payout: 'పారితోషికం',
    proximity: 'దూరం',
    claiming: 'స్వీకరిస్తున్నారు...',
    overall: 'మొత్తం',
    noClaimedGigsTitle: 'ఇంకా గిగ్‌లు స్వీకరించలేదు',
    noClaimedGigsDesc: 'తమిళనాడు అంతటా గంటవారీ పనులను అంగీకరించడానికి లైవ్ రాడార్‌ను ఉపయోగించండి.',
    myClaimedSubtitle: 'మీరు అంగీకరించిన గిగ్‌లను ట్రాక్ చేయండి మరియు రిక్రూటర్‌లను సంప్రదించండి',

    // Profile Modal
    profileTitle: 'యూజర్ ప్రొఫైల్ మరియు లొకేషన్',
    profileDesc: 'మీ 3 కి.మీ మ్యాచ్ స్కోర్‌ను పెంచడానికి నైపుణ్యాలు మరియు సమయాన్ని ఎంచుకోండి',
    fullName: 'పూర్తి పేరు',
    age: 'వయస్సు',
    phoneNumber: 'ఫోన్ నంబర్ (వాట్సాప్‌తో)',
    mySkills: 'నా నైపుణ్యాలు (వర్తించేవన్నీ ఎంచుకోండి)',
    skillsSelected: 'ఎంచుకోబడింది',
    addCustomSkillPlaceholder: 'ఇతర నైపుణ్యాన్ని జోడించండి (ఉదా. ఎలక్ట్రీషియన్, ట్యూషన్)...',
    myAvailability: 'అందుబాటు సమయం',
    myLocation: 'ప్రస్తుత లొకేషన్ / GPS',
    useCurrentGps: 'లైవ్ GPS పొందండి',
    locating: 'గుర్తిస్తోంది...',
    selectLandmark: 'తమిళనాడు ల్యాండ్‌మార్క్‌ను ఎంచుకోండి',
    saveProfileBtn: 'ప్రొఫైల్‌ను సేవ్ చేయండి & రాడార్‌ను నవీకరించండి',

    // Recruiter Profile Location Details
    doorNoLabel: 'డోర్ / షాప్ / ఫ్లాట్ నంబర్',
    doorNoPlaceholder: 'ఉదా. డోర్ నం. 14/B, 2వ అంతస్తు',
    streetNameLabel: 'వీధి పేరు / రోడ్డు / ప్రాంతం',
    streetNamePlaceholder: 'ఉదా. అన్నా సలై, గాంధీ వీధి',
    cityOrDistrictLabel: 'నగరం లేదా జిల్లా',
    landmarkFieldLabel: 'ప్రముఖ ల్యాండ్‌మార్క్',
    landmarkFieldPlaceholder: 'ఉదా. బస్ స్టాండ్ దగ్గర / బ్యాంకు ఎదురుగా',
    workplaceAddressLabel: 'పూర్తి కార్యాలయ చిరునామా (నావిగేషన్ కోసం)',
    workplaceAddressHint: 'మీ గిగ్‌లను క్లెయిమ్ చేసే అభ్యర్థులు ఈ కార్యాలయ చిరునామాకు ఖచ్చితమైన నావిగేషన్‌ను పొందుతారు.',
    recruiterLocationTitle: 'కార్యాలయ మరియు వ్యాపార లొకేషన్',
    recruiterLocationSubtitle: 'ఖచ్చితమైన నావిగేషన్ కోసం డోర్ నంబర్, వీధి పేరు, ల్యాండ్‌మార్క్ మరియు జిల్లాను నిర్వహించండి',

    // Phase 35 — Payment Feature UI Terminology
    payNowBtn: 'ఇప్పుడే చెల్లించండి',
    paymentSuccessful: 'చెల్లింపు విజయవంతమైంది',
    paymentReceived: 'చెల్లింపు అందింది',
    processingPayment: 'చెల్లింపు ప్రాసెస్ అవుతోంది...',
    paymentCompleted: 'చెల్లింపు పూర్తయింది',
    paidStatus: 'చెల్లించబడింది',

    // Skill Gap & AI Recommendations
    skillGapTitle: 'AI నైపుణ్య అంతరం & కెరీర్ సిఫార్సులు',
    skillGapBadge: '+35% మ్యాచ్ స్కోర్ బూస్ట్',
    skillGapDesc: 'టాప్ తమిళనాడు గిగ్‌లలో 90%+ మ్యాచ్ స్కోర్‌ను పొందడానికి ఈ అధిక డిమాండ్ ఉన్న నైపుణ్యాలను జోడించండి.',
    addToMySkills: 'నా నైపుణ్యాలలో జోడించండి',
    neededInGigs: 'అవసరమైన గిగ్‌లు:',
    allStarTitle: 'అద్భుతమైన నైపుణ్య ప్రొఫైల్!',
    allStarDesc: 'మీ ప్రొఫైల్ సమీపంలోని తమిళనాడు గిగ్‌లలో అభ్యర్థించిన 100% నైపుణ్యాలను కలిగి ఉంది.',

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
    skillGapAddSkillBtn: 'నా నైపుణ్యాలకు జోడించు',

    // Recruiter Portal
    recruiterHeading: 'నియామకదారు నిర్వహణ కేంద్రం',
    recruiterSubtitle: 'తమిళనాడు వ్యాప్తంగా గిగ్‌లను పోస్ట్ చేయండి',
    activeRecruiter: 'యాక్టివ్ రిక్రూటర్',
    postNewGigBtn: 'కొత్త గిగ్‌ను పోస్ట్ చేయండి',
    postedGigsCount: 'పోస్ట్ చేసిన గిగ్‌లు',
    statusOpen: 'స్వీకరణకు సిద్ధంగా ఉంది',
    statusClaimed: 'స్వీకరించబడింది / కేటాయించబడింది',
    statusCompleted: 'పని పూర్తయింది',
    markCompletedBtn: 'పూర్తయినట్లుగా గుర్తించండి',
    deleteGigBtn: 'గిగ్‌ను తొలగించు',
    claimantDetails: 'పనిచేసేవారి వివరాలు',
    noClaimantYet: 'సమీప అన్వేషకుడు స్వీకరించడానికి వేచి ఉంది',
    rateClaimantBtn: 'రేటింగ్ & సమీక్ష ఇవ్వండి',
    callClaimantBtn: 'కాల్ చేయండి',
    whatsappClaimantBtn: 'వాట్సాప్',
    allGigsFilter: 'అన్ని గిగ్‌లు',
    metricTotalGigs: 'మొత్తం గిగ్‌లు',
    metricOpenGigs: 'ఓపెన్ (శోధనలో)',
    metricAssignedGigs: 'కేటాయించినవి',
    metricCompletedGigs: 'పూర్తయినవి',
    noRecruiterGigs: 'మీరు ఇంకా ఎటువంటి గిగ్‌లను పోస్ట్ చేయలేదు. ప్రారంభించడానికి "కొత్త గిగ్‌ను పోస్ట్ చేయండి" క్లిక్ చేయండి!',

    // Post Gig Form
    postModalTitle: 'స్థానిక గిగ్‌ను పోస్ట్ చేయండి (తమిళనాడు)',
    postModalSubtitle: 'తమిళనాడు రాడార్‌లో తక్షణమే కనిపించేలా స్థానిక గిగ్‌ను పోస్ట్ చేయండి',
    jobTitleLabel: 'ఉద్యోగ పేరు',
    jobTitlePlaceholder: 'ఉదా. డెలివరీ సహాయకుడు, స్టోర్ బిల్లింగ్, ఈవెంట్ సహాయం',
    categoryLabel: 'వర్గం',
    descriptionLabel: 'వివరణ మరియు సూచనలు',
    descriptionPlaceholder: 'చేయవలసిన పని, సమయాలు మరియు రిపోర్టింగ్ పాయింట్‌ను వివరించండి...',
    payoutLabel: 'పారితోషికం మొత్తం (₹)',
    payoutUnitLabel: 'పారితోషికం రకం',
    perHour: 'గంటకు',
    perTask: 'పనికి',
    perShift: 'షిఫ్ట్‌కు',
    perDay: 'రోజుకు',
    requiredSkillsLabel: 'అవసరమైన నైపుణ్యాలు',
    landmarkAreaLabel: 'తమిళనాడు నగరం / ప్రాంతం / ప్రదేశం',
    clickMapInstruction: 'సరైన స్థానాన్ని ఎంచుకోవడానికి మ్యాప్‌పై క్లిక్ చేయండి లేదా ఎంచుకోండి',
    publishJobBtn: 'గిగ్‌ను ప్రచురించండి',

    // Categories
    catDelivery: 'డెలివరీ మరియు రవాణా',
    catStoreHelper: 'స్టోర్ సహాయకుడు & రిటైల్',
    catDataEntry: 'డేటా ఎంట్రీ & కార్యాలయం',
    catEventHand: 'ఈవెంట్ మరియు క్యాటరింగ్ సహాయం',
    catTutoring: 'ట్యూషన్ & మద్దతు',
    catElectrical: 'సాంకేతిక & నిర్వహణ',

    // Filter & Search
    searchPlaceholder: 'పని, నైపుణ్యం లేదా తమిళనాడు స్థలాన్ని వెతకండి...',
    categoryFilter: 'వర్గం',
    allCategories: 'అన్ని వర్గాలు',
    minPayFilter: 'కనీస పారితోషికం (₹)',
    noJobsFound: 'ఎంచుకున్న దూరంలో పనులు లేవు. రాడార్ దూరాన్ని పెంచండి!',

    // Match breakdown
    breakdownTitle: 'మ్యాచ్ స్కోర్ వివరాలు',
    skillFit: 'నైపుణ్య సరిపోలిక',
    distanceFit: 'దూర సరిపోలిక',
    scheduleFit: 'సమయ సరిపోలిక',
    matchedSkillsLabel: 'సరిపోలిన నైపుణ్యాలు',
    missingSkillsLabel: 'లేని నైపుణ్యాలు',

    // Hybrid AI Matching & Explainability
    whyRecommended: 'ఈ సరిపోలిక ఎందుకు సిఫార్సు చేయబడింది?',
    hybridMatchBreakdown: 'హైబ్రిడ్ AI మ్యాచ్ వివరాలు',
    skillSimilarityLabel: 'నైపుణ్య సమానత',
    distanceFactorLabel: 'దూరం',
    availabilityFactorLabel: 'లభ్యత',
    experienceFactorLabel: 'అనుభవం',
    localDemandFactorLabel: 'స్థానిక డిమాండ్',
    reliabilityFactorLabel: 'విశ్వసనీయత',

    // Phase 3 — NLP Requirement Understanding
    aiRequirementAssistant: 'AI అవసరాల సహాయకుడు',
    aiFastDraftTitle: 'సహజ భాషతో వేగవంతమైన డ్రాఫ్ట్',
    aiInputPlaceholder: 'ఉదా: మదురై దగ్గర రేపు సాయంత్రం అనుభవజ్ఞుడైన ఏసీ టెక్నీషియన్ కావాలి',
    extractWithAiBtn: 'AIతో విశ్లేషించండి',
    analyzingWithAi: 'విశ్లేషిస్తోంది...',
    extractedDetailsTitle: 'AI సంగ్రహించిన వివరాలు — పరిశీలించండి & సవరించండి',
    extractedDetailsSubtitle: 'పోస్టింగ్‌కు వర్తించే ముందు ఫీల్డ్‌లను ధృవీకరించండి',
    applyExtractedBtn: 'వివరాలను వర్తింపజేయండి',
    dismissExtractedBtn: 'రద్దు చేయి',
    detectedIntent: 'ఉద్దేశం',
    hiringWorkerIntent: 'ఉద్యోగి నియామకం',
    detectedExperience: 'అనుభవం',
    detectedShift: 'సమయం / షిఫ్ట్',
    detectedLocation: 'స్థానం',
    detectedPayout: 'వేతనం',
    missingInformationAlert: 'శ్రద్ధ వహించండి',
    confirmBeforePostNotice: 'మీ నిర్ధారణ లేకుండా ఎటువంటి AI సమాచారం పోస్ట్ చేయబడదు.',
    aiSearchParsed: 'AI సహజ భాష శోధన',
    // Phase 6 — Voice & Multilingual AI
    voiceSearchBtn: 'వాయిస్ శోధన',
    voiceFastDraftBtn: 'అవసరాన్ని మాట్లాడండి',
    voiceListening: 'వింటోంది... ఇప్పుడు మాట్లాడండి',
    voiceListeningPrompt: 'తమిళం, తెలుగు, హిందీ లేదా ఆంగ్లంలో మాట్లాడండి లేదా టైప్ చేయండి',
    voicePermissionDenied: 'మైక్రోఫోన్ అనుమతి నిరోధించబడింది',
    voicePermissionHelp: 'దయచేసి బ్రౌజర్ సెట్టింగ్‌లలో మైక్రోఫోన్ అనుమతించండి లేదా నమూనా వాయిస్ ప్రయత్నించండి.',
    voiceUnsupported: 'స్పీచ్ రికగ్నిషన్ మద్దతు లేదు',
    voiceUnsupportedHelp: 'మీ బ్రౌజర్ Web Speech API కి మద్దతు ఇవ్వదు. దయచేసి టైప్ చేయండి.',
    voiceSamplePhrases: 'వాయిస్ AI నమూనా ఇన్‌పుట్‌లు',
    voiceTrySample: 'నమూనా వాయిస్ ప్రయత్నించండి',
    voiceProcessing: 'వాయిస్ ప్రాసెస్ అవుతోంది...',
    aiMultilingualActive: 'AI బహుభాషా & వాయిస్ యాక్టివ్',
    aiLanguageDetected: 'భాష గుర్తించబడింది',
    // Phase 7 — Trust & Safety
    trustSafetyTitle: 'విశ్వసనీయత & భద్రత అంచనా',
    trustPotentialRisk: 'సంభావ్య ప్రమాదం గుర్తించబడింది',
    trustVerifiedRecruiter: 'ధృవీకరించబడిన రిక్రూటర్',
    trustStandardVerification: 'ప్రామాణిక ధృవీకరణ',
    trustVerifiedListing: 'ధృవీకరించబడిన జాబితా',
    trustNewRecruiterNote: 'కొత్త రిక్రూటర్ ఖాతా — ప్రామాణిక భద్రతా తనిఖీలు ఉత్తీర్ణులయ్యారు. పనులు పూర్తయ్యే కొద్దీ రేటింగ్‌లు పెరుగుతాయి.',
    trustReportJobBtn: 'రిపోర్ట్ చేయండి',
    trustReportModalTitle: 'ఉద్యోగ పోస్టింగ్‌ను రిపోర్ట్ చేయండి',
    trustReportSuccessTitle: 'సమీక్ష కోసం నివేదిక లాగ్ చేయబడింది',
    trustNoAutoBanNotice: 'దుర్వినియోగాన్ని నివారించడానికి, నివేదికలు లేదా AI ఆధారంగా వినియోగదారులను ఎప్పటికీ స్వయంచాలకంగా నిషేధించబడరు.',

    // Phase 8 — Reliability & Continuous Feedback
    workerReliabilityTitle: 'కార్మికుల విశ్వసనీయత & ఖ్యాతి',
    reliabilityScoreLabel: 'విశ్వసనీయత స్కోరు',
    reliabilityTierLabel: 'ఖ్యాతి స్థాయి',
    completionRateLabel: 'పని పూర్తి రేటు',
    continuousFeedbackLabel: 'నిరంతర ఫీడ్‌బ్యాక్ చక్రం',
    verifiedReviewsLabel: 'ధృవీకరించబడిన సమీక్షలు',
    newWorkerBaselineNote: 'కొత్త కార్మికుల ప్రాథమిక స్కోరు వర్తించబడింది — Talent2Task లో విశ్వసనీయ రికార్డు నిర్మించబడుతుంది.',

    // Community Demand Modal
    demandModalTitle: 'కమ్యూనిటీ డిమాండ్ & స్కిల్ ట్రెండ్స్',
    demandModalSubtitle: 'కాట్పాడి, CMC, VIT మరియు సతువాచారిలో ప్రత్యక్ష డిమాండ్ విశ్లేషణ',
    demandRegionBadge: 'తమిళనాడు రియల్-టైమ్ AI రాడార్',
    topInDemandRole: 'అత్యధిక డిమాండ్ ఉన్న పని',
    avgHourlyPayout: 'సగటు గంట పారితోషికం',
    peakHiringWindows: 'గరిష్ట నియామక సమయాలు',
    hourlyPaySub: 'అదే రోజున తక్షణ పారితోషికం',
    peakHiringSub: 'సౌకర్యవంతమైన పార్ట్-టైమ్ షిఫ్టులు',
    skillDemandRanking: 'తమిళనాడులో డిమాండ్ ఉన్న నైపుణ్యాలు & వేతనం',
    openGigsSuffix: 'యాక్టివ్ గిగ్‌లు',
    topAreaLabel: 'ప్రధాన ప్రాంతం:',
    growthLabel: 'వృద్ధి:',
    demandActualTitle: 'ప్రస్తుత స్థానిక డిమాండ్',
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

    // Feedback Modal
    feedbackTitle: 'అనుభవాన్ని రేట్ చేయండి మరియు సమీక్షించండి',
    feedbackSubtitle: 'కమ్యూనిటీ నమ్మకాన్ని పెంచడానికి మరియు భవిష్యత్ AI మ్యాచ్‌ను మెరుగుపరచడానికి సహాయపడండి',
    ratingScoreLabel: 'మొత్తం రేటింగ్',
    feedbackTagsLabel: 'ఏది బాగుంది?',
    commentLabel: 'వివరణాత్మక అభిప్రాయం',
    commentPlaceholder: 'సమయపాలన, నైపుణ్యం మరియు పని నాణ్యత గురించిన వివరాలను పంచుకోండి...',
    submitReviewBtn: 'ఫీడ్‌బ్యాక్ సమర్పించండి',

    // SQLite Console Modal
    sqlConsoleTitle: 'SQLite బ్రౌజర్ WASM కన్సోల్',
    sqlConsoleSubtitle: 'స్థానిక ఆఫ్‌లైన్ SQLite డేటాబేస్‌లో క్వెరీలను అమలు చేయండి',
    sqlEngineBadge: 'SQLite 3 ఇంజిన్ యాక్టివ్‌గా ఉంది',
    presetQueriesLabel: 'త్వరిత SQL ప్రీసెట్‌లు',
    executeBtn: 'క్వెరీని అమలు చేయండి',
    exportBtn: 'డేటాబేస్‌ను డౌన్‌లోడ్ చేయండి',
    resetBtn: 'డేటాను రీసెట్ చేయండి',
    execTime: 'అమలు సమయం',
    rowsReturned: 'వరుసలు వచ్చాయి',
    noResults: 'క్వెరీ విజయవంతంగా అమలు చేయబడింది, ఫలితాలు లేవు.',

    // Footer & Toasts
    footerTagline: 'సరైన ప్రతిభ. సరైన పని. నిజమైన ప్రభావం.',
    footerEngineDesc: 'హైపర్-లోకల్ గిగ్ డిస్కవరీ ఇంజిన్ — తమిళనాడు',
    toastClaimSuccess: '🎉 పని స్వీకరించబడింది! రిక్రూటర్‌కు సంప్రదింపు సమాచారం పంపబడింది.',
    toastStatusUpdated: 'స్థితి నవీకరించబడింది:',
    toastJobDeleted: 'గిగ్ తొలగించబడింది.',
    toastJobPosted: '🚀 కొత్త గిగ్ పోస్ట్ చేయబడింది మరియు తమిళనాడు రాడార్‌లో ప్రత్యక్షంగా ఉంది!',
    toastProfileUpdated: '✅ ప్రొఫైల్ మరియు GPS నవీకరించబడ్డాయి.',
    toastSkillAdded: 'జోడించబడింది! AI మ్యాచ్ స్కోర్ తిరిగి లెక్కించబడింది.',
    toastReviewSaved: '⭐ రేటింగ్ సేవ్ చేయబడింది! కమ్యూనిటీ నమ్మకం నవీకరించబడింది.',
    nextStepBtn: 'తరువాత',
    backStepBtn: 'వెనుకకు',
    stepAccountInfo: '1. ఖాతా వివరాలు',
    stepLocationExperience: '2. అనుభవం & స్థానం',
    stepLocationDetails: '2. స్థాన వివరాలు',
    selectRoleLabel: 'మీ పాత్రను ఎంచుకోండి',
    phoneExact10DigitsError: 'దయచేసి సరిగ్గా 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.',
    passwordRegexError: 'పాస్‌వర్డ్ 8-12 అక్షరాల పొడవు ఉండాలి మరియు కనీసం ఒక సంఖ్య మరియు ఒక ప్రత్యేక అక్షరాన్ని కలిగి ఉండాలి.',
    passwordRegexHint: '8-12 అక్షరాలు, కనీసం 1 సంఖ్య & 1 ప్రత్యేక అక్షరం'
  }
};

// Comprehensive dynamic translation dictionaries for content across languages
const CONTENT_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {},
  ta: {
    // Tamil Nadu Districts & Key Cities
    'Sivakasi': 'சிவகாசி',
    'Chennai': 'சென்னை',
    'Coimbatore': 'கோயம்புத்தூர்',
    'Madurai': 'மதுரை',
    'Tiruchirappalli (Trichy)': 'திருச்சிராப்பள்ளி (திருச்சி)',
    'Tiruchirappalli': 'திருச்சிராப்பள்ளி',
    'Trichy': 'திருச்சி',
    'Salem': 'சேலம்',
    'Tirunelveli': 'திருநெல்வேலி',
    'Vellore': 'வேலூர்',
    'Tiruppur': 'திருப்பூர்',
    'Erode': 'ஈரோடு',
    'Thanjavur': 'தஞ்சாவூர்',
    'Thoothukudi (Tuticorin)': 'தூத்துக்குடி (டியூட்டிகாரின்)',
    'Thoothukudi': 'தூத்துக்குடி',
    'Tuticorin': 'தூத்துக்குடி',
    'Kanyakumari (Nagercoil)': 'கன்னியாகுமரி (நாகர்கோவில்)',
    'Kanyakumari': 'கன்னியாகுமரி',
    'Nagercoil': 'நாகர்கோவில்',
    'Ariyalur': 'அரியலூர்',
    'Chengalpattu': 'செங்கல்பட்டு',
    'Cuddalore': 'கடலூர்',
    'Dharmapuri': 'தருமபுரி',
    'Dindigul': 'திண்டுக்கல்',
    'Hosur': 'ஓசூர்',
    'Kallakurichi': 'கள்ளக்குறிச்சி',
    'Kanchipuram': 'காஞ்சிபுரம்',
    'Karaikudi': 'காரைக்குடி',
    'Karur': 'கரூர்',
    'Kodaikanal': 'கொடைக்கானல்',
    'Krishnagiri': 'கிருஷ்ணகிரி',
    'Kumbakonam': 'கும்பகோணம்',
    'Mayiladuthurai': 'மயிலாடுதுறை',
    'Nagapattinam': 'நாகப்பட்டினம்',
    'Namakkal': 'நாமக்கல்',
    'Neyveli': 'நெய்வேலி',
    'Nilgiris (Ooty)': 'நீலகிரி (ஊட்டி)',
    'Nilgiris': 'நீலகிரி',
    'Ooty': 'ஊட்டி',
    'Perambalur': 'பெரம்பலூர்',
    'Pollachi': 'பொள்ளாச்சி',
    'Pudukkottai': 'புதுக்கோட்டை',
    'Ramanathapuram': 'ராமநாதபுரம்',
    'Rameswaram': 'ராமேஸ்வரம்',
    'Ranipet': 'ராணிப்பேட்டை',
    'Sivaganga': 'சிவகங்கை',
    'Tenkasi': 'தென்காசி',
    'Theni': 'தேனி',
    'Tirupathur': 'திருப்பத்தூர்',
    'Tiruvallur': 'திருவள்ளூர்',
    'Tiruvannamalai': 'திருவண்ணாமலை',
    'Tiruvarur': 'திருவாரூர்',
    'Viluppuram': 'விழுப்புரம்',
    'Virudhunagar': 'விருதுநகர்',
    'Tamil Nadu': 'தமிழ்நாடு',
    'All Tamil Nadu (Statewide)': 'முழு தமிழ்நாடு (மாநிலம் தழுவிய)',
    'All Tamil Nadu': 'முழு தமிழ்நாடு',

    // Regional Skills & Industrial Trades
    'Offset Printing Machine Operator & Color Matcher': 'ஆஃப்செட் பிரிண்டிங் ஆபரேட்டர் & கலர் மேட்சர்',
    'Offset Printing Machine Operator': 'ஆஃப்செட் பிரிண்டிங் இயந்திர ஆபரேட்டர்',
    'Color Matching & Quality Inspection': 'வண்ணப் பொருத்தம் & தர ஆய்வு',
    'Safety Matchbox & Carton Assembly Packaging Hand': 'தீப்பெட்டி & அட்டைப்பெட்டி பேக்கிங் உதவியாளர்',
    'Carton Packing & Assembly': 'அட்டைப்பெட்டி பேக்கிங் & அசெம்பிளி',
    'Industrial AC & Ventilation Maintenance Technician': 'தொழில்துறை ஏசி மற்றும் காற்றோட்ட பராமரிப்பு தொழில்நுட்ப வல்லுநர்',
    'Air-conditioner servicing technician': 'ஏர் கண்டிஷனர் சர்வீஸ் டெக்னீஷியன்',
    'Electrical safety': 'மின் பாதுகாப்பு',
    'Local Express Delivery Rider (Sivakasi Town & Thiruthangal)': 'உள்ளூர் விரைவு டெலிவரி ரைடர் (சிவகாசி & திருத்தங்கல்)',
    'Retail Stationery Billing & Inventory Assistant': 'ஸ்டேஷனரி பில்லிங் மற்றும் சரக்கு உதவியாளர்',
    'Offset Printing Darkroom Plate Maker & Assistant': 'ஆஃப்செட் பிரிண்டிங் பிளேட் மேக்கர் & உதவியாளர்',
    'Quality Inspection': 'தர பரிசோதனை',
    'Sattur Road Printing Zone, Sivakasi': 'சாத்தூர் சாலை அச்சு மண்டலம், சிவகாசி',
    'Sattur Road Printing Zone': 'சாத்தூர் சாலை அச்சு மண்டலம்',
    'Near Sivakasi New Bus Stand, Sivakasi': 'சிவகாசி புதிய பேருந்து நிலையம் அருகில்',
    'Near Sivakasi New Bus Stand': 'சிவகாசி புதிய பேருந்து நிலையம் அருகில்',
    'Sivakasi Fireworks & Printing Hub, Sivakasi': 'சிவகாசி பட்டாசு & அச்சு மையம்',
    'Sivakasi Fireworks & Printing Hub': 'சிவகாசி பட்டாசு & அச்சு மையம்',
    'Thiruthangal Road, Sivakasi': 'திருத்தங்கல் சாலை, சிவகாசி',
    'Thiruthangal Road': 'திருத்தங்கல் சாலை',
    'Car Street Wholesale Market, Sivakasi': 'தேரடி மொத்த விற்பனை சந்தை, சிவகாசி',
    'Car Street Wholesale Market': 'தேரடி மொத்த விற்பனை சந்தை',

    // Skills
    'Driving': 'ஓட்டுதல்',
    'Tamil Speaking': 'தமிழ் பேசுதல்',
    'English Speaking': 'ஆங்கிலம் பேசுதல்',
    'Hindi Speaking': 'ஹிந்தி பேசுதல்',
    'Telugu Speaking': 'தெலுங்கு பேசுதல்',
    'Basic Accounts': 'அடிப்படை கணக்குகள்',
    'Inventory': 'சரக்கு மேலாண்மை',
    'Data Entry': 'தரவு உள்ளீடு',
    'Computer Basics': 'அடிப்படை கணினி',
    'Delivery': 'டெலிவரி',
    'Smartphone Proficient': 'ஸ்மார்ட்போன் பயன்பாடு',
    'Physically Active': 'உடல் தகுதி',
    'Customer Service': 'வாடிக்கையாளர் சேவை',
    'Event Setup': 'நிகழ்வு அமைப்பு',
    'Cooking / Catering': 'சமையல் / கேட்டரிங்',
    'Electrician Basics': 'மின்சார பணி',
    'Retail Management': 'சில்லறை மேலாண்மை',
    'Logistics': 'லாஜிஸ்டிக்ஸ்',
    'Healthcare Ops': 'சுகாதார பணிகள்',

    // Categories & Custom Job Titles
    'Store Helper': 'கடை உதவியாளர்',
    'Store': 'கடை',
    'Plumbing': 'பிளம்பிங்',
    'Plumber': 'பிளம்பர்',
    'Electrician': 'மின்சார பணியாளர்',
    'Event Hand': 'நிகழ்வு உதவி',
    'Tutoring': 'பயிற்றுவிப்பு',
    'Electrical': 'மின்சார பணி',
    'Cleaning': 'சுத்தம் செய்தல்',
    'Housekeeping': 'வீட்டுப் பராமரிப்பு',
    'HOUSEKEEPING': 'வீட்டுப் பராமரிப்பு',
    'Cleaning & Housekeeping': 'சுத்தம் செய்தல் & பராமரிப்பு',
    'needed': 'தேவைப்படுகிறது',
    'Need plumber': 'பிளம்பர் தேவைப்படுகிறது',
    'Need electrician': 'மின்சார பணியாளர் தேவைப்படுகிறது',
    'Store Helper Needed': 'கடை உதவியாளர் தேவைப்படுகிறது',
    'Plumbing Helper Needed': 'பிளம்பிங் உதவியாளர் தேவைப்படுகிறது',
    'Delivery Helper Needed': 'டெலிவரி உதவியாளர் தேவைப்படுகிறது',
    'Electrician Helper Needed': 'மின்சார உதவியாளர் தேவைப்படுகிறது',
    'Housekeeping Helper Needed': 'வீட்டுப் பராமரிப்பு உதவியாளர் தேவைப்படுகிறது',
    'Event Hand Needed': 'நிகழ்வு உதவியாளர் தேவைப்படுகிறது',
    'Tutoring Needed': 'ஆசிரியர் தேவைப்படுகிறது',
    'Catering Helper Needed': 'கேட்டரிங் உதவியாளர் தேவைப்படுகிறது',
    'Security Guard Needed': 'பாதுகாப்பு காவலர் தேவைப்படுகிறது',

    // Full Card Titles & Descriptions
    'Fresh Vegetables Sorter & Early Morning Packer': 'புதிய காய்கறி வரிசைப்படுத்துபவர் & அதிகாலை பேக்கர்',
    'Cultural Exhibition & Handloom Stall Assistant': 'கலாச்சார கண்காட்சி & கைத்தறி அரங்கு உதவியாளர்',
    'Sort, weigh, and pack early morning wholesale vegetables from Thottapalayam Mandi for retail delivery.': 'தோட்டப்பாளையம் மண்டியில் இருந்து சில்லறை விற்பனைக்கான புதிய காய்கறிகளை வரிசைப்படுத்தி, எடையும் பேக்கிங்கும் செய்ய வேண்டும்.',
    'Assist in managing customer flow, distributing pamphlets, and product display at the Vellore Fort ground handloom expo.': 'வேலூர் கோட்டை மைதான கைத்தறி கண்காட்சியில் வாடிக்கையாளர்களை நிர்வகித்தல், துண்டுப் பிரசுரங்கள் விநியோகம் செய்தல் மற்றும் பொருட்களைக் காட்சிப்படுத்துதல்.',
    'Looking for a reliable Housekeeping helper in Vellore for local shift/task work.': 'வேலூரில் உள்ளூர் ஷிஃப்ட்/பணிக்கு நம்பகமான வீட்டுப் பராமரிப்பு உதவியாளர் தேவை.',
    'Thottapalayam Vegetable Market': 'தோட்டப்பாளையம் காய்கறி சந்தை',
    'Vellore Fort Grounds, Officers Line': 'வேலூர் கோட்டை மைதானம், அதிகாரிகள் சாலை',
    'Vellore Fort Grounds': 'வேலூர் கோட்டை மைதானம்',
    'Officers Line': 'அதிகாரிகள் சாலை',
    'Thottapalayam Mandi': 'தோட்டப்பாளையம் மண்டி',
    'Thottapalayam': 'தோட்டப்பாளையம்',
    'Mandi': 'மண்டி',
    'Fresh': 'புதிய',
    'Vegetables': 'காய்கறிகள்',
    'Sorter': 'வரிசைப்படுத்துபவர்',
    'Early': 'அதிகாலை',
    'Packer': 'பேக்கர்',
    'Cultural': 'கலாச்சார',
    'Exhibition': 'கண்காட்சி',
    'Handloom': 'கைத்தறி',
    'Stall': 'அரங்கு',

    // Time Slots
    'Morning': 'காலை',
    'Afternoon': 'மதியம்',
    'Evening': 'மாலை',
    'Night': 'இரவு',
    'Weekend': 'வார இறுதி',
    'Immediate': 'உடனடி',

    // Payout units
    'hour': 'மணி',
    'task': 'பணி',
    'shift': 'ஷிஃப்ட்',
    'day': 'நாள்',

    // Landmarks
    'Katpadi, near VIT Main Gate': 'விஐடி முதன்மை வாயில் அருகில், காட்பாடி',
    'Gandhi Nagar Main Road, Katpadi': 'காந்தி நகர் மெயின் ரோடு, காட்பாடி',
    'CMC Hospital, Ida Scudder Rd': 'சிஎம்சி மருத்துவமனை, ஐடா ஸ்கடர் சாலை',
    'Sathuvachari Phase 1, Vellore': 'சத்துவாச்சாரி பகுதி 1, வேலூர்',
    'Katpadi Railway Junction': 'காட்பாடி ரயில் நிலையம்',
    'VIT Main Gate, Katpadi': 'விஐடி முதன்மை வாயில், காட்பாடி',
    'CMC Hospital, Ida Scudder Road': 'சிஎம்சி மருத்துவமனை, ஐடா ஸ்கடர் சாலை',
    'Bagayam CMC Campus': 'பாகாயம் சிஎம்சி வளாகம்',
    'Vellore Fort Main Gate': 'வேலூர் கோட்டை முதன்மை வாயில்',
    'Sathuvachari Phase 1': 'சத்துவாச்சாரி பகுதி 1',
    'Thorapadi Junction': 'தோரப்பாடி சந்திப்பு',
    'Old Bus Stand, Vellore Central': 'பழைய பேருந்து நிலையம், வேலூர் மத்திய பகுதி',
    'New Bus Stand, Katpadi Road': 'புதிய பேருந்து நிலையம், காட்பாடி சாலை',
    'Sripuram Golden Temple Road': 'ஸ்ரீபுரம் பொற்கோயில் சாலை',
    'Katpadi Junction': 'காட்பாடி சந்திப்பு',
    'Katpadi': 'காட்பாடி',
    'Vellore Central': 'வேலூர் மையம்',

    // Initial Job Titles
    'Instant Delivery Rider (Campus & Station Area)': 'கேம்பஸ் மற்றும் ரயில்வே பகுதி உடனடி டெலிவரி ரைடர்',
    'Supermarket Inventory & Evening Billing Hand': 'சூப்பர் மார்க்கெட் சரக்கு & மாலை நேர பில்லிங் உதவி',
    'Hospital OPD Patient Guide & Queue Coordinator': 'மருத்துவமனை புறநோயாளி வழிகாட்டி & வரிசை ஒருங்கிணைப்பாளர்',
    'Medical Invoice & Inventory Data Entry': 'மருத்துவ ரசீது & சரக்கு தரவு உள்ளீடு',
    'Evening Parcel Sorter & Load Dispatcher': 'மாலை பார்சல் வரிசைப்படுத்துபவர் & ஏற்று அனுப்புபவர்',
    'College Fest Sound & Stage Setup Assistant': 'கல்லூரி விழா ஒலி மற்றும் மேடை அமைப்பு உதவியாளர்',
    'Primary School Math & English Evening Tutor': 'தொடக்கப் பள்ளி கணிதம் மற்றும் ஆங்கில மாலை நேர ஆசிரியர்',
    'Emergency Hostel Air Cooler & Wiring Hand': 'அவசர விடுதி ஏர் கூலர் & வயரிங் உதவி',

    // Initial Job Descriptions
    'Deliver food and urgent parcel packages from Katpadi Junction restaurants to student residences near VIT Main Gate and Chittoor bus stop. Two-wheeler preferred.': 'காட்பாடி சந்திப்பு உணவகங்களிலிருந்து விஐடி மெயின் கேட் மற்றும் சித்தூர் பேருந்து நிறுத்தம் அருகிலுள்ள மாணவர் குடியிருப்புகளுக்கு உணவு மற்றும் அவசர பார்சல்களை டெலிவரி செய்ய வேண்டும். இருசக்கர வாகனம் விரும்பத்தக்கது.',
    'Assist in barcode scanning, evening shelf restocking, and counter packing during rush hours at our Gandhi Nagar main branch.': 'எங்கள் காந்தி நகர் கிளையில் நெரிசலான மாலை நேரங்களில் பார்கோடு ஸ்கேனிங், அலமாரி அடுக்குதல் மற்றும் பேக்கிங் பணிகளில் உதவ வேண்டும்.',
    'Guide outstation patients arriving at CMC Vellore Ida Scudder gate to diagnostic labs and appointment counters. Trilingual ability (Tamil/Hindi/English) is a huge bonus.': 'சிஎம்சி வேலூர் ஐடா ஸ்கடர் வாயிலுக்கு வரும் வெளிமாநில நோயாளிகளை ஆய்வகங்கள் மற்றும் முன்பதிவு கவுண்டர்களுக்கு வழிகாட்ட வேண்டும். தமிழ்/ஹிந்தி/ஆங்கிலம் தெரிந்திருப்பது கூடுதல் நன்மை.',
    'Enter supplier bills into local store ERP software. Work from our air-conditioned office in Sathuvachari Phase 1 near Collectorate.': 'வழங்குநர் பில்களை உள்ளூர் ஈஆர்பி மென்பொருளில் உள்ளிட வேண்டும். ஆட்சியர் அலுவலகம் அருகிலுள்ள சத்துவாச்சாரி அலுவலகத்தில் பணி.',
    'Sort inbound courier boxes from Chennai/Bengaluru trains at Katpadi Railway Parcel Office platform 1 siding.': 'சென்னை/பெங்களூரு ரயில்களில் இருந்து வரும் பார்சல்களை காட்பாடி ரயில் நிலைய பார்சல் அலுவலகத்தில் வரிசைப்படுத்த வேண்டும்.',

    // Feedback tags
    'Punctual': 'நேரம் தவறாமை',
    'Skilled Worker': 'திறமையான பணியாளர்',
    'Friendly & Polite': 'நட்பான மற்றும் கண்ணியமான',
    'Fast Execution': 'வேகமான செயல்பாடு',
    'Clean & Organized': 'சுத்தமான மற்றும் ஒழுங்கான',
    'Followed Instructions': 'வழிகாட்டுதல்களைப் பின்பற்றியவர்',
    'Prompt Payout': 'உடனடி ஊதியம்',
    'Clear Instructions': 'தெளிவான வழிகாட்டுதல்கள்',
    'Supportive Work Environment': 'ஆதரவான பணிச்சூழல்',
    'Professional': 'தொழில்முறை அணுகுமுறை',
    'Accurate Description': 'துல்லியமான விளக்கம்',
    'Great Experience': 'சிறந்த அனுபவம்'
  },

  hi: {
    // Tamil Nadu Districts & Key Cities
    'Sivakasi': 'शिवकाशी',
    'Chennai': 'चेन्नई',
    'Coimbatore': 'कोयंबटूर',
    'Madurai': 'मदुरै',
    'Tiruchirappalli (Trichy)': 'तिरुचिरापल्ली (त्रिची)',
    'Tiruchirappalli': 'तिरुचिरापल्ली',
    'Trichy': 'त्रिची',
    'Salem': 'सलेम',
    'Tirunelveli': 'तिरुनेलवेली',
    'Vellore': 'वेल्लोर',
    'Tiruppur': 'तिरुपुर',
    'Erode': 'इरोड',
    'Thanjavur': 'तंजावुर',
    'Thoothukudi (Tuticorin)': 'तूतीकोरिन (थूथुकुडी)',
    'Thoothukudi': 'थूथुकुडी',
    'Tuticorin': 'तूतीकोरिन',
    'Kanyakumari (Nagercoil)': 'कन्याकुमारी (नागरकोइल)',
    'Kanyakumari': 'कन्याकुमारी',
    'Nagercoil': 'नागरकोइल',
    'Ariyalur': 'अरियालुर',
    'Chengalpattu': 'चेंगलपट्टू',
    'Cuddalore': 'कडलूर',
    'Dharmapuri': 'धर्मपुरी',
    'Dindigul': 'डिंडीगुल',
    'Hosur': 'होसुर',
    'Kallakurichi': 'कल्लाकुरिची',
    'Kanchipuram': 'कांचीपुरम',
    'Karaikudi': 'कराईकुडी',
    'Karur': 'करूर',
    'Kodaikanal': 'कोडाइकनाल',
    'Krishnagiri': 'कृष्णगिरि',
    'Kumbakonam': 'कुंभकोणम',
    'Mayiladuthurai': 'मयिलादुथुराई',
    'Nagapattinam': 'नागापट्टिनम',
    'Namakkal': 'नमक्कल',
    'Neyveli': 'नेवेली',
    'Nilgiris (Ooty)': 'नीलगिरि (ऊटी)',
    'Nilgiris': 'नीलगिरि',
    'Ooty': 'ऊटी',
    'Perambalur': 'पेराम्बलुर',
    'Pollachi': 'पोलाची',
    'Pudukkottai': 'पुदुक्कोट्टई',
    'Ramanathapuram': 'रामनाथपुरम',
    'Rameswaram': 'रामेश्वरम',
    'Ranipet': 'रानीपेट',
    'Sivaganga': 'शिवगंगा',
    'Tenkasi': 'तेनकासी',
    'Theni': 'थेनी',
    'Tirupathur': 'तिरुपत्तूर',
    'Tiruvallur': 'तिरुवल्लूर',
    'Tiruvannamalai': 'तिरुवन्नामलाई',
    'Tiruvarur': 'तिरुवारूर',
    'Viluppuram': 'विलुप्पुरम',
    'Virudhunagar': 'विरुद्धनगर',
    'Tamil Nadu': 'तमिलनाडु',
    'All Tamil Nadu (Statewide)': 'पूरा तमिलनाडु (राज्यव्यापी)',
    'All Tamil Nadu': 'पूरा तमिलनाडु',

    // Regional Skills & Industrial Trades
    'Offset Printing Machine Operator & Color Matcher': 'ऑफसेट प्रिंटिंग ऑपरेटर और रंग मिलान',
    'Offset Printing Machine Operator': 'ऑफसेट प्रिंटिंग मशीन ऑपरेटर',
    'Color Matching & Quality Inspection': 'रंग मिलान और गुणवत्ता निरीक्षण',
    'Safety Matchbox & Carton Assembly Packaging Hand': 'माचिस और कार्टन असेंबली पैकेजिंग सहायक',
    'Carton Packing & Assembly': 'कार्टन पैकिंग और असेंबली',
    'Industrial AC & Ventilation Maintenance Technician': 'औद्योगिक एसी और वेंटिलेशन रखरखाव तकनीशियन',
    'Air-conditioner servicing technician': 'एयर कंडीशनर सर्विसिंग तकनीशियन',
    'Electrical safety': 'विद्युत सुरक्षा',
    'Local Express Delivery Rider (Sivakasi Town & Thiruthangal)': 'स्थानीय एक्सप्रेस डिलीवरी राइडर (शिवकाशी और थिरुथंगल)',
    'Retail Stationery Billing & Inventory Assistant': 'स्टेशनरी बिलिंग और स्टॉक सहायक',
    'Offset Printing Darkroom Plate Maker & Assistant': 'ऑफसेट प्रिंटिंग डार्करूम प्लेट मेकर और सहायक',
    'Quality Inspection': 'गुणवत्ता निरीक्षण',
    'Sattur Road Printing Zone, Sivakasi': 'सत्तूर रोड प्रिंटिंग जोन, शिवकाशी',
    'Sattur Road Printing Zone': 'सत्तूर रोड प्रिंटिंग जोन',
    'Near Sivakasi New Bus Stand, Sivakasi': 'शिवकाशी नए बस स्टैंड के पास',
    'Near Sivakasi New Bus Stand': 'शिवकाशी नए बस स्टैंड के पास',
    'Sivakasi Fireworks & Printing Hub, Sivakasi': 'शिवकाशी आतिशबाजी और प्रिंटिंग हब',
    'Sivakasi Fireworks & Printing Hub': 'शिवकाशी आतिशबाजी और प्रिंटिंग हब',
    'Thiruthangal Road, Sivakasi': 'थिरुथंगल रोड, शिवकाशी',
    'Thiruthangal Road': 'थिरुथंगल रोड',
    'Car Street Wholesale Market, Sivakasi': 'कार स्ट्रीट थोक बाजार, शिवकाशी',
    'Car Street Wholesale Market': 'कार स्ट्रीट थोक बाजार',

    // Skills
    'Driving': 'ड्राइविंग',
    'Tamil Speaking': 'तमिल बोलना',
    'English Speaking': 'अंग्रेज़ी बोलना',
    'Hindi Speaking': 'हिन्दी बोलना',
    'Telugu Speaking': 'तेलुगू बोलना',
    'Basic Accounts': 'बुनियादी लेखा',
    'Inventory': 'स्टॉक प्रबंधन',
    'Data Entry': 'डेटा एंट्री',
    'Computer Basics': 'कंप्यूटर बेसिक',
    'Delivery': 'डिलीवरी',
    'Smartphone Proficient': 'स्मार्टफोन में निपुण',
    'Physically Active': 'शारीरिक रूप से सक्रिय',
    'Customer Service': 'ग्राहक सेवा',
    'Event Setup': 'इवेंट सेटअप',
    'Cooking / Catering': 'खाना बनाना / कैटरिंग',
    'Electrician Basics': 'इलेक्ट्रीशियन कार्य',
    'Retail Management': 'रिटेल प्रबंधन',
    'Logistics': 'लॉजिस्टिक्स',
    'Healthcare Ops': 'स्वास्थ्य सेवा कार्य',

    // Categories & Custom Job Titles
    'Store Helper': 'दुकान सहायक',
    'Store': 'दुकान',
    'Plumbing': 'प्लंबिंग',
    'Plumber': 'प्लंबर',
    'Electrician': 'इलेक्ट्रीशियन',
    'Event Hand': 'इवेंट सहायता',
    'Tutoring': 'ट्यूशन',
    'Electrical': 'इलेक्ट्रिकल',
    'Cleaning': 'सफाई',
    'Housekeeping': 'हाउसकीपिंग',
    'HOUSEKEEPING': 'हाउसकीपिंग',
    'Cleaning & Housekeeping': 'सफाई और हाउसकीपिंग',
    'needed': 'की आवश्यकता है',
    'Need plumber': 'प्लंबर की आवश्यकता है',
    'Need electrician': 'इलेक्ट्रीशियन की आवश्यकता है',
    'Store Helper Needed': 'दुकान सहायक की आवश्यकता है',
    'Plumbing Helper Needed': 'प्लंबिंग सहायक की आवश्यकता है',
    'Delivery Helper Needed': 'डिलीवरी सहायक की आवश्यकता है',
    'Electrician Helper Needed': 'इलेक्ट्रिशियन सहायक की आवश्यकता है',
    'Housekeeping Helper Needed': 'हाउसकीपिंग सहायक की आवश्यकता है',
    'Event Hand Needed': 'इवेंट सहायक की आवश्यकता है',
    'Tutoring Needed': 'ट्यूटर की आवश्यकता है',
    'Catering Helper Needed': 'कैटरिंग सहायक की आवश्यकता है',
    'Security Guard Needed': 'सुरक्षा गार्ड की आवश्यकता है',

    // Full Card Titles & Descriptions
    'Fresh Vegetables Sorter & Early Morning Packer': 'ताज़ी सब्जी छांटने वाला और सुबह का पैकर',
    'Cultural Exhibition & Handloom Stall Assistant': 'सांस्कृतिक प्रदर्शनी और हथकरघा स्टॉल सहायक',
    'Sort, weigh, and pack early morning wholesale vegetables from Thottapalayam Mandi for retail delivery.': 'थोट्टापलायम मंडी से खुदरा बिक्री के लिए ताजी सब्जियों की छंटाई, वजन और पैकिंग करें।',
    'Assist in managing customer flow, distributing pamphlets, and product display at the Vellore Fort ground handloom expo.': 'वेल्लोर किला मैदान हथकरघा प्रदर्शनी में ग्राहकों को प्रबंधित करने और उत्पाद प्रदर्शन में सहायता करें।',
    'Looking for a reliable Housekeeping helper in Vellore for local shift/task work.': 'वेल्लोर में स्थानीय शिफ्ट/कार्य के लिए विश्वसनीय हाउसकीपिंग सहायक की आवश्यकता है।',
    'Thottapalayam Vegetable Market': 'थोट्टापलायम सब्जी मंडी',
    'Vellore Fort Grounds, Officers Line': 'वेल्लोर किला मैदान, ऑफिसर्स लाइन',
    'Vellore Fort Grounds': 'वेल्लोर किला मैदान',
    'Officers Line': 'ऑफिसर्स लाइन',
    'Thottapalayam Mandi': 'थोट्टापलायम मंडी',
    'Thottapalayam': 'थोट्टापलायम',
    'Mandi': 'मंडी',
    'Fresh': 'ताज़ी',
    'Vegetables': 'सब्जियां',
    'Sorter': 'छंटाई करने वाला',
    'Early': 'सुबह',
    'Packer': 'पैकर',
    'Cultural': 'सांस्कृतिक',
    'Exhibition': 'प्रदर्शनी',
    'Handloom': 'हथकरघा',
    'Stall': 'स्टॉल',

    // Time Slots
    'Morning': 'सुबह',
    'Afternoon': 'दोपहर',
    'Evening': 'शाम',
    'Night': 'रात',
    'Weekend': 'सप्ताहांत',
    'Immediate': 'तत्काल',

    // Payout units
    'hour': 'घंटा',
    'task': 'कार्य',
    'shift': 'शिफ्ट',
    'day': 'दिन',

    // Landmarks
    'Katpadi, near VIT Main Gate': 'वीआईटी मुख्य गेट के पास, काटपाडी',
    'Gandhi Nagar Main Road, Katpadi': 'गांधी नगर मेन रोड, काटपाडी',
    'CMC Hospital, Ida Scudder Rd': 'सीएमसी अस्पताल, इडा स्कडर रोड',
    'Sathuvachari Phase 1, Vellore': 'सतुवाचारी फेज़ 1, वेल्लोर',
    'Katpadi Railway Junction': 'काटपाडी रेलवे जंक्शन',
    'VIT Main Gate, Katpadi': 'वीआईटी मेन गेट, काटपाडी',
    'CMC Hospital, Ida Scudder Road': 'सीएमसी अस्पताल, इडा स्कडर रोड',
    'Bagayam CMC Campus': 'बागायम सीएमसी परिसर',
    'Vellore Fort Main Gate': 'वेल्लोर किला मेन गेट',
    'Sathuvachari Phase 1': 'सतुवाचारी फेज़ 1',
    'Thorapadi Junction': 'थोरपाडी जंक्शन',
    'Old Bus Stand, Vellore Central': 'पुराना बस स्टैंड, वेल्लोर सेंट्रल',
    'New Bus Stand, Katpadi Road': 'नया बस स्टैंड, काटपाडी रोड',
    'Sripuram Golden Temple Road': 'श्रीपुरम स्वर्ण मंदिर रोड',
    'Katpadi Junction': 'काटपाडी जंक्शन',
    'Katpadi': 'काटपाडी',
    'Vellore Central': 'वेल्लोर सेंट्रल',

    // Initial Job Titles
    'Instant Delivery Rider (Campus & Station Area)': 'कैंपस और स्टेशन क्षेत्र के लिए तत्काल डिलीवरी राइडर',
    'Supermarket Inventory & Evening Billing Hand': 'सुपरमार्केट स्टॉक और शाम बिलिंग सहायक',
    'Hospital OPD Patient Guide & Queue Coordinator': 'अस्पताल ओपीडी रोगी गाइड और कतार समन्वयक',
    'Medical Invoice & Inventory Data Entry': 'मेडिकल बिल और स्टॉक डेटा एंट्री',
    'Evening Parcel Sorter & Load Dispatcher': 'शाम पार्सल छंटाई और डिस्पैचर',
    'College Fest Sound & Stage Setup Assistant': 'कॉलेज फेस्ट साउंड और स्टेज सेटअप सहायक',
    'Primary School Math & English Evening Tutor': 'प्राथमिक विद्यालय गणित और अंग्रेजी शाम ट्यूटर',
    'Emergency Hostel Air Cooler & Wiring Hand': 'हॉस्टल एयर कूलर और वायरिंग सहायक',

    // Initial Job Descriptions
    'Deliver food and urgent parcel packages from Katpadi Junction restaurants to student residences near VIT Main Gate and Chittoor bus stop. Two-wheeler preferred.': 'काटपाडी जंक्शन के रेस्तरां से वीआईटी मेन गेट और चित्तूर बस स्टॉप के पास छात्र आवासों में भोजन और पार्सल पहुंचाएं।',
    'Assist in barcode scanning, evening shelf restocking, and counter packing during rush hours at our Gandhi Nagar main branch.': 'गांधी नगर मुख्य शाखा में भीड़ के समय बारकोड स्कैनिंग, शेल्फ रीस्टॉकिंग और पैकिंग में सहायता करें।',
    'Guide outstation patients arriving at CMC Vellore Ida Scudder gate to diagnostic labs and appointment counters. Trilingual ability (Tamil/Hindi/English) is a huge bonus.': 'सीएमसी वेल्लोर आने वाले मरीजों को लैब और काउंटर तक मार्गदर्शन करें। तमिल/हिंदी/अंग्रेजी का ज्ञान बड़ा लाभ है।',
    'Enter supplier bills into local store ERP software. Work from our air-conditioned office in Sathuvachari Phase 1 near Collectorate.': 'सतुवाचारी फेज़ 1 स्थित कार्यालय से स्थानीय स्टोर ईआरपी सॉफ्टवेयर में बिल प्रविष्ट करें।',
    'Sort inbound courier boxes from Chennai/Bengaluru trains at Katpadi Railway Parcel Office platform 1 siding.': 'काटपाडी रेलवे पार्सल कार्यालय में चेन्नई/बेंगलुरु ट्रेनों से आने वाले कूरियर बक्से छांटें।',

    // Feedback tags
    'Punctual': 'समयनिष्ठ',
    'Skilled Worker': 'कुशल कार्यकर्ता',
    'Friendly & Polite': 'विनम्र और मिलनसार',
    'Fast Execution': 'तेज़ काम',
    'Clean & Organized': 'साफ और व्यवस्थित',
    'Followed Instructions': 'निर्देशों का पालन किया',
    'Prompt Payout': 'त्वरित भुगतान',
    'Clear Instructions': 'स्पष्ट निर्देश',
    'Supportive Work Environment': 'सहायक कार्य वातावरण',
    'Professional': 'पेशेवर',
    'Accurate Description': 'सटीक विवरण',
    'Great Experience': 'शानदार अनुभव'
  },

  te: {
    // Tamil Nadu Districts & Key Cities
    'Sivakasi': 'శివకాశి',
    'Chennai': 'చెన్నై',
    'Coimbatore': 'కోయంబత్తూర్',
    'Madurai': 'మధురై',
    'Tiruchirappalli (Trichy)': 'తిరుచిరాపల్లి (త్రిచీ)',
    'Tiruchirappalli': 'తిరుచిరాపల్లి',
    'Trichy': 'త్రిచీ',
    'Salem': 'సేలం',
    'Tirunelveli': 'తిరునెల్వేలి',
    'Vellore': 'వెల్లూరు',
    'Tiruppur': 'తిరుప్పూర్',
    'Erode': 'ఈరోడ్',
    'Thanjavur': 'తంజావూరు',
    'Thoothukudi (Tuticorin)': 'తూత్తుకుడి',
    'Thoothukudi': 'తూత్తుకుడి',
    'Tuticorin': 'తూత్తుకుడి',
    'Kanyakumari (Nagercoil)': 'కన్యాకుమారి (నాగర్‌కోయిల్)',
    'Kanyakumari': 'కన్యాకుమారి',
    'Nagercoil': 'నాగర్‌కోయిల్',
    'Ariyalur': 'అరియలూర్',
    'Chengalpattu': 'చెంగల్పట్టు',
    'Cuddalore': 'కడలూరు',
    'Dharmapuri': 'ధర్మపురి',
    'Dindigul': 'దిండిగల్',
    'Hosur': 'హోసూరు',
    'Kallakurichi': 'కళ్లకురిచి',
    'Kanchipuram': 'కాంచీపురం',
    'Karaikudi': 'కారైకుడి',
    'Karur': 'కరూర్',
    'Kodaikanal': 'కొడైకెనాల్',
    'Krishnagiri': 'కృష్ణగిరి',
    'Kumbakonam': 'కుంభకోణం',
    'Mayiladuthurai': 'మయిలాడుదురై',
    'Nagapattinam': 'నాగపట్నం',
    'Namakkal': 'నమక్కల్',
    'Neyveli': 'నెయ్‌వేలి',
    'Nilgiris (Ooty)': 'నీలగిరి (ఊటీ)',
    'Nilgiris': 'నీలగిరి',
    'Ooty': 'ఊటీ',
    'Perambalur': 'పెరంబలూరు',
    'Pollachi': 'పొల్లాచి',
    'Pudukkottai': 'పుదుక్కోట్టై',
    'Ramanathapuram': 'రామనాథపురం',
    'Rameswaram': 'రామేశ్వరం',
    'Ranipet': 'రాణిపేట',
    'Sivaganga': 'శివగంగ',
    'Tenkasi': 'తెనకాశి',
    'Theni': 'తేని',
    'Tirupathur': 'తిరుపత్తూరు',
    'Tiruvallur': 'తిరువళ్లూరు',
    'Tiruvannamalai': 'తిరువణ్ణామలై',
    'Tiruvarur': 'తిరువారూరు',
    'Viluppuram': 'విలుప్పురం',
    'Virudhunagar': 'విరుదునగర్',
    'Tamil Nadu': 'తమిళనాడు',
    'All Tamil Nadu (Statewide)': 'మొత్తం తమిళనాడు (రాష్ట్రవ్యాప్త)',
    'All Tamil Nadu': 'మొత్తం తమిళనాడు',

    // Regional Skills & Industrial Trades
    'Offset Printing Machine Operator & Color Matcher': 'ఆఫ్‌సెట్ ప్రింటింగ్ ఆపరేటర్ మరియు కలర్ మ్యాచింగ్',
    'Offset Printing Machine Operator': 'ఆఫ్‌సెట్ ప్రింటింగ్ మెషిన్ ఆపరేటర్',
    'Color Matching & Quality Inspection': 'రంగు సరిపోలిక & నాణ్యత తనిఖీ',
    'Safety Matchbox & Carton Assembly Packaging Hand': 'అగ్గిపెట్టె & కార్టన్ ప్యాకింగ్ సహాయకుడు',
    'Carton Packing & Assembly': 'కార్టన్ ప్యాకింగ్ మరియు అసెంబ్లీ',
    'Industrial AC & Ventilation Maintenance Technician': 'పారిశ్రామిక ఏసీ & వెంటిలేషన్ నిర్వహణ టెక్నీషియన్',
    'Air-conditioner servicing technician': 'ఎయిర్ కండీషనర్ సర్వీసింగ్ టెక్నీషియన్',
    'Electrical safety': 'ఎలక్ట్రికల్ భద్రత',
    'Local Express Delivery Rider (Sivakasi Town & Thiruthangal)': 'లోకల్ ఎక్స్‌ప్రెస్ డెలివరీ రైడర్ (శివకాశి & తిరుతంగల్)',
    'Retail Stationery Billing & Inventory Assistant': 'స్టేషనరీ బిల్లింగ్ & స్టాక్ సహాయకుడు',
    'Offset Printing Darkroom Plate Maker & Assistant': 'ఆఫ్‌సెట్ ప్రింటింగ్ డార్క్‌రూమ్ ప్లేట్ మేకర్',
    'Quality Inspection': 'నాణ్యత తనిఖీ',
    'Sattur Road Printing Zone, Sivakasi': 'సాత్తూరు రోడ్ ప్రింటింగ్ జోన్, శివకాశి',
    'Sattur Road Printing Zone': 'సాత్తూరు రోడ్ ప్రింటింగ్ జోన్',
    'Near Sivakasi New Bus Stand, Sivakasi': 'శివకాశి కొత్త బస్ స్టాండ్ సమీపంలో',
    'Near Sivakasi New Bus Stand': 'శివకాశి కొత్త బస్ స్టాండ్ సమీపంలో',
    'Sivakasi Fireworks & Printing Hub, Sivakasi': 'శివకాశి బాణాసంచా & ప్రింటింగ్ హబ్',
    'Sivakasi Fireworks & Printing Hub': 'శివకాశి బాణాసంచా & ప్రింటింగ్ హబ్',
    'Thiruthangal Road, Sivakasi': 'తిరుతంగల్ రోడ్, శివకాశి',
    'Thiruthangal Road': 'తిరుతంగల్ రోడ్',
    'Car Street Wholesale Market, Sivakasi': 'కార్ స్ట్రీట్ హోల్‌సేల్ మార్కెట్, శివకాశి',
    'Car Street Wholesale Market': 'కార్ స్ట్రీట్ హోల్‌సేల్ మార్కెట్',

    // Skills
    'Driving': 'డ్రైవింగ్',
    'Tamil Speaking': 'తమిళం మాట్లాడటం',
    'English Speaking': 'ఆంగ్లం మాట్లాడటం',
    'Hindi Speaking': 'హిందీ మాట్లాడటం',
    'Telugu Speaking': 'తెలుగు మాట్లాడటం',
    'Basic Accounts': 'ప్రాథమిక లెక్కలు',
    'Inventory': 'స్టాక్ నిర్వహణ',
    'Data Entry': 'డేటా ఎంట్రీ',
    'Computer Basics': 'కంప్యూటర్ బేసిక్స్',
    'Delivery': 'డెలివరీ',
    'Smartphone Proficient': 'స్మార్ట్‌ఫోన్ నైపుణ్యం',
    'Physically Active': 'శారీరకంగా చురుకైన',
    'Customer Service': 'కస్టమర్ సర్వీస్',
    'Event Setup': 'ఈవెంట్ సెటప్',
    'Cooking / Catering': 'వంట / క్యాటరింగ్',
    'Electrician Basics': 'ఎలక్ట్రీషియన్ బేసిక్స్',
    'Retail Management': 'రిటైల్ నిర్వహణ',
    'Logistics': 'లాజిస్టిక్స్',
    'Healthcare Ops': 'హెల్త్‌కేర్ పనులు',

    // Categories
    'Store Helper': 'షాప్ సహాయకుడు',
    'Event Hand': 'ఈవెంట్ సహాయకుడు',
    'Tutoring': 'ట్యూషన్',
    'Electrical': 'ఎలక్ట్రికల్',
    'Cleaning': 'శుభ్రపరచడం',

    // Time Slots
    'Morning': 'ఉదయం',
    'Afternoon': 'మధ్యాహ్నం',
    'Evening': 'సాయంత్రం',
    'Night': 'రాత్రి',
    'Weekend': 'వారాంతం',
    'Immediate': 'తక్షణమే',

    // Payout units
    'hour': 'గంట',
    'task': 'పని',
    'shift': 'షిఫ్ట్',
    'day': 'రోజు',

    // Landmarks
    'Katpadi, near VIT Main Gate': 'VIT ప్రధాన ద్వారం సమీపంలోని కాట్పాడి',
    'Gandhi Nagar Main Road, Katpadi': 'గాంధీ నగర్ మెయిన్ రోడ్, కాట్పాడి',
    'CMC Hospital, Ida Scudder Rd': 'CMC ఆసుపత్రి, ఇడా స్కడర్ రోడ్',
    'Sathuvachari Phase 1, Vellore': 'సతువాచారి ఫేజ్ 1, వెల్లూరు',
    'Katpadi Railway Junction': 'కాట్పాడి రైల్వే జంక్షన్',
    'VIT Main Gate, Katpadi': 'VIT ప్రధాన ద్వారం, కాట్పాడి',
    'CMC Hospital, Ida Scudder Road': 'CMC ఆసుపత్రి, ఇడా స్కడర్ రోడ్',
    'Bagayam CMC Campus': 'బగాయం CMC క్యాంపస్',
    'Vellore Fort Main Gate': 'వెల్లూరు కోట ప్రధాన ద్వారం',
    'Sathuvachari Phase 1': 'సతువాచారి ఫేజ్ 1',
    'Thorapadi Junction': 'తోరపాడి జంక్షన్',
    'Old Bus Stand, Vellore Central': 'పాత బస్టాండ్, వెల్లూరు సెంట్రల్',
    'New Bus Stand, Katpadi Road': 'కొత్త బస్టాండ్, కాట్పాడి రోడ్',
    'Sripuram Golden Temple Road': 'శ్రీపురం గోల్డెన్ టెంపుల్ రోడ్',
    'Katpadi Junction': 'కాట్పాడి జంక్షన్',
    'Katpadi': 'కాట్పాడి',
    'Vellore Central': 'వెల్లూరు సెంట్రల్',

    // Initial Job Titles
    'Instant Delivery Rider (Campus & Station Area)': 'తక్షణ డెలివరీ రైడర్ (క్యాంపస్ మరియు స్టేషన్ ప్రాంతం)',
    'Supermarket Inventory & Evening Billing Hand': 'సూపర్‌మార్కెట్ స్టాక్ మరియు సాయంత్రం బిల్లింగ్ సహాయకుడు',
    'Hospital OPD Patient Guide & Queue Coordinator': 'హాస్పిటల్ రోగి గైడ్ & క్యూ కోఆర్డినేటర్',
    'Medical Invoice & Inventory Data Entry': 'మెడికల్ బిల్లులు & ఇన్వెంటరీ డేటా ఎంట్రీ',
    'Evening Parcel Sorter & Load Dispatcher': 'సాయంత్రం పార్సెల్ విభజన మరియు లోడ్ డిస్పాచర్',
    'College Fest Sound & Stage Setup Assistant': 'కాలేజ్ ఫెస్ట్ సౌండ్ మరియు స్టేజ్ సెటప్ అసిస్టెంట్',
    'Primary School Math & English Evening Tutor': 'ప్రైమరీ స్కూల్ మ్యాథ్స్ మరియు ఇంగ్లీష్ ఈవెనింగ్ ట్యూటర్',
    'Emergency Hostel Air Cooler & Wiring Hand': 'హాస్టల్ ఎయిర్ కూలర్ & వైరింగ్ హెల్పర్',

    // Initial Job Descriptions
    'Deliver food and urgent parcel packages from Katpadi Junction restaurants to student residences near VIT Main Gate and Chittoor bus stop. Two-wheeler preferred.': 'కాట్పాడి జంక్షన్ రెస్టారెంట్ల నుండి VIT మెయిన్ గేట్ సమీపంలోని విద్యార్థుల నివాసాలకు ఆహారం మరియు పార్సెల్లను చేరవేయాలి.',
    'Assist in barcode scanning, evening shelf restocking, and counter packing during rush hours at our Gandhi Nagar main branch.': 'మా గాంధీనగర్ ప్రధాన శాఖలో బార్‌కోడ్ స్కానింగ్, షెల్ఫ్ రీస్టాకింగ్ మరియు ప్యాకింగ్ పనులలో సహాయం చేయండి.',
    'Guide outstation patients arriving at CMC Vellore Ida Scudder gate to diagnostic labs and appointment counters. Trilingual ability (Tamil/Hindi/English) is a huge bonus.': 'CMC వెల్లూరుకు వచ్చే రోగులకు ల్యాబ్‌లు మరియు కౌంటర్లకు మార్గదర్శకత్వం చేయండి.',
    'Enter supplier bills into local store ERP software. Work from our air-conditioned office in Sathuvachari Phase 1 near Collectorate.': 'సతువాచారి కార్యాలయం నుండి స్టోర్ ERP సాఫ్ట్‌వేర్‌లో బిల్లులను నమోదు చేయండి.',
    'Sort inbound courier boxes from Chennai/Bengaluru trains at Katpadi Railway Parcel Office platform 1 siding.': 'కాట్పాడి రైల్వే పార్సెల్ కార్యాలయంలో చెన్నై/బెంగళూరు రైళ్ల నుండి వచ్చే పార్సెల్‌లను క్రమబద్ధీకరించండి.',

    // Feedback tags
    'Punctual': 'సమయపాలన',
    'Skilled Worker': 'నైపుణ్యం కలిగిన కార్మికుడు',
    'Friendly & Polite': 'మర్యాదపూర్వకమైన',
    'Fast Execution': 'వేగవంతమైన పనితీరు',
    'Clean & Organized': 'పరిశుభ్రమైన & క్రమబద్ధమైన',
    'Followed Instructions': 'సూచనలను పాటించారు',
    'Prompt Payout': 'సకాలంలో పారితోషికం',
    'Clear Instructions': 'స్పష్టమైన సూచనలు',
    'Supportive Work Environment': 'మంచి పని వాతావరణం',
    'Professional': 'వృత్తి నైపుణ్యం',
    'Accurate Description': 'ఖచ్చితమైన వివరణ',
    'Great Experience': 'గొప్ప అనుభవం'
  }
};

export const localizeContent = (value: string | undefined | null, language: Language): string => {
  if (!value) return '';

  const valTrimmed = value.trim();
  let sourceLang = detectLanguageFromScript(valTrimmed);
  const containsIndic = hasIndicCharacters(valTrimmed);

  if (sourceLang === 'en' && containsIndic) {
    sourceLang = detectLanguageFromScript(valTrimmed);
    if (sourceLang === 'en') sourceLang = 'te';
  }

  // If source and target are identical and target is not English with Indic chars, return immediately
  if (sourceLang === language && (language !== 'en' || !containsIndic)) {
    return value;
  }

  // 1. Check direct English -> Target lookup in CONTENT_TRANSLATIONS
  if (sourceLang === 'en' && !containsIndic && language !== 'en') {
    const dict = CONTENT_TRANSLATIONS[language];
    if (dict) {
      if (dict[value]) return dict[value];
      const valLower = valTrimmed.toLowerCase();
      for (const [key, translated] of Object.entries(dict)) {
        if (key.toLowerCase().trim() === valLower) {
          return translated;
        }
      }
    }
  }

  // 2. Check reverse Non-English -> English / Third Language lookup in CONTENT_TRANSLATIONS
  if (sourceLang !== 'en' || containsIndic) {
    const effectiveSrc = sourceLang !== 'en' ? sourceLang : 'te';
    const srcDict = CONTENT_TRANSLATIONS[effectiveSrc];
    if (srcDict) {
      for (const [enKey, foreignVal] of Object.entries(srcDict)) {
        if (foreignVal.trim().toLowerCase() === valTrimmed.toLowerCase()) {
          if (language === 'en') {
            return enKey;
          }
          const targetDict = CONTENT_TRANSLATIONS[language];
          if (targetDict && targetDict[enKey]) {
            return targetDict[enKey];
          }
        }
      }
    }
  }

  // 3. Dynamic Any-to-Any Live Gemini Translation Engine with instant memory cache
  const effectiveSrc = (sourceLang === 'en' && containsIndic) ? 'te' : sourceLang;
  const instantResult = getInstantOrPrefetch(value, language, effectiveSrc);
  if (instantResult && (language !== 'en' || !hasIndicCharacters(instantResult))) {
    return instantResult;
  }

  // 4. Dynamic Any-to-Any Auto-Translation Engine Fallback
  const autoResult = autoTranslateString(value, language, effectiveSrc);

  // Trigger background online translation if in browser to cache for instant future loads
  if (typeof window !== 'undefined' && (autoResult === value || (language === 'en' && hasIndicCharacters(autoResult)))) {
    prefetchDynamicTranslation(value, language, effectiveSrc).catch(() => {});
  }

  return autoResult || value;
};

export const getLocalizedJobText = (
  job: Job | undefined | null,
  field: 'title' | 'description' | 'category' | 'landmark_area',
  language: Language
): string => {
  if (!job) return '';
  if (job.translations && job.translations[field] && job.translations[field]?.[language]) {
    const val = job.translations[field]![language]!;
    if (language !== 'en' || !hasIndicCharacters(val)) {
      return val;
    }
  }
  return localizeContent(job[field], language);
};

export const ALL_SKILL_OPTIONS = [
  'Driving',
  'Delivery',
  'Bike Rider',
  'Auto Driving',
  'Tamil Speaking',
  'English Speaking',
  'Hindi Speaking',
  'Telugu Speaking',
  'Store Helper',
  'Inventory',
  'Data Entry',
  'Computer Basics',
  'Basic Accounts',
  'Cashier & Billing',
  'Smartphone Proficient',
  'Physically Active',
  'Customer Service',
  'Event Setup',
  'Pamphlet Distribution',
  'Security Guard',
  'Cooking / Catering',
  'Food Serving',
  'Kitchen Helper',
  'Electrician Basics',
  'Electrical & Wiring',
  'Switchboard Repair',
  'CCTV Installation',
  'Plumbing',
  'Pipe Repair',
  'Pipe Leakage Repair',
  'Carpentry',
  'Furniture Repair',
  'Painting',
  'Wall Painting',
  'Primer Application',
  'Mechanic',
  'Two Wheeler Repair',
  'Vehicle Maintenance',
  'Appliance Maintenance',
  'AC Repair',
  'Air Conditioner Servicing',
  'AC Maintenance',
  'AC Gas Filling',
  'Fridge Repair',
  'Refrigerator Repair',
  'TV Repair',
  'Television & Electronics',
  'Washing Machine Repair',
  'RO & Water Purifier Service',
  'Tailoring',
  'Cleaning & Housekeeping',
  'Gardening',
  'Loading & Unloading',
  'Packing & Restocking',
  'Patient Helper',
  'Office Assistant'
];

export const CATEGORIES = [
  'Appliance Repair',
  'Electrical',
  'Plumbing',
  'Mechanic',
  'Painting',
  'Carpentry',
  'Delivery',
  'Driver',
  'Store Helper',
  'Data Entry',
  'Catering & Cooking',
  'Housekeeping',
  'Event Hand',
  'Tutoring',
  'Logistics & Loading',
  'Healthcare Assistant',
  'Security & Guard'
];

export const TIME_SLOT_OPTIONS = [
  'Morning',
  'Afternoon',
  'Evening',
  'Night',
  'Weekend',
  'Immediate'
] as const;
