/**
 * Streak Calculation Utilities
 * Calculates current and longest streaks from habit completion data
 */

import { format, subDays, isToday, parseISO, differenceInDays } from "date-fns"

export interface StreakData {
  currentStreak: number
  longestStreak: number
  streakDates: string[] // Array of dates in current streak
}

/**
 * Calculate current streak based on habit completions
 * A day counts as "complete" if ALL habits are checked off
 */
export function calculateStreaks(
  habits: Array<{ id: string; name: string }>,
  completions: Record<string, string[]>
): StreakData {
  if (habits.length === 0) {
    return { currentStreak: 0, longestStreak: 0, streakDates: [] }
  }

  // Get all dates where ALL habits were completed
  const completedDates = getFullyCompletedDates(habits, completions)
  
  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, streakDates: [] }
  }

  // Sort dates in descending order (newest first)
  completedDates.sort((a, b) => b.getTime() - a.getTime())

  // Calculate current streak (must include today or yesterday)
  const currentStreak = calculateCurrentStreak(completedDates)
  
  // Calculate longest streak
  const longestStreak = calculateLongestStreak(completedDates)

  // Get streak dates for current streak
  const streakDates = completedDates
    .slice(0, currentStreak.count)
    .map(date => format(date, "yyyy-MM-dd"))

  return {
    currentStreak: currentStreak.count,
    longestStreak: Math.max(longestStreak, currentStreak.count),
    streakDates
  }
}

/**
 * Get all dates where ALL habits were completed
 */
function getFullyCompletedDates(
  habits: Array<{ id: string }>,
  completions: Record<string, string[]>
): Date[] {
  // Collect all unique dates across all habit completions
  const allDates = new Set<string>()
  
  Object.values(completions).forEach(dates => {
    dates.forEach(date => allDates.add(date))
  })

  // Filter to only dates where ALL habits were completed
  const fullyCompletedDates: Date[] = []
  
  allDates.forEach(dateStr => {
    const allHabitsComplete = habits.every(habit => {
      const habitCompletions = completions[habit.id] || []
      return habitCompletions.includes(dateStr)
    })
    
    if (allHabitsComplete) {
      fullyCompletedDates.push(parseISO(dateStr))
    }
  })

  return fullyCompletedDates
}

/**
 * Calculate current streak (must include today or yesterday)
 */
function calculateCurrentStreak(sortedDates: Date[]): { count: number } {
  if (sortedDates.length === 0) return { count: 0 }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = subDays(today, 1)
  
  const mostRecentDate = sortedDates[0]
  mostRecentDate.setHours(0, 0, 0, 0)

  // Streak is broken if last completion was more than 1 day ago
  if (mostRecentDate < yesterday) {
    return { count: 0 }
  }

  // Count consecutive days
  let streakCount = 0
  let expectedDate = mostRecentDate

  for (const date of sortedDates) {
    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)
    
    if (normalizedDate.getTime() === expectedDate.getTime()) {
      streakCount++
      expectedDate = subDays(expectedDate, 1)
    } else {
      break
    }
  }

  return { count: streakCount }
}

/**
 * Calculate longest streak from all completed dates
 */
function calculateLongestStreak(sortedDates: Date[]): number {
  if (sortedDates.length === 0) return 0

  let longestStreak = 1
  let currentStreakCount = 1
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = sortedDates[i - 1]
    const currDate = sortedDates[i]
    
    prevDate.setHours(0, 0, 0, 0)
    currDate.setHours(0, 0, 0, 0)
    
    const daysDiff = differenceInDays(prevDate, currDate)
    
    if (daysDiff === 1) {
      // Consecutive day
      currentStreakCount++
      longestStreak = Math.max(longestStreak, currentStreakCount)
    } else {
      // Streak broken
      currentStreakCount = 1
    }
  }

  return longestStreak
}

/**
 * Get motivational message based on streak length
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your streak today! 💪"
  if (streak === 1) return "Great start! Keep it going! 🌟"
  if (streak < 7) return `${streak} days strong! 🔥`
  if (streak === 7) return "One week streak! 🎉"
  if (streak < 30) return `${streak} days and counting! 🚀`
  if (streak === 30) return "30-day warrior! 👑"
  if (streak < 100) return `Epic ${streak}-day streak! 💎`
  if (streak === 100) return "100 DAYS! LEGENDARY! 🏆"
  return `Unstoppable ${streak}-day streak! ⚡`
}
