'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Icons } from '@/components/icons'
import { cancelSubscription, reactivateSubscription, syncSubscription } from '@/app/actions/subscriptions'

interface BillingFormProps extends React.HTMLAttributes<HTMLFormElement> {
  subscription: {
    id: string
    product_id: string
    status: string
    current_period_end: string
    cancel_at_period_end: boolean
    product_name: string
  } | null
}

export function BillingForm({ subscription, className, ...props }: BillingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  async function onSync() {
    setIsLoading(true)
    try {
      const result = await syncSubscription()
      if (!result.success) {
        throw new Error(result.error)
      }
      toast({
        title: 'Subscription synced',
        description: 'Your subscription status has been updated from Polar.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sync subscription. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onCancel() {
    if (!subscription) return

    setIsLoading(true)
    try {
      const result = await cancelSubscription(subscription.id)
      if (!result.success) {
        throw new Error(result.error)
      }
      toast({
        title: 'Subscription canceled',
        description: 'Your subscription has been canceled and will end at the end of the billing period.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onReactivate() {
    if (!subscription) return

    setIsLoading(true)
    try {
      const result = await reactivateSubscription(subscription.id)
      if (!result.success) {
        throw new Error(result.error)
      }
      toast({
        title: 'Subscription reactivated',
        description: 'Your subscription has been reactivated.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className={cn(className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>
            You are currently on the <strong>{subscription?.product_name || 'Free'}</strong> plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="grid gap-1">
                <div className="font-medium">Status</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {subscription.status}
                  {subscription.cancel_at_period_end && ' (Canceled)'}
                </div>
              </div>
              <div className="grid gap-1">
                <div className="font-medium">
                  {subscription.cancel_at_period_end ? 'Ends on' : 'Renews on'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(subscription.current_period_end)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              You are not subscribed to any plan.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
          {subscription ? (
            subscription.cancel_at_period_end ? (
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  onReactivate()
                }}
                disabled={isLoading}
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Reactivate Subscription
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault()
                  onCancel()
                }}
                disabled={isLoading}
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Cancel Subscription
              </Button>
            )
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/#pricing')
                }}
              >
                View Plans
              </Button>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  onSync()
                }}
                disabled={isLoading}
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Check Status
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}
