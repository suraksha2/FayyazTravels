"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Calendar, MapPin, Shield, Clock, ThumbsUp, CreditCard } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"
import Footer from "@/components/Footer"
import WhyBookSection from "@/components/WhyBookSection"
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

export default function AntiguaBarbudaPackagesPage() {
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('http://localhost:3003/destination/caribbean/antigua-and-barbuda')
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
    return priceMatch ? parseInt(priceMatch[1]) : 0;
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
          <p className="mt-4 text-gray-600">Loading Antigua and Barbuda packages...</p>
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
            backgroundImage: "url('https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-[150px] font-bold leading-none tracking-tight mb-8">
            ANTIGUA & BARBUDA
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            Discover 365 pristine beaches and crystal-clear waters in the heart of the Caribbean.
          </p>
          <Button 
            onClick={() => openModal({
              packageName: "Antigua & Barbuda Travel Packages",
              packageType: "Caribbean Package",
              destination: "Antigua & Barbuda"
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover Antigua & Barbuda</h2>
          <p className="text-gray-600 text-lg">
            From luxury all-inclusive resorts to secluded beachfront villas, experience Caribbean paradise at its finest.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No packages found for Antigua & Barbuda at the moment.</p>
            <p className="text-gray-500 mt-2">Please check back later or contact us for custom packages.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="relative">
                  <img 
                    src={pkg.feature_img || "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg"} 
                    alt={pkg.p_name}
                    className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg";
                    }}
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <button className="bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-all duration-300 hover:scale-110">
                      <Heart className="w-5 h-5 text-gray-700 transition-colors hover:text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      <Calendar className="w-4 h-4" />
                      {pkg.day_night || '7 Days'}
                    </div>
                    <span className="bg-[#002147] text-white text-xs font-semibold px-2 py-1 rounded">
                      Caribbean
                    </span>
                    <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      Antigua & Barbuda
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.p_name}</h3>
                    <p className="text-gray-600 mb-4">{cleanContent(pkg.p_content)}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-[#002147]">
                          {pkg.package_currency || '$'}{extractPrice(pkg.p_content).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Per person</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Link href={`/packages/${pkg.slug || pkg.p_slug || pkg.id}`} className="block w-full">
                        <Button className="w-full bg-[#002147] hover:bg-[#002147]/90">
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        className="w-full bg-[#8B1F41] hover:bg-[#8B1F41]/90"
                        onClick={() => {
                          window.location.href = `/packages/details/${pkg.id}`;
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why Book with Us Section */}
      <WhyBookSection />

      {/* Newsletter */}
      <section className="py-16 bg-[#8B1F41] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6">Ready for Your Caribbean Escape?</h2>
          <p className="text-lg mb-8">Subscribe to our newsletter for exclusive deals and travel inspiration.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-white/10 border-white/20 text-white placeholder-white/70 focus-visible:ring-white/50"
            />
            <Button className="bg-white text-[#8B1F41] hover:bg-gray-100">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    
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