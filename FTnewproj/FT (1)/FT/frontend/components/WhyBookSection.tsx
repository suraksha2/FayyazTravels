"use client"

import { Mail, User, Settings, ShieldCheck } from 'lucide-react'

export default function WhyBookSection() {
  return (
    <section className="py-20 bg-[#002147] text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Why Choose Fayyaz Travels?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white/5 rounded-lg p-8 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex flex-col">
            <div className="w-16 h-16 bg-[#002147] rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-4 min-h-[3.5rem] flex items-center justify-center whitespace-nowrap">We Know Our Stuff!</h3>
            <p className="text-gray-300">
              With over 30 years of collective experience, our consultants are industry leaders.
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-8 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex flex-col">
            <div className="w-16 h-16 bg-[#002147] rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-4 min-h-[3.5rem] flex items-center justify-center whitespace-nowrap">Bespoke and Personalised</h3>
            <p className="text-gray-300">
              We tailor every unique, stress-free trip just for you!
            </p>
          </div>

         

          <div className="bg-white/5 rounded-lg p-8 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex flex-col">
            <div className="w-16 h-16 bg-[#002147] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-4 min-h-[3.5rem] flex items-center justify-center whitespace-nowrap">
              Safety and Privacy
            </h3>
            <p className="text-gray-300">
              Get 24/7 emergency support services for secure travel!
            </p>
          </div>
           <div className="bg-white/5 rounded-lg p-8 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex flex-col">
            <div className="w-16 h-16 bg-[#002147] rounded-full flex items-center justify-center mx-auto mb-6">
              <Settings className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-4 min-h-[3.5rem] flex items-center justify-center whitespace-nowrap">End to End Services</h3>
            <p className="text-gray-300">
              Complete, exceptional travel service for all your needs - hassle-free!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}