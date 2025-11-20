import { redirect } from "next/navigation"

import { dashboardConfig } from "@/config/dashboard"
import { DashboardNav } from "@/components/dashboard/DashboardNav"
import { UserAccountNav } from "@/components/dashboard/UserAccountNav"
import { createClient } from "@/lib/supabase/server"
import { Icons } from "@/components/icons"
import Link from "next/link"
import { siteConfig } from "@/config/site"

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <Icons.logo className="h-6 w-6" />
              <span className="inline-block font-bold">{siteConfig.name}</span>
            </Link>
          </div>
          <UserAccountNav user={user} />
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav items={dashboardConfig.sidebarNav} />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
