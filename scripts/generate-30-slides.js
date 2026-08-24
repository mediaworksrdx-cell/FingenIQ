const fs = require('fs');
const path = require('path');

const lessonsDir = path.join(__dirname, '..', 'Lessons', 'content');
const publicDir = path.join(__dirname, '..', 'public', 'lessons');

// Module color schemes
const MODULE_COLORS = {
  M1: { bg1: '#eff6ff', bg2: '#dbeafe', accent: '#0284c7', text: '#0c4a6e', sub: '#0369a1' },
  M2: { bg1: '#f0fdf4', bg2: '#dcfce7', accent: '#16a34a', text: '#14532d', sub: '#15803d' },
  M3: { bg1: '#fefce8', bg2: '#fef08a', accent: '#ca8a04', text: '#713f12', sub: '#a16207' },
  M4: { bg1: '#fdf2f8', bg2: '#fce7f3', accent: '#db2777', text: '#831843', sub: '#be185d' },
  M5: { bg1: '#faf5ff', bg2: '#f3e8ff', accent: '#9333ea', text: '#3b0764', sub: '#7e22ce' },
  M6: { bg1: '#ecfdf5', bg2: '#d1fae5', accent: '#059669', text: '#064e3b', sub: '#047857' },
  M7: { bg1: '#fff7ed', bg2: '#ffedd5', accent: '#ea580c', text: '#7c2d12', sub: '#c2410c' },
  M8: { bg1: '#f8fafc', bg2: '#f1f5f9', accent: '#475569', text: '#0f172a', sub: '#334155' },
};

const EXTRA_STEP_TEMPLATES = [
  { name: 'Financial Modelling & Projections', emoji: '📈', desc: 'Build dynamic 3-statement models and financial projections to quantify growth vectors and evaluate capital allocation.' },
  { name: 'Risk Horizon & Stress Testing', emoji: '🛡️', desc: 'Stress test financial scenarios under tail-risk events, liquidity crunches, and shifting macroeconomic interest rates.' },
  { name: 'Quantitative Formulas & Ratios', emoji: '∑', desc: 'Calculate critical financial health metrics: ROIC, WACC, Sharpe Ratio, Debt-to-Equity, and Free Cash Flow Yield.' },
  { name: 'Behavioral Biases & Pitfalls', emoji: '🧠', desc: 'Identify cognitive traps including loss aversion, recency bias, and herd mentality that erode portfolio alpha.' },
  { name: 'Industry Multiples & Benchmarking', emoji: '📊', desc: 'Compare EV/EBITDA, P/E, and Price-to-Book multiples across peers to establish relative valuation boundaries.' },
  { name: 'Macroeconomic Drivers & Interest Rates', emoji: '🌐', desc: 'Analyze central bank policies, inflation curves, yield spreads, and foreign exchange dynamics on asset prices.' },
  { name: 'Governance & Regulatory Compliance', emoji: '⚖️', desc: 'Ensure strict institutional adherence to accounting standards, SEBI/SEC guidelines, and ESG disclosure norms.' },
  { name: 'Scenario Analysis: Bull, Base & Bear', emoji: '🎲', desc: 'Model three distinct probability-weighted outcomes to establish a margin of safety before capital deployment.' },
  { name: 'Execution Playbook & Action Checklist', emoji: '✅', desc: 'Step-by-step checklist to systematically deploy capital, rebalance weights, and monitor performance quarterly.' },
  { name: 'Master Executive Summary', emoji: '🏆', desc: 'Synthesize all 30 analytical frameworks, qualitative filters, and quantitative metrics into a unified thesis.' },
  { name: 'Capstone Application & Next Steps', emoji: '🎓', desc: 'Apply these principles directly to your Capstone portfolio case study and advance toward verified certification.' },
];

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxCharsPerLine, maxLines) {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxCharsPerLine) {
      lines.push(current.trim());
      current = word;
      if (lines.length >= maxLines) break;
    } else {
      current += ' ' + word;
    }
  }
  if (lines.length < maxLines && current.trim()) {
    lines.push(current.trim());
  }
  if (lines.length === maxLines) {
    lines[maxLines - 1] = lines[maxLines - 1].substring(0, maxCharsPerLine - 3) + '...';
  }
  return lines;
}

