'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface Enquiry {
  id: number
  name: string
  email: string
  phone?: string
  package_name?: string
  destination?: string
  travel_dates?: string
  pax?: string
  message?: string
  status: 'new' | 'contacted' | 'quoted' | 'booked' | 'cancelled'
  created_at: string
  updated_at: string
}

interface EnquiryStats {
  total_enquiries: number
  new_enquiries: number
  contacted_enquiries: number
  quoted_enquiries: number
  booked_enquiries: number
  this_week: number
  this_month: number
}

export default function AdminEnquiryDashboard() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [stats, setStats] = useState<EnquiryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [notifications, setNotifications] = useState<any[]>([])

  // WebSocket connection for real-time notifications
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3003')
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      
      if (notification.type === 'new_enquiry') {
        setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep last 10
        setEnquiries(prev => [notification.data, ...prev])
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('New Travel Enquiry', {
            body: `${notification.data.name} enquired about ${notification.data.package_name}`,
            icon: '/favicon.ico'
          })
        }
      }
    }

    ws.onopen = () => {
      console.log('Connected to notification service')
    }

    return () => ws.close()
  }, [])

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Fetch enquiries and stats
  useEffect(() => {
    fetchEnquiries()
    fetchStats()
  }, [statusFilter, searchTerm])

  const fetchEnquiries = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`http://localhost:3003/admin/enquiries?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setEnquiries(data.data.enquiries)
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3003/admin/enquiries/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const updateEnquiryStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`http://localhost:3003/admin/enquiries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        setEnquiries(prev => 
          prev.map(enquiry => 
            enquiry.id === id ? { ...enquiry, status: status as any } : enquiry
          )
        )
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'quoted': return 'bg-purple-100 text-purple-800'
      case 'booked': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="h-4 w-4" />
      case 'contacted': return <Clock className="h-4 w-4" />
      case 'quoted': return <Mail className="h-4 w-4" />
      case 'booked': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enquiry Dashboard</h1>
          <p className="text-gray-600">Manage and track travel enquiries</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enquiries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_enquiries}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Enquiries</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new_enquiries}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-green-600">{stats.this_week}</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.total_enquiries > 0 ? Math.round((stats.booked_enquiries / stats.total_enquiries) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search enquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="booked">Booked</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Recent Enquiries</h2>
        </div>
        
        <div className="divide-y">
          {enquiries.map((enquiry) => (
            <div key={enquiry.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{enquiry.name}</h3>
                    <Badge className={getStatusColor(enquiry.status)}>
                      {getStatusIcon(enquiry.status)}
                      <span className="ml-1 capitalize">{enquiry.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${enquiry.email}`} className="hover:text-blue-600">
                        {enquiry.email}
                      </a>
                    </div>
                    
                    {enquiry.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${enquiry.phone}`} className="hover:text-blue-600">
                          {enquiry.phone}
                        </a>
                      </div>
                    )}
                    
                    {enquiry.destination && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{enquiry.destination}</span>
                      </div>
                    )}
                  </div>
                  
                  {enquiry.package_name && (
                    <p className="text-sm text-blue-600 mt-1">📦 {enquiry.package_name}</p>
                  )}
                  
                  {enquiry.message && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {enquiry.message}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <select
                    value={enquiry.status}
                    onChange={(e) => updateEnquiryStatus(enquiry.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="booked">Booked</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                <span>Received: {new Date(enquiry.created_at).toLocaleString()}</span>
                {enquiry.travel_dates && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {enquiry.travel_dates}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
