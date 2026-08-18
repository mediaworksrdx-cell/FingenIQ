import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const entities = db.prepare('SELECT id, name, type FROM business_entities WHERE isActive = 1 ORDER BY name ASC').all();
    return NextResponse.json({ success: true, entities });
  } catch (err: any) {
    return NextResponse.json({ success: false, entities: [] });
  }
}
