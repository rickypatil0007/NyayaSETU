'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { ShieldAlert, ArrowRight, FileText, Clock, CheckCircle2, AlertTriangle, Filter } from 'lucide-react'

export default function AuditsPage() {
  const [audits, setAudits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('audits')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
        setAudits(data || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'ALL' ? audits : audits.filter(a => a.status === filter)

  const statusIcon = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <CheckCircle2 size={14} className="text-success" />
      case 'ESCALATED': return <AlertTriangle size={14} className="text-critical" />
      default: return <Clock size={14} className="text-warning" />
    }
  }

  return (
    <div className="flex flex-col gap-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif tracking-wide">Audits</h1>
          <p className="text-sm text-muted mt-1">All compliance audits — Indian Jurisdiction</p>
        </div>
        <Link href="/dashboard#upload-section" className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-medium px-4 py-2 rounded-lg transition-all text-sm">
          + New Audit
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['ALL', 'READY', 'COMPLETED', 'ESCALATED'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-mono px-3 py-1.5 rounded-md transition-all ${filter === f ? 'bg-accent/10 text-accent border border-accent/20' : 'text-muted hover:text-foreground bg-surfaceElevated/30 border border-transparent'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Audits List */}
      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-16 w-full rounded-xl" />
          <div className="skeleton h-16 w-full rounded-xl" />
          <div className="skeleton h-16 w-full rounded-xl" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="border border-border bg-surface rounded-xl overflow-hidden divide-y divide-border/50">
          {filtered.map((audit) => (
            <Link key={audit.id} href={`/dashboard/reports/${audit.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-surfaceElevated/30 transition-colors group">
              <div className="flex items-center gap-4">
                <FileText size={16} className="text-muted group-hover:text-accent transition-colors" />
                <div>
                  <div className="text-sm font-medium group-hover:text-accent transition-colors">{audit.name}</div>
                  <div className="text-xs text-muted">India • {new Date(audit.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {statusIcon(audit.status)}
                <span className={`text-xs font-mono px-2.5 py-1 rounded-full ${
                  audit.status === 'COMPLETED' ? 'risk-low' : 
                  audit.status === 'ESCALATED' ? 'risk-high' : 
                  'bg-surfaceElevated text-muted border border-border'
                }`}>
                  {audit.status}
                </span>
                <ArrowRight size={14} className="text-muted/30 group-hover:text-accent transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-xl p-16 text-center">
          <ShieldAlert size={40} className="text-muted/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No audits {filter !== 'ALL' ? `with status "${filter}"` : 'yet'}</h3>
          <p className="text-sm text-muted max-w-md mx-auto">Upload a contract from the Dashboard to begin your first compliance audit under Indian jurisdiction.</p>
        </div>
      )}
    </div>
  )
}
