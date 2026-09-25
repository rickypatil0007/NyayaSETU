"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { FileText, Link as LinkIcon, Database } from "lucide-react"

export default function EvidenceSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"]
  })

  const evidenceOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1])
  const lineScale = useTransform(scrollYProgress, [0.1, 0.4], [0, 1])
  const findingY = useTransform(scrollYProgress, [0, 0.3], [50, 0])
  const findingOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])

  return (
    <section ref={containerRef} className="relative h-[250vh] bg-background">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-8">
        
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-sm font-mono tracking-widest text-primary mb-4 uppercase">Evidence First</h2>
          <h3 className="text-3xl md:text-5xl font-serif tracking-tight">Why trust the result?</h3>
          <p className="text-muted mt-4">Every finding is forensically mapped to an authoritative legal source.</p>
        </div>

        <div className="relative w-full max-w-4xl h-[500px] flex items-center justify-center">
          
          {/* Main Finding Node */}
          <motion.div 
            style={{ y: findingY, opacity: findingOpacity }}
            className="absolute left-0 w-80 bg-surfaceElevated border border-white/10 rounded-xl p-6 z-20 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-muted">FINDING F-003</span>
              <span className="text-[10px] font-mono bg-red-500/20 text-red-400 px-2 py-1 rounded">HIGH RISK</span>
            </div>
            <h4 className="font-medium text-white mb-2">LIMITATION OF LIABILITY</h4>
            <div className="text-sm text-muted mb-4 border-l-2 border-white/10 pl-3">
              "The Service Provider shall not be liable for any indirect, incidental, special, consequential or punitive damages..."
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted">Confidence</span>
              <span className="text-primary font-bold">81%</span>
            </div>
          </motion.div>

          {/* Connector Lines */}
          <motion.div 
            style={{ scaleX: lineScale, transformOrigin: "left" }}
            className="absolute left-80 right-80 h-[1px] bg-white/20 z-10"
          />

          {/* Evidence Nodes */}
          <motion.div 
            style={{ opacity: evidenceOpacity }}
            className="absolute right-0 flex flex-col gap-6 w-80 z-20"
          >
            {/* Source 1 */}
            <div className="bg-background border border-white/10 rounded-xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-muted">Source 01</span>
              </div>
              <h5 className="text-sm font-medium mb-1">Indian Contract Act, 1872</h5>
              <div className="text-xs text-muted mb-2">Section 73 - Compensation for loss or damage</div>
              <div className="flex items-center justify-between text-[10px] uppercase font-mono">
                <span className="text-muted">Relevance</span>
                <span className="text-green-400">0.92</span>
              </div>
            </div>

            {/* Source 2 */}
            <div className="bg-background border border-white/10 rounded-xl p-5 shadow-xl opacity-75">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-muted">Source 02</span>
              </div>
              <h5 className="text-sm font-medium mb-1">Consumer Protection Act, 2019</h5>
              <div className="text-xs text-muted mb-2">Section 47 - Unfair Contracts</div>
              <div className="flex items-center justify-between text-[10px] uppercase font-mono">
                <span className="text-muted">Relevance</span>
                <span className="text-green-400">0.85</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
