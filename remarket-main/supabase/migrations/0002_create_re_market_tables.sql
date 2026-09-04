-- Re:Market — 0002: Core business tables + RLS (Supabase làm DB lưu dữ liệu)
--
-- Chạy trên Supabase SQL Editor (hoặc qua `supabase db push`) SAU 0001_create_profiles.sql.
-- Thiết kế theo schema nghiệp vụ AGENTS.md mục 4:
--   Acquisition → Inspection → Inventory → Product (listing) → OrderItem
--
-- Phân quyền:
--   - Mọi chèn/đọc/ghi đều qua server (service role) cho tác vụ nội bộ (Staff/Admin).
--   - Khách (anon) chỉ đọc sản phẩm đang bán qua RLS; ghi order/favorite theo auth.uid().

create extension if not exists "pgcrypto";

-- =========================================================================
-- 1. Acquisitions (買取受付)
-- =========================================================================
create table if not exists public.acquisitions (
  id                      text primary key,            -- ACQ-2026-0042
  customer_name           text,
  customer_phone          text,
  customer_email          text,
  customer_address        text,
  acquired_at             date not null,
  category                text,
  brand                   text,
  model                   text,
  serial_number           text,
  purchase_price          integer not null default 0,  -- 買取価格 (JPY)
  estimated_market_price  integer,
  initial_condition       text,                        -- rank S/A/B/C/D
  initial_accessories_note text,
  notes                   text,
  status                  text not null default '受付済',
  images                  jsonb not null default '[]'::jsonb,
  inspection_id           text,
  inventory_id            text,
  product_id              text,
  is_simulation           boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz
);
create index if not exists acquisitions_status_idx on public.acquisitions (status);
create index if not exists acquisitions_category_idx on public.acquisitions (category);

-- =========================================================================
-- 2. Inspections (検品)
-- =========================================================================
create table if not exists public.inspections (
  id              text primary key,                    -- INSP-2026-...
  acquisition_id  text references public.acquisitions (id),
  inspector_name  text,
  inspected_at    date,
  result          text,                                -- Pass / Conditional Pass / Fail
  assigned_rank   text,
  notes           text,
  created_at      timestamptz not null default now()
);
create index if not exists inspections_acquisition_idx on public.inspections (acquisition_id);

-- =========================================================================
-- 3. Inventories (在庫)  — mỗi item là duy nhất (stock=1)
-- =========================================================================
create table if not exists public.inventories (
  id                 text primary key,                 -- INV-2026-0042
  acquisition_id     text references public.acquisitions (id),
  product_id         text,
  inspection_id      text,
  product_name       text,
  brand              text,
  category           text,
  serial_number      text,
  acquisition_cost   integer not null default 0,
  current_selling_price integer not null default 0,    -- 販売価格
  gross_profit       integer not null default 0,       -- 粗利
  gross_margin_percent numeric(6,2) not null default 0,
  warehouse_location text,
  status             text not null default '入荷',     -- 入荷→検品中→在庫→出品中→取り置き→売却済み→返品→廃棄
  condition_rank     text,
  acquired_at        date,
  listed_at          date,
  sold_at            date,
  history            jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz
);
create index if not exists inventories_status_idx on public.inventories (status);

-- =========================================================================
-- 4. Products (listings / 出品) — bắt buộc xuất phát từ Acquisition + Inspection
-- =========================================================================
create table if not exists public.products (
  id                 text primary key,                 -- PROD-2026-0089
  inventory_id       text,                             -- references via FK below (add after)
  acquisition_id     text references public.acquisitions (id),
  name               text not null,
  brand              text,
  model              text,
  category           text,
  serial_number      text,
  price              integer not null,                 -- 税込価格
  original_retail_price integer,
  condition_rank     text not null,
  stock              integer not null default 1,       -- unique item: 1 = in stock, 0 = sold
  is_sold            boolean not null default false,
  images             jsonb not null default '[]'::jsonb,
  featured_image     text,
  cosmetic_summary   text,
  functional_summary text,
  included_accessories jsonb not null default '[]'::jsonb,
  missing_accessories jsonb not null default '[]'::jsonb,
  defects            jsonb not null default '[]'::jsonb,
  inspection_date    date,
  inspector_name     text,
  description        text,
  keywords           jsonb not null default '[]'::jsonb,
  warranty_months    integer not null default 3,
  shipping_time      text,
  location           text,
  view_count         integer not null default 0,
  tags               jsonb not null default '[]'::jsonb,
  is_simulation      boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz
);
alter table public.products add constraint products_inventory_fk
  foreign key (inventory_id) references public.inventories (id);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_is_sold_idx on public.products (is_sold);

