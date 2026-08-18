import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const session = db.prepare('SELECT userId FROM sessions WHERE id = ? AND expiresAt > ?').get(token, new Date().toISOString()) as any;
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(session.userId) as any;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Fetch user counts & compute expirations
    const users = db.prepare('SELECT * FROM users').all() as any[];
    const now = Date.now();

    let total = users.length;
    let pending = 0;
    let active = 0;
    let locked = 0;
    let disabled = 0;
    let expiring = 0;
    let expired = 0;

    users.forEach(u => {
      if (u.accountStatus === 'pending_activation') pending++;
      else if (u.accountStatus === 'active') active++;
      else if (u.accountStatus === 'locked') locked++;
      else if (u.accountStatus === 'disabled') disabled++;
      else if (u.accountStatus === 'expired') expired++;

      if (u.credentialExpiresAt) {
        const diff = new Date(u.credentialExpiresAt).getTime() - now;
        const daysLeft = Math.ceil(diff / (24 * 60 * 60 * 1000));
        if (daysLeft <= 0) {
          // If expired but status not written yet, count as expired
          expired++;
        } else if (daysLeft <= 14) {
          expiring++;
        }
      }
    });

    // 2. Fetch all user_progress and user_certifications for Cohort Analytics & Gradebook
    const allProgress = db.prepare('SELECT userId, lessonId, status, score, updatedAt FROM user_progress').all() as Array<{
      userId: string;
      lessonId: string;
      status: string;
      score: number | null;
      updatedAt: string;
    }>;

    const allCerts = db.prepare('SELECT userId, trackId, issuedAt FROM user_certifications').all() as Array<{
      userId: string;
      trackId: string;
      issuedAt: string;
    }>;

    // Group progress by user
    const userProgressMap: Record<string, { completedCount: number; totalScore: number; gradedCount: number; lastActive: string; completedLessons: string[] }> = {};
    
    // Group progress by module (M1 to M8)
    const moduleStatsMap: Record<string, { completedCount: number; totalScore: number; gradedCount: number }> = {
      M1: { completedCount: 0, totalScore: 0, gradedCount: 0 },
      M2: { completedCount: 0, totalScore: 0, gradedCount: 0 },
      M3: { completedCount: 0, totalScore: 0, gradedCount: 0 },
      M4: { completedCount: 0, totalScore: 0, gradedCount: 0 },
      M5: { completedCount: 0, totalScore: 0, gradedCount: 0 },
      M6: { completedCount: 0, totalScore: 0, gradedCount: 0 },
      M7: { completedCount: 0, totalScore: 0, gradedCount: 0 },
      M8: { completedCount: 0, totalScore: 0, gradedCount: 0 },
    };

    allProgress.forEach(p => {
      if (!userProgressMap[p.userId]) {
        userProgressMap[p.userId] = { completedCount: 0, totalScore: 0, gradedCount: 0, lastActive: p.updatedAt, completedLessons: [] };
      }
      if (p.status === 'completed') {
        userProgressMap[p.userId].completedCount++;
        userProgressMap[p.userId].completedLessons.push(p.lessonId);
        if (p.score !== null && p.score !== undefined) {
          userProgressMap[p.userId].totalScore += p.score;
          userProgressMap[p.userId].gradedCount++;
        }
      }
      if (new Date(p.updatedAt).getTime() > new Date(userProgressMap[p.userId].lastActive).getTime()) {
        userProgressMap[p.userId].lastActive = p.updatedAt;
      }

      // Track module stats
      // Lesson IDs start with L1-L4 (M1), L5-L8 (M2), etc. or module prefixes
      const modPrefix = p.lessonId.startsWith('M') ? p.lessonId.substring(0, 2) : (
        parseInt(p.lessonId.replace('L', '')) <= 4 ? 'M1' :
        parseInt(p.lessonId.replace('L', '')) <= 8 ? 'M2' :
        parseInt(p.lessonId.replace('L', '')) <= 12 ? 'M3' :
        parseInt(p.lessonId.replace('L', '')) <= 16 ? 'M4' :
        parseInt(p.lessonId.replace('L', '')) <= 20 ? 'M5' :
        parseInt(p.lessonId.replace('L', '')) <= 24 ? 'M6' :
        parseInt(p.lessonId.replace('L', '')) <= 28 ? 'M7' : 'M8'
      );
      if (moduleStatsMap[modPrefix] && p.status === 'completed') {
        moduleStatsMap[modPrefix].completedCount++;
        if (p.score !== null && p.score !== undefined) {
          moduleStatsMap[modPrefix].totalScore += p.score;
          moduleStatsMap[modPrefix].gradedCount++;
        }
      }
    });

    let distinctionCount = 0;
    let meritCount = 0;
    let passCount = 0;
    let needsSupportCount = 0;
    let totalCohortScore = 0;
    let totalCohortGraded = 0;

    const certUserIds = new Set(allCerts.map(c => c.userId));

    // Augment users with calculated gradebook data
    const safeUsers = users.map(u => {
      const {
        passwordHash,
        activationToken,
        activationTokenExpiresAt,
        resetToken,
        resetTokenExpiresAt,
        ...rest
      } = u;

      const prog = userProgressMap[u.id] || { completedCount: 0, totalScore: 0, gradedCount: 0, lastActive: null, completedLessons: [] };
      const avgScore = prog.gradedCount > 0 ? Math.round(prog.totalScore / prog.gradedCount) : null;
      const completionPercent = Math.min(100, Math.round((prog.completedCount / 32) * 100)); // 32 lessons total
      const hasCertificate = certUserIds.has(u.id);

      let gradeTier = 'Not Graded';
      if (avgScore !== null) {
        totalCohortScore += avgScore;
        totalCohortGraded++;
        if (avgScore >= 85) {
          gradeTier = 'Distinction';
          distinctionCount++;
        } else if (avgScore >= 70) {
          gradeTier = 'Merit';
          meritCount++;
        } else if (avgScore >= 50) {
          gradeTier = 'Pass';
          passCount++;
        } else {
          gradeTier = 'Needs Support';
          needsSupportCount++;
        }
      }

      return {
        ...rest,
        completedLessonsCount: prog.completedCount,
        avgScore,
        completionPercent,
        hasCertificate,
        gradeTier,
        lastActiveAt: prog.lastActive,
      };
    });

    const cohortAvgScore = totalCohortGraded > 0 ? Math.round(totalCohortScore / totalCohortGraded) : 0;

    // 3. Fetch audit logs (most recent 40)
    const auditLogs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 40').all();

    const entities = db.prepare('SELECT * FROM business_entities ORDER BY createdAt DESC').all();
    const packages = db.prepare('SELECT * FROM packages ORDER BY createdAt DESC').all();

    // 4. Fetch community articles & comments for moderation
    const articles = db.prepare('SELECT * FROM community_articles ORDER BY created_at DESC').all();
    const comments = db.prepare(`
      SELECT c.*, a.title as articleTitle 
      FROM community_comments c
      LEFT JOIN community_articles a ON c.article_id = a.id
      ORDER BY c.created_at DESC LIMIT 50
    `).all();

    // 5. Fetch lesson overrides
    const lessonOverrides = db.prepare('SELECT * FROM lesson_overrides').all();

    // 6. Fetch AI Knowledge Base & Settings
    const aiKnowledgeDocs = db.prepare('SELECT * FROM ai_knowledge_docs ORDER BY createdAt DESC').all();
    const aiSettings = db.prepare('SELECT * FROM ai_settings').all();

    return NextResponse.json({
      success: true,
      stats: {
        total,
        pending,
        active,
        locked,
        disabled,
        expiring,
        expired,
        certifiedCount: allCerts.length,
        cohortAvgScore,
        distinctionCount,
        meritCount,
        passCount,
        needsSupportCount,
      },
      moduleStats: moduleStatsMap,
      users: safeUsers,
      auditLogs,
      entities,
      packages,
      articles,
      comments,
      lessonOverrides,
      aiKnowledgeDocs,
      aiSettings,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

