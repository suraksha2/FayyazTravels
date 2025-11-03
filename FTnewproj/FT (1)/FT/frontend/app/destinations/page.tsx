"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MapPin, ArrowRight, Search } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

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

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('http://localhost:3003/get-destination')
        if (!response.ok) {
          throw new Error('Failed to fetch destinations')
        }
        const data = await response.json()
        setDestinations(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDestinations()
  }, [])

  // Helper function to clean HTML content
  const cleanContent = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
  }

  // Filter destinations based on search term
  const filteredDestinations = destinations.filter(dest =>
    dest.d_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.d_content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#002147]"></div>
          <p className="mt-4 text-gray-600">Loading destinations...</p>
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
      <div className="relative h-96 bg-gradient-to-r from-[#002147] to-[#8B1F41]">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-6xl font-bold leading-none tracking-tight mb-4">
            EXPLORE DESTINATIONS
          </h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Discover amazing destinations around the world with our curated travel experiences.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search destinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full bg-white/90 backdrop-blur-sm border-0 text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'All Destinations'}
          </h2>
          <p className="text-gray-600 text-lg">
            {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredDestinations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No destinations found matching your search.</p>
            <Button 
              onClick={() => setSearchTerm("")}
              className="mt-4 bg-[#002147] hover:bg-[#001a38]"
            >
              Show All Destinations
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredDestinations.map((destination) => (
              <div key={destination.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
                <div className="relative overflow-hidden">
                  <img 
                    src={destination.d_img ? `http://localhost:3003/${destination.d_img}` : 'https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg'} 
                    alt={destination.d_name}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4">
                    <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-110">
                      <Heart className="w-5 h-5 text-gray-700 transition-colors hover:text-red-500" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center text-white">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Explore Now</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#002147] transition-colors">
                    {destination.d_name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {destination.b_content ? cleanContent(destination.b_content) : cleanContent(destination.d_content)}
                  </p>

                  <Link href={`/destinations/${destination.d_slug}`}>
                    <Button className="w-full bg-[#002147] hover:bg-[#001a38] text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 group">
                      <span>Explore Packages</span>
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-[#002147] to-[#8B1F41] text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Let our travel experts help you plan the perfect trip to any of these amazing destinations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[#002147] hover:bg-white/90 text-lg px-8 py-3">
              Contact Us
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147] text-lg px-8 py-3">
              View All Packages
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
