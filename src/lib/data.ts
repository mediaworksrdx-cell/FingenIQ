// ============================================================
//  FingenIQ — Typed Data Layer
//  Updated Module & Lesson syllabus to align with the new spec
// ============================================================
import type {
  Module, Lesson, LessonStep, UserState, CertificationConfig,
  ProfessionalTrack, Seeker, JobPosting, SebiMilestone, EquivalenceEntry
} from './types';

// Dynamically imported lessons from separate files
import L1 from '../../Lessons/content/L1.json';
import L2 from '../../Lessons/content/L2.json';
import L3 from '../../Lessons/content/L3.json';
import L4 from '../../Lessons/content/L4.json';
import L5 from '../../Lessons/content/L5.json';
import L6 from '../../Lessons/content/L6.json';
import L7 from '../../Lessons/content/L7.json';
import L8 from '../../Lessons/content/L8.json';
import L9 from '../../Lessons/content/L9.json';
import L10 from '../../Lessons/content/L10.json';
import L11 from '../../Lessons/content/L11.json';
import L12 from '../../Lessons/content/L12.json';
import L13 from '../../Lessons/content/L13.json';
import L14 from '../../Lessons/content/L14.json';
import L15 from '../../Lessons/content/L15.json';
import L16 from '../../Lessons/content/L16.json';
import L17 from '../../Lessons/content/L17.json';
import L18 from '../../Lessons/content/L18.json';
import L19 from '../../Lessons/content/L19.json';
import L20 from '../../Lessons/content/L20.json';
import L21 from '../../Lessons/content/L21.json';
import L22 from '../../Lessons/content/L22.json';
import L23 from '../../Lessons/content/L23.json';
import L24 from '../../Lessons/content/L24.json';
import L25 from '../../Lessons/content/L25.json';
import L26 from '../../Lessons/content/L26.json';
import L27 from '../../Lessons/content/L27.json';
import L28 from '../../Lessons/content/L28.json';
import L29 from '../../Lessons/content/L29.json';
import L30 from '../../Lessons/content/L30.json';
import L31 from '../../Lessons/content/L31.json';
import L32 from '../../Lessons/content/L32.json';
import L33 from '../../Lessons/content/L33.json';
import L34 from '../../Lessons/content/L34.json';
import L35 from '../../Lessons/content/L35.json';
import L36 from '../../Lessons/content/L36.json';
import L37 from '../../Lessons/content/L37.json';
import L38 from '../../Lessons/content/L38.json';
import L39 from '../../Lessons/content/L39.json';
import L40 from '../../Lessons/content/L40.json';
import L41 from '../../Lessons/content/L41.json';
import L42 from '../../Lessons/content/L42.json';
import L43 from '../../Lessons/content/L43.json';
import L44 from '../../Lessons/content/L44.json';


