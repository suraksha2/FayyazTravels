import ContactForm from '@/components/ContactForm'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600">
            Get in touch with our travel experts to plan your perfect trip
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <ContactForm />
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">📧 Email</h3>
                <p className="text-gray-600">info@travelcompany.com</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">📞 Phone</h3>
                <p className="text-gray-600">+65 6123 4567</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">🕒 Office Hours</h3>
                <p className="text-gray-600">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 9:00 AM - 2:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">📍 Address</h3>
                <p className="text-gray-600">
                  123 Travel Street<br />
                  Singapore 123456
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">⚡ Quick Response</h3>
                <p className="text-gray-600">
                  We typically respond to enquiries within 24 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
