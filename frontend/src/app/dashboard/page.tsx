import { Suspense } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Activity, ShieldAlert, FileText, CheckCircle, Plus, ChevronRight, AlertTriangle, Scale, Search, History } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import RiskSummaryClient from './RiskSummaryClient'

function RiskSummarySkeleton() {
  return <div className="h-[200px] mt-4 w-full bg-white/5 animate-pulse rounded-lg" />
}

export default async function DashboardOverview() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profileData } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  const userName = profileData?.full_name || user.email?.split('@')[0] || 'Auditor'

  // Fetch Audits
  const { data: audits } = await supabase
    .from('audits')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const totalAudits = audits?.length || 0
  const completedAudits = audits?.filter(a => a.status === 'COMPLETED').length || 0
  const inReviewAudits = audits?.filter(a => a.status === 'RUNNING' || a.status === 'PENDING').length || 0
  const escalatedAudits = audits?.filter(a => a.status === 'ESCALATED').length || 0

  // Fetch Findings for Risk Summary & Attention Required
  const { data: findings } = await supabase
    .from('findings')
    .select('*, audits!inner(owner_id, name)')
    .eq('audits.owner_id', user.id)

  const escalatedFindings = findings?.filter(f => f.status === 'ESCALATED') || []
  
  const riskCounts = {
    HIGH: findings?.filter(f => f.risk_level === 'HIGH').length || 0,
    MEDIUM: findings?.filter(f => f.risk_level === 'MEDIUM').length || 0,
    LOW: findings?.filter(f => f.risk_level === 'LOW').length || 0,
    CLEAR: findings?.filter(f => f.risk_level === 'CLEAR').length || 0
  }

  const recentAudits = audits?.slice(0, 5) || []

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* 26. DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-tight text-white mb-1">Good morning, {userName}</h1>
          <p className="text-muted text-sm">Your compliance workspace</p>
        </div>
        <Link href="/dashboard/audit/new" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          New Audit
        </Link>
      </div>
      
      {/* 27. DASHBOARD SUMMARY */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#111111] border-white/5">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted mb-2">Total Audits</p>
            <div className="text-3xl font-serif text-white">{totalAudits}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#111111] border-white/5">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted mb-2">Completed</p>
            <div className="text-3xl font-serif text-white">{completedAudits}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#111111] border-white/5">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted mb-2">In Review</p>
            <div className="text-3xl font-serif text-white">{inReviewAudits}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#111111] border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 blur-xl rounded-full" />
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-medium text-red-400 mb-2">Escalated</p>
            <div className="text-3xl font-serif text-white">{escalatedAudits}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* 30. ATTENTION REQUIRED */}
        <Card className="md:col-span-2 bg-black border-white/10 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-serif flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Attention Required
            </CardTitle>
            <p className="text-sm text-muted">{escalatedFindings.length} findings require human review</p>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {escalatedFindings.length > 0 ? (
              escalatedFindings.slice(0, 3).map((finding) => (
                <Link key={finding.id} href={`/dashboard/findings/${finding.id}`} className="group flex items-start justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                  <div>
                    <p className="font-medium text-white text-sm mb-1">{finding.issue_description || 'Compliance concern identified'}</p>
                    <p className="text-xs text-muted flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${finding.risk_level === 'HIGH' ? 'bg-red-400' : finding.risk_level === 'MEDIUM' ? 'bg-orange-400' : 'bg-yellow-400'}`} /> 
                      {finding.audits?.name || 'Unknown Audit'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
                </Link>
              ))
            ) : (
              <div className="text-sm text-muted py-8 text-center bg-white/5 rounded-lg border border-white/5">
                No items currently require human review.
              </div>
            )}
            
            {escalatedFindings.length > 0 && (
              <Link href="/dashboard/escalations" className="block w-full text-center mt-2 bg-white/5 hover:bg-white/10 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                Review Escalations
              </Link>
            )}
          </CardContent>
        </Card>

        {/* 28. COMPLIANCE OVERVIEW */}
        <Card className="bg-[#111111] border-white/5">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-serif text-white">Compliance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<RiskSummarySkeleton />}>
              <RiskSummaryClient riskCounts={riskCounts} />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* 29. RECENT AUDITS */}
      <Card className="bg-[#111111] border-white/5">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-serif text-white flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Recent Audits
          </CardTitle>
          <Link href="/dashboard/audits" className="text-sm text-primary hover:text-primary/80 transition-colors">View all</Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {recentAudits.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted font-mono uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="pb-3 font-medium">Audit</th>
                    <th className="pb-3 font-medium">Document</th>
                    <th className="pb-3 font-medium hidden md:table-cell">Jurisdiction</th>
                    <th className="pb-3 font-medium">Risk</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Confidence</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentAudits.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                      <td className="py-4 font-mono text-white/80">
                        <Link href={`/dashboard/audit/${row.id}/live`} className="absolute inset-0 z-10" />
                        <span className="relative z-20 pointer-events-none">{row.id.split('-')[0]}</span>
                      </td>
                      <td className="py-4 font-medium text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted hidden sm:block" />
                        {row.name}
                      </td>
                      <td className="py-4 text-muted hidden md:table-cell">{row.jurisdiction || 'India'}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          row.risk_level === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          row.risk_level === 'MEDIUM' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          row.risk_level === 'LOW' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          row.risk_level === 'CLEAR' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          'bg-white/5 text-white/50 border-white/10'
                        }`}>
                          {row.risk_level || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 text-muted hidden sm:table-cell">{row.confidence_score ? `${row.confidence_score}%` : '--'}</td>
                      <td className="py-4">
                        <span className="text-white/80 text-sm flex items-center gap-1.5">
                          {row.status === 'COMPLETED' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                          {row.status === 'RUNNING' && <Activity className="w-3.5 h-3.5 text-blue-400" />}
                          {row.status === 'ESCALATED' && <ShieldAlert className="w-3.5 h-3.5 text-red-400" />}
                          {row.status === 'PENDING' && <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30" />}
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 text-muted hidden lg:table-cell">{new Date(row.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-muted border border-dashed border-white/10 rounded-lg">
                <p className="mb-4">No audits found.</p>
                <Link href="/dashboard/audit/new" className="bg-primary/20 text-primary hover:bg-primary/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Start your first audit
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
