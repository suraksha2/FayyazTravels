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
  if (!imagePath) return 'https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE}/${imagePath}`;
}
import armeniaMap from "@/assets/AsiaCountries/Armenia.png"
import azerbaijanMap from "@/assets/AsiaCountries/Azerbaijan.png"
import bahrainMap from "@/assets/AsiaCountries/Bahrain.png"
import bangladeshMap from "@/assets/AsiaCountries/Bangladesh.png"
import bhutanMap from "@/assets/AsiaCountries/Bhutan.png"
import chinaMap from "@/assets/AsiaCountries/China.png"
import georgiaMap from "@/assets/AsiaCountries/Georgia.png"
import indiaMap from "@/assets/AsiaCountries/India.png"
import iranMap from "@/assets/AsiaCountries/Iran.png"
import japanMap from "@/assets/AsiaCountries/Japan.png"
import mongoliaMap from "@/assets/AsiaCountries/Mongolia.png"
import nepalMap from "@/assets/AsiaCountries/nepal.png"
import pakistanMap from "@/assets/AsiaCountries/Pakistan.png"
import southKoreaMap from "@/assets/AsiaCountries/South Korea.png"
import sriLankaMap from "@/assets/AsiaCountries/Sri Lanka.png"
import taiwanMap from "@/assets/AsiaCountries/Taiwan.png"
import uzbekistanMap from "@/assets/AsiaCountries/Uzbekistan.png"


/**
 * Asian Countries Data
 * Add country map images here
 * Each country object should have:
 * - name: The country name to display
 * - mapImage: Path to the country map image (white outline on transparent background)
 * - link: Optional link to country-specific page
 */
const asiaCountries = [
  {
    name: "Armenia",
    mapImage: armeniaMap,
    link: "/packages/asia/armenia"
  },
  {
    name: "Azerbaijan",
    mapImage: azerbaijanMap,
    link: "/packages/asia/azerbaijan"
  },
  {
    name: "Bahrain",
    mapImage: bahrainMap,
    link: "/packages/middle-east/bahrain"
  },
  {
    name: "Bangladesh",
    mapImage: bangladeshMap,
    link: "/packages/asia/bangladesh"
  },
  {
    name: "Bhutan",
    mapImage: bhutanMap,
    link: "/packages/asia/bhutan"
  },
  {
    name: "China",
    mapImage: chinaMap,
    link: "/packages/asia/china"
  },
  {
    name: "Georgia",
    mapImage: georgiaMap,
    link: "/packages/asia/georgia"
  },
  {
    name: "India",
    mapImage: indiaMap,
    link: "/packages/asia/india"
  },
  {
    name: "Iran",
    mapImage: iranMap,
    link: "/packages/middle-east/iran"
  },
  {
    name: "Japan",
    mapImage: japanMap,
    link: "/packages/asia/japan"
  },
  {
    name: "Mongolia",
    mapImage: mongoliaMap,
    link: "/packages/asia/mongolia"
  },
  {
    name: "Nepal",
    mapImage: nepalMap,
    link: "/packages/asia/nepal"
  },
  {
    name: "Pakistan",
    mapImage: pakistanMap,
    link: "/packages/asia/pakistan"
  },
  {
    name: "South Korea",
    mapImage: southKoreaMap,
    link: "/packages/asia/south-korea"
  },
  {
    name: "Sri Lanka",
    mapImage: sriLankaMap,
    link: "/packages/asia/sri-lanka"
  },
  {
    name: "Taiwan",
    mapImage: taiwanMap,
    link: "/packages/asia/taiwan"
  },
  {
    name: "Uzbekistan",
    mapImage: uzbekistanMap,
    link: "/packages/asia/uzbekistan"
  }
]
export default function AsiaPackagesPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal()
  const [asiaPackages, setAsiaPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/packages/asia`);
        if (response.data.success) {
          setAsiaPackages(response.data.packages);
        }
      } catch (err) {
        console.error('Error fetching Asia packages:', err);
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
            backgroundImage: "url('https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-[150px] font-bold leading-none tracking-tight mb-8">
            ASIA
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            Discover the rich cultures and ancient traditions of Asia.
          </p>
          <Button
            onClick={() => openModal({
              packageName: "Asia Travel Packages",
              packageType: "Regional Packages",
              destination: "Asia"
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
              {asiaCountries.map((country, index) => (
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover Asia</h2>
          <p className="text-gray-600 text-lg">
            From ancient temples to modern cities across Asia.
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

        {!loading && !error && asiaPackages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No packages available at the moment.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {asiaPackages.map((pkg) => (
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
                      <span className="text-2xl font-bold text-gray-900">{pkg.currency || 'S'}${pkg.price?.toLocaleString() || pkg.price}</span>
                    </div>
                    <span className="text-green-600 text-xs">You save {pkg.currency || 'S'}${pkg.savings?.toLocaleString() || pkg.savings}</span>
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



      {/* Africa Description Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">ASIA</h2>
        </div>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 mb-6">
            Africa is a continent of extraordinary beauty and rich cultural heritage. With its diverse landscapes, from the vast savannahs of the Serengeti to the stunning beaches of the Seychelles, Africa is a destination that offers something for every traveller. The Sahara Desert, one of the largest and hottest deserts in the world, is also a unique and fascinating destination for those interested in exploring its natural beauty and nomadic cultures.
          </p>

          <p className="text-gray-700 mb-6">
            For nature lovers and adventure seekers, a safari in countries like Botswana, Kenya, Namibia, South Africa, Tanzania, and Zambia is a must. The annual wildebeest migration in the Masaai Mara National Park in Kenya is one of the most spectacular natural events in the world, while Chobe National Park in Botswana is known for its huge herds of elephants.
          </p>

          <p className="text-gray-700 mb-6">
            For culture enthusiasts, Egypt offers a glimpse into the ancient world with the pyramids of Giza and the Valley of the Kings. Morocco offers a fascinating blend of Arab, Berber, and African cultures, with its historic medinas, vibrant markets, and stunning architecture. Tunisia is also a great destination for those interested in history and culture, with the ancient Roman city of Carthage, the UNESCO World Heritage Site of Kairouan and the Bardo Museum.
          </p>

          <p className="text-gray-700 mb-6">
            Madagascar is a unique destination, known for its diverse wildlife, including lemurs, and beautiful landscapes. The island of Mauritius is a popular destination for beach lovers, with its crystal-clear waters and white sandy beaches, while Mozambique offers a mix of African and Portuguese cultures, with its historic buildings and stunning beaches.
          </p>

          <p className="text-gray-700 mb-6">
            For those looking for a more relaxed vacation, the Seychelles and the Maldives are perfect destinations, known for their beautiful beaches, crystal-clear waters, and rich marine life.
          </p>

          <p className="text-gray-700">
            Overall, Africa is a diverse and exciting destination that offers something for everyone. Whether you're looking for an action-packed safari, an immersive cultural experience, or a relaxing beach holiday, Africa has it all.
          </p>
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
              <Button
                onClick={() => openModal({
                  packageName: "Custom Asia Trip",
                  packageType: "Customized Package",
                  destination: "Asia"
                })}
                className="bg-white text-[#002147] hover:bg-white/90 text-lg px-8 py-6"
              >
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