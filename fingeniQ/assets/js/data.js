/* ============================================================
   FINGENIIQ — DATA LAYER
   Mock data: 44 lessons × 8 modules, assessments, user state,
   certification records, marketplace profiles, job postings
   ============================================================ */

// ── MODULE DEFINITIONS ────────────────────────────────────────
const MODULES = [
  {
    id: 'M1', order: 1, icon: '💼',
    title: 'Personal Finance Foundations',
    subtitle: 'Cash flow, budgeting, credit & risk basics',
    description: 'Master the bedrock principles of personal financial management — from cash flow engineering and zero-based budgeting to credit scoring mechanics and insurance risk transfer. This module builds the mental frameworks every finance professional must own.',
    lessonIds: ['L1','L2','L3','L4','L5','L6'],
    prerequisiteModuleIds: [],
    professionalTrack: null
  },
  {
    id: 'M2', order: 2, icon: '🏦',
    title: 'Banking & Financial Institutions',
    subtitle: 'Indian banking system, NBFCs & fintech',
    description: 'Understand the architecture of India\'s financial system — commercial banking, central bank policy transmission, NBFC regulation, and the digital disruption reshaping traditional banking. Required for the Banking Professional Certification.',
    lessonIds: ['L7','L8','L9','L10','L11'],
    prerequisiteModuleIds: ['M1'],
    professionalTrack: 'Banking Professional Certification'
  },
  {
    id: 'M3', order: 3, icon: '📈',
    title: 'Equity Markets & Investing',
    subtitle: 'Capital markets, stock exchanges & IPOs',
    description: 'Navigate primary and secondary capital markets with professional-grade fluency. Covers NSE/BSE market microstructure, order book dynamics, index construction methodology, and the full IPO lifecycle from DRHP to listing.',
    lessonIds: ['L12','L13','L14','L15','L16','L17'],
    prerequisiteModuleIds: ['M1'],
    professionalTrack: 'Equity Research Analyst Certification'
  },
  {
    id: 'M4', order: 4, icon: '⚖️',
    title: 'Mutual Funds & Portfolio Management',
    subtitle: 'NAV mechanics, fund categories & SIP strategies',
    description: 'Develop a rigorous understanding of mutual fund architecture, NAV computation, and the full spectrum of fund categories. Build systematic investment frameworks using SIP/SWP/STP mechanics and performance evaluation tools including alpha, beta, and Sharpe ratio.',
    lessonIds: ['L18','L19','L20','L21','L22'],
    prerequisiteModuleIds: ['M3'],
    professionalTrack: null
  },
  {
    id: 'M5', order: 5, icon: '🏗️',
    title: 'Corporate Finance & Valuation',
    subtitle: 'Financial statements, DCF, WACC & M&A',
    description: 'The analytical core of the FinGeniQ curriculum. Master financial statement analysis, ratio interpretation, discounted cash flow modelling, capital structure theory, and multi-methodology equity valuation. Feeds directly into all three professional track certifications.',
    lessonIds: ['L23','L24','L25','L26','L27','L28'],
    prerequisiteModuleIds: ['M3','M4'],
    professionalTrack: 'Corporate Finance Professional Certification'
  },
  {
    id: 'M6', order: 6, icon: '📊',
    title: 'Fixed Income & Debt Markets',
    subtitle: 'Bonds, yield curves & credit risk',
    description: 'Develop institutional-level command of fixed income — bond pricing mechanics, duration and convexity, government securities markets, the RBI\'s open market operations, corporate credit analysis, and structured product architectures.',
    lessonIds: ['L29','L30','L31','L32','L33'],
    prerequisiteModuleIds: ['M2','M5'],
    professionalTrack: 'Banking Professional Certification'
  },
  {
    id: 'M7', order: 7, icon: '🛡️',
    title: 'Derivatives & Risk Management',
    subtitle: 'Forwards, futures, options & VaR',
    description: 'Complete the quantitative side of the curriculum with derivatives pricing theory, hedging strategy design, and enterprise risk management frameworks. Covers F&O market mechanics, Black-Scholes intuition, options Greeks, and Value at Risk methodology.',
    lessonIds: ['L34','L35','L36','L37','L38','L39'],
    prerequisiteModuleIds: ['M5','M6'],
    professionalTrack: 'Equity Research Analyst Certification'
  },
  {
    id: 'M8', order: 8, icon: '⚖️',
    title: 'Regulatory Framework & Professional Ethics',
    subtitle: 'SEBI, RBI, IRDAI, PFRDA & fiduciary duties',
    description: 'The capstone regulatory module — covering SEBI\'s jurisdictional powers, corporate governance obligations, insider trading compliance, and the overarching ethical framework governing financial professionals. Mandatory for all certification tracks.',
    lessonIds: ['L40','L41','L42','L43','L44'],
    prerequisiteModuleIds: ['M1','M2','M3','M4','M5','M6','M7'],
    professionalTrack: null
  }
];

