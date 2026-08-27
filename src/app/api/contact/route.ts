import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendEnquiryEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, category, inquiryType, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = phone ? String(phone).trim() : null;
    const cleanCategory = category ? String(category).trim() : 'general';
    const cleanInquiryType = inquiryType ? String(inquiryType).trim() : null;
    const cleanSubject = subject ? String(subject).trim() : null;
    const cleanMessage = String(message).trim();
    const recipient = process.env.CONTACT_RECIPIENT_EMAIL || 'shivaram@vivinfacilitators.com';

    // 1. Save to Database
    const stmt = db.prepare(`
      INSERT INTO enquiries (name, email, phone, category, inquiryType, subject, message, recipient, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', datetime('now'))
    `);
    const info = stmt.run(
      cleanName,
      cleanEmail,
      cleanPhone,
      cleanCategory,
      cleanInquiryType,
      cleanSubject,
      cleanMessage,
      recipient
    );

    // 2. Dispatch Email Notification to shivaram@vivinfacilitators.com
    let emailSent = false;
    try {
      emailSent = await sendEnquiryEmail({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || undefined,
        category: cleanCategory,
        inquiryType: cleanInquiryType || undefined,
        subject: cleanSubject || undefined,
        message: cleanMessage,
      });
    } catch (emailErr) {
      console.error('[Enquiry Email Dispatch Failed]', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry submitted successfully.',
      enquiryId: info.lastInsertRowid,
      recipient,
      emailDispatched: emailSent,
    });
  } catch (err: any) {
    console.error('[Contact POST Error]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const enquiries = db.prepare('SELECT * FROM enquiries ORDER BY id DESC LIMIT 50').all();
    return NextResponse.json({
      success: true,
      count: enquiries.length,
      recipient: process.env.CONTACT_RECIPIENT_EMAIL || 'shivaram@vivinfacilitators.com',
      enquiries,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
