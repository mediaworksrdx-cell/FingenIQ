import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const jobs = db.prepare('SELECT * FROM marketplace_jobs WHERE status = ? ORDER BY createdAt DESC').all('active') as any[];
    const parsedJobs = jobs.map(j => ({
      ...j,
      skills: typeof j.skills === 'string' ? JSON.parse(j.skills || '[]') : j.skills
    }));
    return NextResponse.json({ success: true, jobs: parsedJobs });
  } catch (error) {
    console.error('Error fetching marketplace jobs:', error);
    return NextResponse.json({ success: true, jobs: [] });
  }
}
