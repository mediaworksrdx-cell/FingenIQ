/**
 * FinGenIQ Institutional Financial Knowledge Base & Deep Analysis Engine
 * Provides comprehensive, multi-section institutional financial education assistance.
 */

export interface FinancialTopicAnalysis {
  title: string;
  category: 'Valuation' | 'Ratios & Analysis' | 'Corporate Finance' | 'Portfolio & Markets' | 'Curriculum & Certification';
  summary: string;
  formula?: string;
  comparisonTable?: { headers: string[]; rows: string[][] };
  workedExample?: string;
  decisionRule: string;
  platformRelevance: string;
}

export const FINANCIAL_KNOWLEDGE_BASE: Record<string, FinancialTopicAnalysis> = {
  'cagr_vs_xirr': {
    title: 'CAGR (Compound Annual Growth Rate) vs. XIRR (Extended Internal Rate of Return)',
    category: 'Portfolio & Markets',
    summary: `**CAGR** measures the mean annual growth rate of an investment over a specified time period assuming compounding over smooth, periodic intervals with a **single lump-sum cash outflow at inception and a single terminal inflow**.\n\n**XIRR** calculates the annualized internal rate of return for a series of **irregular, multiple cash inflows and outflows occurring at arbitrary dates** (such as SIP investments, phased capital drawdowns, dividends, and partial redemptions).`,
    formula: `• **CAGR Formula**:
  $$\\text{CAGR} = \\left( \\frac{\\text{Ending Value}}{\\text{Beginning Value}} \\right)^{\\frac{1}{n}} - 1$$
  where $n$ is the holding period in years.

• **XIRR Formula**:
  $$\\sum_{i=1}^{N} \\frac{C_i}{(1 + \\text{XIRR})^{\\frac{d_i - d_1}{365}}} = 0$$
  where $C_i$ is cash flow at date $d_i$, and $d_1$ is the date of initial cash flow.`,
    comparisonTable: {
      headers: ['Feature', 'CAGR', 'XIRR'],
      rows: [
        ['Cash Flow Structure', 'Single initial investment & single final exit', 'Multiple investments/redemptions on uneven dates'],
        ['Time Horizon', 'Best for point-to-point lump sum horizons (> 1 yr)', 'Essential for SIPs, Mutual Funds, Private Equity'],
        ['Reinvestment Assumption', 'Assumes continuous reinvestment at constant rate', 'Assumes interim cash flows reinvested at computed IRR'],
        ['Sensitivity to Timing', 'Ignores timing of intermediate capital changes', 'Heavily sensitive to market timing of cash infusions']
      ]
    },
    workedExample: `**Worked Scenario**:\n- **Lump Sum**: Invest ₹1,00,000 on Jan 1, 2021; worth ₹1,80,000 on Jan 1, 2024 (3 years).\n  $$\\text{CAGR} = (1,80,000 / 1,00,000)^{1/3} - 1 = 21.64\\%$$\n- **SIP Inflows**: Invest ₹10,000 every month on fluctuating market days. XIRR must be used in Excel/FinGenIQ simulator to compute exact annualized internal yield.`,
    decisionRule: `**Rule of Thumb**: Use **CAGR** for evaluating buy-and-hold stock performance or benchmark indices. Use **XIRR** for personal portfolio tracking, mutual fund SIPs, and irregular private equity cash flows.`,
    platformRelevance: `Covered in Module 2 (Investment Principles) and Module 4 (Portfolio Management & Wealth Strategies).`
  },

  'debt_to_equity_and_interest_coverage': {
    title: 'Solvency Analysis: Debt-to-Equity (D/E) & Interest Coverage Ratio (ICR)',
    category: 'Ratios & Analysis',
    summary: `**Debt-to-Equity (D/E) Ratio** is a fundamental leverage metric indicating the relative proportion of shareholder equity and debt used to finance a company's total assets.\n\n**Interest Coverage Ratio (Times Interest Earned)** measures how easily a firm can service the interest obligations on its outstanding debt from its operating profit (EBIT).`,
    formula: `• **Debt-to-Equity Ratio**:
  $$\\text{D/E} = \\frac{\\text{Total Debt (Short-term + Long-term Borrowings)}}{\\text{Total Shareholders' Equity}}$$

• **Interest Coverage Ratio**:
  $$\\text{Interest Coverage Ratio} = \\frac{\\text{Operating Income (EBIT)}}{\\text{Interest Expense}}$$`,
    comparisonTable: {
      headers: ['Metric', 'Benchmark Benchmark', 'Risk Interpretation'],
      rows: [
        ['Debt-to-Equity (D/E)', '< 1.0x (Safe) | > 2.0x (High Leverage)', 'High D/E amplifies ROE during economic expansions but creates insolvency risk in downturns.'],
        ['Interest Coverage (ICR)', '> 3.0x (Healthy) | < 1.5x (Distress Warning)', 'ICR < 1.0x means operating cash flows are insufficient to pay interest, leading to rating downgrades.']
      ]
    },
    workedExample: `**Numerical Calculation**:\n- Company XYZ: EBIT = ₹50 Crore, Annual Interest = ₹10 Crore, Total Debt = ₹100 Crore, Equity = ₹80 Crore.\n  • **D/E Ratio** = ₹100 Cr / ₹80 Cr = **1.25x**\n  • **Interest Coverage Ratio** = ₹50 Cr / ₹10 Cr = **5.0x** (Safe debt-servicing capability).`,
    decisionRule: `**Credit Analysis Decision Rule**: Capital-intensive sectors (Utilities, Infrastructure) tolerate D/E up to 2.5x with stable utility cash flows. High-growth / Tech sectors should target D/E < 0.5x and ICR > 8.0x.`,
    platformRelevance: `Essential for Module 3 (Financial Statements & Corporate Analysis) and Module 6 (Credit Analysis & Valuation).`
  },

  'dcf_and_wacc': {
    title: 'Intrinsic Valuation: Discounted Cash Flow (DCF) & WACC Mechanics',
    category: 'Valuation',
    summary: `**Discounted Cash Flow (DCF)** valuation states that the intrinsic Enterprise Value (EV) of a business equals the present value of all its projected future Free Cash Flows to Firm (FCFF), discounted at the **Weighted Average Cost of Capital (WACC)**.`,
    formula: `• **Enterprise Value (DCF)**:
  $$\\text{Enterprise Value} = \\sum_{t=1}^{N} \\frac{\\text{FCFF}_t}{(1 + \\text{WACC})^t} + \\frac{\\text{Terminal Value}_N}{(1 + \\text{WACC})^N}$$

• **Gordon Growth Terminal Value**:
  $$\\text{Terminal Value} = \\frac{\\text{FCFF}_{N+1}}{\\text{WACC} - g}$$

• **WACC Formula**:
  $$\\text{WACC} = \\left( \\frac{E}{V} \\times K_e \\right) + \\left( \\frac{D}{V} \\times K_d \\times (1 - t) \\right)$$
  where $K_e = R_f + \\beta \\times (R_m - R_f)$ (CAPM Cost of Equity).`,
    comparisonTable: {
      headers: ['Component', 'Calculation Method', 'Key Sensitive Driver'],
      rows: [
        ['Cost of Equity ($K_e$)', 'CAPM: Risk-Free Rate + Beta × ERP', 'Equity Beta & Sovereign Bond Yield ($R_f$)'],
        ['After-Tax Cost of Debt ($K_d$)', 'Effective Borrowing Yield × (1 - Tax Rate)', 'Credit Spread & Corporate Tax Shield'],
        ['Perpetual Growth ($g$)', 'Long-term GDP growth rate (typically 2-4%)', 'Must never exceed nominal GDP expansion rate']
      ]
    },
    workedExample: `**Valuation Steps**:\n1. Forecast FCFF for 5-10 years (EBIT × (1 - t) + D&A - Capex - ΔNWC).\n2. Estimate WACC (e.g. 10.5%).\n3. Calculate Terminal Value using exit multiple or perpetuity model.\n4. Discount all cash flows to present value.\n5. Deduct Net Debt to arrive at **Implied Intrinsic Equity Value per Share**.`,
    decisionRule: `**Investment Decision**: If **Intrinsic Value per Share > Current Market Price by ≥ 15% Margin of Safety**, the security represents an undervalued buying opportunity.`,
    platformRelevance: `Interactive in Module 5 (Valuation Methodologies) and verified in the **Platform Capstone Project**.`
  },

  'pe_vs_ev_ebitda': {
    title: 'Relative Valuation: P/E Ratio vs. EV/EBITDA Multiple',
    category: 'Valuation',
    summary: `**Price-to-Earnings (P/E)** evaluates market price relative to net income after interest and taxes. **EV/EBITDA** evaluates Enterprise Value relative to operating cash generation before capital structure, debt servicing, and depreciation policies.`,
    formula: `• **P/E Ratio**:
  $$\\text{P/E} = \\frac{\\text{Market Price Per Share}}{\\text{Earnings Per Share (EPS)}} = \\frac{\\text{Market Capitalization}}{\\text{Net Income}}$$

• **EV/EBITDA Multiple**:
  $$\\text{EV/EBITDA} = \\frac{\\text{Market Cap} + \\text{Total Debt} + \\text{Preferred Stock} + \\text{Minority Interest} - \\text{Cash}}{\\text{EBITDA}}$$`,
    comparisonTable: {
      headers: ['Attribute', 'P/E Ratio', 'EV/EBITDA Multiple'],
      rows: [
        ['Capital Structure Neutral', 'No (Distorted by leverage and interest)', 'Yes (Neutral across leveraged and cash-rich firms)'],
        ['Depreciation Accounting', 'Affected by aggressive/conservative D&A', 'Normalized across different asset ages and capex rules'],
        ['Best Use Cases', 'Stable consumer, IT, and financial firms', 'Manufacturing, telecom, capital-intensive & M&A targets']
      ]
    },
    decisionRule: `**Analyst Standard**: Never evaluate capital-intensive or cross-border acquisitions using P/E alone. Use EV/EBITDA for apples-to-apples operational comparisons across differing debt structures.`,
    platformRelevance: `Module 5 (Comparative & Relative Valuation).`
  },

  'sebi_nism_roadmap': {
    title: 'SEBI Regulatory Alignment & FinGenIQ Credential Framework',
    category: 'Curriculum & Certification',
    summary: `FinGenIQ curriculum aligns with professional standards benchmarked against **SEBI (Securities and Exchange Board of India)** regulations and **NISM (National Institute of Securities Markets)** Series certifications (Series VIII Equity Derivatives, Series XV Research Analyst, Series X-A Investment Adviser).`,
    comparisonTable: {
      headers: ['Tier', 'Passing Weighted Score', 'Credential Scope & Industry Competency'],
      rows: [
        ['Tier 1: Completion', '≥ 60% Overall Score', 'Foundational literacy, personal finance, budgeting, basic asset classes.'],
        ['Tier 2: Proficiency', '≥ 75% Overall Score', 'Corporate valuation, ratio modeling, DCF, portfolio balancing.'],
        ['Tier 3: Distinction', '≥ 85% with Capstone ≥ 80%', 'Advanced M&A, derivatives hedging, institutional credit, and SEBI compliance.']
      ]
    },
    decisionRule: `**Roadmap Milestones**: Learners completing Tier 3 are prepared for institutional equity research analyst and wealth management roles.`,
    platformRelevance: `View complete progress in your **Certification** and **SEBI** platform tabs.`
  }
};

