/* ============================================================
   FINGENIIQ — CERTIFICATION.JS
   Weighted score computation, tier assignment, progress ring,
   equivalence mapping, professional track eligibility
   ============================================================ */

// ── SCORE COMPUTATION ─────────────────────────────────────────
function computeCurrentScore() {
  const s = FQ.USER_STATE.progress;
  const w = FQ.CERTIFICATION_CONFIG.weights;

  // Only count components that have been attempted
  const components = {
    knowledgeChecks:   { score: s.knowledgeChecks   || 0, weight: w.knowledgeChecks,   attempted: true },
    assignments:        { score: s.assignments        || 0, weight: w.assignments,        attempted: true },
    quizzes:            { score: s.quizzes            || 0, weight: w.quizzes,            attempted: true },
    moduleAssessments:  { score: s.moduleAssessments  || 0, weight: w.moduleAssessments,  attempted: false },
    capstone:           { score: s.capstone           || 0, weight: w.capstone,           attempted: false }
  };

  let weightedSum   = 0;
  let weightSum     = 0;
  let fullWeightSum = 0;

  Object.values(components).forEach(c => {
    fullWeightSum += c.weight;
    if (c.attempted || c.score > 0) {
      weightedSum += c.score * c.weight;
      weightSum   += c.weight;
    }
  });

  const partialScore = weightSum > 0 ? weightedSum / weightSum : 0;
  const projectedFull = weightedSum; // projected if all weights used

  return {
    components,
    partialScore: Math.round(partialScore * 10) / 10,
    projectedFull: Math.round(projectedFull * 10) / 10,
    completionPct: Math.round((weightSum / fullWeightSum) * 100)
  };
}

// ── TIER LOGIC ────────────────────────────────────────────────
function getCurrentTier(weightedScore, capstoneExcellence = false) {
  const tiers = FQ.CERTIFICATION_CONFIG.tiers;
  if (!weightedScore || weightedScore < 75) return null; // Not yet certified
  if (weightedScore >= 90 && capstoneExcellence) return tiers[0]; // Distinction
  if (weightedScore >= 75) return tiers[1]; // Proficiency
  return tiers[2]; // Completion
}

function getDeltaToNextTier(weightedScore) {
  if (!weightedScore) return { tier: 'Proficiency', delta: null };
  if (weightedScore < 75) return { tier: 'Proficiency', delta: (75 - weightedScore).toFixed(1) };
  if (weightedScore < 90) return { tier: 'Distinction', delta: (90 - weightedScore).toFixed(1) };
  return { tier: 'Distinction', delta: 0 };
}

// ── PROFESSIONAL TRACK ELIGIBILITY ───────────────────────────
function checkTrackEligibility(trackId) {
  const track = FQ.PROFESSIONAL_TRACKS.find(t => t.id === trackId);
  if (!track) return 'not-eligible';

  const completedModules = Object.entries(FQ.USER_STATE.progress.modules)
    .filter(([, m]) => m.status === 'completed')
    .map(([id]) => id);

  const allModulesComplete = track.requiredModules.every(mId => completedModules.includes(mId));
  if (!allModulesComplete) return 'not-eligible';

  // Check capstone for corp-finance track
  if (track.requiresCapstoneB && !FQ.USER_STATE.certification.capstonePassed) return 'capstone-required';

  return 'eligible';
}

// ── RENDER CERTIFICATION DASHBOARD ───────────────────────────
function renderCertificationDashboard() {
  const scoreData = computeCurrentScore();
  const tier      = getCurrentTier(scoreData.projectedFull);
  const delta     = getDeltaToNextTier(scoreData.projectedFull);

  // Render tier card
  renderTierCard(tier, scoreData.projectedFull, delta);
  // Render weighting breakdown
  renderWeightingBreakdown(scoreData.components);
  // Render professional tracks
  renderProfessionalTracks();
  // Render equivalence table
  renderEquivalenceTable();
  // Animate progress ring if present
  const ringEl = document.getElementById('cert-ring');
  if (ringEl) {
    FQ_UI.animateProgressRing('cert-ring', scoreData.projectedFull || 0);
  }
}

function renderTierCard(tier, score, delta) {
  const el = document.getElementById('tier-display');
  if (!el) return;

  if (!tier) {
    el.innerHTML = `
      <div class="credential-tier">
        <div class="credential-tier__badge" style="background:linear-gradient(135deg,var(--ink-800),var(--ink-700));box-shadow:none;animation:none">🎯</div>
        <div class="credential-tier__name" style="background:linear-gradient(135deg,var(--ink-400),var(--ink-300));-webkit-background-clip:text;-webkit-text-fill-color:transparent">In Progress</div>
        <div class="credential-tier__range" style="margin-top:var(--sp-3)">Score 75%+ across all components to earn your first credential</div>
        ${delta.delta !== null ? `
          <div style="margin-top:var(--sp-5);padding:var(--sp-3) var(--sp-5);background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:var(--radius-lg);font-size:var(--text-sm);color:var(--sapphire-400)">
            ${delta.delta} pts needed for <strong style="color:var(--sapphire-300)">${delta.tier}</strong>
          </div>` : ''}
      </div>`;
  } else {
    el.innerHTML = `
      <div class="credential-tier" style="animation:borderGlow 3s ease-in-out infinite">
        <div class="credential-tier__badge">${tier.emoji}</div>
        <div class="credential-tier__name">${tier.name}</div>
        <div class="credential-tier__range">${tier.minScore}%${tier.minScore < 100 ? '–' + (tier.name === 'Proficiency' ? '89' : '100') + '%' : ''}</div>
        <div style="font-family:var(--font-mono);font-size:var(--text-4xl);font-weight:700;color:${tier.color};margin-top:var(--sp-5)">${score}%</div>
      </div>`;
  }
}

