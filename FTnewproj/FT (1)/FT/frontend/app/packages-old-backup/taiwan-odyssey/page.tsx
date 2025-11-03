"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Menu, Maximize2, Calendar, MapPin, Users, Star, Clock, Wifi, Coffee, Car } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

const itineraryData = [
  {
    day: 1,
    title: "Arrival in Taipei",
    subtitle: "Welcome to Taiwan's Vibrant Capital",
    description: "Begin your Taiwan adventure in the bustling metropolis of Taipei. Explore the iconic night markets, sample delicious street food, and witness the perfect blend of traditional and modern culture.",
    image: "https://images.pexels.com/photos/2408666/pexels-photo-2408666.jpeg",
    highlights: ["Night Market Tour", "Street Food Tasting", "City Orientation"]
  },
  {
    day: 2,
    title: "Taipei City Exploration",
    subtitle: "Modern Marvels & Ancient Traditions",
    description: "Discover Taipei's most iconic landmarks including Taipei 101, traditional temples, and bustling districts. Experience the harmony between cutting-edge technology and ancient wisdom.",
    image: "https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg",
    highlights: ["Taipei 101 Observatory", "Longshan Temple", "Ximending District"]
  },
  {
    day: 3,
    title: "Jiufen & Shifen Adventure",
    subtitle: "Mountain Towns & Sky Lanterns",
    description: "Journey to the enchanting mountain town of Jiufen with its narrow alleyways and teahouses. Release sky lanterns in Shifen and make wishes under the Taiwan sky.",
    image: "https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg",
    highlights: ["Jiufen Old Street", "Sky Lantern Release", "Mountain Views"]
  },
  {
    day: 4,
    title: "Taroko Gorge National Park",
    subtitle: "Natural Wonder & Marble Cliffs",
    description: "Explore Taiwan's most spectacular natural wonder with its dramatic marble cliffs, turquoise rivers, and scenic hiking trails through one of Asia's most beautiful gorges.",
    image: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg",
    highlights: ["Marble Cliffs", "Eternal Spring Shrine", "Swallow Grotto"]
  },
  {
    day: 5,
    title: "Sun Moon Lake & Departure",
    subtitle: "Serene Beauty & Farewell",
    description: "Visit Taiwan's most beautiful alpine lake surrounded by lush mountains. Take a peaceful boat ride and enjoy the serene atmosphere before your departure with unforgettable memories.",
    image: "https://images.pexels.com/photos/5087165/pexels-photo-5087165.jpeg",
    highlights: ["Lake Cruise", "Aboriginal Culture", "Mountain Scenery"]
  }
]

const packageFeatures = [
  { icon: Calendar, label: "5 Days", value: "4 Nights" },
  { icon: MapPin, label: "3 Cities", value: "Taiwan" },
  { icon: Users, label: "Max 18", value: "People" },
  { icon: Star, label: "4.8/5", value: "Rating" }
]

