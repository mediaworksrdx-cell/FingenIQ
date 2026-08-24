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
    galleryImagesJson TEXT,
    updatedAt         TEXT,
    updatedByAdminId  TEXT
  );
`);

try {
  db.exec(`ALTER TABLE lesson_overrides ADD COLUMN galleryImagesJson TEXT;`);
} catch {
  // Column already exists
}
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

// ── CHATBOT 30 Q&A KNOWLEDGE BASE ──────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS chatbot_qa (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    question     TEXT NOT NULL,
    answer       TEXT NOT NULL,
    category     TEXT DEFAULT 'General',
    tags         TEXT DEFAULT '[]',
    displayOrder INTEGER DEFAULT 0,
    updatedAt    TEXT NOT NULL
  );
`);

export const DEFAULT_30_QAS = [
  {
    id: 1,
    category: 'FinGenIQ Platform',
    question: 'What is FinGenIQ?',
    answer: '**FinGenIQ** is an institution-grade financial education platform designed to empower financial intelligence. It features 44 structured lessons across 8 core modules, 3 credential tiers, interactive financial simulators, and an institutional research community.',
    tags: '["about", "fingeniq", "overview", "platform", "what is"]',
    displayOrder: 1,
  },
  {
    id: 2,
    category: 'Curriculum',
    question: 'What are the 8 curriculum modules in FinGenIQ?',
    answer: 'The FinGenIQ curriculum spans **8 core modules**:\n\n1. **Financial Literacy Foundations**\n2. **Personal Finance Mastery**\n3. **Banking & Credit Systems**\n4. **Investment Fundamentals**\n5. **Capital Markets & Securities**\n6. **Business & Corporate Finance**\n7. **Risk Management & Insurance**\n8. **Wealth Management & Planning**',
    tags: '["modules", "curriculum", "lessons", "syllabus", "topics"]',
    displayOrder: 2,
  },
  {
    id: 3,
    category: 'Certifications',
    question: 'How does FinGenIQ certification and grading work?',
    answer: 'FinGenIQ credentials feature cryptographic **SHA-256 tamper-proof verification** across 3 tiers:\n\n• 🏆 **Distinction** (90%+ weighted score)\n• 🎓 **Proficiency** (75%–89% weighted score)\n• 📜 **Completion** (60%–74% weighted score)\n\nGrading is weighted: 20% Module Assessments + 30% Quizzes + 50% Capstone Valuation Project.',
    tags: '["certification", "certificate", "grades", "tiers", "distinction", "proficiency"]',
    displayOrder: 3,
  },
  {
    id: 4,
    category: 'Capstone',
    question: 'What is the Capstone Project?',
    answer: 'The **Capstone Project** is the final evaluation project. Students choose between:\n\n• **Track A (Equity Valuation)**: Comprehensive 3-statement modeling, DCF valuation, WACC computation, and sensitivity analysis of a publicly listed firm.\n• **Track B (Wealth & Portfolio Strategy)**: Multi-asset strategic allocation, tax optimization, and portfolio risk hedging framework.',
    tags: '["capstone", "project", "valuation", "final", "thesis"]',
    displayOrder: 4,
  },
  {
    id: 5,
    category: 'Valuation & DCF',
    question: 'What is Discounted Cash Flow (DCF)?',
    answer: '**Discounted Cash Flow (DCF)** estimates the intrinsic value of a company based on projected future cash flows discounted to present value using WACC:\n\n$$\\text{Enterprise Value} = \\sum_{t=1}^{n} \\frac{\\text{FCFF}_t}{(1 + \\text{WACC})^t} + \\frac{\\text{Terminal Value}}{(1 + \\text{WACC})^n}$$',
    tags: '["dcf", "valuation", "wacc", "cash flow", "intrinsic value"]',
    displayOrder: 5,
  },
  {
    id: 6,
    category: 'Investing',
    question: 'How does a Systematic Investment Plan (SIP) work?',
    answer: '**SIP (Systematic Investment Plan)** allows regular disciplined investments in mutual funds or equity baskets. It provides **Rupee Cost Averaging** (buying more units when prices dip, fewer when high) and harnesses the **Power of Compounding**: $A = P(1 + r/n)^{nt}$.',
    tags: '["sip", "compounding", "mutual fund", "investing", "regular"]',
    displayOrder: 6,
  },
  {
    id: 7,
    category: 'Corporate Finance',
    question: 'What is WACC and how is it calculated?',
    answer: '**WACC (Weighted Average Cost of Capital)** represents a company\'s blended cost of capital across equity and debt:\n\n$$\\text{WACC} = \\left(\\frac{E}{V} \\times K_e\\right) + \\left(\\frac{D}{V} \\times K_d \\times (1 - t)\\right)$$\n\nWhere $E$ is Equity, $D$ is Debt, $V = E + D$, $K_e$ is Cost of Equity (CAPM), $K_d$ is Cost of Debt, and $t$ is the Corporate Tax Rate.',
    tags: '["wacc", "cost of capital", "debt", "equity", "capm"]',
    displayOrder: 7,
  },
  {
    id: 8,
    category: 'Valuation & Multiples',
    question: 'What is the Price-to-Earnings (P/E) Ratio?',
    answer: 'The **P/E Ratio** measures market valuation relative to earnings:\n\n$$\\text{P/E Ratio} = \\frac{\\text{Market Price per Share}}{\\text{Earnings Per Share (EPS)}}$$\n\nIt indicates how much investors are willing to pay for every ₹1 of company earnings. Compare against industry peers and historical medians.',
    tags: '["pe", "p/e", "multiple", "ratio", "valuation", "earnings"]',
    displayOrder: 8,
  },
  {
    id: 9,
    category: 'Personal Finance',
    question: 'What is the 50-30-20 Budgeting Rule?',
    answer: 'The **50-30-20 Rule** divides monthly post-tax income into:\n\n• **50% Needs**: Essential living expenses (Rent, groceries, utilities, EMIs)\n• **30% Wants**: Discretionary lifestyle choices (Dining, travel, leisure)\n• **20% Savings & Investments**: Wealth building (SIP, emergency fund, retirement accounts)',
    tags: '["50 30 20", "budgeting", "personal finance", "savings", "income"]',
    displayOrder: 9,
  },
  {
    id: 10,
    category: 'Personal Finance',
    question: 'How much should I keep in an Emergency Fund?',
    answer: 'An **Emergency Fund** should cover **3 to 6 months** of essential living expenses. Keep it in highly liquid, low-volatility instruments like High-Yield Savings Accounts, Sweep-in Fixed Deposits, or Overnight/Liquid Mutual Funds.',
    tags: '["emergency fund", "liquid", "savings", "contingency", "months"]',
    displayOrder: 10,
  },
  {
    id: 11,
    category: 'Corporate Finance',
    question: 'What is Return on Invested Capital (ROIC)?',
    answer: '**ROIC** measures how efficiently a company generates operating profits from its total capital:\n\n$$\\text{ROIC} = \\frac{\\text{NOPAT}}{\\text{Invested Capital}}$$\n\nA company generates true economic value and a competitive moat when its $\\text{ROIC} > \\text{WACC}$.',
    tags: '["roic", "return on capital", "nopat", "moat", "efficiency"]',
    displayOrder: 11,
  },
  {
    id: 12,
    category: 'Platform Access',
    question: 'What is the difference between Community and LMS Platform login?',
    answer: 'FinGenIQ provides two distinct portals:\n\n1. **Community Portal** (`/community/login`): Open self-service access for articles, case studies, research commentary, and peer discussions.\n2. **LMS Platform** (`/login`): Enterprise portal for 44 structured lessons, interactive grading, and certification credentials.',
    tags: '["community", "login", "lms", "portal", "account", "difference"]',
    displayOrder: 12,
  },
  {
    id: 13,
    category: 'Valuation & DCF',
    question: 'What is the difference between Enterprise Value (EV) and Market Capitalization?',
    answer: '• **Market Capitalization** = Share Price × Total Outstanding Shares (Equity value only).\n• **Enterprise Value (EV)** = Market Cap + Total Debt + Preferred Stock + Minority Interest - Total Cash. It reflects the total takeover cost of the entire business.',
    tags: '["ev", "enterprise value", "market cap", "debt", "cash"]',
    displayOrder: 13,
  },
  {
    id: 14,
    category: 'Investing',
    question: 'What is CAGR (Compound Annual Growth Rate)?',
    answer: '**CAGR** measures the smoothed annual growth rate of an investment over a multi-year horizon:\n\n$$\\text{CAGR} = \\left(\\frac{\\text{Ending Value}}{\\text{Beginning Value}}\\right)^{\\frac{1}{n}} - 1$$',
    tags: '["cagr", "growth rate", "compound", "annual", "returns"]',
    displayOrder: 14,
  },
  {
    id: 15,
    category: 'Portfolio Strategy',
    question: 'What is Asset Allocation and why is it crucial?',
    answer: '**Asset Allocation** is dividing an investment portfolio across diverse asset classes (Equities, Fixed Income/Debt, Gold, Real Estate, Cash). Academic studies show that over 90% of long-term portfolio return variability is determined by asset allocation rather than individual stock picking.',
    tags: '["asset allocation", "portfolio", "diversification", "equity", "debt", "gold"]',
    displayOrder: 15,
  },
  {
    id: 16,
    category: 'Capital Markets',
    question: 'What is Beta in financial markets?',
    answer: '**Beta ($\\beta$)** measures the systematic volatility or market risk of a stock relative to the overall benchmark index:\n\n• $\\beta = 1.0$: Moves in lockstep with the market.\n• $\\beta > 1.0$: High sensitivity and higher volatility than the index.\n• $\\beta < 1.0$: Lower volatility/defensive characteristic.',
    tags: '["beta", "volatility", "risk", "market", "stocks"]',
    displayOrder: 16,
  },
  {
    id: 17,
    category: 'Corporate Finance',
    question: 'What is the difference between FCFF and FCFE?',
    answer: '• **FCFF (Free Cash Flow to Firm)**: Cash flow available to all capital providers (equity + debt) after operating expenses, taxes, working capital, and CapEx. Discounted at WACC.\n• **FCFE (Free Cash Flow to Equity)**: Cash flow available to common equity shareholders after debt servicing. Discounted at Cost of Equity ($K_e$).',
    tags: '["fcff", "fcfe", "free cash flow", "equity", "firm"]',
    displayOrder: 17,
  },
  {
    id: 18,
    category: 'Portfolio Strategy',
    question: 'What is the Sharpe Ratio?',
    answer: 'The **Sharpe Ratio** calculates risk-adjusted excess returns per unit of total volatility:\n\n$$\\text{Sharpe Ratio} = \\frac{R_p - R_f}{\\sigma_p}$$\n\nWhere $R_p$ is Portfolio Return, $R_f$ is Risk-Free Rate, and $\\sigma_p$ is Portfolio Standard Deviation. Higher is superior.',
    tags: '["sharpe ratio", "risk adjusted", "volatility", "returns"]',
    displayOrder: 18,
  },
  {
    id: 19,
    category: 'Platform Access',
    question: 'How do I reset my password or activate my account?',
    answer: 'If you forgot your password, visit `/reset-password/request` and enter your registered email. If you received an activation link from your administrator, click the activation URL provided in your onboarding email to set your initial password.',
    tags: '["password", "reset", "forgot password", "activate", "login help"]',
    displayOrder: 19,
  },
  {
    id: 20,
    category: 'Careers & Marketplace',
    question: 'What is the FinGenIQ Talent Marketplace?',
    answer: 'The **Talent Marketplace** (`/marketplace`) connects certified candidates who achieve **Proficiency** or **Distinction** with verified financial institutions, equity research houses, and investment managers seeking quantitative talent.',
    tags: '["talent", "marketplace", "jobs", "hiring", "careers", "employers"]',
    displayOrder: 20,
  },
  {
    id: 21,
    category: 'Behavioral Finance',
    question: 'What is Loss Aversion in investing?',
    answer: '**Loss Aversion** is a cognitive bias identified in Prospect Theory showing that the psychological pain of losing ₹10,000 is twice as intense as the joy of gaining ₹10,000. This often causes investors to hold losing assets too long and sell winners prematurely.',
    tags: '["loss aversion", "behavioral finance", "psychology", "bias", "prospect theory"]',
    displayOrder: 21,
  },
  {
    id: 22,
    category: 'Corporate Finance',
    question: 'What is a Leveraged Buyout (LBO)?',
    answer: 'A **Leveraged Buyout (LBO)** is the acquisition of a company using a significant amount of borrowed debt (typically 60%–80% of purchase price). The acquired firm\'s cash flows are used to service debt and generate high equity returns (IRR) for the private equity sponsor.',
    tags: '["lbo", "leveraged buyout", "private equity", "debt", "irr"]',
    displayOrder: 22,
  },
  {
    id: 23,
    category: 'Accounting & Analysis',
    question: 'What are the 3 core financial statements and how do they link?',
    answer: '1. **Income Statement**: Shows profitability (Revenue, Expenses, Net Income) over a period.\n2. **Balance Sheet**: Snapshot of Assets = Liabilities + Shareholders\' Equity at a point in time.\n3. **Cash Flow Statement**: Tracks cash inflows/outflows from Operating, Investing, and Financing activities.\n\n*Linkage*: Net Income flows into Retained Earnings on the Balance Sheet and starts the Cash Flow Statement from Operations.',
    tags: '["financial statements", "income statement", "balance sheet", "cash flow", "accounting"]',
    displayOrder: 23,
  },
  {
    id: 24,
    category: 'Corporate Finance',
    question: 'What is Working Capital and why is it important?',
    answer: '**Working Capital** measures short-term operating liquidity:\n\n$$\\text{Working Capital} = \\text{Current Assets} - \\text{Current Liabilities}$$\n\nPositive working capital ensures a company can meet day-to-day short-term operational liabilities without distress.',
    tags: '["working capital", "liquidity", "current assets", "current liabilities"]',
    displayOrder: 24,
  },
  {
    id: 25,
    category: 'Investing',
    question: 'What is Rupee Cost Averaging?',
    answer: '**Rupee Cost Averaging** is an investment strategy where you invest a fixed amount regularly regardless of market movements. When prices drop, your fixed amount buys more units; when prices rise, you buy fewer units, reducing your average cost per unit over time.',
    tags: '["rupee cost averaging", "sip", "dollar cost", "average cost"]',
    displayOrder: 25,
  },
  {
    id: 26,
    category: 'Corporate Finance',
    question: 'What is Debt-to-Equity (D/E) Ratio?',
    answer: '**Debt-to-Equity Ratio** evaluates financial leverage:\n\n$$\\text{Debt-to-Equity} = \\frac{\\text{Total Debt}}{\\text{Total Shareholders\' Equity}}$$\n\nA higher ratio indicates aggressive debt financing, which magnifies earnings in boom periods but increases bankruptcy risk during downturns.',
    tags: '["debt to equity", "leverage", "solvency", "ratio", "capital structure"]',
    displayOrder: 26,
  },
  {
    id: 27,
    category: 'Certifications',
    question: 'How are module assessments and final scores graded?',
    answer: 'FinGenIQ calculates final grade percentages through automated evaluation:\n• **20%**: End-of-Module Comprehensive Assessments\n• **30%**: Lesson Knowledge Checks & Practice Quizzes\n• **50%**: Module 8 Capstone Financial Valuation Model',
    tags: '["grading", "scores", "assessment", "weightage", "exams"]',
    displayOrder: 27,
  },
  {
    id: 28,
    category: 'Certifications',
    question: 'How can employers verify student certificates?',
    answer: 'Employers can verify any student credential at `/certification-roadmap` by entering the unique **Certificate Verification Hash**. The system validates the authenticity against the tamper-proof SHA-256 ledger.',
    tags: '["verify", "verification", "employer verification", "credential hash"]',
    displayOrder: 28,
  },
  {
    id: 29,
    category: 'Personal Finance',
    question: 'How does inflation erode wealth over time?',
    answer: '**Inflation** is the rate at which general price levels rise, reducing real purchasing power. The **Rule of 72** estimates how quickly prices double: $\\text{Years to Double} \\approx 72 / \\text{Inflation Rate}$. To preserve purchasing power, investments must generate real returns ($R_{\\text{nominal}} - \\text{Inflation}$).',
    tags: '["inflation", "purchasing power", "rule of 72", "real return"]',
    displayOrder: 29,
  },
  {
    id: 30,
    category: 'Support & Contact',
    question: 'How can I contact FinGenIQ for support or institutional licensing?',
    answer: 'For institutional licensing, enterprise batches, or learner support:\n\n• **Email**: `admin@fingeniq.com`\n• **Contact Page**: `/contact`\n• **Office Address**: FinGenIQ Academic & Research Center.',
    tags: '["contact", "support", "help", "email", "admin email", "license"]',
    displayOrder: 30,
  },
];

