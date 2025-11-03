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
  p_duration?: string;
  p_cities?: string;
  p_savings?: string;
  p_seats_left?: string;
  is_halal_friendly?: boolean;
  is_top_selling?: boolean;
}

export default function CambodiaPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('http://localhost:3003/destination/south-east-asia/cambodia');
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
  const fallbackImage = 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg';

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
            backgroundImage: "url('https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-[150px] font-bold leading-none tracking-tight mb-8">
            CAMBODIA
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            Discover the Kingdom of Wonder with magnificent Angkor Wat and Khmer heritage.
          </p>
          <Button 
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
            onClick={() => openModal({
              packageName: "Cambodia Travel Package",
              packageType: "South East Asia Adventure",
              destination: "Cambodia"
            })}
          >
            Enquire Now
          </Button>
        </div>
      </div>

      {/* Packages Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover Cambodia</h2>
          <p className="text-gray-600 text-lg">
            From Angkor Wat to Phnom Penh, experience Cambodia's ancient wonders.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No packages found for Cambodia. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <Link href={`/packages/${pkg.slug || pkg.p_slug || pkg.id}`}>
                  <div className="relative h-48 w-full">
                    <Image
                      src={pkg.p_image || fallbackImage}
                      alt={pkg.p_name}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      {pkg.is_top_selling && (
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.p_name}</h3>
                    <p className="text-gray-600 mb-4">{cleanContent(pkg.p_content)}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>{pkg.p_duration || 'Custom Duration'}</span>
                      {pkg.p_cities && (
                        <>
                          <span>•</span>
                          <MapPin className="h-4 w-4" />
                          <span>{pkg.p_cities.split(',').length} Cities</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-[#002147]">
                          {extractPrice(pkg.p_content)}
                        </p>
                        {pkg.p_savings && (
                          <p className="text-sm text-green-600">
                            Save {pkg.p_savings}
                          </p>
                        )}
                      </div>
                      <Button 
                        className="bg-[#002147] hover:bg-[#001a36]"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openModal({
                            packageName: pkg.p_name,
                            packageType: "Cambodia Package",
                            destination: "Cambodia"
                          });
                        }}
                      >
                        Enquire Now
                      </Button>
                    </div>

                    {pkg.p_seats_left && (
                      <div className="mt-4 text-sm text-gray-500">
                        <p>Only {pkg.p_seats_left} seats left</p>
                      </div>
                    )}
                  </div>
                </Link>
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