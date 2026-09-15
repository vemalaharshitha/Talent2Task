export const CREATE_USERS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT CHECK(role IN ('seeker', 'recruiter')),
    name TEXT NOT NULL,
    age INTEGER,
    phone TEXT NOT NULL UNIQUE,
    skills TEXT, -- Comma-separated or JSON array
    free_time_slots TEXT, -- JSON array of available time slots
    preferred_language TEXT DEFAULT 'en',
    latitude REAL,
    longitude REAL,
    experience INTEGER DEFAULT 0,
    job_role TEXT,
    city TEXT DEFAULT 'Chennai',
    district TEXT DEFAULT 'Chennai',
    door_no TEXT,
    street_name TEXT,
    address TEXT,
    landmark TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export const CREATE_JOBS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    recruiter_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    required_skills TEXT NOT NULL, -- JSON array
    payout_amount REAL NOT NULL,
    payout_unit TEXT DEFAULT 'hour',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    landmark_area TEXT, -- e.g., 'Katpadi, Vellore', 'Sathuvachari'
    status TEXT CHECK(status IN ('OPEN', 'CLAIMED', 'COMPLETED')) DEFAULT 'OPEN',
    claimed_by TEXT, -- references users(id)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    original_text TEXT,
    original_language TEXT DEFAULT 'en',
    translations TEXT, -- JSON map of multilingual translations
    FOREIGN KEY(recruiter_id) REFERENCES users(id),
    FOREIGN KEY(claimed_by) REFERENCES users(id)
);
`;

export const CREATE_REVIEWS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    job_title TEXT NOT NULL,
    from_user_id TEXT NOT NULL,
    from_user_name TEXT NOT NULL,
    to_user_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    tags TEXT, -- JSON array of tags e.g. ["Punctual", "Skilled"]
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export const CREATE_NOTIFICATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system',
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    link_job_id TEXT
);
`;

export const CREATE_REPORTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    reporter_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'PENDING_REVIEW',
    FOREIGN KEY(job_id) REFERENCES jobs(id),
    FOREIGN KEY(reporter_id) REFERENCES users(id)
);
`;

export const CREATE_RECOMMENDATION_OUTCOMES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS recommendation_outcomes (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    user_id TEXT,
    worker_id TEXT,
    recruiter_id TEXT,
    match_score REAL DEFAULT 0,
    semantic_score REAL DEFAULT 0,
    status TEXT NOT NULL,
    recommended_at TIMESTAMP,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    rating INTEGER,
    feedback_comment TEXT,
    completion_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(job_id) REFERENCES jobs(id)
);
`;

export const CREATE_TRANSACTIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    job_title TEXT NOT NULL,
    recruiter_id TEXT NOT NULL,
    recruiter_name TEXT NOT NULL,
    seeker_id TEXT NOT NULL,
    seeker_name TEXT NOT NULL,
    amount REAL NOT NULL,
    payout_unit TEXT DEFAULT 'task',
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'Payment Successful',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(job_id) REFERENCES jobs(id),
    FOREIGN KEY(recruiter_id) REFERENCES users(id),
    FOREIGN KEY(seeker_id) REFERENCES users(id)
);
`;

export const CREATE_SAFEGIG_SESSIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS safegig_sessions (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    job_title TEXT NOT NULL,
    job_location TEXT,
    started_at TEXT NOT NULL,
    checked_out_at TEXT,
    duration_seconds INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('ACTIVE', 'COMPLETED', 'SOS_TRIGGERED')) DEFAULT 'ACTIVE',
    sos_activated INTEGER DEFAULT 0,
    sos_timestamp TEXT,
    location_lat REAL,
    location_lng REAL,
    location_address TEXT,
    location_available INTEGER DEFAULT 0,
    safety_note TEXT,
    sync_status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(worker_id) REFERENCES users(id),
    FOREIGN KEY(job_id) REFERENCES jobs(id)
);
`;

export const INIT_DATABASE_SQL = `
${CREATE_USERS_TABLE_SQL}
${CREATE_JOBS_TABLE_SQL}
${CREATE_REVIEWS_TABLE_SQL}
${CREATE_NOTIFICATIONS_TABLE_SQL}
${CREATE_REPORTS_TABLE_SQL}
${CREATE_RECOMMENDATION_OUTCOMES_TABLE_SQL}
${CREATE_TRANSACTIONS_TABLE_SQL}
${CREATE_SAFEGIG_SESSIONS_TABLE_SQL}
`;