// ── MODULE DEFINITIONS ────────────────────────────────────────
export const MODULES: Module[] = [
  { 
    id: 'M1', 
    order: 1, 
    icon: '🪙', 
    title: 'Foundations of Money & Financial Systems', 
    subtitle: 'History, assets, global structures & analytical methods', 
    description: 'Master the foundational elements of economic exchange: from wealth psychology and historical evolutionary paradigms of currency to global macroeconomic structures, financial asset categories, and the core disciplines of fundamental and technical valuation.', 
    lessonIds: ['L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11','L12'], 
    prerequisiteModuleIds: [], 
    professionalTrack: null 
  },
  { 
    id: 'M2', 
    order: 2, 
    icon: '💼', 
    title: 'Personal Finance & Wealth Building', 
    subtitle: 'Wealth creation, banking, credit, budgeting & taxes', 
    description: 'Establish absolute command over wealth generation: cash flow management, banking mechanics, CIBIL debt strategies, taxation models, compound growth systems, and life risk/insurance structures.', 
    lessonIds: ['L13','L14','L15','L16','L17','L18'], 
    prerequisiteModuleIds: ['M1'], 
    professionalTrack: 'Banking Professional Certification' 
  },
  { 
    id: 'M3', 
    order: 3, 
    icon: '📈', 
    title: 'Investing Fundamentals', 
    subtitle: 'Equities, bonds, mutual funds, asset allocation & risk', 
    description: 'Deconstruct traditional investing: equity ownership stakes, fixed-income yield analytics, mutual funds and index vehicles, Modern Portfolio Theory (MPT), and derivative risk structures.', 
    lessonIds: ['L19','L20','L21','L22','L23','L24'], 
    prerequisiteModuleIds: ['M1'], 
    professionalTrack: 'Equity Research Analyst Certification' 
  },
  { 
    id: 'M4', 
    order: 4, 
    icon: '⚖️', 
    title: 'Alternative Investments', 
    subtitle: 'Real estate, commodities, private markets', 
    description: 'Navigate alternative capital sectors: direct and indirect real estate structures, hard commodities market dynamics, and private equity / venture capital models.', 
    lessonIds: ['L25','L26','L27'], 
    prerequisiteModuleIds: ['M3'], 
    professionalTrack: null 
  },
  { 
    id: 'M5', 
    order: 5, 
    icon: '🏗️', 
    title: 'Corporate Finance', 
    subtitle: 'Value creation, three-statement modelling, leverage & strategy', 
    description: 'The quantitative core: financial statement parsing, capital structure economics, discounted cash flow (DCF), cost of capital (WACC) calculations, and corporate M&A strategies.', 
    lessonIds: ['L28','L29','L30','L31','L32','L33'], 
    prerequisiteModuleIds: ['M3'], 
    professionalTrack: 'Corporate Finance Professional Certification' 
  },
  { 
    id: 'M6', 
    order: 6, 
    icon: '📊', 
    title: 'Modern Finance & Financial Technology', 
    subtitle: 'Central banking, blockchain, smart assets & AI innovation', 
    description: 'Analyze central bank policies, digital currencies, smart contract structures, and the impact of artificial intelligence on financial innovation.', 
    lessonIds: ['L34','L35','L36'], 
    prerequisiteModuleIds: ['M2','M5'], 
    professionalTrack: 'Banking Professional Certification' 
  },
  { 
    id: 'M7', 
    order: 7, 
    icon: '🛡️', 
    title: 'Institutional Finance', 
    subtitle: 'Hedge funds, portfolio optimization & global capital markets', 
    description: 'Model risk parameters at the institutional level, covering hedge fund strategies, private equity buyouts, portfolio optimization, and cross-border capital flows.', 
    lessonIds: ['L37','L38','L39'], 
    prerequisiteModuleIds: ['M5'], 
    professionalTrack: 'Equity Research Analyst Certification' 
  },
  { 
    id: 'M8', 
    order: 8, 
    icon: '⚖️', 
    title: 'Financial Leadership & Future', 
    subtitle: 'Entrepreneurship, microfinance, ESG, legacy & human indices', 
    description: 'Establish long-term leadership: entrepreneurial structures, social impact models, ESG compliance, legacy transfer, and the rating business human-centric index.', 
    lessonIds: ['L40','L41','L42','L43','L44'], 
    prerequisiteModuleIds: ['M1','M2','M3','M4','M5','M6','M7'], 
    professionalTrack: null 
  },
];

// ── LESSON DEFINITIONS (all 44) ───────────────────────────────
export const LESSONS: Lesson[] = [
  L1, L2, L3, L4, L5, L6, L7, L8, L9, L10, L11, L12, L13, L14, L15, L16, L17, L18, L19, L20, L21, L22, L23, L24, L25, L26, L27, L28, L29, L30, L31, L32, L33, L34, L35, L36, L37, L38, L39, L40, L41, L42, L43, L44
] as unknown as Lesson[];

