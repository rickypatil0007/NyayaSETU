'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { BookOpen, Download, ArrowRight, ShieldAlert, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-4 py-2 text-xs">
        <p className="text-foreground font-medium">{label}</p>
        <p className="text-accent">{payload[0].value} findings</p>
      </div>
    )
  }
  return null
}

export default function ReportsPage() {
  const [audits, setAudits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('audits')
          .select('*')
          .eq('owner_id', user.id)
          .eq('status', 'COMPLETED')
          .order('created_at', { ascending: false })
        setAudits(data || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  // Aggregate findings data for chart
  const findingsData = audits.reduce((acc: any[], audit) => {
    if (audit.report?.resolutions) {
      audit.report.resolutions.forEach((r: any) => {
        const status = r.verdict || 'unknown'
        const existing = acc.find(d => d.name === status)
        if (existing) existing.count++
        else acc.push({ name: status, count: 1 })
      })
    }
    return acc
  }, [])

  const statusColors: Record<string, string> = {
    'CONFIRMED': '#ef4444',
    'REJECTED': '#6b7280',
    'ESCALATED': '#f59e0b',
    'unknown': '#444',
  }

  return (
    <div className="flex flex-col gap-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif tracking-wide">Reports</h1>
          <p className="text-sm text-muted mt-1">Completed compliance audit reports</p>
        </div>
      </div>

      {/* Findings Summary Chart */}
      {findingsData.length > 0 && (
        <div className="border border-border bg-surface rounded-xl p-6">
          <h3 className="text-sm font-mono uppercase tracking-wider text-muted mb-4">Findings Distribution</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={findingsData}>
                <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {findingsData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-20 w-full rounded-xl" />
          <div className="skeleton h-20 w-full rounded-xl" />
        </div>
      ) : audits.length > 0 ? (
        <div className="grid gap-4">
          {audits.map((audit) => {
            const resolutions = audit.report?.resolutions || []
            const confirmed = resolutions.filter((r: any) => r.verdict === 'CONFIRMED').length
            const escalated = resolutions.filter((r: any) => r.verdict === 'ESCALATED').length
            const rejected = resolutions.filter((r: any) => r.verdict === 'REJECTED').length

            return (
              <Link key={audit.id} href={`/dashboard/reports/${audit.id}`} className="border border-border bg-surface rounded-xl p-6 hover:border-accent/20 transition-all group hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <CheckCircle2 size={18} className="text-success" />
                    </div>
                    <div>
                      <div className="font-medium group-hover:text-accent transition-colors">{audit.name}</div>
                      <div className="text-xs text-muted">{new Date(audit.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-muted/30 group-hover:text-accent transition-colors" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="text-[10px] font-mono uppercase text-muted mb-1">Confirmed</div>
                    <div className="text-lg font-semibold text-critical">{confirmed}</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="text-[10px] font-mono uppercase text-muted mb-1">Escalated</div>
                    <div className="text-lg font-semibold text-warning">{escalated}</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="text-[10px] font-mono uppercase text-muted mb-1">Rejected</div>
                    <div className="text-lg font-semibold text-muted">{rejected}</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-xl p-16 text-center">
          <BookOpen size={40} className="text-muted/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No completed reports yet</h3>
          <p className="text-sm text-muted max-w-md mx-auto">
            Complete a contract audit to see its report here with findings, decisions, and agent debate resolutions.
          </p>
        </div>
      )}
    </div>
  )
}
