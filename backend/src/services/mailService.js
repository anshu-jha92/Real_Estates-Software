/**
 * Email via Nodemailer over plain SMTP — nothing here is tied to one provider.
 *
 * Everything that varies lives in .env, so switching from the Mailtrap sandbox
 * (dev) to Gmail or Mailtrap Sending / Brevo (live) is a change of five values
 * and a restart, never a code change:
 *
 *   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS   where mail goes out
 *   MAIL_FROM      the address (or "Name <address>") mail is sent from
 *   NOTIFY_EMAIL   the human inbox that gets every new enquiry and every reply
 *                  a visitor sends back (falls back to ADMIN_EMAIL)
 *
 * Three mails are sent:
 *   notifyOwner        new enquiry -> owner      Reply-To: the visitor
 *   sendEnquirerReply  auto "we got it" -> visitor Reply-To: the owner
 *   sendOwnerReply     owner's answer -> visitor  Reply-To: the owner
 *
 * The Reply-To headers are what make the Gmail "Reply" button land in the right
 * inbox on both sides, whichever provider is behind SMTP_HOST.
 */
import nodemailer from 'nodemailer';
import { badRequest } from '../utils/AppError.js';

const BRAND = 'Rama Kripa Estates';
const TAGLINE = 'Blessings in Every Address';

let mailer = null;

function getMailer() {
  if (mailer) return mailer;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw badRequest(
      'Email is not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS and MAIL_FROM to the environment.'
    );
  }

  const port = parseInt(SMTP_PORT || '587', 10);
  // An enquiry sends two mails back to back, and Mailtrap's free sandbox takes
  // only 1 mail per 10 s (the rest bounce with "550 Too many emails per
  // second"). So: one connection, messages queued one per window. The window
  // is counted from when a send *starts*, hence the margin over 10 s. Live
  // providers (Gmail, Brevo, Mailtrap Sending) only cap per hour/day, so
  // there the window is a harmless second.
  const sandbox = /sandbox/i.test(SMTP_HOST);
  mailer = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    pool: true,
    maxConnections: 1,
    rateLimit: 1,
    rateDelta: sandbox ? 15_000 : 1_000,
  });

  return mailer;
}

/** The address visitors' mail should land in, and that replies are sent from. */
const ownerAddress = () => process.env.NOTIFY_EMAIL || process.env.ADMIN_EMAIL || '';

const fromAddress = () => process.env.MAIL_FROM || `${BRAND} <noreply@ramakripaestate.com>`;

/** Visitor-typed text goes into HTML mail; a stray < must not become markup. */
const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const nl2br = (value) => esc(value).replace(/\r?\n/g, '<br/>');

const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const budgetLine = (e) =>
  e.budgetMin && e.budgetMax
    ? `${money(e.budgetMin)} – ${money(e.budgetMax)}`
    : e.budgetMin
      ? `From ${money(e.budgetMin)}`
      : e.budgetMax
        ? `Up to ${money(e.budgetMax)}`
        : '';