// ── 19-STEP LESSON FRAMEWORK ─────────────────────────────────
export const LESSON_STEPS: LessonStep[] = [
  { id:1,  name:'Lesson Overview',      type:'overview'     },
  { id:2,  name:'Introduction',         type:'intro'        },
  { id:3,  name:'Learning Objectives',  type:'objectives'   },
  { id:4,  name:'Core Concepts',        type:'concepts'     },
  { id:5,  name:'Key Terminologies',    type:'terminology'  },
  { id:6,  name:'Visual Explanation',   type:'visual'       },
  { id:7,  name:'Real-World Examples',  type:'examples'     },
  { id:8,  name:'Case Study',           type:'casestudy'    },
  { id:9,  name:'Did You Know?',        type:'didyouknow'   },
  { id:10, name:'AI Tutor',             type:'ai-tutor'     },
  { id:11, name:'Knowledge Check',      type:'kc'           },
  { id:12, name:'Practice Activity',    type:'practice'     },
  { id:13, name:'Lesson Summary',       type:'summary'      },
  { id:14, name:'Key Takeaways',        type:'takeaways'    },
  { id:15, name:'Flashcards',           type:'flashcards'   },
  { id:16, name:'Quiz',                 type:'quiz'         },
  { id:17, name:'Assignment',           type:'assignment'   },
  { id:18, name:'Revision Notes',       type:'revision'     },
  { id:19, name:'Next Lesson',          type:'next'         },
];

// ── USER STATE ─────────────────────────────────────────────────
export const USER_STATE: UserState = {
  id: 'U001',
  name: 'User',
  email: 'arjun.mehta@example.com',
  initials: 'U',
  role: 'learner',
  joinedDate: '2025-01-15',
  currentLesson: { id: 'L4', stepIndex: 6 },
  progress: {
    lessonsCompleted: 3,
    totalLessons: 44,
    currentModule: 'M1',
    knowledgeChecks: 85,
    assignments: 78,
    quizzes: 82,
    moduleAssessments: 0,
    capstone: null,
    modules: {
      M1: { status:'in-progress', lessonsCompleted:3, totalLessons:12, pct:25 },
      M2: { status:'not-started', lessonsCompleted:0, totalLessons:6, pct:0 },
      M3: { status:'not-started', lessonsCompleted:0, totalLessons:6, pct:0 },
      M4: { status:'not-started', lessonsCompleted:0, totalLessons:3, pct:0 },
      M5: { status:'not-started', lessonsCompleted:0, totalLessons:6, pct:0 },
      M6: { status:'not-started', lessonsCompleted:0, totalLessons:3, pct:0 },
      M7: { status:'not-started', lessonsCompleted:0, totalLessons:3, pct:0 },
      M8: { status:'not-started', lessonsCompleted:0, totalLessons:5, pct:0 },
    },
  },
  certification: { eligible:false, tier:null, weightedScore:null, professionalTracks:[] },
};

// ── CERTIFICATION CONFIG ───────────────────────────────────────
export const CERTIFICATION_CONFIG: CertificationConfig = {
  weights: { knowledgeChecks:0.10, assignments:0.20, quizzes:0.30, moduleAssessments:0.30, capstone:0.10 },
  tiers: [
    { name:'Distinction', minScore:90, color:'var(--brass-500)',   emoji:'🏅', requiresCapstoneExcellence:true  },
    { name:'Proficiency', minScore:75, color:'var(--sapphire-500)',emoji:'🎓', requiresCapstoneExcellence:false },
    { name:'Completion',  minScore:0,  color:'var(--emerald-500)', emoji:'✅', requiresCapstoneExcellence:false },
  ],
  minimumRequirements: { perModuleAssessment:70, capstone:70, allQuizzesAttempted:true, allAssignmentsSubmitted:true },
};

