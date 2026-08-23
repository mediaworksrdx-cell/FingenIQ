'use server';

import { db } from '@/lib/db';
import { calculateExpirationDate, generateSecureToken, checkIpRateLimit, recordIpAttempt, logAudit } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import { sendPasswordResetEmail } from '@/lib/email';
import { getAppBaseUrl } from '@/lib/config';

// Password Validation Check
function validatePasswordStrength(password: string): boolean {
  if (password.length < 10) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>_]/.test(password)) return false;
  return true;
}

// Opaque sessions cookie settings
async function setSessionCookie(userId: string) {
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7-day session duration

  // Save session to database lookup table
  db.prepare('INSERT INTO sessions (id, userId, expiresAt) VALUES (?, ?, ?)')
    .run(token, userId, expiresAt.toISOString());

  const cookieStore = await cookies();
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: expiresAt,
    path: '/',
  });
}

// ── SERVER ACTIONS ───────────────────────────────────────────

export async function loginAction(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = formData.get('password') as string || '';
  const loginCategory = formData.get('loginCategory') as string || 'b2c';
  const businessEntityId = formData.get('businessEntityId') as string || null;
  const redirectTo = formData.get('redirectTo') as string || '';
  
  const headersList = await headers();
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  // 1. IP rate limiting block
  const rateLimit = checkIpRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return { success: false, error: 'Too many login failures. Try again in 10 minutes.' };
  }

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  // 2. Fetch User (Generic credentials message to prevent enumeration)
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) {
    recordIpAttempt(clientIp, true);
    return { success: false, error: 'Invalid credentials.' };
  }

  // Validate businessEntityId for B2B/B2B2C
  if (loginCategory === 'b2b' || loginCategory === 'b2b2c') {
    if (!businessEntityId || user.businessEntityId !== businessEntityId) {
      recordIpAttempt(clientIp, true);
      return { success: false, error: 'Invalid credentials.' };
    }
  }

  // 3. Status blocks
  if (user.accountStatus === 'locked') {
    return { success: false, error: 'Account locked due to multiple failed login attempts. Contact your administrator.' };
  }
  if (user.accountStatus === 'disabled') {
    return { success: false, error: 'Account disabled. Contact your administrator.' };
  }

  // 4. Validate credentials
  const valid = bcrypt.compareSync(password, user.passwordHash || '');
  if (!valid) {
    // Increment failures
    const attempts = user.failedLoginAttempts + 1;
    if (attempts >= 5) {
      db.prepare("UPDATE users SET failedLoginAttempts = ?, accountStatus = 'locked' WHERE id = ?")
        .run(attempts, user.id);
      logAudit('ACCOUNT_LOCKED_LIMITS', 'SYSTEM', user.id, { status: user.accountStatus }, { status: 'locked' });
      recordIpAttempt(clientIp, true);
      return { success: false, error: 'Account locked due to multiple failed login attempts. Contact your administrator.' };
    } else {
      db.prepare('UPDATE users SET failedLoginAttempts = ? WHERE id = ?').run(attempts, user.id);
    }
    recordIpAttempt(clientIp, true);
    return { success: false, error: 'Invalid credentials.' };
  }

  // Check account expiration
  if (user.credentialExpiresAt) {
    const expiresTime = new Date(user.credentialExpiresAt).getTime();
    const now = Date.now();
    if (now > expiresTime) {
      db.prepare("UPDATE users SET accountStatus = 'expired' WHERE id = ?").run(user.id);
      logAudit('ACCOUNT_EXPIRED', 'SYSTEM', user.id, { status: user.accountStatus }, { status: 'expired' });
      return { success: false, error: 'Your membership has expired. Contact admin to renew.' };
    }
  }

  // 5. Success reset login parameters
  const nowStr = new Date().toISOString();
  db.prepare('UPDATE users SET failedLoginAttempts = 0, loginTimestamp = ? WHERE id = ?').run(nowStr, user.id);
  recordIpAttempt(clientIp, false);

  if (user.accountStatus === 'pending_activation') {
    return { success: false, error: 'Account pending activation. Please use your initial activation link.', isPending: true };
  }

  // Login successful
  await setSessionCookie(user.id);

  if (user.mustResetPassword === 1) {
    const token = generateSecureToken();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    db.prepare('UPDATE users SET resetToken = ?, resetTokenExpiresAt = ? WHERE id = ?')
      .run(token, expiry.toISOString(), user.id);
    return { success: true, redirectUrl: `/reset-password/${token}`, mustReset: true };
  }

  // Return route for redirection
  let redirectUrl = '/dashboard';
  if (user.role === 'admin') redirectUrl = '/admin/credentials';
  if (user.role === 'employer') redirectUrl = '/marketplace';

  // If a specific redirect was requested, use it (validate it's a relative path)
  if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
    redirectUrl = redirectTo;
  }

  return { success: true, redirectUrl, mustReset: false };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (token) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
  }
  cookieStore.delete('session_token');
  return { success: true };
}

