import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, error: 'No session token' });
  }

  try {
    // 1. Validate session against DB
    const session = db.prepare('SELECT userId, expiresAt FROM sessions WHERE id = ?').get(token) as { userId: string; expiresAt: string } | undefined;

    if (!session) {
      return NextResponse.json({ success: false, error: 'Invalid session' });
    }

    // Verify session expiration
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
      return NextResponse.json({ success: false, error: 'Session expired' });
    }

    // 2. Fetch full user status & role
    const user = db.prepare('SELECT role, accountStatus, credentialExpiresAt, mustResetPassword FROM users WHERE id = ?').get(session.userId) as any;

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' });
    }

    // Enforce mid-session lock, disable, and expiration checks
    if (user.accountStatus === 'locked' || user.accountStatus === 'disabled') {
      return NextResponse.json({ success: false, error: 'Account locked or disabled' });
    }

    // Expiration check with 3-day grace period
    if (user.credentialExpiresAt) {
      const expiresTime = new Date(user.credentialExpiresAt).getTime();
      const graceTime = expiresTime + 3 * 24 * 60 * 60 * 1000;
      if (Date.now() > graceTime) {
        db.prepare("UPDATE users SET accountStatus = 'expired' WHERE id = ?").run(session.userId);
        return NextResponse.json({ success: false, error: 'Credential expired' });
      }
    }

    // Force reset check
    if (user.mustResetPassword === 1) {
      // Return must reset parameter
      return NextResponse.json({
        success: true,
        userId: session.userId,
        role: user.role,
        mustReset: true
      });
    }

    return NextResponse.json({
      success: true,
      userId: session.userId,
      role: user.role,
      mustReset: false
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
