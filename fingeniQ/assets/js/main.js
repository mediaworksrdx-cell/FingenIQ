/* ============================================================
   FINGENIIQ — MAIN.JS
   Navigation injection, routing, toast system, shared utilities
   Two-zone architecture: PUBLIC (marketing site) vs PLATFORM (app)
   ============================================================ */

// ── ZONE DETECTION ────────────────────────────────────────────
const PUBLIC_PAGES  = ['index.html', 'about.html', 'contact.html', ''];
const PLATFORM_PAGES = [
  'dashboard.html', 'lessons.html', 'lesson-player.html',
  'assessments.html', 'certification.html', 'certification-roadmap.html',
  'marketplace.html', 'marketplace-search.html', 'marketplace-profile.html'
];

function getCurrentPage() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function isPublicPage() {
  return PUBLIC_PAGES.includes(getCurrentPage());
}

// ── PUBLIC NAV ITEMS ──────────────────────────────────────────
const PUBLIC_NAV_ITEMS = [
  { label: 'Home',       href: 'index.html',   icon: '🏠' },
  { label: 'About Us',   href: 'about.html',   icon: 'ℹ️' },
  { label: 'Contact Us', href: 'contact.html', icon: '✉️' }
];

// ── PLATFORM NAV ITEMS ────────────────────────────────────────
const PLATFORM_NAV_ITEMS = [
  { label: 'Dashboard',     href: 'dashboard.html',             icon: '⌂' },
  { label: 'Lessons',       href: 'lessons.html',               icon: '📚' },
  { label: 'Assessments',   href: 'assessments.html',           icon: '📝' },
  { label: 'Certification', href: 'certification.html',         icon: '🏅', credential: true },
  { label: 'Marketplace',   href: 'marketplace.html',           icon: '🔗' },
  { label: 'SEBI Roadmap',  href: 'certification-roadmap.html', icon: '🗺' }
];

// ── NAV INJECTION ─────────────────────────────────────────────
function buildNav() {
  const root = document.getElementById('nav-root');
  if (!root) return;

  if (isPublicPage()) {
    buildPublicNav(root);
  } else {
    buildPlatformNav(root);
  }
}

function buildPublicNav(root) {
  const currentPage = getCurrentPage();

  const navLinks = PUBLIC_NAV_ITEMS.map(item => {
    const isActive = currentPage === item.href;
    return `<a href="${item.href}" class="nav__link${isActive ? ' active' : ''}">${item.label}</a>`;
  }).join('');

  root.innerHTML = `
    <nav class="nav nav--public" role="navigation" aria-label="Main navigation">
      <div class="nav__inner">
        <a href="index.html" class="nav__logo" aria-label="FingenIQ home">
          <div class="nav__logo-mark" aria-hidden="true">
            <span class="nav__logo-glyph">F</span>
          </div>
          <span class="nav__logo-text">Fingen<span>IQ</span></span>
        </a>

        <div class="nav__links" role="list">
          ${navLinks}
        </div>

        <div class="nav__end">
          <a href="dashboard.html" class="btn btn--brass btn--sm" style="font-size:var(--text-xs);letter-spacing:var(--tracking-wide)">
            Enter FingenIQ →
          </a>
          <button
            id="nav-hamburger"
            class="nav__hamburger"
            aria-label="Open mobile menu"
            aria-controls="nav-drawer"
            aria-expanded="false"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile drawer -->
    <div id="nav-drawer" class="nav-drawer" role="dialog" aria-label="Mobile navigation" aria-modal="true">
      <div class="nav-drawer__overlay" id="nav-drawer-overlay"></div>
      <div class="nav-drawer__panel">
        ${PUBLIC_NAV_ITEMS.map(item => {
          const isActive = currentPage === item.href;
          return `<a href="${item.href}" class="nav__link${isActive ? ' active' : ''}">${item.icon} ${item.label}</a>`;
        }).join('')}
        <hr>
        <a href="dashboard.html" class="btn btn--brass" style="margin-top:var(--sp-2);display:flex;justify-content:center">Enter FingenIQ →</a>
      </div>
    </div>

    <!-- Toast container -->
    <div class="toast-container" id="toast-container" aria-live="polite" aria-atomic="true"></div>
  `;

  attachMobileMenuHandlers();
}

