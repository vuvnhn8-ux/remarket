/**
 * Re:Market — Supabase Auth helpers (client-side)
 *
 * Map giữa phiên Supabase Auth và kiểu PublicUser của app (role lấy từ bảng
 * `profiles` qua RLS `profiles_select_own`). Dùng chung cho login/getMe/verify.
 */

import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase-client';
import { PublicUser, UserRole } from '../types';

/** Chuyển một Supabase Session thành PublicUser (kèm role từ profiles). */
export async function publicUserFromSession(session: Session): Promise<PublicUser> {
  const uid = session.user.id;
  let role: UserRole = 'customer';
  let name = (session.user.user_metadata as { name?: string } | undefined)?.name || '';
  try {
    const { data } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('id', uid)
      .maybeSingle();
    if (data && typeof data.role === 'string' && ['customer', 'staff', 'admin'].includes(data.role)) {
      role = data.role as UserRole;
    }
    if (data && typeof data.name === 'string' && data.name) {
      name = data.name;
    }
  } catch {
    // giữ role mặc định customer nếu không đọc được profiles
  }
  return {
    id: uid,
    email: session.user.email || '',
    role,
    name,
    customerId: uid,
  };
}

/** Lấy user hiện tại từ session Supabase (null nếu chưa đăng nhập). */
export async function currentPublicUser(): Promise<PublicUser | null> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return null;
  return publicUserFromSession(session);
}
