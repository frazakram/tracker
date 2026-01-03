"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sheet, X, TrendingUp, Calendar, Zap, ArrowRight } from "lucide-react"
import { startOfWeek, addDays, format, isAfter } from "date-fns"
import { Button } from "@/components/ui/Button"
import { useHabitStore } from "@/store/useHabitStore"
import { BadgeGallery } from "@/components/achievements/BadgeGallery"
import { HabitHeatmap } from "./HabitHeatmap"
import Link from "next/link"

export function AnalyticsSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { habits, completions } = useHabitStore()

  // Simple stats for deep dive
  const totalCompleted = Object.values(completions).reduce((acc, dates) => acc + dates.length, 0)
  const bestDay = "Friday" // Placeholder logic

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="fixed bottom-32 right-10 z-50 rounded-full shadow-2xl border-2 border-green-500 text-green-700 bg-white hover:bg-green-50 h-14 w-14 p-0 md:h-auto md:w-auto md:px-6 md:py-3"
      >
        <TrendingUp className="h-6 w-6 md:mr-2" />
        <span className="hidden md:inline font-bold">Deep Dive</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed top-0 right-0 h-full w-full md:w-[400px] shadow-2xl border-l border-gray-200 overflow-y-auto"
              style={{ backgroundColor: "white", zIndex: 9999, maxWidth: "600px" }}
            >
              <div className="p-6 relative bg-white">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-gray-800">Analytics Deep Dive</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-6 w-6 text-gray-400" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="p-6 rounded-2xl border border-green-200 bg-[#f0fdf4]">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-green-700 uppercase tracking-widest">Total Reps</span>
                      
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
                        <Zap className="h-6 w-6 text-green-600 fill-green-200" />
                      </motion.div>

                      <span className="text-4xl font-black text-gray-900 leading-none">{totalCompleted}</span>
                    </div>
                  </div>

                  {/* Heatmap Section */}
                  <div className="p-4 rounded-2xl border border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-700">Consistency Map</h3>
                        <span className="text-[10px] font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Last Year</span>
                    </div>
                    
                    <Link href="/analytics" className="block w-full">
                        <Button variant="outline" className="w-full h-12 border-dashed border-2 text-gray-500 hover:text-green-600 hover:border-green-200 hover:bg-green-50">
                            View Full Heatmap
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                  </div>

                  {/* Top Habits List Component */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
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
                          <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="font-medium text-gray-700">{habit.name}</span>
                            <div className="text-right">
                                <span className="font-black text-gray-900 text-lg">{doneCount}</span>
                                <span className="text-gray-400 text-xs font-medium uppercase ml-1">/ {daysPassed}</span>
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
