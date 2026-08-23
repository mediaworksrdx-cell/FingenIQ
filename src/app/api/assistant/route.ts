import { NextResponse } from 'next/server';

const AARKAAI_API_URL = process.env.AARKAAI_BACKEND_URL || process.env.AARKAAI_API_URL || 'http://127.0.0.1:5000';

const FINANCE_KEYWORDS = [
  'finance', 'financial', 'invest', 'stock', 'equity', 'bond', 'mutual fund', 'etf', 'portfolio',
  'valuation', 'dcf', 'wacc', 'cagr', 'irr', 'xirr', 'pe', 'p/e', 'ebitda', 'balance sheet',
  'cash flow', 'income statement', 'debt', 'credit', 'loan', 'banking', 'sebi', 'nism', 'rbi',
  'wealth', 'capital', 'risk', 'insurance', 'tax', 'retirement', 'sip', 'dividend', 'dividend yield',
  'accounting', 'asset', 'liability', 'roe', 'roce', 'working capital', 'options', 'derivatives',
  'market', 'lesson', 'module', 'exam', 'quiz', 'capstone', 'certificate', 'credential', 'tier',
  'fingeniq', 'inflation', 'gdp', 'monetary policy', 'interest rate', 'currency', 'forex', 'hedge'
];

const OFF_TOPIC_RESPONSE = "I am specialized exclusively as your FinGenIQ Financial Education Tutor. I can only assist with topics related to finance, investments, valuation models, corporate finance, personal wealth management, capital markets, SEBI credentials, and your platform curriculum. Please ask any financial or course-related question!";

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

    const rawQuery = (body.message || body.query || '').toString().trim();

    if (!rawQuery) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    const cleanLower = rawQuery.toLowerCase();

    // 1. Basic Greeting Pass-through
    if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|namaste)\b/i.test(cleanLower) && cleanLower.split(' ').length <= 4) {
      return NextResponse.json({
        success: true,
        response: "Hello! 👋 I am your **FinGenIQ AI Tutor** powered by **Aarkaa AI**.\n\nI specialize strictly in **finance, investments, valuation models (DCF, WACC), accounting, capital markets, and course lessons**.\n\nHow can I help with your financial learning today?",
        source: 'fingeniq-guardrail',
      });
    }

    // 2. Strict Finance Guardrail Check
    const hasFinanceKeyword = FINANCE_KEYWORDS.some(kw => cleanLower.includes(kw));

    // If query has 4+ words and absolutely zero financial keywords, reject out-of-domain
    if (!hasFinanceKeyword && cleanLower.split(/\s+/).length >= 4) {
      return NextResponse.json({
        success: true,
        response: OFF_TOPIC_RESPONSE,
        source: 'fingeniq-guardrail',
      });
    }

    const sessionId = (body.sessionId || 'fingeniq-learner-session').toString();

    // 3. Dispatch to Aarkaa AI Engine on localhost:5000 with strict context
    try {
      const aarkaaRes = await fetch(`${AARKAAI_API_URL}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `[STRICT DOMAIN: FINANCIAL EDUCATION ONLY]\nUser asks: ${rawQuery}\nInstructions: Answer thoroughly as an institutional finance tutor. If unrelated to finance, decline politely.`,
          session_id: sessionId,
          mode: 'production',
          context: {
            app: 'FinGenIQ',
            role: 'Financial Education Tutor',
            domain: 'Finance, Banking, Valuation Models (DCF, Multiples), Capital Markets, Wealth Management, FinGenIQ Curriculum',
            guardrail: 'STRICT_FINANCE_ONLY',
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
      console.warn('[Assistant API] AarkaaAI backend unreachable, falling back:', aarkaaErr);
    }

    // 4. Return fallback response
    return NextResponse.json({
      success: true,
      response: `**FinGenIQ Financial Intelligence Concept**:\n\nRegarding **"${rawQuery}"**:\n• In financial analysis, disciplined frameworks (DCF, risk-adjusted returns, asset allocation) ensure optimal capital efficiency.\n• For full module theory, review the structured lessons in your **Lessons** tab.`,
      source: 'fingeniq-engine',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
