'use server';

import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { generateSecureToken, calculateExpirationDate, logAudit } from '@/lib/auth';
import { sendActivationEmail } from '@/lib/email';
import { getAppBaseUrl } from '@/lib/config';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// Verify current session matches admin, employee, or teacher role
async function checkAdminAuth(adminSessionToken?: string | undefined): Promise<any> {
  // Read httpOnly cookie server-side (client can't access httpOnly cookies via document.cookie)
  let token = adminSessionToken;
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get('session_token')?.value;
  }
  if (!token) throw new Error('Unauthenticated admin request');
  const session = db.prepare('SELECT userId FROM sessions WHERE id = ?').get(token) as any;
  if (!session) throw new Error('Invalid session');
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(session.userId) as any;
  if (!user || (user.role !== 'admin' && user.role !== 'employee' && user.role !== 'teacher')) throw new Error('Unauthorized role');
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
    const loginCategory = formData.get('loginCategory') as string || 'b2c';
    const businessEntityId = formData.get('businessEntityId') as string || null;
    const packageId = formData.get('packageId') as string || null;

    if (!name || !email || !role || !validityPeriod || !loginCategory || !packageId) {
      return { success: false, error: 'All required fields must be provided.' };
    }

    const emailExists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (emailExists) {
      return { success: false, error: 'Email address already registered.' };
    }

    const customUserId = (formData.get('customUserId') as string || '').trim();
    const customPassword = (formData.get('customPassword') as string || '').trim();

    if (customUserId) {
      const idExists = db.prepare('SELECT id FROM users WHERE id = ?').get(customUserId);
      if (idExists) {
        return { success: false, error: `User ID "${customUserId}" is already in use. Please choose another.` };
      }
    }

    const userId = customUserId || ('U_' + generateSecureToken().substring(0, 10));
    const issuedAt = new Date().toISOString();

    let tempPassword = '';
    let passwordHash: string | null = null;
    let activationToken: string | null = null;
    let activationTokenExpiresAt: string | null = null;
    let accountStatus = 'pending_activation';
    let mustReset = 1;

    if (customPassword) {
      tempPassword = customPassword;
      passwordHash = bcrypt.hashSync(customPassword, 12);
      accountStatus = 'active';
      mustReset = 0; // Direct admin-assigned password allows immediate login
    } else if (deliveryMethod === 'password') {
      // Option 1: temp password
      // Generate a structured temp password: Temp@ + 8 random hex chars
      tempPassword = 'Temp@' + generateSecureToken().substring(0, 8);
      passwordHash = bcrypt.hashSync(tempPassword, 12);
      accountStatus = 'active'; // ready to login directly, but mustResetPassword remains true
      mustReset = 1;
    } else {
      // Option 2: activation link token
      activationToken = generateSecureToken();
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 72); // 72 hours
      activationTokenExpiresAt = expiry.toISOString();
      mustReset = 1;
    }

    db.prepare(`
      INSERT INTO users (
        id, name, email, role, passwordHash, mustResetPassword, createdByAdminId,
        activationToken, activationTokenExpiresAt, accountStatus, validityPeriod, credentialIssuedAt,
        loginCategory, businessEntityId, packageId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, name, email, role, passwordHash, mustReset, adminId,
      activationToken, activationTokenExpiresAt, accountStatus, validityPeriod, issuedAt,
      loginCategory, businessEntityId, packageId
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

export async function createBusinessEntityAction(adminToken: string | undefined, formData: FormData) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const contactEmail = formData.get('contactEmail') as string;
    const contactPhone = formData.get('contactPhone') as string;
    const address = formData.get('address') as string;
    const maxUsers = parseInt(formData.get('maxUsers') as string) || 50;

    if (!name || !type) {
      return { success: false, error: 'Name and Type are required.' };
    }

    const entityId = 'ENT_' + generateSecureToken().substring(0, 10);
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO business_entities (
        id, name, type, contactEmail, contactPhone, address, maxUsers, isActive, createdAt, createdByAdminId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(entityId, name, type, contactEmail, contactPhone, address, maxUsers, createdAt, adminId);

    logAudit('ENTITY_CREATED', adminId, entityId, null, { name, type, maxUsers });

    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleEntityStatusAction(adminToken: string | undefined, entityId: string) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const entity = db.prepare('SELECT isActive FROM business_entities WHERE id = ?').get(entityId) as any;
    if (!entity) return { success: false, error: 'Entity not found.' };

    const newStatus = entity.isActive ? 0 : 1;
    db.prepare('UPDATE business_entities SET isActive = ? WHERE id = ?').run(newStatus, entityId);

    logAudit('ENTITY_STATUS_TOGGLED', adminId, entityId, { isActive: entity.isActive }, { isActive: newStatus });

    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createPackageAction(adminToken: string | undefined, formData: FormData) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const loginCategory = formData.get('loginCategory') as string;
    const allowedModulesStr = formData.get('allowedModules') as string;
    const durationDays = parseInt(formData.get('durationDays') as string) || 365;

    if (!name || !loginCategory || !allowedModulesStr) {
      return { success: false, error: 'Name, Category, and Allowed Modules are required.' };
    }

    // Try parsing allowedModules as JSON to ensure it's valid
    let allowedModulesArray;
    try {
      allowedModulesArray = JSON.parse(allowedModulesStr);
    } catch (e) {
      return { success: false, error: 'Invalid Allowed Modules format.' };
    }

    const packageId = 'PKG_' + generateSecureToken().substring(0, 10);
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO packages (
        id, name, description, loginCategory, allowedModules, durationDays, isActive, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `).run(packageId, name, description, loginCategory, allowedModulesStr, durationDays, createdAt);

    logAudit('PACKAGE_CREATED', adminId, packageId, null, { name, loginCategory, allowedModules: allowedModulesStr });

    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function togglePackageStatusAction(adminToken: string | undefined, packageId: string) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const pkg = db.prepare('SELECT isActive FROM packages WHERE id = ?').get(packageId) as any;
    if (!pkg) return { success: false, error: 'Package not found.' };

    const newStatus = pkg.isActive ? 0 : 1;
    db.prepare('UPDATE packages SET isActive = ? WHERE id = ?').run(newStatus, packageId);

    logAudit('PACKAGE_STATUS_TOGGLED', adminId, packageId, { isActive: pkg.isActive }, { isActive: newStatus });

    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── SUPER-ADMIN LESSON & CURRICULUM STUDIO ACTIONS ───────────────────────────

