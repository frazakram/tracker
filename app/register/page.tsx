"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth/AuthForm"
import { signup } from "@/app/actions/auth"

export default function RegisterPage() {
  const router = useRouter()
  
  const handleRegister = async (values: any) => {
      const formData = new FormData()
      formData.append('email', values.email)
      formData.append('password', values.password)
      
      const result = await signup(formData)
      if (result?.error) {
           throw new Error(result.error)
      }
      if (result?.success) {
          alert(result.message)
          if (result.message.includes('Redirecting')) {
            setTimeout(() => router.push('/login'), 1500)
          }
      }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Gradient Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Base gradient - Green/Teal theme */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #10B981 35%, #34D399 65%, #6EE7B7 100%)'
          }}
        />
        
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-teal-500/30 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute top-1/2 -right-20 w-[400px] h-[400px] bg-emerald-400/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] bg-green-500/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Geometric accents */}
          <div className="absolute top-20 right-20 w-32 h-32 border-2 border-white/20 rounded-2xl rotate-12 animate-float" />
          <div className="absolute bottom-32 left-20 w-24 h-24 border-2 border-white/15 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-lg rotate-45 animate-float" style={{ animationDelay: '0.5s' }} />
          
          {/* Decorative lines */}
          <div className="absolute top-40 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute bottom-60 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          {/* Logo/Brand */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white/90 text-xl font-semibold tracking-wide">HabitTracker</span>
            </div>
          </div>
          
          {/* Main heading */}
          <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
            Start Your<br />Journey
          </h1>
          
          {/* Description */}
          <div className="max-w-md">
            <p className="text-xl text-white/80 leading-relaxed font-light">
              Build habits that last a lifetime. Join thousands of high performers who have transformed their lives.
            </p>
          </div>
          
          {/* Features */}
          <div className="mt-16 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/90 text-lg">Track unlimited habits</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-white/90 text-lg">Beautiful analytics & insights</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white/90 text-lg">Daily reminders & streaks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-[45%] flex flex-col min-h-screen bg-slate-50">
        {/* Mobile header */}
        <div className="lg:hidden p-6 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-white text-lg font-semibold">HabitTracker</span>
          </div>
        </div>
        
        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-[420px]">
            {/* Form header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                Create Account
              </h2>
              <p className="text-slate-500 text-base">
                It's free and takes less than a minute
              </p>
            </div>

            <AuthForm type="register" onSubmit={handleRegister} />

            <div className="text-center mt-8">
              <p className="text-slate-500">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors hover:underline underline-offset-2"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 text-center text-slate-400 text-sm">
          © 2026 HabitTracker. All rights reserved.
        </div>
      </div>
    </div>
  )
}
