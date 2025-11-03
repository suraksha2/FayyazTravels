import { NextRequest, NextResponse } from 'next/server'

const AIRWALLEX_CONFIG = {
  clientId: 'x2uUrKZcR8OXL3gQOICUKw',
  apiKey: '8d9c682b097318be09d63724c908d02d490ce74eba9970657a6ed403b89140d99315ffdbc7dac9b29b442c3357c8b48e',
  baseUrl: 'https://api-demo.airwallex.com' 
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, merchant_order_id, customer } = body

    // First, get an access token
    const authResponse = await fetch(`${AIRWALLEX_CONFIG.baseUrl}/api/v1/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        x_client_id: AIRWALLEX_CONFIG.clientId,
        x_api_key: AIRWALLEX_CONFIG.apiKey,
      }),
    })

    if (!authResponse.ok) {
      throw new Error('Failed to authenticate with Airwallex')
    }

    const authData = await authResponse.json()
    const accessToken = authData.token

    // Create payment intent
    const paymentIntentResponse = await fetch(`${AIRWALLEX_CONFIG.baseUrl}/api/v1/pa/payment_intents/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        request_id: `req_${Date.now()}`,
        amount: amount,
        currency: currency,
        merchant_order_id: merchant_order_id,
        order: {
          type: 'physical_goods',
          products: [
            {
              code: 'travel_package',
              name: 'Travel Package Booking',
              quantity: 1,
              unit_price: amount,
              type: 'Travel',
            },
          ],
        },
        customer: {
          id: `customer_${Date.now()}`,
          first_name: customer.first_name,
          last_name: customer.last_name,
          email: customer.email,
          phone_number: customer.phone_number,
        },
        descriptor: 'Fayyaz Travels Booking',
      }),
    })

    if (!paymentIntentResponse.ok) {
      const errorData = await paymentIntentResponse.text()
      console.error('Airwallex API Error:', errorData)
      throw new Error('Failed to create payment intent')
    }

    const paymentIntentData = await paymentIntentResponse.json()

    return NextResponse.json({
      id: paymentIntentData.id,
      client_secret: paymentIntentData.client_secret,
      amount: paymentIntentData.amount,
      currency: paymentIntentData.currency,
      status: paymentIntentData.status,
    })

  } catch (error) {
    console.error('Payment intent creation error:', error)
    
    // Return a demo response for development
    const requestBody = await request.json().catch(() => ({}))
    return NextResponse.json({
      id: `demo_intent_${Date.now()}`,
      client_secret: `demo_secret_${Date.now()}`,
      amount: requestBody?.amount || 284500,
      currency: requestBody?.currency || 'SGD',
      status: 'requires_payment_method',
    })
  }
}
