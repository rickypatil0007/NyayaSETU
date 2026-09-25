"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CheckCircle2, Circle, Loader2, AlertTriangle, Activity } from 'lucide-react'
import Link from 'next/link'

type StageStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

interface Stage {
  id: string
  name: string
  status: StageStatus
}

interface LogEvent {
  timestamp: string
  message: string
}

export default function LiveAuditPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const auditId = params.id as string
  const documentId = searchParams.get('doc_id')

  const [stages, setStages] = useState<Stage[]>([
    { id: '1', name: 'Document Processing', status: 'COMPLETED' },
    { id: '2', name: 'Knowledge Retrieval', status: 'PENDING' },
    { id: '3', name: 'Round 1: Opening', status: 'PENDING' },
    { id: '4', name: 'Round 2: Rebuttal', status: 'PENDING' },
    { id: '5', name: 'Round 3: Closing', status: 'PENDING' },
    { id: '6', name: 'Supervisor Arbitration', status: 'PENDING' },
    { id: '7', name: 'Final Verdict', status: 'PENDING' },
  ])

  const [logs, setLogs] = useState<LogEvent[]>([])
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    setLogs([{ timestamp: new Date().toLocaleTimeString(), message: 'Audit initialized for Full Document' }])
  }, [])

  useEffect(() => {
    if (!documentId) {
      setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: 'Error: Missing document ID.' }])
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'
    
    // Check if we are on Vercel without a real backend configured
    const isMockMode = typeof window !== 'undefined' && 
                       window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' && 
                       apiUrl.includes('127.0.0.1');

    if (isMockMode) {
      setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: 'Connected to mock audit engine (Vercel Demo).' }])
      
      let isCancelled = false;
      const simulateEvents = async () => {
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        
        await delay(1000); if(isCancelled) return;
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: '--- Processing Document ---' }]);
        
        await delay(1500); if(isCancelled) return;
        setStages(prev => prev.map(s => s.name === 'Knowledge Retrieval' ? { ...s, status: 'RUNNING' } : s));
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: 'Retrieving legal evidence...' }]);
        
        await delay(2000); if(isCancelled) return;
        setStages(prev => prev.map(s => s.name === 'Round 1: Opening' ? { ...s, status: 'RUNNING' } : (s.name === 'Knowledge Retrieval' ? { ...s, status: 'COMPLETED' } : s)));
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Reviewer Opening] Identified 3 potential compliance issues.` }]);
        await delay(1500); if(isCancelled) return;
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Skeptic Opening] Submitted 3 challenges.` }]);

        await delay(2000); if(isCancelled) return;
        setStages(prev => prev.map(s => s.name === 'Round 2: Rebuttal' ? { ...s, status: 'RUNNING' } : (s.name === 'Round 1: Opening' ? { ...s, status: 'COMPLETED' } : s)));
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Reviewer Rebuttal] Formulated 2 counter-arguments.` }]);
        await delay(1500); if(isCancelled) return;
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Skeptic Rebuttal] Responded with 2 counter-rebuttals.` }]);

        await delay(2000); if(isCancelled) return;
        setStages(prev => prev.map(s => s.name === 'Round 3: Closing' ? { ...s, status: 'RUNNING' } : (s.name === 'Round 2: Rebuttal' ? { ...s, status: 'COMPLETED' } : s)));
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Reviewer Closing] Final statements submitted.` }]);
        await delay(1000); if(isCancelled) return;
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Skeptic Closing] Final statements submitted.` }]);

        await delay(2500); if(isCancelled) return;
        setStages(prev => prev.map(s => s.name === 'Supervisor Arbitration' ? { ...s, status: 'RUNNING' } : (s.name === 'Round 3: Closing' ? { ...s, status: 'COMPLETED' } : s)));
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Supervisor] Adjudicated 3 findings.` }]);
        
        await delay(2000); if(isCancelled) return;
        setStages(prev => prev.map(s => s.name === 'Final Verdict' ? { ...s, status: 'RUNNING' } : (s.name === 'Supervisor Arbitration' ? { ...s, status: 'COMPLETED' } : s)));
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Verdict] COMPLETE` }]);

        await delay(1000); if(isCancelled) return;
        const mockFindings = [
          {
            id: crypto.randomUUID(),
            issue_description: "Missing explicit consent clause for non-essential cookies",
            final_risk: "MEDIUM",
            reviewer_comment: "Assessment: HIGH. Cookie policy fails GDPR standards.",
            skeptic_comment: "Challenge: Cookie banner technically covers it, but ambiguous.",
            supervisor_comment: "Final: MEDIUM RISK. Decision: Needs explicit opt-in text.",
            location: "Page 2 • Auto-Detected",
            confidence_score: 92,
            escalated: false,
            status: "Confirmed",
            risk_level: "MEDIUM",
            sources: [{id: 'gdpr-1', title: 'GDPR Art. 7', section: 'Conditions for consent'}]
          }
        ];
        sessionStorage.setItem(`audit_findings_${auditId}`, JSON.stringify(mockFindings));
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: 'Data saved to local session.' }]);

        await delay(1000); if(isCancelled) return;
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: 'Audit stream completed cleanly.' }]);
        setStages(prev => prev.map(s => s.status !== 'FAILED' ? { ...s, status: 'COMPLETED' } : s));
        setIsFinished(true);
      };

      simulateEvents();
      return () => { isCancelled = true; };
    }

    const eventSource = new EventSource(`${apiUrl}/audit/${auditId}/run?document_id=${documentId}`)

    let roundTracker = 1;

    eventSource.addEventListener('fatal_error', (event: any) => {
      setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[ERROR] ${event.data || 'Unknown error'}` }])
      setStages(prev => prev.map(s => s.status === 'RUNNING' ? { ...s, status: 'FAILED' } : s))
      eventSource.close()
    })

    eventSource.addEventListener('state', (event: any) => {
      const stateStr = event.data
      
      if (stateStr === 'QUEUED') {
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: '--- Processing Document ---' }])
      } else if (stateStr === 'RETRIEVING_EVIDENCE') {
        setStages(prev => prev.map(s => s.name === 'Knowledge Retrieval' ? { ...s, status: 'RUNNING' } : s))
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: 'Retrieving legal evidence...' }])
      } else if (stateStr === 'REVIEWER_THINKING') {
        setStages(prev => prev.map(s => s.name === 'Round 1: Opening' ? { ...s, status: 'RUNNING' } : (s.name === 'Knowledge Retrieval' ? { ...s, status: 'COMPLETED' } : s)))
      } else if (stateStr === 'REVIEWER_AMENDING') {
        roundTracker++;
        if (roundTracker === 2) {
           setStages(prev => prev.map(s => s.name === 'Round 2: Rebuttal' ? { ...s, status: 'RUNNING' } : (s.name === 'Round 1: Opening' ? { ...s, status: 'COMPLETED' } : s)))
        } else if (roundTracker === 3) {
           setStages(prev => prev.map(s => s.name === 'Round 3: Closing' ? { ...s, status: 'RUNNING' } : (s.name === 'Round 2: Rebuttal' ? { ...s, status: 'COMPLETED' } : s)))
        }
      } else if (stateStr === 'SUPERVISOR_THINKING') {
        setStages(prev => prev.map(s => s.name === 'Supervisor Arbitration' ? { ...s, status: 'RUNNING' } : (s.name === 'Round 3: Closing' ? { ...s, status: 'COMPLETED' } : (s.name === 'Round 1: Opening' && s.status === 'RUNNING' ? { ...s, status: 'COMPLETED' } : s))))
      } else if (stateStr === 'COMPLETE') {
        setStages(prev => prev.map(s => s.status !== 'FAILED' ? { ...s, status: 'COMPLETED' } : s))
        setIsFinished(true)
        eventSource.close()
      }
    })

    eventSource.addEventListener('reviewer_findings', (event: any) => {
      try {
        const data = JSON.parse(event.data)
        const count = data.findings ? data.findings.length : 0
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Reviewer Opening] Identified ${count} potential compliance issues.` }])
      } catch (e) {}
    })

    eventSource.addEventListener('skeptic_critiques', (event: any) => {
      try {
        const data = JSON.parse(event.data)
        const count = data.challenges ? data.challenges.length : 0
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Skeptic Opening] Submitted ${count} challenges.` }])
      } catch (e) {}
    })

    eventSource.addEventListener('reviewer_rebuttal', (event: any) => {
      try {
        const data = JSON.parse(event.data)
        const count = data.rebuttals ? data.rebuttals.length : 0
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Reviewer Rebuttal] Formulated ${count} counter-arguments.` }])
      } catch (e) {}
    })

    eventSource.addEventListener('skeptic_rebuttal', (event: any) => {
      try {
        const data = JSON.parse(event.data)
        const count = data.rebuttals ? data.rebuttals.length : 0
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Skeptic Rebuttal] Responded with ${count} counter-rebuttals.` }])
      } catch (e) {}
    })

    eventSource.addEventListener('reviewer_closing', (event: any) => {
      try {
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Reviewer Closing] Final statements submitted.` }])
      } catch (e) {}
    })

    eventSource.addEventListener('skeptic_closing', (event: any) => {
      try {
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Skeptic Closing] Final statements submitted.` }])
      } catch (e) {}
    })

    eventSource.addEventListener('supervisor_resolution', (event: any) => {
      try {
        const data = JSON.parse(event.data)
        const count = data.resolutions ? data.resolutions.length : 0
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Supervisor] Adjudicated ${count} findings.` }])
        setStages(prev => prev.map(s => s.name === 'Final Verdict' ? { ...s, status: 'RUNNING' } : (s.name === 'Supervisor Arbitration' ? { ...s, status: 'COMPLETED' } : s)))
      } catch (e) {}
    })
    
    eventSource.addEventListener('final_verdict', (event: any) => {
      setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `[Verdict] ${event.data}` }])
      setStages(prev => prev.map(s => s.name === 'Final Verdict' ? { ...s, status: 'COMPLETED' } : s))
    })

    eventSource.addEventListener('complete_data', (event: any) => {
        try {
            const finalFindings = JSON.parse(event.data)
            
            // Clean up missing data for UI
            const uiFindings = finalFindings.map((f: any) => {
                let updated = { ...f };
                if (updated.final_risk === 'CLEAR' || updated.final_risk === 'NONE' || !updated.final_risk) {
                  if (!updated.skeptic?.challenge) updated.skeptic = { challenge: 'No debate required. Finding is compliant.' };
                  if (!updated.supervisor?.reason) updated.supervisor = { reason: 'Approved automatically. No risk detected.' };
                  updated.status = 'Confirmed';
                  updated.risk_level = 'CLEAR';
                }
                
                // Align with what frontend report expects
                updated.issue_description = updated.reviewer?.issue || "Issue found";
                updated.reviewer_comment = `Assessment: ${updated.reviewer?.risk_level}. ${updated.reviewer?.issue}`;
                updated.skeptic_comment = `Challenge: ${updated.skeptic?.challenge || 'None'}`;
                updated.supervisor_comment = `Final: ${updated.final_risk} RISK. Decision: ${updated.supervisor?.verdict}`;
                updated.location = "Page 1 • Auto-Detected";
                updated.confidence_score = updated.reviewer?.confidence || 85;
                updated.escalated = updated.human_escalation || false;
                updated.sources = updated.reviewer?.evidence_ids?.map((id: string) => ({ id, title: "Legal Authority", section: "Applicable Provision" })) || [];
                
                return updated;
            });
            
            sessionStorage.setItem(`audit_findings_${auditId}`, JSON.stringify(uiFindings));
            setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: 'Data saved to local session.' }])
        } catch (e) {}
    })

    eventSource.addEventListener('audit_connected', (event: any) => {
      setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: 'Connected to audit engine successfully.' }])
    })

    eventSource.addEventListener('done', (event: any) => {
      setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: 'Audit stream completed cleanly.' }])
      setStages(prev => prev.map(s => s.status !== 'FAILED' ? { ...s, status: 'COMPLETED' } : s))
      setIsFinished(true)
      eventSource.close()
    })

    let reconnectAttempts = 0;
    eventSource.onerror = (error) => {
      console.error('SSE Error:', error)
      reconnectAttempts++;
      if (reconnectAttempts > 3) {
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: 'Live audit connection lost. Disconnected.' }])
        eventSource.close();
      } else {
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: 'Live audit connection lost. Reconnecting...' }])
      }
    }

    return () => {
      eventSource.close()
    }
  }, [auditId, documentId])

  useEffect(() => {
    if (isFinished) {
      const saveAuditData = async () => {
        try {
          await fetch(`/api/audits/${auditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ execution_status: 'COMPLETED' })
          })
          console.log("Audit execution status updated to COMPLETED.");
        } catch (e) {
          console.error("Failed to update audit status", e)
        }
      }
      saveAuditData()
    }
  }, [isFinished, auditId])

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-primary animate-pulse" />
            <h1 className="text-2xl font-serif tracking-tight text-white">LIVE AUDIT EXECUTION</h1>
          </div>
          <p className="text-muted text-sm font-mono">ID: {auditId} • Document ID: {documentId || 'Unknown'} • Jurisdiction: India</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md text-xs font-mono text-white/80 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Est. Audit Time: ~2-3 mins
            </div>
            <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md text-xs font-mono text-white/80 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              Est. Human Review / Remediation: ~15-20 mins
            </div>
          </div>
        </div>
        {isFinished && (
          <Link href={`/dashboard/reports/${auditId}`} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Show Report
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Pipeline Tracker */}
        <Card className="bg-[#111111] border-white/5">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted">Execution Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {stages.map((stage) => (
                <div key={stage.id} className="flex items-center gap-4">
                  <div className="shrink-0">
                    {stage.status === 'COMPLETED' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {stage.status === 'RUNNING' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                    {stage.status === 'FAILED' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                    {stage.status === 'PENDING' && <Circle className="w-5 h-5 text-white/20" />}
                  </div>
                  <div className={`text-sm font-medium ${
                    stage.status === 'COMPLETED' ? 'text-white' :
                    stage.status === 'RUNNING' ? 'text-primary' :
                    stage.status === 'FAILED' ? 'text-red-500' :
                    'text-muted'
                  }`}>
                    {stage.id.padStart(2, '0')} {stage.name}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Stream */}
        <Card className="bg-[#0A0A0A] border-white/5 shadow-inner">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted flex items-center justify-between">
              Live Activity Stream
              {stages.some(s => s.status === 'RUNNING') && (
                <span className="flex items-center gap-2 text-primary text-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Receiving events...
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] overflow-y-auto p-6 font-mono text-xs space-y-4">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span suppressHydrationWarning className="text-white/30 shrink-0">{log.timestamp}</span>
                  <span className={`${
                    log.message.includes('[ERROR]') ? 'text-red-400' :
                    log.message.includes('[Reviewer') ? 'text-primary' :
                    log.message.includes('[Skeptic') ? 'text-orange-400' :
                    log.message.includes('[Supervisor]') ? 'text-green-400' :
                    log.message.includes('[Verdict]') ? 'text-yellow-400 font-bold' :
                    'text-green-400/90'
                  }`}>{log.message}</span>
                </div>
              ))}
              <div className="flex gap-4">
                <span className="text-white/30">_</span>
                <span className="text-primary animate-pulse">▋</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
