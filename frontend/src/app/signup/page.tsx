'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, ArrowRight, Scale, Search, ShieldAlert, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { signup } from '@/app/login/actions'

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await signup(formData)
    
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
            Create your compliance workspace.
          </h1>
          <p className="text-muted text-lg mb-12 max-w-md">
            Join NyaySetu to analyze legal and regulatory documents using retrieval-grounded evidence.
          </p>
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
            <h2 className="text-3xl font-serif tracking-tight mb-2 text-white">Register</h2>
            <p className="text-muted">Create a new account</p>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            {/* Subtle top glare */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {error && (
              <div className="mb-6 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-2 text-white/70">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-2 text-white/70">Email</label>
                <input 
                  type="email" 
                  name="email"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                  placeholder="auditor@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-2 text-white/70">Password</label>
                <input 
                  type="password" 
                  name="password"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-2 text-white/70">Role</label>
                <select 
                  name="role"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                  required
                >
                  <option value="Founder / Business Owner">Founder / Business Owner</option>
                  <option value="Legal Professional">Legal Professional</option>
                  <option value="Compliance / Operations">Compliance / Operations</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="Student / Researcher">Student / Researcher</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button disabled={loading} type="submit" className="group w-full mt-4 bg-primary text-primary-foreground rounded-lg px-4 py-3 text-sm font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                {loading ? 'Creating...' : 'Create Account'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-muted">
            Already have an account? <Link href="/login" className="underline hover:text-white transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
