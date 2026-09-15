import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Briefcase, 
  Users, 
  Bot, 
  CheckCircle2, 
  Play, 
  CheckCircle, 
  CreditCard, 
  UserRound, 
  Navigation, 
  Receipt, 
  HelpCircle, 
  ArrowRight, 
  Compass
} from 'lucide-react';
import type { Role, User } from '../../types';
import logoImg from '../../assets/logo.png';

export interface UserGuideModalProps {
  isOpen: boolean;
  role: Role;
  currentUser: User | null;
  onClose: () => void;
  onComplete?: () => void;
  onOpenChatAssistant?: (samplePrompt?: string) => void;
  onNavigateTab?: (tab: 'explore' | 'my-gigs' | 'post-manage') => void;
}

interface GuideStep {
  stepNumber: number;
  title: string;
  badge: string;
  icon: React.ReactNode;
  explanation: string;
  actionTip: string;
  existingFeatureTarget?: string;
  samplePrompts?: string[];
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  role,
  currentUser,
  onClose,
  onComplete,
  onOpenChatAssistant,
  onNavigateTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const isRecruiter = role === 'recruiter';

  // -------------------------------------------------------------
  // RECRUITER ONBOARDING STEPS (8 Detailed Steps)
  // -------------------------------------------------------------
  const recruiterSteps: GuideStep[] = [
    {
      stepNumber: 1,
      title: '1. Create a Gig',
      badge: 'Job Posting',
      icon: <Briefcase className="w-6 h-6 text-sky-600" />,
      explanation: 'Post a gig by adding the work required, skills needed, location, date, duration and wage.',
      actionTip: 'Click "+ Post New Gig" in your recruiter management dashboard to define shifts, tasks, and fair wages.',
      existingFeatureTarget: 'Recruiter Dashboard → Post New Gig'
    },
    {
      stepNumber: 2,
      title: '2. Let AI Analyse Your Gig',
      badge: 'Semantic AI Engine',
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      explanation: 'Talent2Task uses AI to understand your gig requirements and help identify suitable workers based on relevant information such as skills, location and availability.',
      actionTip: 'Our on-device transformer model semantically compares job descriptions with worker skill profiles in real time.',
      existingFeatureTarget: 'Hybrid AI Matching Engine'
    },
    {
      stepNumber: 3,
      title: '3. Find Suitable Workers',
      badge: 'Local Discovery',
      icon: <Users className="w-6 h-6 text-sky-600" />,
      explanation: 'Talent2Task helps you find suitable nearby workers based on their skills, distance and available information.',
      actionTip: 'View nearby candidates on the interactive map or list with live distance calculations and match percentages.',
      existingFeatureTarget: 'Manage Gigs → Candidate List & Nearby Workers'
    },
    {
      stepNumber: 4,
      title: '4. Ask Your AI Assistant',
      badge: 'AI Assistant',
      icon: <Bot className="w-6 h-6 text-indigo-600" />,
      explanation: 'You can ask the Talent2Task AI Assistant questions about posting gigs, finding workers, managing jobs and using the platform.',
      actionTip: 'Click any sample prompt below or tap the floating AI Assistant button at the bottom-right anytime.',
      samplePrompts: [
        'Help me post a gig.',
        'Find suitable workers for my gig.',
        'How do I start the work?',
        'What should I do after the work is completed?',
        "Explain this worker's match."
      ]
    },
    {
      stepNumber: 5,
      title: '5. Select the Right Worker',
      badge: 'Verification & Trust',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      explanation: "Review the worker's skills, experience, rating, distance and available verified information before selecting them.",
      actionTip: "View the worker's verified work profile and digital work history via their tamper-proof Digital Work Passport.",
      existingFeatureTarget: 'Claimant Details → Verified Worker Passport'
    },
    {
      stepNumber: 6,
      title: '6. Start Work',
      badge: 'SafeGig Protection',
      icon: <Play className="w-6 h-6 text-emerald-600" />,
      explanation: 'Once the worker is selected and the gig is ready to begin, use the existing Start Work action.',
      actionTip: 'SafeGig protects workers with active work session timers, check-out verification, and SOS capabilities.',
      existingFeatureTarget: 'Active Tasks → Start Work'
    },
    {
      stepNumber: 7,
      title: '7. Mark the Gig as Completed',
      badge: 'Completion Workflow',
      icon: <CheckCircle className="w-6 h-6 text-sky-600" />,
      explanation: 'After the work is successfully completed, use the existing Mark as Completed action.',
      actionTip: 'Marking a job completed updates both your task status and the worker’s verified completion rate.',
      existingFeatureTarget: 'Manage Gigs → Mark Completed Button'
    },
    {
      stepNumber: 8,
      title: '8. Payment & Review',
      badge: 'Pay Now & Ratings',
      icon: <CreditCard className="w-6 h-6 text-emerald-600" />,
      explanation: 'Complete the payment through the existing Talent2Task payment flow (Pay Now) and provide a rating/review where supported.',
      actionTip: 'Instant verified digital transaction records are stored in your secure Payment History.',
      existingFeatureTarget: 'Manage Gigs → Pay Now & Review Seeker'
    }
  ];

