"use client"

import { Globe, Building2, Plane, ClipboardList, FileText, Car, Users, Ship, PlaneTakeoff, UtensilsCrossed, Church, HeadphonesIcon } from 'lucide-react'

export default function ServicesSection() {
  // Define services data matching the image layout
  const services = [
    { icon: Globe, title: 'Inbound / Outbound Tourism', row: 1, col: 1 },
    { icon: Building2, title: 'Overseas / Local Accommodation', row: 1, col: 2 },
    { icon: Plane, title: 'Worldwide Flight Ticketing', row: 1, col: 3 },
    { icon: ClipboardList, title: 'Customized Itinerary Planning', row: 2, col: 1 },
    { icon: FileText, title: 'Visa Services', row: 2, col: 2 },
    { icon: Car, title: 'Car Rentals', row: 2, col: 3 },
    { icon: Users, title: 'Event Management', row: 3, col: 1 },
    { icon: Ship, title: 'Luxury Travel Services', row: 3, col: 2 },
    { icon: Users, title: 'Corporate Travel Packages', row: 3, col: 3 },
    { icon: Ship, title: 'Rail/Cruise Transfers', row: 4, col: 1 },
    { icon: PlaneTakeoff, title: 'Private Jets', row: 4, col: 2 },
    { icon: UtensilsCrossed, title: 'Special Meals', row: 4, col: 3 },
    { icon: Church, title: 'Religious Tours', row: 5, col: 1 },
    { icon: HeadphonesIcon, title: '24/7 Support', row: 5, col: 2 },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title - matching image style */}
        <h2 className="text-5xl font-bold text-center mb-16 text-gray-900">Our Services</h2>
        
        {/* Services Grid - 3 columns layout matching the image */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              {/* Icon container - matching image style with black outlined icons */}
              <div className="flex-shrink-0">
                <service.icon className="w-12 h-12 text-gray-900 group-hover:text-[#C69C3C] transition-colors" strokeWidth={1.5} />
              </div>
              
              {/* Service title - matching image typography */}
              <h3 className="text-base font-semibold text-gray-900 leading-tight">
                {service.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}