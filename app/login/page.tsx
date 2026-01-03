"use client"

import Link from "next/link"
import { AuthForm } from "@/components/auth/AuthForm"
import { login, loginWithGithub } from "@/app/actions/auth"

export default function LoginPage() {
  const handleLogin = async (values: any) => {
      const formData = new FormData()
      formData.append('email', values.email)
      formData.append('password', values.password)
      
      const result = await login(formData)
      if (result?.error) {
          throw new Error(result.error)
      }
  }

  const handleOAuth = async () => {
      await loginWithGithub()
  }

  return (
    <div className="min-h-screen w-full grid md:grid-cols-2">
      {/* Left Side - Gradient & Shapes */}
      <div className="relative flex flex-col justify-center px-8 md:px-12 text-white overflow-hidden py-12 md:py-0"
           style={{
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ff758c 100%)'
           }}>
        
        {/* Abstract Shapes */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large Circle */}
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2"></div>
          
          {/* Diagonal Lines/Capsules */}
          <div className="absolute bottom-0 left-0 w-full h-full opacity-20">
             <div className="absolute bottom-10 left-10 w-32 h-96 bg-gradient-to-t from-orange-400 to-pink-500 rounded-full transform -rotate-45 mix-blend-overlay"></div>
             <div className="absolute bottom-0 left-40 w-40 h-[500px] bg-gradient-to-t from-purple-400 to-pink-500 rounded-full transform -rotate-45 mix-blend-overlay"></div>
             <div className="absolute bottom-40 right-20 w-24 h-64 bg-gradient-to-t from-yellow-400 to-orange-500 rounded-full transform -rotate-45 mix-blend-overlay"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold mb-6">Welcome Back!</h1>
          <p className="text-lg text-white/90 leading-relaxed">
            "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">USER LOGIN</h2>
            <p className="text-gray-500">Please enter your details</p>
          </div>

          <AuthForm 
            type="login" 
            onSubmit={handleLogin} 
            onOAuth={handleOAuth}
          />

          <div className="text-center pt-4">
             <p className="text-sm text-gray-500">
               Don't have an account?{" "}
               <Link href="/register" className="text-purple-600 hover:text-purple-700 font-bold transition-colors">
                 Sign up
               </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
