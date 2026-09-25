'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { ShieldAlert, ArrowRight, FileText, CheckCircle2, AlertTriangle, Scale, Activity } from 'lucide-react'

export default function FindingsPage() {
  const [findings, setFindings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Fetch audits to get the IDs for this user
        const { data: audits } = await supabase.from('audits').select('id, name').eq('owner_id', user.id)
        if (audits && audits.length > 0) {
          const auditIds = audits.map(a => a.id)
          const { data } = await supabase
            .from('findings')
            .select('*, audits(name)')
            .in('audit_id', auditIds)
            .order('created_at', { ascending: false })
          setFindings(data || [])
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'ALL' ? findings : findings.filter(f => f.status === filter || f.risk_level === filter)

  return (
    <div className="flex flex-col gap-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif tracking-wide">Global Findings</h1>
          <p className="text-sm text-muted mt-1">All compliance risks identified across your workspace</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['ALL', 'HIGH', 'MEDIUM', 'LOW', 'ESCALATED', 'CONFIRMED'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-mono px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${filter === f ? 'bg-accent/10 text-accent border border-accent/20' : 'text-muted hover:text-foreground bg-surfaceElevated/30 border border-transparent'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Findings List */}
      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-24 w-full rounded-xl" />
          <div className="skeleton h-24 w-full rounded-xl" />
          <div className="skeleton h-24 w-full rounded-xl" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4">
          {filtered.map((finding) => (
            <Link key={finding.id} href={`/dashboard/findings/${finding.audit_id}`} className="bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-all hover-lift block group">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 px-3 py-1 rounded-full text-[10px] font-mono border shrink-0 ${
                    finding.risk_level === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    finding.risk_level === 'MEDIUM' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    finding.risk_level === 'LOW' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-green-500/10 text-green-400 border-green-500/20'
                  }`}>
                    {finding.risk_level} RISK
                  </div>
                  <div>
                    <h3 className="text-sm font-medium group-hover:text-accent transition-colors line-clamp-1">{finding.clause_text}</h3>
                    <p className="text-xs text-muted mt-1 line-clamp-2">{finding.issue_description}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted/70">
                      <span className="flex items-center gap-1"><FileText size={12} /> {finding.audits?.name || 'Unknown Document'}</span>
                      <span className="flex items-center gap-1"><Scale size={12} /> {finding.confidence_score}% Confidence</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  <span className={`text-[10px] font-mono px-2 py-1 rounded-full flex items-center gap-1 ${
                    finding.status === 'ESCALATED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                    finding.status === 'CONFIRMED' ? 'bg-accent/10 text-accent border border-accent/20' : 
                    'bg-surfaceElevated text-muted border border-border'
                  }`}>
                    {finding.status === 'ESCALATED' && <ShieldAlert size={10} />}
                    {finding.status === 'CONFIRMED' && <CheckCircle2 size={10} />}
                    {finding.status === 'ACCEPTED RISK' && <Activity size={10} />}
                    {finding.status}
                  </span>
                  <ArrowRight size={14} className="text-muted/30 group-hover:text-accent transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-xl p-16 text-center">
          <ShieldAlert size={40} className="text-muted/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No findings match</h3>
          <p className="text-sm text-muted max-w-md mx-auto">No compliance risks found matching this filter criteria across your audits.</p>
        </div>
      )}
    </div>
  )
}
