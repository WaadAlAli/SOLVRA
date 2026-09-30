import Hero from '../../components/landing/Hero'
import Navbar from '../../components/landing/Navbar'
import ProblemSection from '../../components/landing/ProblemSection'
import HowItWorksSection from '../../components/landing/HowItWorksSection'
import TransformationSection from '../../components/landing/TransformationSection'
import DecisionIntelligenceSection from '../../components/landing/DecisionIntelligenceSection'
import BuyerSupplierSection from '../../components/landing/BuyerSupplierSection'
import TrustGovernanceSection from '../../components/landing/TrustGovernanceSection'
import FinalCTASection from '../../components/landing/FinalCTASection'
import Footer from '../../components/landing/Footer'

function LandingPage() {
  return (
    <main>
      <div className="relative">
        <Navbar />
        <Hero />
      </div>

      <ProblemSection />

      <HowItWorksSection />

      <TransformationSection />

      <DecisionIntelligenceSection />

      <BuyerSupplierSection />

      <TrustGovernanceSection />

      <FinalCTASection />

      <Footer />
    </main>
  )
}

export default LandingPage
