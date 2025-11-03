"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { apiFetch } from '@/lib/api'

interface PackageFiltersProps {
  title?: string;
  showTitle?: boolean;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export default function PackageFilters({ 
  title = "Browse by Category", 
  showTitle = true, 
  layout = 'horizontal',
  className = "" 
}: PackageFiltersProps) {
  const [categories, setCategories] = useState<string[]>([])
  const [destinations, setDestinations] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [categoriesData, destinationsData] = await Promise.all([
          apiFetch('/packages/categories'),
          apiFetch('/destinations/countries')
        ])
        setCategories(categoriesData)
        setDestinations(destinationsData)
      } catch (err) {
        console.error('Error fetching filter options:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterOptions()
  }, [])

  const handleCategoryClick = (category: string) => {
    router.push(`/packages?category=${encodeURIComponent(category)}`)
  }

  const handleDestinationClick = (destination: string) => {
    router.push(`/packages?destination=${encodeURIComponent(destination)}`)
  }

  const handleViewAllPackages = () => {
    router.push('/packages')
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        {showTitle && (
          <h3 className="text-2xl font-bold text-center mb-8">{title}</h3>
        )}
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {showTitle && (
        <h3 className="text-2xl font-bold text-center mb-8">{title}</h3>
      )}
      
      {/* Categories Section */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">Categories</h4>
        <div className={`flex gap-3 ${layout === 'vertical' ? 'flex-col' : 'flex-wrap'}`}>
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => handleCategoryClick(category)}
              variant="outline"
              className="hover:bg-[#002147] hover:text-white transition-colors duration-300 border-2 border-gray-200 hover:border-[#002147]"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Popular Destinations Section */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">Popular Destinations</h4>
        <div className={`flex gap-3 ${layout === 'vertical' ? 'flex-col' : 'flex-wrap'}`}>
          {destinations.slice(0, 6).map((destination) => (
            <Button
              key={destination}
              onClick={() => handleDestinationClick(destination)}
              variant="outline"
              className="hover:bg-[#002147] hover:text-white transition-colors duration-300 border-2 border-gray-200 hover:border-[#002147]"
            >
              {destination}
            </Button>
          ))}
        </div>
      </div>

      {/* View All Packages Button */}
      <div className="text-center">
        <Button
          onClick={handleViewAllPackages}
          className="bg-[#002147] hover:bg-[#001a38] text-white px-8 py-3 text-lg font-semibold"
        >
          View All Packages
        </Button>
      </div>
    </div>
  )
}
