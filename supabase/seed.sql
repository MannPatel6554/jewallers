-- ============================================================
-- Zeviora — Seed Data (LOCAL DEVELOPMENT ONLY)
-- Never run against production!
-- ============================================================

-- Categories
insert into public.categories (id, name, slug) values
  ('11111111-1111-1111-1111-111111111001', 'Necklace Sets',  'necklace-sets'),
  ('11111111-1111-1111-1111-111111111002', 'Bridal Sets',    'bridal-sets'),
  ('11111111-1111-1111-1111-111111111003', 'Earrings',       'earrings'),
  ('11111111-1111-1111-1111-111111111004', 'Bangles',        'bangles'),
  ('11111111-1111-1111-1111-111111111005', 'Maang Tikka',    'maang-tikka')
on conflict (name) do nothing;

-- Sample Products
insert into public.products (id, code, name, description, price, category_id, availability, is_featured, is_new_arrival) values
  (
    '22222222-2222-2222-2222-222222222001',
    'ZV-101',
    'Kundan Bridal Set',
    'Exquisite kundan necklace set with matching earrings and maang tikka. Perfect for bridal occasions.',
    4999.00,
    '11111111-1111-1111-1111-111111111002',
    'available',
    true,
    false
  ),
  (
    '22222222-2222-2222-2222-222222222002',
    'ZV-102',
    'Bridal Necklace Set',
    'Elegant layered necklace set with pearl drops and gold-tone finish.',
    3499.00,
    '11111111-1111-1111-1111-111111111001',
    'available',
    true,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222003',
    'ZV-103',
    'Pearl Drop Earrings',
    'Classic pearl drop earrings with 22kt gold-tone setting. Lightweight and comfortable.',
    899.00,
    '11111111-1111-1111-1111-111111111003',
    'available',
    false,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222004',
    'ZV-104',
    'Meenakari Bangle Set',
    'Set of 4 hand-painted meenakari bangles in vibrant blue and gold.',
    1299.00,
    '11111111-1111-1111-1111-111111111004',
    'available',
    false,
    false
  ),
  (
    '22222222-2222-2222-2222-222222222005',
    'ZV-105',
    'Polki Maang Tikka',
    'Stunning polki maang tikka with intricate gold-tone filigree work.',
    1499.00,
    '11111111-1111-1111-1111-111111111005',
    'sold_out',
    true,
    false
  ),
  (
    '22222222-2222-2222-2222-222222222006',
    'ZV-106',
    'Temple Jewellery Set',
    'Traditional temple-inspired necklace with matching earrings, antique gold finish.',
    5499.00,
    '11111111-1111-1111-1111-111111111002',
    'available',
    true,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222007',
    'ZV-107',
    'Oxidised Silver Earrings',
    'Boho-chic oxidised silver jhumka earrings with mirror work.',
    699.00,
    '11111111-1111-1111-1111-111111111003',
    'available',
    false,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222008',
    'ZV-108',
    'Gold-Tone Chain Necklace',
    'Minimalist layered chain necklace in 22kt gold-tone finish. Everyday wear.',
    1199.00,
    '11111111-1111-1111-1111-111111111001',
    'available',
    false,
    false
  )
on conflict (code) do nothing;
