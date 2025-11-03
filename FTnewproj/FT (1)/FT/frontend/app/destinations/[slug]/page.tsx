"use client"

import { Button } from "@/components/ui/button"
import { Heart, Calendar, MapPin, ArrowLeft, Users, Star } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Destination {
  id: number
  d_name: string
  d_slug: string
  d_img: string
  b_content: string
  d_content: string
  meta_title: string
  meta_description: string
  status: number
}

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
}

interface DestinationData {
  destination: Destination
  packages: Package[]
}

export default function DestinationDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [destinationData, setDestinationData] = useState<DestinationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDestinationData = async () => {
      try {
        const response = await fetch(`http://localhost:3003/destination/${slug}/packages`)
        if (!response.ok) {
          throw new Error('Failed to fetch destination data')
        }
        const data = await response.json()
        setDestinationData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchDestinationData()
    }
  }, [slug])

  // Helper function to clean HTML content
  const cleanContent = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
  }

  // Helper function to extract price from content
  const extractPrice = (content: string): number => {
    const priceMatch = content.match(/\$(\d+)/);
    return priceMatch ? parseInt(priceMatch[1]) : 2999;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#002147]"></div>
          <p className="mt-4 text-gray-600">Loading destination...</p>
        </div>
      </div>
    )
  }

  if (error || !destinationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error: {error || 'Destination not found'}</p>
          <div className="flex gap-4 mt-4 justify-center">
            <Link href="/destinations">
              <Button>Back to Destinations</Button>
            </Link>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { destination, packages } = destinationData

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${destination.d_img ? `http://localhost:3003/${destination.d_img}` : 'https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg'}')`
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          
          <h1 className="text-7xl font-bold leading-none tracking-tight mb-8">
            {destination.d_name.toUpperCase()}
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl mb-8 leading-relaxed">
              {destination.b_content ? cleanContent(destination.b_content) : cleanContent(destination.d_content)}
            </p>
          </div>
          <Button 
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
            onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Packages
          </Button>
        </div>
      </div>

      {/* Destination Description */}
      {destination.d_content && (
        <section className="py-16 px-4 max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: destination.d_content }}
              className="text-gray-700 leading-relaxed"
            />
          </div>
        </section>
      )}

      {/* Packages Section */}
      <section id="packages" className="py-16 px-4 max-w-7xl mx-auto bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {destination.d_name} Packages
          </h2>
          <p className="text-gray-600 text-lg">
            {packages.length > 0 
              ? `Discover ${packages.length} amazing package${packages.length !== 1 ? 's' : ''} to ${destination.d_name}`
              : `No packages available for ${destination.d_name} at the moment`
            }
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto">
              <p className="text-gray-500 text-lg mb-4">No packages found for this destination.</p>
              <p className="text-gray-400 text-sm mb-6">Check back soon or contact us for custom packages.</p>
              <Button className="bg-[#002147] hover:bg-[#001a38]">
                Contact Us
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
                <div className="relative overflow-hidden">
                  <img 
                    src={pkg.feature_img ? `http://localhost:3003/${pkg.feature_img}` : 'https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg'} 
                    alt={pkg.p_name}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="bg-[#002147] text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-110">
                      <Heart className="w-5 h-5 text-gray-700 transition-colors hover:text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {pkg.day_night || 'Multiple Days'}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      Group Tour
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#002147] transition-colors">
                    {pkg.p_name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {cleanContent(pkg.p_content)}
                  </p>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-sm text-gray-500">From</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[#002147]">
                          {pkg.package_currency}${extractPrice(pkg.p_content)}
                        </span>
                        <span className="text-green-600 text-sm">Best Price</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium text-gray-700">4.8</span>
                    </div>
                  </div>

                  <Link href={`/package-detail/${pkg.p_slug}`}>
                    <Button className="w-full bg-[#002147] hover:bg-[#001a38] text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5">
                      View Package Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#8B1F41] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6">
            Need Help Planning Your Trip?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Our travel experts are here to help you create the perfect {destination.d_name} experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[#8B1F41] hover:bg-white/90 px-8 py-3">
              Contact Expert
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#8B1F41] px-8 py-3">
              Get Custom Quote
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
