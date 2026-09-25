"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ShieldAlert, UserCheck, Scale } from "lucide-react"

export default function MultiAgentSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Reviewer State (0.1 to 0.3)
  const reviewerOpacity = useTransform(scrollYProgress, [0, 0.1, 0.4, 0.5], [0, 1, 1, 0.3])
  const reviewerX = useTransform(scrollYProgress, [0.3, 0.4], [0, -150])

  // Skeptic State (0.4 to 0.6)
  const skepticOpacity = useTransform(scrollYProgress, [0.3, 0.4, 0.7, 0.8], [0, 1, 1, 0.3])
  const skepticX = useTransform(scrollYProgress, [0.3, 0.4], [150, 150]) // Stays on right initially, then supervisor handles it
  const skepticY = useTransform(scrollYProgress, [0.3, 0.4], [50, 0])

  // Supervisor State (0.7 to 0.9)
  const supervisorOpacity = useTransform(scrollYProgress, [0.6, 0.7], [0, 1])
  const supervisorScale = useTransform(scrollYProgress, [0.6, 0.7], [0.9, 1])
  const supervisorY = useTransform(scrollYProgress, [0.6, 0.7], [50, -50])

  // Connection Lines
  const lineOpacity = useTransform(scrollYProgress, [0.7, 0.8], [0, 1])

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-background">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-8">
        
        <div className="text-center mb-16 max-w-2xl mx-auto absolute top-24">
          <h2 className="text-sm font-mono tracking-widest text-primary mb-4 uppercase">Multi-Agent Debate</h2>
          <h3 className="text-3xl md:text-5xl font-serif tracking-tight">Challenge every assumption.</h3>
        </div>

        <div className="relative w-full max-w-4xl h-[600px] flex items-center justify-center mt-24">
          
          {/* REVIEWER */}
          <motion.div 
            style={{ opacity: reviewerOpacity, x: reviewerX }}
            className="absolute z-20 w-80 bg-background border border-green-500/30 rounded-xl p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Reviewer Agent</div>
                <div className="text-[10px] text-muted font-mono uppercase">State 1</div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-muted">Assessment:</span> Potential Compliance Concern</div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Risk:</span>
                <span className="text-red-400 font-medium">HIGH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Confidence:</span>
                <span className="text-white font-mono">84%</span>
              </div>
            </div>
          </motion.div>

          {/* SKEPTIC (Interrupts) */}
          <motion.div 
            style={{ opacity: skepticOpacity, x: skepticX, y: skepticY }}
            className="absolute z-30 w-80 bg-background border border-red-500/30 rounded-xl p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Skeptic Agent</div>
                <div className="text-[10px] text-muted font-mono uppercase">State 2</div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="text-red-400 font-medium">Challenge: Conclusion may be overstated.</div>
              <div className="text-xs text-muted">Checks: Applicability, Jurisdiction, Exceptions</div>
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-muted">Confidence:</span>
                <span className="text-white font-mono">67%</span>
              </div>
            </div>
          </motion.div>

          {/* SUPERVISOR (Synthesis) */}
          <motion.div 
            style={{ opacity: supervisorOpacity, scale: supervisorScale, y: supervisorY }}
            className="absolute z-10 w-[400px] bg-surfaceElevated border border-primary/40 rounded-xl p-8 shadow-[0_0_50px_rgba(var(--primary),0.15)]"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-lg font-medium text-primary">Supervisor Synthesis</div>
                <div className="text-[10px] text-muted font-mono uppercase">State 3</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-background border border-white/5 rounded p-3">
                <div className="text-muted text-xs mb-1">Reviewer</div>
                <div className="text-red-400">HIGH</div>
              </div>
              <div className="bg-background border border-white/5 rounded p-3">
                <div className="text-muted text-xs mb-1">Skeptic</div>
                <div className="text-yellow-400">MEDIUM</div>
              </div>
            </div>

            <div className="space-y-3 text-sm border-t border-white/5 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-muted">Agent Agreement:</span>
                <span>PARTIAL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Final Classification:</span>
                <span className="text-red-400 font-bold">HIGH RISK</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Final Confidence:</span>
                <span className="text-primary font-mono text-lg">78%</span>
              </div>
            </div>
          </motion.div>

          {/* Synthesis Lines */}
          <motion.svg 
            style={{ opacity: lineOpacity }}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          >
            <path d="M 330 300 Q 420 300 420 220" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
            <path d="M 610 300 Q 520 300 520 220" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
          </motion.svg>

        </div>
      </div>
    </section>
  )
}