// ── PROFESSIONAL TRACKS ───────────────────────────────────────
export const PROFESSIONAL_TRACKS: ProfessionalTrack[] = [
  { id:'banking',      name:'Banking Professional Certification',          icon:'🏦', requiredModules:['M2','M6'],       requiredLessons:['L14','L34'],                       eligibility:'not-eligible', description:'Validates expertise in banking systems, central banking, and personal financial management.' },
  { id:'equity',       name:'Equity Research Analyst Certification',       icon:'📈', requiredModules:['M3','M5','M7'],  requiredLessons:['L19','L20','L21','L22','L23','L24','L28','L29','L30','L31','L32','L33','L37','L38','L39'], eligibility:'not-eligible', description:'Validates skills in equity investing, capital structures, financial statements, institutional portfolios, and hedging.' },
  { id:'corp-finance', name:'Corporate Finance Professional Certification', icon:'🏗️', requiredModules:['M5'],           requiredLessons:['L28','L29','L30','L31','L32','L33'],                                             eligibility:'not-eligible', description:'Validates proficiency in financial statements, capital structures, corporate management, and mergers & acquisitions.', requiresCapstoneB:true },
];

// ── MARKETPLACE ────────────────────────────────────────────────
export const SEEKERS: Seeker[] = [
  { id:'S001', name:'Priya Sharma',    initials:'PS', location:'Mumbai',    graduationYear:2024, credentialTier:'Distinction', overallScore:91.2, professionalTracks:['Equity Research Analyst Certification'],                                          capstoneTrack:'B', capstoneTitle:'DCF Valuation: Indian IT Sector Mid-Caps',                               researchContributions:7,  bio:'Equity research enthusiast with a focus on Indian IT and FMCG sectors. Completed FingenIQ with Distinction tier. CFA Level 1 candidate.', skills:['Equity Valuation','Financial Modelling','DCF','Sector Analysis'] },
  { id:'S002', name:'Rahul Nair',      initials:'RN', location:'Bangalore', graduationYear:2024, credentialTier:'Proficiency', overallScore:82.5, professionalTracks:['Banking Professional Certification'],                                             capstoneTrack:'A', capstoneTitle:'Personal Financial Independence Plan: 20-Year Projection',              researchContributions:3,  bio:'Banking and credit risk professional. Specialises in NBFC sector analysis and credit underwriting.', skills:['Credit Analysis','Banking Operations','NBFC','Risk Management'] },
  { id:'S003', name:'Kavya Reddy',     initials:'KR', location:'Hyderabad', graduationYear:2025, credentialTier:'Distinction', overallScore:94.1, professionalTracks:['Equity Research Analyst Certification','Corporate Finance Professional Certification'], capstoneTrack:'B', capstoneTitle:'Investment Thesis: Pharma Sector Post-COVID Supply Chain Restructuring', researchContributions:12, bio:'Dual-certified analyst with research contributions in pharma and healthcare.', skills:['Derivatives','Risk Management','VaR','Sector Research','M&A Analysis'] },
  { id:'S004', name:'Vikram Singh',    initials:'VS', location:'Delhi',     graduationYear:2024, credentialTier:'Proficiency', overallScore:78.3, professionalTracks:['Banking Professional Certification','Corporate Finance Professional Certification'], capstoneTrack:'B', capstoneTitle:'Business Case: Renewable Energy Project Finance',                         researchContributions:5,  bio:'Project finance and infrastructure specialist. Background in renewable energy financing.', skills:['Project Finance','Structured Products','Debt Markets','Modelling'] },
  { id:'S005', name:'Ananya Krishnan', initials:'AK', location:'Chennai',   graduationYear:2025, credentialTier:'Proficiency', overallScore:80.8, professionalTracks:['Equity Research Analyst Certification'],                                          capstoneTrack:'B', capstoneTitle:'Equity Research Report: Auto Ancillary Sector',                            researchContributions:4,  bio:'Auto sector research specialist with strong fundamental analysis skills.', skills:['Fundamental Analysis','Equity Research','Ratio Analysis','Sector Mapping'] },
  { id:'S006', name:'Aryan Gupta',     initials:'AG', location:'Pune',      graduationYear:2024, credentialTier:'Distinction', overallScore:90.5, professionalTracks:['Corporate Finance Professional Certification'],                                    capstoneTrack:'B', capstoneTitle:'M&A Analysis: Indian Consumer Goods Consolidation',                          researchContributions:8,  bio:'Corporate finance professional with deep M&A and valuation expertise.', skills:['M&A','Valuation','LBO','Financial Modelling','Capital Markets'] },
];