function buildPlatformNav(root) {
  const currentPage = getCurrentPage();

  const navLinks = PLATFORM_NAV_ITEMS.map(item => {
    const isActive = currentPage === item.href;
    const credClass = item.credential ? ' nav__link--credential' : '';
    const activeClass = isActive ? ' active' : '';
    return `<a href="${item.href}" class="nav__link${credClass}${activeClass}">${item.label}</a>`;
  }).join('');

  root.innerHTML = `
    <nav class="nav nav--platform" role="navigation" aria-label="Platform navigation">
      <div class="nav__inner">
        <div style="display:flex;align-items:center;gap:var(--sp-4)">
          <a href="index.html" class="nav__back-link" title="Back to FingenIQ site" aria-label="Back to public site">
            ← Site
          </a>
          <a href="dashboard.html" class="nav__logo" aria-label="FingenIQ platform home">
            <div class="nav__logo-mark" aria-hidden="true">
              <span class="nav__logo-glyph">F</span>
            </div>
            <span class="nav__logo-text">Fingen<span>IQ</span></span>
          </a>
        </div>

        <div class="nav__links" role="list">
          ${navLinks}
        </div>

        <div class="nav__end">
          <button
            id="nav-avatar"
            class="nav__avatar nav__avatar--certified"
            aria-label="User menu"
            aria-expanded="false"
            title="Arjun Mehta — FingenIQ Learner"
          >AM</button>
          <button
            id="nav-hamburger"
            class="nav__hamburger"
            aria-label="Open mobile menu"
            aria-controls="nav-drawer"
            aria-expanded="false"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile drawer -->
    <div id="nav-drawer" class="nav-drawer" role="dialog" aria-label="Mobile navigation" aria-modal="true">
      <div class="nav-drawer__overlay" id="nav-drawer-overlay"></div>
      <div class="nav-drawer__panel">
        <a href="index.html" class="nav__link">🌐 Back to Site</a>
        <hr>
        ${PLATFORM_NAV_ITEMS.map(item => {
          const isActive = currentPage === item.href;
          return `<a href="${item.href}" class="nav__link${isActive ? ' active' : ''}">${item.icon} ${item.label}</a>`;
        }).join('')}
        <hr>
        <a href="account-settings.html" class="nav__link">⚙️ Account Settings</a>
      </div>
    </div>

    <!-- Toast container -->
    <div class="toast-container" id="toast-container" aria-live="polite" aria-atomic="true"></div>
  `;

  attachMobileMenuHandlers();
}

