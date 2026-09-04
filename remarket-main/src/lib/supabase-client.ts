/**
 * Re:Market — Supabase client (client-side, anon key)
 *
 * NƠI DUY NHẤT khởi tạo Supabase client cho trình duyệt. Mọi truy cập
 * DB/Auth từ SPA đều dùng client này (AGENTS.md mục 3, 10, 14).
 *
 * Bảo mật:
 *   - Chỉ dùng ANON key (public, an toàn để đặt ở client). TUYỆT ĐỐI không đặt
 *     service role / bất kỳ secret nào ở đây (sẽ bị lộ vào bundle).
 *   - Quyền đọc/ghi được kiểm soát bằng Row Level Security (RLS) + Edge
 *     Functions (cho tác vụ cần server, VD: trừ kho atomic, AI, gửi email).
 *
 * `import.meta.env.VITE_PUBLIC_SUPABASE_*` được Vite nạp từ `.env.local`.
 * Nếu thiếu key, trả về client lỗi (không crash khi import ở simulation).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_PUBLIC_SUPABASE_URL as string) || '';
const anonKey = (import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string) || '';

export const supabase: SupabaseClient = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** Cấu hình Supabase đã đủ chưa để dùng client-direct (Auth/DB). */
export function isSupabaseClientConfigured(): boolean {
  return Boolean(url && anonKey && url !== 'https://placeholder.supabase.co');
}
