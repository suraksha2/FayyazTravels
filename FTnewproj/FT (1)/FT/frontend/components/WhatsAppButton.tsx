'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WhatsAppButtonProps {
  packageName?: string
  destination?: string
  phoneNumber?: string
}

export default function WhatsAppButton({ 
  packageName = "Travel Package",
  destination = "",
  phoneNumber = "+6562352900" // Default Fayyaz Travels number
}: WhatsAppButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const generateWhatsAppMessage = () => {
    const message = `Hi! I'm interested in ${packageName}${destination ? ` for ${destination}` : ''}. 

Could you please provide more information about:
- Package details and itinerary
- Pricing and availability
- Travel dates and duration
- What's included in the package

Thank you!`

    return encodeURIComponent(message)
  }

  const handleWhatsAppClick = () => {
    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const quickMessages = [
    {
      title: "Package Details",
      message: `Hi! Can you tell me more about ${packageName}? I'd like to know the itinerary and what's included.`
    },
    {
      title: "Pricing Info",
      message: `Hello! What's the pricing for ${packageName}${destination ? ` to ${destination}` : ''}? Any current promotions?`
    },
    {
      title: "Availability",
      message: `Hi! Is ${packageName} available for the next 3 months? What are the available dates?`
    },
    {
      title: "Custom Package",
      message: `Hello! I'm interested in a customized travel package${destination ? ` to ${destination}` : ''}. Can we discuss my requirements?`
    }
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Menu */}
      {isExpanded && (
        <div className="mb-4 bg-white rounded-lg shadow-xl border p-4 w-80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Quick WhatsApp Messages</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {quickMessages.map((msg, index) => (
              <button
                key={index}
                onClick={() => {
                  const message = encodeURIComponent(msg.message)
                  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`
                  window.open(whatsappUrl, '_blank')
                  setIsExpanded(false)
                }}
                className="w-full text-left p-2 rounded-md hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                <div className="font-medium text-sm text-gray-800">{msg.title}</div>
                <div className="text-xs text-gray-600 mt-1 line-clamp-2">{msg.message}</div>
              </button>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t">
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded-md text-sm font-medium transition-colors"
            >
              💬 Send Custom Message
            </button>
          </div>
        </div>
      )}

      {/* Main WhatsApp Button */}
      <div className="relative">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        
        {/* Notification Badge */}
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          !
        </div>
      </div>

      {/* Tooltip */}
      {!isExpanded && (
        <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat with us on WhatsApp
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  )
}
