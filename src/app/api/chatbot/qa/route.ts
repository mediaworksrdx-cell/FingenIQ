import { NextResponse } from 'next/server';
import { db, getAllChatbotQAs, DEFAULT_30_QAS } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let qas: any[] = [];
    try {
      qas = getAllChatbotQAs();
    } catch {
      qas = DEFAULT_30_QAS;
    }

    if (!qas || qas.length === 0) {
      qas = DEFAULT_30_QAS;
    }

    return NextResponse.json({ success: true, qas });
  } catch (err: any) {
    return NextResponse.json({ success: true, qas: DEFAULT_30_QAS, error: err.message });
  }
}
