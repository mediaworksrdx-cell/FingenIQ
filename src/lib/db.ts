import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = process.env.DATABASE_PATH 
  ? path.resolve(process.env.DATABASE_PATH)
  : path.resolve(process.cwd(), 'src/lib/db.sqlite');
const schemaPath = path.resolve(process.cwd(), 'src/lib/schema.sql');

// Ensure directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new Database(dbPath);

// Initialize DB schema
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

// ── MIGRATION: Ensure users table supports community_member role and community loginCategory ──
const usersTableSql = (db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get() as { sql: string } | undefined)?.sql || '';
if (usersTableSql && !usersTableSql.includes("'community_member'")) {
  db.exec(`
    PRAGMA foreign_keys=off;
    BEGIN TRANSACTION;
    CREATE TABLE users_temp (
      id                        TEXT PRIMARY KEY,
      name                      TEXT NOT NULL,
      email                     TEXT UNIQUE NOT NULL,
      role                      TEXT CHECK(role IN ('learner', 'employer', 'admin', 'employee', 'community_member')) NOT NULL,
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
      loginCategory             TEXT CHECK(loginCategory IN ('b2c', 'b2b', 'b2b2c', 'community')) DEFAULT 'b2c',
      businessEntityId          TEXT REFERENCES business_entities(id),
      packageId                 TEXT REFERENCES packages(id),
      loginTimestamp            TEXT
    );
    INSERT INTO users_temp (id, name, email, role, passwordHash, mustResetPassword, createdByAdminId, activationToken, activationTokenExpiresAt, resetToken, resetTokenExpiresAt, accountStatus, failedLoginAttempts, validityPeriod, credentialIssuedAt, credentialActivatedAt, credentialExpiresAt, loginCategory, businessEntityId, packageId, loginTimestamp)
    SELECT id, name, email, role, passwordHash, mustResetPassword, createdByAdminId, activationToken, activationTokenExpiresAt, resetToken, resetTokenExpiresAt, accountStatus, failedLoginAttempts, validityPeriod, credentialIssuedAt, credentialActivatedAt, credentialExpiresAt, loginCategory, businessEntityId, packageId, loginTimestamp FROM users;
    DROP TABLE users;
    ALTER TABLE users_temp RENAME TO users;
    COMMIT;
    PRAGMA foreign_keys=on;
  `);
  console.log('[Migration] Upgraded users table with community_member role and community category');
}

// ── CREATE LESSON OVERRIDES TABLE (Super-Admin Dynamic Editing) ───────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS lesson_overrides (
    lessonId          TEXT PRIMARY KEY,
    title             TEXT,
    subtitle          TEXT,
    duration          TEXT,
    level             TEXT,
    summary           TEXT,
    contentMarkdown   TEXT,
    keyTakeawaysJson  TEXT,
    youtubeId         TEXT,
    pdfPath           TEXT,
    simulatorJson     TEXT,
    quizJson          TEXT,
    updatedAt         TEXT,
    updatedByAdminId  TEXT
  );
`);
const now = new Date().toISOString();
const seedPackages = [
  { id: 'PKG_B2C_STARTER',     name: 'B2C Starter',         desc: 'Individual — Foundational modules (M1–M3)',                loginCategory: 'b2c',   modules: '["M1","M2","M3"]',                                     days: 90  },
  { id: 'PKG_B2C_PRO',         name: 'B2C Professional',    desc: 'Individual — Full curriculum access (M1–M8)',              loginCategory: 'b2c',   modules: '["ALL"]',                                              days: 365 },
  { id: 'PKG_B2B_ENTERPRISE',  name: 'B2B Enterprise',      desc: 'Enterprise — Full curriculum for all employees',          loginCategory: 'b2b',   modules: '["ALL"]',                                              days: 365 },
  { id: 'PKG_B2B_DEPARTMENT',  name: 'B2B Department',      desc: 'Enterprise — Core finance modules (M1–M3, M5)',           loginCategory: 'b2b',   modules: '["M1","M2","M3","M5"]',                                days: 180 },
  { id: 'PKG_B2B2C_FULL',      name: 'B2B2C Partner Full',  desc: 'Partner channel — Full curriculum for end-users',         loginCategory: 'b2b2c', modules: '["ALL"]',                                              days: 365 },
  { id: 'PKG_B2B2C_BASIC',     name: 'B2B2C Partner Basic', desc: 'Partner channel — Foundational + alternatives (M1–M4)',   loginCategory: 'b2b2c', modules: '["M1","M2","M3","M4"]',                                days: 180 },
];

const insertPkg = db.prepare(`
  INSERT OR IGNORE INTO packages (id, name, description, loginCategory, allowedModules, durationDays, isActive, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, 1, ?)
