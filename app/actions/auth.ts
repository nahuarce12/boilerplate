'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// =============================================
// VALIDATION SCHEMAS
// =============================================

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
})

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
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
// AUTH ACTIONS
// =============================================

export async function signUp(
  formData: FormData
): Promise<ActionResult<{ needsEmailConfirmation: boolean }>> {
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      fullName: formData.get('fullName') as string,
    }

    const validatedData = signUpSchema.parse(rawData)

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.fullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    const needsEmailConfirmation = data.user?.identities?.length === 0

    revalidatePath('/', 'layout')
    
    if (!needsEmailConfirmation) {
      redirect('/dashboard')
    }

    return {
      success: true,
      data: { needsEmailConfirmation: true },
    }
  } catch (error) {
    if ((error as Error & { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validatedData = signInSchema.parse(rawData)

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (error) {
    if ((error as Error & { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resetPassword(
  formData: FormData
): Promise<ActionResult> {
  try {
    const rawData = {
      email: formData.get('email') as string,
    }

    const validatedData = resetPasswordSchema.parse(rawData)

    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(
      validatedData.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
      }
    )

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updatePassword(
  formData: FormData
): Promise<ActionResult> {
  try {
    const rawData = {
      password: formData.get('password') as string,
    }

    const validatedData = updatePasswordSchema.parse(rawData)

    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: validatedData.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (error) {
    if ((error as Error & { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function signInWithOAuth(
  provider: 'google' | 'github'
): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: { url: data.url } }
}