// ── LESSON DEFINITIONS (all 44) ───────────────────────────────
const LESSONS = [
  // ── MODULE 1: Personal Finance Foundations ──
  {
    id: 'L1', moduleId: 'M1', order: 1,
    title: 'The Financial Freedom Framework',
    description: 'A conceptual model for structuring your financial life across three horizons: protection, accumulation, and distribution. Introduces the lifecycle approach to wealth.',
    duration: 35, status: 'completed', score: 88,
    tags: ['foundations', 'wealth-lifecycle', 'frameworks']
  },
  {
    id: 'L2', moduleId: 'M1', order: 2,
    title: 'Income, Expenses & Cash Flow Management',
    description: 'Decompose your income sources and expense structures. Build a working cash flow statement for personal finances and identify high-leverage intervention points.',
    duration: 40, status: 'completed', score: 92,
    tags: ['cash-flow', 'income', 'budgeting']
  },
  {
    id: 'L3', moduleId: 'M1', order: 3,
    title: 'Budgeting Methodologies: Zero-Based to 50/30/20',
    description: 'Evaluate five professional budgeting frameworks — zero-based, envelope, pay-yourself-first, 50/30/20, and value-based budgeting — and calibrate the right model to income profile.',
    duration: 45, status: 'completed', score: 79,
    tags: ['budgeting', 'zero-based', '50-30-20']
  },
  {
    id: 'L4', moduleId: 'M1', order: 4,
    title: 'Emergency Funds & Liquidity Management',
    description: 'Quantify the right emergency fund size using income-replacement and expense-coverage metrics. Evaluate liquid instrument options: savings accounts, liquid funds, and short-duration debt.',
    duration: 35, status: 'in-progress', score: null,
    tags: ['emergency-fund', 'liquidity', 'risk']
  },
  {
    id: 'L5', moduleId: 'M1', order: 5,
    title: 'Credit Scores, Debt & Interest Rate Dynamics',
    description: 'Demystify CIBIL/CRIF scoring models. Understand how EMI structures, utilisation rates, and repayment history affect creditworthiness — and engineer a debt-reduction strategy.',
    duration: 50, status: 'not-started', score: null,
    tags: ['credit', 'CIBIL', 'debt', 'interest-rates']
  },
  {
    id: 'L6', moduleId: 'M1', order: 6,
    title: 'Insurance & Risk Transfer Principles',
    description: 'Apply actuarial thinking to personal risk management. Compare term, ULIP, and endowment life policies; evaluate health insurance structures; calculate adequate cover using HLV and needs analysis.',
    duration: 45, status: 'not-started', score: null,
    tags: ['insurance', 'risk-transfer', 'HLV', 'term-life']
  },

  // ── MODULE 2: Banking & Financial Institutions ──
  {
    id: 'L7', moduleId: 'M2', order: 7,
    title: 'Structure of the Indian Banking System',
    description: 'Map the complete Indian banking ecosystem: scheduled commercial banks, cooperative banks, RRBs, SFBs, and payment banks. Understand RBI\'s regulatory architecture and prudential norms.',
    duration: 40, status: 'not-started', score: null,
    tags: ['banking', 'RBI', 'Indian-banking', 'scheduled-banks']
  },
  {
    id: 'L8', moduleId: 'M2', order: 8,
    title: 'Commercial Banking: Products, Services & Revenue Models',
    description: 'Dissect bank revenue: net interest income, fee income, and trading gains. Evaluate retail and corporate banking product architectures — CASA, term deposits, working capital limits, and trade finance.',
    duration: 45, status: 'not-started', score: null,
    tags: ['banking', 'NII', 'CASA', 'revenue-model']
  },
  {
    id: 'L9', moduleId: 'M2', order: 9,
    title: 'Central Banking & Monetary Policy',
    description: 'Understand how the RBI\'s Monetary Policy Committee sets repo rates and how policy transmission flows through MCLR, EBLR, and bond markets to the real economy. Analyse inflation targeting frameworks.',
    duration: 50, status: 'not-started', score: null,
    tags: ['RBI', 'monetary-policy', 'repo-rate', 'MPC', 'inflation']
  },
  {
    id: 'L10', moduleId: 'M2', order: 10,
    title: 'Non-Banking Financial Companies (NBFCs)',
    description: 'Differentiate NBFC categories — HFC, MFI, IFC, and NBFC-P2P — by regulatory capital requirements and permissible activities. Evaluate liquidity and credit risk profiles in the NBFC segment.',
    duration: 40, status: 'not-started', score: null,
    tags: ['NBFC', 'HFC', 'MFI', 'shadow-banking']
  },
  {
    id: 'L11', moduleId: 'M2', order: 11,
    title: 'Digital Banking & Fintech Disruption',
    description: 'Analyse the UPI payment stack, account aggregator framework, and open banking architecture. Evaluate how neo-banks and embedded finance are restructuring the traditional banking value chain.',
    duration: 45, status: 'not-started', score: null,
    tags: ['fintech', 'UPI', 'digital-banking', 'open-banking']
  },

  // ── MODULE 3: Equity Markets & Investing ──
  {
    id: 'L12', moduleId: 'M3', order: 12,
    title: 'Capital Markets: Primary & Secondary',
    description: 'Distinguish the capital formation function of primary markets from the liquidity and price-discovery role of secondary markets. Understand the roles of merchant bankers, book-running lead managers, and custodians.',
    duration: 40, status: 'not-started', score: null,
    tags: ['capital-markets', 'primary', 'secondary', 'price-discovery']
  },
  {
    id: 'L13', moduleId: 'M3', order: 13,
    title: 'Equity Instruments: Shares, ADRs & GDRs',
    description: 'Analyse equity as a residual claim. Compare equity share classes, voting rights structures, ADR/GDR issuance mechanics, and the implications for cross-border capital flows.',
    duration: 40, status: 'not-started', score: null,
    tags: ['equity', 'ADR', 'GDR', 'shares']
  },
  {
    id: 'L14', moduleId: 'M3', order: 14,
    title: 'Stock Exchanges & Market Microstructure',
    description: 'Examine NSE and BSE trading architectures: order matching algorithms, circuit breakers, T+1 settlement, and the roles of clearing corporations and depositories (NSDL, CDSL).',
    duration: 50, status: 'not-started', score: null,
    tags: ['NSE', 'BSE', 'market-microstructure', 'T+1', 'NSDL']
  },
  {
    id: 'L15', moduleId: 'M3', order: 15,
    title: 'Reading a Stock Quote & Order Book',
    description: 'Develop fluency in reading equity quotes: OHLCV data, bid-ask spreads, depth of market, and how order flow creates price. Practice interpreting Level 2 data and identifying liquidity pockets.',
    duration: 35, status: 'not-started', score: null,
    tags: ['stock-quote', 'order-book', 'bid-ask', 'OHLCV']
  },
  {
    id: 'L16', moduleId: 'M3', order: 16,
    title: 'Market Indices: NIFTY, SENSEX & Construction Methodology',
    description: 'Deconstruct how free-float market-cap weighted indices are built and rebalanced. Analyse NIFTY 50 and SENSEX constituent selection criteria, reconstitution events, and their effect on passive investment flows.',
    duration: 45, status: 'not-started', score: null,
    tags: ['NIFTY', 'SENSEX', 'index-construction', 'free-float']
  },
  {
    id: 'L17', moduleId: 'M3', order: 17,
    title: 'The IPO Process: From Filing to Listing',
    description: 'Walk the full IPO lifecycle: drafting the DRHP, SEBI observations, price discovery through book-building, allotment mechanics, grey market dynamics, and post-listing behaviour patterns.',
    duration: 55, status: 'not-started', score: null,
    tags: ['IPO', 'DRHP', 'book-building', 'allotment', 'SEBI']
  },

  // ── MODULE 4: Mutual Funds & Portfolio Management ──
  {
    id: 'L18', moduleId: 'M4', order: 18,
    title: 'Mutual Fund Architecture & NAV Mechanics',
    description: 'Understand AMC structure, trustee obligations, and the daily NAV computation process. Analyse the impact of entry/exit loads, expense ratios, and dividend vs. growth option NAV divergence.',
    duration: 40, status: 'not-started', score: null,
    tags: ['mutual-funds', 'NAV', 'AMC', 'expense-ratio']
  },
  {
    id: 'L19', moduleId: 'M4', order: 19,
    title: 'Equity, Debt & Hybrid Fund Categories',
    description: 'Navigate SEBI\'s fund categorisation circular: large-cap, mid-cap, flexi-cap, ELSS, gilt, credit risk, balanced advantage, and multi-asset funds. Match fund categories to investor risk-return profiles.',
    duration: 50, status: 'not-started', score: null,
    tags: ['fund-categories', 'ELSS', 'gilt', 'balanced-advantage']
  },
  {
    id: 'L20', moduleId: 'M4', order: 20,
    title: 'SIP, SWP & STP: Systematic Investment Strategies',
    description: 'Model the rupee-cost averaging benefit of SIP across market cycles. Design SWP plans for retirement decumulation and STP strategies for transitioning lump-sum investments into equity without timing risk.',
    duration: 45, status: 'not-started', score: null,
    tags: ['SIP', 'SWP', 'STP', 'rupee-cost-averaging']
  },
  {
    id: 'L21', moduleId: 'M4', order: 21,
    title: 'Risk-Return Framework & Portfolio Construction',
    description: 'Apply Modern Portfolio Theory: efficient frontier construction, diversification mathematics, and the Capital Asset Pricing Model. Build model portfolios calibrated to risk tolerance bands.',
    duration: 55, status: 'not-started', score: null,
    tags: ['MPT', 'CAPM', 'efficient-frontier', 'diversification']
  },
  {
    id: 'L22', moduleId: 'M4', order: 22,
    title: 'Evaluating Fund Performance: Alpha, Beta & Sharpe Ratio',
    description: 'Dissect fund analytics: Jensen\'s alpha, beta relative to benchmark, Sharpe and Sortino ratios, information ratio, and Treynor measure. Build a multi-metric fund comparison framework.',
    duration: 45, status: 'not-started', score: null,
    tags: ['alpha', 'beta', 'Sharpe', 'Sortino', 'Treynor']
  },

  // ── MODULE 5: Corporate Finance & Valuation ──
  {
    id: 'L23', moduleId: 'M5', order: 23,
    title: 'Financial Statement Analysis: P&L, Balance Sheet & Cash Flow',
    description: 'Develop a structured approach to reading annual reports. Build a three-statement model linking the income statement, balance sheet, and cash flow statement. Identify common accounting adjustments and red flags.',
    duration: 60, status: 'not-started', score: null,
    tags: ['financial-statements', 'P&L', 'balance-sheet', 'cash-flow']
  },
  {
    id: 'L24', moduleId: 'M5', order: 24,
    title: 'Ratio Analysis: Liquidity, Solvency, Profitability & Efficiency',
    description: 'Master the four pillars of ratio analysis. Compute and interpret current ratio, quick ratio, debt/equity, interest coverage, ROCE, ROE, asset turnover, and inventory days. Cross-sectional and trend analysis techniques.',
    duration: 55, status: 'not-started', score: null,
    tags: ['ratios', 'ROE', 'ROCE', 'liquidity', 'solvency']
  },
  {
    id: 'L25', moduleId: 'M5', order: 25,
    title: 'Time Value of Money & Discounted Cash Flow',
    description: 'From first principles: PV, FV, annuities, perpetuities, and growing perpetuities. Apply DCF mechanics to project valuation, bond pricing, and equity intrinsic value. Sensitivity analysis on discount rate and terminal growth assumptions.',
    duration: 60, status: 'not-started', score: null,
    tags: ['TVM', 'DCF', 'NPV', 'IRR', 'WACC']
  },
  {
    id: 'L26', moduleId: 'M5', order: 26,
    title: 'WACC, Capital Structure & Leverage',
    description: 'Compute WACC from first principles. Apply Modigliani-Miller propositions to understand optimal capital structure. Analyse how financial leverage amplifies both returns and risk — the double-edged sword of debt.',
    duration: 55, status: 'not-started', score: null,
    tags: ['WACC', 'capital-structure', 'leverage', 'M-M theorem']
  },
  {
    id: 'L27', moduleId: 'M5', order: 27,
    title: 'Equity Valuation: DCF, Comps & Precedent Transactions',
    description: 'Build a complete equity valuation framework using three methodologies: discounted free cash flow, comparable company analysis (trading multiples), and precedent transaction analysis. Learn to triangulate a valuation range.',
    duration: 65, status: 'not-started', score: null,
    tags: ['valuation', 'DCF', 'comps', 'EV/EBITDA', 'P/E']
  },
  {
    id: 'L28', moduleId: 'M5', order: 28,
    title: 'Mergers, Acquisitions & Corporate Restructuring',
    description: 'Analyse M&A deal mechanics: strategic rationale, deal structuring (merger vs. acquisition vs. asset purchase), accretion/dilution analysis, synergy valuation, and the post-merger integration challenge.',
    duration: 60, status: 'not-started', score: null,
    tags: ['M&A', 'accretion', 'dilution', 'synergies', 'LBO']
  },

  // ── MODULE 6: Fixed Income & Debt Markets ──
  {
    id: 'L29', moduleId: 'M6', order: 29,
    title: 'Bond Fundamentals: Price, Yield & Duration',
    description: 'Master the inverse price-yield relationship. Compute Macaulay duration, modified duration, and convexity. Understand how these metrics quantify interest rate sensitivity and guide fixed income portfolio construction.',
    duration: 55, status: 'not-started', score: null,
    tags: ['bonds', 'duration', 'yield', 'convexity', 'fixed-income']
  },
  {
    id: 'L30', moduleId: 'M6', order: 30,
    title: 'Government Securities & RBI Open Market Operations',
    description: 'Navigate India\'s G-Sec market: T-Bills, dated securities, SDLs, and STRIPS. Analyse how RBI\'s OMOs, MSS, and the Government Securities Acquisition Programme (G-SAP) manage system liquidity.',
    duration: 50, status: 'not-started', score: null,
    tags: ['G-Sec', 'RBI', 'OMO', 'G-SAP', 'T-bills']
  },
  {
    id: 'L31', moduleId: 'M6', order: 31,
    title: 'Corporate Bonds, Credit Ratings & Default Risk',
    description: 'Analyse corporate bond structures: senior secured, senior unsecured, subordinated, and perpetual bonds. Evaluate CRISIL/ICRA rating methodologies and compute credit spread dynamics across the rating spectrum.',
    duration: 50, status: 'not-started', score: null,
    tags: ['corporate-bonds', 'CRISIL', 'credit-rating', 'default-risk']
  },
  {
    id: 'L32', moduleId: 'M6', order: 32,
    title: 'Yield Curve Analysis & Interest Rate Risk',
    description: 'Interpret normal, inverted, and flat yield curves as macroeconomic signals. Apply duration-based hedging to immunise bond portfolios against parallel and non-parallel rate shifts. Case study: 2013 taper tantrum impact on Indian gilts.',
    duration: 55, status: 'not-started', score: null,
    tags: ['yield-curve', 'interest-rate-risk', 'immunisation', 'duration']
  },
  {
    id: 'L33', moduleId: 'M6', order: 33,
    title: 'Structured Products & Securitisation',
    description: 'Deconstruct ABS, MBS, and CDO structures. Understand the securitisation chain — originator, SPV, trustee, and investor — and the risk tranching logic that creates AAA-rated senior tranches from sub-investment grade assets.',
    duration: 50, status: 'not-started', score: null,
    tags: ['securitisation', 'ABS', 'MBS', 'CDO', 'SPV']
  },

  // ── MODULE 7: Derivatives & Risk Management ──
  {
    id: 'L34', moduleId: 'M7', order: 34,
    title: 'Derivatives Overview: Forwards, Futures, Options & Swaps',
    description: 'Establish a unified framework for derivative instruments. Compare OTC and exchange-traded structures. Understand how forwards, futures, options, and swaps create synthetic exposures without transferring the underlying asset.',
    duration: 50, status: 'not-started', score: null,
    tags: ['derivatives', 'forwards', 'futures', 'options', 'swaps']
  },
  {
    id: 'L35', moduleId: 'M7', order: 35,
    title: 'Futures Pricing & Basis Risk',
    description: 'Derive the cost-of-carry futures pricing model. Understand convergence at expiry, roll risk, and basis risk in commodity and equity futures. Analyse NIFTY futures term structure and its carry implications.',
    duration: 50, status: 'not-started', score: null,
    tags: ['futures', 'cost-of-carry', 'basis-risk', 'NIFTY-futures']
  },
  {
    id: 'L36', moduleId: 'M7', order: 36,
    title: 'Options: Pricing, Greeks & Payoff Strategies',
    description: 'Develop intuition for Black-Scholes inputs and the options Greeks (delta, gamma, theta, vega, rho). Build payoff diagrams for covered calls, protective puts, straddles, strangles, and spreads.',
    duration: 65, status: 'not-started', score: null,
    tags: ['options', 'Greeks', 'Black-Scholes', 'delta', 'vega']
  },
  {
    id: 'L37', moduleId: 'M7', order: 37,
    title: 'Hedging Strategies for Corporate Treasuries',
    description: 'Design institutional hedging programmes for currency, commodity, and interest rate exposures using forwards, futures, options, and swaps. Evaluate hedge effectiveness ratios and IND AS 109 hedge accounting requirements.',
    duration: 55, status: 'not-started', score: null,
    tags: ['hedging', 'treasury', 'FX', 'IND-AS-109', 'effectiveness']
  },
  {
    id: 'L38', moduleId: 'M7', order: 38,
    title: 'Financial Risk Management: Market, Credit & Operational Risk',
    description: 'Apply the Basel III risk taxonomy to enterprise risk management. Build risk identification and quantification frameworks for market risk (price, rate, FX), credit risk (counterparty, settlement), and operational risk (process, people, systems).',
    duration: 55, status: 'not-started', score: null,
    tags: ['risk-management', 'Basel-III', 'market-risk', 'credit-risk', 'operational-risk']
  },
  {
    id: 'L39', moduleId: 'M7', order: 39,
    title: 'Value at Risk (VaR) & Stress Testing',
    description: 'Implement VaR using three methodologies: historical simulation, parametric (variance-covariance), and Monte Carlo. Understand VaR limitations and complement with Expected Shortfall (CVaR), scenario analysis, and reverse stress testing.',
    duration: 60, status: 'not-started', score: null,
    tags: ['VaR', 'CVaR', 'Monte-Carlo', 'stress-testing', 'Expected-Shortfall']
  },

  // ── MODULE 8: Regulatory Framework & Professional Ethics ──
  {
    id: 'L40', moduleId: 'M8', order: 40,
    title: 'SEBI: Structure, Powers & Regulatory Jurisdiction',
    description: 'Examine SEBI\'s statutory powers under the SEBI Act, 1992. Map its regulatory jurisdiction across stock exchanges, intermediaries, collective investment schemes, and AIF categories. Analyse landmark enforcement actions and their market impact.',
    duration: 50, status: 'not-started', score: null,
    tags: ['SEBI', 'regulation', 'SEBI-Act', 'enforcement', 'AIF']
  },
  {
    id: 'L41', moduleId: 'M8', order: 41,
    title: 'Corporate Governance & Shareholder Rights',
    description: 'Apply the SEBI LODR framework for listed companies. Evaluate board composition requirements, audit committee mandates, related-party transaction oversight, and the role of proxy advisory firms in shaping governance outcomes.',
    duration: 50, status: 'not-started', score: null,
    tags: ['corporate-governance', 'LODR', 'board', 'shareholder-rights']
  },
  {
    id: 'L42', moduleId: 'M8', order: 42,
    title: 'Insider Trading, UPSI & Compliance Frameworks',
    description: 'Understand SEBI\'s Prohibition of Insider Trading Regulations, 2015. Identify what constitutes Unpublished Price Sensitive Information (UPSI), the obligations of designated persons, and how to design a Code of Conduct that meets SEBI requirements.',
    duration: 50, status: 'not-started', score: null,
    tags: ['insider-trading', 'UPSI', 'PIT-regulations', 'compliance']
  },
  {
    id: 'L43', moduleId: 'M8', order: 43,
    title: 'Financial Services Regulations: RBI, IRDAI & PFRDA',
    description: 'Map the multi-regulator Indian financial services landscape. Understand RBI\'s banking supervision powers, IRDAI\'s insurance sector oversight, and PFRDA\'s NPS framework. Analyse how regulatory arbitrage between sectors creates risk.',
    duration: 50, status: 'not-started', score: null,
    tags: ['RBI', 'IRDAI', 'PFRDA', 'NPS', 'regulation']
  },
  {
    id: 'L44', moduleId: 'M8', order: 44,
    title: 'Professional Ethics & Fiduciary Standards in Finance',
    description: 'Apply the fiduciary duty framework — loyalty, care, and disclosure — to real-world conflicts of interest in investment management, corporate advisory, and retail financial services. Case studies drawn from SEBI enforcement and international regulatory precedents.',
    duration: 45, status: 'not-started', score: null,
    tags: ['ethics', 'fiduciary', 'conflict-of-interest', 'CFA-ethics']
  }
];

