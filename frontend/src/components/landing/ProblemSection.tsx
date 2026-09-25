"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export default function ProblemSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Staggered reveals based on scroll progress
  const docOpacity = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [0, 1, 1, 0])
  
  const step1Opacity = useTransform(scrollYProgress, [0.1, 0.2, 0.9, 1], [0, 1, 1, 0])
  const step2Opacity = useTransform(scrollYProgress, [0.3, 0.4, 0.9, 1], [0, 1, 1, 0])
  const step3Opacity = useTransform(scrollYProgress, [0.5, 0.6, 0.9, 1], [0, 1, 1, 0])
  const step4Opacity = useTransform(scrollYProgress, [0.7, 0.8, 0.9, 1], [0, 1, 1, 0])

  const fragmentY = useTransform(scrollYProgress, [0.3, 0.6], [0, 50])
  const fragmentRotate = useTransform(scrollYProgress, [0.3, 0.6], [0, -5])

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-background">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        
        <div className="max-w-[1440px] mx-auto px-8 w-full grid lg:grid-cols-2 gap-16">
          
          {/* LEFT: Text Story */}
          <div className="flex flex-col justify-center max-w-xl">
            <h2 className="text-3xl md:text-5xl font-serif tracking-tight mb-12">
              Traditional review leaves too much room for uncertainty.
            </h2>

            <div className="space-y-8">
              <motion.div style={{ opacity: step1Opacity }}>
                <h3 className="text-xl font-medium mb-2 text-white/80">Manual Reading</h3>
                <p className="text-muted text-sm">Long documents create cognitive overload and fatigue.</p>
              </motion.div>
              
              <motion.div style={{ opacity: step2Opacity }}>
                <h3 className="text-xl font-medium mb-2 text-white/80">Scattered References</h3>
                <p className="text-muted text-sm">Vital legal context exists outside the document, disconnected from the clause.</p>
              </motion.div>
              
              <motion.div style={{ opacity: step3Opacity }}>
                <h3 className="text-xl font-medium mb-2 text-white/80">Missed Clauses</h3>
                <p className="text-muted text-sm">Critical liabilities are buried deep within boilerplate text.</p>
              </motion.div>
              
              <motion.div style={{ opacity: step4Opacity }}>
                <h3 className="text-xl font-medium text-red-400 mb-2">Uncertain Conclusions</h3>
                <p className="text-muted text-sm">Subjective assessments replace evidence-grounded facts.</p>
              </motion.div>
            </div>
          </div>

          {/* RIGHT: Visual Story */}
          <div className="relative h-[600px] flex items-center justify-center border border-white/5 bg-white/[0.01] rounded-2xl">
            <motion.div style={{ opacity: docOpacity }} className="relative w-[300px] h-[400px]">
              
              {/* Base Document */}
              <div className="absolute inset-0 bg-white/10 border border-white/20 rounded-sm shadow-2xl p-6">
                <div className="w-full h-2 bg-white/20 mb-4 rounded-full" />
                <div className="w-3/4 h-2 bg-white/20 mb-8 rounded-full" />
                
                <div className="space-y-3">
                  <div className="w-full h-1.5 bg-white/10 rounded-full" />
                  <div className="w-full h-1.5 bg-white/10 rounded-full" />
                  <div className="w-5/6 h-1.5 bg-white/10 rounded-full" />
                </div>
              </div>

              {/* Scattered Fragment */}
              <motion.div 
                style={{ opacity: step2Opacity, y: fragmentY, rotate: fragmentRotate }}
                className="absolute top-1/2 -right-12 w-48 bg-background border border-white/10 p-4 rounded-md shadow-xl"
              >
                <div className="text-[10px] text-muted mb-2 font-mono">Reference 01</div>
                <div className="w-full h-1 bg-white/20 mb-2" />
                <div className="w-2/3 h-1 bg-white/20" />
              </motion.div>

              {/* Missed Clause Highlight (Red) */}
              <motion.div 
                style={{ opacity: step3Opacity }}
                className="absolute top-[60%] left-6 right-6 h-6 bg-red-500/20 border border-red-500/40 rounded-sm"
              />

              {/* Uncertainty Warning */}
              <motion.div 
                style={{ opacity: step4Opacity }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap backdrop-blur-md"
              >
                Risk Status: Unclear
              </motion.div>

            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
