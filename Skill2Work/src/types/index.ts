export type Role = 'seeker' | 'recruiter';
export type Language = 'en' | 'ta' | 'hi' | 'te';
export type JobStatus = 'OPEN' | 'CLAIMED' | 'COMPLETED';

export type TimeSlot = 
  | 'Morning' 
  | 'Afternoon' 
  | 'Evening' 
  | 'Night' 
  | 'Weekend' 
  | 'Immediate';

export interface User {
  id: string;
  role: Role;
  name: string;
  age: number;
  phone: string;
  skills: string[]; // parsed from JSON array
  free_time_slots: TimeSlot[]; // parsed from JSON array
  preferred_language: Language;
  latitude: number;
  longitude: number;
  address?: string; // Full street / business address
  landmark?: string; // Closest prominent landmark
  door_no?: string; // Door / Flat / Shop / Building No (Recruiter profile)
  street_name?: string; // Street Name / Road / Area (Recruiter profile)
  district?: string; // District / City (Recruiter profile)
  experience?: number; // Years of work experience
  city?: string; // Selected Tamil Nadu city / district
  rating?: number; // Feedback average rating
  review_count?: number; // Total reviews received
  created_at?: string;
}

export interface JobTranslations {
  title?: { en?: string; ta?: string; te?: string; hi?: string };
  description?: { en?: string; ta?: string; te?: string; hi?: string };
  category?: { en?: string; ta?: string; te?: string; hi?: string };
  landmark_area?: { en?: string; ta?: string; te?: string; hi?: string };
}

export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  description: string;
  category: string;
  required_skills: string[]; // parsed from JSON array
  payout_amount: number;
  payout_unit: 'hour' | 'task' | 'day' | 'shift';
  latitude: number;
  longitude: number;
  landmark_area: string;
  city?: string;
  status: JobStatus;
  claimed_by: string | null;
  created_at: string;
  // Multilingual canonical fields
  original_text?: string;
  original_language?: Language;
  translations?: JobTranslations;
  // Computed client-side fields
  distanceKm?: number;
  matchScore?: number;
  matchBreakdown?: MatchBreakdown;
  recruiter_name?: string;
  recruiter_phone?: string;
  recruiter_address?: string;
  recruiter_city?: string;
  claimed_by_name?: string;
  claimed_by_phone?: string;
  trustAssessment?: TrustAssessment;
  reportCount?: number;
  payment_status?: 'UNPAID' | 'PAID';
  payment_transaction_id?: string;
  payment_date?: string;
  payment_method?: 'UPI' | 'Card' | 'Net Banking' | 'Wallet';
}

export interface PaymentTransaction {
  id: string; // T2T-TXN-XXXXXXXX
  job_id: string;
  job_title: string;
  recruiter_id: string;
  recruiter_name: string;
  seeker_id: string;
  seeker_name: string;
  amount: number;
  payout_unit: string;
  payment_method: 'UPI' | 'Card' | 'Net Banking' | 'Wallet';
  status: 'Payment Successful';
  created_at: string;
}

export interface HybridWeights {
  semanticSkill: number; // e.g. 0.40
  distance: number;      // e.g. 0.20
  availability: number;  // e.g. 0.15
  experience: number;    // e.g. 0.10
  localDemand: number;   // e.g. 0.075
  reliability: number;   // e.g. 0.075
}

export interface MatchExplanation {
  headline: string;
  reasons: string[];
  badgeTag: string;
}

export interface MatchBreakdown {
  // 1. Semantic Skill Similarity (40%)
  skillScore: number;
  semanticSkillScore?: number;
  matchedSkills: string[];
  missingSkills: string[];
  skillMatches?: {
    requiredSkill: string;
    matchedUserSkill?: string;
    similarity: number;
    isSemanticMatch: boolean;
    isExactMatch: boolean;
  }[];
  isAiPowered?: boolean;

  // 2. Geographic Distance (20%)
  distanceScore: number;

  // 3. Availability Compatibility (15%)
  timeScore: number;
  availabilityStatus: 'Compatible' | 'Highly Flexible' | 'Partial Match' | 'General Fit';
  matchedSlots: string[];

  // 4. Work Experience (10%)
  experienceScore: number;
  experienceYears: number;
  experienceLevel: 'Expert' | 'Suitable' | 'Competent' | 'Entry Level';

  // 5. Local Skill Demand (7.5%)
  demandScore: number;
  demandLevel: 'High' | 'Surging' | 'Moderate' | 'Standard';
  demandPercentage?: number;

  // 6. Worker Reliability / Ratings (7.5%)
  reliabilityScore: number;
  ratingOutOfFive: number;
  reviewCount: number;
  isNewWorker: boolean;
  workerReliabilityMetrics?: WorkerReliabilityMetrics;

  // Configurable Weights and Explainability
  weights: HybridWeights;
  explanation: MatchExplanation;
}

export interface TamilNaduLocation {
  id: string;
  name: string;
  city: string;
  district: string;
  area?: string;
  lat: number;
  lng: number;
  category?: 'landmark' | 'transit' | 'campus' | 'commercial' | 'industrial';
  popular?: boolean;
}

// Backwards compatibility alias
export type VelloreLocation = TamilNaduLocation;

