import { AIRWALLEX_CONFIG } from './airwallex-config';

export interface PaymentIntentRequest {
  package_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  travel_date: string;
  adults: number;
  children: number;
  infants: number;
  total_amount: number;
  special_requests?: string;
  passenger_details?: string;
  contact_details?: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  client_secret: string;
  payment_intent_id: string;
  booking_id: number;
  merchant_order_id: string;
  amount: number;
  currency: string;
}

export interface PaymentConfirmationResponse {
  success: boolean;
  status: string;
  payment_intent: {
    id: string;
    status: string;
    amount: number;
    currency: string;
  };
}


export async function createPaymentIntent(data: PaymentIntentRequest): Promise<PaymentIntentResponse> {
  try {
    console.log('Creating payment intent with data:', data);

    // Validate required fields on frontend
    if (!data.package_id || !data.customer_name || !data.customer_email || !data.travel_date || !data.total_amount) {
      throw new Error('Missing required fields: package_id, customer_name, customer_email, travel_date, total_amount');
    }

    if (!data.total_amount || data.total_amount <= 0) {
      throw new Error('Invalid amount: must be greater than 0');
    }

    // Transform data to match backend expectations
    const transformedData = {
      ...data,
      amount: data.total_amount, // Add amount field
      currency: 'SGD', // Add currency field
      packageId: data.package_id, // Add packageId field
      contactDetails: data.contact_details // Add contactDetails field
    };

    console.log('Transformed data for backend:', transformedData);

    const response = await fetch('http://localhost:3003/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment intent creation failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: PaymentIntentResponse = await response.json();
    console.log('Payment intent created successfully:', {
      payment_intent_id: result.payment_intent_id,
      booking_id: result.booking_id,
      amount: result.amount
    });

    return result;
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    throw error;
  }
}

export async function confirmPayment(paymentIntentId: string): Promise<PaymentConfirmationResponse> {
  try {
    console.log('Confirming payment for intent:', paymentIntentId);

    const response = await fetch('http://localhost:3003/confirm-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payment_intent_id: paymentIntentId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: PaymentConfirmationResponse = await response.json();
    console.log('Payment confirmation result:', result);

    return result;
  } catch (error) {
    console.error('Failed to confirm payment:', error);
    throw error;
  }
}

export async function getPaymentStatus(paymentIntentId: string): Promise<PaymentConfirmationResponse> {
  try {
    const response = await fetch(`http://localhost:3003/payment-status/${paymentIntentId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get payment status:', error);
    throw error;
  }
}