function attachMobileMenuHandlers() {
  const hamburger = document.getElementById('nav-hamburger');
  const drawer    = document.getElementById('nav-drawer');
  const overlay   = document.getElementById('nav-drawer-overlay');

  function openDrawer() {
    drawer.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', openDrawer);
  overlay?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
}

// ── TOAST SYSTEM ──────────────────────────────────────────────
function showToast({ title, message, type = 'success', duration = 4000 }) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✅',
    warning: '⚠️',
    error:   '❌',
    brass:   '🏅',
    info:    'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast__icon">${icons[type] || icons.info}</span>
    <div class="toast__body">
      <div class="toast__title">${title}</div>
      ${message ? `<div class="toast__msg">${message}</div>` : ''}
    </div>
    <button class="btn btn--ghost btn--xs" aria-label="Dismiss" style="padding:4px;align-self:flex-start;">✕</button>
  `;

  const dismiss = () => {
    toast.style.animation = 'slideInRight 200ms reverse both';
    setTimeout(() => toast.remove(), 200);
  };

  toast.querySelector('button').addEventListener('click', dismiss);
  container.appendChild(toast);

  if (duration > 0) setTimeout(dismiss, duration);
  return toast;
}

// ── PROGRESS RING ANIMATION ────────────────────────────────────
function animateProgressRing(svgId, percentage, color = 'var(--sapphire-500)') {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  const fill = svg.querySelector('.progress-ring__fill');
  if (!fill) return;

  const r = parseFloat(fill.getAttribute('r') || 45);
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;

  fill.style.strokeDasharray = `${circ}`;
  fill.style.strokeDashoffset = `${circ}`;
  fill.style.stroke = color;
  fill.style.transition = 'none';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fill.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0,0,0.2,1)';
      fill.style.strokeDashoffset = `${offset}`;
    });
  });
}

// ── PROGRESS BAR ANIMATION ─────────────────────────────────────
function animateProgressBars() {
  const bars = document.querySelectorAll('.progress-bar__fill[data-pct]');
  bars.forEach(bar => {
    const pct = parseFloat(bar.getAttribute('data-pct') || 0);
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.transition = 'width 1.2s cubic-bezier(0,0,0.2,1)';
        bar.style.width = `${pct}%`;
      });
    });
  });
}

// ── SCROLL REVEAL ─────────────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.animate-fadeUp, .animate-scaleIn, .animate-fadeIn').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

// ── STAGGER CHILDREN ──────────────────────────────────────────
function staggerChildren(parentSelector, delayStep = 80) {
  const children = document.querySelectorAll(`${parentSelector} > *`);
  children.forEach((child, i) => {
    child.style.animationDelay = `${i * delayStep}ms`;
    child.classList.add('animate-fadeUp');
  });
}

// ── NUMBER COUNTER ANIMATION ──────────────────────────────────
function animateCounter(el, target, duration = 1200, suffix = '') {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * ease);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ── DATE / TIME UTILITIES ──────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRelative(dateStr) {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// ── COOLDOWN TIMER ─────────────────────────────────────────────
function startCooldownTimer(targetEl, targetTimestamp) {
  function update() {
    const remaining = Math.max(0, targetTimestamp - Date.now());
    if (remaining === 0) {
      targetEl.textContent = 'Ready';
      targetEl.style.color = 'var(--emerald-500)';
      return;
    }
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    targetEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    setTimeout(update, 1000);
  }
  update();
}

// ── SMOOTH SECTION NAVIGATION ──────────────────────────────────
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── LOCAL STORAGE HELPERS ─────────────────────────────────────
const LS = {
  get(key, fallback = null) {
    try { return JSON.parse(localStorage.getItem('fq_' + key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('fq_' + key, JSON.stringify(value)); }
    catch {}
  },
  remove(key) {
    try { localStorage.removeItem('fq_' + key); }
    catch {}
  }
};

// ── DEBOUNCE ──────────────────────────────────────────────────
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── VERIFY CODE GENERATOR ─────────────────────────────────────
function generateVerificationCode(userId, timestamp) {
  const base = `FQ-${userId}-${timestamp}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = ((hash << 5) - hash) + base.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash).toString(36).toUpperCase().padStart(8, '0');
  return `FQ-${positive.slice(0,4)}-${positive.slice(4,8)}`;
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  initScrollReveal();
  animateProgressBars();

  // Show welcome toast on dashboard only
  if (window.location.pathname.includes('dashboard')) {
    setTimeout(() => {
      showToast({
        title: 'Welcome back, Arjun',
        message: 'You\'re on Lesson 4 · Step 7 of 20. Resume where you left off.',
        type: 'info',
        duration: 5000
      });
    }, 800);
  }
});

// Export
window.FQ_UI = {
  showToast, animateProgressRing, animateProgressBars,
  animateCounter, staggerChildren, scrollToSection,
  formatDate, formatRelative, formatDuration,
  startCooldownTimer, generateVerificationCode, LS, debounce
};
