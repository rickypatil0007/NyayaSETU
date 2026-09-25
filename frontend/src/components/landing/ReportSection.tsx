"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { FileText, Download } from "lucide-react"

export default function ReportSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const reportY = useTransform(scrollYProgress, [0.1, 0.5], [100, 0])
  const reportOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1])

  return (
    <section ref={containerRef} className="relative h-[200vh] bg-background">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-8">
        
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-sm font-mono tracking-widest text-primary mb-4 uppercase">Output</h2>
          <h3 className="text-3xl md:text-5xl font-serif tracking-tight">Structured Professional Reporting.</h3>
        </div>

        <motion.div 
          style={{ y: reportY, opacity: reportOpacity }}
          className="w-full max-w-3xl bg-white text-black rounded-sm shadow-2xl p-8 md:p-12"
        >
          {/* Report Header */}
          <div className="border-b border-black/10 pb-6 mb-8 flex justify-between items-end">
            <div>
              <div className="text-xs font-mono text-black/50 mb-1">FINAL REPORT</div>
              <h4 className="text-2xl font-serif">Legal & Regulatory Compliance Audit</h4>
              <div className="text-sm mt-1">SaaS Agreement_v2.pdf</div>
            </div>
            <div className="text-right text-xs">
              <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
              <div>Jurisdiction: India</div>
            </div>
          </div>

          {/* Report Summary */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-black/5 p-4 rounded-sm">
              <div className="text-xs text-black/60 mb-1">Overall Risk</div>
              <div className="text-lg font-bold text-red-600">HIGH</div>
            </div>
            <div className="bg-black/5 p-4 rounded-sm">
              <div className="text-xs text-black/60 mb-1">Confidence</div>
              <div className="text-lg font-bold">78%</div>
            </div>
            <div className="bg-black/5 p-4 rounded-sm">
              <div className="text-xs text-black/60 mb-1">Findings</div>
              <div className="text-lg font-bold">9</div>
            </div>
            <div className="bg-black/5 p-4 rounded-sm">
              <div className="text-xs text-black/60 mb-1">Escalated</div>
              <div className="text-lg font-bold text-yellow-600">1</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-black/10 pb-2">
              <span className="font-medium">Limitation of Liability</span>
              <span className="text-red-600 text-xs font-mono">HIGH RISK</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-black/10 pb-2">
              <span className="font-medium">Data Processing (DPDP Act)</span>
              <span className="text-red-600 text-xs font-mono">HIGH RISK</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-black/10 pb-2">
              <span className="font-medium">Dispute Resolution</span>
              <span className="text-yellow-600 text-xs font-mono">MEDIUM RISK</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-black/10 pb-2 text-black/50">
              <span className="font-medium">Confidentiality Term</span>
              <span className="text-xs font-mono">LOW RISK</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-black/10 flex justify-between items-center">
            <div className="text-[10px] text-black/40 max-w-xs">
              NyayaSetu provides AI-assisted analysis for informational purposes. It does not replace professional legal advice.
            </div>
            <button className="flex items-center gap-2 text-xs font-medium bg-black text-white px-4 py-2 rounded-sm hover:bg-black/80 transition-colors">
              <Download className="w-3 h-3" /> Download PDF
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
