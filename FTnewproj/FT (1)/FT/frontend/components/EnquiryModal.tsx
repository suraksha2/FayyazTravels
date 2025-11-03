'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Mail, Phone, Calendar, Users } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { enquiryAnalytics } from '@/lib/analytics'

interface EnquiryModalProps {
  isOpen: boolean
  onClose: () => void
  packageName?: string
  packageType?: string
  destination?: string
}

export default function EnquiryModal({ 
  isOpen, 
  onClose, 
  packageName = "Travel Package",
  packageType = "General",
  destination = ""
}: EnquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pax: '',
    nationality: '',
    departure_city: '',
    destinations: '',
    travel_dates: '',
    hotel_preference: '',
    flight_requirements: '',
    special_requests: '',
    package_name: packageName,
    package_type: packageType,
    destination: destination
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Track modal opened event
  useEffect(() => {
    if (isOpen && packageName && destination) {
      enquiryAnalytics.modalOpened(packageName, destination)
    }
  }, [isOpen, packageName, destination])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Send enquiry notification to admin
      const result = await apiFetch('/sendEnquiryNotification', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          message: `Package: ${packageName}\nDestination: ${destination}\nPackage Type: ${packageType}\n\nTravel Details:\nNumber of Travellers: ${formData.pax}\nNationality: ${formData.nationality}\nDeparture City: ${formData.departure_city}\nDestinations: ${formData.destinations}\nTravel Dates: ${formData.travel_dates}\nHotel Preference: ${formData.hotel_preference}\nFlight Requirements: ${formData.flight_requirements}\n\nSpecial Requests:\n${formData.special_requests}`
        })
      })

      if (result.success) {
        // Track successful form submission
        enquiryAnalytics.formCompleted(packageName || 'Unknown Package', destination || 'Unknown Destination')
        
        setSuccess(true)
        setFormData({
          name: '',
          phone: '',
          pax: '',
          nationality: '',
          departure_city: '',
          destinations: '',
          travel_dates: '',
          hotel_preference: '',
          flight_requirements: '',
          special_requests: '',
          package_name: packageName,
          package_type: packageType,
          destination: destination
        })
      } else {
        setError(result.message || 'Failed to send enquiry. Please try again.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send enquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!isOpen) return null

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-4">
            Your enquiry for <strong>{packageName}</strong> has been submitted successfully. 
            We&apos;ll get back to you within 24 hours with detailed information and pricing.
          </p>
          <div className="flex gap-3">
            <Button 
              onClick={() => {
                setSuccess(false)
                onClose()
              }}
              className="flex-1 bg-[#14385C] hover:bg-[#14385C]/90"
            >
              Close
            </Button>
            <Button 
              onClick={() => setSuccess(false)}
              variant="outline"
              className="flex-1"
            >
              Send Another Enquiry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#14385C] text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Travel Enquiry</h2>
              <p className="text-blue-100 mt-1">Get personalized travel recommendations</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Package Info */}
        {(packageName !== "Travel Package" || destination) && (
          <div className="bg-blue-50 p-4 border-b">
            <div className="flex items-center gap-2 text-[#14385C]">
              <Mail className="h-4 w-4" />
              <span className="font-medium">Enquiring about:</span>
            </div>
            <p className="text-gray-700 mt-1">
              {packageName} {destination && `- ${destination}`}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Name *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Number *
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="Enter your contact number"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pax">
                Number of Travellers (adults + children with ages) *
              </Label>
              <Input
                id="pax"
                name="pax"
                type="text"
                value={formData.pax}
                onChange={handleInputChange}
                required
                placeholder="e.g., 2 Adults, 1 Child (5 years)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="nationality">
                Nationality of Travellers *
              </Label>
              <Input
                id="nationality"
                name="nationality"
                type="text"
                value={formData.nationality}
                onChange={handleInputChange}
                required
                placeholder="Enter nationality"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="departure_city">
                Departure City *
              </Label>
              <Input
                id="departure_city"
                name="departure_city"
                type="text"
                value={formData.departure_city}
                onChange={handleInputChange}
                required
                placeholder="Enter departure city"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="destinations">
                Destination(s) *
              </Label>
              <Input
                id="destinations"
                name="destinations"
                type="text"
                value={formData.destinations}
                onChange={handleInputChange}
                required
                placeholder="Enter destination(s)"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="travel_dates" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Travel Dates (start and return) *
              </Label>
              <Input
                id="travel_dates"
                name="travel_dates"
                type="text"
                value={formData.travel_dates}
                onChange={handleInputChange}
                required
                placeholder="e.g., 15 March 2024 - 22 March 2024"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="hotel_preference">
                Hotel Preference (3*, 4*, 5*, or ultra-luxury) *
              </Label>
              <Input
                id="hotel_preference"
                name="hotel_preference"
                type="text"
                value={formData.hotel_preference}
                onChange={handleInputChange}
                required
                placeholder="e.g., 4* or 5*"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="flight_requirements">
              Do you need flights included, or land arrangements only? *
            </Label>
            <Input
              id="flight_requirements"
              name="flight_requirements"
              type="text"
              value={formData.flight_requirements}
              onChange={handleInputChange}
              required
              placeholder="e.g., Flights included or Land only"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="special_requests">Any Special Requests</Label>
            <Textarea
              id="special_requests"
              name="special_requests"
              value={formData.special_requests}
              onChange={handleInputChange}
              placeholder="Tell us about any special requirements, dietary needs, accessibility requirements, or other preferences..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#14385C] hover:bg-[#14385C]/90"
            >
              {loading ? 'Sending...' : 'Send Enquiry'}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg text-center text-sm text-gray-600">
          <p>We&apos;ll respond to your enquiry within 24 hours with personalized recommendations and pricing.</p>
        </div>
      </div>
    </div>
  )
}
