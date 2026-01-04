"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { useUiStore } from "@/store/useUiStore"

export function MobileSidebar() {
  const open = useUiStore((s) => s.mobileSidebarOpen)
  const setOpen = useUiStore((s) => s.setMobileSidebarOpen)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close sidebar backdrop"
            className="fixed inset-0 z-[9998] bg-black/55 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          <motion.div
            className="fixed left-3 top-3 bottom-3 z-[9999] md:hidden"
            initial={{ x: -420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -420, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
          >
            <div className="relative h-full">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 z-10 h-10 w-10 rounded-2xl glass-panel-strong border border-white/10 hover:bg-white/10 flex items-center justify-center"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5 text-white/70" />
              </button>

              {/* Uses the same sidebar component; width is handled inside AppSidebar */}
              <AppSidebar />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


