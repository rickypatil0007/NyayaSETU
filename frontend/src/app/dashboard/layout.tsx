import Sidebar from '@/components/layout/Sidebar'
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-black">
        {children}
      </main>
    </div>
  )
}
