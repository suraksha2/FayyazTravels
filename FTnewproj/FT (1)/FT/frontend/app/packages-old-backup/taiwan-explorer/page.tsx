"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const itineraryData = [
  {
    day: 1,
    title: "Arrival in Taipei",
    description: "Arrive in Taiwan's vibrant capital and explore the bustling night markets.",
    image: "https://images.pexels.com/photos/2510424/pexels-photo-2510424.jpeg"
  },
  {
    day: 2,
    title: "Taipei City Highlights",
    description: "Visit Taipei 101, Chiang Kai-shek Memorial Hall, and local temples.",
    image: "https://images.pexels.com/photos/2510424/pexels-photo-2510424.jpeg"
  },
  {
    day: 3,
    title: "Taroko Gorge National Park",
    description: "Explore the stunning marble cliffs and scenic hiking trails.",
    image: "https://images.pexels.com/photos/2510424/pexels-photo-2510424.jpeg"
  },
  {
    day: 4,
    title: "Sun Moon Lake",
    description: "Visit Taiwan's most beautiful lake and enjoy boat rides.",
    image: "https://images.pexels.com/photos/2510424/pexels-photo-2510424.jpeg"
  },
  {
    day: 5,
    title: "Kaohsiung & Departure",
    description: "Explore Taiwan's southern port city before departure.",
    image: "https://images.pexels.com/photos/2510424/pexels-photo-2510424.jpeg"
  }
]

export default function TaiwanExplorerPage() {
  const [activeTab, setActiveTab] = useState('Itinerary')

  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/2510424/pexels-photo-2510424.jpeg')"
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
              Taiwan Explorer
            </h1>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-xl md:text-2xl text-white">
                From S$4225 / pp
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
            Taiwan's vibrant west coast, where ancient traditions meet modern wonders.
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
                  <p className="text-gray-600">7 Days, 6 Nights</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Group Size</h4>
                  <p className="text-gray-600">Maximum 18 people</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Includes</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• 6 nights accommodation</li>
                    <li>• Daily breakfast</li>
                    <li>• High-speed rail tickets</li>
                    <li>• English-speaking guide</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Highlights</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Taipei 101</li>
                    <li>• Taroko Gorge</li>
                    <li>• Sun Moon Lake</li>
                    <li>• Night Markets</li>
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
                    <span className="text-xl font-bold text-[#C69C3C]">S$4,225</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-lg">Single Supplement</span>
                    <span className="text-xl font-bold text-[#C69C3C]">S$750</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-lg">Child (2-11 years)</span>
                    <span className="text-xl font-bold text-[#C69C3C]">S$3,225</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-xl">
                  <h4 className="font-semibold mb-2">Price Includes:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Return flights from Singapore</li>
                    <li>• 6 nights hotel accommodation</li>
                    <li>• Daily breakfast and selected meals</li>
                    <li>• High-speed rail transportation</li>
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
            Ready to Explore Taiwan?
          </h3>
          <p className="text-white/80 mb-6">
            Contact our travel experts to customize your perfect Taiwanese adventure.
          </p>
          <Button className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white text-lg px-8 py-6">
            View Details
          </Button>
        </div>
      </div>
    </main>
  )
}