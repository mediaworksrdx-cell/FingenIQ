import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';

function capitalizeWords(str: string): string {
  if (!str) return '';
  return str.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

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
    const user = db.prepare(`
      SELECT 
        u.name, u.role, u.accountStatus, u.credentialExpiresAt, u.mustResetPassword,
        u.loginCategory, u.businessEntityId, u.packageId,
        p.name as packageName, p.allowedModules,
        b.name as businessEntityName
      FROM users u
      LEFT JOIN packages p ON u.packageId = p.id
      LEFT JOIN business_entities b ON u.businessEntityId = b.id
      WHERE u.id = ?
    `).get(session.userId) as any;

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

    const packageData = {
      loginCategory: user.loginCategory || 'b2c',
      businessEntityId: user.businessEntityId,
      businessEntityName: user.businessEntityName,
      packageId: user.packageId,
      packageName: user.packageName,
      allowedModules: user.role === 'admin' ? ['ALL'] : (user.allowedModules ? JSON.parse(user.allowedModules) : ['ALL']),
      packageExpiresAt: user.credentialExpiresAt
    };

    // Force reset check
    if (user.mustResetPassword === 1) {
      // Return must reset parameter
      return NextResponse.json({
        success: true,
        userId: session.userId,
        role: user.role,
        mustReset: true,
        ...packageData
      });
    }

    return NextResponse.json({
      success: true,
      userId: session.userId,
      name: capitalizeWords(user.name),
      role: user.role,
      mustReset: false,
      ...packageData
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
