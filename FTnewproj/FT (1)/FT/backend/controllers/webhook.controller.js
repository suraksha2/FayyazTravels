const crypto = require('crypto');
const db = require('../db');

exports.handleAirwallexWebhook = (req, reply) => {
  try {
    console.log('\n🔥 REAL AIRWALLEX WEBHOOK RECEIVED!');
    console.log('=====================================');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🎯 Event:', req.body?.name || 'Unknown');
    console.log('💳 Payment Intent:', req.body?.data?.object?.id || 'Unknown');
    console.log('💰 Amount:', req.body?.data?.object?.amount || 'Unknown');
    console.log('💱 Currency:', req.body?.data?.object?.currency || 'Unknown');
    console.log('🔐 Signature:', req.headers['x-signature'] ? '✅ Present' : '❌ Missing');
    console.log('=====================================');

    // Verify webhook signature (if webhook secret is configured)
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];
    
    if (process.env.AIRWALLEX_WEBHOOK_SECRET && signature && timestamp) {
      const body = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', process.env.AIRWALLEX_WEBHOOK_SECRET)
        .update(timestamp + body)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return reply.status(401).send({ error: 'Invalid signature' });
      }
    }

    const event = req.body;
    console.log('Processing webhook event:', event.name, event.data?.object?.id);

    switch (event.name) {
      case 'payment_intent.succeeded':
        handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        handlePaymentFailure(event.data.object);
        break;
      case 'payment_intent.cancelled':
        handlePaymentCancelled(event.data.object);
        break;
      case 'payment_intent.requires_capture':
        handlePaymentRequiresCapture(event.data.object);
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
  console.log('Processing successful payment:', paymentIntent.id);
  
  // Update booking status to confirmed
  const query = `
    UPDATE tbl_booking 
    SET booking_status = 1, 
        edit_date = NOW(),
        payment_status = 'succeeded',
        payment_confirmed_at = NOW()
    WHERE payment_intent_id = ?
  `;
  
  db.query(query, [paymentIntent.id], (err, results) => {
    if (err) {
      console.error('Failed to update booking status for successful payment:', err);
    } else if (results.affectedRows === 0) {
      console.error('❌ No booking found for payment intent:', paymentIntent.id);
    } else {
      console.log('🎉 SUCCESS: Booking confirmed for payment intent:', paymentIntent.id);
      console.log('📊 Database updated:', results.affectedRows, 'booking(s) confirmed');
      console.log('✅ REAL-TIME WEBHOOK PROCESSING COMPLETE!');
      
      // Here you could add:
      // - Send confirmation email to customer
      // - Update inventory
      // - Trigger other business processes
      sendBookingConfirmationEmail(paymentIntent.id);
    }
  });
}

function handlePaymentFailure(paymentIntent) {
  console.log('Processing failed payment:', paymentIntent.id);
  
  // Update booking status to cancelled due to payment failure
  const query = `
    UPDATE tbl_booking 
    SET booking_status = 2, 
        edit_date = NOW(),
        payment_status = 'failed',
        payment_failure_reason = ?
    WHERE payment_intent_id = ?
  `;
  
  const failureReason = paymentIntent.latest_payment_error?.message || 'Payment failed';
  
  db.query(query, [failureReason, paymentIntent.id], (err, results) => {
    if (err) {
      console.error('Failed to update booking status for failed payment:', err);
    } else if (results.affectedRows === 0) {
      console.error('No booking found for payment intent:', paymentIntent.id);
    } else {
      console.log(`Booking cancelled due to payment failure: ${paymentIntent.id}`);
      
      // Send payment failure notification
      sendPaymentFailureNotification(paymentIntent.id, failureReason);
    }
  });
}

function handlePaymentCancelled(paymentIntent) {
  console.log('Processing cancelled payment:', paymentIntent.id);
  
  // Update booking status to cancelled
  const query = `
    UPDATE tbl_booking 
    SET booking_status = 2, 
        edit_date = NOW(),
        payment_status = 'cancelled'
    WHERE payment_intent_id = ?
  `;
  
  db.query(query, [paymentIntent.id], (err, results) => {
    if (err) {
      console.error('Failed to update booking status for cancelled payment:', err);
    } else {
      console.log(`Booking cancelled for payment intent: ${paymentIntent.id}`);
    }
  });
}

function handlePaymentRequiresCapture(paymentIntent) {
  console.log('Payment requires capture:', paymentIntent.id);
  
  // Update booking status to pending capture
  const query = `
    UPDATE tbl_booking 
    SET booking_status = 0, 
        edit_date = NOW(),
        payment_status = 'requires_capture'
    WHERE payment_intent_id = ?
  `;
  
  db.query(query, [paymentIntent.id], (err, results) => {
    if (err) {
      console.error('Failed to update booking status for payment requiring capture:', err);
    } else {
      console.log(`Payment requires capture for: ${paymentIntent.id}`);
      
      // Notify admin for manual capture if needed
      notifyAdminForCapture(paymentIntent.id);
    }
  });
}

function sendBookingConfirmationEmail(paymentIntentId) {
  // Get booking details
  const query = `
    SELECT b.*, p.p_name 
    FROM tbl_booking b 
    LEFT JOIN tbl_packages p ON b.package_id = p.id 
    WHERE b.payment_intent_id = ?
  `;
  
  db.query(query, [paymentIntentId], (err, results) => {
    if (err) {
      console.error('Failed to fetch booking for email:', err);
      return;
    }
    
    if (results.length === 0) {
      console.error('No booking found for confirmation email:', paymentIntentId);
      return;
    }
    
    const booking = results[0];
    console.log('Would send confirmation email to:', booking.primary_email);
    
    // TODO: Implement actual email sending
    // - Use nodemailer, SendGrid, or similar service
    // - Send booking confirmation with details
    // - Include booking reference number
    // - Add travel itinerary if available
  });
}

function sendPaymentFailureNotification(paymentIntentId, reason) {
  console.log('Would send payment failure notification for:', paymentIntentId, 'Reason:', reason);
  
  // TODO: Implement payment failure notification
  // - Email customer about payment failure
  // - Provide retry instructions
  // - Include support contact information
}

function notifyAdminForCapture(paymentIntentId) {
  console.log('Would notify admin for manual capture:', paymentIntentId);
  
  // TODO: Implement admin notification
  // - Send admin email/SMS about required capture
  // - Include booking details and payment info
  // - Provide capture instructions
}
