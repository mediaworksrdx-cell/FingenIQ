import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (token) {
      try {
        db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
      } catch (err) {
        console.error('Error deleting session from db:', err);
      }
    }
    cookieStore.delete('session_token');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (token) {
      try {
        db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
      } catch (err) {
        console.error('Error deleting session from db:', err);
      }
    }
    cookieStore.delete('session_token');
    return NextResponse.redirect(new URL('/', request.url));
  } catch (err) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
