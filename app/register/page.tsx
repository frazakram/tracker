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
    <div className="min-h-screen w-full grid md:grid-cols-2">
      {/* Left Side - Gradient & Shapes */}
      <div className="relative flex flex-col justify-center px-8 md:px-12 text-white overflow-hidden py-12 md:py-0"
           style={{
             background: 'linear-gradient(135deg, #4ade80 0%, #3b82f6 50%, #8b5cf6 100%)'
           }}>
        
        {/* Abstract Shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2"></div>
          
          <div className="absolute bottom-0 left-0 w-full h-full opacity-20">
             <div className="absolute bottom-10 left-10 w-32 h-96 bg-gradient-to-t from-blue-400 to-green-400 rounded-full transform -rotate-45 mix-blend-overlay"></div>
             <div className="absolute bottom-0 left-40 w-40 h-[500px] bg-gradient-to-t from-teal-400 to-blue-500 rounded-full transform -rotate-45 mix-blend-overlay"></div>
             <div className="absolute bottom-40 right-20 w-24 h-64 bg-gradient-to-t from-green-300 to-emerald-500 rounded-full transform -rotate-45 mix-blend-overlay"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold mb-6">Join Us Now!</h1>
          <p className="text-lg text-white/90 leading-relaxed">
            Start your journey today and build habits that last a lifetime. Join thousands of high performers.
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
             <h2 className="text-3xl font-bold text-gray-900 tracking-tight">CREATE ACCOUNT</h2>
             <p className="text-gray-500">It's free and takes 1 minute</p>
          </div>

          <AuthForm type="register" onSubmit={handleRegister} />

          <div className="text-center pt-4">
             <p className="text-sm text-gray-500">
               Already have an account?{" "}
               <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                 Sign in
               </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