// ── 20-STEP LESSON FRAMEWORK (example content for L1) ────────
const LESSON_STEPS = [
  { id: 1, name: 'Lesson Overview',      type: 'overview'     },
  { id: 2, name: 'Introduction',         type: 'intro'        },
  { id: 3, name: 'Learning Objectives',  type: 'objectives'   },
  { id: 4, name: 'Core Concepts',        type: 'concepts'     },
  { id: 5, name: 'Key Terminologies',    type: 'terminology'  },
  { id: 6, name: 'Visual Explanation',   type: 'visual'       },
  { id: 7, name: 'Interactive Learning', type: 'interactive'  },
  { id: 8, name: 'Real-World Examples',  type: 'examples'     },
  { id: 9, name: 'Case Study',           type: 'casestudy'    },
  { id:10, name: 'Did You Know?',        type: 'didyouknow'   },
  { id:11, name: 'AI Tutor',             type: 'ai-tutor'     },
  { id:12, name: 'Knowledge Check',      type: 'kc'           },
  { id:13, name: 'Practice Activity',    type: 'practice'     },
  { id:14, name: 'Lesson Summary',       type: 'summary'      },
  { id:15, name: 'Key Takeaways',        type: 'takeaways'    },
  { id:16, name: 'Flashcards',           type: 'flashcards'   },
  { id:17, name: 'Quiz',                 type: 'quiz'         },
  { id:18, name: 'Assignment',           type: 'assignment'   },
  { id:19, name: 'Revision Notes',       type: 'revision'     },
  { id:20, name: 'Next Lesson',          type: 'next'         }
];

