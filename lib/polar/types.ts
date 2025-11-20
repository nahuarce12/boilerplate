// Polar API types based on their webhook events and API responses

export interface PolarCustomer {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export interface PolarProduct {
  id: string
  name: string
  description: string | null
  is_archived: boolean
  is_highlighted: boolean
  prices: PolarPrice[]
  benefits: PolarBenefit[]
  medias: PolarMedia[]
}

export interface PolarPrice {
  id: string
  type: 'recurring' | 'one_time'
  recurring_interval: 'month' | 'year' | null
  price_amount: number
  price_currency: string
  is_archived: boolean
}

export interface PolarBenefit {
  id: string
  description: string
  type: string
}

export interface PolarMedia {
  id: string
  public_url: string
  organization_id: string
}

export interface PolarCheckoutSession {
  id: string
  url: string
  customer_email?: string
  customer_name?: string
  product_id: string
  price_id: string
  success_url: string
  cancel_url?: string
  amount: number | null
  currency: string | null
  status: 'open' | 'expired' | 'completed'
  metadata?: Record<string, string>
}

export interface PolarSubscription {
  id: string
  status:
    | 'incomplete'
    | 'incomplete_expired'
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
  customer_id: string
  product_id: string
  price_id: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at?: string
  ended_at?: string
  trial_start?: string
  trial_end?: string
  metadata?: Record<string, string>
}

export interface PolarOrder {
  id: string
  customer_id: string
  product_id: string
  price_id: string
  subscription_id?: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  created_at: string
  metadata?: Record<string, string>
}

// Webhook event types
export type PolarWebhookEvent =
  | PolarSubscriptionCreatedEvent
  | PolarSubscriptionUpdatedEvent
  | PolarSubscriptionCanceledEvent
  | PolarPaymentSucceededEvent
  | PolarPaymentFailedEvent

export interface PolarWebhookEventBase {
  id: string
  type: string
  created_at: string
}

export interface PolarSubscriptionCreatedEvent extends PolarWebhookEventBase {
  type: 'subscription.created'
  data: PolarSubscription
}

export interface PolarSubscriptionUpdatedEvent extends PolarWebhookEventBase {
  type: 'subscription.updated'
  data: PolarSubscription
}

export interface PolarSubscriptionCanceledEvent extends PolarWebhookEventBase {
  type: 'subscription.canceled'
  data: PolarSubscription
}

export interface PolarPaymentSucceededEvent extends PolarWebhookEventBase {
  type: 'payment.succeeded'
  data: {
    id: string
    amount: number
    currency: string
    customer_id: string
    subscription_id?: string
  }
}

export interface PolarPaymentFailedEvent extends PolarWebhookEventBase {
  type: 'payment.failed'
  data: {
    id: string
    amount: number
    currency: string
    customer_id: string
    subscription_id?: string
    error_message?: string
  }
}
