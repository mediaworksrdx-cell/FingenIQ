import { NextResponse } from 'next/server';
import { getArticleBySlug, updateArticle, deleteArticle, canPostArticle } from '@/lib/db';
import { getAuthUser } from '@/lib/apiAuth';
import type { CommunityArticle } from '@/lib/types';

// GET /api/community/articles/[slug] — get single article (public)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = getArticleBySlug(slug) as CommunityArticle | undefined;
    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, article });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/community/articles/[slug] — update article (author or admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = await params;
    const article = getArticleBySlug(slug) as CommunityArticle | undefined;
    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    // Only the author or admin can edit
    if (article.author_id !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    updateArticle(article.id, {
      title: body.title,
      summary: body.summary,
      body: body.content,
      company: body.company,
      sector: body.sector,
      concept: body.concept,
      rating: body.rating,
      score: body.score,
      read_time: body.read_time,
      linked_companies: body.linked_companies ? JSON.stringify(body.linked_companies) : undefined,
      published: body.published !== undefined ? (body.published ? 1 : 0) : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/community/articles/[slug] — delete article (author or admin)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = await params;
    const article = getArticleBySlug(slug) as CommunityArticle | undefined;
    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    if (article.author_id !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    deleteArticle(article.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
