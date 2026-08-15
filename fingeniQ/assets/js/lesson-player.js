/* ============================================================
   FINGENIIQ — LESSON-PLAYER.JS
   20-step framework engine: step navigation, content rendering,
   KC handler, flashcard engine, quiz integration
   ============================================================ */

// ── STATE ─────────────────────────────────────────────────────
let currentStep = parseInt(LS.get('player_step', 1));
const lessonId  = new URLSearchParams(window.location.search).get('id') || 'L1';
const lesson    = FQ.getLessonById(lessonId);
const content   = FQ.LESSON_CONTENT_L1; // Use L1 content as demo
const steps     = FQ.LESSON_STEPS;

// Flashcard state
let flashcardIndex = 0;
let flashcardFlipped = false;
const flashcards = content?.steps?.flashcards || [];

// KC state
let kcAnswered  = {};
// Quiz state
let quizActive  = false;
let quizTimer   = null;
let quizSeconds = (content?.steps?.quiz?.duration || 15) * 60;
let quizAnswers = {};

// ── INIT ──────────────────────────────────────────────────────
function initPlayer() {
  if (!lesson) {
    document.getElementById('player-content-area').innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📚</div>
        <h2 class="empty-state__title">Lesson Not Found</h2>
        <p class="empty-state__desc">The requested lesson could not be loaded.</p>
        <a href="lessons.html" class="btn btn--primary">← Back to Library</a>
      </div>`;
    return;
  }

  renderRail();
  renderStep(currentStep);
  updateNavButtons();

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' || (e.key === 'Enter' && !quizActive)) {
      if (currentStep < steps.length) goToStep(currentStep + 1);
    }
    if (e.key === 'ArrowLeft') {
      if (currentStep > 1) goToStep(currentStep - 1);
    }
  });
}

// ── STEP RAIL RENDER ──────────────────────────────────────────
function renderRail() {
  const rail = document.getElementById('step-rail');
  if (!rail) return;

  rail.innerHTML = steps.map(step => {
    const isActive    = step.id === currentStep;
    const isCompleted = step.id < currentStep;
    const stateClass  = isActive ? ' step-rail__item--active' : isCompleted ? ' step-rail__item--completed' : '';

    return `
      <div
        class="step-rail__item${stateClass}"
        data-step="${step.id}"
        role="button"
        tabindex="${isActive || isCompleted ? 0 : -1}"
        aria-label="Step ${step.id}: ${step.name}"
        aria-current="${isActive ? 'step' : 'false'}"
        onclick="goToStep(${step.id})"
        onkeydown="if(event.key==='Enter')goToStep(${step.id})"
      >
        <div class="step-rail__node">
          <span class="step-rail__node-num">${step.id}</span>
        </div>
        <div class="step-rail__label">
          <div class="step-rail__step-name">${step.name}</div>
          <div class="step-rail__step-type">${step.type}</div>
        </div>
      </div>`;
  }).join('');
}

// ── MAIN STEP RENDERER ────────────────────────────────────────
function renderStep(stepId) {
  const step = steps.find(s => s.id === stepId);
  if (!step) return;

  const contentArea = document.getElementById('player-content-area');
  if (!contentArea) return;

  // Fade transition
  contentArea.style.opacity = '0';
  contentArea.style.transform = 'translateY(8px)';

  setTimeout(() => {
    contentArea.innerHTML = buildStepHTML(step);
    contentArea.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    contentArea.style.opacity = '1';
    contentArea.style.transform = 'translateY(0)';
    bindStepHandlers(step);
    updateRailHighlight(stepId);
    updateStepLabel(step);
    updateNavButtons();
    saveProgress(stepId);
  }, 150);
}

function buildStepHTML(step) {
  const s = content?.steps;
  switch (step.type) {
    case 'overview':    return renderOverview(s?.overview || {});
    case 'intro':       return renderIntro(s?.intro || {});
    case 'objectives':  return renderObjectives(s?.objectives || {});
    case 'concepts':    return renderConcepts(s?.concepts || {});
    case 'terminology': return renderTerminology(s?.terminology || {});
    case 'visual':      return renderVisual(s?.visual || {});
    case 'interactive': return renderInteractive();
    case 'examples':    return renderExamples(s?.examples || {});
    case 'casestudy':   return renderCaseStudy(s?.casestudy || {});
    case 'didyouknow':  return renderDYK(s?.didYouKnow || {});
    case 'ai-tutor':    return renderAITutorStep();
    case 'kc':          return renderKC(s?.kc || {});
    case 'practice':    return renderPractice();
    case 'summary':     return renderSummary(s?.summary || {});
    case 'takeaways':   return renderTakeaways(s?.takeaways || []);
    case 'flashcards':  return renderFlashcards();
    case 'quiz':        return renderQuizStart(s?.quiz || {});
    case 'assignment':  return renderAssignment(s?.assignment || {});
    case 'revision':    return renderRevision(s?.revision || {});
    case 'next':        return renderNext();
    default:            return `<p>Step content loading...</p>`;
  }
}

// ── STEP RENDERERS ────────────────────────────────────────────

function renderOverview(data) {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 1 of 20 · Lesson Overview</div>
      <h1 class="player-step-title">${data.title || lesson?.title || ''}</h1>
      <p class="text-secondary text-base" style="margin-bottom:var(--sp-6)">${data.subtitle || ''}</p>
      <div class="player-body" style="margin-bottom:var(--sp-8)">${data.description || ''}</div>
      <div class="card card--elevated" style="margin-bottom:var(--sp-6)">
        <div class="section-label">What you'll learn</div>
        <ul style="display:flex;flex-direction:column;gap:var(--sp-3);margin-top:var(--sp-4)">
          ${(data.whatYouWillLearn || []).map((item, i) => `
            <li style="display:flex;align-items:flex-start;gap:var(--sp-3);font-size:var(--text-sm);color:var(--ink-200)">
              <span style="color:var(--sapphire-500);font-weight:700;flex-shrink:0;min-width:20px">${i+1}.</span>
              ${item}
            </li>`).join('')}
        </ul>
      </div>
      <div style="display:flex;gap:var(--sp-4);flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--text-sm);color:var(--ink-500)">
          ⏱ ${FQ_UI.formatDuration(lesson?.duration || 35)}
        </div>
        <div style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--text-sm);color:var(--ink-500)">
          📝 Knowledge Check + Quiz
        </div>
        <div style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--text-sm);color:var(--ink-500)">
          🎯 ${(lesson?.tags || []).slice(0,3).join(' · ')}
        </div>
      </div>
    </div>`;
}

function renderIntro(data) {
  const paragraphs = (data.body || '').split('\n\n').filter(Boolean);
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 2 of 20 · Introduction</div>
      <h2 class="player-step-title">${data.title || 'Introduction'}</h2>
      <div class="player-body">
        ${paragraphs.map(p => `<p>${p}</p>`).join('')}
      </div>
    </div>`;
}

function renderObjectives(data) {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 3 of 20 · Learning Objectives</div>
      <h2 class="player-step-title">Learning Objectives</h2>
      <p class="text-secondary" style="margin-bottom:var(--sp-6)">By the end of this lesson, you will be able to:</p>
      <div class="objectives-list">
        ${(data.items || []).map((item, i) => `
          <div class="objective-item">
            <span class="objective-item__num">0${i+1}</span>
            <span class="objective-item__text">${item.text}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderConcepts(data) {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 4 of 20 · Core Concepts</div>
      <h2 class="player-step-title">Core Concepts</h2>
      <div style="display:flex;flex-direction:column;gap:var(--sp-6);margin-top:var(--sp-6)">
        ${(data.sections || []).map((sec, i) => `
          <div class="card card--elevated">
            <div style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-4)">
              <div style="width:32px;height:32px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:var(--text-xs);font-weight:700;color:var(--sapphire-400);flex-shrink:0">${i+1}</div>
              <h3 style="font-family:var(--font-serif);font-size:var(--text-xl);color:var(--ink-50)">${sec.title}</h3>
            </div>
            <p style="font-size:var(--text-sm);color:var(--ink-300);line-height:var(--leading-relaxed);max-width:none">${sec.body}</p>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderTerminology(data) {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 5 of 20 · Key Terminologies</div>
      <h2 class="player-step-title">Key Terminologies</h2>
      <p class="text-secondary" style="margin-bottom:var(--sp-6)">These terms will appear in your flashcards and assessments.</p>
      <div class="term-list">
        ${(data.terms || []).map(t => `
          <div class="term-item">
            <div class="term-item__term">${t.term}</div>
            <div class="term-item__def">${t.definition}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderVisual(data) {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 6 of 20 · Visual Explanation</div>
      <h2 class="player-step-title">${data.title || 'Visual Explanation'}</h2>
      <p class="text-secondary" style="margin-bottom:var(--sp-6)">${data.description || ''}</p>
      <div class="chart-placeholder">
        <canvas id="visual-chart" style="max-height:320px;width:100%"></canvas>
        <p style="font-size:var(--text-xs);color:var(--ink-600);margin-top:var(--sp-4);max-width:none">Figure: The Three-Horizon Financial Lifecycle — Protection establishes the foundation, Accumulation builds wealth during peak earning years, Distribution converts the corpus to sustainable income in retirement.</p>
      </div>
    </div>`;
}

function renderInteractive() {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 7 of 20 · Interactive Learning</div>
      <h2 class="player-step-title">Wealth Replacement Ratio Calculator</h2>
      <p class="text-secondary" style="margin-bottom:var(--sp-6)">Use this tool to compute your personal target corpus based on the WRR framework.</p>
      <div class="interactive-widget">
        <div class="widget-header">
          <span style="font-size:var(--text-lg)">🧮</span>
          <span class="widget-header__title">WRR & Corpus Calculator</span>
          <span class="badge badge--module" style="margin-left:auto">Interactive</span>
        </div>
        <div class="widget-body">
          <div class="widget-input-row">
            <div class="form-group">
              <label class="form-label" for="monthly-expense">Monthly Lifestyle Expenses (₹)</label>
              <input type="number" id="monthly-expense" class="form-input" value="80000" min="1000" step="1000">
            </div>
            <div class="form-group">
              <label class="form-label" for="swr-rate">Safe Withdrawal Rate (%)</label>
              <input type="number" id="swr-rate" class="form-input" value="4" min="1" max="10" step="0.5">
            </div>
          </div>
          <div class="widget-input-row">
            <div class="form-group">
              <label class="form-label" for="passive-income">Current Passive Income / Month (₹)</label>
              <input type="number" id="passive-income" class="form-input" value="0" min="0" step="1000">
            </div>
            <div class="form-group">
              <label class="form-label" for="current-age">Current Age</label>
              <input type="number" id="current-age" class="form-input" value="30" min="18" max="60">
            </div>
          </div>
          <button class="btn btn--primary btn--wide" id="calc-btn" style="margin-bottom:var(--sp-5)">Calculate →</button>
          <div id="calc-results" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sp-4)">
            <div class="widget-result">
              <div class="widget-result__label">Required Corpus</div>
              <div class="widget-result__value" id="res-corpus">₹2.4 Cr</div>
            </div>
            <div class="widget-result">
              <div class="widget-result__label">Current WRR</div>
              <div class="widget-result__value" id="res-wrr">0%</div>
            </div>
            <div class="widget-result">
              <div class="widget-result__label">Annual Income Needed</div>
              <div class="widget-result__value" id="res-annual">₹9.6L</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderExamples(data) {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 8 of 20 · Real-World Examples</div>
      <h2 class="player-step-title">Real-World Examples</h2>
      <div style="display:flex;flex-direction:column;gap:var(--sp-5);margin-top:var(--sp-6)">
        ${(data.items || []).map((ex, i) => `
          <div class="card" style="border-left:3px solid ${i===0?'var(--rose-600)':'var(--emerald-600)'}">
            <div style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-4)">
              <span style="font-size:var(--text-2xl)">${i===0?'⚠️':'✅'}</span>
              <h3 style="font-family:var(--font-serif);font-size:var(--text-xl);color:var(--ink-100)">${ex.title}</h3>
            </div>
            <p style="font-size:var(--text-sm);color:var(--ink-300);margin-bottom:var(--sp-4);max-width:none">${ex.scenario}</p>
            <div style="background:rgba(255,255,255,0.03);border:var(--border-subtle);border-radius:var(--radius-lg);padding:var(--sp-4)">
              <span style="font-size:var(--text-xs);font-weight:700;letter-spacing:var(--tracking-wider);text-transform:uppercase;color:var(--sapphire-400)">Key Lesson</span>
              <p style="font-size:var(--text-sm);color:var(--ink-200);margin-top:var(--sp-2);max-width:none">${ex.lesson}</p>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderCaseStudy(data) {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 9 of 20 · Case Study</div>
      <h2 class="player-step-title">Case Study</h2>
      <div class="case-study" style="margin-top:var(--sp-6)">
        <div class="case-study__header">
          <span class="case-study__company">${data.company || 'Case Study'}</span>
          <span class="case-study__badge">FinGeniQ Case Study</span>
        </div>
        <div class="case-study__section">
          <div class="case-study__section-label">Background</div>
          <div class="case-study__section-body">${data.background || ''}</div>
        </div>
        <div class="case-study__section">
          <div class="case-study__section-label">Analysis</div>
          <div class="case-study__section-body">${data.analysis || ''}</div>
        </div>
        <div class="case-study__section">
          <div class="case-study__section-label">Outcome & Restructured Plan</div>
          <div class="case-study__section-body">${data.outcome || ''}</div>
        </div>
        <div class="case-study__section">
          <div class="case-study__section-label">Discussion Questions</div>
          <ol style="display:flex;flex-direction:column;gap:var(--sp-3);margin-top:var(--sp-3)">
            ${(data.questions || []).map(q => `
              <li style="font-size:var(--text-sm);color:var(--ink-300);padding-left:var(--sp-4)">${q}</li>`).join('')}
          </ol>
        </div>
      </div>
    </div>`;
}

function renderDYK(data) {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 10 of 20 · Did You Know?</div>
      <h2 class="player-step-title">Did You Know?</h2>
      <div style="margin-top:var(--sp-6);display:flex;flex-direction:column;gap:var(--sp-4)">
        ${(data.facts || []).map(fact => `
          <div class="dyk-card">
            <div class="dyk-card__icon">💡</div>
            <div class="dyk-card__text">${fact}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderAITutorStep() {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 11 of 20 · AI Tutor</div>
      <h2 class="player-step-title">Meet Your AI Tutor</h2>
      <p class="text-secondary" style="margin-bottom:var(--sp-6)">Your AI Tutor is available from this step onward. Ask it to explain any concept, quiz you conversationally, or adapt an explanation to your level.</p>
      <div class="card card--credential" style="margin-bottom:var(--sp-6)">
        <div style="display:flex;align-items:center;gap:var(--sp-4);margin-bottom:var(--sp-4)">
          <div style="width:48px;height:48px;border-radius:var(--radius-full);background:linear-gradient(135deg,var(--navy-800),var(--navy-700));border:1px solid rgba(201,168,76,0.2);display:flex;align-items:center;justify-content:center;font-size:var(--text-2xl)">🤖</div>
          <div>
            <div style="font-weight:600;color:var(--ink-100)">FinGeniQ AI Tutor</div>
            <div style="font-size:var(--text-xs);color:var(--ink-500)">Contextualised to Lesson 1 · The Financial Freedom Framework</div>
          </div>
          <div style="margin-left:auto;width:8px;height:8px;border-radius:var(--radius-full);background:var(--emerald-500)"></div>
        </div>
        <p style="font-size:var(--text-sm);color:var(--ink-300);max-width:none">Hello! I'm your AI Tutor for this lesson. I've analysed your Knowledge Check responses and noticed you might benefit from exploring the <strong style="color:var(--ink-100)">Sequencing Imperative</strong> in more depth. Would you like me to walk you through a worked example using the three-horizon model?</p>
        <div style="display:flex;gap:var(--sp-3);margin-top:var(--sp-5);flex-wrap:wrap">
          <button class="btn btn--outline btn--sm" onclick="FQ_UI.showToast({title:'AI Tutor',message:'Explain the Sequencing Imperative with an example...',type:'info'})">Yes, walk me through it</button>
          <button class="btn btn--ghost btn--sm" onclick="FQ_UI.showToast({title:'AI Tutor',message:'Ask me anything about this lesson!',type:'info'})">Ask a different question</button>
        </div>
      </div>
      <div class="card" style="background:rgba(59,130,246,0.04);border-color:rgba(59,130,246,0.15)">
        <div style="font-size:var(--text-xs);font-weight:700;letter-spacing:var(--tracking-wider);text-transform:uppercase;color:var(--sapphire-400);margin-bottom:var(--sp-3)">Suggested Questions</div>
        <div style="display:flex;flex-direction:column;gap:var(--sp-2)">
          ${["What's the difference between WRR and SWR?","Why is 4% the standard safe withdrawal rate?","Can I skip Horizon 1 if I'm already earning well?"].map(q => `
            <button class="btn btn--ghost btn--sm" style="justify-content:flex-start;text-align:left" onclick="FQ_UI.showToast({title:'AI Tutor',message:'${q}',type:'info'})">"${q}"</button>`).join('')}
        </div>
      </div>
    </div>`;
}

function renderKC(data) {
  const questions = data.questions || [];
  if (!questions.length) return '<p>Knowledge check loading...</p>';

  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 12 of 20 · Knowledge Check</div>
      <h2 class="player-step-title">Knowledge Check</h2>
      <p class="text-secondary" style="margin-bottom:var(--sp-2)">Ungraded · Unlimited attempts · Immediate feedback</p>
      <div style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-8)">
        <span class="badge badge--not-started">Ungraded</span>
        <span style="font-size:var(--text-xs);color:var(--ink-500)">${questions.length} questions</span>
      </div>
      <div id="kc-container" style="display:flex;flex-direction:column;gap:var(--sp-10)">
        ${questions.map((q, qi) => `
          <div class="mcq" id="kc-q-${qi}" data-qi="${qi}" data-correct="${q.correct}">
            <div style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--ink-600);margin-bottom:var(--sp-3)">Q${qi+1} of ${questions.length}</div>
            <div class="mcq__question">${q.question}</div>
            <div class="mcq__options" style="margin-top:var(--sp-4)">
              ${q.options.map(opt => `
                <button
                  class="mcq__option"
                  id="kc-opt-${qi}-${opt.id}"
                  data-qi="${qi}" data-id="${opt.id}"
                  aria-label="Option ${opt.id.toUpperCase()}: ${opt.text}"
                  onclick="handleKCAnswer(${qi},'${opt.id}','${q.correct}')"
                >
                  <span class="mcq__option-label">${opt.id.toUpperCase()}</span>
                  <span class="mcq__option-text">${opt.text}</span>
                  <div class="mcq__option-marker"></div>
                </button>`).join('')}
            </div>
            <div id="kc-explanation-${qi}" style="display:none" class="mcq__explanation">
              <div class="mcq__explanation-label">Explanation</div>
              ${q.explanation}
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function handleKCAnswer(qi, selectedId, correctId) {
  if (kcAnswered[qi]) return;
  kcAnswered[qi] = selectedId;

  const isCorrect = selectedId === correctId;
  const opts = document.querySelectorAll(`[data-qi="${qi}"].mcq__option`);

  opts.forEach(opt => {
    const optId = opt.getAttribute('data-id');
    opt.classList.add('mcq__option--disabled');
    if (optId === correctId) opt.classList.add('mcq__option--correct');
    if (optId === selectedId && !isCorrect) opt.classList.add('mcq__option--incorrect');
  });

  const explEl = document.getElementById(`kc-explanation-${qi}`);
  if (explEl) explEl.style.display = 'block';

  FQ_UI.showToast({
    title: isCorrect ? 'Correct! ✅' : 'Not quite ❌',
    message: isCorrect ? 'Well done! Check the explanation below.' : 'Review the explanation to reinforce the concept.',
    type: isCorrect ? 'success' : 'warning',
    duration: 3000
  });
}

function renderPractice() {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 13 of 20 · Practice Activity</div>
      <h2 class="player-step-title">Practice Activity</h2>
      <p class="text-secondary" style="margin-bottom:var(--sp-6)">Apply what you've learned in this structured practice exercise.</p>
      <div class="interactive-widget">
        <div class="widget-header">
          <span style="font-size:var(--text-lg)">✍️</span>
          <span class="widget-header__title">Horizon Mapping Exercise</span>
        </div>
        <div class="widget-body">
          <p style="font-size:var(--text-sm);color:var(--ink-300);margin-bottom:var(--sp-5);max-width:none">Below are 6 financial decisions. Categorise each under Horizon 1 (Protection), Horizon 2 (Accumulation), or Horizon 3 (Distribution).</p>
          <div style="display:flex;flex-direction:column;gap:var(--sp-3)">
            ${[
              {text:'Buying a ₹1 crore term insurance plan', correct:'H1'},
              {text:'Starting a monthly SIP in NIFTY 50 index fund', correct:'H2'},
              {text:'Setting up a Systematic Withdrawal Plan (SWP) from equity funds', correct:'H3'},
              {text:'Building a 6-month emergency fund', correct:'H1'},
              {text:'Investing in ELSS for long-term wealth creation', correct:'H2'},
              {text:'Purchasing an annuity for retirement income', correct:'H3'}
            ].map((item, i) => `
              <div style="display:flex;align-items:center;gap:var(--sp-3);padding:var(--sp-3) var(--sp-4);background:var(--ink-900);border:var(--border-subtle);border-radius:var(--radius-lg)">
                <span style="font-size:var(--text-sm);color:var(--ink-200);flex:1">${item.text}</span>
                <select class="form-input form-select" style="width:160px" onchange="checkPractice(this,'${item.correct}')">
                  <option value="">Select Horizon</option>
                  <option value="H1">Horizon 1 — Protection</option>
                  <option value="H2">Horizon 2 — Accumulation</option>
                  <option value="H3">Horizon 3 — Distribution</option>
                </select>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

function checkPractice(selectEl, correct) {
  const val = selectEl.value;
  if (!val) return;
  if (val === correct) {
    selectEl.style.borderColor = 'var(--emerald-500)';
    FQ_UI.showToast({ title: 'Correct!', type: 'success', duration: 2000 });
  } else {
    selectEl.style.borderColor = 'var(--rose-500)';
    FQ_UI.showToast({ title: 'Try again', message: `The correct answer is ${correct.replace('H','Horizon ')}.`, type: 'warning', duration: 2500 });
  }
}

function renderSummary(data) {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 14 of 20 · Lesson Summary</div>
      <h2 class="player-step-title">Lesson Summary</h2>
      <div style="display:flex;flex-direction:column;gap:var(--sp-4);margin-top:var(--sp-6)">
        ${(data.keyPoints || []).map((pt, i) => `
          <div style="display:flex;align-items:flex-start;gap:var(--sp-4);padding:var(--sp-4) var(--sp-5);background:var(--ink-900);border:var(--border-subtle);border-radius:var(--radius-lg)">
            <span style="font-family:var(--font-mono);font-size:var(--text-xs);font-weight:700;color:var(--sapphire-400);background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);border-radius:var(--radius-sm);padding:2px 6px;flex-shrink:0">${i+1}</span>
            <span style="font-size:var(--text-sm);color:var(--ink-200);line-height:var(--leading-relaxed)">${pt}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderTakeaways(items) {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 15 of 20 · Key Takeaways</div>
      <h2 class="player-step-title">Key Takeaways</h2>
      <div style="display:flex;flex-direction:column;gap:var(--sp-5);margin-top:var(--sp-6)">
        ${items.map(item => `
          <div class="dyk-card">
            <div class="dyk-card__text" style="font-size:var(--text-base)">${item}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderFlashcards() {
  const card = flashcards[flashcardIndex] || {};
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 16 of 20 · Flashcards</div>
      <h2 class="player-step-title">Flashcards</h2>
      <p class="text-secondary" style="margin-bottom:var(--sp-6)">Spaced-repetition cards auto-generated from Key Terminologies. Click to flip.</p>
      <div class="flashcard-deck">
        <div class="flashcard" id="main-flashcard" onclick="toggleFlashcard()" role="button" tabindex="0" aria-label="Flashcard: click to flip">
          <div class="flashcard__face flashcard__front">
            <div class="flashcard__label">Term</div>
            <div class="flashcard__term" id="fc-term">${card.term || ''}</div>
            <div class="flashcard__hint">Click to reveal definition</div>
          </div>
          <div class="flashcard__face flashcard__back">
            <div class="flashcard__label">Definition</div>
            <div class="flashcard__definition" id="fc-def">${card.definition || ''}</div>
          </div>
        </div>
      </div>
      <div class="flashcard-nav">
        <button class="btn btn--outline btn--sm" onclick="prevFlashcard()" id="fc-prev" ${flashcardIndex===0?'disabled':''}>← Previous</button>
        <span class="flashcard-counter" id="fc-counter">${flashcardIndex+1} / ${flashcards.length}</span>
        <button class="btn btn--outline btn--sm" onclick="nextFlashcard()" id="fc-next" ${flashcardIndex===flashcards.length-1?'disabled':''}>Next →</button>
      </div>
    </div>`;
}

function toggleFlashcard() {
  const card = document.getElementById('main-flashcard');
  if (card) {
    flashcardFlipped = !flashcardFlipped;
    card.classList.toggle('flipped', flashcardFlipped);
  }
}

function prevFlashcard() {
  if (flashcardIndex > 0) { flashcardIndex--; flashcardFlipped = false; renderStep(16); }
}

function nextFlashcard() {
  if (flashcardIndex < flashcards.length - 1) { flashcardIndex++; flashcardFlipped = false; renderStep(16); }
}

function renderQuizStart(data) {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 17 of 20 · Quiz</div>
      <h2 class="player-step-title">Lesson Quiz</h2>
      <div class="card card--elevated" style="margin-bottom:var(--sp-6)">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sp-4);margin-bottom:var(--sp-6)">
          <div style="text-align:center">
            <div style="font-family:var(--font-mono);font-size:var(--text-3xl);font-weight:600;color:var(--ink-50)">${data.questions?.length || 3}</div>
            <div style="font-size:var(--text-xs);color:var(--ink-500);text-transform:uppercase;letter-spacing:var(--tracking-wider);margin-top:var(--sp-1)">Questions</div>
          </div>
          <div style="text-align:center">
            <div style="font-family:var(--font-mono);font-size:var(--text-3xl);font-weight:600;color:var(--ink-50)">${data.duration || 15}</div>
            <div style="font-size:var(--text-xs);color:var(--ink-500);text-transform:uppercase;letter-spacing:var(--tracking-wider);margin-top:var(--sp-1)">Minutes</div>
          </div>
          <div style="text-align:center">
            <div style="font-family:var(--font-mono);font-size:var(--text-3xl);font-weight:600;color:var(--brass-400)">${data.passMark || 70}%</div>
            <div style="font-size:var(--text-xs);color:var(--ink-500);text-transform:uppercase;letter-spacing:var(--tracking-wider);margin-top:var(--sp-1)">Pass Mark</div>
          </div>
        </div>
        <hr>
        <ul style="display:flex;flex-direction:column;gap:var(--sp-2);margin-top:var(--sp-4)">
          <li style="font-size:var(--text-sm);color:var(--ink-400);display:flex;align-items:center;gap:var(--sp-2)">✅ Timed — timer starts when you click Begin</li>
          <li style="font-size:var(--text-sm);color:var(--ink-400);display:flex;align-items:center;gap:var(--sp-2)">🔄 Up to 2 retakes with reshuffled question bank</li>
          <li style="font-size:var(--text-sm);color:var(--ink-400);display:flex;align-items:center;gap:var(--sp-2)">🏆 Best-of-3 score recorded for certification</li>
        </ul>
      </div>
      <div style="display:flex;gap:var(--sp-4)">
        <button class="btn btn--primary btn--lg" onclick="startQuiz()" id="start-quiz-btn">Begin Quiz →</button>
        <button class="btn btn--ghost btn--lg" onclick="FQ_UI.showToast({title:'Revision Mode',message:'Review the lesson first and come back when ready.',type:'info'})">Review First</button>
      </div>
    </div>`;
}

function startQuiz() {
  const questions = content?.steps?.quiz?.questions || [];
  quizActive = true;
  quizAnswers = {};
  quizSeconds = (content?.steps?.quiz?.duration || 15) * 60;

  const area = document.getElementById('player-content-area');
  area.innerHTML = `
    <div class="animate-fadeUp">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-8)">
        <div class="player-step-label" style="margin:0">Quiz — Lesson 1</div>
        <div class="quiz-timer" id="quiz-timer-display">
          <span class="quiz-timer__icon">⏱</span>
          <span id="quiz-time">15:00</span>
        </div>
      </div>
      <div id="quiz-questions" style="display:flex;flex-direction:column;gap:var(--sp-10)">
        ${questions.map((q, qi) => `
          <div class="mcq" id="quiz-q-${qi}">
            <div style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--ink-600);margin-bottom:var(--sp-3)">Q${qi+1} of ${questions.length}</div>
            <div class="mcq__question">${q.question}</div>
            <div class="mcq__options" style="margin-top:var(--sp-4)">
              ${q.options.map(opt => `
                <button class="mcq__option" id="qopt-${qi}-${opt.id}" data-qi="${qi}" data-id="${opt.id}" onclick="selectQuizAnswer(${qi},'${opt.id}','${q.correct}')">
                  <span class="mcq__option-label">${opt.id.toUpperCase()}</span>
                  <span class="mcq__option-text">${opt.text}</span>
                  <div class="mcq__option-marker"></div>
                </button>`).join('')}
            </div>
          </div>`).join('')}
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:var(--sp-10)">
        <button class="btn btn--primary btn--lg" onclick="submitQuiz()" id="submit-quiz-btn" disabled>Submit Quiz</button>
      </div>
    </div>`;
  startQuizTimer();
}

function selectQuizAnswer(qi, id, correct) {
  quizAnswers[qi] = { selected: id, correct };
  const allForQ = document.querySelectorAll(`[data-qi="${qi}"].mcq__option`);
  allForQ.forEach(opt => { opt.classList.remove('mcq__option--selected'); opt.querySelector('.mcq__option-marker').innerHTML = ''; });
  const btn = document.getElementById(`qopt-${qi}-${id}`);
  if (btn) {
    btn.classList.add('mcq__option--selected');
    btn.querySelector('.mcq__option-marker').innerHTML = '<div style="width:8px;height:8px;border-radius:50%;background:white"></div>';
  }
  const allAnswered = Object.keys(quizAnswers).length === (content?.steps?.quiz?.questions?.length || 3);
  const submitBtn = document.getElementById('submit-quiz-btn');
  if (submitBtn) submitBtn.disabled = !allAnswered;
}

function startQuizTimer() {
  const display = document.getElementById('quiz-time');
  quizTimer = setInterval(() => {
    quizSeconds--;
    if (quizSeconds <= 0) { clearInterval(quizTimer); submitQuiz(); return; }
    const m = Math.floor(quizSeconds / 60);
    const s = quizSeconds % 60;
    if (display) display.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    const timerEl = document.getElementById('quiz-timer-display');
    if (timerEl) {
      if (quizSeconds < 60) timerEl.className = 'quiz-timer quiz-timer--critical';
      else if (quizSeconds < 180) timerEl.className = 'quiz-timer quiz-timer--warning';
    }
  }, 1000);
}

function submitQuiz() {
  clearInterval(quizTimer);
  quizActive = false;
  const questions = content?.steps?.quiz?.questions || [];
  let correct = 0;
  questions.forEach((q, qi) => {
    if (quizAnswers[qi]?.selected === q.correct) correct++;
  });
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= (content?.steps?.quiz?.passMark || 70);

  const area = document.getElementById('player-content-area');
  area.innerHTML = `
    <div class="animate-scaleIn" style="text-align:center;padding:var(--sp-12) var(--sp-8)">
      <div style="font-size:4rem;margin-bottom:var(--sp-5)">${passed?'🎉':'😔'}</div>
      <h2 style="font-family:var(--font-serif);font-size:var(--text-4xl);color:${passed?'var(--emerald-400)':'var(--rose-400)'};margin-bottom:var(--sp-3)">${passed?'Quiz Passed!':'Not Passed'}</h2>
      <div style="font-family:var(--font-mono);font-size:var(--text-6xl);font-weight:600;color:${passed?'var(--emerald-500)':'var(--rose-500)'};margin-bottom:var(--sp-4)">${score}%</div>
      <p style="font-size:var(--text-base);color:var(--ink-400);margin-bottom:var(--sp-8);max-width:40ch;margin-left:auto;margin-right:auto">${correct} of ${questions.length} correct · ${passed?'Score recorded for certification':'Review and retake when ready'}</p>
      <div style="display:flex;gap:var(--sp-4);justify-content:center;flex-wrap:wrap">
        <button class="btn btn--primary btn--lg" onclick="goToStep(18)">Continue to Assignment →</button>
        ${!passed?'<button class="btn btn--outline btn--lg" onclick="renderStep(17)">Review & Retake</button>':''}
      </div>
    </div>`;

  FQ_UI.showToast({
    title: passed ? 'Quiz Passed! 🎉' : 'Review Needed',
    message: `Score: ${score}%. ${passed ? 'Score recorded.' : '2 retakes remaining.'}`,
    type: passed ? 'brass' : 'warning',
    duration: 5000
  });
}

function renderAssignment(data) {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 18 of 20 · Assignment</div>
      <h2 class="player-step-title">${data.title || 'Assignment'}</h2>
      <p class="text-secondary" style="margin-bottom:var(--sp-6)">${data.description || ''}</p>
      <div class="card card--elevated" style="margin-bottom:var(--sp-6)">
        <div style="font-size:var(--text-xs);font-weight:700;letter-spacing:var(--tracking-wider);text-transform:uppercase;color:var(--ink-500);margin-bottom:var(--sp-3)">Grading Rubric</div>
        <div style="display:flex;flex-direction:column;gap:var(--sp-2)">
          ${(data.rubric || []).map(r => `
            <div style="display:flex;align-items:center;gap:var(--sp-3);font-size:var(--text-sm);color:var(--ink-300)">
              <span style="color:var(--emerald-500)">✓</span>${r}
            </div>`).join('')}
        </div>
      </div>
      <div class="form-group" style="margin-bottom:var(--sp-5)">
        <label class="form-label" for="assignment-text">Your Response (max ${data.wordLimit || 500} words)</label>
        <textarea id="assignment-text" class="form-input" style="min-height:200px;resize:vertical" placeholder="Write your analysis here..."></textarea>
        <div style="font-size:var(--text-xs);color:var(--ink-600);margin-top:var(--sp-2)"><span id="word-count">0</span> / ${data.wordLimit || 500} words</div>
      </div>
      <div style="display:flex;gap:var(--sp-4)">
        <button class="btn btn--primary btn--lg" onclick="submitAssignment()">Submit Assignment →</button>
        <button class="btn btn--ghost btn--lg">Save Draft</button>
      </div>
    </div>`;
}

function renderRevision(data) {
  return `
    <div class="animate-fadeUp">
      <div class="player-step-label">Step 19 of 20 · Revision Notes</div>
      <h2 class="player-step-title">Revision Notes</h2>
      <div class="card card--elevated" style="margin-bottom:var(--sp-6)">
        <div style="font-size:var(--text-xs);font-weight:700;letter-spacing:var(--tracking-wider);text-transform:uppercase;color:var(--brass-500);margin-bottom:var(--sp-4)">Auto-generated from lesson content</div>
        <p style="font-size:var(--text-sm);color:var(--ink-200);line-height:var(--leading-relaxed);max-width:none">${data.notes || ''}</p>
      </div>
      <div style="display:flex;gap:var(--sp-4);flex-wrap:wrap">
        <button class="btn btn--outline" onclick="FQ_UI.showToast({title:'Notes saved',message:'Revision notes exported to your account.',type:'success'})">📥 Save to My Notes</button>
        <button class="btn btn--ghost" onclick="goToStep(16)">🔁 Review Flashcards</button>
      </div>
    </div>`;
}

function renderNext() {
  const nextLesson = FQ.getLessonById('L5');
  return `
    <div class="animate-fadeUp" style="text-align:center;padding:var(--sp-8) 0">
      <div style="font-size:3.5rem;margin-bottom:var(--sp-6)">🎓</div>
      <h2 style="font-family:var(--font-serif);font-size:var(--text-4xl);color:var(--emerald-400);margin-bottom:var(--sp-3)">Lesson Complete!</h2>
      <p style="font-size:var(--text-lg);color:var(--ink-400);margin-bottom:var(--sp-10);max-width:40ch;margin-left:auto;margin-right:auto">You've completed all 20 steps of <em>The Financial Freedom Framework</em>. Up next in Module 1:</p>
      ${nextLesson ? `
        <div class="card card--interactive" style="max-width:480px;margin:0 auto var(--sp-8);text-align:left">
          <div class="badge badge--not-started" style="margin-bottom:var(--sp-3)">Next Lesson</div>
          <div style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--ink-600);margin-bottom:var(--sp-2)">L${String(nextLesson.order).padStart(2,'0')} · Module 1</div>
          <h3 style="font-family:var(--font-serif);font-size:var(--text-xl);color:var(--ink-100);margin-bottom:var(--sp-3)">${nextLesson.title}</h3>
          <p style="font-size:var(--text-sm);color:var(--ink-400);margin-bottom:var(--sp-5);max-width:none">${nextLesson.description}</p>
          <a href="lesson-player.html?id=${nextLesson.id}" class="btn btn--primary btn--wide">Begin ${nextLesson.title} →</a>
        </div>` : ''}
      <a href="lessons.html" class="btn btn--ghost">← Back to Lesson Library</a>
    </div>`;
}

// ── BINDINGS ──────────────────────────────────────────────────
function bindStepHandlers(step) {
  if (step.type === 'visual') initVisualChart();
  if (step.type === 'interactive') bindCalculator();
  if (step.type === 'assignment') bindWordCount();
}

function initVisualChart() {
  const canvas = document.getElementById('visual-chart');
  if (!canvas || !window.Chart) return;

  new window.Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Protection\n(H1)', 'Accumulation\n(H2)', 'Distribution\n(H3)'],
      datasets: [{
        label: 'Financial Priority',
        data: [100, 85, 60],
        backgroundColor: ['rgba(244,63,94,0.6)', 'rgba(59,130,246,0.6)', 'rgba(201,168,76,0.6)'],
        borderColor:     ['var(--rose-500)', 'var(--sapphire-500)', 'var(--brass-500)'],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          bodyColor: '#e8edf5',
          backgroundColor: '#1c2438'
        }
      },
      scales: {
        x: { ticks: { color: '#7d8faa' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#7d8faa' }, grid: { color: 'rgba(255,255,255,0.04)' }, display: false }
      }
    }
  });
}

function bindCalculator() {
  const calcBtn = document.getElementById('calc-btn');
  if (!calcBtn) return;

  calcBtn.addEventListener('click', () => {
    const expense = parseFloat(document.getElementById('monthly-expense')?.value) || 80000;
    const swr     = parseFloat(document.getElementById('swr-rate')?.value) / 100 || 0.04;
    const passive = parseFloat(document.getElementById('passive-income')?.value) || 0;

    const annualNeed = expense * 12;
    const corpus = annualNeed / swr;
    const wrr = passive > 0 ? ((passive * 12) / annualNeed * 100).toFixed(1) : '0.0';

    const fmt = (n) => n >= 10000000 ? `₹${(n/10000000).toFixed(1)} Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)} L` : `₹${n.toLocaleString('en-IN')}`;

    document.getElementById('res-corpus').textContent = fmt(corpus);
    document.getElementById('res-wrr').textContent    = `${wrr}%`;
    document.getElementById('res-annual').textContent = fmt(annualNeed);

    FQ_UI.showToast({ title: 'Calculated!', message: `Target corpus: ${fmt(corpus)}`, type: 'success', duration: 3000 });
  });
}

function bindWordCount() {
  const ta = document.getElementById('assignment-text');
  const wc = document.getElementById('word-count');
  if (!ta || !wc) return;
  ta.addEventListener('input', () => {
    const words = ta.value.trim().split(/\s+/).filter(Boolean).length;
    wc.textContent = words;
    wc.style.color = words > 500 ? 'var(--rose-500)' : 'var(--ink-600)';
  });
}

function submitAssignment() {
  const text = document.getElementById('assignment-text')?.value?.trim();
  if (!text || text.length < 50) {
    FQ_UI.showToast({ title: 'Too short', message: 'Please write at least a paragraph before submitting.', type: 'warning' });
    return;
  }
  FQ_UI.showToast({ title: 'Assignment Submitted ✅', message: 'Your response has been recorded for grading.', type: 'brass', duration: 5000 });
  setTimeout(() => goToStep(19), 2000);
}

// ── NAVIGATION ────────────────────────────────────────────────
function goToStep(stepId) {
  if (stepId < 1 || stepId > steps.length) return;
  currentStep = stepId;
  renderStep(stepId);
  document.getElementById('player-content')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateRailHighlight(stepId) {
  document.querySelectorAll('.step-rail__item').forEach(item => {
    const id = parseInt(item.getAttribute('data-step'));
    item.className = 'step-rail__item';
    if (id === stepId)    item.classList.add('step-rail__item--active');
    if (id < stepId)      item.classList.add('step-rail__item--completed');
  });
}

function updateStepLabel(step) {
  const el = document.getElementById('current-step-name');
  if (el) el.textContent = step.name;
}

function updateNavButtons() {
  const prevBtn = document.getElementById('prev-step-btn');
  const nextBtn = document.getElementById('next-step-btn');
  const stepInfo = document.getElementById('step-info');

  if (prevBtn) prevBtn.disabled = currentStep <= 1;
  if (nextBtn) nextBtn.textContent = currentStep >= steps.length ? 'Finish Lesson ✓' : `Next: ${steps[currentStep]?.name || 'Continue'} →`;
  if (stepInfo) {
    stepInfo.textContent = `Step ${currentStep} of ${steps.length}`;
  }
}

function saveProgress(stepId) {
  FQ_UI.LS.set('player_step', stepId);
  FQ_UI.LS.set('player_lesson', lessonId);
}

// ── AI TUTOR PANEL ────────────────────────────────────────────
function initAIPanel() {
  const sendBtn = document.getElementById('ai-send-btn');
  const textarea = document.getElementById('ai-input');
  const messages = document.getElementById('ai-messages');

  const greetings = [
    `Hello! I'm your AI Tutor, contextualised to <strong>Lesson 1: The Financial Freedom Framework</strong>. How can I help you today?`,
    `You're currently on <strong>Step ${currentStep} of 20</strong>. Ask me anything about the three-horizon model or the WRR concept.`
  ];

  if (messages) {
    greetings.forEach(msg => {
      messages.innerHTML += `<div class="ai-msg ai-msg--ai"><div class="ai-msg__bubble">${msg}</div></div>`;
    });
    messages.scrollTop = messages.scrollHeight;
  }

  function sendMessage() {
    const text = textarea?.value?.trim();
    if (!text) return;
    if (messages) {
      messages.innerHTML += `<div class="ai-msg ai-msg--user"><div class="ai-msg__bubble">${text}</div></div>`;
      messages.innerHTML += `<div class="ai-msg ai-msg--ai"><div class="ai-typing"><span></span><span></span><span></span></div></div>`;
      messages.scrollTop = messages.scrollHeight;
    }
    if (textarea) textarea.value = '';

    setTimeout(() => {
      const typingEl = messages?.querySelector('.ai-typing')?.parentElement;
      if (typingEl) typingEl.remove();
      const response = `That's a great question about <em>${text.slice(0,40)}...</em>. In the context of the Financial Freedom Framework, this relates to the Sequencing Imperative — you must complete Horizon 1 (Protection) before building Horizon 2 (Accumulation). Would you like me to elaborate on any specific aspect?`;
      if (messages) {
        messages.innerHTML += `<div class="ai-msg ai-msg--ai"><div class="ai-msg__bubble">${response}</div></div>`;
        messages.scrollTop = messages.scrollHeight;
      }
    }, 1500);
  }

  sendBtn?.addEventListener('click', sendMessage);
  textarea?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
}

// ── START ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initPlayer();
  initAIPanel();
});

window.goToStep = goToStep;
window.handleKCAnswer = handleKCAnswer;
window.toggleFlashcard = toggleFlashcard;
window.prevFlashcard = prevFlashcard;
window.nextFlashcard = nextFlashcard;
window.startQuiz = startQuiz;
window.selectQuizAnswer = selectQuizAnswer;
window.submitQuiz = submitQuiz;
window.submitAssignment = submitAssignment;
window.checkPractice = checkPractice;
