-- Re:Market — profiles table cho đăng ký email + OTP (backend Supabase)
--
-- Link 1-1 với auth.users (id = auth.users.id). Lưu role + trạng thái
-- email_verified để app có thể phân quyền và biết email đã xác thực chưa.
--
-- Chạy trên Supabase SQL Editor (hoặc qua `supabase db push`).

-- =========================================================================
-- 1. Bảng profiles
-- =========================================================================
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          text not null,
  name           text,
  role           text not null default 'customer',
  email_verified boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz
);

-- Email index để tra cứu nhanh theo email khi cần (Edge Function / admin).
create index if not exists profiles_email_idx on public.profiles (email);

-- Trigger tự cập nhật updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =========================================================================
-- 2. Row Level Security (RLS)
-- =========================================================================
alter table public.profiles enable row level security;

-- Người dùng được đọc/update profile của chính mình.
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Service role (server / admin) được quyền đọc-ghi toàn bộ.
-- Chạy sau khi có service role hoặc dùng role service_role mặc định của Supabase.
create policy "profiles_service_all"
  on public.profiles for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Cho phép ghi khi tạo tài khoản (service role đã cover; thêm insert own để an toàn).
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);
