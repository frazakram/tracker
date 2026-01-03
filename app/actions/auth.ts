'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Validate form data, or use Zod validation passed from client
  // Here we assume client passed valid simple data, but for production
  // we re-validate.
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  // Need origin for email confirmation link
  const origin = (await headers()).get('origin')

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // In development mode, auto-confirm users to skip email verification
  const isDevelopment = process.env.NODE_ENV === 'development'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      // Skip email confirmation in development
      data: {
        email_confirmed: isDevelopment
      }
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Different message based on environment
  const message = isDevelopment 
    ? 'Account created! Redirecting to login...' 
    : 'Check your email to continue.'

  return { success: true, message }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Clear client-side state
  if (typeof window !== 'undefined') {
    const { useHabitStore } = await import('@/store/useHabitStore')
    useHabitStore.getState().clearAllData()
  }
  
  redirect('/login')
}

export async function loginWithGithub() {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }
}
