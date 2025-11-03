"use client"

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import dynamic from 'next/dynamic'
import HeroSection from '@/components/HeroSection'
import HotDealsSection from '@/components/HotDealsSection'
import WhyBookSection from '@/components/WhyBookSection'
import BudgetCard from '@/components/BudgetCard'
import PersonalizedItinerariesSection from '@/components/PersonalizedItinerariesSection'
import FeaturedInSection from '@/components/FeaturedInSection'
import AdventureTravelSection from '@/components/AdventureTravelSection'
import ServicesSection from '@/components/ServicesSection'
import MagazineSection from '@/components/MagazineSection'
import NewsletterSection from '@/components/NewsletterSection'
import Footer from '@/components/Footer'

const TravelInspirationSection = dynamic(() => import('@/components/TravelInspirationSection'), {
  ssr: false
})

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

export default function Home() {
  const [hotDealsRef, hotDealsInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [whyBookRef, whyBookInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [budgetRef, budgetInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [personalizedRef, personalizedInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [featuredRef, featuredInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [adventureRef, adventureInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [servicesRef, servicesInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [magazineRef, magazineInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [newsletterRef, newsletterInView] = useInView({ threshold: 0.2, triggerOnce: true })

  return (
    <main className="min-h-screen">
      <HeroSection />
      
      <motion.div 
        ref={hotDealsRef}
        initial="hidden"
        animate={hotDealsInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <HotDealsSection />
      </motion.div>

      <motion.div 
        ref={whyBookRef}
        initial="hidden"
        animate={whyBookInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <WhyBookSection />
      </motion.div>

      <TravelInspirationSection />

      <motion.div 
        ref={budgetRef}
        initial="hidden"
        animate={budgetInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <BudgetCard />
      </motion.div>

      <motion.div 
        ref={personalizedRef}
        initial="hidden"
        animate={personalizedInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <PersonalizedItinerariesSection />
      </motion.div>

      <motion.div 
        ref={featuredRef}
        initial="hidden"
        animate={featuredInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <FeaturedInSection />
      </motion.div>

      <motion.div 
        ref={adventureRef}
        initial="hidden"
        animate={adventureInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <AdventureTravelSection />
      </motion.div>

      <motion.div 
        ref={servicesRef}
        initial="hidden"
        animate={servicesInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <ServicesSection />
      </motion.div>

      <motion.div 
        ref={magazineRef}
        initial="hidden"
        animate={magazineInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <MagazineSection />
      </motion.div>

      <motion.div 
        ref={newsletterRef}
        initial="hidden"
        animate={newsletterInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <NewsletterSection />
      </motion.div>

      <Footer />
    </main>
  )
}