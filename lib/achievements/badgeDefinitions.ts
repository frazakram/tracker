/**
 * Achievement Badge System
 * Defines all available badges and their unlock criteria
 */

export interface Badge {
  id: string
  name: string
  description: string
  icon: string // Emoji or Lucide icon name
  category: 'milestone' | 'streak' | 'perfection' | 'power'
  criteria: (stats: BadgeStats) => boolean
  progress?: (stats: BadgeStats) => number // 0-100 percentage
}

export interface BadgeStats {
  totalCompletions: number
  currentStreak: number
  longestStreak: number
  perfectDays: number // Days with 100% completion
  perfectWeeks: number // Weeks with 100% completion (Mon-Fri)
  habitsCount: number
}

/**
 * All available achievement badges
 */
export const ACHIEVEMENT_BADGES: Badge[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first habit',
    icon: '🌟',
    category: 'milestone',
    criteria: (stats) => stats.totalCompletions >= 1,
    progress: (stats) => Math.min(stats.totalCompletions * 100, 100)
  },
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Complete 10 habits',
    icon: '🚀',
    category: 'milestone',
    criteria: (stats) => stats.totalCompletions >= 10,
    progress: (stats) => Math.min((stats.totalCompletions / 10) * 100, 100)
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Complete 100 habits total',
    icon: '🏆',
    category: 'milestone',
    criteria: (stats) => stats.totalCompletions >= 100,
    progress: (stats) => Math.min((stats.totalCompletions / 100) * 100, 100)
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    criteria: (stats) => stats.currentStreak >= 7 || stats.longestStreak >= 7,
    progress: (stats) => Math.min((Math.max(stats.currentStreak, stats.longestStreak) / 7) * 100, 100)
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    category: 'streak',
    criteria: (stats) => stats.currentStreak >= 30 || stats.longestStreak >= 30,
    progress: (stats) => Math.min((Math.max(stats.currentStreak, stats.longestStreak) / 30) * 100, 100)
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Maintain a 100-day streak',
    icon: '⚡',
    category: 'streak',
    criteria: (stats) => stats.currentStreak >= 100 || stats.longestStreak >= 100,
    progress: (stats) => Math.min((Math.max(stats.currentStreak, stats.longestStreak) / 100) * 100, 100)
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete a perfect week (100% Mon-Fri)',
    icon: '💯',
    category: 'perfection',
    criteria: (stats) => stats.perfectWeeks >= 1,
    progress: (stats) => Math.min(stats.perfectWeeks * 100, 100)
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Achieve 10 perfect days',
    icon: '💎',
    category: 'perfection',
    criteria: (stats) => stats.perfectDays >= 10,
    progress: (stats) => Math.min((stats.perfectDays / 10) * 100, 100)
  },
  {
    id: 'overachiever',
    name: 'Overachiever',
    description: 'Track 10 or more habits simultaneously',
    icon: '🌈',
    category: 'power',
    criteria: (stats) => stats.habitsCount >= 10,
    progress: (stats) => Math.min((stats.habitsCount / 10) * 100, 100)
  }
]

/**
 * Check which badges should be unlocked based on current stats
 */
export function checkAchievements(stats: BadgeStats, unlockedBadges: string[]): string[] {
  const newlyUnlocked: string[] = []
  
  ACHIEVEMENT_BADGES.forEach(badge => {
    if (!unlockedBadges.includes(badge.id) && badge.criteria(stats)) {
      newlyUnlocked.push(badge.id)
    }
  })
  
  return newlyUnlocked
}

/**
 * Get badge by ID
 */
export function getBadge(badgeId: string): Badge | undefined {
  return ACHIEVEMENT_BADGES.find(b => b.id === badgeId)
}

/**
 * Calculate badge stats from habit data
 */
export function calculateBadgeStats(
  habits: Array<{ id: string }>,
  completions: Record<string, string[]>,
  currentStreak: number,
  longestStreak: number
): BadgeStats {
  // Total completions across all habits
  const totalCompletions = Object.values(completions).reduce(
    (sum, dates) => sum + dates.length, 
    0
  )
  
  // Count perfect days (all habits completed)
  const allDates = new Set<string>()
  Object.values(completions).forEach(dates => dates.forEach(d => allDates.add(d)))
  
  let perfectDays = 0
  allDates.forEach(date => {
    const allHabitsComplete = habits.every(habit => 
      (completions[habit.id] || []).includes(date)
    )
    if (allHabitsComplete) perfectDays++
  })
  
  // Count perfect weeks (Mon-Fri all complete)
  // This is a simplified version - you could enhance this
  const perfectWeeks = 0 // TODO: Implement week checking logic
  
  return {
    totalCompletions,
    currentStreak,
    longestStreak,
    perfectDays,
    perfectWeeks,
    habitsCount: habits.length
  }
}
