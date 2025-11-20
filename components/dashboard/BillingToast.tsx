'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export function BillingToast() {
  const searchParams = useSearchParams()
  const router = useRouter()

  React.useEffect(() => {
    if (searchParams.get('success')) {
      toast({
        title: 'Success!',
        description: 'Your subscription has been created.',
      })
      // Clean up the URL
      router.replace('/dashboard/billing')
    }

    if (searchParams.get('canceled')) {
      toast({
        title: 'Canceled',
        description: 'Checkout was canceled.',
        variant: 'destructive',
      })
      router.replace('/dashboard/billing')
    }
  }, [searchParams, router])

  return null
}
