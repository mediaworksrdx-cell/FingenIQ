import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  (await cookies()).delete('community_session');
  return NextResponse.redirect(new URL('/community', request.url));
}
