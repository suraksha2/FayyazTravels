const paymentController = require('../controllers/payment.controller');
const webhookController = require('../controllers/webhook.controller');

async function paymentRoutes(fastify, options) {
  // Payment intent creation
  fastify.post('/create-payment-intent', {
    schema: {
      body: {
        type: 'object',
        required: ['package_id', 'customer_name', 'customer_email', 'travel_date', 'total_amount'],
        properties: {
          package_id: { type: 'number' },
          customer_name: { type: 'string' },
          customer_email: { type: 'string', format: 'email' },
          customer_phone: { type: 'string' },
          travel_date: { type: 'string', format: 'date' },
          adults: { type: 'number', minimum: 0 },
          children: { type: 'number', minimum: 0 },
          infants: { type: 'number', minimum: 0 },
          total_amount: { type: 'number', minimum: 0.01 },
          special_requests: { type: 'string' },
          passenger_details: { type: 'string' },
          contact_details: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            client_secret: { type: 'string' },
            payment_intent_id: { type: 'string' },
            booking_id: { type: 'number' },
            merchant_order_id: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'string' }
          }
        }
      }
    }
  }, paymentController.createPaymentIntent);
  
  // Payment confirmation
  fastify.post('/confirm-payment', {
    schema: {
      body: {
        type: 'object',
        required: ['payment_intent_id'],
        properties: {
          payment_intent_id: { type: 'string' }
        }
      }
    }
  }, paymentController.confirmPayment);
  
  // Get payment status
  fastify.get('/payment-status/:payment_intent_id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          payment_intent_id: { type: 'string' }
        }
      }
    }
  }, paymentController.getPaymentStatus);
  
  // Webhook endpoint - no schema validation for webhooks
  fastify.post('/webhooks/airwallex', {
    config: {
      rawBody: true // Preserve raw body for signature verification
    }
  }, webhookController.handleAirwallexWebhook);
}

module.exports = paymentRoutes;
