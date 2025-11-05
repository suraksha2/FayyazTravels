"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getPopularDestinations, PopularDestination } from '@/lib/api'

export default function TravelInspirationSection() {
  const [destinations, setDestinations] = useState<PopularDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [desktopIndex, setDesktopIndex] = useState(0)
  const cardsPerPage = 3

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const data = await getPopularDestinations(6)
        setDestinations(data)
      } catch (error) {
        console.error('Error fetching popular destinations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDestinations()
  }, [])

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

  if (loading) {
    return (
      <section className="bg-white py-8 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">Travel Inspiration</h2>
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Loading destinations...</div>
          </div>
        </div>
      </section>
    )
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