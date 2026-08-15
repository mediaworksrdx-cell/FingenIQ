import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './db';

// single source of truth validity periods mapping
export function calculateExpirationDate(period: 'monthly' | 'quarterly' | 'half_yearly' | 'annual', startDate: Date = new Date()): Date {
  const expiry = new Date(startDate);
  if (period === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
  else if (period === 'quarterly') expiry.setMonth(expiry.getMonth() + 3);
  else if (period === 'half_yearly') expiry.setMonth(expiry.getMonth() + 6);
  else if (period === 'annual') expiry.setFullYear(expiry.getFullYear() + 1);
  return expiry;
}

// cryptographically secure opaque token generators
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex'); // 64-char high entropy
}

// IP-Based Rate Limiting (10 failed auth attempts per IP per 10-minute window)
export function checkIpRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = new Date().toISOString();
  const limitWindowMs = 10 * 60 * 1000; // 10 minutes

  let rateLimit = db.prepare('SELECT attempts, lastAttemptAt FROM ip_rate_limits WHERE ip = ?').get(ip) as { attempts: number; lastAttemptAt: string } | undefined;

  if (!rateLimit) {
    db.prepare('INSERT INTO ip_rate_limits (ip, attempts, lastAttemptAt) VALUES (?, 0, ?)')
      .run(ip, now);
    return { allowed: true, remaining: 10 };
  }

  const lastAttemptTime = new Date(rateLimit.lastAttemptAt).getTime();
  const timePassed = new Date(now).getTime() - lastAttemptTime;

  if (timePassed > limitWindowMs) {
    // Reset window
    db.prepare('UPDATE ip_rate_limits SET attempts = 0, lastAttemptAt = ? WHERE ip = ?')
      .run(now, ip);
    return { allowed: true, remaining: 10 };
  }

  if (rateLimit.attempts >= 10) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: 10 - rateLimit.attempts };
}

export function recordIpAttempt(ip: string, failed: boolean) {
  const now = new Date().toISOString();
  if (failed) {
    db.prepare('UPDATE ip_rate_limits SET attempts = attempts + 1, lastAttemptAt = ? WHERE ip = ?')
      .run(now, ip);
  } else {
    db.prepare('UPDATE ip_rate_limits SET attempts = 0, lastAttemptAt = ? WHERE ip = ?')
      .run(now, ip);
  }
}

// Audit logger mapping
export function logAudit(action: string, adminId: string, targetUserId: string | null, prevVal: any, newVal: any) {
  const logId = 'AUD_' + generateSecureToken().substring(0, 12);
  const metadata = JSON.stringify({ previous: prevVal, new: newVal });
  db.prepare(`
    INSERT INTO audit_logs (id, action, adminId, targetUserId, timestamp, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(logId, action, adminId, targetUserId, new Date().toISOString(), metadata);
}
