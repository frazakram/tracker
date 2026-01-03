'use server'

import { createClient } from '@/utils/supabase/server'

export interface Habit {
  id: string
  user_id: string
  name: string
  emoji: string
  created_at: string
}

export interface Completion {
  id: string
  user_id: string
  habit_id: string
  completed_date: string
  created_at: string
}

/**
 * Fetch all habits for the current user
 */
export async function fetchUserHabits(): Promise<Habit[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching habits:', error)
    return []
  }

  return data || []
}

/**
 * Create a new habit for the current user
 */
export async function createHabit(name: string, emoji: string = '📝'): Promise<{ habit: Habit | null, error: any }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { habit: null, error: 'User not authenticated' }

  const { data, error } = await supabase
    .from('habits')
    .insert([{ 
      user_id: user.id,
      name,
      emoji 
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating habit:', error)
    return { habit: null, error: error.message || error }
  }

  return { habit: data, error: null }
}

/**
 * Delete a habit
 */
export async function deleteHabit(habitId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)

  if (error) {
    console.error('Error deleting habit:', error)
    return false
  }

  return true
}

/**
 * Update a habit's name or emoji
 */
export async function updateHabit(
  habitId: string, 
  updates: { name?: string; emoji?: string }
): Promise<Habit | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', habitId)
    .select()
    .single()

  if (error) {
    console.error('Error updating habit:', error)
    return null
  }

  return data
}

/**
 * Fetch all completions for the current user
 */
export async function fetchUserCompletions(): Promise<Completion[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('completions')
    .select('*')

  if (error) {
    console.error('Error fetching completions:', error)
    return []
  }

  return data || []
}

/**
 * Add a completion (mark habit as done on a specific date)
 */
export async function addCompletion(habitId: string, date: string): Promise<Completion | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('completions')
    .insert([{
      user_id: user.id,
      habit_id: habitId,
      completed_date: date
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
export async function removeCompletion(habitId: string, date: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('completions')
    .delete()
    .eq('habit_id', habitId)
    .eq('completed_date', date)

  if (error) {
    console.error('Error removing completion:', error)
    return false
  }

  return true
}