// Full content for Lesson 1 (demo)
const LESSON_CONTENT_L1 = {
  lessonId: 'L1',
  steps: {
    overview: {
      title: 'The Financial Freedom Framework',
      subtitle: 'Module 1 · Lesson 1 · 35 min',
      description: 'This foundational lesson establishes the conceptual architecture for your entire financial life. You will learn to think in three distinct financial horizons — protection, accumulation, and distribution — and understand how professional financial practitioners use lifecycle models to sequence decisions correctly.',
      whatYouWillLearn: [
        'Define financial freedom beyond a net worth number',
        'Apply the three-horizon lifecycle model to personal finance decisions',
        'Distinguish between capital preservation, wealth accumulation, and distribution phases',
        'Identify the most common sequencing errors that derail financial plans'
      ]
    },
    intro: {
      title: 'Why Most Financial Advice Fails',
      body: `Every year, millions of people consume financial content — articles, videos, podcasts — yet few build lasting wealth. The failure is not usually one of information; it is one of framework. Without a coherent mental model, individual financial decisions remain disconnected: a mutual fund here, an insurance policy there, an FD because a relative recommended it. These decisions, made in isolation, often work against each other.

The Financial Freedom Framework changes that. It provides a unified model that sequences every financial decision — from your emergency fund to your retirement corpus — in the correct order. More importantly, it explains *why* each decision belongs in its assigned phase, so you can adapt the framework when your circumstances change.

At its core, this framework draws from three disciplines: actuarial science (how to price and transfer risk), investment theory (how to compound capital across time), and behavioural finance (how cognitive biases distort financial decisions). By the end of this lesson, you will have a working vocabulary for all three.`
    },
    objectives: {
      items: [
        { id: 1, text: 'Define financial freedom in quantifiable terms using the wealth replacement ratio concept', achieved: false },
        { id: 2, text: 'Apply the three-horizon model (Protection → Accumulation → Distribution) to sequence financial decisions correctly', achieved: false },
        { id: 3, text: 'Identify the four most common financial sequencing errors and their long-term cost', achieved: false },
        { id: 4, text: 'Build a simple financial health diagnostic using the framework\'s eight key metrics', achieved: false }
      ]
    },
    concepts: {
      sections: [
        {
          title: 'Wealth Replacement Ratio',
          body: 'Financial freedom is not a number — it is a ratio. Specifically, it is the point at which your passive income replaces 100% of your desired lifestyle expenses. A person earning ₹2 lakh/month who needs ₹1.5 lakh/month to sustain their lifestyle has a target wealth replacement ratio of 100% at a corpus of ₹4.5 crore (at 4% safe withdrawal rate). This reframes the goal from an abstract ₹10-crore target to a specific income-gap calculation.'
        },
        {
          title: 'The Three-Horizon Model',
          body: 'Professional financial planners organise a financial life into three sequential phases: Horizon 1 (Protection) ensures that catastrophic events — death, disability, critical illness, job loss — do not permanently derail the financial plan. This phase is boring but mission-critical. Horizon 2 (Accumulation) is where most of a financial life is spent — systematically building assets through earned income, savings discipline, and compounding. Horizon 3 (Distribution) involves converting the accumulated corpus into sustainable income streams for retirement, without depleting capital prematurely.'
        },
        {
          title: 'The Sequencing Imperative',
          body: 'The framework is sequential, not parallel. Beginning Horizon 2 (investments) before completing Horizon 1 (protection) is the most expensive mistake in personal finance. Consider: a ₹50 lakh equity portfolio without term insurance is not wealth — it is a contingent liability. One uninsured critical illness can liquidate five years of disciplined SIP investment. The framework enforces the correct order of operations.'
        }
      ]
    },
    terminology: {
      terms: [
        { term: 'Wealth Replacement Ratio (WRR)', definition: 'The ratio of passive income to lifestyle expenses. Financial freedom = WRR ≥ 100%.' },
        { term: 'Safe Withdrawal Rate (SWR)', definition: 'The maximum annual percentage of a corpus that can be withdrawn without depleting it over a 30-year retirement. Commonly cited at 3.5–4%.' },
        { term: 'Human Life Value (HLV)', definition: 'The present value of future earnings — used to calculate adequate life insurance cover.' },
        { term: 'Corpus', definition: 'The total accumulated investment pool dedicated to a specific financial goal.' },
        { term: 'Liquidity', definition: 'The ease and speed with which an asset can be converted to cash without significant price impact.' },
        { term: 'Compounding', definition: 'The process by which investment returns generate their own returns over time — the fundamental engine of wealth creation.' }
      ]
    },
    visual: {
      type: 'chart',
      title: 'The Three-Horizon Financial Lifecycle',
      description: 'How a typical earning career maps onto the three-horizon model, with protection as the constant foundation and accumulation peaking in mid-career.'
    },
    interactive: {
      type: 'wealth-calculator',
      title: 'Wealth Replacement Ratio Calculator',
      description: 'Enter your current monthly expenses and your target retirement age to compute your required corpus and WRR.'
    },
    examples: {
      items: [
        {
          title: 'Rajan\'s Sequencing Error',
          scenario: 'Rajan, a 32-year-old software engineer earning ₹18 LPA, invested aggressively in equity funds for 3 years (₹8 lakh corpus) but had no term insurance. A hospitalisation wiped his corpus and forced him to liquidate investments at a market low.',
          lesson: 'Protection must precede accumulation. A ₹1 crore term plan at his age costs ₹12,000/year — the cost of protecting 8 years of investment gains.'
        },
        {
          title: 'Priya\'s Correct Sequencing',
          scenario: 'Priya, 28, followed the three-horizon model: emergency fund first, term + health insurance second, then began SIPs in equity funds. During COVID-19 job loss, her 6-month emergency fund protected her equity investments from redemption.',
          lesson: 'Horizon 1 completion is what prevents Horizon 2 from being undone by life events.'
        }
      ]
    },
    casestudy: {
      company: 'The Mehta Family Financial Plan',
      background: 'The Mehta family — Arjun (40), Priya (37), two children aged 10 and 7 — approached a financial planner with ₹25 lakh in FDs, ₹8 lakh in LIC policies (endowment), and ₹12 lakh in a single equity mutual fund. Monthly income: ₹2.5 lakh. Monthly expenses: ₹1.8 lakh. No term insurance. No emergency fund.',
      analysis: 'Applying the three-horizon diagnostic revealed critical Horizon 1 gaps: Arjun\'s HLV was ₹3.2 crore, yet total life cover was ₹15 lakh (from the LIC policies). No health insurance beyond ESIC cover. Emergency fund: zero. The FDs were effectively serving as a pseudo-emergency fund but at opportunity cost. The equity fund had no goal assignment.',
      outcome: 'Restructured plan: ₹2 crore term plan + ₹10 lakh family floater health plan (annual cost: ₹38,000). ₹6 lakh emergency fund in liquid fund. ₹19 lakh FDs redirected into goal-specific equity and debt funds. LIC policies reviewed for surrender value vs. continuation cost.',
      questions: [
        'What was the single most critical risk in the Mehta family\'s existing financial position?',
        'How would you explain the opportunity cost of FDs to a client who views them as "safe"?',
        'Why is goal-assignment a prerequisite for portfolio construction?'
      ]
    },
    didYouKnow: {
      facts: [
        'The average Indian urban professional spends 47% of their income on EMIs, leaving less than 10% for long-term savings — below the 20% minimum the three-horizon framework recommends.',
        'DALBAR\'s annual Quantitative Analysis of Investor Behaviour shows that equity investors consistently underperform the market by 1.5–3% annually due to poor sequencing and behavioural errors — not bad fund selection.',
        'The concept of the "financial independence number" was mathematically formalised in the Trinity Study (1998), which originally established the 4% safe withdrawal rule for 30-year retirements.'
      ]
    },
    kc: {
      questions: [
        {
          id: 'kc1',
          question: 'Which of the following best defines financial freedom according to the Wealth Replacement Ratio concept?',
          options: [
            { id: 'a', text: 'Having a net worth of ₹10 crore or more' },
            { id: 'b', text: 'Passive income covering 100% of lifestyle expenses' },
            { id: 'c', text: 'Being debt-free with 6 months of emergency savings' },
            { id: 'd', text: 'Retiring before the age of 50' }
          ],
          correct: 'b',
          explanation: 'The Wealth Replacement Ratio frames financial freedom as a ratio of passive income to lifestyle expenses. WRR ≥ 100% means your investments generate enough income to fund your life indefinitely — regardless of the absolute net worth figure.'
        },
        {
          id: 'kc2',
          question: 'In the three-horizon model, which is the correct sequencing order?',
          options: [
            { id: 'a', text: 'Accumulation → Protection → Distribution' },
            { id: 'b', text: 'Distribution → Accumulation → Protection' },
            { id: 'c', text: 'Protection → Accumulation → Distribution' },
            { id: 'd', text: 'Protection → Distribution → Accumulation' }
          ],
          correct: 'c',
          explanation: 'Protection must be established first — without it, catastrophic events can destroy accumulated wealth. Only after Protection is complete should aggressive Accumulation begin. Distribution comes in the final phase, converting accumulated wealth into sustainable income.'
        }
      ]
    },
    flashcards: [
      { term: 'Wealth Replacement Ratio', definition: 'Passive income ÷ Lifestyle expenses. Financial freedom = WRR ≥ 100%.' },
      { term: 'Safe Withdrawal Rate', definition: 'Maximum annual % withdrawable from a corpus without depletion over 30 years. Typically 3.5–4%.' },
      { term: 'Three-Horizon Model', definition: 'Protection → Accumulation → Distribution — the correct sequencing of financial life phases.' },
      { term: 'Human Life Value (HLV)', definition: 'PV of future earnings; the basis for calculating adequate life insurance cover.' },
      { term: 'Compounding', definition: 'Returns generating their own returns over time — the fundamental engine of wealth creation.' },
      { term: 'Liquidity', definition: 'Ease of converting an asset to cash without significant price impact.' }
    ],
    quiz: {
      duration: 15, // minutes
      passMark: 70,
      questions: [
        {
          id: 'q1',
          question: 'A person earning ₹1.5 lakh/month passive income requires ₹1.2 lakh/month to sustain their lifestyle. Their Wealth Replacement Ratio is:',
          options: [
            { id: 'a', text: '80%' },
            { id: 'b', text: '100%' },
            { id: 'c', text: '125%' },
            { id: 'd', text: '150%' }
          ],
          correct: 'c',
          explanation: 'WRR = Passive income ÷ Lifestyle expenses = 1.5 ÷ 1.2 = 125%. A WRR above 100% means the person has achieved financial freedom with surplus.'
        },
        {
          id: 'q2',
          question: 'The Safe Withdrawal Rate of 4% implies a required corpus of ____ for an annual income need of ₹12 lakh.',
          options: [
            { id: 'a', text: '₹1.2 crore' },
            { id: 'b', text: '₹2 crore' },
            { id: 'c', text: '₹3 crore' },
            { id: 'd', text: '₹4 crore' }
          ],
          correct: 'c',
          explanation: 'Required corpus = Annual need ÷ SWR = ₹12 lakh ÷ 0.04 = ₹3 crore. At a 4% withdrawal rate, a ₹3 crore corpus generates ₹12 lakh annually.'
        },
        {
          id: 'q3',
          question: 'Investing in equity funds before establishing term insurance coverage violates which principle of the three-horizon model?',
          options: [
            { id: 'a', text: 'The Distribution principle' },
            { id: 'b', text: 'The Sequencing Imperative' },
            { id: 'c', text: 'The Compounding principle' },
            { id: 'd', text: 'The Diversification principle' }
          ],
          correct: 'b',
          explanation: 'The Sequencing Imperative states that Horizon 1 (Protection) must be complete before Horizon 2 (Accumulation) begins. Investing without protection exposes accumulated wealth to catastrophic event risk.'
        }
      ]
    },
    assignment: {
      title: 'Personal Financial Health Diagnostic',
      description: 'Using the three-horizon framework, conduct a diagnostic audit of your own financial position (or a hypothetical profile provided). Identify which horizon you are currently in, list all Horizon 1 gaps, calculate your current WRR, and propose the next three prioritised actions.',
      wordLimit: 500,
      rubric: ['Correct application of WRR formula', 'Identification of Horizon 1 gaps', 'Logical prioritisation of actions', 'Evidence of framework application']
    },
    summary: {
      keyPoints: [
        'Financial freedom is defined by the Wealth Replacement Ratio, not a fixed net worth number.',
        'The three-horizon model (Protection → Accumulation → Distribution) provides the correct sequencing framework for all financial decisions.',
        'The Sequencing Imperative: protection must precede accumulation — failure to do so creates catastrophic event risk.',
        'Compounding is the core mechanism of Horizon 2; starting early and staying consistent is more important than investment selection.'
      ]
    },
    takeaways: [
      '📐 Framework first: every individual financial decision should be evaluated against the three-horizon model before execution.',
      '🛡️ Protection is not optional: term insurance, health insurance, and emergency fund are the prerequisites for investment activity.',
      '📊 WRR is your north star: track it quarterly as your financial independence metric.',
      '⏳ Time is the scariest variable in compounding: a 5-year delay in starting Horizon 2 can reduce the terminal corpus by 40–60%.'
    ],
    revision: {
      notes: 'The Financial Freedom Framework = three-horizon model (Protection → Accumulation → Distribution) governed by the Sequencing Imperative. Key formulas: WRR = Passive Income ÷ Lifestyle Expenses; Required Corpus = Annual Income Need ÷ SWR; HLV = PV of Future Earnings. The framework is sequential — do not start Horizon 2 until Horizon 1 is complete.'
    }
  }
};

