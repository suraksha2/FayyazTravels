"use client"

import { Button } from "@/components/ui/button"
import { Building2, Fuel, LandPlot, ArrowRight, Clock, Wallet, ScrollText } from "lucide-react"
import CorporateEnquiryForm from "@/components/CorporateEnquiryForm"
import Footer from "@/components/Footer"

export default function CorporatePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen flex flex-col items-center justify-center text-white text-center px-4 bg-[#002147]">
        <p className="text-2xl mb-4">Welcome to</p>
        <h1 className="text-6xl font-bold mb-4">
          Fayyaz Corporate
        </h1>
        <p className="text-xl mb-8 max-w-2xl">
          Your Trusted Partner for Corporate Travel Solutions
        </p>
        <Button 
          className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white text-lg px-8 py-6"
        >
          Book a free Consultation
        </Button>

        {/* Industry Icons */}
        <div className="absolute bottom-32 w-full max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <span className="text-white">Hospitality</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                <Fuel className="w-8 h-8 text-white" />
              </div>
              <span className="text-white">Oil and Gas</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                <LandPlot className="w-8 h-8 text-white" />
              </div>
              <span className="text-white">Financial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tailored for Success Section */}
      <section className="min-h-screen relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/2869215/pexels-photo-2869215.jpeg?auto=compress&cs=tinysrgb&w=1920')"
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4 py-20">
          <h2 className="text-7xl font-light mb-8">
            Tailored for Success
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-12">
            Experience seamless corporate travel with our premium services designed to meet your business needs. From private jets to luxury accommodations, we ensure every journey supports your success.
          </p>
          <Button 
            className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white text-lg px-8 py-6"
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Why Book with Us Section */}
      <section className="py-20 px-4 bg-[#002147]">
        <div className="max-w-7xl mx-auto">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-6">Why Book with Us?</h2>
            <p className="text-lg leading-relaxed mb-8">
              With years of experience in the corporate travel industry, we understand the nuances of business travel and deliver exceptional services every time. Our dedicated team ensures seamless arrangements, competitive rates, and 24/7 support for all your corporate travel needs.
            </p>
            <Button className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white">
              Learn More About Our Services
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[#8B1F41] text-2xl font-bold mb-8 text-center">Services</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Meetings */}
            <div className="group cursor-pointer">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Corporate Meetings"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-semibold text-white">Meetings</h3>
                  <ArrowRight className="w-6 h-6 text-white mt-2 transform group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>

            {/* Incentive */}
            <div className="group cursor-pointer">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/4388167/pexels-photo-4388167.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Incentive Travel"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-semibold text-white">Incentive</h3>
                  <ArrowRight className="w-6 h-6 text-white mt-2 transform group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>

            {/* Events */}
            <div className="group cursor-pointer">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Corporate Events"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-semibold text-white">Events</h3>
                  <ArrowRight className="w-6 h-6 text-white mt-2 transform group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>

            {/* Conferences */}
            <div className="group cursor-pointer">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Corporate Conferences"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-semibold text-white">Conferences</h3>
                  <ArrowRight className="w-6 h-6 text-white mt-2 transform group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exclusive Benefits Section */}
      <section className="py-20 px-4 bg-[#002147]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Exclusive Benefits</h2>
            <p className="text-xl text-gray-300">for Corporate Members</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Exclusive Discounts */}
            <div className="bg-[#001a38] p-8 rounded-lg hover:bg-[#001529] transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Exclusive Discounts</h3>
                <Wallet className="w-8 h-8 text-[#C69C3C]" />
              </div>
              <p className="text-gray-300 mb-6">Special corporate rates and exclusive savings on travel bookings</p>
              <Button className="w-full bg-[#C69C3C] hover:bg-[#B38C2C] text-white">
                Get in touch
              </Button>
            </div>

            {/* Tailored Itineraries */}
            <div className="bg-[#001a38] p-8 rounded-lg hover:bg-[#001529] transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Tailored Itineraries</h3>
                <ScrollText className="w-8 h-8 text-[#C69C3C]" />
              </div>
              <p className="text-gray-300 mb-6">Customized travel plans designed around your business needs</p>
              <Button className="w-full bg-[#C69C3C] hover:bg-[#B38C2C] text-white">
                Learn more
              </Button>
            </div>

            {/* 24/7 Support */}
            <div className="bg-[#001a38] p-8 rounded-lg hover:bg-[#001529] transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">24/7 Support</h3>
                <Clock className="w-8 h-8 text-[#C69C3C]" />
              </div>
              <p className="text-gray-300 mb-6">Round-the-clock assistance for all your travel requirements</p>
              <Button className="w-full bg-[#C69C3C] hover:bg-[#B38C2C] text-white">
                Contact us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Enquiry Form Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#002147] mb-6">Request a Corporate Travel Quote</h2>
            <p className="text-lg text-gray-700">
              Tell us about your corporate travel needs and we'll create a customized solution for your business.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <CorporateEnquiryForm />
          </div>
        </div>
      </section>

      {/* Let's Get Started Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#002147] mb-6">Let's Get Started</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            Ready to elevate your corporate travel experience? Contact us today to learn how Fayyaz Corporate can streamline your meetings, incentive programs, conferences, and events—while offering your employees unmatched benefits for their leisure travel needs.
          </p>
          <Button 
            className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white text-lg px-8 py-6"
          >
            Book a free Consultation
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}