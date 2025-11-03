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
  day_night?: string;
  is_halal_friendly?: boolean;
  is_top_selling?: boolean;
}

export default function MauritiusPackagesPage() {
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('http://localhost:3003/destination/africa/africa-mauritius');
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
    const priceMatch = content.match(/\$[\d,]+|\d+\s*SGD|SGD\s*\d+/i);
    return priceMatch ? priceMatch[0] : 'Contact for Price';
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
            backgroundImage: "url('https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-[150px] font-bold leading-none tracking-tight mb-8">
            MAURITIUS
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            Experience paradise with pristine beaches, luxury resorts, and vibrant culture.
          </p>
          <Button 
            onClick={() => openModal({
              packageName: "Mauritius Safari Packages",
              packageType: "Country Specific",
              destination: "Mauritius"
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover Mauritius</h2>
          <p className="text-gray-600 text-lg">
            From pristine beaches to luxury resorts, explore our curated Mauritius packages.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No packages found</h3>
            <p className="text-gray-600">We're currently updating our Mauritius packages. Please check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <Link 
                key={pkg.id} 
                href={`/packages/${pkg.p_slug}`}
                className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer block"
              >
                <div className="relative">
                  <Image 
                    src={pkg.p_image ? `http://localhost:3003/${pkg.p_image}` : 'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg'} 
                    alt={pkg.p_name}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="bg-red-600 text-white px-2 py-1 rounded-full text-sm font-medium">
                      Mauritius
                    </span>
                    <button className="bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-all duration-300 hover:scale-110">
                      <Heart className="w-5 h-5 text-gray-700 transition-colors hover:text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      <Calendar className="w-4 h-4" />
                      {pkg.day_night || 'Multi-day'}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      <MapPin className="w-4 h-4" />
                      Mauritius
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-2 hover:text-[#002147] transition-colors">{pkg.p_name}</h3>
                  <p className="text-gray-600 text-sm mb-4 hover:text-gray-900 transition-colors">
                    {pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'No description available'}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm text-gray-500">From</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold hover:text-[#002147] transition-colors">
                          {extractPrice(pkg.p_content || '')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button className="bg-[#002147] hover:bg-[#001a36]">
                    View Details
                  </Button>
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
