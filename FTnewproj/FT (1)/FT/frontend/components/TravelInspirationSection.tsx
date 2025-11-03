"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const destinations = [
  {
    id: 1,
    country: "Sweden",
    slug: "sweden",
    image: "https://images.pexels.com/photos/3026364/pexels-photo-3026364.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 2,
    country: "Norway",
    slug: "norway",
    image: "https://images.pexels.com/photos/3889891/pexels-photo-3889891.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 3,
    country: "Spain",
    slug: "spain",
    image: "https://images.pexels.com/photos/5282269/pexels-photo-5282269.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 4,
    country: "Italy",
    slug: "italy",
    image: "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 5,
    country: "Greece",
    slug: "greece",
    image: "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1200",
  }
]

export default function TravelInspirationSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [desktopIndex, setDesktopIndex] = useState(0)
  const cardsPerPage = 3

  const nextSlide = () => {
    if (currentIndex < destinations.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const nextDesktopSlide = () => {
    if (desktopIndex + cardsPerPage < destinations.length) {
      setDesktopIndex(desktopIndex + cardsPerPage)
    }
  }

  const prevDesktopSlide = () => {
    if (desktopIndex > 0) {
      setDesktopIndex(Math.max(0, desktopIndex - cardsPerPage))
    }
  }

  return (
    <section className="bg-white py-8 md:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">Travel Inspiration</h2>
        
        {/* Mobile: Single card carousel */}
        <div className="md:hidden">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {destinations.map((destination) => (
                <div 
                  key={destination.id}
                  className="min-w-full px-2"
                >
                  <Link href={`/packages/europe/${destination.slug}`}>
                    <div className="group cursor-pointer">
                      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4">
                        <img
                          src={destination.image}
                          alt={destination.country}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                          <h3 className="text-2xl font-bold text-white mb-2">{destination.country}</h3>
                          <p className="text-white/80">Explore {destination.country}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center items-center gap-8 mt-6">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="text-sm text-gray-600">
              {currentIndex + 1} / {destinations.length}
            </div>
            <button
              onClick={nextSlide}
              disabled={currentIndex === destinations.length - 1}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Desktop: 3 cards grid with pagination */}
        <div className="hidden md:block">
          <div className="grid grid-cols-3 gap-8">
            {destinations.slice(desktopIndex, desktopIndex + cardsPerPage).map((destination) => (
              <Link 
                key={destination.id}
                href={`/packages/europe/${destination.slug}`}
                className="group cursor-pointer block"
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4">
                  <img
                    src={destination.image}
                    alt={destination.country}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{destination.country}</h3>
                    <p className="text-white/80">Explore {destination.country}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop Navigation */}
          <div className="flex justify-center items-center gap-8 mt-12">
            <button
              onClick={prevDesktopSlide}
              disabled={desktopIndex === 0}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-8 h-8 text-gray-700" />
            </button>
            <div className="text-sm text-gray-600">
              {Math.floor(desktopIndex / cardsPerPage) + 1} / {Math.ceil(destinations.length / cardsPerPage)}
            </div>
            <button
              onClick={nextDesktopSlide}
              disabled={desktopIndex + cardsPerPage >= destinations.length}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-8 h-8 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}