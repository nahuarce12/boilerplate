# SaaS Boilerplate - Backend

A modern, production-ready SaaS backend boilerplate built with **Next.js 14**, **Supabase**, and **Polar**. This backend provides authentication, database management, subscription handling, and payment processing - ready to be extended for any SaaS application.

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase (PostgreSQL + Authentication)
- **Payments**: Polar (Subscription management)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Validation**: Zod

### Project Structure

```
c:\Saas\Boilerplate/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (backend)
│   │   ├── auth/
│   │   │   ├── callback/         # OAuth callback
│   │   │   └── signout/          # Sign out handler
│   │   ├── webhooks/
│   │   │   └── polar/            # Polar webhook handler
│   │   ├── subscriptions/        # Subscription queries
│   │   └── users/                # User management
│   ├── actions/                  # Server actions
│   │   ├── auth.ts               # Authentication actions
│   │   └── subscriptions.ts      # Subscription actions
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (placeholder)
│   ├── error.tsx                 # Error boundary
│   └── globals.css               # Global styles
│
├── lib/                          # Utility libraries
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── middleware.ts         # Session refresh helper
│   ├── polar/
│   │   ├── client.ts             # Polar API client
│   │   ├── webhooks.ts           # Webhook verification
│   │   └── types.ts              # Polar type definitions
│   └── utils.ts                  # Shared utilities
│
├── config/                       # Configuration
│   ├── site.ts                   # Site metadata
│   └── plans.ts                  # Pricing plans
│
├── types/                        # TypeScript types
│   ├── database.ts               # Supabase database types
│   └── api.ts                    # API response types
│
├── supabase/                     # Supabase configuration
│   ├── migrations/
│   │   └── 001_initial_schema.sql # Database schema
│   ├── seed.sql                  # Sample pricing data
│   └── config.toml               # Supabase config
│
└── middleware.ts                 # Auth middleware
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account ([supabase.com](https://supabase.com))
- Polar account ([polar.sh](https://polar.sh))

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for webhooks)
- `POLAR_API_KEY` - Your Polar API key
- `POLAR_WEBHOOK_SECRET` - Polar webhook secret
- `NEXT_PUBLIC_POLAR_ORGANIZATION_ID` - Your Polar organization ID

3. **Set up Supabase**:

Option A - Using Supabase CLI (Local Development):
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase instance
npm run supabase:start

# Apply migrations
supabase db reset
```

