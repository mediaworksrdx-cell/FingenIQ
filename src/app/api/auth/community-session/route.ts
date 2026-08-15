import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('community_session');

  if (!sessionCookie) {
    return NextResponse.json({ success: false });
  }

  const parts = sessionCookie.value.split('.');
  if (parts.length !== 2) {
    return NextResponse.json({ success: false });
  }

  const [base64payload, signature] = parts;

  const secret = process.env.COMMUNITY_SESSION_SECRET || 'dev-secret-change-me';
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(base64payload).digest('hex');

  if (signature !== expectedSignature) {
    return NextResponse.json({ success: false });
  }

  try {
    const payloadStr = Buffer.from(base64payload, 'base64').toString('utf-8');
    // payloadStr is {sessionId}.{base64(JSON)}
    const payloadParts = payloadStr.split('.');
    if (payloadParts.length !== 2) {
       return NextResponse.json({ success: false });
    }
    const userData = JSON.parse(Buffer.from(payloadParts[1], 'base64').toString('utf-8'));
    return NextResponse.json({ success: true, user: userData });
  } catch (err) {
    return NextResponse.json({ success: false });
  }
}
