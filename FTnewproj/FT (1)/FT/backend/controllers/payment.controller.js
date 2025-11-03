const { Airwallex } = require('@airwallex/node-sdk');
const db = require('../db');

// Initialize Airwallex client
const airwallex = new Airwallex({
  apiKey: process.env.AIRWALLEX_API_KEY || '8d9c682b097318be09d63724c908d02d490ce74eba9970657a6ed403b89140d99315ffdbc7dac9b29b442c3357c8b48e',
  env: process.env.AIRWALLEX_ENV || 'demo' // 'demo' or 'prod'
});

// Airwallex SDK initialized successfully

exports.createPaymentIntent = async (req, reply) => {
  try {
    const {
      package_id,
      customer_name,
      customer_email,
      customer_phone,
      travel_date,
      adults,
      children,
      infants,
      total_amount,
      special_requests,
      passenger_details,
      contact_details
    } = req.body;

    // Validation
    if (!package_id || !customer_name || !customer_email || !travel_date || !total_amount) {
      return reply.status(400).send({
        error: 'Missing required fields',
        required: ['package_id', 'customer_name', 'customer_email', 'travel_date', 'total_amount']
      });
    }

    // Validate amount
    const amount = parseFloat(total_amount);
    if (isNaN(amount) || amount <= 0) {
      return reply.status(400).send({
        error: 'Invalid amount',
        message: 'Amount must be a positive number'
      });
    }

    // Generate unique merchant order ID
    const merchantOrderId = `FT-${package_id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('Creating payment intent for:', {
      merchantOrderId,
      amount,
      customer_email,
      package_id
    });

    // Create payment intent with Airwallex
    const paymentIntentData = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'SGD',
      merchant_order_id: merchantOrderId,
      metadata: {
        package_id: package_id.toString(),
        customer_name,
        customer_email,
        travel_date,
        adults: (adults || 0).toString(),
        children: (children || 0).toString(),
        infants: (infants || 0).toString(),
        total_pax: ((adults || 0) + (children || 0) + (infants || 0)).toString(),
        special_requests: special_requests || '',
        booking_type: 'travel_package'
      }
    };

    console.log('Airwallex payment intent request:', paymentIntentData);

    // Create payment intent with Airwallex - NO MOCK FALLBACK
    let paymentIntent;
    try {
      paymentIntent = await airwallex.post('/pa/payment_intents', paymentIntentData);
      
      console.log('Airwallex payment intent created successfully:', {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount
      });
    } catch (airwallexError) {
      console.error('Airwallex API error:', {
        message: airwallexError.message,
        code: airwallexError.code,
        details: airwallexError.details
      });
      
      // Return proper error - no mock fallback
      return reply.status(502).send({
        error: 'Payment service unavailable',
        message: 'Unable to connect to payment provider. Please try again later.',
        code: airwallexError.code || 'PAYMENT_SERVICE_ERROR',
        details: airwallexError.message || 'Payment service is temporarily unavailable'
      });
    }

    // Store pending booking in database with payment_intent_id
    const nameParts = customer_name.trim().split(' ');
    const bookingData = {
      user_id: 0, // Default for guest bookings
      package_id: parseInt(package_id),
      booking_amount: amount,
      arrival_date: travel_date,
      return_date: travel_date, // Default return date same as arrival
      totaladults: adults || 0,
      totalchildren: children || 0,
      totalinfants: infants || 0,
      primary_title: 'Mr',
      primary_fname: nameParts[0] || '',
      primary_lname: nameParts.slice(1).join(' ') || '',
      primary_email: customer_email,
      primary_phone: customer_phone || '',
      primary_ccode: 'SG',
      primary_country: 'Singapore',
      special_requests: special_requests || '',
      booking_status: 0, // Pending payment
      payment_intent_id: paymentIntent.id,
      merchant_order_id: merchantOrderId,
      passenger_details: passenger_details || null,
      contact_details: contact_details || null,
      hotel_type: 1, // Default hotel type (1 = standard)
      flight_ticket: 0, // Default no flight ticket
      notes: '', // Default empty notes
      insert_date: new Date(),
      edit_date: new Date(),
      status: 1
    };

    const result = await new Promise((resolve, reject) => {
      db.query('INSERT INTO tbl_booking SET ?', bookingData, (err, results) => {
        if (err) {
          console.error('Database insert error:', err);
          reject(err);
        } else {
          console.log('Booking created with ID:', results.insertId);
          resolve(results);
        }
      });
    });

    reply.send({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      booking_id: result.insertId,
      merchant_order_id: merchantOrderId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('Payment intent creation failed:', error);
    
    // Handle specific Airwallex errors
    if (error.code) {
      return reply.status(400).send({
        error: 'Payment service error',
        code: error.code,
        message: error.message,
        details: error.details || 'Please check your payment details and try again.'
      });
    }

    reply.status(500).send({
      error: 'Failed to create payment intent',
      message: error.message || 'Internal server error',
      details: 'Please try again or contact support if the problem persists.'
    });
  }
};

exports.confirmPayment = async (req, reply) => {
  try {
    const { payment_intent_id } = req.body;
    
    if (!payment_intent_id) {
      return reply.status(400).send({
        error: 'Missing payment_intent_id'
      });
    }

    console.log('Confirming payment for intent:', payment_intent_id);
    
    // Retrieve payment intent from Airwallex - NO MOCK FALLBACK
    let paymentIntent;
    try {
      paymentIntent = await airwallex.get(`/pa/payment_intents/${payment_intent_id}`);
      
      console.log('Payment intent retrieved successfully:', {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount
      });
    } catch (error) {
      console.error('Failed to retrieve payment intent from Airwallex:', {
        payment_intent_id,
        error: error.message,
        code: error.code
      });
      
      return reply.status(502).send({
        error: 'Payment verification failed',
        message: 'Unable to verify payment status. Please contact support.',
        payment_intent_id,
        details: error.message || 'Payment service is temporarily unavailable'
      });
    }
    
    console.log('Payment intent status:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount
    });

    // Update booking status based on payment status
    if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture') {
      try {
        await new Promise((resolve, reject) => {
          const query = `
            UPDATE tbl_booking 
            SET booking_status = 1, 
                payment_status = ?, 
                payment_confirmed_at = NOW(), 
                edit_date = NOW() 
            WHERE payment_intent_id = ?
          `;
          db.query(query, [paymentIntent.status, payment_intent_id], (err, results) => {
            if (err) {
              console.error('Failed to update booking status:', err);
              reject(err);
            } else if (results.affectedRows === 0) {
              console.error('No booking found with payment_intent_id:', payment_intent_id);
              reject(new Error('Booking not found'));
            } else {
              console.log('Booking confirmed for payment intent:', payment_intent_id, '- Rows affected:', results.affectedRows);
              resolve(results);
            }
          });
        });
      } catch (dbError) {
        console.error('Database error while confirming booking:', dbError);
        return reply.status(500).send({
          error: 'Booking confirmation failed',
          message: 'Payment succeeded but booking update failed. Please contact support.',
          payment_intent_id,
          details: dbError.message
        });
      }
    } else if (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'requires_customer_action') {
      return reply.status(400).send({
        error: 'Payment incomplete',
        message: 'Payment has not been completed yet.',
        status: paymentIntent.status,
        payment_intent_id
      });
    } else if (paymentIntent.status === 'cancelled' || paymentIntent.status === 'failed') {
      // Update booking to cancelled status
      await new Promise((resolve, reject) => {
        const query = `
          UPDATE tbl_booking 
          SET booking_status = 2, 
              payment_status = ?, 
              payment_failure_reason = 'Payment cancelled or failed', 
              edit_date = NOW() 
          WHERE payment_intent_id = ?
        `;
        db.query(query, [paymentIntent.status, payment_intent_id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      
      return reply.status(400).send({
        error: 'Payment failed',
        message: 'Payment was cancelled or failed.',
        status: paymentIntent.status,
        payment_intent_id
      });
    }
    
    reply.send({
      success: true,
      status: paymentIntent.status,
      payment_intent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    });
  } catch (error) {
    console.error('Payment confirmation failed:', error);
    reply.status(500).send({
      error: 'Failed to confirm payment',
      message: error.message || 'Internal server error'
    });
  }
};

exports.getPaymentStatus = async (req, reply) => {
  try {
    const { payment_intent_id } = req.params;
    
    if (!payment_intent_id) {
      return reply.status(400).send({
        error: 'Missing payment_intent_id'
      });
    }

    let paymentIntent;
    try {
      paymentIntent = await airwallex.get(`/pa/payment_intents/${payment_intent_id}`);
      
      console.log('Payment status retrieved:', {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount
      });
    } catch (error) {
      console.error('Failed to retrieve payment status from Airwallex:', {
        payment_intent_id,
        error: error.message
      });
      
      return reply.status(502).send({
        error: 'Payment status unavailable',
        message: 'Unable to retrieve payment status. Please try again later.',
        payment_intent_id,
        details: error.message || 'Payment service is temporarily unavailable'
      });
    }
    
    reply.send({
      success: true,
      payment_intent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        created_at: paymentIntent.created_at
      }
    });
  } catch (error) {
    console.error('Failed to get payment status:', error);
    reply.status(500).send({
      error: 'Failed to get payment status',
      message: error.message
    });
  }
};