export default function TaiwanOdysseyPage() {
  const [activeTab, setActiveTab] = useState('Itinerary')

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.pexels.com/photos/2408666/pexels-photo-2408666.jpeg')"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </div>
        </motion.div>
        
        {/* Top Navigation Bar */}
        <motion.div 
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href="/packages">
            <Button variant="ghost" size="icon" className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          
          <div className="text-white font-semibold text-lg tracking-wide">
            Fayyaz Travels
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20">
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 z-10 p-6 text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="mb-6">
            <motion.div
              className="flex items-center gap-2 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Top Selling
              </span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm ml-1">4.8 (124 reviews)</span>
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Taiwan Odyssey
            </motion.h1>
            
            <motion.p 
              className="text-xl opacity-90 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Enquire Now! From S$4290 / pp
            </motion.p>

          </div>
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="bg-white relative z-10 -mt-8 rounded-t-3xl shadow-2xl">
        {/* Description */}
        <motion.div 
          className="p-6 border-b border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-gray-700 leading-relaxed text-lg">
            Taiwan's vibrant west coast, where ancient traditions meet modern wonders. Experience the perfect blend of bustling cities, serene landscapes, and rich cultural heritage.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-100 bg-white sticky top-0 z-20">
          <div className="flex">
            {['Overview', 'Itinerary', 'Prices'].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-center font-semibold transition-all duration-300 relative ${
                  activeTab === tab
                    ? 'text-[#081C2D] bg-gradient-to-r from-blue-50 to-blue-100'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#081C2D]"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={tabVariants}
            className="min-h-screen pb-24"
          >
            {activeTab === 'Overview' && (
              <div className="p-6 space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Package Overview</h3>
                  <p className="text-gray-600">Everything you need to know about your Taiwan adventure</p>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <motion.div 
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h4 className="text-lg font-semibold mb-4 text-gray-900">Trip Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#081C2D]">5</div>
                        <div className="text-sm text-gray-600">Days</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#081C2D]">4</div>
                        <div className="text-sm text-gray-600">Nights</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#081C2D]">3</div>
                        <div className="text-sm text-gray-600">Cities</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#081C2D]">18</div>
                        <div className="text-sm text-gray-600">Max Group</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h4 className="text-lg font-semibold mb-4 text-gray-900">What's Included</h4>
                    <div className="space-y-3">
                      {[
                        "4 nights premium accommodation",
                        "Daily breakfast & 2 dinners",
                        "High-speed rail tickets",
                        "English-speaking guide",
                        "All entrance fees",
                        "Airport transfers"
                      ].map((item, index) => (
                        <motion.div 
                          key={index}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div 
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h4 className="text-lg font-semibold mb-4 text-gray-900">Trip Highlights</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        "Taipei 101 Observatory",
                        "Jiufen Old Street",
                        "Taroko Gorge",
                        "Sun Moon Lake",
                        "Night Markets",
                        "Sky Lanterns"
                      ].map((highlight, index) => (
                        <motion.div 
                          key={index}
                          className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center text-sm font-medium text-gray-700"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {highlight}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {activeTab === 'Itinerary' && (
              <div className="p-6 space-y-4">
                {itineraryData.map((day, index) => (
                  <motion.div 
                    key={day.day}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="group"
                  >
                    <motion.div 
                      className="relative overflow-hidden rounded-3xl transition-all duration-500 shadow-xl hover:shadow-2xl"
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {/* Background Image */}
                      <div className="relative h-64">
                        <img
                          src={day.image}
                          alt={day.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                        
                        {/* Day Number Badge */}
                        <motion.div 
                          className="absolute top-4 left-4"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg border-2 bg-gradient-to-br from-[#081C2D] to-[#0a1e32] text-white border-white/20">
                            Day {day.day}
                          </div>
                        </motion.div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                          >
                            <h3 className="text-2xl font-bold mb-2 text-white">
                              {day.title}
                            </h3>
                            <p className="font-semibold mb-3 text-lg text-[#C69C3C]">
                              {day.subtitle}
                            </p>
                            <p className="leading-relaxed mb-4 text-white/90">
                              {day.description}
                            </p>
                            
                            {/* Highlights */}
                            <div className="flex flex-wrap gap-2">
                              {day.highlights.map((highlight, idx) => (
                                <motion.span 
                                  key={idx}
                                  className="backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border bg-white/20 text-white border-white/30"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.4 + idx * 0.1 }}
                                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
                                >
                                  {highlight}
                                </motion.span>
                              ))}
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'Prices' && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pricing Details</h3>
                  <p className="text-gray-600">Transparent pricing with no hidden fees</p>
                </div>
                
                <motion.div 
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="space-y-6">
                    {[
                      { label: "Twin Sharing", price: "S$4,290", popular: true },
                      { label: "Single Supplement", price: "+S$800", popular: false },
                      { label: "Child (2-11 years)", price: "S$3,290", popular: false }
                    ].map((pricing, index) => (
                      <motion.div 
                        key={index}
                        className={`flex justify-between items-center p-4 rounded-2xl transition-all duration-300 ${
                          pricing.popular 
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-[#081C2D]' 
                            : 'bg-white border border-gray-200 hover:border-gray-300'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-medium text-gray-900">{pricing.label}</span>
                          {pricing.popular && (
                            <span className="bg-[#081C2D] text-white px-2 py-1 rounded-full text-xs font-medium">
                              Most Popular
                            </span>
                          )}
                        </div>
                        <span className="text-xl font-bold text-[#081C2D]">{pricing.price}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white border border-gray-200 rounded-3xl p-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h4 className="font-bold mb-4 text-gray-900 text-lg">Price Includes:</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      "Return flights from Singapore",
                      "4 nights premium hotel accommodation",
                      "Daily breakfast and selected meals",
                      "High-speed rail transportation",
                      "All entrance fees and activities",
                      "Professional English-speaking guide",
                      "Airport transfers and transportation",
                      "Travel insurance coverage"
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="w-2 h-2 bg-[#081C2D] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Bottom CTA */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 z-30 shadow-2xl"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <div className="flex gap-3">
          <motion.div 
            className="flex-1"
            whileTap={{ scale: 0.98 }}
          >
            <Button className="w-full bg-[#081C2D] hover:bg-[#081C2D]/90 text-white py-4 text-lg font-semibold shadow-lg">
              View Details - S$4,290
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </main>
  )
}