function renderWeightingBreakdown(components) {
  const el = document.getElementById('weighting-breakdown');
  if (!el) return;

  const componentDefs = [
    { key: 'knowledgeChecks',  label: 'Knowledge Checks', color: 'var(--sapphire-500)' },
    { key: 'assignments',       label: 'Assignments',       color: 'var(--emerald-500)'  },
    { key: 'quizzes',           label: 'Lesson Quizzes',   color: 'var(--amber-500)'    },
    { key: 'moduleAssessments', label: 'Module Assessments',color: 'var(--navy-400)'    },
    { key: 'capstone',          label: 'Capstone Project', color: 'var(--brass-500)'    }
  ];

  el.innerHTML = componentDefs.map(def => {
    const comp = components[def.key];
    const contribution = comp.attempted ? (comp.score * comp.weight).toFixed(1) : '—';
    const scoreDisplay = comp.attempted ? `${comp.score}%` : '—';
    const barPct = comp.attempted ? comp.score : 0;

    return `
      <div class="weight-component">
        <div class="weight-component__dot" style="background:${def.color}"></div>
        <div class="weight-component__name">${def.label}</div>
        <div class="weight-component__weight" style="color:var(--ink-500)">${(comp.weight * 100).toFixed(0)}%</div>
        <div class="weight-component__bar">
          <div class="weight-component__bar-fill" data-pct="${barPct}" style="background:${def.color};width:0%"></div>
        </div>
        <div class="weight-component__score" style="color:${comp.attempted?def.color:'var(--ink-600)'}">${scoreDisplay}</div>
        <div class="weight-component__weight" style="min-width:52px;text-align:right;font-family:var(--font-mono);font-size:var(--text-sm);color:${comp.attempted?'var(--ink-300)':'var(--ink-600)'}">
          ${contribution}
        </div>
      </div>`;
  }).join('');

  // Trigger bar animations
  setTimeout(() => FQ_UI.animateProgressBars(), 100);
}

function renderProfessionalTracks() {
  const el = document.getElementById('pro-tracks-container');
  if (!el) return;

  el.innerHTML = FQ.PROFESSIONAL_TRACKS.map(track => {
    const eligibility = checkTrackEligibility(track.id);
    const isEligible  = eligibility === 'eligible';

    return `
      <div class="track-card ${isEligible ? 'track-card--eligible' : ''}">
        <div class="track-card__icon">${track.icon}</div>
        <div class="track-card__body">
          <div class="track-card__name">${track.name}</div>
          <div class="track-card__desc">${track.description}</div>
          <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap">
            <span class="badge ${isEligible ? 'badge--brass' : 'badge--not-started'}">
              ${isEligible ? '🏅 Eligible' : eligibility === 'capstone-required' ? '📋 Capstone Required' : '🔒 Modules Required'}
            </span>
            ${track.requiredModules.map(mId => `<span class="badge badge--module">${FQ.getModuleById(mId)?.title.split(':')[0] || mId}</span>`).join('')}
          </div>
        </div>
        <div style="flex-shrink:0">
          ${isEligible
            ? `<button class="btn btn--brass btn--sm" onclick="FQ_UI.showToast({title:'Certification Issued',message:'${track.name} credential generated.',type:'brass',duration:5000})">Claim →</button>`
            : `<a href="lessons.html" class="btn btn--outline btn--sm">Begin Modules</a>`}
        </div>
      </div>`;
  }).join('');
}

function renderEquivalenceTable() {
  const el = document.getElementById('equivalence-table-body');
  if (!el) return;

  el.innerHTML = FQ.EQUIVALENCE_MAP.map(row => `
    <tr>
      <td style="color:var(--ink-200);font-weight:500">${row.fingeniQ}</td>
      <td style="color:var(--ink-400)">${row.ca_icwa}</td>
      <td style="color:var(--ink-400)">${row.cfa}</td>
      <td style="color:var(--ink-400)">${row.bpf}</td>
      <td><span class="badge badge--not-started" style="font-size:var(--text-2xs)">Gap Map</span></td>
    </tr>`).join('');
}

// ── SHAREABLE CREDENTIAL ──────────────────────────────────────
function generateCredentialCard() {
  const el = document.getElementById('credential-card-display');
  if (!el) return;

  const code = FQ_UI.generateVerificationCode('U001', '1735689600');
  el.innerHTML = `
    <div class="credential-download">
      <div class="credential-download__code">Verification Code: ${code}</div>
      <div style="position:relative;z-index:1">
        <div style="font-family:var(--font-serif);font-size:var(--text-2xl);color:var(--ink-50);margin-bottom:var(--sp-2)">Arjun Mehta</div>
        <div style="font-size:var(--text-sm);color:var(--ink-400);margin-bottom:var(--sp-4)">has successfully completed the FinGeniQ Financial Education Program</div>
        <div class="badge badge--brass" style="margin-bottom:var(--sp-5)">🏅 Proficiency Tier · Score Pending</div>
        <div style="display:flex;gap:var(--sp-3);flex-wrap:wrap">
          <button class="btn btn--brass btn--sm" onclick="FQ_UI.showToast({title:'Link Copied',message:'Share your credential at fingeniQ.com/verify/${code}',type:'brass'})">📋 Copy Share Link</button>
          <button class="btn btn--outline btn--sm" onclick="FQ_UI.showToast({title:'Download',message:'Certificate PDF being generated...',type:'info'})">⬇ Download PDF</button>
        </div>
      </div>
    </div>`;
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('page-certification')) {
    renderCertificationDashboard();
    generateCredentialCard();
  }
});

window.FQ_CERT = { computeCurrentScore, getCurrentTier, getDeltaToNextTier, checkTrackEligibility };
