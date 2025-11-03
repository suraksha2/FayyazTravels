"use client"

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

// Deal interface
interface Deal {
  id: number
  slug: string
  title: string
  subtitle?: string
  image: string
  days: number
  cities: number
  isHalalFriendly: boolean
  seatsLeft: number
  description: string
  price: number
  savings: number
  isTopSelling: boolean
  currency?: string
}

export default function HotDealsSection() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch hot deals from API
  const fetchHotDeals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/packages/hot-deals?limit=6`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch hot deals: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.deals) {
        setDeals(data.deals)
      } else {
        throw new Error('Failed to fetch hot deals')
      }
    } catch (err) {
      console.error('Error fetching hot deals:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch hot deals')
      // Set empty array on error to prevent crashes
      setDeals([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotDeals()
  }, [])
  // Loading state
  if (loading) {
    return (
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Hot Deals</h2>
          <p className="text-gray-600 mt-2">Discover exclusive offers and discounts on top travel destinations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
              <div className="w-full h-[200px] bg-gray-300"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 rounded mb-3"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-8 w-24 bg-gray-300 rounded"></div>
                  <div className="h-10 w-28 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Hot Deals</h2>
          <p className="text-gray-600 mt-2">Discover exclusive offers and discounts on top travel destinations.</p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load hot deals: {error}</p>
          <Button onClick={fetchHotDeals} className="bg-[#002147] hover:bg-[#001a38]">
            Try Again
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Hot Deals</h2>
        <p className="text-gray-600 mt-2">Discover exclusive offers and discounts on top travel destinations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {deals.map((deal) => (
          <Link key={deal.id} href={`/package-detail/${deal.slug}`} className="block">
            <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
            <div className="relative">
              {/* Image with title overlay */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={deal.image} 
                  alt={deal.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Title on image */}
                <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                  {deal.title}
                </h3>
              </div>

              {/* Top badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                {deal.isTopSelling && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                    Top Selling
                  </span>
                )}
                <button 
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-110"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // Handle wishlist functionality here
                  }}
                >
                  <Heart className="w-5 h-5 text-gray-700 transition-colors hover:text-red-500" />
                </button>
              </div>
            </div>

            {/* Card content */}
            <div className="p-5">
              {/* Info row with icons */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                  </svg>
                  <span>{deal.days} Days</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{deal.cities} Cities</span>
                </div>
                {deal.isHalalFriendly && (
                  <span className="bg-green-500 text-white text-xs px-2.5 py-1 rounded font-medium">
                    Halal Friendly
                  </span>
                )}
              </div>

              {/* Seats left badge */}
              <div className="mb-4">
                <span className="inline-block bg-blue-500 text-white text-sm px-3 py-1 rounded font-medium">
                  {deal.seatsLeft} Seats Left
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {deal.description}
              </p>

              {/* Price and button */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500 block">From</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{deal.currency || 'S'}${deal.price}</span>
                  </div>
                  <span className="text-green-600 text-xs">You save {deal.currency || 'S'}${deal.savings}</span>
                </div>
                <Link href={`/packages/booking/${deal.id}`}>
                  <Button className="bg-[#002147] hover:bg-[#001a38] text-white px-10 py-4 rounded-lg text-lg font-bold transition-all duration-300 hover:shadow-lg">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-12">
        <button className="p-2 rounded hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 text-gray-800 font-medium text-sm">
          1
        </span>
        <button className="p-2 rounded hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  )
}