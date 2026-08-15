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

// Bootstrap initial admin if configure in environment
const initialEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@fingeniq.com';
const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123456';

const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get(initialEmail);

if (!adminExists) {
  const hash = bcrypt.hashSync(initialPassword, 12);
  db.prepare(`
    INSERT INTO users (
      id, name, email, role, passwordHash, mustResetPassword, 
      accountStatus, failedLoginAttempts, validityPeriod, credentialIssuedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'U_ADMIN_SEED',
    'Root Administrator',
    initialEmail,
    'admin',
    hash,
    0, // does not need to reset
    'active',
    0,
    'annual',
    new Date().toISOString()
  );
  console.log(`[Database Bootstrap] Admin account seeded: ${initialEmail}`);
}

// Bootstrap default learner account
const learnerEmail = process.env.INITIAL_LEARNER_EMAIL || 'learner@fingeniq.com';
const learnerPassword = process.env.INITIAL_LEARNER_PASSWORD || 'Learner@123456';
const learnerExists = db.prepare('SELECT id FROM users WHERE email = ?').get(learnerEmail);

if (!learnerExists) {
  const hash = bcrypt.hashSync(learnerPassword, 12);
  db.prepare(`
    INSERT INTO users (
      id, name, email, role, passwordHash, mustResetPassword, 
      accountStatus, failedLoginAttempts, validityPeriod, credentialIssuedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'U_LEARNER_SEED',
    'User',
    learnerEmail,
    'learner',
    hash,
    0, // does not need to reset
    'active',
    0,
    'annual',
    new Date().toISOString()
  );
  console.log(`[Database Bootstrap] Learner account seeded: ${learnerEmail}`);
}
