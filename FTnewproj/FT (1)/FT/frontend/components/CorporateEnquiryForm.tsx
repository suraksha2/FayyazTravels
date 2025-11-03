"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'

export default function CorporateEnquiryForm() {
  const [formData, setFormData] = useState({
    company: '',
    contact_person: '',
    email: '',
    phone: '',
    employees_count: '',
    travel_dates: '',
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
    
    if (!formData.company || !formData.contact_person || !formData.email || !formData.message) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await apiFetch('/corporate-enquiries', {
        method: 'POST',
        body: JSON.stringify({
          company: formData.company,
          contact_person: formData.contact_person,
          email: formData.email,
          phone: formData.phone || null,
          employees_count: formData.employees_count ? parseInt(formData.employees_count) : null,
          travel_dates: formData.travel_dates || null,
          message: formData.message
        })
      })
      
      setSuccess(true)
      setFormData({
        company: '',
        contact_person: '',
        email: '',
        phone: '',
        employees_count: '',
        travel_dates: '',
        message: ''
      })
    } catch (err: any) {
      setError(err.message || 'Failed to send corporate enquiry. Please try again.')
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
          Your corporate enquiry has been submitted successfully. Our corporate travel team will contact you within 24 hours.
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
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Corporate Travel Enquiry</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="company">Company Name *</Label>
          <Input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={handleChange}
            disabled={loading}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="contact_person">Contact Person *</Label>
          <Input
            id="contact_person"
            name="contact_person"
            type="text"
            value={formData.contact_person}
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
          <Label htmlFor="employees_count">Number of Employees</Label>
          <Input
            id="employees_count"
            name="employees_count"
            type="number"
            min="1"
            value={formData.employees_count}
            onChange={handleChange}
            disabled={loading}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="travel_dates">Preferred Travel Dates</Label>
          <Input
            id="travel_dates"
            name="travel_dates"
            type="text"
            placeholder="e.g., Q2 2024"
            value={formData.travel_dates}
            onChange={handleChange}
            disabled={loading}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="message">Requirements & Message *</Label>
          <Textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            disabled={loading}
            required
            className="mt-1"
            placeholder="Tell us about your corporate travel requirements, destinations, budget, etc..."
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
          {loading ? 'Sending...' : 'Send Corporate Enquiry'}
        </Button>
      </form>
    </div>
  )
}
