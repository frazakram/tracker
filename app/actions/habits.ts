'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { format, subDays } from 'date-fns'

// ============================================
// Zod Validation Schemas
// ============================================

const habitNameSchema = z
  .string()
  .min(1, 'Habit name is required')
  .max(100, 'Habit name must be 100 characters or less')
  .trim()

const emojiSchema = z
  .string()
  .max(10, 'Emoji must be 10 characters or less')
  .default('📝')

const uuidSchema = z
  .string()
  .uuid('Invalid ID format')

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')

const createHabitSchema = z.object({
  name: habitNameSchema,
  emoji: emojiSchema,
})

const updateHabitSchema = z.object({
  habitId: uuidSchema,
  updates: z.object({
    name: habitNameSchema.optional(),
    emoji: emojiSchema.optional(),
    category: z.enum(['health', 'productivity', 'mindfulness', 'other']).optional(),
    sort_order: z.number().int().min(0).optional(),
    archived_at: z.string().datetime().nullable().optional(),
  }).refine(data => data.name || data.emoji, {
    message: 'At least one field must be provided',
  }),
})

const completionSchema = z.object({
  habitId: uuidSchema,
  date: dateSchema,
})

const completionNoteSchema = z.object({
  habitId: uuidSchema,
  date: dateSchema,
  note: z.string().max(2000).nullable(),
})

const reorderSchema = z.array(uuidSchema).min(1)

const completionRangeSchema = z.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
})

// ============================================
// Types
// ============================================

export interface Habit {
  id: string
  user_id: string
  name: string
  emoji: string
  category?: string
  sort_order?: number
  archived_at?: string | null
  created_at: string
}

export interface Completion {
  id: string
  user_id: string
  habit_id: string
  completed_date: string
  note?: string | null
  created_at: string
}

export interface ActionResult<T> {
  data: T | null
  error: string | null
}

// ============================================
// Server Actions
// ============================================

/**
 * Fetch all habits for the current user
 */
export async function fetchUserHabits(): Promise<Habit[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .is('archived_at', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    // Backward-compatible fallback if migrations haven't been applied yet
    const msg = String((error as any)?.message || "")
    if (msg.includes("archived_at") || msg.includes("sort_order")) {
      const legacy = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true })

      if (legacy.error) {
        console.error('Error fetching habits (legacy):', legacy.error)
        return []
      }
      return legacy.data || []
    }

    console.error('Error fetching habits:', error)
    return []
  }

  return data || []
}

/**
 * Archive a habit (soft delete)
 */
