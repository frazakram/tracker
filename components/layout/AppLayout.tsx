"use client"

import { AppSidebar } from "@/components/layout/AppSidebar"
import { AnalyticsSidebar } from "@/components/analytics/AnalyticsSidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden dashboard-space text-white relative">
      <AnalyticsSidebar />
      <aside className="hidden md:flex h-full z-10 p-5 pr-3">
        <AppSidebar />
      </aside>
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 z-0">
        <div className="mx-auto max-w-screen-2xl space-y-8 glass-panel-strong rounded-3xl p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
