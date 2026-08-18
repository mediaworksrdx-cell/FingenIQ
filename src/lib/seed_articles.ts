/**
 * Seed script to insert the original hardcoded community articles
 * into the community_articles table.
 *
 * Run: node --import tsx src/lib/seed_articles.ts
 * Or simply restart the dev server — this is called from db.ts on startup.
 */
import { db, createArticle, getPublishedArticles } from './db';

const SEED_ARTICLES = [
  {
    slug: 'post-jio-capital-restructuring-fcf-analysis',
    title: 'Post-Jio Capital Restructuring & Free Cash Flow Analysis',
    summary: "Evaluating RIL's strategic balance sheet shift post-Jio. EBITDA growth projections map against interest expense scales across three financial statement horizons.",
    body: `Reliance Industries Limited's transformation from a petrochemicals conglomerate to a digital-first consumer empire represents one of the most ambitious capital restructuring exercises in Indian corporate history.\n\n## The Strategic Pivot\n\nThe Jio platform launch in 2016 was not merely a telecom play — it was a deliberate rebalancing of RIL's capital structure. The company deployed over ₹3.5 lakh crore in capital expenditure across digital infrastructure, retail expansion, and new energy ventures.\n\n## Free Cash Flow Dynamics\n\nPost-rights issue and strategic stake sales (Facebook, Google, Intel), RIL achieved near-zero net debt for the first time in a decade. The EBITDA margin expanded from 14.2% to 18.7% across the consolidated entity, driven by digital services contributing 32% of operating profit.\n\n## Three-Horizon Financial Model\n\n**Horizon 1 (0–3 years):** Retail and digital services drive operating cash flow growth at 22% CAGR. Capex intensity moderates as 5G rollout completes.\n\n**Horizon 2 (3–7 years):** New energy business (solar, hydrogen, battery) requires fresh capital allocation of ₹75,000 crore but generates strategic optionality.\n\n**Horizon 3 (7+ years):** Full transition to a consumer-technology-energy conglomerate with predictable subscription-based recurring revenue.\n\n## Investment Thesis\n\nAt current valuations, RIL trades at 24x forward EV/EBITDA — a premium justified by its diversified growth engines and improving return on capital employed (ROCE) trajectory from 9.1% to a projected 13.4% by FY28.`,
    author_id: 'U_ADMIN_SEED',
    author_name: 'Priya Sharma',
    author_bio: 'Senior Equity Analyst • CFA Level III',
    company: 'Reliance Industries',
    sector: 'Energy & Retail',
    concept: 'Capital Structure & Valuation',
    rating: 'Highly Commended',
    score: 8.5,
    read_time: 12,
    linked_companies: '["Jio Financial Services", "HDFC Bank"]',
    published: 1,
  },
  {
    slug: 'ev-transition-dynamics-capex-debt-projections',
    title: 'EV Transition Dynamics: Capital Expenditure vs Debt Projections',
    summary: "Analysing capital structure leverage parameters supporting Jaguar Land Rover's EV pivot and battery manufacturing capital allocation timelines.",
    body: `The automotive industry's transition to electric vehicles represents a fundamental restructuring of capital allocation priorities. Tata Motors, through its Jaguar Land Rover subsidiary, faces a unique challenge: financing a complete powertrain transition while maintaining competitiveness in the premium segment.\n\n## The Capital Intensity Problem\n\nEV transitions require 40–60% higher capital expenditure per vehicle platform compared to ICE equivalents. JLR's "Reimagine" strategy commits £15 billion over five years — a significant bet for a company with a net automotive debt of £3.4 billion.\n\n## Debt-to-Equity Dynamics\n\nTata Motors' consolidated D/E ratio has improved from 2.8x (FY21) to 1.4x (FY26), driven by JLR's improved profitability and Tata Motors India's EV market leadership. However, the upcoming capex cycle threatens to reverse this trend.\n\n## Battery Manufacturing Economics\n\nThe decision to establish in-house battery cell manufacturing (vs. procurement from CATL/BYD) adds ₹15,000 crore to the capex bill but reduces long-term variable costs by 18–22% per kWh.\n\n## Risk Assessment Matrix\n\n| Risk Factor | Probability | Impact | Mitigation |\n|---|---|---|---|\n| Battery cost inflation | Medium | High | Vertical integration |\n| EV demand slowdown | Low | Critical | Hybrid bridge strategy |\n| Supply chain disruption | Medium | Medium | Multi-source procurement |\n| Technology obsolescence | Low | High | Modular platform architecture |\n\n## Conclusion\n\nTata Motors is well-positioned for the EV transition, but investors should monitor the D/E ratio closely over the next 8 quarters. A breach above 2.0x would signal over-leverage.`,
    author_id: 'U_ADMIN_SEED',
    author_name: 'Aryan Gupta',
    author_bio: 'Capital Markets Researcher • IIM Ahmedabad',
    company: 'Tata Motors',
    sector: 'Automobile',
    concept: 'Supply Chain Risk & Leverage',
    rating: 'Top Tier',
    score: 9.0,
    read_time: 15,
    linked_companies: '["Tata Power", "CRISIL"]',
    published: 1,
  },
  {
    slug: 'post-merger-nim-compression-hdfc-integration',
    title: 'Post-Merger NIM Compression Analysis: HDFC Ltd Integration',
    summary: "A quantitative assessment of Net Interest Margin dynamics following the merger. Evaluates deposit mobilization vs loan book repricing over four quarters.",
    body: `The HDFC Bank–HDFC Ltd merger, completed in July 2023, created India's largest private sector bank by assets. Three years on, the NIM trajectory tells a nuanced story of integration challenges and emerging opportunities.\n\n## Pre-Merger Baseline\n\nHDFC Bank's standalone NIM averaged 4.1% over FY20–23, among the highest in Indian banking. HDFC Ltd, as an NBFC, operated at a structural NIM disadvantage of ~2.8% due to wholesale funding dependence.\n\n## Post-Merger NIM Trajectory\n\n**Quarter 1–4 (Jul 2023 – Jun 2024):** Blended NIM compressed to 3.4% as the high-cost HDFC Ltd loan book diluted margins. Deposit mobilization lagged loan book transfer.\n\n**Quarter 5–8 (Jul 2024 – Jun 2025):** Gradual recovery to 3.7% as CASA ratio improved from 38% to 43%. Retail deposit campaigns (particularly in semi-urban/rural) contributed ₹2.1 lakh crore in incremental low-cost deposits.\n\n**Quarter 9–12 (Jul 2025 – Jun 2026):** NIM approaching 3.9% with full deposit franchise integration. The erstwhile HDFC Ltd loan book is now 60% funded through bank deposits vs. 100% wholesale borrowing pre-merger.\n\n## Credit Quality Assessment\n\nGross NPA ratio remained stable at 1.2–1.3%, suggesting robust underwriting standards were maintained through the integration period. The construction finance portfolio (inherited from HDFC Ltd) requires close monitoring given real estate cyclicality.\n\n## Forward Outlook\n\nWe expect NIM to recover to 4.0%+ by FY28 as the remaining wholesale borrowings mature and are replaced by deposit funding. The combined entity's operating leverage should drive a 200bps improvement in cost-to-income ratio.`,
    author_id: 'U_ADMIN_SEED',
    author_name: 'Meera Iyer',
    author_bio: 'Banking & NBFC Specialist • NISM Certified',
    company: 'HDFC Bank',
    sector: 'Banking & NBFC',
    concept: 'NIM Compression & Credit Risk',
    rating: 'Commended',
    score: 7.8,
    read_time: 10,
    linked_companies: '["ICICI Bank", "Kotak Mahindra Bank"]',
    published: 1,
  },
  {
    slug: 'ai-services-integration-impact-it-operating-margins',
    title: 'AI Services Integration Impact on IT Services Operating Margins',
    summary: "Building a 3-stage DCF model accounting for Generative AI deflationary pressure on legacy IT maintenance contracts vs high-margin transformation deals.",
    body: `The emergence of Generative AI poses a structural challenge to the Indian IT services industry's business model. This analysis constructs a three-stage DCF model for Infosys, incorporating AI's dual impact: margin compression on legacy services and margin expansion on transformation deals.\n\n## The AI Disruption Thesis\n\nApproximately 35% of Indian IT revenue comes from maintenance and support contracts — precisely the category most vulnerable to AI-driven automation. Conversely, AI implementation and consulting services command 2–3x higher billing rates.\n\n## Three-Stage DCF Model\n\n### Stage 1: Disruption (FY26–28)\n- Legacy revenue contracts decline at 8–12% annually as clients adopt AI-powered alternatives\n- AI consulting revenue grows at 45–60% but from a low base (currently ~8% of revenue)\n- Net revenue growth: 3–5% (below historical 12% CAGR)\n- Operating margin: contracts to 19–20% from 21.5%\n\n### Stage 2: Transformation (FY29–32)\n- AI services reach scale at 25–30% of revenue\n- Blended billing rates stabilize as premium AI work offsets commodity service erosion\n- Net revenue growth recovers to 10–12%\n- Operating margin expands to 22–24% driven by AI-augmented delivery efficiency\n\n### Stage 3: Steady State (FY33+)\n- AI-native delivery model fully integrated\n- Terminal growth rate: 4% (aligned with global IT spending growth)\n- Terminal margin: 23%\n\n## Valuation Summary\n\nUsing a WACC of 11.5% and the three-stage model:\n- **Bear case:** ₹1,420 per share (legacy erosion faster than AI adoption)\n- **Base case:** ₹1,780 per share (balanced transition)\n- **Bull case:** ₹2,250 per share (AI consulting grows faster, margin expansion)\n\nCurrent market price of ₹1,650 implies the market is pricing in a scenario between bear and base cases — suggesting potential upside if Infosys executes its AI strategy effectively.`,
    author_id: 'U_ADMIN_SEED',
    author_name: 'Vikramaditya Roy',
    author_bio: 'Quantitative Finance Analyst • FRM',
    company: 'Infosys',
    sector: 'Technology & IT',
    concept: 'DCF Valuation & Disruption',
    rating: 'Top Tier',
    score: 9.2,
    read_time: 18,
    linked_companies: '["TCS", "Wipro"]',
    published: 1,
  },
];

export function seedCommunityArticles() {
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO community_articles (
      slug, title, summary, body, author_id, author_name, author_bio,
      company, sector, concept, rating, score, read_time,
      linked_companies, published, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  for (const article of SEED_ARTICLES) {
    try {
      insertStmt.run(
        article.slug, article.title, article.summary, article.body,
        article.author_id, article.author_name, article.author_bio || '',
        article.company || '', article.sector || '', article.concept || '',
        article.rating || '', article.score || 0, article.read_time || 5,
        article.linked_companies || '[]', article.published ?? 0, now, now
      );
    } catch {
      // Ignore
    }
  }
}
