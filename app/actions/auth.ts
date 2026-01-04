'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { z } from 'zod'

// ============================================
// Zod Validation Schemas
// ============================================

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be 255 characters or less')
  .toLowerCase()
  .trim()

const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters')
  .max(72, 'Password must be 72 characters or less') // bcrypt limit

const signupPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be 72 characters or less')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

const signupSchema = z.object({
  email: emailSchema,
  password: signupPasswordSchema,
})

// ============================================
// Types
// ============================================

export interface AuthResult {
  error?: string
  success?: boolean
  message?: string
}

// ============================================
// Server Actions
// ============================================

export async function login(formData: FormData): Promise<AuthResult | never> {
  // Extract and validate form data
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const validation = loginSchema.safeParse(rawData)
  
  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || 'Invalid input'
    return { error: errorMessage }
  }

  const { email, password } = validation.data

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Provide user-friendly error messages
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Invalid email or password' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData): Promise<AuthResult> {
  // Extract and validate form data
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const validation = signupSchema.safeParse(rawData)
  
  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || 'Invalid input'
    return { error: errorMessage }
  }

  const { email, password } = validation.data

  const supabase = await createClient()
  
  // Need origin for email confirmation link
  const origin = (await headers()).get('origin')

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
    // Provide user-friendly error messages
    if (error.message.includes('already registered')) {
      return { error: 'An account with this email already exists' }
    }
    return { error: error.message }
  }

  // Different message based on environment
  const message = isDevelopment 
    ? 'Account created! Redirecting to login...' 
    : 'Check your email to continue.'

  return { success: true, message }
}

export async function signout(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Note: Client-side state (localStorage) should be cleared by the client
  // after redirect. Server actions cannot access window/localStorage.
  
  redirect('/login')
}

export async function loginWithGithub(): Promise<AuthResult | never> {
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

  return { error: 'Failed to initialize GitHub login' }
}
