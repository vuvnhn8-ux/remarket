/**
 * Re:Market — Đăng ký (email + password) kèm xác thực bằng MAGIC LINK qua email.
 *
 * Kiến trúc adapter (giống lib/payment/index.ts, AGENTS.md mục 14.2 / mục 10):
 *
 *   API route (/api/auth/register|verify-link)
 *           ↓
 *   RegisterService (server/auth-register.ts)   ← điểm gọi duy nhất
 *           ↓
 *   SupabaseRegisterProvider (Supabase Auth + Edge Function → Resend)
 *
 * Thiết kế theo quyết định của người dùng:
 *   (1) Magic link 1-click — user bấm link trong email → trang SPA `/verify?token=...`
 *       → tự xác thực + tự đăng nhập (tạo session).
 *   (2) Bắt buộc gửi EMAIL THẬT — khi local thiếu cấu hình Supabase/Resend thì
 *       trả lỗi RÕ RÀNG, KHÔNG fallback hiển thị OTP/link cho user.
 *   (3) Link email trỏ route SPA `/verify?token=<token>` (APP_URL/verify?token=...).
 *
 * Magic link:
 *   - `verifyToken`: 32 byte ngẫu nhiên (hex 64 ký tự), entropy cao.
 *   - Lưu DAG hash (sha256Hex) của token, KHÔNG lưu plaintext token trong store.
 *   - Hết hạn 24 giờ, dùng 1 lần (xoá ngay sau khi verify).
 *   - Có cooldown 60s cho lần gửi lại.
 *   - Đăng nhập (email/password) bị chặn cho tới khi xác thực xong qua link.
 *
 * `DEV_EXPOSE_VERIFY_LINK=true` chỉ dành cho DEV/TEST (curl / script): trả link
 * trong response để kiểm chứng luồng mà không đọc email thật. MẶC ĐỊNH TẮT và
 * UI (LoginModal) KHÔNG hiển thị field này — nó không phải fallback cho user.
 */

