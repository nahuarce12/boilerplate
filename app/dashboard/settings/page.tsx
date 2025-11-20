import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings.",
}

export default function SettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      <div className="grid gap-10">
        {/* Add settings forms here */}
      </div>
    </DashboardShell>
  )
}