-- =========================================================================
-- 5. Orders + OrderItems (注文)
-- =========================================================================
create table if not exists public.orders (
  id                  text primary key,                -- ORD-20260824-0012
  customer_name       text,
  customer_email      text,
  customer_phone      text,
  shipping_postal_code text,
  shipping_address    text,
  delivery_slot       text,
  payment_method      text,
  payment_status      text not null default '未払い',  -- 支払済/未払い/返金済
  order_status        text not null default '注文受付',
  subtotal            integer not null default 0,
  tax                 integer not null default 0,
  shipping_fee        integer not null default 0,
  total_amount        integer not null default 0,
  ordered_at          date not null default current_date,
  shipped_at          date,
  delivered_at        date,
  tracking_number     text,
  carrier             text,
  is_simulation       boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz
);
create index if not exists orders_email_idx on public.orders (customer_email);
create index if not exists orders_status_idx on public.orders (order_status);

create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    text references public.orders (id) on delete cascade,
  product_id  text,
  product_name text,
  brand       text,
  price       integer not null default 0,
  condition_rank text,
  image       text,
  serial_number text
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- =========================================================================
-- 6. Favorites (お気に入り) — khách theo auth.uid()
-- =========================================================================
create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete cascade,
  product_id text references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- =========================================================================
-- 7. AI Requests (audit — AGENTS.md mục 10)
-- =========================================================================
create table if not exists public.ai_requests (
  id           text primary key,
  feature      text not null,                          -- listing / shopping / sales
  model        text,
  input        jsonb,
  output       jsonb,
  mode         text,                                   -- simulation / live
  created_at   timestamptz not null default now()
);
create index if not exists ai_requests_feature_idx on public.ai_requests (feature);

-- =========================================================================
-- Trigger updated_at cho các bảng có cột updated_at
-- =========================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_acquisitions_updated_at on public.acquisitions;
create trigger trg_acquisitions_updated_at before update on public.acquisitions
  for each row execute function public.set_updated_at();
drop trigger if exists trg_inventories_updated_at on public.inventories;
create trigger trg_inventories_updated_at before update on public.inventories
  for each row execute function public.set_updated_at();
drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- =========================================================================
-- RLS
-- =========================================================================

-- Acquisitions / Inspections / Inventories / Orders: nội bộ — chỉ service role.
-- (Khách không truy cập trực tiếp; mọi thao tác qua server + service role.)
alter table public.acquisitions enable row level security;
alter table public.inspections   enable row level security;
alter table public.inventories   enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.ai_requests   enable row level security;

create policy "acq_service_all" on public.acquisitions for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "insp_service_all" on public.inspections for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "inv_service_all" on public.inventories for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "ord_service_all" on public.orders for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "orditem_service_all" on public.order_items for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "aireq_service_all" on public.ai_requests for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Products: khách (anon) được đọc sản phẩm đang bán; ghi chỉ service role.
alter table public.products enable row level security;
create policy "products_select_public" on public.products for select
  using (is_sold = false);
create policy "products_service_all" on public.products for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Favorites: khách quản lý favorite của chính mình; service role toàn quyền.
alter table public.favorites enable row level security;
create policy "fav_select_own" on public.favorites for select
  using (auth.uid() = user_id);
create policy "fav_insert_own" on public.favorites for insert
  with check (auth.uid() = user_id);
create policy "fav_delete_own" on public.favorites for delete
  using (auth.uid() = user_id);
create policy "fav_service_all" on public.favorites for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
