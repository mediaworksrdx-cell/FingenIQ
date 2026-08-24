const fs = require('fs');
const path = require('path');

const lessonsDir = path.join(__dirname, '..', 'Lessons', 'content');
const publicDir = path.join(__dirname, '..', 'public', 'lessons');

// Module color schemes
const MODULE_COLORS = {
  M1: { bg1: '#e0f2fe', bg2: '#bae6fd', accent: '#0284c7', text: '#0c4a6e' },
  M2: { bg1: '#dcfce7', bg2: '#bbf7d0', accent: '#16a34a', text: '#14532d' },
  M3: { bg1: '#fef9c3', bg2: '#fde68a', accent: '#ca8a04', text: '#713f12' },
  M4: { bg1: '#fce7f3', bg2: '#fbcfe8', accent: '#db2777', text: '#831843' },
  M5: { bg1: '#ede9fe', bg2: '#ddd6fe', accent: '#7c3aed', text: '#3b0764' },
  M6: { bg1: '#d1fae5', bg2: '#a7f3d0', accent: '#059669', text: '#064e3b' },
  M7: { bg1: '#ffedd5', bg2: '#fed7aa', accent: '#ea580c', text: '#7c2d12' },
  M8: { bg1: '#f1f5f9', bg2: '#e2e8f0', accent: '#475569', text: '#0f172a' },
};

const STEP_EMOJIS = ['📋', '👋', '🎯', '📖', '🔤', '📊', '💡', '📖', '✨', '🤖', '❓', '🛠️', '📝', '🔑', '📇', '📝', '✍️', '📚', '⏭️'];

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxCharsPerLine, maxLines) {
  const words = text.split(/\s+/);
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
  const descLines = wrapText(stepDescription, 70, 5);
  const titleLines = wrapText(lessonTitle, 45, 2);
  
  let descTspans = descLines.map((line, i) => 
    `<tspan x="640" dy="${i === 0 ? 0 : 26}">${escapeXml(line)}</tspan>`
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
      <stop offset="100%" stop-color="${colors.accent}88"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1280" height="720" fill="url(#bg)"/>
  
  <!-- Top accent bar -->
  <rect x="0" y="0" width="1280" height="6" fill="url(#accent)"/>
  
  <!-- Lesson badge -->
  <rect x="50" y="30" width="100" height="36" rx="18" fill="${colors.accent}" opacity="0.15"/>
  <text x="100" y="54" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="${colors.accent}">${escapeXml(lessonId)}</text>
  
  <!-- Slide counter -->
  <rect x="1130" y="30" width="100" height="36" rx="18" fill="${colors.text}" opacity="0.08"/>
  <text x="1180" y="54" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="${colors.text}" opacity="0.6">${slideNum} of ${totalSlides}</text>
  
  <!-- Emoji icon -->
  <text x="640" y="180" text-anchor="middle" font-size="72">${emoji}</text>
  
  <!-- Lesson title -->
  <text text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="36" font-weight="700" fill="${colors.text}" y="260">
    ${titleTspans}
  </text>
  
  <!-- Divider -->
  <rect x="560" y="${260 + titleLines.length * 42 + 10}" width="160" height="3" rx="2" fill="${colors.accent}" opacity="0.4"/>
  
  <!-- Step name -->
  <text x="640" y="${260 + titleLines.length * 42 + 50}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="600" fill="${colors.accent}">${escapeXml(stepName)}</text>
  
  <!-- Description -->
  <text text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="${colors.text}" opacity="0.7" y="${260 + titleLines.length * 42 + 95}">
    ${descTspans}
  </text>
  
  <!-- Bottom watermark -->
  <text x="640" y="690" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="${colors.text}" opacity="0.25" font-weight="600">FinGenIQ · Financial Intelligence Platform</text>
</svg>`;
}

// Process all lessons
let updatedCount = 0;
let svgCount = 0;

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

  // Create SVG directory
  const svgDir = path.join(publicDir, lessonId);
  fs.mkdirSync(svgDir, { recursive: true });

  // Generate 3 SVGs from first 3 steps
  const slideCount = Math.min(3, steps.length || 3);
  const galleryImages = [];

  for (let s = 0; s < slideCount; s++) {
    const step = steps[s] || { name: `Step ${s + 1}`, description: `Content for step ${s + 1} of ${title}` };
    const emoji = STEP_EMOJIS[s] || '📋';
    const svg = generateSVG(title, step.name, step.description, s + 1, slideCount, colors, emoji, lessonId);
    
    const svgFile = path.join(svgDir, `slide-${s + 1}.svg`);
    fs.writeFileSync(svgFile, svg, 'utf8');
    galleryImages.push(`/lessons/${lessonId}/slide-${s + 1}.svg`);
    svgCount++;
  }

  // Add galleryImages to JSON
  data.galleryImages = galleryImages;
  fs.writeFileSync(lessonFile, JSON.stringify(data, null, 2), 'utf8');
  updatedCount++;
  console.log(`✓ ${lessonId}: ${slideCount} SVGs + JSON updated`);
}

console.log(`\n✅ Done: ${updatedCount} lesson JSONs updated, ${svgCount} SVG slides created`);
