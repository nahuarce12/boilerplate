-- Enable UUID extension
create extension if not exists "uuid-ossp";
-- =============================================
-- USERS TABLE
-- Extends auth.users with profile information
-- =============================================
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
-- Enable Row Level Security
alter table public.users enable row level security;
-- RLS Policies for users
create policy "Users can view own profile" on public.users for
select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for
update using (auth.uid() = id);
-- Trigger to automatically create user profile on signup
create or replace function public.handle_new_user() returns trigger as $$ begin
insert into public.users (id, email, full_name, avatar_url)
values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();
-- =============================================
-- PRODUCTS TABLE
-- Stores pricing plans and product information
-- =============================================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  polar_product_id text unique,
  name text not null,
  description text,
  price_amount integer not null,
  -- in cents
  interval text not null check (interval in ('month', 'year')),
  features jsonb default '[]'::jsonb,
  is_active boolean default true,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
-- Enable Row Level Security
alter table public.products enable row level security;
-- RLS Policies for products (public read access)
create policy "Anyone can view active products" on public.products for
select using (is_active = true);
-- =============================================
-- SUBSCRIPTIONS TABLE
-- Tracks user subscriptions and billing status
-- =============================================
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users on delete cascade not null,
  product_id uuid references public.products on delete restrict,
  polar_subscription_id text unique,
  status text not null check (
    status in (
      'active',
      'canceled',
      'past_due',
      'unpaid',
      'trialing',
      'incomplete',
      'incomplete_expired',
      'paused'
    )
  ),
  cancel_at_period_end boolean default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  canceled_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
-- Enable Row Level Security
alter table public.subscriptions enable row level security;
-- RLS Policies for subscriptions
create policy "Users can view own subscriptions" on public.subscriptions for
select using (auth.uid() = user_id);
-- Index for faster lookups
create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_status_idx on public.subscriptions(status);
create index subscriptions_polar_id_idx on public.subscriptions(polar_subscription_id);
-- =============================================
-- USAGE RECORDS TABLE
-- Tracks usage metrics for metered billing
-- =============================================
create table public.usage_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users on delete cascade not null,
  subscription_id uuid references public.subscriptions on delete cascade,
  metric text not null,
  quantity integer not null default 0,
  metadata jsonb default '{}'::jsonb,
  recorded_at timestamptz default now() not null
);
-- Enable Row Level Security
alter table public.usage_records enable row level security;
-- RLS Policies for usage records
create policy "Users can view own usage records" on public.usage_records for
select using (auth.uid() = user_id);
-- Index for faster lookups
create index usage_records_user_id_idx on public.usage_records(user_id);
create index usage_records_subscription_id_idx on public.usage_records(subscription_id);
create index usage_records_recorded_at_idx on public.usage_records(recorded_at);
-- =============================================
-- WEBHOOK EVENTS TABLE
-- Store webhook events for debugging and idempotency
-- =============================================
create table public.webhook_events (
  id uuid primary key default uuid_generate_v4(),
  event_id text unique not null,
  event_type text not null,
  payload jsonb not null,
  processed boolean default false,
  processed_at timestamptz,
  error text,
  created_at timestamptz default now() not null
);
-- Enable Row Level Security
alter table public.webhook_events enable row level security;
-- No public access to webhook events (admin only)
create policy "No public access to webhook events" on public.webhook_events for
select using (false);
-- Index for faster lookups
create index webhook_events_event_id_idx on public.webhook_events(event_id);
create index webhook_events_processed_idx on public.webhook_events(processed);
-- =============================================
-- HELPER FUNCTIONS
-- =============================================
-- Function to get active subscription for a user
create or replace function public.get_user_active_subscription(user_uuid uuid) returns table (
    id uuid,
    product_id uuid,
    status text,
    current_period_end timestamptz
  ) as $$ begin return query
select s.id,
  s.product_id,
  s.status,
  s.current_period_end
from public.subscriptions s
where s.user_id = user_uuid
  and s.status in ('active', 'trialing')
order by s.created_at desc
limit 1;
end;
$$ language plpgsql security definer;
-- Function to check if user has access to a feature
create or replace function public.user_has_feature(user_uuid uuid, feature_name text) returns boolean as $$
declare has_feature boolean;
begin
select exists(
    select 1
    from public.subscriptions s
      join public.products p on s.product_id = p.id
    where s.user_id = user_uuid
      and s.status in ('active', 'trialing')
      and p.features @> jsonb_build_array(jsonb_build_object('name', feature_name))
  ) into has_feature;
return has_feature;
end;
$$ language plpgsql security definer;
-- =============================================
-- UPDATED_AT TRIGGERS
-- Automatically update updated_at timestamps
-- =============================================
create or replace function public.handle_updated_at() returns trigger as $$ begin new.updated_at = now();
return new;
end;
$$ language plpgsql;
create trigger users_updated_at before
update on public.users for each row execute procedure public.handle_updated_at();
create trigger products_updated_at before
update on public.products for each row execute procedure public.handle_updated_at();
create trigger subscriptions_updated_at before
update on public.subscriptions for each row execute procedure public.handle_updated_at();