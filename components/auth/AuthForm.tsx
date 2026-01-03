"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import Link from "next/link"
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
}

export function AuthForm({ type, onSubmit, onOAuth }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

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

  return (
    <div className="grid gap-6">
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid gap-4">
          <div className="relative">
            <Input
              id="email"
              placeholder="Username / Email"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              className="bg-purple-100/50 border-2 border-purple-100 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 rounded-full py-6 pl-6 text-sm transition-all"
              {...form.register("email")}
            />
          </div>
          <div className="relative">
            <Input
              id="password"
              placeholder="Password"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              disabled={isLoading}
              className="bg-purple-100/50 border-2 border-purple-100 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 rounded-full py-6 pl-6 text-sm transition-all"
              {...form.register("password")}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-600 px-4 font-medium">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input type="checkbox" className="rounded-md border-purple-300 text-purple-600 focus:ring-purple-500 transition-colors" />
              <span className="group-hover:text-purple-700 transition-colors">Remember</span>
            </label>
            <button type="button" className="hover:text-purple-700 transition-colors">Forgot password?</button>
          </div>
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 text-center font-medium shadow-sm">
              {error}
            </div>
          )}

          <Button 
            disabled={isLoading} 
            style={{background: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)', color: 'white'}}
            className="w-2/3 mx-auto border-0 font-bold rounded-full py-6 shadow-lg shadow-purple-200 uppercase tracking-widest text-sm mt-6 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {type === "login" ? "LOGIN" : "REGISTER"}
          </Button>
        </div>
      </form>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">
            Or continue with
          </span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        type="button" 
        disabled={isLoading} 
        className="rounded-full border-2 border-gray-100 text-gray-600 hover:bg-gray-50 py-6"
        onClick={onOAuth}
      >
        <Github className="mr-2 h-4 w-4" />
        GitHub
      </Button> 
    </div>
  )
}
