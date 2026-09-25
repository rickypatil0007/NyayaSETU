"use client"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-black/20 z-0" />
      
      <div className="max-w-[1440px] mx-auto px-8 w-full grid lg:grid-cols-2 gap-16 relative z-10">
        
        {/* LEFT NARRATIVE */}
        <div className="flex flex-col justify-center max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mb-8"
          >
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-muted">NyayaSetu Legal & Regulatory Compliance Auditor</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-serif tracking-tight leading-[1.05] mb-8"
          >
            AUDIT CONTRACTS WITH<br/>
            <span className="text-white/60">EVIDENCE, NOT ASSUMPTIONS.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-muted leading-relaxed mb-10 max-w-xl"
          >
            NyayaSetu analyzes legal and regulatory documents using retrieval-grounded evidence and a multi-agent review process built for transparent human oversight.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-6"
          >
            <Link href="/login" className="group relative px-6 py-3 bg-white text-black text-sm font-medium rounded-sm overflow-hidden flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]">
              Start an Audit
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted hover:text-white transition-colors">
              See How It Works
            </Link>
          </motion.div>
        </div>

        {/* RIGHT VISUALIZATION */}
        <div className="relative h-full min-h-[500px] flex items-center justify-center lg:justify-end">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotateY: 5, rotateX: 5 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[500px] bg-[#0A0A0A] border border-white/10 rounded-xl p-6 shadow-2xl relative z-10"
          >
            {/* Fake UI Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <div className="text-xs text-muted font-mono mb-1">CONTRACT AUDIT</div>
                <div className="font-medium">SaaS Agreement_v2.pdf</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted font-mono uppercase mb-1">Confidence</div>
                <div className="font-mono text-primary font-bold">82%</div>
              </div>
            </div>

            {/* Findings Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 border border-white/5 rounded-lg p-4">
                <div className="text-xs text-muted mb-2">Overall Risk</div>
                <div className="text-xl font-medium text-red-400">HIGH</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-lg p-4 flex flex-col justify-center">
                <div className="flex justify-between text-xs mb-1"><span className="text-muted">High</span><span className="text-red-400">03</span></div>
                <div className="flex justify-between text-xs mb-1"><span className="text-muted">Medium</span><span className="text-yellow-400">03</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted">Low</span><span className="text-white/40">02</span></div>
              </div>
            </div>

            {/* Agent Status */}
            <div className="space-y-3">
              <div className="text-xs text-muted font-mono uppercase mb-2">Audit Agents</div>
              
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex items-center justify-between py-2 border-b border-white/5"
              >
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Reviewer
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="flex items-center justify-between py-2 border-b border-white/5"
              >
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Skeptic
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Supervisor
                </div>
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
              </motion.div>
            </div>
            
            {/* Animated scanning line */}
            <motion.div 
              animate={{ y: [0, 400, 0] }}
              transition={{ duration: 4, ease: "linear", repeat: Infinity }}
              className="absolute left-0 right-0 h-[1px] bg-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.5)] z-20 pointer-events-none"
              style={{ top: 0 }}
            />
          </motion.div>
          
          {/* Decorative background elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
