import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// Allowed MIME types / extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.svg', '.png', '.jpg', '.jpeg', '.webp'];

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate admin via session cookie
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const session = db.prepare('SELECT userId FROM sessions WHERE id = ?').get(token) as any;
    if (!session) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(session.userId) as any;
    if (!user || (user.role !== 'admin' && user.role !== 'employee' && user.role !== 'teacher')) {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const lessonId = ((formData.get('lessonId') as string) || 'L1').trim();
    const uploadType = ((formData.get('type') as string) || 'slide').trim().toLowerCase();

    // Check for single or multiple files
    let rawFiles: File[] = [];
    const multiFiles = formData.getAll('files') as File[];
    if (multiFiles && multiFiles.length > 0) {
      rawFiles = multiFiles;
    }
    const singleFile = formData.get('file') as File | null;
    if (singleFile && !rawFiles.includes(singleFile)) {
      rawFiles.unshift(singleFile);
    }

    if (rawFiles.length === 0) {
      return NextResponse.json({ success: false, error: 'No file provided for upload.' }, { status: 400 });
    }

    // Base public directory
    const publicDir = path.resolve(process.cwd(), 'public');
    const uploadedUrls: string[] = [];

    for (const file of rawFiles) {
      if (!file.name) continue;

      const originalName = file.name;
      const ext = path.extname(originalName).toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json({
          success: false,
          error: `File format ${ext} is not allowed. Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}`
        }, { status: 400 });
      }

      // Safe clean filename
      const baseCleanName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeFileName = `${baseCleanName}${ext}`;

      let targetSubDir: string;
      let targetPublicUrl: string;

      if (uploadType === 'pdf') {
        // PDF stored under public/lessons/
        targetSubDir = path.join(publicDir, 'lessons');
        targetPublicUrl = `/lessons/${safeFileName}`;
      } else {
        // Slides and SVGs stored under public/lessons/<lessonId>/
        targetSubDir = path.join(publicDir, 'lessons', lessonId);
        targetPublicUrl = `/lessons/${lessonId}/${safeFileName}`;
      }

      // Ensure directory exists
      if (!fs.existsSync(targetSubDir)) {
        fs.mkdirSync(targetSubDir, { recursive: true });
      }

      const filePath = path.join(targetSubDir, safeFileName);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.promises.writeFile(filePath, buffer);

      uploadedUrls.push(targetPublicUrl);
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0] || '',
      urls: uploadedUrls,
      message: `Uploaded ${uploadedUrls.length} file(s) successfully.`
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Upload failed' }, { status: 500 });
  }
}
