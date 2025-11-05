'use client'

import { useState, useRef, useEffect } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    Airwallex: {
      init: (config: { env: string; origin: string }) => void;
      createElement: (type: string, options: any) => any;
      confirmPaymentIntent: (options: any) => Promise<any>;
    };
  }
}

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Lock,
  Info
} from 'lucide-react'
import { 
  createPaymentIntent, 
  confirmPayment,
  type PaymentIntentRequest 
} from '@/lib/airwallex-client'
import { TEST_CARDS, AIRWALLEX_CONFIG } from '@/lib/airwallex-config'

interface AirwallexPaymentFormProps {
  bookingData: PaymentIntentRequest
  onSuccess: (result: any) => void
  onError: (error: string) => void
  onCancel?: () => void
}

interface PaymentState {
  status: 'idle' | 'initializing' | 'ready' | 'processing' | 'success' | 'error'
  error?: string
  paymentIntentId?: string
  bookingId?: number
}

export default function AirwallexPaymentForm({ 
  bookingData, 
  onSuccess, 
  onError,
  onCancel 
}: AirwallexPaymentFormProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>({ status: 'idle' })
  const [cardElement, setCardElement] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const cardElementRef = useRef<HTMLDivElement>(null)
  const [showTestCards, setShowTestCards] = useState(false)
  const [cardValid, setCardValid] = useState(false)
  const isInitializing = useRef(false)

  useEffect(() => {
    if (sdkLoaded && !isInitializing.current && paymentState.status === 'idle') {
      initializePayment()
    }
  }, [sdkLoaded, paymentState.status])

  useEffect(() => {
    if (paymentState.status === 'ready' && clientSecret && cardElementRef.current && !cardElement) {
      mountCardElement()
    }
  }, [paymentState.status, clientSecret, cardElement])

  useEffect(() => {
    return () => {
      if (cardElement) {
        try {
          cardElement.unmount?.()
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Error unmounting card element:', error)
          }
        }
      }
    }
  }, [cardElement])

  const initializePayment = async () => {
    // Prevent concurrent initialization calls
    if (isInitializing.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Payment initialization already in progress, skipping...')
      }
      return
    }
    
    // Additional protection: check if already initialized
    if (paymentState.status === 'ready' || paymentState.status === 'success') {
      if (process.env.NODE_ENV === 'development') {
        console.log('Payment already initialized, skipping...')
      }
      return
    }

    isInitializing.current = true

    try {
      setPaymentState({ status: 'initializing' })

      // Comprehensive input validation before API call
      if (!bookingData.total_amount || bookingData.total_amount <= 0) {
        throw new Error('Invalid payment amount: Amount must be greater than 0')
      }

      if (bookingData.total_amount > 999999) {
        throw new Error('Invalid payment amount: Amount exceeds maximum limit')
      }

      if (!bookingData.customer_email || !bookingData.customer_name) {
        throw new Error('Customer information is required: Name and email must be provided')
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(bookingData.customer_email)) {
        throw new Error('Invalid email format: Please provide a valid email address')
      }

      // Name validation
      if (bookingData.customer_name.trim().length < 2) {
        throw new Error('Invalid customer name: Name must be at least 2 characters long')
      }

      // Package ID validation
      if (!bookingData.package_id || bookingData.package_id <= 0) {
        throw new Error('Invalid package: Package ID is required')
      }

      // Travel date validation
      if (!bookingData.travel_date) {
        throw new Error('Travel date is required')
      }

      const travelDate = new Date(bookingData.travel_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (travelDate < today) {
        throw new Error('Invalid travel date: Travel date cannot be in the past')
      }

      // Passenger count validation
      if (!bookingData.adults || bookingData.adults <= 0) {
        throw new Error('Invalid passenger count: At least one adult is required')
      }

      if (bookingData.adults > 20) {
        throw new Error('Invalid passenger count: Maximum 20 adults allowed')
      }

      if (bookingData.children < 0 || bookingData.infants < 0) {
        throw new Error('Invalid passenger count: Children and infant counts cannot be negative')
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Input validation passed, creating payment intent...')
      }

      const paymentIntent = await createPaymentIntent(bookingData)

      // Comprehensive validation of payment intent response
      if (!paymentIntent) {
        throw new Error('Invalid payment intent response: No response received')
      }

      if (!paymentIntent.client_secret || typeof paymentIntent.client_secret !== 'string' || paymentIntent.client_secret.trim().length === 0) {
        throw new Error('Invalid payment intent response: Missing or invalid client_secret')
      }

      if (!paymentIntent.payment_intent_id || typeof paymentIntent.payment_intent_id !== 'string' || paymentIntent.payment_intent_id.trim().length === 0) {
        throw new Error('Invalid payment intent response: Missing or invalid payment_intent_id')
      }

      // Optional but recommended fields validation
      if (paymentIntent.booking_id && (typeof paymentIntent.booking_id !== 'number' || paymentIntent.booking_id <= 0)) {
        console.warn('Invalid booking_id in payment intent response:', paymentIntent.booking_id)
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Payment intent validation passed:', {
          client_secret: paymentIntent.client_secret.substring(0, 10) + '...',
          payment_intent_id: paymentIntent.payment_intent_id,
          booking_id: paymentIntent.booking_id
        })
      }

      setClientSecret(paymentIntent.client_secret)
      setPaymentState({ 
        status: 'ready',
        paymentIntentId: paymentIntent.payment_intent_id,
        bookingId: paymentIntent.booking_id
      })

      if (process.env.NODE_ENV === 'development') {
        console.log('Payment initialization complete')
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Payment initialization failed:', error)
      }
      const errorMessage = error.message || 'Failed to initialize payment'
      setPaymentState({ 
        status: 'error', 
        error: `${errorMessage}. Please check your information and try again.`
      })
      onError(errorMessage)
    } finally {
      isInitializing.current = false
    }
  }

  const mountCardElement = async () => {
    try {
      if (!clientSecret || !cardElementRef.current) {
        throw new Error('Missing client secret or card container')
      }

      if (!window.Airwallex) {
        throw new Error('Airwallex SDK not loaded')
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Mounting Airwallex card element...')
      }

      const element = window.Airwallex.createElement('card', {
        intent_id: paymentState.paymentIntentId!,
        client_secret: clientSecret,
        theme: {
          palette: {
            primary: '#002147',
            primaryText: '#002147',
            secondaryText: '#666666',
            border: '#e1e5e9',
            background: '#ffffff'
          }
        },
        style: {
          base: {
            fontSize: '16px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        }
      })

      element.mount(cardElementRef.current)

      element.on('ready', () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Card element ready')
        }
      })

      element.on('change', (event: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Card change event:', { 
            complete: event.complete, 
            error: event.error?.message,
            empty: event.empty 
          })
        }
        
        if (event.error) {
          setPaymentState(prev => ({ 
            ...prev, 
            error: event.error.message 
          }))
          setCardValid(false)
        } else {
          setPaymentState(prev => ({ 
            ...prev, 
            error: undefined 
          }))
          // Card is valid when complete and no errors
          setCardValid(event.complete || false)
        }
      })

      setCardElement(element)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Card element mounted successfully')
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to mount card element:', error)
      }
      setPaymentState({ 
        status: 'error', 
        error: error.message || 'Failed to load payment form' 
      })
    }
  }

  const handlePayment = async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('handlePayment called', {
        cardElement: !!cardElement,
        paymentIntentId: paymentState.paymentIntentId,
        cardValid,
        paymentStatus: paymentState.status
      })
    }
    
    if (!cardElement || !paymentState.paymentIntentId) {
      onError('Payment form not ready')
      return
    }

    if (!clientSecret) {
      onError('Payment session expired. Please refresh and try again.')
      return
    }

    try {
      setPaymentState(prev => ({ ...prev, status: 'processing' }))

      if (process.env.NODE_ENV === 'development') {
        console.log('Confirming payment...')
      }
      
      // Enhanced name splitting with fallback for single-word names
      const nameParts = bookingData.customer_name.trim().split(' ').filter(part => part.length > 0)
      const firstName = nameParts[0]
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0]
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Name splitting: "${bookingData.customer_name}" -> firstName: "${firstName}", lastName: "${lastName}"`)
      }

      const result = await window.Airwallex.confirmPaymentIntent({
        element: cardElement,
        id: paymentState.paymentIntentId!,
        client_secret: clientSecret,
        payment_method: {
          billing: {
            first_name: firstName,
            last_name: lastName,
            email: bookingData.customer_email,
            phone_number: bookingData.customer_phone
          }
        }
      })

      if (process.env.NODE_ENV === 'development') {
        console.log('Payment confirmation result:', result)
      }

      if (result.status === 'succeeded' || result.status === 'requires_capture') {
        setPaymentState({ 
          status: 'success',
          paymentIntentId: paymentState.paymentIntentId,
          bookingId: paymentState.bookingId
        })
        
        // Enhanced backend confirmation with proper error handling
        try {
          await confirmPayment(paymentState.paymentIntentId)
          if (process.env.NODE_ENV === 'development') {
            console.log('Backend confirmation successful')
          }
        } catch (confirmError: any) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Backend confirmation failed (payment succeeded):', confirmError)
          }
          // Payment succeeded but backend confirmation failed - notify user but proceed
          // This ensures consistency between frontend success state and user experience
          onSuccess({
            paymentIntentId: paymentState.paymentIntentId,
            bookingId: paymentState.bookingId,
            status: result.status,
            amount: bookingData.total_amount,
            requiresCapture: result.status === 'requires_capture',
            backendConfirmationFailed: true,
            confirmationError: confirmError.message || 'Backend confirmation failed'
          })
          return // Exit early to avoid double onSuccess call
        }
        
        onSuccess({
          paymentIntentId: paymentState.paymentIntentId,
          bookingId: paymentState.bookingId,
          status: result.status,
          amount: bookingData.total_amount,
          requiresCapture: result.status === 'requires_capture',
          backendConfirmationFailed: false
        })
      } else {
        throw new Error(result.error?.message || 'Payment failed')
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Payment failed:', error)
      }
      const errorMessage = error.message || 'Payment failed. Please try again.'
      setPaymentState({ 
        status: 'ready',
        error: errorMessage,
        paymentIntentId: paymentState.paymentIntentId,
        bookingId: paymentState.bookingId
      })
      onError(errorMessage)
    }
  }

  const renderPaymentStatus = () => {
    switch (paymentState.status) {
      case 'initializing':
        return (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#002147]" />
              <p className="text-gray-600">Initializing secure payment...</p>
            </div>
          </div>
        )
      
      case 'processing':
        return (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#002147]" />
              <p className="text-gray-600">Processing your payment...</p>
              <p className="text-sm text-gray-500 mt-2">Please do not refresh or close this page</p>
            </div>
          </div>
        )
      
      case 'success':
        return (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your booking has been confirmed.</p>
            </div>
          </div>
        )
      
      case 'error':
        return (
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {paymentState.error}
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setPaymentState({ status: 'idle' })
                  isInitializing.current = false
                }}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (paymentState.status === 'success') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          {renderPaymentStatus()}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Script
        src="https://checkout.airwallex.com/assets/elements.bundle.min.js"
        onLoad={() => {
          if (window.Airwallex) {
            try {
              window.Airwallex.init({
                env: AIRWALLEX_CONFIG.environment,
                origin: window.location.origin,
              })
              // Ensure SDK is fully initialized before proceeding
              if (process.env.NODE_ENV === 'development') {
                console.log(`Airwallex SDK initialized in ${AIRWALLEX_CONFIG.environment} environment`)
              }
              // Wait for SDK to be fully ready before setting loaded state
              setTimeout(() => setSdkLoaded(true), 100)
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Airwallex initialization failed:', error)
              }
              setPaymentState({
                status: 'error',
                error: 'Failed to initialize payment system'
              })
            }
          }
        }}
        onError={(e) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to load Airwallex SDK:', e)
          }
          const errorMessage = 'Failed to load payment system. Please refresh the page.'
          setPaymentState({
            status: 'error',
            error: errorMessage
          })
          // Notify parent component about SDK loading failure
          onError(errorMessage)
        }}
        strategy="afterInteractive"
      />
      
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Package:</span>
              <span>Package #{bookingData.package_id}</span>
            </div>
            <div className="flex justify-between">
              <span>Travelers:</span>
              <span>
                {bookingData.adults} Adults
                {bookingData.children > 0 && `, ${bookingData.children} Children`}
                {bookingData.infants > 0 && `, ${bookingData.infants} Infants`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Travel Date:</span>
              <span>{new Date(bookingData.travel_date).toLocaleDateString()}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span>S${bookingData.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Secure Payment
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Shield className="w-3 h-3 mr-1" />
              SSL Secured
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              PCI Compliant
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {(paymentState.status === 'error' || paymentState.status === 'initializing' || paymentState.status === 'processing') && renderPaymentStatus()}

          {paymentState.status === 'ready' && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">Card Information</h3>
                <div 
                  ref={cardElementRef}
                  className="min-h-[120px] p-4 border border-gray-200 rounded-lg bg-white"
                />
                {paymentState.error && (
                  <p className="text-red-600 text-sm mt-2">{paymentState.error}</p>
                )}
              </div>

              {process.env.NODE_ENV !== 'production' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Demo Mode - Test Cards</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTestCards(!showTestCards)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {showTestCards ? 'Hide' : 'Show'} Test Cards
                    </Button>
                  </div>
                  
                  {showTestCards && (
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-white p-2 rounded border">
                          <div className="font-medium text-green-700">✓ Success</div>
                          <div className="text-xs text-gray-600">{TEST_CARDS.success.number}</div>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <div className="font-medium text-red-700">✗ Decline</div>
                          <div className="text-xs text-gray-600">{TEST_CARDS.decline.number}</div>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <div className="font-medium text-orange-700">⚠ Insufficient</div>
                          <div className="text-xs text-gray-600">{TEST_CARDS.insufficientFunds.number}</div>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600">
                        Use any future expiry date and any 3-digit CVC
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                    disabled={paymentState.status === 'processing'}
                  >
                    Cancel
                  </Button>
                )}
                
                <Button
                  onClick={(e) => {
                    console.log('Button clicked!', {
                      disabled: paymentState.status !== 'ready' || !cardElement || !!paymentState.error || !cardValid,
                      paymentStatus: paymentState.status,
                      cardElement: !!cardElement,
                      cardValid,
                      hasError: !!paymentState.error,
                      event: e
                    });
                    if (paymentState.status === 'ready' && cardElement && !paymentState.error && cardValid) {
                      handlePayment();
                    } else {
                      console.log('Button click blocked due to conditions');
                    }
                  }}
                  disabled={
                    paymentState.status !== 'ready' || 
                    !cardElement ||
                    !!paymentState.error ||
                    !cardValid
                  }
                  className="flex-1 bg-[#002147] hover:bg-[#001a38] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentState.status === 'processing' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay S$${bookingData.total_amount.toFixed(2)}` 
                  )}
                </Button>
                
                {/* Debug information - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 p-2 bg-gray-100 text-xs rounded">
                    <div>Payment Status: {paymentState.status}</div>
                    <div>Card Element: {cardElement ? '✓' : '✗'}</div>
                    <div>Card Valid: {cardValid ? '✓' : '✗'}</div>
                    <div>Has Error: {paymentState.error ? '✓' : '✗'}</div>
                    {paymentState.error && <div>Error: {paymentState.error}</div>}
                    <div>Button Disabled: {(
                      paymentState.status !== 'ready' || 
                      !cardElement ||
                      !!paymentState.error ||
                      !cardValid
                    ) ? '✓' : '✗'}</div>
                    
                    {/* Force enable button for testing */}
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <button
                        onClick={() => {
                          console.log('Force enabling payment...');
                          setCardValid(true);
                          setPaymentState(prev => ({ ...prev, status: 'ready', error: undefined }));
                        }}
                        className="px-2 py-1 bg-yellow-500 text-white text-xs rounded mr-2"
                      >
                        Force Enable
                      </button>
                      <button
                        onClick={() => {
                          console.log('Force payment test...');
                          handlePayment();
                        }}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                      >
                        Force Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="text-xs text-gray-500 text-center">
            <p>Your payment is secured by Airwallex. We accept Visa, Mastercard, and American Express.</p>
            <p className="mt-1">By proceeding, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
}
