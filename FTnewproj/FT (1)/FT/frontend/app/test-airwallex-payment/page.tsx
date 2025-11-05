'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  CreditCard, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  Play,
  Loader2
} from 'lucide-react'
import AirwallexPaymentForm from '@/components/AirwallexPaymentForm'
import { TEST_CARDS } from '@/lib/airwallex-config'
import { type PaymentIntentRequest } from '@/lib/airwallex-client'

interface TestCase {
  id: string
  name: string
  description: string
  bookingData: PaymentIntentRequest
  expectedResult: 'success' | 'failure' | 'decline'
  testCard?: {
    number: string
    expiry: string
    cvc: string
    name: string
  }
}

const TEST_CASES: TestCase[] = [
  {
    id: 'success-single-adult',
    name: 'Single Adult Booking - Success',
    description: 'Test successful payment for a single adult traveler',
    bookingData: {
      package_id: 199,
      customer_name: 'John Doe',
      customer_email: 'john.doe@test.com',
      customer_phone: '+65 9123 4567',
      travel_date: '2024-12-15',
      adults: 1,
      children: 0,
      infants: 0,
      total_amount: 2500.00,
      special_requests: 'Window seat preference',
      passenger_details: JSON.stringify([{
        id: 'adult-1',
        type: 'adult',
        title: 'Mr',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1985-06-15',
        nationality: 'Singapore',
        passportNumber: 'E1234567',
        passportExpiry: '2030-06-15',
        gender: 'Male'
      }]),
      contact_details: JSON.stringify({
        primaryContactName: 'John Doe',
        primaryContactEmail: 'john.doe@test.com',
        primaryContactPhone: '+65 9123 4567'
      })
    },
    expectedResult: 'success',
    testCard: TEST_CARDS.success
  },
  {
    id: 'success-family-booking',
    name: 'Family Booking - Success',
    description: 'Test successful payment for family with adults and children',
    bookingData: {
      package_id: 200,
      customer_name: 'Jane Smith',
      customer_email: 'jane.smith@test.com',
      customer_phone: '+65 9876 5432',
      travel_date: '2024-12-20',
      adults: 2,
      children: 2,
      infants: 1,
      total_amount: 8500.00,
      special_requests: 'Vegetarian meals for all travelers',
      passenger_details: JSON.stringify([
        {
          id: 'adult-1',
          type: 'adult',
          title: 'Mrs',
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: '1980-03-20',
          nationality: 'Singapore',
          passportNumber: 'E2345678',
          passportExpiry: '2029-03-20',
          gender: 'Female'
        },
        {
          id: 'adult-2',
          type: 'adult',
          title: 'Mr',
          firstName: 'Robert',
          lastName: 'Smith',
          dateOfBirth: '1978-11-10',
          nationality: 'Singapore',
          passportNumber: 'E3456789',
          passportExpiry: '2028-11-10',
          gender: 'Male'
        }
      ]),
      contact_details: JSON.stringify({
        primaryContactName: 'Jane Smith',
        primaryContactEmail: 'jane.smith@test.com',
        primaryContactPhone: '+65 9876 5432',
        emergencyContactName: 'Mary Johnson',
        emergencyContactPhone: '+65 8765 4321',
        emergencyContactRelation: 'Mother'
      })
    },
    expectedResult: 'success',
    testCard: TEST_CARDS.success
  },
  {
    id: 'decline-insufficient-funds',
    name: 'Payment Decline - Insufficient Funds',
    description: 'Test payment decline due to insufficient funds',
    bookingData: {
      package_id: 95,
      customer_name: 'Test Decline',
      customer_email: 'decline@test.com',
      customer_phone: '+65 1111 2222',
      travel_date: '2024-12-25',
      adults: 1,
      children: 0,
      infants: 0,
      total_amount: 5000.00,
      special_requests: '',
      passenger_details: JSON.stringify([{
        id: 'adult-1',
        type: 'adult',
        title: 'Mr',
        firstName: 'Test',
        lastName: 'Decline',
        dateOfBirth: '1990-01-01',
        nationality: 'Singapore',
        passportNumber: 'E9999999',
        passportExpiry: '2029-01-01',
        gender: 'Male'
      }]),
      contact_details: JSON.stringify({
        primaryContactName: 'Test Decline',
        primaryContactEmail: 'decline@test.com',
        primaryContactPhone: '+65 1111 2222'
      })
    },
    expectedResult: 'decline',
    testCard: TEST_CARDS.insufficientFunds
  },
  {
    id: 'decline-generic',
    name: 'Payment Decline - Generic',
    description: 'Test generic payment decline',
    bookingData: {
      package_id: 182,
      customer_name: 'Generic Decline',
      customer_email: 'generic.decline@test.com',
      customer_phone: '+65 3333 4444',
      travel_date: '2024-12-30',
      adults: 1,
      children: 1,
      infants: 0,
      total_amount: 3500.00,
      special_requests: 'Test decline scenario',
      passenger_details: JSON.stringify([
        {
          id: 'adult-1',
          type: 'adult',
          title: 'Ms',
          firstName: 'Generic',
          lastName: 'Decline',
          dateOfBirth: '1985-05-15',
          nationality: 'Singapore',
          passportNumber: 'E8888888',
          passportExpiry: '2030-05-15',
          gender: 'Female'
        },
        {
          id: 'child-1',
          type: 'child',
          title: 'Miss',
          firstName: 'Little',
          lastName: 'Decline',
          dateOfBirth: '2015-08-20',
          nationality: 'Singapore',
          passportNumber: 'E7777777',
          passportExpiry: '2025-08-20',
          gender: 'Female'
        }
      ]),
      contact_details: JSON.stringify({
        primaryContactName: 'Generic Decline',
        primaryContactEmail: 'generic.decline@test.com',
        primaryContactPhone: '+65 3333 4444'
      })
    },
    expectedResult: 'decline',
    testCard: TEST_CARDS.decline
  }
]

