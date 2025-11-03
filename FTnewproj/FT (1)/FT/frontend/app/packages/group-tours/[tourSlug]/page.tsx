"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Calendar, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"

interface Package {
  id: number
  title: string
  p_name: string
  slug: string
  p_slug: string
  duration: string
  day_night: string
  image: string
  feature_img: string
  description: string
  p_content: string
  price: number
  savings: number
  currency: string
  package_currency: string
  cities: number
  desti_list: string
  isHalalFriendly: boolean
  seatsLeft: number
  isTopSelling: boolean
}

// Tour configurations
const tourConfigs: Record<string, { name: string; description: string; heroImage: string }> = {
  'kashmir-group-tour': {
    name: 'Kashmir Group Tours',
    description: 'Experience the beauty of Kashmir with our expertly guided group tours.',
    heroImage: 'https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg'
  },
  'tour-of-north-india': {
    name: 'Tour of North India',
    description: 'Explore the rich heritage and culture of North India.',
    heroImage: 'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg'
  },
  'turkey-georgia-azerbaijan': {
    name: 'Turkey - Georgia - Azerbaijan',
    description: 'Discover the Caucasus region with our expertly guided group tours.',
    heroImage: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg'
  },
  'uzbekistan-group-tour': {
    name: 'Uzbekistan Group Tour',
    description: 'Journey through the ancient Silk Road cities of Uzbekistan.',
    heroImage: 'https://images.pexels.com/photos/5206953/pexels-photo-5206953.jpeg'
  },
  'group-tour': {
    name: 'Group Tour',
    description: 'Join our expertly guided group tours for an unforgettable experience.',
    heroImage: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg'
  }
}

export default function GroupTourPage({ params }: { params: { tourSlug: string } }) {
  const { tourSlug } = params
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tourConfig = tourConfigs[tourSlug] || {
    name: 'Group Tour',
    description: 'Explore amazing destinations with our group tours.',
    heroImage: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg'
  }

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(`http://localhost:3003/packages/group-tours/${tourSlug}`)
        if (!response.ok) {
          throw new Error('Failed to fetch packages')
        }
        const data = await response.json()
        setPackages(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [tourSlug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#002147]"></div>
          <p className="mt-4 text-gray-600">Loading packages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
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
          style={{ backgroundImage: `url('${tourConfig.heroImage}')` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-[150px] font-bold leading-none tracking-tight mb-8 uppercase">
            {tourConfig.name}
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            {tourConfig.description}
          </p>
          <Button 
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
            onClick={() => openModal({
              packageName: tourConfig.name,
              packageType: 'Group Tour',
              destination: tourConfig.name
            })}
          >
            Enquire Now
          </Button>
        </div>
      </div>

      {/* Packages Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{tourConfig.name}</h2>
          <p className="text-gray-600 text-lg">
            {tourConfig.description}
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No packages found</h3>
            <p className="text-gray-600">We're currently updating our packages. Please check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg: Package) => (
              <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl group">
                <Link href={`/package-detail/${pkg.slug || pkg.p_slug}`} className="block">
                  {/* Image Section with Overlay Title */}
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={pkg.image || pkg.feature_img ? `http://localhost:3003/${pkg.image || pkg.feature_img}` : tourConfig.heroImage} 
                      alt={pkg.title || pkg.p_name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Dark overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    
                    {/* Top badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      {pkg.isTopSelling && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold">
                          Top Selling
                        </span>
                      )}
                      <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-110">
                        <Heart className="w-4 h-4 text-gray-700 transition-colors hover:text-red-500" />
                      </button>
                    </div>

                    {/* Title overlay on image */}
                    <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white drop-shadow-lg">
                      {pkg.title || pkg.p_name}
                    </h3>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    {/* Info badges row */}
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{pkg.duration || pkg.day_night || 'Multiple Days'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{pkg.cities || 1} {pkg.cities === 1 ? 'City' : 'Cities'}</span>
                      </div>
                      {pkg.isHalalFriendly && (
                        <span className="bg-green-600 text-white text-xs px-2.5 py-1 rounded font-semibold">
                          Halal Friendly
                        </span>
                      )}
                    </div>

                    {/* Seats left badge */}
                    {pkg.seatsLeft && (
                      <div className="mb-4">
                        <span className="inline-block bg-blue-500 text-white text-sm px-3 py-1 rounded font-semibold">
                          {pkg.seatsLeft} Seats Left
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {pkg.description || (pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'Explore amazing destinations with our group tours.')}
                    </p>

                    {/* Price and Book Button */}
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-xs text-gray-500 block">From</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-gray-900">
                            {pkg.currency || pkg.package_currency || 'S'}${pkg.price?.toLocaleString() || '2999'}
                          </span>
                        </div>
                        {pkg.savings && (
                          <span className="text-xs text-green-600 font-medium">
                            You save {pkg.currency || pkg.package_currency || 'S'}${pkg.savings?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Button 
                        className="bg-[#002147] hover:bg-[#001a38] text-white px-10 py-4 rounded-lg text-lg font-bold transition-all duration-300 hover:shadow-lg"
                        onClick={(e) => {
                          e.preventDefault()
                          openModal({
                            packageName: pkg.title || pkg.p_name,
                            packageType: 'Group Tour',
                            destination: tourConfig.name
                          })
                        }}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-[#8B1F41] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6">
            Sign Up for our Newsletter
          </h2>
          
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
            <Button className="bg-white text-[#8B1F41] hover:bg-white/90 px-8">
              →
            </Button>
          </div>

          <p className="text-sm text-white/60">
            Terms and Conditions Apply*
          </p>
        </div>
      </section>

      {/* Enquiry Modal */}
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
