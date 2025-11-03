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
  p_name: string;
  p_content: string;
  p_slug: string;
  slug: string;
  p_image?: string;
  day_night?: string;
  p_duration?: string;
  p_cities?: string;
  p_savings?: string;
  p_seats_left?: string;
  is_halal_friendly?: boolean;
  is_top_selling?: boolean;
  price?: number;
  savings?: number;
  sale_price?: number;
  package_currency?: string;
}

export default function IndonesiaPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('http://localhost:3003/destination/south-east-asia/indonesia');
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        const data = await response.json();
        setPackages(data);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to load packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Helper function to format price
  const formatPrice = (price: number | undefined, currency: string = 'SGD'): string => {
    if (!price) return 'Price on request';
    return `S$${price.toLocaleString()}`;
  };

  // Helper function to clean HTML content
  const cleanContent = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
  };

  // Helper function to extract cities count
  const getCitiesCount = (pkg: Package): number => {
    if (pkg.p_cities) {
      return pkg.p_cities.split(',').length;
    }
    return 0;
  };

  // Fallback image URL
  const fallbackImage = 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg';

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
            backgroundImage: "url('https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-[150px] font-bold leading-none tracking-tight mb-8">
            INDONESIA
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            Discover the world's largest archipelago with diverse cultures and stunning islands.
          </p>
          <Button 
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
            onClick={() => openModal({
              packageName: "Indonesia Travel Package",
              packageType: "South East Asia Adventure",
              destination: "Indonesia"
            })}
          >
            Enquire Now
          </Button>
        </div>
      </div>

      {/* Packages Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover Indonesia</h2>
          <p className="text-gray-600 text-lg">
            From Bali's temples to Java's heritage, experience Indonesia's diversity.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No packages found for Indonesia. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-52 w-full group">
                  <Link href={`/packages/${pkg.slug || pkg.p_slug || pkg.id}`}>
                    <Image
                      src={pkg.p_image ? `http://localhost:3003/${pkg.p_image}` : fallbackImage}
                      alt={pkg.p_name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </Link>
                  
                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {pkg.is_top_selling && (
                      <span className="bg-[#E63946] text-white px-3 py-1 rounded text-xs font-semibold">
                        Top Selling
                      </span>
                    )}
                  </div>
                  
                  {/* Wishlist button */}
                  <button
                    className="absolute top-3 right-3 bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  {/* Package title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg leading-tight">
                      {pkg.p_name}
                    </h3>
                  </div>
                </div>

                <div className="p-4">
                  {/* Package details */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{pkg.day_night || pkg.p_duration || 'Custom'}</span>
                    </div>
                    {getCitiesCount(pkg) > 0 && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{getCitiesCount(pkg)} Cities</span>
                      </div>
                    )}
                    {pkg.is_halal_friendly && (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                        Halal Friendly
                      </span>
                    )}
                  </div>

                  {/* Seats left badge */}
                  {pkg.p_seats_left && (
                    <div className="mb-3">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                        {pkg.p_seats_left} Seats Left
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {cleanContent(pkg.p_content)}
                  </p>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">From</p>
                      <p className="text-2xl font-bold text-[#002147]">
                        {formatPrice(pkg.price, pkg.package_currency)}
                      </p>
                      {pkg.savings && pkg.savings > 0 && (
                        <p className="text-xs text-green-600 font-medium">
                          You save S${pkg.savings}
                        </p>
                      )}
                    </div>
                    <Link href={`/packages/booking/${pkg.id}`}>
                      <Button 
                        className="bg-[#002147] hover:bg-[#003366] text-white px-6 py-2 rounded-md font-semibold"
                      >
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