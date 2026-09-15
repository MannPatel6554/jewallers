-- ============================================================
-- ZEVIORA: COMPLETE DATABASE RESET & SETUP SCRIPT
-- Run this in Supabase SQL Editor to wipe and re-initialize
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. DROP EXISTING TABLES & FUNCTIONS (CLEAN SLATE)
-- ────────────────────────────────────────────────────────────
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists set_products_updated_at on public.products;
drop trigger if exists set_cart_items_updated_at on public.cart_items;
drop trigger if exists set_order_requests_updated_at on public.order_requests;
drop trigger if exists set_shop_settings_updated_at on public.shop_settings;

drop table if exists public.order_request_items cascade;
drop table if exists public.order_requests cascade;
drop table if exists public.cart_items cascade;
drop table if exists public.wishlist cascade;
drop table if exists public.product_images cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.shop_settings cascade;
drop table if exists public.profiles cascade;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.handle_updated_at() cascade;
drop function if exists public.is_admin() cascade;

-- ────────────────────────────────────────────────────────────
-- 2. CREATE CORE TABLES
-- ────────────────────────────────────────────────────────────

-- 2.1 Profiles
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

-- 2.2 Categories
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  slug        text unique not null,
  created_at  timestamptz not null default now()
);

-- 2.3 Products
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,
  name            text not null,
  description     text,
  price           numeric(10,2) not null,
  category_id     uuid references public.categories(id) on delete set null,
  availability    text not null default 'available' check (availability in ('available', 'sold_out')),
  is_featured     boolean not null default false,
  is_new_arrival  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index products_category_id_idx     on public.products(category_id);
create index products_availability_idx    on public.products(availability);
create index products_is_featured_idx     on public.products(is_featured);
create index products_is_new_arrival_idx  on public.products(is_new_arrival);

-- 2.4 Product Images
create table public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  storage_path  text not null,
  position      int not null default 0,
  created_at    timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images(product_id);

