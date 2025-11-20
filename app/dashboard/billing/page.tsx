import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { getUserSubscription } from "@/app/actions/subscriptions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icons } from "@/components/icons"
import { BillingForm } from "@/components/dashboard/BillingForm"
import { BillingToast } from "@/components/dashboard/BillingToast"

export const metadata = {
  title: "Billing",
  description: "Manage billing and your subscription plan.",
}

export default async function BillingPage() {
  const result = await getUserSubscription()
  const subscription = result.success ? result.data : null

  return (
    <DashboardShell>
      <BillingToast />
      <DashboardHeader
        heading="Billing"
        text="Manage billing and your subscription plan."
      />
      <div className="grid gap-8">
        <Alert className="!pl-14">
          <Icons.billing className="absolute left-4 top-4 h-6 w-6 text-foreground" />
          <AlertTitle>This is a demo app.</AlertTitle>
          <AlertDescription>
            Polar payments are connected in test mode.
          </AlertDescription>
        </Alert>
        <BillingForm subscription={subscription} />
      </div>
    </DashboardShell>
  )
}
