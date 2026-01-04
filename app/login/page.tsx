"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AuthForm } from "@/components/auth/AuthForm"
import { login, loginWithGithub } from "@/app/actions/auth"
import { useHabitStore } from "@/store/useHabitStore"

export default function LoginPage() {
  const clearAllData = useHabitStore(state => state.clearAllData)

  // Clear local state when landing on login page (e.g., after logout)
  useEffect(() => {
    clearAllData()
  }, [clearAllData])

  const handleLogin = async (values: any) => {
    const formData = new FormData()
    formData.append("email", values.email)
    formData.append("password", values.password)

    const result = await login(formData)
    if (result?.error) {
      throw new Error(result.error)
    }
  }

  const handleOAuth = async () => {
    await loginWithGithub()
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden px-4 auth-space">
      <div className="pointer-events-none absolute inset-0 bg-black/20" />

      <main className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          {/* Gradient ring */}
          <div className="rounded-3xl bg-gradient-to-br from-white/18 via-white/8 to-white/12 p-[1px] shadow-[0_40px_120px_-55px_rgba(0,0,0,0.85)]">
            <div className="bg-gradient-to-b from-slate-950/55 to-slate-950/35 backdrop-blur-xl rounded-3xl px-6 sm:px-10 py-10 sm:py-12 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                  HabitTracker
                </h1>
                <p className="text-slate-300/90 text-sm sm:text-base mt-2">
                  Build consistency. Track progress.
                </p>
              </div>

              <AuthForm type="login" theme="dark" onSubmit={handleLogin} onOAuth={handleOAuth} />

              <div className="text-center mt-6">
                <p className="text-slate-300 text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors inline-flex items-center gap-1"
                  >
                    Sign up <span aria-hidden>›</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