-- 2.5 Wishlist
create table public.wishlist (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index wishlist_user_id_idx on public.wishlist(user_id);

-- 2.6 Cart Items
create table public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  quantity    int not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index cart_items_user_id_idx on public.cart_items(user_id);

-- 2.7 Order / WhatsApp Requests
create table public.order_requests (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  status            text not null default 'pending' check (status in ('pending','contacted','confirmed','completed','cancelled')),
  estimated_total   numeric(10,2) not null,
  whatsapp_message  text not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index order_requests_user_id_idx on public.order_requests(user_id);
create index order_requests_status_idx  on public.order_requests(status);

-- 2.8 Order Request Items
create table public.order_request_items (
  id                      uuid primary key default gen_random_uuid(),
  order_request_id        uuid not null references public.order_requests(id) on delete cascade,
  product_id              uuid references public.products(id) on delete set null,
  product_code_snapshot   text not null,
  product_name_snapshot   text not null,
  price_snapshot          numeric(10,2) not null,
  quantity                int not null
);

create index order_request_items_order_request_id_idx on public.order_request_items(order_request_id);

-- 2.9 Shop Settings
create table public.shop_settings (
  id           uuid primary key default gen_random_uuid(),
  key          text unique not null,
  value        text,
  updated_at   timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- 3. PERMISSIONS & ROLES GRANT (CRITICAL)
-- ────────────────────────────────────────────────────────────
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;

-- ────────────────────────────────────────────────────────────
-- 4. HELPER FUNCTIONS & TRIGGERS
-- ────────────────────────────────────────────────────────────

-- 4.1 updated_at trigger helper
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_products_updated_at before update on public.products for each row execute function public.handle_updated_at();
create trigger set_cart_items_updated_at before update on public.cart_items for each row execute function public.handle_updated_at();
create trigger set_order_requests_updated_at before update on public.order_requests for each row execute function public.handle_updated_at();
create trigger set_shop_settings_updated_at before update on public.shop_settings for each row execute function public.handle_updated_at();

-- 4.2 is_admin() security helper
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- 4.3 Auto-Profile Trigger (Automatically makes mannpatel2898@gmail.com OR the 1st user an Admin!)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first boolean;
  assigned_role text := 'customer';
begin
  -- Check if this is the first registered user in the database
  select not exists (select 1 from public.profiles) into is_first;
  
  if is_first then
    assigned_role := 'admin';
  else
    assigned_role := 'customer';
  end if;

  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    assigned_role
  )
  on conflict (id) do update
  set name = coalesce(excluded.name, profiles.name);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Also backfill profiles for any existing users in auth.users
insert into public.profiles (id, name, role)
select 
  id,
  coalesce(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  'customer'
from auth.users
on conflict (id) do nothing;

-- To promote an admin user, execute:
-- update public.profiles set role = 'admin' where id = 'YOUR-USER-UUID';

-- ────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.wishlist enable row level security;
alter table public.cart_items enable row level security;
alter table public.order_requests enable row level security;
alter table public.order_request_items enable row level security;
alter table public.shop_settings enable row level security;

-- 5.1 Profiles RLS
create policy "profiles: select own or admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles: update own or admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (
    public.is_admin()
    or (
      id = auth.uid()
      and role = (select p.role from public.profiles p where p.id = auth.uid())
    )
  );

-- 5.2 Categories RLS
create policy "categories: public read"
  on public.categories for select
  using (true);

create policy "categories: admin insert"
  on public.categories for insert
  with check (public.is_admin());

create policy "categories: admin update"
  on public.categories for update
  using (public.is_admin());

create policy "categories: admin delete"
  on public.categories for delete
  using (public.is_admin());

-- 5.3 Products RLS
create policy "products: public read"
  on public.products for select
  using (true);

create policy "products: admin insert"
  on public.products for insert
  with check (public.is_admin());

create policy "products: admin update"
  on public.products for update
  using (public.is_admin());

create policy "products: admin delete"
  on public.products for delete
  using (public.is_admin());

-- 5.4 Product Images RLS
create policy "product_images: public read"
  on public.product_images for select
  using (true);

create policy "product_images: admin insert"
  on public.product_images for insert
  with check (public.is_admin());

create policy "product_images: admin update"
  on public.product_images for update
  using (public.is_admin());

create policy "product_images: admin delete"
  on public.product_images for delete
  using (public.is_admin());

-- 5.5 Wishlist RLS
create policy "wishlist: own select"
  on public.wishlist for select
  using (user_id = auth.uid());

create policy "wishlist: own insert"
  on public.wishlist for insert
  with check (user_id = auth.uid());

create policy "wishlist: own delete"
  on public.wishlist for delete
  using (user_id = auth.uid());

-- 5.6 Cart Items RLS
create policy "cart_items: own select"
  on public.cart_items for select
  using (user_id = auth.uid());

create policy "cart_items: own insert"
  on public.cart_items for insert
  with check (user_id = auth.uid());

create policy "cart_items: own update"
  on public.cart_items for update
  using (user_id = auth.uid());

create policy "cart_items: own delete"
  on public.cart_items for delete
  using (user_id = auth.uid());

-- 5.7 Order Requests RLS
create policy "order_requests: own or admin select"
  on public.order_requests for select
  using (user_id = auth.uid() or public.is_admin());

create policy "order_requests: insert"
  on public.order_requests for insert
  with check (
    (auth.uid() is not null and user_id = auth.uid())
    or (auth.uid() is null and user_id is null)
  );

create policy "order_requests: admin update"
  on public.order_requests for update
  using (public.is_admin());

create policy "order_requests: admin delete"
  on public.order_requests for delete
  using (public.is_admin());

-- 5.8 Order Request Items RLS
create policy "order_request_items: select"
  on public.order_request_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.order_requests r
      where r.id = order_request_id and (
        (auth.uid() is not null and r.user_id = auth.uid())
        or (auth.uid() is null and r.user_id is null)
      )
    )
  );

create policy "order_request_items: insert"
  on public.order_request_items for insert
  with check (
    exists (
      select 1 from public.order_requests r
      where r.id = order_request_id and (
        (auth.uid() is not null and r.user_id = auth.uid())
        or (auth.uid() is null and r.user_id is null)
      )
    )
  );

create policy "order_request_items: admin update"
  on public.order_request_items for update
  using (public.is_admin());

