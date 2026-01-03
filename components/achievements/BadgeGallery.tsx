"use client"

import { useHabitStore } from "@/store/useHabitStore"
import { ACHIEVEMENT_BADGES, calculateBadgeStats } from "@/lib/achievements/badgeDefinitions"
import { BadgeCard } from "./BadgeCard"
import { calculateStreaks } from "@/lib/streaks/streakCalculator"

export function BadgeGallery() {
  const { habits, completions, unlockedBadges = [] } = useHabitStore()
  
  // Calculate current stats to determine progress
  const { currentStreak, longestStreak } = calculateStreaks(habits, completions)
  const stats = calculateBadgeStats(habits, completions, currentStreak, longestStreak)

  const unlockedCount = unlockedBadges.length
  const totalCount = ACHIEVEMENT_BADGES.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {unlockedCount} / {totalCount} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {ACHIEVEMENT_BADGES.map((badge) => {
          const isUnlocked = unlockedBadges.includes(badge.id)
          // Calculate progress if locked
          const progress = !isUnlocked && badge.progress 
            ? badge.progress(stats)
            : 0

          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isUnlocked={isUnlocked}
              progress={progress}
            />
          )
        })}
      </div>
    </div>
  )
}
