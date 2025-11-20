import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils'
import { NextRequest } from 'next/server'

/**
 * GET /api/subscriptions/[id]
 * Get a specific subscription by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { id } = params

    // Get subscription with product details
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(
        `
        *,
        products (
          id,
          name,
          description,
          price_amount,
          interval,
          features
        )
      `
      )
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Subscription not found', 404)
      }
      return createErrorResponse(error.message, 500)
    }

    return createSuccessResponse(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
