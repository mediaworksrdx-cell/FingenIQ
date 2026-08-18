import { db } from './db';
import { cookies } from 'next/headers';

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Verify the current request's session cookie and return the authenticated user.
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  const session = db.prepare('SELECT userId, expiresAt FROM sessions WHERE id = ?').get(token) as { userId: string; expiresAt: string } | undefined;
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
    return null;
  }

  const user = db.prepare('SELECT id, name, email, role, accountStatus FROM users WHERE id = ?').get(session.userId) as any;
  if (!user || user.accountStatus === 'locked' || user.accountStatus === 'disabled') return null;

  return { userId: user.id, name: user.name, email: user.email, role: user.role };
}
