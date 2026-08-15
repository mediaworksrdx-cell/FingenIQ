'use server';

import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { generateSecureToken, calculateExpirationDate, logAudit } from '@/lib/auth';
import { sendActivationEmail } from '@/lib/email';
import { getAppBaseUrl } from '@/lib/config';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

// Verify current session matches admin role
async function checkAdminAuth(adminSessionToken: string | undefined): Promise<any> {
  if (!adminSessionToken) throw new Error('Unauthenticated admin request');
  const session = db.prepare('SELECT userId FROM sessions WHERE id = ?').get(adminSessionToken) as any;
  if (!session) throw new Error('Invalid session');
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(session.userId) as any;
  if (!user || user.role !== 'admin') throw new Error('Unauthorized role');
  return session.userId;
}

export async function createCredentialAction(adminToken: string | undefined, formData: FormData) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const name = formData.get('name') as string;
    const email = (formData.get('email') as string || '').trim().toLowerCase();
    const role = formData.get('role') as string;
    const deliveryMethod = formData.get('deliveryMethod') as string;
    const validityPeriod = formData.get('validityPeriod') as 'monthly' | 'quarterly' | 'half_yearly' | 'annual';

    if (!name || !email || !role || !validityPeriod) {
      return { success: false, error: 'All fields are required.' };
    }

    const emailExists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (emailExists) {
      return { success: false, error: 'Email address already registered.' };
    }

    const userId = 'U_' + generateSecureToken().substring(0, 10);
    const issuedAt = new Date().toISOString();

    let tempPassword = '';
    let passwordHash: string | null = null;
    let activationToken: string | null = null;
    let activationTokenExpiresAt: string | null = null;
    let accountStatus = 'pending_activation';

    if (deliveryMethod === 'password') {
      // Option 1: temp password
      // Generate a structured temp password: Temp@ + 8 random hex chars
      tempPassword = 'Temp@' + generateSecureToken().substring(0, 8);
      passwordHash = bcrypt.hashSync(tempPassword, 12);
      accountStatus = 'active'; // ready to login directly, but mustResetPassword remains true
    } else {
      // Option 2: activation link token
      activationToken = generateSecureToken();
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 72); // 72 hours
      activationTokenExpiresAt = expiry.toISOString();
    }

    db.prepare(`
      INSERT INTO users (
        id, name, email, role, passwordHash, mustResetPassword, createdByAdminId,
        activationToken, activationTokenExpiresAt, accountStatus, validityPeriod, credentialIssuedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, name, email, role, passwordHash, 1, adminId,
      activationToken, activationTokenExpiresAt, accountStatus, validityPeriod, issuedAt
    );

    // Audit Log creation
    logAudit('CREDENTIAL_CREATED', adminId, userId, null, {
      name, email, role, validityPeriod, deliveryMethod, status: accountStatus
    });

    const activationLink = activationToken ? `${getAppBaseUrl()}/activate/${activationToken}` : '';

    if (activationToken && (deliveryMethod === 'email' || deliveryMethod === 'both' || !deliveryMethod)) {
      await sendActivationEmail(email, name, activationToken);
    }

    revalidatePath('/admin/credentials');
    return {
      success: true,
      userId,
      tempPassword,
      activationLink,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleAccountStatusAction(adminToken: string | undefined, userId: string, actionType: 'lock' | 'unlock' | 'disable' | 'enable') {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const user = db.prepare('SELECT accountStatus FROM users WHERE id = ?').get(userId) as any;
    if (!user) return { success: false, error: 'User not found.' };

    let newStatus = user.accountStatus;
    if (actionType === 'lock') newStatus = 'locked';
    else if (actionType === 'unlock') newStatus = 'active';
    else if (actionType === 'disable') newStatus = 'disabled';
    else if (actionType === 'enable') newStatus = 'active';

    db.prepare('UPDATE users SET accountStatus = ?, failedLoginAttempts = 0 WHERE id = ?').run(newStatus, userId);

    logAudit(`ACCOUNT_${actionType.toUpperCase()}`, adminId, userId, { status: user.accountStatus }, { status: newStatus });

    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function forceResetAction(adminToken: string | undefined, userId: string) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    db.prepare('UPDATE users SET mustResetPassword = 1 WHERE id = ?').run(userId);
    logAudit('FORCE_RESET_PASSWORD', adminId, userId, { mustResetPassword: 0 }, { mustResetPassword: 1 });
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function renewCredentialAction(
  adminToken: string | undefined, 
  userId: string, 
  newPeriod: 'monthly' | 'quarterly' | 'half_yearly' | 'annual'
) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const user = db.prepare('SELECT accountStatus, credentialExpiresAt, validityPeriod FROM users WHERE id = ?').get(userId) as any;
    if (!user) return { success: false, error: 'User not found.' };

    const now = new Date();
    let baseDate = now;

    const previousExpiresAt = user.credentialExpiresAt;
    const isLapsed = !previousExpiresAt || new Date(previousExpiresAt).getTime() < now.getTime();

    if (!isLapsed) {
      // renew before expiry -> extend from current expires date
      baseDate = new Date(previousExpiresAt);
    }

    const newExpiresAt = calculateExpirationDate(newPeriod, baseDate).toISOString();

    db.prepare(`
      UPDATE users 
      SET credentialExpiresAt = ?, validityPeriod = ?, accountStatus = 'active'
      WHERE id = ?
    `).run(newExpiresAt, newPeriod, userId);

    // Save to renewal history
    const renewalId = 'REN_' + generateSecureToken().substring(0, 10);
    db.prepare(`
      INSERT INTO renewal_history (id, userId, renewedAt, renewedByAdminId, previousExpiresAt, newExpiresAt, period)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(renewalId, userId, now.toISOString(), adminId, previousExpiresAt, newExpiresAt, newPeriod);

    // Save to audit log
    logAudit('CREDENTIAL_RENEWED', adminId, userId, 
      { expiresAt: previousExpiresAt, period: user.validityPeriod, status: user.accountStatus },
      { expiresAt: newExpiresAt, period: newPeriod, status: 'active' }
    );

    revalidatePath('/admin/credentials');
    return { success: true, newExpiresAt };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateLessonResourcesAction(
  adminToken: string | undefined,
  lessonId: string,
  youtubeId: string,
  pdfPath: string
) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    
    if (!lessonId) {
      return { success: false, error: 'Lesson selection is required.' };
    }

    const lessonsDir = path.resolve(process.cwd(), 'Lessons', 'content');
    
    // Sanitize to prevent path traversal
    const cleanLessonId = path.basename(lessonId);
    const filePath = path.resolve(lessonsDir, `${cleanLessonId}.json`);

    if (!filePath.startsWith(lessonsDir)) {
      return { success: false, error: 'Unauthorized file path access.' };
    }

    if (!fs.existsSync(filePath)) {
      return { success: false, error: `Lesson data file not found: ${cleanLessonId}.json` };
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lessonData = JSON.parse(fileContent);

    const prevVal = { youtubeId: lessonData.youtubeId, pdfPath: lessonData.pdfPath };
    
    // Update resources
    lessonData.youtubeId = youtubeId.trim() || null;
    lessonData.pdfPath = pdfPath.trim() || null;

    fs.writeFileSync(filePath, JSON.stringify(lessonData, null, 2), 'utf8');

    logAudit('LESSON_RESOURCES_UPDATED', adminId, null, prevVal, { youtubeId, pdfPath });

    revalidatePath('/lesson-player');
    revalidatePath('/lessons');
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
