import { NextResponse } from 'next/server';
import { getPublishedArticles, getAllArticles, createArticle, canPostArticle, db } from '@/lib/db';
import { getAuthUser } from '@/lib/apiAuth';

// GET /api/community/articles — list published articles (public)
export async function GET() {
  try {
    const articles = getPublishedArticles();
    return NextResponse.json({ success: true, articles });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/community/articles — create article (admin/employee only)
export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (!canPostArticle(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { title, summary, content, company, sector, concept, rating, score, read_time, linked_companies, published } = body;

    if (!title || !summary || !content) {
      return NextResponse.json({ success: false, error: 'Title, summary, and content are required' }, { status: 400 });
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80) + '-' + Date.now().toString(36);

    // Get author bio from user profile or use empty string
    const authorBio = body.author_bio || '';

    const result = createArticle({
      slug,
      title,
      summary,
      body: content,
      author_id: user.userId,
      author_name: user.name,
      author_bio: authorBio,
      company: company || '',
      sector: sector || '',
      concept: concept || '',
      rating: rating || '',
      score: score || 0,
      read_time: read_time || 5,
      linked_companies: linked_companies ? JSON.stringify(linked_companies) : '[]',
      published: published ? 1 : 0,
    });

    return NextResponse.json({ success: true, slug, id: result.lastInsertRowid });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
