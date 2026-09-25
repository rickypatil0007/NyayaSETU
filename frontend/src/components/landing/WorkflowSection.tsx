"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Search, Database, UserCheck, ShieldAlert, Scale } from "lucide-react"

export default function WorkflowSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"]
  })

  // Staggered reveals for 5 steps
  const step1 = useTransform(scrollYProgress, [0, 0.15], [0, 1])
  const step2 = useTransform(scrollYProgress, [0.15, 0.35], [0, 1])
  const step3 = useTransform(scrollYProgress, [0.35, 0.55], [0, 1])
  const step4 = useTransform(scrollYProgress, [0.55, 0.75], [0, 1])
  const step5 = useTransform(scrollYProgress, [0.75, 0.95], [0, 1])

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-[#0A0A0A]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-8">
        
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-sm font-mono tracking-widest text-primary mb-4 uppercase">How NyayaSetu Works</h2>
          <h3 className="text-3xl md:text-5xl font-serif tracking-tight">An organized evidence pipeline.</h3>
        </div>

        <div className="relative w-full max-w-5xl h-[400px] flex items-center justify-center">
          {/* Base Connection Line */}
          <div className="absolute left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-white/10 top-1/2 -translate-y-1/2 z-0 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-8 w-full z-10">
            
            {/* 01 UNDERSTAND */}
            <motion.div style={{ opacity: step1 }} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-background border border-white/10 flex items-center justify-center mb-6 relative">
                <Search className="w-6 h-6 text-muted" />
                <div className="absolute -inset-2 rounded-full border border-primary/20 animate-pulse" />
              </div>
              <div className="text-xs font-mono text-muted mb-2">01</div>
              <h4 className="font-medium mb-2">Understand</h4>
              <p className="text-xs text-muted">Upload a contract or regulatory document.</p>
            </motion.div>

            {/* 02 RETRIEVE */}
            <motion.div style={{ opacity: step2 }} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-background border border-white/10 flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-muted" />
              </div>
              <div className="text-xs font-mono text-muted mb-2">02</div>
              <h4 className="font-medium mb-2">Retrieve</h4>
              <p className="text-xs text-muted">Searches legal knowledge base for relevant evidence.</p>
            </motion.div>

            {/* 03 REVIEW */}
            <motion.div style={{ opacity: step3 }} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-background border border-green-500/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                <UserCheck className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-xs font-mono text-muted mb-2">03</div>
              <h4 className="font-medium mb-2">Review</h4>
              <p className="text-xs text-muted">Agent identifies possible compliance risks.</p>
            </motion.div>

            {/* 04 CHALLENGE */}
            <motion.div style={{ opacity: step4 }} className="flex flex-col items-center text-center relative">
              <div className="w-16 h-16 rounded-full bg-background border border-red-500/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
              <div className="text-xs font-mono text-muted mb-2">04</div>
              <h4 className="font-medium mb-2">Challenge</h4>
              <p className="text-xs text-muted">Skeptic agent tests findings and checks exceptions.</p>
            </motion.div>

            {/* 05 DECIDE */}
            <motion.div style={{ opacity: step5 }} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div className="text-xs font-mono text-muted mb-2">05</div>
              <h4 className="font-medium mb-2 text-primary">Decide</h4>
              <p className="text-xs text-muted">Supervisor evaluates and produces structured verdict.</p>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
