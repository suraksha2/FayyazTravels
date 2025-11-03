"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/lib/api'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X } from "lucide-react"

// User interface
interface UserProfile {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  memberSince: number
  totalBookings: number
  countriesVisited: number
  createdAt: string
  updatedAt: string
}

export default function MyAccountPage() {
  const { user: authUser, token, isAuthenticated, isLoading: authLoading, login, clearCache } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch detailed user profile from backend
  const fetchUserProfile = async () => {
    if (!authUser?.email) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiFetch(`/profile/updated?user_email=${encodeURIComponent(authUser.email)}`)
      
      if (response.success && response.user) {
        setUserProfile(response.user)
        
        // Update AuthContext with correct user data if it's different
        const correctUserData = {
          id: response.user.id,
          name: `${response.user.firstName} ${response.user.lastName}`.trim(),
          email: response.user.email
        }
        
        if (authUser && (authUser.name !== correctUserData.name || authUser.id !== correctUserData.id)) {
          console.log('Updating AuthContext with correct user data:', correctUserData)
          login(token || '', correctUserData)
        }
      } else {
        throw new Error(response.message || 'Failed to fetch user profile')
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err)
      let errorMessage = 'Failed to load profile data'
      if (err.message.includes('404')) {
        errorMessage = 'User profile not found. Please try logging in again.'
      } else if (err.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.'
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (isAuthenticated && authUser) {
      fetchUserProfile()
    }
  }, [isAuthenticated, authLoading, authUser, router])

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile)
    }
  }, [userProfile])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#002147]"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchUserProfile} className="bg-[#002147] hover:bg-[#001a38]">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    if (userProfile && formData && authUser) {
      try {
        setLoading(true)
        setError(null)
        
        // Call backend API to update profile
        const response = await apiFetch(`/profile?user_email=${encodeURIComponent(authUser.email)}`, {
          method: 'PUT',
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            address: formData.address
          })
        })
        
        if (response.success) {
          // Refresh profile data from server to get latest info
          await fetchUserProfile()
          setIsEditing(false)
          
          // Update AuthContext with new name if it changed
          const newName = `${formData.firstName} ${formData.lastName}`.trim()
          if (authUser.name !== newName) {
            const updatedAuthUser = { ...authUser, name: newName }
            login(token || '', updatedAuthUser)
          }
          
          // Show success message
          setSuccessMessage('Profile updated successfully!')
          setTimeout(() => setSuccessMessage(null), 3000) // Clear after 3 seconds
        } else {
          throw new Error(response.message || 'Failed to update profile')
        }
      } catch (err: any) {
        console.error('Error saving profile:', err)
        setError(err.message || 'Failed to save profile')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCancel = () => {
    if (userProfile) {
      setFormData(userProfile)
    }
    setIsEditing(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile and account settings</p>
          
          {/* Debug: Show current auth user vs profile user */}
          {authUser && userProfile && authUser.name !== `${userProfile.firstName} ${userProfile.lastName}`.trim() && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4">
              <p className="text-sm">
                <strong>Data Mismatch Detected:</strong> Navbar shows "{authUser.name}" but profile shows "{userProfile.firstName} {userProfile.lastName}".
                <Button 
                  onClick={() => {
                    clearCache()
                    window.location.reload()
                  }}
                  className="ml-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1"
                >
                  Fix This
                </Button>
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-24 h-24 bg-[#002147] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {userProfile?.firstName} {userProfile?.lastName}
              </h3>
              <p className="text-gray-600 mb-4">{userProfile?.email}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <p className="flex items-center justify-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {userProfile?.phone || 'Not provided'}
                </p>
                <p className="flex items-center justify-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {userProfile?.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Travel Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bookings</span>
                  <span className="font-medium">{userProfile?.totalBookings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Countries Visited</span>
                  <span className="font-medium">{userProfile?.countriesVisited || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">{userProfile?.memberSince || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  <p className="text-sm">{successMessage}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="bg-[#002147] hover:bg-[#001a38]"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Notification Preferences
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Privacy Settings
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}