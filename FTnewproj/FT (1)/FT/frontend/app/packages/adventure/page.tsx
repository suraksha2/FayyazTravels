"use client"

import { Button } from "@/components/ui/button"
import { Heart, Calendar, MapPin, ArrowLeft, Users, Star, Plane, Hotel } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

interface AdventurePackage {
  id: number
  slug: string
  title: string
  image: string
  days: number
  cities: number
  description: string
  price: number
  savings: number
  currency: string
  category: string
}

export default function AdventurePackagesPage() {
  const [packages, setPackages] = useState<AdventurePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchAdventurePackages = async () => {
      try {
        const response = await fetch('http://localhost:3003/packages/category/adventure', {
          signal: controller.signal
        })
        if (!response.ok) {
          throw new Error('Failed to fetch adventure packages')
        }
        const data = await response.json()
        
        if (isMounted) {
          if (data.success && data.packages) {
            setPackages(data.packages)
          } else {
            throw new Error('No adventure packages found')
          }
        }
      } catch (err) {
        if (isMounted && (err as any)?.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAdventurePackages()

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#002147]"></div>
          <p className="mt-4 text-gray-600">Loading adventure packages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error: {error}</p>
          <div className="flex gap-4 mt-4 justify-center">
            <Link href="/packages">
              <Button>Back to Packages</Button>
            </Link>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gradient-to-r from-[#002147] to-[#8B1F41]">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1933316/pexels-photo-1933316.jpeg')"
          }}
        />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
              Adventure Packages
            </h1>
            <p className="text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
              Embark on thrilling adventures and discover breathtaking landscapes with our carefully curated adventure travel packages.
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Multiple Destinations
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Group & Private Tours
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Expert Guides
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/packages">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Packages
              </Button>
            </Link>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {packages.length} Adventure Packages Available
          </h2>
          <p className="text-gray-600">
            Choose from our selection of adventure travel packages designed for thrill-seekers and nature lovers.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No adventure packages available at the moment.</p>
            <Link href="/packages">
              <Button className="mt-4">Browse All Packages</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <Link href={`/package-detail/${pkg.slug}`} className="block">
                  <div className="relative h-64">
                    <Image
                      src={pkg.image.startsWith('http') ? pkg.image : `http://localhost:3003/${pkg.image}`}
                      alt={pkg.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/1933316/pexels-photo-1933316.jpeg';
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    {pkg.savings > 0 && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Save {pkg.currency === 'S' ? 'S' : pkg.currency} ${pkg.savings}
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-6">
                  <Link href={`/package-detail/${pkg.slug}`} className="block">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {pkg.days} Days
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {pkg.cities} Cities
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-[#002147] transition-colors">
                      {pkg.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {pkg.description.replace(/<[^>]*>/g, '')}
                    </p>
                  </Link>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-left">
                      <div className="text-sm text-gray-500">From</div>
                      <div className="text-2xl font-bold text-[#002147]">
                        {pkg.currency === 'S' ? 'S' : pkg.currency}${pkg.price.toLocaleString()}
                      </div>
                      {pkg.savings > 0 && (
                        <div className="text-sm text-green-600">Save {pkg.currency === 'S' ? 'S' : pkg.currency}${pkg.savings.toLocaleString()}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      href={`/package-detail/${pkg.slug}`} 
                      className="flex-1"
                    >
                      <Button className="w-full bg-[#002147] hover:bg-[#001a38]">
                        View Details
                      </Button>
                    </Link>
                    <Link 
                      href={`/packages/booking/${pkg.id}`}
                    >
                      <Button variant="outline" className="whitespace-nowrap">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Adventure Packages?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the thrill of adventure travel with our expertly crafted packages designed for unforgettable experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#002147] rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Planning</h3>
              <p className="text-gray-600">
                Our adventure specialists plan every detail to ensure safe and thrilling experiences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#002147] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Guides</h3>
              <p className="text-gray-600">
                Travel with experienced local guides who know the best spots and safety protocols.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#002147] rounded-full flex items-center justify-center mx-auto mb-4">
                <Hotel className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Accommodation</h3>
              <p className="text-gray-600">
                Stay in carefully selected accommodations that complement your adventure experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#8B1F41] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Contact our adventure travel experts to customize your perfect adventure package.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[#8B1F41] hover:bg-white/90 px-8 py-3">
              Contact Expert
            </Button>
            <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#8B1F41] hover:border-white transition-all duration-300 px-8 py-3">
              Call Now: +65 6235 3900
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
