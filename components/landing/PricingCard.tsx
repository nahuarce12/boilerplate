'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { createCheckoutSession } from '@/app/actions/subscriptions'
import { useRouter } from 'next/navigation'

interface PricingCardProps {
  id: string
  polar_product_id: string
  name: string
  description: string
  price: number
  interval: string
  features: string[]
  popular?: boolean
  recommended?: boolean
}

export function PricingCard({
  id,
  polar_product_id,
  name,
  description,
  price,
  interval,
  features,
  popular = false,
  recommended = false,
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('productId', id)
      formData.append('priceId', polar_product_id)

      const result = await createCheckoutSession(formData)

      if (result.success && result.data?.url) {
        // Redirect to Polar checkout
        window.location.href = result.data.url
      } else if (result.error === 'Not authenticated') {
        // Redirect to login if not authenticated
        router.push('/auth/login?redirect=/#pricing')
      } else {
        setError(result.error || 'Failed to create checkout session')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Error creating checkout:', err)
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition-all hover:shadow-lg ${
        popular
          ? 'border-primary shadow-lg ring-2 ring-primary ring-offset-2'
          : 'border-border'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
            Most Popular
          </span>
        </div>
      )}
      
      {recommended && !popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-accent px-4 py-1 text-sm font-semibold text-accent-foreground">
            Recommended
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold">{name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-muted-foreground">/{interval}</span>
        </div>
      </div>

      <Button
        onClick={handleSubscribe}
        disabled={isLoading}
        className="mb-6 w-full"
        variant={popular ? 'default' : 'outline'}
        size="lg"
      >
        {isLoading ? 'Loading...' : 'Get Started'}
      </Button>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
