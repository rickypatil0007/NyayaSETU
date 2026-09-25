"use client"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 bg-background/50 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span className="text-xl font-serif tracking-tight font-medium text-white">NyayaSetu</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-xs font-mono uppercase tracking-wider text-muted hover:text-white transition-colors">How It Works</Link>
          <Link href="#trust" className="text-xs font-mono uppercase tracking-wider text-muted hover:text-white transition-colors">Trust</Link>
          <Link href="#use-cases" className="text-xs font-mono uppercase tracking-wider text-muted hover:text-white transition-colors">Use Cases</Link>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-muted hover:text-white transition-colors">Sign In</Link>
          <Link href="/login" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-sm hover:bg-white/90 transition-colors">
            Start an Audit
          </Link>
        </div>
      </div>
    </nav>
  )
}
