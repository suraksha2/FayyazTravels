"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Calendar, Package, User, Settings, LogOut, Grid3X3 } from "lucide-react"

// User interface
interface User {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
}

// Mock user authentication - replace with your actual auth system
const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Simulate checking authentication status
    const checkAuth = () => {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
        setIsLoggedIn(true)
      } else {
        // Check if user should be logged in (you can modify this logic)
        const shouldBeLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
        if (shouldBeLoggedIn) {
          // Mock user data for demo
          const mockUser = {
            firstName: 'Bhushan',
            lastName: 'Patil',
            email: 'bhushan@example.com',
            phone: '+91 9876 543210',
            dateOfBirth: '1990-05-15',
            address: '123 Mumbai, India'
          }
          setUser(mockUser)
          setIsLoggedIn(true)
          localStorage.setItem('user', JSON.stringify(mockUser))
        }
      }
      setLoading(false)
    }
    
    // Add a small delay to simulate real auth check
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [])

  return { isLoggedIn, loading, user }
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

// Booking interface
interface Booking {
  id: number
  order_number: string
  package_name: string
  customer_name: string
  customer_email: string
  customer_phone: string
  date_ordered: string
  price: string
  status: string
  pax: number
  special_requests?: string
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const { isLoggedIn, loading, user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('All Transactions')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch bookings from API
  const fetchBookings = async () => {
    if (!user) {
      setError('User not logged in')
      setLoadingBookings(false)
      return
    }

    try {
      setLoadingBookings(true)
      setError(null)
      
      // Build query parameters for user identification
      const params = new URLSearchParams()
      
      // Use email for user identification (since we don't have user_id in the mock user object)
      if (user.email) {
        params.append('user_email', user.email)
      } else {
        throw new Error('User email not available for authentication')
      }
      
      const response = await fetch(`${API_BASE_URL}/bookings/details?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to fetch bookings: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setBookings(data.bookings || [])
      } else {
        throw new Error(data.message || 'Failed to fetch bookings')
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
      // Set empty array on error to prevent crashes
      setBookings([])
    } finally {
      setLoadingBookings(false)
    }
  }

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, loading, router])

  // Fetch bookings when component mounts and user is authenticated
  useEffect(() => {
    if (isLoggedIn && !loading) {
      fetchBookings()
    }
  }, [isLoggedIn, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#002147]"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return null // Will redirect to login
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'cancelled':
      case 'cancel':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getFilteredBookings = () => {
    if (activeTab === 'All Transactions') {
      return bookings
    }
    
    const statusMap: { [key: string]: string } = {
      'Completed': 'confirmed',
      'Pending': 'pending',
      'Cancel': 'cancelled'
    }
    
    const filterStatus = statusMap[activeTab]
    return bookings.filter(booking => 
      booking.status.toLowerCase() === filterStatus
    )
  }

  const filteredBookings = getFilteredBookings()

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg min-h-screen">
          {/* User Profile Section */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                B
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="py-4">
            <div className="px-6 py-3 bg-[#002147] text-white">
              <div className="flex items-center space-x-3">
                <Grid3X3 className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </div>
            </div>
            
            <button 
              onClick={() => setActiveTab('All Transactions')}
              className={`w-full px-6 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                activeTab === 'All Transactions' ? 'bg-gray-50 border-r-4 border-[#C69C3C]' : ''
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>All Transactions</span>
            </button>

            <div className="px-6 py-3">
              <div className="flex items-center space-x-3 text-gray-700">
                <User className="w-5 h-5" />
                <span>Profile</span>
                <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <button 
              onClick={() => router.push('/my-account')}
              className="w-full px-6 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Account Setting</span>
            </button>

            <button 
              onClick={() => {
                localStorage.removeItem('user')
                localStorage.removeItem('isLoggedIn')
                router.push('/login')
              }}
              className="w-full px-6 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              
              {/* Tabs */}
              <div className="flex space-x-8 mt-6">
                {['All Transactions', 'Completed', 'Pending', 'Cancel'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-[#C69C3C] text-[#C69C3C] font-medium'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Ordered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingBookings ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002147]"></div>
                          <span className="ml-2 text-gray-500">Loading bookings...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-red-500">
                          <p className="font-medium">Error loading bookings</p>
                          <p className="text-sm mt-1">{error}</p>
                          <button 
                            onClick={fetchBookings}
                            className="mt-3 px-4 py-2 bg-[#002147] text-white rounded-md hover:bg-[#003366] transition-colors"
                          >
                            Retry
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, index) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.order_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.package_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.date_ordered}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">S${booking.price}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-500">No bookings match the selected filter.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}