// ── QUIZ QUESTION BANK (Module Assessment samples) ────────────
const QUIZ_BANK = {
  M1: [
    {
      id: 'MA1-1',
      question: 'Which metric directly measures progress toward financial freedom?',
      options: [
        { id: 'a', text: 'Gross salary' },
        { id: 'b', text: 'Wealth Replacement Ratio' },
        { id: 'c', text: 'Credit score' },
        { id: 'd', text: 'Net worth' }
      ],
      correct: 'b',
      explanation: 'The Wealth Replacement Ratio (passive income ÷ lifestyle expenses) is the direct measure of financial independence, not absolute net worth or income.'
    },
    {
      id: 'MA1-2',
      question: 'A liquid fund is most appropriate for which financial horizon?',
      options: [
        { id: 'a', text: 'Horizon 2 — long-term equity accumulation' },
        { id: 'b', text: 'Horizon 1 — emergency fund parking' },
        { id: 'c', text: 'Horizon 3 — retirement income distribution' },
        { id: 'd', text: 'None of the above' }
      ],
      correct: 'b',
      explanation: 'Liquid funds provide same-day redemption with capital preservation characteristics, making them ideal for emergency fund parking in Horizon 1.'
    }
  ]
};

// ── USER STATE (mock authenticated learner) ───────────────────
const USER_STATE = {
  id: 'U001',
  name: 'Arjun Mehta',
  email: 'arjun.mehta@example.com',
  initials: 'AM',
  role: 'learner',
  joinedDate: '2025-01-15',
  currentLesson: { id: 'L4', stepIndex: 6 },

  progress: {
    lessonsCompleted: 3,
    totalLessons: 44,
    currentModule: 'M1',

    // Component scores (0–100)
    knowledgeChecks: 85,
    assignments: 78,
    quizzes: 82,
    moduleAssessments: 0,   // none yet attempted
    capstone: null,

    // Module-level progress
    modules: {
      M1: { status: 'in-progress', lessonsCompleted: 3, totalLessons: 6, pct: 50 },
      M2: { status: 'not-started', lessonsCompleted: 0, totalLessons: 5, pct: 0 },
      M3: { status: 'not-started', lessonsCompleted: 0, totalLessons: 6, pct: 0 },
      M4: { status: 'not-started', lessonsCompleted: 0, totalLessons: 5, pct: 0 },
      M5: { status: 'not-started', lessonsCompleted: 0, totalLessons: 6, pct: 0 },
      M6: { status: 'not-started', lessonsCompleted: 0, totalLessons: 5, pct: 0 },
      M7: { status: 'not-started', lessonsCompleted: 0, totalLessons: 6, pct: 0 },
      M8: { status: 'not-started', lessonsCompleted: 0, totalLessons: 5, pct: 0 }
    }
  },

  certification: {
    eligible: false,
    tier: null,
    weightedScore: null,
    professionalTracks: []
  }
};

