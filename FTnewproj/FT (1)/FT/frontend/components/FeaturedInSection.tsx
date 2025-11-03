"use client"

import { useState } from 'react'
import Image from 'next/image'

export default function FeaturedInSection() {
  const [currentPage, setCurrentPage] = useState(0)
  const totalPages = 3 // 12 items / 4 items per page = 3 pages

  const logos = [
    { id: 1, name: "The Business Times", image: "/assets/Featured/thebusinesstimes.png" },
    { id: 2, name: "The Straits Times", image: "/assets/Featured/thestraittimes.png" },
    { id: 3, name: "The Luxury Network", image: "/assets/Featured/thelucurynetwrok.png" },
    { id: 4, name: "Singapore's Finest", image: "/assets/Featured/singaporesfinest.png" },
    { id: 5, name: "SingSaver", image: "/assets/Featured/singsaver.png" },
    { id: 6, name: "SPG", image: "/assets/Featured/spg.png" },
    { id: 7, name: "SBO", image: "/assets/Featured/sbo.png" },
    { id: 8, name: "Aeroleads", image: "/assets/Featured/aeroleads.png" },
    { id: 9, name: "Bertia Harrison", image: "/assets/Featured/bertia harrison.png" },
    { id: 10, name: "Setriluxe", image: "/assets/Featured/Setriluxe.png" },
    { id: 11, name: "Sureclean", image: "/assets/Featured/Sureclean.png" },
    { id: 12, name: "Top Something", image: "/assets/Featured/Topsomething.png" }
  ]

  return (
    <section className="py-20 bg-[#002147] text-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">As Featured in</h2>
        
        {/* Desktop view - 3 columns grid with internal borders only */}
        <div className="hidden md:grid md:grid-cols-3">
          {logos.map((logo, index) => (
            <div 
              key={logo.id} 
              className={`p-12 flex items-center justify-center min-h-[140px] hover:bg-white/5 transition-colors duration-300 ${
                // Add right border except for last column (index 2, 5, 8, 11)
                (index + 1) % 3 !== 0 ? 'border-r border-white/30' : ''
              } ${
                // Add bottom border except for last row (index 9, 10, 11)
                index < 9 ? 'border-b border-white/30' : ''
              }`}
            >
              <div className="relative w-full h-14">
                <Image
                  src={logo.image}
                  alt={logo.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile view - 2x2 grid with pagination */}
        <div className="md:hidden">
          <div className="bg-[#1e3a5f] rounded-3xl p-8 mb-8">
            <div className="grid grid-cols-2 gap-0">
              {logos.slice(currentPage * 4, currentPage * 4 + 4).map((logo, index) => (
                <div 
                  key={logo.id}
                  className={`p-8 flex items-center justify-center min-h-[140px] ${
                    index === 0 || index === 2 ? 'border-r border-white/30' : ''
                  } ${
                    index === 0 || index === 1 ? 'border-b border-white/30' : ''
                  }`}
                >
                  <div className="relative w-full h-12">
                    <Image
                      src={logo.image}
                      alt={logo.name}
                      fill
                      className="object-contain"
                      sizes="50vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
 
          {/* Pagination dots */}
          <div className="flex justify-center items-center gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentPage === index ? 'bg-white' : 'bg-white/40'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}