export interface FilterState {
  maxDistanceKm: number;
  category: string;
  minPayout: number;
  timeSlot: string;
  searchQuery: string;
  onlyWithin3km: boolean;
  selectedCity?: string;
  statusFilter: 'ALL' | 'OPEN' | 'CLAIMED' | 'COMPLETED';
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'job_alert' | 'claim' | 'completed' | 'rating' | 'system' | 'payment';
  is_read: boolean;
  created_at: string;
  linkJobId?: string;
}

export interface FeedbackReview {
  id: string;
  job_id: string;
  job_title: string;
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  rating: number; // 1 to 5
  tags: string[];
  comment: string;
  created_at: string;
}

export interface SkillDemandStat {
  skill: string;
  demandPercentage: number;
  openGigsCount: number;
  avgHourlyPay: number;
  topLandmark: string;
  growthRate: string;
  // Phase 5 Enhanced Fields
  currentDemandLevel?: 'High' | 'Medium' | 'Low';
  predictedTrend?: 'increasing' | 'stable' | 'decreasing' | 'insufficient_data';
  trendSymbol?: '↑' | '→' | '↓' | '—';
  hasSufficientHistoricalData?: boolean;
  dataSourceAttribution?: string;
}

// --- PHASE 5: LOCAL SKILL-DEMAND INTELLIGENCE TYPES ---
export type DemandLevel = 'High' | 'Medium' | 'Low';
export type PredictedTrend = 'increasing' | 'stable' | 'decreasing' | 'insufficient_data';
export type TrendSymbol = '↑' | '→' | '↓' | '—';

export interface LocalSkillDemandItem {
  skill: string;
  city: string;
  currentDemandLevel: DemandLevel;
  currentDemandScore: number; // 0 to 100
  activeGigCount: number;
  completedGigCount: number;
  totalHistoricalGigCount: number;
  avgHourlyPay: number;
  topLandmark: string;
  predictedTrend: PredictedTrend;
  trendSymbol: TrendSymbol;
  predictedGrowthRate: string; // e.g. '+18%' or 'N/A'
  hasSufficientHistoricalData: boolean;
  dataSourceAttribution: string;
  mlModelInfo?: {
    modelName: string;
    treeCount: number;
    sampleCount: number;
    featureImportance?: Record<string, number>;
  };
}

export interface CityDemandIntelligence {
  city: string;
  totalJobsAnalyzed: number;
  activeJobsCount: number;
  completedJobsCount: number;
  dateRange: { earliest: string; latest: string };
  skillsDemand: LocalSkillDemandItem[];
  topInDemandSkill: string;
  topSurgingSkill: string;
  insufficientDataSkillsCount: number;
}

// ==========================================
// Phase 7: Trust & Safety Types
// ==========================================
export type RiskSignalType = 
  | 'unrealistic_payment'
  | 'suspicious_description'
  | 'duplicate_content'
  | 'external_payment_request'
  | 'sensitive_info_request'
  | 'suspicious_recruiter_behavior';

export interface RiskSignal {
  type: RiskSignalType;
  severity: 'low' | 'medium' | 'high';
  label: string;
  description: string;
  evidence?: string;
}

export type TrustStatus = 'verified' | 'low_risk' | 'potential_risk_detected' | 'insufficient_data';

export interface TrustAssessment {
  status: TrustStatus;
  riskScore: number; // 0 to 100, where 0 is safest
  riskSignals: RiskSignal[];
  headline: string;
  explanation: string;
  hasSufficientRecruiterHistory: boolean;
  recruiterHistoryNote: string;
  recommendedAction: string;
}

export interface JobReport {
  id: string;
  job_id: string;
  reporter_id: string;
  reason: string;
  details?: string;
  created_at: string;
  status: 'PENDING_REVIEW' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
}

// ==========================================
// Phase 8: Reliability & Continuous Feedback Types
// ==========================================
export type RecommendationLifecycleStatus = 
  | 'recommended' 
  | 'accepted' 
  | 'completed' 
  | 'rejected' 
  | 'rated';

export interface RecommendationOutcome {
  id: string;
  job_id: string;
  user_id?: string; // Seeker / Worker ID
  worker_id?: string; // alias for worker ID
  recruiter_id?: string;
  match_score?: number; // Hybrid match score at recommendation time
  semantic_score?: number;
  status: RecommendationLifecycleStatus;
  rating?: number; // 1-5 rating if rated
  completion_notes?: string;
  feedback_comment?: string;
  accepted_at?: string;
  completed_at?: string;
  recommended_at?: string;
  created_at?: string;
  updated_at?: string;
}

export type ReliabilityTier = 
  | 'Exceptional' 
  | 'High' 
  | 'Solid' 
  | 'Reliable'
  | 'Building Record' 
  | 'Needs Improvement'
  | 'High Risk'
  | 'New Worker';

export interface WorkerReliabilityMetrics {
  workerId: string;
  compositeScore: number; // 0-100 dynamic composite score
  score: number; // 0-100 dynamic score
  ratingOutOfFive: number; // e.g. 4.8
  averageRating: number; // alias
  totalReviews: number;
  tasksAccepted: number;
  tasksCompleted: number;
  completionRate: number; // 0-100%
  positiveRatingRatio?: number; // 0-100%
  positiveTags?: string[];
  behaviorTags?: Record<string, number>; // Tag frequency, e.g. { Punctual: 5, Skilled: 3 }
  reliabilityTier: ReliabilityTier;
  isNewWorker: boolean;
  dataSourceSummary: string; // Transparent evidence attribution
}


