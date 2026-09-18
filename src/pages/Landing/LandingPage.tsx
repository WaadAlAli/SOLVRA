import Hero from '../../components/landing/Hero'
import Navbar from '../../components/landing/Navbar'

function LandingPage() {
  return (
    <main>
      <div className="relative">
        <Navbar />
        <Hero />
      </div>

      {/* Sections will be added here next */}
    </main>
  )
}

export default LandingPage