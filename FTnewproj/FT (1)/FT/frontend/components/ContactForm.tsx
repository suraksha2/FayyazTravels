"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travel_dates: '',
    pax: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('http://localhost:3003/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          travel_dates: formData.travel_dates || null,
          pax: formData.pax ? parseInt(formData.pax) : null,
          message: formData.message
        })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        console.log('Enquiry submitted:', data)
      }
      
      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        travel_dates: '',
        pax: '',
        message: ''
      })
    } catch (err: any) {
      console.error('Enquiry submission error:', err)
      setError(err.message || 'Failed to send enquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Thank You!</h3>
        <p className="text-gray-600 mb-4">
          Your enquiry has been submitted successfully. We'll get back to you within 24 hours.
        </p>
        <Button 
          onClick={() => setSuccess(false)}
          className="bg-[#8B1F41] hover:bg-[#8B1F41]/90"
        >
          Send Another Enquiry
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Contact Us</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="travel_dates">Travel Dates</Label>
          <Input
            id="travel_dates"
            name="travel_dates"
            type="text"
            placeholder="e.g., March 2024"
            value={formData.travel_dates}
            onChange={handleChange}
            disabled={loading}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="pax">Number of Travelers</Label>
          <Input
            id="pax"
            name="pax"
            type="number"
            min="1"
            value={formData.pax}
            onChange={handleChange}
            disabled={loading}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="message">Message *</Label>
          <Textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            disabled={loading}
            required
            className="mt-1"
            placeholder="Tell us about your travel requirements..."
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
          {loading ? 'Sending...' : 'Send Enquiry'}
        </Button>
      </form>
    </div>
  )
}
