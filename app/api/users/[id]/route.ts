import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const updateUserSchema = z.object({
  full_name: z.string().min(2).optional(),
  avatar_url: z.string().url().optional(),
})

/**
 * GET /api/users/[id]
 * Get user profile by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { id } = params

    // Users can only access their own profile
    if (authUser.id !== id) {
      return createErrorResponse('Forbidden', 403)
    }

    // Get user profile
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('User not found', 404)
      }
      return createErrorResponse(error.message, 500)
    }

    return createSuccessResponse(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

/**
 * PATCH /api/users/[id]
 * Update user profile
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { id } = params

    // Users can only update their own profile
    if (authUser.id !== id) {
      return createErrorResponse('Forbidden', 403)
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Update user profile
    const { data: user, error } = await supabase
      .from('users')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return createErrorResponse(error.message, 500)
    }

    return createSuccessResponse(user)
  } catch (error) {
    console.error('Error updating user:', error)
    if (error instanceof z.ZodError) {
      return createErrorResponse(error.errors[0].message, 400)
    }
    return createErrorResponse('Internal server error', 500)
  }
}
