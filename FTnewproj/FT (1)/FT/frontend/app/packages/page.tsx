"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight, Search } from "lucide-react"
import { getPackageCategories } from "@/lib/api"

// Interface for package category
interface PackageCategory {
  id?: string | number;
  title: string;
  description: string;
  image: string;
  href: string;
}

// Default package categories as fallback
const defaultPackageCategories: PackageCategory[] = [
  {
    title: "Multi City",
    description: "Explore multiple destinations in one incredible journey",
    image: "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg",
    href: "/packages/multi-city"
  },
  {
    title: "Group Tours",
    description: "Join like-minded travelers for guided adventures",
    image: "https://images.pexels.com/photos/5088188/pexels-photo-5088188.jpeg",
    href: "/packages/group-tours"
  },
  {
    title: "Africa",
    description: "Safari adventures and cultural experiences",
    image: "https://images.pexels.com/photos/33045/lion-wild-africa-african.jpg",
    href: "/packages/africa"
  },
  {
    title: "The Caribbean",
    description: "Pristine beaches and tropical paradise",
    image: "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg",
    href: "/packages/the-caribbean"
  }
]

export default function PackagesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const searchQuery = searchParams.get('search')
  
  const [packageCategoriesData, setPackageCategoriesData] = useState<PackageCategory[]>(defaultPackageCategories)
  const [filteredCategories, setFilteredCategories] = useState<PackageCategory[]>(defaultPackageCategories)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch package categories from API
  useEffect(() => {
    let isMounted = true;

    setIsLoading(true)
    setError(null)
    
    getPackageCategories()
      .then(data => {
        if (isMounted && data && data.length > 0) {
          // Transform API data to match our UI requirements
          const formattedCategories = data.map((category: string) => {
            // Convert category name to URL-friendly slug
            const slug = category.toLowerCase().replace(/\s+/g, '-')
            
            // Find default image and description if available in our defaults
            const defaultCategory = defaultPackageCategories.find(
              c => c.title.toLowerCase() === category.toLowerCase()
            )
            
            return {
              title: category,
              description: defaultCategory?.description || `Explore amazing ${category} packages`,
              image: defaultCategory?.image || "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg",
              href: `/packages/${slug}`
            }
          })
          
          setPackageCategoriesData(formattedCategories)
          setFilteredCategories(formattedCategories)
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Error fetching package categories:', err)
          setError('Failed to load package categories')
          // Keep using default categories on error
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false;
    };
  }, [])

  // Filter categories based on search query
  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const filtered = packageCategoriesData.filter(category => 
        category.title.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query)
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(packageCategoriesData)
    }
  }, [searchQuery, packageCategoriesData])
  
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-6xl font-bold mb-8">Travel Packages</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Discover our curated collection of travel packages designed for every type of adventurer
          </p>
        </div>
      </div>

      {/* Packages Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          {searchQuery ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Search className="w-6 h-6 text-[#C69C3C]" />
                <h2 className="text-4xl font-bold text-gray-900">Search Results</h2>
              </div>
              <p className="text-gray-600 text-lg">
                Found {filteredCategories.length} {filteredCategories.length === 1 ? 'result' : 'results'} for "{searchQuery}"
              </p>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Adventure</h2>
              <p className="text-gray-600 text-lg">
                From multi-city tours to exotic destinations, find the perfect package for your next journey
              </p>
            </>
          )}
          
          {isLoading && (
            <div className="mt-4">
              <p className="text-gray-500">Loading package categories...</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </div>

        {filteredCategories.length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any packages matching "{searchQuery}". Try a different search term.
            </p>
            <Button onClick={() => router.push('/packages')} className="bg-[#002147] hover:bg-[#003366]">
              View All Packages
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((category, index) => (
            <Link key={index} href={category.href}>
              <div className="group bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{category.title}</h3>
                    <p className="text-white/80 text-sm">{category.description}</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[#002147] font-medium">Explore Packages</span>
                    <ChevronRight className="w-5 h-5 text-[#C69C3C] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#002147] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Can't Find What You're Looking For?</h2>
          <p className="text-xl mb-8">
            Our travel experts can create a custom package tailored to your preferences
          </p>
          <Button className="bg-[#C69C3C] hover:bg-[#B38C2C] text-white text-lg px-8 py-6">
            Contact Our Travel Experts
          </Button>
        </div>
      </section>
    </main>
  )
}