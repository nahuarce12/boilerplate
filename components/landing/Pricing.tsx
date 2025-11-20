import { createClient } from '@/lib/supabase/server'
import { pricingPlans } from '@/config/plans'
import { PricingCard } from './PricingCard'

export async function Pricing() {
  const supabase = await createClient()

  // Fetch products from Supabase database
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('price_amount', { ascending: true })

  if (error) {
    console.error('Failed to fetch products from database:', error)
  }

  // Use database products if available, otherwise fallback to config
  const displayProducts =
    products && products.length > 0
      ? products.map((p) => ({
          id: p.id,
          polar_product_id: p.polar_product_id,
          name: p.name,
          description: p.description || '',
          price: p.price_amount / 100, // Convert cents to dollars
          interval: p.interval,
          features:
            typeof p.features === 'string'
              ? JSON.parse(p.features)
              : Array.isArray(p.features)
                ? p.features.map((f: string | { name: string }) =>
                    typeof f === 'string' ? f : f.name
                  )
                : [],
          popular: p.metadata?.popular === true || p.metadata?.popular === 'true',
          recommended:
            p.metadata?.recommended === true || p.metadata?.recommended === 'true',
        }))
      : pricingPlans

  return (
    <section id="pricing" className="container space-y-6 py-8 md:py-12 lg:py-24">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Simple, transparent pricing
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Choose the plan that&apos;s right for you
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {displayProducts.map((product) => (
          <PricingCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  )
}
