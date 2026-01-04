import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  fetchUserHabits, 
  fetchUserCompletionsRange, 
  createHabit as dbCreateHabit,
  deleteHabit as dbDeleteHabit,
  updateHabit as dbUpdateHabit,
  archiveHabit as dbArchiveHabit,
  reorderHabits as dbReorderHabits,
  addCompletion,
  removeCompletion,
  updateCompletionNote as dbUpdateCompletionNote,
  type Habit as DBHabit
} from '@/app/actions/habits';
import { calculateStreaks } from '@/lib/streaks/streakCalculator';
import { calculateBadgeStats, checkAchievements } from '@/lib/achievements/badgeDefinitions';
import { useToastStore } from '@/store/useToastStore';

const warned = new Set<string>()

export interface Habit {
  id: string;
  name: string;
  emoji?: string;
  monthlyGoal: number;
  color?: string;
  category?: 'health' | 'productivity' | 'mindfulness' | 'other';
  sortOrder?: number;
  archivedAt?: string | null;
}

export interface HabitStore {
  habits: Habit[];
  completions: Record<string, string[]>;
  completionNotes: Record<string, Record<string, string>>; // habitId -> date -> note
  
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
  updateHabit: (id: string, updates: Partial<Habit>) => void; // local-only
  saveHabitUpdates: (id: string, updates: Partial<Habit>) => Promise<string | null>;
  archiveHabit: (id: string) => Promise<void>;
  reorderHabits: (orderedIds: string[]) => Promise<void>;
  toggleHabit: (habitId: string, date: string) => Promise<void>;
  saveCompletionNote: (habitId: string, date: string, note: string) => Promise<void>;
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
      completionNotes: {},
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
            fetchUserCompletionsRange()
          ]);

          // Convert habits from DB format
          const formattedHabits: Habit[] = (habits as DBHabit[]).map(h => ({
            id: h.id,
            name: h.name,
            emoji: h.emoji,
            monthlyGoal: 20, // Default for now
            category: (h as any).category || ('other' as const),
            sortOrder: (h as any).sort_order ?? 0,
            archivedAt: (h as any).archived_at ?? null,
          }));

          // Convert completions to Record<habitId, string[]>
          const completionsMap: Record<string, string[]> = {};
          const notesMap: Record<string, Record<string, string>> = {};
          completionsData.forEach(c => {
            if (!completionsMap[c.habit_id]) {
              completionsMap[c.habit_id] = [];
            }
            completionsMap[c.habit_id].push(c.completed_date);

            if ((c as any).note) {
              if (!notesMap[c.habit_id]) notesMap[c.habit_id] = {}
              notesMap[c.habit_id][c.completed_date] = (c as any).note as string
            }
          });

          set({
            habits: formattedHabits,
            completions: completionsMap,
            completionNotes: notesMap,
            isLoading: false
          });

          // Verify achievements after loading data
          get().verifyAchievements();
        } catch (error) {
          console.error('Error loading user data:', error);
          useToastStore.getState().push({
            variant: "error",
            title: "Failed to load",
            message: "Couldn’t load your habits. Please refresh and try again.",
          })
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
          completionNotes: {},
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
          useToastStore.getState().push({
            variant: "error",
            title: "Couldn’t add habit",
            message: typeof error === "string" ? error : "Please try again.",
          })
          return error || 'Failed to create habit';
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
        const result = await dbDeleteHabit(id);
        
        if (result.error || !result.data) {
          // Rollback on error
          set(previousState);
          useToastStore.getState().push({
            variant: "error",
            title: "Couldn’t delete habit",
            message: result.error || "Please try again.",
          })
        } else {
          get().verifyAchievements();
        }
      },

      archiveHabit: async (id) => {
        const previousState = get()
        // optimistic: remove from list
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        }))

        const result = await dbArchiveHabit(id)
        if (result.error || !result.data) {
          set(previousState)
          useToastStore.getState().push({
            variant: "error",
            title: "Couldn’t archive habit",
            message: result.error || "Please try again.",
          })
        }
      },

      reorderHabits: async (orderedIds) => {
        const previousState = get()
        // optimistic reorder
        set((state) => {
          const byId = new Map(state.habits.map(h => [h.id, h]))
          const reordered = orderedIds
            .map((id, idx) => {
              const h = byId.get(id)
              return h ? { ...h, sortOrder: idx } : null
            })
            .filter(Boolean) as Habit[]
          return { habits: reordered }
        })

        const result = await dbReorderHabits(orderedIds)
        if (result.error || !result.data) {
          set(previousState)
          useToastStore.getState().push({
            variant: "error",
            title: "Couldn’t reorder habits",
            message: result.error || "Please try again.",
          })
        }
      },

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),

      saveHabitUpdates: async (id, updates) => {
        const previousState = get()
        // optimistic local update
        get().updateHabit(id, updates)

        const { data, error } = await dbUpdateHabit(id, {
          name: updates.name,
          emoji: updates.emoji,
          // server expects string values
          ...(updates.category ? { category: updates.category } : {}),
          ...(typeof updates.sortOrder === "number" ? { sort_order: updates.sortOrder } : {}),
          ...(typeof updates.archivedAt !== "undefined" ? { archived_at: updates.archivedAt } : {}),
        } as any)

        if (error || !data) {
          // rollback
          set(previousState)
          useToastStore.getState().push({
            variant: "error",
            title: "Couldn’t update habit",
            message: error || "Please try again.",
          })
          return error || "Failed to update habit"
        }

        return null
      },

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
            completionNotes: isCompleted
              ? {
                  ...state.completionNotes,
                  [habitId]: Object.fromEntries(
                    Object.entries(state.completionNotes[habitId] || {}).filter(([d]) => d !== date)
                  ),
                }
              : state.completionNotes,
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
            },
            completionNotes: state.completionNotes,
          }));
          useToastStore.getState().push({
            variant: "error",
            title: "Update failed",
            message: "Couldn’t save that check-in. Please try again.",
          })
        } else {
          // Check for new achievements on success (or we could do it on optimistic, but success is safer for "real" unlocks)
          get().verifyAchievements();
        }
      },

      saveCompletionNote: async (habitId, date, note) => {
        const previousState = get()
        set((state) => ({
          completionNotes: {
            ...state.completionNotes,
            [habitId]: {
              ...(state.completionNotes[habitId] || {}),
              [date]: note,
            },
          },
        }))

        const result = await dbUpdateCompletionNote(habitId, date, note.trim() ? note : null)
        if (result.error || !result.data) {
          // If the DB migration hasn't been applied yet, keep note locally and show a single guidance toast.
          if (result.error === "NOTES_COLUMN_MISSING") {
            if (!warned.has("NOTES_COLUMN_MISSING")) {
              warned.add("NOTES_COLUMN_MISSING")
              useToastStore.getState().push({
                variant: "info",
                title: "Notes saved locally",
                message: "To sync notes to Supabase, apply migration `002_habits_archive_order_category_notes.sql`.",
                durationMs: 7000,
              })
            }
            return
          }

          set(previousState)
          useToastStore.getState().push({
            variant: "error",
            title: "Couldn’t save note",
            message: result.error || "Please try again.",
          })
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
