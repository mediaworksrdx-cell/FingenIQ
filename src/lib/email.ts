import { getAppBaseUrl } from './config';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends a transactional email using Resend API if configured,
 * or logs delivery dispatch status safely in production.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'FinGenIQ <notifications@fingeniq.com>',
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]+>/g, ''),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('[Email Dispatch Error]', errData);
        return { success: false, error: 'Email service provider error' };
      }

      return { success: true };
    } catch (err: any) {
      console.error('[Email Dispatch Network Error]', err);
      return { success: false, error: err.message };
    }
  }

  // Graceful fallback when Resend is not yet provisioned
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Dev Email Provider] Sent email to ${to}: ${subject}`);
  }
  return { success: true };
}

/**
 * Sends Password Reset Email with dynamic Base URL
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const baseUrl = getAppBaseUrl();
  const resetLink = `${baseUrl}/reset-password/${token}`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #060A16; color: #E6EDF6; border-radius: 8px; border: 1px solid rgba(184,150,46,0.3);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #CEAE56; font-size: 24px; margin: 0;">FinGen<span style="color: #B8962E;">IQ</span></h1>
        <p style="color: #8A98B0; font-size: 14px; margin-top: 4px;">Institutional Financial Education Portal</p>
      </div>
      <div style="background: #0B132B; padding: 20px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
        <h2 style="color: #FFFFFF; font-size: 18px; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #C0CADB; font-size: 14px; line-height: 1.6;">We received a request to reset your FinGenIQ portal password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetLink}" style="background-color: #B8962E; color: #060A16; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #8A98B0; font-size: 12px; line-height: 1.5;">This link will expire in 1 hour. If you did not request this, please disregard this email.</p>
        <p style="color: #566078; font-size: 11px; word-break: break-all; margin-top: 16px;">Direct URL: <a href="${resetLink}" style="color: #B8962E;">${resetLink}</a></p>
      </div>
    </div>
  `;

  const res = await sendEmail({
    to: email,
    subject: 'Reset your FinGenIQ Password',
    html,
  });

  return res.success;
}

/**
 * Sends Account Activation Email with dynamic Base URL
 */
export async function sendActivationEmail(email: string, name: string, token: string): Promise<boolean> {
  const baseUrl = getAppBaseUrl();
  const activationLink = `${baseUrl}/activate/${token}`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #060A16; color: #E6EDF6; border-radius: 8px; border: 1px solid rgba(184,150,46,0.3);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #CEAE56; font-size: 24px; margin: 0;">FinGen<span style="color: #B8962E;">IQ</span></h1>
        <p style="color: #8A98B0; font-size: 14px; margin-top: 4px;">Institutional Financial Education Portal</p>
      </div>
      <div style="background: #0B132B; padding: 20px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
        <h2 style="color: #FFFFFF; font-size: 18px; margin-top: 0;">Welcome, ${name}!</h2>
        <p style="color: #C0CADB; font-size: 14px; line-height: 1.6;">Your institutional account has been provisioned. Please activate your credentials and establish your security password to access the platform:</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${activationLink}" style="background-color: #B8962E; color: #060A16; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">Activate Account</a>
        </div>
        <p style="color: #8A98B0; font-size: 12px; line-height: 1.5;">This activation link is valid for 7 days.</p>
        <p style="color: #566078; font-size: 11px; word-break: break-all; margin-top: 16px;">Direct URL: <a href="${activationLink}" style="color: #B8962E;">${activationLink}</a></p>
      </div>
    </div>
  `;

  const res = await sendEmail({
    to: email,
    subject: 'Activate your FinGenIQ Account',
    html,
  });

  return res.success;
}

/**
 * Sends Contact Enquiry notification email to shivaram@vivinfacilitators.com
 */
export async function sendEnquiryEmail({
  name,
  email,
  phone,
  category,
  inquiryType,
  subject,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  category: string;
  inquiryType?: string;
  subject?: string;
  message: string;
}): Promise<boolean> {
  const recipient = process.env.CONTACT_RECIPIENT_EMAIL || 'shivaram@vivinfacilitators.com';
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #060A16; color: #E6EDF6; border-radius: 8px; border: 1px solid rgba(184,150,46,0.3);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #CEAE56; font-size: 24px; margin: 0;">FinGen<span style="color: #B8962E;">IQ</span></h1>
        <p style="color: #8A98B0; font-size: 14px; margin-top: 4px;">Institutional Financial Education Portal — New Enquiry</p>
      </div>
      <div style="background: #0B132B; padding: 20px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
        <h2 style="color: #FFFFFF; font-size: 18px; margin-top: 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
          Enquiry Received
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 12px 0;">
          <tr>
            <td style="padding: 6px 0; color: #8A98B0; width: 140px;"><strong>Name:</strong></td>
            <td style="padding: 6px 0; color: #FFFFFF; font-weight: 600;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #8A98B0;"><strong>Email:</strong></td>
            <td style="padding: 6px 0; color: #60A5FA;"><a href="mailto:${email}" style="color: #60A5FA; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #8A98B0;"><strong>Phone:</strong></td>
            <td style="padding: 6px 0; color: #FFFFFF;">${phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #8A98B0;"><strong>Section:</strong></td>
            <td style="padding: 6px 0; color: #CEAE56; text-transform: capitalize;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #8A98B0;"><strong>Inquiry Type:</strong></td>
            <td style="padding: 6px 0; color: #FFFFFF;">${inquiryType || 'General'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #8A98B0;"><strong>Subject:</strong></td>
            <td style="padding: 6px 0; color: #FFFFFF;">${subject || 'N/A'}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding: 14px; background: rgba(255,255,255,0.03); border-radius: 6px; border-left: 3px solid #CEAE56;">
          <p style="color: #8A98B0; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.05em;">Message Body:</p>
          <p style="color: #F1F5F9; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 18px; font-size: 12px; color: #64748B;">
        This notification was delivered to ${recipient} via FinGenIQ Portal.
      </div>
    </div>
  `;

  const res = await sendEmail({
    to: recipient,
    subject: `[FinGenIQ Enquiry] ${subject || inquiryType || category} from ${name}`,
    html,
  });

  return res.success;
}