function generateSVG(lessonTitle, stepName, stepDescription, slideNum, totalSlides, colors, emoji, lessonId) {
  const descLines = wrapText(stepDescription, 68, 5);
  const titleLines = wrapText(lessonTitle, 44, 2);
  
  let descTspans = descLines.map((line, i) => 
    `<tspan x="640" dy="${i === 0 ? 0 : 28}">${escapeXml(line)}</tspan>`
  ).join('\n        ');

  let titleTspans = titleLines.map((line, i) =>
    `<tspan x="640" dy="${i === 0 ? 0 : 42}">${escapeXml(line)}</tspan>`
  ).join('\n        ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors.bg1}"/>
      <stop offset="100%" stop-color="${colors.bg2}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${colors.accent}"/>
      <stop offset="100%" stop-color="${colors.accent}99"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.08"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1280" height="720" fill="url(#bg)"/>
  
  <!-- Card Container -->
  <rect x="60" y="40" width="1160" height="640" rx="20" fill="#ffffff" filter="url(#shadow)" opacity="0.92"/>
  <rect x="60" y="40" width="1160" height="640" rx="20" fill="none" stroke="${colors.accent}" stroke-width="1.5" opacity="0.25"/>
  
  <!-- Top accent bar -->
  <rect x="60" y="40" width="1160" height="6" rx="3" fill="url(#accent)"/>
  
  <!-- Lesson badge -->
  <rect x="90" y="65" width="110" height="34" rx="17" fill="${colors.accent}" opacity="0.12"/>
  <text x="145" y="87" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="${colors.accent}">${escapeXml(lessonId)}</text>
  
  <!-- Slide counter badge -->
  <rect x="1080" y="65" width="110" height="34" rx="17" fill="${colors.accent}" opacity="0.12"/>
  <text x="1135" y="87" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="${colors.accent}">${slideNum} of ${totalSlides}</text>
  
  <!-- Emoji Icon -->
  <text x="640" y="195" text-anchor="middle" font-size="64">${emoji}</text>
  
  <!-- Lesson Title -->
  <text text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-weight="700" fill="${colors.text}" y="260">
    ${titleTspans}
  </text>
  
  <!-- Divider -->
  <rect x="540" y="${260 + titleLines.length * 42 + 8}" width="200" height="3" rx="1.5" fill="${colors.accent}" opacity="0.45"/>
  
  <!-- Step Name -->
  <text x="640" y="${260 + titleLines.length * 42 + 48}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="${colors.sub}">${escapeXml(stepName)}</text>
  
  <!-- Step Description -->
  <text text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#334155" y="${260 + titleLines.length * 42 + 95}">
    ${descTspans}
  </text>
  
  <!-- Bottom watermark -->
  <text x="640" y="650" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#64748b" opacity="0.6" font-weight="600">FinGenIQ · Institutional Financial Intelligence</text>
</svg>`;
}

const STEP_ICONS = ['📋', '👋', '🎯', '📖', '🔤', '📊', '💡', '📖', '✨', '🤖', '❓', '🛠️', '📝', '🔑', '📇', '📝', '✍️', '📚', '⏭️'];

// Process all 44 lessons
let updatedCount = 0;
let totalSvgCount = 0;

for (let i = 1; i <= 44; i++) {
  const lessonFile = path.join(lessonsDir, `L${i}.json`);
  if (!fs.existsSync(lessonFile)) {
    console.log(`⚠ L${i}.json not found, skipping`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(lessonFile, 'utf8'));
  const lessonId = data.id || `L${i}`;
  const moduleId = data.moduleId || 'M1';
  const colors = MODULE_COLORS[moduleId] || MODULE_COLORS.M1;
  const title = data.title || `Lesson ${i}`;
  const steps = data.steps || [];

  const svgDir = path.join(publicDir, lessonId);
  fs.mkdirSync(svgDir, { recursive: true });

  const galleryImages = [];

  for (let s = 1; s <= 30; s++) {
    let stepName = '';
    let stepDesc = '';
    let emoji = '📊';

    if (s <= steps.length) {
      const step = steps[s - 1];
      stepName = step.name || `Step ${s}`;
      stepDesc = step.description || `Key concepts and principles of ${stepName}.`;
      emoji = STEP_ICONS[(s - 1) % STEP_ICONS.length] || '📖';
    } else {
      const extraIdx = (s - steps.length - 1) % EXTRA_STEP_TEMPLATES.length;
      const extra = EXTRA_STEP_TEMPLATES[extraIdx];
      stepName = extra.name;
      stepDesc = `${title}: ${extra.desc}`;
      emoji = extra.emoji;
    }

    const svg = generateSVG(title, stepName, stepDesc, s, 30, colors, emoji, lessonId);
    const svgFile = path.join(svgDir, `slide-${s}.svg`);
    fs.writeFileSync(svgFile, svg, 'utf8');
    galleryImages.push(`/lessons/${lessonId}/slide-${s}.svg`);
    totalSvgCount++;
  }

  data.galleryImages = galleryImages;
  fs.writeFileSync(lessonFile, JSON.stringify(data, null, 2), 'utf8');
  updatedCount++;
  console.log(`✓ ${lessonId}: Generated 30 SVGs + updated JSON`);
}

console.log(`\n============================================================`);
console.log(`✅ Complete: ${updatedCount} lesson JSONs updated, ${totalSvgCount} SVG slides generated!`);
console.log(`============================================================`);
