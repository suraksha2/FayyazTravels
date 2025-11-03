"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const keywords = [
  'family holiday',
  'honeymoon',
  'couples trip',
  'multi-generational trip',
  'halal-friendly travel',
  'romantic getaway',
  'friends getaway',
  'group tour',
  'adventure holiday',
  'luxury safari',
  'beach getaway',
  'wellness retreat',
  'bespoke itinerary',
  'private tour',
  'city break',
  'island escape',
  'winter holiday',
  'wildlife safari'
]

interface SearchSuggestion {
  id: number | string
  title: string
  type: 'package' | 'destination'
  slug?: string
  country?: string
  packageCount?: number
}

interface SuggestionsResponse {
  packages: SearchSuggestion[]
  destinations: SearchSuggestion[]
}

export default function HeroSection() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestionsResponse>({ packages: [], destinations: [] })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Typewriter effect
  useEffect(() => {
    const currentKeyword = keywords[currentKeywordIndex]
    const typingSpeed = isDeleting ? 50 : 100
    const pauseTime = isDeleting ? 500 : 2000

    if (!isDeleting && displayedText === currentKeyword) {
      setTimeout(() => setIsDeleting(true), pauseTime)
      return
    }

    if (isDeleting && displayedText === '') {
      setIsDeleting(false)
      setCurrentKeywordIndex((prev) => (prev + 1) % keywords.length)
      return
    }

    const timeout = setTimeout(() => {
      setDisplayedText(
        isDeleting
          ? currentKeyword.substring(0, displayedText.length - 1)
          : currentKeyword.substring(0, displayedText.length + 1)
      )
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [displayedText, isDeleting, currentKeywordIndex])

  // Fetch search suggestions
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (searchQuery.trim().length < 2) {
      setSuggestions({ packages: [], destinations: [] })
      setShowSuggestions(false)
      return
    }

    setIsLoadingSuggestions(true)

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `http://localhost:3003/packages/search-suggestions?q=${encodeURIComponent(searchQuery)}`
        )
        const data = await response.json()

        if (data.success && data.suggestions) {
          setSuggestions(data.suggestions)
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchQuery])

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!searchQuery.trim()) return
    
    const query = searchQuery.trim()
    
    // Track search event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'search', {
        search_term: query,
        event_category: 'Hero Search',
        event_label: query
      })
    }
    
    setShowSuggestions(false)
    // Redirect to search results page
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false)
    
    if (suggestion.type === 'package') {
      router.push(`/package-detail/${suggestion.slug}`)
    } else {
      router.push(`/search?q=${encodeURIComponent(suggestion.title)}`)
    }
  }

  return (
    <div className="h-screen relative">
      {/* Video Background Container with overflow hidden */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/assets/webvid.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>
      
      {/* Headline with Typewriter Effect */}
      <div className="absolute bottom-36 sm:bottom-40 md:bottom-48 lg:bottom-56 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4 sm:px-6 text-center">
        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-white leading-tight drop-shadow-lg">
          Turning your{' '}
          <span className="font-serif italic text-[#C69C3C] font-bold inline-block min-w-[150px] sm:min-w-[200px] md:min-w-[300px] lg:min-w-[400px]">
            {displayedText}
            <span className="animate-pulse">|</span>
          </span>
          <br className="hidden sm:block" />
          <span className="sm:inline block mt-2 sm:mt-0"> into memories that last forever.</span>
        </h1>
      </div>
      
      {/* Search Bar */}
      <div className="absolute bottom-20 sm:bottom-24 md:bottom-28 lg:bottom-32 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 sm:px-6 z-[10000]">
        <div ref={searchRef} className="relative">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Where do you want to go?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full text-sm sm:text-base md:text-lg bg-white/20 backdrop-blur-md text-white placeholder-white/80 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button 
              type="button"
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform"
              onClick={handleSearch}
              aria-label="Search destinations"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && (suggestions.packages.length > 0 || suggestions.destinations.length > 0) && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl overflow-hidden z-[99999] max-h-96 overflow-y-auto">
              {/* Packages Section */}
              {suggestions.packages.length > 0 && (
                <div className="border-b border-gray-100">
                  {suggestions.packages.map((pkg) => (
                    <div
                      key={`package-${pkg.id}`}
                      onClick={() => handleSuggestionClick(pkg)}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <h3 className="text-gray-900 font-medium text-base group-hover:text-[#002147]">
                          {pkg.title}
                        </h3>
                        {pkg.country && (
                          <p className="text-sm text-gray-500 mt-0.5">{pkg.country}</p>
                        )}
                      </div>
                      <span className="bg-[#002147] text-white text-xs px-3 py-1 rounded-full font-semibold">
                        Package
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Destinations Section */}
              {suggestions.destinations.length > 0 && (
                <div>
                  {suggestions.destinations.map((dest) => (
                    <div
                      key={`destination-${dest.id}`}
                      onClick={() => handleSuggestionClick(dest)}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <h3 className="text-gray-900 font-medium text-base group-hover:text-[#002147]">
                          {dest.title}
                        </h3>
                        {dest.packageCount && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {dest.packageCount} {dest.packageCount === 1 ? 'package' : 'packages'} available
                          </p>
                        )}
                      </div>
                      <span className="bg-[#002147] text-white text-xs px-3 py-1 rounded-full font-semibold">
                        Destination
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white text-xs font-light tracking-widest">Scroll</span>
        <div className="w-[2px] h-8 sm:h-12 bg-white/60"></div>
      </div>
    </div>
  )
}

