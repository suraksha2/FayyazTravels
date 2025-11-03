"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const itineraryData = [
  {
    day: 1,
    title: "Arrival in Bangkok",
    description: "Arrive in Thailand's vibrant capital and explore the bustling city.",
    image: "https://images.pexels.com/photos/1282315/pexels-photo-1282315.jpeg"
  },
  {
    day: 2,
    title: "Bangkok Temples & Markets",
    description: "Visit Wat Pho, Grand Palace, and explore floating markets.",
    image: "https://images.pexels.com/photos/1282315/pexels-photo-1282315.jpeg"
  },
  {
    day: 3,
    title: "Chiang Mai Cultural Experience",
    description: "Fly to Chiang Mai and explore ancient temples and local culture.",
    image: "https://images.pexels.com/photos/1282315/pexels-photo-1282315.jpeg"
  },
  {
    day: 4,
    title: "Elephant Sanctuary & Cooking Class",
    description: "Visit ethical elephant sanctuary and learn Thai cooking.",
    image: "https://images.pexels.com/photos/1282315/pexels-photo-1282315.jpeg"
  },
  {
    day: 5,
    title: "Phuket Beach Paradise",
    description: "Relax on pristine beaches and enjoy water activities.",
    image: "https://images.pexels.com/photos/1282315/pexels-photo-1282315.jpeg"
  }
]

export default function ThailandAdventurePage() {
  const [activeTab, setActiveTab] = useState('Itinerary')

  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1282315/pexels-photo-1282315.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <Link href="/packages">
            <Button variant="ghost" size="icon" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Header Content */}
        <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Thailand Adventure
            </h1>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-xl md:text-2xl text-white">
                From S$3899 / pp
              </p>
              <Button className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white text-lg px-8 py-6 w-fit">
                Enquire Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Short Description */}
        <div className="mb-8">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            Explore Thailand's tropical paradise and ancient temples.
          </p>
        </div>

        {/* Tabs Section */}
        <div className="mb-8">
          <div className="flex border-b border-gray-200">
            {['Overview', 'Itinerary', 'Prices'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-[#C69C3C] border-b-2 border-[#C69C3C]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Package Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Duration</h4>
                  <p className="text-gray-600">9 Days, 8 Nights</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Group Size</h4>
                  <p className="text-gray-600">Maximum 20 people</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Includes</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• 8 nights accommodation</li>
                    <li>• Daily breakfast</li>
                    <li>• Domestic flights</li>
                    <li>• English-speaking guide</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Highlights</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Grand Palace Bangkok</li>
                    <li>• Chiang Mai Temples</li>
                    <li>• Elephant Sanctuary</li>
                    <li>• Phuket Beaches</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Itinerary' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Daily Itinerary</h3>
              <div className="space-y-6">
                {itineraryData.map((day) => (
                  <div 
                    key={day.day}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/3">
                        <img
                          src={day.image}
                          alt={day.title}
                          className="w-full h-48 md:h-32 object-cover rounded-xl"
                        />
                      </div>
                      <div className="md:w-2/3">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-[#C69C3C] text-white px-3 py-1 rounded-full text-sm font-medium">
                            Day {day.day}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {day.title}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Prices' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Pricing Details</h3>
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-lg">Twin Sharing</span>
                    <span className="text-xl font-bold text-[#C69C3C]">S$3,899</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-lg">Single Supplement</span>
                    <span className="text-xl font-bold text-[#C69C3C]">S$700</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-lg">Child (2-11 years)</span>
                    <span className="text-xl font-bold text-[#C69C3C]">S$2,899</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-xl">
                  <h4 className="font-semibold mb-2">Price Includes:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Return flights from Singapore</li>
                    <li>• 8 nights hotel accommodation</li>
                    <li>• Daily breakfast and selected meals</li>
                    <li>• Domestic flights within Thailand</li>
                    <li>• All entrance fees and activities</li>
                    <li>• English-speaking tour guide</li>
                    <li>• Airport transfers and transportation</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-[#002147] py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Experience Thailand?
          </h3>
          <p className="text-white/80 mb-6">
            Contact our travel experts to customize your perfect Thai adventure.
          </p>
          <Button className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white text-lg px-8 py-6">
            View Details
          </Button>
        </div>
      </div>
    </main>
  )
}