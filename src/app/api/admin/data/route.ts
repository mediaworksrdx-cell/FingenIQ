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

    const safeUsers = users.map(u => {
      const {
        passwordHash,
        activationToken,
        activationTokenExpiresAt,
        resetToken,
        resetTokenExpiresAt,
        ...rest
      } = u;
      return rest;
    });

    // 2. Fetch logs
    const auditLogs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 30').all();

    return NextResponse.json({
      success: true,
      stats: { total, pending, active, locked, disabled, expiring, expired },
      users: safeUsers,
      auditLogs
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
