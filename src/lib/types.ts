// ============================================================
//  FingenIQ — TypeScript Interfaces
// ============================================================

export type LessonStatus = 'completed' | 'in-progress' | 'not-started' | 'locked';
export type ModuleStatus = 'completed' | 'in-progress' | 'not-started';
export type CredentialTier = 'Distinction' | 'Proficiency' | 'Completion' | null;
export type MilestoneStatus = 'achieved' | 'active' | 'planned';
export type TrackEligibility = 'eligible' | 'not-eligible' | 'in-progress';
export type CapstoneTrack = 'A' | 'B';

export interface Module {
  id: string;
  order: number;
  number?: number;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  lessonIds: string[];
  prerequisiteModuleIds: string[];
  professionalTrack: string | null;
}

export interface Lesson {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  subtitle?: string;
  level?: string;
  summary?: string;
  description: string;
  duration: number | string; // minutes or formatted string
  status: LessonStatus;
  score: number | null;
  tags: string[];
  youtubeId?: string;
  steps?: any[];
  pdfPath?: string;
  contentMarkdown?: string;
  keyTakeaways?: string[];
  quiz?: any[];
  simulatorJson?: string;
}

export interface LessonStep {
  id: number;
  name: string;
  type: string;
}

export interface CertTier {
  name: string;
  minScore: number;
  color: string;
  emoji: string;
  requiresCapstoneExcellence: boolean;
}

export interface CertificationConfig {
  weights: {
    knowledgeChecks: number;
    assignments: number;
    quizzes: number;
    moduleAssessments: number;
    capstone: number;
  };
  tiers: CertTier[];
  minimumRequirements: {
    perModuleAssessment: number;
    capstone: number;
    allQuizzesAttempted: boolean;
    allAssignmentsSubmitted: boolean;
  };
}

export interface ModuleProgress {
  status: ModuleStatus;
  lessonsCompleted: number;
  totalLessons: number;
  pct: number;
}

export interface UserProgress {
  lessonsCompleted: number;
  totalLessons: number;
  currentModule: string;
  knowledgeChecks: number;
  assignments: number;
  quizzes: number;
  moduleAssessments: number;
  capstone: number | null;
  modules: Record<string, ModuleProgress>;
}

export interface UserCertification {
  eligible: boolean;
  tier: CredentialTier;
  weightedScore: number | null;
  professionalTracks: string[];
}

export interface UserState {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  joinedDate: string;
  currentLesson: { id: string; stepIndex: number };
  progress: UserProgress;
  certification: UserCertification;
}

export interface ProfessionalTrack {
  id: string;
  name: string;
  icon: string;
  requiredModules: string[];
  requiredLessons: string[];
  eligibility: TrackEligibility;
  description: string;
  requiresCapstoneB?: boolean;
}

export interface Seeker {
  id: string;
  name: string;
  initials: string;
  location: string;
  graduationYear: number;
  credentialTier: string;
  overallScore: number;
  professionalTracks: string[];
  capstoneTrack: CapstoneTrack;
  capstoneTitle: string;
  researchContributions: number;
  bio: string;
  skills: string[];
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  requiredTier: string;
  requiredTrack: string | null;
  salary: string;
  posted: string;
  description: string;
  skills: string[];
}

export interface SebiMilestone {
  id: string;
  status: MilestoneStatus;
  icon: string;
  title: string;
  description: string;
  targetDate: string;
  achievedDate?: string;
  owner: string;
  notes: string;
}

export interface EquivalenceEntry {
  fingeniQ: string;
  ca_icwa: string;
  cfa: string;
  bpf: string;
  note: string;
}

export interface FQData {
  MODULES: Module[];
  LESSONS: Lesson[];
  LESSON_STEPS: LessonStep[];
  USER_STATE: UserState;
  CERTIFICATION_CONFIG: CertificationConfig;
  PROFESSIONAL_TRACKS: ProfessionalTrack[];
  SEEKERS: Seeker[];
  JOB_POSTINGS: JobPosting[];
  SEBI_MILESTONES: SebiMilestone[];
  EQUIVALENCE_MAP: EquivalenceEntry[];
}

// ── Community Types ──────────────────────────────────────────────────────────

export type UserRole = 'learner' | 'employer' | 'admin' | 'employee' | 'community_member';

export interface CommunityArticle {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  author_id: string;
  author_name: string;
  author_bio: string;
  company: string;
  sector: string;
  concept: string;
  rating: string;
  score: number;
  read_time: number;
  claps: number;
  linked_companies: string; // JSON array string
  published: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: number;
  article_id: number;
  user_id: string;
  user_name: string;
  body: string;
  likes: number;
  created_at: string;
}
