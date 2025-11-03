"use client"

import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Destination {
  id: number
  name: string
  slug: string
  packageCount: number
}

interface NavigationData {
  [category: string]: Destination[]
}

interface PackagesDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function PackagesDropdown({ isOpen, onClose }: PackagesDropdownProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [navigationData, setNavigationData] = useState<NavigationData>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch destinations from API
    const fetchDestinations = async () => {
      try {
        const response = await fetch('http://localhost:3003/packages/grouped-destinations')
        const data = await response.json()
        
        if (data.success) {
          setNavigationData(data.data)
        }
      } catch (error) {
        console.error('Error fetching destinations:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchDestinations()
    }
  }, [isOpen])

  if (!isOpen) return null

  const getDestinationUrl = (category: string, destination?: Destination) => {
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-')
    
    if (!destination) {
      return `/packages/${categorySlug}`
    }

    return `/packages/${categorySlug}/${destination.slug}`
  }

  // Separate special categories from regional destinations
  const specialCategories = ['Multi City', 'Group Tours']
  const regionalCategories = Object.keys(navigationData).filter(
    cat => !specialCategories.includes(cat)
  ).sort()
  
  // Combine in the desired order: special categories first, then regional
  const orderedCategories = [
    ...specialCategories.filter(cat => navigationData[cat]),
    ...regionalCategories
  ]

  return (
    <div 
      className="absolute top-full left-0 mt-0 pt-2 bg-transparent z-50 w-[700px]"
    >
      <div className="bg-white shadow-2xl border rounded-lg">
      <div className="p-4">
        <div className="flex gap-4">
          {/* Left Categories */}
          <div className="w-44 border-r pr-4">
            <h3 className="text-sm font-bold text-[#002147] mb-2">Destinations</h3>
            {loading ? (
              <div className="text-xs text-gray-500 py-2">Loading...</div>
            ) : (
              <div className="space-y-0.5">
                {orderedCategories.map((category, index) => {
                  const isSpecialCategory = specialCategories.includes(category)
                  const showDivider = index === specialCategories.filter(cat => navigationData[cat]).length && index > 0
                  
                  return (
                    <div key={category}>
                      {showDivider && (
                        <div className="border-t border-gray-200 my-2"></div>
                      )}
                      <Link
                        href={getDestinationUrl(category)}
                        className={`flex items-center justify-between px-2 py-1.5 text-left hover:bg-gray-50 rounded transition-colors group ${
                          activeCategory === category 
                            ? 'bg-gray-50 border-l-4 border-[#C69C3C] font-semibold text-[#002147]' 
                            : isSpecialCategory 
                            ? 'text-gray-900 font-medium' 
                            : 'text-gray-700'
                        }`}
                        onMouseEnter={() => setActiveCategory(category)}
                      >
                        <span className="text-xs">{category}</span>
                        <ChevronRight 
                          className={`h-4 w-4 transition-colors ${
                            activeCategory === category ? 'text-[#C69C3C]' : 'text-gray-400 group-hover:text-[#C69C3C]'
                          }`} 
                        />
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Loading destinations...</p>
              </div>
            ) : activeCategory && navigationData[activeCategory] ? (
              <>
                <h4 className="text-sm font-bold text-[#002147] mb-2">{activeCategory}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {navigationData[activeCategory].map((destination: Destination) => (
                    <Link
                      key={destination.id}
                      href={getDestinationUrl(activeCategory, destination)}
                      className="text-gray-700 hover:text-[#C69C3C] hover:bg-gray-50 px-2 py-1 rounded transition-colors text-xs"
                      onClick={onClose}
                    >
                      {destination.name}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Hover over a destination to see available packages</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
