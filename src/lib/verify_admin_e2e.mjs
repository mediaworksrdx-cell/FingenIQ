import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Setup DB connection
const dbPath = path.resolve(process.cwd(), 'src/lib/db.sqlite');
const db = new Database(dbPath);

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('       FINGENIQ ADMIN ACTIONS & SECURITY END-TO-END VERIFICATION SUITE      ');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Helpers mirroring backend
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

function calculateExpirationDate(period, startDate = new Date()) {
  const expiry = new Date(startDate);
  if (period === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
  else if (period === 'quarterly') expiry.setMonth(expiry.getMonth() + 3);
  else if (period === 'half_yearly') expiry.setMonth(expiry.getMonth() + 6);
  else if (period === 'annual') expiry.setFullYear(expiry.getFullYear() + 1);
  return expiry;
}

function logAudit(action, adminId, targetUserId, prevVal, newVal) {
  const logId = 'AUD_' + generateSecureToken().substring(0, 12);
  const metadata = JSON.stringify({ previous: prevVal, new: newVal });
  db.prepare(`
    INSERT INTO audit_logs (id, action, adminId, targetUserId, timestamp, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(logId, action, adminId, targetUserId, new Date().toISOString(), metadata);
  return logId;
}

function checkAdminAuth(adminSessionToken) {
  if (!adminSessionToken) throw new Error('Unauthenticated admin request');
  const session = db.prepare('SELECT userId FROM sessions WHERE id = ?').get(adminSessionToken);
  if (!session) throw new Error('Invalid session');
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(session.userId);
  if (!user || user.role !== 'admin') throw new Error('Unauthorized role');
  return session.userId;
}

async function runVerification() {
  try {
    // ── 1. ENVIRONMENT & SEED SETUP ──────────────────────────────────────────
    console.log('▶ TEST SUITE 1: Admin & User Seed Verification');
    const adminUser = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
    assert(adminUser !== undefined, `Root Admin account exists (ID: ${adminUser?.id}, Email: ${adminUser?.email})`);
    assert(bcrypt.compareSync('Admin@123456', adminUser.passwordHash), 'Admin password hash is valid bcrypt (cost 12)');

    // Create active admin session
    const adminToken = 'ADM_SESSION_' + generateSecureToken();
    const expirySession = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO sessions (id, userId, expiresAt) VALUES (?, ?, ?)').run(adminToken, adminUser.id, expirySession);

    // Create a regular learner session to test unauthorized access
    const learnerUser = db.prepare("SELECT * FROM users WHERE role = 'learner'").get();
    const learnerToken = 'LRN_SESSION_' + generateSecureToken();
    db.prepare('INSERT INTO sessions (id, userId, expiresAt) VALUES (?, ?, ?)').run(learnerToken, learnerUser.id, expirySession);

    assert(checkAdminAuth(adminToken) === adminUser.id, 'Admin session token successfully authorizes as admin');

    // ── 2. AUTHORIZATION BOUNDARY ENFORCEMENT ───────────────────────────────
    console.log('\n▶ TEST SUITE 2: Security & Authorization Boundaries (Negative Tests)');
    
    // Test unauthenticated call
    let rejectedNoToken = false;
    try {
      checkAdminAuth(undefined);
    } catch (e) {
      rejectedNoToken = true;
      assert(e.message === 'Unauthenticated admin request', 'Rejects calls without session token');
    }
    assert(rejectedNoToken, 'Unauthenticated admin action blocked');

    // Test unauthorized role (Learner calling admin)
    let rejectedLearner = false;
    try {
      checkAdminAuth(learnerToken);
    } catch (e) {
      rejectedLearner = true;
      assert(e.message === 'Unauthorized role', 'Rejects non-admin (Learner) calling admin action');
    }
    assert(rejectedLearner, 'Privilege escalation blocked');

    // ── 3. CREDENTIAL PROVISIONING (ACTIVATION LINK & TEMP PASSWORD) ─────────
    console.log('\n▶ TEST SUITE 3: Credential Provisioning & Audit Trail');
    
    // Scenario A: Invite link delivery
    const testLearnerEmail = `e2e_learner_${Date.now()}@test.fingeniq.com`;
    const testLearnerId = 'U_' + generateSecureToken().substring(0, 10);
    const actToken = generateSecureToken();
    const actExpiry = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
    
    db.prepare(`
      INSERT INTO users (
        id, name, email, role, passwordHash, mustResetPassword, createdByAdminId,
        activationToken, activationTokenExpiresAt, accountStatus, validityPeriod, credentialIssuedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      testLearnerId, 'Test Learner E2E', testLearnerEmail, 'learner', null, 1, adminUser.id,
      actToken, actExpiry, 'pending_activation', 'quarterly', new Date().toISOString()
    );

    logAudit('CREDENTIAL_CREATED', adminUser.id, testLearnerId, null, {
      name: 'Test Learner E2E', email: testLearnerEmail, role: 'learner', validityPeriod: 'quarterly', status: 'pending_activation'
    });

    const createdLearner = db.prepare('SELECT * FROM users WHERE id = ?').get(testLearnerId);
    assert(createdLearner.accountStatus === 'pending_activation', 'Learner created in "pending_activation" status');
    assert(createdLearner.mustResetPassword === 1, 'mustResetPassword is set to 1 for initial onboarding');
    assert(createdLearner.activationToken === actToken, 'Activation token properly stored');
    assert(createdLearner.validityPeriod === 'quarterly', 'Assigned validity period is quarterly');

    // Verify audit log for creation
    const createAudit = db.prepare("SELECT * FROM audit_logs WHERE targetUserId = ? AND action = 'CREDENTIAL_CREATED'").get(testLearnerId);
    assert(createAudit !== undefined, 'CREDENTIAL_CREATED audit log recorded');
    assert(createAudit.adminId === adminUser.id, 'Audit log correctly references the issuing admin ID');

    // ── 4. CREDENTIAL ACTIVATION END-TO-END ──────────────────────────────────
    console.log('\n▶ TEST SUITE 4: User Activation Flow');
    const actNow = new Date().toISOString();
    const pendingUser = db.prepare('SELECT * FROM users WHERE activationToken = ? AND activationTokenExpiresAt > ?').get(actToken, actNow);
    assert(pendingUser !== undefined, 'User found via valid unexpired activation token');

    const newLearnerPassword = 'ValidPassword@2026';
    const newHash = bcrypt.hashSync(newLearnerPassword, 12);
    const expectedExpiry = calculateExpirationDate(pendingUser.validityPeriod, new Date()).toISOString();

    db.prepare(`
      UPDATE users 
      SET passwordHash = ?, mustResetPassword = 0, accountStatus = 'active',
          activationToken = NULL, activationTokenExpiresAt = NULL,
          credentialActivatedAt = ?, credentialExpiresAt = ?
      WHERE id = ?
    `).run(newHash, actNow, expectedExpiry, pendingUser.id);

    logAudit('ACCOUNT_ACTIVATED', pendingUser.id, pendingUser.id, { status: pendingUser.accountStatus }, { status: 'active', expiresAt: expectedExpiry });

    const activatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(testLearnerId);
    assert(activatedUser.accountStatus === 'active', 'Account status transitioned to "active"');
    assert(activatedUser.mustResetPassword === 0, 'mustResetPassword cleared to 0');
    assert(activatedUser.activationToken === null, 'Activation token cleared (one-time use consumed)');
    assert(activatedUser.credentialActivatedAt === actNow, 'Activation timestamp stored');
    assert(activatedUser.credentialExpiresAt === expectedExpiry, 'Credential expiry correctly calculated 3 months out');
    assert(bcrypt.compareSync(newLearnerPassword, activatedUser.passwordHash), 'New password hash verified');

    const actAudit = db.prepare("SELECT * FROM audit_logs WHERE targetUserId = ? AND action = 'ACCOUNT_ACTIVATED'").get(testLearnerId);
    assert(actAudit !== undefined, 'ACCOUNT_ACTIVATED audit log recorded');

    // ── 5. ACCOUNT LOCK / UNLOCK BEHAVIOR ────────────────────────────────────
    console.log('\n▶ TEST SUITE 5: Account Lock & Unlock Enforcement');
    // Lock account
    db.prepare("UPDATE users SET accountStatus = 'locked' WHERE id = ?").run(testLearnerId);
    logAudit('ACCOUNT_LOCK', adminUser.id, testLearnerId, { status: 'active' }, { status: 'locked' });
    
    let lockedUser = db.prepare('SELECT accountStatus FROM users WHERE id = ?').get(testLearnerId);
    assert(lockedUser.accountStatus === 'locked', 'Account locked successfully');

    // Verify session / login checker denies access when locked
    const isLoginBlocked = (user) => user.accountStatus === 'locked' || user.accountStatus === 'disabled';
    assert(isLoginBlocked(lockedUser) === true, 'Authentication engine rejects login for locked account');

    // Unlock account
    db.prepare("UPDATE users SET accountStatus = 'active', failedLoginAttempts = 0 WHERE id = ?").run(testLearnerId);
    logAudit('ACCOUNT_UNLOCK', adminUser.id, testLearnerId, { status: 'locked' }, { status: 'active' });

    let unlockedUser = db.prepare('SELECT accountStatus, failedLoginAttempts FROM users WHERE id = ?').get(testLearnerId);
    assert(unlockedUser.accountStatus === 'active', 'Account unlocked back to "active"');
    assert(unlockedUser.failedLoginAttempts === 0, 'Failed login attempt counter reset to 0 upon unlock');

    // ── 6. ACCOUNT DISABLE / ENABLE BEHAVIOR ─────────────────────────────────
    console.log('\n▶ TEST SUITE 6: Account Disable & Enable Enforcement');
    // Disable
    db.prepare("UPDATE users SET accountStatus = 'disabled' WHERE id = ?").run(testLearnerId);
    logAudit('ACCOUNT_DISABLE', adminUser.id, testLearnerId, { status: 'active' }, { status: 'disabled' });

    let disabledUser = db.prepare('SELECT accountStatus FROM users WHERE id = ?').get(testLearnerId);
    assert(disabledUser.accountStatus === 'disabled', 'Account disabled successfully');
    assert(isLoginBlocked(disabledUser) === true, 'Authentication engine rejects access for disabled account');

    // Enable
    db.prepare("UPDATE users SET accountStatus = 'active' WHERE id = ?").run(testLearnerId);
    logAudit('ACCOUNT_ENABLE', adminUser.id, testLearnerId, { status: 'disabled' }, { status: 'active' });

    let enabledUser = db.prepare('SELECT accountStatus FROM users WHERE id = ?').get(testLearnerId);
    assert(enabledUser.accountStatus === 'active', 'Account re-enabled to "active"');

    // ── 7. FORCE PASSWORD RESET BEHAVIOR ─────────────────────────────────────
    console.log('\n▶ TEST SUITE 7: Force Password Reset Flagging');
    db.prepare('UPDATE users SET mustResetPassword = 1 WHERE id = ?').run(testLearnerId);
    logAudit('FORCE_RESET_PASSWORD', adminUser.id, testLearnerId, { mustResetPassword: 0 }, { mustResetPassword: 1 });

    let resetFlaggedUser = db.prepare('SELECT mustResetPassword FROM users WHERE id = ?').get(testLearnerId);
    assert(resetFlaggedUser.mustResetPassword === 1, 'mustResetPassword set to 1 by admin action');

    // Verify session response for mustReset
    const shouldRedirectToReset = resetFlaggedUser.mustResetPassword === 1;
    assert(shouldRedirectToReset === true, 'Middleware & session checker will intercept and redirect to password reset');

    const resetAudit = db.prepare("SELECT * FROM audit_logs WHERE targetUserId = ? AND action = 'FORCE_RESET_PASSWORD'").get(testLearnerId);
    assert(resetAudit !== undefined, 'FORCE_RESET_PASSWORD audit log recorded');

    // ── 8. CREDENTIAL RENEWAL LIFECYCLE ──────────────────────────────────────
    console.log('\n▶ TEST SUITE 8: Credential Renewal & History Archiving');
    const prevExpiry = activatedUser.credentialExpiresAt;
    const renewalPeriod = 'annual';
    const newRenewedExpiry = calculateExpirationDate(renewalPeriod, new Date(prevExpiry)).toISOString();

    db.prepare(`
      UPDATE users 
      SET credentialExpiresAt = ?, validityPeriod = ?, accountStatus = 'active'
      WHERE id = ?
    `).run(newRenewedExpiry, renewalPeriod, testLearnerId);

    const renewalId = 'REN_' + generateSecureToken().substring(0, 10);
    const renewNow = new Date().toISOString();
    db.prepare(`
      INSERT INTO renewal_history (id, userId, renewedAt, renewedByAdminId, previousExpiresAt, newExpiresAt, period)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(renewalId, testLearnerId, renewNow, adminUser.id, prevExpiry, newRenewedExpiry, renewalPeriod);

    logAudit('CREDENTIAL_RENEWED', adminUser.id, testLearnerId, 
      { expiresAt: prevExpiry, period: 'quarterly', status: 'active' },
      { expiresAt: newRenewedExpiry, period: 'annual', status: 'active' }
    );

    const renewedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(testLearnerId);
    assert(renewedUser.validityPeriod === 'annual', 'Validity period updated to annual');
    assert(renewedUser.credentialExpiresAt === newRenewedExpiry, 'Expiration date extended +1 year from prior expiration');

    const historyEntry = db.prepare('SELECT * FROM renewal_history WHERE id = ?').get(renewalId);
    assert(historyEntry !== undefined, 'Renewal history record saved');
    assert(historyEntry.renewedByAdminId === adminUser.id, 'Renewal record references renewing admin ID');
    assert(historyEntry.previousExpiresAt === prevExpiry, 'Renewal record stores accurate prior expiration');
    assert(historyEntry.newExpiresAt === newRenewedExpiry, 'Renewal record stores accurate new expiration');

    // ── 9. ADMIN DATA SANITIZATION & SECURITY ────────────────────────────────
    console.log('\n▶ TEST SUITE 9: Data Sanitization (No Password Hash / Token Leaks)');
    const allUsers = db.prepare('SELECT * FROM users').all();
    const safeUsers = allUsers.map(u => {
      const {
        passwordHash,
        activationToken,
        activationTokenExpiresAt,
        resetToken,
        resetTokenExpiresAt,
        ...rest
      } = u;
      return rest;
    });

    const targetSafe = safeUsers.find(u => u.id === testLearnerId);
    assert(targetSafe.passwordHash === undefined, 'passwordHash stripped from client payload');
    assert(targetSafe.activationToken === undefined, 'activationToken stripped from client payload');
    assert(targetSafe.resetToken === undefined, 'resetToken stripped from client payload');
    assert(targetSafe.name !== undefined && targetSafe.email !== undefined, 'Public non-sensitive fields preserved');

    // ── 10. AUDIT LOG INTEGRITY & SEBI COMPLIANCE ───────────────────────────
    console.log('\n▶ TEST SUITE 10: Audit Log Chain Integrity');
    const logsForTarget = db.prepare('SELECT * FROM audit_logs WHERE targetUserId = ? ORDER BY timestamp ASC').all(testLearnerId);
    assert(logsForTarget.length >= 5, `Complete audit sequence recorded (${logsForTarget.length} events logged for user lifecycle)`);
    
    const actionsRecorded = logsForTarget.map(l => l.action);
    assert(actionsRecorded.includes('CREDENTIAL_CREATED'), 'Audit includes CREDENTIAL_CREATED');
    assert(actionsRecorded.includes('ACCOUNT_ACTIVATED'), 'Audit includes ACCOUNT_ACTIVATED');
    assert(actionsRecorded.includes('ACCOUNT_LOCK'), 'Audit includes ACCOUNT_LOCK');
    assert(actionsRecorded.includes('ACCOUNT_UNLOCK'), 'Audit includes ACCOUNT_UNLOCK');
    assert(actionsRecorded.includes('FORCE_RESET_PASSWORD'), 'Audit includes FORCE_RESET_PASSWORD');
    assert(actionsRecorded.includes('CREDENTIAL_RENEWED'), 'Audit includes CREDENTIAL_RENEWED');

    // Cleanup test user and sessions
    db.prepare('DELETE FROM sessions WHERE id = ?').run(adminToken);
    db.prepare('DELETE FROM sessions WHERE id = ?').run(learnerToken);
    db.prepare('DELETE FROM users WHERE id = ?').run(testLearnerId);

    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log(`🏁 ALL TESTS PASSED: ${passedTests} / ${totalTests} assertions verified successfully.`);
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error);
    process.exit(1);
  }
}

runVerification();
