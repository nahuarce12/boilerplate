'use server'

import { createClient } from '@/lib/supabase/server'
import { getPolarClient } from '@/lib/polar/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// =============================================
// VALIDATION SCHEMAS
// =============================================

const createCheckoutSchema = z.object({
  productId: z.string().uuid(),
  priceId: z.string(),
})

// =============================================
// TYPES
// =============================================

type ActionResult<T = null> = {
  success: boolean
  data?: T
  error?: string
}

// =============================================
// SUBSCRIPTION ACTIONS
// =============================================

/**
 * Create a Polar checkout session
 */
export async function createCheckoutSession(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate input
    const rawData = {
      productId: formData.get('productId') as string,
      priceId: formData.get('priceId') as string,
    }

    const validatedData = createCheckoutSchema.parse(rawData)

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'User profile not found' }
    }

    // Create checkout session with Polar
    const polarClient = getPolarClient()
    const session = await polarClient.createCheckoutSession({
      productId: validatedData.productId,
      priceId: validatedData.priceId,
      customerEmail: profile.email,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      metadata: {
        user_id: user.id,
      },
    })

    return {
      success: true,
      data: { url: session.url },
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create checkout',
    }
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify subscription belongs to user
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('polar_subscription_id')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return { success: false, error: 'Subscription not found' }
    }

    // Cancel with Polar
    const polarClient = getPolarClient()
    await polarClient.cancelSubscription(subscription.polar_subscription_id)

    // Update local database
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
      })
      .eq('id', subscriptionId)

    revalidatePath('/dashboard/billing')

    return { success: true }
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel subscription',
    }
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify subscription belongs to user
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('polar_subscription_id')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return { success: false, error: 'Subscription not found' }
    }

    // Update subscription with Polar to remove cancellation
    const polarClient = getPolarClient()
    await polarClient.updateSubscription(subscription.polar_subscription_id, {
      metadata: { cancel_at_period_end: 'false' },
    })

    // Update local database
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
      })
      .eq('id', subscriptionId)

    revalidatePath('/dashboard/billing')

    return { success: true }
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to reactivate subscription',
    }
  }
}

/**
 * Get user's active subscription
 */
export async function getUserSubscription(): Promise<
  ActionResult<{
    id: string
    product_id: string
    status: string
    current_period_end: string
    cancel_at_period_end: boolean
  } | null>
> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, product_id, status, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return {
      success: true,
      data: subscription || null,
    }
  } catch (error) {
    console.error('Error getting user subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get subscription',
    }
  }
}
