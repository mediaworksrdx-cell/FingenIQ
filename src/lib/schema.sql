-- Database schema for FingenIQ Multi-Tenant Auth, Package & Renewal System
-- Supports B2C, B2B, B2B2C login categories

-- ── BUSINESS ENTITIES (for B2B and B2B2C) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS business_entities (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  type            TEXT CHECK(type IN ('b2b', 'b2b2c')) NOT NULL,
  contactEmail    TEXT,
  contactPhone    TEXT,
  address         TEXT,
  maxUsers        INTEGER DEFAULT 50,
  isActive        INTEGER DEFAULT 1,
  createdAt       TEXT NOT NULL,
  createdByAdminId TEXT
);

-- ── PACKAGES (defines module access + duration) ──────────────────────────────
CREATE TABLE IF NOT EXISTS packages (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT,
  loginCategory   TEXT CHECK(loginCategory IN ('b2c', 'b2b', 'b2b2c')) NOT NULL,
  allowedModules  TEXT NOT NULL DEFAULT '["ALL"]',  -- JSON array: ["M1","M2"] or ["ALL"]
  durationDays    INTEGER NOT NULL DEFAULT 365,
  isActive        INTEGER DEFAULT 1,
  createdAt       TEXT NOT NULL
);

-- ── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                        TEXT PRIMARY KEY,
  name                      TEXT NOT NULL,
  email                     TEXT UNIQUE NOT NULL,
  role                      TEXT CHECK(role IN ('learner', 'employer', 'admin', 'employee', 'teacher', 'community_member')) NOT NULL,
  passwordHash              TEXT,
  mustResetPassword         INTEGER DEFAULT 1,
  createdByAdminId          TEXT,
  activationToken           TEXT,
  activationTokenExpiresAt  TEXT,
  resetToken                TEXT,
  resetTokenExpiresAt       TEXT,
  accountStatus             TEXT CHECK(accountStatus IN ('pending_activation', 'active', 'locked', 'disabled', 'expired')) NOT NULL,
  failedLoginAttempts       INTEGER DEFAULT 0,
  validityPeriod            TEXT CHECK(validityPeriod IN ('monthly', 'quarterly', 'half_yearly', 'annual')),
  credentialIssuedAt        TEXT,
  credentialActivatedAt     TEXT,
  credentialExpiresAt       TEXT,
  -- Multi-tenant fields
  loginCategory             TEXT CHECK(loginCategory IN ('b2c', 'b2b', 'b2b2c', 'community')) DEFAULT 'b2c',
  businessEntityId          TEXT REFERENCES business_entities(id),
  packageId                 TEXT REFERENCES packages(id),
  loginTimestamp            TEXT  -- Last login date & time from system
);

-- ── SESSIONS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

-- ── RENEWAL HISTORY ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS renewal_history (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  renewedAt TEXT NOT NULL,
  renewedByAdminId TEXT NOT NULL,
  previousExpiresAt TEXT,
  newExpiresAt TEXT NOT NULL,
  period TEXT NOT NULL,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

-- ── AUDIT LOGS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  adminId TEXT NOT NULL,
  targetUserId TEXT,
  timestamp TEXT NOT NULL,
  metadata TEXT -- JSON string storing pre/post state changes
);

-- ── IP RATE LIMITING ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ip_rate_limits (
  ip TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 0,
  lastAttemptAt TEXT NOT NULL
);

-- ── USER PROGRESS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_progress (
  userId TEXT NOT NULL,
  lessonId TEXT NOT NULL,
  status TEXT CHECK(status IN ('not-started', 'in-progress', 'completed')) NOT NULL DEFAULT 'not-started',
  currentStep INTEGER DEFAULT 0,
  score INTEGER,
  updatedAt TEXT NOT NULL,
  PRIMARY KEY (userId, lessonId),
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

-- ── USER CERTIFICATIONS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_certifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  trackId TEXT NOT NULL,
  issuedAt TEXT NOT NULL,
  certificateHash TEXT UNIQUE NOT NULL,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

-- ── COMMUNITY ARTICLES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_articles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  summary     TEXT NOT NULL,
  body        TEXT NOT NULL,
  author_id   TEXT NOT NULL REFERENCES users(id),
  author_name TEXT NOT NULL,
  author_bio  TEXT DEFAULT '',
  company     TEXT DEFAULT '',
  sector      TEXT DEFAULT '',
  concept     TEXT DEFAULT '',
  rating      TEXT DEFAULT '',
  score       REAL DEFAULT 0,
  read_time   INTEGER DEFAULT 5,
  claps       INTEGER DEFAULT 0,
  linked_companies TEXT DEFAULT '[]',
  published   INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- ── COMMUNITY COMMENTS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_comments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id  INTEGER NOT NULL REFERENCES community_articles(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id),
  user_name   TEXT NOT NULL,
  body        TEXT NOT NULL,
  likes       INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- ── AARKAA AI CONTROLLED RAG KNOWLEDGE DOCS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_knowledge_docs (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  category         TEXT NOT NULL,  -- e.g. 'Valuation Standards', 'Accounting Rules', 'Institutional Research', 'Curriculum Policy'
  content          TEXT NOT NULL,
  version          INTEGER DEFAULT 1,
  isActive         INTEGER DEFAULT 1,
  createdAt        TEXT NOT NULL,
  updatedAt        TEXT NOT NULL,
  createdByAdminId TEXT NOT NULL
);

-- ── AARKAA AI SYSTEM SETTINGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_settings (
  id               TEXT PRIMARY KEY,
  settingKey       TEXT UNIQUE NOT NULL,
  settingValue     TEXT NOT NULL,
  updatedAt        TEXT NOT NULL,
  updatedByAdminId TEXT
);

-- ── CONTACT & ENQUIRIES TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enquiries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  category    TEXT NOT NULL,
  inquiryType TEXT,
  subject     TEXT,
  message     TEXT NOT NULL,
  recipient   TEXT DEFAULT 'shivaram@vivinfacilitators.com',
  status      TEXT DEFAULT 'new',
  createdAt   TEXT DEFAULT (datetime('now'))
);