export function findDetailedFinancialAnalysis(query: string): FinancialTopicAnalysis | null {
  const q = query.toLowerCase();
  
  if ((q.includes('cagr') && q.includes('xirr')) || (q.includes('difference') && (q.includes('cagr') || q.includes('xirr')))) {
    return FINANCIAL_KNOWLEDGE_BASE['cagr_vs_xirr'];
  }
  if (q.includes('debt') && (q.includes('equity') || q.includes('interest coverage') || q.includes('coverage') || q.includes('ratio'))) {
    return FINANCIAL_KNOWLEDGE_BASE['debt_to_equity_and_interest_coverage'];
  }
  if (q.includes('dcf') || q.includes('discounted cash flow') || q.includes('wacc') || q.includes('terminal value')) {
    return FINANCIAL_KNOWLEDGE_BASE['dcf_and_wacc'];
  }
  if (q.includes('p/e') || q.includes('pe ratio') || q.includes('ev/ebitda') || q.includes('ebitda') || q.includes('multiples')) {
    return FINANCIAL_KNOWLEDGE_BASE['pe_vs_ev_ebitda'];
  }
  if (q.includes('sebi') || q.includes('nism') || q.includes('tier') || q.includes('roadmap') || q.includes('credential')) {
    return FINANCIAL_KNOWLEDGE_BASE['sebi_nism_roadmap'];
  }
  return null;
}
