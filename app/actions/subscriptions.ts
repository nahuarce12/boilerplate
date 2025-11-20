'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getPolarClient } from '@/lib/polar/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// =============================================
// VALIDATION SCHEMAS
// =============================================

const createCheckoutSchema = z.object({
  productId: z.string(),
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

    // Get product from database to verify it exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('polar_product_id, name')
      .eq('id', validatedData.productId)
      .single()

    if (productError || !product) {
      return { success: false, error: 'Product not found' }
    }

    // Create checkout session with Polar
    const polarClient = getPolarClient()
    
    try {
      const session = await polarClient.createCheckoutSession({
        productId: product.polar_product_id,
        priceId: validatedData.priceId,
        customerEmail: user.email || '',
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
        metadata: {
          user_id: user.id,
          product_name: product.name,
        },
      })

      return {
        success: true,
        data: { url: session.url },
      }
    } catch (polarError) {
      console.error('Polar API error:', polarError)
      return {
        success: false,
        error: `Failed to create Polar checkout: ${polarError instanceof Error ? polarError.message : 'Unknown error'}`,
      }
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
        updated_at: new Date().toISOString(),
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

    // Update subscription with Polar
    const polarClient = getPolarClient()
    await polarClient.updateSubscription(subscription.polar_subscription_id, {
      metadata: { cancel_at_period_end: 'false' },
    })

    // Update local database
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
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
 * Sync subscription status with Polar
 * Useful when webhooks might have been missed (e.g. localhost)
 */
export async function syncSubscription(): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || !user.email) {
      return { success: false, error: 'Not authenticated' }
    }

    const polarClient = getPolarClient()
    const subscriptions = await polarClient.getCustomerSubscriptions(user.email)

    // Find active subscription
    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing'
    )

    if (!activeSubscription) {
      // If no active subscription found in Polar, ensure local DB reflects that
      // This might be dangerous if Polar API returns empty list by mistake, 
      // but for sync purposes it's acceptable to assume truth from Polar.
      // For now, we'll just return success if nothing found to sync.
      return { success: true }
    }

    // Use service client for DB writes to bypass RLS
    const supabaseAdmin = createServiceClient()

    // Ensure user exists in public.users (fix for missing trigger execution)
    const { data: publicUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!publicUser) {
      console.log(`User ${user.id} missing in public.users. Creating now...`)
      const { error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
        })
      
      if (createUserError) {
        console.error('Failed to create public user record:', createUserError)
        throw new Error(`Failed to ensure user record exists: ${createUserError.message}`)
      }
    }

    // Find corresponding local product
    let { data: product } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('polar_product_id', activeSubscription.product_id)
      .single()

    if (!product) {
      console.log(`Product not found for Polar ID: ${activeSubscription.product_id}. Attempting to create it...`)
      
      try {
        // Fetch product details from Polar
        const polarProduct = await polarClient.getProduct(activeSubscription.product_id)
        
        // Fetch prices to find the one matching the subscription
        const polarPrices = await polarClient.getPricesForProduct(activeSubscription.product_id)
        const activePrice = polarPrices.find(p => p.id === activeSubscription.price_id) || polarPrices[0]
        
        if (polarProduct && activePrice) {
          // Insert the missing product into local DB
          const { data: newProduct, error: createError } = await supabaseAdmin
            .from('products')
            .insert({
              polar_product_id: polarProduct.id,
              name: polarProduct.name,
              description: polarProduct.description || '',
              price_amount: activePrice.price_amount,
              interval: activePrice.recurring_interval || 'month',
              is_active: !polarProduct.is_archived,
              features: polarProduct.benefits ? JSON.stringify(polarProduct.benefits) : '[]'
            })
            .select('id')
            .single()
            
          if (createError) {
            console.error('Failed to create local product:', createError)
            throw new Error(`Failed to create local product: ${createError.message}`)
          }
          
          product = newProduct
        } else {
          throw new Error('Could not fetch product or price details from Polar')
        }
      } catch (err) {
        console.error('Error auto-creating product:', err)
        return { 
          success: false, 
          error: `Synced product not found and could not be created: ${err instanceof Error ? err.message : 'Unknown error'}` 
        }
      }
    }

    // Upsert subscription
    const { error: upsertError } = await supabaseAdmin
      .from('subscriptions')
      .upsert(
        {
          user_id: user.id,
          product_id: product.id,
          polar_subscription_id: activeSubscription.id,
          status: activeSubscription.status,
          current_period_end: activeSubscription.current_period_end,
          cancel_at_period_end: activeSubscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'polar_subscription_id',
        }
      )

    if (upsertError) {
      console.error('Upsert error:', upsertError)
      throw new Error(`Database error: ${upsertError.message}`)
    }

    revalidatePath('/dashboard/billing')
    return { success: true }
  } catch (error) {
    console.error('Error syncing subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync subscription',
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
    product_name: string
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
      .select(`
        id, 
        product_id, 
        status, 
        current_period_end, 
        cancel_at_period_end,
        products (
          name
        )
      `)
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!subscription) {
      return { success: true, data: null }
    }

    const products = subscription.products as unknown as { name: string } | { name: string }[] | null
    const productName = Array.isArray(products) 
      ? products[0]?.name 
      : products?.name

    return {
      success: true,
      data: {
        id: subscription.id,
        product_id: subscription.product_id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        product_name: productName || 'Unknown Plan',
      },
    }
  } catch (error) {
    console.error('Error getting user subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get subscription',
    }
  }
}