/**
 * Pricing Plans Configuration
 * Centralized configuration for all pricing tiers and features
 */

export type PricingInterval = 'month' | 'year'

export interface PricingPlan {
  id: string
  polar_product_id: string
  name: string
  description: string
  price: number // in dollars
  interval: PricingInterval
  features: string[]
  popular?: boolean
  recommended?: boolean
}

export const pricingPlans: PricingPlan[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    polar_product_id: '51229394-aca6-4f39-94f4-4f2ecb5c7d96',
    name: 'Basic',
    description: 'Perfect for individuals getting started',
    price: 5.00,
    interval: 'month',
    features: [
      'Basic Features',
      'Up to 1,000 API calls/month',
      '1 GB Storage',
      'Email Support',
      'Community Access',
    ],
    recommended: false,
    popular: false,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    polar_product_id: 'e9b637a7-84f6-4611-bdc7-80c70eec3420',
    name: 'Pro',
    description: 'Ideal for professionals and small teams',
    price: 9.90,
    interval: 'month',
    features: [
      'All Basic Features',
      'Up to 10,000 API calls/month',
      '10 GB Storage',
      'Priority Support',
      'Advanced Analytics',
      'Custom Integrations',
    ],
    popular: true,
    recommended: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    polar_product_id: 'df52cedf-399e-46da-ab95-e50d2aa2150c',
    name: 'Max',
    description: 'For power users and growing teams',
    price: 15.00,
    interval: 'month',
    features: [
      'All Pro Features',
      'Unlimited API calls',
      '50 GB Storage',
      '24/7 Priority Support',
      'Advanced Security',
      'Team Collaboration (up to 10 users)',
      'Custom Workflows',
    ],
    popular: false,
    recommended: false,
  },
]

/**
 * Get plan by ID
 */
export function getPlanById(planId: string): PricingPlan | undefined {
  return pricingPlans.find((plan) => plan.id === planId)
}

/**
 * Get plan by Polar product ID
 */
export function getPlanByPolarProductId(
  polarProductId: string
): PricingPlan | undefined {
  return pricingPlans.find(
    (plan) => plan.polar_product_id === polarProductId
  )
}

/**
 * Get recommended plan
 */
export function getRecommendedPlan(): PricingPlan | undefined {
  return pricingPlans.find((plan) => plan.recommended)
}
