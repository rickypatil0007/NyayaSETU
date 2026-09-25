"use client"
import Link from "next/link"
import { ShieldCheck, Lock, FileText, ArrowRight } from "lucide-react"

export default function FooterSection() {
  return (
    <footer className="bg-background border-t border-white/5 pt-24 pb-12">
      <div className="max-w-[1440px] mx-auto px-8">
        
        {/* Trust & Security */}
        <div className="grid md:grid-cols-3 gap-12 mb-24 pb-24 border-b border-white/5">
          <div>
            <Lock className="w-5 h-5 text-muted mb-4" />
            <h4 className="font-medium mb-2">Encrypted Storage</h4>
            <p className="text-sm text-muted">All documents are processed securely with strict access controls and zero retention options.</p>
          </div>
          <div>
            <FileText className="w-5 h-5 text-muted mb-4" />
            <h4 className="font-medium mb-2">Source Provenance</h4>
            <p className="text-sm text-muted">Every finding strictly references retrieved evidence. No fabricated citations.</p>
          </div>
          <div>
            <ShieldCheck className="w-5 h-5 text-muted mb-4" />
            <h4 className="font-medium mb-2">Human Oversight</h4>
            <p className="text-sm text-muted">Built for human review. The system flags uncertainty rather than guessing.</p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-32">
          <h4 className="text-xs font-mono uppercase text-muted mb-8 tracking-widest">Supported Documents</h4>
          <div className="flex flex-wrap gap-4">
            {["SaaS Agreements", "NDAs", "Vendor Agreements", "Employment Agreements", "Privacy Policies", "Data Processing Agreements", "Terms of Service", "Service Level Agreements"].map((item, i) => (
              <span key={i} className="px-4 py-2 border border-white/10 rounded-full text-sm text-white/80 hover:bg-white/5 transition-colors cursor-default">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="flex flex-col items-center text-center mb-32">
          <h2 className="text-4xl md:text-6xl font-serif tracking-tight mb-8">
            TURN LEGAL UNCERTAINTY INTO A STRUCTURED REVIEW.
          </h2>
          <Link href="/login" className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-sm font-medium hover:bg-white/90 transition-all">
            Start Your First Audit
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted pt-8 border-t border-white/5">
          <p>© {new Date().getFullYear()} NyayaSetu. Evidence-Grounded Legal Audit Workspace.</p>
          <p className="mt-2 md:mt-0 max-w-xl text-right opacity-60">
            NyayaSetu provides AI-assisted legal and regulatory compliance analysis for informational and review purposes. It does not replace professional legal advice. Findings should be reviewed by a qualified legal professional where appropriate.
          </p>
        </div>
      </div>
    </footer>
  )
}
