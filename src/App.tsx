import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  User,
  Job,
  NotificationItem,
  SkillDemandStat,
  SafeGigSession
} from './types';
import { sqliteManager } from './db/sqliteManager';
import { syncService } from './services/syncService';
import { offlineQueueService } from './services/offlineQueueService';
import { enrichJobsForSeeker, enrichJobsForSeekerAsync } from './services/matchingService';
import { semanticService, type ModelStatus } from './services/semanticService';
import {
  TAMIL_NADU_LOCATIONS,
  getLocationsByCity,
  requestBrowserLocation
} from './services/geoService';
import { useLanguage } from './i18n/LanguageContext';
import { localizeContent } from './i18n/translations';
import { triggerOfflineSms } from './utils/smsHelper';

// Components
import { Navbar } from './components/Navbar';
import { RadiusFilter } from './components/SeekerDashboard/RadiusFilter';
import { JobList } from './components/SeekerDashboard/JobList';
import { JobDetailsModal } from './components/SeekerDashboard/JobDetailsModal';
import { SeekerProfileModal } from './components/SeekerDashboard/SeekerProfileModal';
import { RecruiterProfileModal } from './components/RecruiterDashboard/RecruiterProfileModal';
import { MyClaimedJobs } from './components/SeekerDashboard/MyClaimedJobs';
import { SkillGapRecommendations } from './components/SeekerDashboard/SkillGapRecommendations';
import { PostJobModal } from './components/RecruiterDashboard/PostJobModal';
import { RecruiterJobList } from './components/RecruiterDashboard/RecruiterJobList';
import { VelloreMapView } from './components/MapView/VelloreMapView';
import { GigDirectionsModal } from './components/SeekerDashboard/GigDirectionsModal';
import { LoginPage } from './components/LoginPage';
import { NotificationsModal } from './components/NotificationsModal';
import { FeedbackRatingModal } from './components/FeedbackRatingModal';
import { CommunityDemandModal } from './components/CommunityDemandModal';
import { LiveGigAlert } from './components/LiveGigAlert';
import { ChatAssistantModal } from './components/ChatAssistant/ChatAssistantModal';
import { PayNowModal } from './components/common/PayNowModal';
import { PaymentHistoryModal } from './components/common/PaymentHistoryModal';
import { VerifiedWorkerProfileModal } from './components/SeekerDashboard/VerifiedWorkerProfileModal';
import { SafeGigPanel } from './components/SafeGig/SafeGigPanel';
import { CheckOutModal } from './components/SafeGig/CheckOutModal';
import { SosModal } from './components/SafeGig/SosModal';
import { SafeGigHistoryModal } from './components/SafeGig/SafeGigHistoryModal';
import { StartWorkConfirmModal } from './components/SafeGig/StartWorkConfirmModal';
import { UserGuideModal } from './components/Onboarding/UserGuideModal';

// Icons
import {
  List,
  Map as MapIcon,
  Sparkles,
  Briefcase,
  BarChart3,
  Navigation
} from 'lucide-react';
import logoImg from './assets/logo.png';

