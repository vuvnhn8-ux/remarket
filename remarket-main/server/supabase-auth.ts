/**
 * Re:Market — Supabase Auth (login) server-side adapter
 *
 * Bổ sung nguồn xác thực Supabase Auth cho đăng nhập, GIỮ NGUYÊN auth in-memory
 * (demo users: customer/staff/admin@remarket.jp) làm fallback.
 *
 * Luồng:
 *   1. Thử auth in-memory trước (phủ demo users + RBAC cục bộ).
 *   2. Nếu không tìm thấy user trong in-memory (user đăng ký qua Supabase),
 *      xác thực bằng Supabase Auth signInWithPassword, rồi lấy role từ bảng
 *      `profiles` (liên kết auth.users.id) để dựng PublicUser và issueSession.
 *
 * Key (SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_URL) chỉ đọc ở server — không
 * bao giờ lộ ra client bundle (AGENTS.md mục 10, 11).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PublicUser } from '../src/types';

function env(name: string, legacyName?: string): string {
  return process.env[name] || (legacyName ? process.env[legacyName] : '') || '';
}

let cachedClient: SupabaseClient | null = null;
let cachedEnabled = false;

export function isSupabaseAuthEnabled(): boolean {
  // Chỉ cần URL + anon key (hoặc service role) để gọi signInWithPassword.
  const url = env('VITE_SUPABASE_URL', 'VITE_PUBLIC_SUPABASE_URL');
  const key =
    env('VITE_SUPABASE_ANON_KEY', 'VITE_PUBLIC_SUPABASE_ANON_KEY') ||
    env('SUPABASE_SERVICE_ROLE_KEY');
  return Boolean(url && key);
}

function getClient(): SupabaseClient | null {
  const url = env('VITE_SUPABASE_URL', 'VITE_PUBLIC_SUPABASE_URL');
  const anon = env('VITE_SUPABASE_ANON_KEY', 'VITE_PUBLIC_SUPABASE_ANON_KEY');
  const serviceRole = env('SUPABASE_SERVICE_ROLE_KEY');
  const key = anon || serviceRole;
  if (!url || !key) return null;
  if (!cachedClient || !cachedEnabled) {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    cachedEnabled = true;
  }
  return cachedClient;
}

/**
 * Xác thực bằng Supabase Auth. Trả về PublicUser (đã lấy role từ profiles),
 * hoặc null nếu sai thông tin / user chưa tồn tại / Supabase chưa cấu hình.
 */
export async function loginWithSupabase(email: string, password: string): Promise<PublicUser | null> {
  if (!isSupabaseAuthEnabled()) return null;
  const sb = getClient();
  if (!sb) return null;

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;

  // Lấy role + name từ bảng profiles (liên kết auth.users.id).
  const { data: profile, error: profileErr } = await sb
    .from('profiles')
    .select('id,email,name,role')
    .eq('id', data.user.id)
    .maybeSingle();

  const pub: PublicUser = {
    id: data.user.id,
    email: data.user.email || email.toLowerCase().trim(),
    role: (profile && !profileErr && profile.role) || 'customer',
    name: (profile && !profileErr && profile.name) || data.user.email?.split('@')[0] || '',
    customerId: data.user.id,
  };
  return pub;
}
