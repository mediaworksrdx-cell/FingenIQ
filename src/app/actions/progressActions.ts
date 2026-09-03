'use server';

import { 
  getCurrentUserId, 
  getLessonProgress, 
  updateStepProgress, 
  submitLessonScore,
  aggregateUserProgress,
  getUserCertification,
  generateCertificate,
  verifyCertificate,
  getUserCertificates,
  getUserRecentActivity
} from '@/lib/progress';
import { revalidatePath } from 'next/cache';

export async function fetchUserProgress() {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: 'Unauthorized' };
  
  try {
    const progressMap = await getLessonProgress(userId);
    const aggregate = await aggregateUserProgress(userId);
    const certification = await getUserCertification(userId);
    const certificates = getUserCertificates(userId);
    const recentActivity = await getUserRecentActivity(userId);
    
    return {
      success: true,
      progressMap,
      aggregate,
      certification,
      certificates,
      recentActivity
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveStepProgress(lessonId: string, stepIndex: number) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: 'Unauthorized' };
  
  try {
    await updateStepProgress(userId, lessonId, stepIndex);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function submitQuizScore(lessonId: string, score: number) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: 'Unauthorized' };
  
  try {
    await submitLessonScore(userId, lessonId, score);
    revalidatePath('/lessons');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function issueCertificate(trackId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: 'Unauthorized' };
  
  try {
    const cert = await getUserCertification(userId);
    if (!cert.eligible) {
      return { success: false, error: 'Not eligible for certification yet.' };
    }
    
    const hash = await generateCertificate(userId, trackId);
    revalidatePath('/certification');
    return { success: true, certificateHash: hash };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function verifyCertificateAction(hash: string) {
  try {
    const cert = verifyCertificate(hash);
    if (!cert) return { success: false, error: 'Certificate not found or invalid.' };
    return { success: true, certificate: cert };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
