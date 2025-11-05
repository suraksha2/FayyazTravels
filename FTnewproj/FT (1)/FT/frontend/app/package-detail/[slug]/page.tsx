"use client"

import { Button } from "@/components/ui/button"
import { Heart, Calendar, MapPin, ArrowLeft, Users, Star, Check, X, Plane, Hotel, Car, Camera } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Package {
  id: number
  p_name: string
  p_slug: string
  day_night: string
  feature_img: string
  desti_image: string
  p_content: string
  package_currency: string
  desti_list: string
  inclusions: string
  exclusions: string
  booking_range: string
  country_id: string
  is_publish: number
  status: number
  tour_start: string
  insert_date: string
  edit_date: string
  slug: string
  min_price: number | null
  max_price: number | null
  sale_price: number | null
  display_price: number | null
  savings: number | null
}

export default function PackageDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [packageData, setPackageData] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchPackageData = async () => {
      try {
        const response = await fetch(`http://localhost:3003/packages/${slug}`, {
          signal: controller.signal
        })
        if (!response.ok) {
          throw new Error('Failed to fetch package data')
        }
        const data = await response.json()
        
        // Check if the package data is valid
        if (!data || !data.p_name) {
          throw new Error('Package not found or invalid data')
        }
        
        if (isMounted) {
          setPackageData(data)
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

    if (slug) {
      fetchPackageData()
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [slug])

  // Helper function to clean HTML content
  const cleanContent = (html: string | null | undefined): string => {
    if (!html || typeof html !== 'string') {
      return '';
    }
    return html.replace(/<[^>]*>/g, '');
  }

  // Helper function to get price from package data
  const getPrice = (pkg: Package | null): number => {
    if (!pkg) return 2999;
    
    // Use display_price from API if available (this matches the listing page price)
    if (pkg.display_price && pkg.display_price > 0) {
      return pkg.display_price;
    }
    
    // Fallback: Use sale price if available, otherwise use min_price
    if (pkg.sale_price && pkg.sale_price > 0) {
      return pkg.sale_price;
    }
    if (pkg.min_price && pkg.min_price > 0) {
      return pkg.min_price;
    }
    
    // Last resort: try to extract from content
    if (pkg.p_content && typeof pkg.p_content === 'string') {
      const priceMatch = pkg.p_content.match(/\$(\d+)/);
      if (priceMatch) return parseInt(priceMatch[1]);
    }
    
    return 2999;
  }

  // Helper function to parse inclusions/exclusions
  const parseList = (htmlList: string | null | undefined): string[] => {
    if (!htmlList || typeof htmlList !== 'string') return [];
    return htmlList
      .replace(/<[^>]*>/g, '')
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0 && item !== '•' && item !== '-')
      .slice(0, 10); // Limit to 10 items for display
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#002147]"></div>
          <p className="mt-4 text-gray-600">Loading package details...</p>
        </div>
      </div>
    )
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error: {error || 'Package not found'}</p>
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

  const inclusions = parseList(packageData.inclusions)
  const exclusions = parseList(packageData.exclusions)

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${packageData.feature_img ? `http://localhost:3003/${packageData.feature_img}` : 'https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg'}')`
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold leading-tight tracking-tight mb-6">
              {packageData.p_name}
            </h1>
            <div className="flex items-center justify-center gap-8 mb-8 text-lg">
              {packageData.day_night && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {packageData.day_night}
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Multi-City Tour
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Group Tour
              </div>
            </div>
            <p className="text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
              {cleanContent(packageData.p_content)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
                onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Package Details */}
      <section id="details" className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Package Description */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Package Overview</h2>
              <div className="prose prose-lg max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ __html: packageData.p_content }}
                  className="text-gray-700 leading-relaxed"
                />
              </div>
            </div>

            {/* Inclusions */}
            {inclusions.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Check className="w-6 h-6 text-green-600 mr-3" />
                  What's Included
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inclusions.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exclusions */}
            {exclusions.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <X className="w-6 h-6 text-red-600 mr-3" />
                  What's Not Included
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exclusions.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                      <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Booking Card */}
              <div className="bg-white rounded-lg shadow-xl p-6 border">
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-500 mb-2">Starting from</div>
                  <div className="text-4xl font-bold text-[#002147] mb-2">
                    {packageData.package_currency || 'S'} ${getPrice(packageData).toLocaleString()}
                  </div>
                  {packageData.savings && packageData.savings > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      You save {packageData.package_currency || 'S'} ${packageData.savings.toLocaleString()}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mt-1">Best Price Guaranteed</div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{packageData.day_night || 'Multiple Days'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Tour Type</span>
                    <span className="font-medium">Group Tour</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.8/5</span>
                    </div>
                  </div>
                </div>

                <Link href={`/packages/booking/${packageData.id}`}>
                  <Button className="w-full bg-[#002147] hover:bg-[#001a38] text-white text-lg py-6 mb-4">
                    Book This Package
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
                  Get Custom Quote
                </Button>
              </div>

              {/* Features */}
              <div className="mt-6 bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-4">Why Choose This Package?</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Plane className="w-5 h-5 text-[#002147]" />
                    <span className="text-sm text-gray-700">Flight Included</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Hotel className="w-5 h-5 text-[#002147]" />
                    <span className="text-sm text-gray-700">4-Star Accommodation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-[#002147]" />
                    <span className="text-sm text-gray-700">Transportation Included</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-[#002147]" />
                    <span className="text-sm text-gray-700">Guided Tours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#8B1F41] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6">
            Ready to Book Your Adventure?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Contact our travel experts to customize this package or get more information.
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