  // -------------------------------------------------------------
  // JOB SEEKER ONBOARDING STEPS (9 Detailed Steps)
  // -------------------------------------------------------------
  const seekerSteps: GuideStep[] = [
    {
      stepNumber: 1,
      title: '1. Complete Your Profile',
      badge: 'Worker Profile',
      icon: <UserRound className="w-6 h-6 text-sky-600" />,
      explanation: 'Add your skills, experience, languages, availability and other relevant information so Talent2Task can find suitable opportunities for you.',
      actionTip: 'Open your profile from the top navigation to add skills and optional SafeGig emergency contacts.',
      existingFeatureTarget: 'Top Navigation → View / Edit Profile'
    },
    {
      stepNumber: 2,
      title: '2. Discover Nearby Gigs',
      badge: 'Hyperlocal Radar',
      icon: <Compass className="w-6 h-6 text-sky-600" />,
      explanation: 'Browse local opportunities matched to your skills and location.',
      actionTip: 'Use the distance radius slider (5 km, 10 km, etc.) and interactive map to locate gigs near your area.',
      existingFeatureTarget: 'Explore Gigs Tab & Vellore / Tamil Nadu Map'
    },
    {
      stepNumber: 3,
      title: '3. Understand Your Match',
      badge: 'Explainable AI',
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      explanation: 'Talent2Task recommends suitable gigs using relevant factors such as your skills, distance and availability.',
      actionTip: 'Tap "Why this match?" on any gig card to see a transparent 6-factor AI breakdown of your match score.',
      existingFeatureTarget: 'Gig Details → Why Recommended Breakdown'
    },
    {
      stepNumber: 4,
      title: '4. Ask Your AI Assistant',
      badge: 'AI Assistant',
      icon: <Bot className="w-6 h-6 text-indigo-600" />,
      explanation: 'Need help finding work or understanding a gig? Ask the Talent2Task AI Assistant.',
      actionTip: 'Click any sample question below or tap the floating AI widget in the corner anytime.',
      samplePrompts: [
        'Find electrician jobs near me.',
        'How do I apply for this gig?',
        'What does this job require?',
        'How far is this gig?',
        'How do I start work?',
        'What should I do after completing the gig?',
        'Why was this gig recommended to me?'
      ]
    },
    {
      stepNumber: 5,
      title: '5. Claim / Apply for a Gig',
      badge: 'Accept / Claim Gig',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      explanation: 'Choose a suitable gig and use the existing action to claim/apply for it.',
      actionTip: 'Tap the "Accept / Claim Gig" button on any open job card or details view to immediately claim the gig.',
      existingFeatureTarget: 'Gig Details Modal → Accept / Claim Gig'
    },
    {
      stepNumber: 6,
      title: '6. Get Directions',
      badge: 'GPS Navigation',
      icon: <Navigation className="w-6 h-6 text-sky-600" />,
      explanation: 'Open the gig location and use the available map/directions functionality to reach the workplace.',
      actionTip: 'Click "Directions" on any claimed gig to preview distance, walking or bike routes, and landmarks.',
      existingFeatureTarget: 'My Gigs → Directions Button'
    },
    {
      stepNumber: 7,
      title: '7. Start Work',
      badge: 'SafeGig Worker Safety',
      icon: <Play className="w-6 h-6 text-emerald-600" />,
      explanation: 'When you arrive and are ready to begin, use the existing Start Work action.',
      actionTip: 'SafeGig tracks your work duration with an active timer and provides immediate emergency SOS access.',
      existingFeatureTarget: 'My Gigs Tab → START WORK'
    },
    {
      stepNumber: 8,
      title: '8. Complete the Gig',
      badge: 'Safe Check-Out',
      icon: <CheckCircle className="w-6 h-6 text-sky-600" />,
      explanation: 'Finish the assigned work and follow the existing completion process.',
      actionTip: 'Click "Check Out" on your SafeGig panel when finished to safely record your work duration.',
      existingFeatureTarget: 'SafeGig Bar → Check Out'
    },
    {
      stepNumber: 9,
      title: '9. Payment & Work History',
      badge: 'Verified Digital Passport',
      icon: <Receipt className="w-6 h-6 text-emerald-600" />,
      explanation: 'After successful completion and payment processing, your earnings and work history are updated through the existing system.',
      actionTip: 'Your completed work contributes to your verified ratings, trust score, and QR Digital Work Passport.',
      existingFeatureTarget: 'User Menu → Payment History & Verified Worker Profile'
    }
  ];

  const currentSteps = isRecruiter ? recruiterSteps : seekerSteps;
  const totalSteps = currentSteps.length;
  const isFinalSummary = currentStepIndex >= totalSteps;
  const activeStep = !isFinalSummary ? currentSteps[currentStepIndex] : null;