`);

for (const pkg of seedPackages) {
  insertPkg.run(pkg.id, pkg.name, pkg.desc, pkg.loginCategory, pkg.modules, pkg.days, now);
}

// ── SEED DEFAULT BUSINESS ENTITIES ─────────────────────────────────────────
const seedEntities = [
  { id: 'ENT_DEMO_B2B',   name: 'Demo Corporation',       type: 'b2b',   email: 'hr@democorp.com',      maxUsers: 100 },
  { id: 'ENT_DEMO_B2B2C', name: 'Demo University Partner', type: 'b2b2c', email: 'admin@demouniv.edu',   maxUsers: 500 },
];

const insertEnt = db.prepare(`
  INSERT OR IGNORE INTO business_entities (id, name, type, contactEmail, maxUsers, isActive, createdAt, createdByAdminId)
  VALUES (?, ?, ?, ?, ?, 1, ?, 'U_ADMIN_SEED')
`);

for (const ent of seedEntities) {
  insertEnt.run(ent.id, ent.name, ent.type, ent.email, ent.maxUsers, now);
}

// ── BOOTSTRAP ADMIN ────────────────────────────────────────────────────────
const initialEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@fingeniq.com';
const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123456';
const hashAdmin = bcrypt.hashSync(initialPassword, 12);

db.prepare(`
  INSERT OR IGNORE INTO users (
    id, name, email, role, passwordHash, mustResetPassword, 
    accountStatus, failedLoginAttempts, validityPeriod, credentialIssuedAt,
    loginCategory, packageId
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'U_ADMIN_SEED',
  'Root Administrator',
  initialEmail,
  'admin',
  hashAdmin,
  0,
  'active',
  0,
  'annual',
  new Date().toISOString(),
  'b2c',
  'PKG_B2C_PRO'
);

// ── BOOTSTRAP LEARNER ──────────────────────────────────────────────────────
const learnerEmail = process.env.INITIAL_LEARNER_EMAIL || 'learner@fingeniq.com';
const learnerPassword = process.env.INITIAL_LEARNER_PASSWORD || 'Learner@123456';
const hashLearner = bcrypt.hashSync(learnerPassword, 12);

db.prepare(`
  INSERT OR IGNORE INTO users (
    id, name, email, role, passwordHash, mustResetPassword, 
    accountStatus, failedLoginAttempts, validityPeriod, credentialIssuedAt,
    loginCategory, packageId
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'U_LEARNER_SEED',
  'User',
  learnerEmail,
  'learner',
  hashLearner,
  0,
  'active',
  0,
  'annual',
  new Date().toISOString(),
  'b2c',
  'PKG_B2C_PRO'
);

// ── COMMUNITY ARTICLE HELPERS ──────────────────────────────────────────────

export function getPublishedArticles() {
  return db.prepare(`
    SELECT * FROM community_articles WHERE published = 1 ORDER BY created_at DESC
  `).all();
}

export function getAllArticles() {
  return db.prepare(`
    SELECT * FROM community_articles ORDER BY created_at DESC
  `).all();
}

export function getArticleBySlug(slug: string) {
  return db.prepare('SELECT * FROM community_articles WHERE slug = ?').get(slug);
}

export function getArticleById(id: number) {
  return db.prepare('SELECT * FROM community_articles WHERE id = ?').get(id);
}

export function createArticle(data: {
  slug: string; title: string; summary: string; body: string;
  author_id: string; author_name: string; author_bio?: string;
  company?: string; sector?: string; concept?: string;
  rating?: string; score?: number; read_time?: number;
  linked_companies?: string; published?: number;
}) {
  const now = new Date().toISOString();
  return db.prepare(`
    INSERT INTO community_articles (
      slug, title, summary, body, author_id, author_name, author_bio,
      company, sector, concept, rating, score, read_time,
      linked_companies, published, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.slug, data.title, data.summary, data.body,
    data.author_id, data.author_name, data.author_bio || '',
    data.company || '', data.sector || '', data.concept || '',
    data.rating || '', data.score || 0, data.read_time || 5,
    data.linked_companies || '[]', data.published ?? 0, now, now
  );
}