Option B - Using Supabase Cloud:
- Create a new project at [supabase.com](https://supabase.com)
- Run the migration SQL from `supabase/migrations/001_initial_schema.sql` in the SQL Editor
- Run the seed data from `supabase/seed.sql` to add sample pricing tiers

4. **Configure Polar**:
- Create products in your Polar dashboard matching the pricing tiers
- Set up webhook endpoint: `https://your-domain.com/api/webhooks/polar`
- Copy your webhook secret to `.env.local`

5. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📚 Features

### ✅ Authentication System

- **Email/Password**: Built-in authentication with Supabase
- **OAuth**: Support for Google, GitHub, and other providers
- **Magic Links**: Passwordless authentication option
- **Session Management**: Automatic token refresh via middleware
- **Protected Routes**: Route-level authentication checks

**Server Actions**:
- `signUp()` - Create new user account
- `signIn()` - Authenticate user
- `signOut()` - End user session
- `resetPassword()` - Send password reset email
- `updatePassword()` - Update user password
- `signInWithOAuth()` - OAuth authentication

### ✅ Database Schema

**Tables**:
- `users` - User profiles (extends `auth.users`)
- `products` - Pricing plans and features
- `subscriptions` - User subscriptions with status tracking
- `usage_records` - Usage tracking for metered billing
- `webhook_events` - Webhook event log for debugging

**Security**:
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Service role key required for admin operations

**Helper Functions**:
- `get_user_active_subscription()` - Get user's active subscription
- `user_has_feature()` - Check if user has access to a feature

### ✅ Subscription Management

**Polar Integration**:
- Checkout session creation
- Subscription lifecycle management
- Webhook processing for real-time updates
- Support for trials, upgrades, and cancellations

**API Routes**:
- `GET /api/subscriptions` - List user's subscriptions
- `GET /api/subscriptions/[id]` - Get subscription details

**Server Actions**:
- `createCheckoutSession()` - Create Polar checkout
- `cancelSubscription()` - Cancel subscription
- `reactivateSubscription()` - Reactivate canceled subscription
- `getUserSubscription()` - Get active subscription

**Webhook Handler**:
- `POST /api/webhooks/polar` - Process Polar webhooks
- Signature verification with `bodyParser: false`
- Idempotent event processing
- Handles: subscription.created, subscription.updated, subscription.canceled, payment.succeeded, payment.failed

### ✅ User Management

**API Routes**:
- `GET /api/users/[id]` - Get user profile
- `PATCH /api/users/[id]` - Update user profile

**Features**:
- Profile management (name, avatar)
- Self-service updates
- Auth-protected endpoints

### ✅ Pricing Plans

**Included Tiers** (with sample data):
- **Starter**: $9.99/month (20% off yearly)
- **Pro**: $29.99/month (20% off yearly) - Most Popular
- **Enterprise**: $99.99/month (20% off yearly)

All plans include:
- Feature flags in JSON format
- Monthly and yearly billing options
- Metadata for customization

## 🔐 Security

- **Webhook Verification**: HMAC signature validation for all Polar webhooks
- **Row Level Security**: Database-level access control
- **Environment Variables**: Sensitive data never committed to repo
- **TypeScript**: Full type safety across the codebase
- **Input Validation**: Zod schemas for all user inputs
- **Auth Middleware**: Automatic session refresh and route protection

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
npm run format       # Format code with Prettier

# Supabase
npm run supabase:start           # Start local Supabase
npm run supabase:stop            # Stop local Supabase
npm run supabase:generate-types  # Generate TypeScript types from schema
```

### Database Migrations

Add new migrations in `supabase/migrations/`:

```bash
# Create a new migration
supabase migration new your_migration_name

# Apply migrations
supabase db reset
```

### Type Generation

Generate TypeScript types from your Supabase schema:

```bash
npm run supabase:generate-types
```

This creates `types/database.ts` with all your table definitions.

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Setup

Ensure these environment variables are set in production:
- All variables from `.env.example`
- `NEXT_PUBLIC_APP_URL` should be your production URL
- Update Supabase redirect URLs in dashboard
- Configure Polar webhook URL to production endpoint

## 📖 API Documentation

### Authentication

All authenticated endpoints require a valid session cookie. The middleware automatically handles session refresh.

### Error Handling

Standard error response format:
```json
{
  "error": "Error message",
  "details": {}
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Rate Limiting

Consider implementing rate limiting for production. Recommended tools:
- Vercel Edge Config
- Upstash Redis
- Custom middleware

## 🎯 Next Steps

This backend is ready for frontend development. To complete your SaaS:

1. **Build Frontend Pages**:
   - Landing page with pricing
   - Sign up / Login forms
   - Dashboard
   - Settings page
   - Billing management

2. **Add Components**:
   - Navigation/Sidebar
   - Pricing cards
   - Subscription status
   - User profile editor

3. **Enhance Features**:
   - Email templates (Supabase)
   - Team collaboration
   - Usage tracking
   - Analytics integration

4. **Production Checklist**:
   - [ ] Set up monitoring (Sentry)
   - [ ] Configure error tracking
   - [ ] Add rate limiting
   - [ ] Set up backup strategy
   - [ ] Enable Supabase email confirmations
   - [ ] Test webhook handlers
   - [ ] Security audit
   - [ ] Performance testing

## 📝 Customization

### Adding New Features

1. **New Database Table**:
   - Add migration in `supabase/migrations/`
   - Update `types/database.ts`
   - Add RLS policies

2. **New API Endpoint**:
   - Create route in `app/api/`
   - Add authentication check
   - Add to API documentation

3. **New Server Action**:
   - Create in `app/actions/`
   - Add validation with Zod
   - Handle errors properly

### Modifying Pricing Plans

Update `config/plans.ts` and `supabase/seed.sql` to match your pricing structure. Remember to sync with Polar dashboard.

## 🤝 Contributing

This is a boilerplate project. Fork and customize for your needs!

## 📄 License

MIT License - feel free to use this for your projects.

## 🆘 Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Polar Docs**: [docs.polar.sh](https://docs.polar.sh)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Built with ❤️ for developers building SaaS products**
