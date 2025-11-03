# Airwallex.js Integration Guide for FT Travel Booking System

## Overview
This guide provides complete instructions for integrating Airwallex.js payment processing into the FT travel booking system. The integration will replace the current manual booking confirmation process with real-time payment processing.

## Current System Analysis

### Frontend (Next.js 13.5.1)
- ✅ Airwallex SDK already installed: `@airwallex/components-sdk: ^1.26.0`
- Current flow: `BookingForm.tsx` → `/bookings` API → Manual confirmation
- Uses `apiFetch` utility for backend communication (port 3003)

### Backend (Node.js/Fastify)
- ✅ Airwallex Node SDK already installed: `@airwallex/node-sdk: ^2.0.0-beta.4`
- Current flow: Creates pending bookings in `tbl_booking` table
- Database schema supports payment tracking via `booking_status` field

## Required Airwallex Account Setup

### 1. Dashboard Configuration
**Provide to Windsurf:**
- Airwallex Dashboard access or screenshots of:
  - Project ID from Dashboard > Overview
  - Enabled Products (ensure "Payments" is activated)
  - Environment settings (start with Demo mode)

### 2. API Credentials (Secure Handover Required)
**Create .env files with these values:**

```bash
# Backend .env
AIRWALLEX_API_KEY=sk_test_[your_demo_key]  # From Dashboard > Developers > API Keys
AIRWALLEX_CLIENT_ID=app_[your_client_id]   # From Dashboard > Developers > Apps
AIRWALLEX_ENV=demo                         # Use 'demo' for testing, 'prod' for live
AIRWALLEX_WEBHOOK_SECRET=whsec_[secret]    # From Dashboard > Developers > Webhooks

# Frontend .env.local
NEXT_PUBLIC_AIRWALLEX_ENV=demo
```

### 3. Webhook Configuration
**Set up in Dashboard > Developers > Webhooks:**
- Endpoint URL: `https://yourdomain.com/api/webhooks/airwallex`
- Events to subscribe: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copy the webhook signing secret for verification

## Implementation Steps

### Phase 1: Backend Payment Intent API

#### 1.1 Create Payment Intent Controller
**File:** `/backend/controllers/payment.controller.js`

```javascript
const Airwallex = require('@airwallex/node-sdk');
const db = require('../db');

// Initialize Airwallex client
const airwallex = new Airwallex({
  apiKey: process.env.AIRWALLEX_API_KEY,
  env: process.env.AIRWALLEX_ENV // 'demo' or 'prod'
});

exports.createPaymentIntent = async (req, reply) => {
  try {
    const {
      package_id,
      customer_name,
      customer_email,
      customer_phone,
      travel_date,
      pax,
      total_amount,
      special_requests
    } = req.body;

    // Validation
    if (!package_id || !customer_name || !customer_email || !travel_date || !pax || !total_amount) {
      return reply.status(400).send({
        error: 'Missing required fields',
        required: ['package_id', 'customer_name', 'customer_email', 'travel_date', 'pax', 'total_amount']
      });
    }

    // Create payment intent with Airwallex
    const paymentIntent = await airwallex.paymentIntents.create({
      amount: Math.round(parseFloat(total_amount) * 100), // Convert to cents
      currency: 'SGD', // Adjust based on your business needs
      merchant_order_id: `FT-${Date.now()}`, // Unique order reference
      metadata: {
        package_id: package_id.toString(),
        customer_name,
        customer_email,
        travel_date,
        pax: pax.toString(),
        special_requests: special_requests || ''
      }
    });

    // Store pending booking in database with payment_intent_id
    const nameParts = customer_name.trim().split(' ');
    const bookingData = {
      user_id: 0,
      package_id: parseInt(package_id),
      booking_amount: parseFloat(total_amount),
      arrival_date: travel_date,
      totaladults: parseInt(pax),
      primary_fname: nameParts[0] || '',
      primary_lname: nameParts.slice(1).join(' ') || '',
      primary_email: customer_email,
      primary_phone: customer_phone || '',
      special_requests: special_requests || '',
      booking_status: 0, // Pending payment
      payment_intent_id: paymentIntent.id, // Store Airwallex payment intent ID
      insert_date: new Date(),
      edit_date: new Date(),
      status: 1
    };

    const result = await new Promise((resolve, reject) => {
      db.query('INSERT INTO tbl_booking SET ?', bookingData, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    reply.send({
      success: true,
      client_secret: paymentIntent.client_secret,
      booking_id: result.insertId,
      payment_intent_id: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment intent creation failed:', error);
    reply.status(500).send({
      error: 'Failed to create payment intent',
      details: error.message
    });
  }
};

exports.confirmPayment = async (req, reply) => {
  try {
    const { payment_intent_id } = req.body;
    
    // Retrieve payment intent from Airwallex
    const paymentIntent = await airwallex.paymentIntents.retrieve(payment_intent_id);
    
    reply.send({
      success: true,
      status: paymentIntent.status,
      payment_intent: paymentIntent
    });
  } catch (error) {
    console.error('Payment confirmation failed:', error);
    reply.status(500).send({
      error: 'Failed to confirm payment',
      details: error.message
    });
  }
};
```

