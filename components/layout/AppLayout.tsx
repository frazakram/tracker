"use client"

import { AppSidebar } from "@/components/layout/AppSidebar"
import { AnalyticsSidebar } from "@/components/analytics/AnalyticsSidebar"
import { MobileSidebar } from "@/components/layout/MobileSidebar"
import { useUiStore } from "@/store/useUiStore"
import { Menu } from "lucide-react"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const toggleMobileSidebar = useUiStore((s) => s.toggleMobileSidebar)

  return (
    <div className="flex h-screen w-full overflow-hidden dashboard-space text-white relative">
      <AnalyticsSidebar />
      <MobileSidebar />

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={toggleMobileSidebar}
        className="md:hidden fixed left-4 top-4 z-[9997] h-11 w-11 rounded-2xl glass-panel-strong border border-white/10 hover:bg-white/10 flex items-center justify-center"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5 text-white/80" />
      </button>

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
