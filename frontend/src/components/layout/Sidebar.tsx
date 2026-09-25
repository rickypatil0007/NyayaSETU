'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, History, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'New Audit', href: '/dashboard/audit/new', icon: FileText },
  { name: 'Audit History', href: '/dashboard/audits', icon: History },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-black border-r border-white/10 h-screen sticky top-0 flex-col hidden md:flex">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="font-serif font-bold text-white text-lg">N</span>
          </div>
          <span className="font-serif font-semibold text-xl text-white tracking-tight">NyayaSETU</span>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== '/dashboard')
          
          return item.name === 'New Audit' ? (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
              {item.name}
            </a>
          ) : (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted hover:bg-white/5 hover:text-red-400 transition-all text-left"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
