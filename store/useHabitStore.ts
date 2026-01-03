import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  fetchUserHabits, 
  fetchUserCompletions, 
  createHabit as dbCreateHabit,
  deleteHabit as dbDeleteHabit,
  addCompletion,
  removeCompletion,
  type Habit as DBHabit
} from '@/app/actions/habits';
import { calculateStreaks } from '@/lib/streaks/streakCalculator';
import { calculateBadgeStats, checkAchievements } from '@/lib/achievements/badgeDefinitions';

export interface Habit {
  id: string;
  name: string;
  emoji?: string;
  monthlyGoal: number;
  color?: string;
  category?: 'health' | 'productivity' | 'mindfulness' | 'other';
}

export interface HabitStore {
  habits: Habit[];
  completions: Record<string, string[]>;
  
  // Achievement State
  unlockedBadges: string[];
  longestStreak: number;

  // Global State
  dailyMetrics: Record<string, number>;
  selectedDate: Date;
  isLoading: boolean;

  // Actions
  loadUserData: () => Promise<void>;
  clearAllData: () => void;
  addHabit: (name: string, monthlyGoal?: number) => Promise<string | null>;
  deleteHabit: (id: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  toggleHabit: (habitId: string, date: string) => Promise<void>;
  setMetric: (date: string, value: number) => void;
  setSelectedDate: (date: Date) => void;
  unlockBadge: (badgeId: string) => void;
  verifyAchievements: () => void;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: {},
      dailyMetrics: {},
      selectedDate: new Date(),
      unlockedBadges: [],
      longestStreak: 0,
      isLoading: false,

      /**
       * Load user-specific data from database
       */
      loadUserData: async () => {
        set({ isLoading: true });
        
        try {
          const [habits, completionsData] = await Promise.all([
            fetchUserHabits(),
            fetchUserCompletions()
          ]);

          // Convert habits from DB format
          const formattedHabits: Habit[] = (habits as DBHabit[]).map(h => ({
            id: h.id,
            name: h.name,
            emoji: h.emoji,
            monthlyGoal: 20, // Default for now
            category: 'other' as const
          }));

          // Convert completions to Record<habitId, string[]>
          const completionsMap: Record<string, string[]> = {};
          completionsData.forEach(c => {
            if (!completionsMap[c.habit_id]) {
              completionsMap[c.habit_id] = [];
            }
            completionsMap[c.habit_id].push(c.completed_date);
          });

          set({
            habits: formattedHabits,
            completions: completionsMap,
            isLoading: false
          });

          // Verify achievements after loading data
          get().verifyAchievements();
        } catch (error) {
          console.error('Error loading user data:', error);
          set({ isLoading: false });
        }
      },

      /**
       * Clear all data (call on logout)
       */
      clearAllData: () => {
        set({
          habits: [],
          completions: {},
          unlockedBadges: [],
          longestStreak: 0,
          dailyMetrics: {}
        });
      },

      setMetric: (date, value) =>
        set((state) => ({
          dailyMetrics: {
            ...state.dailyMetrics,
            [date]: value,
          },
        })),

      addHabit: async (name, monthlyGoal = 20) => {
        // Optimistic update
        const tempId = crypto.randomUUID();
        set((state) => ({
          habits: [
            ...state.habits,
            {
              id: tempId,
              name,
              emoji: '📝',
              monthlyGoal,
              category: 'other' as const,
            },
          ],
        }));

        // Sync with database
        const { habit: newHabit, error } = await dbCreateHabit(name, '📝');
        
        if (newHabit) {
          // Replace temp habit with real one
          set((state) => ({
            habits: state.habits.map(h => 
              h.id === tempId 
                ? { 
                    id: newHabit.id, 
                    name: newHabit.name, 
                    emoji: newHabit.emoji, 
                    monthlyGoal, 
                    category: 'other' as const 
                  }
                : h
            )
          }));
          get().verifyAchievements();
          return null;
        } else {
          // Rollback on error
          set((state) => ({
            habits: state.habits.filter(h => h.id !== tempId)
          }));
          return error?.message || (typeof error === 'string' ? error : 'Failed to create habit');
        }
      },

      deleteHabit: async (id) => {
        // Optimistic update
        const previousState = get();
        set((state) => {
          const newCompletions = { ...state.completions };
          delete newCompletions[id];
          return {
            habits: state.habits.filter((h) => h.id !== id),
            completions: newCompletions,
          };
        });

        // Sync with database
        const success = await dbDeleteHabit(id);
        
        if (!success) {
          // Rollback on error
          set(previousState);
        } else {
          get().verifyAchievements();
        }
      },

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),

      unlockBadge: (badgeId) => 
        set((state) => ({
          unlockedBadges: state.unlockedBadges.includes(badgeId) 
            ? state.unlockedBadges 
            : [...state.unlockedBadges, badgeId]
        })),

      toggleHabit: async (habitId, date) => {
        const currentCompletions = get().completions[habitId] || [];
        const isCompleted = currentCompletions.includes(date);
        
        // Optimistic update
        set((state) => {
          let newHabitCompletions;
          if (isCompleted) {
            newHabitCompletions = currentCompletions.filter((d) => d !== date);
          } else {
            newHabitCompletions = [...currentCompletions, date];
          }

          return {
            completions: {
              ...state.completions,
              [habitId]: newHabitCompletions,
            },
          };
        });

        // Sync with database
        const success = isCompleted 
          ? await removeCompletion(habitId, date)
          : await addCompletion(habitId, date);

        if (!success) {
          // Rollback on error
          set((state) => ({
            completions: {
              ...state.completions,
              [habitId]: currentCompletions
            }
          }));
        } else {
          // Check for new achievements on success (or we could do it on optimistic, but success is safer for "real" unlocks)
          get().verifyAchievements();
        }
      },

      verifyAchievements: () => {
        const { habits, completions, unlockedBadges } = get();
        
        // precise calculation
        const { currentStreak, longestStreak } = calculateStreaks(habits, completions);
        const stats = calculateBadgeStats(habits, completions, currentStreak, longestStreak);
        const newBadges = checkAchievements(stats, unlockedBadges);

        if (newBadges.length > 0) {
          set({
             unlockedBadges: [...unlockedBadges, ...newBadges],
             longestStreak // Update longest streak while we're at it
          });
          
          // Optional: Trigger a toast or effect here?
          // for now, just updating state is enough for the UI to react
        } else {
           // still update streak stats if they changed
           if (longestStreak !== get().longestStreak) {
             set({ longestStreak });
           }
        }
      },

      setSelectedDate: (date) => set({ selectedDate: date }),
    }),
    {
      name: 'me-supreme-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Don't persist habits/completions - they come from database
        unlockedBadges: state.unlockedBadges,
        longestStreak: state.longestStreak,
        dailyMetrics: state.dailyMetrics,
      }),
    }
  )
);
