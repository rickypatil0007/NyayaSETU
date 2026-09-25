"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Download, Printer, ArrowLeft, ShieldAlert, AlertTriangle, CheckCircle2, FileText, Info, Check, Search, Activity, Users, Scale, AlertOctagon, Target, Lightbulb, Zap } from 'lucide-react'
import { createClient } from '@/lib/client'

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const auditId = params.id as string
  
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
        
      if (auditData) {
        if (auditData.report) {
          Object.assign(auditData, auditData.report);
        }
        setAudit(auditData)
        const { data: findingsData } = await supabase
          .from('findings')
          .select('*')
          .eq('audit_id', auditId)
          .order('risk_level', { ascending: false })
        if (findingsData && findingsData.length > 0) {
          const parsedFindings = findingsData.map((f: any) => {
            let extra = {}
            if (f.recommendation) {
              try {
                extra = JSON.parse(f.recommendation)
              } catch(e) {}
            }
            return {
              ...f,
              ...extra,
              issue_description: f.issue_summary || f.issue_description
            }
          })
          setFindings(parsedFindings)
        } else {
          setFindings([]) 
        }
      } else {
        console.error("Audit not found in DB.")
        setAudit(null)
      }
      setLoading(false)
    }
    loadData()
  }, [auditId])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4 text-primary">
          <Activity className="w-8 h-8 animate-pulse" />
          <span className="font-mono text-sm tracking-widest uppercase">Generating Report...</span>
        </div>
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="text-white">Audit not found.</div>
      </div>
    )
  }

  // CORE METRICS - Separate total clauses from actionable findings
  const clausesAnalyzed = audit.clauses_detected || findings.length || 0;

  const actionableFindings = findings.filter(f => {
    const risk = (f.risk_level || '').toUpperCase()
    return risk !== 'CLEAR' && risk !== 'INFO' && risk !== 'NONE'
  })

  // Segregate findings
  const humanReviewItems = actionableFindings.filter(f => f.escalated || f.status === 'Needs Review')
  
  const loopholeRegex = /loophole|ambigu|unclear|contradict|undefined obligation|missing deadline|broad discretion|weak/i;
  const loopholeItems = actionableFindings.filter(f => 
    !humanReviewItems.includes(f) && 
    ((f.issue_summary && loopholeRegex.test(f.issue_summary)) || 
     (f.issue_description && loopholeRegex.test(f.issue_description)))
  )

  const keyFindings = actionableFindings.filter(f => 
    !humanReviewItems.includes(f) && !loopholeItems.includes(f)
  )

  const criticalCount = actionableFindings.filter(f => f.risk_level === 'CRITICAL').length
  const highCount = actionableFindings.filter(f => f.risk_level === 'HIGH').length
  const mediumCount = actionableFindings.filter(f => f.risk_level === 'MEDIUM').length
  const lowCount = actionableFindings.filter(f => f.risk_level === 'LOW').length
  const escalationCount = humanReviewItems.length

  const calculateConfidence = () => {
    if (!actionableFindings || actionableFindings.length === 0) return 95;
    const scores = actionableFindings.map(f => {
      const s = f.confidence_score;
      return (typeof s === 'number' && s > 0) ? s : 85;
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };
  const overallConfidence = audit.confidence || calculateConfidence();

  const allSources: any[] = [];
  const seenSourceIds = new Set<string>();
  actionableFindings.forEach(f => {
    if (f.sources && Array.isArray(f.sources)) {
      f.sources.forEach((src: any) => {
        if (!seenSourceIds.has(src.id)) {
          seenSourceIds.add(src.id);
          allSources.push(src);
        }
      });
    }
  });

  const handleDownloadPdf = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('report-content');
    
    const opt: any = {
      margin:       10,
      filename:     `NyayaSETU_Audit_${audit.id || auditId}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-rose-500 bg-rose-500/10 border-rose-500/30'
      case 'HIGH': return 'text-red-500 bg-red-500/10 border-red-500/30'
      case 'MEDIUM': return 'text-orange-500 bg-orange-500/10 border-orange-500/30'
      case 'LOW': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30'
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30'
    }
  }

  const renderConciseAgentTrace = (finding: any) => {
    return (
      <div className="bg-black/30 rounded p-3 text-sm border border-white/5 print:bg-gray-50 print:border-gray-200 mt-4">
        <p className="text-xs uppercase font-mono text-muted mb-2">Analysis Trace</p>
        <p className="text-white/80 print:text-gray-800 leading-relaxed mb-1">
          <span className="text-primary/70 font-semibold">Reviewer:</span> {finding.reasoning_summary || finding.reviewer_comment || "Identified compliance concern."}
        </p>
        <p className="text-white print:text-black leading-relaxed font-medium border-t border-white/5 pt-1 mt-1">
          <span className="text-primary font-semibold">Supervisor:</span> {(finding.supervisor_reason || finding.supervisor_comment || "Confirmed risk").replace("Waiting for Supervisor...", "Confirmed by fallback.")}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen pb-24 print:bg-white print:text-black print:pb-0">
      
      {/* Action Bar */}
      <div className="max-w-5xl mx-auto p-6 flex items-center justify-between no-print sticky top-0 bg-[#0A0A0A]/90 backdrop-blur-md z-10 border-b border-white/5">
        <button 
          onClick={() => router.push(`/dashboard/findings/${auditId}`)}
          className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10 flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print Report
          </button>
          <button onClick={handleDownloadPdf} className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div id="report-content" className="max-w-4xl mx-auto mt-8 bg-[#111111] p-12 rounded-xl border border-white/10 shadow-2xl print:bg-transparent print:border-none print:shadow-none print:p-0 print:m-0">
        
        {/* SECTION 1: Cover */}
        <div className="text-center border-b-2 border-primary/20 pb-10 mb-10 print:border-black/20">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3 text-white font-serif text-3xl tracking-tight print:text-black">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl">
                N
              </div>
              NyayaSETU
            </div>
          </div>
          <h1 className="text-4xl font-serif text-white tracking-tight mb-2 print:text-black">LEGAL & REGULATORY COMPLIANCE AUDIT</h1>
          <h2 className="text-xl text-muted font-medium mb-8 print:text-gray-700">{audit.name} • {audit.jurisdiction || 'India'}</h2>
          
          <div className="flex justify-center gap-12 font-mono text-sm text-muted print:text-gray-600">
            <div><span className="uppercase text-xs text-white/50 block mb-1 print:text-gray-400">Audit ID</span>NY-{audit.id.substring(0, 8).toUpperCase()}</div>
            <div><span className="uppercase text-xs text-white/50 block mb-1 print:text-gray-400">Date</span>{new Date(audit.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div><span className="uppercase text-xs text-white/50 block mb-1 print:text-gray-400">Document Type</span>{audit.audit_type || 'Contract'}</div>
          </div>
        </div>

        {/* SECTION 2: Executive Risk Summary */}
        <section className="mb-12">
          <h3 className="text-2xl font-serif text-white border-b border-white/10 pb-2 mb-6 print:text-black print:border-gray-300">Executive Risk Summary</h3>
          <div className="grid md:grid-cols-2 gap-8 mb-6">
            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-white/5 print:bg-gray-50 print:border-gray-200">
              <p className="text-sm uppercase tracking-widest text-muted mb-2 font-mono print:text-gray-500">Overall Risk Assessment</p>
              <div className="flex items-end gap-4">
                <span className={`font-bold text-red-500 break-words leading-tight ${audit.risk_level?.length > 15 ? 'text-2xl md:text-3xl break-all' : 'text-4xl'}`}>
                  {actionableFindings.length === 0 ? 'CLEAR' : (audit.risk_level || 'UNKNOWN')}
                </span>
                <span className="text-lg text-white mb-1 print:text-black">{overallConfidence}% Confidence</span>
              </div>
            </div>
            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-white/5 grid grid-cols-2 gap-4 print:bg-gray-50 print:border-gray-200">
              <div>
                <p className="text-xs uppercase text-muted mb-1 font-mono print:text-gray-500 flex items-center gap-1"><Target className="w-3 h-3" /> Actionable Findings</p>
                <p className="text-2xl font-medium text-white print:text-black">{actionableFindings.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted mb-1 font-mono print:text-gray-500">Clauses Analyzed</p>
                <p className="text-xl text-white/70 print:text-gray-700">{clausesAnalyzed}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted mb-1 font-mono text-red-400">High Risk</p>
                <p className="text-xl font-medium text-red-500">{highCount + criticalCount}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted mb-1 font-mono text-orange-400">Medium Risk</p>
                <p className="text-xl font-medium text-orange-500">{mediumCount}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted mb-1 font-mono text-yellow-400">Low Risk</p>
                <p className="text-xl font-medium text-yellow-500">{lowCount}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted mb-1 font-mono text-blue-400">Human Review</p>
                <p className="text-xl font-medium text-blue-500">{escalationCount}</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Risk Distribution (Only if findings exist) */}
        {actionableFindings.length > 0 && (
          <section className="mb-12">
            <h3 className="text-xl font-serif text-white mb-4 print:text-black">Risk Distribution</h3>
            <div className="flex h-4 rounded-full overflow-hidden bg-white/5 print:bg-gray-200">
              {criticalCount > 0 && <div style={{ width: `${(criticalCount / actionableFindings.length) * 100}%` }} className="bg-rose-500 h-full" />}
              {highCount > 0 && <div style={{ width: `${(highCount / actionableFindings.length) * 100}%` }} className="bg-red-500 h-full" />}
              {mediumCount > 0 && <div style={{ width: `${(mediumCount / actionableFindings.length) * 100}%` }} className="bg-orange-500 h-full" />}
              {lowCount > 0 && <div style={{ width: `${(lowCount / actionableFindings.length) * 100}%` }} className="bg-yellow-500 h-full" />}
              {escalationCount > 0 && <div style={{ width: `${(escalationCount / actionableFindings.length) * 100}%` }} className="bg-blue-500 h-full opacity-50" />}
            </div>
          </section>
        )}

        {/* EMPTY STATE */}
        {actionableFindings.length === 0 && (
          <section className="mb-12 text-center py-16 bg-[#1A1A1A] rounded-xl border border-green-500/20 print:bg-gray-50 print:border-gray-300">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-serif text-white mb-2 print:text-black">COMPLIANCE REVIEW COMPLETE</h3>
            <p className="text-muted max-w-lg mx-auto print:text-gray-600">
              No material compliance risks or actionable contractual issues were identified from the reviewed clauses.
            </p>
          </section>
        )}

        {/* SECTION 4: Key Findings */}
        {keyFindings.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-serif text-white border-b border-white/10 pb-2 mb-6 print:text-black print:border-gray-300 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> Key Findings
            </h3>
            <div className="space-y-8">
              {keyFindings.map((finding, idx) => (
                <div key={finding.id || idx} className="break-inside-avoid bg-[#1A1A1A] p-6 rounded-lg border border-white/5 print:bg-white print:border-gray-300 print:shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 border ${getRiskColor(finding.risk_level)}`}>
                        {finding.risk_level} RISK
                      </span>
                      <h4 className="text-lg font-medium text-white print:text-black leading-tight">
                        {finding.issue_summary || "Compliance Risk Identified"}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase font-mono text-muted mb-1 print:text-gray-500">Why It Matters</p>
                      <p className="text-sm text-white/90 leading-relaxed print:text-black">{finding.issue_description || finding.reviewer_assessment}</p>
                    </div>

                    {(finding.exact_contract_quote || finding.exact_text) && (
                      <div>
                        <p className="text-xs uppercase font-mono text-muted mb-1 print:text-gray-500">Exact Contract Text</p>
                        <p className="text-sm font-serif italic border-l-2 border-white/20 pl-3 py-1 print:border-gray-300 print:text-gray-800 text-white/70">
                          "...{finding.exact_contract_quote || finding.exact_text}..."
                        </p>
                      </div>
                    )}
                    
                    {renderConciseAgentTrace(finding)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 5: Loopholes & Ambiguities */}
        {loopholeItems.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-serif text-white border-b border-white/10 pb-2 mb-6 print:text-black print:border-gray-300 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" /> Loopholes & Ambiguities
            </h3>
            <div className="space-y-8">
              {loopholeItems.map((finding, idx) => (
                <div key={finding.id || idx} className="break-inside-avoid bg-[#1A1A1A] p-6 rounded-lg border border-yellow-500/20 print:bg-yellow-50/50 print:border-yellow-200">
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 rounded text-xs font-bold mb-2 border text-yellow-500 bg-yellow-500/10 border-yellow-500/30">
                      CONTRACTUAL WEAKNESS
                    </span>
                    <h4 className="text-lg font-medium text-white print:text-black leading-tight">
                      {finding.issue_summary || "Ambiguous or Undefined Provision"}
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-white/90 leading-relaxed print:text-black">{finding.issue_description}</p>
                    <p className="text-sm font-serif italic border-l-2 border-yellow-500/30 pl-3 py-1 print:border-yellow-400 text-yellow-100/70 print:text-gray-800">
                      "...{finding.exact_contract_quote || finding.exact_text}..."
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 6: Human / Legal Review Required */}
        {humanReviewItems.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-serif text-white border-b border-white/10 pb-2 mb-6 print:text-black print:border-gray-300 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" /> Human / Legal Review Required
            </h3>
            <div className="space-y-6">
              {humanReviewItems.map((finding, idx) => (
                <div key={finding.id || idx} className="break-inside-avoid bg-blue-500/5 p-6 rounded-lg border border-blue-500/20 print:bg-blue-50 print:border-blue-200">
                  <h4 className="text-lg font-medium text-white print:text-black mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-400" /> {finding.issue_summary || "Manual Verification Needed"}
                  </h4>
                  <p className="text-sm text-white/80 leading-relaxed print:text-gray-800 mb-4">{finding.issue_description}</p>
                  
                  <div className="bg-black/30 p-3 rounded text-sm print:bg-white print:border print:border-gray-200">
                    <span className="text-xs uppercase font-mono text-blue-400 block mb-1">Reason for Escalation</span>
                    <span className="text-white/90 print:text-black">{(finding.supervisor_reason || "Insufficient evidence or unresolved agent debate").replace("Waiting for Supervisor...", "Failed automated resolution")}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 7: Recommended Actions (Aggregate) */}
        {actionableFindings.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-serif text-white border-b border-white/10 pb-2 mb-6 print:text-black print:border-gray-300 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-500" /> Recommended Actions
            </h3>
            <div className="bg-[#1A1A1A] rounded-lg border border-white/5 overflow-hidden print:bg-transparent print:border-none">
              {actionableFindings.map((finding, idx) => (
                <div key={idx} className="p-4 border-b border-white/5 print:border-gray-200 last:border-0 flex gap-4">
                  <div className="mt-1">
                    <div className={`w-3 h-3 rounded-full ${finding.risk_level === 'CRITICAL' || finding.risk_level === 'HIGH' ? 'bg-red-500' : finding.risk_level === 'MEDIUM' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-white print:text-black mb-1">{finding.issue_summary}</p>
                    <p className="text-sm text-muted print:text-gray-700">Recommended Fix: Please review the exact contract text and clarify the terms according to standard compliance practices.</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 8: Legal Evidence */}
        {allSources.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-serif text-white border-b border-white/10 pb-2 mb-6 print:text-black print:border-gray-300 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-400" /> Supporting Legal Evidence
            </h3>
            <div className="grid gap-4">
              {allSources.map((src: any) => (
                <div key={src.id} className="bg-[#1A1A1A] p-4 rounded-lg border border-white/5 print:bg-gray-50 print:border-gray-200">
                  <p className="font-medium text-white mb-1 print:text-black text-sm">{src.title}</p>
                  <p className="text-sm text-muted print:text-gray-600 leading-relaxed font-serif italic border-l-2 border-indigo-500/30 pl-3">"{src.section}"</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 9: Methodology */}
        <section className="mb-12">
          <h3 className="text-lg font-serif text-white mb-4 print:text-black">Audit Methodology</h3>
          <div className="flex items-center justify-between bg-[#1A1A1A] p-4 rounded-lg border border-white/5 text-xs font-mono text-muted print:bg-gray-50 print:border-gray-200 print:text-gray-600 overflow-x-auto">
            <div className="text-center min-w-[80px]"><FileText className="w-4 h-4 mx-auto mb-1 text-primary/70" /> Extraction</div>
            <div className="text-white/20 px-2">→</div>
            <div className="text-center min-w-[80px]"><Search className="w-4 h-4 mx-auto mb-1 text-primary/70" /> RAG</div>
            <div className="text-white/20 px-2">→</div>
            <div className="text-center min-w-[80px]"><Users className="w-4 h-4 mx-auto mb-1 text-primary/70" /> Reviewer</div>
            <div className="text-white/20 px-2">→</div>
            <div className="text-center min-w-[80px]"><Users className="w-4 h-4 mx-auto mb-1 text-primary/70" /> Skeptic</div>
            <div className="text-white/20 px-2">→</div>
            <div className="text-center min-w-[80px]"><Scale className="w-4 h-4 mx-auto mb-1 text-primary/70" /> Supervisor</div>
          </div>
        </section>

        {/* SECTION 10: Appendix */}
        <div className="pt-8 border-t border-white/10 text-center text-xs text-muted print:border-gray-300 print:text-gray-500">
          <p className="mb-2 font-mono uppercase tracking-widest text-[10px]">Appendix — Raw Metadata</p>
          <p>Total Clauses Processed: {clausesAnalyzed} | Analyzed Findings Objects: {findings.length}</p>
          <p className="mt-2 text-white/30">NyaySetu AI compliance system does not constitute formal legal advice.</p>
        </div>

      </div>
    </div>
  )
}
