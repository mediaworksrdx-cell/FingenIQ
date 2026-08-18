'use server';

import { db } from '@/lib/db';
import { generateSecureToken, checkIpRateLimit, recordIpAttempt } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';

// Session cookie helper for community users
async function setCommunitySessionCookie(userId: string) {
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14); // 14-day community session duration

  // Save session to database lookup table
  db.prepare('INSERT INTO sessions (id, userId, expiresAt) VALUES (?, ?, ?)')
    .run(token, userId, expiresAt.toISOString());

  const cookieStore = await cookies();
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

/**
 * Community Self-Registration Action
 * Creates a standalone user with role 'community_member' (isolated from institutional LMS).
 */
export async function communityRegisterAction(prevState: any, formData: FormData) {
  const name = (formData.get('name') as string || '').trim();
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = formData.get('password') as string || '';
  const confirmPassword = formData.get('confirmPassword') as string || '';
  const redirectTo = formData.get('redirectTo') as string || '';

  const headersList = await headers();
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  // 1. IP rate limit check
  const rateLimit = checkIpRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return { success: false, error: 'Too many requests. Please wait a few minutes before trying again.' };
  }

  // 2. Input validations
  if (!name || name.length < 2) {
    return { success: false, error: 'Please enter your full name (at least 2 characters).' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  // 3. Check for existing account
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string } | undefined;
  if (existingUser) {
    return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
  }

  // 4. Create new community member
  const userId = `U_COMM_${crypto.randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase()}`;
  const passwordHash = bcrypt.hashSync(password, 12);
  const now = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO users (
        id, name, email, role, passwordHash, mustResetPassword,
        accountStatus, failedLoginAttempts, validityPeriod,
        credentialIssuedAt, credentialActivatedAt, loginCategory, loginTimestamp
      ) VALUES (?, ?, ?, 'community_member', ?, 0, 'active', 0, 'annual', ?, ?, 'community', ?)
    `).run(userId, name, email, passwordHash, now, now, now);
  } catch (err: any) {
    console.error('Community registration error:', err);
    return { success: false, error: 'Could not create account. Please try again.' };
  }

  // 5. Establish session
  await setCommunitySessionCookie(userId);

  // Safe redirect URL
  let targetUrl = '/community';
  if (redirectTo && redirectTo.startsWith('/community')) {
    targetUrl = redirectTo;
  }

  return { success: true, redirectUrl: targetUrl };
}

/**
 * Community Login Action
 * Allows community members (and admins/employees/learners) to sign in for community participation.
 */
export async function communityLoginAction(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = formData.get('password') as string || '';
  const redirectTo = formData.get('redirectTo') as string || '';

  const headersList = await headers();
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  // 1. IP rate limiting
  const rateLimit = checkIpRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return { success: false, error: 'Too many login failures. Try again in 10 minutes.' };
  }

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  // 2. Fetch User
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) {
    recordIpAttempt(clientIp, true);
    return { success: false, error: 'Invalid email or password.' };
  }

  // 3. Status checks
  if (user.accountStatus === 'locked') {
    return { success: false, error: 'Account locked due to multiple failed login attempts. Contact support.' };
  }
  if (user.accountStatus === 'disabled') {
    return { success: false, error: 'Account disabled. Contact support.' };
  }

  // 4. Validate credentials
  const valid = bcrypt.compareSync(password, user.passwordHash || '');
  if (!valid) {
    const attempts = (user.failedLoginAttempts || 0) + 1;
    if (attempts >= 5) {
      db.prepare("UPDATE users SET failedLoginAttempts = ?, accountStatus = 'locked' WHERE id = ?")
        .run(attempts, user.id);
      recordIpAttempt(clientIp, true);
      return { success: false, error: 'Account locked due to multiple failed login attempts.' };
    } else {
      db.prepare('UPDATE users SET failedLoginAttempts = ? WHERE id = ?').run(attempts, user.id);
    }
    recordIpAttempt(clientIp, true);
    return { success: false, error: 'Invalid email or password.' };
  }

  // 5. Reset login attempt counters
  const now = new Date().toISOString();
  db.prepare('UPDATE users SET failedLoginAttempts = 0, loginTimestamp = ? WHERE id = ?').run(now, user.id);
  recordIpAttempt(clientIp, false);

  // 6. Set session
  await setCommunitySessionCookie(user.id);

  // Safe redirect URL
  let targetUrl = '/community';
  if (redirectTo && redirectTo.startsWith('/community')) {
    targetUrl = redirectTo;
  }

  return { success: true, redirectUrl: targetUrl };
}

/**
 * Community Logout Action
 */
export async function communityLogoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (token) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
  }
  cookieStore.delete('session_token');
  return { success: true };
}
