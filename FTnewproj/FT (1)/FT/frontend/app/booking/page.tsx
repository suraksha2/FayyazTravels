import BookingForm from '@/components/BookingForm'

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Book Your Trip</h1>
          <p className="text-lg text-gray-600">
            Ready to embark on your next adventure? Fill out the form below to create your booking.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <BookingForm />
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Booking Information</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">📋 What's Included</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Accommodation as per itinerary</li>
                  <li>• Daily breakfast</li>
                  <li>• Transportation as mentioned</li>
                  <li>• Professional tour guide</li>
                  <li>• All entrance fees</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">💳 Payment Options</h3>
                <p className="text-gray-600">
                  We accept all major credit cards, bank transfers, and PayPal. 
                  A deposit of 30% is required to confirm your booking.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">📞 Need Help?</h3>
                <p className="text-gray-600">
                  Our travel experts are here to help you plan the perfect trip. 
                  Call us at +65 6123 4567 or email info@travelcompany.com
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">🔒 Secure Booking</h3>
                <p className="text-gray-600">
                  Your personal information is protected with industry-standard 
                  encryption and security measures.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">✅ Confirmation Process</h3>
                <p className="text-gray-600">
                  After submitting your booking, we'll send you a confirmation 
                  email with payment details within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
