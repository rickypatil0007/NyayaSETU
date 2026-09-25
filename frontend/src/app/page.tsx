import dynamic from "next/dynamic"
import Navigation from "@/components/landing/Navigation"
import HeroSection from "@/components/landing/HeroSection"
import MotionBackground from "@/components/ui/MotionBackground"

const ProblemSection = dynamic(() => import('@/components/landing/ProblemSection'), { ssr: true })
const WorkflowSection = dynamic(() => import('@/components/landing/WorkflowSection'), { ssr: true })
const EvidenceSection = dynamic(() => import('@/components/landing/EvidenceSection'), { ssr: true })
const MultiAgentSection = dynamic(() => import('@/components/landing/MultiAgentSection'), { ssr: true })
const EscalationSection = dynamic(() => import('@/components/landing/EscalationSection'), { ssr: true })
const ReportSection = dynamic(() => import('@/components/landing/ReportSection'), { ssr: true })
const FooterSection = dynamic(() => import('@/components/landing/FooterSection'), { ssr: true })

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/30 relative">
      <MotionBackground />
      <Navigation />
      
      <main className="flex-1 w-full">
        <HeroSection />
        
        <ProblemSection />
        
        <div id="how-it-works">
          <WorkflowSection />
        </div>
        
        <EvidenceSection />
        
        <MultiAgentSection />
        
        <EscalationSection />
        
        <ReportSection />
      </main>

      <div id="trust">
        <div id="use-cases">
          <FooterSection />
        </div>
      </div>
    </div>
  )
}
