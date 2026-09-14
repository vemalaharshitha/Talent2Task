import { INIT_DATABASE_SQL, CREATE_TRANSACTIONS_TABLE_SQL, CREATE_RECOMMENDATION_OUTCOMES_TABLE_SQL } from './schema';
import { INITIAL_USERS, INITIAL_JOBS, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS } from './seedData';
import type { 
  User, 
  Job, 
  Role, 
  Language, 
  NotificationItem, 
  FeedbackReview, 
  SkillDemandStat, 
  CityDemandIntelligence, 
  JobReport,
  RecommendationOutcome,
  RecommendationLifecycleStatus,
  PaymentTransaction
} from '../types';
import { syncService, type SyncMessage } from '../services/syncService';
import { demandIntelligenceService } from '../services/demandIntelligenceService';
import { trustSafetyService } from '../services/trustSafetyService';
import { offlineQueueService } from '../services/offlineQueueService';
import { translateAllLanguages } from '../services/translationService';
import { detectLanguageFromScript } from '../i18n/autoTranslate';

const STORAGE_KEY = 'talent2task_sqlite_db_v1';
const FALLBACK_USERS_KEY = 'talent2task_users_fallback_v1';
const FALLBACK_JOBS_KEY = 'talent2task_jobs_fallback_v1';
const FALLBACK_REVIEWS_KEY = 'talent2task_reviews_fallback_v1';
const FALLBACK_NOTIFICATIONS_KEY = 'talent2task_notifications_fallback_v1';
const FALLBACK_REPORTS_KEY = 'talent2task_reports_fallback_v1';
const FALLBACK_OUTCOMES_KEY = 'talent2task_outcomes_fallback_v1';

const INITIAL_OUTCOMES: RecommendationOutcome[] = [
  {
    id: 'out_seed_001',
    job_id: 'job_chn_001',
    worker_id: 'usr_seeker_1',
    recommended_at: '2026-09-09 18:00:00',
    status: 'rated',
    match_score: 94,
    accepted_at: '2026-09-09 18:15:00',
    completed_at: '2026-09-09 20:00:00',
    rating: 5,
    feedback_comment: 'Karthik arrived on time and completed deliveries ahead of schedule. Very professional!'
  },
  {
    id: 'out_seed_002',
    job_id: 'job_cbe_002',
    worker_id: 'usr_seeker_2',
    recommended_at: '2026-09-08 17:00:00',
    status: 'rated',
    match_score: 92,
    accepted_at: '2026-09-08 17:30:00',
    completed_at: '2026-09-08 19:00:00',
    rating: 5,
    feedback_comment: 'Priya was thorough, polite with customers, and managed cash billing accurately.'
  }
];

export function deriveCityFromArea(areaText?: string): string {
  if (!areaText) return 'Tamil Nadu';
  const a = areaText.toLowerCase();
  if (a.includes('sivakasi')) return 'Sivakasi';
  if (a.includes('chennai') || a.includes('guindy') || a.includes('nagar') || a.includes('velachery') || a.includes('omr') || a.includes('ambattur')) return 'Chennai';
  if (a.includes('coimbatore') || a.includes('peelamedu') || a.includes('gandhipuram') || a.includes('saravanampatti') || a.includes('kovai')) return 'Coimbatore';
  if (a.includes('madurai') || a.includes('mattuthavani') || a.includes('periyar') || a.includes('meenakshi') || a.includes('bypass road')) return 'Madurai';
  if (a.includes('trichy') || a.includes('tiruchirappalli') || a.includes('thillai nagar')) return 'Tiruchirappalli';
  if (a.includes('salem') || a.includes('meyyanur')) return 'Salem';
  if (a.includes('tirunelveli') || a.includes('palayamkottai')) return 'Tirunelveli';
  if (a.includes('vellore') || a.includes('katpadi') || a.includes('cmc')) return 'Vellore';
  return 'Tamil Nadu';
}

class SQLiteManager {
  private db: any = null;
  private isReady = false;
  private isWasm = false;
  private initPromise: Promise<void> | null = null;
  private listeners: Set<() => void> = new Set();

  // In-memory tables for instant availability & fallback
  private memoryUsers: User[] = [];
  private memoryJobs: Job[] = [];
  private memoryReviews: FeedbackReview[] = [];
  private memoryNotifications: NotificationItem[] = [];
  private memoryReports: JobReport[] = [];
  private memoryOutcomes: RecommendationOutcome[] = [];
  private memoryTransactions: PaymentTransaction[] = [];

  constructor() {
    this.initFallbackData();
    this.initPromise = this.initialize();
    this.initSyncListener();
  }

  public async whenReady(): Promise<void> {
    if (this.isReady) return;
    await this.initPromise;
  }

  private initSyncListener() {
    syncService.subscribe((msg: SyncMessage) => {
      switch (msg.type) {
        case 'INITIAL_SYNC_RESPONSE':
          if (msg.data) {
            this.applyRemoteFullSync(msg.data);
          }
          break;
        case 'JOB_CREATED':
          if (msg.data) {
            this.applyRemoteJob(msg.data);
          }
          break;
        case 'JOB_CLAIMED':
          if (msg.data) {
            const { jobId, seekerId, seekerName, seekerPhone } = msg.data;
            this.applyRemoteJobClaim(jobId, seekerId, seekerName, seekerPhone);
          }
          break;
        case 'JOB_STATUS_UPDATED':
          if (msg.data) {
            const { jobId, status } = msg.data;
            this.applyRemoteJobStatus(jobId, status);
          }
          break;
        case 'JOB_DELETED':
          if (msg.data?.jobId) {
            this.applyRemoteJobDelete(msg.data.jobId);
          }
          break;
        case 'USER_UPSERTED':
          if (msg.data) {
            this.applyRemoteUser(msg.data);
          }
          break;
        case 'NOTIFICATION_ADDED':
          if (msg.data) {
            this.applyRemoteNotification(msg.data);
          }
          break;
        case 'REVIEW_ADDED':
          if (msg.data) {
            this.applyRemoteReview(msg.data);
          }
          break;
        case 'PAYMENT_PROCESSED':
          if (msg.data && msg.data.job_id) {
            this.createPaymentTransaction(msg.data, true);
          }
          break;
        default:
          break;
      }
    });
  }

