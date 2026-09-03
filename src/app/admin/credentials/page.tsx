'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { 
  createCredentialAction, bulkCreateCredentialsAction, toggleAccountStatusAction, forceResetAction, 
  renewCredentialAction, batchRenewCredentialsAction, createBusinessEntityAction, toggleEntityStatusAction, 
  createPackageAction, togglePackageStatusAction, saveLessonFullContentAction, 
  adminUpdateCommunityArticleAction, adminDeleteCommunityArticleAction, adminDeleteCommentAction,
  saveAiKnowledgeDocAction, toggleAiKnowledgeDocAction, deleteAiKnowledgeDocAction, updateAiSettingAction,
  saveChatbotQAAction, deleteChatbotQAAction, bulkSaveChatbotQAsAction, resetChatbotQAsAction,
  adminResetUserProgressAction, BulkUserRow,
  editUserAction, deleteUserAction, changeUserPasswordAction, editEntityAction, deleteEntityAction, deletePackageAction,
  createNewLessonAction, deleteLessonAction,
  saveAssessmentQuestionAction, deleteAssessmentQuestionAction, saveAssessmentSettingsAction,
  saveCapstoneTrackAction, deleteCapstoneTrackAction,
  saveCertificationSettingsAction, saveProfessionalTrackAction, deleteProfessionalTrackAction
} from '@/app/actions/adminActions';
import { logoutAction } from '@/app/actions/authActions';
import { LESSONS, MODULES, LESSON_STEPS } from '@/lib/data';
import Link from 'next/link';

