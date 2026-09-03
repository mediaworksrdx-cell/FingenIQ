import { cookies } from 'next/headers';
import { db } from './db';
import { LESSONS, MODULES, PROFESSIONAL_TRACKS } from './data';
import type { Lesson, LessonStatus, UserProgress, UserCertification, CredentialTier } from './types';

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  
  const session = db.prepare('SELECT userId, expiresAt FROM sessions WHERE id = ?').get(token) as { userId: string; expiresAt: string } | undefined;
  if (!session) return null;
  
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
    return null;
  }
  
  return session.userId;
}

// Fetch user progress from DB, seeding if empty
export async function getLessonProgress(userId: string): Promise<Record<string, { status: LessonStatus; score: number | null; currentStep: number }>> {
  // Check if progress exists
  const existing = db.prepare('SELECT COUNT(*) as count FROM user_progress WHERE userId = ?').get(userId) as { count: number };
  
  if (existing.count === 0) {
    // Keep database empty so all lessons default to 'not-started' for a fresh student experience
  }

  const rows = db.prepare('SELECT lessonId, status, currentStep, score FROM user_progress WHERE userId = ?').all(userId) as Array<{
    lessonId: string;
    status: string;
    currentStep: number;
    score: number | null;
  }>;

  const progressMap: Record<string, { status: LessonStatus; score: number | null; currentStep: number }> = {};
  
  // Initialize all lessons to not-started
  for (const l of LESSONS) {
    progressMap[l.id] = {
      status: 'not-started',
      score: null,
      currentStep: 0
    };
  }

  // Populate from DB
  for (const r of rows) {
    if (progressMap[r.lessonId]) {
      progressMap[r.lessonId] = {
        status: r.status as LessonStatus,
        score: r.score,
        currentStep: r.currentStep
      };
    }
  }

  // Determine completed modules
  const completedModules = new Set<string>();
  for (const m of MODULES) {
    const moduleLessons = LESSONS.filter(l => l.moduleId === m.id);
    const allCompleted = moduleLessons.every(l => progressMap[l.id]?.status === 'completed');
    if (allCompleted && moduleLessons.length > 0) {
      completedModules.add(m.id);
    }
  }

  // Enforce prerequisite gating (mark locked if prerequisites not met)
  for (const l of LESSONS) {
    const m = MODULES.find(mod => mod.id === l.moduleId);
    if (m && m.prerequisiteModuleIds.length > 0) {
      const prerequisitesMet = m.prerequisiteModuleIds.every(reqId => completedModules.has(reqId));
      if (!prerequisitesMet) {
        progressMap[l.id].status = 'locked';
      }
    }
  }

  return progressMap;
}

// Update step progress
export async function updateStepProgress(userId: string, lessonId: string, stepIndex: number): Promise<void> {
  const now = new Date().toISOString();
  
  const existing = db.prepare('SELECT status, score FROM user_progress WHERE userId = ? AND lessonId = ?').get(userId, lessonId) as { status: string; score: number | null } | undefined;
  
  if (!existing) {
    db.prepare(`
      INSERT INTO user_progress (userId, lessonId, status, currentStep, score, updatedAt)
      VALUES (?, ?, 'in-progress', ?, NULL, ?)
    `).run(userId, lessonId, stepIndex, now);
  } else {
    // Only update step if it's not already completed
    const newStatus = existing.status === 'completed' ? 'completed' : 'in-progress';
    db.prepare(`
      UPDATE user_progress 
      SET currentStep = ?, status = ?, updatedAt = ? 
      WHERE userId = ? AND lessonId = ?
    `).run(stepIndex, newStatus, now, userId, lessonId);
  }
}

