-- ============================================================
-- Zeviora — Migration 001: Schema
-- Apply in Supabase SQL Editor or via: supabase db push
-- Idempotent-safe (uses IF NOT EXISTS / CREATE OR REPLACE)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. profiles
-- ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  phone       text,
  role        text not null default 'customer'
                check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- 2. categories
-- ────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  slug        text unique not null,
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- 3. products
-- ────────────────────────────────────────────────────────────
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,
  name            text not null,
  description     text,
  price           numeric(10,2) not null,
  category_id     uuid references public.categories(id) on delete set null,
  availability    text not null default 'available'
                    check (availability in ('available', 'sold_out')),
  is_featured     boolean not null default false,
  is_new_arrival  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists products_category_id_idx     on public.products(category_id);
create index if not exists products_availability_idx    on public.products(availability);
create index if not exists products_is_featured_idx     on public.products(is_featured);
create index if not exists products_is_new_arrival_idx  on public.products(is_new_arrival);

-- ────────────────────────────────────────────────────────────
-- 4. product_images
-- ────────────────────────────────────────────────────────────
create table if not exists public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  storage_path  text not null,
  position      int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images(product_id);

-- ────────────────────────────────────────────────────────────
-- 5. wishlist
-- ────────────────────────────────────────────────────────────
create table if not exists public.wishlist (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists wishlist_user_id_idx on public.wishlist(user_id);

-- ────────────────────────────────────────────────────────────
-- 6. cart_items
-- ────────────────────────────────────────────────────────────
create table if not exists public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  quantity    int not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists cart_items_user_id_idx on public.cart_items(user_id);

-- ────────────────────────────────────────────────────────────
-- 7. order_requests
-- ────────────────────────────────────────────────────────────
create table if not exists public.order_requests (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  status            text not null default 'pending'
                      check (status in ('pending','contacted','confirmed','completed','cancelled')),
  estimated_total   numeric(10,2) not null,
  whatsapp_message  text not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists order_requests_user_id_idx on public.order_requests(user_id);
create index if not exists order_requests_status_idx  on public.order_requests(status);

-- ────────────────────────────────────────────────────────────
-- 8. order_request_items
-- ────────────────────────────────────────────────────────────
create table if not exists public.order_request_items (
  id                      uuid primary key default gen_random_uuid(),
  order_request_id        uuid not null references public.order_requests(id) on delete cascade,
  product_id              uuid references public.products(id) on delete set null,
  product_code_snapshot   text not null,
  product_name_snapshot   text not null,
  price_snapshot          numeric(10,2) not null,
  quantity                int not null
);

create index if not exists order_request_items_order_request_id_idx
  on public.order_request_items(order_request_id);

-- ────────────────────────────────────────────────────────────
-- 9. shop_settings  (admin-editable, consumed by public pages)
-- ────────────────────────────────────────────────────────────
create table if not exists public.shop_settings (
  id           uuid primary key default gen_random_uuid(),
  key          text unique not null,
  value        text,
  updated_at   timestamptz not null default now()
);

-- Seed initial setting keys (do not duplicate on re-run)
insert into public.shop_settings (key, value)
values
  ('address',        null),
  ('hours',          null),
  ('maps_url',       'https://maps.app.goo.gl/TiyjdofYPWRfvCG57'),
  ('whatsapp',       '918156081933'),
  ('email',          null)
on conflict (key) do nothing;
