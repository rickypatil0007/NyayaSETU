'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { AlertTriangle, ArrowRight, FileText, UserCheck, MessageSquare } from 'lucide-react'

export default function EscalationsPage() {
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
          .order('created_at', { ascending: false })

        // Filter audits that have escalated findings
        const escalated = (data || []).filter(audit => {
          if (audit.report?.resolutions) {
            return audit.report.resolutions.some((r: any) => r.verdict === 'ESCALATED')
          }
          return audit.status === 'ESCALATED'
        })
        setAudits(escalated)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="flex flex-col gap-6 stagger-children">
      <div>
        <h1 className="text-2xl font-serif tracking-wide">Escalations</h1>
        <p className="text-sm text-muted mt-1">Findings requiring human legal review</p>
      </div>

      <div className="glass-card rounded-xl p-5 border-warning/10">
        <div className="flex items-center gap-2 text-sm">
          <UserCheck size={16} className="text-warning" />
          <span className="text-muted">These findings have been flagged by the Supervisor Agent for human legal review due to agent disagreement, ambiguous legal provisions, or high-stakes implications.</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-20 w-full rounded-xl" />
          <div className="skeleton h-20 w-full rounded-xl" />
        </div>
      ) : audits.length > 0 ? (
        <div className="grid gap-4">
          {audits.map((audit) => {
            const escalatedFindings = audit.report?.resolutions?.filter((r: any) => r.verdict === 'ESCALATED') || []

            return (
              <Link key={audit.id} href={`/dashboard/reports/${audit.id}`} className="border border-warning/20 bg-warning/[0.02] rounded-xl p-6 hover:border-warning/30 transition-all group hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <AlertTriangle size={18} className="text-warning" />
                    </div>
                    <div>
                      <div className="font-medium group-hover:text-warning transition-colors">{audit.name}</div>
                      <div className="text-xs text-muted">{escalatedFindings.length} finding(s) need human review</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-muted/30 group-hover:text-warning transition-colors" />
                </div>

                {escalatedFindings.length > 0 && (
                  <div className="space-y-2">
                    {escalatedFindings.slice(0, 3).map((finding: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted bg-background/30 rounded-lg p-3">
                        <MessageSquare size={12} className="text-warning mt-0.5 flex-shrink-0" />
                        <span>{finding.resolution_note || 'Requires human legal review — agent disagreement detected'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-xl p-16 text-center">
          <AlertTriangle size={40} className="text-muted/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No escalations</h3>
          <p className="text-sm text-muted max-w-md mx-auto">
            When the Supervisor Agent cannot reach consensus or identifies high-risk findings, they will appear here for human legal review.
          </p>
        </div>
      )}
    </div>
  )
}
