"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search, Calendar, MapPin, Heart, Loader2 } from "lucide-react"
import EnquiryModal from "@/components/EnquiryModal"
import { Input } from "@/components/ui/input"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"
import Footer from "@/components/Footer"

interface Package {
    id: number
    slug: string
    title: string
    duration: string
    cities: number
    image: string
    days: number
    isHalalFriendly: boolean
    seatsLeft: number
    description: string
    price: number
    savings: number
    isTopSelling: boolean
    currency: string
}

export default function SearchResultsPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const searchQuery = searchParams.get('q') || searchParams.get('search') || ''
    const { isOpen, modalData, openModal, closeModal } = useEnquiryModal()

    const [packages, setPackages] = useState<Package[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!searchQuery) {
            router.push('/packages')
            return
        }

        const fetchSearchResults = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(`http://localhost:3003/packages?country=${encodeURIComponent(searchQuery)}`)
                const data = await response.json()

                if (data.success && data.packages) {
                    setPackages(data.packages)
                } else {
                    setPackages([])
                }
            } catch (err) {
                console.error('Error fetching search results:', err)
                setError('Failed to load search results')
                setPackages([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchSearchResults()
    }, [searchQuery, router])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Loader2 className="h-12 w-12 animate-spin text-[#002147]" />
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[40vh] bg-gradient-to-r from-[#002147] to-[#003366]">
                <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Search className="w-8 h-8" />
                        <h1 className="text-5xl font-bold">Search Results</h1>
                    </div>
                    <p className="text-xl">
                        {packages.length} {packages.length === 1 ? 'package' : 'packages'} found for "{searchQuery}"
                    </p>
                </div>
            </div>

            {/* Results Section */}
            <section className="py-16 px-4 max-w-7xl mx-auto">
                {error && (
                    <div className="text-center py-12">
                        <p className="text-red-500 text-lg">{error}</p>
                    </div>
                )}

                {packages.length === 0 && !error ? (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No packages found</h3>
                        <p className="text-gray-600 mb-6">
                            We couldn't find any packages matching "{searchQuery}". Try a different search term or browse all packages.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => router.push('/packages')} className="bg-[#002147] hover:bg-[#003366]">
                                View All Packages
                            </Button>
                            <Button onClick={() => router.push('/')} variant="outline">
                                Back to Home
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl group cursor-pointer"
                                onClick={() => router.push(`/package-detail/${pkg.slug}`)}
                            >
                                {/* Image Section */}
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={pkg.image}
                                        alt={pkg.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                                    {/* Top badges */}
                                    <div className="absolute top-3 left-3 flex items-center gap-2">
                                        {pkg.isTopSelling && (
                                            <span className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold">
                                                Top Selling
                                            </span>
                                        )}
                                        <button
                                            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-110"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Heart className="w-4 h-4 text-gray-700 transition-colors hover:text-red-500" />
                                        </button>
                                    </div>

                                    {/* Title overlay */}
                                    <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white drop-shadow-lg">
                                        {pkg.title}
                                    </h3>
                                </div>

                                {/* Card Content */}
                                <div className="p-5">
                                    {/* Info badges */}
                                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                            <Calendar className="w-4 h-4" />
                                            <span className="font-medium">{pkg.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                            <MapPin className="w-4 h-4" />
                                            <span className="font-medium">{pkg.cities} {pkg.cities === 1 ? 'City' : 'Cities'}</span>
                                        </div>
                                        {pkg.isHalalFriendly && (
                                            <span className="bg-green-600 text-white text-xs px-2.5 py-1 rounded font-semibold">
                                                Halal Friendly
                                            </span>
                                        )}
                                    </div>

                                    {/* Seats left */}
                                    {pkg.seatsLeft && (
                                        <div className="mb-4">
                                            <span className="inline-block bg-blue-500 text-white text-sm px-3 py-1 rounded font-semibold">
                                                {pkg.seatsLeft} Seats Left
                                            </span>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {pkg.description}
                                    </p>

                                    {/* Price and Book Button */}
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <span className="text-xs text-gray-500 block">From</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold text-gray-900">
                                                    {pkg.currency === 'S' ? 'S' : pkg.currency} ${pkg.price?.toLocaleString()}
                                                </span>
                                            </div>
                                            {pkg.savings > 0 && (
                                                <span className="text-xs text-green-600 font-medium">
                                                    You save {pkg.currency === 'S' ? 'S' : pkg.currency} ${pkg.savings?.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        <Link
                                            href={`/packages/booking/${pkg.id}`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Button className="bg-[#002147] hover:bg-[#003366] text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg">
                                                Book Now
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            <section className="py-20 bg-[#8B1F41] text-white text-center">
                <div className="max-w-2xl mx-auto px-4">
                    <h2 className="text-3xl font-semibold mb-6">Sign Up for our Newsletter</h2>
                    <div className="mb-8">
                        <p className="text-2xl mb-2">Save upto</p>
                        <p className="text-4xl font-bold mb-4">S$ 4812.80*</p>
                        <p className="text-sm text-white/80">
                            Unlock Exclusive access to upcoming packages and early bird discounts.
                        </p>
                    </div>
                    <div className="flex gap-2 max-w-md mx-auto mb-4">
                        <Input
                            type="email"
                            placeholder="Email"
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                        />
                        <Button className="bg-white text-[#8B1F41] hover:bg-white/90 px-8">→</Button>
                    </div>
                    <p className="text-sm text-white/60">Terms and Conditions Apply*</p>
                </div>
            </section>

            <EnquiryModal
                isOpen={isOpen}
                onClose={closeModal}
                packageName={modalData.packageName}
                packageType={modalData.packageType}
                destination={modalData.destination}
            />
            <Footer/>
        </main>
    )
}
