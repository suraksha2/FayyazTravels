"use client"

import { Button } from "@/components/ui/button"
import { Heart, Calendar, MapPin, ArrowLeft, Users, Star, Building, BookOpen } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

interface CulturalPackage {
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

export default function CulturalPackagesPage() {
  const [packages, setPackages] = useState<CulturalPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCulturalPackages = async () => {
      try {
        const response = await fetch('http://localhost:3003/packages/category/cultural')
        if (!response.ok) {
          throw new Error('Failed to fetch cultural packages')
        }
        const data = await response.json()
        
        if (data.success && data.packages) {
          setPackages(data.packages)
        } else {
          throw new Error('No cultural packages found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCulturalPackages()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#002147]"></div>
          <p className="mt-4 text-gray-600">Loading cultural packages...</p>
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
      <div className="relative h-[60vh] bg-gradient-to-r from-[#8B1F41] to-[#B8860B]">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg')"
          }}
        />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
              Cultural Packages
            </h1>
            <p className="text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
              Immerse yourself in rich traditions, ancient heritage, and vibrant cultures with our carefully curated cultural travel experiences.
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Historic Sites
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Cultural Learning
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Local Experiences
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
            {packages.length} Cultural Package{packages.length !== 1 ? 's' : ''} Available
          </h2>
          <p className="text-gray-600">
            Discover the world's most fascinating cultures, traditions, and heritage sites with our expert-guided tours.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No cultural packages available at the moment.</p>
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
                      target.src = 'https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg';
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  {pkg.savings > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Save {pkg.currency}${pkg.savings.toLocaleString()}
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Cultural Heritage
                  </div>
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
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      Heritage
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
                        {pkg.currency}${pkg.price.toLocaleString()}
                      </div>
                      {pkg.savings > 0 && (
                        <div className="text-sm text-green-600">Save {pkg.currency}${pkg.savings.toLocaleString()}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.7</span>
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
              Why Choose Our Cultural Packages?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience authentic cultural immersion with our expertly crafted tours designed to connect you with local traditions and heritage.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#002147] rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Historic Sites & Monuments</h3>
              <p className="text-gray-600">
                Visit UNESCO World Heritage sites, ancient temples, and historic landmarks with expert commentary.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#002147] rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cultural Learning</h3>
              <p className="text-gray-600">
                Engage with local traditions, arts, crafts, and customs through hands-on cultural experiences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#002147] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Local Community Interaction</h3>
              <p className="text-gray-600">
                Meet local artisans, participate in traditional ceremonies, and experience authentic cultural exchanges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Highlights */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cultural Experiences You'll Enjoy
            </h2>
            <p className="text-gray-600">
              Our cultural packages offer diverse experiences that showcase the rich heritage of each destination.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Ancient Temples", icon: "🏛️" },
              { name: "Traditional Arts", icon: "🎨" },
              { name: "Local Cuisine", icon: "🍜" },
              { name: "Folk Dances", icon: "💃" },
              { name: "Handicrafts", icon: "🏺" },
              { name: "Museums", icon: "🏛️" },
              { name: "Festivals", icon: "🎭" },
              { name: "Architecture", icon: "🏰" }
            ].map((experience, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-4xl mb-2">{experience.icon}</div>
                <h4 className="font-medium text-gray-900">{experience.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Showcase */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Cultural Destinations
            </h2>
            <p className="text-gray-600">
              Explore some of the world's most culturally rich destinations in our current packages.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/5087364/pexels-photo-5087364.jpeg"
                  alt="Taiwan"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              <h4 className="font-bold text-gray-900">Taiwan</h4>
              <p className="text-sm text-gray-600">Ancient traditions meet modern culture</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg"
                  alt="Sri Lanka"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              <h4 className="font-bold text-gray-900">Sri Lanka</h4>
              <p className="text-sm text-gray-600">Buddhist heritage & colonial history</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg"
                  alt="Vietnam"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              <h4 className="font-bold text-gray-900">Vietnam</h4>
              <p className="text-sm text-gray-600">Imperial cities & ancient culture</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg"
                  alt="Dubai"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              <h4 className="font-bold text-gray-900">Dubai</h4>
              <p className="text-sm text-gray-600">Arabian heritage & modern marvels</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#8B1F41] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6">
            Ready to Explore Rich Cultures?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Contact our cultural travel experts to customize your heritage journey or learn more about our cultural experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[#8B1F41] hover:bg-white/90 px-8 py-3">
              Contact Cultural Expert
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#8B1F41] px-8 py-3">
              Call Now: +65 6235 3900
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
