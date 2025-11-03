"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {  Heart, Calendar, MapPin, Shield, Clock, ThumbsUp, CreditCard, Facebook, Instagram, Twitter, Linkedin, Youtube, Music} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"


import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"
interface Package {
  id: number
  p_name: string
  p_slug: string
  day_night: string
  feature_img: string
  p_content: string
  package_currency: string
  desti_list: string
  inclusions: string
  exclusions: string
  is_publish: number
  status: number
}


export default function UzbekistanGroupTourPage() {
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('http://localhost:3003/packages/group-tours/uzbekistan-group-tour')
        if (!response.ok) {
          throw new Error('Failed to fetch packages')
        }
        const data = await response.json()
        setPackages(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  // Helper function to extract price from content
  const extractPrice = (content: string): number => {
    const priceMatch = content.match(/\$(\d+)/);
    return priceMatch ? parseInt(priceMatch[1]) : 4999;
  }

  // Helper function to clean HTML content
  const cleanContent = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#002147]"></div>
          <p className="mt-4 text-gray-600">Loading Uzbekistan packages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
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
          <h1 className="text-[100px] font-bold leading-none tracking-tight mb-8">
            UZBEKISTAN GROUP TOUR
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-8">
            Discover the ancient Silk Road cities and rich heritage of Uzbekistan with our expert guides.
          </p>
          <Button 
            onClick={() => openModal({
              packageName: "Uzbekistan Group Tour Travel Packages",
              packageType: "Group Tour Package",
              destination: "Uzbekistan Group Tour"
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Uzbekistan Group Tours</h2>
          <p className="text-gray-600 text-lg">
            Experience the wonders of the Silk Road with fellow travelers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg: Package) => (
            <div key={pkg.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <Link href={`/packages/${pkg.p_slug}`} className="block">
              <div className="relative">
                <img 
                  src={pkg.feature_img ? `http://localhost:3003/${pkg.feature_img}` : 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg'} 
                  alt={pkg.p_name}
                  className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                    Group Tour
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
                    {pkg.day_night || 'Multiple Days'}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <MapPin className="w-4 h-4" />
                    Central Asia
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded hover:bg-green-200 transition-colors">
                    Halal Friendly
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-2 hover:text-[#002147] transition-colors">{pkg.p_name}</h3>
                <p className="text-gray-600 text-sm mb-4 hover:text-gray-900 transition-colors">{cleanContent(pkg.p_content)}</p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm text-gray-500">From</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold hover:text-[#002147] transition-colors">{pkg.package_currency}${extractPrice(pkg.p_content)}</span>
                      <span className="text-green-600 text-sm hover:text-green-700 transition-colors">Best Price</span>
                    </div>
                  </div>
                  <span className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                    Available
                  </span>
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
                    href={`/packages/${pkg.p_slug}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
              </Link>
            </div>
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
                        <footer className="bg-black text-white py-16">
                                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
                                  {/* General Section */}
                                  <div>
                                    <h3 className="text-[#C69C3C] font-semibold mb-6">General</h3>
                                    <ul className="space-y-3">
                                      <li><Link href="/about" className="hover:text-gray-300 transition">About Us</Link></li>
                                      <li><Link href="/contact" className="hover:text-gray-300 transition">Contact Us</Link></li>
                                      <li><Link href="/visa" className="hover:text-gray-300 transition">Visa</Link></li>
                                      <li><Link href="/csr" className="hover:text-gray-300 transition">Corporate Social Responsibility</Link></li>
                                      <li><Link href="/testimonials" className="hover:text-gray-300 transition">Testimonials</Link></li>
                                    </ul>
                                  </div>
                        
                                  {/* Contact Section */}
                                  <div>
                                    <h3 className="text-[#C69C3C] font-semibold mb-6">Get In Touch</h3>
                                    <ul className="space-y-3">
                                      <li>
                                        <a href="mailto:info@fayyaztravels.com" className="hover:text-gray-300 transition">
                                          info@fayyaztravels.com
                                        </a>
                                      </li>
                                      <li>
                                        <a href="tel:+6562352900" className="hover:text-gray-300 transition">
                                          (+65) 6235 2900
                                        </a>
                                      </li>
                                    </ul>
                        
                                    <h3 className="text-[#C69C3C] font-semibold mt-8 mb-4">Find us on</h3>
                                    <div className="flex space-x-4">
                                      <Link href="#" className="hover:text-[#C69C3C] transition">
                                        <Facebook className="w-5 h-5" />
                                      </Link>
                                      <Link href="#" className="hover:text-[#C69C3C] transition">
                                        <Instagram className="w-5 h-5" />
                                      </Link>
                                      <Link href="#" className="hover:text-[#C69C3C] transition">
                                        <Twitter className="w-5 h-5" />
                                      </Link>
                                      <Link href="#" className="hover:text-[#C69C3C] transition">
                                        <Linkedin className="w-5 h-5" />
                                      </Link>
                                      <Link href="#" className="hover:text-[#C69C3C] transition">
                                        <Youtube className="w-5 h-5" />
                                      </Link>
                                      <Link href="#" className="hover:text-[#C69C3C] transition">
                                        <Music className="w-5 h-5" />
                                      </Link>
                                    </div>
                                  </div>
                        
                                  {/* COVID Policies Section */}
                                  <div>
                                    <h3 className="text-[#C69C3C] font-semibold mb-6">COVID Policies</h3>
                                    <ul className="space-y-3">
                                      <li><Link href="/covid/singapore" className="hover:text-gray-300 transition">Singapore Gov't Travel Advice</Link></li>
                                      <li><Link href="/covid/uae" className="hover:text-gray-300 transition">UAE Travel Advice</Link></li>
                                      <li><Link href="/covid/uk" className="hover:text-gray-300 transition">UK Travel Advice</Link></li>
                                      <li><Link href="/covid/us" className="hover:text-gray-300 transition">US Travel Advice</Link></li>
                                    </ul>
                        
                                    <div className="mt-12">
                                      <img 
                                        src="https://i.ibb.co/8LSpyb4Y/logo-white-1-2.png" 
                                        alt="Fayyaz Travels Logo" 
                                        className="w-32"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </footer>
    
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