export const App: React.FC = () => {
  const { t, language } = useLanguage();

  // App State - Load from in-memory fallback immediately for instant sub-second rendering
  const [isDbReady, setIsDbReady] = useState<boolean>(() => true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('talent2task_active_user_id'));
  });
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(() => offlineQueueService.getPendingCount());
  const [users, setUsers] = useState<User[]>(() => sqliteManager.getUsers());
  const [rawJobs, setRawJobs] = useState<Job[]>(() => sqliteManager.getJobs());

  // Unified Navigation Tab: 'explore' | 'my-gigs' | 'post-manage'
  const [activeTab, setActiveTab] = useState<'explore' | 'my-gigs' | 'post-manage'>(() => {
    const activeUserId = localStorage.getItem('talent2task_active_user_id');
    if (activeUserId) {
      const user = sqliteManager.getUserById(activeUserId);
      if (user?.role === 'recruiter') return 'post-manage';
    }
    return 'explore';
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Active Logged-in User ID
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('talent2task_active_user_id');
  });

  // Role-based First-login Onboarding Guide State
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);
  const [aiChatAssistantExternalPrompt, setAiChatAssistantExternalPrompt] = useState<string | null>(null);

  // Filters & Views
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'both' | 'list' | 'map'>('both');

  // Active user object derived from SQLite DB users
  const currentUser = useMemo(() => {
    if (currentUserId) {
      const found = users.find(u => u.id === currentUserId) || sqliteManager.getUserById(currentUserId);
      if (found) return found;
    }
    return users[0] || null;
  }, [users, currentUserId]);

  const currentSeeker = useMemo<User>(() => {
    if (currentUser) return currentUser;
    const found = users.find(u => u.role === 'seeker');
    if (found) return found;
    return users[0];
  }, [users, currentUser]);

  const currentRecruiter = useMemo<User>(() => {
    if (currentUser?.role === 'recruiter') return currentUser;
    const found = users.find(u => u.role === 'recruiter');
    if (found) return found;
    return currentUser || users[0];
  }, [users, currentUser]);

  // Modals & New Features
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeDirectionsJob, setActiveDirectionsJob] = useState<Job | null>(null);
  const [isInitialClaimDirections, setIsInitialClaimDirections] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [postJobInitialData, setPostJobInitialData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCommunityDemandOpen, setIsCommunityDemandOpen] = useState(false);
  const [liveAlertJob, setLiveAlertJob] = useState<Job | null>(null);
  const [jobForReview, setJobForReview] = useState<Job | null>(null);
  const [payModalJob, setPayModalJob] = useState<Job | null>(null);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
  const [isVerifiedWorkerProfileOpen, setIsVerifiedWorkerProfileOpen] = useState(false);
  const [publicWorkerId, setPublicWorkerId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => currentUserId ? sqliteManager.getNotifications(currentUserId) : []);
  const [skillDemandStats, setSkillDemandStats] = useState<SkillDemandStat[]>(() => sqliteManager.getCommunitySkillTrends());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SafeGig State
  const [activeSafeGigSession, setActiveSafeGigSession] = useState<SafeGigSession | null>(null);
  const [isStartWorkModalOpen, setIsStartWorkModalOpen] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isSafeGigHistoryOpen, setIsSafeGigHistoryOpen] = useState(false);
  const [safeGigTargetJob, setSafeGigTargetJob] = useState<Job | null>(null);

  // Show Toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Reload data from SQLite
  const reloadData = useCallback(() => {
    const fetchedUsers = sqliteManager.getUsers();
    const fetchedJobs = sqliteManager.getJobs();
    const fetchedTrends = sqliteManager.getCommunitySkillTrends();
    setUsers(fetchedUsers);
    setRawJobs(fetchedJobs);
    setSkillDemandStats(fetchedTrends);
    if (currentUserId) {
      const active = sqliteManager.getActiveSafeGigSession(currentUserId);
      setActiveSafeGigSession(active || null);
    }
  }, [currentUserId]);

  // Sync active SafeGig session on user change
  useEffect(() => {
    if (currentUserId) {
      const active = sqliteManager.getActiveSafeGigSession(currentUserId);
      setActiveSafeGigSession(active || null);
    } else {
      setActiveSafeGigSession(null);
    }
  }, [currentUserId, isDbReady]);

  // Deep-link detection for public worker digital passport (/verified-worker/:id or ?worker=<id>)
  useEffect(() => {
    const detectWorkerFromLocation = () => {
      if (typeof window === 'undefined') return;

      // 1. Path-based route: /verified-worker/:publicWorkerId
      const pathname = window.location.pathname;
      const pathMatch = pathname.match(/^\/verified-worker\/([^/?#]+)/i);
      if (pathMatch && pathMatch[1]) {
        const id = decodeURIComponent(pathMatch[1]).trim();
        if (id) {
          setPublicWorkerId(id);
          return;
        }
      }

      // 2. Fallback query param: ?worker=<id>
      const params = new URLSearchParams(window.location.search);
      const workerParam = params.get('worker');
      if (workerParam) {
        setPublicWorkerId(workerParam.trim());
      }
    };

    detectWorkerFromLocation();
    window.addEventListener('popstate', detectWorkerFromLocation);
    return () => window.removeEventListener('popstate', detectWorkerFromLocation);
  }, []);

  const publicWorker = useMemo(() => {
    if (!publicWorkerId) return null;
    const existing = users.find(u => u.id === publicWorkerId) || sqliteManager.getUserById(publicWorkerId);
    if (existing) return existing;
    return null;
  }, [users, publicWorkerId]);

  const handleClosePublicWorker = useCallback(() => {
    setPublicWorkerId(null);
    if (typeof window !== 'undefined' && window.history.pushState) {
      if (window.location.pathname.startsWith('/verified-worker')) {
        window.history.pushState({}, '', '/');
      } else {
        const url = new URL(window.location.href);
        url.searchParams.delete('worker');
        window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
      }
    }
  }, []);

  // Init DB and Subscribe
  useEffect(() => {
    sqliteManager.whenReady().then(() => {
      reloadData();
      setIsDbReady(true);
    });

    const unsubscribe = sqliteManager.subscribe(() => {
      reloadData();
    });

    return () => unsubscribe();
  }, [reloadData]);

  // Real-Time Background Sync subscription for silent live gig updates
  useEffect(() => {
    const unsubSync = syncService.subscribe((msg) => {
      if (msg.type === 'JOB_CREATED' && msg.data) {
        setLiveAlertJob(msg.data);
        showToast(`⚡ Real-Time Alert: New Gig "${msg.data.title}" posted!`);
      }
    });

    return () => {
      unsubSync();
    };
  }, [showToast]);

  // Fetch notifications for current user
  useEffect(() => {
    if (currentUser) {
      setNotifications(sqliteManager.getNotifications(currentUser.id));
    }
  }, [currentUser, users, rawJobs]);

  useEffect(() => {
    const updateConnection = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    const unsubQueue = offlineQueueService.subscribe((count) => {
      setPendingQueueCount(count);
    });
    return () => {
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
      unsubQueue();
    };
  }, []);

  // Keep active navigation tab strictly synchronized with current user role
  useEffect(() => {
    if (currentUser?.role === 'recruiter') {
      if (activeTab !== 'post-manage') {
        setActiveTab('post-manage');
      }
    } else if (currentUser?.role === 'seeker') {
      if (activeTab === 'post-manage') {
        setActiveTab('explore');
      }
    }
  }, [currentUser?.role, activeTab]);

  const unreadNotifsCount = useMemo(() => {
    return notifications.filter(n => !n.is_read).length;
  }, [notifications]);

  // Sentence Transformer AI Model state
  const [aiModelStatus, setAiModelStatus] = useState<{ status: ModelStatus; progress: number; errorMessage: string | null }>(
    () => semanticService.getStatus()
  );
  const [asyncEnrichedJobs, setAsyncEnrichedJobs] = useState<Job[]>([]);

  // Subscribe to Sentence Transformer AI Model state
  useEffect(() => {
    const unsub = semanticService.subscribe((status, progress, error) => {
      setAiModelStatus({ status, progress, errorMessage: error || null });
    });
    // Kick off Sentence Transformer background warmup after initial render completes
    const timer = setTimeout(() => {
      semanticService.initModel().catch(() => { });
    }, 1200);
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  // Enrich jobs asynchronously using live Sentence Transformer model and Hybrid AI Ranking
  useEffect(() => {
    let isCurrent = true;
    if (currentSeeker && rawJobs.length > 0) {
      const seekerReviews = sqliteManager.getReviews(currentSeeker.id);
      enrichJobsForSeekerAsync(rawJobs, currentSeeker, {
        skillDemandStats,
        reviews: seekerReviews
      }).then(res => {
        if (isCurrent) {
          setAsyncEnrichedJobs(res);
        }
      }).catch(err => {
        console.warn('Async hybrid enrichment notice:', err);
      });
    }
    return () => { isCurrent = false; };
  }, [rawJobs, currentSeeker, aiModelStatus.status, skillDemandStats]);

  // Compute enriched jobs for seeker (distance + match score)
  const enrichedJobs = useMemo(() => {
    if (asyncEnrichedJobs.length === rawJobs.length && asyncEnrichedJobs.length > 0) {
      return asyncEnrichedJobs;
    }
    if (!currentSeeker) return rawJobs;
    const seekerReviews = sqliteManager.getReviews(currentSeeker.id);
    return enrichJobsForSeeker(rawJobs, currentSeeker, {
      skillDemandStats,
      reviews: seekerReviews
    });
  }, [asyncEnrichedJobs, rawJobs, currentSeeker, skillDemandStats]);

  // Jobs within selected radius
  const jobsWithinRadius = useMemo(() => {
    return enrichedJobs.filter(j => {
      if (j.distanceKm === undefined) return true;
      return j.distanceKm <= radiusKm;
    });
  }, [enrichedJobs, radiusKm]);

  // Phase 8: Record continuous recommendation outcomes for top recommendations
  useEffect(() => {
    if (currentSeeker && jobsWithinRadius.length > 0) {
      jobsWithinRadius.slice(0, 10).forEach(job => {
        sqliteManager.recordRecommendationOutcome(
          job.id,
          currentSeeker.id,
          job.matchScore,
          job.recruiter_id
        );
      });
    }
  }, [currentSeeker?.id, jobsWithinRadius]);

  // Actions
  const handleClaimJob = (jobId: string) => {
    if (!currentSeeker) return;
    try {
      sqliteManager.claimJob(jobId, currentSeeker.id);

      const targetJob = rawJobs.find(j => j.id === jobId) || enrichedJobs.find(j => j.id === jobId);
      const recruiter = targetJob ? sqliteManager.getUserById(targetJob.recruiter_id) : null;
      const recruiterName = recruiter?.name || targetJob?.recruiter_name || 'Recruiter';
      const recruiterPhone = recruiter?.phone || targetJob?.recruiter_phone || '';

      // 1. Add notification for seeker with exact recruiter profile info
      sqliteManager.addNotification({
        user_id: currentSeeker.id,
        title: '🎉 Gig Claimed Successfully!',
        message: `You claimed "${targetJob?.title || 'Gig'}". Recruiter ${recruiterName} (${recruiterPhone}) has received your profile details (${currentSeeker.phone}).`,
        type: 'claim',
        is_read: false,
        linkJobId: jobId
      });

      // 2. Add notification / message for Recruiter's user inbox
      if (targetJob) {
        sqliteManager.addNotification({
          user_id: targetJob.recruiter_id,
          title: `📩 New Applicant! ${currentSeeker.name} claimed "${targetJob.title}"`,
          message: `Applicant: ${currentSeeker.name} | Phone: ${currentSeeker.phone} | Age: ${currentSeeker.age} | Experience: ${currentSeeker.experience ?? 0} yrs | Skills: ${(currentSeeker.skills || []).join(', ') || 'General'}. Contact them directly!`,
          type: 'claim',
          is_read: false,
          linkJobId: jobId
        });
      }

      showToast(t.toastClaimSuccess);

      // In Offline Mode, automatically trigger native cellular SMS to Recruiter's phone number
      if (!isOnline && recruiterPhone) {
        const cleanRecruiterPhone = recruiterPhone.replace(/[^0-9+]/g, '');
        const smsMsg = `Hi ${recruiterName}, I have claimed your gig "${targetJob?.title || 'Gig'}" on Talent2Task. My Name: ${currentSeeker.name}, Phone: ${currentSeeker.phone}. Please contact me!`;
        triggerOfflineSms(cleanRecruiterPhone, smsMsg, showToast);
      }
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(prev => prev ? {
          ...prev,
          status: 'CLAIMED',
          claimed_by: currentSeeker.id,
          claimed_by_name: currentSeeker.name,
          claimed_by_phone: currentSeeker.phone
        } : null);
      }

      // Automatically trigger accurate Directions & Route Navigation
      if (targetJob) {
        const claimedTarget: Job = {
          ...targetJob,
          status: 'CLAIMED',
          claimed_by: currentSeeker.id,
          claimed_by_name: currentSeeker.name,
          claimed_by_phone: currentSeeker.phone
        };
        setIsInitialClaimDirections(true);
        setActiveDirectionsJob(claimedTarget);
      }
      reloadData();
    } catch (err: any) {
      alert('Error claiming job: ' + err.message);
    }
  };

  const handleUpdateJobStatus = (jobId: string, status: 'OPEN' | 'CLAIMED' | 'COMPLETED') => {
    try {
      sqliteManager.updateJobStatus(jobId, status);
      reloadData();
      const statusLabel = status === 'OPEN' ? t.statusOpen : status === 'CLAIMED' ? t.statusClaimed : t.statusCompleted;
      showToast(`${t.toastStatusUpdated} ${statusLabel}`);
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this gig?')) {
      try {
        sqliteManager.deleteJob(jobId);
        reloadData();
        showToast(t.toastJobDeleted);
      } catch (err: any) {
        alert('Error deleting job: ' + err.message);
      }
    }
  };

  const handleConfirmPayment = async (
    paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Wallet'
  ) => {
    if (!payModalJob) return null;

    const existingTxn = sqliteManager.getTransactionByJobId(payModalJob.id);
    if (existingTxn) {
      showToast('Payment has already been completed for this job seeker.');
      return existingTxn;
    }

    const activeRecruiter = (currentUser?.role === 'recruiter' ? currentUser : null)
      || currentRecruiter
      || currentUser
      || { id: payModalJob.recruiter_id || 'usr_recruiter_1', name: 'Recruiter' };

    const seekerId = payModalJob.claimed_by || 'usr_seeker_1';
    const seeker = users.find(u => u.id === seekerId) || sqliteManager.getUserById(seekerId);
    const seekerName = seeker?.name || payModalJob.claimed_by_name || 'Assigned Seeker';
    const recruiterName = activeRecruiter.name || 'Recruiter';

    const txn = sqliteManager.createPaymentTransaction({
      job_id: payModalJob.id,
      job_title: payModalJob.title,
      recruiter_id: activeRecruiter.id,
      recruiter_name: recruiterName,
      seeker_id: seekerId,
      seeker_name: seekerName,
      amount: payModalJob.payout_amount,
      payout_unit: payModalJob.payout_unit,
      payment_method: paymentMethod
    });

    reloadData();
    showToast(`Payment Successful: ₹${payModalJob.payout_amount} paid to ${seekerName}`);
    return txn;
  };

  const handleCreateJob = (jobData: Omit<Job, 'id' | 'created_at'>) => {
    try {
      const newJobId = sqliteManager.createJob(jobData);

      // Send broadcast notification
      sqliteManager.addNotification({
        user_id: 'all',
        title: `🔥 New Gig Posted in ${jobData.landmark_area}!`,
        message: `${jobData.title} is now open for applicants (₹${jobData.payout_amount}/${jobData.payout_unit}).`,
        type: 'job_alert',
        is_read: false,
        linkJobId: newJobId
      });

      reloadData();
      if (currentUser?.role === 'recruiter') {
        setActiveTab('post-manage');
      } else {
        setActiveTab('explore');
      }
      showToast(t.toastJobPosted);
    } catch (err: any) {
      alert('Error posting job: ' + err.message);
    }
  };

  const handleSaveProfile = (updatedUser: User) => {
    try {
      sqliteManager.upsertUser(updatedUser);
      showToast(t.toastProfileUpdated);
      reloadData();
    } catch (err: any) {
      alert('Error saving profile: ' + err.message);
    }
  };

  const handleRequestLiveGps = async () => {
    setIsLocating(true);
    try {
      const res = await requestBrowserLocation();
      if (currentUser) {
        const updatedUser: User = {
          ...currentUser,
          latitude: res.latitude,
          longitude: res.longitude,
          city: res.city || currentUser.city || 'Chennai'
        };
        handleSaveProfile(updatedUser);
      }
      showToast(`📍 Live GPS Detected: ${res.city || 'Tamil Nadu'} (${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)})`);
    } catch (err: any) {
      showToast('⚠️ Location access was denied or timed out. You can select your Tamil Nadu city manually.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleCitySelect = (cityName: string) => {
    const cityLocs = getLocationsByCity(cityName);
    if (currentUser && cityLocs.length > 0) {
      const updatedUser: User = {
        ...currentUser,
        city: cityName,
        latitude: cityLocs[0].lat,
        longitude: cityLocs[0].lng
      };
      handleSaveProfile(updatedUser);
      showToast(`📍 Region updated to ${cityName}, Tamil Nadu`);
    }
  };

  const handleAddSkillToProfile = (skill: string) => {
    if (!currentSeeker) return;
    const currentSkills = currentSeeker.skills || [];
    if (!currentSkills.includes(skill)) {
      const updatedUser: User = {
        ...currentSeeker,
        skills: [...currentSkills, skill]
      };
      handleSaveProfile(updatedUser);
      const localizedSkill = localizeContent(skill, language);
      showToast(`✨ "${localizedSkill}" ${t.toastSkillAdded}`);
    }
  };

  const handleSubmitReview = (reviewData: {
    job_id: string;
    job_title: string;
    from_user_id: string;
    from_user_name: string;
    to_user_id: string;
    rating: number;
    tags: string[];
    comment: string;
  }) => {
    try {
      sqliteManager.addReview(reviewData);
      showToast(t.toastReviewSaved);
      setJobForReview(null);
    } catch (err: any) {
      alert('Error saving review: ' + err.message);
    }
  };

  const handleRegisterUser = useCallback((userData: Omit<User, 'id' | 'created_at'>): User => {
    const newUser = sqliteManager.createUser(userData);
    reloadData();
    setCurrentUserId(newUser.id);
    if (newUser.role === 'recruiter') {
      setActiveTab('post-manage');
    } else {
      setActiveTab('explore');
    }
    setIsAuthenticated(true);
    localStorage.setItem('talent2task_active_user_id', newUser.id);
    showToast(`🎉 Account created for ${newUser.name}!`);
    // Automatically trigger role-based onboarding guide for newly registered user
    setIsUserGuideOpen(true);
    return newUser;
  }, [reloadData, showToast]);

  const handleLoginUser = useCallback((user: User) => {
    reloadData();
    setCurrentUserId(user.id);
    if (user.role === 'recruiter') {
      setActiveTab('post-manage');
    } else {
      setActiveTab('explore');
    }
    setIsAuthenticated(true);
    localStorage.setItem('talent2task_active_user_id', user.id);
    showToast(`👋 Welcome back, ${user.name}!`);

    // Show onboarding guide only if user has not already completed or skipped it
    const hasCompletedGuide = localStorage.getItem(`talent2task_onboarding_completed_${user.id}`);
    if (!hasCompletedGuide) {
      setIsUserGuideOpen(true);
    }
  }, [reloadData, showToast]);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUserId(null);
    localStorage.removeItem('talent2task_active_user_id');
    showToast('Signed out successfully.');
  }, [showToast]);

  // Active session job reference
  const activeSessionJob = useMemo(() => {
    if (!activeSafeGigSession) return null;
    const found = rawJobs.find(j => j.id === activeSafeGigSession.job_id);
    if (found) return found;
    return {
      id: activeSafeGigSession.job_id,
      title: activeSafeGigSession.job_title || 'Active Gig',
      category: 'General',
      landmark_area: activeSafeGigSession.job_location || 'Tamil Nadu',
      city: 'Tamil Nadu',
      payout_amount: 500,
      payout_unit: 'task',
      status: 'CLAIMED',
      recruiter_id: 'recruiter_1',
      recruiter_name: 'Employer'
    } as Job;
  }, [activeSafeGigSession, rawJobs]);

  // SafeGig Handlers
  const handleOpenStartWork = useCallback((job: Job) => {
    if (job.status !== 'CLAIMED' || job.claimed_by !== currentUser?.id) {
      alert('SafeGig can only be started for an accepted task.');
      return;
    }
    if (activeSafeGigSession) {
      alert(`You already have an active SafeGig session for "${activeSafeGigSession.job_title || 'a task'}". Please check out from that task before starting another.`);
      return;
    }
    setSafeGigTargetJob(job);
    setIsStartWorkModalOpen(true);
  }, [currentUser?.id, activeSafeGigSession]);

  const handleConfirmStartWork = useCallback(async (job: Job) => {
    if (!currentUser) return;
    try {
      const session = sqliteManager.startSafeGigSession(
        currentUser.id,
        job.id,
        job.title,
        job.landmark_area || job.city || 'Tamil Nadu'
      );
      setActiveSafeGigSession(session);
      setIsStartWorkModalOpen(false);
      showToast(`🟢 SafeGig Protection Activated: Started work on "${job.title}"`);
    } catch (err: any) {
      alert(err.message || 'Failed to start SafeGig session');
    }
  }, [currentUser, showToast]);

  const handleOpenCheckOut = useCallback((job?: Job) => {
    if (job) {
      setSafeGigTargetJob(job);
    } else if (activeSafeGigSession) {
      const found = rawJobs.find(j => j.id === activeSafeGigSession.job_id) || null;
      setSafeGigTargetJob(found);
    }
    setIsCheckOutModalOpen(true);
  }, [activeSafeGigSession, rawJobs]);

  const handleConfirmCheckOut = useCallback(async (safetyNote?: string) => {
    if (!activeSafeGigSession) return;
    try {
      const completed = await sqliteManager.completeSafeGigSession(
        activeSafeGigSession.id,
        safetyNote || 'Worker safely checked out'
      );
      setActiveSafeGigSession(null);
      setIsCheckOutModalOpen(false);
      setSafeGigTargetJob(null);
      const durationFormatted = completed ? `${Math.floor(completed.duration_seconds / 60)} mins` : '';
      showToast(`✓ SafeGig: Safely checked out! Duration: ${durationFormatted || 'recorded'}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to check out');
    }
  }, [activeSafeGigSession, showToast]);

  const handleOpenSos = useCallback((job?: Job) => {
    if (job) {
      setSafeGigTargetJob(job);
    } else if (activeSafeGigSession) {
      const found = rawJobs.find(j => j.id === activeSafeGigSession.job_id) || null;
      setSafeGigTargetJob(found);
    }
    setIsSosModalOpen(true);
  }, [activeSafeGigSession, rawJobs]);

  const handleConfirmSos = useCallback(async (locationData?: { lat?: number; lng?: number; address?: string }) => {
    if (!activeSafeGigSession) return;
    try {
      const updated = sqliteManager.triggerSafeGigSos(activeSafeGigSession.id, locationData);
      setActiveSafeGigSession(updated);
      showToast('🚨 SOS Activated! Emergency details prepared.');
    } catch (err: any) {
      console.error('Error recording SOS:', err);
    }
  }, [activeSafeGigSession, showToast]);

  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900 space-y-4 p-4">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-50 border border-slate-200 p-2 shadow-xl shadow-sky-500/10 animate-pulse">
          <img src={logoImg} alt="Talent2Task Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="font-heading text-xl font-bold flex items-center gap-1 text-slate-900">
          <span>Talent</span><span className="text-sky-500">2</span><span>Task</span>
        </h2>
        <p className="text-xs text-sky-600 font-bold tracking-wider uppercase">{t.footerTagline}</p>
        <p className="text-[11px] text-slate-500">Loading Tamil Nadu SQLite Database & Hyperlocal Radar Engine...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {Boolean(publicWorkerId) && (
          <VerifiedWorkerProfileModal
            worker={publicWorker}
            workerId={publicWorkerId || undefined}
            currentUser={null}
            isOpen={Boolean(publicWorkerId)}
            isPublicView={true}
            onClose={handleClosePublicWorker}
          />
        )}
        <LoginPage
          onLogin={handleLoginUser}
          onCreateAccount={handleRegisterUser}
          users={users}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      {!isOnline && (
        <div className="sticky top-0 z-[60] w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-4 py-2 text-center text-xs font-bold text-white shadow-md flex items-center justify-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{t.offlineAlert || 'You are in Offline Mode. All changes are saved locally in SQLite.'}</span>
          </span>
          {pendingQueueCount > 0 && (
            <span className="bg-amber-800/60 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border border-amber-300/40">
              {pendingQueueCount} {pendingQueueCount === 1 ? 'action queued' : 'actions queued'}
            </span>
          )}
          <button
            type="button"
            onClick={async () => {
              const res = await offlineQueueService.flushQueue();
              reloadData();
              if (res.processed > 0) {
                showToast(`⚡ Synchronized ${res.processed} offline action(s)!`);
              } else {
                showToast('Offline actions are safely stored in local database.');
              }
            }}
            className="px-2.5 py-0.5 rounded-lg bg-white text-amber-900 text-[11px] font-extrabold hover:bg-amber-50 shadow-xs transition cursor-pointer"
          >
            Sync Now
          </button>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl shadow-slate-900/25 border border-slate-700/80 text-xs sm:text-sm font-bold flex items-center gap-2 animate-toast-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        unreadNotifsCount={unreadNotifsCount}
        isOnline={isOnline}
        onToggleOnline={() => {
          setIsOnline(prev => {
            const nextState = !prev;
            showToast(nextState ? '⚡ Online Mode Active' : '📶 Offline SMS Mode Active — All messages route to native SMS app');
            return nextState;
          });
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenCommunityDemand={() => setIsCommunityDemandOpen(true)}
        onOpenPaymentHistory={() => setIsPaymentHistoryOpen(true)}
        onOpenVerifiedWorkerProfile={() => setIsVerifiedWorkerProfileOpen(true)}
        onOpenSafeGigHistory={() => setIsSafeGigHistoryOpen(true)}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onLogout={handleLogout}
      />

      {/* SafeGig Active Worker Safety Panel */}
      {currentUser?.role === 'seeker' && activeSafeGigSession && (
        <SafeGigPanel
          session={activeSafeGigSession}
          job={activeSessionJob}
          onCheckOut={() => handleOpenCheckOut(activeSessionJob || undefined)}
          onTriggerSos={() => handleOpenSos(activeSessionJob || undefined)}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ===================== TAB 1: EXPLORE GIGS ===================== */}
        {activeTab === 'explore' && (
          <div className="space-y-6 animate-fadeIn">

            {/* GPS & Hyperlocal Tamil Nadu Prompt Banner */}
            <div className="bg-gradient-to-r from-sky-50 via-sky-100/70 to-blue-50 border border-sky-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                  <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {t.gpsPromptTitle}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-200/70 text-sky-800">
                      Tamil Nadu Radar
                    </span>

                    {/* Sentence Transformer AI Model Status Badge */}
                    {aiModelStatus.status === 'ready' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Sentence Transformer AI Active
                      </span>
                    ) : aiModelStatus.status === 'loading' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Loading MiniLM Transformer ({aiModelStatus.progress}%)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-sky-500" />
                        AI Semantic Matching Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {t.gpsPromptSubtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleRequestLiveGps}
                  disabled={isLocating}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? t.locating : t.useCurrentGps}</span>
                </button>
              </div>
            </div>

            {/* AI Skill Gap & Career Recommendations */}
            <SkillGapRecommendations
              currentUser={currentSeeker}
              jobs={rawJobs}
              language={language}
              demandStats={skillDemandStats}
              onAddSkill={handleAddSkillToProfile}
              onOpenProfile={() => setIsProfileModalOpen(true)}
            />

            {/* Radar Controller & Radius Filter */}
            <RadiusFilter
              radiusKm={radiusKm}
              onRadiusChange={setRadiusKm}
              currentUser={currentSeeker}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              matchedCount={jobsWithinRadius.length}
              onCitySelect={handleCitySelect}
              onLiveGpsClick={handleRequestLiveGps}
              isLocating={isLocating}
            />

            {/* View Mode (List vs Map vs Both on Desktop) */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm font-bold text-slate-800">
                  {jobsWithinRadius.length} {t.gigsFound}
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
                <button
                  onClick={() => setViewMode('both')}
                  className={`hidden lg:block px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'both' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {t.splitView}
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${viewMode === 'list' ? 'bg-sky-500 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>{t.listViewTab}</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${viewMode === 'map' ? 'bg-sky-500 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>{t.mapViewTab}</span>
                </button>
              </div>
            </div>

            {/* Content based on View Mode */}
            {viewMode === 'both' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Cards List (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <JobList
                    jobs={enrichedJobs}
                    currentUser={currentSeeker}
                    onClaimJob={handleClaimJob}
                    onViewDetails={(job) => setSelectedJob(job)}
                    onGetDirections={(job) => {
                      setIsInitialClaimDirections(false);
                      setActiveDirectionsJob(job);
                    }}
                    radiusKm={radiusKm}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </div>

                {/* Right: Sticky Map (5 cols) */}
                <div className="lg:col-span-5 h-[620px] sticky top-24">
                  <VelloreMapView
                    user={currentSeeker}
                    jobs={jobsWithinRadius}
                    radiusKm={radiusKm}
                    selectedJobId={selectedJob?.id}
                    onSelectJob={(job) => setSelectedJob(job)}
                    onClaimJob={handleClaimJob}
                    onGetDirections={(job) => {
                      setIsInitialClaimDirections(false);
                      setActiveDirectionsJob(job);
                    }}
                    quickLocations={TAMIL_NADU_LOCATIONS.filter(l => l.popular)}
                    onSelectCoordinates={(lat, lng) => {
                      handleSaveProfile({ ...currentSeeker, latitude: lat, longitude: lng });
                    }}
                  />
                </div>
              </div>
            ) : viewMode === 'list' ? (
              <JobList
                jobs={enrichedJobs}
                currentUser={currentSeeker}
                onClaimJob={handleClaimJob}
                onViewDetails={(job) => setSelectedJob(job)}
                onGetDirections={(job) => {
                  setIsInitialClaimDirections(false);
                  setActiveDirectionsJob(job);
                }}
                radiusKm={radiusKm}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            ) : (
              <div className="h-[600px]">
                <VelloreMapView
                  user={currentSeeker}
                  jobs={jobsWithinRadius}
                  radiusKm={radiusKm}
                  selectedJobId={selectedJob?.id}
                  onSelectJob={(job) => setSelectedJob(job)}
                  onClaimJob={handleClaimJob}
                  onGetDirections={(job) => {
                    setIsInitialClaimDirections(false);
                    setActiveDirectionsJob(job);
                  }}
                  quickLocations={TAMIL_NADU_LOCATIONS.filter(l => l.popular)}
                  onSelectCoordinates={(lat, lng) => {
                    handleSaveProfile({ ...currentSeeker, latitude: lat, longitude: lng });
                  }}
                />
              </div>
            )}

          </div>
        )}

        {/* ===================== TAB 2: MY APPLICATIONS ===================== */}
        {activeTab === 'my-gigs' && (
          <div className="space-y-6 animate-fadeIn">
            <MyClaimedJobs
              jobs={enrichedJobs}
              currentUser={currentSeeker}
              onViewDetails={(job) => setSelectedJob(job)}
              onGetDirections={(job) => {
                setIsInitialClaimDirections(false);
                setActiveDirectionsJob(job);
              }}
              onExploreGigs={() => setActiveTab('explore')}
              activeSession={activeSafeGigSession}
              onStartWork={handleOpenStartWork}
              onOpenCheckOut={handleOpenCheckOut}
              onOpenSos={handleOpenSos}
            />
          </div>
        )}

        {/* ===================== TAB 3: POST & MANAGE ===================== */}
        {activeTab === 'post-manage' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Recruiter Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-5 rounded-2xl border border-slate-200 shadow-sm bg-white">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-sky-500" />
                  <span>{t.recruiterHeading}</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  {t.activeRecruiter}: <span className="text-slate-900 font-bold">{currentUser?.name}</span> • {currentUser?.phone} • {currentUser?.city || 'Tamil Nadu'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPostJobModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md shadow-sky-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.postNewGigBtn}</span>
                </button>
              </div>
            </div>

            {/* Recruiter Job List */}
            <RecruiterJobList
              jobs={rawJobs}
              recruiter={currentUser || currentRecruiter}
              onOpenPostModal={() => setIsPostJobModalOpen(true)}
              onUpdateStatus={handleUpdateJobStatus}
              onDeleteJob={handleDeleteJob}
              onOpenReviewModal={(job) => setJobForReview(job)}
              onOpenPayModal={(job) => setPayModalJob(job)}
              onViewWorkerProfile={(workerId) => setPublicWorkerId(workerId)}
            />

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Talent2Task" className="w-8 h-8 rounded-lg object-contain bg-slate-50 p-0.5 border border-slate-200" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Talent2Task</span>
                <span>•</span>
                <span className="text-sky-600 font-bold uppercase tracking-wider text-[10px]">{t.footerTagline}</span>
              </div>
              <p className="text-[11px] text-slate-500">{t.footerEngineDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsCommunityDemandOpen(true)}
              className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-500" />
              {t.trends}
            </button>
          </div>
        </div>
      </footer>

      {/* ===================== MODALS ===================== */}

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        currentUser={currentUser}
        onClose={() => setSelectedJob(null)}
        onClaim={handleClaimJob}
        onGetDirections={(job) => {
          setIsInitialClaimDirections(false);
          setActiveDirectionsJob(job);
        }}
        activeSession={activeSafeGigSession}
        onStartWork={handleOpenStartWork}
        onOpenCheckOut={handleOpenCheckOut}
        onOpenSos={handleOpenSos}
      />

      {/* Post-Claim Accurate GPS Directions & Route Navigation Modal */}
      <GigDirectionsModal
        job={activeDirectionsJob}
        currentUser={currentUser || currentSeeker}
        isOpen={Boolean(activeDirectionsJob)}
        isInitialClaim={isInitialClaimDirections}
        onClose={() => {
          setActiveDirectionsJob(null);
          setIsInitialClaimDirections(false);
        }}
      />

      {/* Seeker Profile & Location Modal */}
      {(currentUser?.role === 'seeker' || (!currentUser && currentSeeker)) && (
        <SeekerProfileModal
          user={currentUser || currentSeeker}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Recruiter Profile & Location Modal */}
      {(currentUser?.role === 'recruiter' || (!currentUser && currentRecruiter)) && (
        <RecruiterProfileModal
          user={currentUser || currentRecruiter}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Recruiter Post Job Modal */}
      {(currentUser || currentRecruiter) && (
        <PostJobModal
          recruiter={currentUser || currentRecruiter}
          isOpen={isPostJobModalOpen}
          onClose={() => {
            setIsPostJobModalOpen(false);
            setPostJobInitialData(null);
          }}
          onSubmit={handleCreateJob}
          initialData={postJobInitialData}
        />
      )}

      {/* Notifications Modal */}
      {isNotificationsOpen && (
        <NotificationsModal
          notifications={notifications}
          language={language}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAsRead={(id) => sqliteManager.markNotificationAsRead(id)}
          onMarkAllAsRead={() => sqliteManager.markAllNotificationsAsRead(currentUser?.id || 'all')}
          onSelectJob={(jobId) => {
            const foundJob = enrichedJobs.find(j => j.id === jobId) || rawJobs.find(j => j.id === jobId);
            if (foundJob) setSelectedJob(foundJob);
          }}
        />
      )}

      {/* Community Demand & Skill Trends Modal */}
      {isCommunityDemandOpen && (
        <CommunityDemandModal
          stats={skillDemandStats}
          jobs={rawJobs}
          initialCity={currentUser?.city || 'Tamil Nadu'}
          language={language}
          onClose={() => setIsCommunityDemandOpen(false)}
        />
      )}

      {/* Feedback & Rating Modal */}
      {jobForReview && currentUser && (
        <FeedbackRatingModal
          job={jobForReview}
          currentUser={currentUser}
          language={language}
          onClose={() => setJobForReview(null)}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* Pay Now Modal (Phase 35 — The ONLY payment action is 'Pay Now') */}
      {payModalJob && (
        <PayNowModal
          job={payModalJob}
          isOpen={Boolean(payModalJob)}
          onClose={() => setPayModalJob(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {/* Payment History Modal (Phase 35 — Dynamic real application data) */}
      {currentUser && (
        <PaymentHistoryModal
          user={currentUser}
          transactions={sqliteManager.getTransactionsByUser(currentUser.id)}
          isOpen={isPaymentHistoryOpen}
          onClose={() => setIsPaymentHistoryOpen(false)}
        />
      )}

      {/* Verified Worker Profile & Digital Work Passport Modal (Self View) */}
      {(currentUser?.role === 'seeker' || (!currentUser && currentSeeker)) && (
        <VerifiedWorkerProfileModal
          worker={currentUser || currentSeeker}
          currentUser={currentUser}
          isOpen={isVerifiedWorkerProfileOpen}
          onClose={() => setIsVerifiedWorkerProfileOpen(false)}
        />
      )}

      {/* Public Scanned / Recruiter Inspected Verified Worker Profile (QR / Deep Link) */}
      {Boolean(publicWorkerId) && (
        <VerifiedWorkerProfileModal
          worker={publicWorker}
          workerId={publicWorkerId || undefined}
          currentUser={currentUser}
          isOpen={Boolean(publicWorkerId)}
          isPublicView={true}
          onClose={handleClosePublicWorker}
        />
      )}

      {/* Real-time Gig Radar Alert Notification */}
      <LiveGigAlert
        job={liveAlertJob}
        onViewJob={(job) => {
          setSelectedJob(job);
          setLiveAlertJob(null);
        }}
        onDismiss={() => setLiveAlertJob(null)}
      />

      {/* Talent2Task Action-Oriented AI Chat Assistant (Floating Widget) */}
      <ChatAssistantModal
        currentUser={currentUser}
        jobs={enrichedJobs.length > 0 ? enrichedJobs : rawJobs}
        users={users}
        skillDemandStats={skillDemandStats}
        currentCoords={currentUser ? { latitude: currentUser.latitude, longitude: currentUser.longitude } : null}
        radiusKm={radiusKm}
        selectedJob={selectedJob}
        onSelectJob={(job) => setSelectedJob(job)}
        onClaimJob={handleClaimJob}
        onOpenPostJob={(initialData) => {
          setPostJobInitialData(initialData || null);
          setIsPostJobModalOpen(true);
        }}
        onNavigateTab={(tab, view) => {
          setActiveTab(tab);
          if (view) setViewMode(view);
        }}
        onSetRadius={(r) => setRadiusKm(r)}
        onSelectCity={handleCitySelect}
        onRequestLiveGps={handleRequestLiveGps}
        onFilterJobs={(query, category) => {
          if (query !== undefined) setSearchQuery(query);
          if (category !== undefined) setSelectedCategory(category);
          setActiveTab('explore');
        }}
        onAddSkillToProfile={handleAddSkillToProfile}
        onOpenCommunityDemand={() => setIsCommunityDemandOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onDeleteJob={handleDeleteJob}
        externalPrompt={aiChatAssistantExternalPrompt}
      />

      {/* SafeGig Start Work Confirmation Modal */}
      <StartWorkConfirmModal
        isOpen={isStartWorkModalOpen}
        job={safeGigTargetJob}
        onClose={() => {
          setIsStartWorkModalOpen(false);
          setSafeGigTargetJob(null);
        }}
        onConfirm={handleConfirmStartWork}
      />

      {/* SafeGig Check Out Modal */}
      <CheckOutModal
        isOpen={isCheckOutModalOpen}
        session={activeSafeGigSession}
        job={safeGigTargetJob || activeSessionJob}
        onClose={() => setIsCheckOutModalOpen(false)}
        onConfirmCheckOut={handleConfirmCheckOut}
        onTriggerSos={() => {
          setIsCheckOutModalOpen(false);
          handleOpenSos(safeGigTargetJob || activeSessionJob || undefined);
        }}
      />

      {/* SafeGig SOS Emergency Modal */}
      <SosModal
        isOpen={isSosModalOpen}
        session={activeSafeGigSession}
        job={safeGigTargetJob || activeSessionJob}
        worker={currentUser}
        onClose={() => setIsSosModalOpen(false)}
        onConfirmSos={handleConfirmSos}
      />

      {/* SafeGig Safety History Modal */}
      {currentUser && (
        <SafeGigHistoryModal
          isOpen={isSafeGigHistoryOpen}
          workerId={currentUser.id}
          onClose={() => setIsSafeGigHistoryOpen(false)}
        />
      )}

      {/* Role-Based First-Login User Guide & AI Assistant Introduction */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        role={currentUser?.role || 'seeker'}
        currentUser={currentUser}
        onClose={() => setIsUserGuideOpen(false)}
        onComplete={() => {
          setIsUserGuideOpen(false);
          showToast('🚀 You are all set to use Talent2Task!');
        }}
        onOpenChatAssistant={(prompt) => {
          setIsUserGuideOpen(false);
          if (prompt) {
            setAiChatAssistantExternalPrompt(prompt);
          }
        }}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
        }}
      />

    </div>
  );
};
