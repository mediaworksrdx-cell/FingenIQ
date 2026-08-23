import { NextResponse } from 'next/server';

const AARKAAI_STREAM_URL = process.env.AARKAAI_STREAM_URL || 'http://127.0.0.1:5000/prompt/stream';

const FINANCE_REGEX = /\b(finance|financial|invest|investing|investment|investments|stock|stocks|equity|equities|bond|bonds|mutual\s+funds?|etf|etfs|portfolio|portfolios|valuation|valuations|dcf|wacc|cagr|irr|xirr|p\/e|pe\s+ratio|ebitda|ebit|balance\s+sheet|cash\s+flow|income\s+statement|debt|debts|credit|loan|loans|banking|sebi|nism|rbi|wealth|capital|risk|insurance|taxes?|taxation|retirement|sip|sips|dividends?|dividend\s+yield|accounting|assets?|liabilities|liability|roe|roce|working\s+capital|options?|derivatives?|markets?|lessons?|modules?|exams?|quizzes|quiz|capstones?|certificates?|certification|credentials?|fingeniq|inflation|gdp|interest\s+rates?|forex|hedging|alpha|beta|sharpe|treynor|sortino|annuity|amortization|yield|leverage|liquidity|solvency|arbitrage|npv|payback|drawdown|benchmark|margin)\b/i;

const OFF_TOPIC_RESPONSE = "I am specialized strictly as your FinGenIQ Financial Assistant. I provide in-depth analysis on finance, investments, valuation models, corporate finance, personal wealth management, capital markets, SEBI credentials, and your platform curriculum. Please ask any financial or course-related question.";

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'fingeniq-aarkaa-live-assistant' });
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

    if (!rawQuery) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    const cleanLower = rawQuery.toLowerCase();

    // 1. Basic Greeting
    if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|namaste)\b/i.test(cleanLower) && cleanLower.split(' ').length <= 4) {
      return NextResponse.json({
        success: true,
        response: "Hello! I am your **FinGenIQ Financial Assistant** powered by **Aarkaa AI**.\n\nAsk me any question about financial modeling, valuation (DCF, Multiples), corporate finance, portfolio strategy, investment analysis, or your platform curriculum.",
        source: 'aarkaa-ai',
      });
    }

    // 2. Strict Finance Domain Guardrail
    const isFinanceTopic = FINANCE_REGEX.test(cleanLower);
    if (!isFinanceTopic) {
      return NextResponse.json({
        success: true,
        response: OFF_TOPIC_RESPONSE,
        source: 'guardrail',
      });
    }

    // 3. Send query directly to Aarkaa AI Engine /prompt/stream and collect real live dynamic response
    try {
      const aarkaaRes = await fetch(AARKAAI_STREAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `You are FinGenIQ Financial Assistance, an institutional financial analysis and educational intelligence engine. Answer thoroughly with detailed explanations, exact formulas, step-by-step calculations, and financial insights for: ${rawQuery}`,
          model_override: 'aarka-2.0',
        }),
        signal: AbortSignal.timeout(45000), // 45s timeout for deep LLM reasoning
      });

      if (aarkaaRes.ok && aarkaaRes.body) {
        const reader = aarkaaRes.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullAiResponse = '';
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
                  // ignore non-json SSE lines (e.g. [DONE])
                }
              }
            }
          }
        }

        if (fullAiResponse.trim().length > 30) {
          return NextResponse.json({
            success: true,
            response: fullAiResponse.trim(),
            source: 'aarkaa-ai-live',
          });
        }
      }
    } catch (aarkaaErr) {
      console.error('[Assistant API] Error calling Aarkaa AI stream:', aarkaaErr);
    }

    // Fallback only if model fails to connect
    return NextResponse.json({
      success: true,
      response: `The AI financial reasoning engine is currently processing high load. Please ask your financial question again in a moment.`,
      source: 'aarkaa-ai-fallback',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
