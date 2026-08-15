'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserProgress } from '@/app/actions/progressActions';
import { LESSONS } from '@/lib/data';

export default function LessonPlayerRedirect() {
  const router = useRouter();

  useEffect(() => {
    fetchUserProgress().then(res => {
      if (res.success && res.progressMap) {
        // Find first lesson that is not completed
        const nextLesson = LESSONS.find(l => {
          const prog = res.progressMap[l.id];
          return !prog || prog.status !== 'completed';
        });
        const targetId = nextLesson ? nextLesson.id : 'L1';
        router.replace(`/lesson-player/${targetId}`);
      } else {
        router.replace('/lesson-player/L1');
      }
    });
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#050810', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8EEF8' }}>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-400)' }}>Loading active curriculum page...</div>
    </div>
  );
}