// ── CERTIFICATION SCORING ENGINE ──────────────────────────────
const CERTIFICATION_CONFIG = {
  weights: {
    knowledgeChecks:   0.10,
    assignments:       0.20,
    quizzes:           0.30,
    moduleAssessments: 0.30,
    capstone:          0.10
  },
  tiers: [
    { name: 'Distinction', minScore: 90, color: 'var(--brass-500)', emoji: '🏅', requiresCapstoneExcellence: true },
    { name: 'Proficiency', minScore: 75, color: 'var(--sapphire-500)', emoji: '🎓', requiresCapstoneExcellence: false },
    { name: 'Completion',  minScore: 0,  color: 'var(--emerald-500)', emoji: '✅', requiresCapstoneExcellence: false }
  ],
  minimumRequirements: {
    perModuleAssessment: 70,
    capstone: 70,
    allQuizzesAttempted: true,
    allAssignmentsSubmitted: true
  }
};

// ── PROFESSIONAL TRACKS ───────────────────────────────────────
const PROFESSIONAL_TRACKS = [
  {
    id: 'banking',
    name: 'Banking Professional Certification',
    icon: '🏦',
    requiredModules: ['M2', 'M6'],
    requiredLessons: ['L7','L8','L9','L10','L11','L29','L30','L31','L32','L33'],
    eligibility: 'not-eligible',
    description: 'Validates expertise in Indian banking operations, monetary policy, fixed income markets, and credit risk analysis.'
  },
  {
    id: 'equity',
    name: 'Equity Research Analyst Certification',
    icon: '📈',
    requiredModules: ['M3', 'M5', 'M7'],
    requiredLessons: ['L12','L13','L14','L15','L16','L17','L23','L24','L25','L26','L27','L28','L34','L35','L36'],
    eligibility: 'not-eligible',
    description: 'Validates skills in equity market analysis, financial modelling, valuation methodologies, and derivatives strategy.'
  },
  {
    id: 'corp-finance',
    name: 'Corporate Finance Professional Certification',
    icon: '🏗️',
    requiredModules: ['M5'],
    requiredLessons: ['L23','L24','L25','L26','L27','L28'],
    requiresCapstoneB: true,
    eligibility: 'not-eligible',
    description: 'Validates proficiency in financial statement analysis, valuation, capital structure, and M&A — anchored by a Capstone Track B project.'
  }
];

