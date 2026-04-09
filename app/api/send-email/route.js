import { NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

async function getAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

function buildMimeMessage({ to, subject, htmlBody, fromName, fromEmail }) {
  const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
  const boundary = "nsp_boundary_" + Date.now();

  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    htmlBody.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&"),
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    htmlBody,
    ``,
    `--${boundary}--`,
  ];

  const message = messageParts.join("\r\n");

  // Base64url encode
  const encoded = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return encoded;
}

export async function POST(request) {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
      return NextResponse.json(
        { error: "Gmail credentials not configured. Add GOOGLE_REFRESH_TOKEN to Vercel env vars." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { to, subject, htmlBody, fromName } = body;

    if (!to || !subject || !htmlBody) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, htmlBody" },
        { status: 400 }
      );
    }

    // Get fresh access token
    const accessToken = await getAccessToken();

    // Get sender email from Gmail profile
    const profileRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/profile",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const profile = await profileRes.json();
    const fromEmail = profile.emailAddress || "nicosalgadophoto@gmail.com";

    // Build MIME message
    const rawMessage = buildMimeMessage({
      to,
      subject,
      htmlBody,
      fromName: fromName || "Nico Salgado Photography",
      fromEmail,
    });

    // Send via Gmail API
    const sendRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: rawMessage }),
      }
    );

    const sendData = await sendRes.json();

    if (!sendRes.ok) {
      console.error("Gmail API error:", JSON.stringify(sendData, null, 2));
      const errorMsg =
        sendData.error?.message || "Failed to send email";
      return NextResponse.json({ error: errorMsg }, { status: sendRes.status });
    }

    return NextResponse.json({
      success: true,
      messageId: sendData.id,
      threadId: sendData.threadId,
    });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
