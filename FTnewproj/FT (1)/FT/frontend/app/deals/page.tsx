"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Calendar, MapPin, Shield, Clock, ThumbsUp, CreditCard } from "lucide-react"
import Link from "next/link"

interface Deal {
  id: number
  slug: string
  title: string
  subtitle?: string
  destination: string
  category: string
  price: number
  originalPrice: number
  days: number
  cities: number
  isHalalFriendly: boolean
  seatsLeft: number
  description: string
  image: string
  savings: number
  discountPercentage: number
  isTopSelling: boolean
  isFeatured: boolean
}

const magazineArticles = [
  {
    id: 1,
    title: "Coastal Adventures",
    image: "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg"
  },
  {
    id: 2,
    title: "Travel in Style",
    image: "https://images.pexels.com/photos/2373201/pexels-photo-2373201.jpeg"
  },
  {
    id: 3,
    title: "Local Cuisine",
    image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg"
  }
]

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:3003/packages/hot-deals?limit=12')
        
        if (!response.ok) {
          throw new Error('Failed to fetch deals')
        }
        
        const data = await response.json()
        
        if (data.success && data.deals) {
          // Transform the hot deals data to match the Deal interface
          const transformedDeals = data.deals.map((deal: any) => ({
            id: deal.id,
            slug: deal.slug,
            title: deal.title,
            subtitle: deal.subtitle || `Explore ${deal.title}`,
            destination: deal.title,
            category: 'Hot Deal',
            price: deal.price,
            originalPrice: deal.price + deal.savings,
            days: deal.days,
            cities: deal.cities,
            isHalalFriendly: deal.isHalalFriendly,
            seatsLeft: deal.seatsLeft,
            description: deal.description,
            image: deal.image,
            savings: deal.savings,
            discountPercentage: Math.round((deal.savings / (deal.price + deal.savings)) * 100),
            isTopSelling: deal.isTopSelling,
            isFeatured: !deal.isTopSelling // Make non-top-selling items featured
          }));
          setDeals(transformedDeals)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.error('Error fetching deals:', err)
        setError(err instanceof Error ? err.message : 'Failed to load deals')
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002147]"></div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Deals</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-[#002147] hover:bg-[#001a38]"
            >
              Try Again
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[70vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-7xl font-bold mb-8">Hot Deals</h1>
          <p className="text-2xl max-w-2xl mx-auto">
            Discover exclusive offers and amazing discounts on your dream destinations
          </p>
        </div>
      </div>

      {/* Deals Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {deals.map((deal) => (
            <div key={deal.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full">
              <Link href={`/package-detail/${deal.slug}`} className="block flex-1 flex flex-col">
              <div className="relative">
                <img 
                  src={deal.image} 
                  alt={deal.title}
                  className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  {deal.isFeatured && (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  )}
                  {deal.isTopSelling && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                      Top Selling
                    </span>
                  )}
                  <button className="bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-all duration-300 hover:scale-110">
                    <Heart className="w-5 h-5 text-gray-700 transition-colors hover:text-red-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                {/* Duration, Cities, Halal Badge, and Seats Left in one line */}
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {deal.days} Days
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {deal.cities} Cities
                    </div>
                    {deal.isHalalFriendly && (
                      <span className="bg-green-500 text-white text-xs px-2.5 py-1 rounded font-medium">
                        Halal Friendly
                      </span>
                    )}
                  </div>
                  <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded font-medium">
                    {deal.seatsLeft} Seats Left
                  </span>
                </div>

                {/* Title and Description */}
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{deal.title}</h3>
                {deal.subtitle && (
                  <p className="text-sm text-gray-600 mb-3">{deal.subtitle}</p>
                )}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{deal.description}</p>

                {/* Price and Book Now Button on same line - pushed to bottom */}
                <div className="flex items-end justify-between gap-4 mt-auto">
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 block mb-1">From</span>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      S ${deal.price.toLocaleString()}
                    </div>
                    <span className="text-green-600 text-sm font-medium">
                      You save S ${deal.savings.toLocaleString()}
                    </span>
                  </div>
                  <Link 
                    href={`/packages/booking/${deal.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0"
                  >
                    <Button className="bg-[#002147] hover:bg-[#001a38] text-white px-8 py-6 text-base font-medium">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
              </Link>
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
                Find a lower price? We'll match it and give you an extra 10% off.
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

      {/* Our Speciality Section */}
      <section className="relative py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-5xl font-bold mb-6">Our Speciality?<br />Custom Itineraries.</h2>
          <Link href="/contact">
            <Button className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6">
              Get in touch
            </Button>
          </Link>
        </div>
      </section>

      {/* Magazine Section */}
      <section className="py-20 bg-[#002147] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Fayyaz Magazine</h2>
          
          <div className="space-y-4">
            {magazineArticles.map((article) => (
              <div 
                key={article.id}
                className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center p-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-6 flex-grow">
                    <h3 className="text-xl font-semibold">{article.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button className="bg-white text-[#002147] hover:bg-white/90">
              Get Inspired
            </Button>
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
            <p className="text-4xl font-bold mb-4">S $ 4812.80*</p>
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
    </main>
  )
}