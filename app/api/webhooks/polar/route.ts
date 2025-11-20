/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils'
import {
  verifyWebhookSignature,
  extractWebhookSignature,
  parseWebhookPayload,
} from '@/lib/polar/webhooks'
import type { PolarWebhookEvent } from '@/lib/polar/types'

/**
 * Polar Webhook Handler
 * Processes webhook events from Polar for subscription management
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = extractWebhookSignature(request.headers)

    if (!signature) {
      return createErrorResponse('Missing webhook signature', 401)
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      return createErrorResponse('Invalid webhook signature', 401)
    }

    // Parse webhook payload
    const event = parseWebhookPayload<PolarWebhookEvent>(rawBody)

    if (!event) {
      return createErrorResponse('Invalid webhook payload', 400)
    }

    // Check for duplicate events (idempotency)
    const supabase = createServiceClient()
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', event.id as any)
      .single()

    if (existingEvent) {
      console.log(`Webhook event ${event.id} already processed`)
      return createSuccessResponse({ received: true, duplicate: true })
    }

    // Store webhook event
    await supabase.from('webhook_events').insert({
      event_id: event.id,
      event_type: event.type,
      payload: event as any,
      processed: false,
    } as any)

    // Process the event
    await processWebhookEvent(event)

    // Mark as processed
    await supabase
      .from('webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() } as any)
      .eq('event_id', event.id as any)

    return createSuccessResponse({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

/**
 * Process different types of webhook events
 */
async function processWebhookEvent(event: PolarWebhookEvent) {
  const supabase = createServiceClient()

  switch (event.type) {
    case 'subscription.created':
      await handleSubscriptionCreated(event.data, supabase)
      break

    case 'subscription.updated':
      await handleSubscriptionUpdated(event.data, supabase)
      break

    case 'subscription.canceled':
      await handleSubscriptionCanceled(event.data, supabase)
      break

    case 'payment.succeeded':
      await handlePaymentSucceeded(event.data, supabase)
      break

    case 'payment.failed':
      await handlePaymentFailed(event.data, supabase)
      break

    default:
      // @ts-ignore
      console.log(`Unhandled webhook event type: ${event.type}`)
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(
  subscription: any,
  supabase: any
) {
  // Find user by customer email
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', subscription.customer_email)
    .single()

  if (!user) {
    console.error(`User not found for email: ${subscription.customer_email}`)
    return
  }

  // Find product by polar_product_id
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('polar_product_id', subscription.product_id)
    .single()

  // Create subscription record
  await supabase.from('subscriptions').insert({
    user_id: user.id,
    product_id: product?.id,
    polar_subscription_id: subscription.id,
    status: subscription.status,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    trial_start: subscription.trial_start,
    trial_end: subscription.trial_end,
    cancel_at_period_end: subscription.cancel_at_period_end,
    metadata: subscription.metadata || {},
  } as any)

  console.log(`Subscription created: ${subscription.id}`)
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(
  subscription: any,
  supabase: any
) {
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      metadata: subscription.metadata || {},
    } as any)
    .eq('polar_subscription_id', subscription.id)

  console.log(`Subscription updated: ${subscription.id}`)
}

/**
 * Handle subscription canceled event
 */
async function handleSubscriptionCanceled(
  subscription: any,
  supabase: any
) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: subscription.canceled_at || new Date().toISOString(),
      cancel_at_period_end: false,
    } as any)
    .eq('polar_subscription_id', subscription.id)

  console.log(`Subscription canceled: ${subscription.id}`)
}

/**
 * Handle payment succeeded event
 */
async function handlePaymentSucceeded(
  payment: any,
  supabase: any
) {
  // If payment is for a subscription, ensure subscription is active
  if (payment.subscription_id) {
    await supabase
      .from('subscriptions')
      .update({ status: 'active' } as any)
      .eq('polar_subscription_id', payment.subscription_id)
  }

  console.log(`Payment succeeded: ${payment.id}`)
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(
  payment: any,
  supabase: any
) {
  // If payment is for a subscription, mark it as past_due
  if (payment.subscription_id) {
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' } as any)
      .eq('polar_subscription_id', payment.subscription_id)
  }

  console.log(`Payment failed: ${payment.id}`)
}
