"use client"

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdventureTravelSection() {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
       <source src="/assets/Luxurtywebvid.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />
      
      <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
        <h2 className="text-7xl font-light mb-8 tracking-wide">
          Luxury Travel
        </h2>
        <Link href="/luxury">
          <Button 
            variant="outline" 
            className="text-white border-2 border-white hover:bg-white hover:text-black transition-colors px-8 py-6 text-lg font-semibold shadow-lg backdrop-blur-sm bg-white/10"
          >
            Learn More
          </Button>
        </Link>
      </div>
    </section>
  )
}