export default function AdminCredentials() {
  const [sessionToken, setSessionToken] = useState<string>('');
  const [stats, setStats] = useState({
    total: 0, pending: 0, active: 0, locked: 0, disabled: 0, expiring: 0, expired: 0,
    certifiedCount: 0, cohortAvgScore: 0, distinctionCount: 0, meritCount: 0, passCount: 0, needsSupportCount: 0
  });
  const [moduleStats, setModuleStats] = useState<Record<string, { completedCount: number; totalScore: number; gradedCount: number }>>({});
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [entitiesList, setEntitiesList] = useState<any[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [articlesList, setArticlesList] = useState<any[]>([]);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [lessonOverrides, setLessonOverrides] = useState<any[]>([]);
  const [aiKnowledgeDocs, setAiKnowledgeDocs] = useState<any[]>([]);
  const [aiSettings, setAiSettings] = useState<any[]>([]);
  const [chatbotQAs, setChatbotQAs] = useState<any[]>([]);
  const [qaSearchQuery, setQaSearchQuery] = useState('');
  const [qaCategoryFilter, setQaCategoryFilter] = useState('all');
  const [qaSaveStatus, setQaSaveStatus] = useState<string | null>(null);
  const [newQAQuestion, setNewQAQuestion] = useState('');
  const [newQAAnswer, setNewQAAnswer] = useState('');
  const [newQACategory, setNewQACategory] = useState('General');

  // ─── INSTITUTIONAL ACADEMIC GOVERNANCE STATE ──────────────────────────────
  const [govSubTab, setGovSubTab] = useState<'assessments' | 'capstone' | 'certification'>('assessments');
  const [assessmentQuestions, setAssessmentQuestions] = useState<any[]>([]);
  const [assessmentSettings, setAssessmentSettings] = useState<any>({ timeLimitSeconds: 1200, maxTabSwitches: 3, passingScorePct: 70, webcamRequired: 1 });
  const [selectedAssessmentModule, setSelectedAssessmentModule] = useState<string>('all');
  const [capstoneTracks, setCapstoneTracks] = useState<any[]>([]);
  const [certificationSettings, setCertificationSettings] = useState<any>({ distinctionMinScore: 85, proficiencyMinScore: 75, completionMinScore: 60 });
  const [professionalTracks, setProfessionalTracks] = useState<any[]>([]);
  const [govSaveStatus, setGovSaveStatus] = useState<string | null>(null);

  // Question creator state
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestionModule, setNewQuestionModule] = useState('M1');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(['', '', '', '']);
  const [newQuestionCorrectIndex, setNewQuestionCorrectIndex] = useState(0);
  const [newQuestionExplanation, setNewQuestionExplanation] = useState('');
  const [newQuestionDifficulty, setNewQuestionDifficulty] = useState<'foundation' | 'intermediate' | 'advanced'>('intermediate');

  // Capstone pathway creator state
  const [showAddCapstoneModal, setShowAddCapstoneModal] = useState(false);
  const [newCapstoneId, setNewCapstoneId] = useState('');
  const [newCapstoneCode, setNewCapstoneCode] = useState('D');
  const [newCapstoneTitle, setNewCapstoneTitle] = useState('');
  const [newCapstoneIcon, setNewCapstoneIcon] = useState('📊');
  const [newCapstoneDesc, setNewCapstoneDesc] = useState('');
  const [newCapstoneRubric, setNewCapstoneRubric] = useState('');
  const [newCapstonePass, setNewCapstonePass] = useState(70);
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'lessons' | 'governance' | 'chatbot_qa' | 'community' | 'entities'>('analytics');
  const [selectedLoginCategory, setSelectedLoginCategory] = useState('b2c');

  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [passwordUser, setPasswordUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editingEntity, setEditingEntity] = useState<any>(null);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const USER_PAGE_SIZE = 50;

  // ─── USER ROSTER FILTERS & SEARCH ─────────────────────────────────────────
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userEntityFilter, setUserEntityFilter] = useState('all');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // ─── BULK CSV PROVISIONING MODAL STATE ────────────────────────────────────
  const [showBulkCsvModal, setShowBulkCsvModal] = useState(false);
  const [rawCsvText, setRawCsvText] = useState('');
  const [parsedCsvRows, setParsedCsvRows] = useState<BulkUserRow[]>([]);
  const [bulkImportResult, setBulkImportResult] = useState<any | null>(null);

  // ─── LESSON STUDIO STATE ───────────────────────────────────────────────────
  const [selectedModuleId, setSelectedModuleId] = useState('M1');
  const [selectedLessonId, setSelectedLessonId] = useState(LESSONS[0]?.id || 'L1');
  const [editorViewMode, setEditorViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [newLessonData, setNewLessonData] = useState({
    lessonId: '',
    moduleId: 'M1',
    title: '',
    duration: '45 min',
    level: 'Foundational',
    summary: '',
  });
  
  // Lesson Form fields
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSubtitle, setLessonSubtitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState('45 min');
  const [lessonLevel, setLessonLevel] = useState('Foundational');
  const [lessonSummary, setLessonSummary] = useState('');
  const [lessonContentMarkdown, setLessonContentMarkdown] = useState('');
  const [lessonYoutubeId, setLessonYoutubeId] = useState('');
  const [lessonPdfPath, setLessonPdfPath] = useState('');
  const [lessonGalleryImages, setLessonGalleryImages] = useState<string[]>([]);
  const [newGalleryImageInput, setNewGalleryImageInput] = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([]);
  const [newTakeawayInput, setNewTakeawayInput] = useState('');
  
  // Simulator Parameters State
  const [simPreset, setSimPreset] = useState<'dcf' | 'lbo' | 'multiples' | 'custom'>('dcf');
  const [simWacc, setSimWacc] = useState(9.5);
  const [simGrowth, setSimGrowth] = useState(2.5);
  const [simExitMultiple, setSimExitMultiple] = useState(12.0);
  const [simTaxRate, setSimTaxRate] = useState(25.0);
  const [simDebtRatio, setSimDebtRatio] = useState(60.0);
  const [customSimJson, setCustomSimJson] = useState('{}');

  // Quiz Builder State
  const [lessonQuiz, setLessonQuiz] = useState<any[]>([
    {
      question: 'What is the primary objective of this financial model?',
      options: ['Determine intrinsic equity value', 'Calculate sales commission', 'Schedule audit meetings', 'Estimate payroll taxes'],
      correctAnswer: 0,
      explanation: 'Discounted Cash Flow determines the intrinsic enterprise and equity value of a firm based on free cash flows.'
    }
  ]);
  const [lessonSaveStatus, setLessonSaveStatus] = useState<string | null>(null);

  // Lesson Sections / Steps State & Uploads
  const [lessonSteps, setLessonSteps] = useState<Array<{ stepId: number; name: string; type: string; description: string }>>([]);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingSlides, setIsUploadingSlides] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [expandedSectionIndex, setExpandedSectionIndex] = useState<number | null>(0);

  // ─── AARKAA AI STUDIO STATE ────────────────────────────────────────────────
  const [selectedPromptMode, setSelectedPromptMode] = useState('institutional');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Valuation Standards');
  const [newDocContent, setNewDocContent] = useState('');
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [aiTestPrompt, setAiTestPrompt] = useState('How does net working capital impact free cash flow to firm?');
  const [aiTestResponse, setAiTestResponse] = useState<string | null>(null);
  const [isAiTesting, setIsAiTesting] = useState(false);

  // ─── COMMUNITY MODERATION STATE ───────────────────────────────────────────
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [editArticleTitle, setEditArticleTitle] = useState('');
  const [editArticleContent, setEditArticleContent] = useState('');
  const [editArticleCategory, setEditArticleCategory] = useState('Valuation');

  // ─── RENEWAL STATE ────────────────────────────────────────────────────────
  const [renewUserId, setRenewUserId] = useState<string | null>(null);
  const [renewPeriod, setRenewPeriod] = useState<'monthly' | 'quarterly' | 'half_yearly' | 'annual'>('monthly');

  const [isPending, startTransition] = useTransition();

  // ─── PDF & SVG UPLOAD HANDLERS ─────────────────────────────────────────────
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPdf(true);
    setUploadStatus(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('lessonId', selectedLessonId);
      fd.append('type', 'pdf');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setLessonPdfPath(data.url);
        setUploadStatus(`✓ PDF uploaded successfully: ${data.url}`);
      } else {
        setUploadStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setUploadStatus(`❌ Upload error: ${err.message}`);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSlidesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingSlides(true);
    setUploadStatus(null);
    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        fd.append('files', files[i]);
      }
      fd.append('lessonId', selectedLessonId);
      fd.append('type', 'slide');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.urls && data.urls.length > 0) {
        setLessonGalleryImages(prev => [...prev, ...data.urls]);
        setUploadStatus(`✓ Uploaded ${data.urls.length} slide(s) successfully!`);
      } else {
        setUploadStatus(`❌ Slides upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setUploadStatus(`❌ Slides upload error: ${err.message}`);
    } finally {
      setIsUploadingSlides(false);
    }
  };

  // ─── LESSON SECTIONS / STEPS HANDLERS ──────────────────────────────────────
  const handleAddSection = () => {
    const nextId = lessonSteps.length > 0 ? Math.max(...lessonSteps.map(s => s.stepId || 0)) + 1 : 1;
    const newSection = {
      stepId: nextId,
      name: `New Section ${lessonSteps.length + 1}`,
      type: 'concepts',
      description: 'Enter lecture content and study notes for this section...',
    };
    setLessonSteps(prev => [...prev, newSection]);
    setExpandedSectionIndex(lessonSteps.length);
  };

  const handleUpdateSection = (index: number, field: 'name' | 'type' | 'description', value: string) => {
    setLessonSteps(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteSection = (index: number) => {
    if (confirm('Are you sure you want to remove this section?')) {
      setLessonSteps(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lessonSteps.length) return;
    setLessonSteps(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  // Load lesson data into editor when selectedLessonId changes
  useEffect(() => {
    const defaultLesson = LESSONS.find(l => l.id === selectedLessonId);
    const override = lessonOverrides.find(o => o.lessonId === selectedLessonId);

    if (override) {
      setLessonTitle(override.title || defaultLesson?.title || '');
      setLessonSubtitle(override.subtitle || defaultLesson?.subtitle || '');
      setLessonDuration(String(override.duration || defaultLesson?.duration || '45 min'));
      setLessonLevel(override.level || defaultLesson?.level || 'Foundational');
      setLessonSummary(override.summary || defaultLesson?.summary || '');
      setLessonContentMarkdown(override.contentMarkdown || defaultLesson?.contentMarkdown || '');
      setLessonYoutubeId(override.youtubeId || defaultLesson?.youtubeId || '');
      setLessonPdfPath(override.pdfPath || defaultLesson?.pdfPath || '');
      
      try {
        if (override.keyTakeawaysJson) {
          setKeyTakeaways(JSON.parse(override.keyTakeawaysJson));
        } else {
          setKeyTakeaways(defaultLesson?.keyTakeaways || []);
        }
      } catch {
        setKeyTakeaways([]);
      }

      try {
        if (override.simulatorJson) {
          const simObj = JSON.parse(override.simulatorJson);
          setCustomSimJson(override.simulatorJson);
          if (simObj.wacc !== undefined) setSimWacc(simObj.wacc);
          if (simObj.terminalGrowth !== undefined) setSimGrowth(simObj.terminalGrowth);
          if (simObj.exitMultiple !== undefined) setSimExitMultiple(simObj.exitMultiple);
          if (simObj.taxRate !== undefined) setSimTaxRate(simObj.taxRate);
          if (simObj.debtRatio !== undefined) setSimDebtRatio(simObj.debtRatio);
        }
      } catch {
        setCustomSimJson('{}');
      }

      try {
        if (override.galleryImagesJson) {
          setLessonGalleryImages(JSON.parse(override.galleryImagesJson));
        } else if (defaultLesson?.galleryImages && defaultLesson.galleryImages.length > 0) {
          setLessonGalleryImages(defaultLesson.galleryImages);
        } else {
          setLessonGalleryImages(
            Array.from({ length: 20 }, (_, i) => `/lessons/${selectedLessonId}/slide-${i + 1}.svg`)
          );
        }
      } catch {
        setLessonGalleryImages([]);
      }

      try {
        if (override.quizJson) {
          setLessonQuiz(JSON.parse(override.quizJson));
        } else {
          setLessonQuiz(defaultLesson?.quiz || []);
        }
      } catch {
        setLessonQuiz([]);
      }

      try {
        if (override.stepsJson) {
          setLessonSteps(JSON.parse(override.stepsJson));
        } else if (defaultLesson?.steps && defaultLesson.steps.length > 0) {
          setLessonSteps(defaultLesson.steps.map((s: any, i: number) => ({
            stepId: s.stepId ?? (i + 1),
            name: s.name || `Section ${i + 1}`,
            type: s.type || 'concepts',
            description: s.description || '',
          })));
        } else {
          setLessonSteps(LESSON_STEPS.map(s => ({
            stepId: s.id,
            name: s.name,
            type: s.type,
            description: `This section covers formal concepts, case examples, and study modules associated with ${s.name}.`,
          })));
        }
      } catch {
        setLessonSteps([]);
      }
    } else if (defaultLesson) {
      setLessonTitle(defaultLesson.title);
      setLessonSubtitle(defaultLesson.subtitle || '');
      setLessonDuration(String(defaultLesson.duration || '45 min'));
      setLessonLevel(defaultLesson.level || 'Foundational');
      setLessonSummary(defaultLesson.summary || '');
      setLessonContentMarkdown(defaultLesson.contentMarkdown || '');
      setLessonYoutubeId(defaultLesson.youtubeId || '');
      setLessonPdfPath(defaultLesson.pdfPath || '');
      setLessonGalleryImages(
        defaultLesson.galleryImages && defaultLesson.galleryImages.length > 0
          ? defaultLesson.galleryImages
          : Array.from({ length: 20 }, (_, i) => `/lessons/${defaultLesson.id}/slide-${i + 1}.svg`)
      );
      setKeyTakeaways(defaultLesson.keyTakeaways || []);
      setLessonQuiz(defaultLesson.quiz || []);
      setCustomSimJson('{}');
      if (defaultLesson.steps && defaultLesson.steps.length > 0) {
        setLessonSteps(defaultLesson.steps.map((s: any, i: number) => ({
          stepId: s.stepId ?? (i + 1),
          name: s.name || `Section ${i + 1}`,
          type: s.type || 'concepts',
          description: s.description || '',
        })));
      } else {
        setLessonSteps(LESSON_STEPS.map(s => ({
          stepId: s.id,
          name: s.name,
          type: s.type,
          description: `This section covers formal concepts, case examples, and study modules associated with ${s.name}.`,
        })));
      }
    }
    setLessonSaveStatus(null);
  }, [selectedLessonId, lessonOverrides]);

  const fetchDashboardData = () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('session_token='))
      ?.split('=')[1];
    if (token) setSessionToken(token);

    fetch('/api/admin/data')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setModuleStats(data.moduleStats || {});
          setUsersList(data.users || []);
          setAuditLogs(data.auditLogs || []);
          setEntitiesList(data.entities || []);
          setPackagesList(data.packages || []);
          setArticlesList(data.articles || []);
          setCommentsList(data.comments || []);
          setLessonOverrides(data.lessonOverrides || []);
          setAiKnowledgeDocs(data.aiKnowledgeDocs || []);
          setAiSettings(data.aiSettings || []);
          setChatbotQAs(data.chatbotQAs || []);
          setAssessmentQuestions(data.assessmentQuestions || []);
          if (data.assessmentSettings) setAssessmentSettings(data.assessmentSettings);
          setCapstoneTracks(data.capstoneTracks || []);
          if (data.certificationSettings) setCertificationSettings(data.certificationSettings);
          setProfessionalTracks(data.professionalTracks || []);

          const modeSetting = (data.aiSettings || []).find((s: any) => s.settingKey === 'system_prompt_mode');
          if (modeSetting) setSelectedPromptMode(modeSetting.settingValue);
        }
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filtered Users List with Instant Search & Multi-Criteria Filtering
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchesSearch = !userSearchQuery || 
        u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.id?.toLowerCase().includes(userSearchQuery.toLowerCase());
      
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchesStatus = userStatusFilter === 'all' || (
        userStatusFilter === 'expiring' ? (u.credentialExpiresAt && (new Date(u.credentialExpiresAt).getTime() - Date.now()) <= 14 * 86400000 && (new Date(u.credentialExpiresAt).getTime() - Date.now()) > 0) :
        userStatusFilter === 'expired' ? (u.credentialExpiresAt && new Date(u.credentialExpiresAt).getTime() <= Date.now()) :
        u.accountStatus === userStatusFilter
      );
      const matchesEntity = userEntityFilter === 'all' || u.businessEntityId === userEntityFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesEntity;
    });
  }, [usersList, userSearchQuery, userRoleFilter, userStatusFilter, userEntityFilter]);

  // ── CSV PARSER & FORMULA INJECTION SANITIZER ──────────────────────────────
  const handleParseCsv = (text: string) => {
    setRawCsvText(text);
    if (!text.trim()) {
      setParsedCsvRows([]);
      return;
    }

    const lines = text.trim().split(/\r?\n/);
    const rows: BulkUserRow[] = [];

    // Check if header line exists
    const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 2) {
        rows.push({
          name: cols[0] || 'Learner',
          email: cols[1] || '',
          role: (cols[2] || 'learner').toLowerCase(),
          validityPeriod: (cols[3] || 'annual') as any,
          deliveryMethod: (cols[4] || 'link') as any,
          loginCategory: cols[5] || 'b2c',
          businessEntityId: cols[6] || null,
        });
      }
    }
    setParsedCsvRows(rows);
  };

  const handleExecuteBulkImport = () => {
    if (parsedCsvRows.length === 0) return;
    startTransition(async () => {
      const res = await bulkCreateCredentialsAction(sessionToken, parsedCsvRows);
      setBulkImportResult(res);
      if (res.success) {
        fetchDashboardData();
      }
    });
  };

  // Safe CSV Exporter with Formula-Injection Guard
  const handleExportUsersCsv = () => {
    const sanitizeForCsv = (val: any) => {
      let str = String(val ?? '');
      // Prevent formula injection: if starts with =, +, -, @, \t, \r, prepend a single quote
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = ['User ID', 'Name', 'Email', 'Role', 'Account Status', 'Category', 'Entity ID', 'Validity', 'Lessons Completed', 'Avg Score', 'Grade Tier', 'Certified'];
    const rows = filteredUsers.map(u => [
      sanitizeForCsv(u.id),
      sanitizeForCsv(u.name),
      sanitizeForCsv(u.email),
      sanitizeForCsv(u.role),
      sanitizeForCsv(u.accountStatus),
      sanitizeForCsv(u.loginCategory || 'b2c'),
      sanitizeForCsv(u.businessEntityId || ''),
      sanitizeForCsv(u.validityPeriod || 'annual'),
      sanitizeForCsv(u.completedLessonsCount || 0),
      sanitizeForCsv(u.avgScore !== null ? `${u.avgScore}%` : 'N/A'),
      sanitizeForCsv(u.gradeTier || 'Not Graded'),
      sanitizeForCsv(u.hasCertificate ? 'YES' : 'NO'),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FinGenIQ_User_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── LESSON PUBLISHER ──────────────────────────────────────────────────────
  const handleSaveLesson = async () => {
    startTransition(async () => {
      setLessonSaveStatus('Publishing curriculum updates...');
      
      const compiledSimulatorJson = simPreset === 'custom' ? customSimJson : JSON.stringify({
        preset: simPreset,
        wacc: simWacc,
        terminalGrowth: simGrowth,
        exitMultiple: simExitMultiple,
        taxRate: simTaxRate,
        debtRatio: simDebtRatio,
      });

      const res = await saveLessonFullContentAction(sessionToken, {
        lessonId: selectedLessonId,
        title: lessonTitle,
        subtitle: lessonSubtitle,
        duration: lessonDuration,
        level: lessonLevel,
        summary: lessonSummary,
        contentMarkdown: lessonContentMarkdown,
        keyTakeawaysJson: JSON.stringify(keyTakeaways),
        youtubeId: lessonYoutubeId,
        pdfPath: lessonPdfPath,
        galleryImagesJson: JSON.stringify(lessonGalleryImages),
        simulatorJson: compiledSimulatorJson,
        quizJson: JSON.stringify(lessonQuiz),
        stepsJson: JSON.stringify(lessonSteps),
      });

      if (res.success) {
        setLessonSaveStatus('✓ Lesson, Simulator & Assessment published successfully!');
        fetchDashboardData();
      } else {
        setLessonSaveStatus('❌ Error: ' + res.error);
      }
    });
  };

  // ── AI KNOWLEDGE BASE HANDLERS ────────────────────────────────────────────
  const handleSaveAiDoc = () => {
    if (!newDocTitle.trim() || !newDocContent.trim()) return;
    startTransition(async () => {
      const res = await saveAiKnowledgeDocAction(sessionToken, {
        id: editingDocId || undefined,
        title: newDocTitle,
        category: newDocCategory,
        content: newDocContent,
      });
      if (res.success) {
        setNewDocTitle('');
        setNewDocContent('');
        setEditingDocId(null);
        fetchDashboardData();
      } else {
        alert('Error: ' + res.error);
      }
    });
  };

  const handleTestAi = async () => {
    if (!aiTestPrompt.trim() || isAiTesting) return;
    setIsAiTesting(true);
    setAiTestResponse(null);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiTestPrompt, sessionId: 'admin-preview-session' }),
      });
      const data = await res.json();
      setAiTestResponse(data.response || (data.useLocalFallback ? 'Knowledge base synthesized response (fallback engine).' : 'No response generated.'));
    } catch {
      setAiTestResponse('Failed to reach AI service.');
    } finally {
      setIsAiTesting(false);
    }
  };

  // ── USER ACTIONS ──────────────────────────────────────────────────────────
  const handleEditUser = async () => {
    if (!editingUser) return;
    startTransition(async () => {
      const res = await editUserAction(sessionToken, editingUser);
      if (res.success) {
        setEditingUser(null);
        fetchDashboardData();
      } else {
        alert(res.error || 'Failed to update user');
      }
    });
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    startTransition(async () => {
      const res = await deleteUserAction(sessionToken, deletingUser.id);
      if (res.success) {
        setDeletingUser(null);
        fetchDashboardData();
      } else {
        alert(res.error || 'Failed to delete user');
      }
    });
  };

  const handleChangePassword = async () => {
    if (!passwordUser || !newPassword) return;
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    startTransition(async () => {
      const res = await changeUserPasswordAction(sessionToken, passwordUser.id, newPassword);
      if (res.success) {
        setPasswordUser(null);
        setNewPassword('');
        setConfirmPassword('');
        fetchDashboardData();
      } else {
        alert(res.error || 'Failed to change password');
      }
    });
  };

  const handleEditEntity = async () => {
    if (!editingEntity) return;
    startTransition(async () => {
      const res = await editEntityAction(sessionToken, {
        ...editingEntity,
        entityId: editingEntity.entityId || editingEntity.id,
      });
      if (res.success) {
        setEditingEntity(null);
        fetchDashboardData();
      } else {
        alert(res.error || 'Failed to update entity');
      }
    });
  };

  const handleDeleteEntity = async (entityId: string) => {
    if (!confirm('Are you sure you want to delete this entity? This cannot be undone.')) return;
    const res = await deleteEntityAction(sessionToken, entityId);
    if (res.success) {
      fetchDashboardData();
    } else {
      alert(res.error || 'Failed to delete entity');
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    const res = await deletePackageAction(sessionToken, packageId);
    if (res.success) {
      fetchDashboardData();
    } else {
      alert(res.error || 'Failed to delete package');
    }
  };

  const handleToggleUser = (id: string) => {
    startTransition(async () => {
      const u = usersList.find(x => x.id === id);
      const actionType = u?.accountStatus === 'active' ? 'disable' : 'enable';
      await toggleAccountStatusAction(sessionToken, id, actionType);
      fetchDashboardData();
    });
  };

  const handleForceReset = (id: string) => {
    startTransition(async () => {
      await forceResetAction(sessionToken, id);
      alert('Password reset link issued and registered in audit logs.');
      fetchDashboardData();
    });
  };

  const handleRenew = (id: string) => {
    startTransition(async () => {
      await renewCredentialAction(sessionToken, id, renewPeriod);
      setRenewUserId(null);
      fetchDashboardData();
    });
  };

  const handleBatchRenew = () => {
    if (selectedUserIds.length === 0) return;
    startTransition(async () => {
      const res = await batchRenewCredentialsAction(sessionToken, selectedUserIds, renewPeriod);
      if (res.success) {
        alert(`Successfully extended credentials for ${res.renewedCount} accounts.`);
        setSelectedUserIds([]);
        fetchDashboardData();
      }
    });
  };

  const handleCreateLesson = async () => {
    if (!newLessonData.lessonId || !newLessonData.title) {
      alert('Lesson ID and Title are required');
      return;
    }
    const res = await createNewLessonAction(sessionToken, newLessonData);
    if (res.success) {
      alert('Lesson created successfully!');
      setShowAddLessonModal(false);
      setSelectedLessonId(newLessonData.lessonId);
      setNewLessonData({
        lessonId: '',
        moduleId: selectedModuleId,
        title: '',
        duration: '45 min',
        level: 'Foundational',
        summary: '',
      });
      fetchDashboardData();
    } else {
      alert(res.error || 'Failed to create lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm(`Are you sure you want to delete / reset lesson ${lessonId}?`)) return;
    const res = await deleteLessonAction(sessionToken, lessonId);
    if (res.success) {
      alert('Lesson override deleted/reset successfully');
      fetchDashboardData();
    } else {
      alert(res.error || 'Failed to delete lesson');
    }
  };

  const filteredLessons = useMemo(() => {
    const staticForModule = LESSONS.filter(l => l.moduleId === selectedModuleId);
    const customForModule = lessonOverrides
      .filter(o => o.moduleId === selectedModuleId && !staticForModule.some(l => l.id === o.lessonId))
      .map((o, idx) => ({
        id: o.lessonId,
        order: staticForModule.length + idx + 1,
        title: o.title || o.lessonId,
        moduleId: o.moduleId || selectedModuleId,
        duration: o.duration || '45 min',
        level: o.level || 'Foundational',
        description: o.summary || '',
      }));
    return [...staticForModule, ...customForModule];
  }, [selectedModuleId, lessonOverrides]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060A16',
      color: '#E6EDF6',
      fontFamily: 'Inter, Segoe UI, system-ui, sans-serif',
      paddingBottom: '5rem',
    }}>
      
      {/* ─── TOP MASTER SUPER-ADMIN BAR ────────────────────────────────────────── */}
      <header style={{
        background: 'rgba(8,16,30,0.95)',
        borderBottom: '1px solid rgba(206,174,86,0.3)',
        padding: '0.875rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, #1E293B, #0F172A)',
              border: '1px solid #CEAE56',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#CEAE56',
              fontWeight: 700,
              fontFamily: 'Georgia, serif',
              fontSize: '1.1rem',
            }}>
              F
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                FinGenIQ Super-Admin Governance Suite
                <span style={{ fontSize: '0.65rem', background: 'rgba(206,174,86,0.15)', color: '#CEAE56', border: '1px solid rgba(206,174,86,0.3)', padding: '1px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                  INSTITUTIONAL ROOT
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#8898AA' }}>
                Curriculum Studio · Learner Gradebook · Multi-Tenant Control
              </div>
            </div>
          </Link>
        </div>

        {/* Global Superuser Navigation Shortcut Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href="/dashboard"
            target="_blank"
            style={{ fontSize: '0.75rem', color: '#8898AA', textDecoration: 'none', padding: '6px 12px', borderRadius: '0.375rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            🎓 Student Portal ↗
          </Link>
          <Link
            href="/community"
            target="_blank"
            style={{ fontSize: '0.75rem', color: '#8898AA', textDecoration: 'none', padding: '6px 12px', borderRadius: '0.375rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            💬 Research Feed ↗
          </Link>
          <button
            onClick={async () => {
              try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
              try { await logoutAction(); } catch {}
              window.location.href = '/';
            }}
            style={{
              fontSize: '0.75rem',
              color: '#F87171',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              padding: '6px 14px',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ─── MASTER KPI OVERVIEW STRIP ────────────────────────────────────────── */}
      <div style={{ maxWidth: 1380, margin: '1.5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
          {[
            { label: 'Total Enrolled', count: stats.total, color: '#F1F5F9' },
            { label: 'Active Learners', count: stats.active, color: '#34D399' },
            { label: 'Cohort Avg Score', count: `${stats.cohortAvgScore}%`, color: '#60A5FA' },
            { label: 'Certified (Track)', count: stats.certifiedCount, color: '#CEAE56' },
            { label: 'Distinction (≥85%)', count: stats.distinctionCount, color: '#A78BFA' },
            { label: 'Expiring in 14d', count: stats.expiring, color: '#FBBF24' },
            { label: 'Locked / Action Req', count: stats.locked, color: '#F87171' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '0.85rem 1.1rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#8898AA', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color, marginTop: '0.2rem' }}>{s.count}</div>
            </div>
          ))}
        </div>

        {/* ─── PRIMARY TAB NAVIGATION ────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginTop: '1.75rem', paddingBottom: '0.5rem', overflowX: 'auto' }}>
          {[
            { id: 'analytics', label: '📊 Learner Analytics & Gradebook' },
            { id: 'users', label: '👥 User & Credential Management' },
            { id: 'lessons', label: '🎓 Curriculum & Simulator Studio' },
            { id: 'governance', label: '🏛️ Academic Governance' },
            { id: 'chatbot_qa', label: `💬 Chatbot Q&A (${chatbotQAs.length || 30} Answers)` },
            { id: 'community', label: '🌐 Community Moderation' },
            { id: 'entities', label: '🏢 Enterprise & Packages' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? 'rgba(206,174,86,0.15)' : 'transparent',
                color: activeTab === tab.id ? '#CEAE56' : '#8898AA',
                border: activeTab === tab.id ? '1px solid rgba(206,174,86,0.3)' : '1px solid transparent',
                borderRadius: '0.5rem',
                padding: '0.6rem 1.1rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ─── TAB 1: LEARNER ANALYTICS & COHORT GRADEBOOK ───────────────────── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Cohort Grade Distribution Strip */}
            <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                    Cohort Performance & Grade Tier Distribution
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#8898AA', margin: '0.2rem 0 0' }}>
                    Institutional grading scale: Distinction (≥85%), Merit (70–84%), Pass (50–69%), Needs Support (&lt;50%).
                  </p>
                </div>
                <button
                  onClick={handleExportUsersCsv}
                  style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '0.375rem', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  📥 Export Gradebook (CSV)
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#070E1A', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#A78BFA', fontWeight: 700 }}>DISTINCTION TIER (≥85%)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F1F5F9', marginTop: '0.25rem' }}>{stats.distinctionCount} <span style={{ fontSize: '0.8rem', color: '#8898AA' }}>students</span></div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.25rem' }}>Eligible for Honors Certification</div>
                </div>
                <div style={{ background: '#070E1A', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#60A5FA', fontWeight: 700 }}>MERIT TIER (70–84%)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F1F5F9', marginTop: '0.25rem' }}>{stats.meritCount} <span style={{ fontSize: '0.8rem', color: '#8898AA' }}>students</span></div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.25rem' }}>On track for Standard Track Certification</div>
                </div>
                <div style={{ background: '#070E1A', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 700 }}>PASSING TIER (50–69%)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F1F5F9', marginTop: '0.25rem' }}>{stats.passCount} <span style={{ fontSize: '0.8rem', color: '#8898AA' }}>students</span></div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.25rem' }}>Foundational mastery achieved</div>
                </div>
                <div style={{ background: '#070E1A', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#F87171', fontWeight: 700 }}>NEEDS SUPPORT (&lt;50%)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F1F5F9', marginTop: '0.25rem' }}>{stats.needsSupportCount} <span style={{ fontSize: '0.8rem', color: '#8898AA' }}>students</span></div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.25rem' }}>Recommended for Faculty tutoring</div>
                </div>
              </div>
            </div>

            {/* Module Completion Heatmap Matrix */}
            <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '1rem' }}>
                Curriculum Progression Matrix by Module (M1 – M8)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {MODULES.map(m => {
                  const mStat = moduleStats[m.id] || { completedCount: 0, totalScore: 0, gradedCount: 0 };
                  const avgMScore = mStat.gradedCount > 0 ? Math.round(mStat.totalScore / mStat.gradedCount) : 0;
                  return (
                    <div key={m.id} style={{ background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.5rem', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#CEAE56' }}>{m.id}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.title}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.65rem', color: '#8898AA' }}>Passed:</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399' }}>{mStat.completedCount}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.65rem', color: '#8898AA' }}>Avg Quiz:</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60A5FA' }}>{avgMScore}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ─── TAB 2: USER & CREDENTIAL MANAGEMENT ───────────────────────────── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Action Bar: Bulk CSV Import, Export CSV & Filter Controls */}
            <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="🔍 Search name, email, or user ID..."
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  style={{ background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '6px 12px', color: '#F1F5F9', fontSize: '0.82rem', minWidth: 260 }}
                />
                
                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value)}
                  style={{ background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '6px 10px', color: '#F1F5F9', fontSize: '0.82rem' }}
                >
                  <option value="all">All Roles</option>
                  <option value="learner">Student / Learner</option>
                  <option value="teacher">Academic Teacher / Faculty</option>
                  <option value="employee">Enterprise Employee / Staff</option>
                  <option value="employer">Employer / Recruiter</option>
                  <option value="admin">System Administrator</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={e => setUserStatusFilter(e.target.value)}
                  style={{ background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '6px 10px', color: '#F1F5F9', fontSize: '0.82rem' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending_activation">Pending Activation</option>
                  <option value="expiring">Expiring Soon (≤14 days)</option>
                  <option value="expired">Expired</option>
                  <option value="locked">Locked</option>
                  <option value="disabled">Disabled</option>
                </select>

                <select
                  value={userEntityFilter}
                  onChange={e => setUserEntityFilter(e.target.value)}
                  style={{ background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '6px 10px', color: '#F1F5F9', fontSize: '0.82rem' }}
                >
                  <option value="all">All Partner Entities</option>
                  {entitiesList.map(ent => (
                    <option key={ent.id} value={ent.id}>{ent.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {selectedUserIds.length > 0 && (
                  <button
                    onClick={handleBatchRenew}
                    disabled={isPending}
                    style={{ background: 'rgba(206,174,86,0.15)', color: '#CEAE56', border: '1px solid rgba(206,174,86,0.3)', borderRadius: '0.375rem', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ⏱️ Renew Selected ({selectedUserIds.length})
                  </button>
                )}
                <button
                  onClick={() => setShowBulkCsvModal(true)}
                  style={{ background: 'rgba(206,174,86,0.12)', color: '#CEAE56', border: '1px solid rgba(206,174,86,0.3)', borderRadius: '0.375rem', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  📁 Bulk CSV Upload
                </button>
                <button
                  onClick={handleExportUsersCsv}
                  style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '0.375rem', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  📤 Export CSV
                </button>
              </div>
            </div>

            {/* Official System Default Credentials Overview */}
            <div style={{ background: '#0B1528', border: '1px solid rgba(206,174,86,0.25)', borderRadius: '1rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#CEAE56', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🔑 Official System Role Credentials
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#8898AA' }}>
                  Standard accounts for testing and role governance
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: '#070E1A', border: '1px solid rgba(180,83,9,0.35)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 700 }}>🛡️ ROOT ADMINISTRATOR</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F1F5F9', marginTop: '0.2rem' }}>admin@fingeniq.com</div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.15rem' }}>Password: <code style={{ color: '#CEAE56' }}>Admin@123456</code></div>
                </div>

                <div style={{ background: '#070E1A', border: '1px solid rgba(37,99,235,0.35)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#60A5FA', fontWeight: 700 }}>💼 INSTITUTIONAL STAFF / EMPLOYEE</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F1F5F9', marginTop: '0.2rem' }}>employee@fingeniq.com</div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.15rem' }}>Password: <code style={{ color: '#60A5FA' }}>Employee@123456</code></div>
                </div>

                <div style={{ background: '#070E1A', border: '1px solid rgba(124,58,237,0.35)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#A78BFA', fontWeight: 700 }}>🎓 ACADEMIC FACULTY / TEACHER</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F1F5F9', marginTop: '0.2rem' }}>teacher@fingeniq.com</div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.15rem' }}>Password: <code style={{ color: '#A78BFA' }}>Teacher@123456</code></div>
                </div>

                <div style={{ background: '#070E1A', border: '1px solid rgba(22,163,74,0.35)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#4ADE80', fontWeight: 700 }}>📖 STANDARD LEARNER</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F1F5F9', marginTop: '0.2rem' }}>learner@fingeniq.com</div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.15rem' }}>Password: <code style={{ color: '#4ADE80' }}>Learner@123456</code></div>
                </div>
              </div>
            </div>

            {/* Individual Credential Provisioning Form */}
            <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#CEAE56', marginBottom: '1rem' }}>
                + Provision Individual User Credential
              </h3>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const res = await createCredentialAction(sessionToken, formData);
                if (res.success) {
                  alert('Credential created successfully! ' + (res.activationLink ? `Activation Link: ${res.activationLink}` : `Temp Password: ${res.tempPassword}`));
                  fetchDashboardData();
                } else {
                  alert('Error: ' + res.error);
                }
              }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>Full Name</label>
                  <input name="name" required placeholder="Jane Doe" style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.82rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>Email Address</label>
                  <input name="email" type="email" required placeholder="jane@example.com" style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.82rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>Role</label>
                  <select name="role" style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.82rem' }}>
                    <option value="learner">Student / Learner</option>
                    <option value="teacher">Academic Teacher / Faculty</option>
                    <option value="employee">Enterprise Employee / Staff</option>
                    <option value="employer">Employer / Recruiter</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>Validity Period</label>
                  <select name="validityPeriod" style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.82rem' }}>
                    <option value="annual">Annual (365 days)</option>
                    <option value="half_yearly">Half-Yearly (180 days)</option>
                    <option value="quarterly">Quarterly (90 days)</option>
                    <option value="monthly">Monthly (30 days)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>Delivery Method</label>
                  <select name="deliveryMethod" style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.82rem' }}>
                    <option value="link">One-Time Activation Link</option>
                    <option value="password">Generate Temporary Password</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>Category & Package</label>
                  <select name="loginCategory" onChange={e => setSelectedLoginCategory(e.target.value)} style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.82rem' }}>
                    <option value="b2c">B2C Individual</option>
                    <option value="b2b">B2B Corporate</option>
                    <option value="b2b2c">B2B2C University Partner</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#CEAE56', marginBottom: '0.35rem' }}>User ID (Optional)</label>
                  <input name="customUserId" placeholder="e.g. EMP_001 (auto if empty)" style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.82rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#CEAE56', marginBottom: '0.35rem' }}>Direct Password (Optional)</label>
                  <input name="customPassword" type="password" placeholder="Set password (auto if empty)" style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.82rem' }} />
                </div>
                <input type="hidden" name="packageId" value={packagesList[0]?.id || 'PKG_B2C_PRO'} />
                
                <button type="submit" style={{ background: 'linear-gradient(135deg, #CEAE56 0%, #B8962E 100%)', color: '#060A16', border: 'none', borderRadius: '0.375rem', padding: '0.65rem 1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                  + Issue Credential
                </button>
              </form>
            </div>

            {/* Users Roster Table */}
            <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F1F5F9' }}>
                  Platform Users Directory ({filteredUsers.length} Results)
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#070E1A', color: '#8898AA', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '0.75rem 1rem', width: 40 }}>
                        <input
                          type="checkbox"
                          checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={e => {
                            if (e.target.checked) setSelectedUserIds(filteredUsers.map(u => u.id));
                            else setSelectedUserIds([]);
                          }}
                        />
                      </th>
                      <th style={{ padding: '0.75rem 1rem' }}>User / Identity</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Validity Expiry</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Progress</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Lifecycle Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => {
                      const isExpiring = u.credentialExpiresAt && (new Date(u.credentialExpiresAt).getTime() - Date.now()) <= 14 * 86400000 && (new Date(u.credentialExpiresAt).getTime() - Date.now()) > 0;
                      const isExpired = u.credentialExpiresAt && new Date(u.credentialExpiresAt).getTime() <= Date.now();
                      
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(u.id)}
                              onChange={e => {
                                if (e.target.checked) setSelectedUserIds(prev => [...prev, u.id]);
                                else setSelectedUserIds(prev => prev.filter(x => x !== u.id));
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: '#F1F5F9' }}>{u.name}</div>
                            <div style={{ color: '#8898AA', fontSize: '0.75rem' }}>{u.email}</div>
                            <div style={{ color: '#64748B', fontSize: '0.65rem' }}>{u.id} · {u.loginCategory?.toUpperCase()}</div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: '#CBD5E1' }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{
                              background: u.accountStatus === 'active' ? 'rgba(52,211,153,0.15)' : u.accountStatus === 'locked' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)',
                              color: u.accountStatus === 'active' ? '#34D399' : u.accountStatus === 'locked' ? '#F87171' : '#FBBF24',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                            }}>
                              {u.accountStatus}
                            </span>
                            {isExpiring && (
                              <span style={{ marginLeft: 6, fontSize: '0.65rem', background: 'rgba(251,191,36,0.2)', color: '#FBBF24', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                                ⚠️ 14d EXPIRING
                              </span>
                            )}
                            {isExpired && (
                              <span style={{ marginLeft: 6, fontSize: '0.65rem', background: 'rgba(239,68,68,0.2)', color: '#F87171', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                                EXPIRED
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#8898AA' }}>
                            {u.credentialExpiresAt ? new Date(u.credentialExpiresAt).toLocaleDateString() : (u.validityPeriod || 'Permanent')}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ color: '#CBD5E1', fontWeight: 600 }}>{u.completedLessonsCount || 0}/32</span>
                            {u.avgScore !== null && <span style={{ color: '#60A5FA', marginLeft: 6 }}>({u.avgScore}%)</span>}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button
                                onClick={() => handleToggleUser(u.id)}
                                style={{ background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '3px 7px', cursor: 'pointer', fontSize: '0.7rem' }}
                              >
                                {u.accountStatus === 'active' ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                onClick={() => handleForceReset(u.id)}
                                style={{ background: 'rgba(206,174,86,0.1)', color: '#CEAE56', border: '1px solid rgba(206,174,86,0.25)', borderRadius: '4px', padding: '3px 7px', cursor: 'pointer', fontSize: '0.7rem' }}
                              >
                                Reset
                              </button>
                              <button
                                onClick={() => { setRenewUserId(u.id); }}
                                style={{ background: 'rgba(96,165,250,0.1)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.25)', borderRadius: '4px', padding: '3px 7px', cursor: 'pointer', fontSize: '0.7rem' }}
                              >
                                Renew
                              </button>
                              <button
                                onClick={() => setEditingUser({id: u.id, userId: u.id, name: u.name, email: u.email, role: u.role, loginCategory: u.loginCategory, packageId: u.packageId, businessEntityId: u.businessEntityId})}
                                style={{ background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '3px 7px', cursor: 'pointer', fontSize: '0.7rem' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => { setPasswordUser(u); setNewPassword(''); setConfirmPassword(''); }}
                                style={{ background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '3px 7px', cursor: 'pointer', fontSize: '0.7rem' }}
                              >
                                Password
                              </button>
                              <button
                                onClick={() => setDeletingUser(u)}
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '4px', padding: '3px 7px', cursor: 'pointer', fontSize: '0.7rem' }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Renew Dialog Modal */}
            {renewUserId && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                <div style={{ background: '#0B1528', border: '1px solid #CEAE56', borderRadius: '1rem', padding: '1.5rem', width: 380 }}>
                  <h3 style={{ color: '#CEAE56', fontSize: '1rem', margin: '0 0 1rem' }}>⏱️ Extend Credential Expiry</h3>
                  <p style={{ fontSize: '0.8rem', color: '#8898AA', marginBottom: '1rem' }}>
                    Select new subscription period for user ID: <code>{renewUserId}</code>
                  </p>
                  <select
                    value={renewPeriod}
                    onChange={e => setRenewPeriod(e.target.value as any)}
                    style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.6rem', color: '#F1F5F9', marginBottom: '1.25rem' }}
                  >
                    <option value="monthly">Monthly (+30 days)</option>
                    <option value="quarterly">Quarterly (+90 days)</option>
                    <option value="half_yearly">Half-Yearly (+180 days)</option>
                    <option value="annual">Annual (+365 days)</option>
                  </select>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button onClick={() => setRenewUserId(null)} style={{ background: 'transparent', border: '1px solid #334155', color: '#94A3B8', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => handleRenew(renewUserId)} style={{ background: '#CEAE56', color: '#060A16', border: 'none', padding: '6px 14px', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}>Confirm Renewal</button>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk CSV Modal */}
            {showBulkCsvModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1.5rem' }}>
                <div style={{ background: '#0B1528', border: '1px solid #CEAE56', borderRadius: '1rem', padding: '1.75rem', maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ color: '#CEAE56', fontSize: '1.1rem', margin: 0 }}>📥 Bulk CSV User Provisioning Tool</h3>
                    <button onClick={() => { setShowBulkCsvModal(false); setBulkImportResult(null); }} style={{ background: 'transparent', border: 'none', color: '#8898AA', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem' }}>
                    Paste CSV records below or type user rows. Expected columns: <code>name, email, role, validityPeriod, deliveryMethod, loginCategory, entityId</code>
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <button
                      onClick={() => handleParseCsv(`John Doe,john@company.com,learner,annual,link,b2c\nAlice Smith,alice@corp.com,employee,annual,password,b2b,ENT_DEMO_B2B\nBob Student,bob@univ.edu,learner,quarterly,link,b2b2c,ENT_DEMO_B2B2C`)}
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', border: '1px solid #334155', borderRadius: 4, padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer' }}
                    >
                      📋 Load Sample 3-User Template
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    placeholder="Jane Doe, jane@example.com, learner, annual, link, b2c"
                    value={rawCsvText}
                    onChange={e => handleParseCsv(e.target.value)}
                    style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.5rem', padding: '0.75rem', color: '#F1F5F9', fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '1rem' }}
                  />

                  {parsedCsvRows.length > 0 && (
                    <div style={{ marginBottom: '1rem', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.5rem', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399', marginBottom: '0.5rem' }}>
                        ✓ {parsedCsvRows.length} Valid Records Parsed for Batch Provisioning:
                      </div>
                      <div style={{ maxHeight: 150, overflowY: 'auto', fontSize: '0.72rem', color: '#CBD5E1' }}>
                        {parsedCsvRows.map((r, idx) => (
                          <div key={idx} style={{ padding: '2px 0' }}>
                            {idx + 1}. <strong>{r.name}</strong> ({r.email}) · Role: {r.role} · Mode: {r.deliveryMethod}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {bulkImportResult && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', background: bulkImportResult.success ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', color: bulkImportResult.success ? '#34D399' : '#F87171', fontSize: '0.8rem' }}>
                      <strong>Batch Import Summary:</strong> {bulkImportResult.summary ? `Created: ${bulkImportResult.summary.created}, Skipped: ${bulkImportResult.summary.skipped}, Errors: ${bulkImportResult.summary.errors}` : bulkImportResult.error}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button onClick={() => { setShowBulkCsvModal(false); setBulkImportResult(null); }} style={{ background: 'transparent', border: '1px solid #334155', color: '#94A3B8', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>Close</button>
                    <button
                      onClick={handleExecuteBulkImport}
                      disabled={parsedCsvRows.length === 0 || isPending}
                      style={{ background: 'linear-gradient(135deg, #CEAE56 0%, #B8962E 100%)', color: '#060A16', border: 'none', padding: '6px 16px', borderRadius: 4, fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer' }}
                    >
                      {isPending ? 'Processing Batch...' : `Execute Bulk Import (${parsedCsvRows.length} Users)`}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ─── TAB 3: CURRICULUM & FINANCIAL SIMULATOR STUDIO ────────────────── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'lessons' && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
              
              {/* Left Column: Lesson Selector */}
              <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', textTransform: 'uppercase' }}>
                    Select Module & Lesson
                  </div>
                  <button
                    onClick={() => {
                      setNewLessonData({
                        lessonId: `L${filteredLessons.length + 1}`,
                        moduleId: selectedModuleId,
                        title: '',
                        duration: '45 min',
                        level: 'Foundational',
                        summary: '',
                      });
                      setShowAddLessonModal(true);
                    }}
                    style={{ background: '#CEAE56', color: '#060A16', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add Lesson
                  </button>
                </div>
                
                <select
                  value={selectedModuleId}
                  onChange={e => {
                    setSelectedModuleId(e.target.value);
                    const firstLesson = LESSONS.find(l => l.moduleId === e.target.value);
                    if (firstLesson) setSelectedLessonId(firstLesson.id);
                  }}
                  style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.5rem', padding: '0.6rem', color: '#F1F5F9', fontSize: '0.85rem', marginBottom: '1rem' }}
                >
                  {MODULES.map(m => (
                    <option key={m.id} value={m.id}>{m.order || m.id}. {m.title}</option>
                  ))}
                </select>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: 540, overflowY: 'auto' }}>
                  {filteredLessons.map((l, idx) => {
                    const isSelected = l.id === selectedLessonId;
                    const hasOverride = lessonOverrides.some(o => o.lessonId === l.id);
                    return (
                      <button
                        key={l.id}
                        onClick={() => setSelectedLessonId(l.id)}
                        style={{
                          textAlign: 'left',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '0.5rem',
                          background: isSelected ? 'rgba(206,174,86,0.15)' : '#070E1A',
                          border: isSelected ? '1px solid rgba(206,174,86,0.4)' : '1px solid rgba(255,255,255,0.04)',
                          color: isSelected ? '#CEAE56' : '#CBD5E1',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {idx + 1}. {l.title}
                        </span>
                        {hasOverride && (
                          <span style={{ fontSize: '0.6rem', background: '#34D399', color: '#060A16', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, flexShrink: 0 }}>
                            EDITED
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Live Curriculum Canvas */}
              <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                      Lesson Studio: {selectedLessonId}
                    </h2>
                    <p style={{ fontSize: '0.75rem', color: '#8898AA', margin: '0.2rem 0 0' }}>
                      Configure lecture notes, financial simulator variables, reference media, and assessments.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link
                      href={`/lesson-player/${selectedLessonId}`}
                      target="_blank"
                      style={{ fontSize: '0.75rem', color: '#CEAE56', textDecoration: 'none', padding: '6px 12px', borderRadius: '0.375rem', background: 'rgba(206,174,86,0.1)', border: '1px solid rgba(206,174,86,0.3)' }}
                    >
                      Preview Player ↗
                    </Link>
                    <button
                      onClick={() => handleDeleteLesson(selectedLessonId)}
                      style={{ fontSize: '0.75rem', color: '#F87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 12px', borderRadius: '0.375rem', cursor: 'pointer' }}
                    >
                      🗑️ Delete / Reset Override
                    </button>
                    <button
                      onClick={handleSaveLesson}
                      disabled={isPending}
                      style={{
                        background: 'linear-gradient(135deg, #CEAE56 0%, #B8962E 100%)',
                        color: '#060A16',
                        border: 'none',
                        borderRadius: '0.375rem',
                        padding: '6px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: isPending ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isPending ? 'Publishing...' : '💾 Publish Changes'}
                    </button>
                  </div>
                </div>

                {lessonSaveStatus && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: lessonSaveStatus.includes('✓') ? 'rgba(52,211,153,0.15)' : 'rgba(206,174,86,0.15)', color: lessonSaveStatus.includes('✓') ? '#34D399' : '#CEAE56', fontSize: '0.85rem', fontWeight: 600 }}>
                    {lessonSaveStatus}
                  </div>
                )}
                {uploadStatus && (
                  <div style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', background: uploadStatus.includes('✓') ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', color: uploadStatus.includes('✓') ? '#34D399' : '#F87171', fontSize: '0.82rem', fontWeight: 600 }}>
                    {uploadStatus}
                  </div>
                )}

                {/* Core Metadata */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>Lesson Title</label>
                    <input
                      type="text"
                      value={lessonTitle}
                      onChange={e => setLessonTitle(e.target.value)}
                      style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.6rem', color: '#F1F5F9', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>Duration</label>
                    <input
                      type="text"
                      value={lessonDuration}
                      onChange={e => setLessonDuration(e.target.value)}
                      style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.6rem', color: '#F1F5F9', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>Level</label>
                    <select
                      value={lessonLevel}
                      onChange={e => setLessonLevel(e.target.value)}
                      style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.6rem', color: '#F1F5F9', fontSize: '0.85rem' }}
                    >
                      <option value="Foundational">Foundational</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Subtitle & Media */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>▶ YouTube Embed ID (Optional)</label>
                    <input
                      type="text"
                      value={lessonYoutubeId}
                      onChange={e => setLessonYoutubeId(e.target.value)}
                      placeholder="e.g. dQw4w9WgXcQ"
                      style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.6rem', color: '#F1F5F9', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8898AA' }}>📄 Reference PDF Guide Path / URL</label>
                      <label style={{
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#60A5FA',
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '0.25rem',
                        padding: '2px 8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isUploadingPdf ? '⏳ Uploading...' : '📤 Upload PDF'}
                        <input
                          type="file"
                          accept=".pdf"
                          style={{ display: 'none' }}
                          disabled={isUploadingPdf}
                          onChange={handlePdfUpload}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={lessonPdfPath}
                      onChange={e => setLessonPdfPath(e.target.value)}
                      placeholder="/lessons/L1.pdf"
                      style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.6rem', color: '#F1F5F9', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* ─── LESSON SLIDE GALLERY CONFIGURATOR ─────────────────── */}
                <div style={{ background: '#070E1A', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1rem' }}>🖼️</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#60A5FA' }}>
                        Lesson Slide Gallery & Carousel ({lessonGalleryImages.length} Slides)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <label style={{
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#34D399',
                        background: 'rgba(52, 211, 153, 0.15)',
                        border: '1px solid rgba(52, 211, 153, 0.4)',
                        borderRadius: '0.375rem',
                        padding: '0.35rem 0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isUploadingSlides ? '⏳ Uploading...' : '📤 Upload SVG / Slides'}
                        <input
                          type="file"
                          accept=".svg,.png,.jpg,.jpeg,.webp"
                          multiple
                          style={{ display: 'none' }}
                          disabled={isUploadingSlides}
                          onChange={handleSlidesUpload}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLessonGalleryImages(
                            Array.from({ length: 20 }, (_, i) => `/lessons/${selectedLessonId}/slide-${i + 1}.svg`)
                          );
                        }}
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                          borderRadius: '0.375rem',
                          padding: '0.35rem 0.75rem',
                          color: '#93C5FD',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        ✨ Load Default SVG Samples
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '1rem', lineHeight: '1.4' }}>
                    These slides appear at the top of the lesson player in a swipeable carousel with left/right page navigation. You can use SVG samples or upload your custom images into <code style={{ color: '#FCD34D' }}>public/lessons/{selectedLessonId}/</code>.
                  </p>

                  {/* Slide List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                    {lessonGalleryImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          background: '#0B1528',
                          border: '1px solid #1E293B',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 0.75rem',
                        }}
                      >
                        {/* Thumbnail Preview */}
                        <div
                          style={{
                            width: '56px',
                            height: '34px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            background: '#1E293B',
                            flexShrink: 0,
                            border: '1px solid #334155',
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt={`Slide ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>

                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#93C5FD',
                            minWidth: '55px',
                          }}
                        >
                          Slide {idx + 1}:
                        </span>

                        <input
                          type="text"
                          value={imgUrl}
                          onChange={e => {
                            const updated = [...lessonGalleryImages];
                            updated[idx] = e.target.value;
                            setLessonGalleryImages(updated);
                          }}
                          placeholder="/lessons/L1/slide-1.svg"
                          style={{
                            flex: 1,
                            background: '#070E1A',
                            border: '1px solid #334155',
                            borderRadius: '0.375rem',
                            padding: '0.4rem 0.6rem',
                            color: '#F1F5F9',
                            fontSize: '0.8rem',
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setLessonGalleryImages(lessonGalleryImages.filter((_, i) => i !== idx));
                          }}
                          title="Remove slide"
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.375rem',
                            padding: '0.35rem 0.6rem',
                            color: '#F87171',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Slide Form */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={newGalleryImageInput}
                      onChange={e => setNewGalleryImageInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newGalleryImageInput.trim()) {
                            setLessonGalleryImages([...lessonGalleryImages, newGalleryImageInput.trim()]);
                            setNewGalleryImageInput('');
                          }
                        }
                      }}
                      placeholder={`e.g. /lessons/${selectedLessonId}/slide-${lessonGalleryImages.length + 1}.png or https://...`}
                      style={{
                        flex: 1,
                        background: '#0B1528',
                        border: '1px solid #334155',
                        borderRadius: '0.375rem',
                        padding: '0.45rem 0.6rem',
                        color: '#F1F5F9',
                        fontSize: '0.8rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newGalleryImageInput.trim()) {
                          setLessonGalleryImages([...lessonGalleryImages, newGalleryImageInput.trim()]);
                          setNewGalleryImageInput('');
                        }
                      }}
                      style={{
                        background: '#2563EB',
                        border: 'none',
                        borderRadius: '0.375rem',
                        padding: '0.45rem 0.9rem',
                        color: '#FFFFFF',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ➕ Add Slide URL
                    </button>
                  </div>
                </div>

                {/* ─── LESSON SECTIONS & STEPS MANAGER (19 Steps + Add Section) ─────────────────── */}
                <div style={{ background: '#070E1A', border: '1px solid rgba(206,174,86,0.35)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>📑</span>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#CEAE56' }}>
                          Lesson Sections & Steps Manager ({lessonSteps.length} Sections)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#8898AA' }}>
                          Update & correct section names, edit lecture content, reorder, or add additional sections.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      style={{
                        background: 'rgba(206,174,86,0.15)',
                        border: '1px solid rgba(206,174,86,0.4)',
                        borderRadius: '0.375rem',
                        padding: '0.4rem 0.9rem',
                        color: '#CEAE56',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      ➕ Add Additional Section
                    </button>
                  </div>

                  {/* Sections List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
                    {lessonSteps.map((step, idx) => {
                      const isExpanded = expandedSectionIndex === idx;
                      return (
                        <div
                          key={idx}
                          style={{
                            background: '#0B1528',
                            border: isExpanded ? '1px solid rgba(206,174,86,0.5)' : '1px solid #1E293B',
                            borderRadius: '0.5rem',
                            padding: '0.75rem',
                            transition: 'border-color 0.2s',
                          }}
                        >
                          {/* Section Header Row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{
                              background: '#1E293B',
                              color: '#93C5FD',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              minWidth: '38px',
                              textAlign: 'center'
                            }}>
                              S{String(idx + 1).padStart(2, '0')}
                            </span>

                            {/* Section Name Input */}
                            <input
                              type="text"
                              value={step.name}
                              onChange={e => handleUpdateSection(idx, 'name', e.target.value)}
                              placeholder="Section Name / Title"
                              style={{
                                flex: 2,
                                background: '#070E1A',
                                border: '1px solid #334155',
                                borderRadius: '0.375rem',
                                padding: '0.4rem 0.6rem',
                                color: '#F1F5F9',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                              }}
                            />

                            {/* Section Type Select */}
                            <select
                              value={step.type}
                              onChange={e => handleUpdateSection(idx, 'type', e.target.value)}
                              style={{
                                flex: 1,
                                maxWidth: '140px',
                                background: '#070E1A',
                                border: '1px solid #334155',
                                borderRadius: '0.375rem',
                                padding: '0.4rem 0.5rem',
                                color: '#94A3B8',
                                fontSize: '0.75rem',
                              }}
                            >
                              <option value="overview">Overview</option>
                              <option value="intro">Intro</option>
                              <option value="objectives">Objectives</option>
                              <option value="concepts">Core Concepts</option>
                              <option value="terminology">Terminology</option>
                              <option value="visual">Visual Model</option>
                              <option value="examples">Examples</option>
                              <option value="casestudy">Case Study</option>
                              <option value="didyouknow">Did You Know</option>
                              <option value="ai-tutor">AI Tutor</option>
                              <option value="kc">Knowledge Check</option>
                              <option value="practice">Practice</option>
                              <option value="summary">Summary</option>
                              <option value="takeaways">Takeaways</option>
                              <option value="flashcards">Flashcards</option>
                              <option value="quiz">Quiz</option>
                              <option value="assignment">Assignment</option>
                              <option value="revision">Revision</option>
                              <option value="next">Next</option>
                              <option value="custom">Custom</option>
                            </select>

                            {/* Move Up */}
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSection(idx, 'up')}
                              title="Move Up"
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid #334155',
                                borderRadius: '0.375rem',
                                padding: '4px 8px',
                                color: idx === 0 ? '#475569' : '#CBD5E1',
                                fontSize: '0.75rem',
                                cursor: idx === 0 ? 'not-allowed' : 'pointer',
                              }}
                            >
                              ⬆️
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              disabled={idx === lessonSteps.length - 1}
                              onClick={() => handleMoveSection(idx, 'down')}
                              title="Move Down"
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid #334155',
                                borderRadius: '0.375rem',
                                padding: '4px 8px',
                                color: idx === lessonSteps.length - 1 ? '#475569' : '#CBD5E1',
                                fontSize: '0.75rem',
                                cursor: idx === lessonSteps.length - 1 ? 'not-allowed' : 'pointer',
                              }}
                            >
                              ⬇️
                            </button>

                            {/* Toggle Content Expand */}
                            <button
                              type="button"
                              onClick={() => setExpandedSectionIndex(isExpanded ? null : idx)}
                              style={{
                                background: isExpanded ? 'rgba(206,174,86,0.15)' : 'rgba(255,255,255,0.05)',
                                border: '1px solid #334155',
                                borderRadius: '0.375rem',
                                padding: '4px 8px',
                                color: isExpanded ? '#CEAE56' : '#CBD5E1',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              {isExpanded ? '▲ Hide' : '▼ Edit Content'}
                            </button>

                            {/* Delete Section */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(idx)}
                              title="Delete Section"
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '0.375rem',
                                padding: '4px 8px',
                                color: '#F87171',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              🗑️
                            </button>
                          </div>

                          {/* Section Description / Lecture Textarea */}
                          {isExpanded && (
                            <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.6rem' }}>
                              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>
                                Section Lecture Content / Study Text (Displayed to students in lesson player for this step):
                              </label>
                              <textarea
                                rows={5}
                                value={step.description}
                                onChange={e => handleUpdateSection(idx, 'description', e.target.value)}
                                placeholder="Enter lecture content, study notes, case studies, or instructions for this section..."
                                style={{
                                  width: '100%',
                                  background: '#070E1A',
                                  border: '1px solid #334155',
                                  borderRadius: '0.375rem',
                                  padding: '0.6rem',
                                  color: '#F1F5F9',
                                  fontSize: '0.8rem',
                                  lineHeight: 1.5,
                                  fontFamily: 'monospace',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Add Section Button */}
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      style={{
                        background: '#1E293B',
                        border: '1px solid #334155',
                        borderRadius: '0.375rem',
                        padding: '0.45rem 1rem',
                        color: '#F1F5F9',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ➕ Add Additional Section
                    </button>
                  </div>
                </div>

                {/* ─── VISUAL FINANCIAL SIMULATOR CONFIGURATOR ─────────────────── */}
                <div style={{ background: '#070E1A', border: '1px solid rgba(206,174,86,0.3)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#CEAE56' }}>
                      🧮 Financial Valuation Simulator Configurator
                    </div>
                    <select
                      value={simPreset}
                      onChange={e => setSimPreset(e.target.value as any)}
                      style={{ background: '#0B1528', border: '1px solid #334155', borderRadius: 4, padding: '4px 8px', color: '#F1F5F9', fontSize: '0.75rem' }}
                    >
                      <option value="dcf">Preset: Discounted Cash Flow (DCF)</option>
                      <option value="lbo">Preset: Leveraged Buyout (LBO / PE)</option>
                      <option value="multiples">Preset: Trading Multiples (Comps)</option>
                      <option value="custom">Custom JSON Schema</option>
                    </select>
                  </div>

                  {simPreset !== 'custom' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#8898AA' }}>WACC (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={simWacc}
                          onChange={e => setSimWacc(parseFloat(e.target.value) || 0)}
                          style={{ width: '100%', background: '#0B1528', border: '1px solid #334155', borderRadius: 4, padding: '0.4rem', color: '#F1F5F9', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#8898AA' }}>Terminal Growth (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={simGrowth}
                          onChange={e => setSimGrowth(parseFloat(e.target.value) || 0)}
                          style={{ width: '100%', background: '#0B1528', border: '1px solid #334155', borderRadius: 4, padding: '0.4rem', color: '#F1F5F9', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#8898AA' }}>Exit Multiple (x)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={simExitMultiple}
                          onChange={e => setSimExitMultiple(parseFloat(e.target.value) || 0)}
                          style={{ width: '100%', background: '#0B1528', border: '1px solid #334155', borderRadius: 4, padding: '0.4rem', color: '#F1F5F9', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#8898AA' }}>Tax Rate (%)</label>
                        <input
                          type="number"
                          step="1"
                          value={simTaxRate}
                          onChange={e => setSimTaxRate(parseFloat(e.target.value) || 0)}
                          style={{ width: '100%', background: '#0B1528', border: '1px solid #334155', borderRadius: 4, padding: '0.4rem', color: '#F1F5F9', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#8898AA' }}>Debt Leverage (%)</label>
                        <input
                          type="number"
                          step="5"
                          value={simDebtRatio}
                          onChange={e => setSimDebtRatio(parseFloat(e.target.value) || 0)}
                          style={{ width: '100%', background: '#0B1528', border: '1px solid #334155', borderRadius: 4, padding: '0.4rem', color: '#F1F5F9', fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <textarea
                      rows={4}
                      value={customSimJson}
                      onChange={e => setCustomSimJson(e.target.value)}
                      style={{ width: '100%', background: '#0B1528', border: '1px solid #334155', borderRadius: 4, padding: '0.5rem', color: '#F1F5F9', fontSize: '0.75rem', fontFamily: 'monospace' }}
                    />
                  )}
                </div>

                {/* ─── SPLIT-SCREEN MARKDOWN LECTURE THEORY ────────────────────── */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8898AA' }}>
                      📖 Lecture Notes & Markdown Theory
                    </label>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => setEditorViewMode('split')}
                        style={{ background: editorViewMode === 'split' ? '#CEAE56' : 'rgba(255,255,255,0.05)', color: editorViewMode === 'split' ? '#060A16' : '#CBD5E1', border: 'none', padding: '3px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Split Screen
                      </button>
                      <button
                        onClick={() => setEditorViewMode('edit')}
                        style={{ background: editorViewMode === 'edit' ? '#CEAE56' : 'rgba(255,255,255,0.05)', color: editorViewMode === 'edit' ? '#060A16' : '#CBD5E1', border: 'none', padding: '3px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Editor Only
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: editorViewMode === 'split' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                    <textarea
                      rows={10}
                      value={lessonContentMarkdown}
                      onChange={e => setLessonContentMarkdown(e.target.value)}
                      style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.75rem', color: '#F1F5F9', fontSize: '0.82rem', fontFamily: 'monospace', lineHeight: 1.5 }}
                    />

                    {editorViewMode === 'split' && (
                      <div style={{ background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.75rem', maxHeight: 220, overflowY: 'auto', fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.6 }}>
                        <div style={{ fontSize: '0.7rem', color: '#8898AA', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>
                          Live Rendered Preview
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {lessonContentMarkdown.slice(0, 500)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── KEY TAKEAWAYS BUILDER ───────────────────────────────────── */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#CEAE56', marginBottom: '0.5rem' }}>
                    📌 Key Executive Takeaways ({keyTakeaways.length} points)
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      placeholder="Add key takeaway summary..."
                      value={newTakeawayInput}
                      onChange={e => setNewTakeawayInput(e.target.value)}
                      style={{ flex: 1, background: '#070E1A', border: '1px solid #1E293B', borderRadius: 4, padding: '0.4rem 0.6rem', color: '#F1F5F9', fontSize: '0.8rem' }}
                    />
                    <button
                      onClick={() => {
                        if (newTakeawayInput.trim()) {
                          setKeyTakeaways(prev => [...prev, newTakeawayInput.trim()]);
                          setNewTakeawayInput('');
                        }
                      }}
                      style={{ background: '#CEAE56', color: '#060A16', border: 'none', borderRadius: 4, padding: '0.4rem 12px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      + Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {keyTakeaways.map((t, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#070E1A', padding: '4px 10px', borderRadius: 4, fontSize: '0.75rem' }}>
                        <span>• {t}</span>
                        <button
                          onClick={() => setKeyTakeaways(prev => prev.filter((_, i) => i !== idx))}
                          style={{ background: 'transparent', border: 'none', color: '#F87171', cursor: 'pointer', fontSize: '0.7rem' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ─── ASSESSMENT & QUIZ BUILDER ──────────────────────────────── */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#CEAE56' }}>
                      📝 Assessment & Quiz Builder ({lessonQuiz.length} Questions)
                    </div>
                    <button
                      onClick={() => setLessonQuiz(prev => [...prev, { question: 'New Question ' + (prev.length + 1), options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'], correctAnswer: 0, explanation: '' }])}
                      style={{ background: 'rgba(206,174,86,0.15)', color: '#CEAE56', border: '1px solid rgba(206,174,86,0.3)', borderRadius: '0.375rem', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      + Add Question
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {lessonQuiz.map((q, qIdx) => (
                      <div key={qIdx} style={{ background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.75rem', padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8' }}>Question {qIdx + 1}</span>
                          <button
                            onClick={() => setLessonQuiz(prev => prev.filter((_, idx) => idx !== qIdx))}
                            style={{ background: 'transparent', border: 'none', color: '#F87171', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            ✕ Remove
                          </button>
                        </div>

                        <input
                          type="text"
                          value={q.question}
                          onChange={e => setLessonQuiz(prev => prev.map((item, idx) => idx === qIdx ? { ...item, question: e.target.value } : item))}
                          placeholder="Question text..."
                          style={{ width: '100%', background: '#0A1324', border: '1px solid #334155', borderRadius: '0.375rem', padding: '0.5rem', color: '#F1F5F9', fontSize: '0.85rem', marginBottom: '0.75rem' }}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          {q.options.map((opt: string, optIdx: number) => (
                            <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <input
                                type="radio"
                                name={`quiz-opt-${qIdx}`}
                                checked={q.correctAnswer === optIdx}
                                onChange={() => setLessonQuiz(prev => prev.map((item, idx) => idx === qIdx ? { ...item, correctAnswer: optIdx } : item))}
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={e => {
                                  const val = e.target.value;
                                  setLessonQuiz(prev => prev.map((item, idx) => {
                                    if (idx !== qIdx) return item;
                                    const nextOpts = [...item.options];
                                    nextOpts[optIdx] = val;
                                    return { ...item, options: nextOpts };
                                  }));
                                }}
                                style={{ flex: 1, background: '#0A1324', border: q.correctAnswer === optIdx ? '1px solid #34D399' : '1px solid #334155', borderRadius: 4, padding: '0.4rem', color: '#F1F5F9', fontSize: '0.8rem' }}
                              />
                            </div>
                          ))}
                        </div>

                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={e => setLessonQuiz(prev => prev.map((item, idx) => idx === qIdx ? { ...item, explanation: e.target.value } : item))}
                          placeholder="Rationale & explanation for the correct answer..."
                          style={{ width: '100%', background: '#0A1324', border: '1px solid #334155', borderRadius: 4, padding: '0.4rem 0.6rem', color: '#94A3B8', fontSize: '0.78rem' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ─── TAB: INSTITUTIONAL ACADEMIC GOVERNANCE ─────────────────────────── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'governance' && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Top Control Bar & Sub-Nav */}
            <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                      🏛️ Institutional Academic Governance Studio
                    </h3>
                    <span style={{ background: 'rgba(206,174,86,0.15)', color: '#CEAE56', border: '1px solid rgba(206,174,86,0.3)', borderRadius: '9999px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                      Accredited Standard
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#8898AA', margin: '0.35rem 0 0' }}>
                    Live administrative management for Proctored Module Assessments, Capstone Research Pathways, and Credential Certification Tiers.
                  </p>
                </div>

                {/* Sub-Navigation Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', background: '#070E1A', padding: '4px', borderRadius: '0.6rem', border: '1px solid #1E293B' }}>
                  {[
                    { id: 'assessments', label: `📝 Proctored Assessments (${assessmentQuestions.length})` },
                    { id: 'capstone', label: `🎓 Capstone Pathways (${capstoneTracks.length})` },
                    { id: 'certification', label: `🏅 Credential Tiers & Weights` },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setGovSubTab(sub.id as any)}
                      style={{
                        background: govSubTab === sub.id ? 'rgba(206,174,86,0.2)' : 'transparent',
                        color: govSubTab === sub.id ? '#CEAE56' : '#94A3B8',
                        border: govSubTab === sub.id ? '1px solid rgba(206,174,86,0.4)' : '1px solid transparent',
                        borderRadius: '0.4rem',
                        padding: '0.5rem 0.85rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {govSaveStatus && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: govSaveStatus.startsWith('✅') ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', border: govSaveStatus.startsWith('✅') ? '1px solid #34D399' : '1px solid #EF4444', color: govSaveStatus.startsWith('✅') ? '#34D399' : '#EF4444', fontSize: '0.85rem', fontWeight: 600 }}>
                  {govSaveStatus}
                </div>
              )}
            </div>

            {/* ─── SUB-TAB 1: PROCTORED ASSESSMENTS ──────────────────────── */}
            {govSubTab === 'assessments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Proctoring Policy Bar */}
                <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#CEAE56', margin: 0 }}>
                        🛡️ Exam Integrity &amp; Proctoring Rules
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#8898AA', margin: '2px 0 0' }}>
                        Parameters enforced during live student proctored assessments.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        startTransition(async () => {
                          const res = await saveAssessmentSettingsAction(sessionToken, assessmentSettings);
                          if (res.success) {
                            setGovSaveStatus('✅ Proctoring integrity settings updated successfully!');
                            fetchDashboardData();
                            setTimeout(() => setGovSaveStatus(null), 3500);
                          } else {
                            alert(res.error || 'Failed to save proctoring settings.');
                          }
                        });
                      }}
                      style={{ background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '0.375rem', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      💾 Save Proctoring Rules
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#8898AA', marginBottom: '4px' }}>EXAM DURATION (MINUTES)</label>
                      <input
                        type="number"
                        min={5}
                        max={180}
                        value={Math.round((assessmentSettings?.timeLimitSeconds || 1200) / 60)}
                        onChange={e => setAssessmentSettings({ ...assessmentSettings, timeLimitSeconds: (parseInt(e.target.value, 10) || 20) * 60 })}
                        style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#8898AA', marginBottom: '4px' }}>MAX TAB-SWITCH WARNINGS</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={assessmentSettings?.maxTabSwitches || 3}
                        onChange={e => setAssessmentSettings({ ...assessmentSettings, maxTabSwitches: parseInt(e.target.value, 10) || 3 })}
                        style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#8898AA', marginBottom: '4px' }}>PASSING SCORE CUT-OFF (%)</label>
                      <input
                        type="number"
                        min={40}
                        max={100}
                        value={assessmentSettings?.passingScorePct || 70}
                        onChange={e => setAssessmentSettings({ ...assessmentSettings, passingScorePct: parseInt(e.target.value, 10) || 70 })}
                        style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#8898AA', marginBottom: '4px' }}>WEBCAM ENFORCEMENT</label>
                      <select
                        value={assessmentSettings?.webcamRequired ? '1' : '0'}
                        onChange={e => setAssessmentSettings({ ...assessmentSettings, webcamRequired: e.target.value === '1' ? 1 : 0 })}
                        style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.85rem' }}
                      >
                        <option value="1">Active Proctor Webcam Required</option>
                        <option value="0">Optional / Tab Monitoring Only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Question Bank Manager */}
                <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                        Proctored Assessment Question Bank ({assessmentQuestions.length})
                      </h4>
                      <select
                        value={selectedAssessmentModule}
                        onChange={e => setSelectedAssessmentModule(e.target.value)}
                        style={{ background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '4px 10px', color: '#CEAE56', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        <option value="all">All Modules</option>
                        {['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'].map(m => (
                          <option key={m} value={m}>{m} Assessments</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => setShowAddQuestionModal(true)}
                      style={{ background: 'rgba(206,174,86,0.15)', color: '#CEAE56', border: '1px solid rgba(206,174,86,0.3)', borderRadius: '0.375rem', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Add Question
                    </button>
                  </div>

                  {/* Question Cards List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {assessmentQuestions
                      .filter(q => selectedAssessmentModule === 'all' || q.moduleId === selectedAssessmentModule)
                      .map((q, qIndex) => {
                        let parsedOptions: string[] = [];
                        try {
                          parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                        } catch {
                          parsedOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
                        }

                        return (
                          <div key={q.id} style={{ background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.75rem', padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                                  {q.moduleId}
                                </span>
                                <span style={{ background: 'rgba(206,174,86,0.15)', color: '#CEAE56', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize' }}>
                                  {q.difficulty || 'intermediate'}
                                </span>
                                <span style={{ color: '#8898AA', fontSize: '0.75rem' }}>Question #{qIndex + 1}</span>
                              </div>

                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => {
                                    startTransition(async () => {
                                      const res = await saveAssessmentQuestionAction(sessionToken, {
                                        id: q.id,
                                        moduleId: q.moduleId,
                                        question: q.question,
                                        options: parsedOptions,
                                        correctIndex: q.correctIndex,
                                        explanation: q.explanation,
                                        difficulty: q.difficulty,
                                      });
                                      if (res.success) {
                                        setGovSaveStatus(`✅ Saved Question #${qIndex + 1}!`);
                                        setTimeout(() => setGovSaveStatus(null), 2500);
                                      } else {
                                        alert(res.error || 'Failed to save question.');
                                      }
                                    });
                                  }}
                                  style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '0.375rem', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  💾 Save
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Delete this assessment question?')) {
                                      startTransition(async () => {
                                        const res = await deleteAssessmentQuestionAction(sessionToken, q.id);
                                        if (res.success) {
                                          fetchDashboardData();
                                        } else {
                                          alert(res.error || 'Failed to delete question.');
                                        }
                                      });
                                    }
                                  }}
                                  style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.375rem', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>

                            <input
                              type="text"
                              value={q.question}
                              onChange={e => {
                                const val = e.target.value;
                                setAssessmentQuestions(prev => prev.map(item => item.id === q.id ? { ...item, question: val } : item));
                              }}
                              style={{ width: '100%', background: '#0B1528', border: '1px solid #334155', borderRadius: '0.375rem', padding: '0.55rem 0.75rem', color: '#F1F5F9', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}
                            />

                            {/* 4 Options Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                              {parsedOptions.map((opt, optIdx) => (
                                <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#0B1528', border: q.correctIndex === optIdx ? '1px solid #10B981' : '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.35rem 0.6rem' }}>
                                  <input
                                    type="radio"
                                    name={`gov-opt-${q.id}`}
                                    checked={q.correctIndex === optIdx}
                                    onChange={() => setAssessmentQuestions(prev => prev.map(item => item.id === q.id ? { ...item, correctIndex: optIdx } : item))}
                                  />
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={e => {
                                      const nextOpts = [...parsedOptions];
                                      nextOpts[optIdx] = e.target.value;
                                      setAssessmentQuestions(prev => prev.map(item => item.id === q.id ? { ...item, options: JSON.stringify(nextOpts) } : item));
                                    }}
                                    style={{ flex: 1, background: 'transparent', border: 'none', color: '#CBD5E1', fontSize: '0.8rem' }}
                                  />
                                  {q.correctIndex === optIdx && <span style={{ color: '#10B981', fontSize: '0.75rem' }}>✓ Key</span>}
                                </div>
                              ))}
                            </div>

                            {/* Explanation */}
                            <div>
                              <label style={{ fontSize: '0.68rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '2px' }}>INSTITUTIONAL RATIONALE &amp; EXPLANATION</label>
                              <textarea
                                rows={2}
                                value={q.explanation || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setAssessmentQuestions(prev => prev.map(item => item.id === q.id ? { ...item, explanation: val } : item));
                                }}
                                style={{ width: '100%', background: '#0B1528', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.5rem', color: '#94A3B8', fontSize: '0.78rem', fontFamily: 'inherit' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* ─── SUB-TAB 2: CAPSTONE PATHWAYS ──────────────────────────── */}
            {govSubTab === 'capstone' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                        Accredited Capstone Research Pathways ({capstoneTracks.length})
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#8898AA', margin: '2px 0 0' }}>
                        Curriculum theses and valuation models required for professional certification.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddCapstoneModal(true)}
                      style={{ background: 'rgba(206,174,86,0.15)', color: '#CEAE56', border: '1px solid rgba(206,174,86,0.3)', borderRadius: '0.375rem', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Add Research Pathway
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {capstoneTracks.map(tr => {
                      let parsedTags: string[] = [];
                      try {
                        parsedTags = typeof tr.tags === 'string' ? JSON.parse(tr.tags) : tr.tags;
                      } catch {
                        parsedTags = [];
                      }

                      return (
                        <div key={tr.id} style={{ background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.75rem', padding: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>{tr.icon}</span>
                              <span style={{ fontSize: '0.75rem', background: 'rgba(206,174,86,0.15)', color: '#CEAE56', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                Track {tr.code}
                              </span>
                              <span style={{ fontSize: '0.75rem', background: tr.isActive ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', color: tr.isActive ? '#34D399' : '#F87171', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                {tr.isActive ? 'Active' : 'Disabled'}
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => {
                                  startTransition(async () => {
                                    const res = await saveCapstoneTrackAction(sessionToken, {
                                      ...tr,
                                      tags: parsedTags,
                                      isActive: tr.isActive ? 0 : 1,
                                    });
                                    if (res.success) {
                                      fetchDashboardData();
                                    } else {
                                      alert(res.error || 'Failed to update track status.');
                                    }
                                  });
                                }}
                                style={{ background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.375rem', padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer' }}
                              >
                                {tr.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => {
                                  startTransition(async () => {
                                    const res = await saveCapstoneTrackAction(sessionToken, {
                                      ...tr,
                                      tags: parsedTags,
                                    });
                                    if (res.success) {
                                      setGovSaveStatus(`✅ Saved Track ${tr.code} (${tr.title})!`);
                                      setTimeout(() => setGovSaveStatus(null), 2500);
                                    } else {
                                      alert(res.error || 'Failed to save track.');
                                    }
                                  });
                                }}
                                style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '0.375rem', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                💾 Save
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete Track ${tr.code}: "${tr.title}"?`)) {
                                    startTransition(async () => {
                                      const res = await deleteCapstoneTrackAction(sessionToken, tr.id);
                                      if (res.success) {
                                        fetchDashboardData();
                                      } else {
                                        alert(res.error || 'Failed to delete track.');
                                      }
                                    });
                                  }
                                }}
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.375rem', padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer' }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <input
                              type="text"
                              value={tr.title}
                              onChange={e => {
                                const val = e.target.value;
                                setCapstoneTracks(prev => prev.map(item => item.id === tr.id ? { ...item, title: val } : item));
                              }}
                              style={{ background: '#0B1528', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', color: '#F1F5F9', fontSize: '0.85rem', fontWeight: 700 }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <label style={{ fontSize: '0.7rem', color: '#8898AA', whiteSpace: 'nowrap' }}>Min Pass:</label>
                              <input
                                type="number"
                                min={50}
                                max={100}
                                value={tr.minPassingScore || 70}
                                onChange={e => {
                                  const val = parseInt(e.target.value, 10) || 70;
                                  setCapstoneTracks(prev => prev.map(item => item.id === tr.id ? { ...item, minPassingScore: val } : item));
                                }}
                                style={{ width: '100%', background: '#0B1528', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.45rem', color: '#CEAE56', fontSize: '0.8rem', fontWeight: 700 }}
                              />
                            </div>
                          </div>

                          <div style={{ marginBottom: '0.75rem' }}>
                            <label style={{ fontSize: '0.68rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '2px' }}>RESEARCH THESIS GUIDANCE &amp; SCOPE</label>
                            <textarea
                              rows={2}
                              value={tr.description}
                              onChange={e => {
                                const val = e.target.value;
                                setCapstoneTracks(prev => prev.map(item => item.id === tr.id ? { ...item, description: val } : item));
                              }}
                              style={{ width: '100%', background: '#0B1528', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.5rem', color: '#CBD5E1', fontSize: '0.78rem', fontFamily: 'inherit' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.68rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '2px' }}>INSTITUTIONAL EVALUATION RUBRIC &amp; CRITERIA</label>
                            <textarea
                              rows={3}
                              value={tr.rubric || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setCapstoneTracks(prev => prev.map(item => item.id === tr.id ? { ...item, rubric: val } : item));
                              }}
                              style={{ width: '100%', background: '#0B1528', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.5rem', color: '#94A3B8', fontSize: '0.78rem', fontFamily: 'monospace' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ─── SUB-TAB 3: CERTIFICATION TIERS & WEIGHTS ──────────────── */}
            {govSubTab === 'certification' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Tiers & Weights Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Tier Thresholds Card */}
                  <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#CEAE56', margin: '0 0 1rem' }}>
                      🏅 Credential Tier Cut-Off Thresholds
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#8898AA', marginBottom: '1.25rem' }}>
                      Minimum weighted composite scores required to earn institutional recognition tiers.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ background: '#070E1A', border: '1px solid rgba(206,174,86,0.3)', borderRadius: '0.5rem', padding: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#CEAE56' }}>🏅 Distinction Tier</span>
                          <span style={{ fontSize: '0.75rem', color: '#8898AA' }}>Honors &amp; Fast-track Hiring</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Score ≥</span>
                          <input
                            type="number"
                            min={70}
                            max={100}
                            value={certificationSettings?.distinctionMinScore || 85}
                            onChange={e => setCertificationSettings({ ...certificationSettings, distinctionMinScore: parseInt(e.target.value, 10) || 85 })}
                            style={{ width: 80, background: '#0B1528', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.4rem', color: '#CEAE56', fontWeight: 700, fontSize: '0.85rem' }}
                          />
                          <span style={{ fontSize: '0.8rem', color: '#8898AA' }}>%</span>
                        </div>
                      </div>

                      <div style={{ background: '#070E1A', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '0.5rem', padding: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60A5FA' }}>🎓 Proficiency Tier</span>
                          <span style={{ fontSize: '0.75rem', color: '#8898AA' }}>Standard Professional Tier</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Score ≥</span>
                          <input
                            type="number"
                            min={50}
                            max={90}
                            value={certificationSettings?.proficiencyMinScore || 75}
                            onChange={e => setCertificationSettings({ ...certificationSettings, proficiencyMinScore: parseInt(e.target.value, 10) || 75 })}
                            style={{ width: 80, background: '#0B1528', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.4rem', color: '#60A5FA', fontWeight: 700, fontSize: '0.85rem' }}
                          />
                          <span style={{ fontSize: '0.8rem', color: '#8898AA' }}>%</span>
                        </div>
                      </div>

                      <div style={{ background: '#070E1A', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '0.5rem', padding: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34D399' }}>✅ Completion Tier</span>
                          <span style={{ fontSize: '0.75rem', color: '#8898AA' }}>Coursework Completion</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Score ≥</span>
                          <input
                            type="number"
                            min={40}
                            max={80}
                            value={certificationSettings?.completionMinScore || 60}
                            onChange={e => setCertificationSettings({ ...certificationSettings, completionMinScore: parseInt(e.target.value, 10) || 60 })}
                            style={{ width: 80, background: '#0B1528', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.4rem', color: '#34D399', fontWeight: 700, fontSize: '0.85rem' }}
                          />
                          <span style={{ fontSize: '0.8rem', color: '#8898AA' }}>%</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          startTransition(async () => {
                            const res = await saveCertificationSettingsAction(sessionToken, certificationSettings);
                            if (res.success) {
                              setGovSaveStatus('✅ Credential tier cut-off thresholds saved successfully!');
                              fetchDashboardData();
                              setTimeout(() => setGovSaveStatus(null), 3500);
                            } else {
                              alert(res.error || 'Failed to save tier settings.');
                            }
                          });
                        }}
                        style={{ background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '0.375rem', padding: '0.65rem 1rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}
                      >
                        💾 Save Tier Cut-Offs
                      </button>
                    </div>
                  </div>

                  {/* Institutional Weights Card */}
                  <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', margin: '0 0 1rem' }}>
                      ⚖️ Institutional Evaluation Weights (Σ = 100%)
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#8898AA', marginBottom: '1.25rem' }}>
                      Determine how student performance across different academic components calculates the final weighted score.
                    </p>

                    {(() => {
                      let weights = { knowledgeChecks: 10, assignments: 20, quizzes: 30, moduleAssessments: 30, capstone: 10 };
                      try {
                        weights = typeof certificationSettings?.weightsJson === 'string' ? JSON.parse(certificationSettings.weightsJson) : (certificationSettings?.weights || weights);
                      } catch {}

                      const totalWeight = (weights.quizzes || 0) + (weights.moduleAssessments || 0) + (weights.capstone || 0) + (weights.assignments || 0) + (weights.knowledgeChecks || 0);

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#070E1A', padding: '0.6rem 0.85rem', borderRadius: '0.375rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#F1F5F9' }}>Quizzes (44 Structured Quizzes)</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                value={weights.quizzes || 30}
                                onChange={e => {
                                  const updated = { ...weights, quizzes: parseInt(e.target.value, 10) || 0 };
                                  setCertificationSettings({ ...certificationSettings, weightsJson: JSON.stringify(updated) });
                                }}
                                style={{ width: 60, background: '#0B1528', border: '1px solid #1E293B', borderRadius: '4px', padding: '4px', color: '#CEAE56', fontSize: '0.8rem', fontWeight: 700 }}
                              />
                              <span style={{ color: '#8898AA', fontSize: '0.75rem' }}>%</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#070E1A', padding: '0.6rem 0.85rem', borderRadius: '0.375rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#F1F5F9' }}>Proctored Module Assessments (M1–M8)</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                value={weights.moduleAssessments || 30}
                                onChange={e => {
                                  const updated = { ...weights, moduleAssessments: parseInt(e.target.value, 10) || 0 };
                                  setCertificationSettings({ ...certificationSettings, weightsJson: JSON.stringify(updated) });
                                }}
                                style={{ width: 60, background: '#0B1528', border: '1px solid #1E293B', borderRadius: '4px', padding: '4px', color: '#CEAE56', fontSize: '0.8rem', fontWeight: 700 }}
                              />
                              <span style={{ color: '#8898AA', fontSize: '0.75rem' }}>%</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#070E1A', padding: '0.6rem 0.85rem', borderRadius: '0.375rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#F1F5F9' }}>Capstone Thesis / DCF Valuation</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                value={weights.capstone || 10}
                                onChange={e => {
                                  const updated = { ...weights, capstone: parseInt(e.target.value, 10) || 0 };
                                  setCertificationSettings({ ...certificationSettings, weightsJson: JSON.stringify(updated) });
                                }}
                                style={{ width: 60, background: '#0B1528', border: '1px solid #1E293B', borderRadius: '4px', padding: '4px', color: '#CEAE56', fontSize: '0.8rem', fontWeight: 700 }}
                              />
                              <span style={{ color: '#8898AA', fontSize: '0.75rem' }}>%</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#070E1A', padding: '0.6rem 0.85rem', borderRadius: '0.375rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#F1F5F9' }}>Practical Submissions &amp; Case Studies</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                value={weights.assignments || 20}
                                onChange={e => {
                                  const updated = { ...weights, assignments: parseInt(e.target.value, 10) || 0 };
                                  setCertificationSettings({ ...certificationSettings, weightsJson: JSON.stringify(updated) });
                                }}
                                style={{ width: 60, background: '#0B1528', border: '1px solid #1E293B', borderRadius: '4px', padding: '4px', color: '#CEAE56', fontSize: '0.8rem', fontWeight: 700 }}
                              />
                              <span style={{ color: '#8898AA', fontSize: '0.75rem' }}>%</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#070E1A', padding: '0.6rem 0.85rem', borderRadius: '0.375rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#F1F5F9' }}>Interactive Knowledge Checks</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                value={weights.knowledgeChecks || 10}
                                onChange={e => {
                                  const updated = { ...weights, knowledgeChecks: parseInt(e.target.value, 10) || 0 };
                                  setCertificationSettings({ ...certificationSettings, weightsJson: JSON.stringify(updated) });
                                }}
                                style={{ width: 60, background: '#0B1528', border: '1px solid #1E293B', borderRadius: '4px', padding: '4px', color: '#CEAE56', fontSize: '0.8rem', fontWeight: 700 }}
                              />
                              <span style={{ color: '#8898AA', fontSize: '0.75rem' }}>%</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.85rem', borderTop: '1px dashed #1E293B', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: totalWeight === 100 ? '#34D399' : '#EF4444' }}>
                              Composite Sum: {totalWeight}% {totalWeight === 100 ? '✓ (Valid)' : '⚠️ (Must equal 100%)'}
                            </span>
                            <button
                              onClick={() => {
                                startTransition(async () => {
                                  const res = await saveCertificationSettingsAction(sessionToken, {
                                    ...certificationSettings,
                                    weights,
                                  });
                                  if (res.success) {
                                    setGovSaveStatus('✅ Evaluation weights updated and applied!');
                                    fetchDashboardData();
                                    setTimeout(() => setGovSaveStatus(null), 3500);
                                  } else {
                                    alert(res.error || 'Failed to save weights.');
                                  }
                                });
                              }}
                              style={{ background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '0.375rem', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              💾 Save Weights
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Professional Tracks Table */}
                <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', margin: '0 0 1rem' }}>
                    📜 Accredited Professional Certification Tracks ({professionalTracks.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {professionalTracks.map(pt => {
                      let reqMods: string[] = [];
                      try {
                        reqMods = typeof pt.requiredModules === 'string' ? JSON.parse(pt.requiredModules) : pt.requiredModules;
                      } catch {
                        reqMods = [];
                      }

                      return (
                        <div key={pt.id} style={{ background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.5rem', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>{pt.icon || '📜'}</span>
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F1F5F9' }}>{pt.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#8898AA', margin: '2px 0' }}>{pt.description}</div>
                              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                {reqMods.map(m => (
                                  <span key={m} style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', padding: '1px 6px', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 700 }}>
                                    {m} Required
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                              Active Track
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ─── TAB: CHATBOT Q&A KNOWLEDGE BASE STUDIO (30 ANSWERS) ───────────── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'chatbot_qa' && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Top Control Bar */}
            <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                      💬 Chatbot Q&A Knowledge Studio
                    </h3>
                    <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '9999px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {chatbotQAs.length} Live Questions
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#8898AA', margin: '0.35rem 0 0' }}>
                    These 30 curated questions and answers power the live website assistant. Edit any question or answer below to update chatbot responses in real time.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      if (confirm('Reset all Q&As to the official 30 default answers? Custom edits will be overwritten.')) {
                        startTransition(async () => {
                          const res = await resetChatbotQAsAction(sessionToken);
                          if (res.success) {
                            setQaSaveStatus('✅ Reset to 30 default questions & answers successfully!');
                            fetchDashboardData();
                            setTimeout(() => setQaSaveStatus(null), 4000);
                          } else {
                            setQaSaveStatus(`❌ Error: ${res.error}`);
                          }
                        });
                      }
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#F87171',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '0.5rem',
                      padding: '0.6rem 1rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✨ Reset to 30 Defaults
                  </button>

                  <button
                    onClick={() => {
                      startTransition(async () => {
                        const res = await bulkSaveChatbotQAsAction(sessionToken, chatbotQAs);
                        if (res.success) {
                          setQaSaveStatus('✅ All Q&A changes saved and published live to chatbot!');
                          fetchDashboardData();
                          setTimeout(() => setQaSaveStatus(null), 4000);
                        } else {
                          setQaSaveStatus(`❌ Error: ${res.error}`);
                        }
                      });
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.6rem 1.25rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    💾 Save All Changes
                  </button>
                </div>
              </div>

              {qaSaveStatus && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: qaSaveStatus.startsWith('✅') ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', border: qaSaveStatus.startsWith('✅') ? '1px solid #34D399' : '1px solid #EF4444', color: qaSaveStatus.startsWith('✅') ? '#34D399' : '#EF4444', fontSize: '0.85rem', fontWeight: 600 }}>
                  {qaSaveStatus}
                </div>
              )}
            </div>

            {/* Ingest New Q&A Box */}
            <div style={{ background: '#0B1528', border: '1px solid rgba(206,174,86,0.3)', borderRadius: '1rem', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#CEAE56', marginBottom: '0.75rem' }}>
                ➕ Add New Chatbot Question & Answer Pair
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8898AA', fontWeight: 600, display: 'block', marginBottom: '4px' }}>QUESTION</label>
                  <input
                    type="text"
                    placeholder="e.g., What is Discounted Cash Flow (DCF)?"
                    value={newQAQuestion}
                    onChange={e => setNewQAQuestion(e.target.value)}
                    style={{ width: '100%', background: '#070E1A', border: '1px solid #334155', borderRadius: '0.375rem', padding: '0.6rem 0.75rem', color: '#F1F5F9', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8898AA', fontWeight: 600, display: 'block', marginBottom: '4px' }}>CATEGORY</label>
                  <select
                    value={newQACategory}
                    onChange={e => setNewQACategory(e.target.value)}
                    style={{ width: '100%', background: '#070E1A', border: '1px solid #334155', borderRadius: '0.375rem', padding: '0.6rem 0.75rem', color: '#F1F5F9', fontSize: '0.82rem' }}
                  >
                    <option value="FinGenIQ Platform">FinGenIQ Platform</option>
                    <option value="Curriculum">Curriculum</option>
                    <option value="Certifications">Certifications</option>
                    <option value="Capstone">Capstone</option>
                    <option value="Valuation & DCF">Valuation & DCF</option>
                    <option value="Investing">Investing</option>
                    <option value="Corporate Finance">Corporate Finance</option>
                    <option value="Personal Finance">Personal Finance</option>
                    <option value="Portfolio Strategy">Portfolio Strategy</option>
                    <option value="Capital Markets">Capital Markets</option>
                    <option value="Careers & Marketplace">Careers & Marketplace</option>
                    <option value="Support & Contact">Support & Contact</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.7rem', color: '#8898AA', fontWeight: 600, display: 'block', marginBottom: '4px' }}>ANSWER (Markdown supported)</label>
                <textarea
                  rows={3}
                  placeholder="Enter the detailed explanation or answer the chatbot should provide..."
                  value={newQAAnswer}
                  onChange={e => setNewQAAnswer(e.target.value)}
                  style={{ width: '100%', background: '#070E1A', border: '1px solid #334155', borderRadius: '0.375rem', padding: '0.6rem 0.75rem', color: '#F1F5F9', fontSize: '0.82rem', fontFamily: 'inherit' }}
                />
              </div>
              <button
                onClick={() => {
                  if (!newQAQuestion.trim() || !newQAAnswer.trim()) {
                    alert('Please enter both Question and Answer.');
                    return;
                  }
                  startTransition(async () => {
                    const res = await saveChatbotQAAction(sessionToken, {
                      question: newQAQuestion,
                      answer: newQAAnswer,
                      category: newQACategory,
                    });
                    if (res.success) {
                      setNewQAQuestion('');
                      setNewQAAnswer('');
                      setQaSaveStatus('✅ New Q&A added to chatbot knowledge base!');
                      fetchDashboardData();
                      setTimeout(() => setQaSaveStatus(null), 3000);
                    } else {
                      alert(res.error);
                    }
                  });
                }}
                style={{
                  background: 'rgba(206,174,86,0.15)',
                  color: '#CEAE56',
                  border: '1px solid rgba(206,174,86,0.4)',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ➕ Add to Knowledge Base
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="🔍 Search questions or keywords..."
                value={qaSearchQuery}
                onChange={e => setQaSearchQuery(e.target.value)}
                style={{ flex: 1, minWidth: 240, background: '#0B1528', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.6rem 1rem', color: '#F1F5F9', fontSize: '0.82rem' }}
              />
              <select
                value={qaCategoryFilter}
                onChange={e => setQaCategoryFilter(e.target.value)}
                style={{ background: '#0B1528', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.6rem 1rem', color: '#F1F5F9', fontSize: '0.82rem' }}
              >
                <option value="all">All Categories</option>
                {Array.from(new Set(chatbotQAs.map(q => q.category || 'General'))).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* List of 30 Q&A Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {chatbotQAs
                .filter(qa => {
                  const matchesSearch = !qaSearchQuery || 
                    qa.question?.toLowerCase().includes(qaSearchQuery.toLowerCase()) || 
                    qa.answer?.toLowerCase().includes(qaSearchQuery.toLowerCase()) ||
                    qa.category?.toLowerCase().includes(qaSearchQuery.toLowerCase());
                  const matchesCategory = qaCategoryFilter === 'all' || qa.category === qaCategoryFilter;
                  return matchesSearch && matchesCategory;
                })
                .map((qa, index) => (
                  <div
                    key={qa.id || index}
                    style={{
                      background: '#0B1528',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.75rem',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    {/* Top Row: Q Number, Category, Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(206,174,86,0.15)', color: '#CEAE56', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                          {index + 1}
                        </span>
                        <span style={{ fontSize: '0.72rem', background: '#070E1A', border: '1px solid #334155', color: '#94A3B8', borderRadius: '4px', padding: '2px 8px', fontWeight: 600 }}>
                          {qa.category || 'General'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            startTransition(async () => {
                              const res = await saveChatbotQAAction(sessionToken, qa);
                              if (res.success) {
                                setQaSaveStatus(`✅ Saved Question #${index + 1}!`);
                                setTimeout(() => setQaSaveStatus(null), 2500);
                              } else {
                                alert(res.error);
                              }
                            });
                          }}
                          style={{
                            background: 'rgba(52,211,153,0.12)',
                            color: '#34D399',
                            border: '1px solid rgba(52,211,153,0.3)',
                            borderRadius: '0.375rem',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          💾 Save Item
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete question: "${qa.question}"?`)) {
                              startTransition(async () => {
                                const res = await deleteChatbotQAAction(sessionToken, qa.id);
                                if (res.success) {
                                  fetchDashboardData();
                                } else {
                                  alert(res.error);
                                }
                              });
                            }
                          }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#F87171',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            borderRadius: '0.375rem',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Question Input */}
                    <div>
                      <label style={{ fontSize: '0.68rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
                        Question
                      </label>
                      <input
                        type="text"
                        value={qa.question || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setChatbotQAs(prev => prev.map((item, i) => item.id === qa.id ? { ...item, question: val } : item));
                        }}
                        style={{ width: '100%', background: '#070E1A', border: '1px solid #334155', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', color: '#F1F5F9', fontSize: '0.85rem', fontWeight: 600 }}
                      />
                    </div>

                    {/* Answer Textarea */}
                    <div>
                      <label style={{ fontSize: '0.68rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>
                        Answer
                      </label>
                      <textarea
                        rows={3}
                        value={qa.answer || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setChatbotQAs(prev => prev.map((item, i) => item.id === qa.id ? { ...item, answer: val } : item));
                        }}
                        style={{ width: '100%', background: '#070E1A', border: '1px solid #334155', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', color: '#CBD5E1', fontSize: '0.8rem', lineHeight: '1.5', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>
                ))}
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ─── TAB: COMMUNITY MODERATION ──────────────────────────────────────── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'community' && (
          <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                  Published Research & Community Articles ({articlesList.length})
                </h3>
                <Link href="/community/new" target="_blank" style={{ fontSize: '0.75rem', color: '#CEAE56', textDecoration: 'none', background: 'rgba(206,174,86,0.1)', border: '1px solid rgba(206,174,86,0.3)', padding: '4px 10px', borderRadius: '0.375rem' }}>
                  + Post Editorial ↗
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {articlesList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', background: '#070E1A', border: '1px dashed #1E293B', borderRadius: '0.75rem' }}>
                    <p style={{ color: '#8898AA', fontSize: '0.85rem', margin: 0 }}>No community research articles found. Click "+ Post Editorial" to publish.</p>
                  </div>
                ) : (
                  articlesList.map(art => (
                    <div key={art.id} style={{ background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.75rem', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.65rem', background: 'rgba(206,174,86,0.15)', color: '#CEAE56', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            {art.concept || art.category || 'Valuation'}
                          </span>
                          <span style={{ fontSize: '0.65rem', background: art.published ? 'rgba(52,211,153,0.15)' : 'rgba(148,163,184,0.15)', color: art.published ? '#34D399' : '#94A3B8', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {art.published ? '● Published' : '○ Draft'}
                          </span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9' }}>{art.title}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Link
                            href={`/community/${art.slug}`}
                            target="_blank"
                            style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '0.375rem', padding: '3px 8px', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600 }}
                          >
                            View ↗
                          </Link>
                          <Link
                            href={`/community/edit/${art.slug}`}
                            target="_blank"
                            style={{ background: 'rgba(206,174,86,0.1)', color: '#CEAE56', border: '1px solid rgba(206,174,86,0.3)', borderRadius: '0.375rem', padding: '3px 8px', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600 }}
                          >
                            Edit ✎
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm(`Delete article "${art.title}"? This cannot be undone.`)) {
                                startTransition(async () => {
                                  const res = await adminDeleteCommunityArticleAction(sessionToken, String(art.id));
                                  if (res.success) {
                                    fetchDashboardData();
                                  } else {
                                    alert(res.error || 'Failed to delete article');
                                  }
                                });
                              }
                            }}
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.375rem', padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: '#8898AA', margin: '0.5rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {art.summary || art.body?.slice(0, 140)}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.72rem', color: '#64748B' }}>
                        <span>👤 {art.author_name || 'FinGenIQ Editorial'}</span>
                        {art.created_at && <span>📅 {new Date(art.created_at).toLocaleDateString()}</span>}
                        {art.sector && <span>🏢 {art.sector}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Comments Feed */}
            <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '0.75rem' }}>
                Recent Comments Moderation Stream ({commentsList.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 420, overflowY: 'auto' }}>
                {commentsList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#070E1A', border: '1px dashed #1E293B', borderRadius: '0.75rem' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💬</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.25rem' }}>No Comments Pending Review</div>
                    <div style={{ fontSize: '0.75rem', color: '#8898AA' }}>Community discussions and member responses will stream here for real-time moderation.</div>
                  </div>
                ) : (
                  commentsList.map(c => (
                    <div key={c.id} style={{ background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.5rem', padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CEAE56' }}>{c.user_name || 'Member'}</span>
                          {c.articleTitle && (
                            <span style={{ fontSize: '0.65rem', color: '#64748B', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              on {c.articleTitle}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Delete comment?')) {
                              startTransition(async () => {
                                const res = await adminDeleteCommentAction(sessionToken, String(c.id));
                                if (res.success) {
                                  fetchDashboardData();
                                } else {
                                  alert(res.error || 'Failed to delete comment');
                                }
                              });
                            }
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#F87171', fontSize: '0.7rem', cursor: 'pointer' }}
                        >
                          ✕ Delete
                        </button>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#CBD5E1', margin: 0 }}>{c.body}</p>
                      {c.created_at && (
                        <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
                          {new Date(c.created_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ─── TAB 6: ENTERPRISE & PACKAGES ──────────────────────────────────── */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'entities' && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#CEAE56', marginBottom: '1rem' }}>
                + Add Business Entity (B2B Corporate or B2B2C University Partner)
              </h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const res = await createBusinessEntityAction(sessionToken, formData);
                if (res.success) {
                  alert('Business Entity registered successfully!');
                  fetchDashboardData();
                } else {
                  alert('Error: ' + res.error);
                }
              }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>Organization Name</label>
                  <input name="name" required placeholder="e.g. Goldman Financial Group" style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>Type</label>
                  <select name="type" style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.85rem' }}>
                    <option value="b2b">B2B Corporate</option>
                    <option value="b2b2c">B2B2C University / Partner</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>Contact Email</label>
                  <input name="contactEmail" type="email" required style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#8898AA', marginBottom: '0.35rem' }}>Max User Quota</label>
                  <input name="maxUsers" type="number" defaultValue={100} style={{ width: '100%', background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.375rem', padding: '0.55rem', color: '#F1F5F9', fontSize: '0.85rem' }} />
                </div>
                <button type="submit" style={{ background: '#CEAE56', color: '#060A16', border: 'none', borderRadius: '0.375rem', padding: '0.65rem 1rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                  + Register Partner
                </button>
              </form>
            </div>

            <div style={{ background: '#0B1528', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.9rem', fontWeight: 700, color: '#F1F5F9' }}>
                Active Enterprise & University Entities ({entitiesList.length})
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#070E1A', color: '#8898AA' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Entity Name</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Contact</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Quota</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entitiesList.map(e => (
                      <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#F1F5F9' }}>{e.name}</td>
                        <td style={{ padding: '0.75rem 1rem', textTransform: 'uppercase', color: '#CBD5E1' }}>{e.type}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#8898AA' }}>{e.contactEmail}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#CEAE56', fontWeight: 700 }}>{e.maxUsers} seats</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <button
                            onClick={() => startTransition(async () => { await toggleEntityStatusAction(sessionToken, e.id); fetchDashboardData(); })}
                            style={{ background: e.isActive ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)', color: e.isActive ? '#34D399' : '#F87171', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.7rem', marginRight: '4px' }}
                          >
                            {e.isActive ? 'Active' : 'Disabled'}
                          </button>
                          <button
                            onClick={() => setEditingEntity({id: e.id, entityId: e.id, name: e.name, contactEmail: e.contactEmail, contactPhone: e.contactPhone, address: e.address, maxUsers: e.maxUsers})}
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.7rem', marginRight: '4px' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEntity(e.id)}
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.7rem' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* End of tabs */}

      </div>
      {/* ─── MODALS ────────────────────────────────────────── */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditingUser(null)}>
          <div style={{ background: '#0B1528', border: '1px solid #CEAE56', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '1.5rem' }}>Edit User</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CEAE56' }}>User ID
                <input type="text" value={editingUser.newUserId !== undefined ? editingUser.newUserId : (editingUser.userId || editingUser.id || '')} onChange={e => setEditingUser({...editingUser, newUserId: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }} />
              </label>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Name
                <input type="text" value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }} />
              </label>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Email
                <input type="email" value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }} />
              </label>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Role
                <select value={editingUser.role || 'learner'} onChange={e => setEditingUser({...editingUser, role: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  <option value="learner">Learner</option>
                  <option value="employer">Employer</option>
                  <option value="employee">Employee</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Login Category
                <select value={editingUser.loginCategory || 'b2c'} onChange={e => setEditingUser({...editingUser, loginCategory: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  <option value="b2c">B2C</option>
                  <option value="b2b">B2B</option>
                  <option value="b2b2c">B2B2C</option>
                  <option value="community">Community</option>
                </select>
              </label>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Set New Password (Optional)
                <input type="password" placeholder="Leave blank to keep existing password" value={editingUser.newPassword || ''} onChange={e => setEditingUser({...editingUser, newPassword: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setEditingUser(null)} style={{ padding: '0.5rem 1.25rem', border: '1px solid #334155', borderRadius: '0.5rem', background: 'transparent', color: '#94A3B8', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleEditUser} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: '#CEAE56', color: '#060A16', fontWeight: 700, cursor: 'pointer' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setDeletingUser(null)}>
          <div style={{ background: '#0B1528', border: '1px solid #CEAE56', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F87171', marginBottom: '1rem' }}>⚠️ Delete User</h3>
            <p style={{ fontSize: '0.9rem', color: '#8898AA', lineHeight: 1.6, marginBottom: '0.5rem' }}>Are you sure you want to permanently delete this user?</p>
            <div style={{ background: '#070E1A', border: '1px solid #1E293B', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, color: '#F1F5F9' }}>{deletingUser.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{deletingUser.email}</div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#F87171', marginBottom: '1.5rem' }}>This will permanently delete all user data including progress, certifications, and session history. This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeletingUser(null)} style={{ padding: '0.5rem 1.25rem', border: '1px solid #334155', borderRadius: '0.5rem', background: 'transparent', color: '#94A3B8', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteUser} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: '#DC2626', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {passwordUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { setPasswordUser(null); setNewPassword(''); setConfirmPassword(''); }}>
          <div style={{ background: '#0B1528', border: '1px solid #CEAE56', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '0.5rem' }}>🔑 Change Password</h3>
            <p style={{ fontSize: '0.85rem', color: '#8898AA', marginBottom: '1.25rem' }}>Set a new password for <strong>{passwordUser.name}</strong> ({passwordUser.email})</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>New Password
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }} />
              </label>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Confirm Password
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }} />
              </label>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <div style={{ fontSize: '0.8rem', color: '#F87171' }}>Passwords do not match</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => { setPasswordUser(null); setNewPassword(''); setConfirmPassword(''); }} style={{ padding: '0.5rem 1.25rem', border: '1px solid #334155', borderRadius: '0.5rem', background: 'transparent', color: '#94A3B8', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleChangePassword} disabled={!newPassword || newPassword !== confirmPassword || newPassword.length < 8} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: newPassword && newPassword === confirmPassword && newPassword.length >= 8 ? '#CEAE56' : '#94A3B8', color: newPassword && newPassword === confirmPassword && newPassword.length >= 8 ? '#060A16' : '#fff', fontWeight: 700, cursor: 'pointer' }}>Set Password</button>
            </div>
          </div>
        </div>
      )}

      {editingEntity && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditingEntity(null)}>
          <div style={{ background: '#0B1528', border: '1px solid #CEAE56', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '1.5rem' }}>Edit Entity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Name
                <input type="text" value={editingEntity.name || ''} onChange={e => setEditingEntity({...editingEntity, name: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }} />
              </label>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Contact Email
                <input type="email" value={editingEntity.contactEmail || ''} onChange={e => setEditingEntity({...editingEntity, contactEmail: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }} />
              </label>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Contact Phone
                <input type="text" value={editingEntity.contactPhone || ''} onChange={e => setEditingEntity({...editingEntity, contactPhone: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }} />
              </label>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Address
                <input type="text" value={editingEntity.address || ''} onChange={e => setEditingEntity({...editingEntity, address: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }} />
              </label>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Max Users
                <input type="number" value={editingEntity.maxUsers || 0} onChange={e => setEditingEntity({...editingEntity, maxUsers: parseInt(e.target.value, 10)})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setEditingEntity(null)} style={{ padding: '0.5rem 1.25rem', border: '1px solid #334155', borderRadius: '0.5rem', background: 'transparent', color: '#94A3B8', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleEditEntity} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: '#CEAE56', color: '#060A16', fontWeight: 700, cursor: 'pointer' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showAddLessonModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddLessonModal(false)}>
          <div style={{ background: '#0B1528', border: '1px solid #CEAE56', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '1.5rem' }}>+ Create New Lesson</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CEAE56' }}>Module
                <select value={newLessonData.moduleId} onChange={e => setNewLessonData({...newLessonData, moduleId: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {MODULES.map(m => (
                    <option key={m.id} value={m.id}>{m.order || m.id}. {m.title}</option>
                  ))}
                </select>
              </label>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Lesson ID (Unique)
                <input type="text" placeholder="e.g. L45" value={newLessonData.lessonId} onChange={e => setNewLessonData({...newLessonData, lessonId: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }} />
              </label>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Lesson Title
                <input type="text" placeholder="e.g. Sovereign Debt Dynamics & Brady Bonds" value={newLessonData.title} onChange={e => setNewLessonData({...newLessonData, title: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Duration
                  <input type="text" placeholder="e.g. 45 min" value={newLessonData.duration} onChange={e => setNewLessonData({...newLessonData, duration: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }} />
                </label>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Level
                  <select value={newLessonData.level} onChange={e => setNewLessonData({...newLessonData, level: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    <option value="Foundational">Foundational</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </label>
              </div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8898AA' }}>Summary
                <textarea rows={3} placeholder="Brief summary of lesson topics and objectives" value={newLessonData.summary} onChange={e => setNewLessonData({...newLessonData, summary: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.5rem', fontSize: '0.85rem', marginTop: '0.25rem' }} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setShowAddLessonModal(false)} style={{ padding: '0.5rem 1.25rem', border: '1px solid #334155', borderRadius: '0.5rem', background: 'transparent', color: '#94A3B8', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateLesson} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #CEAE56 0%, #B8962E 100%)', color: '#060A16', fontWeight: 700, cursor: 'pointer' }}>+ Create Lesson</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD QUESTION MODAL ────────────────────────────── */}
      {showAddQuestionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddQuestionModal(false)}>
          <div style={{ background: '#0B1528', border: '1px solid #CEAE56', borderRadius: '1rem', padding: '1.75rem', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '1rem' }}>+ Add Proctored Assessment Question</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '3px' }}>MODULE</label>
                  <select value={newQuestionModule} onChange={e => setNewQuestionModule(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
                    {['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '3px' }}>DIFFICULTY</label>
                  <select value={newQuestionDifficulty} onChange={e => setNewQuestionDifficulty(e.target.value as any)} style={{ width: '100%', padding: '0.5rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
                    <option value="foundation">Foundation</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '3px' }}>QUESTION STEM</label>
                <input
                  type="text"
                  placeholder="Enter clear, rigorous financial question..."
                  value={newQuestionText}
                  onChange={e => setNewQuestionText(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '3px' }}>MCQ OPTIONS (Select radio button for Correct Answer Key)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {newQuestionOptions.map((opt, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#070E1A', padding: '0.4rem 0.65rem', borderRadius: '0.375rem', border: newQuestionCorrectIndex === idx ? '1px solid #10B981' : '1px solid #1E293B' }}>
                      <input
                        type="radio"
                        name="new-q-opt"
                        checked={newQuestionCorrectIndex === idx}
                        onChange={() => setNewQuestionCorrectIndex(idx)}
                      />
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}...`}
                        value={opt}
                        onChange={e => {
                          const updated = [...newQuestionOptions];
                          updated[idx] = e.target.value;
                          setNewQuestionOptions(updated);
                        }}
                        style={{ flex: 1, background: 'transparent', border: 'none', color: '#F1F5F9', fontSize: '0.82rem' }}
                      />
                      {newQuestionCorrectIndex === idx && <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 700 }}>✓ Key</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '3px' }}>INSTITUTIONAL RATIONALE &amp; EXPLANATION</label>
                <textarea
                  rows={3}
                  placeholder="Provide technical explanation why the key is correct..."
                  value={newQuestionExplanation}
                  onChange={e => setNewQuestionExplanation(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', background: '#070E1A', border: '1px solid #1E293B', color: '#CBD5E1', borderRadius: '0.375rem', fontSize: '0.82rem', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setShowAddQuestionModal(false)} style={{ padding: '0.5rem 1rem', border: '1px solid #334155', borderRadius: '0.375rem', background: 'transparent', color: '#94A3B8', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  if (!newQuestionText.trim() || newQuestionOptions.some(o => !o.trim()) || !newQuestionExplanation.trim()) {
                    alert('Please fill out the question stem, all 4 options, and the rationale.');
                    return;
                  }
                  startTransition(async () => {
                    const res = await saveAssessmentQuestionAction(sessionToken, {
                      moduleId: newQuestionModule,
                      question: newQuestionText,
                      options: newQuestionOptions,
                      correctIndex: newQuestionCorrectIndex,
                      explanation: newQuestionExplanation,
                      difficulty: newQuestionDifficulty,
                    });
                    if (res.success) {
                      setShowAddQuestionModal(false);
                      setNewQuestionText('');
                      setNewQuestionOptions(['', '', '', '']);
                      setNewQuestionExplanation('');
                      setGovSaveStatus('✅ New question added to proctored bank!');
                      fetchDashboardData();
                      setTimeout(() => setGovSaveStatus(null), 3000);
                    } else {
                      alert(res.error || 'Failed to save question.');
                    }
                  });
                }}
                style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.375rem', background: '#10B981', color: '#FFFFFF', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                + Save to Bank
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD CAPSTONE MODAL ────────────────────────────── */}
      {showAddCapstoneModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddCapstoneModal(false)}>
          <div style={{ background: '#0B1528', border: '1px solid #CEAE56', borderRadius: '1rem', padding: '1.75rem', width: '100%', maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '1rem' }}>+ Add Capstone Research Pathway</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 80px 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '3px' }}>ID</label>
                  <input type="text" placeholder="track-d" value={newCapstoneId} onChange={e => setNewCapstoneId(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.375rem', fontSize: '0.82rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '3px' }}>CODE</label>
                  <input type="text" placeholder="D" value={newCapstoneCode} onChange={e => setNewCapstoneCode(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.375rem', fontSize: '0.82rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '3px' }}>ICON &amp; TITLE</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="text" placeholder="📊" value={newCapstoneIcon} onChange={e => setNewCapstoneIcon(e.target.value)} style={{ width: 45, padding: '0.5rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.375rem', fontSize: '0.85rem', textAlign: 'center' }} />
                    <input type="text" placeholder="Track D — Quantitative Trading Thesis" value={newCapstoneTitle} onChange={e => setNewCapstoneTitle(e.target.value)} style={{ flex: 1, padding: '0.5rem', background: '#070E1A', border: '1px solid #1E293B', color: '#F1F5F9', borderRadius: '0.375rem', fontSize: '0.85rem' }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '3px' }}>RESEARCH GUIDANCE</label>
                <textarea rows={2} placeholder="Explain what the learner must research and construct..." value={newCapstoneDesc} onChange={e => setNewCapstoneDesc(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#070E1A', border: '1px solid #1E293B', color: '#CBD5E1', borderRadius: '0.375rem', fontSize: '0.8rem', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#8898AA', fontWeight: 700, display: 'block', marginBottom: '3px' }}>EVALUATION RUBRIC</label>
                <textarea rows={3} placeholder="• Methodology (25%)&#10;• Empirical Testing (25%)&#10;• Risk Horizon (25%)&#10;• Conclusions (25%)" value={newCapstoneRubric} onChange={e => setNewCapstoneRubric(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#070E1A', border: '1px solid #1E293B', color: '#CBD5E1', borderRadius: '0.375rem', fontSize: '0.8rem', fontFamily: 'monospace' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setShowAddCapstoneModal(false)} style={{ padding: '0.5rem 1rem', border: '1px solid #334155', borderRadius: '0.375rem', background: 'transparent', color: '#94A3B8', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  if (!newCapstoneId.trim() || !newCapstoneTitle.trim() || !newCapstoneDesc.trim()) {
                    alert('Please provide Pathway ID, Title, and Description.');
                    return;
                  }
                  startTransition(async () => {
                    const res = await saveCapstoneTrackAction(sessionToken, {
                      id: newCapstoneId,
                      code: newCapstoneCode,
                      title: newCapstoneTitle,
                      icon: newCapstoneIcon,
                      description: newCapstoneDesc,
                      rubric: newCapstoneRubric,
                      minPassingScore: newCapstonePass,
                      isActive: 1,
                    });
                    if (res.success) {
                      setShowAddCapstoneModal(false);
                      setNewCapstoneId('');
                      setNewCapstoneTitle('');
                      setNewCapstoneDesc('');
                      setNewCapstoneRubric('');
                      setGovSaveStatus('✅ New Capstone research pathway created!');
                      fetchDashboardData();
                      setTimeout(() => setGovSaveStatus(null), 3000);
                    } else {
                      alert(res.error || 'Failed to save Capstone track.');
                    }
                  });
                }}
                style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.375rem', background: '#10B981', color: '#FFFFFF', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                + Register Pathway
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
  );
}