#### 1.2 Create Webhook Handler
**File:** `/backend/controllers/webhook.controller.js`

```javascript
const crypto = require('crypto');
const db = require('../db');

exports.handleAirwallexWebhook = (req, reply) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];
    const body = JSON.stringify(req.body);
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.AIRWALLEX_WEBHOOK_SECRET)
      .update(timestamp + body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return reply.status(401).send({ error: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Received webhook:', event.name, event.data.object.id);

    switch (event.name) {
      case 'payment_intent.succeeded':
        handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        handlePaymentFailure(event.data.object);
        break;
      default:
        console.log('Unhandled webhook event:', event.name);
    }

    reply.send({ received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    reply.status(500).send({ error: 'Webhook processing failed' });
  }
};

function handlePaymentSuccess(paymentIntent) {
  // Update booking status to confirmed
  const query = 'UPDATE tbl_booking SET booking_status = 1, edit_date = NOW() WHERE payment_intent_id = ?';
  
  db.query(query, [paymentIntent.id], (err, results) => {
    if (err) {
      console.error('Failed to update booking status:', err);
    } else {
      console.log(`Booking confirmed for payment intent: ${paymentIntent.id}`);
      // Here you could add email notifications, inventory updates, etc.
    }
  });
}

function handlePaymentFailure(paymentIntent) {
  // Update booking status to cancelled
  const query = 'UPDATE tbl_booking SET booking_status = 2, edit_date = NOW() WHERE payment_intent_id = ?';
  
  db.query(query, [paymentIntent.id], (err, results) => {
    if (err) {
      console.error('Failed to update booking status:', err);
    } else {
      console.log(`Booking cancelled for payment intent: ${paymentIntent.id}`);
    }
  });
}
```

#### 1.3 Add Routes
**File:** `/backend/routes/payment.routes.js`

```javascript
const paymentController = require('../controllers/payment.controller');
const webhookController = require('../controllers/webhook.controller');

async function paymentRoutes(fastify, options) {
  // Payment intent creation
  fastify.post('/create-payment-intent', paymentController.createPaymentIntent);
  
  // Payment confirmation
  fastify.post('/confirm-payment', paymentController.confirmPayment);
  
  // Webhook endpoint
  fastify.post('/webhooks/airwallex', webhookController.handleAirwallexWebhook);
}

module.exports = paymentRoutes;
```

**Register routes in main server file:**
```javascript
// In server.js or app.js
fastify.register(require('./routes/payment.routes'), { prefix: '/api' });
```

#### 1.4 Database Schema Update
**Add payment_intent_id column to tbl_booking:**

