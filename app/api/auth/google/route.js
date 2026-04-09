import { NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const action = searchParams.get("action");

  // Step 1: Redirect to Google OAuth consent screen
  if (action === "login" || (!code && !action)) {
    const redirectUri = new URL("/api/auth/google", request.url).origin + "/api/auth/google";
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/gmail.send",
      access_type: "offline",
      prompt: "consent",
    });
    return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  }

  // Step 2: Exchange code for tokens
  if (code) {
    const redirectUri = new URL("/api/auth/google", request.url).origin + "/api/auth/google";

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: "Failed to exchange code", details: tokens },
        { status: 400 }
      );
    }

    // Show the refresh token so user can copy it to Vercel env vars
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>NSP Gmail Setup Complete</title>
  <style>
    body { font-family: 'DM Sans', system-ui, sans-serif; background: #0e0f11; color: #e8e6e3; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #191b1e; border: 1px solid #2a2d31; border-radius: 12px; padding: 32px; max-width: 600px; width: 100%; }
    h1 { color: #d4a853; font-size: 20px; margin: 0 0 8px; }
    p { color: #9b9a97; font-size: 14px; line-height: 1.6; margin: 0 0 20px; }
    .token-box { background: #0e0f11; border: 1px solid #2a2d31; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 12px; word-break: break-all; color: #34d399; margin-bottom: 16px; }
    .label { font-size: 12px; font-weight: 600; color: #d4a853; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
    .steps { font-size: 13px; color: #9b9a97; line-height: 1.8; }
    .steps strong { color: #e8e6e3; }
    .success { color: #34d399; font-size: 14px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="success">✓ Gmail Connected Successfully</div>
    <h1>Save Your Refresh Token</h1>
    <p>Copy the token below and add it as an environment variable in Vercel. This is a one-time setup.</p>
    
    <div class="label">GOOGLE_REFRESH_TOKEN</div>
    <div class="token-box">${tokens.refresh_token || "No refresh token returned — try again with action=login"}</div>
    
    <div class="steps">
      <strong>Next steps:</strong><br>
      1. Copy the token above<br>
      2. Go to Vercel → Settings → Environment Variables<br>
      3. Add: <strong>GOOGLE_REFRESH_TOKEN</strong> = (paste token)<br>
      4. Redeploy the app<br>
      5. You can now send emails from the CRM!
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
