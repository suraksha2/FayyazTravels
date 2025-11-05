"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookingPackage, getPackageForBooking } from '@/lib/api'
import Script from 'next/script'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Check, 
  ChevronRight,
  CreditCard,
  Shield,
  Phone,
  Minus,
  Plus,
  User,
  Baby,
  MessageCircle
} from "lucide-react"
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import PassengerDetailsForm from "@/components/PassengerDetailsForm"

const formSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  travelDate: z.string().optional(),
  adults: z.string().min(1, {
    message: "At least 1 adult is required.",
  }),
  children: z.string(),
  infants: z.string(),
  specialRequests: z.string().optional(),
  paymentMethod: z.string().min(1, {
    message: "Please select a payment method.",
  }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions.",
  }),
})

// Airwallex configuration (DO NOT include secret API keys in client code)
const AIRWALLEX_CONFIG = {
  clientId: 'x2uUrKZcR8OXL3gQOICUKw',
  // apiKey intentionally omitted for security
  environment: 'demo' // Use 'prod' for production
}

declare global {
  interface Window {
    Airwallex: any;
  }
}

export default function BookingPage() {
  const { id } = useParams()
  const router = useRouter()
  const [packageData, setPackageData] = useState<BookingPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [airwallexLoaded, setAirwallexLoaded] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState<any>(null)
  const [passengerData, setPassengerData] = useState<any>(null)
  const [contactData, setContactData] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      travelDate: "",
      adults: "2",
      children: "0",
      infants: "0",
      specialRequests: "",
      paymentMethod: "credit-card",
      termsAccepted: false,
    },
  })

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setLoading(true)
        const data = await getPackageForBooking(id as string)
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

  // Update form values when counters change
  useEffect(() => {
    form.setValue('adults', adults.toString())
    form.setValue('children', children.toString())
    form.setValue('infants', infants.toString())
  }, [adults, children, infants, form])

  // Initialize Airwallex when moving to step 3
  useEffect(() => {
    if (currentStep === 3 && airwallexLoaded && !paymentIntent) {
      initializePayment()
    }
  }, [currentStep, airwallexLoaded, paymentIntent])

  const initializeAirwallex = () => {
    if (window.Airwallex) {
      window.Airwallex.init({
        env: AIRWALLEX_CONFIG.environment,
        origin: window.location.origin,
      })
      setAirwallexLoaded(true)
    }
  }

  const createPaymentIntent = async () => {
    try {
      const amount = calculateTotal()
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          currency: 'SGD',
          merchant_order_id: `booking-${id}-${Date.now()}`,
          customer: {
            first_name: form.getValues('firstName'),
            last_name: form.getValues('lastName'),
            email: form.getValues('email'),
            phone_number: form.getValues('phone'),
          }
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating payment intent:', error)
      // Fallback for demo purposes
      return {
        id: `demo_intent_${Date.now()}`,
        client_secret: `demo_secret_${Date.now()}`,
        amount: calculateTotal() * 100,
        currency: 'SGD'
      }
    }
  }

  const initializePayment = async () => {
    try {
      const intent = await createPaymentIntent()
      setPaymentIntent(intent)
      
      console.log('Payment intent created:', intent)
      
      // Check if this is demo mode
      if (intent.id && intent.id.startsWith('demo_intent_')) {
        console.log('Demo mode detected - showing demo payment form')
        const cardContainer = document.getElementById('airwallex-card')
        if (cardContainer) {
          cardContainer.innerHTML = `
            <div class="space-y-4 p-4 border rounded-lg bg-blue-50">
              <div class="text-sm text-blue-800 font-medium">🔧 Development Mode - Payment Simulation</div>
              <div class="text-xs text-blue-600">Airwallex API connection failed. Using demo mode for development.</div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input type="text" value="4111 1111 1111 1111" disabled class="w-full p-2 border rounded bg-gray-100" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                  <input type="text" value="12/25" disabled class="w-full p-2 border rounded bg-gray-100" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                  <input type="text" value="123" disabled class="w-full p-2 border rounded bg-gray-100" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                  <input type="text" value="Demo User" disabled class="w-full p-2 border rounded bg-gray-100" />
                </div>
              </div>
              <div class="text-xs text-blue-600 mt-2">
                Click "Complete Booking" to simulate successful payment.
              </div>
            </div>
          `
        }
      } else if (window.Airwallex && intent.client_secret) {
        console.log('Initializing real Airwallex card element...')
        const card = window.Airwallex.createElement('card', {
          intent_id: intent.id,
          client_secret: intent.client_secret,
        })
        
        card.mount('airwallex-card')
        console.log('Airwallex card element mounted successfully')
      }
    } catch (error) {
      console.error('Error initializing payment:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to initialize payment: ${errorMessage}`)
    }
  }

  const processPayment = async () => {
    console.log('Starting payment process...')
    console.log('Airwallex loaded:', !!window.Airwallex)
    console.log('Payment intent:', paymentIntent)

    // Check if we're in demo mode (fake payment intent)
    if (paymentIntent && paymentIntent.id && paymentIntent.id.startsWith('demo_intent_')) {
      console.log('Demo mode detected - simulating payment success')
      // In demo mode, simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 1200)) // Simulate processing time
      return {
        id: paymentIntent.id,
        status: 'succeeded',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        demo_mode: true
      }
    }

    if (!window.Airwallex) {
      console.error('Airwallex SDK not loaded')
      alert('Payment system is not ready. Please refresh the page and try again.')
      return false
    }

    if (!paymentIntent) {
      console.error('Payment intent not created')
      alert('Payment intent not created. Please try again.')
      return false
    }

    try {
      console.log('Attempting to confirm payment with Airwallex...')
      
      // Get the card element
      const cardElement = window.Airwallex.getElement ? window.Airwallex.getElement('card') : null
      if (!cardElement) {
        console.error('Card element not found')
        alert('Payment form not ready. Please refresh the page and try again.')
        return false
      }

      const { error, paymentIntent: confirmedIntent } = await window.Airwallex.confirmPaymentIntent({
        element: cardElement,
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
      })

      if (error) {
        console.error('Payment failed:', error)
        alert(`Payment failed: ${error.message || 'Unknown error occurred'}`)
        return false
      }

      console.log('Payment successful:', confirmedIntent)
      return confirmedIntent
    } catch (error) {
      console.error('Payment processing error:', error)
      
      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('network')) {
        alert('Network error. Please check your connection and try again.')
      } else if (errorMessage.includes('card')) {
        alert('Card information is invalid. Please check your card details.')
      } else {
        alert(`Payment processing failed: ${errorMessage || 'Please try again.'}`)
      }
      return false
    }
  }

  const incrementCounter = (type: 'adults' | 'children' | 'infants') => {
    if (type === 'adults') {
      setAdults(prev => Math.min(prev + 1, 8))
    } else if (type === 'children') {
      setChildren(prev => Math.min(prev + 1, 6))
    } else if (type === 'infants') {
      setInfants(prev => Math.min(prev + 1, 4))
    }
  }

  const decrementCounter = (type: 'adults' | 'children' | 'infants') => {
    if (type === 'adults') {
      setAdults(prev => Math.max(prev - 1, 1))
    } else if (type === 'children') {
      setChildren(prev => Math.max(prev - 1, 0))
    } else if (type === 'infants') {
      setInfants(prev => Math.max(prev - 1, 0))
    }
  }

  const extractPrice = (content: string = '') => {
    // Match $123,456 or 123,456 (tolerant)
    const priceMatch = content.match(/\$?([\d,]+)/)
    return priceMatch ? priceMatch[1] : '2845'
  }

  const extractDuration = (dayNight: string) => {
    if (!dayNight) return { days: 7, nights: 6 }
    
    const dayMatch = dayNight.match(/(\d+)D/)
    const nightMatch = dayNight.match(/(\d+)N/)
    
    return {
      days: dayMatch ? parseInt(dayMatch[1]) : 7,
      nights: nightMatch ? parseInt(nightMatch[1]) : 6
    }
  }

  const formatTravelDates = (startDate: string) => {
    if (!startDate) {
      // Default to a week from today
      const today = new Date()
      const start = new Date(today)
      start.setDate(today.getDate() + 7)
      
      const duration = extractDuration(packageData?.day_night || '')
      const end = new Date(start)
      end.setDate(start.getDate() + duration.days - 1)
      
      return {
        start: start.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        end: end.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      }
    }
    
    const start = new Date(startDate)
    const duration = extractDuration(packageData?.day_night || '')
    const end = new Date(start)
    end.setDate(start.getDate() + duration.days - 1)
    
    return {
      start: start.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
      end: end.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    }
  }

  const calculateTotal = () => {
    const basePrice = parseInt(extractPrice(packageData?.p_content || '').replace(/,/g, ''))
    const adultPrice = basePrice * adults
    const childPrice = basePrice * 0.7 * children // 30% discount for children
    const infantPrice = 0 // Infants usually free
    return Math.round(adultPrice + childPrice + infantPrice)
  }

  const handleStepNavigation = () => {
    if (currentStep === 1) {
      // Step 1: Room selection - just move to next step
      const selectedDate = form.getValues('travelDate')
      if (!selectedDate) {
        alert('Please select a travel date')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      // Step 2: Passenger details - validation handled by PassengerDetailsForm
      setCurrentStep(3)
    }
  }

  const handlePassengerSubmit = (passengers: any[], contact: any) => {
    setPassengerData(passengers)
    setContactData(contact)
    setCurrentStep(3)
  }

  const handleBackToStep = (step: number) => {
    setCurrentStep(step)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (currentStep < 3) {
      handleStepNavigation()
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Process payment first
      const paymentSuccess = await processPayment()
      
      if (!paymentSuccess) {
        setIsSubmitting(false)
        return
      }
      
      // If payment successful, save booking to database
      const bookingData = {
        package_id: parseInt(id as string),
        customer_name: `${contactData?.firstName} ${contactData?.lastName}`,
        customer_email: contactData?.email,
        customer_phone: contactData?.phone,
        travel_date: form.getValues('travelDate'),
        pax: adults + children + infants, // Backend expects total pax
        total_amount: calculateTotal(),
        special_requests: passengerData?.map((p: any) => p.specialRequests).filter(Boolean).join('; ') || null,
        passenger_details: passengerData,
        contact_details: contactData,
      }
      
      console.log('Saving booking to database:', bookingData)
      
      // Save booking to database
      const bookingResponse = await fetch('http://localhost:3003/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })
      
      if (!bookingResponse.ok) {
        throw new Error('Failed to save booking to database')
      }
      
      const savedBooking = await bookingResponse.json()
      console.log('Booking saved successfully:', savedBooking)
      
      // Navigate to confirmation page with booking details
      const confirmationData = {
        bookingId: savedBooking.id,
        packageId: id,
        packageName: packageData?.p_name,
        customerName: `${contactData?.firstName} ${contactData?.lastName}`,
        customerEmail: contactData?.email,
        customerPhone: contactData?.phone,
        travelDate: form.getValues('travelDate'),
        adults: adults,
        children: children,
        infants: infants,
        totalAmount: calculateTotal(),
        paymentStatus: paymentSuccess.demo_mode ? 'Demo Payment' : 'Completed',
        bookingDate: new Date().toISOString()
      }
      
      // Store confirmation data in sessionStorage for the confirmation page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('bookingConfirmation', JSON.stringify(confirmationData))
      }
      
      router.push('/booking-confirmation')
      
    } catch (error) {
      console.error('Booking submission error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`There was an error processing your booking: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002147]"></div>
      </div>
    )
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-16">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700 mb-6">{error || 'Package not found'}</p>
        <Link href="/packages">
          <Button>Return to Packages</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://checkout.airwallex.com/assets/elements.bundle.min.js"
        onLoad={initializeAirwallex}
        strategy="lazyOnload"
      />
      
    <main className="min-h-screen bg-gray-50 pt-24 pb-16">
      {/* Package Header */}
      <div className="bg-white py-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <img 
              src={packageData.feature_img || '/api/placeholder/80/80'} 
              alt={packageData.p_name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-[#002147]">{packageData.p_name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span>{packageData.day_night || '7D | 6N'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white py-4 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              <div className={`flex items-center gap-2 ${
                currentStep >= 1 ? 'text-[#002147]' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-[#002147] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="font-medium">BookingDetails</span>
              </div>
              
              <div className={`w-12 h-0.5 ${
                currentStep >= 2 ? 'bg-[#002147]' : 'bg-gray-200'
              }`}></div>
              
              <div className={`flex items-center gap-2 ${
                currentStep >= 2 ? 'text-[#002147]' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'bg-[#002147] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="font-medium">BookingConfirmation</span>
              </div>
              
              <div className={`w-12 h-0.5 ${
                currentStep >= 3 ? 'bg-[#002147]' : 'bg-gray-200'
              }`}></div>
              
              <div className={`flex items-center gap-2 ${
                currentStep >= 3 ? 'text-[#002147]' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 3 ? 'bg-[#002147] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <span className="font-medium">PaymentConfirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              {currentStep === 1 && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Room Selection</h2>
                  
                  {/* Room Configuration */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Room 1:</h3>
                    <div className="space-y-6">
                      {/* Adults */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-[#002147]" />
                          <div>
                            <div className="font-medium">Adults (12+)</div>
                            <div className="text-sm text-gray-500">Age 12 and above</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => decrementCounter('adults')}
                            disabled={adults <= 1}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{adults}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => incrementCounter('adults')}
                            disabled={adults >= 8}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-[#002147]" />
                          <div>
                            <div className="font-medium">Children (2-11)</div>
                            <div className="text-sm text-gray-500">Age 2 to 11</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => decrementCounter('children')}
                            disabled={children <= 0}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{children}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => incrementCounter('children')}
                            disabled={children >= 6}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Baby className="w-5 h-5 text-[#002147]" />
                          <div>
                            <div className="font-medium">Infants (0-2)</div>
                            <div className="text-sm text-gray-500">Under 2 years</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => decrementCounter('infants')}
                            disabled={infants <= 0}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{infants}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => incrementCounter('infants')}
                            disabled={infants >= 4}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {adults} adult{adults > 1 ? 's' : ''}
                        {children > 0 && `, ${children} child${children > 1 ? 'ren' : ''}`}
                        {infants > 0 && `, ${infants} infant${infants > 1 ? 's' : ''}`}
                        {' '}(1 room)
                      </p>
                    </div>
                    
                    {/* Travel Date Selection */}
                    <div className="mt-6 p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">Select Travel Date</h4>
                      <Input
                        type="date"
                        value={form.watch('travelDate') || ''}
                        onChange={(e) => form.setValue('travelDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full"
                        required
                      />
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        onClick={handleStepNavigation}
                        className="w-full bg-[#002147] hover:bg-[#001a38] text-white py-6 text-lg"
                        disabled={!form.watch('travelDate')}
                      >
                        Continue to Passenger Details
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <PassengerDetailsForm
                  adults={adults}
                  children={children}
                  infants={infants}
                  onSubmit={handlePassengerSubmit}
                  onBack={() => handleBackToStep(1)}
                  loading={isSubmitting}
                />
              )}

              {currentStep === 3 && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
                  
                  <div className="mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-blue-900 mb-2">Payment Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Package Total:</span>
                          <span>SGD ${calculateTotal().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Guests:</span>
                          <span>{adults} Adults, {children} Children, {infants} Infants</span>
                        </div>
                        <div className="flex justify-between font-semibold text-blue-900 border-t pt-2">
                          <span>Total Amount:</span>
                          <span>SGD ${calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">Credit Card Information</h3>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div id="airwallex-card" className="min-h-[200px]">
                          {!airwallexLoaded && (
                            <div className="flex items-center justify-center h-48">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002147] mx-auto mb-2"></div>
                                <p className="text-gray-600">Loading payment form...</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Your payment is secured by Airwallex. We accept Visa, Mastercard, and American Express.
                      </p>
                    </div>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Payment Method</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="credit-card" />
                                  </FormControl>
                                  <FormLabel className="font-normal flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    Credit Card
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="bank-transfer" />
                                  </FormControl>
                                  <FormLabel className="font-normal flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Bank Transfer
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="paypal" />
                                  </FormControl>
                                  <FormLabel className="font-normal flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.384a.64.64 0 0 1 .632-.537h6.61c2.667 0 4.719.892 5.778 2.586.488.776.78 1.625.887 2.588.107.962.054 2.054-.16 3.27l-.023.116c-.707 3.664-2.973 5.51-6.736 5.51h-1.95c-.525 0-.963.401-1.026.923l-.566 3.495a.64.64 0 0 1-.632.537l-.052-.001z" />
                                    </svg>
                                    PayPal
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="termsAccepted"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I agree to the Terms and Conditions and Privacy Policy
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-4">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => handleBackToStep(2)}
                          className="flex-1"
                          disabled={isSubmitting}
                        >
                          Back
                        </Button>
                        
                        <Button 
                          type="submit" 
                          className="flex-1 bg-[#002147] hover:bg-[#001a38] text-white py-6 text-lg"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Processing...' : 'Complete Booking'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </>
              )}
            </div>
          </div>

          {/* Package Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">{packageData.p_name}</h3>
                <div className="text-sm text-gray-600 mb-4">
                  {packageData.day_night || '7D | 6N'}
                </div>
                
                {/* Travel Dates */}
                <div className="text-sm text-gray-600 mb-4">
                  {(() => {
                    const dates = formatTravelDates(form.watch('travelDate') || '')
                    const duration = extractDuration(packageData?.day_night || '')
                    return (
                      <>
                        {dates.start} - {dates.end}<br />
                        {duration.days} days ({adults + children + infants} guest{(adults + children + infants) > 1 ? 's' : ''} • 1 Room)
                      </>
                    )
                  })()}
                </div>
              </div>

              <div className="border-t border-b py-4 space-y-2">
                <div className="flex justify-between text-lg">
                  <span>Package</span>
                  <div className="text-right">
                    <div className="line-through text-gray-400 text-sm">
                      SGD $ {(calculateTotal() * 1.15).toLocaleString()}
                    </div>
                    <div className="font-bold text-[#002147]">
                      SGD $ {calculateTotal().toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="text-sm text-gray-600 mb-4">
                  {(() => {
                    const dates = formatTravelDates(form.watch('travelDate') || '')
                    return `${dates.start} - ${dates.end}`
                  })()}
                </div>
                <div className="text-sm text-gray-600">
                  {extractDuration(packageData?.day_night || '').days} days (1 Room • {adults + children + infants} guest{(adults + children + infants) > 1 ? 's' : ''})
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-4">Need help with your booking?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Leave an inquiry and we will get back to you soon.
                </p>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 text-[#002147] border-[#002147]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Live Chat
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-[#002147]">
                    <Phone className="w-5 h-5" />
                    <span className="font-semibold">Call Us</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  )
}