  const handleNext = () => {
    if (currentStepIndex < totalSteps) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkipOrComplete = () => {
    if (currentUser?.id) {
      try {
        localStorage.setItem(`talent2task_onboarding_completed_${currentUser.id}`, 'true');
      } catch {}
    }
    if (onComplete) onComplete();
    onClose();
  };

  const handleFinalAction = () => {
    handleSkipOrComplete();
    if (isRecruiter) {
      if (onNavigateTab) onNavigateTab('post-manage');
    } else {
      if (onNavigateTab) onNavigateTab('explore');
    }
  };

  const handlePromptClick = (prompt: string) => {
    if (onOpenChatAssistant) {
      onOpenChatAssistant(prompt);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleSkipOrComplete}
    >
      <div 
        className="glass-panel w-full max-w-xl max-h-[92vh] rounded-3xl border border-slate-200 shadow-2xl bg-white overflow-hidden flex flex-col relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 via-white to-sky-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-sm p-1">
              <img src={logoImg} alt="Talent2Task" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-sm sm:text-base font-black text-slate-900">
                  Talent<span className="text-sky-500">2</span>Task
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  {isRecruiter ? 'Recruiter Guide' : 'Worker Guide'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {isRecruiter ? 'How to post, manage & hire' : 'How to find & complete local work'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkipOrComplete}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Close / Skip Tutorial"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (if not on final summary) */}
        {!isFinalSummary && (
          <div className="w-full bg-slate-100 h-1.5 relative overflow-hidden">
            <div 
              className="bg-sky-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-800">
          
          {!isFinalSummary && activeStep ? (
            /* STEP VIEW */
            <div className="space-y-4 animate-fadeIn">
              
              {/* Step Counter & Category Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Step {activeStep.stepNumber} of {totalSteps}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  {activeStep.badge}
                </span>
              </div>

              {/* Step Title with Big Icon */}
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0 shadow-xs">
                  {activeStep.icon}
                </div>
                <div>
                  <h2 className="font-heading text-lg sm:text-xl font-black text-slate-900 leading-snug">
                    {activeStep.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {activeStep.explanation}
                  </p>
                </div>
              </div>

              {/* Action Tip Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-sky-600" />
                  <span>How it works in Talent2Task</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {activeStep.actionTip}
                </p>
                {activeStep.existingFeatureTarget && (
                  <div className="text-[11px] font-semibold text-sky-600 pt-1 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    <span>Location: {activeStep.existingFeatureTarget}</span>
                  </div>
                )}
              </div>

              {/* AI Chat Assistant Interactive Example Prompts (Step 4) */}
              {activeStep.samplePrompts && activeStep.samplePrompts.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Try asking these questions in the AI Assistant:</span>
                    </span>
                    <span className="text-[10px] text-sky-600 font-semibold">(Click to try)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeStep.samplePrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePromptClick(prompt)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-sky-50 text-slate-800 hover:text-sky-900 border border-slate-200 hover:border-sky-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer text-left"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>"{prompt}"</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    The AI Assistant uses real live platform data to answer your questions accurately.
                  </p>
                </div>
              )}

            </div>
          ) : (
            /* FINAL SUMMARY SCREEN */
            <div className="space-y-5 animate-fadeIn text-center py-2">
              
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-sky-500 via-sky-400 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/25">
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-black text-slate-900">
                  {isRecruiter ? "You're Ready! 🚀" : "You're Ready to Work! 🚀"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  {isRecruiter 
                    ? 'Here is a quick summary of the complete recruiter journey in Talent2Task:' 
                    : 'Here is a quick summary of the complete worker journey in Talent2Task:'}
                </p>
              </div>

              {/* Complete Visual Flowchart Pipeline */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 shadow-2xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Complete Workflow Overview
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {currentSteps.map((step) => (
                    <div 
                      key={step.stepNumber}
                      className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-2.5"
                    >
                      <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 font-extrabold text-[11px] flex items-center justify-center shrink-0 border border-sky-100">
                        {step.stepNumber}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate">
                          {step.title.replace(/^\d+\.\s*/, '')}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {step.badge}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800 flex items-center justify-center gap-2">
                <Bot className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  Remember: You can ask the <strong>AI Assistant</strong> at the bottom-right corner anytime you need guidance!
                </span>
              </div>

            </div>
          )}

        </div>

        {/* Bottom Action Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
          
          {/* Skip Button */}
          <button
            type="button"
            onClick={handleSkipOrComplete}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 py-2 px-1 transition-colors cursor-pointer"
          >
            Skip Tutorial
          </button>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            {!isFinalSummary ? (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStepIndex === 0}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{currentStepIndex === totalSteps - 1 ? 'View Summary' : 'Next'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleFinalAction}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg shadow-sky-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{isRecruiter ? 'Get Started' : 'Find My First Gig'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