export async function archiveHabit(habitId: string): Promise<ActionResult<boolean>> {
  const validation = uuidSchema.safeParse(habitId)
  if (!validation.success) {
    return { data: null, error: 'Invalid habit ID format' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('habits')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', validation.data)

  if (error) {
    console.error('Error archiving habit:', error)
    return { data: null, error: error.message || 'Failed to archive habit' }
  }

  return { data: true, error: null }
}

/**
 * Unarchive a habit
 */
export async function unarchiveHabit(habitId: string): Promise<ActionResult<boolean>> {
  const validation = uuidSchema.safeParse(habitId)
  if (!validation.success) {
    return { data: null, error: 'Invalid habit ID format' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('habits')
    .update({ archived_at: null })
    .eq('id', validation.data)

  if (error) {
    console.error('Error unarchiving habit:', error)
    return { data: null, error: error.message || 'Failed to unarchive habit' }
  }

  return { data: true, error: null }
}

/**
 * Persist habit ordering (sort_order)
 */
export async function reorderHabits(habitIds: string[]): Promise<ActionResult<boolean>> {
  const validation = reorderSchema.safeParse(habitIds)
  if (!validation.success) {
    return { data: null, error: 'Invalid habit list' }
  }

  const supabase = await createClient()
  const ids = validation.data

  const updates = ids.map((id, idx) =>
    supabase.from('habits').update({ sort_order: idx }).eq('id', id)
  )

  const results = await Promise.all(updates)
  const firstError = results.find(r => r.error)?.error
  if (firstError) {
    console.error('Error reordering habits:', firstError)
    return { data: null, error: firstError.message || 'Failed to reorder habits' }
  }

  return { data: true, error: null }
}

/**
 * Create a new habit for the current user
 */
export async function createHabit(
  name: string, 
  emoji: string = '📝'
): Promise<{ habit: Habit | null, error: string | null }> {
  // Validate input
  const validation = createHabitSchema.safeParse({ name, emoji })
  
  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || 'Invalid input'
    return { habit: null, error: errorMessage }
  }

  const { name: validatedName, emoji: validatedEmoji } = validation.data

  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { habit: null, error: 'User not authenticated' }
  }

  const { data, error } = await supabase
    .from('habits')
    .insert([{ 
      user_id: user.id,
      name: validatedName,
      emoji: validatedEmoji 
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating habit:', error)
    return { habit: null, error: error.message || 'Failed to create habit' }
  }

  return { habit: data, error: null }
}

/**
 * Delete a habit
 */
export async function deleteHabit(habitId: string): Promise<ActionResult<boolean>> {
  // Validate input
  const validation = uuidSchema.safeParse(habitId)
  
  if (!validation.success) {
    return { data: null, error: 'Invalid habit ID format' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', validation.data)

  if (error) {
    console.error('Error deleting habit:', error)
    return { data: null, error: error.message || 'Failed to delete habit' }
  }

  return { data: true, error: null }
}

/**
 * Update a habit's name or emoji
 */
export async function updateHabit(
  habitId: string, 
  updates: { name?: string; emoji?: string; category?: string; sort_order?: number; archived_at?: string | null }
): Promise<ActionResult<Habit>> {
  // Validate input
  const validation = updateHabitSchema.safeParse({ habitId, updates })
  
  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || 'Invalid input'
    return { data: null, error: errorMessage }
  }

  const { habitId: validatedId, updates: validatedUpdates } = validation.data

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('habits')
    .update(validatedUpdates)
    .eq('id', validatedId)
    .select()
    .single()

  if (error) {
    // Backward-compatible fallback if migrations haven't been applied yet
    const msg = String((error as any)?.message || "")
    if (msg.includes("category") || msg.includes("sort_order") || msg.includes("archived_at")) {
      const minimalUpdates: any = {}
      if (typeof validatedUpdates.name !== "undefined") minimalUpdates.name = validatedUpdates.name
      if (typeof validatedUpdates.emoji !== "undefined") minimalUpdates.emoji = validatedUpdates.emoji

      const retry = await supabase
        .from('habits')
        .update(minimalUpdates)
        .eq('id', validatedId)
        .select()
        .single()

      if (retry.error) {
        console.error('Error updating habit (legacy):', retry.error)
        return { data: null, error: retry.error.message || 'Failed to update habit' }
      }
      return { data: retry.data, error: null }
    }

    console.error('Error updating habit:', error)
    return { data: null, error: error.message || 'Failed to update habit' }
  }

  return { data, error: null }
}

/**
 * Fetch all completions for the current user
 */
export async function fetchUserCompletions(): Promise<Completion[]> {
  const supabase = await createClient()

  // Default: last 90 days
  const end = new Date()
  const start = subDays(end, 89)
  const startDate = format(start, 'yyyy-MM-dd')
  const endDate = format(end, 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('completions')
    .select('*')
    .gte('completed_date', startDate)
    .lte('completed_date', endDate)
    .order('completed_date', { ascending: true })

  if (error) {
    console.error('Error fetching completions:', error)
    return []
  }

  return data || []
}

/**
 * Fetch completions for a specific date range (YYYY-MM-DD). Defaults to last 90 days.
 */
export async function fetchUserCompletionsRange(params?: { startDate?: string; endDate?: string }): Promise<Completion[]> {
  const parsed = completionRangeSchema.safeParse(params || {})
  if (!parsed.success) {
    console.error('Invalid completion range:', parsed.error.issues[0]?.message)
    return []
  }

  const supabase = await createClient()

  const end = parsed.data.endDate ? new Date(parsed.data.endDate) : new Date()
  const start = parsed.data.startDate ? new Date(parsed.data.startDate) : subDays(end, 89)

  const startDate = format(start, 'yyyy-MM-dd')
  const endDate = format(end, 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('completions')
    .select('*')
    .gte('completed_date', startDate)
    .lte('completed_date', endDate)
    .order('completed_date', { ascending: true })

  if (error) {
    console.error('Error fetching completions range:', error)
    return []
  }

  return data || []
}

/**
 * Add a completion (mark habit as done on a specific date)
 */
export async function addCompletion(
  habitId: string, 
  date: string
): Promise<Completion | null> {
  // Validate input
  const validation = completionSchema.safeParse({ habitId, date })
  
  if (!validation.success) {
    console.error('Validation error:', validation.error.issues[0]?.message)
    return null
  }

  const { habitId: validatedHabitId, date: validatedDate } = validation.data

  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('completions')
    .insert([{
      user_id: user.id,
      habit_id: validatedHabitId,
      completed_date: validatedDate
    }])
    .select()
    .single()

  if (error) {
    console.error('Error adding completion:', error)
    return null
  }

  return data
}

/**
 * Remove a completion (unmark habit)
 */
export async function removeCompletion(
  habitId: string, 
  date: string
): Promise<boolean> {
  // Validate input
  const validation = completionSchema.safeParse({ habitId, date })
  
  if (!validation.success) {
    console.error('Validation error:', validation.error.issues[0]?.message)
    return false
  }

  const { habitId: validatedHabitId, date: validatedDate } = validation.data

  const supabase = await createClient()

  const { error } = await supabase
    .from('completions')
    .delete()
    .eq('habit_id', validatedHabitId)
    .eq('completed_date', validatedDate)

  if (error) {
    console.error('Error removing completion:', error)
    return false
  }

  return true
}

/**
 * Update note for an existing completion (habit_id + completed_date)
 */
export async function updateCompletionNote(
  habitId: string,
  date: string,
  note: string | null
): Promise<ActionResult<boolean>> {
  const validation = completionNoteSchema.safeParse({ habitId, date, note })
  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || 'Invalid input'
    return { data: null, error: errorMessage }
  }

  const { habitId: validatedHabitId, date: validatedDate, note: validatedNote } = validation.data
  const supabase = await createClient()

  const { error } = await supabase
    .from('completions')
    .update({ note: validatedNote })
    .eq('habit_id', validatedHabitId)
    .eq('completed_date', validatedDate)

  if (error) {
    const msg = String((error as any)?.message || "")
    // Backward-compatible fallback if migrations haven't been applied yet
    // Supabase sometimes reports this via schema cache errors.
    if (msg.includes("note") && (msg.includes("schema cache") || msg.includes("column"))) {
      return { data: null, error: "NOTES_COLUMN_MISSING" }
    }
    console.error('Error updating completion note:', error)
    return { data: null, error: error.message || 'Failed to update note' }
  }

  return { data: true, error: null }
}
