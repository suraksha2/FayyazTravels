"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      await apiFetch('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
      setMessage('Successfully subscribed to newsletter!')
      setEmail('')
    } catch (err: any) {
      if (err.message?.includes('already subscribed')) {
        setError('Email already subscribed')
      } else {
        setError('Failed to subscribe. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 bg-[#8B1F41] text-white text-center">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl font-semibold mb-6">
          Sign Up for our Newsletter
        </h2>
        
        <div className="mb-8">
          <p className="text-2xl mb-2">Save upto</p>
          <p className="text-4xl font-bold mb-4">S$ 4812.80*</p>
          <p className="text-sm text-white/80">
            Unlock Exclusive access to up coming packages and early bird discounts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-4">
          <div className="flex gap-2">
            <Input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
            />
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-white text-[#8B1F41] hover:bg-white/90 px-8"
            >
              {loading ? '...' : '→'}
            </Button>
          </div>
        </form>

        {message && (
          <p className="text-sm text-green-300 mb-2">{message}</p>
        )}
        {error && (
          <p className="text-sm text-red-300 mb-2">{error}</p>
        )}

        <p className="text-sm text-white/60">
          Terms and Conditions Apply*
        </p>
      </div>
    </section>
  )
}