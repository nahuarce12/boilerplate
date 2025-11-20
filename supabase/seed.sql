-- =============================================
-- SEED DATA FOR PRODUCTS (PRICING PLANS)
-- =============================================
-- Insert Starter Plan (Monthly)
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
    'prod_starter_monthly',
    'Starter',
    'Perfect for individuals and small projects',
    999,
    -- $9.99
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
-- Insert Starter Plan (Yearly) - 20% discount
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
    'prod_starter_yearly',
    'Starter',
    'Perfect for individuals and small projects',
    9588,
    -- $95.88 (save $23.88/year)
    'year',
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
      jsonb_build_object('name', 'Community Access', 'included', true),
      jsonb_build_object(
        'name',
        'Save 20% with annual billing',
        'included',
        true
      )
    ),
    true,
    jsonb_build_object(
      'recommended',
      false,
      'popular',
      false,
      'discount',
      '20%'
    )
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
    '00000000-0000-0000-0000-000000000003',
    'prod_pro_monthly',
    'Pro',
    'Ideal for growing businesses and teams',
    2999,
    -- $29.99
    'month',
    jsonb_build_array(
      jsonb_build_object('name', 'All Starter Features', 'included', true),
      jsonb_build_object(
        'name',
        'Up to 10,000 API calls/month',
        'included',
        true
      ),
      jsonb_build_object('name', '10 GB Storage', 'included', true),
      jsonb_build_object(
        'name',
        'Priority Email Support',
        'included',
        true
      ),
      jsonb_build_object('name', 'Advanced Analytics', 'included', true),
      jsonb_build_object('name', 'Custom Integrations', 'included', true),
      jsonb_build_object(
        'name',
        'Team Collaboration (up to 5 users)',
        'included',
        true
      )
    ),
    true,
    jsonb_build_object('recommended', true, 'popular', true)
  );
-- Insert Pro Plan (Yearly) - 20% discount
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
    '00000000-0000-0000-0000-000000000004',
    'prod_pro_yearly',
    'Pro',
    'Ideal for growing businesses and teams',
    28788,
    -- $287.88 (save $71.88/year)
    'year',
    jsonb_build_array(
      jsonb_build_object('name', 'All Starter Features', 'included', true),
      jsonb_build_object(
        'name',
        'Up to 10,000 API calls/month',
        'included',
        true
      ),
      jsonb_build_object('name', '10 GB Storage', 'included', true),
      jsonb_build_object(
        'name',
        'Priority Email Support',
        'included',
        true
      ),
      jsonb_build_object('name', 'Advanced Analytics', 'included', true),
      jsonb_build_object('name', 'Custom Integrations', 'included', true),
      jsonb_build_object(
        'name',
        'Team Collaboration (up to 5 users)',
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Save 20% with annual billing',
        'included',
        true
      )
    ),
    true,
    jsonb_build_object(
      'recommended',
      true,
      'popular',
      true,
      'discount',
      '20%'
    )
  );
-- Insert Enterprise Plan (Monthly)
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
    '00000000-0000-0000-0000-000000000005',
    'prod_enterprise_monthly',
    'Enterprise',
    'For large organizations with custom needs',
    9999,
    -- $99.99
    'month',
    jsonb_build_array(
      jsonb_build_object('name', 'All Pro Features', 'included', true),
      jsonb_build_object('name', 'Unlimited API calls', 'included', true),
      jsonb_build_object('name', '100 GB Storage', 'included', true),
      jsonb_build_object(
        'name',
        '24/7 Phone & Email Support',
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Advanced Security & Compliance',
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Custom Integrations & Workflows',
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Unlimited Team Members',
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Dedicated Account Manager',
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'SLA Guarantee (99.9% uptime)',
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Custom Onboarding & Training',
        'included',
        true
      )
    ),
    true,
    jsonb_build_object(
      'recommended',
      false,
      'popular',
      false,
      'contact_sales',
      false
    )
  );
-- Insert Enterprise Plan (Yearly) - 20% discount
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
    '00000000-0000-0000-0000-000000000006',
    'prod_enterprise_yearly',
    'Enterprise',
    'For large organizations with custom needs',
    95988,
    -- $959.88 (save $239.88/year)
    'year',
    jsonb_build_array(
      jsonb_build_object('name', 'All Pro Features', 'included', true),
      jsonb_build_object('name', 'Unlimited API calls', 'included', true),
      jsonb_build_object('name', '100 GB Storage', 'included', true),
      jsonb_build_object(
        'name',
        '24/7 Phone & Email Support',
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Advanced Security & Compliance',
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Custom Integrations & Workflows',
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Unlimited Team Members',
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Dedicated Account Manager',
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'SLA Guarantee (99.9% uptime)',
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Custom Onboarding & Training',
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Save 20% with annual billing',
        'included',
        true
      )
    ),
    true,
    jsonb_build_object(
      'recommended',
      false,
      'popular',
      false,
      'contact_sales',
      false,
      'discount',
      '20%'
    )
  );
-- =============================================
-- VERIFICATION QUERY
-- Run this to verify seed data was inserted
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