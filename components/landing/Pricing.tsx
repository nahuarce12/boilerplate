import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { pricingPlans } from "@/config/plans"

export async function Pricing() {
  const supabase = await createClient()
  
  // Fetch products from Supabase instead of Polar
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('price_amount', { ascending: true })

  // Fallback to config if database fetch fails
  const displayProducts = products && products.length > 0 
    ? products 
    : pricingPlans.slice(0, 3).map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price_amount: plan.priceMonthly,
        interval: 'month' as const,
        features: plan.features,
      }))

  if (error) {
    console.error("Failed to fetch products from database", error)
  }

  return (
    <section
      id="pricing"
      className="container space-y-6 py-8 md:py-12 lg:py-24"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Simple, transparent pricing
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Choose the plan that&apos;s right for you
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {displayProducts.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-3xl font-bold">
                ${(product.price_amount || 0) / 100}
                <span className="text-sm font-normal text-muted-foreground">
                  /{product.interval}
                </span>
              </div>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                {Array.isArray(product.features) && product.features.map((feature: any, idx: number) => (
                  <li key={idx} className="flex items-center">
                    <Check className="mr-2 h-4 w-4" /> 
                    {typeof feature === 'string' ? feature : feature.name}
                  </li>
                ))}
                {!Array.isArray(product.features) && (
                  <>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4" /> Unlimited Posts
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4" /> Unlimited Users
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4" /> Custom Domain
                    </li>
                  </>
                )}
              </ul>
            </CardContent>
            <CardFooter className="flex-1">
              <Link href="/auth/signup" className="w-full">
                <Button className="w-full">Get Started</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
