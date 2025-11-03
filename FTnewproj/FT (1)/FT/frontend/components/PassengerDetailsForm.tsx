'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Baby, Users, Phone, Mail, Calendar, MapPin } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface PassengerDetails {
  id: string
  type: 'adult' | 'child' | 'infant'
  title: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  passportNumber: string
  passportExpiry: string
  gender: string
  specialRequests?: string
}

interface ContactDetails {
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  address: string
  city: string
  country: string
  postalCode: string
}

interface PassengerDetailsFormProps {
  adults: number
  children: number
  infants: number
  onDataChange: (passengers: PassengerDetails[], contact: ContactDetails) => void
  initialData?: {
    passengers: PassengerDetails[]
    contact: ContactDetails
  }
}

const titles = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof']
const countries = [
  'Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Philippines', 'Vietnam', 
  'India', 'China', 'Japan', 'South Korea', 'Australia', 'New Zealand', 
  'United Kingdom', 'United States', 'Canada', 'Germany', 'France', 'Other'
]

export default function PassengerDetailsForm({ 
  adults, 
  children, 
  infants, 
  onDataChange, 
  initialData 
}: PassengerDetailsFormProps) {
  const [passengers, setPassengers] = useState<PassengerDetails[]>([])
  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    address: '',
    city: '',
    country: 'Singapore',
    postalCode: ''
  })
  const [activeTab, setActiveTab] = useState('contact')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize passengers when counts change
  useEffect(() => {
    const newPassengers: PassengerDetails[] = []
    
    // Add adults
    for (let i = 0; i < adults; i++) {
      newPassengers.push({
        id: `adult-${i + 1}`,
        type: 'adult',
        title: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: 'Singapore',
        passportNumber: '',
        passportExpiry: '',
        gender: '',
        specialRequests: ''
      })
    }
    
    // Add children
    for (let i = 0; i < children; i++) {
      newPassengers.push({
        id: `child-${i + 1}`,
        type: 'child',
        title: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: 'Singapore',
        passportNumber: '',
        passportExpiry: '',
        gender: '',
        specialRequests: ''
      })
    }
    
    // Add infants
    for (let i = 0; i < infants; i++) {
      newPassengers.push({
        id: `infant-${i + 1}`,
        type: 'infant',
        title: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: 'Singapore',
        passportNumber: '',
        passportExpiry: '',
        gender: '',
        specialRequests: ''
      })
    }
    
    setPassengers(newPassengers)
  }, [adults, children, infants])

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      setPassengers(initialData.passengers)
      setContactDetails(initialData.contact)
    }
  }, [initialData])

  // Notify parent component of data changes
  useEffect(() => {
    onDataChange(passengers, contactDetails)
  }, [passengers, contactDetails, onDataChange])

  const updatePassenger = (id: string, field: keyof PassengerDetails, value: string) => {
    setPassengers(prev => prev.map(passenger => 
      passenger.id === id ? { ...passenger, [field]: value } : passenger
    ))
    
    // Clear error for this field
    if (errors[`${id}-${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`${id}-${field}`]
        return newErrors
      })
    }
  }

  const updateContactDetails = (field: keyof ContactDetails, value: string) => {
    setContactDetails(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Validate contact details
    if (!contactDetails.primaryContactName.trim()) {
      newErrors.primaryContactName = 'Primary contact name is required'
    }
    if (!contactDetails.primaryContactEmail.trim()) {
      newErrors.primaryContactEmail = 'Primary contact email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactDetails.primaryContactEmail)) {
      newErrors.primaryContactEmail = 'Please enter a valid email address'
    }
    if (!contactDetails.primaryContactPhone.trim()) {
      newErrors.primaryContactPhone = 'Primary contact phone is required'
    }
    
    // Validate passengers
    passengers.forEach(passenger => {
      if (!passenger.title) {
        newErrors[`${passenger.id}-title`] = 'Title is required'
      }
      if (!passenger.firstName.trim()) {
        newErrors[`${passenger.id}-firstName`] = 'First name is required'
      }
      if (!passenger.lastName.trim()) {
        newErrors[`${passenger.id}-lastName`] = 'Last name is required'
      }
      if (!passenger.dateOfBirth) {
        newErrors[`${passenger.id}-dateOfBirth`] = 'Date of birth is required'
      }
      if (!passenger.gender) {
        newErrors[`${passenger.id}-gender`] = 'Gender is required'
      }
      if (!passenger.nationality) {
        newErrors[`${passenger.id}-nationality`] = 'Nationality is required'
      }
      if (!passenger.passportNumber.trim()) {
        newErrors[`${passenger.id}-passportNumber`] = 'Passport number is required'
      }
      if (!passenger.passportExpiry) {
        newErrors[`${passenger.id}-passportExpiry`] = 'Passport expiry is required'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getPassengersByType = (type: 'adult' | 'child' | 'infant') => {
    return passengers.filter(p => p.type === type)
  }

  const renderPassengerForm = (passenger: PassengerDetails, index: number) => (
    <Card key={passenger.id} className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {passenger.type === 'adult' && <User className="w-5 h-5" />}
          {passenger.type === 'child' && <Users className="w-5 h-5" />}
          {passenger.type === 'infant' && <Baby className="w-5 h-5" />}
          {passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)} {index + 1}
        </CardTitle>
        <CardDescription>
          {passenger.type === 'adult' && 'Age 12 and above'}
          {passenger.type === 'child' && 'Age 2 to 11'}
          {passenger.type === 'infant' && 'Under 2 years'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`${passenger.id}-title`}>Title *</Label>
            <Select 
              value={passenger.title} 
              onValueChange={(value) => updatePassenger(passenger.id, 'title', value)}
            >
              <SelectTrigger className={errors[`${passenger.id}-title`] ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select title" />
              </SelectTrigger>
              <SelectContent>
                {titles.map(title => (
                  <SelectItem key={title} value={title}>{title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[`${passenger.id}-title`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${passenger.id}-title`]}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor={`${passenger.id}-firstName`}>First Name *</Label>
            <Input
              id={`${passenger.id}-firstName`}
              value={passenger.firstName}
              onChange={(e) => updatePassenger(passenger.id, 'firstName', e.target.value)}
              placeholder="Enter first name"
              className={errors[`${passenger.id}-firstName`] ? 'border-red-500' : ''}
            />
            {errors[`${passenger.id}-firstName`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${passenger.id}-firstName`]}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor={`${passenger.id}-lastName`}>Last Name *</Label>
            <Input
              id={`${passenger.id}-lastName`}
              value={passenger.lastName}
              onChange={(e) => updatePassenger(passenger.id, 'lastName', e.target.value)}
              placeholder="Enter last name"
              className={errors[`${passenger.id}-lastName`] ? 'border-red-500' : ''}
            />
            {errors[`${passenger.id}-lastName`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${passenger.id}-lastName`]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${passenger.id}-dateOfBirth`}>Date of Birth *</Label>
            <Input
              id={`${passenger.id}-dateOfBirth`}
              type="date"
              value={passenger.dateOfBirth}
              onChange={(e) => updatePassenger(passenger.id, 'dateOfBirth', e.target.value)}
              className={errors[`${passenger.id}-dateOfBirth`] ? 'border-red-500' : ''}
            />
            {errors[`${passenger.id}-dateOfBirth`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${passenger.id}-dateOfBirth`]}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor={`${passenger.id}-gender`}>Gender *</Label>
            <Select 
              value={passenger.gender} 
              onValueChange={(value) => updatePassenger(passenger.id, 'gender', value)}
            >
              <SelectTrigger className={errors[`${passenger.id}-gender`] ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors[`${passenger.id}-gender`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${passenger.id}-gender`]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${passenger.id}-nationality`}>Nationality *</Label>
            <Select 
              value={passenger.nationality} 
              onValueChange={(value) => updatePassenger(passenger.id, 'nationality', value)}
            >
              <SelectTrigger className={errors[`${passenger.id}-nationality`] ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[`${passenger.id}-nationality`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${passenger.id}-nationality`]}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor={`${passenger.id}-passportNumber`}>Passport Number *</Label>
            <Input
              id={`${passenger.id}-passportNumber`}
              value={passenger.passportNumber}
              onChange={(e) => updatePassenger(passenger.id, 'passportNumber', e.target.value.toUpperCase())}
              placeholder="Enter passport number"
              className={errors[`${passenger.id}-passportNumber`] ? 'border-red-500' : ''}
            />
            {errors[`${passenger.id}-passportNumber`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${passenger.id}-passportNumber`]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${passenger.id}-passportExpiry`}>Passport Expiry *</Label>
            <Input
              id={`${passenger.id}-passportExpiry`}
              type="date"
              value={passenger.passportExpiry}
              onChange={(e) => updatePassenger(passenger.id, 'passportExpiry', e.target.value)}
              className={errors[`${passenger.id}-passportExpiry`] ? 'border-red-500' : ''}
            />
            {errors[`${passenger.id}-passportExpiry`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`${passenger.id}-passportExpiry`]}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor={`${passenger.id}-specialRequests`}>Special Requests</Label>
          <Textarea
            id={`${passenger.id}-specialRequests`}
            value={passenger.specialRequests || ''}
            onChange={(e) => updatePassenger(passenger.id, 'specialRequests', e.target.value)}
            placeholder="Any dietary restrictions, accessibility needs, or special requests..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Contact Details
          </TabsTrigger>
          <TabsTrigger value="passengers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Passenger Details ({passengers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Primary Contact Information
              </CardTitle>
              <CardDescription>
                This person will receive all booking confirmations and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryContactName">Full Name *</Label>
                  <Input
                    id="primaryContactName"
                    value={contactDetails.primaryContactName}
                    onChange={(e) => updateContactDetails('primaryContactName', e.target.value)}
                    placeholder="Enter full name"
                    className={errors.primaryContactName ? 'border-red-500' : ''}
                  />
                  {errors.primaryContactName && (
                    <p className="text-red-500 text-sm mt-1">{errors.primaryContactName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="primaryContactEmail">Email Address *</Label>
                  <Input
                    id="primaryContactEmail"
                    type="email"
                    value={contactDetails.primaryContactEmail}
                    onChange={(e) => updateContactDetails('primaryContactEmail', e.target.value)}
                    placeholder="Enter email address"
                    className={errors.primaryContactEmail ? 'border-red-500' : ''}
                  />
                  {errors.primaryContactEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.primaryContactEmail}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryContactPhone">Phone Number *</Label>
                  <Input
                    id="primaryContactPhone"
                    value={contactDetails.primaryContactPhone}
                    onChange={(e) => updateContactDetails('primaryContactPhone', e.target.value)}
                    placeholder="Enter phone number"
                    className={errors.primaryContactPhone ? 'border-red-500' : ''}
                  />
                  {errors.primaryContactPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.primaryContactPhone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Emergency Contact
              </CardTitle>
              <CardDescription>
                Someone we can contact in case of emergency during your trip
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={contactDetails.emergencyContactName}
                    onChange={(e) => updateContactDetails('emergencyContactName', e.target.value)}
                    placeholder="Enter emergency contact name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={contactDetails.emergencyContactPhone}
                    onChange={(e) => updateContactDetails('emergencyContactPhone', e.target.value)}
                    placeholder="Enter emergency contact phone"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergencyContactRelation">Relationship</Label>
                <Select 
                  value={contactDetails.emergencyContactRelation} 
                  onValueChange={(value) => updateContactDetails('emergencyContactRelation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Sibling">Sibling</SelectItem>
                    <SelectItem value="Friend">Friend</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={contactDetails.address}
                  onChange={(e) => updateContactDetails('address', e.target.value)}
                  placeholder="Enter your address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={contactDetails.city}
                    onChange={(e) => updateContactDetails('city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select 
                    value={contactDetails.country} 
                    onValueChange={(value) => updateContactDetails('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={contactDetails.postalCode}
                    onChange={(e) => updateContactDetails('postalCode', e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passengers" className="space-y-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Passenger Information</h3>
            <p className="text-gray-600 text-sm">
              Please provide details for all travelers. Names must match passport exactly.
            </p>
          </div>

          {/* Adults */}
          {getPassengersByType('adult').length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Adults ({getPassengersByType('adult').length})
              </h4>
              {getPassengersByType('adult').map((passenger, index) => 
                renderPassengerForm(passenger, index)
              )}
            </div>
          )}

          {/* Children */}
          {getPassengersByType('child').length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Children ({getPassengersByType('child').length})
              </h4>
              {getPassengersByType('child').map((passenger, index) => 
                renderPassengerForm(passenger, index)
              )}
            </div>
          )}

          {/* Infants */}
          {getPassengersByType('infant').length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                <Baby className="w-4 h-4" />
                Infants ({getPassengersByType('infant').length})
              </h4>
              {getPassengersByType('infant').map((passenger, index) => 
                renderPassengerForm(passenger, index)
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Names must match passport exactly (including spelling and order)</li>
          <li>• Passport must be valid for at least 6 months from travel date</li>
          <li>• Children under 2 years travel as infants (may require birth certificate)</li>
          <li>• Special dietary requirements can be noted in individual passenger sections</li>
        </ul>
      </div>
    </div>
  )
}

export { type PassengerDetails, type ContactDetails }
