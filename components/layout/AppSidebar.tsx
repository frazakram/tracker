"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BarChart3, Printer, LogOut, User } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { signout } from "@/app/actions/auth"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

const navItems = [
  {
    title: "Tracker",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Print",
    href: "/print",
    icon: Printer,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await signout()
  }

  return (
    <div className="flex flex-col h-full w-20 md:w-64 p-4 space-y-4 relative z-50">
      <div className="flex items-center px-2 py-6">
        <h1 className="hidden md:block text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
          ME SUPREME
        </h1>
        <h1 className="md:hidden text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          MS
        </h1>
      </div>
      
      <nav className="flex-1 space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href} className="block relative group">
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <div className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                isActive ? "text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}>
                <Icon className={cn("h-5 w-5", isActive && "text-purple-400")} />
                <span className="hidden md:block font-medium tracking-wide">{item.title}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="space-y-3">
        {/* User Profile */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 backdrop-blur-sm">
          <p className="text-xs text-slate-400 mb-2">Logged in as</p>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-medium text-white truncate">
              {userEmail || "Loading..."}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/10 transition-all duration-300 group"
        >
          <LogOut className="h-5 w-5 text-red-400 group-hover:text-red-300" />
          <span className="hidden md:block font-medium tracking-wide">Logout</span>
        </button>
      </div>
    </div>
  )
}