```sql
ALTER TABLE tbl_booking 
ADD COLUMN payment_intent_id VARCHAR(255) NULL,
ADD INDEX idx_payment_intent (payment_intent_id);
```

### Phase 2: Frontend Integration

#### 2.1 Initialize Airwallex SDK
**File:** `/frontend/lib/airwallex.ts`

```typescript
import { init } from '@airwallex/components-sdk';

let airwallexInitialized = false;

export async function initializeAirwallex() {
  if (airwallexInitialized) return;
  
  try {
    await init({
      env: process.env.NEXT_PUBLIC_AIRWALLEX_ENV as 'demo' | 'prod',
      locale: 'en',
      enabledElements: ['payments']
    });
    
    airwallexInitialized = true;
    console.log('Airwallex initialized successfully');
  } catch (error) {
    console.error('Airwallex initialization failed:', error);
    throw error;
  }
}
```

#### 2.2 Create Payment Component
**File:** `/frontend/components/AirwallexPayment.tsx`

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { loadCard, createElement } from '@airwallex/components-sdk'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'

interface PaymentProps {
  bookingData: {
    package_id: number
    customer_name: string
    customer_email: string
    customer_phone?: string
    travel_date: string
    pax: number
    total_amount: number
    special_requests?: string
  }
  onSuccess: (bookingId: number) => void
  onError: (error: string) => void
}

