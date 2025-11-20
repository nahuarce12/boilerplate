import { getEnvVar } from '@/lib/utils'
import type {
  PolarCheckoutSession,
  PolarSubscription,
  PolarProduct,
  PolarPrice,
  PolarOrder,
} from './types'

const POLAR_API_URL = process.env.POLAR_API_URL || 'https://api.polar.sh/v1'

interface PolarListResponse<T> {
  items: T[]
  pagination: {
    total_count: number
    max_page_size: number
  }
}

/**
 * Polar API Client
 * Wrapper around Polar's REST API
 */
export class PolarClient {
  private apiKey: string
  private organizationId: string

  constructor() {
    // Use environment variables directly without getEnvVar wrapper
    const token = process.env.POLAR_ACCESS_TOKEN
    const orgId = process.env.NEXT_PUBLIC_POLAR_ORGANIZATION_ID
    
    if (!token) {
      throw new Error(
        `POLAR_ACCESS_TOKEN is not set. Current value: "${token}". ` +
        `Check your .env.local file. Available POLAR vars: ${Object.keys(process.env)
          .filter(k => k.includes('POLAR'))
          .join(', ')}`
      )
    }
    
    if (!orgId) {
      throw new Error('NEXT_PUBLIC_POLAR_ORGANIZATION_ID is not set')
    }
    
    this.apiKey = token
    this.organizationId = orgId
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${POLAR_API_URL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Polar API error: ${response.status} ${error}`)
    }

    return response.json()
  }

  /**
   * Get all products for the organization
   */
  async getProducts(): Promise<PolarProduct[]> {
    const response = await this.fetch<PolarListResponse<PolarProduct>>(
      `/organizations/${this.organizationId}/products`
    )
    return response.items
  }

  /**
   * Get a specific product by ID
   */
  async getProduct(productId: string): Promise<PolarProduct> {
    return this.fetch<PolarProduct>(`/products/${productId}`)
  }

  /**
   * Get all prices for a product
   */
  async getPricesForProduct(productId: string): Promise<PolarPrice[]> {
    const response = await this.fetch<PolarListResponse<PolarPrice>>(`/products/${productId}/prices`)
    return response.items
  }

  /**
   * Create a checkout session
   */
  async createCheckoutSession(params: {
    productId: string
    priceId: string
    customerEmail?: string
    successUrl: string
    cancelUrl?: string
    metadata?: Record<string, string>
  }): Promise<PolarCheckoutSession> {
    return this.fetch<PolarCheckoutSession>('/checkouts', {
      method: 'POST',
      body: JSON.stringify({
        product_id: params.productId,
        price_id: params.priceId,
        customer_email: params.customerEmail,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata,
      }),
    })
  }

  /**
   * Get a checkout session by ID
   */
  async getCheckout(checkoutId: string): Promise<PolarCheckoutSession> {
    return this.fetch<PolarCheckoutSession>(`/checkouts/${checkoutId}`)
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<PolarSubscription> {
    return this.fetch<PolarSubscription>(`/subscriptions/${subscriptionId}`)
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<PolarSubscription> {
    return this.fetch<PolarSubscription>(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Update subscription (e.g., change plan)
   */
  async updateSubscription(
    subscriptionId: string,
    params: {
      priceId?: string
      metadata?: Record<string, string>
    }
  ): Promise<PolarSubscription> {
    return this.fetch<PolarSubscription>(`/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        price_id: params.priceId,
        metadata: params.metadata,
      }),
    })
  }

  /**
   * List all subscriptions for a customer
   */
  async getCustomerSubscriptions(
    customerEmail: string
  ): Promise<PolarSubscription[]> {
    const response = await this.fetch<PolarListResponse<PolarSubscription>>(
      `/subscriptions?customer_email=${encodeURIComponent(customerEmail)}`
    )
    return response.items
  }

  /**
   * List orders with optional filters
   */
  async listOrders(params?: {
    customerId?: string
    limit?: number
  }): Promise<PolarOrder[]> {
    const searchParams = new URLSearchParams()
    if (params?.customerId) {
      searchParams.append('customer_id', params.customerId)
    }
    if (params?.limit) {
      searchParams.append('limit', params.limit.toString())
    }

    const query = searchParams.toString()
    const endpoint = query ? `/orders?${query}` : '/orders'
    
    const response = await this.fetch<PolarListResponse<PolarOrder>>(endpoint)
    return response.items
  }

  /**
   * Get a specific order by ID
   */
  async getOrder(orderId: string): Promise<PolarOrder> {
    return this.fetch<PolarOrder>(`/orders/${orderId}`)
  }
}

// Singleton instance
let polarClient: PolarClient | null = null

export function getPolarClient(): PolarClient {
  if (!polarClient) {
    polarClient = new PolarClient()
  }
  return polarClient
}
