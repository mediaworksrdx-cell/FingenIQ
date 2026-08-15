-- Database schema for FingenIQ Admin-Provisioned Auth & Renewal System

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK(role IN ('learner', 'employer', 'admin')) NOT NULL,
  passwordHash TEXT,
  mustResetPassword INTEGER DEFAULT 1,
  createdByAdminId TEXT,
  activationToken TEXT,
  activationTokenExpiresAt TEXT,
  resetToken TEXT,
  resetTokenExpiresAt TEXT,
  accountStatus TEXT CHECK(accountStatus IN ('pending_activation', 'active', 'locked', 'disabled', 'expired')) NOT NULL,
  failedLoginAttempts INTEGER DEFAULT 0,
  validityPeriod TEXT CHECK(validityPeriod IN ('monthly', 'quarterly', 'half_yearly', 'annual')),
  credentialIssuedAt TEXT,
  credentialActivatedAt TEXT,
  credentialExpiresAt TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, -- Cryptographically secure random opaque token
  userId TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  adminId TEXT NOT NULL,
  targetUserId TEXT,
  timestamp TEXT NOT NULL,
  metadata TEXT -- JSON string storing pre/post state changes
);

CREATE TABLE IF NOT EXISTS ip_rate_limits (
  ip TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 0,
  lastAttemptAt TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS user_certifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  trackId TEXT NOT NULL,
  issuedAt TEXT NOT NULL,
  certificateHash TEXT UNIQUE NOT NULL,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);
