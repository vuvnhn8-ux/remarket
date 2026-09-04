-- Re:Market — 0003: Auto-create profile on signUp + role helper for client-direct Auth
--
-- Khi chuyển sang "client gọi thẳng Supabase" (AGENTS.md mục 3, 14.1), đăng ký dùng
-- supabase.auth.signUp() với email confirm MẶC ĐỊNH của Supabase. Trước đây profile
-- được tạo bởi server (service role); giờ cần trigger tự tạo profile để mọi user
-- đăng ký đều có row role='customer' ngay lập tức.
--
-- Đồng thời thêm hàm get_user_role() (security definer) làm "nguồn sự thật" cho
-- phân quyền — các policy RLS / Edge Function gọi hàm này thay vì tự đoán role.

-- =========================================================================
-- 1. Trigger tự tạo profile khi có user mới trong auth.users
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, email_verified, created_at)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    'customer',
    coalesce(new.email_confirmed_at is not null, false),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cập nhật name/email_verified vào profile khi user cập nhật (VD: đổi tên).
create or replace function public.sync_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    email = coalesce(new.email, profiles.email),
    name  = coalesce(new.raw_user_meta_data ->> 'name', profiles.name),
    email_verified = coalesce(new.email_confirmed_at is not null, profiles.email_verified),
    updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.sync_user_profile();

-- =========================================================================
-- 2. Hàm get_user_role() — nguồn sự thật cho phân quyền
-- =========================================================================
create or replace function public.get_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select role from public.profiles where id = auth.uid()
  ), 'customer');
$$;

-- Hàm tiện: đúng role staff/admin không?
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() in ('staff', 'admin');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() = 'admin';
$$;

-- =========================================================================
-- 3. Đảm bảo khách đọc được role của chính mình (để client map role sau login)
--    profiles_select_own đã có trong 0001; giữ nguyên. Thêm policy cho service role
--    đã có. Không cần thêm gì — chỉ note.
-- =========================================================================
