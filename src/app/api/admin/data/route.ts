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

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const search = request.nextUrl.searchParams.get('search') || '';
    const roleFilter = request.nextUrl.searchParams.get('roleFilter') || '';
    const statusFilter = request.nextUrl.searchParams.get('statusFilter') || '';

    // 1. Fetch user counts & compute expirations (Overall stats)
    const allUsers = db.prepare('SELECT * FROM users').all() as any[];
    const now = Date.now();

    let globalTotal = allUsers.length;
    let pending = 0;
    let active = 0;
    let locked = 0;
    let disabled = 0;
    let expiring = 0;
    let expired = 0;

    allUsers.forEach(u => {
      if (u.accountStatus === 'pending_activation') pending++;
      else if (u.accountStatus === 'active') active++;
      else if (u.accountStatus === 'locked') locked++;
      else if (u.accountStatus === 'disabled') disabled++;
      else if (u.accountStatus === 'expired') expired++;

      if (u.credentialExpiresAt) {
        const diff = new Date(u.credentialExpiresAt).getTime() - now;
        const daysLeft = Math.ceil(diff / (24 * 60 * 60 * 1000));
        if (daysLeft <= 0) {
          expired++;
        } else if (daysLeft <= 14) {
          expiring++;
        }
      }
    });

    // 1b. Fetch paginated users
    const whereClauses: string[] = [];
    const params: any[] = [];
    if (search) {
      whereClauses.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (roleFilter) {
      whereClauses.push('role = ?');
      params.push(roleFilter);
    }
    if (statusFilter) {
      whereClauses.push('accountStatus = ?');
      params.push(statusFilter);
    }
    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const countResult = db.prepare(`SELECT COUNT(*) as count FROM users ${whereStr}`).get(...params) as any;
    const filteredTotal = countResult.count;

    const offset = (page - 1) * limit;
    const users = db.prepare(`SELECT * FROM users ${whereStr} LIMIT ? OFFSET ?`).all(...params, limit, offset) as any[];

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

    // Calculate cohort stats using ALL users to maintain correct percentages
    allUsers.forEach(u => {
      const prog = userProgressMap[u.id] || { completedCount: 0, totalScore: 0, gradedCount: 0, lastActive: null, completedLessons: [] };
      const avgScore = prog.gradedCount > 0 ? Math.round(prog.totalScore / prog.gradedCount) : null;
      if (avgScore !== null) {
        totalCohortScore += avgScore;
        totalCohortGraded++;
        if (avgScore >= 85) distinctionCount++;
        else if (avgScore >= 70) meritCount++;
        else if (avgScore >= 50) passCount++;
        else needsSupportCount++;
      }
    });

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
        if (avgScore >= 85) gradeTier = 'Distinction';
        else if (avgScore >= 70) gradeTier = 'Merit';
        else if (avgScore >= 50) gradeTier = 'Pass';
        else gradeTier = 'Needs Support';
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

    // 7. Fetch Chatbot 30 Q&As
    let chatbotQAs: any[] = [];
    try {
      chatbotQAs = db.prepare('SELECT * FROM chatbot_qa ORDER BY displayOrder ASC, id ASC').all();
    } catch {
      chatbotQAs = [];
    }

    // 8. Fetch Contact Enquiries
    let enquiries: any[] = [];
    try {
      enquiries = db.prepare('SELECT * FROM enquiries ORDER BY id DESC LIMIT 100').all();
    } catch {
      enquiries = [];
    }

    // 9. Fetch Institutional Academic Governance: Assessments, Capstone & Certification
    let assessmentQuestions: any[] = [];
    let assessmentSettings: any = null;
    let capstoneTracks: any[] = [];
    let certificationSettings: any = null;
    let professionalTracks: any[] = [];
    try {
      assessmentQuestions = db.prepare('SELECT * FROM assessment_questions ORDER BY moduleId ASC, id ASC').all();
      assessmentSettings = db.prepare('SELECT * FROM assessment_settings WHERE id = ?').get('default');
      capstoneTracks = db.prepare('SELECT * FROM capstone_tracks ORDER BY code ASC').all();
      certificationSettings = db.prepare('SELECT * FROM certification_settings WHERE id = ?').get('global');
      professionalTracks = db.prepare('SELECT * FROM professional_tracks_config ORDER BY id ASC').all();
    } catch (govErr) {
      console.error('Error fetching academic governance data:', govErr);
    }

    return NextResponse.json({
      success: true,
      total: filteredTotal,
      page,
      limit,
      stats: {
        total: globalTotal,
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
      chatbotQAs,
      enquiries,
      assessmentQuestions,
      assessmentSettings,
      capstoneTracks,
      certificationSettings,
      professionalTracks,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

