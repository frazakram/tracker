"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, TrendingUp, Printer, Download, LogOut, User, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { signout } from "@/app/actions/auth"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useDeepDiveStore } from "@/store/useDeepDiveStore"
import { useUiStore } from "@/store/useUiStore"

const navItems = [
  {
    title: "Tracker",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Export",
    href: "/export",
    icon: Download,
  },
  {
    title: "Print",
    href: "/print",
    icon: Printer,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string>("")
  const openDeepDive = useDeepDiveStore((s) => s.open)
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || "—")
    }
    getUser()

    // Keep in sync across refreshes / tab changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || "—")
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await signout()
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-3xl glass-panel-strong shadow-[0_30px_80px_-55px_rgba(0,0,0,0.8)] p-4 space-y-4 relative z-50 transition-[width] duration-200",
        collapsed ? "w-20" : "w-80"
      )}
    >
      <div className={cn("flex items-center gap-2 px-2 py-3", collapsed && "justify-center")}>
        {!collapsed && (
          <h1 className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-300 to-fuchsia-300 drop-shadow-sm">
            Routely
          </h1>
        )}
        {collapsed && (
          <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white font-black italic">
            R
          </div>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            "ml-auto h-9 w-9 rounded-xl glass-panel border border-white/10 hover:bg-white/10 flex items-center justify-center",
            collapsed && "ml-0"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5 text-white/70" />
          ) : (
            <PanelLeftClose className="h-5 w-5 text-white/70" />
          )}
        </button>
      </div>
      
      <nav className="flex-1 space-y-3">
        {/* Deep Dive (opens panel, no duplicate floating button) */}
        <button
          type="button"
          onClick={() => {
            openDeepDive()
            setMobileSidebarOpen(false)
          }}
          className="w-full block relative group"
        >
          <div
            className={cn(
              "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-white/70 hover:text-white hover:bg-white/5",
              collapsed && "justify-center px-0"
            )}
          >
            <TrendingUp className="h-5 w-5 text-white/40 group-hover:text-sky-200" />
            {!collapsed && <span className="font-semibold tracking-wide">Deep Dive</span>}
          </div>
        </button>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href} className="block relative group">
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/25 via-indigo-500/25 to-fuchsia-500/25 glow-border-blue"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <div
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-sky-200" : "text-white/40 group-hover:text-sky-200")} />
                {!collapsed && <span className="font-semibold tracking-wide">{item.title}</span>}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="space-y-3">
        {/* User Profile */}
        {!collapsed && (
          <div className="p-4 rounded-2xl glass-panel">
            <p className="text-xs text-white/60 mb-2">Logged in as</p>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-sky-200" />
              <span className="text-xs font-semibold text-white truncate">
                {userEmail || "—"}
              </span>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-red-500/10 transition-all duration-200 group",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5 text-red-300" />
          {!collapsed && <span className="font-semibold tracking-wide">Logout</span>}
        </button>
      </div>
    </div>
  )
}
