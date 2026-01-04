"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Github, Loader2 } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

interface AuthFormProps {
  type: "login" | "register"
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
  onOAuth?: () => Promise<void>
  theme?: "light" | "dark"
}

export function AuthForm({ type, onSubmit, onOAuth, theme = "light" }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { formState: { errors } } = form

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    try {
      await onSubmit(values)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isLogin = type === "login"
  const showOAuth = isLogin && typeof onOAuth === "function"

  const isDark = theme === "dark"

  const labelClass = isDark
    ? "text-sm font-medium text-slate-200 block"
    : "text-sm font-medium text-gray-900 block"

  const inputClass = isDark
    ? "h-11 w-full bg-white/5 border border-white/10 rounded-lg px-3 text-sm text-slate-100 placeholder:text-slate-400 shadow-[0_1px_2px_rgba(0,0,0,0.35)] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-300/40 transition-all"
    : "h-11 w-full bg-white border border-gray-200 rounded-lg px-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_2px_rgba(16,24,40,0.06)] focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 transition-all"

  const submitClassName =
    type === "login"
      ? isDark
        ? "w-full h-11 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-[0_18px_38px_rgba(56,189,248,0.18)] hover:shadow-[0_22px_45px_rgba(99,102,241,0.22)] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:ring-offset-0 relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(1px_1px_at_12%_30%,rgba(255,255,255,0.35)_0,transparent_2px),radial-gradient(1px_1px_at_70%_60%,rgba(255,255,255,0.22)_0,transparent_2px),radial-gradient(1px_1px_at_35%_75%,rgba(255,255,255,0.18)_0,transparent_2px)] before:opacity-40 after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/10 after:via-white/0 after:to-white/10 after:opacity-40"
        : "w-full h-11 text-sm font-semibold rounded-lg bg-[#5c4fd2] text-white shadow-[0_12px_22px_rgba(92,79,210,0.25)] hover:bg-[#5245c5] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
      : "w-full h-11 text-sm font-semibold rounded-lg bg-emerald-600 text-white shadow-[0_12px_22px_rgba(16,185,129,0.22)] hover:bg-emerald-700 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        {/* Email Input */}
        <div className="space-y-1.5">
          <label htmlFor="email" className={labelClass}>
            Email address
          </label>
          <div className="relative">
            <Input
              id="email"
              placeholder="you@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              className={inputClass}
              {...form.register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-0.5">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              disabled={isLoading}
              className={inputClass}
              {...form.register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-0.5">
              {errors.password.message}
            </p>
          )}
        </div>
        
        {/* Remember & Forgot (login only) */}
        {isLogin && (
          <div className="flex items-center justify-between pt-1">
            <label
              className={
                isDark
                  ? "flex items-center gap-2 text-sm text-slate-200 font-medium"
                  : "flex items-center gap-2 text-sm text-gray-800 font-medium"
              }
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={
                  isDark
                    ? "h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-300/50"
                    : "h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                }
              />
              Remember me
            </label>
            <button
              type="button"
              className={
                isDark
                  ? "text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                  : "text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              }
            >
              Forgot password?
            </button>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div
            className={
              isDark
                ? "flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-400/20 rounded-lg text-red-200"
                : "flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700"
            }
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit"
          disabled={isLoading} 
          className={submitClassName}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {type === "login" ? "Signing in..." : "Creating account..."}
            </>
          ) : (
            type === "login" ? "Sign In" : "Create Account"
          )}
        </Button>
      </form>
      
      {showOAuth && (
        <>
          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className={isDark ? "w-full border-t border-white/10" : "w-full border-t border-gray-200"} />
            </div>
            <div className="relative flex justify-center">
              <span
                className={
                  isDark
                    ? "px-2 text-sm text-slate-300 bg-transparent font-medium"
                    : "px-2 text-sm text-gray-700 bg-white font-medium"
                }
              >
                OR
              </span>
            </div>
          </div>

          {/* OAuth Button */}
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            className={
              isDark
                ? "w-full h-11 text-sm font-semibold rounded-lg border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center"
                : "w-full h-11 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center"
            }
            onClick={onOAuth}
          >
            <Github className={isDark ? "mr-2 h-4 w-4 text-white" : "mr-2 h-4 w-4 text-gray-900"} />
            Continue with GitHub
          </Button>
        </>
      )}
    </div>
  )
}
