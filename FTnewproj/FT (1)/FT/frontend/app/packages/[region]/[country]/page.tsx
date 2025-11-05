"use client"

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Calendar, MapPin, Loader2 } from "lucide-react"
import Link from 'next/link';
import { useParams } from 'next/navigation';
import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"
import { getCountryBySlug, type CountryConfig } from "@/lib/regions-config"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3003'

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
}

export default function DynamicCountryPage() {
  const params = useParams()
  const regionSlug = params.region as string
  const countrySlug = params.country as string
  
  const [countryConfig, setCountryConfig] = useState<CountryConfig | null>(null)
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    // Try to get country configuration from static config first
    let config = getCountryBySlug(regionSlug, countrySlug)
    
    // If not found in static config, create dynamic config
    if (!config) {
      const countryName = countrySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      config = {
        name: countryName,
        slug: countrySlug,
        apiEndpoint: `/packages?country=${countryName}`,
        heroImage: `https://images.pexels.com/photos/${3408354 + Math.floor(Math.random() * 1000)}/pexels-photo-${3408354 + Math.floor(Math.random() * 1000)}.jpeg`,
        description: `Discover the beauty and culture of ${countryName}.`
      };
    }
    
    if (isMounted) {
      setCountryConfig(config)
    }

    // Fetch packages for this country
    const fetchPackages = async () => {
      try {
        // Try to fetch packages by searching for country name in package titles
        const countryName = config.name;
        const response = await fetch(`${API_BASE}/packages`, {
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        
        const data = await response.json();
        const allPackages = data.packages || data;
        
        // Filter packages that contain the country name
        const filteredPackages = allPackages.filter((pkg: any) => 
          pkg.title?.toLowerCase().includes(countryName.toLowerCase()) ||
          pkg.p_name?.toLowerCase().includes(countryName.toLowerCase())
        );
        
        if (isMounted) {
          setPackages(filteredPackages);
        }
      } catch (err) {
        if (isMounted && (err as any)?.name !== 'AbortError') {
          console.error('Error fetching packages:', err);
          setError('Failed to load packages. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPackages();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [regionSlug, countrySlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#002147]" />
      </div>
    );
  }

  if (!countryConfig || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Country Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The country you're looking for doesn't exist."}
          </p>
          <Link href="/packages">
            <Button>Back to Packages</Button>
          </Link>
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
          style={{ backgroundImage: `url('${countryConfig.heroImage}')` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-[150px] font-bold leading-none tracking-tight mb-8 uppercase">
            {countryConfig.name}
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            {countryConfig.description}
          </p>
          <Button 
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
            onClick={() => openModal({
              packageName: `${countryConfig.name} Travel Package`,
              packageType: `${regionSlug.charAt(0).toUpperCase() + regionSlug.slice(1)} Adventure`,
              destination: countryConfig.name
            })}
          >
            Enquire Now
          </Button>
        </div>
      </div>

      {/* Packages Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover {countryConfig.name}</h2>
          <p className="text-gray-600 text-lg">
            {countryConfig.description}
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No packages found</h3>
            <p className="text-gray-600">We're currently updating our {countryConfig.name} packages. Please check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl group cursor-pointer"
                onClick={() => window.location.href = `/package-detail/${pkg.slug}`}
              >
                {/* Image Section with Overlay Title */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={pkg.image || countryConfig.heroImage} 
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
                    <button 
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-110"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                          {pkg.currency === 'S' ? 'S' : pkg.currency} ${pkg.price?.toLocaleString()}
                        </span>
                      </div>
                      {pkg.savings > 0 && (
                        <span className="text-xs text-green-600 font-medium">You save {pkg.currency === 'S' ? 'S' : pkg.currency} ${pkg.savings?.toLocaleString()}</span>
                      )}
                    </div>
                    <Link 
                      href={`/packages/booking/${pkg.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button className="bg-[#002147] hover:bg-[#001a38] text-white px-10 py-4 rounded-lg text-lg font-bold transition-all duration-300 hover:shadow-lg">
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
              Unlock Exclusive access to upcoming packages and early bird discounts.
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
