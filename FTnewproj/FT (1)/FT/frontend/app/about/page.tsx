"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { MapPin, Users, Award, Globe } from "lucide-react"
import Footer from "@/components/Footer"
import Link from "next/link"

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

const stats = [
  { icon: Globe, number: "50+", label: "Countries" },
  { icon: Users, number: "10,000+", label: "Happy Travelers" },
  { icon: Award, number: "20+", label: "Years Experience" },
  { icon: MapPin, number: "500+", label: "Destinations" }
]

const teamMembers = [
  {
    name: "Fayyaz Ahmed",
    role: "Founder & CEO",
    image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg",
    description: "With over 20 years in the travel industry, Fayyaz founded the company with a vision to make travel accessible and memorable for everyone."
  },
  {
    name: "Sarah Johnson",
    role: "Head of Operations",
    image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
    description: "Sarah ensures every trip runs smoothly with her expertise in logistics and customer service excellence."
  },
  {
    name: "Ahmed Hassan",
    role: "Travel Consultant",
    image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg",
    description: "Ahmed specializes in Middle Eastern and Asian destinations, bringing deep cultural knowledge to every itinerary."
  }
]

export default function AboutPage() {
  const [heroRef, heroInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [storyRef, storyInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [statsRef, statsInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [teamRef, teamInView] = useInView({ threshold: 0.2, triggerOnce: true })

  const scrollToStory = () => {
    const storySection = document.getElementById('our-story')
    if (storySection) {
      storySection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <motion.div 
          ref={heroRef}
          className="relative h-full flex flex-col items-center justify-center text-white text-center px-4"
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-8">About Us</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            Creating unforgettable travel experiences for over two decades
          </p>
          <Button 
            onClick={scrollToStory}
            className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white text-lg px-8 py-6 cursor-pointer"
          >
            Our Story
          </Button>
        </motion.div>
      </section>

      {/* Our Story Section */}
      <motion.section 
        id="our-story"
        ref={storyRef}
        className="py-20 px-4 max-w-7xl mx-auto"
        initial="hidden"
        animate={storyInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                Founded in 2003, Fayyaz Travels began as a small family business with a simple mission: 
                to make travel dreams come true. What started as a local travel agency in Singapore has 
                grown into a trusted global travel partner, serving thousands of satisfied customers 
                across the world.
              </p>
              <p>
                Our founder, Fayyaz Ahmed, recognized that travel is more than just visiting places—it's 
                about creating memories, building connections, and experiencing the world's diverse cultures. 
                This philosophy continues to guide everything we do today.
              </p>
              <p>
                Over the years, we've expanded our services to include luxury travel, corporate solutions, 
                group tours, and personalized itineraries. Our commitment to excellence and attention to 
                detail has earned us recognition as one of Singapore's premier travel agencies.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg"
              alt="Travel memories"
              className="w-full h-96 object-cover rounded-lg shadow-xl"
            />
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        ref={statsRef}
        className="py-20 bg-[#002147] text-white"
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl text-gray-300">
              Two decades of creating unforgettable travel experiences
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 bg-[#C69C3C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            className="bg-gray-50 p-8 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              To provide exceptional travel experiences that exceed expectations while maintaining 
              the highest standards of service, safety, and value. We believe that travel should be 
              accessible, enjoyable, and transformative for every traveler.
            </p>
          </motion.div>

          <motion.div
            className="bg-[#002147] text-white p-8 rounded-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="leading-relaxed">
              To be the world's most trusted travel partner, connecting people with destinations 
              and cultures while creating lasting memories. We envision a world where travel 
              brings people together and promotes understanding across cultures.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <motion.section 
        ref={teamRef}
        className="py-20 bg-gray-50"
        initial="hidden"
        animate={teamInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">
              The passionate people behind your perfect journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={teamInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-[#C69C3C] font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
          <p className="text-xl text-gray-600">
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-[#002147] rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Excellence</h3>
            <p className="text-gray-600">
              We strive for excellence in every aspect of our service, from planning to execution.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-[#C69C3C] rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Customer First</h3>
            <p className="text-gray-600">
              Our customers are at the heart of everything we do. Their satisfaction is our success.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-[#8B1F41] rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Global Reach</h3>
            <p className="text-gray-600">
              We connect travelers with destinations worldwide, making the world more accessible.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#002147] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8">
            Let us help you create memories that will last a lifetime
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white text-lg px-8 py-6 w-full sm:w-auto">
                Contact Us
              </Button>
            </Link>
            <Link href="/packages">
              <Button 
                className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-[#002147] text-lg px-8 py-6 transition-all duration-300 font-semibold w-full sm:w-auto"
              >
                View Packages
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}