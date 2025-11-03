'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Calendar, Users, Phone, Mail, MapPin, CreditCard, Download, ArrowLeft, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PassengerDetails {
  id: string
  type: 'adult' | 'child' | 'infant'
  title: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  passportNumber: string
  passportExpiry: string
  gender: string
}

interface ContactDetails {
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
}

interface BookingConfirmation {
  bookingId: number
  packageId: string
  packageName: string
  customerName: string
  customerEmail: string
  customerPhone: string
  travelDate: string
  adults: number
  children: number
  infants: number
  totalAmount: number
  paymentStatus: string
  paymentIntentId?: string
  bookingDate: string
  passengerDetails?: PassengerDetails[]
  contactDetails?: ContactDetails
}

export default function BookingConfirmationPage() {
  const [bookingData, setBookingData] = useState<BookingConfirmation | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get booking data from sessionStorage
    const storedData = sessionStorage.getItem('bookingConfirmation')
    if (storedData) {
      setBookingData(JSON.parse(storedData))
      // Clear the session storage after loading to prevent reuse
      sessionStorage.removeItem('bookingConfirmation')
    } else {
      // If no data found, redirect to home
      router.push('/')
    }
    setLoading(false)
  }, [router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `S$${amount.toLocaleString()}`
  }

  const getTotalGuests = () => {
    if (!bookingData) return 0
    return bookingData.adults + bookingData.children + bookingData.infants
  }

  const handleDownloadConfirmation = () => {
    // Create a comprehensive text confirmation
    let confirmationText = `
BOOKING CONFIRMATION
====================

Booking ID: ${bookingData?.bookingId}
Package: ${bookingData?.packageName}
Customer: ${bookingData?.customerName}
Email: ${bookingData?.customerEmail}
Phone: ${bookingData?.customerPhone}
Travel Date: ${formatDate(bookingData?.travelDate || '')}
Guests: ${bookingData?.adults} Adults, ${bookingData?.children} Children, ${bookingData?.infants} Infants
Total Amount: ${formatCurrency(bookingData?.totalAmount || 0)}
Payment Status: ${bookingData?.paymentStatus}
${bookingData?.paymentIntentId ? `Payment Reference: ${bookingData.paymentIntentId}` : ''}
Booking Date: ${formatDate(bookingData?.bookingDate || '')}

`

    // Add passenger details if available
    if (bookingData?.passengerDetails && bookingData.passengerDetails.length > 0) {
      confirmationText += `
PASSENGER DETAILS
=================

`
      bookingData.passengerDetails.forEach((passenger, index) => {
        confirmationText += `${index + 1}. ${passenger.title} ${passenger.firstName} ${passenger.lastName}
   Type: ${passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)}
   Date of Birth: ${new Date(passenger.dateOfBirth).toLocaleDateString()}
   Nationality: ${passenger.nationality}
   Gender: ${passenger.gender}
   Passport: ${passenger.passportNumber}
   Passport Expiry: ${new Date(passenger.passportExpiry).toLocaleDateString()}

`
      })
    }

    // Add emergency contact if available
    if (bookingData?.contactDetails?.emergencyContactName) {
      confirmationText += `
EMERGENCY CONTACT
================

Name: ${bookingData.contactDetails.emergencyContactName}
Phone: ${bookingData.contactDetails.emergencyContactPhone}
Relation: ${bookingData.contactDetails.emergencyContactRelation}

`
    }

    confirmationText += `
Thank you for choosing Fayyaz Travels!
We will contact you shortly to confirm your reservation.

For any queries, please contact us at:
Phone: +65 1234 5678
Email: support@fayyaztravels.com
    `

    const blob = new Blob([confirmationText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `booking-confirmation-${bookingData?.bookingId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002147]"></div>
      </div>
    )
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Booking Data Found</h1>
          <Button onClick={() => router.push('/')} className="bg-[#002147] hover:bg-[#001a38]">
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your booking. We'll contact you shortly to confirm your reservation.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-[#002147] text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Booking Details</h2>
            <p className="text-blue-100">Booking ID: #{bookingData.bookingId}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Package Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Package Information</h3>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-[#002147] mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{bookingData.packageName}</p>
                    <p className="text-sm text-gray-600">Package ID: {bookingData.packageId}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-[#002147]" />
                  <div>
                    <p className="font-medium text-gray-900">Travel Date</p>
                    <p className="text-sm text-gray-600">{formatDate(bookingData.travelDate)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-[#002147]" />
                  <div>
                    <p className="font-medium text-gray-900">Guests</p>
                    <p className="text-sm text-gray-600">
                      {bookingData.adults} Adults
                      {bookingData.children > 0 && `, ${bookingData.children} Children`}
                      {bookingData.infants > 0 && `, ${bookingData.infants} Infants`}
                      {' '}({getTotalGuests()} Total)
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Customer Information</h3>
                
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 bg-[#002147] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {bookingData.customerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{bookingData.customerName}</p>
                    <p className="text-sm text-gray-600">Primary Contact</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-[#002147]" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{bookingData.customerEmail}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-[#002147]" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{bookingData.customerPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            {bookingData.passengerDetails && bookingData.passengerDetails.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Passenger Details</h3>
                <div className="space-y-4">
                  {bookingData.passengerDetails.map((passenger, index) => (
                    <div key={passenger.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {passenger.title} {passenger.firstName} {passenger.lastName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          passenger.type === 'adult' 
                            ? 'bg-blue-100 text-blue-800'
                            : passenger.type === 'child'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Date of Birth:</span>
                          <p className="font-medium">{new Date(passenger.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Nationality:</span>
                          <p className="font-medium">{passenger.nationality}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Gender:</span>
                          <p className="font-medium">{passenger.gender}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Passport:</span>
                          <p className="font-medium">{passenger.passportNumber}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Passport Expiry:</span>
                          <p className="font-medium">{new Date(passenger.passportExpiry).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {bookingData.contactDetails?.emergencyContactName && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium">{bookingData.contactDetails.emergencyContactName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium">{bookingData.contactDetails.emergencyContactPhone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Relation:</span>
                      <p className="font-medium">{bookingData.contactDetails.emergencyContactRelation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-2xl font-bold text-[#002147]">{formatCurrency(bookingData.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Payment Status:</span>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    <span className={`font-medium ${
                      bookingData.paymentStatus === 'Demo Payment' 
                        ? 'text-blue-600' 
                        : 'text-green-600'
                    }`}>
                      {bookingData.paymentStatus}
                    </span>
                  </div>
                </div>
                {bookingData.paymentIntentId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Reference:</span>
                    <span className="text-xs font-mono text-gray-800">{bookingData.paymentIntentId}</span>
                  </div>
                )}
                {bookingData.paymentStatus === 'Demo Payment' && (
                  <p className="text-sm text-blue-600 mt-2">
                    This was a demo booking. Please contact us to complete the actual payment.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleDownloadConfirmation}
            className="bg-[#002147] hover:bg-[#001a38] text-white px-6 py-3"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Confirmation
          </Button>
          
          <Button
            onClick={() => router.push('/my-bookings')}
            variant="outline"
            className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white px-6 py-3"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View My Bookings
          </Button>
          
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            Our travel experts are here to assist you with your booking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center justify-center space-x-2">
              <Phone className="h-4 w-4 text-[#002147]" />
              <span className="text-[#002147] font-medium">+65 1234 5678</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Mail className="h-4 w-4 text-[#002147]" />
              <span className="text-[#002147] font-medium">support@fayyaztravels.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