import crypto from 'node:crypto';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { getStore } from './store';
import { sha256Hex, hashPassword } from '../lib/security/hash';
import { DatabaseStore } from '../src/data/dbStore';
import { PublicUser } from '../src/types';

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------
function supabaseUrl(): string {
  return process.env.VITE_SUPABASE_URL || '';
}
function supabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}
function supabaseFunctionUrl(): string {
  return process.env.SUPABASE_FUNCTION_URL || '';
}
function appUrl(): string {
  // APP_URL: URL nơi SPA được host. Bắt buộc để dựng link chuẩn trong email.
  return (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}
function devExposeVerifyLink(): boolean {
  return process.env.DEV_EXPOSE_VERIFY_LINK === 'true';
}

/**
 * Kích hoạt provider Supabase khi cấu hình đủ để tạo user + gọi Edge Function gửi email.
 * RESEND_API_KEY nằm trong Supabase Secret (Edge Function đọc), KHÔNG ở server Express.
 * Bắt buộc có đủ — không có provider demo/fallback (quyết định #2).
 */
export function isSupabaseRegisterEnabled(): boolean {
  return Boolean(supabaseUrl() && supabaseServiceRoleKey() && (supabaseFunctionUrl() || supabaseUrl()));
}

// ---------------------------------------------------------------------------
// Verify-link config
// ---------------------------------------------------------------------------
export const VERIFY_LINK_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 giờ
const RESEND_COOLDOWN_MS = 60 * 1000; // 60s giữa 2 lần gửi

interface PendingVerification {
  email: string;
  expiresAt: number;
  lastSentAt: number;
  resendCooldownUntil: number;
  provider: string;
}

// tokenHash (sha256Hex of token) -> verification record. KHÔNG lưu plaintext token.
const tokenStore = new Map<string, PendingVerification>();
// email -> tokenHash hiện tại (để check pending qua email khi login).
const emailToTokenHash = new Map<string, string>();

export function isEmailPending(email: string): boolean {
  return emailToTokenHash.has(email.toLowerCase().trim());
}

export function isEmailVerified(email: string): boolean {
  return !isEmailPending(email);
}

function generateVerifyToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ---------------------------------------------------------------------------
// Email LINK gửi qua Supabase Edge Function (server-only)
// ---------------------------------------------------------------------------
// Kiến trúc:  Express server
//                 ↓ (gọi function URL kèm Authorization: Bearer <service_role>)
//              Supabase Edge Function `send-verification-otp` (đọc RESEND_API_KEY
//              từ Supabase Secret, KHÔNG expose ra Express/backend bundle)
//                 ↓
//              Resend → User email
// RESEND_API_KEY KHÔNG tồn tại ở server Express — chỉ nằm trong Supabase Secret.
function supabaseEdgeFunctionInvokeUrl(): string {
  const base = supabaseFunctionUrl() || `${supabaseUrl().replace(/\/$/, '')}/functions/v1`;
  return `${base.replace(/\/$/, '')}/send-verification-otp`;
}

async function invokeVerifyEmailEdgeFunction(input: { email: string; verifyUrl: string; expiresInHours: number }): Promise<void> {
  const url = supabaseEdgeFunctionInvokeUrl();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseServiceRoleKey()}`,
    },
    body: JSON.stringify({
      email: input.email,
      verifyUrl: input.verifyUrl,
      expiresInHours: input.expiresInHours,
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      detail = j?.error || '';
    } catch {
      // ignore
    }
    throw new Error(`Edge Function gửi email thất bại (${res.status})${detail ? `: ${detail}` : ''}`);
  }
}

// ---------------------------------------------------------------------------
// Provider - giao diện chung (đổi provider sau này không phải sửa nhiều nơi)
// ---------------------------------------------------------------------------
export interface RegisterProvider {
  readonly name: string;
  /** Tạo tài khoản (chưa xác thực email). Trả về PublicUser đã tạo. */
  createAccount(input: { email: string; password: string; name: string }): Promise<PublicUser>;
  /** Xác nhận email đã verify (qua link). */
  confirmEmail(email: string): Promise<void>;
  /** Gửi email chứa magic link. Bắt buộc gửi email thật — throw nếu không gửi được. */
  sendVerifyLink(input: { email: string; verifyUrl: string; expiresInHours: number }): Promise<void>;
}

/**
 * Supabase provider — backend thật. Tạo user trong Supabase Auth (service role)
 * với email_confirm=false, đồng thời ghi một bản UserAccount vào store local
 * để đăng nhập/RBAC chạy thống nhất với phần còn lại của app (demo-grade;
 * khi go-live thật hãy dựa hoàn toàn vào Supabase JWT + RLS, xem AGENTS.md mục 3).
 * Email magic link gửi qua Resend (Edge Function).
 */
export class SupabaseRegisterProvider implements RegisterProvider {
  readonly name = 'SupabaseRegisterProvider';
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createSupabaseClient(supabaseUrl(), supabaseServiceRoleKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  async createAccount(input: { email: string; password: string; name: string }): Promise<PublicUser> {
    const { data, error } = await this.supabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: false,
      user_metadata: { name: input.name },
    });
    if (error) throw new Error(error.message || 'Supabaseアカウント作成に失敗しました。');
    if (!data.user) throw new Error('Supabaseアカウント作成に失敗しました。');

    const uid = data.user.id;

    // Upsert profile (id = supabase uid) — bảng `public.profiles` xem README/env note.
    const { error: profileErr } = await this.supabase.from('profiles').upsert(
      {
        id: uid,
        email: input.email,
        name: input.name,
        role: 'customer',
        email_verified: false,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (profileErr) throw new Error(profileErr.message || 'プロフィール作成に失敗しました。');

    // Ghi UserAccount local để login/RBAC (demo-grade như đã nêu ở header).
    const store = getStore() as DatabaseStore;
    const { userAccount } = store.registerCustomerAccount({
      email: input.email,
      passwordHash: hashPassword(input.password),
      name: input.name,
    });
    return store.toPublicUser(userAccount);
  }

  async confirmEmail(email: string): Promise<void> {
    // Cập nhật email_confirm trong Supabase Auth + bảng profiles cho đúng
    // ledger phía Supabase (tài khoản local đã render verified qua token store).
    const { data } = (await this.supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })) as {
      data: { users: Array<{ id: string; email?: string | null }> } | null;
    };
    const target = data?.users?.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
    if (!target) return;
    await this.supabase.auth.admin.updateUserById(target.id, { email_confirm: true });
    await this.supabase.from('profiles').update({ email_verified: true }).eq('id', target.id);
  }

  async sendVerifyLink(input: { email: string; verifyUrl: string; expiresInHours: number }): Promise<void> {
    await invokeVerifyEmailEdgeFunction(input);
  }
}

// ---------------------------------------------------------------------------
// RegisterService — điểm gọi duy nhất
// ---------------------------------------------------------------------------
export class RegisterService {
  private provider: RegisterProvider;

  /** Cho phép tiêm provider override để unit-test không cần email thật. */
  constructor(providerOverride?: RegisterProvider) {
    if (providerOverride) {
      this.provider = providerOverride;
      return;
    }
    if (!isSupabaseRegisterEnabled()) {
      // Không có config Supabase. Không fallback — constructor chỉ gán một
      // provider luôn báo lỗi khi gọi createAccount (xuống dưới trả lỗi rõ).
      this.provider = new UnconfiguredRegisterProvider();
      return;
    }
    this.provider = new SupabaseRegisterProvider();
  }

  get providerName(): string {
    return this.provider.name;
  }

  /**
   * Đăng ký tài khoản + tạo verify token + gửi email magic link. Trả về:
   *   { ok, email (masked), provider, expiresInSeconds }
   * Khi thiếu cấu hình gửi email → { ok:false, error } (KHÔNG fallback, KHÔNG lộ link).
   * Khi `DEV_EXPOSE_VERIFY_LINK=true` (chỉ DEV) → kèm `devVerifyLink` cho mục đích test/curl.
   */
  async registerUser(input: { email: string; password: string; name: string }) {
    const email = input.email.toLowerCase().trim();
    const store = getStore() as DatabaseStore;
    if (store.getUserByEmail(email)) {
      return { ok: false, error: 'このメールアドレスは既に登録されています。' };
    }
    if (!isSupabaseRegisterEnabled()) {
      return {
        ok: false,
        error: 'メール送信の設定がありません。管理者にお問い合わせください。',
      };
    }

    await this.provider.createAccount({ email, password: input.password, name: input.name });

    // Tạo verify token + lưu DAG hash.
    const token = generateVerifyToken();
    const tokenHash = sha256Hex(token);
    const now = Date.now();
    tokenStore.set(tokenHash, {
      email,
      expiresAt: now + VERIFY_LINK_EXPIRY_MS,
      lastSentAt: now,
      resendCooldownUntil: now + RESEND_COOLDOWN_MS,
      provider: this.provider.name,
    });
    emailToTokenHash.set(email, tokenHash);

    const verifyUrl = `${appUrl()}/verify?token=${token}`;
    const expiresInHours = Math.max(1, Math.floor(VERIFY_LINK_EXPIRY_MS / 3600000));

    // BẮT BUỘC gửi email thật — nếu Edge Function lỗi thì token cùng tài khoản
    // vẫn còn (đã sendVerifyLink throw → route báo lỗi), KHÔNG lộ link.
    await this.provider.sendVerifyLink({ email, verifyUrl, expiresInHours });

    return {
      ok: true,
      email: maskEmail(email),
      provider: this.provider.name,
      expiresInSeconds: Math.floor(VERIFY_LINK_EXPIRY_MS / 1000),
      devVerifyLink: devExposeVerifyLink() ? verifyUrl : undefined,
    };
  }

  /** Gửi lại email magic link (tôn trọng cooldown). */
  async resendVerifyLink(emailInput: string) {
    const email = emailInput.toLowerCase().trim();
    const now = Date.now();
    const tokenHash = emailToTokenHash.get(email);

    if (!tokenHash) {
      return { ok: false, error: '登録情報が見つかりません。最初からやり直してください。' };
    }
    const pending = tokenStore.get(tokenHash);
    if (!pending) {
      return { ok: false, error: '登録情報が見つかりません。最初からやり直してください。' };
    }
    if (now < pending.resendCooldownUntil) {
      const wait = Math.ceil((pending.resendCooldownUntil - now) / 1000);
      return { ok: false, error: `再送信は${wait}秒後にお試しください。`, retryAfterSeconds: wait };
    }
    if (!isSupabaseRegisterEnabled()) {
      return { ok: false, error: 'メール送信の設定がありません。管理者にお問い合わせください。' };
    }

    // Đổi token mới cho link (xoá cái cũ -> link cũ vô hiệu).
    const token = generateVerifyToken();
    const newHash = sha256Hex(token);
    tokenStore.delete(tokenHash);
    tokenStore.set(newHash, {
      email,
      expiresAt: now + VERIFY_LINK_EXPIRY_MS,
      lastSentAt: now,
      resendCooldownUntil: now + RESEND_COOLDOWN_MS,
      provider: pending.provider,
    });
    emailToTokenHash.set(email, newHash);

    const verifyUrl = `${appUrl()}/verify?token=${token}`;
    const expiresInHours = Math.max(1, Math.floor(VERIFY_LINK_EXPIRY_MS / 3600000));
    await this.provider.sendVerifyLink({ email, verifyUrl, expiresInHours });

    return {
      ok: true,
      email: maskEmail(email),
      devVerifyLink: devExposeVerifyLink() ? verifyUrl : undefined,
    };
  }

  /**
   * Xác thực magic link. Trả về user đã xác thực để route auto-login.
   * Token dùng 1 lần — xoá khỏi store ngay sau khi verify.
   */
  async verifyLink(tokenInput: string) {
    const token = String(tokenInput || '').trim();
    const tokenHash = sha256Hex(token);
    const pending = tokenStore.get(tokenHash);
    const now = Date.now();

    if (!pending) {
      return { ok: false, error: '認証リンクが無効です。新規登録からやり直してください。', verified: false };
    }
    if (now > pending.expiresAt) {
      tokenStore.delete(tokenHash);
      emailToTokenHash.delete(pending.email);
      return { ok: false, error: '認証リンクの有効期限が切れました。もう一度登録してください。', verified: false };
    }

    // Xoá trước khi confirm để đảm bảo dùng 1 lần (chống replay).
    tokenStore.delete(tokenHash);
    emailToTokenHash.delete(pending.email);

    await this.provider.confirmEmail(pending.email);

    const store = getStore() as DatabaseStore;
    const userAccount = store.getUserByEmail(pending.email);
    if (!userAccount) {
      return { ok: false, error: 'アカウント情報が見つかりません。', verified: false };
    }

    return { ok: true, verified: true, user: store.toPublicUser(userAccount), email: maskEmail(pending.email) };
  }
}

/**
 * Provider dùng khi thiếu cấu hình Supabase — luôn báo lỗi rõ ràng.
 * Đây là cách "bắt buộc email thật": không có fallback, không lộ link/OTP.
 */
class UnconfiguredRegisterProvider implements RegisterProvider {
  readonly name = 'Unconfigured';
  private err = () => {
    throw new Error('メール送信の設定がありません。管理者にお問い合わせください。');
  };
  async createAccount(): Promise<PublicUser> {
    return this.err();
  }
  async confirmEmail(): Promise<void> {
    return this.err();
  }
  async sendVerifyLink(): Promise<void> {
    return this.err();
  }
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const head = user.slice(0, 2);
  return `${head}${'*'.repeat(Math.max(user.length - 2, 1))}@${domain}`;
}

export const registerService = new RegisterService();