export const JOB_POSTINGS: JobPosting[] = [
  { id:'J001', title:'Equity Research Associate',           company:'Motilal Oswal Financial Services',  location:'Mumbai · Hybrid',  type:'Full-time', requiredTier:'Proficiency', requiredTrack:'Equity Research Analyst Certification',       salary:'₹8–12 LPA',  posted:'3 days ago',  description:'Looking for a FingenIQ-certified analyst to join our mid-cap equity research team.', skills:['DCF Modelling','Financial Statement Analysis','Sector Research'] },
  { id:'J002', title:'Credit Risk Analyst',                 company:'HDFC Bank — Wholesale Banking',     location:'Mumbai · On-site', type:'Full-time', requiredTier:'Proficiency', requiredTrack:'Banking Professional Certification',           salary:'₹7–11 LPA',  posted:'1 week ago',  description:'Credit analysis role within the Wholesale Banking division.', skills:['Credit Analysis','Ratio Analysis','Banking Operations'] },
  { id:'J003', title:'M&A Analyst — Investment Banking',    company:'Avendus Capital',                   location:'Mumbai · On-site', type:'Full-time', requiredTier:'Distinction', requiredTrack:'Corporate Finance Professional Certification',  salary:'₹12–18 LPA', posted:'5 days ago',  description:'Analyst position in Avendus\' M&A advisory practice.', skills:['M&A','Valuation','LBO Modelling','Pitchbook Preparation'] },
  { id:'J004', title:'Fixed Income Research Analyst',       company:'ICICI Securities — Fixed Income',   location:'Mumbai · Hybrid',  type:'Full-time', requiredTier:'Proficiency', requiredTrack:'Banking Professional Certification',           salary:'₹9–13 LPA',  posted:'2 days ago',  description:'Fixed income research role covering G-Sec and corporate bond markets.', skills:['Fixed Income','Yield Curve Analysis','Credit Research'] },
  { id:'J005', title:'Portfolio Analyst — Mutual Fund Research', company:'Mirae Asset Investment Managers', location:'Mumbai · Hybrid', type:'Full-time', requiredTier:'Proficiency', requiredTrack:null,                                          salary:'₹8–12 LPA',  posted:'1 day ago',   description:'Quantitative and qualitative analysis of mutual fund performance.', skills:['Portfolio Analysis','Mutual Funds','Alpha/Beta','Sharpe Ratio'] },
];

// ── SEBI MILESTONES ───────────────────────────────────────────
export const SEBI_MILESTONES: SebiMilestone[] = [
  { id:'MS1', status:'achieved', icon:'✅', title:'Proctored Assessment Infrastructure',    description:'Deployment of webcam-based proctoring with tab-switch detection and timer enforcement for all Module Assessments.',             targetDate:'Q2 2025', achievedDate:'Q1 2025', owner:'FingenIQ Technology Team',          notes:'Completed ahead of schedule. 3 proctoring providers evaluated; SIFY iGuru selected.' },
  { id:'MS2', status:'achieved', icon:'✅', title:'External Question Bank Audit',           description:'Independent audit of all 880+ assessment questions by a registered CA firm and SEBI-registered investment adviser.',            targetDate:'Q4 2025', achievedDate:'Q3 2025', owner:'Deloitte India / External Audit Partner', notes:'Audit completed. 47 questions revised; 12 retired and replaced.' },
  { id:'MS3', status:'active',   icon:'🔄', title:'Industry Advisory Board Formation',     description:'Constituting a 7-member Industry Advisory Board comprising SEBI-registered research analysts, CFA charterholders, and practitioners.',  targetDate:'Q1 2026',                        owner:'FingenIQ Governance Committee',     notes:'Board constitution 60% complete. 4 of 7 members confirmed.' },
  { id:'MS4', status:'planned',  icon:'📋', title:'SEBI Regulatory Submission',            description:'Submission of formal curriculum documentation, proctoring audit reports, and industry advisory sign-off to SEBI.',               targetDate:'Q3 2026',                        owner:'FingenIQ Legal & Regulatory Team',  notes:'This is an aspiration, not a committed regulatory timeline.' },
  { id:'MS5', status:'planned',  icon:'🎯', title:'Regulatory Determination',             description:'Awaiting SEBI\'s regulatory review outcome. FingenIQ acknowledges that outcome is entirely at SEBI\'s discretion.',             targetDate:'TBD',                            owner:'Securities and Exchange Board of India', notes:'No regulatory equivalence is claimed at this time.' },
];

