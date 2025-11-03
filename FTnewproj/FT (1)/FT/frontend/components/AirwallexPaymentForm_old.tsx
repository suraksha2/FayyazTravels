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
import { TEST_CARDS } from '@/lib/airwallex-config'

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
    if (isInitializing.current) return
    isInitializing.current = true

    try {
      setPaymentState({ status: 'initializing' })

      if (!bookingData.total_amount || bookingData.total_amount <= 0) {
        throw new Error('Invalid payment amount')
      }

      if (!bookingData.customer_email || !bookingData.customer_name) {
        throw new Error('Customer information is required')
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Creating payment intent...')
      }

      const paymentIntent = await createPaymentIntent(bookingData)

      if (!paymentIntent.client_secret || !paymentIntent.payment_intent_id) {
        throw new Error('Invalid payment intent response')
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
      console.error('Payment initialization failed:', error)
      const errorMessage = error.message || 'Failed to initialize payment'
      setPaymentState({ 
        status: 'error', 
        error: errorMessage 
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

      console.log('Mounting Airwallex card element...')

      // Use window.Airwallex API directly since loadCard import is not available
      if (!window.Airwallex) {
        throw new Error('Airwallex SDK not loaded')
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
        console.log('Card element ready')
      })

      element.on('change', (event: any) => {
        console.log('Card element changed:', event)
        if (event.error) {
          setPaymentState(prev => ({ 
            ...prev, 
            error: event.error.message 
          }))
        } else {
          setPaymentState(prev => ({ 
            ...prev, 
            error: undefined 
          }))
        }
      })

      element.on('focus', () => {
        console.log('Card element focused')
      })

      element.on('blur', () => {
        console.log('Card element blurred')
      })

      setCardElement(element)
      console.log('Card element mounted successfully')
    } catch (error: any) {
      console.error('Failed to mount card element:', error)
      setPaymentState({ 
        status: 'error', 
        error: error.message || 'Failed to load payment form' 
      })
    }
  }

  const handlePayment = async () => {
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

      console.log('Confirming payment...')
      
      const result = await window.Airwallex.confirmPaymentIntent({
        element: cardElement,
        id: paymentState.paymentIntentId!,
        client_secret: clientSecret,
        payment_method: {
          billing: {
            first_name: bookingData.customer_name.split(' ')[0],
            last_name: bookingData.customer_name.split(' ').slice(1).join(' '),
            email: bookingData.customer_email,
            phone_number: bookingData.customer_phone
          }
        }
      })

      console.log('Payment confirmation result:', result)

      if (result.status === 'succeeded') {
        setPaymentState({ 
          status: 'success',
          paymentIntentId: paymentState.paymentIntentId,
          bookingId: paymentState.bookingId
        })
        
        // Confirm with backend
        await confirmPayment(paymentState.paymentIntentId)
        
        onSuccess({
          paymentIntentId: paymentState.paymentIntentId,
          bookingId: paymentState.bookingId,
          status: result.status,
          amount: bookingData.total_amount
        })
      } else if (result.status === 'requires_capture') {
        // Payment authorized, needs capture (for some payment methods)
        setPaymentState({ status: 'success' })
        onSuccess({
          paymentIntentId: paymentState.paymentIntentId,
          bookingId: paymentState.bookingId,
          status: result.status,
          amount: bookingData.total_amount,
          requiresCapture: true
        })
      } else {
        throw new Error(result.error?.message || 'Payment failed')
      }
    } catch (error: any) {
      console.error('Payment failed:', error)
      setPaymentState({ 
        status: 'error', 
        error: error.message || 'Payment failed' 
      })
      onError(error.message || 'Payment failed')
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
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {paymentState.error}
            </AlertDescription>
          </Alert>
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
          console.log('Airwallex script loaded')
          if (window.Airwallex) {
            window.Airwallex.init({
              env: 'demo', // Use 'prod' for production
              origin: window.location.origin,
            })
          }
        }}
        strategy="lazyOnload"
      />
      
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Payment Summary */}
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
                <span>SGD ${bookingData.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
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
          {paymentState.status === 'error' && renderPaymentStatus()}
          
          {paymentState.status === 'initializing' && renderPaymentStatus()}
          
          {paymentState.status === 'processing' && renderPaymentStatus()}

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

              {/* Test Cards Info (Demo Mode) */}
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
                  onClick={handlePayment}
                  disabled={
                    paymentState.status !== 'ready' || 
                    !cardElement
                  }
                  className="flex-1 bg-[#002147] hover:bg-[#001a38] text-white"
                >
                  {paymentState.status === 'processing' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay SGD $${bookingData.total_amount.toFixed(2)}`
                  )}
                </Button>
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
