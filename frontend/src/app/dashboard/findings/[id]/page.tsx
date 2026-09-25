"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AlertTriangle, ChevronDown, CheckCircle2, FileText, Scale, Eye, Activity, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react'
import FindingDetailCard from '@/components/dashboard/FindingDetailCard'
import { createClient } from '@/lib/client'

export default function FindingsDashboardPage() {
  const params = useParams()
  const auditId = params.id as string
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [audit, setAudit] = useState<any>(null)
  const [findings, setFindings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      const { data: auditData, error: auditError } = await supabase
        .from('audits')
        .select('*')
        .eq('id', auditId)
        .single()
        
      if (auditError) {
        console.error('Failed to load audit:', auditError)
      } else {
        setAudit(auditData)
      }

      const { data: findingsData, error: findingsError } = await supabase
        .from('findings')
        .select('*')
        .eq('audit_id', auditId)

      if (findingsError) {
        console.error('Failed to load findings:', findingsError)
      } else {
        setFindings(findingsData || [])
        if (findingsData && findingsData.length > 0) {
          setExpandedId(findingsData[0].id)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [auditId])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const overallRisk = audit?.risk_level || 'CLEAR'
  const confidenceScore = audit?.confidence_score || 0
  const escalations = findings.filter(f => f.status === 'ESCALATED').length

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-tight text-white mb-2">Audit Findings</h1>
          <p className="text-muted text-sm font-mono">Audit ID: {auditId} • {audit?.name || 'Document'}</p>
        </div>
        <button onClick={() => window.location.href = `/dashboard/reports/${auditId}`} className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors border border-white/10 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#111111] border-white/5 relative overflow-hidden">
          {overallRisk === 'HIGH' && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 blur-xl rounded-full" />}
          {overallRisk === 'MEDIUM' && <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 blur-xl rounded-full" />}
          {overallRisk === 'LOW' && <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 blur-xl rounded-full" />}
          {overallRisk === 'CLEAR' && <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 blur-xl rounded-full" />}
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted mb-2">Overall Risk</p>
            <div className={`text-3xl font-serif ${
              overallRisk === 'HIGH' ? 'text-red-400' :
              overallRisk === 'MEDIUM' ? 'text-orange-400' :
              overallRisk === 'LOW' ? 'text-yellow-400' :
              'text-green-400'
            }`}>{overallRisk}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#111111] border-white/5">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted mb-2">Confidence Score</p>
            <div className="text-3xl font-serif text-white flex items-baseline gap-2">
              {confidenceScore}<span className="text-lg text-muted">%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111111] border-white/5">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted mb-2">Total Findings</p>
            <div className="text-3xl font-serif text-white">{findings.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#111111] border-white/5">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted mb-2">Human Escalations</p>
            <div className={`text-3xl font-serif ${escalations > 0 ? 'text-red-400' : 'text-white'}`}>{escalations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif tracking-tight text-white mb-4">Identified Clauses</h2>
        
        {findings.length === 0 && (
          <div className="text-muted text-sm border border-white/5 bg-black/50 p-8 rounded-xl text-center">
            No compliance risks identified.
          </div>
        )}

        {findings.map((finding) => {
          let rec: any = {};
          try {
            rec = finding.recommendation ? JSON.parse(finding.recommendation) : {};
          } catch(e) {}
          
          return (
          <div key={finding.id} className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden transition-all duration-300">
            {/* Finding Header (Clickable) */}
            <div 
              onClick={() => toggleExpand(finding.id)}
              className="p-6 cursor-pointer hover:bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className={`mt-1 px-3 py-1 rounded-full text-xs font-medium border shrink-0 ${
                  finding.risk_level === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  finding.risk_level === 'MEDIUM' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                  finding.risk_level === 'LOW' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                  'bg-green-500/10 text-green-400 border-green-500/20'
                }`}>
                  {finding.risk_level} RISK
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1 line-clamp-1">{finding.clause_text}</h3>
                  <p className="text-sm text-muted line-clamp-2">{finding.issue_description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm shrink-0">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-white/80">{finding.confidence_score}% Confidence</span>
                  <span className="text-muted font-mono text-xs">{rec.location || 'Unknown location'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {finding.status === 'ESCALATED' && <ShieldAlert className="w-4 h-4 text-red-400" />}
                  {finding.status === 'CONFIRMED' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  {finding.status === 'ACCEPTED RISK' && <Activity className="w-4 h-4 text-yellow-400" />}
                  <span className={`font-mono text-xs ${
                    finding.status === 'ESCALATED' ? 'text-red-400' : 'text-muted'
                  }`}>{finding.status}</span>
                  <ChevronDown className={`w-5 h-5 text-muted transition-transform duration-300 ${expandedId === finding.id ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            {/* Finding Expanded Detail */}
            {expandedId === finding.id && (
              <div className="border-t border-white/5 bg-black/50 p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-mono uppercase text-muted mb-3 flex items-center gap-2">
                        <Scale className="w-4 h-4" /> Legal Concern
                      </h4>
                      <p className="text-sm text-white/90 leading-relaxed bg-black/40 p-4 rounded-lg border border-white/5">
                        {finding.issue_description}
                      </p>
                    </div>

                    {rec.reasoning_summary && (
                      <div>
                        <h4 className="text-xs font-mono uppercase text-muted mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4" /> Reasoning Summary
                        </h4>
                        <p className="text-sm text-white/90 leading-relaxed bg-black/40 p-4 rounded-lg border border-white/5">
                          {rec.reasoning_summary}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-mono uppercase text-muted mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> High Risk Clause (Contract Loophole)
                      </h4>
                      <div className="bg-black/40 p-4 rounded-lg border border-white/5 border-l-4 border-l-red-500/50">
                        <p className="text-sm font-serif text-white/80 leading-relaxed italic">
                          "{rec.exact_contract_quote || finding.clause_text}"
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted font-mono">
                          <span>📍 {rec.location || 'Unknown location'} (Page {rec.page_number || 'N/A'})</span>
                        </div>
                      </div>
                    </div>

                    {rec.exact_law_quote && (
                      <div>
                        <h4 className="text-xs font-mono uppercase text-muted mb-3 flex items-center gap-2">
                          <Scale className="w-4 h-4" /> Loophole in Law (App Reference)
                        </h4>
                        <div className="bg-black/40 p-4 rounded-lg border border-white/5 border-l-4 border-l-blue-500/50">
                          <p className="text-sm font-serif text-white/80 leading-relaxed italic">
                            "{rec.exact_law_quote}"
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                  
                  {/* Multi-Agent Debate Trace */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono uppercase text-muted mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> AI Debate Trace
                    </h4>
                    
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent hidden md:block">
                      {/* Reviewer Agent */}
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-black bg-[#111] text-muted shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                          <Eye className="w-4 h-4 text-primary" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-primary/20 bg-primary/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-primary">Reviewer Agent</span>
                          </div>
                          <p className="text-sm text-white/80">{rec.reviewer_comment || 'No reviewer comments available.'}</p>
                        </div>
                      </div>
                      
                      {/* Skeptic Agent */}
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-black bg-[#111] text-muted shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-orange-400">Skeptic Agent</span>
                          </div>
                          <p className="text-sm text-white/80">{rec.skeptic_comment || 'No valid critique found.'}</p>
                        </div>
                      </div>

                      {/* Supervisor Agent */}
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-black bg-[#111] text-muted shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <Scale className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-green-500/20 bg-green-500/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-green-400">Supervisor Arbitrator</span>
                          </div>
                          <p className="text-sm text-white/80">{rec.supervisor_comment || 'Pending final arbitration.'}</p>
                          <div className="mt-3 pt-3 border-t border-green-500/20 flex justify-between items-center text-xs font-mono">
                            <span className="text-muted">Final Status:</span>
                            <span className="text-green-400">{finding.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile fallback for debate trace */}
                    <div className="md:hidden space-y-4">
                       <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                          <span className="text-xs font-mono text-primary mb-1 block">Reviewer Agent</span>
                          <p className="text-sm text-white/80">{rec.reviewer_comment || 'No reviewer comments.'}</p>
                        </div>
                        <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
                          <span className="text-xs font-mono text-orange-400 mb-1 block">Skeptic Agent</span>
                          <p className="text-sm text-white/80">{rec.skeptic_comment || 'No valid critique.'}</p>
                        </div>
                        <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
                          <span className="text-xs font-mono text-green-400 mb-1 block">Supervisor Arbitrator</span>
                          <p className="text-sm text-white/80">{rec.supervisor_comment || 'Pending.'}</p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )})}
      </div>
    </div>
  )
}
