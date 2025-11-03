"use client"

import React, { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Calendar, MapPin, Shield, Clock, ThumbsUp, CreditCard } from "lucide-react"
import axios from "axios"
import Image from "next/image"

import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"
import Footer from "@/components/Footer"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3003'

// Helper function to get full image URL
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE}/${imagePath}`;
}
import alaskaMap from "@/assets/NorthAmericaCountriesPNG/Alaska.png"
import canadaMap from "@/assets/NorthAmericaCountriesPNG/canada.png"
import costaRicaMap from "@/assets/NorthAmericaCountriesPNG/Costa Rica.png"
import mexicoMap from "@/assets/NorthAmericaCountriesPNG/Mexico.png"
import panamaMap from "@/assets/NorthAmericaCountriesPNG/Panama.png"
import unitedStatesMap from "@/assets/NorthAmericaCountriesPNG/United States.png"

const northAmericaCountries = [
  {
    name: "United States",
    mapImage: unitedStatesMap,
    link: "/packages/north-america/united-states"
  },
  {
    name: "Canada",
    mapImage: canadaMap,
    link: "/packages/north-america/canada"
  },
  {
    name: "Mexico",
    mapImage: mexicoMap,
    link: "/packages/north-america/mexico"
  },
  {
    name: "Alaska",
    mapImage: alaskaMap,
    link: "/packages/north-america/alaska"
  },
  {
    name: "Costa Rica",
    mapImage: costaRicaMap,
    link: "/packages/north-america/costa-rica"
  },
  {
    name: "Panama",
    mapImage: panamaMap,
    link: "/packages/north-america/panama"
  }
]

export default function NorthAmericaPackagesPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal()
  const [northAmericaPackages, setNorthAmericaPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/packages/north-america`);
        if (response.data.success) {
          setNorthAmericaPackages(response.data.packages);
        }
      } catch (err) {
        console.error('Error fetching North America packages:', err);
        setError('Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/2373201/pexels-photo-2373201.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-[120px] font-bold leading-none tracking-tight mb-8">
            NORTH AMERICA
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            Explore the diverse landscapes and vibrant cities of North America.
          </p>
          <Button 
            onClick={() => openModal({
              packageName: "North America Travel Packages",
              packageType: "North America Package",
              destination: "North America"
            })}
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
          >
            Enquire Now
          </Button>
        </div>
      </div>

      {/* Countries Section */}
      <section className="py-16 px-4 bg-[#002147]">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Left Arrow */}
            <button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Countries Scroll Container */}
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-6 px-12 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {/* Map through countries data array */}
              {northAmericaCountries.map((country, index) => (
                <Link 
                  key={index} 
                  href={country.link}
                  className="flex flex-col group flex-shrink-0 w-64"
                >
                  <div className="bg-[#003366] rounded-lg p-8 h-64 flex items-center justify-center mb-4 group-hover:bg-[#004488] transition-colors cursor-pointer">
                    {/* Country map image */}
                    <Image 
                      src={country.mapImage} 
                      alt={`${country.name} map`}
                      className="w-full h-full object-contain"
                      width={300}
                      height={300}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-white text-center">{country.name}</h3>
                </Link>
              ))}
            </div>

            {/* Right Arrow */}
            <button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover North America</h2>
          <p className="text-gray-600 text-lg">
            From Alaska's wilderness to vibrant American cities.
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading packages...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && northAmericaPackages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No packages available at the moment.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {northAmericaPackages.map((pkg) => (
            <Link key={pkg.id} href={`/packages/${pkg.slug}`} className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer block">
              <div className="relative">
                {/* Image with title overlay */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getImageUrl(pkg.image)}
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Title on image */}
                  <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                    {pkg.title}
                  </h3>
                </div>

                {/* Top badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  {pkg.isTopSelling && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                      Top Selling
                    </span>
                  )}
                  <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-110">
                    <Heart className="w-5 h-5 text-gray-700 transition-colors hover:text-red-500" />
                  </button>
                </div>
              </div>

              {/* Card content */}
              <div className="p-5">
                {/* Info row with icons */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <MapPin className="w-4 h-4" />
                    <span>{pkg.cities}</span>
                  </div>
                  {pkg.isHalalFriendly && (
                    <span className="bg-green-500 text-white text-xs px-2.5 py-1 rounded font-medium">
                      Halal Friendly
                    </span>
                  )}
                </div>

                {/* Seats left badge */}
                <div className="mb-4">
                  <span className="inline-block bg-blue-500 text-white text-sm px-3 py-1 rounded font-medium">
                    {pkg.seatsLeft} Seats Left
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {pkg.description}
                </p>

                {/* Price and button */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500 block">From</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">${pkg.price}</span>
                    </div>
                    <span className="text-green-600 text-xs">You save ${pkg.savings}</span>
                  </div>
                  <Button className="bg-[#002147] hover:bg-[#001a38] text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg">
                    Book Now
                  </Button>
                </div>
              </div>
            </Link>
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

      {/* North America Description Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">NORTH AMERICA</h2> 
        </div>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 mb-6">
            North America is known as the &apos;land of opportunity&apos;. North America has some of the greatest holidays spots, from cinemas and shopping centers to iconic landmarks and famous cities. The continent is home to many famous and iconic landmarks, such as the Statue of Liberty in New York City, Niagara Falls — and even Disneyland. There are also several breathtaking sceneries and plenty of diverse experiences that tourists surely enjoy.
          </p>

          <p className="text-gray-700 mb-6">
            North America is a popular tourist destination, known for its rich history, diverse cultures, and natural wonders. From the stunning natural beauty of the Grand Canyon and Yellowstone National Park to the bustling cities of New York, Los Angeles, and Mexico City, there is something for everyone to enjoy.
          </p>

          <p className="text-gray-700 mb-6">
            In Canada, tourists can visit the world-famous Niagara Falls, take a scenic drive through the Rocky Mountains, and experience the unique culture and history of Quebec City. In the United States, attractions range from amusement parks, such as Disney World and Universal Studios, to iconic landmarks, like the Golden Gate Bridge and the Statue of Liberty.
          </p>

          <p className="text-gray-700 mb-6">
            Central America offers a wealth of adventure and outdoor activities, including surfing, diving, and exploring ancient ruins. Popular destinations include Mexico&apos;s Cancun and the Mayan ruins at Tulum, as well as Costa Rica&apos;s lush rainforests and Panama&apos;s thriving wildlife and beaches.
          </p>

          <p className="text-gray-700 mb-6">
            The Caribbean is a popular destination for those seeking sun, sand, and crystal-clear waters. Islands such as Jamaica, the Dominican Republic, and Barbados offer a mix of relaxation and adventure, with opportunities for snorkeling, sailing, and exploring vibrant local markets.
          </p>

          <p className="text-gray-700">
            North America is also home to a rich cultural heritage, with a plethora of museums, galleries, and historic sites. Whether exploring the colonial history of Jamestown and Williamsburg, or taking in the Native American cultures of New Mexico and Arizona, there is much to discover and experience on the continent.
          </p>
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
       {/* Customize Trip Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#002147] rounded-2xl p-12 relative overflow-hidden">
            <div className="max-w-lg">
              <h2 className="text-6xl font-bold text-white mb-6">Want to Customize your trip?</h2>
              <Button className="bg-white text-[#002147] hover:bg-white/90 text-lg px-8 py-6">
                Get in touch
              </Button>
            </div>
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