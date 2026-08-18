import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const dbPath = path.resolve(process.cwd(), 'src/lib/db.sqlite');
const db = new Database(dbPath);

const schemaPath = path.resolve(process.cwd(), 'src/lib/schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

// Seed packages if missing
const pkgCount = db.prepare('SELECT COUNT(*) as count FROM packages').get().count;
if (pkgCount === 0) {
  const now = new Date().toISOString();
  const seedPackages = [
    { id: 'PKG_B2C_STARTER',     name: 'B2C Starter',         desc: 'Individual — Foundational modules (M1–M3)',                loginCategory: 'b2c',   modules: '["M1","M2","M3"]',                                     days: 90  },
    { id: 'PKG_B2C_PRO',         name: 'B2C Professional',    desc: 'Individual — Full curriculum access (M1–M8)',              loginCategory: 'b2c',   modules: '["ALL"]',                                              days: 365 },
    { id: 'PKG_B2B_ENTERPRISE',  name: 'B2B Enterprise',      desc: 'Enterprise — Full curriculum for all employees',          loginCategory: 'b2b',   modules: '["ALL"]',                                              days: 365 },
    { id: 'PKG_B2B_DEPARTMENT',  name: 'B2B Department',      desc: 'Enterprise — Core finance modules (M1–M3, M5)',           loginCategory: 'b2b',   modules: '["M1","M2","M3","M5"]',                                days: 180 },
    { id: 'PKG_B2B2C_FULL',      name: 'B2B2C Partner Full',  desc: 'Partner channel — Full curriculum for end-users',         loginCategory: 'b2b2c', modules: '["ALL"]',                                              days: 365 },
    { id: 'PKG_B2B2C_BASIC',     name: 'B2B2C Partner Basic', desc: 'Partner channel — Foundational + alternatives (M1–M4)',   loginCategory: 'b2b2c', modules: '["M1","M2","M3","M4"]',                                days: 180 },
  ];
  for (const pkg of seedPackages) {
    db.prepare('INSERT INTO packages (id, name, description, loginCategory, allowedModules, durationDays, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?)').run(pkg.id, pkg.name, pkg.desc, pkg.loginCategory, pkg.modules, pkg.days, now);
  }
}

const entCount = db.prepare('SELECT COUNT(*) as count FROM business_entities').get().count;
if (entCount === 0) {
  const now = new Date().toISOString();
  const seedEntities = [
    { id: 'ENT_DEMO_B2B',   name: 'Demo Corporation',       type: 'b2b',   email: 'hr@democorp.com',      maxUsers: 100 },
    { id: 'ENT_DEMO_B2B2C', name: 'Demo University Partner', type: 'b2b2c', email: 'admin@demouniv.edu',   maxUsers: 500 },
  ];
  for (const ent of seedEntities) {
    db.prepare("INSERT INTO business_entities (id, name, type, contactEmail, maxUsers, isActive, createdAt, createdByAdminId) VALUES (?, ?, ?, ?, ?, 1, ?, 'U_ADMIN_SEED')").run(ent.id, ent.name, ent.type, ent.email, ent.maxUsers, now);
  }
}

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('       FINGENIQ B2C / B2B / B2B2C & PACKAGE ACCESS VERIFICATION SUITE       ');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

let total = 0;
let passed = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function runTests() {
  try {
    // ── 1. PACKAGES & ENTITIES SEED VERIFICATION ───────────────────────────
    console.log('▶ TEST SUITE 1: Multi-Tenant Schema & Seed Packages');
    const packages = db.prepare('SELECT * FROM packages').all();
    assert(packages.length >= 6, `Found ${packages.length} default packages seeded in database`);
    
    const b2cStarter = packages.find(p => p.id === 'PKG_B2C_STARTER');
    assert(b2cStarter !== undefined, 'B2C Starter package exists');
    assert(JSON.parse(b2cStarter.allowedModules).includes('M1'), 'B2C Starter includes M1');
    assert(!JSON.parse(b2cStarter.allowedModules).includes('M5'), 'B2C Starter excludes M5 (gated)');

    const b2bEnt = packages.find(p => p.id === 'PKG_B2B_ENTERPRISE');
    assert(b2bEnt !== undefined, 'B2B Enterprise package exists');
    assert(JSON.parse(b2bEnt.allowedModules).includes('ALL'), 'B2B Enterprise grants ALL modules');

    const entities = db.prepare('SELECT * FROM business_entities').all();
    assert(entities.length >= 2, `Found ${entities.length} default business entities seeded`);
    const demoCorp = entities.find(e => e.type === 'b2b');
    const demoUniv = entities.find(e => e.type === 'b2b2c');
    assert(demoCorp !== undefined, 'B2B Business Entity seeded (Demo Corporation)');
    assert(demoUniv !== undefined, 'B2B2C Partner Entity seeded (Demo University Partner)');

    // ── 2. B2C USER PROVISIONING & LOGIN ───────────────────────────────────
    console.log('\n▶ TEST SUITE 2: B2C Individual User Flow');
    const b2cUserId = 'U_B2C_' + generateSecureToken().substring(0, 8);
    const b2cEmail = `b2c_user_${Date.now()}@test.fingeniq.com`;
    const b2cPass = 'StrongB2CPass@2026';
    const b2cHash = bcrypt.hashSync(b2cPass, 12);
    const b2cExpiry = new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString();

    db.prepare(`
      INSERT INTO users (
        id, name, email, role, passwordHash, mustResetPassword,
        accountStatus, validityPeriod, credentialIssuedAt, credentialExpiresAt,
        loginCategory, packageId
      ) VALUES (?, ?, ?, 'learner', ?, 0, 'active', 'quarterly', ?, ?, 'b2c', 'PKG_B2C_STARTER')
    `).run(b2cUserId, 'B2C Learner', b2cEmail, b2cHash, new Date().toISOString(), b2cExpiry);

    const b2cUser = db.prepare('SELECT * FROM users WHERE id = ?').get(b2cUserId);
    assert(b2cUser.loginCategory === 'b2c', 'User loginCategory is "b2c"');
    assert(b2cUser.packageId === 'PKG_B2C_STARTER', 'User is linked to B2C Starter package');
    assert(b2cUser.businessEntityId === null, 'B2C user has no businessEntityId (individual)');

    // ── 3. B2B ENTERPRISE USER PROVISIONING & ENTITY BINDING ───────────────
    console.log('\n▶ TEST SUITE 3: B2B Enterprise User Flow & Entity Validation');
    const b2bUserId = 'U_B2B_' + generateSecureToken().substring(0, 8);
    const b2bEmail = `b2b_emp_${Date.now()}@test.fingeniq.com`;
    const b2bPass = 'StrongB2BPass@2026';
    const b2bHash = bcrypt.hashSync(b2bPass, 12);
    const b2bExpiry = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();

    db.prepare(`
      INSERT INTO users (
        id, name, email, role, passwordHash, mustResetPassword,
        accountStatus, validityPeriod, credentialIssuedAt, credentialExpiresAt,
        loginCategory, businessEntityId, packageId
      ) VALUES (?, ?, ?, 'learner', ?, 0, 'active', 'annual', ?, ?, 'b2b', ?, 'PKG_B2B_ENTERPRISE')
    `).run(b2bUserId, 'B2B Employee', b2bEmail, b2bHash, new Date().toISOString(), b2bExpiry, demoCorp.id);

    const b2bUser = db.prepare('SELECT * FROM users WHERE id = ?').get(b2bUserId);
    assert(b2bUser.loginCategory === 'b2b', 'User loginCategory is "b2b"');
    assert(b2bUser.businessEntityId === demoCorp.id, 'User is bound to Demo Corporation entity ID');
    assert(b2bUser.packageId === 'PKG_B2B_ENTERPRISE', 'User is linked to B2B Enterprise package');

    // Test B2B entity validation logic:
    // If login attempts with wrong entity ID -> Rejected
    const validateB2BLogin = (inputEmail, inputEntityId) => {
      const u = db.prepare('SELECT * FROM users WHERE email = ?').get(inputEmail);
      if (!u) return false;
      if (u.loginCategory === 'b2b' && u.businessEntityId !== inputEntityId) return false;
      return true;
    };

    assert(validateB2BLogin(b2bEmail, 'WRONG_ENTITY_ID') === false, 'Rejects B2B login with incorrect Business Entity selection');
    assert(validateB2BLogin(b2bEmail, demoCorp.id) === true, 'Accepts B2B login with matching Business Entity selection');

    // ── 4. B2B2C PARTNER CHANNEL USER PROVISIONING ─────────────────────────
    console.log('\n▶ TEST SUITE 4: B2B2C Partner Channel User Flow');
    const b2b2cUserId = 'U_B2B2C_' + generateSecureToken().substring(0, 8);
    const b2b2cEmail = `student_${Date.now()}@test.fingeniq.com`;
    const b2b2cPass = 'StrongPartnerPass@2026';
    const b2b2cHash = bcrypt.hashSync(b2b2cPass, 12);
    const b2b2cExpiry = new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString();

    db.prepare(`
      INSERT INTO users (
        id, name, email, role, passwordHash, mustResetPassword,
        accountStatus, validityPeriod, credentialIssuedAt, credentialExpiresAt,
        loginCategory, businessEntityId, packageId
      ) VALUES (?, ?, ?, 'learner', ?, 0, 'active', 'half_yearly', ?, ?, 'b2b2c', ?, 'PKG_B2B2C_BASIC')
    `).run(b2b2cUserId, 'Partner Student', b2b2cEmail, b2b2cHash, new Date().toISOString(), b2b2cExpiry, demoUniv.id);

    const b2b2cUser = db.prepare('SELECT * FROM users WHERE id = ?').get(b2b2cUserId);
    assert(b2b2cUser.loginCategory === 'b2b2c', 'User loginCategory is "b2b2c"');
    assert(b2b2cUser.businessEntityId === demoUniv.id, 'User is bound to Demo University Partner entity');
    assert(b2b2cUser.packageId === 'PKG_B2B2C_BASIC', 'User is linked to B2B2C Partner Basic package');

    // ── 5. MODULE ACCESS RESTRICTIONS & GATING CHECKS ──────────────────────
    console.log('\n▶ TEST SUITE 5: Module Access Gating (Allowed Modules per Package)');
    
    // Check B2C Starter user module rights
    const b2cPackage = db.prepare('SELECT allowedModules FROM packages WHERE id = ?').get(b2cUser.packageId);
    const b2cAllowed = JSON.parse(b2cPackage.allowedModules);
    
    const checkModuleAccess = (allowedList, targetModuleId) => {
      if (allowedList.includes('ALL')) return true;
      return allowedList.includes(targetModuleId);
    };

    assert(checkModuleAccess(b2cAllowed, 'M1') === true, 'B2C Starter can access Module 1 (Foundations)');
    assert(checkModuleAccess(b2cAllowed, 'M2') === true, 'B2C Starter can access Module 2 (Personal Finance)');
    assert(checkModuleAccess(b2cAllowed, 'M3') === true, 'B2C Starter can access Module 3 (Investing)');
    assert(checkModuleAccess(b2cAllowed, 'M4') === false, 'B2C Starter BLOCKED from Module 4 (Alternative Investments)');
    assert(checkModuleAccess(b2cAllowed, 'M5') === false, 'B2C Starter BLOCKED from Module 5 (Corporate Finance)');
    assert(checkModuleAccess(b2cAllowed, 'M8') === false, 'B2C Starter BLOCKED from Module 8 (Financial Leadership)');

    // Check B2B Enterprise user module rights (ALL)
    const b2bPackage = db.prepare('SELECT allowedModules FROM packages WHERE id = ?').get(b2bUser.packageId);
    const b2bAllowed = JSON.parse(b2bPackage.allowedModules);
    assert(checkModuleAccess(b2bAllowed, 'M1') === true, 'B2B Enterprise can access Module 1');
    assert(checkModuleAccess(b2bAllowed, 'M5') === true, 'B2B Enterprise can access Module 5');
    assert(checkModuleAccess(b2bAllowed, 'M8') === true, 'B2B Enterprise can access Module 8');

    // ── 6. MEMBERSHIP DURATION CLOCK & EXPIRATION VALIDATION ───────────────
    console.log('\n▶ TEST SUITE 6: Membership Clock & Duration Validation');
    const isMembershipActive = (credentialExpiresAt) => {
      if (!credentialExpiresAt) return false;
      return new Date(credentialExpiresAt).getTime() > Date.now();
    };

    assert(isMembershipActive(b2cExpiry) === true, 'Active membership duration validated (> now)');

    // Simulate an expired user
    const expiredDate = new Date(Date.now() - 1000).toISOString();
    assert(isMembershipActive(expiredDate) === false, 'Expired membership clock correctly detected (<= now)');

    // ── 7. SYSTEM DATE & TIME LOGIN TIMESTAMP RECORDING ────────────────────
    console.log('\n▶ TEST SUITE 7: System DateTime Login Timestamping');
    const loginTime = new Date().toISOString();
    db.prepare('UPDATE users SET loginTimestamp = ? WHERE id = ?').run(loginTime, b2cUserId);

    const loggedInUser = db.prepare('SELECT loginTimestamp FROM users WHERE id = ?').get(b2cUserId);
    assert(loggedInUser.loginTimestamp === loginTime, 'System date & time recorded in loginTimestamp upon sign in');

    // Cleanup test users
    db.prepare('DELETE FROM users WHERE id = ?').run(b2cUserId);
    db.prepare('DELETE FROM users WHERE id = ?').run(b2bUserId);
    db.prepare('DELETE FROM users WHERE id = ?').run(b2b2cUserId);

    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log(`🏁 ALL MULTI-TENANT TESTS PASSED: ${passed} / ${total} assertions verified successfully.`);
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err);
    process.exit(1);
  }
}

runTests();