export async function activateAccountAction(prevState: any, formData: FormData) {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!token) return { success: false, error: 'Token is missing.' };
  if (!password || !confirmPassword) return { success: false, error: 'Password fields are required.' };
  if (password !== confirmPassword) return { success: false, error: 'Passwords do not match.' };

  // Strength check
  if (!validatePasswordStrength(password)) {
    return { success: false, error: 'Password does not meet complexity requirements.' };
  }

  const now = new Date().toISOString();
  const user = db.prepare('SELECT * FROM users WHERE activationToken = ? AND activationTokenExpiresAt > ?').get(token, now) as any;

  if (!user) {
    return { success: false, error: 'Activation token is invalid or has expired. Contact your administrator.' };
  }

  const newHash = bcrypt.hashSync(password, 12);
  const expirationDate = calculateExpirationDate(user.validityPeriod || 'monthly', new Date()).toISOString();

  // Activate user profile
  db.prepare(`
    UPDATE users 
    SET passwordHash = ?, mustResetPassword = 0, accountStatus = 'active',
        activationToken = NULL, activationTokenExpiresAt = NULL,
        credentialActivatedAt = ?, credentialExpiresAt = ?
    WHERE id = ?
  `).run(newHash, now, expirationDate, user.id);

  logAudit('ACCOUNT_ACTIVATED', user.id, user.id, { status: user.accountStatus }, { status: 'active', expiresAt: expirationDate });

  await setSessionCookie(user.id);

  let redirectUrl = '/dashboard';
  if (user.role === 'admin') redirectUrl = '/admin/credentials';
  if (user.role === 'employer') redirectUrl = '/marketplace';

  return { success: true, redirectUrl };
}

export async function requestPasswordResetAction(prevState: any, formData: FormData): Promise<{ success: boolean; error?: string; message?: string }> {
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  if (!email) return { success: false, error: 'Email address is required.' };

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND accountStatus NOT IN (\'locked\', \'disabled\')').get(email) as any;

  // Generic message returned regardless of whether the account exists
  const genericResponse = { success: true, message: 'If the email matches an active account, a reset link will be logged in the console.' };

  if (user) {
    const token = generateSecureToken();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // 1-hour validity

    db.prepare('UPDATE users SET resetToken = ?, resetTokenExpiresAt = ? WHERE id = ?')
      .run(token, expiry.toISOString(), user.id);

    await sendPasswordResetEmail(email, token);
  }

  return genericResponse;
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!token) return { success: false, error: 'Token is missing.' };
  if (!password || !confirmPassword) return { success: false, error: 'Passwords are required.' };
  if (password !== confirmPassword) return { success: false, error: 'Passwords do not match.' };

  if (!validatePasswordStrength(password)) {
    return { success: false, error: 'Password does not meet complexity requirements.' };
  }

  const now = new Date().toISOString();
  const user = db.prepare('SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiresAt > ?').get(token, now) as any;

  if (!user) {
    return { success: false, error: 'Password reset link is invalid or has expired. Please request a new one.' };
  }

  const newHash = bcrypt.hashSync(password, 12);
  db.prepare(`
    UPDATE users
    SET passwordHash = ?, mustResetPassword = 0, resetToken = NULL, resetTokenExpiresAt = NULL, failedLoginAttempts = 0
    WHERE id = ?
  `).run(newHash, user.id);

  logAudit('PASSWORD_RESET_TOKEN', user.id, user.id, null, { action: 'token_reset_success' });

  return { success: true, redirectUrl: '/login' };
}

export async function changePasswordAction(prevState: any, formData: FormData): Promise<{ success: boolean; error?: string; message?: string }> {
  const currentPassword = (formData.get('currentPassword') as string || '').trim();
  const newPassword = formData.get('newPassword') as string || '';
  const confirmPassword = formData.get('confirmPassword') as string || '';

  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return { success: false, error: 'Unauthorized session.' };

  const session = db.prepare('SELECT userId FROM sessions WHERE id = ?').get(token) as { userId: string } | undefined;
  if (!session) return { success: false, error: 'Invalid or expired session. Please sign in again.' };

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: 'All password fields are required.' };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, error: 'New passwords do not match.' };
  }
  if (!validatePasswordStrength(newPassword)) {
    return { success: false, error: 'Password must be at least 10 characters with uppercase, lowercase, number, and special character.' };
  }

  const user = db.prepare('SELECT id, passwordHash FROM users WHERE id = ?').get(session.userId) as any;
  if (!user || !bcrypt.compareSync(currentPassword, user.passwordHash || '')) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  const newHash = bcrypt.hashSync(newPassword, 12);
  db.prepare('UPDATE users SET passwordHash = ? WHERE id = ?').run(newHash, user.id);
  logAudit('PASSWORD_CHANGED', user.id, user.id, null, { action: 'user_changed_password' });

  return { success: true, message: 'Password updated successfully!' };
}
