import { Scale, MessageSquare, Target, BookOpen, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react'

export default function FindingDetailCard({ finding }: { finding: any }) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Left Column: Context & Evidence */}
      <div className="md:col-span-1 space-y-6">
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-2 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Original Clause
          </h4>
          <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-lg text-sm text-white/80 font-serif leading-relaxed relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 rounded-l-lg" />
            "In no event shall either party's aggregate liability arising out of or related to this agreement exceed the total amount paid by customer hereunder for the services giving rise to the liability in the twelve months preceding the first incident out of which the liability arose."
          </div>
        </div>

        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
            <Scale className="w-3.5 h-3.5" /> Retrieved Evidence
          </h4>
          <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-white">Digital Personal Data Protection Act, 2023</span>
                <span className="text-[10px] text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">0.94</span>
              </div>
              <p className="text-xs text-muted font-mono mb-2">Section 8(2) • Effective: Aug 2023</p>
              <p className="text-xs text-white/70 line-clamp-2">"A Data Fiduciary shall be responsible for complying with the provisions of this Act... regardless of any agreement to the contrary."</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-white">Indian Contract Act, 1872</span>
                <span className="text-[10px] text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">0.88</span>
              </div>
              <p className="text-xs text-muted font-mono mb-2">Section 23 • Effective: 1872</p>
              <p className="text-xs text-white/70 line-clamp-2">"The consideration or object of an agreement is lawful, unless it is forbidden by law, or is of such a nature that, if permitted, it would defeat the provisions of any law."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Multi-Agent Debate Trace */}
      <div className="md:col-span-2 space-y-6">
        <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-2 flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5" /> Multi-Agent Debate Trace
        </h4>
        
        <div className="space-y-4">
          
          {/* Reviewer Node */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-blue-400" />
              </div>
              <div className="w-px h-full bg-white/10 my-2" />
            </div>
            <div className="flex-1 pb-4">
              <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-blue-400 font-mono">Reviewer Agent</h5>
                  <span className="text-xs text-muted font-mono">Confidence: 84%</span>
                </div>
                <p className="text-sm text-white/80 mb-3">
                  This liability cap restricts aggregate liability to 12 months of fees. Under Indian law (DPDP Act 2023), data fiduciaries cannot contractually limit their statutory liability for data breaches. This clause poses a high compliance risk if applied to data protection obligations.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-white/5 text-muted border border-white/10">Evidence: E-12</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">Proposed Risk: HIGH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skeptic Node */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div className="w-px h-full bg-white/10 my-2" />
            </div>
            <div className="flex-1 pb-4">
              <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-orange-400 font-mono">Skeptic Agent</h5>
                  <span className="text-xs text-muted font-mono">Confidence: 67%</span>
                </div>
                <p className="text-sm text-white/80 mb-3">
                  <strong>Challenge:</strong> The Reviewer assumes this is a Data Fiduciary relationship. However, if our client acts solely as a Data Processor under Section 8(1), the statutory liability primarily falls on the Fiduciary. Furthermore, standard commercial liability caps are fully enforceable under the Indian Contract Act for non-statutory breaches. The Reviewer's risk assessment may be overstated.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-white/5 text-muted border border-white/10">Action: RETRIEVED ADDITIONAL EVIDENCE (E-17)</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">Proposed Risk: MEDIUM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supervisor Node */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-4 ring-1 ring-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-primary font-mono">Supervisor Agent</h5>
                  <span className="text-xs text-muted font-mono">Final Confidence: 78%</span>
                </div>
                <p className="text-sm text-white/80 mb-3">
                  <strong>Resolution:</strong> The Skeptic is correct that commercial caps are valid, but the Reviewer correctly notes that statutory penalties cannot be contracted away. Since the document does not explicitly carve out data protection indemnities from this liability cap, ambiguity exists which could lead to severe penalties.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs uppercase font-mono px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">Verdict: HIGH RISK</span>
                  <ArrowRight className="w-4 h-4 text-muted" />
                  <span className="text-xs uppercase font-mono px-2 py-1 rounded bg-white/10 text-white border border-white/20">Action: ESCALATE TO HUMAN REVIEW</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
