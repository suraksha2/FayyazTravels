"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Calendar, MapPin, Shield, Clock, ThumbsUp, CreditCard } from "lucide-react"
import { useState, useEffect } from "react"
import Image from 'next/image';
import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"
import Link from "next/link"

interface Package {
  id: number
  p_name: string
  p_slug: string
  day_night: string
  feature_img: string
  p_content: string
  package_currency: string
  desti_list: string
  inclusions: string
  exclusions: string
  is_publish: number
  status: number
  slug: string
}

export default function PuertoRicoPackagesPage() {
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('http://localhost:3003/destination/caribbean/puerto-rico')
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
  }, [])

  // Helper function to extract price from content
  const extractPrice = (content: string): number => {
    const priceMatch = content.match(/\$(\d+)/);
    return priceMatch ? parseInt(priceMatch[1]) : 4999;
  }

  // Helper function to clean HTML content
  const cleanContent = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#002147]"></div>
          <p className="mt-4 text-gray-600">Loading Puerto Rico packages...</p>
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
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-[90px] font-bold leading-none tracking-tight mb-8">
            PUERTO RICO
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            Discover the enchanting island of Puerto Rico with its rich history, stunning beaches, and vibrant culture.
          </p>
          <Button 
            onClick={() => openModal({
              packageName: "Puerto Rico Travel Packages",
              packageType: "Country Package",
              destination: "Puerto Rico"
            })}
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
          >
            Enquire Now
          </Button>
        </div>
      </div>

      {/* Packages Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Puerto Rico Island Packages</h2>
          <p className="text-gray-600 text-lg">
            Experience the enchanting blend of Spanish colonial charm and tropical Caribbean beauty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg: Package) => (
            <div 
              key={pkg.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl group cursor-pointer"
              onClick={() => window.location.href = `/packages/${pkg.p_slug}`}
            >
                {/* Image Section with Overlay Title */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={pkg.feature_img ? `http://localhost:3003/${pkg.feature_img}` : 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg'} 
                    alt={pkg.p_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Dark overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  
                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold">
                      Top Selling
                    </span>
                    <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-110">
                      <Heart className="w-4 h-4 text-gray-700 transition-colors hover:text-red-500" />
                    </button>
                  </div>

                  {/* Title overlay on image */}
                  <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white drop-shadow-lg">
                    {pkg.p_name}
                  </h3>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  {/* Info badges row */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{pkg.day_night || '7 Days'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">Colonial Cities</span>
                    </div>
                    <span className="bg-green-600 text-white text-xs px-2.5 py-1 rounded font-semibold">
                      Halal Friendly
                    </span>
                  </div>

                  {/* Seats left badge */}
                  <div className="mb-4">
                    <span className="inline-block bg-blue-500 text-white text-sm px-3 py-1 rounded font-semibold">
                      10 Seats Left
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {cleanContent(pkg.p_content)}
                  </p>

                  {/* Price and Book Button */}
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs text-gray-500 block">From</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          S${extractPrice(pkg.p_content)}
                        </span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">You save S$300</span>
                    </div>
                    <Link 
                      href={`/packages/booking/${pkg.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button className="bg-[#002147] hover:bg-[#003366] text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Book with Us Section */}
      <section className="py-20 bg-[#002147] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Book with Us?</h2>
            <p className="text-lg text-gray-300">
              Experience hassle-free travel planning with our comprehensive services and dedicated support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 rounded-lg p-8 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Best Price Guarantee</h3>
              <p className="text-gray-300">
                Find a lower price? We&apos;ll match it and give you an extra 10% off.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-8 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">24/7 Support</h3>
              <p className="text-gray-300">
                Our travel experts are here to help you anytime, anywhere.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-8 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ThumbsUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Trusted Agency</h3>
              <p className="text-gray-300">
                Over 20 years of experience in making travel dreams come true.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-8 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure Payments</h3>
              <p className="text-gray-300">
                Multiple payment options with enhanced security measures.
              </p>
            </div>
          </div>
        </div>
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
              Unlock Exclusive access to up coming packages and early bird discounts.
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