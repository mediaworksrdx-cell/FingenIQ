import { NextResponse } from 'next/server';

const AARKAAI_STREAM_URL = process.env.AARKAAI_STREAM_URL || 'http://127.0.0.1:5000/prompt/stream';

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'fingeniq-aarkaa-backend' });
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

    const rawQuery = (body.message || body.query || '').toString().trim();
    const rawModel = (body.model || body.model_override || '').toString().trim().toLowerCase();

    if (!rawQuery) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    // Dynamic model selection: gemini-3.7 or aarka-2.0
    let modelOverride = 'aarka-2.0';
    if (rawModel.includes('gemini')) {
      modelOverride = 'gemini-3.7';
    } else if (rawModel.includes('aarka')) {
      modelOverride = 'aarka-2.0';
    } else if (rawModel) {
      modelOverride = rawModel;
    }

    // Call Aarkaa AI backend streaming endpoint directly
    let fullAiResponse = '';
    const aarkaaRes = await fetch(AARKAAI_STREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: rawQuery,
        model_override: modelOverride,
        mode: 'production',
      }),
      signal: AbortSignal.timeout(180000), // 3-minute timeout for LLM generation
    });

    if (!aarkaaRes.ok) {
      const errText = await aarkaaRes.text().catch(() => '');
      return NextResponse.json(
        { success: false, error: `Aarkaa AI backend error (${aarkaaRes.status}): ${errText}` },
        { status: 502 }
      );
    }

    if (aarkaaRes.body) {
      const reader = aarkaaRes.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunkText = decoder.decode(value, { stream: !done });
          const lines = chunkText.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              try {
                const dataObj = JSON.parse(trimmed.slice(5).trim());
                if (dataObj.type === 'content' && typeof dataObj.token === 'string') {
                  fullAiResponse += dataObj.token;
                }
              } catch {
                // Ignore non-json SSE chunks (e.g. ping or done)
              }
            }
          }
        }
      }
    }

    if (fullAiResponse.trim()) {
      return NextResponse.json({
        success: true,
        response: fullAiResponse.trim(),
        source: 'aarkaa-ai-backend',
        model: modelOverride,
      });
    }

    return NextResponse.json(
      { success: false, error: 'No output received from Aarkaa AI backend' },
      { status: 502 }
    );
  } catch (err: any) {
    console.error('[Assistant API] Error connecting to Aarkaa AI:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error connecting to Aarkaa AI backend' },
      { status: 500 }
    );
  }
}
