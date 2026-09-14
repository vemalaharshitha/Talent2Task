-- ============================================================================
-- Talent2Task Production PostgreSQL & PostGIS Schema Definition
-- Technology Stack: PostgreSQL 15+ with PostGIS 3+ Spatial Extension
-- ============================================================================

-- 1. Enable PostGIS Extension for Geographic Computations
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enumerated Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SEEKER', 'RECRUITER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('OPEN', 'CLAIMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payout_type AS ENUM ('HOURLY', 'DAILY', 'FIXED', 'MONTHLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Users Table with Spatial Point Geometry
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'SEEKER',
    category VARCHAR(128),
    skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    experience_years NUMERIC(4,1) DEFAULT 0.0,
    daily_rate NUMERIC(10,2),
    payout_type payout_type DEFAULT 'DAILY',
    is_available BOOLEAN DEFAULT TRUE,
    rating NUMERIC(3,2) DEFAULT 5.00,
    total_reviews INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    reliability_score NUMERIC(5,2) DEFAULT 75.00,
    address TEXT,
    district VARCHAR(128) DEFAULT 'Chennai',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    -- PostGIS Spatial Column (SRID 4326 - WGS 84 GPS coordinates)
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Spatial GIST Index for User Geographic Search
CREATE INDEX IF NOT EXISTS idx_users_location_gist ON users USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_users_skills ON users USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_users_role_available ON users (role, is_available);

-- 4. Jobs Table with Spatial Point Geometry
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(64) PRIMARY KEY,
    recruiter_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(128) NOT NULL,
    required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    payout_amount NUMERIC(10,2) NOT NULL,
    payout_type payout_type NOT NULL DEFAULT 'DAILY',
    status job_status NOT NULL DEFAULT 'OPEN',
    claimed_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    claimed_by_name VARCHAR(255),
    claimed_by_phone VARCHAR(32),
    address TEXT NOT NULL,
    district VARCHAR(128) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    -- PostGIS Spatial Point for Job Location
    location GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Spatial GIST Index for Job Geographic Queries
CREATE INDEX IF NOT EXISTS idx_jobs_location_gist ON jobs USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_jobs_status_category ON jobs (status, category);
CREATE INDEX IF NOT EXISTS idx_jobs_required_skills ON jobs USING GIN (required_skills);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) REFERENCES jobs(id) ON DELETE SET NULL,
    reviewer_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews (reviewee_id);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(64) DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read);

-- 7. Trust & Safety Job Reports Table
CREATE TABLE IF NOT EXISTS job_reports (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) REFERENCES jobs(id) ON DELETE CASCADE,
    reporter_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(128) NOT NULL,
    details TEXT,
    status VARCHAR(64) DEFAULT 'PENDING_REVIEW',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_reports_status ON job_reports (status);

-- 8. Continuous Feedback & Recommendation Outcomes Table
CREATE TABLE IF NOT EXISTS recommendation_outcomes (
    id VARCHAR(64) PRIMARY KEY,
    candidate_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    job_id VARCHAR(64) REFERENCES jobs(id) ON DELETE CASCADE,
    recommendation_rank INTEGER NOT NULL,
    hybrid_score NUMERIC(5,2) NOT NULL,
    outcome VARCHAR(64) NOT NULL, -- 'RECOMMENDED', 'ACCEPTED', 'COMPLETED', 'REJECTED'
    rating_given NUMERIC(3,2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recommendation_outcomes ON recommendation_outcomes (candidate_id, job_id);

-- 9. Offline Action Sync Queue (Server Log)
CREATE TABLE IF NOT EXISTS offline_sync_queue (
    id VARCHAR(64) PRIMARY KEY,
    device_id VARCHAR(128) NOT NULL,
    action_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(32) DEFAULT 'QUEUED',
    received_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ
);

-- ============================================================================
-- PostGIS Optimized Spatial Procedures & Functions
-- ============================================================================

-- Function: Find jobs within radius (km) with exact distance calculation
CREATE OR REPLACE FUNCTION get_jobs_within_radius(
    user_lng NUMERIC,
    user_lat NUMERIC,
    radius_km NUMERIC DEFAULT 25.0
)
RETURNS TABLE (
    id VARCHAR(64),
    title VARCHAR(255),
    category VARCHAR(128),
    payout_amount NUMERIC(10,2),
    payout_type payout_type,
    district VARCHAR(128),
    distance_km NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.title,
        j.category,
        j.payout_amount,
        j.payout_type,
        j.district,
        ROUND((ST_Distance(
            j.location::geography, 
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) / 1000.0)::numeric, 2) AS distance_km
    FROM jobs j
    WHERE j.status = 'OPEN'
      AND ST_DWithin(
            j.location::geography, 
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, 
            radius_km * 1000.0
      )
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: Find available candidates for a job within proximity
CREATE OR REPLACE FUNCTION get_nearby_candidates_for_job(
    job_lng NUMERIC,
    job_lat NUMERIC,
    target_skill VARCHAR,
    radius_km NUMERIC DEFAULT 30.0
)
RETURNS TABLE (
    id VARCHAR(64),
    name VARCHAR(255),
    skills TEXT[],
    reliability_score NUMERIC(5,2),
    distance_km NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.name,
        u.skills,
        u.reliability_score,
        ROUND((ST_Distance(
            u.location::geography, 
            ST_SetSRID(ST_MakePoint(job_lng, job_lat), 4326)::geography
        ) / 1000.0)::numeric, 2) AS distance_km
    FROM users u
    WHERE u.role = 'SEEKER'
      AND u.is_available = TRUE
      AND (target_skill IS NULL OR target_skill = ANY(u.skills))
      AND ST_DWithin(
            u.location::geography, 
            ST_SetSRID(ST_MakePoint(job_lng, job_lat), 4326)::geography, 
            radius_km * 1000.0
      )
    ORDER BY u.reliability_score DESC, distance_km ASC;
END;
$$ LANGUAGE plpgsql;
