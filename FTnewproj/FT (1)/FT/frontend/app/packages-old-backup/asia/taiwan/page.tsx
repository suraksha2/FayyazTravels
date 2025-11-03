"use client"

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Calendar, MapPin, Loader2 } from "lucide-react"
import Link from 'next/link';
import Image from 'next/image';
import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"
import Footer from "@/components/Footer"
import WhyBookSection from "@/components/WhyBookSection"

interface Package {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  duration: string;
  price: number;
  savings: number;
  currency: string;
  cities: number;
  isHalalFriendly?: boolean;
  isTopSelling?: boolean;
  seatsLeft?: number;
  hasPriceData?: boolean;
}

export default function TaiwanPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('http://localhost:3003/destination/asia/asia-taiwan');
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        const data = await response.json();
        setPackages(data.packages || data);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to load packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Helper function to extract price from content
  const extractPrice = (content: string): string => {
    const priceMatch = content.match(/\$[\d,]+|\d+\s*SGD|SGD\s*\d+/i);
    return priceMatch ? priceMatch[0] : 'Contact for Price';
  };

  // Helper function to clean content
  const cleanContent = (content: string): string => {
    return content ? content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'No description available';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#002147]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Packages</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/5087165/pexels-photo-5087165.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-[150px] font-bold leading-none tracking-tight mb-8">
            TAIWAN
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            Discover where ancient traditions meet modern wonders in beautiful Taiwan.
          </p>
          <Button 
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
            onClick={() => openModal({
              packageName: "Taiwan Travel Package",
              packageType: "Asia Adventure",
              destination: "Taiwan"
            })}
          >
            Enquire Now
          </Button>
        </div>
      </div>

      {/* Packages Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover Taiwan</h2>
          <p className="text-gray-600 text-lg">
            From Taipei's night markets to Taroko Gorge, experience Taiwan's beauty.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No packages found</h3>
            <p className="text-gray-600">We're currently updating our Taiwan packages. Please check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl group cursor-pointer"
                onClick={() => window.location.href = `/packages/${pkg.slug}`}
              >
                {/* Image Section with Overlay Title */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={pkg.image || 'https://images.pexels.com/photos/5087165/pexels-photo-5087165.jpeg'} 
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Dark overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  
                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {pkg.isTopSelling && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold">
                        Top Selling
                      </span>
                    )}
                    <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-110">
                      <Heart className="w-4 h-4 text-gray-700 transition-colors hover:text-red-500" />
                    </button>
                  </div>

                  {/* Title overlay on image */}
                  <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white drop-shadow-lg">
                    {pkg.title}
                  </h3>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  {/* Info badges row */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{pkg.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{pkg.cities} {pkg.cities === 1 ? 'City' : 'Cities'}</span>
                    </div>
                    {pkg.isHalalFriendly && (
                      <span className="bg-green-600 text-white text-xs px-2.5 py-1 rounded font-semibold">
                        Halal Friendly
                      </span>
                    )}
                  </div>

                  {/* Seats left badge */}
                  {pkg.seatsLeft && (
                    <div className="mb-4">
                      <span className="inline-block bg-blue-500 text-white text-sm px-3 py-1 rounded font-semibold">
                        {pkg.seatsLeft} Seats Left
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {pkg.description}
                  </p>

                  {/* Price and Book Button */}
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs text-gray-500 block">From</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {pkg.currency}${pkg.price?.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">You save {pkg.currency}${pkg.savings?.toLocaleString()}</span>
                    </div>
                    <Link 
                      href={`/packages/booking/${pkg.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button className="bg-[#002147] hover:bg-[#003366] text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg">
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

      {/* Why Book with Us Section */}
      <WhyBookSection />

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