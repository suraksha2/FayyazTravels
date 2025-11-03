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

export default function ChinaPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('http://localhost:3003/destination/asia/china');
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
    const priceMatch = content.match(/\$\d+/);
    return priceMatch ? priceMatch[0] : 'Price on request';
  };

  // Helper function to clean HTML content
  const cleanContent = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
  };

  // Fallback image URL
  const fallbackImage = 'https://images.pexels.com/photos/2412603/pexels-photo-2412603.jpeg';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#002147]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error}</p>
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
            backgroundImage: "url('https://images.pexels.com/photos/2412603/pexels-photo-2412603.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-[150px] font-bold leading-none tracking-tight mb-8">
            CHINA
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            Discover ancient civilizations and modern marvels in the Middle Kingdom.
          </p>
          <Button 
            onClick={() => openModal({
              packageName: "China Travel Packages",
              packageType: "Country Specific",
              destination: "China"
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover China</h2>
          <p className="text-gray-600 text-lg">
            From the Great Wall to modern Shanghai, experience China's wonders.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No packages found for China. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg: Package) => (
              <Link 
                key={pkg.id} 
                href={`/packages/${pkg.slug}`}
                className="block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image Section with Title Overlay */}
                <div className="relative h-48">
                  <Image
                    src={pkg.image || fallbackImage}
                    alt={pkg.title}
                    fill
                    className="object-cover"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {pkg.isTopSelling && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
                        Top Selling
                      </span>
                    )}
                    <button
                      className="bg-white/90 p-1.5 rounded-full hover:bg-white transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Heart className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Title on image */}
                  <h3 className="absolute bottom-3 left-3 text-white text-xl font-bold">
                    {pkg.title}
                  </h3>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  {/* Info badges */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{pkg.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{pkg.cities} {pkg.cities === 1 ? 'City' : 'Cities'}</span>
                    </div>
                    {pkg.isHalalFriendly && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
                        Halal Friendly
                      </span>
                    )}
                  </div>

                  {/* Seats left badge */}
                  {pkg.seatsLeft && (
                    <div className="mb-3">
                      <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded font-medium">
                        {pkg.seatsLeft} Seats Left
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {pkg.description}
                  </p>

                  {/* Price and buttons */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-[#002147]">
                        {pkg.currency}${pkg.price?.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600">
                        Save {pkg.currency}${pkg.savings?.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link 
                        href={`/packages/booking/${pkg.id}`}
                        className="flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button className="w-full bg-[#002147] hover:bg-[#001a38] text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5">
                          Book Now
                        </Button>
                      </Link>
                      <Link 
                        href={`/packages/${pkg.slug}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Link>
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