"use client"

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Calendar, MapPin, Loader2 } from "lucide-react"
import Link from 'next/link';
import Image from 'next/image';

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

export default function SwedenPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('http://localhost:3003/destination/sweden');
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        const data = await response.json();
        // Handle both old format (array) and new format (object with packages array)
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
  const fallbackImage = 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg';

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
            backgroundImage: "url('https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full text-center text-white px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Discover Sweden
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-delay">
              From Stockholm's archipelago to Lapland's wilderness, experience Swedish lagom
            </p>
            <Button className="bg-[#002147] hover:bg-[#001a36] text-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 animate-fade-in-delay-2">
              Explore Packages
            </Button>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover Sweden</h2>
          <p className="text-gray-600 text-lg">
            From royal palaces to midnight sun, experience Swedish innovation and nature.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No packages found for Sweden. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg: Package) => (
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
                      <Button className="bg-[#002147] hover:bg-[#001a36]">
                        View Details
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

      {/* Newsletter Section */}
      <section className="py-20 bg-[#8B1F41] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6">
            Sign Up for our Newsletter
          </h2>
          
          <div className="mb-8">
            <p className="text-lg opacity-90">
              Get the latest travel deals and destination guides delivered to your inbox.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70"
            />
            <Button className="bg-white text-[#8B1F41] hover:bg-gray-100 font-semibold px-8">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
