/**
 * Email via Nodemailer.
 *
 * Dev: Mailtrap sandbox (emails caught, never sent). Sandbox credentials in .env.
 * Prod: Brevo (real SMTP relay). API credentials in .env.
 *
 * Both use the same Nodemailer interface — just swap SMTP_* .env vars.
 */
import nodemailer from 'nodemailer';
import { badRequest } from '../utils/AppError.js';

let mailer = null;

function getMailer() {
  if (mailer) return mailer;

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM = 'noreply@ramakripaestate.com',
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw badRequest(
      'Email is not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS, and MAIL_FROM to backend/.env.'
    );
  }

  mailer = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: SMTP_PORT === '465',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return mailer;
}

/**
 * Send owner notification when an enquiry arrives.
 */
export async function notifyOwner(enquiry) {
  const mailer = getMailer();
  const { MAIL_FROM = 'noreply@ramakripaestate.com', ADMIN_EMAIL } = process.env;

  if (!ADMIN_EMAIL) {
    console.warn('[mail] ADMIN_EMAIL not set; owner notification not sent');
    return;
  }

  const html = `
    <h2>New Enquiry</h2>
    <p><strong>${enquiry.name}</strong> is interested in <strong>${enquiry.propertyTitle || 'a property'}</strong>.</p>
    <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold; width: 30%;">Phone</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${enquiry.phone}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Email</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${enquiry.email || '—'}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Interested in</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${enquiry.propertyTitle || '—'}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Budget</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${
          enquiry.budgetMin && enquiry.budgetMax
            ? `₹${enquiry.budgetMin} – ₹${enquiry.budgetMax}`
            : '—'
        }</td>
      </tr>
      ${enquiry.message ? `<tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Message</td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${enquiry.message}</td></tr>` : ''}
    </table>
    <p style="margin-top: 20px; color: #666; font-size: 0.9em;">
      Received: ${new Date(enquiry.createdAt).toLocaleString('en-IN')}
    </p>
  `;

  try {
    await mailer.sendMail({
      from: MAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `New enquiry: ${enquiry.propertyTitle || enquiry.name}`,
      html,
    });
  } catch (err) {
    console.error('[mail] Owner notification failed:', err.message);
  }
}

/**
 * Send auto-reply to the enquirer.
 */
export async function sendEnquirerReply(enquiry) {
  const mailer = getMailer();
  const { MAIL_FROM = 'noreply@ramakripaestate.com' } = process.env;

  if (!enquiry.email) return; // No email to reply to.

  const html = `
    <h2>Thank you for your interest</h2>
    <p>Hi <strong>${enquiry.name}</strong>,</p>
    <p>We've received your enquiry about <strong>${enquiry.propertyTitle || 'our properties'}</strong>.</p>
    <p>Our team will review your details and get back to you shortly on <strong>${enquiry.phone}</strong>.</p>
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;" />
    <p style="color: #666; font-size: 0.9em;">
      <strong>Rama Kripa Estates</strong><br/>
      Faridabad, Haryana<br/>
      <em>"Blessings in Every Address"</em>
    </p>
  `;

  try {
    await mailer.sendMail({
      from: MAIL_FROM,
      to: enquiry.email,
      subject: `We received your enquiry — Rama Kripa Estates`,
      html,
    });
  } catch (err) {
    console.error('[mail] Enquirer reply failed:', err.message);
  }
}
