"use client"

import React from 'react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, MapPinIcon, UsersIcon, Clock3Icon } from "lucide-react"
import { apiFetch } from '@/lib/api'

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const data = await apiFetch('/bookings')
        setBookings(data)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('An unknown error occurred')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {loading ? (
            <div className="text-center py-10">Loading your bookings...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">Error: {error}</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">You don't have any upcoming bookings</p>
              <Button>Book a Trip</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          <div className="text-center py-10">
            <p className="text-gray-500">No past bookings found</p>
          </div>
        </TabsContent>
        
        <TabsContent value="cancelled">
          <div className="text-center py-10">
            <p className="text-gray-500">No cancelled bookings found</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BookingCard({ booking }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{booking.destination || 'Trip Booking'}</CardTitle>
        <CardDescription>Booking #{booking.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            <span>
              {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'Date not specified'} 
              {booking.endDate ? ` - ${new Date(booking.endDate).toLocaleDateString()}` : ''}
            </span>
          </div>
          <div className="flex items-center">
            <MapPinIcon className="mr-2 h-4 w-4 opacity-70" />
            <span>{booking.location || 'Location not specified'}</span>
          </div>
          <div className="flex items-center">
            <UsersIcon className="mr-2 h-4 w-4 opacity-70" />
            <span>{booking.guests || '0'} guests</span>
          </div>
          <div className="flex items-center">
            <Clock3Icon className="mr-2 h-4 w-4 opacity-70" />
            <span>Booked on {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'Unknown date'}</span>
          </div>
          <div className="mt-4">
            <Badge>{booking.status || 'Confirmed'}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">View Details</Button>
        <Button variant="outline" className="text-red-500">Cancel</Button>
      </CardFooter>
    </Card>
  )
}