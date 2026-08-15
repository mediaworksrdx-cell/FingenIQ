import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const oauthStateCookie = cookieStore.get('oauth_state');

  if (!code || !state || !oauthStateCookie || oauthStateCookie.value !== state) {
    return NextResponse.redirect(new URL('/community?error=invalid_state', request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/community?error=auth_failed', request.url));
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin}/api/auth/google/callback`;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      throw new Error('Failed to fetch tokens');
    }

    const tokens = await tokenRes.json();

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoRes.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userInfo = await userInfoRes.json();

    const sessionId = crypto.randomBytes(32).toString('hex');
    const userData = {
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
    };
    
    const payloadStr = `${sessionId}.${Buffer.from(JSON.stringify(userData)).toString('base64')}`;
    const base64payload = Buffer.from(payloadStr).toString('base64');
    
    const secret = process.env.COMMUNITY_SESSION_SECRET || 'dev-secret-change-me';
    const hmac = crypto.createHmac('sha256', secret);
    const signature = hmac.update(base64payload).digest('hex');
    
    const cookieValue = `${base64payload}.${signature}`;

    (await cookies()).delete('oauth_state');
    (await cookies()).set('community_session', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.redirect(new URL('/community', request.url));
  } catch (error) {
    console.error('OAuth Error:', error);
    return NextResponse.redirect(new URL('/community?error=auth_failed', request.url));
  }
}
