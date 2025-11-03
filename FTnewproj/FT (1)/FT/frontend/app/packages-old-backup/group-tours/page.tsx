"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Calendar, MapPin, Shield, Clock, ThumbsUp, CreditCard } from "lucide-react"
import axios from "axios"

import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"
import Footer from "@/components/Footer"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3003'

// Helper function to get full image URL
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return 'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE}/${imagePath}`;
}

export default function GroupToursPackagesPage() {
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();
  const [groupTourPackages, setGroupTourPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/packages/group-tours`);
        if (response.data.success) {
          setGroupTourPackages(response.data.packages);
        }
      } catch (err) {
        console.error('Error fetching Group Tours packages:', err);
        setError('Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-[120px] font-bold leading-none tracking-tight mb-8">
            GROUP TOURS
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            Join like-minded travelers on our carefully curated group tours and create lasting memories.
          </p>
          <Button 
            onClick={() => openModal({
              packageName: "Group Tour Packages",
              packageType: "Country Specific",
              destination: "Various Destinations"
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Group Tour Adventures</h2>
          <p className="text-gray-600 text-lg">
            Join our expertly guided group tours for unforgettable experiences.
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

        {!loading && !error && groupTourPackages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No packages available at the moment.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {groupTourPackages.map((pkg) => (
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

      {/* Newsletter Section */}
      <section className="py-20 bg-[#8B1F41] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6">
            Sign Up for our Newsletter
          </h2>
          
          <div className="mb-8">
            <p className="text-2xl mb-2">Save upto</p>
            <p className="text-4xl font-bold mb-4">$ 4812.80*</p>
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