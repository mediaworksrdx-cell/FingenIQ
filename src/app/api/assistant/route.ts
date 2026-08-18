import { NextResponse } from 'next/server';

const AARKAAI_API_URL = process.env.AARKAAI_BACKEND_URL || process.env.AARKAAI_API_URL || 'http://136.85.114.150:5000';

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'fingeniq-aarkaa-assistant' });
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      try {
        const text = await request.text();
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    const query = (body.message || body.query || '').toString();

    if (!query.trim()) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    const sessionId = (body.sessionId || 'fingeniq-session').toString();

    // 1. Try sending to AarkaaAI Engine
    try {
      const aarkaaRes = await fetch(`${AARKAAI_API_URL}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          session_id: sessionId,
          context: {
            app: 'FinGenIQ',
            platform: 'Financial Education & Research Intelligence',
            domain: 'Finance, Banking, Valuation, Capital Markets, Wealth Management, FinGenIQ Curriculum',
          },
        }),
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      if (aarkaaRes.ok) {
        const data = await aarkaaRes.json();
        const responseText = data.response || data.answer || data.text || '';
        if (responseText) {
          return NextResponse.json({
            success: true,
            response: responseText,
            source: 'aarkaa-ai',
          });
        }
      }
    } catch (aarkaaErr) {
      console.warn('[Assistant API] AarkaaAI backend unreachable or timed out, using intelligent fallback:', aarkaaErr);
    }

    // 2. Return fallback flag so client knowledge base responds
    return NextResponse.json({
      success: true,
      useLocalFallback: true,
      source: 'fingeniq-engine',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
