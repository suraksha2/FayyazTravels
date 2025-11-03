"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Menu, Maximize2, Calendar, MapPin, Users, Star, Clock, Wifi, Coffee, Car } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useParams } from 'next/navigation'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

interface Deal {
  id: number
  title: string
  subtitle?: string
  destination: string
  category: string
  price: number
  originalPrice: number
  days: number
  cities: number
  isHalalFriendly: boolean
  seatsLeft: number
  description: string
  image: string
  savings: number
  discountPercentage: number
  isTopSelling: boolean
  isFeatured: boolean
  itinerary?: ItineraryDay[]
}

interface ItineraryDay {
  day: number
  title: string
  subtitle: string
  description: string
  image: string
  highlights: string[]
}

export default function DealPage() {
  const params = useParams()
  const dealId = params.id as string
  
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('Itinerary')

  // Fetch deal data
  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`${API_BASE_URL}/packages/${dealId}`)
        
        if (!response.ok) {
          throw new Error(`Deal not found: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('API Response:', data) // Debug log
        
        // The backend returns the package object directly (no wrapper)
        if (data && data.id) {
          // Transform database fields to match frontend interface
          const transformedDeal = {
            id: data.id,
            title: data.p_name || data.title,
            subtitle: data.subtitle || `Explore ${data.p_name || data.title}`,
            destination: data.destination || data.p_name,
            category: data.category || 'Adventure',
            price: data.price || 3999,
            originalPrice: data.originalPrice || (data.price ? data.price + 500 : 4499),
            days: data.days || (data.day_night ? parseInt(data.day_night.match(/(\d+)D/)?.[1] || '7') : 7),
            cities: data.cities || 3,
            isHalalFriendly: data.isHalalFriendly !== undefined ? data.isHalalFriendly : true,
            seatsLeft: data.seatsLeft || 8,
            description: data.p_content ? data.p_content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : (data.description || `Discover the amazing ${data.p_name || 'destination'}.`),
            image: data.feature_img || data.image || `https://images.pexels.com/photos/${5087165 + (data.id % 1000)}/pexels-photo-${5087165 + (data.id % 1000)}.jpeg`,
            savings: data.savings || 500,
            discountPercentage: data.discountPercentage || 10,
            isTopSelling: data.isTopSelling !== undefined ? data.isTopSelling : (data.id % 2 === 0),
            isFeatured: data.isFeatured !== undefined ? data.isFeatured : true,
            itinerary: data.itinerary || []
          };
          setDeal(transformedDeal);
        } else {
          console.error('Unexpected response structure:', data)
          throw new Error('Package not found')
        }
      } catch (err) {
        console.error('Error fetching deal:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch deal')
      } finally {
        setLoading(false)
      }
    }

    if (dealId) {
      fetchDeal()
    }
  }, [dealId])

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

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#002147] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deal details...</p>
        </div>
      </main>
    )
  }

  if (error || !deal) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Deal Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested deal could not be found.'}</p>
          <Link href="/">
            <Button className="bg-[#002147] hover:bg-[#001a38]">
              Return Home
            </Button>
          </Link>
        </div>
      </main>
    )
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
              backgroundImage: `url('${deal.image}')`
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
          <Link href="/">
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
              {deal.isTopSelling && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Top Selling
                </span>
              )}
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {deal.discountPercentage}% OFF
              </span>
              {deal.isHalalFriendly && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Halal Friendly
                </span>
              )}
            </motion.div>
            
            <motion.h1 
              className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {deal.title}
            </motion.h1>
            
            <motion.p 
              className="text-xl opacity-90 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {deal.subtitle || deal.destination}
            </motion.p>

            <motion.div 
              className="flex items-center gap-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{deal.days} Days</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{deal.cities} Cities</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{deal.seatsLeft} Seats Left</span>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-baseline gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <span className="text-3xl font-bold">S${deal.price}</span>
              <span className="text-lg line-through opacity-60">S${deal.originalPrice}</span>
              <span className="text-green-400 font-medium">Save S${deal.savings}</span>
            </motion.div>
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
            {deal.description}
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
                  <p className="text-gray-600">Everything you need to know about your {deal.destination} adventure</p>
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
                        <div className="text-2xl font-bold text-[#081C2D]">{deal.days}</div>
                        <div className="text-sm text-gray-600">Days</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#081C2D]">{deal.days - 1}</div>
                        <div className="text-sm text-gray-600">Nights</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#081C2D]">{deal.cities}</div>
                        <div className="text-sm text-gray-600">Cities</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#081C2D]">{deal.seatsLeft}</div>
                        <div className="text-sm text-gray-600">Seats Left</div>
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
                        `${deal.days - 1} nights premium accommodation`,
                        "Daily breakfast & selected meals",
                        "Transportation & transfers",
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
                </div>
              </div>
            )}

            {activeTab === 'Itinerary' && (
              <div className="p-6 space-y-4">
                {deal.itinerary && deal.itinerary.length > 0 ? (
                  deal.itinerary.map((day, index) => (
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
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">Detailed itinerary coming soon!</p>
                    <p className="text-sm text-gray-500">Contact us for more information about this amazing {deal.destination} adventure.</p>
                  </div>
                )}
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
                      { label: "Twin Sharing", price: `S$${deal.price}`, popular: true },
                      { label: "Single Supplement", price: `+S$${Math.round(deal.price * 0.2)}`, popular: false },
                      { label: "Child (2-11 years)", price: `S$${Math.round(deal.price * 0.8)}`, popular: false }
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
            <Link href={`/packages/booking/${deal.id}`}>
              <Button className="w-full bg-[#081C2D] hover:bg-[#081C2D]/90 text-white py-4 text-lg font-semibold shadow-lg">
                Book Now - S${deal.price}
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </main>
  )
}
