import { NextResponse } from 'next/server';
import { getArticleBySlug, getArticleComments, addComment } from '@/lib/db';
import { getAuthUser } from '@/lib/apiAuth';
import type { CommunityArticle } from '@/lib/types';

// GET /api/community/articles/[slug]/comments — get comments (public)
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
    const comments = getArticleComments(article.id);
    return NextResponse.json({ success: true, comments });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/community/articles/[slug]/comments — add comment (authenticated users)
export async function POST(
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

    const body = await request.json();
    if (!body.text || !body.text.trim()) {
      return NextResponse.json({ success: false, error: 'Comment text is required' }, { status: 400 });
    }

    addComment(article.id, user.userId, user.name, body.text.trim());
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
