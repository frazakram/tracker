"use client"

import { useRef, useState, useEffect } from "react"
import { useHabitStore } from "@/store/useHabitStore"
import { format, startOfWeek, addDays, isFuture, isToday, isSameDay } from "date-fns"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { StreakBadge } from "@/components/streaks/StreakBadge"
import { calculateStreaks } from "@/lib/streaks/streakCalculator"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function StatsCards() {
  const { habits, completions, selectedDate } = useHabitStore()
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  // Hydration safety for clock - only show after client mount
  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Generate Current Week (Mon-Fri/Sat/Sun) based on user's selected date view
  // If selectedDate is far from today, we might want to show that month's week?
  // User asked for "Current Week View", usually implies *Today's* week.
  // But if they navigate the calendar, sticky to selectedDate is better UX.
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)) // Mon-Sun

  const getDayStats = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    let done = 0
    habits.forEach(habit => {
      if (completions[habit.id]?.includes(dateStr)) {
        done++
      }
    })
    const total = habits.length
    const percent = total > 0 ? Math.round((done / total) * 100) : 0
    return { done, total, percent }
  }

  // Calculate weekly goal progress
  const weeklyProgress = weekDays.reduce((acc, day) => {
    return acc + getDayStats(day).percent
  }, 0) / weekDays.length

  // Dynamic motivational message based on progress
  const getMotivationalMessage = () => {
    if (weeklyProgress === 100) return "🏆 Perfect week! You're unstoppable!"
    if (weeklyProgress >= 80) return "🔥 Crushing it! Keep going!"
    if (weeklyProgress >= 60) return "💪 Great progress! Stay consistent!"
    if (weeklyProgress >= 40) return "🎯 Building momentum! Don't stop!"
    if (weeklyProgress >= 20) return "🌱 Good start! Keep pushing!"
    return "✨ Start strong! Your future self will thank you!"
  }

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(habits, completions)

  const COLORS = ['#22c55e', '#1f2937'] // Emerald + Dark slate

  const scrollWeek = (dir: -1 | 1) => {
    scrollerRef.current?.scrollBy({
      left: dir * 260,
      behavior: "smooth",
    })
  }

  return (
    <div className="mb-6 pt-6">
      {/* Clock & Header */}
      <div className="flex justify-between items-start mb-4 px-1">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Weekly Progress</h2>
          <p className="text-white/60 text-sm mt-1">Track your daily execution</p>
          <div className="flex items-center gap-4 mt-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 glass-panel px-3 py-1.5 rounded-full border border-white/10"
            >
              <span className="text-xs font-bold text-emerald-200">
                {Math.round(weeklyProgress)}% Weekly Goal
              </span>
            </motion.div>
            <motion.p
              key={getMotivationalMessage()}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-white/70 font-medium"
            >
              {getMotivationalMessage()}
            </motion.p>
          </div>
          
          {/* Streak Tracking */}
          <div className="mt-3">
            <StreakBadge currentStreak={currentStreak} longestStreak={longestStreak} />
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-white tracking-tight">
            {mounted && currentTime ? format(currentTime, "HH:mm") : "--:--"}
          </div>
          <div className="text-sm font-medium text-white/60 uppercase tracking-widest">
            {mounted && currentTime ? format(currentTime, "EEEE, d MMMM") : "..."}
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Subtle edge fades to hint horizontal scroll */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/35 to-transparent rounded-l-2xl" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-black/35 to-transparent rounded-r-2xl" />

        {/* Desktop scroll controls */}
        <button
          type="button"
          onClick={() => scrollWeek(-1)}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full glass-panel border border-white/10 hover:bg-white/10"
          aria-label="Scroll week left"
        >
          <ChevronLeft className="h-5 w-5 text-white/80" />
        </button>
        <button
          type="button"
          onClick={() => scrollWeek(1)}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full glass-panel border border-white/10 hover:bg-white/10"
          aria-label="Scroll week right"
        >
          <ChevronRight className="h-5 w-5 text-white/80" />
        </button>

        <div
          ref={scrollerRef}
          className="flex overflow-x-auto pb-4 gap-4 no-scrollbar snap-x touch-pan-x pr-10"
        >
        {weekDays.map((day, i) => {
          const { percent } = getDayStats(day)
          const isFutureDate = isFuture(day) && !isToday(day)
          const isTodayDate = isToday(day)

          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={[
                "min-w-[220px] w-[220px] rounded-2xl overflow-hidden flex flex-col snap-start flex-shrink-0",
                "glass-panel border border-white/10 shadow-[0_22px_55px_-40px_rgba(0,0,0,0.9)]",
                isTodayDate ? "glow-border-blue" : ""
              ].join(" ")}
            >
              {/* Header */}
              <div
                className={[
                  "py-3 text-center border-b border-white/10",
                  isTodayDate
                    ? "bg-gradient-to-r from-sky-500/25 via-indigo-500/20 to-fuchsia-500/25"
                    : "bg-white/5"
                ].join(" ")}
              >
                <div className="text-lg font-bold leading-none text-white">{format(day, "EEEE")}</div>
                <div className="text-xs mt-1 font-medium text-white/70">{format(day, "dd.MM.yyyy")}</div>
              </div>

              {/* Chart Area */}
              <div className="h-52 flex items-center justify-center p-10 bg-black/10">
                {isFutureDate ? (
                  <div className="text-center text-white/50">
                    <div className="text-2xl mb-1">⏳</div>
                    <span className="text-xs font-medium uppercase tracking-wider">Upcoming</span>
                  </div>
                ) : (
                  <div className="h-[85px] w-[85px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completed', value: percent },
                            { name: 'Remaining', value: 100 - percent },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={36}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill={COLORS[0]} />
                          <Cell fill={COLORS[1]} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Footer - Percentage AND Status with gap */}
              {!isFutureDate && (
                <div className="h-16 border-t border-white/10 flex flex-col items-center justify-center gap-1 text-center font-bold bg-black/10 py-3">
                  <span className="text-lg text-white">{percent}%</span>
                  <span className="text-[10px] text-white/60 uppercase tracking-wider">
                    {percent === 100 ? <span className="text-emerald-300">Done</span> : "Progress"}
                  </span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
      </div>
    </div>
  )
}
