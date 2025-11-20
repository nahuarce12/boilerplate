# Polar Integration Setup Guide

## 🎯 Overview

Complete Polar payment integration with checkout, subscriptions, webhooks, and order tracking.

## ✅ What's Been Implemented

### 1. Database Schema

- **Products table**: Stores pricing plans with Polar product IDs
- **Subscriptions table**: Tracks user subscriptions
- **Seed data**: 3 products ready to insert (Basic $5, Pro $9.90, Max $15)

### 2. Polar Client (`lib/polar/client.ts`)

Complete API wrapper with methods:

- `getProducts()` - List all products
- `getProduct(id)` - Get single product
- `getPricesForProduct(id)` - Get product prices
- `createCheckoutSession()` - Create checkout with cancelUrl support
- `getCheckout(id)` - Get checkout status
- `getSubscription(id)` - Get subscription details
- `cancelSubscription(id)` - Cancel subscription
- `updateSubscription(id, params)` - Update subscription
- `getCustomerSubscriptions(email)` - List customer subscriptions
- `listOrders(params)` - List orders with filters
- `getOrder(id)` - Get specific order

### 3. Server Actions (`app/actions/subscriptions.ts`)

- `createCheckoutSession()` - Creates Polar checkout with success/cancel URLs
- `cancelSubscription()` - Cancel user subscription
- `reactivateSubscription()` - Reactivate canceled subscription
- `getUserSubscription()` - Get user's active subscription

### 4. UI Components

- **PricingCard** (`components/landing/PricingCard.tsx`): Interactive pricing card with checkout button
- **Pricing** (`components/landing/Pricing.tsx`): Pricing section that fetches from database
- **Success page** (`app/dashboard/billing/success/page.tsx`): Post-checkout success
- **Canceled page** (`app/dashboard/billing/canceled/page.tsx`): Post-checkout cancel

### 5. Webhook Handler (`app/api/webhooks/polar/route.ts`)

Handles Polar events:

- `subscription.created` - Creates subscription in database
- `subscription.updated` - Updates subscription status
- `subscription.canceled` - Marks subscription as canceled
- `checkout.completed` - Processes successful checkouts

## 🚀 Next Steps to Complete Integration

### Step 1: Run Database Seed

Execute the seed SQL in your Supabase SQL Editor:

1. Go to: https://supabase.com/dashboard/project/ihhvnhtkcrvymkmionbm/sql/new
2. Copy the contents of `supabase/seed.sql`
3. Click "Run" to insert your 3 products

Or run via CLI:

```powershell
psql "$DATABASE_URL" -f supabase/seed.sql
```

### Step 2: Configure Polar Webhook

1. Go to your Polar dashboard: https://polar.sh/dashboard
2. Navigate to Settings → Webhooks → Add Endpoint
3. Add webhook URL: `https://your-domain.com/api/webhooks/polar`
   - **For local testing (sandbox mode)**: Polar will work without webhooks
   - **For production**: Use your deployed URL
4. Select events to subscribe:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `checkout.completed`

### Step 3: Get Polar Product Price IDs

Your products need price IDs for checkout. Get them from Polar:

1. Go to Polar dashboard → Products
2. Click on each product (Basic, Pro, Max)
3. Copy the **Price ID** (different from Product ID)
4. Update in your checkout calls if needed

The price ID is typically auto-selected if product has only one price.

### Step 4: Test Checkout Flow

#### Test Card Numbers (Sandbox Mode):

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`

Use any future date for expiry and any 3 digits for CVC.

#### Testing Steps:

1. Start your dev server: `npm run dev`
2. Navigate to homepage pricing section
3. Click "Get Started" on any plan
4. You'll be redirected to Polar checkout
5. Complete payment with test card
6. You'll be redirected to `/dashboard/billing?success=true`

### Step 5: Verify Webhook Processing

After successful checkout:

1. Check Polar dashboard → Webhooks → Logs
2. Verify events were sent
3. Check your database:

```sql
SELECT * FROM subscriptions WHERE user_id = 'YOUR_USER_ID';
```

## 🔧 Configuration

### Environment Variables (Already Set)

```env
# Polar
POLAR_ACCESS_TOKEN=polar_oat_96LYs2fC3l59MmvMXeQ1qdTA9ZHiuxgENfMtW4PvFWd
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=your_org_id

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### Product IDs in Database

```
Basic: 51229394-aca6-4f39-94f4-4f2ecb5c7d96
Pro:   e9b637a7-84f6-4611-bdc7-80c70eec3420
Max:   df52cedf-399e-46da-ab95-e50d2aa2150c
```

## 📊 Checkout Flow Diagram

```
User clicks "Get Started"
    ↓
createCheckoutSession() server action
    ↓
Polar API creates checkout session
    ↓
User redirected to Polar checkout page
    ↓
User completes payment
    ↓
Polar sends webhook to /api/webhooks/polar
    ↓
Webhook creates subscription in database
    ↓
User redirected to /dashboard/billing?success=true
```

## 🛠️ API Usage Examples

### Create Checkout (from client component)

```typescript
const formData = new FormData()
formData.append('productId', '00000000-0000-0000-0000-000000000001')
formData.append('priceId', '51229394-aca6-4f39-94f4-4f2ecb5c7d96')

const result = await createCheckoutSession(formData)
if (result.success && result.data?.url) {
  window.location.href = result.data.url
}
```

### Cancel Subscription

```typescript
const result = await cancelSubscription(subscriptionId)
if (result.success) {
  // Subscription will cancel at period end
}
```

### Get User Subscription

```typescript
const result = await getUserSubscription()
if (result.success && result.data) {
  console.log('Active subscription:', result.data)
}
```

## 🔍 Testing Checklist

- [ ] Run seed.sql in Supabase
- [ ] Products visible on homepage pricing section
- [ ] Click "Get Started" redirects to Polar checkout
- [ ] Complete test payment with card 4242...
- [ ] Redirected to success page
- [ ] Subscription appears in database
- [ ] Webhook events logged in Polar dashboard
- [ ] Cancel subscription works
- [ ] Reactivate subscription works

## 📝 Notes

- **Sandbox Mode**: You're in Polar sandbox - no real charges
- **No ngrok needed**: Webhooks work in production, local testing works without them
- **Price in cents**: Database stores prices in cents (500 = $5.00)
- **Features as JSONB**: Features stored as JSON array in database

## 🎉 You're All Set!

Your Polar integration includes:
✅ Complete checkout flow
✅ Subscription management
✅ Webhook processing
✅ Order tracking (API methods ready)
✅ Success/cancel pages
✅ Database integration
✅ Type-safe TypeScript

Just run the seed SQL and you're ready to test!