// Submit quiz/lesson score
export async function submitLessonScore(userId: string, lessonId: string, score: number): Promise<void> {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO user_progress (userId, lessonId, status, currentStep, score, updatedAt)
    VALUES (?, ?, 'completed', 19, ?, ?)
    ON CONFLICT(userId, lessonId) DO UPDATE SET
      status = 'completed',
      currentStep = 19,
      score = ?,
      updatedAt = ?
  `).run(userId, lessonId, score, now, score, now);
}

// Aggregate overall statistics
export async function aggregateUserProgress(userId: string): Promise<UserProgress> {
  const progressMap = await getLessonProgress(userId);
  
  let lessonsCompleted = 0;
  let totalScoreSum = 0;
  let gradedLessonsCount = 0;

  for (const lid in progressMap) {
    const p = progressMap[lid];
    if (p.status === 'completed') {
      lessonsCompleted++;
      if (p.score !== null) {
        totalScoreSum += p.score;
        gradedLessonsCount++;
      }
    }
  }

  const averageQuizScore = gradedLessonsCount > 0 ? Math.round(totalScoreSum / gradedLessonsCount) : 0;

  const modulesProgress: Record<string, any> = {};
  let currentModule = 'M1';

  for (const m of MODULES) {
    const mLessons = LESSONS.filter(l => l.moduleId === m.id);
    const mCompleted = mLessons.filter(l => progressMap[l.id]?.status === 'completed').length;
    const pct = mLessons.length > 0 ? Math.round((mCompleted / mLessons.length) * 100) : 0;
    
    let status: 'not-started' | 'in-progress' | 'completed' = 'not-started';
    if (pct === 100) status = 'completed';
    else if (pct > 0 || mLessons.some(l => progressMap[l.id]?.status === 'in-progress')) status = 'in-progress';

    modulesProgress[m.id] = {
      status,
      lessonsCompleted: mCompleted,
      totalLessons: mLessons.length,
      pct
    };

    if (status === 'in-progress') {
      currentModule = m.id;
    }
  }

  return {
    lessonsCompleted,
    totalLessons: LESSONS.length,
    currentModule,
    knowledgeChecks: gradedLessonsCount > 0 ? averageQuizScore : 0,
    assignments: gradedLessonsCount > 0 ? averageQuizScore : 0,
    quizzes: gradedLessonsCount > 0 ? averageQuizScore : 0,
    moduleAssessments: 0,
    capstone: lessonsCompleted >= 35 ? 85 : null,
    modules: modulesProgress
  };
}

// Generate certification eligibility and details
export async function getUserCertification(userId: string): Promise<UserCertification> {
  const progress = await aggregateUserProgress(userId);
  
  // Calculate weighted score
  const w = {
    knowledgeChecks: 0.10,
    assignments: 0.20,
    quizzes: 0.30,
    moduleAssessments: 0.30,
    capstone: 0.10
  };

  const weights = w;
  const knowledgeChecks = progress.knowledgeChecks;
  const assignments = progress.assignments;
  const quizzes = progress.quizzes;
  const moduleAssessments = progress.moduleAssessments;
  const capstone = progress.capstone ?? 0;

  const weightedScore = Math.round(
    knowledgeChecks   * weights.knowledgeChecks   +
    assignments       * weights.assignments       +
    quizzes           * weights.quizzes           +
    moduleAssessments * weights.moduleAssessments +
    (progress.capstone ? capstone * weights.capstone : 0)
  );

  // Checks minimum requirements:
  // - Minimum average score
  // - Let's say needs at least 15 lessons completed for basic Completion
  const eligible = progress.lessonsCompleted >= 15;

  let tier: CredentialTier = null;
  if (eligible) {
    if (weightedScore >= 90 && progress.capstone && progress.capstone >= 85) {
      tier = 'Distinction';
    } else if (weightedScore >= 75) {
      tier = 'Proficiency';
    } else {
      tier = 'Completion';
    }
  }

  // Get completed professional tracks
  const progressMap = await getLessonProgress(userId);
  const eligibleTracks: string[] = [];

  for (const track of PROFESSIONAL_TRACKS) {
    const reqLessons = track.requiredLessons;
    const allCompleted = reqLessons.every(lid => progressMap[lid]?.status === 'completed');
    if (allCompleted) {
      eligibleTracks.push(track.name);
    }
  }

  return {
    eligible,
    tier,
    weightedScore: eligible ? weightedScore : null,
    professionalTracks: eligibleTracks
  };
}

// Generate digital certificate in DB
export async function generateCertificate(userId: string, trackId: string): Promise<string> {
  // Generate random hash for verification
  const crypto = require('crypto');
  const certificateHash = 'FQ-' + crypto.randomBytes(16).toString('hex').toUpperCase();
  const id = 'CERT-' + crypto.randomBytes(8).toString('hex').toUpperCase();
  const issuedAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO user_certifications (id, userId, trackId, issuedAt, certificateHash)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, userId, trackId, issuedAt, certificateHash);

  return certificateHash;
}

// Verify a certificate by hash
export function verifyCertificate(hash: string) {
  const cert = db.prepare(`
    SELECT c.id, c.trackId, c.issuedAt, c.certificateHash, u.name as userName
    FROM user_certifications c
    JOIN users u ON c.userId = u.id
    WHERE c.certificateHash = ?
  `).get(hash) as { id: string; trackId: string; issuedAt: string; certificateHash: string; userName: string } | undefined;

  return cert || null;
}

// Get all certificates issued to a user
export function getUserCertificates(userId: string) {
  return db.prepare(`
    SELECT id, trackId, issuedAt, certificateHash
    FROM user_certifications
    WHERE userId = ?
  `).all(userId) as Array<{ id: string; trackId: string; issuedAt: string; certificateHash: string }>;
}

// Get recent activity for a user
export async function getUserRecentActivity(userId: string) {
  const rows = db.prepare(`
    SELECT lessonId, status, currentStep, score, updatedAt
    FROM user_progress
    WHERE userId = ?
    ORDER BY updatedAt DESC
    LIMIT 6
  `).all(userId) as Array<{
    lessonId: string;
    status: string;
    currentStep: number;
    score: number | null;
    updatedAt: string;
  }>;

  return rows.map(r => {
    const lesson = LESSONS.find(l => l.id === r.lessonId);
    return {
      lessonId: r.lessonId,
      lessonTitle: lesson?.title || r.lessonId,
      lessonOrder: lesson?.order || 1,
      moduleId: lesson?.moduleId || 'M1',
      status: r.status,
      currentStep: r.currentStep,
      score: r.score,
      updatedAt: r.updatedAt
    };
  });
}
