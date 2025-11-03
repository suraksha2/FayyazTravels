"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Package, getPackageById } from '@/lib/api'
import { Button } from "@/components/ui/button"
import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Check, 
  ChevronRight,
  Star,
  Heart,
  Share2,
  Phone,
  ChevronDown,
  ChevronUp
} from "lucide-react"

export default function PackageDetailsPage() {
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();
  const { id } = useParams()
  const [packageData, setPackageData] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFullItinerary, setShowFullItinerary] = useState(false)

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setLoading(true)
        const data = await getPackageById(id as string)
        setPackageData(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching package details:', err)
        setError('Failed to load package details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPackageData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002147]"></div>
      </div>
    )
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700 mb-6">{error || 'Package not found'}</p>
        <Link href="/packages">
          <Button>Return to Packages</Button>
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white pt-24">
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-[#002147]">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/packages" className="hover:text-[#002147]">Packages</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-[#002147] font-medium">{packageData.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[60vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${packageData.image}')`
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-5xl font-bold mb-4">
            {packageData.title}
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            {packageData.description}
          </p>
        </div>
      </div>

      {/* Package Details */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#002147]" />
                  <span>{packageData.days} Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#002147]" />
                  <span>{packageData.cities} Cities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#002147]" />
                  <span>Group Tour</span>
                </div>
                {packageData.isHalalFriendly && (
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-600">Halal Friendly</span>
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-semibold mb-4">Overview</h2>
              <p className="text-gray-700 mb-8">
                Experience the beauty and culture of {packageData.destination} with our {packageData.title} package. 
                This {packageData.days}-day journey will take you through {packageData.cities} vibrant cities, 
                offering a perfect blend of adventure, relaxation, and cultural immersion.
              </p>

              <h2 className="text-2xl font-semibold mb-4">Highlights</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {[
                  'Guided city tours with local experts',
                  'Premium accommodations throughout your stay',
                  'Selected meals featuring local cuisine',
                  'All transportation between destinations',
                  'Skip-the-line access to major attractions',
                  'Free time for personal exploration',
                  'Optional activities available',
                  'Dedicated tour manager'
                ].map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <h2 className="text-2xl font-semibold mb-4">Itinerary</h2>
              <div className="space-y-6 mb-8">
                {Array.from(
                  { length: showFullItinerary ? packageData.days : Math.min(packageData.days, 5) }, 
                  (_, i) => (
                    <div key={i} className="border-l-2 border-[#002147] pl-4 ml-2">
                      <h3 className="font-semibold text-lg">Day {i + 1}</h3>
                      <p className="text-gray-700">
                        {i === 0 
                          ? `Arrival in ${packageData.destination} and welcome dinner` 
                          : i === packageData.days - 1
                          ? `Final day in ${packageData.destination}, farewell lunch, and departure`
                          : `Explore the beauty and culture of ${packageData.destination} with guided tours and free time`}
                      </p>
                    </div>
                ))}                
                {packageData.days > 5 && (
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => setShowFullItinerary(!showFullItinerary)}
                  >
                    {showFullItinerary ? (
                      <>
                        Hide Full Itinerary
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        View Full Itinerary
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              <h2 className="text-2xl font-semibold mb-4">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Accommodation for {packageData.days - 1} nights</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Daily breakfast</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Transportation between cities</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Guided tours as per itinerary</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Airport transfers</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>Professional tour guide</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-sm text-gray-500">From</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">S${packageData.price}</span>
                    <span className="text-green-600">Save S${packageData.savings}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">Limited Offer</span>
                  </div>
                  <span className="text-blue-800 font-medium">{packageData.seatsLeft} seats left</span>
                </div>
              </div>

              <Button 
                className="w-full bg-[#002147] hover:bg-[#001a38] mb-4 py-6 text-lg font-bold transition-all duration-300 hover:shadow-lg"
                onClick={() => window.location.href = `/packages/booking/${id}`}
              >
                Book Now
              </Button>

              <Button variant="outline" className="w-full mb-6 py-6 text-lg">
                Enquire Now
              </Button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-[#002147]">
                  <Phone className="w-5 h-5" />
                  <span className="font-semibold">+65 6235 2900</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Call us for more information</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      {/* Enquiry Modal */}
      <EnquiryModal 
        isOpen={isOpen}
        onClose={closeModal}
        packageName={modalData.packageName}
        packageType={modalData.packageType}
        destination={modalData.destination}
      />
    </main>
  )
}