create policy "order_request_items: admin delete"
  on public.order_request_items for delete
  using (public.is_admin());

-- 5.9 Shop Settings RLS
create policy "shop_settings: public read"
  on public.shop_settings for select
  using (true);

create policy "shop_settings: admin write"
  on public.shop_settings for all
  using (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- 6. SEED INITIAL DATA (CATEGORIES, PRODUCTS, SETTINGS)
-- ────────────────────────────────────────────────────────────

-- 6.1 Categories
insert into public.categories (id, name, slug) values
  ('a0000001-0000-0000-0000-000000000001', 'Necklaces', 'necklaces'),
  ('a0000001-0000-0000-0000-000000000002', 'Earrings', 'earrings'),
  ('a0000001-0000-0000-0000-000000000003', 'Bangles & Bracelets', 'bangles-bracelets'),
  ('a0000001-0000-0000-0000-000000000004', 'Rings', 'rings')
on conflict (slug) do nothing;

-- 6.2 Products
insert into public.products (id, code, name, description, price, category_id, availability, is_featured, is_new_arrival) values
  (
    'b0000001-0000-0000-0000-000000000001',
    'ZEV-NK-001',
    'Royal Kundan Choker Set',
    'Intricately crafted Kundan choker with premium micro-gold plating and matching dangling earrings.',
    2499.00,
    'a0000001-0000-0000-0000-000000000001',
    'available',
    true,
    true
  ),
  (
    'b0000001-0000-0000-0000-000000000002',
    'ZEV-ER-002',
    'Chandbali Pearl Drop Earrings',
    'Traditional Rajasthani Chandbali earrings with luminous faux pearls and antique gold finish.',
    899.00,
    'a0000001-0000-0000-0000-000000000002',
    'available',
    true,
    false
  ),
  (
    'b0000001-0000-0000-0000-000000000003',
    'ZEV-BG-003',
    'Temple Kada Openable Bangle',
    'South Indian inspired handcrafted temple motif Kada with ruby-hued stones and matte gold plating.',
    1299.00,
    'a0000001-0000-0000-0000-000000000003',
    'available',
    true,
    true
  ),
  (
    'b0000001-0000-0000-0000-000000000004',
    'ZEV-RG-004',
    'Solitaire Bloom Cocktail Ring',
    'Adjustable statement cocktail ring featuring cubic zirconia stones set in radiant warm gold plating.',
    599.00,
    'a0000001-0000-0000-0000-000000000004',
    'available',
    false,
    true
  ),
  (
    'b0000001-0000-0000-0000-000000000005',
    'ZEV-NK-005',
    'Polki Layered Rani Haar',
    'Majestic multi-layered Rani Haar necklace studded with uncut Polki crystals.',
    3899.00,
    'a0000001-0000-0000-0000-000000000001',
    'available',
    true,
    false
  ),
  (
    'b0000001-0000-0000-0000-000000000006',
    'ZEV-ER-006',
    'Emerald Floral Jhumkas',
    'Classic bell-shaped jhumkas adorned with emerald-toned green stones and golden bead clusters.',
    1149.00,
    'a0000001-0000-0000-0000-000000000002',
    'available',
    false,
    true
  )
on conflict (code) do nothing;

-- 6.3 Shop Settings
insert into public.shop_settings (key, value) values
  ('address',        'Shop No. 14, Heritage Gold Plaza, Main Market, Ahmedabad, Gujarat - 380001'),
  ('hours',          'Monday – Saturday: 10:30 AM – 8:30 PM (Sunday Closed)'),
  ('maps_url',       'https://maps.app.goo.gl/TiyjdofYPWRfvCG57'),
  ('whatsapp',       '918156081933'),
  ('email',          'contact@zeviora.com')
on conflict (key) do update set value = excluded.value;

-- ────────────────────────────────────────────────────────────
-- 7. STORAGE BUCKET & STORAGE RLS POLICIES
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product-images: public read" on storage.objects;
create policy "product-images: public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product-images: admin insert" on storage.objects;
create policy "product-images: admin insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product-images: admin update" on storage.objects;
create policy "product-images: admin update"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product-images: admin delete" on storage.objects;
create policy "product-images: admin delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

