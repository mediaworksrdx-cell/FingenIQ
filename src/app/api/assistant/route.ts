import { NextResponse } from 'next/server';
import { findDetailedFinancialAnalysis, FinancialTopicAnalysis } from '@/lib/financialKnowledge';

const AARKAAI_API_URL = process.env.AARKAAI_BACKEND_URL || process.env.AARKAAI_API_URL || 'http://127.0.0.1:5000';

const FINANCE_REGEX = /\b(finance|financial|invest|investing|investment|investments|stock|stocks|equity|equities|bond|bonds|mutual\s+funds?|etf|etfs|portfolio|portfolios|valuation|valuations|dcf|wacc|cagr|irr|xirr|p\/e|pe\s+ratio|ebitda|balance\s+sheet|cash\s+flow|income\s+statement|debt|debts|credit|loan|loans|banking|sebi|nism|rbi|wealth|capital|risk|insurance|taxes?|taxation|retirement|sip|sips|dividends?|dividend\s+yield|accounting|assets?|liabilities|liability|roe|roce|working\s+capital|options?|derivatives?|markets?|lessons?|modules?|exams?|quizzes|quiz|capstones?|certificates?|certification|credentials?|fingeniq|inflation|gdp|interest\s+rates?|forex|hedging)\b/i;

const OFF_TOPIC_RESPONSE = "🔒 **FinGenIQ Financial Intelligence Boundary**:\n\nI am configured strictly as your **Financial Education & Research Intelligence Assistant**.\n\nI specialize exclusively in:\n• **Valuation Methodologies** (DCF, Multiples, WACC, LBO)\n• **Financial Statement Analysis** (Ratios, Solvency, DuPont)\n• **Portfolio & Wealth Management** (CAGR, XIRR, Asset Allocation)\n• **Derivatives & Capital Markets** (Options, Hedging, Equity)\n• **SEBI / NISM Alignment & FinGenIQ Curriculum**\n\nPlease enter any financial question, formula, or curriculum topic to begin!";

function formatTopicAnalysis(analysis: FinancialTopicAnalysis): string {
  let output = `### 📘 ${analysis.title}\n\n`;
  output += `**Domain**: \`${analysis.category}\`\n\n`;
  output += `#### 📌 Executive Concept Overview\n${analysis.summary}\n\n`;

  if (analysis.formula) {
    output += `#### 📐 Mathematical Formulation & Logic\n${analysis.formula}\n\n`;
  }

  if (analysis.comparisonTable) {
    output += `#### 📊 Comparative Breakdown Table\n`;
    output += `| ${analysis.comparisonTable.headers.join(' | ')} |\n`;
    output += `| ${analysis.comparisonTable.headers.map(() => '---').join(' | ')} |\n`;
    analysis.comparisonTable.rows.forEach(row => {
      output += `| ${row.join(' | ')} |\n`;
    });
    output += `\n`;
  }

  if (analysis.workedExample) {
    output += `#### 🔢 Step-by-Step Worked Calculation\n${analysis.workedExample}\n\n`;
  }

  output += `#### 🎯 Institutional Decision Rule\n${analysis.decisionRule}\n\n`;
  output += `#### 📚 Platform Curriculum Relevance\n${analysis.platformRelevance}`;

  return output;
}

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

    // 1. Basic Greeting
    if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|namaste)\b/i.test(cleanLower) && cleanLower.split(' ').length <= 4) {
      return NextResponse.json({
        success: true,
        response: `### 🏛️ FinGenIQ Financial Intelligence & Research Assistant\n\nWelcome! I am your dedicated **Institutional Financial Assistance Terminal** powered by **Aarkaa AI**.\n\nI assist you with deep financial reasoning across:\n1. **Valuation Models**: DCF, WACC, Multiples, Sensitivity Analysis\n2. **Financial Metrics**: CAGR vs XIRR, Debt-to-Equity, DuPont Analysis\n3. **Portfolio Management**: Asset allocation, Risk metrics, Beta, Sharpe ratio\n4. **SEBI Framework**: NISM standards & FinGenIQ 3-tier credentials\n\nSelect a quick analysis above or type your financial question below!`,
        source: 'fingeniq-guardrail',
      });
    }

    // 2. Strict Finance Guardrail Check
    const isFinanceTopic = FINANCE_REGEX.test(cleanLower);

    if (!isFinanceTopic) {
      return NextResponse.json({
        success: true,
        response: OFF_TOPIC_RESPONSE,
        source: 'fingeniq-guardrail',
      });
    }

    // 3. Check Deep Institutional Knowledge Base First
    const instantAnalysis = findDetailedFinancialAnalysis(rawQuery);
    if (instantAnalysis) {
      return NextResponse.json({
        success: true,
        response: formatTopicAnalysis(instantAnalysis),
        source: 'fingeniq-institutional-engine',
        topic: instantAnalysis.title,
        category: instantAnalysis.category,
      });
    }

    const sessionId = (body.sessionId || 'fingeniq-learner-session').toString();

    // 4. Dispatch to Aarkaa AI Engine on localhost:5000 with rich structuring prompt
    try {
      const aarkaaRes = await fetch(`${AARKAAI_API_URL}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `[FINANCIAL ASSISTANCE INSTRUCTION: Provide a comprehensive, multi-section institutional financial masterclass with formulas, tables, and practical calculation steps]\nQuestion: ${rawQuery}`,
          session_id: sessionId,
          mode: 'production',
          context: {
            app: 'FinGenIQ',
            role: 'Institutional Financial Analyst & Educational Tutor',
            domain: 'Corporate Finance, DCF Valuation, Financial Ratios, Capital Markets, SEBI Compliance',
            format: 'structured_masterclass',
          },
        }),
        signal: AbortSignal.timeout(35000), // 35s timeout
      });

      if (aarkaaRes.ok) {
        const data = await aarkaaRes.json();
        const responseText = data.response || data.answer || data.text || '';
        if (responseText && responseText.length > 50) {
          return NextResponse.json({
            success: true,
            response: responseText,
            source: 'aarkaa-ai',
          });
        }
      }
    } catch (aarkaaErr) {
      console.warn('[Assistant API] AarkaaAI backend timeout/unreachable, falling back to structured synthesis:', aarkaaErr);
    }

    // 5. Fallback Structured Financial Synthesis
    const fallbackResponse = `### 📊 Financial Intelligence Analysis: ${rawQuery.replace(/[?]/g, '')}\n\n` +
      `#### 📌 Executive Concept Summary\n` +
      `In financial analysis, **${rawQuery}** plays a critical role in determining capital efficiency, valuation accuracy, and risk-adjusted return expectations.\n\n` +
      `#### 📐 Analytical Framework\n` +
      `• **Fundamental Relationship**: Value is a function of cash flows, growth expectations, and discount rates ($r$).\n` +
      `• **Risk-Adjusted Return**: Evaluates whether expected return sufficiently compensates for systemic volatility ($\\beta$) and default spreads.\n\n` +
      `#### 🎯 Practical Decision Rule\n` +
      `Financial analysts must apply sensitivity matrices and stress-test assumptions under bull, base, and bear macroeconomic scenarios.\n\n` +
      `#### 📚 FinGenIQ Curriculum Alignment\n` +
      `Explore detailed case studies and Excel/Python simulators in your **Lessons** tab.`;

    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      source: 'fingeniq-synthesis',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
