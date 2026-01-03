"use client"

import { useState, useEffect } from "react"
import { useHabitStore } from "@/store/useHabitStore"
import { format, startOfWeek, addDays, isFuture, isToday, isSameDay } from "date-fns"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { StreakBadge } from "@/components/streaks/StreakBadge"
import { calculateStreaks } from "@/lib/streaks/streakCalculator"

export function StatsCards() {
  const { habits, completions, selectedDate } = useHabitStore()
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

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

  const COLORS = ['#4ade80', '#e5e7eb'] // Green-400, Gray-200

  return (
    <div className="mb-6 pt-16">
      {/* Clock & Header */}
      <div className="flex justify-between items-start mb-4 px-1">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">Weekly Progress</h2>
          <p className="text-gray-500 text-sm mt-1">Track your daily execution</p>
          <div className="flex items-center gap-4 mt-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 bg-green-100 px-3 py-1.5 rounded-full"
            >
              <span className="text-xs font-bold text-green-700">
                {Math.round(weeklyProgress)}% Weekly Goal
              </span>
            </motion.div>
            <motion.p
              key={getMotivationalMessage()}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-gray-600 font-medium"
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
          <div className="text-3xl font-black text-[#15803d] tracking-tight">
            {mounted && currentTime ? format(currentTime, "HH:mm") : "--:--"}
          </div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">
            {mounted && currentTime ? format(currentTime, "EEEE, d MMMM") : "..."}
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar snap-x">
        {weekDays.map((day, i) => {
          const { percent } = getDayStats(day)
          const isFutureDate = isFuture(day) && !isToday(day)

          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="min-w-[220px] w-[220px] bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-md flex flex-col snap-start flex-shrink-0"
            >
              {/* Header */}
              <div className={`py-3 text-center border-b-2 border-gray-100 ${isToday(day) ? 'bg-[#15803d] text-white' : 'bg-[#4ade80] text-white'}`}>
                <div className="text-lg font-bold leading-none">{format(day, "EEEE")}</div>
                <div className="text-xs opacity-90 mt-1 font-medium">{format(day, "dd.MM.yyyy")}</div>
              </div>

              {/* Chart Area */}
              <div className="h-52 flex items-center justify-center p-10 bg-gray-50/30">
                {isFutureDate ? (
                  <div className="text-center text-gray-400">
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
                <div className="h-16 border-t-2 border-gray-200 flex flex-col items-center justify-center gap-1 text-center font-bold bg-white py-3">
                  <span className="text-lg text-gray-700">{percent}%</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {percent === 100 ? <span className="text-green-600">Done!</span> : "Progress"}
                  </span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
