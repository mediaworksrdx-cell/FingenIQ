#!/usr/bin/env node
/**
 * generate-placeholder-slides.js
 *
 * Generates 3 SVG placeholder slide images per lesson (L1–L44)
 * and updates each lesson JSON with galleryImages paths.
 */

const fs = require('fs');
const path = require('path');

// ── Paths ──────────────────────────────────────────────────────────────────────
const PROJECT_ROOT = path.resolve(__dirname, '..');
const LESSONS_DIR = path.join(PROJECT_ROOT, 'Lessons', 'content');
const PUBLIC_LESSONS_DIR = path.join(PROJECT_ROOT, 'public', 'lessons');

// ── Module colour palette ──────────────────────────────────────────────────────
const MODULE_COLORS = {
  M1: { bg: '#f0f9ff', accent: '#3b82f6', dark: '#1e3a5f', label: 'blue' },
  M2: { bg: '#f0fdf4', accent: '#22c55e', dark: '#14532d', label: 'green' },
  M3: { bg: '#fef3c7', accent: '#f59e0b', dark: '#78350f', label: 'amber' },
  M4: { bg: '#fdf2f8', accent: '#ec4899', dark: '#831843', label: 'pink' },
  M5: { bg: '#f5f3ff', accent: '#8b5cf6', dark: '#4c1d95', label: 'purple' },
  M6: { bg: '#ecfdf5', accent: '#10b981', dark: '#064e3b', label: 'teal' },
  M7: { bg: '#fff7ed', accent: '#f97316', dark: '#7c2d12', label: 'orange' },
  M8: { bg: '#f8fafc', accent: '#64748b', dark: '#1e293b', label: 'slate' },
};

// ── Step-type icons (SVG-safe unicode / text) ──────────────────────────────────
const STEP_ICONS = {
  overview:    '📋',
  intro:       '🚀',
  objectives:  '🎯',
  concepts:    '💡',
  terminology: '📖',
  visual:      '📊',
  examples:    '🔍',
  casestudy:   '📈',
  didyouknow:  '❓',
  'ai-tutor':  '🤖',
  kc:          '✅',
  practice:    '🛠️',
  summary:     '📝',
  takeaways:   '🏆',
  flashcards:  '🃏',
  quiz:        '📐',
  assignment:  '✏️',
  revision:    '🔄',
  next:        '➡️',
};

