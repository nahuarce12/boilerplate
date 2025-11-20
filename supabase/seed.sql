-- =============================================
-- SEED DATA FOR PRODUCTS (PRICING PLANS)
-- =============================================
-- Delete existing products first
DELETE FROM public.products;
-- Insert Basic Plan (Monthly)
insert into public.products (
    id,
    polar_product_id,
    name,
    description,
    price_amount,
    interval,
    features,
    is_active,
    metadata
  )
values (
    '00000000-0000-0000-0000-000000000001',
    '51229394-aca6-4f39-94f4-4f2ecb5c7d96',
    'Basic',
    'Perfect for individuals getting started',
    500,
    'month',
    jsonb_build_array(
      jsonb_build_object('name', 'Basic Features', 'included', true),
      jsonb_build_object(
        'name',
        'Up to 1,000 API calls/month',
        'included',
        true
      ),
      jsonb_build_object('name', '1 GB Storage', 'included', true),
      jsonb_build_object('name', 'Email Support', 'included', true),
      jsonb_build_object('name', 'Community Access', 'included', true)
    ),
    true,
    jsonb_build_object('recommended', false, 'popular', false)
  );
-- Insert Pro Plan (Monthly)
insert into public.products (
    id,
    polar_product_id,
    name,
    description,
    price_amount,
    interval,
    features,
    is_active,
    metadata
  )
values (
    '00000000-0000-0000-0000-000000000002',
    'e9b637a7-84f6-4611-bdc7-80c70eec3420',
    'Pro',
    'Ideal for professionals and small teams',
    990,
    'month',
    jsonb_build_array(
      jsonb_build_object('name', 'All Basic Features', 'included', true),
      jsonb_build_object(
        'name',
        'Up to 10,000 API calls/month',
        'included',
        true
      ),
      jsonb_build_object('name', '10 GB Storage', 'included', true),
      jsonb_build_object('name', 'Priority Support', 'included', true),
      jsonb_build_object('name', 'Advanced Analytics', 'included', true),
      jsonb_build_object('name', 'Custom Integrations', 'included', true)
    ),
    true,
    jsonb_build_object('recommended', true, 'popular', true)
  );
-- Insert Max Plan (Monthly)
insert into public.products (
    id,
    polar_product_id,
    name,
    description,
    price_amount,
    interval,
    features,
    is_active,
    metadata
  )
values (
    '00000000-0000-0000-0000-000000000003',
    'df52cedf-399e-46da-ab95-e50d2aa2150c',
    'Max',
    'For power users and growing teams',
    1500,
    'month',
    jsonb_build_array(
      jsonb_build_object('name', 'All Pro Features', 'included', true),
      jsonb_build_object('name', 'Unlimited API calls', 'included', true),
      jsonb_build_object('name', '50 GB Storage', 'included', true),
      jsonb_build_object(
        'name',
        '24/7 Priority Support',
        'included',
        true
      ),
      jsonb_build_object('name', 'Advanced Security', 'included', true),
      jsonb_build_object(
        'name',
        'Team Collaboration (up to 10 users)',
        'included',
        true
      ),
      jsonb_build_object('name', 'Custom Workflows', 'included', true)
    ),
    true,
    jsonb_build_object('recommended', false, 'popular', false)
  );
-- =============================================
-- VERIFICATION QUERY
-- =============================================
-- SELECT 
--   name,
--   description,
--   price_amount / 100.0 as price_dollars,
--   interval,
--   jsonb_array_length(features) as feature_count,
--   metadata->>'popular' as is_popular,
--   metadata->>'recommended' as is_recommended
-- FROM public.products
-- ORDER BY price_amount;