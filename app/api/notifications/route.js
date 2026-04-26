import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// ── Gmail helpers ─────────────────────────────────────────────────────────────
async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || "Token refresh failed");
  return data.access_token;
}

async function sendEmail(token, { to, subject, html, fromName = "Nico Salgado Photography" }) {
  const profileRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const profile = await profileRes.json();
  const fromEmail = profile.emailAddress || "nicosalgadophoto@gmail.com";
  const from = `${fromName} <${fromEmail}>`;
  const boundary = "nsp_notif_" + Date.now();

  const mime = [
    `From: ${from}`, `To: ${to}`, `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`, ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`, ``,
    html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " "),
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`, ``,
    html,
    `--${boundary}--`,
  ].join("\r\n");

  const raw = Buffer.from(mime).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Failed to send email");
  }
  return true;
}

// ── Date helpers ──────────────────────────────────────────────────────────────
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - now) / 86400000);
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = daysUntil(dateStr);
  return d === null ? null : -d;
}

function fmtDate(dateStr) {
  if (!dateStr) return "TBD";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

// ── Email templates ───────────────────────────────────────────────────────────
function sessionReminderHtml({ clientName, sessionTitle, sessionDate, sessionTime, location, balance }) {
  return `
<div style="font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e4ddd2;border-radius:12px;overflow:hidden;">
  <div style="background:#0c0d0f;padding:24px 32px;">
    <div style="color:#d4a853;font-size:20px;font-weight:800;letter-spacing:-.02em;">Nico Salgado Photography</div>
  </div>
  <div style="padding:32px;">
    <h2 style="font-size:22px;font-weight:800;color:#1a1a1a;margin:0 0 8px;">Your session is coming up! 📅</h2>
    <p style="color:#555;font-size:15px;margin:0 0 24px;">Hi ${clientName}, just a friendly reminder about your upcoming session.</p>
    <div style="background:#f7f5f0;border-radius:8px;padding:20px;margin-bottom:24px;">
      <div style="font-size:13px;color:#888;margin-bottom:4px;">SESSION</div>
      <div style="font-size:18px;font-weight:700;color:#1a1a1a;margin-bottom:12px;">${sessionTitle}</div>
      <div style="font-size:14px;color:#444;margin-bottom:6px;">📅 ${fmtDate(sessionDate)}</div>
      ${sessionTime ? `<div style="font-size:14px;color:#444;margin-bottom:6px;">⏰ ${sessionTime}</div>` : ""}
      ${location ? `<div style="font-size:14px;color:#444;">📍 ${location}</div>` : ""}
    </div>
    ${balance > 0 ? `
    <div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin-bottom:24px;">
      <div style="font-size:14px;font-weight:700;color:#92400e;">💳 Balance Due: $${balance.toFixed(2)}</div>
      <div style="font-size:13px;color:#92400e;margin-top:4px;">Your remaining balance is due before the session. Please reach out if you have any questions.</div>
    </div>` : ""}
    <p style="color:#555;font-size:14px;margin:0;">Looking forward to working with you! If you need to make any changes, please reach out as soon as possible.</p>
  </div>
  <div style="background:#f7f5f0;padding:16px 32px;text-align:center;font-size:12px;color:#888;">
    Nico Salgado Photography &bull; Farmington Hills, MI
  </div>
</div>`;
}

function quoteFollowUpHtml({ clientName, quoteName, quoteTotal, daysSent }) {
  return `
<div style="font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e4ddd2;border-radius:12px;overflow:hidden;">
  <div style="background:#0c0d0f;padding:24px 32px;">
    <div style="color:#d4a853;font-size:20px;font-weight:800;letter-spacing:-.02em;">Nico Salgado Photography</div>
  </div>
  <div style="padding:32px;">
    <h2 style="font-size:22px;font-weight:800;color:#1a1a1a;margin:0 0 8px;">Just checking in 👋</h2>
    <p style="color:#555;font-size:15px;margin:0 0 24px;">Hi ${clientName}, I wanted to follow up on the quote I sent ${daysSent} days ago. I'd love to get you booked!</p>
    <div style="background:#f7f5f0;border-radius:8px;padding:20px;margin-bottom:24px;">
      <div style="font-size:13px;color:#888;margin-bottom:4px;">QUOTE</div>
      <div style="font-size:16px;font-weight:700;color:#1a1a1a;">${quoteName}</div>
      <div style="font-size:14px;color:#d4a853;font-weight:700;margin-top:6px;">$${quoteTotal.toFixed(2)}</div>
    </div>
    <p style="color:#555;font-size:14px;margin:0 0 16px;">Do you have any questions or would like to make any changes? I'm happy to chat or adjust the package to fit your needs.</p>
    <p style="color:#555;font-size:14px;margin:0;">Dates are booking up — let me know where you're at!</p>
  </div>
  <div style="background:#f7f5f0;padding:16px 32px;text-align:center;font-size:12px;color:#888;">
    Nico Salgado Photography &bull; Farmington Hills, MI
  </div>
</div>`;
}

function paymentReminderHtml({ clientName, sessionTitle, sessionDate, balance, invoiceNumber }) {
  return `
<div style="font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e4ddd2;border-radius:12px;overflow:hidden;">
  <div style="background:#0c0d0f;padding:24px 32px;">
    <div style="color:#d4a853;font-size:20px;font-weight:800;letter-spacing:-.02em;">Nico Salgado Photography</div>
  </div>
  <div style="padding:32px;">
    <h2 style="font-size:22px;font-weight:800;color:#1a1a1a;margin:0 0 8px;">Balance due reminder 💳</h2>
    <p style="color:#555;font-size:15px;margin:0 0 24px;">Hi ${clientName}, your session is coming up and the remaining balance is due before we begin.</p>
    <div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;padding:20px;margin-bottom:24px;">
      <div style="font-size:24px;font-weight:800;color:#92400e;">$${balance.toFixed(2)} due</div>
      <div style="font-size:13px;color:#92400e;margin-top:4px;">
        ${invoiceNumber ? `Invoice ${invoiceNumber} &bull; ` : ""}Session: ${fmtDate(sessionDate)}
      </div>
    </div>
    <p style="color:#555;font-size:14px;margin:0 0 16px;">You can pay via Zelle (text Nico to pay) or via the payment link in your invoice email.</p>
    <p style="color:#555;font-size:14px;margin:0;">Questions? Just reply to this email.</p>
  </div>
  <div style="background:#f7f5f0;padding:16px 32px;text-align:center;font-size:12px;color:#888;">
    Nico Salgado Photography &bull; Farmington Hills, MI
  </div>
</div>`;
}

// ── Main handler ──────────────────────────────────────────────────────────────
// POST body: { type: "session_reminder"|"quote_followup"|"payment_reminder"|"preview", workspaceId?, dryRun? }
// GET (cron): runs all checks automatically

async function runNotifications({ type, workspaceId, dryRun = false }) {
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const token = await getAccessToken();
  const results = [];

  // Load workspaces
  let query = sb.from("crm_workspaces").select("id, client_name, client_email, event_date, stage, snapshot");
  if (workspaceId) query = query.eq("id", workspaceId);
  const { data: workspaces, error } = await query;
  if (error) throw new Error("Supabase error: " + error.message);

  for (const ws of workspaces || []) {
    const snap = ws.snapshot || {};
    const schedule = snap.schedule || [];
    const quotes = snap.quotes || [];
    const payments = snap.payments || [];
    const clientName = ws.client_name || "there";
    const clientEmail = ws.client_email;

    if (!clientEmail) continue;

    // ── SESSION REMINDERS (48h and 7 days before) ─────────────────────────
    if (!type || type === "session_reminder") {
      for (const ev of schedule) {
        if (ev.status === "Completed" || ev.status === "Cancelled") continue;
        const days = daysUntil(ev.date);
        const isReminder = days === 1 || days === 2 || days === 7; // 48h or 7 days
        if (isReminder || (type === "session_reminder" && workspaceId)) {
          // Calculate outstanding balance
          const accepted = quotes.filter(q => q.status === "Accepted");
          const totalRevenue = accepted.reduce((s, q) => s + (q.total || 0), 0);
          const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0);
          const balance = Math.max(0, totalRevenue - totalPaid);

          const subject = days <= 2
            ? `Reminder: Your session is tomorrow — ${ev.title}`
            : `Your session is in 1 week — ${ev.title}`;

          if (!dryRun) {
            await sendEmail(token, {
              to: clientEmail,
              subject,
              html: sessionReminderHtml({
                clientName, sessionTitle: ev.title,
                sessionDate: ev.date, sessionTime: ev.time,
                location: ev.location, balance,
              }),
            });
          }
          results.push({ type: "session_reminder", client: clientName, email: clientEmail, event: ev.title, daysUntil: days, sent: !dryRun });
        }
      }
    }

    // ── QUOTE FOLLOW-UPS (3, 7, 14 days after sent) ───────────────────────
    if (!type || type === "quote_followup") {
      for (const q of quotes) {
        if (q.status !== "Sent") continue;
        const sentDays = daysSince(q.updatedAt?.split("T")[0] || q.createdAt?.split("T")[0]);
        const isFollowUp = sentDays === 3 || sentDays === 7 || sentDays === 14;
        if (isFollowUp || (type === "quote_followup" && workspaceId)) {
          const subject = `Following up on your photography quote — ${q.eventName || "NSP"}`;
          if (!dryRun) {
            await sendEmail(token, {
              to: clientEmail,
              subject,
              html: quoteFollowUpHtml({
                clientName,
                quoteName: q.eventName || q.quoteNumberLabel || "Your Quote",
                quoteTotal: q.total || 0,
                daysSent: sentDays || 0,
              }),
            });
          }
          results.push({ type: "quote_followup", client: clientName, email: clientEmail, quote: q.eventName, daysSent: sentDays, sent: !dryRun });
        }
      }
    }

    // ── PAYMENT REMINDERS (7 days before session, balance > 0) ───────────
    if (!type || type === "payment_reminder") {
      const accepted = quotes.filter(q => q.status === "Accepted");
      const totalRevenue = accepted.reduce((s, q) => s + (q.total || 0), 0);
      const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0);
      const balance = Math.max(0, totalRevenue - totalPaid);

      if (balance > 0) {
        for (const ev of schedule) {
          if (ev.status === "Completed") continue;
          const days = daysUntil(ev.date);
          const isReminder = days === 7 || days === 3;
          if (isReminder || (type === "payment_reminder" && workspaceId)) {
            const subject = `Balance due before your session — $${balance.toFixed(2)}`;
            if (!dryRun) {
              await sendEmail(token, {
                to: clientEmail,
                subject,
                html: paymentReminderHtml({
                  clientName, sessionTitle: ev.title,
                  sessionDate: ev.date, balance,
                  invoiceNumber: null,
                }),
              });
            }
            results.push({ type: "payment_reminder", client: clientName, email: clientEmail, balance, daysUntil: days, sent: !dryRun });
            break; // one payment reminder per workspace
          }
        }
      }
    }
  }

  return results;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const results = await runNotifications(body);
    return NextResponse.json({ success: true, sent: results.length, results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET — called by Vercel Cron daily
export async function GET(request) {
  // Verify cron secret to prevent unauthorized calls
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const results = await runNotifications({ dryRun: false });
    return NextResponse.json({ success: true, sent: results.length, results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
