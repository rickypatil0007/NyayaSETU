"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { AlertTriangle, UserCheck, Shield } from "lucide-react"

export default function EscalationSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Confidence Dial Animation
  const confidenceScore = useTransform(scrollYProgress, [0.1, 0.4], [100, 54])
  
  // Transition to Human Review
  const reviewOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1])
  const reviewY = useTransform(scrollYProgress, [0.4, 0.6], [50, 0])

  return (
    <section ref={containerRef} className="relative h-[250vh] bg-[#0A0A0A]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-8">
        
        <div className="relative w-full max-w-5xl h-[600px] flex flex-col items-center justify-center">
          
          <div className="text-center mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-serif tracking-tight mb-4">When evidence is not enough.</h2>
            <p className="text-muted">NyayaSetu knows when not to guess. If agents remain materially divided or evidence is ambiguous, the system halts automated conclusions.</p>
          </div>

          <div className="flex flex-col items-center justify-center relative w-full">
            
            {/* Confidence Visualization */}
            <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <motion.circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="rgba(239, 68, 68, 0.8)" 
                  strokeWidth="4"
                  strokeDasharray="283"
                  style={{ strokeDashoffset: useTransform(scrollYProgress, [0.1, 0.4], [0, 130]) }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[10px] uppercase font-mono text-muted tracking-widest mb-1">Confidence</div>
                <motion.div className="text-4xl font-mono text-white">
                  {/* We can't render a motion value directly as text easily without useMotionValue React hook trickery, so we'll just show the final state fading in */}
                  <span className="text-red-400">54%</span>
                </motion.div>
              </div>
            </div>

            {/* Human Review Required Block */}
            <motion.div 
              style={{ opacity: reviewOpacity, y: reviewY }}
              className="w-full max-w-xl bg-red-500/10 border border-red-500/20 rounded-xl p-8 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-red-400">HUMAN REVIEW REQUIRED</h4>
                  <div className="text-xs text-red-400/70 font-mono">Status: Escalated</div>
                </div>
              </div>

              <div className="space-y-4 text-sm text-white/80">
                <div className="bg-black/40 border border-white/5 rounded p-4">
                  <span className="text-muted block mb-1 text-xs uppercase font-mono">System Reason:</span>
                  Reviewer and Skeptic remain materially divided. Available legal evidence does not support a sufficiently reliable automated conclusion under Indian jurisdiction.
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded text-sm font-medium hover:bg-white/90 transition-colors">
                  <UserCheck className="w-4 h-4" />
                  Create Review Brief
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
