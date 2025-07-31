/**
 * Database types and schemas for Judge Finder application
 */

export interface Judge {
  id: number;
  name: string;
  circuit: string;
  tier: "federal" | "state" | "local";
  appointedBy: string;
  yearsOfService: number;
  almaMater: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourtListenerJudge {
  id: number;
  dateCreated: string;
  dateModified: string;
  dateCompleted: string | null;
  fjcId: number | null;
  slug: string;
  nameFirst: string;
  nameMiddle: string;
  nameLast: string;
  nameSuffix: string;
  dateDob: string | null;
  dateGranularityDob: string;
  dateDod: string | null;
  dateGranularityDod: string;
  dobCity: string;
  dobState: string;
  dobCountry: string;
  dodCity: string;
  dodState: string;
  dodCountry: string;
  gender: string;
  religion: string;
  ftmTotalReceived: number | null;
  ftmEid: string | null;
  hasPhoto: boolean;
  isAliasOfId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface RulingTendency {
  id: number;
  judgeId: number;
  category: string;
  percentage: number;
  plaintiffLeans: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecentCase {
  id: number;
  judgeId: number;
  title: string;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  userType: "attorney" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface AttorneyProfile {
  id: number;
  userId: number;
  firmName?: string;
  practiceAreas: string[];
  barNumber?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttorneySubscription {
  id: number;
  userId: number;
  judgeId: number;
  tier: "federal" | "state" | "local";
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: "active" | "canceled" | "past_due" | "unpaid";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

// Database schema creation SQL
export const createTablesSQL = `
-- Judges table
CREATE TABLE IF NOT EXISTS judges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  circuit VARCHAR(255) NOT NULL,
  tier VARCHAR(20) CHECK (tier IN ('federal', 'state', 'local')) NOT NULL,
  appointed_by VARCHAR(255),
  years_of_service INTEGER,
  alma_mater VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ruling tendencies table
CREATE TABLE IF NOT EXISTS ruling_tendencies (
  id SERIAL PRIMARY KEY,
  judge_id INTEGER REFERENCES judges(id) ON DELETE CASCADE,
  category VARCHAR(255) NOT NULL,
  percentage INTEGER CHECK (percentage >= 0 AND percentage <= 100),
  plaintiff_leans BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recent cases table
CREATE TABLE IF NOT EXISTS recent_cases (
  id SERIAL PRIMARY KEY,
  judge_id INTEGER REFERENCES judges(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  case_date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) CHECK (user_type IN ('attorney', 'admin')) DEFAULT 'attorney',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attorney profiles table
CREATE TABLE IF NOT EXISTS attorney_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  firm_name VARCHAR(255),
  practice_areas TEXT[], -- PostgreSQL array type
  bar_number VARCHAR(100),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attorney subscriptions table
CREATE TABLE IF NOT EXISTS attorney_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  judge_id INTEGER REFERENCES judges(id) ON DELETE CASCADE,
  tier VARCHAR(20) CHECK (tier IN ('federal', 'state', 'local')) NOT NULL,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')) DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, judge_id) -- One subscription per attorney per judge
);

-- CourtListener judges table for search functionality
CREATE TABLE IF NOT EXISTS courtlistener_judges (
  id INTEGER PRIMARY KEY,
  date_created TIMESTAMP,
  date_modified TIMESTAMP,
  date_completed TIMESTAMP,
  fjc_id INTEGER,
  slug VARCHAR(255),
  name_first VARCHAR(255),
  name_middle VARCHAR(255),
  name_last VARCHAR(255),
  name_suffix VARCHAR(255),
  date_dob DATE,
  date_granularity_dob VARCHAR(50),
  date_dod DATE,
  date_granularity_dod VARCHAR(50),
  dob_city VARCHAR(255),
  dob_state VARCHAR(255),
  dob_country VARCHAR(255),
  dod_city VARCHAR(255),
  dod_state VARCHAR(255),
  dod_country VARCHAR(255),
  gender VARCHAR(10),
  religion VARCHAR(255),
  ftm_total_received DECIMAL(15,2),
  ftm_eid VARCHAR(255),
  has_photo BOOLEAN DEFAULT false,
  is_alias_of_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_judges_name ON judges(name);
CREATE INDEX IF NOT EXISTS idx_judges_tier ON judges(tier);
CREATE INDEX IF NOT EXISTS idx_ruling_tendencies_judge_id ON ruling_tendencies(judge_id);
CREATE INDEX IF NOT EXISTS idx_recent_cases_judge_id ON recent_cases(judge_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_attorney_profiles_user_id ON attorney_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_attorney_subscriptions_user_id ON attorney_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_attorney_subscriptions_judge_id ON attorney_subscriptions(judge_id);
CREATE INDEX IF NOT EXISTS idx_attorney_subscriptions_stripe_id ON attorney_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_attorney_subscriptions_status ON attorney_subscriptions(status);

-- CourtListener judges indexes for search performance
CREATE INDEX IF NOT EXISTS idx_courtlistener_judges_name_first ON courtlistener_judges(name_first);
CREATE INDEX IF NOT EXISTS idx_courtlistener_judges_name_last ON courtlistener_judges(name_last);
CREATE INDEX IF NOT EXISTS idx_courtlistener_judges_name_full ON courtlistener_judges(name_first, name_last);
CREATE INDEX IF NOT EXISTS idx_courtlistener_judges_slug ON courtlistener_judges(slug);
CREATE INDEX IF NOT EXISTS idx_courtlistener_judges_fjc_id ON courtlistener_judges(fjc_id);
`;

// Sample data for testing
export const sampleDataSQL = `
-- Insert sample judge
INSERT INTO judges (name, circuit, tier, appointed_by, years_of_service, alma_mater)
VALUES 
  ('Hon. Marcus Thorne', 'Northern Circuit', 'state', 'President Thompson', 8, 'Harvard Law School'),
  ('Hon. Evelyn Reed', 'Federal District Court', 'federal', 'President Williams', 12, 'Yale Law School'),
  ('Hon. James Cooper', 'City Municipal Court', 'local', 'Mayor Johnson', 5, 'Stanford Law School')
ON CONFLICT DO NOTHING;

-- Insert ruling tendencies for the first judge
INSERT INTO ruling_tendencies (judge_id, category, percentage, plaintiff_leans)
SELECT 
  j.id,
  unnest(ARRAY['Civil Procedure', 'Criminal Sentencing', 'Evidence Admissibility', 'Contract Disputes']),
  unnest(ARRAY[60, 80, 50, 70]),
  unnest(ARRAY[true, true, true, true])
FROM judges j WHERE j.name = 'Hon. Marcus Thorne'
ON CONFLICT DO NOTHING;

-- Insert recent cases for the first judge
INSERT INTO recent_cases (judge_id, title, case_date, description)
SELECT 
  j.id,
  unnest(ARRAY['Global Shipping v. Harbor Imports', 'US v. Chen', 'Startup X v. Conglomerate Y']),
  unnest(ARRAY['2023-11-05', '2023-10-18', '2023-10-02']::date[]),
  unnest(ARRAY[
    'Granted summary judgment for the defendant in a breach of contract case.',
    'Sentenced defendant to the lower end of the guideline range.',
    'Denied motion to dismiss trade secret misappropriation claim.'
  ])
FROM judges j WHERE j.name = 'Hon. Marcus Thorne'
ON CONFLICT DO NOTHING;
`;
