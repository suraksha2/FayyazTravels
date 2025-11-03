"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

const guideArticles = [
  {
    title: "Luxury Travel on a Budget?",
    subtitle: "A Insider's Guide to Experiencing Luxe for Less",
    image: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg"
  },
  {
    title: "How to Avoid Travel Burnout",
    subtitle: "5 Expert Tips for Stress-Free Adventures",
    image: "https://images.pexels.com/photos/2373201/pexels-photo-2373201.jpeg"
  },
  {
    title: "Flight Booking Mistakes That Could Cost You Hundreds",
    subtitle: "...and How to Avoid Them",
    image: "https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg"
  },
  {
    title: "Solo Travel for First-Timers",
    subtitle: "How to Travel Alone Safely and Thrive",
    image: "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg"
  },
  {
    title: "Going to Maroon 5 in Bangkok?",
    subtitle: "Here's Why You Should Stay Longer!",
    image: "https://images.pexels.com/photos/1282315/pexels-photo-1282315.jpeg"
  }
]

const travelInspirations = [
  {
    title: "Great Wall of China",
    location: "China",
    image: "https://images.pexels.com/photos/2412603/pexels-photo-2412603.jpeg"
  },
  {
    title: "Santorini Sunset",
    location: "Greece",
    image: "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg"
  },
  {
    title: "Northern Lights",
    location: "Iceland",
    image: "https://images.pexels.com/photos/1933316/pexels-photo-1933316.jpeg"
  }
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white pt-16">
      {/* Hero Section */}
      <section className="relative h-[80vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1802268/pexels-photo-1802268.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </section>

      {/* Welcome Text Section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl mb-4">Welcome to</p>
          <h1 className="text-4xl font-bold mb-6">Fayyaz Magazine</h1>
          <p className="text-lg text-gray-600 mb-6">
            At Fayyaz Travels, we are all about passionate traveling. Being an advocate of wanderlust, there's nothing we love more more than sharing travel news, tips and inspirations with all potential globetrotters out there. And what better way to do it than to document it all!
          </p>
          <p className="text-lg text-gray-600">
            Follow our blog and find yourself one flight away from the all the wonders of the world.
          </p>
        </div>
      </section>

      {/* Guidebook Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Guidebook</h2>
          <div className="space-y-4">
            {guideArticles.map((article, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center p-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-6 flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900">{article.title}</h3>
                    <p className="text-gray-600 mt-1">{article.subtitle}</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Inspiration Section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Travel Inspiration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {travelInspirations.map((inspiration, index) => (
              <div 
                key={index}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4">
                  <img
                    src={inspiration.image}
                    alt={inspiration.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{inspiration.title}</h3>
                    <p className="text-white/80">{inspiration.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )}