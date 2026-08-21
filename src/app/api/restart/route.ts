import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== 'fingeniq_restart_secret_2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  setTimeout(() => {
    console.log('Restart triggered via /api/restart. Exiting process for systemd reload...');
    process.exit(0);
  }, 200);

  return NextResponse.json({ success: true, message: 'Server process exiting for systemd restart...' });
}
