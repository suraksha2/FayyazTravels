"use client"

import { useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarNavigationProps {
  isOpen: boolean
  onClose: () => void
}

const navigationData = {
  "Multi City": [
    "Australia – New Zealand", "Austria – Switzerland",
    "Bulgaria – Greece", "Fixed – Departures",
    "Panama – Costa Rica", "Paris – Switzerland"
  ],
  "Group Tours": [
    "Kashmir Group Tour", "Tour of North India",
    "Turkey – Georgia – Azerbaijan", "Uzbekistan Group Tour",
    "Group Tour"
  ],
  "Africa": [
    "Botswana", "Egypt", "Kenya", "Madagascar",
    "Malawi", "Mauritius", "Morocco", "Mozambique",
    "Namibia", "Seychelles", "South Africa", "Tanzania",
    "Tunisia", "Uganda", "Zambia", "Zimbabwe"
  ],
  "The Caribbean": [
    "Anguilla", "Antigua and Barbuda", "Bahamas", "Barbados",
    "British Virgin Islands", "Cuba", "Dominican Republic",
    "Jamaica", "Puerto Rico"
  ],
  "South America": [
    "Argentina", "Bolivia", "Brazil", "Chile",
    "Colombia", "Ecuador", "Peru", "Uruguay", "Venezuela"
  ],
  "North America": [
    "Alaska", "Canada", "Costa Rica",
    "Mexico", "Panama", "United States"
  ],
  "Asia": [
    "Armenia", "Azerbaijan", "Bahrain", "Bangladesh",
    "Bhutan", "China", "Georgia", "India",
    "Iran", "Japan", "Mongolia", "Nepal",
    "Pakistan", "South Korea", "Sri Lanka", "Taiwan",
    "Tibet", "Uzbekistan"
  ],
  "South East Asia": [
    "Batam", "Bintan Islands", "Brunei Darussalam", "Cambodia",
    "Indonesia", "Laos", "Malaysia", "Maldives",
    "Myanmar", "Philippines", "Singapore", "Thailand",
    "Timor-Leste", "Vietnam"
  ],
  "Middle East": [
    "Bahrain", "Iran", "Iraq", "Israel",
    "Jordan", "Kuwait", "Lebanon", "Oman",
    "Qatar", "Saudi Arabia", "Syria", "Turkey",
    "United Arab Emirates", "Yemen"
  ],
  "South East Europe": [
    "Albania", "Bosnia and Herzegovina", "Bulgaria", "Croatia",
    "Greece", "Montenegro", "North Macedonia", "Serbia",
    "Slovenia"
  ],
  "Europe": [
    "Austria", "Belgium", "Czech Republic", "Denmark",
    "Finland", "France", "Germany", "Hungary",
    "Ireland", "Italy", "Netherlands", "Poland",
    "Portugal", "Spain", "Switzerland", "United Kingdom"
  ],
  "Scandinavia": [
    "Denmark", "Finland", "Iceland", "Norway", "Sweden"
  ],
  "Oceania": [
    "Australia", "Fiji", "New Zealand", "Papua New Guinea",
    "Samoa", "Tonga", "Vanuatu"
  ]
}

export default function SidebarNavigation({ isOpen, onClose }: SidebarNavigationProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const handleCategoryHover = (category: string) => {
    setActiveCategory(category)
  }

  const handleCategoryLeave = () => {
    setActiveCategory(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div 
        className="flex h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar */}
        <div className="w-80 bg-white shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-[#002147]">Destinations</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="py-4">
            {Object.keys(navigationData).map((category) => (
              <button
                key={category}
                className={`w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors group ${
                  activeCategory === category 
                    ? 'bg-gray-50 border-l-4 border-[#C69C3C] font-bold text-[#002147]' 
                    : 'text-gray-700'
                }`}
                onMouseEnter={() => handleCategoryHover(category)}
                onClick={() => {
                  // Navigate to main category page
                  const categorySlug = category.toLowerCase().replace(/\s+/g, '-')
                  window.location.href = `/packages/${categorySlug}`
                  onClose()
                }}
              >
                <span className="text-sm font-medium">{category}</span>
                <ChevronRight 
                  className={`h-4 w-4 transition-colors ${
                    activeCategory === category ? 'text-[#C69C3C]' : 'text-gray-400 group-hover:text-[#C69C3C]'
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Dropdown Panel */}
        {activeCategory && (
          <div 
            className="w-96 bg-white shadow-2xl border-l"
            onMouseLeave={handleCategoryLeave}
          >
            <div className="p-6 border-b bg-gray-50">
              <h3 className="text-lg font-bold text-[#002147]">{activeCategory}</h3>
            </div>
            
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 p-6">
                <div className="space-y-2">
                  {navigationData[activeCategory as keyof typeof navigationData].slice(0, Math.ceil(navigationData[activeCategory as keyof typeof navigationData].length / 2)).map((item, index) => (
                    <button
                      key={index}
                      className="block w-full text-left text-gray-700 hover:text-[#C69C3C] hover:bg-gray-50 px-3 py-2 rounded transition-colors text-sm"
                      onClick={() => {
                        // Handle different categories  
                        if (activeCategory === 'Multi City') {
                          const itemSlug = item.toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-')
                          window.location.href = `/packages/multi-city/${itemSlug}`
                        } else if (activeCategory === 'Group Tours') {
                          const itemSlug = item.toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-')
                          window.location.href = `/packages/group-tours/${itemSlug}`
                        } else if (activeCategory === 'Africa') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/africa/${itemSlug}`
                        } else if (activeCategory === 'The Caribbean') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/the-caribbean/${itemSlug}`
                        } else if (activeCategory === 'South America') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/south-america/${itemSlug}`
                        } else if (activeCategory === 'North America') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/north-america/${itemSlug}`
                        } else if (activeCategory === 'Asia') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/asia/${itemSlug}`
                        } else if (activeCategory === 'South East Asia') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/south-east-asia/${itemSlug}`
                        } else if (activeCategory === 'Middle East') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/middle-east/${itemSlug}`
                        } else if (activeCategory === 'Europe') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/europe/${itemSlug}`
                        } else if (activeCategory === 'South East Europe') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/south-east-europe/${itemSlug}`
                        } else if (activeCategory === 'Scandinavia') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/scandinavia/${itemSlug}`
                        } else if (activeCategory === 'Oceania') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/oceania/${itemSlug}`
                        } else {
                          // Navigate to main category page for other categories
                          const categorySlug = activeCategory?.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/${categorySlug}`
                        }
                        onClose()
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  {navigationData[activeCategory as keyof typeof navigationData].slice(Math.ceil(navigationData[activeCategory as keyof typeof navigationData].length / 2)).map((item, index) => (
                    <button
                      key={index}
                      className="block w-full text-left text-gray-700 hover:text-[#C69C3C] hover:bg-gray-50 px-3 py-2 rounded transition-colors text-sm"
                      onClick={() => {
                        // Handle different categories  
                        if (activeCategory === 'Multi City') {
                          const itemSlug = item.toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-')
                          window.location.href = `/packages/multi-city/${itemSlug}`
                        } else if (activeCategory === 'Group Tours') {
                          const itemSlug = item.toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-')
                          window.location.href = `/packages/group-tours/${itemSlug}`
                        } else if (activeCategory === 'Africa') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/africa/${itemSlug}`
                        } else if (activeCategory === 'The Caribbean') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/the-caribbean/${itemSlug}`
                        } else if (activeCategory === 'South America') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/south-america/${itemSlug}`
                        } else if (activeCategory === 'North America') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/north-america/${itemSlug}`
                        } else if (activeCategory === 'Asia') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/asia/${itemSlug}`
                        } else if (activeCategory === 'South East Asia') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/south-east-asia/${itemSlug}`
                        } else if (activeCategory === 'Middle East') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/middle-east/${itemSlug}`
                        } else if (activeCategory === 'Europe') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/europe/${itemSlug}`
                        } else if (activeCategory === 'South East Europe') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/south-east-europe/${itemSlug}`
                        } else if (activeCategory === 'Scandinavia') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/scandinavia/${itemSlug}`
                        } else if (activeCategory === 'Oceania') {
                          const itemSlug = item.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/oceania/${itemSlug}`
                        } else {
                          // Navigate to main category page for other categories
                          const categorySlug = activeCategory?.toLowerCase().replace(/\s+/g, '-')
                          window.location.href = `/packages/${categorySlug}`
                        }
                        onClose()
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}