"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookingPackage, getPackageForBooking } from '@/lib/api'
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
import PassengerDetailsForm, { type PassengerDetails, type ContactDetails } from "@/components/PassengerDetailsForm"
import AirwallexPaymentForm from "@/components/AirwallexPaymentForm"
import { type PaymentIntentRequest } from "@/lib/airwallex-client"

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

// Remove old Airwallex config - now using centralized config
// Window.Airwallex type is declared in AirwallexPaymentForm.tsx

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
  const [passengerData, setPassengerData] = useState<PassengerDetails[]>([])
  const [contactData, setContactData] = useState<ContactDetails | null>(null)
  const [passengerFormValid, setPassengerFormValid] = useState(false)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [paymentResult, setPaymentResult] = useState<any>(null)

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
    let isMounted = true;
    const controller = new AbortController();

    const fetchPackageData = async () => {
      try {
        setLoading(true)
        const data = await getPackageForBooking(id as string)
        if (isMounted) {
          setPackageData(data)
          setError(null)
        }
      } catch (err) {
        if (isMounted && (err as any)?.name !== 'AbortError') {
          console.error('Error fetching package details:', err)
          setError('Failed to load package details')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (id) {
      fetchPackageData()
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id])

  // Update form values when counters change
  useEffect(() => {
    form.setValue('adults', adults.toString())
    form.setValue('children', children.toString())
    form.setValue('infants', infants.toString())
  }, [adults, children, infants, form])

  // Auto-advance to payment step when passenger details are complete
  useEffect(() => {
    if (currentStep === 2 && passengerFormValid && form.watch('travelDate')) {
      // Auto-advance is handled by user clicking Continue button
    }
  }, [currentStep, passengerFormValid, form])

  const handlePaymentSuccess = (result: any) => {
    console.log('Payment successful:', result)
    setPaymentResult(result)
    setPaymentCompleted(true)
    
    // Navigate to confirmation page
    const confirmationData = {
      bookingId: result.bookingId,
      packageId: id,
      packageName: packageData?.p_name,
      customerName: contactData?.primaryContactName || '',
      customerEmail: contactData?.primaryContactEmail || '',
      customerPhone: contactData?.primaryContactPhone || '',
      passengerDetails: passengerData,
      contactDetails: contactData,
      travelDate: form.getValues('travelDate'),
      adults: adults,
      children: children,
      infants: infants,
      totalAmount: calculateTotal(),
      paymentStatus: 'Completed',
      paymentIntentId: result.paymentIntentId,
      bookingDate: new Date().toISOString()
    }
    
    sessionStorage.setItem('bookingConfirmation', JSON.stringify(confirmationData))
    router.push('/booking-confirmation')
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    setError(error)
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

  // Get base price from package data (from database)
  const getBasePrice = () => {
    if (!packageData) return 2845;
    
    // Use display_price from API if available (from tbl_price table)
    if (packageData.display_price && packageData.display_price > 0) {
      return packageData.display_price;
    }
    
    // Fallback: try to extract from content
    const priceMatch = packageData.p_content?.match(/\$([\d,]+)/);
    if (priceMatch) {
      return parseInt(priceMatch[1].replace(',', ''));
    }
    
    return 2845;
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
    const basePrice = getBasePrice();
    const adultPrice = basePrice * adults;
    const childPrice = basePrice * 0.7 * children; // 30% discount for children
    const infantPrice = 0; // Infants usually free
    return Math.round(adultPrice + childPrice + infantPrice);
  }

  const handlePassengerDataChange = (passengers: PassengerDetails[], contact: ContactDetails) => {
    setPassengerData(passengers)
    setContactData(contact)
    
    // Validate if all required fields are filled
    const isContactValid = contact.primaryContactName.trim() !== '' && 
                          contact.primaryContactEmail.trim() !== '' && 
                          contact.primaryContactPhone.trim() !== '' &&
                          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.primaryContactEmail)
    
    const arePassengersValid = passengers.every(p => 
      p.title !== '' && 
      p.firstName.trim() !== '' && 
      p.lastName.trim() !== '' && 
      p.dateOfBirth !== '' && 
      p.gender !== '' && 
      p.nationality !== '' && 
      p.passportNumber.trim() !== '' && 
      p.passportExpiry !== ''
    )
    
    setPassengerFormValid(isContactValid && arePassengersValid)
  }

  const handleStepNavigation = () => {
    if (currentStep === 2) {
      // Validate passenger and contact details
      if (!passengerFormValid || !contactData) {
        alert('Please fill in all required passenger and contact details before proceeding.')
        return
      }
      
      // Update form with contact details for backward compatibility
      if (contactData) {
        form.setValue('firstName', contactData.primaryContactName.split(' ')[0] || '')
        form.setValue('lastName', contactData.primaryContactName.split(' ').slice(1).join(' ') || '')
        form.setValue('email', contactData.primaryContactEmail)
        form.setValue('phone', contactData.primaryContactPhone)
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (currentStep < 3) {
      handleStepNavigation()
      return
    }
    
    // For step 3, the payment is handled by AirwallexPaymentForm component
    // This function is mainly for navigation between steps
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
                    
                    <div className="mt-6">
                      <Button 
                        onClick={() => setCurrentStep(2)}
                        className="w-full bg-[#002147] hover:bg-[#001a38] text-white py-6 text-lg"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Passenger & Contact Details</h2>
                  <div className="mb-6">
                    <PassengerDetailsForm
                      adults={adults}
                      children={children}
                      infants={infants}
                      onDataChange={handlePassengerDataChange}
                    />
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
                  
                  <div className="mb-6">
                    <AirwallexPaymentForm
                      bookingData={{
                        package_id: parseInt(id as string),
                        customer_name: contactData?.primaryContactName || '',
                        customer_email: contactData?.primaryContactEmail || '',
                        customer_phone: contactData?.primaryContactPhone || '',
                        travel_date: form.getValues('travelDate') || '',
                        adults: adults,
                        children: children,
                        infants: infants,
                        total_amount: calculateTotal(),
                        special_requests: form.getValues('specialRequests') || '',
                        passenger_details: JSON.stringify(passengerData),
                        contact_details: JSON.stringify(contactData)
                      }}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={() => setCurrentStep(2)}
                    />
                  </div>
                </>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {currentStep === 2 && (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="travelDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Travel Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Special Requests</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional requirements for the entire group?" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </>
                  )}

                  {currentStep === 3 && (
                  <>

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
                                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.384a.64.64 0 0 1 .632-.537h6.61c2.667 0 4.719.892 5.778 2.586.488.776.78 1.625.887 2.588.107.962.054 2.054-.16 3.27l-.023.116c-.707 3.664-2.973 5.51-6.736 5.51h-1.95c-.525 0-.963.401-1.026.923l-.566 3.495a.64.64 0 0 1-.632.537l-.052-.001zm9.125-14.027c-.022-.097-.047-.186-.075-.27-.305-.877-1.001-1.328-2.093-1.328h-4.01a.332.332 0 0 0-.328.278l-1.413 8.977a.328.328 0 0 0 .325.379h1.527c.212 0 .392-.15.425-.36l.398-2.466a.415.415 0 0 1 .41-.35h.483c1.904 0 3.382-.616 4.39-1.829.498-.6.881-1.337 1.133-2.179a5.82 5.82 0 0 0 .216-1.256c.004-.116.004-.232 0-.347a2.44 2.44 0 0 0-.388-.249zm9.142-.031c-.21-.16-.44-.3-.683-.416a5.29 5.29 0 0 0-.772-.307 8.258 8.258 0 0 0-1.104-.27c-.21-.036-.425-.068-.642-.094-.213-.025-.43-.044-.648-.059-.22-.015-.443-.025-.668-.03-.223-.006-.448-.008-.674-.008h-5.5a.637.637 0 0 0-.63.535L12.74 19.997a.638.638 0 0 0 .63.74h4.607a.638.638 0 0 0 .63-.535l.551-3.45a.4.4 0 0 1 .396-.347h1.449c1.904 0 3.382-.616 4.39-1.829.498-.6.881-1.337 1.133-2.179.252-.842.372-1.737.36-2.684-.012-.946-.156-1.725-.432-2.383a2.968 2.968 0 0 0-1.112-1.001zm-2.679 4.935c-.124.524-.343.949-.655 1.265-.311.315-.7.545-1.162.687-.462.142-.98.213-1.55.213h-1.06a.32.32 0 0 1-.316-.268l-.606-3.884a.32.32 0 0 1 .316-.373h1.235c.52 0 .99.026 1.402.08.413.053.772.152 1.075.296.304.143.541.351.714.622.173.272.26.623.26 1.052 0 .428-.051.82-.153 1.179l-.5.131z" />
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
                            I agree to the <Link href="/terms" className="text-[#002147] hover:underline">Terms and Conditions</Link> and <Link href="/privacy" className="text-[#002147] hover:underline">Privacy Policy</Link>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  </>
                  )}
                  
                  <div className="flex gap-4">
                    {currentStep > 1 && (
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                    )}
                    
                    {currentStep < 3 ? (
                      <Button 
                        type="button"
                        onClick={handleStepNavigation}
                        className="flex-1 bg-[#002147] hover:bg-[#001a38] text-white py-6 text-lg"
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        className="flex-1 bg-[#002147] hover:bg-[#001a38] text-white py-6 text-lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Processing...
                          </span>
                        ) : (
                          "Complete Booking"
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
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
                    const travelDate = form.watch('travelDate') || ''
                    const dates = formatTravelDates(travelDate)
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
                      S${(calculateTotal() * 1.15).toLocaleString()}
                    </div>
                    <div className="font-bold text-[#002147]">
                      S${calculateTotal().toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="text-sm text-gray-600 mb-4">
                  {(() => {
                    const travelDate = form.watch('travelDate') || ''
                    const dates = formatTravelDates(travelDate)
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
                  leave an inquiry and we will get back to you soon.
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
  )
}
