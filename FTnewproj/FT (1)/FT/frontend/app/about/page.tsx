"use client"

import { useState } from "react"
import { Plane, Globe, FileText, Calendar, Briefcase, Users, Ship, Utensils, Church, HeadphonesIcon, Phone, Mail, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import FeaturedInSection from "@/components/FeaturedInSection"
import NewsletterSection from "@/components/NewsletterSection"
import Footer from "@/components/Footer"

const services = [
  { icon: Plane, title: "Inbound / Outbound Tourism" },
  { icon: Globe, title: "Overseas / Local Accommodation" },
  { icon: FileText, title: "Worldwide Flight Ticketing" },
  { icon: Briefcase, title: "Customized Itinerary Planning" },
  { icon: Calendar, title: "Visa Services" },
  { icon: Users, title: "Car Rentals" },
  { icon: Ship, title: "Event Management" },
  { icon: Utensils, title: "Luxury Travel Services" },
  { icon: Briefcase, title: "Corporate Travel Packages" },
  { icon: Ship, title: "Rail / Cruise Transfers" },
  { icon: Plane, title: "Private Jets" },
  { icon: Utensils, title: "Special Meals" },
  { icon: Church, title: "Religious Tours" },
  { icon: HeadphonesIcon, title: "24/7 Support" }
]

const testimonials = [
  {
    name: "Ser Khim",
    text: "We thoroughly enjoyed this fantastic trip your team has helped to arrange. Thank you everyone for the amazing trip. We love it so much."
  },
  {
    name: "Ashvini Ganeson",
    text: "Hi Dean, We had a really wonderful time in Italy. Thank you for planning the itinerary and assisting us along the way and making this trip possible."
  },
  {
    name: "Subra",
    text: "Hi Ms. Jewelyn, me and my family had settled down at the hotel safely last night. We are pleased with the arrangements. The hotel room is nice."
  },
  {
    name: "Edny Hammervold",
    text: "The tour to Hanoi and Halong Bay went well. Everything was excellent."
  },
  {
    name: "Rafid",
    text: "Thanks for all the arrangement. We had an enjoyable time there. The guide is also very friendly. I may be engaging your side again for the June holiday."
  },
  {
    name: "Karin Graubard-Reiter",
    text: "Thank you Maria. We had a nice time. The hotel was great for kids and we got a quiet room. The transports worked perfectly. Everything was as expected. Many thanks."
  },
  {
    name: "Sree G.",
    text: "Just wanna say a huge thank you for all the arrangements you did for our honeymoon! We had an awesome time and was very happy with all the services and hotels we went to! I have already recommended your company to many of my friends! Thank you so much!"
  },
  {
    name: "Sander",
    text: "We had a great break and everything worked as planned and hoped for. Thanks for your help. Will certainly seek your services next time."
  },
  {
    name: "Yathunanthan K.",
    text: "It was nice trip and well organised, we have enjoyed every minute/moment there. Even the hotel staff also very friendly and helpful. Thanks a lot for your arrangements and kind support always."
  },
  {
    name: "Sitiaidahton Osman",
    text: "I really appreciate Fayyaz Travels prompt and fast response in dealing with all my inquiries and requests. Your service is truly commendable. I will definitely use and recommend your services to my colleagues and contacts."
  },
  {
    name: "Yoges",
    text: "On behalf of my mother and myself, I would like to thank you for organising the trip. It was a great trip n we enjoyed ourselves v much. The tour guide Narin and driver were very nice and considerate. Once again, would like to thank you for organising a memorable trip to Cambodia."
  },
  {
    name: "Jannah",
    text: "Thank you for your great service for our recent Bangkok trip. This is the second time we travel with Fayyaz Travels after our Australia trip in May. Hence we felt Maria has truly understand our requirement. We look forward traveling with Fayyaz Travels in future!"
  },
  {
    name: "Ivy Goh",
    text: "The itinerary and booking went perfectly thanks to your help. We had a great time and we thank you Maria and Fayyaz Travel for everything. Thank you very much for your patience and prompt replies to our uncertainties and queries."
  },
  {
    name: "Doris Yee",
    text: "We enjoyed our Perth trip very much! Everything was great, very well planned and arranged! We were so glad with our late night farmstay which really wrapped up our trip beautifully. Thank you again for your arrangement."
  },
  {
    name: "Suryani",
    text: "Thank you for your patience in making the last minute changes for me. It really helps! Have a great day"
  },
  {
    name: "Susana",
    text: "We had a fantastic time in Laos, especially in Luang Prabang. Our guide Phet was great. He was very knowledgeable and was very friendly with kids. All the excursions and boat trips were wonderful."
  },
  {
    name: "Janath Beevi",
    text: "Really enjoyed the one day package tour as we had a wonderful driver to keep us company on the trips around the whole day. Thank you very much Maria for keeping in touch with me and checking on the status each day. Looking forward to schedule more trips with you!"
  },
  {
    name: "Julie Frankel",
    text: "Thank you so much for the wonderful arrangements & suggestions you made on our behalf!! All the flights went smoothly, and we loved both the Moon Boutique Hotel & Maison Dalabua."
  },
  {
    name: "Clare Long",
    text: "We have just returned from Vietnam. We had a fantastic time and would really recommend the Hotel. Thank you to Fayyaz Travels for organising our trip. As always everything ran smoothly and we had a great time!"
  },
  {
    name: "Rooney",
    text: "It was an awesome experience. Everything was organised well."
  },
  {
    name: "Janna",
    text: "We love Bali!!!! Thank you very much for your kind assistance and we look forward to travelling with Fayyaz Travels again."
  },
  {
    name: "Ingrid",
    text: "We very much enjoyed our trip to Myanmar from Fayyaz Travels!! The hotels were fantastic, the itinerary was great, and we had a good combination of sightseeing and relaxing."
  },
  {
    name: "Elizabeth Asselin",
    text: "We are back from Vietnam. Very nice trip that we really enjoyed. We really enjoyed it."
  },
  {
    name: "Lynndi Peters",
    text: "The trip was really good! The tour guide, Narim, was very good and a great host. The hotel was very very lovely & the food, atmosphere & service were really good."
  },
  {
    name: "Nicky Kay",
    text: "We had a great trip to China and all the arrangements went very smoothly. Both guides were fantastic especially the first one Sherry in Beijing. Thank you for a great trip. You will see us again!"
  },
  {
    name: "Muhammad Yousri",
    text: "We just got back from our trip to New Zealand and are very happy with your arrangements and your service. The hotels and car choice was excellent."
  },
  {
    name: "Burhanudin Bin Buang",
    text: "On behalf of my family, I would like to thank you for helping us in the crafting of the NZ holiday package. We enjoyed ourselves tremendously during this trip, one of the best holidays ever."
  },
  {
    name: "Shoaib Nasir",
    text: "Amazing and efficient service."
  },
  {
    name: "Meeta Rajput",
    text: "Awesome service and very responsive team."
  },
  {
    name: "Kapil Khanna",
    text: "Go to for bespoke travels. Very good for luxury travel."
  },
  {
    name: "Areeba Jalees",
    text: "Very professional, great value for money!"
  },
  {
    name: "Anuj",
    text: "Professional and helpful people. Respond timely and price wisely."
  },
  {
    name: "Alisha Kumar",
    text: "Fayyaz Travels helped organise my holiday with fantastic service"
  },
  {
    name: "Inncelerator",
    text: "Great Service for corporate flight ticketing."
  },
  {
    name: "Mike Jones",
    text: "Brilliant Service, took care of every little detail. Will definitely use them again. Highly Recommended."
  },
  {
    name: "Ali Awan",
    text: "Great responsive service provided. Very accommodating to different preferences and my travel went very smoothly thanks to them"
  },
  {
    name: "Adeel Azad",
    text: "Very good service. Khyzer is very attentive and a responsive person. I can easily recommend Fayyaz Travels"
  }
]

export default function AboutPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [showAllTestimonials, setShowAllTestimonials] = useState(false)

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }
  return (
    <main className="bg-white">
      {/* Hero Banner Section */}
      <section className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=1920')"
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
              Creating Memories<br />
              Worldwide, with<br />
              Fayyaz Travels
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm md:text-base text-gray-600 uppercase tracking-wide">
                  LUXURY TRAVEL & TOUR AGENCY IN SINGAPORE
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Dedicated Service,<br />
                  Tailored For You.
                </h1>
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p className="italic text-sm md:text-base">
                  Founded on our own love for travel, Fayyaz Travels continues to welcome travelers convinced by wanderlust to their family, keeping that streak of passion burning bright.
                </p>

                <p className="text-sm md:text-base">
                  Each traveler has his/her own ideal version of a trip and at Fayyaz Travels, we understand the importance of that. We devote our time to talk to you to fully grasp what type of adventures you like and what you have envisioned and then go to great lengths to make your idyllic trips happen.
                </p>

                <p className="text-sm md:text-base">
                  We pride ourselves on being able to custom itineraries in affordable prices and according to individual preferences of our clients. We cater to varying requests ranging from vegetarian/halal meals and our personal gourmet chef's to walking on the red carpet at the Cannes film festival and private island holidays. In short, no request is too big and our consultants will ensure your likes and histories are incorporated into your itinerary, so that each trip is unique and an extension of you!
                </p>

                <p className="text-sm md:text-base">
                  Above all, our consultants are dedicated to making sure that our clients have the most memorable experiences during their travel and are on call 24/7 to ensure smooth functioning of all aspects.
                </p>

                <p className="text-sm md:text-base font-medium">
                  Go on then, give us a ring and get ready to go on adventures of your lifetime.
                </p>
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button className="bg-[#002147] hover:bg-[#001a38] text-white px-8 py-6 text-base">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Us
                </Button>
                <Button variant="outline" className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white px-8 py-6 text-base">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Us
                </Button>
              </div>
            </div>

            {/* Right Column - Services */}
            <div className="bg-[#002147] text-white rounded-2xl p-6 md:p-8 lg:p-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">OUR SERVICES</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {services.map((service, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <service.icon className="w-5 h-5 md:w-6 md:h-6 text-[#C69C3C]" />
                    </div>
                    <span className="text-sm md:text-base leading-tight">{service.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-12 md:py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Vision Card */}
            <div className="group relative bg-white rounded-2xl p-8 md:p-12 shadow-lg hover:shadow-2xl transition-all duration-700 ease-in-out overflow-hidden min-h-[400px] flex items-center">
              <div className="flex flex-col items-center text-center w-full">
                {/* Vision Icon - Hidden on hover */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 mb-6 opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-75 group-hover:h-0 group-hover:mb-0 transition-all duration-700 ease-in-out overflow-hidden">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Outer gold arc */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#C69C3C"
                      strokeWidth="8"
                      strokeDasharray="440"
                      strokeDashoffset="110"
                      className="transform -rotate-90 origin-center"
                    />
                    {/* Middle gray circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="60"
                      fill="none"
                      stroke="#4B5563"
                      strokeWidth="6"
                    />
                    {/* Inner white circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="40"
                      fill="white"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                    />
                    {/* Center gold dot */}
                    <circle
                      cx="100"
                      cy="100"
                      r="15"
                      fill="#C69C3C"
                    />
                  </svg>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 transition-all duration-700 ease-in-out">Vision</h3>
                <p className="text-sm md:text-base text-gray-600 italic mb-4 transition-all duration-700 ease-in-out">
                  To achieve excellence in the travel industry
                </p>

                {/* Expanded content on hover */}
                <div className="max-h-0 opacity-0 group-hover:max-h-[500px] group-hover:opacity-100 transition-all duration-700 ease-in-out overflow-hidden">
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-4">
                    Fayyaz Travels is committed to be at the top of the pack in meeting your travel needs and to be recognised as the leading tech travel company globally. In order to sustain our position in the market, Fayyaz Travels is dedicated in maintaining our focus on superior product knowledge and fostering a long-term relationship with our customers through quality training and outstanding customer support, thus empowering us to elevate our position in the travel industry.
                  </p>
                </div>
              </div>
            </div>

            {/* Mission Card */}
            <div className="group relative bg-white rounded-2xl p-8 md:p-12 shadow-lg hover:shadow-2xl transition-all duration-700 ease-in-out overflow-hidden min-h-[400px] flex items-center">
              <div className="flex flex-col items-center text-center w-full">
                {/* Mission Icon - Hidden on hover */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 mb-6 opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-75 group-hover:h-0 group-hover:mb-0 transition-all duration-700 ease-in-out overflow-hidden">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Crosshair lines */}
                    <line x1="100" y1="20" x2="100" y2="80" stroke="#4B5563" strokeWidth="6" />
                    <line x1="100" y1="120" x2="100" y2="180" stroke="#4B5563" strokeWidth="6" />
                    <line x1="20" y1="100" x2="80" y2="100" stroke="#4B5563" strokeWidth="6" />
                    <line x1="120" y1="100" x2="180" y2="100" stroke="#4B5563" strokeWidth="6" />
                    
                    {/* Outer gray circle with gaps */}
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="none"
                      stroke="#4B5563"
                      strokeWidth="6"
                      strokeDasharray="40 15"
                    />
                    
                    {/* Gold arc segments */}
                    <circle
                      cx="100"
                      cy="100"
                      r="55"
                      fill="none"
                      stroke="#C69C3C"
                      strokeWidth="8"
                      strokeDasharray="80 90"
                      className="transform -rotate-45 origin-center"
                    />
                    
                    {/* Center circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="20"
                      fill="white"
                      stroke="#4B5563"
                      strokeWidth="6"
                    />
                  </svg>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 transition-all duration-700 ease-in-out">Mission</h3>
                <p className="text-sm md:text-base text-gray-600 italic mb-4 transition-all duration-700 ease-in-out">
                  To create memories worldwide for our clients
                </p>

                {/* Expanded content on hover */}
                <div className="max-h-0 opacity-0 group-hover:max-h-[500px] group-hover:opacity-100 transition-all duration-700 ease-in-out overflow-hidden">
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-4">
                    At Fayyaz Travels our mission is to give our clients the complete personalised travel experience whilst creating memories worldwide. We aim to cater to every client by delivering value-added services through our vast array of services, whether it be through Inbound/Outbound Tourism, Airline Tickets, Visa Services, Incentive Packages, Private Jets, Hotels/ Accommodation, Event Management, Cruises, Luxury Resorts or Car Rentals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Testimonials
          </h2>

          {!showAllTestimonials ? (
            <>
              {/* Carousel View */}
              <div className="relative max-w-5xl mx-auto">
                {/* Testimonial Card */}
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg min-h-[200px] flex flex-col items-center justify-center text-center">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                    {testimonials[currentTestimonial].name}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-3xl">
                    {testimonials[currentTestimonial].text}
                  </p>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevTestimonial}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-[#002147] transition-colors" />
                </button>

                <button
                  onClick={nextTestimonial}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-[#002147] transition-colors" />
                </button>
              </div>

              {/* See All Testimonials Button */}
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={() => setShowAllTestimonials(true)}
                  className="bg-[#002147] hover:bg-[#001a38] text-white px-8 py-6 text-base rounded-full"
                >
                  SEE ALL TESTIMONIALS
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Grid View - All Testimonials */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-xl p-6"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {testimonial.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Show Less Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={() => setShowAllTestimonials(false)}
                  className="bg-[#002147] hover:bg-[#001a38] text-white px-8 py-6 text-base rounded-full"
                >
                  SHOW LESS
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Fayyaz Luxury & Corporate Banners - Side by Side */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        {/* Fayyaz Luxury Banner */}
        <div className="relative h-[300px] md:h-[400px] overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 grid grid-cols-2">
            {/* Left Image - Yacht */}
            <div 
              className="relative bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110"
              style={{
                backgroundImage: "url('https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=1200')"
              }}
            >
              <div className="absolute inset-0 bg-black/40 transition-all duration-700 group-hover:bg-black/20" />
            </div>
            
            {/* Right Image - Conference Room */}
            <div 
              className="relative bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110"
              style={{
                backgroundImage: "url('https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200')"
              }}
            >
              <div className="absolute inset-0 bg-black/40 transition-all duration-700 group-hover:bg-black/20" />
            </div>
          </div>

          {/* Content Overlay */}
          <div className="relative h-full flex items-center justify-start px-6 md:px-8 lg:px-12">
            <div className="text-white z-10 transform transition-all duration-500 group-hover:translate-x-2">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 transition-all duration-500 group-hover:text-[#C69C3C]">
                FAYYAZ<br />LUXURY
              </h2>
              <Button className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white px-6 py-4 md:px-8 md:py-6 text-sm md:text-base font-semibold transform transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl">
                VISIT
              </Button>
            </div>
          </div>
        </div>

        {/* Fayyaz Corporate Banner */}
        <div className="relative h-[300px] md:h-[400px] overflow-hidden group cursor-pointer">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110"
            style={{
              backgroundImage: "url('https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200')"
            }}
          >
            <div className="absolute inset-0 bg-black/50 transition-all duration-700 group-hover:bg-black/30" />
          </div>

          {/* Content Overlay */}
          <div className="relative h-full flex items-center justify-start px-6 md:px-8 lg:px-12">
            <div className="text-white z-10 transform transition-all duration-500 group-hover:translate-x-2">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 transition-all duration-500 group-hover:text-[#C69C3C]">
                FAYYAZ<br />CORPORATE
              </h2>
              <Button className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white px-6 py-4 md:px-8 md:py-6 text-sm md:text-base font-semibold transform transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl">
                VISIT
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured In Section */}
      <FeaturedInSection />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Footer */}
      <Footer />
    </main>
  )
}