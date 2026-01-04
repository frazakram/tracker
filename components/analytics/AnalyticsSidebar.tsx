"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sheet, X, Calendar, Zap, ArrowRight } from "lucide-react"
import { startOfWeek, addDays, format, isAfter } from "date-fns"
import { Button } from "@/components/ui/Button"
import { useHabitStore } from "@/store/useHabitStore"
import { BadgeGallery } from "@/components/achievements/BadgeGallery"
import { HabitHeatmap } from "./HabitHeatmap"
import Link from "next/link"
import { useDeepDiveStore } from "@/store/useDeepDiveStore"

export function AnalyticsSidebar() {
  const isOpen = useDeepDiveStore((s) => s.isOpen)
  const setOpen = useDeepDiveStore((s) => s.setOpen)
  const { habits, completions } = useHabitStore()

  // Simple stats for deep dive
  const totalCompleted = Object.values(completions).reduce((acc, dates) => acc + dates.length, 0)
  const bestDay = "Friday" // Placeholder logic

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed top-0 right-0 h-full w-full md:w-[420px] shadow-2xl border-l border-white/10 overflow-y-auto glass-panel-strong"
              style={{ zIndex: 9999, maxWidth: "600px" }}
            >
              <div className="p-6 relative">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-white">Analytics Deep Dive</h2>
                  <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                    <X className="h-6 w-6 text-white/60" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="p-6 rounded-2xl glass-panel border border-white/10">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-white/70 uppercase tracking-widest">Total Reps</span>
                      
                      <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            filter: [
                                "drop-shadow(0 0 0px rgba(21, 128, 61, 0))", 
                                "drop-shadow(0 0 8px rgba(21, 128, 61, 0.5))", 
                                "drop-shadow(0 0 0px rgba(21, 128, 61, 0))"
                            ]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                      >
                        <Zap className="h-6 w-6 text-emerald-300 fill-emerald-300/20" />
                      </motion.div>

                      <span className="text-4xl font-black text-white leading-none">{totalCompleted}</span>
                    </div>
                  </div>

                  {/* Heatmap Section */}
                  <div className="p-4 rounded-2xl glass-panel border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white/85">Consistency Map</h3>
                        <span className="text-[10px] font-normal text-white/60 bg-white/10 px-2 py-0.5 rounded-full">Last Year</span>
                    </div>
                    
                    <Link href="/analytics" className="block w-full">
                        <Button variant="outline" className="w-full h-12 border-dashed border-2 border-white/15 text-white/70 hover:text-white hover:border-sky-300/40 hover:bg-white/10">
                            View Full Heatmap
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                  </div>

                  {/* Top Habits List Component */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-white/60" />
                      Habit Performance
                    </h3>
                    <div className="space-y-3">
                      {habits.map(habit => {
                        // Calculate Done / Total Passed in Week
                        const today = new Date()
                        const weekStart = startOfWeek(today, { weekStartsOn: 1 })
                        let daysPassed = 0
                        let doneCount = 0
                        
                        // Iterate from Mon to Today
                        let current = weekStart
                        while (current <= today) {
                          daysPassed++
                          const dateStr = format(current, "yyyy-MM-dd")
                          if (completions[habit.id]?.includes(dateStr)) {
                            doneCount++
                          }
                          current = addDays(current, 1)
                        }

                        return (
                          <div key={habit.id} className="flex items-center justify-between p-3 glass-panel rounded-xl border border-white/10">
                            <span className="font-medium text-white/85">{habit.name}</span>
                            <div className="text-right">
                                <span className="font-black text-white text-lg">{doneCount}</span>
                                <span className="text-white/50 text-xs font-medium uppercase ml-1">/ {daysPassed}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Achievements Section */}
                  <div>
                     <BadgeGallery />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