  private initFallbackData() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        this.memoryUsers = INITIAL_USERS.map(u => ({
          id: u.id,
          role: u.role as Role,
          name: u.name,
          age: u.age,
          phone: u.phone,
          skills: JSON.parse(u.skills),
          free_time_slots: JSON.parse(u.free_time_slots),
          preferred_language: u.preferred_language as Language,
          latitude: u.latitude,
          longitude: u.longitude,
          experience: (u as any).experience || 0,
          city: (u as any).city || 'Chennai',
          address: (u as any).address || '',
          landmark: (u as any).landmark || ''
        }));
        this.memoryJobs = INITIAL_JOBS.map(j => ({
          id: j.id,
          recruiter_id: j.recruiter_id,
          title: j.title,
          description: j.description,
          category: j.category,
          required_skills: JSON.parse(j.required_skills),
          payout_amount: j.payout_amount,
          payout_unit: j.payout_unit as any,
          latitude: j.latitude,
          longitude: j.longitude,
          landmark_area: j.landmark_area,
          city: (j as any).city || deriveCityFromArea(j.landmark_area),
          status: j.status as any,
          claimed_by: j.claimed_by,
          created_at: j.created_at
        }));
        this.memoryReviews = INITIAL_REVIEWS.map(r => ({
          ...r,
          tags: JSON.parse(r.tags)
        }));
        this.memoryNotifications = INITIAL_NOTIFICATIONS.map(n => ({
          ...n,
          type: n.type as any,
          is_read: Boolean(n.is_read)
        }));
        this.memoryOutcomes = [...INITIAL_OUTCOMES];
        return;
      }

      const cachedUsers = localStorage.getItem(FALLBACK_USERS_KEY);
      const cachedJobs = localStorage.getItem(FALLBACK_JOBS_KEY);
      const cachedReviews = localStorage.getItem(FALLBACK_REVIEWS_KEY);
      const cachedNotifications = localStorage.getItem(FALLBACK_NOTIFICATIONS_KEY);
      const cachedReports = localStorage.getItem(FALLBACK_REPORTS_KEY);
      const cachedOutcomes = localStorage.getItem(FALLBACK_OUTCOMES_KEY);

      if (cachedUsers && cachedJobs) {
        this.memoryUsers = JSON.parse(cachedUsers);
        this.memoryJobs = JSON.parse(cachedJobs);

        // Merge any newly introduced initial users (e.g. Sivakasi recruiter)
        INITIAL_USERS.forEach(u => {
          if (!this.memoryUsers.some(mu => mu.id === u.id)) {
            this.memoryUsers.push({
              id: u.id,
              role: u.role as Role,
              name: u.name,
              age: u.age,
              phone: u.phone,
              skills: JSON.parse(u.skills),
              free_time_slots: JSON.parse(u.free_time_slots),
              preferred_language: u.preferred_language as Language,
              latitude: u.latitude,
              longitude: u.longitude,
              experience: (u as any).experience || 0,
              city: (u as any).city || 'Chennai',
              address: (u as any).address || '',
              landmark: (u as any).landmark || ''
            });
          }
        });

        // Merge any newly introduced initial jobs (e.g. Sivakasi gigs)
        INITIAL_JOBS.forEach(j => {
          if (!this.memoryJobs.some(mj => mj.id === j.id)) {
            this.memoryJobs.push({
              id: j.id,
              recruiter_id: j.recruiter_id,
              title: j.title,
              description: j.description,
              category: j.category,
              required_skills: JSON.parse(j.required_skills),
              payout_amount: j.payout_amount,
              payout_unit: j.payout_unit as any,
              latitude: j.latitude,
              longitude: j.longitude,
              landmark_area: j.landmark_area,
              city: (j as any).city || deriveCityFromArea(j.landmark_area),
              status: j.status as any,
              claimed_by: j.claimed_by,
              created_at: j.created_at,
              recruiter_name: 'Tamil Nadu Business Partner',
              recruiter_phone: '+91 99440 11223'
            });
          }
        });

        this.memoryReviews = cachedReviews ? JSON.parse(cachedReviews) : INITIAL_REVIEWS.map(r => ({
          ...r,
          tags: JSON.parse(r.tags)
        }));
        this.memoryNotifications = cachedNotifications ? JSON.parse(cachedNotifications) : INITIAL_NOTIFICATIONS.map(n => ({
          ...n,
          type: n.type as any,
          is_read: Boolean(n.is_read)
        }));
        this.memoryReports = cachedReports ? JSON.parse(cachedReports) : [];
        this.memoryOutcomes = cachedOutcomes ? JSON.parse(cachedOutcomes) : [...INITIAL_OUTCOMES];
      } else {
        this.memoryUsers = INITIAL_USERS.map(u => ({
          id: u.id,
          role: u.role as Role,
          name: u.name,
          age: u.age,
          phone: u.phone,
          skills: JSON.parse(u.skills),
          free_time_slots: JSON.parse(u.free_time_slots),
          preferred_language: u.preferred_language as Language,
          latitude: u.latitude,
          longitude: u.longitude,
          experience: (u as any).experience || 0,
          city: (u as any).city || 'Chennai',
          address: (u as any).address || '',
          landmark: (u as any).landmark || ''
        }));

        this.memoryJobs = INITIAL_JOBS.map(j => ({
          id: j.id,
          recruiter_id: j.recruiter_id,
          title: j.title,
          description: j.description,
          category: j.category,
          required_skills: JSON.parse(j.required_skills),
          payout_amount: j.payout_amount,
          payout_unit: j.payout_unit as any,
          latitude: j.latitude,
          longitude: j.longitude,
          landmark_area: j.landmark_area,
          city: (j as any).city || deriveCityFromArea(j.landmark_area),
          status: j.status as any,
          claimed_by: j.claimed_by,
          created_at: j.created_at,
          recruiter_name: 'Tamil Nadu Business Partner',
          recruiter_phone: '+91 99440 11223'
        }));

        this.memoryReviews = INITIAL_REVIEWS.map(r => ({
          id: r.id,
          job_id: r.job_id,
          job_title: r.job_title,
          from_user_id: r.from_user_id,
          from_user_name: r.from_user_name,
          to_user_id: r.to_user_id,
          rating: r.rating,
          tags: JSON.parse(r.tags),
          comment: r.comment,
          created_at: r.created_at
        }));

        this.memoryNotifications = INITIAL_NOTIFICATIONS.map(n => ({
          id: n.id,
          user_id: n.user_id,
          title: n.title,
          message: n.message,
          type: n.type as any,
          is_read: Boolean(n.is_read),
          created_at: n.created_at,
          linkJobId: n.link_job_id
        }));

        this.memoryReports = [];
        this.memoryOutcomes = [...INITIAL_OUTCOMES];

        this.saveFallbackData();
      }
    } catch (e) {
      console.warn('Fallback init error:', e);
    }
  }

  private saveFallbackData() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
      localStorage.setItem(FALLBACK_USERS_KEY, JSON.stringify(this.memoryUsers));
      localStorage.setItem(FALLBACK_JOBS_KEY, JSON.stringify(this.memoryJobs));
      localStorage.setItem(FALLBACK_REVIEWS_KEY, JSON.stringify(this.memoryReviews));
      localStorage.setItem(FALLBACK_NOTIFICATIONS_KEY, JSON.stringify(this.memoryNotifications));
      localStorage.setItem(FALLBACK_REPORTS_KEY, JSON.stringify(this.memoryReports));
      localStorage.setItem(FALLBACK_OUTCOMES_KEY, JSON.stringify(this.memoryOutcomes));
    } catch (e) {
      console.warn('Failed to save fallback data:', e);
    }
  }

  private notifyListeners() {
    this.saveToStorage();
    this.saveFallbackData();
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Error in SQLite subscriber:', err);
      }
    });
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private async initialize(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        this.isReady = true;
        return;
      }
      const getInitSqlJs = () => (window as any).initSqlJs;

      if (typeof getInitSqlJs === 'function') {
        const SQL = await getInitSqlJs()({
          locateFile: (file: string) => `/${file}`
        });

        const savedDbBase64 = localStorage.getItem(STORAGE_KEY);
        if (savedDbBase64) {
          try {
            const binaryString = atob(savedDbBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            this.db = new SQL.Database(bytes);
            this.migrateTables();
          } catch (e) {
            console.warn('Corrupted SQLite binary in storage, creating fresh database', e);
            this.db = new SQL.Database();
            this.initTablesAndSeed();
          }
        } else {
          this.db = new SQL.Database();
          this.initTablesAndSeed();
        }

        this.isWasm = true;
      }
    } catch (err) {
      console.warn('SQLite WASM initialization warning (using local SQL engine):', err);
    } finally {
      this.isReady = true;
      this.syncMemoryFromDb();
    }
  }

  private migrateTables() {
    if (!this.db) return;
    try {
      this.db.run(CREATE_TRANSACTIONS_TABLE_SQL);
    } catch {}
    try {
      this.db.run(CREATE_RECOMMENDATION_OUTCOMES_TABLE_SQL);
    } catch {}
    try {
      this.db.run("ALTER TABLE users ADD COLUMN experience INTEGER DEFAULT 0;");
    } catch {}
    try {
      this.db.run("ALTER TABLE users ADD COLUMN city TEXT DEFAULT 'Chennai';");
    } catch {}
    try {
      this.db.run("ALTER TABLE users ADD COLUMN address TEXT;");
    } catch {}
    try {
      this.db.run("ALTER TABLE users ADD COLUMN landmark TEXT;");
    } catch {}
    try {
      this.db.run("ALTER TABLE users ADD COLUMN door_no TEXT;");
    } catch {}
    try {
      this.db.run("ALTER TABLE users ADD COLUMN street_name TEXT;");
    } catch {}
    try {
      this.db.run("ALTER TABLE users ADD COLUMN district TEXT;");
    } catch {}
    try {
      this.db.run("ALTER TABLE jobs ADD COLUMN original_text TEXT;");
    } catch {}
    try {
      this.db.run("ALTER TABLE jobs ADD COLUMN original_language TEXT DEFAULT 'en';");
    } catch {}
    try {
      this.db.run("ALTER TABLE jobs ADD COLUMN translations TEXT;");
    } catch {}
    try {
      this.db.run("ALTER TABLE jobs ADD COLUMN payment_status TEXT DEFAULT 'UNPAID';");
    } catch {}
    try {
      this.db.run("ALTER TABLE jobs ADD COLUMN payment_transaction_id TEXT;");
    } catch {}
    try {
      this.db.run("ALTER TABLE jobs ADD COLUMN payment_date TEXT;");
    } catch {}
    try {
      this.db.run("ALTER TABLE jobs ADD COLUMN payment_method TEXT;");
    } catch {}
    try {
      this.db.run("ALTER TABLE recommendation_outcomes ADD COLUMN recommended_at TIMESTAMP;");
    } catch {}
    try {
      this.db.run("ALTER TABLE recommendation_outcomes ADD COLUMN accepted_at TIMESTAMP;");
    } catch {}
    try {
      this.db.run("ALTER TABLE recommendation_outcomes ADD COLUMN completed_at TIMESTAMP;");
    } catch {}
  }

  private initTablesAndSeed() {
    if (!this.db) return;
    this.db.run(INIT_DATABASE_SQL);
    this.migrateTables();

    // Seed Users
    const userStmt = this.db.prepare(
      `INSERT OR IGNORE INTO users (id, role, name, age, phone, skills, free_time_slots, preferred_language, latitude, longitude, experience, city, address, landmark, door_no, street_name, district) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    INITIAL_USERS.forEach(u => {
      userStmt.run([
        u.id,
        u.role,
        u.name,
        u.age,
        u.phone,
        u.skills,
        u.free_time_slots,
        u.preferred_language,
        u.latitude,
        u.longitude,
        (u as any).experience || 0,
        (u as any).city || 'Chennai',
        (u as any).address || '',
        (u as any).landmark || '',
        (u as any).door_no || '',
        (u as any).street_name || '',
        (u as any).district || (u as any).city || 'Chennai'
      ]);
    });
    userStmt.free();

    // Seed Jobs
    const jobStmt = this.db.prepare(
      `INSERT OR IGNORE INTO jobs (id, recruiter_id, title, description, category, required_skills, payout_amount, payout_unit, latitude, longitude, landmark_area, status, claimed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    INITIAL_JOBS.forEach(j => {
      jobStmt.run([
        j.id,
        j.recruiter_id,
        j.title,
        j.description,
        j.category,
        j.required_skills,
        j.payout_amount,
        j.payout_unit,
        j.latitude,
        j.longitude,
        j.landmark_area,
        j.status,
        j.claimed_by,
        j.created_at
      ]);
    });
    jobStmt.free();

    // Seed Outcomes
    try {
      const outcomeStmt = this.db.prepare(
        `INSERT OR IGNORE INTO recommendation_outcomes (id, job_id, worker_id, recommended_at, status, match_score, accepted_at, completed_at, rating, feedback_comment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      this.memoryOutcomes.forEach(o => {
        outcomeStmt.run([
          o.id,
          o.job_id,
          o.worker_id,
          o.recommended_at,
          o.status,
          o.match_score || null,
          o.accepted_at || null,
          o.completed_at || null,
          o.rating || null,
          o.feedback_comment || null
        ]);
      });
      outcomeStmt.free();
    } catch (e) {
      console.warn('SQLite seed outcomes error:', e);
    }

    this.saveToStorage();
  }

  private getTransactionsFromDb(): PaymentTransaction[] {
    if (!this.db) return [];
    try {
      const results = this.db.exec('SELECT * FROM transactions ORDER BY created_at DESC, id DESC');
      if (!results || results.length === 0) return [];
      const { columns, values } = results[0];
      return values.map((row: any[]) => {
        const obj: any = {};
        columns.forEach((col: string, idx: number) => {
          obj[col] = row[idx];
        });
        return {
          id: obj.id,
          job_id: obj.job_id,
          job_title: obj.job_title,
          recruiter_id: obj.recruiter_id,
          recruiter_name: obj.recruiter_name,
          seeker_id: obj.seeker_id,
          seeker_name: obj.seeker_name,
          amount: Number(obj.amount),
          payout_unit: obj.payout_unit || 'task',
          payment_method: obj.payment_method || 'UPI',
          status: obj.status || 'Payment Successful',
          created_at: obj.created_at
        };
      });
    } catch (e) {
      console.warn('getTransactionsFromDb error:', e);
      return [];
    }
  }

  private syncMemoryFromDb() {
    if (this.db && this.isWasm) {
      try {
        const users = this.getUsersFromDb();
        const jobs = this.getJobsFromDb();
        const transactions = this.getTransactionsFromDb();
        if (users.length > 0) this.memoryUsers = users;
        if (jobs.length > 0) this.memoryJobs = jobs;
        if (transactions.length > 0) this.memoryTransactions = transactions;
      } catch (e) {
        console.warn('Sync memory error:', e);
      }
    }
  }

  private saveToStorage() {
    if (!this.db || !this.isWasm) return;
    try {
      const data = this.db.export();
      let binary = '';
      const len = data.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(data[i]);
      }
      const base64 = btoa(binary);
      localStorage.setItem(STORAGE_KEY, base64);
    } catch (e) {
      console.warn('Failed to save SQLite DB to localStorage:', e);
    }
  }

  // --- RAW SQL EXECUTOR FOR SQL TERMINAL / CONSOLE ---
  public executeRawSQL(query: string): { columns: string[]; values: any[][] }[] {
    if (this.db && this.isWasm) {
      try {
        const results = this.db.exec(query);
        this.syncMemoryFromDb();
        this.notifyListeners();
        return results;
      } catch (err: any) {
        throw new Error(err.message || String(err));
      }
    }

    // Fallback executor for terminal queries
    const qLower = query.toLowerCase().trim();
    if (qLower.startsWith('select')) {
      if (qLower.includes('jobs')) {
        const columns = ['id', 'title', 'category', 'payout_amount', 'payout_unit', 'landmark_area', 'status', 'claimed_by'];
        const values = this.memoryJobs.map(j => [j.id, j.title, j.category, j.payout_amount, j.payout_unit, j.landmark_area, j.status, j.claimed_by]);
        return [{ columns, values }];
      } else if (qLower.includes('users')) {
        const columns = ['id', 'role', 'name', 'phone', 'skills', 'preferred_language', 'latitude', 'longitude'];
        const values = this.memoryUsers.map(u => [u.id, u.role, u.name, u.phone, JSON.stringify(u.skills), u.preferred_language, u.latitude, u.longitude]);
        return [{ columns, values }];
      } else {
        const columns = ['info', 'version', 'status'];
        const values = [['Talent2Task SQLite Local Engine', '3.45 (WASM & IndexedDB)', 'ONLINE']];
        return [{ columns, values }];
      }
    }

    return [{ columns: ['status', 'message'], values: [['SUCCESS', 'Query executed successfully.']] }];
  }

  // --- USER OPERATIONS ---
  private getUsersFromDb(): User[] {
    if (!this.db) return [];
    const results = this.db.exec('SELECT * FROM users ORDER BY created_at DESC, id DESC');
    if (!results || results.length === 0) return [];
    
    const { columns, values } = results[0];
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, idx: number) => {
        obj[col] = row[idx];
      });
      return {
        id: obj.id,
        role: obj.role as Role,
        name: obj.name,
        age: obj.age,
        phone: obj.phone,
        skills: obj.skills ? JSON.parse(obj.skills) : [],
        free_time_slots: obj.free_time_slots ? JSON.parse(obj.free_time_slots) : [],
        preferred_language: (obj.preferred_language || 'en') as Language,
        latitude: obj.latitude,
        longitude: obj.longitude,
        created_at: obj.created_at,
        experience: obj.experience !== undefined && obj.experience !== null ? Number(obj.experience) : 0,
        city: obj.city || 'Chennai',
        address: obj.address || '',
        landmark: obj.landmark || '',
        door_no: obj.door_no || '',
        street_name: obj.street_name || '',
        district: obj.district || obj.city || 'Chennai'
      };
    });
  }

  public getUsers(): User[] {
    if (this.db && this.isWasm) {
      try {
        return this.getUsersFromDb();
      } catch (e) {
        console.warn('getUsersFromDb error, using fallback:', e);
      }
    }
    return this.memoryUsers;
  }

  public getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  public upsertUser(user: User, isRemote: boolean = false): void {
    const idx = this.memoryUsers.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      this.memoryUsers[idx] = user;
    } else {
      this.memoryUsers.unshift(user);
    }

    if (this.db && this.isWasm) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO users (id, role, name, age, phone, skills, free_time_slots, preferred_language, latitude, longitude, experience, city, address, landmark, door_no, street_name, district)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            role = excluded.role,
            name = excluded.name,
            age = excluded.age,
            phone = excluded.phone,
            skills = excluded.skills,
            free_time_slots = excluded.free_time_slots,
            preferred_language = excluded.preferred_language,
            latitude = excluded.latitude,
            longitude = excluded.longitude,
            experience = excluded.experience,
            city = excluded.city,
            address = excluded.address,
            landmark = excluded.landmark,
            door_no = excluded.door_no,
            street_name = excluded.street_name,
            district = excluded.district
        `);
        stmt.run([
          user.id,
          user.role,
          user.name,
          user.age,
          user.phone,
          JSON.stringify(user.skills || []),
          JSON.stringify(user.free_time_slots || []),
          user.preferred_language || 'en',
          user.latitude,
          user.longitude,
          user.experience ?? 0,
          user.city || 'Chennai',
          user.address || '',
          user.landmark || '',
          user.door_no || '',
          user.street_name || '',
          user.district || user.city || 'Chennai'
        ]);
        stmt.free();
      } catch (e) {
        console.warn('SQLite upsertUser error:', e);
      }
    }

    this.notifyListeners();

    if (!isRemote) {
      if (!offlineQueueService.isOnline()) {
        offlineQueueService.enqueueAction('UPSERT_USER', user);
      } else {
        syncService.broadcastUserUpserted(user);
      }
    }
  }

  public createUser(userData: Omit<User, 'id' | 'created_at'>): User {
    const id = `usr_${userData.role}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newUser: User = {
      ...userData,
      id,
      created_at: now,
      skills: userData.skills || [],
      free_time_slots: userData.free_time_slots || [],
      preferred_language: userData.preferred_language || 'en',
      experience: userData.experience ?? 0,
      city: userData.city || 'Chennai',
      door_no: userData.door_no || '',
      street_name: userData.street_name || '',
      district: userData.district || userData.city || 'Chennai'
    };

    this.upsertUser(newUser);

    this.addNotification({
      user_id: newUser.id,
      title: `🎉 Welcome to Talent2Task, ${newUser.name}!`,
      message: `Your profile is registered in the Tamil Nadu database. Real-time radar is active!`,
      type: 'system',
      is_read: false
    });

    return newUser;
  }

  public findUserByPhoneOrId(query: string): User | null {
    const cleanQ = query.trim().toLowerCase();
    if (!cleanQ) return null;
    const users = this.getUsers();
    return users.find(u => 
      u.id.toLowerCase() === cleanQ || 
      u.phone.toLowerCase().replace(/\s+/g, '').includes(cleanQ.replace(/\s+/g, '')) ||
      u.name.toLowerCase().includes(cleanQ)
    ) || null;
  }

  // --- JOB OPERATIONS ---
  private getJobsFromDb(): Job[] {
    if (!this.db) return [];
    const query = `
      SELECT 
        j.*,
        r.name AS recruiter_name,
        r.phone AS recruiter_phone,
        r.address AS recruiter_address,
        r.city AS recruiter_city,
        s.name AS claimed_by_name,
        s.phone AS claimed_by_phone
      FROM jobs j
      LEFT JOIN users r ON j.recruiter_id = r.id
      LEFT JOIN users s ON j.claimed_by = s.id
      ORDER BY j.created_at DESC
    `;
    const results = this.db.exec(query);
    if (!results || results.length === 0) return [];
    
    const { columns, values } = results[0];
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, idx: number) => {
        obj[col] = row[idx];
      });
      return {
        id: obj.id,
        recruiter_id: obj.recruiter_id,
        title: obj.title,
        description: obj.description || '',
        category: obj.category,
        required_skills: obj.required_skills ? JSON.parse(obj.required_skills) : [],
        payout_amount: Number(obj.payout_amount),
        payout_unit: obj.payout_unit || 'hour',
        latitude: Number(obj.latitude),
        longitude: Number(obj.longitude),
        landmark_area: obj.landmark_area || 'Tamil Nadu',
        city: obj.city || obj.recruiter_city || deriveCityFromArea(obj.landmark_area || ''),
        status: obj.status,
        claimed_by: obj.claimed_by || null,
        created_at: obj.created_at,
        original_text: obj.original_text || undefined,
        original_language: (obj.original_language as Language) || undefined,
        translations: obj.translations ? (typeof obj.translations === 'string' ? JSON.parse(obj.translations) : obj.translations) : undefined,
        recruiter_name: obj.recruiter_name,
        recruiter_phone: obj.recruiter_phone,
        recruiter_address: obj.recruiter_address || '',
        recruiter_city: obj.recruiter_city || '',
        claimed_by_name: obj.claimed_by_name,
        claimed_by_phone: obj.claimed_by_phone,
        payment_status: (obj.payment_status as 'UNPAID' | 'PAID') || (obj.payment_transaction_id ? 'PAID' : 'UNPAID'),
        payment_transaction_id: obj.payment_transaction_id || undefined,
        payment_date: obj.payment_date || undefined,
        payment_method: obj.payment_method || undefined
      };
    });
  }

  public getJobs(): Job[] {
    let jobsList = this.memoryJobs;
    if (this.db && this.isWasm) {
      try {
        jobsList = this.getJobsFromDb();
      } catch (e) {
        console.warn('getJobsFromDb error, using fallback:', e);
      }
    }

    return jobsList.map(job => {
      const recruiter = this.getUserById(job.recruiter_id);
      const claimant = job.claimed_by ? this.getUserById(job.claimed_by) : null;
      const reports = this.getReportsForJob(job.id);
      const trustAssessment = trustSafetyService.evaluateJobTrust(
        job,
        recruiter,
        jobsList,
        reports.length
      );

      const recruiterCity = recruiter?.city || (job as any).recruiter_city || deriveCityFromArea(job.landmark_area || '');
      const jobCity = job.city || (job as any).recruiter_city || recruiterCity || deriveCityFromArea(job.landmark_area || '');
      const recruiterAddress = recruiter?.address || (job as any).recruiter_address || (recruiter?.landmark ? `${recruiter.landmark}, ${recruiter.city || ''}` : '') || job.landmark_area || '';

      return {
        ...job,
        city: jobCity,
        recruiter_name: recruiter?.name || job.recruiter_name || 'Tamil Nadu Recruiter',
        recruiter_phone: recruiter?.phone || job.recruiter_phone || '+91 99440 11223',
        recruiter_address: recruiterAddress,
        recruiter_city: recruiterCity,
        claimed_by_name: claimant?.name || job.claimed_by_name || undefined,
        claimed_by_phone: claimant?.phone || job.claimed_by_phone || undefined,
        trustAssessment,
        reportCount: reports.length
      };
    });
  }

  public createJob(job: Omit<Job, 'id' | 'created_at'>, isRemote: boolean = false): string {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const recruiter = this.getUserById(job.recruiter_id);
    const origLang = job.original_language || detectLanguageFromScript(job.title + ' ' + (job.description || ''));

    const newJob: Job = {
      ...job,
      id,
      created_at: now,
      original_text: job.original_text || job.description || job.title,
      original_language: origLang,
      translations: job.translations || undefined,
      recruiter_name: recruiter?.name || 'Tamil Nadu Recruiter',
      recruiter_phone: recruiter?.phone || '+91 99440 11223'
    };

    this.memoryJobs.unshift(newJob);

    if (this.db && this.isWasm) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO jobs (id, recruiter_id, title, description, category, required_skills, payout_amount, payout_unit, latitude, longitude, landmark_area, status, claimed_by, created_at, original_text, original_language, translations)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run([
          id,
          job.recruiter_id,
          job.title,
          job.description,
          job.category,
          JSON.stringify(job.required_skills),
          job.payout_amount,
          job.payout_unit,
          job.latitude,
          job.longitude,
          job.landmark_area,
          job.status || 'OPEN',
          job.claimed_by || null,
          now,
          newJob.original_text || null,
          newJob.original_language || 'en',
          newJob.translations ? JSON.stringify(newJob.translations) : null
        ]);
        stmt.free();
      } catch (e) {
        console.warn('SQLite createJob error:', e);
      }
    }

    // Asynchronously pre-generate complete multilingual translations across en, ta, te, hi
    if (!newJob.translations) {
      (async () => {
        try {
          const [titleTrans, descTrans, catTrans, landTrans] = await Promise.all([
            translateAllLanguages(job.title, origLang),
            job.description ? translateAllLanguages(job.description, origLang) : Promise.resolve({ en: '', ta: '', te: '', hi: '' }),
            translateAllLanguages(job.category, origLang),
            job.landmark_area ? translateAllLanguages(job.landmark_area, origLang) : Promise.resolve({ en: '', ta: '', te: '', hi: '' })
          ]);

          newJob.translations = {
            title: titleTrans,
            description: descTrans,
            category: catTrans,
            landmark_area: landTrans
          };

          // Update memory and database with translations
          if (this.db && this.isWasm) {
            try {
              const uStmt = this.db.prepare('UPDATE jobs SET translations = ? WHERE id = ?');
              uStmt.run([JSON.stringify(newJob.translations), id]);
              uStmt.free();
            } catch (err) {
              console.warn('Failed to update translations in SQLite:', err);
            }
          }
          this.notifyListeners();
        } catch (tErr) {
          console.warn('Multilingual prefetch error for job:', tErr);
        }
      })();
    }

    this.notifyListeners();

    if (!isRemote) {
      if (!offlineQueueService.isOnline()) {
        offlineQueueService.enqueueAction('CREATE_JOB', newJob);
      } else {
        syncService.broadcastJobCreated(newJob);
      }
    }

    return id;
  }

  public claimJob(jobId: string, seekerId: string, isRemote: boolean = false): void {
    const seeker = this.getUserById(seekerId);
    const job = this.memoryJobs.find(j => j.id === jobId);
    if (job) {
      job.status = 'CLAIMED';
      job.claimed_by = seekerId;
      if (seeker) {
        job.claimed_by_name = seeker.name;
        job.claimed_by_phone = seeker.phone;
      }
    }

    if (this.db && this.isWasm) {
      try {
        const stmt = this.db.prepare(`
          UPDATE jobs 
          SET status = 'CLAIMED', claimed_by = ? 
          WHERE id = ? AND status = 'OPEN'
        `);
        stmt.run([seekerId, jobId]);
        stmt.free();
      } catch (e) {
        console.warn('SQLite claimJob error:', e);
      }
    }

    // Phase 8: Track recommendation lifecycle -> accepted
    this.updateOutcomeStatus(jobId, seekerId, 'accepted');

    this.notifyListeners();

    if (!isRemote) {
      if (!offlineQueueService.isOnline()) {
        offlineQueueService.enqueueAction('CLAIM_JOB', { jobId, seekerId, seekerName: seeker?.name, seekerPhone: seeker?.phone });
      } else {
        syncService.broadcastJobClaimed(jobId, seekerId, seeker?.name, seeker?.phone);
      }
    }
  }

  public updateJobStatus(jobId: string, status: 'OPEN' | 'CLAIMED' | 'COMPLETED', isRemote: boolean = false): void {
    const job = this.memoryJobs.find(j => j.id === jobId);
    if (job) {
      job.status = status;
    }

    if (this.db && this.isWasm) {
      try {
        const stmt = this.db.prepare(`
          UPDATE jobs 
          SET status = ? 
          WHERE id = ?
        `);
        stmt.run([status, jobId]);
        stmt.free();
      } catch (e) {
        console.warn('SQLite updateJobStatus error:', e);
      }
    }

    // Phase 8: Track recommendation lifecycle -> completed
    if (status === 'COMPLETED' && job?.claimed_by) {
      this.updateOutcomeStatus(jobId, job.claimed_by, 'completed');
    }

    this.notifyListeners();

    if (!isRemote) {
      if (!offlineQueueService.isOnline()) {
        offlineQueueService.enqueueAction('UPDATE_JOB_STATUS', { jobId, status });
      } else {
        syncService.broadcastJobStatusUpdated(jobId, status);
      }
    }
  }

  public deleteJob(jobId: string, isRemote: boolean = false): void {
    this.memoryJobs = this.memoryJobs.filter(j => j.id !== jobId);

    if (this.db && this.isWasm) {
      try {
        const stmt = this.db.prepare('DELETE FROM jobs WHERE id = ?');
        stmt.run([jobId]);
        stmt.free();
      } catch (e) {
        console.warn('SQLite deleteJob error:', e);
      }
    }

    this.notifyListeners();

    if (!isRemote) {
      if (!offlineQueueService.isOnline()) {
        offlineQueueService.enqueueAction('DELETE_JOB', { jobId });
      } else {
        syncService.broadcastJobDeleted(jobId);
      }
    }
  }

  // --- REVIEWS & RATINGS ---
  public getReviews(toUserId?: string): FeedbackReview[] {
    if (toUserId) {
      return this.memoryReviews.filter(r => r.to_user_id === toUserId);
    }
    return this.memoryReviews;
  }

  public addReview(reviewData: Omit<FeedbackReview, 'id' | 'created_at'>, isRemote: boolean = false): FeedbackReview {
    const newReview: FeedbackReview = {
      ...reviewData,
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    this.memoryReviews.unshift(newReview);

    // Phase 8: Transition recommendation outcome to 'rated'
    this.updateOutcomeStatus(reviewData.job_id, reviewData.to_user_id, 'rated', reviewData.rating, reviewData.comment);

    this.addNotification({
      user_id: newReview.to_user_id,
      title: `⭐ New ${newReview.rating}-Star Feedback Received!`,
      message: `${newReview.from_user_name} reviewed your work on "${newReview.job_title}": "${newReview.comment.substring(0, 70)}..."`,
      type: 'rating',
      is_read: false,
      linkJobId: newReview.job_id
    }, isRemote);

    this.notifyListeners();

    if (!isRemote) {
      if (!offlineQueueService.isOnline()) {
        offlineQueueService.enqueueAction('SUBMIT_REVIEW', newReview);
      } else {
        syncService.broadcastReview(newReview);
      }
    }

    return newReview;
  }

  // --- PAYMENT TRANSACTIONS (PHASE 35) ---
  public isJobPaid(jobId: string): boolean {
    const job = this.memoryJobs.find(j => j.id === jobId);
    if (job?.payment_status === 'PAID' || Boolean(job?.payment_transaction_id)) return true;
    return this.memoryTransactions.some(t => t.job_id === jobId);
  }

  public createPaymentTransaction(txData: {
    job_id: string;
    job_title: string;
    recruiter_id: string;
    recruiter_name: string;
    seeker_id: string;
    seeker_name: string;
    amount: number;
    payout_unit: string;
    payment_method: 'UPI' | 'Card' | 'Net Banking' | 'Wallet';
  }, isRemote: boolean = false): PaymentTransaction {
    // If already paid for this job, return the existing transaction without paying again
    const existingTxn = this.memoryTransactions.find(t => t.job_id === txData.job_id);
    if (existingTxn) {
      return existingTxn;
    }

    const txnId = `T2T-TXN-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newTxn: PaymentTransaction = {
      id: txnId,
      job_id: txData.job_id,
      job_title: txData.job_title,
      recruiter_id: txData.recruiter_id,
      recruiter_name: txData.recruiter_name,
      seeker_id: txData.seeker_id,
      seeker_name: txData.seeker_name,
      amount: txData.amount,
      payout_unit: txData.payout_unit,
      payment_method: txData.payment_method,
      status: 'Payment Successful',
      created_at: now
    };

    this.memoryTransactions.unshift(newTxn);

    // Update memory job
    const job = this.memoryJobs.find(j => j.id === txData.job_id);
    if (job) {
      job.status = 'COMPLETED';
      job.payment_status = 'PAID';
      job.payment_transaction_id = txnId;
      job.payment_date = now;
      job.payment_method = txData.payment_method;
    }

    if (this.db && this.isWasm) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO transactions (id, job_id, job_title, recruiter_id, recruiter_name, seeker_id, seeker_name, amount, payout_unit, payment_method, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run([
          newTxn.id,
          newTxn.job_id,
          newTxn.job_title,
          newTxn.recruiter_id,
          newTxn.recruiter_name,
          newTxn.seeker_id,
          newTxn.seeker_name,
          newTxn.amount,
          newTxn.payout_unit,
          newTxn.payment_method,
          newTxn.status,
          now
        ]);
        stmt.free();

        const jobStmt = this.db.prepare(`
          UPDATE jobs 
          SET status = 'COMPLETED', payment_status = 'PAID', payment_transaction_id = ?, payment_date = ?, payment_method = ? 
          WHERE id = ?
        `);
        jobStmt.run([txnId, now, txData.payment_method, txData.job_id]);
        jobStmt.free();

        this.saveToStorage();
      } catch (e) {
        console.warn('SQLite createPaymentTransaction error:', e);
      }
    }

    // Seeker Notification (Exact format from Phase 35 specifications)
    this.addNotification({
      user_id: txData.seeker_id,
      title: 'Payment Received',
      message: `You received ₹${txData.amount} from ${txData.recruiter_name} for ${txData.job_title}.\n\nTransaction ID:\n${txnId}\n\nStatus:\nPayment Successful`,
      type: 'payment',
      is_read: false,
      linkJobId: txData.job_id
    }, isRemote);

    // Recruiter Notification
    this.addNotification({
      user_id: txData.recruiter_id,
      title: 'Payment Successful',
      message: `₹${txData.amount} paid to ${txData.seeker_name} for ${txData.job_title}.\n\nTransaction ID:\n${txnId}\n\nStatus:\nPayment Successful`,
      type: 'payment',
      is_read: false,
      linkJobId: txData.job_id
    }, isRemote);

    // Sync / Enqueue offline
    if (!isRemote) {
      if (!offlineQueueService.isOnline()) {
        offlineQueueService.enqueueAction('PROCESS_PAYMENT', newTxn);
      } else {
        syncService.broadcastPayment(newTxn);
      }
    }

    this.notifyListeners();
    return newTxn;
  }

  public getTransactionsByUser(userId: string): PaymentTransaction[] {
    if (this.db && this.isWasm) {
      try {
        const txs = this.getTransactionsFromDb();
        if (txs.length > 0) this.memoryTransactions = txs;
      } catch {}
    }
    return this.memoryTransactions.filter(t => t.recruiter_id === userId || t.seeker_id === userId);
  }

  public getTransactionByJobId(jobId: string): PaymentTransaction | null {
    if (this.db && this.isWasm) {
      try {
        const txs = this.getTransactionsFromDb();
        if (txs.length > 0) this.memoryTransactions = txs;
      } catch {}
    }
    return this.memoryTransactions.find(t => t.job_id === jobId) || null;
  }

  public getAverageRating(toUserId: string): { average: number; count: number } {
    const reviews = this.getReviews(toUserId);
    if (reviews.length === 0) return { average: 5.0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: parseFloat((sum / reviews.length).toFixed(1)),
      count: reviews.length
    };
  }

  // --- NOTIFICATIONS ---
  public getNotifications(userId: string): NotificationItem[] {
    return this.memoryNotifications
      .filter(n => n.user_id === userId || n.user_id === 'all')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addNotification(notifData: Omit<NotificationItem, 'id' | 'created_at'>, isRemote: boolean = false): NotificationItem {
    const newNotif: NotificationItem = {
      ...notifData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    this.memoryNotifications.unshift(newNotif);
    this.notifyListeners();

    if (!isRemote) {
      syncService.broadcastNotification(newNotif);
    }

    return newNotif;
  }

  public markNotificationAsRead(notifId: string): void {
    const notif = this.memoryNotifications.find(n => n.id === notifId);
    if (notif) {
      notif.is_read = true;
      this.notifyListeners();
    }
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.memoryNotifications.forEach(n => {
      if (n.user_id === userId || n.user_id === 'all') {
        n.is_read = true;
      }
    });
    this.notifyListeners();
  }

  // --- REMOTE SYNC APPLICATION HANDLERS ---

  public applyRemoteJob(job: Job): void {
    const exists = this.memoryJobs.some(j => j.id === job.id);
    if (exists) {
      const idx = this.memoryJobs.findIndex(j => j.id === job.id);
      this.memoryJobs[idx] = { ...this.memoryJobs[idx], ...job };
    } else {
      this.memoryJobs.unshift(job);
    }

    if (this.db && this.isWasm) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO jobs (id, recruiter_id, title, description, category, required_skills, payout_amount, payout_unit, latitude, longitude, landmark_area, status, claimed_by, created_at, original_text, original_language, translations)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            category = excluded.category,
            required_skills = excluded.required_skills,
            payout_amount = excluded.payout_amount,
            payout_unit = excluded.payout_unit,
            latitude = excluded.latitude,
            longitude = excluded.longitude,
            landmark_area = excluded.landmark_area,
            status = excluded.status,
            claimed_by = excluded.claimed_by,
            original_text = excluded.original_text,
            original_language = excluded.original_language,
            translations = excluded.translations
        `);
        stmt.run([
          job.id,
          job.recruiter_id,
          job.title,
          job.description || '',
          job.category,
          JSON.stringify(job.required_skills || []),
          job.payout_amount,
          job.payout_unit || 'hour',
          job.latitude,
          job.longitude,
          job.landmark_area,
          job.status || 'OPEN',
          job.claimed_by || null,
          job.created_at || new Date().toISOString(),
          job.original_text || null,
          job.original_language || 'en',
          job.translations ? JSON.stringify(job.translations) : null
        ]);
        stmt.free();
      } catch (e) {
        console.warn('applyRemoteJob SQLite error:', e);
      }
    }

    this.notifyListeners();
  }

  public applyRemoteJobClaim(jobId: string, seekerId: string, seekerName?: string, seekerPhone?: string): void {
    const job = this.memoryJobs.find(j => j.id === jobId);
    if (job) {
      job.status = 'CLAIMED';
      job.claimed_by = seekerId;
      if (seekerName) job.claimed_by_name = seekerName;
      if (seekerPhone) job.claimed_by_phone = seekerPhone;
    }

    if (this.db && this.isWasm) {
      try {
        const stmt = this.db.prepare('UPDATE jobs SET status = "CLAIMED", claimed_by = ? WHERE id = ?');
        stmt.run([seekerId, jobId]);
        stmt.free();
      } catch (e) {
        console.warn('applyRemoteJobClaim SQLite error:', e);
      }
    }

    this.notifyListeners();
  }

  public applyRemoteJobStatus(jobId: string, status: 'OPEN' | 'CLAIMED' | 'COMPLETED'): void {
    const job = this.memoryJobs.find(j => j.id === jobId);
    if (job) {
      job.status = status;
    }

    if (this.db && this.isWasm) {
      try {
        const stmt = this.db.prepare('UPDATE jobs SET status = ? WHERE id = ?');
        stmt.run([status, jobId]);
        stmt.free();
      } catch (e) {
        console.warn('applyRemoteJobStatus SQLite error:', e);
      }
    }

    this.notifyListeners();
  }

  public applyRemoteJobDelete(jobId: string): void {
    this.memoryJobs = this.memoryJobs.filter(j => j.id !== jobId);

    if (this.db && this.isWasm) {
      try {
        const stmt = this.db.prepare('DELETE FROM jobs WHERE id = ?');
        stmt.run([jobId]);
        stmt.free();
      } catch (e) {
        console.warn('applyRemoteJobDelete SQLite error:', e);
      }
    }

    this.notifyListeners();
  }

  public applyRemoteUser(user: User): void {
    this.upsertUser(user, true);
  }

  public applyRemoteNotification(notif: NotificationItem): void {
    const exists = this.memoryNotifications.some(n => n.id === notif.id);
    if (!exists) {
      this.memoryNotifications.unshift(notif);
      this.notifyListeners();
    }
  }

  public applyRemoteReview(review: FeedbackReview): void {
    const exists = this.memoryReviews.some(r => r.id === review.id);
    if (!exists) {
      this.memoryReviews.unshift(review);
      this.notifyListeners();
    }
  }

  public applyRemoteFullSync(state: { jobs?: Job[]; users?: User[]; reviews?: FeedbackReview[]; notifications?: NotificationItem[] }): void {
    if (Array.isArray(state.jobs) && state.jobs.length > 0) {
      state.jobs.forEach(j => this.applyRemoteJob(j));
    }
    if (Array.isArray(state.users) && state.users.length > 0) {
      state.users.forEach(u => this.applyRemoteUser(u));
    }
    if (Array.isArray(state.reviews) && state.reviews.length > 0) {
      state.reviews.forEach(r => this.applyRemoteReview(r));
    }
    if (Array.isArray(state.notifications) && state.notifications.length > 0) {
      state.notifications.forEach(n => this.applyRemoteNotification(n));
    }
    this.notifyListeners();
  }

  // --- COMMUNITY DEMAND & SKILL TRENDS ANALYSIS (PHASE 5 ENHANCED) ---
  public getDemandIntelligence(city?: string): CityDemandIntelligence {
    const allJobs = this.getJobs();
    return demandIntelligenceService.analyzeDemand(allJobs, city);
  }

  public getCommunitySkillTrends(city?: string): SkillDemandStat[] {
    const intelligence = this.getDemandIntelligence(city);
    return demandIntelligenceService.toSkillDemandStats(intelligence);
  }

  // --- TRUST & SAFETY REPORTS (PHASE 7) ---
  public submitReport(jobId: string, reporterId: string, reason: string, details?: string): JobReport {
    const id = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const report: JobReport = {
      id,
      job_id: jobId,
      reporter_id: reporterId,
      reason,
      details: details || '',
      created_at: now,
      status: 'PENDING_REVIEW'
    };

    this.memoryReports.unshift(report);

    if (this.db && this.isWasm) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO reports (id, job_id, reporter_id, reason, details, created_at, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run([id, jobId, reporterId, reason, details || '', now, 'PENDING_REVIEW']);
        stmt.free();
      } catch (e) {
        console.warn('SQLite submitReport error:', e);
      }
    }

    // Add administrative safety notification to alert system
    this.addNotification({
      user_id: 'all',
      title: '🛡️ Job Report Logged for Review',
      message: `A report has been submitted for Job #${jobId.substring(0, 8)} (${reason}). Our automated review queue has registered the notice.`,
      type: 'system',
      is_read: false,
      linkJobId: jobId
    });

    this.notifyListeners();
    return report;
  }

  public getReportsForJob(jobId: string): JobReport[] {
    return this.memoryReports.filter(r => r.job_id === jobId);
  }

  public getAllReports(): JobReport[] {
    return [...this.memoryReports];
  }

  // --- RECOMMENDATION OUTCOMES & FEEDBACK PIPELINE (PHASE 8) ---
  public recordRecommendationOutcome(
    jobId: string, 
    workerId: string, 
    matchScore?: number,
    recruiterId?: string
  ): RecommendationOutcome {
    const existing = this.memoryOutcomes.find(o => o.job_id === jobId && (o.worker_id === workerId || o.user_id === workerId));
    if (existing) {
      if (matchScore !== undefined && !existing.match_score) {
        existing.match_score = matchScore;
        this.saveFallbackData();
      }
      return existing;
    }

    const id = `rec_out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newOutcome: RecommendationOutcome = {
      id,
      job_id: jobId,
      user_id: workerId,
      worker_id: workerId,
      recruiter_id: recruiterId || '',
      recommended_at: now,
      created_at: now,
      updated_at: now,
      status: 'recommended',
      match_score: matchScore
    };

    this.memoryOutcomes.unshift(newOutcome);

    if (this.db && this.isWasm) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO recommendation_outcomes (id, job_id, user_id, recruiter_id, recommended_at, status, match_score, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run([id, jobId, workerId, recruiterId || '', now, 'recommended', matchScore ?? null, now, now]);
        stmt.free();
      } catch (e) {
        console.warn('SQLite recordRecommendationOutcome error:', e);
      }
    }

    this.notifyListeners();
    return newOutcome;
  }

  public updateOutcomeStatus(
    jobId: string, 
    workerId: string, 
    status: RecommendationLifecycleStatus, 
    rating?: number, 
    comment?: string
  ): void {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let outcome = this.memoryOutcomes.find(o => o.job_id === jobId && (o.worker_id === workerId || o.user_id === workerId));

    if (!outcome) {
      outcome = {
        id: `rec_out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        job_id: jobId,
        user_id: workerId,
        worker_id: workerId,
        recommended_at: now,
        created_at: now,
        updated_at: now,
        status: 'recommended'
      };
      this.memoryOutcomes.unshift(outcome);
    }

    outcome.status = status;
    outcome.updated_at = now;
    if (status === 'accepted') {
      if (!outcome.accepted_at) outcome.accepted_at = now;
    } else if (status === 'completed') {
      outcome.completed_at = now;
      if (!outcome.accepted_at) outcome.accepted_at = now;
    } else if (status === 'rated') {
      if (!outcome.completed_at) outcome.completed_at = now;
      if (!outcome.accepted_at) outcome.accepted_at = now;
      if (rating !== undefined) outcome.rating = rating;
      if (comment !== undefined) {
        outcome.feedback_comment = comment;
        outcome.completion_notes = comment;
      }
    }

    if (this.db && this.isWasm) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO recommendation_outcomes (id, job_id, user_id, recruiter_id, recommended_at, status, match_score, accepted_at, completed_at, rating, feedback_comment, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            status = excluded.status,
            accepted_at = COALESCE(excluded.accepted_at, recommendation_outcomes.accepted_at),
            completed_at = COALESCE(excluded.completed_at, recommendation_outcomes.completed_at),
            rating = COALESCE(excluded.rating, recommendation_outcomes.rating),
            feedback_comment = COALESCE(excluded.feedback_comment, recommendation_outcomes.feedback_comment),
            updated_at = excluded.updated_at
        `);
        stmt.run([
          outcome.id,
          outcome.job_id,
          outcome.user_id || outcome.worker_id,
          outcome.recruiter_id || '',
          outcome.recommended_at || now,
          outcome.status,
          outcome.match_score ?? null,
          outcome.accepted_at ?? null,
          outcome.completed_at ?? null,
          outcome.rating ?? null,
          outcome.feedback_comment ?? null,
          outcome.created_at || now,
          now
        ]);
        stmt.free();
      } catch (e) {
        console.warn('SQLite updateOutcomeStatus error:', e);
      }
    }

    this.notifyListeners();
  }

  public getOutcomesForWorker(workerId: string): RecommendationOutcome[] {
    return this.memoryOutcomes.filter(o => o.worker_id === workerId || o.user_id === workerId);
  }

  public getOutcomesForJob(jobId: string): RecommendationOutcome[] {
    return this.memoryOutcomes.filter(o => o.job_id === jobId);
  }

  public getAllRecommendationOutcomes(): RecommendationOutcome[] {
    return [...this.memoryOutcomes];
  }

  public resetDatabase(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FALLBACK_USERS_KEY);
      localStorage.removeItem(FALLBACK_JOBS_KEY);
      localStorage.removeItem(FALLBACK_REVIEWS_KEY);
      localStorage.removeItem(FALLBACK_NOTIFICATIONS_KEY);
      localStorage.removeItem(FALLBACK_REPORTS_KEY);
      localStorage.removeItem(FALLBACK_OUTCOMES_KEY);
    }
    this.memoryReports = [];
    this.memoryOutcomes = [];
    this.initFallbackData();

    if (this.db && this.isWasm) {
      try {
        this.db.run('DROP TABLE IF EXISTS jobs; DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS reviews; DROP TABLE IF EXISTS notifications; DROP TABLE IF EXISTS reports; DROP TABLE IF EXISTS recommendation_outcomes;');
        this.initTablesAndSeed();
      } catch (e) {
        console.warn('SQLite reset error:', e);
      }
    }

    this.notifyListeners();
  }

  public exportDatabaseBinary(): Uint8Array | null {
    if (this.db && this.isWasm) {
      return this.db.export();
    }
    const exportObj = {
      users: this.memoryUsers,
      jobs: this.memoryJobs,
      reviews: this.memoryReviews,
      notifications: this.memoryNotifications,
      reports: this.memoryReports,
      outcomes: this.memoryOutcomes,
      timestamp: new Date().toISOString()
    };
    const str = JSON.stringify(exportObj, null, 2);
    const enc = new TextEncoder();
    return enc.encode(str);
  }
}

export const sqliteManager = new SQLiteManager();