export default function AirwallexPayment({ bookingData, onSuccess, onError }: PaymentProps) {
  const [loading, setLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [bookingId, setBookingId] = useState<number | null>(null)
  const cardElementRef = useRef<HTMLDivElement>(null)
  const [cardElement, setCardElement] = useState<any>(null)

  // Create payment intent on component mount
  useEffect(() => {
    createPaymentIntent()
  }, [])

  // Mount card element when client secret is available
  useEffect(() => {
    if (clientSecret && cardElementRef.current && !cardElement) {
      mountCardElement()
    }
  }, [clientSecret])

  const createPaymentIntent = async () => {
    try {
      setLoading(true)
      const response = await apiFetch('/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      })

      setClientSecret(response.client_secret)
      setBookingId(response.booking_id)
    } catch (error: any) {
      onError(error.message || 'Failed to create payment intent')
    } finally {
      setLoading(false)
    }
  }

  const mountCardElement = async () => {
    try {
      const element = await loadCard({
        intent: {
          id: clientSecret.split('_secret_')[0],
          client_secret: clientSecret
        },
        element: cardElementRef.current!,
        theme: {
          palette: {
            primary: '#8B1F41' // Match your brand colors
          }
        }
      })

      element.on('ready', () => {
        console.log('Card element ready')
      })

      element.on('change', (event) => {
        // Handle validation state changes
        console.log('Card element changed:', event)
      })

      setCardElement(element)
    } catch (error) {
      console.error('Failed to mount card element:', error)
      onError('Failed to load payment form')
    }
  }

  const handlePayment = async () => {
    if (!cardElement || !clientSecret) return

    try {
      setLoading(true)
      
      const result = await cardElement.confirm({
        client_secret: clientSecret,
        payment_method: {
          billing: {
            first_name: bookingData.customer_name.split(' ')[0],
            last_name: bookingData.customer_name.split(' ').slice(1).join(' '),
            email: bookingData.customer_email
          }
        }
      })

      if (result.status === 'succeeded') {
        onSuccess(bookingId!)
      } else if (result.status === 'requires_capture') {
        // Payment authorized, needs capture (for some payment methods)
        onSuccess(bookingId!)
      } else {
        onError('Payment failed. Please try again.')
      }
    } catch (error: any) {
      console.error('Payment confirmation failed:', error)
      onError(error.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <div className="text-sm text-gray-600">
          <p>Package: {bookingData.package_id}</p>
          <p>Travelers: {bookingData.pax}</p>
          <p className="font-semibold text-lg">Total: ${bookingData.total_amount.toFixed(2)}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          ref={cardElementRef}
          className="min-h-[120px] p-4 border border-gray-200 rounded-md"
        />
        
        <Button
          onClick={handlePayment}
          disabled={loading || !cardElement}
          className="w-full bg-[#8B1F41] hover:bg-[#8B1F41]/90"
        >
          {loading ? 'Processing...' : `Pay $${bookingData.total_amount.toFixed(2)}`}
        </Button>
      </CardContent>
    </Card>
  )
}
```

#### 2.3 Update BookingForm Component
**Modify:** `/frontend/components/BookingForm.tsx`

```typescript
// Add these imports at the top
import AirwallexPayment from './AirwallexPayment'
import { initializeAirwallex } from '@/lib/airwallex'

// Add state for payment flow
const [showPayment, setShowPayment] = useState(false)
const [paymentError, setPaymentError] = useState('')

// Initialize Airwallex on component mount
useEffect(() => {
  initializeAirwallex().catch(console.error)
}, [])

// Modify handleSubmit to show payment form instead of direct submission
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  
  if (!formData.package_id || !formData.customer_name || !formData.customer_email || 
      !formData.travel_date || !formData.pax) {
    setError('Please fill in all required fields')
    return
  }

  // Show payment form instead of creating booking directly
  setShowPayment(true)
  setError('')
}

// Add payment success handler
const handlePaymentSuccess = (bookingId: number) => {
  setSuccess(true)
  setShowPayment(false)
  // Reset form or redirect as needed
}

// Add payment error handler
const handlePaymentError = (error: string) => {
  setPaymentError(error)
  setShowPayment(false)
}

// Add payment form rendering before the return statement
if (showPayment) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <Button 
        onClick={() => setShowPayment(false)}
        variant="outline"
        className="mb-4"
      >
        ← Back to Booking Details
      </Button>
      
      <AirwallexPayment
        bookingData={{
          package_id: parseInt(formData.package_id.toString()),
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          travel_date: formData.travel_date,
          pax: parseInt(formData.pax),
          total_amount: parseFloat(formData.total_amount.toString()),
          special_requests: formData.special_requests
        }}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
      
      {paymentError && (
        <div className="mt-4 text-red-600 text-sm">{paymentError}</div>
      )}
    </div>
  )
}
```

### Phase 3: Testing & Deployment

#### 3.1 Test Cards (Demo Environment)
Use these test cards for development:

```
Successful Payment:
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits

Declined Payment:
Card: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
```

#### 3.2 Testing Checklist
- [ ] Payment intent creation works
- [ ] Card element mounts correctly
- [ ] Successful payment updates booking status
- [ ] Failed payment updates booking status
- [ ] Webhooks are received and processed
- [ ] Database updates are correct

#### 3.3 Production Deployment
1. **Switch to Production:**
   ```bash
   AIRWALLEX_ENV=prod
   NEXT_PUBLIC_AIRWALLEX_ENV=prod
   ```

2. **Update API keys** to production keys from Airwallex Dashboard

3. **Configure production webhooks** with your live domain

4. **Test with small real transactions** before full rollout

## Security Considerations

1. **Never expose secret keys** in frontend code
2. **Verify webhook signatures** to prevent fraud
3. **Use HTTPS** for all production endpoints
4. **Validate all inputs** on both frontend and backend
5. **Log payment events** for audit trails

## Support & Documentation

- **Airwallex Docs:** https://www.airwallex.com/docs/js/
- **Node SDK:** https://github.com/airwallex/airwallex-node
- **Test Environment:** Use demo mode for all development
- **Support:** Contact Airwallex support for integration issues

## Implementation Timeline

1. **Week 1:** Backend API development and testing
2. **Week 2:** Frontend integration and testing
3. **Week 3:** End-to-end testing and bug fixes
4. **Week 4:** Production deployment and monitoring

---

**Important:** This integration replaces the current manual booking confirmation with real-time payment processing. Ensure thorough testing in demo mode before switching to production.