// ── SVG helper: wrap text into multiple <tspan> lines ──────────────────────────
function wrapText(text, maxCharsPerLine = 60) {
  const words = text.replace(/\n/g, ' ').split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxCharsPerLine) {
      lines.push(current.trim());
      current = word;
    } else {
      current = current ? current + ' ' + word : word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

// ── Escape XML entities ────────────────────────────────────────────────────────
function escXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ── Generate one SVG slide ─────────────────────────────────────────────────────
function generateSvg({ lessonId, title, stepName, stepType, description, moduleId, slideNum, totalSlides }) {
  const colors = MODULE_COLORS[moduleId] || MODULE_COLORS.M1;
  const icon = STEP_ICONS[stepType] || '📄';

  // Truncate description to 200 chars
  let desc = (description || '').replace(/\n/g, ' ');
  if (desc.length > 200) desc = desc.substring(0, 197) + '...';

  const descLines = wrapText(desc, 70);

  // Build description tspans (starting at y=460)
  const descTspans = descLines.map((line, i) =>
    `      <tspan x="640" dy="${i === 0 ? 0 : 28}">${escXml(line)}</tspan>`
  ).join('\n');

  // Truncate title if too long
  let displayTitle = title;
  if (displayTitle.length > 55) displayTitle = displayTitle.substring(0, 52) + '...';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${colors.accent};stop-opacity:0.15" />
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.05" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1280" height="720" fill="url(#bg-grad)" rx="0"/>

  <!-- Accent strip at top -->
  <rect width="1280" height="6" fill="${colors.accent}" y="0"/>

  <!-- Decorative circle behind icon -->
  <circle cx="640" cy="340" r="60" fill="url(#accent-grad)" stroke="${colors.accent}" stroke-width="2" opacity="0.6"/>

  <!-- Lesson ID badge -->
  <rect x="30" y="24" width="80" height="36" rx="18" fill="${colors.accent}" opacity="0.9"/>
  <text x="70" y="48" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">${escXml(lessonId)}</text>

  <!-- Lesson title -->
  <text x="640" y="100" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="32" font-weight="bold" fill="${colors.dark}">
    ${escXml(displayTitle)}
  </text>

  <!-- Divider line -->
  <line x1="440" y1="125" x2="840" y2="125" stroke="${colors.accent}" stroke-width="2" opacity="0.5"/>

  <!-- Step name subtitle -->
  <text x="640" y="165" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="22" fill="${colors.accent}" font-weight="600">
    Step ${slideNum}: ${escXml(stepName)}
  </text>

  <!-- Step type badge -->
  <rect x="550" y="185" width="180" height="28" rx="14" fill="${colors.accent}" opacity="0.12"/>
  <text x="640" y="205" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="${colors.accent}" font-weight="600" text-transform="uppercase">
    ${escXml(stepType.toUpperCase())}
  </text>

  <!-- Icon emoji -->
  <text x="640" y="355" text-anchor="middle" font-size="52">${icon}</text>

  <!-- Description text -->
  <text x="640" y="440" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="17" fill="#475569" line-height="1.6">
${descTspans}
  </text>

  <!-- Slide number indicator -->
  <text x="1240" y="690" text-anchor="end" font-family="Arial, sans-serif" font-size="14" fill="${colors.accent}" opacity="0.7">
    ${slideNum} of ${totalSlides}
  </text>

  <!-- FinGenIQ watermark -->
  <text x="640" y="695" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="${colors.dark}" opacity="0.25" font-weight="600">
    FinGenIQ — Financial Genius Intelligence
  </text>

  <!-- Bottom accent strip -->
  <rect width="1280" height="4" fill="${colors.accent}" y="716" opacity="0.6"/>
</svg>`;
}

// ── Main ───────────────────────────────────────────────────────────────────────
function main() {
  const TOTAL_LESSONS = 44;
  const SLIDES_PER_LESSON = 3;
  let totalSvgs = 0;
  let updatedJsons = 0;

  for (let n = 1; n <= TOTAL_LESSONS; n++) {
    const lessonFile = path.join(LESSONS_DIR, `L${n}.json`);
    if (!fs.existsSync(lessonFile)) {
      console.warn(`⚠️  Lesson file not found: L${n}.json — skipping`);
      continue;
    }

    const lesson = JSON.parse(fs.readFileSync(lessonFile, 'utf-8'));
    const lessonId = lesson.id || `L${n}`;
    const moduleId = lesson.moduleId || 'M1';
    const title = lesson.title || `Lesson ${n}`;
    const steps = lesson.steps || [];

    // Create output directory
    const outDir = path.join(PUBLIC_LESSONS_DIR, lessonId);
    fs.mkdirSync(outDir, { recursive: true });

    // Generate 3 SVG slides from the first 3 steps
    const galleryImages = [];
    for (let s = 0; s < SLIDES_PER_LESSON; s++) {
      const step = steps[s] || { name: `Step ${s + 1}`, type: 'overview', description: '' };
      const svg = generateSvg({
        lessonId,
        title,
        stepName: step.name,
        stepType: step.type || 'overview',
        description: step.description || '',
        moduleId,
        slideNum: s + 1,
        totalSlides: SLIDES_PER_LESSON,
      });

      const fileName = `slide-${s + 1}.svg`;
      const filePath = path.join(outDir, fileName);
      fs.writeFileSync(filePath, svg, 'utf-8');
      galleryImages.push(`/lessons/${lessonId}/${fileName}`);
      totalSvgs++;
    }

    // Update the lesson JSON with galleryImages
    lesson.galleryImages = galleryImages;
    fs.writeFileSync(lessonFile, JSON.stringify(lesson, null, 2) + '\n', 'utf-8');
    updatedJsons++;

    console.log(`✅ ${lessonId} — ${SLIDES_PER_LESSON} SVGs + JSON updated`);
  }

  console.log(`\n🎉 Done! Generated ${totalSvgs} SVGs across ${updatedJsons} lessons.`);
}

main();