const when = (d) =>
  new Date(d || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

const row = (label, value) =>
  value
    ? `<tr>
        <td style="padding:8px 12px 8px 0;border-bottom:1px solid #eee;color:#666;white-space:nowrap;vertical-align:top">${label}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#111">${value}</td>
      </tr>`
    : '';

const shell = (body) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#111;line-height:1.55">
    ${body}
    <p style="margin-top:28px;padding-top:14px;border-top:1px solid #eee;color:#666;font-size:13px">
      <strong style="color:#0F3D2E">${BRAND}</strong><br/>
      Faridabad, Haryana<br/>
      <em>${TAGLINE}</em>
    </p>
  </div>`;

/** A plain-text twin keeps the mail readable in every client and quotes cleanly on reply. */
const plain = (lines) => lines.filter(Boolean).join('\n');

/* ------------------------------------------------------------------ */
/* 1. New enquiry -> owner                                             */
/* ------------------------------------------------------------------ */

export async function notifyOwner(enquiry) {
  const to = ownerAddress();
  if (!to) {
    console.warn('[mail] NOTIFY_EMAIL not set; owner notification not sent');
    return;
  }
  const mailer = getMailer();

  const about = enquiry.propertyTitle || enquiry.interestedIn || 'a property';
  const html = shell(`
    <h2 style="margin:0 0 6px;color:#0F3D2E">New enquiry from ${esc(enquiry.name)}</h2>
    <p style="margin:0 0 18px;color:#444">Interested in <strong>${esc(about)}</strong></p>
    <table style="border-collapse:collapse;width:100%">
      ${row('Phone', `<a href="tel:${esc(enquiry.phone)}">${esc(enquiry.phone)}</a>`)}
      ${row('Email', enquiry.email ? `<a href="mailto:${esc(enquiry.email)}">${esc(enquiry.email)}</a>` : '<span style="color:#999">not given — call or WhatsApp</span>')}
      ${row('Property', esc(enquiry.propertyTitle))}
      ${row('Looking for', esc(enquiry.interestedIn))}
      ${row('Budget', esc(budgetLine(enquiry)))}
      ${row('Message', nl2br(enquiry.message))}
      ${row('Received', esc(when(enquiry.createdAt)))}
    </table>
    ${
      enquiry.email
        ? `<p style="margin-top:18px;color:#444">Hit <strong>Reply</strong> and your answer goes straight to ${esc(enquiry.name)}.</p>`
        : ''
    }
  `);

  const text = plain([
    `New enquiry from ${enquiry.name}`,
    `Interested in: ${about}`,
    '',
    `Phone: ${enquiry.phone}`,
    `Email: ${enquiry.email || 'not given'}`,
    enquiry.propertyTitle && `Property: ${enquiry.propertyTitle}`,
    enquiry.interestedIn && `Looking for: ${enquiry.interestedIn}`,
    budgetLine(enquiry) && `Budget: ${budgetLine(enquiry)}`,
    enquiry.message && `\nMessage:\n${enquiry.message}`,
    '',
    `Received: ${when(enquiry.createdAt)}`,
  ]);

  try {
    await mailer.sendMail({
      from: fromAddress(),
      to,
      // Reply in Gmail -> lands with the visitor, not with a noreply box.
      ...(enquiry.email ? { replyTo: `${enquiry.name} <${enquiry.email}>` } : {}),
      subject: `New enquiry: ${enquiry.name} — ${about}`,
      text,
      html,
    });
  } catch (err) {
    console.error('[mail] Owner notification failed:', err.message);
  }
}

/* ------------------------------------------------------------------ */
/* 2. Auto-acknowledgement -> visitor                                  */
/* ------------------------------------------------------------------ */

export async function sendEnquirerReply(enquiry) {
  if (!enquiry.email) return;
  const mailer = getMailer();
  const owner = ownerAddress();

  const about = enquiry.propertyTitle || 'our properties';
  const html = shell(`
    <h2 style="margin:0 0 12px;color:#0F3D2E">Thank you for your interest</h2>
    <p>Hi <strong>${esc(enquiry.name)}</strong>,</p>
    <p>We've received your enquiry about <strong>${esc(about)}</strong>.</p>
    <p>Our team will review your details and get back to you shortly on <strong>${esc(enquiry.phone)}</strong>.</p>
    <p style="color:#444">If you'd like to add anything, just reply to this email.</p>
  `);

  const text = plain([
    `Hi ${enquiry.name},`,
    '',
    `We've received your enquiry about ${about}.`,
    `Our team will review your details and get back to you shortly on ${enquiry.phone}.`,
    '',
    "If you'd like to add anything, just reply to this email.",
    '',
    `${BRAND} · Faridabad, Haryana · ${TAGLINE}`,
  ]);

  try {
    await mailer.sendMail({
      from: fromAddress(),
      to: `${enquiry.name} <${enquiry.email}>`,
      // A reply to the acknowledgement must reach a person, not the sending box.
      ...(owner ? { replyTo: owner } : {}),
      subject: `We received your enquiry — ${BRAND}`,
      text,
      html,
    });
  } catch (err) {
    console.error('[mail] Enquirer acknowledgement failed:', err.message);
  }
}

/* ------------------------------------------------------------------ */
/* 3. Owner's reply from the admin panel -> visitor                    */
/* ------------------------------------------------------------------ */

/**
 * Unlike the two above this is NOT fire-and-forget: the admin is waiting on
 * the result, so a failure is thrown for the route to report.
 */
export async function sendOwnerReply(enquiry, message, sentBy = '') {
  if (!enquiry.email) throw badRequest('This enquiry has no email address to reply to.');
  const mailer = getMailer();
  const owner = ownerAddress();

  const about = enquiry.propertyTitle || enquiry.interestedIn || 'your enquiry';
  const html = shell(`
    <p>Hi <strong>${esc(enquiry.name)}</strong>,</p>
    <div style="margin:14px 0 22px;white-space:normal">${nl2br(message)}</div>
    ${sentBy ? `<p style="color:#444">— ${esc(sentBy)}, ${BRAND}</p>` : ''}
    <div style="margin-top:22px;padding:12px 14px;background:#faf7f1;border-left:3px solid #C9A227;color:#555;font-size:13px">
      <div style="font-weight:600;margin-bottom:6px;color:#333">Your enquiry on ${esc(when(enquiry.createdAt))}</div>
      ${enquiry.propertyTitle ? `<div>Property: ${esc(enquiry.propertyTitle)}</div>` : ''}
      ${enquiry.message ? `<div style="margin-top:6px">${nl2br(enquiry.message)}</div>` : ''}
    </div>
  `);

  const text = plain([
    `Hi ${enquiry.name},`,
    '',
    message,
    '',
    sentBy ? `— ${sentBy}, ${BRAND}` : `— ${BRAND}`,
    '',
    `> Your enquiry on ${when(enquiry.createdAt)}`,
    enquiry.propertyTitle && `> Property: ${enquiry.propertyTitle}`,
    enquiry.message && `> ${enquiry.message.replace(/\r?\n/g, '\n> ')}`,
  ]);

  await mailer.sendMail({
    from: fromAddress(),
    to: `${enquiry.name} <${enquiry.email}>`,
    // Their answer comes back to the owner's inbox, not to a noreply address.
    ...(owner ? { replyTo: owner } : {}),
    subject: `Re: ${about} — ${BRAND}`,
    text,
    html,
  });
}
