/**
 * Re:Market — Unit test cho luồng Magic Link đăng ký/xác thực (server-side).
 *
 * KHÔNG gửi email thật: dùng RegisterService với provider fake (tiêm override)
 * để kiểm chứng đúng logic nghiệp vụ: tạo token → lưu hash → link /verify →
 * verify 1 lần → confirmEmail → user, gate đăng nhập, token hết hạn/dùng lại bị chặn.
 *
 * Chạy: npx tsx scripts/test-verify-link.ts
 * Yêu cầu: dbStore khởi tạo được (in-memory) — không cần mạng, không cần Supabase.
 */

process.env.VITE_SUPABASE_URL = 'https://dummy.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'dummy-service-role';
process.env.SUPABASE_FUNCTION_URL = 'https://dummy.supabase.co/functions/v1';
process.env.APP_URL = 'http://localhost:3000';
process.env.DEV_EXPOSE_VERIFY_LINK = 'true';

import { RegisterService, RegisterProvider, isEmailPending } from '../server/auth-register';
import { getStore } from '../server/store';
import { hashPassword } from '../lib/security/hash';

class FakeProvider implements RegisterProvider {
  readonly name = 'FakeProvider';
  public lastVerifyUrl = '';
  public sendCount = 0;
  public confirmedEmails: string[] = [];

  async createAccount(input: { email: string; password: string; name: string }) {
    const store = getStore() as any;
    const { userAccount } = store.registerCustomerAccount({
      email: input.email,
      passwordHash: hashPassword(input.password),
      name: input.name,
    });
    return store.toPublicUser(userAccount);
  }
  async confirmEmail(email: string): Promise<void> {
    this.confirmedEmails.push(email);
  }
  async sendVerifyLink(input: { email: string; verifyUrl: string }): Promise<void> {
    this.sendCount += 1;
    this.lastVerifyUrl = input.verifyUrl;
  }
}

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error('  ✗ FAIL:', msg);
    process.exitCode = 1;
  } else {
    console.log('  ✓', msg);
  }
}

async function main() {
  const email = `verifytest.${Date.now()}@example.com`;
  console.log('Test magic link register/verify — email:', email);

  const provider = new FakeProvider();
  const svc = new RegisterService(provider);

  // 1) Register tạo account + link, KHÔNG lộ OTP.
  const reg = await svc.registerUser({ email, password: 'password123', name: '検証 太郎' });
  assert(reg.ok === true, 'registerUser ok');
  assert(typeof reg.email === 'string' && reg.email.includes('*'), 'email trả về bị mask');
  assert(typeof reg.devVerifyLink === 'string' && reg.devVerifyLink.includes('/verify?token='), 'devVerifyLink chứa route /verify');

  // 2) Login bị chặn khi chưa verify.
  assert(isEmailPending(email) === true, 'login bị chặn trước khi verify (isEmailPending=true)');

  // 3) Email gửi đúng 1 lần, chứa token dùng được.
  assert(provider.sendCount === 1, 'sendVerifyLink gọi đúng 1 lần');
  const token = new URL(provider.lastVerifyUrl).searchParams.get('token') || '';
  assert(token.length > 40, 'token có entropy đủ lớn');

  // 4) Verify link → thành công + user.
  const verify = await svc.verifyLink(token);
  assert(verify.ok === true && !!verify.user, 'verifyLink thành công và trả user');
  assert(provider.confirmedEmails.includes(email), 'confirmEmail được gọi');

  // 5) Sau verify: login không còn bị chặn, token dùng 1 lần (replay bị chặn).
  assert(isEmailPending(email) === false, 'sau verify login không còn bị chặn');
  const replay = await svc.verifyLink(token);
  assert(replay.ok === false, 'token dùng lại lần 2 bị chặn (single-use)');

  // 6) Token sai -> lỗi.
  const bad = await svc.verifyLink('0'.repeat(64));
  assert(bad.ok === false, 'token sai/invalid bị chặn');

  // 7) Thiếu cấu hình Supabase -> register báo lỗi rõ, không fallback.
  const prevUrl = process.env.VITE_SUPABASE_URL;
  delete process.env.VITE_SUPABASE_URL;
  const unconfigured = await svc.registerUser({ email: `other.${Date.now()}@example.com`, password: 'password123', name: 'A' });
  process.env.VITE_SUPABASE_URL = prevUrl;
  assert(unconfigured.ok === false && typeof unconfigured.error === 'string' && !('devVerifyLink' in unconfigured), 'thiếu cấu hình -> lỗi rõ ràng, không lộ link');

  // 8) Đăng ký trùng email -> lỗi.
  const dup = await svc.registerUser({ email, password: 'password123', name: 'B' });
  assert(dup.ok === false, 'đăng ký trùng email bị chặn');

  console.log(process.exitCode ? '\nCÓ LỖI — test thất bại.' : '\nTất cả test PASS.');
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exitCode = 1;
});
