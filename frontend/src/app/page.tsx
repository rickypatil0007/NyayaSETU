import Navigation from "@/components/landing/Navigation"
import HeroSection from "@/components/landing/HeroSection"
import ProblemSection from "@/components/landing/ProblemSection"
import WorkflowSection from "@/components/landing/WorkflowSection"
import EvidenceSection from "@/components/landing/EvidenceSection"
import MultiAgentSection from "@/components/landing/MultiAgentSection"
import EscalationSection from "@/components/landing/EscalationSection"
import ReportSection from "@/components/landing/ReportSection"
import FooterSection from "@/components/landing/FooterSection"
import MotionBackground from "@/components/ui/MotionBackground"

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
