"use client"

import React, { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Calendar, MapPin, Loader2 } from "lucide-react"
import axios from "axios"
import { useParams } from "next/navigation"
import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"
import { getRegionBySlug, type RegionConfig } from "@/lib/regions-config"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3003'

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return 'https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE}/${imagePath}`;
}

interface Package {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  duration: string;
  price: number;
  savings: number;
  currency: string;
  cities: number;
  isHalalFriendly?: boolean;
  isTopSelling?: boolean;
  seatsLeft?: number;
}

export default function DynamicRegionPage() {
  const params = useParams()
  const regionSlug = params.region as string
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal()
  
  const [regionConfig, setRegionConfig] = useState<RegionConfig | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get region configuration
    const config = getRegionBySlug(regionSlug)
    if (!config) {
      setError('Region not found')
      setLoading(false)
      return
    }
    setRegionConfig(config)

    // Fetch packages for this region
    const fetchPackages = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE}${config.apiEndpoint}`)
        if (response.data.success) {
          setPackages(response.data.packages)
        } else if (Array.isArray(response.data)) {
          setPackages(response.data)
        }
      } catch (err) {
        console.error('Error fetching packages:', err)
        setError('Failed to load packages')
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [regionSlug])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  if (!regionConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Region Not Found</h2>
          <p className="text-gray-600">The region you're looking for doesn't exist.</p>
          <Link href="/packages">
            <Button className="mt-4">Back to Packages</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${regionConfig.heroImage}')` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-[150px] font-bold leading-none tracking-tight mb-8 uppercase">
            {regionConfig.name}
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            {regionConfig.description}
          </p>
          <Button
            onClick={() => openModal({
              packageName: `${regionConfig.name} Travel Packages`,
              packageType: "Regional Packages",
              destination: regionConfig.name
            })}
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
          >
            Enquire Now
          </Button>
        </div>
      </div>

      {/* Countries Section */}
      {regionConfig.countries.length > 0 && (
        <section className="py-16 px-4 bg-[#002147]">
          <div className="max-w-7xl mx-auto">
            <div className="relative">
              {/* Left Arrow */}
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Countries Scroll Container */}
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-6 px-12 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                {regionConfig.countries.map((country, index) => (
                  <Link
                    key={index}
                    href={`/packages-dynamic/${regionSlug}/${country.slug}`}
                    className="flex flex-col group flex-shrink-0 w-64"
                  >
                    <div className="bg-[#003366] rounded-lg p-8 h-64 flex items-center justify-center mb-4 group-hover:bg-[#004488] transition-colors cursor-pointer">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-white">{country.name}</h3>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white text-center">{country.name}</h3>
                  </Link>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Packages Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover {regionConfig.name}</h2>
          <p className="text-gray-600 text-lg">{regionConfig.description}</p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-[#002147]" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && packages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No packages available at the moment.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <Link key={pkg.id} href={`/package-detail/${pkg.slug}`} className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer block">
              <div className="relative">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getImageUrl(pkg.image)}
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {pkg.isTopSelling && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold">
                        Top Selling
                      </span>
                    )}
                    <button 
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white drop-shadow-lg">
                    {pkg.title}
                  </h3>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{pkg.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{pkg.cities} {pkg.cities === 1 ? 'City' : 'Cities'}</span>
                    </div>
                    {pkg.isHalalFriendly && (
                      <span className="bg-green-600 text-white text-xs px-2.5 py-1 rounded font-semibold">
                        Halal Friendly
                      </span>
                    )}
                  </div>

                  {pkg.seatsLeft && (
                    <div className="mb-4">
                      <span className="inline-block bg-blue-500 text-white text-sm px-3 py-1 rounded font-semibold">
                        {pkg.seatsLeft} Seats Left
                      </span>
                    </div>
                  )}

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs text-gray-500 block">From</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {pkg.currency}${pkg.price?.toLocaleString()}
                        </span>
                      </div>
                      {pkg.savings > 0 && (
                        <span className="text-xs text-green-600 font-medium">
                          You save {pkg.currency}${pkg.savings?.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button 
                      className="bg-[#002147] hover:bg-[#001a38] text-white px-10 py-4 rounded-lg text-lg font-bold transition-all duration-300 hover:shadow-lg"
                      onClick={(e) => {
                        e.preventDefault()
                        window.location.href = `/packages/booking/${pkg.id}`
                      }}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-[#8B1F41] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6">Sign Up for our Newsletter</h2>
          <div className="mb-8">
            <p className="text-2xl mb-2">Save upto</p>
            <p className="text-4xl font-bold mb-4">S$ 4812.80*</p>
            <p className="text-sm text-white/80">
              Unlock Exclusive access to upcoming packages and early bird discounts.
            </p>
          </div>
          <div className="flex gap-2 max-w-md mx-auto mb-4">
            <Input 
              type="email" 
              placeholder="Email" 
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
            />
            <Button className="bg-white text-[#8B1F41] hover:bg-white/90 px-8">→</Button>
          </div>
          <p className="text-sm text-white/60">Terms and Conditions Apply*</p>
        </div>
      </section>

      <EnquiryModal
        isOpen={isOpen}
        onClose={closeModal}
        packageName={modalData.packageName}
        packageType={modalData.packageType}
        destination={modalData.destination}
      />
    </main>
  )
}
