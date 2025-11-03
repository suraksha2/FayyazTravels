"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Plane, Ship, Car, Building2, MapPin, Crown } from "lucide-react"
import Footer from "@/components/Footer"
import Link from "next/link"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
}

const services = [
  {
    title: "Private Jets",
    icon: Plane,
    description: "Experience the ultimate in air travel with our private jet services. From short hops to intercontinental flights, travel in unparalleled comfort and style.",
    image: "https://images.pexels.com/photos/1098745/pexels-photo-1098745.jpeg"
  },
  {
    title: "Luxury Yachts",
    icon: Ship,
    description: "Explore the world's most beautiful waters aboard our premium yacht collection. Whether for a day trip or extended cruise, indulge in maritime luxury.",
    image: "https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg"
  },
  {
    title: "Exotic Cars",
    icon: Car,
    description: "Choose from our fleet of high-end vehicles. From sporty convertibles to elegant limousines, make every journey memorable.",
    image: "https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg"
  },
  {
    title: "Elite Properties",
    icon: Building2,
    description: "Stay in the world's most exclusive properties. From private islands to historic castles, experience accommodation beyond ordinary.",
    image: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg"
  }
]

const destinations = [
  {
    name: "Maldives",
    image: "https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg",
    description: "Paradise found in private overwater villas"
  },
  {
    name: "Swiss Alps",
    image: "https://images.pexels.com/photos/355770/pexels-photo-355770.jpeg",
    description: "Exclusive chalets and mountain retreats"
  },
  {
    name: "French Riviera",
    image: "https://images.pexels.com/photos/7245333/pexels-photo-7245333.jpeg",
    description: "Sophisticated coastal luxury"
  }
]

export default function LuxuryPage() {
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [servicesRef, servicesInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [destinationsRef, destinationsInView] = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg')"
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
          </div>
        </motion.div>
        
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeIn}
          >
           
            <h1 className="text-8xl font-light text-white mb-6">
              Fayyaz Luxury
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
              Where exceptional service meets unparalleled luxury
            </p>
            <Button 
              className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white text-lg px-8 py-6"
            >
              Begin Your Journey
            </Button>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <MapPin className="w-8 h-8 text-white/50" />
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section 
        ref={servicesRef}
        className="py-32 px-4 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate={servicesInView ? "visible" : "hidden"}
            variants={fadeIn}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-light text-gray-900 mb-6">Luxury Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our curated collection of premium services designed for the discerning traveler
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial="hidden"
                animate={servicesInView ? "visible" : "hidden"}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, delay: index * 0.2 }
                  }
                }}
                className="group relative overflow-hidden rounded-2xl shadow-lg"
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <service.icon className="w-8 h-8 text-[#C69C3C] mb-4" />
                    <h3 className="text-2xl font-light text-white mb-2">{service.title}</h3>
                    <p className="text-white/80">{service.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section 
        ref={destinationsRef}
        className="py-32 px-4 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate={destinationsInView ? "visible" : "hidden"}
            variants={fadeIn}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-light text-gray-900 mb-6">Featured Destinations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our handpicked collection of the world's most exclusive locations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.name}
                initial="hidden"
                animate={destinationsInView ? "visible" : "hidden"}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, delay: index * 0.2 }
                  }
                }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-lg">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-light text-white mb-2">{destination.name}</h3>
                    <p className="text-white/80">{destination.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 px-4 bg-[#002147] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-light mb-8">Begin Your Journey</h2>
          <p className="text-xl text-white/60 mb-12">
            Let us craft your perfect luxury experience. Our dedicated concierge team is ready to assist you 24/7.
          </p>
          <Link href="/contact">
            <Button 
              className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white text-lg px-12 py-8"
            >
              Contact Our Concierge
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}