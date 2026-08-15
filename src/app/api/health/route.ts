import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Verify database connectivity
    const check = db.prepare('SELECT 1 as healthy').get() as { healthy: number };
    const isDbHealthy = check?.healthy === 1;

    return NextResponse.json(
      {
        status: isDbHealthy ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        service: 'FinGenIQ',
        version: '1.0.0',
      },
      { status: isDbHealthy ? 200 : 503 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: err.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