// ── MARKETPLACE DATA ──────────────────────────────────────────
const SEEKERS = [
  {
    id: 'S001', name: 'Priya Sharma', initials: 'PS',
    location: 'Mumbai', graduationYear: 2024,
    credentialTier: 'Distinction', overallScore: 91.2,
    professionalTracks: ['Equity Research Analyst Certification'],
    capstoneTrack: 'B', capstoneTitle: 'DCF Valuation: Indian IT Sector Mid-Caps',
    researchContributions: 7,
    bio: 'Equity research enthusiast with a focus on Indian IT and FMCG sectors. Completed FinGeniQ with Distinction tier. CFA Level 1 candidate.',
    skills: ['Equity Valuation', 'Financial Modelling', 'DCF', 'Sector Analysis']
  },
  {
    id: 'S002', name: 'Rahul Nair', initials: 'RN',
    location: 'Bangalore', graduationYear: 2024,
    credentialTier: 'Proficiency', overallScore: 82.5,
    professionalTracks: ['Banking Professional Certification'],
    capstoneTrack: 'A', capstoneTitle: 'Personal Financial Independence Plan: 20-Year Projection',
    researchContributions: 3,
    bio: 'Banking and credit risk professional. Specialises in NBFC sector analysis and credit underwriting. FinGeniQ Banking Professional certified.',
    skills: ['Credit Analysis', 'Banking Operations', 'NBFC', 'Risk Management']
  },
  {
    id: 'S003', name: 'Kavya Reddy', initials: 'KR',
    location: 'Hyderabad', graduationYear: 2025,
    credentialTier: 'Distinction', overallScore: 94.1,
    professionalTracks: ['Equity Research Analyst Certification', 'Corporate Finance Professional Certification'],
    capstoneTrack: 'B', capstoneTitle: 'Investment Thesis: Pharma Sector Post-COVID Supply Chain Restructuring',
    researchContributions: 12,
    bio: 'Dual-certified analyst with research contributions in pharma and healthcare. Strong derivatives background and risk modelling skills.',
    skills: ['Derivatives', 'Risk Management', 'VaR', 'Sector Research', 'M&A Analysis']
  },
  {
    id: 'S004', name: 'Vikram Singh', initials: 'VS',
    location: 'Delhi', graduationYear: 2024,
    credentialTier: 'Proficiency', overallScore: 78.3,
    professionalTracks: ['Banking Professional Certification', 'Corporate Finance Professional Certification'],
    capstoneTrack: 'B', capstoneTitle: 'Business Case: Renewable Energy Project Finance',
    researchContributions: 5,
    bio: 'Project finance and infrastructure specialist. Background in renewable energy financing and structured debt. Completing CPA certification.',
    skills: ['Project Finance', 'Structured Products', 'Debt Markets', 'Modelling']
  },
  {
    id: 'S005', name: 'Ananya Krishnan', initials: 'AK',
    location: 'Chennai', graduationYear: 2025,
    credentialTier: 'Proficiency', overallScore: 80.8,
    professionalTracks: ['Equity Research Analyst Certification'],
    capstoneTrack: 'B', capstoneTitle: 'Equity Research Report: Auto Ancillary Sector',
    researchContributions: 4,
    bio: 'Auto sector research specialist with strong fundamental analysis skills. Published three sector research notes in the FinGeniQ Research Community.',
    skills: ['Fundamental Analysis', 'Equity Research', 'Ratio Analysis', 'Sector Mapping']
  },
  {
    id: 'S006', name: 'Aryan Gupta', initials: 'AG',
    location: 'Pune', graduationYear: 2024,
    credentialTier: 'Distinction', overallScore: 90.5,
    professionalTracks: ['Corporate Finance Professional Certification'],
    capstoneTrack: 'B', capstoneTitle: 'M&A Analysis: Indian Consumer Goods Consolidation',
    researchContributions: 8,
    bio: 'Corporate finance professional with deep M&A and valuation expertise. Distinction-tier certified. Target: Investment Banking analyst role.',
    skills: ['M&A', 'Valuation', 'LBO', 'Financial Modelling', 'Capital Markets']
  }
];

const JOB_POSTINGS = [
  {
    id: 'J001',
    title: 'Equity Research Associate',
    company: 'Motilal Oswal Financial Services',
    location: 'Mumbai · Hybrid',
    type: 'Full-time',
    requiredTier: 'Proficiency',
    requiredTrack: 'Equity Research Analyst Certification',
    salary: '₹8–12 LPA',
    posted: '3 days ago',
    description: 'Looking for a FinGeniQ-certified analyst to join our mid-cap equity research team. Will be responsible for company modelling, sector tracking, and co-authoring initiation reports.',
    skills: ['DCF Modelling', 'Financial Statement Analysis', 'Sector Research']
  },
  {
    id: 'J002',
    title: 'Credit Risk Analyst',
    company: 'HDFC Bank — Wholesale Banking',
    location: 'Mumbai · On-site',
    type: 'Full-time',
    requiredTier: 'Proficiency',
    requiredTrack: 'Banking Professional Certification',
    salary: '₹7–11 LPA',
    posted: '1 week ago',
    description: 'Credit analysis role within the Wholesale Banking division. Responsible for credit appraisals, borrower financial analysis, and exposure monitoring for mid-market corporate clients.',
    skills: ['Credit Analysis', 'Ratio Analysis', 'Banking Operations']
  },
  {
    id: 'J003',
    title: 'M&A Analyst — Investment Banking',
    company: 'Avendus Capital',
    location: 'Mumbai · On-site',
    type: 'Full-time',
    requiredTier: 'Distinction',
    requiredTrack: 'Corporate Finance Professional Certification',
    salary: '₹12–18 LPA',
    posted: '5 days ago',
    description: 'Analyst position in Avendus\' M&A advisory practice. Responsibilities include preparation of pitch books, financial models, valuation analyses, and transaction documentation for sell-side and buy-side mandates.',
    skills: ['M&A', 'Valuation', 'LBO Modelling', 'Pitchbook Preparation']
  },
  {
    id: 'J004',
    title: 'Fixed Income Research Analyst',
    company: 'ICICI Securities — Fixed Income Desk',
    location: 'Mumbai · Hybrid',
    type: 'Full-time',
    requiredTier: 'Proficiency',
    requiredTrack: 'Banking Professional Certification',
    salary: '₹9–13 LPA',
    posted: '2 days ago',
    description: 'Fixed income research role covering G-Sec and corporate bond markets. Will produce yield curve analysis, credit research notes, and bond market commentary for institutional clients.',
    skills: ['Fixed Income', 'Yield Curve Analysis', 'Credit Research']
  },
  {
    id: 'J005',
    title: 'Portfolio Analyst — Mutual Fund Research',
    company: 'Mirae Asset Investment Managers',
    location: 'Mumbai · Hybrid',
    type: 'Full-time',
    requiredTier: 'Proficiency',
    requiredTrack: null,
    salary: '₹8–12 LPA',
    posted: '1 day ago',
    description: 'Quantitative and qualitative analysis of mutual fund performance. Role involves portfolio attribution analysis, peer comparison, and support for fund manager\'s investment process.',
    skills: ['Portfolio Analysis', 'Mutual Funds', 'Alpha/Beta', 'Sharpe Ratio']
  }
];

