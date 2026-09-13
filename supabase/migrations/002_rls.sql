-- ============================================================
-- Zeviora — Migration 002: RLS Policies
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- is_admin() helper
-- ────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ────────────────────────────────────────────────────────────
-- Enable RLS on every table
-- ────────────────────────────────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.products         enable row level security;
alter table public.product_images   enable row level security;
alter table public.wishlist         enable row level security;
alter table public.cart_items       enable row level security;
alter table public.order_requests   enable row level security;
alter table public.order_request_items enable row level security;
alter table public.shop_settings    enable row level security;

-- ────────────────────────────────────────────────────────────
-- profiles
-- ────────────────────────────────────────────────────────────
drop policy if exists "profiles: own or admin select" on public.profiles;
create policy "profiles: own or admin select"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- Insert is handled only by the trigger (no direct user insert)
drop policy if exists "profiles: own update" on public.profiles;
create policy "profiles: own update"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- prevent customers from self-promoting to admin
    and role = (select role from public.profiles where id = auth.uid())
  );

drop policy if exists "profiles: admin update" on public.profiles;
create policy "profiles: admin update"
  on public.profiles for update
  using (public.is_admin());

drop policy if exists "profiles: admin delete" on public.profiles;
create policy "profiles: admin delete"
  on public.profiles for delete
  using (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- categories — public read, admin write
-- ────────────────────────────────────────────────────────────
drop policy if exists "categories: public select" on public.categories;
create policy "categories: public select"
  on public.categories for select
  using (true);

drop policy if exists "categories: admin insert" on public.categories;
create policy "categories: admin insert"
  on public.categories for insert
  with check (public.is_admin());

drop policy if exists "categories: admin update" on public.categories;
create policy "categories: admin update"
  on public.categories for update
  using (public.is_admin());

drop policy if exists "categories: admin delete" on public.categories;
create policy "categories: admin delete"
  on public.categories for delete
  using (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- products — public read, admin write
-- ────────────────────────────────────────────────────────────
drop policy if exists "products: public select" on public.products;
create policy "products: public select"
  on public.products for select
  using (true);

drop policy if exists "products: admin insert" on public.products;
create policy "products: admin insert"
  on public.products for insert
  with check (public.is_admin());

drop policy if exists "products: admin update" on public.products;
create policy "products: admin update"
  on public.products for update
  using (public.is_admin());

drop policy if exists "products: admin delete" on public.products;
create policy "products: admin delete"
  on public.products for delete
  using (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- product_images — public read, admin write
-- ────────────────────────────────────────────────────────────
drop policy if exists "product_images: public select" on public.product_images;
create policy "product_images: public select"
  on public.product_images for select
  using (true);

drop policy if exists "product_images: admin insert" on public.product_images;
create policy "product_images: admin insert"
  on public.product_images for insert
  with check (public.is_admin());

drop policy if exists "product_images: admin update" on public.product_images;
create policy "product_images: admin update"
  on public.product_images for update
  using (public.is_admin());

drop policy if exists "product_images: admin delete" on public.product_images;
create policy "product_images: admin delete"
  on public.product_images for delete
  using (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- wishlist — own rows only
-- ────────────────────────────────────────────────────────────
drop policy if exists "wishlist: own select" on public.wishlist;
create policy "wishlist: own select"
  on public.wishlist for select
  using (user_id = auth.uid());

drop policy if exists "wishlist: own insert" on public.wishlist;
create policy "wishlist: own insert"
  on public.wishlist for insert
  with check (user_id = auth.uid());

drop policy if exists "wishlist: own delete" on public.wishlist;
create policy "wishlist: own delete"
  on public.wishlist for delete
  using (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- cart_items — own rows only
-- ────────────────────────────────────────────────────────────
drop policy if exists "cart_items: own select" on public.cart_items;
create policy "cart_items: own select"
  on public.cart_items for select
  using (user_id = auth.uid());

drop policy if exists "cart_items: own insert" on public.cart_items;
create policy "cart_items: own insert"
  on public.cart_items for insert
  with check (user_id = auth.uid());

drop policy if exists "cart_items: own update" on public.cart_items;
create policy "cart_items: own update"
  on public.cart_items for update
  using (user_id = auth.uid());

drop policy if exists "cart_items: own delete" on public.cart_items;
create policy "cart_items: own delete"
  on public.cart_items for delete
  using (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- order_requests
-- ────────────────────────────────────────────────────────────
drop policy if exists "order_requests: own or admin select" on public.order_requests;
create policy "order_requests: own or admin select"
  on public.order_requests for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "order_requests: own insert" on public.order_requests;
create policy "order_requests: own insert"
  on public.order_requests for insert
  with check (user_id = auth.uid());

drop policy if exists "order_requests: admin update" on public.order_requests;
create policy "order_requests: admin update"
  on public.order_requests for update
  using (public.is_admin());

drop policy if exists "order_requests: admin delete" on public.order_requests;
create policy "order_requests: admin delete"
  on public.order_requests for delete
  using (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- order_request_items
-- ────────────────────────────────────────────────────────────
drop policy if exists "order_request_items: own or admin select" on public.order_request_items;
create policy "order_request_items: own or admin select"
  on public.order_request_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.order_requests r
      where r.id = order_request_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "order_request_items: own insert" on public.order_request_items;
create policy "order_request_items: own insert"
  on public.order_request_items for insert
  with check (
    exists (
      select 1 from public.order_requests r
      where r.id = order_request_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "order_request_items: admin update" on public.order_request_items;
create policy "order_request_items: admin update"
  on public.order_request_items for update
  using (public.is_admin());

drop policy if exists "order_request_items: admin delete" on public.order_request_items;
create policy "order_request_items: admin delete"
  on public.order_request_items for delete
  using (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- shop_settings — public read, admin write
-- ────────────────────────────────────────────────────────────
drop policy if exists "shop_settings: public select" on public.shop_settings;
create policy "shop_settings: public select"
  on public.shop_settings for select
  using (true);

drop policy if exists "shop_settings: admin insert" on public.shop_settings;
create policy "shop_settings: admin insert"
  on public.shop_settings for insert
  with check (public.is_admin());

drop policy if exists "shop_settings: admin update" on public.shop_settings;
create policy "shop_settings: admin update"
  on public.shop_settings for update
  using (public.is_admin());

drop policy if exists "shop_settings: admin delete" on public.shop_settings;
create policy "shop_settings: admin delete"
  on public.shop_settings for delete
  using (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- Storage: product-images bucket policies
-- Run after creating the bucket manually in Supabase dashboard
-- or via: supabase storage create product-images
-- ────────────────────────────────────────────────────────────
-- NOTE: Storage policies are managed in Supabase dashboard under
-- Storage > Policies, or via the Supabase CLI.
-- Below is the equivalent SQL for the storage.objects table.

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