export default function TestAirwallexPaymentPage() {
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { status: 'success' | 'failure' | 'pending', message: string, timestamp: Date }>>({})
  const [runningTest, setRunningTest] = useState<string | null>(null)
  const [customBooking, setCustomBooking] = useState<Partial<PaymentIntentRequest>>({
    package_id: 199,
    customer_name: 'Test User',
    customer_email: 'test@example.com',
    customer_phone: '+65 9999 8888',
    travel_date: '2024-12-31',
    adults: 1,
    children: 0,
    infants: 0,
    total_amount: 1000.00,
    special_requests: 'Custom test booking'
  })

  const handleTestSuccess = (testId: string, result: any) => {
    console.log(`Test ${testId} succeeded:`, result)
    setTestResults(prev => ({
      ...prev,
      [testId]: {
        status: 'success',
        message: `Payment successful. Booking ID: ${result.bookingId}, Payment Intent: ${result.paymentIntentId}`,
        timestamp: new Date()
      }
    }))
    setRunningTest(null)
    setSelectedTest(null)
  }

  const handleTestError = (testId: string, error: string) => {
    console.log(`Test ${testId} failed:`, error)
    setTestResults(prev => ({
      ...prev,
      [testId]: {
        status: 'failure',
        message: error,
        timestamp: new Date()
      }
    }))
    setRunningTest(null)
    setSelectedTest(null)
  }

  const runTest = (testCase: TestCase) => {
    setSelectedTest(testCase)
    setRunningTest(testCase.id)
    setTestResults(prev => ({
      ...prev,
      [testCase.id]: {
        status: 'pending',
        message: 'Test started...',
        timestamp: new Date()
      }
    }))
  }

  const runCustomTest = () => {
    if (!customBooking.package_id || !customBooking.customer_name || !customBooking.customer_email) {
      alert('Please fill in required fields for custom test')
      return
    }

    const customTestCase: TestCase = {
      id: 'custom-test',
      name: 'Custom Test',
      description: 'Custom booking test',
      bookingData: customBooking as PaymentIntentRequest,
      expectedResult: 'success'
    }

    setSelectedTest(customTestCase)
    setRunningTest('custom-test')
  }

  const getResultIcon = (status: 'success' | 'failure' | 'pending') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failure':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'pending':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
    }
  }

  const getResultBadge = (expectedResult: string) => {
    switch (expectedResult) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success Expected</Badge>
      case 'decline':
        return <Badge className="bg-red-100 text-red-800">Decline Expected</Badge>
      case 'failure':
        return <Badge className="bg-orange-100 text-orange-800">Failure Expected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#002147] mb-4 flex items-center gap-2">
            <TestTube className="w-8 h-8" />
            Airwallex Payment Integration Test Suite
          </h1>
          <p className="text-gray-600">
            Comprehensive testing environment for Airwallex payment integration with real API calls and test cards.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Cases */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Predefined Test Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {TEST_CASES.map((testCase) => (
                  <div key={testCase.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{testCase.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{testCase.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          {getResultBadge(testCase.expectedResult)}
                          {testCase.testCard && (
                            <Badge variant="outline" className="text-xs">
                              Card: {testCase.testCard.number}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Package: {testCase.bookingData.package_id} | 
                          Amount: S ${testCase.bookingData.total_amount.toFixed(2)} | 
                          Travelers: {testCase.bookingData.adults + testCase.bookingData.children + testCase.bookingData.infants}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {testResults[testCase.id] && getResultIcon(testResults[testCase.id].status)}
                        <Button
                          onClick={() => runTest(testCase)}
                          disabled={runningTest === testCase.id}
                          size="sm"
                          className="bg-[#002147] hover:bg-[#001a38]"
                        >
                          {runningTest === testCase.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Running...
                            </>
                          ) : (
                            'Run Test'
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {testResults[testCase.id] && (
                      <div className={`text-sm p-2 rounded ${
                        testResults[testCase.id].status === 'success' 
                          ? 'bg-green-50 text-green-800' 
                          : testResults[testCase.id].status === 'failure'
                          ? 'bg-red-50 text-red-800'
                          : 'bg-blue-50 text-blue-800'
                      }`}>
                        <div className="font-medium">
                          {testResults[testCase.id].status.toUpperCase()}: {testResults[testCase.id].message}
                        </div>
                        <div className="text-xs opacity-75">
                          {testResults[testCase.id].timestamp.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Custom Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Custom Test Case
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="package_id">Package ID</Label>
                    <Input
                      id="package_id"
                      type="number"
                      value={customBooking.package_id || ''}
                      onChange={(e) => setCustomBooking(prev => ({ ...prev, package_id: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="total_amount">Total Amount (S)</Label>
                    <Input
                      id="total_amount"
                      type="number"
                      step="0.01"
                      value={customBooking.total_amount || ''}
                      onChange={(e) => setCustomBooking(prev => ({ ...prev, total_amount: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_name">Customer Name</Label>
                    <Input
                      id="customer_name"
                      value={customBooking.customer_name || ''}
                      onChange={(e) => setCustomBooking(prev => ({ ...prev, customer_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_email">Customer Email</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={customBooking.customer_email || ''}
                      onChange={(e) => setCustomBooking(prev => ({ ...prev, customer_email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="travel_date">Travel Date</Label>
                    <Input
                      id="travel_date"
                      type="date"
                      value={customBooking.travel_date || ''}
                      onChange={(e) => setCustomBooking(prev => ({ ...prev, travel_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="adults">Adults</Label>
                    <Input
                      id="adults"
                      type="number"
                      min="1"
                      value={customBooking.adults || 1}
                      onChange={(e) => setCustomBooking(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="special_requests">Special Requests</Label>
                  <Textarea
                    id="special_requests"
                    value={customBooking.special_requests || ''}
                    onChange={(e) => setCustomBooking(prev => ({ ...prev, special_requests: e.target.value }))}
                    rows={2}
                  />
                </div>

                <Button
                  onClick={runCustomTest}
                  disabled={runningTest === 'custom-test'}
                  className="w-full bg-[#002147] hover:bg-[#001a38]"
                >
                  {runningTest === 'custom-test' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Custom Test...
                    </>
                  ) : (
                    'Run Custom Test'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Test Information & Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Test Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Demo Environment</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    All tests run in Airwallex demo mode with test cards. No real charges will be made.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="text-xs">
                      <div className="font-medium text-green-700">✓ Success Card</div>
                      <div className="text-gray-600">{TEST_CARDS.success.number}</div>
                    </div>
                    <div className="text-xs">
                      <div className="font-medium text-red-700">✗ Decline Card</div>
                      <div className="text-gray-600">{TEST_CARDS.decline.number}</div>
                    </div>
                    <div className="text-xs">
                      <div className="font-medium text-orange-700">⚠ Insufficient Funds</div>
                      <div className="text-gray-600">{TEST_CARDS.insufficientFunds.number}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Test Coverage</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Payment intent creation</li>
                    <li>• Card element mounting</li>
                    <li>• Payment confirmation</li>
                    <li>• Error handling</li>
                    <li>• Webhook processing</li>
                    <li>• Database integration</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Results Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.keys(testResults).length === 0 ? (
                    <p className="text-gray-500 text-sm">No tests run yet</p>
                  ) : (
                    Object.entries(testResults).map(([testId, result]) => (
                      <div key={testId} className="flex items-center gap-3 p-2 rounded border">
                        {getResultIcon(result.status)}
                        <div className="flex-1">
                          <div className="text-sm font-medium">{testId}</div>
                          <div className="text-xs text-gray-500">
                            {result.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Active Test */}
        {selectedTest && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Running Test: {selectedTest.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AirwallexPaymentForm
                  bookingData={selectedTest.bookingData}
                  onSuccess={(result) => handleTestSuccess(selectedTest.id, result)}
                  onError={(error) => handleTestError(selectedTest.id, error)}
                  onCancel={() => {
                    setSelectedTest(null)
                    setRunningTest(null)
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
