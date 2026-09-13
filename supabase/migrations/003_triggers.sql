-- ============================================================
-- Zeviora — Migration 003: Triggers
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- updated_at helper function
-- ────────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- updated_at triggers
drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

drop trigger if exists set_cart_items_updated_at on public.cart_items;
create trigger set_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.handle_updated_at();

drop trigger if exists set_order_requests_updated_at on public.order_requests;
create trigger set_order_requests_updated_at
  before update on public.order_requests
  for each row execute function public.handle_updated_at();

drop trigger if exists set_shop_settings_updated_at on public.shop_settings;
create trigger set_shop_settings_updated_at
  before update on public.shop_settings
  for each row execute function public.handle_updated_at();

-- ────────────────────────────────────────────────────────────
-- profiles auto-creation on auth.users insert
-- ────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
