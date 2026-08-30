// Re:Market — send-verification-otp Edge Function
//
// Kiến trúc:  Frontend
//                 ↓
//              Express server (server/auth-register.ts)
//                 ↓ (POST JSON { email, verifyUrl, expiresInHours }, Authorization: Bearer)
//              === Supabase Edge Function này ===
//                 ↓
//              Resend → User email
//
// Mục đích: gửi email xác thực bằng MAGIC LINK qua Resend mà KHÔNG expose
// RESEND_API_KEY ra frontend/Vercel. RESEND_API_KEY + EMAIL_FROM được đọc từ
// Supabase Secret tại runtime.
//
// (Tên function giữ nguyên `send-verification-otp` để khỏi đổi URL/edge function;
// contract của body đã chuyển sang gửi LINK, không còn gửi mã OTP.)
//
// Bảo mật:
//   - RESEND_API_KEY chỉ tồn tại ở Supabase Secret, không hardcode.
//   - Nếu thiếu RESEND_API_KEY (misconfig) -> trả lỗi rõ ràng, KHÔNG fallback
//     về việc lộ link/OTP và KHÔNG ghi link/OTP vào log.
//   - Chỉ trả về id/status cho caller; không trả lại nội dung email.

import { Resend } from "npm:resend@4.5.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
// Sender — domain hoangvuvan.xyz đã được Resend verify.
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "REMarket <verify@hoangvuvan.xyz>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Chỉ chấp nhận URL http(s) — tránh link giả mạo (javascript:, data:...).
function isValidVerifyUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function buildVerifyLinkEmailHtml(opts: { verifyUrl: string; expiresInHours: number }): string {
  const { verifyUrl, expiresInHours } = opts;
  const safeUrl = escapeHtml(verifyUrl);
  // Responsive inline-style email — hoạt động trên mobile/desktop.
  return `
  <!DOCTYPE html>
  <html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Hiragino Sans','Yu Gothic',Meiryo,sans-serif; -webkit-text-size-adjust:100%;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(15,23,42,0.08);">
            <!-- Header / Logo -->
            <tr>
              <td style="background-color:#0f172a; padding:22px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <span style="color:#ffffff; font-size:20px; font-weight:800; letter-spacing:0.5px;">Re:Market</span>
                      <span style="color:#94a3b8; font-size:12px; margin-left:6px;">/ 中古品に、もう一度価値を。</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:28px 24px;">
                <h2 style="margin:0 0 12px; color:#0f172a; font-size:18px;">メールアドレス認証</h2>
                <p style="margin:0 0 24px; color:#475569; font-size:14px; line-height:1.7;">
                  下のボタンをクリックして、<br />ご登録を完了してください。
                </p>
                <!-- CTA Button -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <a href="${safeUrl}" style="display:inline-block; background-color:#059669; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none; padding:14px 32px; border-radius:10px;">
                        メールアドレスを認証する
                      </a>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                  <tr>
                    <td align="center" style="font-size:12px; color:#64748b; line-height:1.7;">
                      有効期限: <span style="font-weight:700; color:#0f172a;">${expiresInHours}時間</span>（1回限り）<br />
                      <span style="color:#b91c1c; font-weight:700;">※ このリンクを第三者と共有しないでください。</span>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                  <tr>
                    <td align="center" style="font-size:12px; color:#94a3b8;">
                      ボタンが押せない場合: <span style="word-break:break-all;">${safeUrl}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #e2e8f0; padding:18px 24px; background-color:#f8fafc;">
                <p style="margin:0; color:#94a3b8; font-size:11px; line-height:1.7;">
                  心当たりがない場合はこのメールを無視してください。<br />
                  © ${new Date().getFullYear()} Re:Market — 中古品に、もう一度価値を。
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed. Use POST." }, 405);
  }

  let body: { email?: unknown; verifyUrl?: unknown; expiresInHours?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const verifyUrl = typeof body.verifyUrl === "string" ? body.verifyUrl.trim() : "";
  const expiresInHours =
    typeof body.expiresInHours === "number" ? body.expiresInHours : 24;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Invalid email address." }, 400);
  }
  if (!verifyUrl || !isValidVerifyUrl(verifyUrl)) {
    return json({ error: "Invalid verify URL." }, 400);
  }

  // Nếu thiếu RESEND_API_KEY -> lỗi rõ ràng. KHÔNG fallback, KHÔNG log link.
  if (!RESEND_API_KEY) {
    console.error("[send-verification-otp] RESEND_API_KEY is not configured.");
    return json(
      { error: "Email sending is not configured. Contact the administrator." },
      503
    );
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "【Re:Market】メール認証リンク",
      html: buildVerifyLinkEmailHtml({ verifyUrl, expiresInHours }),
    });

    if (error) {
      console.error("[send-verification-otp] Resend error:", error.message);
      return json({ error: "Failed to send verification email." }, 502);
    }

    // KHÔNG trả lại link/OTP cho caller. Chỉ trả id.
    return json({ ok: true, id: data?.id ?? null }, 200);
  } catch (err) {
    console.error("[send-verification-otp] Unexpected error:", err instanceof Error ? err.message : err);
    return json({ error: "Failed to send verification email." }, 500);
  }
});
