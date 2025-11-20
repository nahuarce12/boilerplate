import { Suspense } from 'react'
import Link from 'next/link'
import { XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function CanceledContent() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <XCircle className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Payment Canceled</CardTitle>
          <CardDescription>
            Your payment was canceled. No charges were made to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">Need help?</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>• Having trouble with checkout? Contact our support team</li>
              <li>• Questions about pricing? View our FAQ</li>
              <li>• Ready to try again? Go back to pricing</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/" className="w-full">
              <Button className="w-full">Back to Home</Button>
            </Link>
            <Link href="/#pricing" className="w-full">
              <Button variant="outline" className="w-full">
                View Pricing
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CanceledPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CanceledContent />
    </Suspense>
  )
}
