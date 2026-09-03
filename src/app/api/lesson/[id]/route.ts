import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { LESSONS } from '@/lib/data';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const defaultLesson = LESSONS.find(l => l.id === id) || LESSONS[0];

    // Check DB override
    const override = db.prepare('SELECT * FROM lesson_overrides WHERE lessonId = ?').get(id) as any;

    if (override) {
      let quiz = defaultLesson.quiz;
      if (override.quizJson) {
        try {
          quiz = JSON.parse(override.quizJson);
        } catch {
          quiz = defaultLesson.quiz;
        }
      }

      let galleryImages = defaultLesson.galleryImages;
      if (override.galleryImagesJson) {
        try {
          galleryImages = JSON.parse(override.galleryImagesJson);
        } catch {
          galleryImages = defaultLesson.galleryImages;
        }
      }

      let steps = defaultLesson.steps;
      if (override.stepsJson) {
        try {
          steps = JSON.parse(override.stepsJson);
        } catch {
          steps = defaultLesson.steps;
        }
      }

      const mergedLesson = {
        ...defaultLesson,
        title: override.title || defaultLesson.title,
        subtitle: override.subtitle || defaultLesson.subtitle,
        duration: override.duration || defaultLesson.duration,
        level: override.level || defaultLesson.level,
        summary: override.summary || defaultLesson.summary,
        contentMarkdown: override.contentMarkdown || defaultLesson.contentMarkdown,
        youtubeId: override.youtubeId || defaultLesson.youtubeId,
        pdfPath: override.pdfPath || defaultLesson.pdfPath,
        galleryImages,
        quiz,
        steps,
      };

      return NextResponse.json({ success: true, lesson: mergedLesson });
    }

    return NextResponse.json({ success: true, lesson: defaultLesson });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
