'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, ArrowRight, Scale, Search, ShieldAlert, Key, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { login } from './actions'
import { createClient } from '@/lib/client'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('email', 'demo@nyayasetu.app')
    formData.append('password', 'demo1234')
    
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground flex">
      {/* LEFT: Brand / Product Statement */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-50" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <span className="font-serif text-2xl tracking-tight text-white">NyayaSETU</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-serif tracking-tight text-white mb-6 leading-tight">
            Evidence-grounded compliance review for modern legal workflows.
          </h1>
          <p className="text-muted text-lg mb-12 max-w-md">
            NyaySetu analyzes legal and regulatory documents using retrieval-grounded evidence and a multi-agent review process built for transparent human oversight.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                <Search className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Knowledge Retrieval</h3>
                <p className="text-sm text-muted">Automatically source the most relevant sections of Indian Law for your specific jurisdiction and clause.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                <ShieldAlert className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Multi-Agent Review</h3>
                <p className="text-sm text-muted">A dedicated Reviewer, Skeptic, and Supervisor agent debate risk to eliminate automated hallucinations.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} NyayaSETU Workspace
          </p>
        </div>
      </div>

      {/* RIGHT: Authentication Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background opacity-50" />
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 text-primary mb-6">
              <Scale className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-serif tracking-tight mb-2 text-white">Secure Access</h2>
            <p className="text-muted">Sign in to your compliance audit workspace</p>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            {/* Subtle top glare */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {error && (
              <div className="mb-6 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-2 text-white/70">Corporate Email</label>
                <input 
                  type="email" 
                  name="email"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                  placeholder="auditor@company.com"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/70">Password</label>
                  <Link href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot password?</Link>
                </div>
                <input 
                  type="password" 
                  name="password"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button disabled={loading} type="submit" className="group w-full bg-primary text-primary-foreground rounded-lg px-4 py-3 text-sm font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                {loading ? 'Authenticating...' : 'Authenticate'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>


            {/* DEMO ACCESS SECTION */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-white">Demo Access</h3>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted font-mono uppercase">Email</span>
                  <span className="text-sm text-white font-mono">demo@nyayasetu.app</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-muted font-mono uppercase">Password</span>
                  <span className="text-sm text-white font-mono">demo1234</span>
                </div>
                <button 
                  disabled={loading}
                  onClick={handleDemoLogin}
                  type="button" 
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-md px-3 py-2 text-xs font-medium transition-colors"
                >
                  Use Demo Credentials
                </button>
              </div>
            </div>

          </div>

          <p className="text-center text-xs text-muted">
            Don't have an account? <Link href="/signup" className="underline hover:text-white transition-colors">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