// Seed 30 Q&As if empty
const countQAs = (db.prepare('SELECT count(*) as cnt FROM chatbot_qa').get() as any)?.cnt || 0;
if (countQAs === 0) {
  const insertQA = db.prepare(`
    INSERT INTO chatbot_qa (id, question, answer, category, tags, displayOrder, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of DEFAULT_30_QAS) {
    insertQA.run(item.id, item.question, item.answer, item.category, item.tags, item.displayOrder, now);
  }
  console.log('[Seed] Inserted 30 default Chatbot Q&As');
}

export function getAllChatbotQAs() {
  return db.prepare('SELECT * FROM chatbot_qa ORDER BY displayOrder ASC, id ASC').all();
}

export function saveChatbotQA(data: { id?: number; question: string; answer: string; category?: string; tags?: string; displayOrder?: number }) {
  const now = new Date().toISOString();
  if (data.id) {
    db.prepare(`
      UPDATE chatbot_qa SET
        question = ?, answer = ?, category = ?, tags = ?, displayOrder = ?, updatedAt = ?
      WHERE id = ?
    `).run(data.question.trim(), data.answer.trim(), data.category || 'General', data.tags || '[]', data.displayOrder || 0, now, data.id);
    return data.id;
  } else {
    const res = db.prepare(`
      INSERT INTO chatbot_qa (question, answer, category, tags, displayOrder, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(data.question.trim(), data.answer.trim(), data.category || 'General', data.tags || '[]', data.displayOrder || 0, now);
    return res.lastInsertRowid;
  }
}

export function deleteChatbotQA(id: number) {
  return db.prepare('DELETE FROM chatbot_qa WHERE id = ?').run(id);
}

export function resetChatbotQAsToDefaults() {
  const now = new Date().toISOString();
  db.prepare('DELETE FROM chatbot_qa').run();
  const insertQA = db.prepare(`
    INSERT INTO chatbot_qa (id, question, answer, category, tags, displayOrder, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of DEFAULT_30_QAS) {
    insertQA.run(item.id, item.question, item.answer, item.category, item.tags, item.displayOrder, now);
  }
}

