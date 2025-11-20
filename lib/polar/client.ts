import { getEnvVar } from '@/lib/utils'
import type {
  PolarCheckoutSession,
  PolarSubscription,
  PolarProduct,
  PolarPrice,
} from './types'

const POLAR_API_URL = 'https://api.polar.sh/v1'

/**
 * Polar API Client
 * Wrapper around Polar's REST API
 */
export class PolarClient {
  private apiKey: string
  private organizationId: string

  constructor() {
    this.apiKey = getEnvVar('POLAR_API_KEY')
    this.organizationId = getEnvVar('NEXT_PUBLIC_POLAR_ORGANIZATION_ID')
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
    return this.fetch<PolarProduct[]>(
      `/organizations/${this.organizationId}/products`
    )
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
    return this.fetch<PolarPrice[]>(`/products/${productId}/prices`)
  }

  /**
   * Create a checkout session
   */
  async createCheckoutSession(params: {
    productId: string
    priceId: string
    customerEmail?: string
    successUrl: string
    metadata?: Record<string, string>
  }): Promise<PolarCheckoutSession> {
    return this.fetch<PolarCheckoutSession>('/checkouts', {
      method: 'POST',
      body: JSON.stringify({
        product_id: params.productId,
        price_id: params.priceId,
        customer_email: params.customerEmail,
        success_url: params.successUrl,
        metadata: params.metadata,
      }),
    })
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
    return this.fetch<PolarSubscription[]>(
      `/subscriptions?customer_email=${encodeURIComponent(customerEmail)}`
    )
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
