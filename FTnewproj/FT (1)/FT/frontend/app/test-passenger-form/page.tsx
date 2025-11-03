'use client'

import { useState } from 'react'
import PassengerDetailsForm, { type PassengerDetails, type ContactDetails } from '@/components/PassengerDetailsForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPassengerFormPage() {
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(1)
  const [infants, setInfants] = useState(0)
  const [passengerData, setPassengerData] = useState<PassengerDetails[]>([])
  const [contactData, setContactData] = useState<ContactDetails | null>(null)

  const handleDataChange = (passengers: PassengerDetails[], contact: ContactDetails) => {
    setPassengerData(passengers)
    setContactData(contact)
  }

  const handleSubmit = () => {
    console.log('Passenger Data:', passengerData)
    console.log('Contact Data:', contactData)
    
    // Simulate booking submission
    const bookingData = {
      package_id: 199,
      customer_name: contactData?.primaryContactName || '',
      customer_email: contactData?.primaryContactEmail || '',
      customer_phone: contactData?.primaryContactPhone || '',
      travel_date: '2024-12-15',
      pax: adults + children + infants,
      total_amount: 5000,
      special_requests: 'Test booking with passenger details',
      passenger_details: JSON.stringify(passengerData),
      contact_details: JSON.stringify(contactData)
    }
    
    alert('Check console for booking data. In real implementation, this would be sent to the backend.')
    console.log('Complete Booking Data:', bookingData)
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#002147] mb-4">
            Passenger Details Form Test
          </h1>
          <p className="text-gray-600">
            This page demonstrates the comprehensive passenger details form that collects information for all travelers.
          </p>
        </div>

        {/* Traveler Count Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Traveler Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Adults</label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{adults}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAdults(Math.min(8, adults + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Children</label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{children}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setChildren(Math.min(6, children + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Infants</label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setInfants(Math.max(0, infants - 1))}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{infants}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setInfants(Math.min(4, infants + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Total: {adults} adult{adults > 1 ? 's' : ''}
                {children > 0 && `, ${children} child${children > 1 ? 'ren' : ''}`}
                {infants > 0 && `, ${infants} infant${infants > 1 ? 's' : ''}`}
                {' '}({adults + children + infants} travelers)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Passenger Details Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Passenger & Contact Details</CardTitle>
          </CardHeader>
          <CardContent>
            <PassengerDetailsForm
              adults={adults}
              children={children}
              infants={infants}
              onDataChange={handleDataChange}
            />
          </CardContent>
        </Card>

        {/* Data Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Contact Information:</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {contactData ? JSON.stringify(contactData, null, 2) : 'No contact data yet'}
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Passenger Information ({passengerData.length} passengers):</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
                  {passengerData.length > 0 ? JSON.stringify(passengerData, null, 2) : 'No passenger data yet'}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="text-center">
          <Button 
            onClick={handleSubmit}
            className="bg-[#002147] hover:bg-[#001a38] text-white px-8 py-3 text-lg"
            disabled={!contactData || passengerData.length === 0}
          >
            Test Booking Submission
          </Button>
        </div>

        {/* Features List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Form Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Contact Details Tab:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Primary contact information</li>
                  <li>• Emergency contact details</li>
                  <li>• Address information</li>
                  <li>• Email validation</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Passenger Details Tab:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Individual forms for each traveler</li>
                  <li>• Passport information</li>
                  <li>• Date of birth validation</li>
                  <li>• Special requests per passenger</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Validation Features:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Real-time form validation</li>
                  <li>• Required field checking</li>
                  <li>• Email format validation</li>
                  <li>• Error highlighting</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">User Experience:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Tabbed interface</li>
                  <li>• Responsive design</li>
                  <li>• Clear passenger categorization</li>
                  <li>• Helpful instructions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
