"use client"

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Calendar, MapPin, Loader2, Shield, Clock, ThumbsUp, CreditCard, Facebook, Instagram, Twitter, Linkedin, Youtube, Music } from "lucide-react"
import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"
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
  day_night?: string;
  is_halal_friendly?: boolean;
  is_top_selling?: boolean;
  inclusions?: string;
  package_currency?: string;
  price?: number;
}

export default function MontenegroPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('http://localhost:3003/destination/south-east-europe/montenegro');
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

  // Helper function to extract or calculate price
  const extractPrice = (pkg: Package): number => {
    if (pkg.price && pkg.price > 0) return pkg.price;
    const content = pkg.p_content || '';
    const pricePatterns = [/\$\s*(\d+(?:,\d{3})*)/, /S\$\s*(\d+(?:,\d{3})*)/, /SGD\s*(\d+(?:,\d{3})*)/, /(\d+(?:,\d{3})*)\s*SGD/i];
    for (const pattern of pricePatterns) {
      const match = content.match(pattern);
      if (match) return parseInt(match[1].replace(/,/g, ''));
    }
    if (pkg.inclusions) {
      for (const pattern of pricePatterns) {
        const match = pkg.inclusions.match(pattern);
        if (match) return parseInt(match[1].replace(/,/g, ''));
      }
    }
    const durationStr = pkg.p_duration || pkg.day_night || '';
    const dayMatch = durationStr.match(/(\d+)\s*D/);
    const days = dayMatch ? parseInt(dayMatch[1]) : 4;
    const basePrice = days * 300 + (parseInt(pkg.id) % 2000) + 2000;
    return basePrice;
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
            MONTENEGRO
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            Discover the wild beauty of Montenegro with dramatic mountains and Adriatic coast.
          </p>
          <Button 
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
            onClick={() => openModal({
              packageName: "Montenegro Travel Package",
              packageType: "South East Europe Adventure",
              destination: "Montenegro"
            })}
          >
            Enquire Now
          </Button>
        </div>
      </div>

      {/* Packages Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover Montenegro</h2>
          <p className="text-gray-600 text-lg">
            From Kotor's medieval walls to Durmitor's peaks, explore Montenegro's wild beauty.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No packages found for Montenegro. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl group">
                <Link href={`/packages/${pkg.slug || pkg.p_slug || pkg.id}`} className="block">
                  <div className="relative h-56 overflow-hidden">
                    <Image src={pkg.p_image || fallbackImage} alt={pkg.p_name} width={400} height={224} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      {pkg.is_top_selling && (<span className="bg-red-500 text-white px-4 py-1.5 rounded text-sm font-semibold">Top Selling</span>)}
                      <button className="bg-white p-2 rounded-full hover:bg-gray-100 transition-all" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        <Heart className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                    <h3 className="absolute bottom-6 left-4 text-3xl font-bold text-white drop-shadow-lg pr-4">{pkg.p_name}</h3>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-base text-gray-700"><Calendar className="w-5 h-5" /><span className="font-medium">{pkg.day_night || pkg.p_duration || '4D | 3N'}</span></div>
                      {pkg.p_cities && (<div className="flex items-center gap-1.5 text-base text-gray-700"><MapPin className="w-5 h-5" /><span className="font-medium">{pkg.p_cities.split(',').length} Cities</span></div>)}
                      <span className="bg-green-600 text-white text-sm px-3 py-1.5 rounded font-semibold">Halal Friendly</span>
                    </div>
                    {pkg.p_seats_left && (<div className="mb-4"><span className="inline-block bg-blue-500 text-white text-base px-4 py-2 rounded font-semibold">{pkg.p_seats_left} Seats Left</span></div>)}
                    <p className="text-gray-600 text-base mb-5 line-clamp-2">{cleanContent(pkg.p_content)}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">From</span>
                        <div className="flex items-baseline gap-1 mb-1"><span className="text-4xl font-bold text-gray-900">S${extractPrice(pkg).toLocaleString()}</span></div>
                        {pkg.p_savings && (<span className="text-base text-green-600 font-medium">You save {pkg.p_savings}</span>)}
                      </div>
                      <Link href={`/packages/booking/${pkg.id}`} onClick={(e) => e.stopPropagation()}>
                        <Button className="bg-[#001f3f] hover:bg-[#001a36] text-white px-8 py-3 rounded-lg text-base font-semibold transition-all">Book Now</Button>
                      </Link>
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
      <section className="py-20 bg-[#002147] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Book with Us?</h2>
            <p className="text-lg text-gray-300">Experience hassle-free travel planning with our comprehensive services and dedicated support.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 rounded-lg p-8 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6"><Shield className="w-8 h-8" /></div>
              <h3 className="text-xl font-semibold mb-4">Best Price Guarantee</h3>
              <p className="text-gray-300">Find a lower price? We&apos;ll match it and give you an extra 10% off.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-8 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6"><Clock className="w-8 h-8" /></div>
              <h3 className="text-xl font-semibold mb-4">24/7 Support</h3>
              <p className="text-gray-300">Our travel experts are here to help you anytime, anywhere.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-8 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6"><ThumbsUp className="w-8 h-8" /></div>
              <h3 className="text-xl font-semibold mb-4">Trusted by Thousands</h3>
              <p className="text-gray-300">Join thousands of satisfied travelers who have booked with us.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-8 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6"><CreditCard className="w-8 h-8" /></div>
              <h3 className="text-xl font-semibold mb-4">Secure Payment</h3>
              <p className="text-gray-300">Your payment information is always safe and secure with us.</p>
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
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
            <div>
              <h3 className="text-[#D4AF37] font-semibold mb-6">General</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/visa" className="text-gray-300 hover:text-white transition-colors">Visa</Link></li>
                <li><Link href="/csr" className="text-gray-300 hover:text-white transition-colors">Corporate Social Responsibility</Link></li>
                <li><Link href="/testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[#D4AF37] font-semibold mb-6">Get In Touch</h3>
              <div className="space-y-3 mb-6">
                <p className="text-gray-300">info@fayyaztravels.com</p>
                <p className="text-gray-300">(+65) 6235 2900</p>
              </div>
              <div>
                <p className="text-gray-300 mb-3">Find us on</p>
                <div className="flex gap-4">
                  <Link href="#" className="text-gray-300 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></Link>
                  <Link href="#" className="text-gray-300 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></Link>
                  <Link href="#" className="text-gray-300 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></Link>
                  <Link href="#" className="text-gray-300 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></Link>
                  <Link href="#" className="text-gray-300 hover:text-white transition-colors"><Youtube className="w-5 h-5" /></Link>
                  <Link href="#" className="text-gray-300 hover:text-white transition-colors"><Music className="w-5 h-5" /></Link>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-[#D4AF37] font-semibold mb-6">COVID Policies</h3>
              <ul className="space-y-3">
                <li><Link href="/travel-advice/singapore" className="text-gray-300 hover:text-white transition-colors">Singapore Gov't Travel Advice</Link></li>
                <li><Link href="/travel-advice/uae" className="text-gray-300 hover:text-white transition-colors">UAE Travel Advice</Link></li>
                <li><Link href="/travel-advice/uk" className="text-gray-300 hover:text-white transition-colors">UK Travel Advice</Link></li>
                <li><Link href="/travel-advice/us" className="text-gray-300 hover:text-white transition-colors">US Travel Advice</Link></li>
              </ul>
              <div className="mt-8">
                <Image src="/fayyaz-logo.png" alt="Fayyaz Travels" width={120} height={40} className="brightness-0 invert" />
              </div>
            </div>
          </div>
        </div>
      </footer>

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