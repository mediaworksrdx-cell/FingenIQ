import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const assessmentSettings = db.prepare('SELECT * FROM assessment_settings WHERE id = ?').get('default');
    const assessmentQuestions = db.prepare('SELECT id, moduleId, question, options, correctIndex, explanation, difficulty FROM assessment_questions ORDER BY moduleId ASC, id ASC').all();
    const capstoneTracks = db.prepare('SELECT * FROM capstone_tracks WHERE isActive = 1 ORDER BY code ASC').all();
    const certificationSettings = db.prepare('SELECT * FROM certification_settings WHERE id = ?').get('global');
    const professionalTracks = db.prepare('SELECT * FROM professional_tracks_config WHERE isActive = 1 ORDER BY id ASC').all();

    return NextResponse.json({
      success: true,
      assessmentSettings: assessmentSettings || {
        timeLimitSeconds: 1200,
        maxTabSwitches: 3,
        passingScorePct: 70,
        webcamRequired: 1,
      },
      assessmentQuestions: assessmentQuestions || [],
      capstoneTracks: capstoneTracks || [],
      certificationSettings: certificationSettings || {
        distinctionMinScore: 85,
        proficiencyMinScore: 75,
        completionMinScore: 60,
      },
      professionalTracks: professionalTracks || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
