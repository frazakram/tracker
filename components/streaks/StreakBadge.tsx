"use client"

import { motion } from "framer-motion"
import { Flame, Trophy } from "lucide-react"
import { getStreakMessage } from "@/lib/streaks/streakCalculator"
import { cn } from "@/lib/utils"

interface StreakBadgeProps {
  currentStreak: number
  longestStreak: number
}

export function StreakBadge({ currentStreak, longestStreak }: StreakBadgeProps) {
  const hasStreak = currentStreak > 0
  const message = getStreakMessage(currentStreak)

  return (
    <div className="flex flex-nowrap sm:flex-wrap items-center gap-3 sm:gap-6 py-3 overflow-x-auto sm:overflow-visible no-scrollbar">
      {/* Current Streak Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          "flex items-center gap-4 sm:gap-6 px-5 sm:px-10 py-3.5 sm:py-5 rounded-full border shadow-sm transition-all flex-shrink-0 min-w-[190px] sm:min-w-[240px]",
          hasStreak 
            ? "bg-white border-orange-200 text-gray-900" 
            : "bg-gray-50 border-gray-100 text-gray-400"
        )}
      >
        <motion.div
          animate={hasStreak ? {
            scale: [1, 1.2, 1],
            filter: ["drop-shadow(0 0 2px #fb923c)", "drop-shadow(0 0 8px #fb923c)", "drop-shadow(0 0 2px #fb923c)"]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Flame className={cn("h-7 w-7 sm:h-10 sm:w-10", hasStreak ? "fill-orange-500 text-orange-500" : "text-gray-300")} />
        </motion.div>
        
        <div className="flex flex-col">
          <span className="text-2xl sm:text-4xl font-black leading-none">{currentStreak}</span>
          <span className="text-[10px] sm:text-[11px] uppercase font-black tracking-[0.18em] text-gray-400 mt-1.5 sm:mt-2">
            Day Streak
          </span>
        </div>
      </motion.div>

      {/* Longest Streak Badge (Best) */}
      {longestStreak > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 sm:gap-6 px-5 sm:px-10 py-3.5 sm:py-5 rounded-full bg-white border border-yellow-200 shadow-sm transition-all flex-shrink-0 min-w-[190px] sm:min-w-[240px]"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              y: [0, -3, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Trophy className="h-7 w-7 sm:h-10 sm:w-10 text-yellow-500 fill-yellow-500" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-4xl font-black leading-none text-gray-900">{longestStreak}</span>
            <span className="text-[10px] sm:text-[11px] uppercase font-black tracking-[0.18em] text-gray-400 mt-1.5 sm:mt-2">
              Best
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