export function updateArticle(id: number, data: {
  title?: string; summary?: string; body?: string;
  company?: string; sector?: string; concept?: string;
  rating?: string; score?: number; read_time?: number;
  linked_companies?: string; published?: number;
}) {
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: any[] = [];
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      fields.push(`${key} = ?`);
      values.push(val);
    }
  }
  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);
  return db.prepare(`UPDATE community_articles SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

export function deleteArticle(id: number) {
  return db.prepare('DELETE FROM community_articles WHERE id = ?').run(id);
}

// ── COMMUNITY COMMENT HELPERS ──────────────────────────────────────────────

export function getArticleComments(articleId: number) {
  return db.prepare(`
    SELECT * FROM community_comments WHERE article_id = ? ORDER BY created_at ASC
  `).all(articleId);
}

export function addComment(articleId: number, userId: string, userName: string, body: string) {
  return db.prepare(`
    INSERT INTO community_comments (article_id, user_id, user_name, body)
    VALUES (?, ?, ?, ?)
  `).run(articleId, userId, userName, body);
}

export function deleteComment(id: number) {
  return db.prepare('DELETE FROM community_comments WHERE id = ?').run(id);
}

// ── ROLE HELPERS ────────────────────────────────────────────────────────────

export function canPostArticle(role: string): boolean {
  return role === 'admin' || role === 'employee';
}

export function setUserRole(userId: string, role: string) {
  return db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
}

// ── SEED COMMUNITY ARTICLES ────────────────────────────────────────────────
import { seedCommunityArticles } from './seed_articles';
seedCommunityArticles();

// ── SEED AI KNOWLEDGE DOCS & SETTINGS ──────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS ai_knowledge_docs (
    id               TEXT PRIMARY KEY,
    title            TEXT NOT NULL,
    category         TEXT NOT NULL,
    content          TEXT NOT NULL,
    version          INTEGER DEFAULT 1,
    isActive         INTEGER DEFAULT 1,
    createdAt        TEXT NOT NULL,
    updatedAt        TEXT NOT NULL,
    createdByAdminId TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS ai_settings (
    id               TEXT PRIMARY KEY,
    settingKey       TEXT UNIQUE NOT NULL,
    settingValue     TEXT NOT NULL,
    updatedAt        TEXT NOT NULL,
    updatedByAdminId TEXT
  );
`);

const seedAiDocs = [
  {
    id: 'KNOW_VAL_01',
    title: 'Institutional DCF & Terminal Multiple Standards',
    category: 'Valuation Standards',
    content: 'In institutional financial valuation, Discounted Cash Flow (DCF) models should use Gordon Growth (perpetual growth 2.0%-3.0%) alongside Exit Multiple (EV/EBITDA 8.0x-14.0x) for cross-methodological sensitivity analysis. Risk-free rates must reflect current 10-year US Treasury benchmarks.',
  },
  {
    id: 'KNOW_CURR_01',
    title: 'FinGenIQ Distinction Certification Thresholds',
    category: 'Curriculum Policy',
    content: 'To achieve Certification with Distinction in the FinGenIQ Professional Track, students must complete all 8 modules with an aggregate assessment score >= 85% and successfully submit the Module 8 Capstone Financial Valuation.',
  }
];

const insertAiDoc = db.prepare(`
  INSERT OR IGNORE INTO ai_knowledge_docs (id, title, category, content, version, isActive, createdAt, updatedAt, createdByAdminId)
  VALUES (?, ?, ?, ?, 1, 1, ?, ?, 'U_ADMIN_SEED')
`);

for (const doc of seedAiDocs) {
  insertAiDoc.run(doc.id, doc.title, doc.category, doc.content, now, now);
}

const seedAiSettings = [
  { id: 'SET_PROMPT_MODE', key: 'system_prompt_mode', value: 'institutional' },
  { id: 'SET_MAX_TOKENS', key: 'max_response_tokens', value: '2048' },
  { id: 'SET_GUARDRAIL', key: 'strict_curriculum_guardrail', value: 'true' },
];

const insertAiSetting = db.prepare(`
  INSERT OR IGNORE INTO ai_settings (id, settingKey, settingValue, updatedAt, updatedByAdminId)
  VALUES (?, ?, ?, ?, 'U_ADMIN_SEED')
`);

for (const s of seedAiSettings) {
  insertAiSetting.run(s.id, s.key, s.value, now);
}