export async function saveLessonFullContentAction(adminToken: string | undefined, data: {
  lessonId: string;
  title: string;
  subtitle?: string;
  duration?: string;
  level?: string;
  summary?: string;
  contentMarkdown?: string;
  keyTakeawaysJson?: string;
  youtubeId?: string;
  pdfPath?: string;
  galleryImagesJson?: string;
  simulatorJson?: string;
  quizJson?: string;
  stepsJson?: string;
}) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const {
      lessonId,
      title,
      subtitle = '',
      duration = '',
      level = '',
      summary = '',
      contentMarkdown = '',
      keyTakeawaysJson = '[]',
      youtubeId = '',
      pdfPath = '',
      galleryImagesJson = '[]',
      simulatorJson = '{}',
      quizJson = '[]',
      stepsJson = '[]',
    } = data;

    if (!lessonId || !title) {
      return { success: false, error: 'Lesson ID and Title are required.' };
    }

    // Schema validation for simulator config
    if (simulatorJson && simulatorJson.trim() !== '') {
      try {
        const parsedSim = JSON.parse(simulatorJson);
        if (typeof parsedSim !== 'object' || Array.isArray(parsedSim) || parsedSim === null) {
          return { success: false, error: 'Simulator configuration must be a valid JSON object.' };
        }
      } catch {
        return { success: false, error: 'Invalid JSON format in financial simulator configuration.' };
      }
    }

    // Schema validation for quiz questions
    if (quizJson && quizJson.trim() !== '') {
      try {
        const parsedQuiz = JSON.parse(quizJson);
        if (!Array.isArray(parsedQuiz)) {
          return { success: false, error: 'Quiz configuration must be a valid JSON array.' };
        }
      } catch {
        return { success: false, error: 'Invalid JSON format in quiz configuration.' };
      }
    }

    // Schema validation for key takeaways
    if (keyTakeawaysJson && keyTakeawaysJson.trim() !== '') {
      try {
        const parsedTakeaways = JSON.parse(keyTakeawaysJson);
        if (!Array.isArray(parsedTakeaways)) {
          return { success: false, error: 'Key takeaways must be a valid JSON array.' };
        }
      } catch {
        return { success: false, error: 'Invalid JSON format in key takeaways.' };
      }
    }

    // Schema validation for gallery images
    let parsedGalleryImages: string[] = [];
    if (galleryImagesJson && galleryImagesJson.trim() !== '') {
      try {
        const parsed = JSON.parse(galleryImagesJson);
        if (Array.isArray(parsed)) {
          parsedGalleryImages = parsed;
        }
      } catch {
        // ignore format error
      }
    }

    // Schema validation for lesson steps / sections
    let parsedSteps: any[] = [];
    if (stepsJson && stepsJson.trim() !== '') {
      try {
        const parsed = JSON.parse(stepsJson);
        if (Array.isArray(parsed)) {
          parsedSteps = parsed;
        }
      } catch {
        // ignore format error
      }
    }

    const updatedAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO lesson_overrides (
        lessonId, title, subtitle, duration, level, summary, contentMarkdown,
        keyTakeawaysJson, youtubeId, pdfPath, simulatorJson, quizJson, galleryImagesJson, stepsJson, updatedAt, updatedByAdminId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(lessonId) DO UPDATE SET
        title = excluded.title,
        subtitle = excluded.subtitle,
        duration = excluded.duration,
        level = excluded.level,
        summary = excluded.summary,
        contentMarkdown = excluded.contentMarkdown,
        keyTakeawaysJson = excluded.keyTakeawaysJson,
        youtubeId = excluded.youtubeId,
        pdfPath = excluded.pdfPath,
        simulatorJson = excluded.simulatorJson,
        quizJson = excluded.quizJson,
        galleryImagesJson = excluded.galleryImagesJson,
        stepsJson = excluded.stepsJson,
        updatedAt = excluded.updatedAt,
        updatedByAdminId = excluded.updatedByAdminId
    `).run(
      lessonId,
      title,
      subtitle,
      duration,
      level,
      summary,
      contentMarkdown,
      keyTakeawaysJson,
      youtubeId,
      pdfPath,
      simulatorJson,
      quizJson,
      galleryImagesJson,
      stepsJson,
      updatedAt,
      adminId
    );

    // Also persist to static lesson json if exists
    try {
      const lessonsDir = path.resolve(process.cwd(), 'Lessons', 'content');
      const cleanLessonId = path.basename(lessonId);
      const filePath = path.resolve(lessonsDir, `${cleanLessonId}.json`);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lessonData = JSON.parse(fileContent);
        lessonData.title = title;
        if (subtitle) lessonData.subtitle = subtitle;
        if (duration) lessonData.duration = duration;
        if (summary) lessonData.summary = summary;
        if (youtubeId !== undefined) lessonData.youtubeId = youtubeId || null;
        if (pdfPath !== undefined) lessonData.pdfPath = pdfPath || null;
        if (parsedGalleryImages.length > 0) lessonData.galleryImages = parsedGalleryImages;
        if (parsedSteps.length > 0) lessonData.steps = parsedSteps;
        try {
          fs.writeFileSync(filePath, JSON.stringify(lessonData, null, 2), 'utf8');
        } catch (e: any) {
          console.warn('Failed to save lesson full content:', e.message);
        }
      }
    } catch (e: any) {
      console.warn('Failed to process static lesson file:', e.message);
    }

    logAudit('LESSON_MODIFIED', adminId, lessonId, null, { title, updatedAt });

    revalidatePath('/lessons');
    revalidatePath(`/lesson-player/${lessonId}`);
    revalidatePath('/admin/credentials');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getLessonFullOverrideAction(lessonId: string) {
  try {
    const row = db.prepare('SELECT * FROM lesson_overrides WHERE lessonId = ?').get(lessonId) as any;
    return { success: true, override: row || null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── SUPER-ADMIN COMMUNITY MODERATION ACTIONS ─────────────────────────────────

export async function adminUpdateCommunityArticleAction(adminToken: string | undefined, data: {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName?: string;
  tags?: string;
  isFeatured?: boolean;
}) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const { id, title, content, category, authorName = 'FinGenIQ Research', tags = '[]', isFeatured = false } = data;

    const updatedAt = new Date().toISOString();
    const excerpt = content.slice(0, 160).replace(/[#*`_]/g, '') + '...';

    db.prepare(`
      UPDATE community_articles SET
        title = ?,
        content = ?,
        excerpt = ?,
        category = ?,
        authorName = ?,
        tags = ?,
        isFeatured = ?,
        updatedAt = ?
      WHERE id = ?
    `).run(title, content, excerpt, category, authorName, tags, isFeatured ? 1 : 0, updatedAt, id);

    logAudit('COMMUNITY_ARTICLE_EDITED', adminId, id, null, { title, category });

    revalidatePath('/community');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminDeleteCommunityArticleAction(adminToken: string | undefined, articleId: string) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    
    // Delete associated comments first
    db.prepare('DELETE FROM community_comments WHERE article_id = ?').run(articleId);
    db.prepare('DELETE FROM community_articles WHERE id = ?').run(articleId);

    logAudit('COMMUNITY_ARTICLE_DELETED', adminId, articleId, null, null);

    revalidatePath('/community');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminDeleteCommentAction(adminToken: string | undefined, commentId: string) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    
    db.prepare('DELETE FROM community_comments WHERE id = ?').run(commentId);

    logAudit('COMMUNITY_COMMENT_DELETED', adminId, commentId, null, null);

    revalidatePath('/community');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── BULK CSV USER PROVISIONING ACTION (TRANSACTION SAFE) ─────────────────────