export const EQUIVALENCE_MAP: EquivalenceEntry[] = [
  { fingeniQ:'Module 1: Foundations of Money & Financial Systems', ca_icwa:'CA Foundation: Business Economics (partial)', cfa:'CFA L1: Financial Economics (partial)', bpf:'BPF Year 1: Money & Financial History', note:'Gap map only — not a claim of equivalence' },
  { fingeniQ:'Module 2: Personal Finance & Wealth Building',     ca_icwa:'CA Intermediate: Financial Planning (partial)',  cfa:'CFA L1: Personal Financial Planning',         bpf:'BPF Year 1: Wealth Management',        note:'Gap map only — not a claim of equivalence' },
  { fingeniQ:'Module 3: Investing Fundamentals',                 ca_icwa:'CA Intermediate: Securities Investments',        cfa:'CFA L1: Equity & Fixed Income Markets',        bpf:'BPF Year 2: Investing & Markets',       note:'Gap map only — not a claim of equivalence' },
  { fingeniQ:'Module 5: Corporate Finance',                      ca_icwa:'CA Final: Strategic Corporate Finance',          cfa:'CFA L2: Corporate Issuers & Equity Valuation', bpf:'BPF Year 3: Advanced Corporate Finance',   note:'Gap map only — not a claim of equivalence' },
  { fingeniQ:'Module 7: Institutional Finance',                  ca_icwa:'CA Final: Portfolio & Wealth Arbitrage',         cfa:'CFA L3: Portfolio Management & Asset Allocation', bpf:'BPF Year 3: Institutional Arbitrage',  note:'Gap map only — not a claim of equivalence' },
];

// ── HELPER FUNCTIONS ──────────────────────────────────────────
export const getLessonById = (id: string): Lesson | null =>
  LESSONS.find(l => l.id === id) ?? null;

export const getModuleById = (id: string): Module | null =>
  MODULES.find(m => m.id === id) ?? null;

export const getLessonsByModule = (moduleId: string): Lesson[] =>
  LESSONS.filter(l => l.moduleId === moduleId).sort((a, b) => a.order - b.order);

export const computeWeightedScore = (scores: {
  knowledgeChecks: number;
  assignments: number;
  quizzes: number;
  moduleAssessments: number;
  capstone: number;
}): number => {
  const w = CERTIFICATION_CONFIG.weights;
  return (
    scores.knowledgeChecks   * w.knowledgeChecks   +
    scores.assignments       * w.assignments       +
    scores.quizzes           * w.quizzes           +
    scores.moduleAssessments * w.moduleAssessments +
    scores.capstone          * w.capstone
  );
};

export const isModuleUnlocked = (moduleId: string): boolean => {
  const module = getModuleById(moduleId);
  if (!module || module.prerequisiteModuleIds.length === 0) return true;
  return module.prerequisiteModuleIds.every(
    prereqId => USER_STATE.progress.modules[prereqId]?.status === 'completed'
  );
};

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    completed:   'var(--emerald-500)',
    'in-progress': 'var(--amber-500)',
    'not-started': 'var(--ink-600)',
    locked:      'var(--rose-500)',
  };
  return map[status] ?? map['not-started'];
};
