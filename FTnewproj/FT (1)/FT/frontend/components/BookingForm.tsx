"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiFetch } from '@/lib/api'

interface BookingFormProps {
  packageId?: number
  packageTitle?: string
  packagePrice?: number
}

export default function BookingForm({ packageId, packageTitle, packagePrice }: BookingFormProps) {
  const searchParams = useSearchParams()
  
  // Get package details from URL parameters
  const urlPackageId = searchParams.get('packageId')
  const urlPackageTitle = searchParams.get('packageTitle')
  const urlPackagePrice = searchParams.get('packagePrice')
  
  const [formData, setFormData] = useState({
    package_id: packageId || urlPackageId || '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    travel_date: '',
    pax: '',
    special_requests: '',
    total_amount: packagePrice || urlPackagePrice || ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Calculate total amount when pax changes
    const currentPrice = packagePrice || parseFloat(urlPackagePrice || '0')
    if (name === 'pax' && currentPrice) {
      const paxCount = parseInt(value) || 0
      setFormData(prev => ({
        ...prev,
        total_amount: (currentPrice * paxCount).toString()
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.package_id || !formData.customer_name || !formData.customer_email || 
        !formData.travel_date || !formData.pax) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const bookingData = {
        package_id: parseInt(formData.package_id.toString()),
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone || null,
        travel_date: formData.travel_date,
        pax: parseInt(formData.pax),
        special_requests: formData.special_requests || null,
        total_amount: parseFloat(formData.total_amount.toString()) || 0
      }

      const response = await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      })
      
      setSuccess(true)
      setFormData({
        package_id: packageId || urlPackageId || '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        travel_date: '',
        pax: '',
        special_requests: '',
        total_amount: packagePrice || urlPackagePrice || ''
      })
    } catch (err: any) {
      setError(err.message || 'Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Booking Submitted!</h3>
        <p className="text-gray-600 mb-4">
          Your booking request has been submitted successfully. We'll confirm your booking and send payment details within 24 hours.
        </p>
        <Button 
          onClick={() => setSuccess(false)}
          className="bg-[#8B1F41] hover:bg-[#8B1F41]/90"
        >
          Make Another Booking
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {packageTitle || urlPackageTitle ? `Book ${packageTitle || urlPackageTitle}` : 'Create Booking'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!packageId && !urlPackageId && (
          <div>
            <Label htmlFor="package_id">Package ID *</Label>
            <Input
              id="package_id"
              name="package_id"
              type="number"
              value={formData.package_id}
              onChange={handleChange}
              disabled={loading}
              required
              className="mt-1"
              placeholder="Enter package ID"
            />
          </div>
        )}

        <div>
          <Label htmlFor="customer_name">Full Name *</Label>
          <Input
            id="customer_name"
            name="customer_name"
            type="text"
            value={formData.customer_name}
            onChange={handleChange}
            disabled={loading}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="customer_email">Email *</Label>
          <Input
            id="customer_email"
            name="customer_email"
            type="email"
            value={formData.customer_email}
            onChange={handleChange}
            disabled={loading}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="customer_phone">Phone</Label>
          <Input
            id="customer_phone"
            name="customer_phone"
            type="tel"
            value={formData.customer_phone}
            onChange={handleChange}
            disabled={loading}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="travel_date">Travel Date *</Label>
          <Input
            id="travel_date"
            name="travel_date"
            type="date"
            value={formData.travel_date}
            onChange={handleChange}
            disabled={loading}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="pax">Number of Travelers *</Label>
          <Input
            id="pax"
            name="pax"
            type="number"
            min="1"
            value={formData.pax}
            onChange={handleChange}
            disabled={loading}
            required
            className="mt-1"
          />
        </div>

        {(packagePrice || urlPackagePrice) && formData.pax && (
          <div>
            <Label>Total Amount</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <span className="text-lg font-semibold">
                ${((packagePrice || parseFloat(urlPackagePrice || '0')) * parseInt(formData.pax)).toFixed(2)}
              </span>
              <span className="text-sm text-gray-600 ml-2">
                (${packagePrice || urlPackagePrice} × {formData.pax} travelers)
              </span>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="special_requests">Special Requests</Label>
          <Textarea
            id="special_requests"
            name="special_requests"
            rows={3}
            value={formData.special_requests}
            onChange={handleChange}
            disabled={loading}
            className="mt-1"
            placeholder="Any special requirements, dietary restrictions, accessibility needs, etc."
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#8B1F41] hover:bg-[#8B1F41]/90"
        >
          {loading ? 'Creating Booking...' : 'Submit Booking Request'}
        </Button>
      </form>
    </div>
  )
}