export interface BulkUserRow {
  name: string;
  email: string;
  role?: string;
  validityPeriod?: 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
  deliveryMethod?: 'link' | 'password' | 'both';
  loginCategory?: string;
  businessEntityId?: string | null;
  packageId?: string | null;
}

export async function bulkCreateCredentialsAction(
  adminToken: string | undefined,
  users: BulkUserRow[]
) {
  try {
    const adminId = await checkAdminAuth(adminToken);

    if (!Array.isArray(users) || users.length === 0) {
      return { success: false, error: 'No user records provided.' };
    }

    if (users.length > 500) {
      return { success: false, error: 'Maximum batch size is 500 records per import.' };
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const VALID_ROLES = ['learner', 'employee', 'employer', 'admin', 'community_member'];
    const VALID_PERIODS = ['monthly', 'quarterly', 'half_yearly', 'annual'];
    const VALID_CATEGORIES = ['b2c', 'b2b', 'b2b2c', 'community'];

    const results: Array<{
      email: string;
      name: string;
      status: 'created' | 'skipped' | 'error';
      reason?: string;
      userId?: string;
      deliveryMethod?: string;
      hasActivationLink?: boolean;
    }> = [];

    const existingEmails = new Set(
      (db.prepare('SELECT email FROM users').all() as Array<{ email: string }>).map(u => u.email.toLowerCase())
    );

    const batchEmailsSeen = new Set<string>();

    const insertUserStmt = db.prepare(`
      INSERT INTO users (
        id, name, email, role, passwordHash, mustResetPassword, createdByAdminId,
        activationToken, activationTokenExpiresAt, accountStatus, validityPeriod, credentialIssuedAt,
        loginCategory, businessEntityId, packageId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Execute in a single safe transaction
    const processBatch = db.transaction((rows: BulkUserRow[]) => {
      for (const row of rows) {
        const name = (row.name || '').trim();
        const email = (row.email || '').trim().toLowerCase();
        const role = (row.role || 'learner').toLowerCase();
        const validityPeriod = (row.validityPeriod || 'annual') as 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
        const deliveryMethod = row.deliveryMethod || 'link';
        const loginCategory = row.loginCategory || 'b2c';
        const businessEntityId = row.businessEntityId || null;
        const packageId = row.packageId || (loginCategory === 'b2b' ? 'PKG_B2B_ENTERPRISE' : 'PKG_B2C_PRO');

        // Validation
        if (!name) {
          results.push({ email: email || 'unknown', name: 'Unknown', status: 'error', reason: 'Missing name' });
          continue;
        }
        if (!email || !EMAIL_REGEX.test(email)) {
          results.push({ email, name, status: 'error', reason: 'Invalid email address format' });
          continue;
        }
        if (existingEmails.has(email) || batchEmailsSeen.has(email)) {
          results.push({ email, name, status: 'skipped', reason: 'Email already registered' });
          continue;
        }
        if (!VALID_ROLES.includes(role)) {
          results.push({ email, name, status: 'error', reason: `Invalid role: ${role}` });
          continue;
        }
        if (!VALID_PERIODS.includes(validityPeriod)) {
          results.push({ email, name, status: 'error', reason: `Invalid validity period: ${validityPeriod}` });
          continue;
        }
        if (!VALID_CATEGORIES.includes(loginCategory)) {
          results.push({ email, name, status: 'error', reason: `Invalid login category: ${loginCategory}` });
          continue;
        }

        batchEmailsSeen.add(email);

        const userId = 'U_' + generateSecureToken().substring(0, 10);
        const issuedAt = new Date().toISOString();

        let passwordHash: string | null = null;
        let activationToken: string | null = null;
        let activationTokenExpiresAt: string | null = null;
        let accountStatus = 'pending_activation';

        if (deliveryMethod === 'password') {
          const tempPassword = 'Temp@' + generateSecureToken().substring(0, 8);
          passwordHash = bcrypt.hashSync(tempPassword, 12);
          accountStatus = 'active';
        } else {
          activationToken = generateSecureToken();
          const expiry = new Date();
          expiry.setHours(expiry.getHours() + 72);
          activationTokenExpiresAt = expiry.toISOString();
        }

        insertUserStmt.run(
          userId, name, email, role, passwordHash, 1, adminId,
          activationToken, activationTokenExpiresAt, accountStatus, validityPeriod, issuedAt,
          loginCategory, businessEntityId, packageId
        );

        results.push({
          email,
          name,
          status: 'created',
          userId,
          deliveryMethod,
          hasActivationLink: !!activationToken,
        });
      }
    });

    processBatch(users);

    const createdCount = results.filter(r => r.status === 'created').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    // Sanitized audit log entry (no plaintext credentials logged)
    logAudit('BULK_CREDENTIALS_PROVISIONED', adminId, null, null, {
      totalSubmitted: users.length,
      createdCount,
      skippedCount,
      errorCount,
    });

    revalidatePath('/admin/credentials');

    return {
      success: true,
      summary: { total: users.length, created: createdCount, skipped: skippedCount, errors: errorCount },
      results,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── BATCH CREDENTIAL RENEWAL ACTION ──────────────────────────────────────────

export async function batchRenewCredentialsAction(
  adminToken: string | undefined,
  userIds: string[],
  newPeriod: 'monthly' | 'quarterly' | 'half_yearly' | 'annual'
) {
  try {
    const adminId = await checkAdminAuth(adminToken);

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return { success: false, error: 'No user IDs specified for renewal.' };
    }

    const now = new Date();
    const renewalStmt = db.prepare(`
      INSERT INTO renewal_history (id, userId, renewedAt, renewedByAdminId, previousExpiresAt, newExpiresAt, period)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const updateUserStmt = db.prepare(`
      UPDATE users 
      SET credentialExpiresAt = ?, validityPeriod = ?, accountStatus = 'active'
      WHERE id = ?
    `);

    let renewedCount = 0;

    const renewBatch = db.transaction((ids: string[]) => {
      for (const uid of ids) {
        const user = db.prepare('SELECT credentialExpiresAt, validityPeriod, accountStatus FROM users WHERE id = ?').get(uid) as any;
        if (!user) continue;

        let baseDate = now;
        const prevExpires = user.credentialExpiresAt;
        if (prevExpires && new Date(prevExpires).getTime() > now.getTime()) {
          baseDate = new Date(prevExpires);
        }

        const newExpiresAt = calculateExpirationDate(newPeriod, baseDate).toISOString();
        const renewalId = 'REN_' + generateSecureToken().substring(0, 10);

        updateUserStmt.run(newExpiresAt, newPeriod, uid);
        renewalStmt.run(renewalId, uid, now.toISOString(), adminId, prevExpires, newExpiresAt, newPeriod);
        renewedCount++;
      }
    });

    renewBatch(userIds);

    logAudit('BATCH_CREDENTIALS_RENEWED', adminId, null, null, {
      count: renewedCount,
      period: newPeriod,
    });

    revalidatePath('/admin/credentials');
    return { success: true, renewedCount };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── AARKAA AI KNOWLEDGE BASE & GOVERNANCE ACTIONS ───────────────────────────

export async function saveAiKnowledgeDocAction(
  adminToken: string | undefined,
  data: {
    id?: string;
    title: string;
    category: string;
    content: string;
    isActive?: boolean;
  }
) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const { id, title, category, content, isActive = true } = data;

    if (!title || !category || !content) {
      return { success: false, error: 'Title, category, and content are required.' };
    }

    const now = new Date().toISOString();
    const docId = id || 'KNOW_' + generateSecureToken().substring(0, 8).toUpperCase();

    const existing = db.prepare('SELECT version FROM ai_knowledge_docs WHERE id = ?').get(docId) as any;
    const nextVersion = existing ? (existing.version || 1) + 1 : 1;

    db.prepare(`
      INSERT INTO ai_knowledge_docs (id, title, category, content, version, isActive, createdAt, updatedAt, createdByAdminId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        category = excluded.category,
        content = excluded.content,
        version = excluded.version,
        isActive = excluded.isActive,
        updatedAt = excluded.updatedAt
    `).run(docId, title.trim(), category.trim(), content.trim(), nextVersion, isActive ? 1 : 0, now, now, adminId);

    logAudit('AI_KNOWLEDGE_DOC_SAVED', adminId, docId, null, { title, category, version: nextVersion });

    revalidatePath('/admin/credentials');
    return { success: true, docId, version: nextVersion };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleAiKnowledgeDocAction(adminToken: string | undefined, docId: string) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const doc = db.prepare('SELECT isActive FROM ai_knowledge_docs WHERE id = ?').get(docId) as any;
    if (!doc) return { success: false, error: 'Document not found.' };

    const newStatus = doc.isActive ? 0 : 1;
    db.prepare('UPDATE ai_knowledge_docs SET isActive = ?, updatedAt = ? WHERE id = ?').run(newStatus, new Date().toISOString(), docId);

    logAudit('AI_KNOWLEDGE_DOC_STATUS_TOGGLED', adminId, docId, { isActive: doc.isActive }, { isActive: newStatus });
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteAiKnowledgeDocAction(adminToken: string | undefined, docId: string) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    db.prepare('DELETE FROM ai_knowledge_docs WHERE id = ?').run(docId);
    logAudit('AI_KNOWLEDGE_DOC_DELETED', adminId, docId, null, null);
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAiSettingAction(
  adminToken: string | undefined,
  key: string,
  value: string
) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    if (!key) return { success: false, error: 'Setting key is required.' };

    const now = new Date().toISOString();
    const settingId = 'SET_' + key.toUpperCase();

    db.prepare(`
      INSERT INTO ai_settings (id, settingKey, settingValue, updatedAt, updatedByAdminId)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(settingKey) DO UPDATE SET
        settingValue = excluded.settingValue,
        updatedAt = excluded.updatedAt,
        updatedByAdminId = excluded.updatedByAdminId
    `).run(settingId, key, value, now, adminId);

    logAudit('AI_SETTING_UPDATED', adminId, key, null, { value });
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── LEARNER PROGRESS MANAGEMENT ACTION ───────────────────────────────────────

export async function adminResetUserProgressAction(
  adminToken: string | undefined,
  userId: string,
  lessonId?: string
) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(userId) as any;
    if (!user) return { success: false, error: 'User not found.' };

    if (lessonId) {
      db.prepare('DELETE FROM user_progress WHERE userId = ? AND lessonId = ?').run(userId, lessonId);
      logAudit('STUDENT_PROGRESS_RESET', adminId, userId, null, { lessonId, userEmail: user.email });
    } else {
      db.prepare('DELETE FROM user_progress WHERE userId = ?').run(userId);
      db.prepare('DELETE FROM user_certifications WHERE userId = ?').run(userId);
      logAudit('STUDENT_ALL_PROGRESS_RESET', adminId, userId, null, { userEmail: user.email });
    }

    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── CHATBOT Q&A KNOWLEDGE MANAGEMENT ACTIONS ────────────────────────────────

export async function saveChatbotQAAction(
  adminToken: string | undefined,
  data: {
    id?: number;
    question: string;
    answer: string;
    category?: string;
    tags?: string;
    displayOrder?: number;
  }
) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const { id, question, answer, category = 'General', tags = '[]', displayOrder = 0 } = data;

    if (!question || !answer) {
      return { success: false, error: 'Question and answer are required.' };
    }

    const now = new Date().toISOString();

    if (id) {
      db.prepare(`
        UPDATE chatbot_qa SET
          question = ?, answer = ?, category = ?, tags = ?, displayOrder = ?, updatedAt = ?
        WHERE id = ?
      `).run(question.trim(), answer.trim(), category.trim(), tags, displayOrder, now, id);
      logAudit('CHATBOT_QA_UPDATED', adminId, String(id), null, { question });
      revalidatePath('/admin/credentials');
      return { success: true, id };
    } else {
      const res = db.prepare(`
        INSERT INTO chatbot_qa (question, answer, category, tags, displayOrder, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(question.trim(), answer.trim(), category.trim(), tags, displayOrder, now);
      logAudit('CHATBOT_QA_CREATED', adminId, String(res.lastInsertRowid), null, { question });
      revalidatePath('/admin/credentials');
      return { success: true, id: Number(res.lastInsertRowid) };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteChatbotQAAction(adminToken: string | undefined, id: number) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    db.prepare('DELETE FROM chatbot_qa WHERE id = ?').run(id);
    logAudit('CHATBOT_QA_DELETED', adminId, String(id), null, null);
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function bulkSaveChatbotQAsAction(
  adminToken: string | undefined,
  qas: Array<{
    id?: number;
    question: string;
    answer: string;
    category?: string;
    tags?: string;
    displayOrder?: number;
  }>
) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO chatbot_qa (question, answer, category, tags, displayOrder, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const updateStmt = db.prepare(`
      UPDATE chatbot_qa SET
        question = ?, answer = ?, category = ?, tags = ?, displayOrder = ?, updatedAt = ?
      WHERE id = ?
    `);

    const runTx = db.transaction((items: typeof qas) => {
      for (const item of items) {
        if (!item.question || !item.answer) continue;
        if (item.id) {
          updateStmt.run(item.question.trim(), item.answer.trim(), item.category || 'General', item.tags || '[]', item.displayOrder || 0, now, item.id);
        } else {
          insertStmt.run(item.question.trim(), item.answer.trim(), item.category || 'General', item.tags || '[]', item.displayOrder || 0, now);
        }
      }
    });

    runTx(qas);

    logAudit('CHATBOT_QA_BULK_UPDATED', adminId, null, null, { count: qas.length });
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function resetChatbotQAsAction(adminToken: string | undefined) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const { resetChatbotQAsToDefaults } = await import('@/lib/db');
    resetChatbotQAsToDefaults();
    logAudit('CHATBOT_QA_RESET_DEFAULTS', adminId, null, null, { count: 30 });
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── USER MANAGEMENT ACTIONS ────────────────────────────────
export async function editUserAction(adminToken: string | undefined, data: { userId: string, newUserId?: string, name?: string, email?: string, role?: string, loginCategory?: string, packageId?: string, businessEntityId?: string, newPassword?: string }) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    if (!data.userId) return { success: false, error: 'User ID is required.' };
    
    // Check if new user ID is requested and available
    if (data.newUserId && data.newUserId !== data.userId) {
      const idExists = db.prepare('SELECT id FROM users WHERE id = ?').get(data.newUserId);
      if (idExists) return { success: false, error: `User ID "${data.newUserId}" is already in use.` };

      // Update foreign key references in a transaction
      db.transaction(() => {
        db.prepare('UPDATE sessions SET userId = ? WHERE userId = ?').run(data.newUserId, data.userId);
        db.prepare('UPDATE renewal_history SET userId = ? WHERE userId = ?').run(data.newUserId, data.userId);
        db.prepare('UPDATE user_progress SET userId = ? WHERE userId = ?').run(data.newUserId, data.userId);
        db.prepare('UPDATE user_certifications SET userId = ? WHERE userId = ?').run(data.newUserId, data.userId);
        db.prepare('UPDATE community_articles SET author_id = ? WHERE author_id = ?').run(data.newUserId, data.userId);
        db.prepare('UPDATE community_comments SET user_id = ? WHERE user_id = ?').run(data.newUserId, data.userId);
        db.prepare('UPDATE users SET id = ? WHERE id = ?').run(data.newUserId, data.userId);
      })();
      data.userId = data.newUserId;
    }

    if (data.email) {
      const emailExists = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(data.email, data.userId);
      if (emailExists) {
        return { success: false, error: 'Email address already registered to another user.' };
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
    if (data.email !== undefined) { updates.push('email = ?'); values.push(data.email); }
    if (data.role !== undefined) { updates.push('role = ?'); values.push(data.role); }
    if (data.loginCategory !== undefined) { updates.push('loginCategory = ?'); values.push(data.loginCategory); }
    if (data.packageId !== undefined) { updates.push('packageId = ?'); values.push(data.packageId); }
    if (data.businessEntityId !== undefined) { updates.push('businessEntityId = ?'); values.push(data.businessEntityId); }
    if (data.newPassword) {
      const passwordHash = bcrypt.hashSync(data.newPassword, 12);
      updates.push('passwordHash = ?, mustResetPassword = 0');
      values.push(passwordHash);
    }

    if (updates.length > 0) {
      values.push(data.userId);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      logAudit('edit_user', adminId, data.userId, null, { updates: data });
      revalidatePath('/admin/credentials');
    }

    return { success: true, newUserId: data.userId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createNewLessonAction(adminToken: string | undefined, data: { lessonId: string; moduleId: string; title: string; duration?: string; level?: string; summary?: string }) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    if (!data.lessonId || !data.moduleId || !data.title) {
      return { success: false, error: 'Lesson ID, Module ID, and Title are required.' };
    }

    const id = data.lessonId.trim();
    const existing = db.prepare('SELECT lessonId FROM lesson_overrides WHERE lessonId = ?').get(id);
    if (existing) {
      return { success: false, error: `Lesson with ID "${id}" already exists.` };
    }

    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO lesson_overrides (
        lessonId, moduleId, title, duration, level, summary, updatedAt, updatedByAdminId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.moduleId,
      data.title,
      data.duration || '45 min',
      data.level || 'Foundational',
      data.summary || '',
      now,
      adminId
    );

    logAudit('CREATE_LESSON', adminId, id, null, data);
    revalidatePath('/admin/credentials');
    revalidatePath('/lessons');
    return { success: true, lessonId: id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteLessonAction(adminToken: string | undefined, lessonId: string) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    if (!lessonId) return { success: false, error: 'Lesson ID is required.' };

    db.prepare('DELETE FROM lesson_overrides WHERE lessonId = ?').run(lessonId);
    logAudit('DELETE_LESSON', adminId, lessonId, null, null);
    revalidatePath('/admin/credentials');
    revalidatePath('/lessons');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteUserAction(adminToken: string | undefined, userId: string) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    if (!userId) return { success: false, error: 'User ID is required.' };

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!user) return { success: false, error: 'User not found.' };

    // Delete user
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    
    logAudit('delete_user', adminId, userId, null, null);
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function changeUserPasswordAction(adminToken: string | undefined, userId: string, newPassword: string) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    if (!userId || !newPassword) return { success: false, error: 'User ID and new password are required.' };

    const passwordHash = bcrypt.hashSync(newPassword, 12);
    db.prepare('UPDATE users SET passwordHash = ?, mustResetPassword = 0 WHERE id = ?').run(passwordHash, userId);
    
    logAudit('change_password', adminId, userId, null, null);
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── ENTITY & PACKAGE MANAGEMENT ACTIONS ────────────────────────────────
export async function editEntityAction(adminToken: string | undefined, data: { entityId?: string, id?: string, name?: string, contactEmail?: string, contactPhone?: string, address?: string, maxUsers?: number }) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    const targetId = data.entityId || data.id;
    if (!targetId) return { success: false, error: 'Entity ID is required.' };

    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
    if (data.contactEmail !== undefined) { updates.push('contactEmail = ?'); values.push(data.contactEmail); }
    if (data.contactPhone !== undefined) { updates.push('contactPhone = ?'); values.push(data.contactPhone); }
    if (data.address !== undefined) { updates.push('address = ?'); values.push(data.address); }
    if (data.maxUsers !== undefined) { updates.push('maxUsers = ?'); values.push(data.maxUsers); }

    if (updates.length > 0) {
      values.push(targetId);
      db.prepare(`UPDATE business_entities SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      logAudit('edit_entity', adminId, targetId, null, { updates: data });
      revalidatePath('/admin/credentials');
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteEntityAction(adminToken: string | undefined, entityId: string) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    if (!entityId) return { success: false, error: 'Entity ID is required.' };

    const result = db.prepare('SELECT COUNT(*) as count FROM users WHERE businessEntityId = ?').get(entityId) as any;
    if (result && result.count > 0) {
      return { success: false, error: 'Cannot delete entity with linked users. Remove or reassign users first.' };
    }

    db.prepare('DELETE FROM business_entities WHERE id = ?').run(entityId);
    
    logAudit('delete_entity', adminId, entityId, null, null);
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deletePackageAction(adminToken: string | undefined, packageId: string) {
  try {
    const adminId = await checkAdminAuth(adminToken);
    if (!packageId) return { success: false, error: 'Package ID is required.' };

    const result = db.prepare('SELECT COUNT(*) as count FROM users WHERE packageId = ?').get(packageId) as any;
    if (result && result.count > 0) {
      return { success: false, error: 'Cannot delete package with linked users.' };
    }

    db.prepare('DELETE FROM packages WHERE id = ?').run(packageId);
    
    logAudit('delete_package', adminId, packageId, null, null);
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── INSTITUTIONAL ACADEMIC GOVERNANCE ACTIONS (SUPER-ADMIN AUTH REQUIRED) ───────

async function checkSuperAdminAuth(tokenOverride?: string): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value || tokenOverride;
  if (!token) throw new Error('Unauthenticated: No session token found in secure cookies.');

  const now = new Date().toISOString();
  const session = db.prepare('SELECT userId FROM sessions WHERE id = ? AND expiresAt > ?').get(token, now) as any;
  if (!session) throw new Error('Session is invalid or has expired. Please sign in again.');

  const user = db.prepare('SELECT role, accountStatus FROM users WHERE id = ?').get(session.userId) as any;
  if (!user || user.accountStatus !== 'active') throw new Error('Account inactive or disabled.');
  if (user.role !== 'admin') throw new Error('Access denied: Super Admin authorization is required for Academic Governance.');

  return session.userId;
}

// 1. ASSESSMENT QUESTION ACTIONS
export async function saveAssessmentQuestionAction(
  adminToken: string | undefined,
  data: {
    id?: number;
    moduleId: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty?: 'foundation' | 'intermediate' | 'advanced';
  }
) {
  try {
    const adminId = await checkSuperAdminAuth(adminToken);
    const { id, moduleId, question, options, correctIndex, explanation, difficulty = 'intermediate' } = data;

    if (!moduleId || !question?.trim() || !options || options.length < 2 || explanation === undefined) {
      return { success: false, error: 'Module ID, Question text, at least 2 options, and Explanation are required.' };
    }

    if (correctIndex < 0 || correctIndex >= options.length) {
      return { success: false, error: 'Correct answer index must correspond to one of the options.' };
    }

    const now = new Date().toISOString();
    const optionsJson = JSON.stringify(options);

    if (id) {
      db.prepare(`
        UPDATE assessment_questions SET
          moduleId = ?, question = ?, options = ?, correctIndex = ?, explanation = ?, difficulty = ?, updatedAt = ?
        WHERE id = ?
      `).run(moduleId.trim().toUpperCase(), question.trim(), optionsJson, correctIndex, explanation.trim(), difficulty, now, id);

      logAudit('ASSESSMENT_QUESTION_UPDATED', adminId, String(id), null, { moduleId, question });
      revalidatePath('/assessments');
      revalidatePath('/admin/credentials');
      return { success: true, id };
    } else {
      const res = db.prepare(`
        INSERT INTO assessment_questions (moduleId, question, options, correctIndex, explanation, difficulty, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(moduleId.trim().toUpperCase(), question.trim(), optionsJson, correctIndex, explanation.trim(), difficulty, now, now);

      logAudit('ASSESSMENT_QUESTION_CREATED', adminId, String(res.lastInsertRowid), null, { moduleId, question });
      revalidatePath('/assessments');
      revalidatePath('/admin/credentials');
      return { success: true, id: Number(res.lastInsertRowid) };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteAssessmentQuestionAction(adminToken: string | undefined, id: number) {
  try {
    const adminId = await checkSuperAdminAuth(adminToken);
    if (!id) return { success: false, error: 'Question ID is required.' };

    db.prepare('DELETE FROM assessment_questions WHERE id = ?').run(id);
    logAudit('ASSESSMENT_QUESTION_DELETED', adminId, String(id), null, null);
    revalidatePath('/assessments');
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 2. ASSESSMENT PROCTORING SETTINGS ACTION
export async function saveAssessmentSettingsAction(
  adminToken: string | undefined,
  settings: {
    timeLimitSeconds: number;
    maxTabSwitches: number;
    passingScorePct: number;
    webcamRequired: boolean | number;
  }
) {
  try {
    const adminId = await checkSuperAdminAuth(adminToken);
    const timeLimit = Math.max(60, Number(settings.timeLimitSeconds) || 1200);
    const maxSwitches = Math.max(1, Number(settings.maxTabSwitches) || 3);
    const passingScore = Math.min(100, Math.max(10, Number(settings.passingScorePct) || 70));
    const webcam = settings.webcamRequired ? 1 : 0;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO assessment_settings (id, timeLimitSeconds, maxTabSwitches, passingScorePct, webcamRequired, updatedAt)
      VALUES ('default', ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        timeLimitSeconds = excluded.timeLimitSeconds,
        maxTabSwitches = excluded.maxTabSwitches,
        passingScorePct = excluded.passingScorePct,
        webcamRequired = excluded.webcamRequired,
        updatedAt = excluded.updatedAt
    `).run(timeLimit, maxSwitches, passingScore, webcam, now);

    logAudit('ASSESSMENT_SETTINGS_UPDATED', adminId, 'default', null, { timeLimit, maxSwitches, passingScore });
    revalidatePath('/assessments');
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 3. CAPSTONE TRACK ACTIONS
export async function saveCapstoneTrackAction(
  adminToken: string | undefined,
  track: {
    id: string;
    code: string;
    title: string;
    icon?: string;
    description: string;
    rubric?: string;
    tags?: string[];
    minPassingScore?: number;
    isActive?: boolean | number;
  }
) {
  try {
    const adminId = await checkSuperAdminAuth(adminToken);
    if (!track.id || !track.code || !track.title?.trim() || !track.description?.trim()) {
      return { success: false, error: 'Track ID, Code, Title, and Description are required.' };
    }

    const now = new Date().toISOString();
    const tagsJson = JSON.stringify(track.tags || []);
    const minPass = Number(track.minPassingScore) || 70;
    const active = track.isActive !== false && track.isActive !== 0 ? 1 : 0;

    db.prepare(`
      INSERT INTO capstone_tracks (id, code, title, icon, description, rubric, tags, minPassingScore, isActive, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        code = excluded.code,
        title = excluded.title,
        icon = excluded.icon,
        description = excluded.description,
        rubric = excluded.rubric,
        tags = excluded.tags,
        minPassingScore = excluded.minPassingScore,
        isActive = excluded.isActive,
        updatedAt = excluded.updatedAt
    `).run(
      track.id.trim().toLowerCase(),
      track.code.trim().toUpperCase(),
      track.title.trim(),
      track.icon || '📊',
      track.description.trim(),
      track.rubric || '',
      tagsJson,
      minPass,
      active,
      now
    );

    logAudit('CAPSTONE_TRACK_SAVED', adminId, track.id, null, { title: track.title, code: track.code });
    revalidatePath('/capstone');
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCapstoneTrackAction(adminToken: string | undefined, trackId: string) {
  try {
    const adminId = await checkSuperAdminAuth(adminToken);
    if (!trackId) return { success: false, error: 'Track ID is required.' };

    db.prepare('DELETE FROM capstone_tracks WHERE id = ?').run(trackId);
    logAudit('CAPSTONE_TRACK_DELETED', adminId, trackId, null, null);
    revalidatePath('/capstone');
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 4. CERTIFICATION & CREDENTIAL TIER ACTIONS
export async function saveCertificationSettingsAction(
  adminToken: string | undefined,
  data: {
    distinctionMinScore: number;
    proficiencyMinScore: number;
    completionMinScore: number;
    weights?: Record<string, number>;
    minimumRequirements?: Record<string, any>;
  }
) {
  try {
    const adminId = await checkSuperAdminAuth(adminToken);
    const dist = Math.min(100, Math.max(50, Number(data.distinctionMinScore) || 85));
    const prof = Math.min(dist - 1, Math.max(40, Number(data.proficiencyMinScore) || 75));
    const comp = Math.min(prof - 1, Math.max(20, Number(data.completionMinScore) || 60));

    const weightsJson = JSON.stringify(data.weights || {
      knowledgeChecks: 10,
      assignments: 20,
      quizzes: 30,
      moduleAssessments: 30,
      capstone: 10,
    });

    const minReqJson = JSON.stringify(data.minimumRequirements || {
      perModuleAssessment: 70,
      capstone: 70,
      allQuizzesAttempted: true,
      allAssignmentsSubmitted: true,
    });

    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO certification_settings (id, distinctionMinScore, proficiencyMinScore, completionMinScore, weightsJson, minimumRequirementsJson, updatedAt)
      VALUES ('global', ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        distinctionMinScore = excluded.distinctionMinScore,
        proficiencyMinScore = excluded.proficiencyMinScore,
        completionMinScore = excluded.completionMinScore,
        weightsJson = excluded.weightsJson,
        minimumRequirementsJson = excluded.minimumRequirementsJson,
        updatedAt = excluded.updatedAt
    `).run(dist, prof, comp, weightsJson, minReqJson, now);

    logAudit('CERTIFICATION_SETTINGS_SAVED', adminId, 'global', null, { dist, prof, comp });
    revalidatePath('/certification');
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveProfessionalTrackAction(
  adminToken: string | undefined,
  track: {
    id: string;
    name: string;
    icon?: string;
    description: string;
    requiredModules?: string[];
    requiredLessons?: string[];
    isActive?: boolean | number;
  }
) {
  try {
    const adminId = await checkSuperAdminAuth(adminToken);
    if (!track.id || !track.name?.trim() || !track.description?.trim()) {
      return { success: false, error: 'Track ID, Certificate Name, and Description are required.' };
    }

    const now = new Date().toISOString();
    const reqModulesJson = JSON.stringify(track.requiredModules || []);
    const reqLessonsJson = JSON.stringify(track.requiredLessons || []);
    const active = track.isActive !== false && track.isActive !== 0 ? 1 : 0;

    db.prepare(`
      INSERT INTO professional_tracks_config (id, name, icon, description, requiredModules, requiredLessons, isActive, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        icon = excluded.icon,
        description = excluded.description,
        requiredModules = excluded.requiredModules,
        requiredLessons = excluded.requiredLessons,
        isActive = excluded.isActive,
        updatedAt = excluded.updatedAt
    `).run(
      track.id.trim().toLowerCase(),
      track.name.trim(),
      track.icon || '📜',
      track.description.trim(),
      reqModulesJson,
      reqLessonsJson,
      active,
      now
    );

    logAudit('PROFESSIONAL_TRACK_SAVED', adminId, track.id, null, { name: track.name });
    revalidatePath('/certification');
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteProfessionalTrackAction(adminToken: string | undefined, trackId: string) {
  try {
    const adminId = await checkSuperAdminAuth(adminToken);
    if (!trackId) return { success: false, error: 'Track ID is required.' };

    db.prepare('DELETE FROM professional_tracks_config WHERE id = ?').run(trackId);
    logAudit('PROFESSIONAL_TRACK_DELETED', adminId, trackId, null, null);
    revalidatePath('/certification');
    revalidatePath('/admin/credentials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
