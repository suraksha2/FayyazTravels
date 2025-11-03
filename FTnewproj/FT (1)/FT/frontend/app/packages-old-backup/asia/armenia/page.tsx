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

export default function ArmeniaPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('http://localhost:3003/destination/asia/armenia');
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
  const fallbackImage = 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg';

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
            backgroundImage: "url('https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-[150px] font-bold leading-none tracking-tight mb-8">
            ARMENIA
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            Discover ancient monasteries and rich cultural heritage in the Caucasus.
          </p>
          <Button 
            onClick={() => openModal({
              packageName: "Armenia Travel Packages",
              packageType: "Country Specific",
              destination: "Armenia"
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover Armenia</h2>
          <p className="text-gray-600 text-lg">
            From ancient monasteries to Mount Ararat, experience Armenia's heritage.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No packages found for Armenia. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <Link href={`/packages/${pkg.slug}`}>
                  <div className="relative h-48 w-full">
                    <Image
                      src={pkg.image || fallbackImage}
                      alt={pkg.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      {pkg.isTopSelling && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                          Top Selling
                        </span>
                      )}
                      <button
                        className="bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-all duration-300 hover:scale-110"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Handle wishlist functionality
                        }}
                      >
                        <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                    <p className="text-gray-600 mb-4">{pkg.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>{pkg.duration}</span>
                      <span>•</span>
                      <MapPin className="h-4 w-4" />
                      <span>{pkg.cities} {pkg.cities === 1 ? 'City' : 'Cities'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-[#002147]">
                          {pkg.currency}${pkg.price?.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600">
                          Save {pkg.currency}${pkg.savings?.toLocaleString()}
                        </p>
                      </div>
                      <Button className="bg-[#002147] hover:bg-[#001a36]">
                        View Details
                      </Button>
                    </div>

                    {pkg.seatsLeft && (
                      <div className="mt-4 text-sm text-gray-500">
                        <p>Only {pkg.seatsLeft} seats left</p>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why Book With Us Section */}
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