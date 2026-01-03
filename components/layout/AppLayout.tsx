"use client"

import { AppSidebar } from "@/components/layout/AppSidebar"
import { AnalyticsSidebar } from "@/components/analytics/AnalyticsSidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative">
      <AnalyticsSidebar />
      <aside className="hidden md:block h-full z-10">
        <AppSidebar />
      </aside>
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 z-0">
        <div className="mx-auto max-w-7xl space-y-8">
          {children}
        </div>
      </main>
    </div>
  )
}
