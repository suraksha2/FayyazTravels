"use client"

import { ArrowRight } from 'lucide-react'

interface BudgetTier {
  title: string
  subtitle: string
  color: string
  bgColor: string
}

export default function BudgetCard() {
  const tiers: BudgetTier[] = [
    {
      title: "Luxury",
      subtitle: "Tier.",
      color: "text-gray-900",
      bgColor: "bg-white"
    },
    {
      title: "Affordable",
      subtitle: "Luxury.",
      color: "text-gray-900",
      bgColor: "bg-white"
    },
    {
      title: "Affordable",
      subtitle: "Tier.",
      color: "text-gray-900",
      bgColor: "bg-white"
    },
    {
      title: "Expiring",
      subtitle: "Soon.",
      color: "text-gray-900",
      bgColor: "bg-white"
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-b from-[#0a1628] to-[#1a2942]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-light text-white text-center mb-12">
          <span className="font-bold text-[#C69C3C]">On a budget?</span> We have you covered
        </h2>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className="group perspective-1000 h-[180px]"
            >
              <div className="relative w-full h-full transition-transform duration-700 transform-style-3d group-hover:rotate-y-180">
                {/* Front of card */}
                <div className={`absolute inset-0 ${tier.bgColor} ${tier.color} rounded-2xl p-8 flex flex-col justify-between backface-hidden shadow-lg border-2 border-gray-200 group-hover:border-[#C69C3C] group-hover:bg-[#C69C3C] group-hover:text-white transition-all duration-500`}>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{tier.title}</h3>
                    <p className="text-2xl font-bold">{tier.subtitle}</p>
                  </div>
                  <div className="flex justify-end">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-900 group-hover:border-white flex items-center justify-center group-hover:bg-white/20 transition-all duration-500">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                
                {/* Back of card */}
                <div className={`absolute inset-0 bg-[#C69C3C] text-white rounded-2xl p-8 flex flex-col justify-center items-center backface-hidden rotate-y-180 shadow-lg border-2 border-[#C69C3C]`}>
                  <h3 className="text-xl font-bold mb-3 text-center">Explore {tier.title}</h3>
                  <p className="text-sm text-center mb-4 opacity-90">
                    Discover amazing deals and packages tailored for you
                  </p>
                  <button className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full text-sm font-semibold transition-colors backdrop-blur-sm">
                    View Packages
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
