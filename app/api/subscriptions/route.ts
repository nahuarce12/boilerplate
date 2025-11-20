import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils'
import { NextRequest } from 'next/server'

/**
 * GET /api/subscriptions
 * Get all subscriptions for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Get user's subscriptions with product details
    const { data: subscriptions, error } = await supabase
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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return createErrorResponse(error.message, 500)
    }

    return createSuccessResponse(subscriptions)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