// ── INSTITUTIONAL STANDARDS MILESTONES ─────────────────────────────
const SEBI_MILESTONES = [
  {
    id: 'MS1', status: 'achieved',
    icon: '✅',
    title: 'Proctored Assessment Infrastructure',
    description: 'Deployment of webcam-based proctoring with tab-switch detection and timer enforcement for all Module Assessments. Enterprise security validated.',
    targetDate: 'Q2 2025', achievedDate: 'Q1 2025',
    owner: 'FinGeniQ Technology Team',
    notes: 'Completed ahead of schedule. Enterprise proctoring engine operational.'
  },
  {
    id: 'MS2', status: 'achieved',
    icon: '✅',
    title: 'External Question Bank Audit',
    description: 'Independent audit of all 880+ assessment questions across 44 lessons by chartered accountants and CFA charterholders for technical accuracy and relevance.',
    targetDate: 'Q4 2025', achievedDate: 'Q3 2025',
    owner: 'External Financial Audit Partner',
    notes: 'Audit completed. 47 questions revised; 12 retired and replaced.'
  },
  {
    id: 'MS3', status: 'active',
    icon: '🔄',
    title: 'Industry Advisory Board Formation',
    description: 'Constituting an Industry Advisory Board comprising seasoned portfolio managers, CFA charterholders, and market practitioners to provide ongoing curriculum oversight.',
    targetDate: 'Q1 2026',
    owner: 'FinGeniQ Governance Committee',
    notes: 'Board constitution in progress. Senior financial faculty confirmed.'
  },
  {
    id: 'MS4', status: 'planned',
    icon: '📋',
    title: 'Global Curriculum Benchmarking',
    description: 'Benchmarking curriculum against international standards including CFA Institute guidelines and corporate finance professional bodies.',
    targetDate: 'Q3 2026',
    owner: 'FinGeniQ Academic & Curriculum Team',
    notes: 'Active alignment across equity, derivatives, and wealth management.'
  },
  {
    id: 'MS5', status: 'planned',
    icon: '🎯',
    title: 'Industry Employer Integration',
    description: 'Expanding verified credential recognition across top asset managers, investment banks, and corporate treasuries.',
    targetDate: 'Q4 2026',
    owner: 'FinGeniQ Institutional Partnerships',
    notes: 'Continuous corporate partner onboarding for certified talent.'
  }
];

// ── EQUIVALENCE MAPPING TABLE ─────────────────────────────────
const EQUIVALENCE_MAP = [
  {
    fingeniQ: 'Module 1: Personal Finance Foundations',
    ca_icwa: 'CA Foundation: Business Economics (partial)',
    cfa: 'CFA L1: Personal Finance Concepts (partial)',
    bpf: 'BPF Year 1: Personal Financial Planning',
    note: 'Gap map only — not a claim of equivalence'
  },
  {
    fingeniQ: 'Module 2: Banking & Financial Institutions',
    ca_icwa: 'CA Intermediate: SFM — Banking (partial)',
    cfa: 'CFA L1: Economics — Monetary Policy',
    bpf: 'BPF Year 2: Financial Institutions & Markets',
    note: 'Gap map only — not a claim of equivalence'
  },
  {
    fingeniQ: 'Module 3: Equity Markets & Investing',
    ca_icwa: 'CA Final: SFM — Capital Markets',
    cfa: 'CFA L1: Equity Investments',
    bpf: 'BPF Year 2: Securities Markets',
    note: 'Gap map only — not a claim of equivalence'
  },
  {
    fingeniQ: 'Module 5: Corporate Finance & Valuation',
    ca_icwa: 'CA Final: SFM — Valuation & M&A',
    cfa: 'CFA L2: Equity Valuation, Corporate Finance',
    bpf: 'BPF Year 3: Corporate Finance & Valuation',
    note: 'Gap map only — not a claim of equivalence'
  },
  {
    fingeniQ: 'Module 7: Derivatives & Risk Management',
    ca_icwa: 'CA Final: SFM — Derivatives',
    cfa: 'CFA L1/L2: Derivatives, Risk Management',
    bpf: 'BPF Year 3: Financial Risk Management',
    note: 'Gap map only — not a claim of equivalence'
  }
];

// ── HELPER FUNCTIONS ──────────────────────────────────────────
function getLessonById(id) {
  return LESSONS.find(l => l.id === id) || null;
}

function getModuleById(id) {
  return MODULES.find(m => m.id === id) || null;
}

function getLessonsByModule(moduleId) {
  return LESSONS.filter(l => l.moduleId === moduleId).sort((a,b) => a.order - b.order);
}

function computeWeightedScore(scores) {
  const w = CERTIFICATION_CONFIG.weights;
  if (!scores.moduleAssessments || !scores.capstone) return null;
  return (
    (scores.knowledgeChecks   * w.knowledgeChecks)   +
    (scores.assignments        * w.assignments)        +
    (scores.quizzes            * w.quizzes)            +
    (scores.moduleAssessments  * w.moduleAssessments)  +
    (scores.capstone           * w.capstone)
  );
}

function assignTier(weightedScore, capstoneExcellence) {
  if (weightedScore >= 90 && capstoneExcellence) return CERTIFICATION_CONFIG.tiers[0]; // Distinction
  if (weightedScore >= 75) return CERTIFICATION_CONFIG.tiers[1]; // Proficiency
  return CERTIFICATION_CONFIG.tiers[2]; // Completion
}

function getStatusColor(status) {
  const map = {
    'completed': 'var(--emerald-500)',
    'in-progress': 'var(--amber-500)',
    'not-started': 'var(--ink-600)',
    'locked': 'var(--rose-500)'
  };
  return map[status] || map['not-started'];
}

function isModuleUnlocked(moduleId) {
  const module = getModuleById(moduleId);
  if (!module || module.prerequisiteModuleIds.length === 0) return true;
  return module.prerequisiteModuleIds.every(prereqId => {
    const prereqModule = getModuleById(prereqId);
    return USER_STATE.progress.modules[prereqId]?.status === 'completed';
  });
}

// Export as global
window.FQ = {
  MODULES, LESSONS, LESSON_STEPS, LESSON_CONTENT_L1, QUIZ_BANK,
  USER_STATE, CERTIFICATION_CONFIG, PROFESSIONAL_TRACKS,
  SEEKERS, JOB_POSTINGS, SEBI_MILESTONES, EQUIVALENCE_MAP,
  getLessonById, getModuleById, getLessonsByModule,
  computeWeightedScore, assignTier, getStatusColor, isModuleUnlocked
};
