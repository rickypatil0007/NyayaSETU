'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Settings, ShieldAlert, LogOut, BookOpen, Database, AlertTriangle, Scale } from "lucide-react";
import { logout } from "@/app/login/actions";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/audits', label: 'Audits', icon: ShieldAlert },
    { href: '/dashboard/documents', label: 'Documents', icon: FileText },
    { href: '/dashboard/knowledge', label: 'Knowledge Base', icon: Database },
    { href: '/dashboard/reports', label: 'Reports', icon: BookOpen },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-surface/50 flex flex-col animate-slide-in-left">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="font-serif text-xl tracking-wider uppercase font-semibold hover:text-accent transition-colors">
            NyayaSETU
          </Link>
          <div className="text-[10px] font-mono text-muted/40 mt-1 uppercase tracking-widest">Indian Jurisdiction</div>
        </div>
        
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted/40 px-3 pt-3 pb-2">Main</div>
          {navItems.map((item) => {
            const active = item.exact 
              ? pathname === item.href 
              : isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-accent/10 text-accent font-medium border border-accent/15"
                    : "text-muted hover:text-foreground hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
          
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted/40 px-3 pt-6 pb-2">Review</div>
          <Link
            href="/dashboard/escalations"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              isActive('/dashboard/escalations')
                ? "bg-accent/10 text-accent font-medium border border-accent/15"
                : "text-muted hover:text-foreground hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            <AlertTriangle size={16} />
            Escalations
          </Link>
        </nav>
        
        <div className="p-3 border-t border-white/5 flex flex-col gap-1">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              isActive('/dashboard/settings')
                ? "bg-accent/10 text-accent font-medium border border-accent/15"
                : "text-muted hover:text-foreground hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            <Settings size={16} />
            Settings
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-muted hover:text-critical hover:bg-critical/5 rounded-lg text-sm transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#050505]">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
