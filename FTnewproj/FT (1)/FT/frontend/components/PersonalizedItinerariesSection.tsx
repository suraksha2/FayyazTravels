"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, Award, Globe, CreditCard, MessageSquare, PenTool, RefreshCw, Plane } from 'lucide-react'
import EnquiryModal from '@/components/EnquiryModal'

export default function PersonalizedItinerariesSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
            {/* Image section - left side, full height */}
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg"
                alt="Luxury travel experience"
                className="w-full h-full min-h-[600px] object-cover"
              />
            </div>
            
            {/* Content section - right side */}
            <div className="bg-gray-50 p-8 md:p-16 flex flex-col justify-between">
              {/* Top part - Title, subtitle, and button */}
              <div className="space-y-6 mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-[#1e3a5f] leading-tight">
                  Personalised travel itineraries
                </h2>
                
                {/* Call-to-Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => {
                      // Track email button click
                      if (typeof window !== 'undefined' && (window as any).gtag) {
                        (window as any).gtag('event', 'click', {
                          event_category: 'CTA',
                          event_label: 'Start My Travel Plan - Email'
                        })
                      }
                      window.location.href = 'mailto:info@fayyaztravels.com?subject=Travel Plan Enquiry&body=Hi, I would like to start planning my trip.'
                    }}
                    className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-sm font-medium rounded-sm flex items-center gap-2 justify-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Start My Travel Plan
                  </Button>
                  <Button 
                    onClick={() => {
                      // Track WhatsApp button click
                      if (typeof window !== 'undefined' && (window as any).gtag) {
                        (window as any).gtag('event', 'click', {
                          event_category: 'CTA',
                          event_label: 'WhatsApp Us - Personalized Itinerary'
                        })
                      }
                      const message = encodeURIComponent("Hi, I'm interested in personalized travel itineraries. Can you help me plan my trip?")
                      window.open(`https://wa.me/6594314389?text=${message}`, '_blank')
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-sm font-medium rounded-sm flex items-center gap-2 justify-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Us
                  </Button>
                </div>

                {/* Body Copy */}
                <div className="text-base text-gray-700 leading-relaxed">
                  <p>
                    With over 15 years of experience, Fayyaz Travels is trusted worldwide for customised holiday packages from Singapore that feel truly personal. We don&apos;t just book flights and hotels. We listen, anticipate and focus on the small details others overlook, from halal-friendly dining and dietary requirements to the timing, pace and small touches that make a trip effortless. Every trip is bespoke, every request is taken seriously and we turn your adventures into memories you will still be talking about years later. At Fayyaz Travels we are where memories start.
                  </p>
                </div>

                {/* Proof Row */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 py-4 border-y border-gray-300">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#1e3a5f]" />
                    <span className="text-sm font-medium text-gray-800">15+ years experience</span>
                  </div>
                  <div className="hidden md:block text-gray-300">|</div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#1e3a5f]" />
                    <span className="text-sm font-medium text-gray-800">Trusted worldwide</span>
                  </div>
                  <div className="hidden md:block text-gray-300">|</div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#1e3a5f]" />
                    <span className="text-sm font-medium text-gray-800">Interest-free payment plans available</span>
                  </div>
                </div>

                {/* How It Works Section */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-[#1e3a5f]">How it Works</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 h-[3.5rem] flex items-start justify-center leading-tight">Tell us what you want.</h4>
                      <p className="text-sm text-gray-600">
                        Share your travel dates, preferences and budget.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                        <PenTool className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 h-[3.5rem] flex items-start justify-center leading-tight">We design your<br />itinerary.</h4>
                      <p className="text-sm text-gray-600">
                        Flights, hotels and experiences tailored to you.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 h-[3.5rem] flex items-start justify-center leading-tight">Refine it together.</h4>
                      <p className="text-sm text-gray-600">
                        We adjust until it feels just right.
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                        <Plane className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 h-[3.5rem] flex items-start justify-center leading-tight">Enjoy your trip.</h4>
                      <p className="text-sm text-gray-600">
                        Travel with confidence while we handle details.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

          </div>
        </div>
      </div>
    </section>

    {/* Enquiry Modal */}
    <EnquiryModal 
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      packageName="Personalized Itinerary"
      packageType="Custom Package"
      destination="Custom Destination"
    />
    </>
  )
}