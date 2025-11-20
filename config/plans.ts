/**
 * Pricing Plans Configuration
 * Centralized configuration for all pricing tiers and features
 */

export type PricingInterval = 'month' | 'year'

export interface PricingFeature {
  name: string
  included: boolean
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  priceMonthly: number // in cents
  priceYearly: number // in cents
  interval: PricingInterval
  features: PricingFeature[]
  popular?: boolean
  recommended?: boolean
  cta: string
  polarProductIdMonthly?: string
  polarProductIdYearly?: string
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals and small projects',
    priceMonthly: 999, // $9.99
    priceYearly: 9588, // $95.88 (save 20%)
    interval: 'month',
    features: [
      { name: 'Basic Features', included: true },
      { name: 'Up to 1,000 API calls/month', included: true },
      { name: '1 GB Storage', included: true },
      { name: 'Email Support', included: true },
      { name: 'Community Access', included: true },
      { name: 'Advanced Analytics', included: false },
      { name: 'Priority Support', included: false },
      { name: 'Custom Integrations', included: false },
    ],
    popular: false,
    recommended: false,
    cta: 'Get Started',
    polarProductIdMonthly: 'prod_starter_monthly',
    polarProductIdYearly: 'prod_starter_yearly',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Ideal for growing businesses and teams',
    priceMonthly: 2999, // $29.99
    priceYearly: 28788, // $287.88 (save 20%)
    interval: 'month',
    features: [
      { name: 'All Starter Features', included: true },
      { name: 'Up to 10,000 API calls/month', included: true },
      { name: '10 GB Storage', included: true },
      { name: 'Priority Email Support', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Custom Integrations', included: true },
      { name: 'Team Collaboration (up to 5 users)', included: true },
      { name: 'Unlimited Team Members', included: false },
    ],
    popular: true,
    recommended: true,
    cta: 'Start Free Trial',
    polarProductIdMonthly: 'prod_pro_monthly',
    polarProductIdYearly: 'prod_pro_yearly',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    priceMonthly: 9999, // $99.99
    priceYearly: 95988, // $959.88 (save 20%)
    interval: 'month',
    features: [
      { name: 'All Pro Features', included: true },
      { name: 'Unlimited API calls', included: true },
      { name: '100 GB Storage', included: true },
      { name: '24/7 Phone & Email Support', included: true },
      { name: 'Advanced Security & Compliance', included: true },
      { name: 'Custom Integrations & Workflows', included: true },
      { name: 'Unlimited Team Members', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: 'SLA Guarantee (99.9% uptime)', included: true },
      { name: 'Custom Onboarding & Training', included: true },
    ],
    popular: false,
    recommended: false,
    cta: 'Contact Sales',
    polarProductIdMonthly: 'prod_enterprise_monthly',
    polarProductIdYearly: 'prod_enterprise_yearly',
  },
]

/**
 * Calculate yearly savings percentage
 */
export function calculateYearlySavings(plan: PricingPlan): number {
  const monthlyAnnual = plan.priceMonthly * 12
  const savings = monthlyAnnual - plan.priceYearly
  return Math.round((savings / monthlyAnnual) * 100)
}

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
    (plan) =>
      plan.polarProductIdMonthly === polarProductId ||
      plan.polarProductIdYearly === polarProductId
  )
}
