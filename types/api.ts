/**
 * API Response Types
 * Standard response types for API routes
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ErrorResponse {
  error: string
  details?: any
  statusCode: number
}

/**
 * User Types
 */
export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

/**
 * Subscription Types
 */
export interface Subscription {
  id: string
  user_id: string
  product_id: string | null
  polar_subscription_id: string | null
  status:
    | 'active'
    | 'canceled'
    | 'past_due'
    | 'unpaid'
    | 'trialing'
    | 'incomplete'
    | 'incomplete_expired'
    | 'paused'
  cancel_at_period_end: boolean
  current_period_start: string | null
  current_period_end: string | null
  trial_start: string | null
  trial_end: string | null
  canceled_at: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  products?: Product
}

/**
 * Product Types
 */
export interface Product {
  id: string
  polar_product_id: string | null
  name: string
  description: string | null
  price_amount: number
  interval: 'month' | 'year'
  features: Feature[]
  is_active: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Feature {
  name: string
  included: boolean
}

/**
 * Usage Record Types
 */
export interface UsageRecord {
  id: string
  user_id: string
  subscription_id: string | null
  metric: string
  quantity: number
  metadata: Record<string, any>
  recorded_at: string
}

/**
 * Auth Types
 */
export interface AuthSession {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials extends LoginCredentials {
  fullName: string
}
