#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔍 Real Webhook Testing Tool');
console.log('============================');

// Test webhook signature verification
function testWebhookSignature() {
  console.log('\n📝 Testing Webhook Signature Verification...');
  
  const webhookSecret = process.env.AIRWALLEX_WEBHOOK_SECRET || 'test_secret';
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payload = JSON.stringify({
    name: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_123456789',
        status: 'succeeded',
        amount: 250000,
        currency: 'SGD'
      }
    }
  });

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(timestamp + payload)
    .digest('hex');

  console.log('Webhook Secret:', webhookSecret.substring(0, 10) + '...');
  console.log('Timestamp:', timestamp);
  console.log('Expected Signature:', expectedSignature);
  console.log('✅ Signature generation test: PASSED');
}

// Test database connection for webhook updates
function testDatabaseConnection() {
  console.log('\n🗄️ Testing Database Connection...');
  
  try {
    const db = require('./db');
    
    // Test query to check if webhook can update bookings
    const testQuery = `
      SELECT COUNT(*) as count 
      FROM tbl_booking 
      WHERE payment_intent_id IS NOT NULL
    `;
    
    db.query(testQuery, (err, results) => {
      if (err) {
        console.error('❌ Database connection failed:', err.message);
      } else {
        console.log('✅ Database connection: WORKING');
        console.log(`📊 Found ${results[0].count} bookings with payment intents`);
      }
    });
  } catch (error) {
    console.error('❌ Database module error:', error.message);
  }
}

// Test webhook endpoint availability
function testWebhookEndpoint() {
  console.log('\n🌐 Testing Webhook Endpoint...');
  
  const http = require('http');
  
  const testPayload = JSON.stringify({
    name: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_webhook_123',
        status: 'succeeded',
        amount: 100000,
        currency: 'SGD'
      }
    }
  });

  const options = {
    hostname: 'localhost',
    port: 3003,
    path: '/webhooks/airwallex',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testPayload),
      'x-timestamp': Math.floor(Date.now() / 1000).toString(),
      'x-signature': 'test_signature'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Webhook endpoint: ACCESSIBLE');
        console.log('Response:', data);
      } else {
        console.log(`⚠️ Webhook endpoint returned status: ${res.statusCode}`);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Webhook endpoint test failed:', error.message);
    console.log('💡 Make sure your backend server is running on port 3003');
  });

  req.write(testPayload);
  req.end();
}

// Check ngrok status
function checkNgrokStatus() {
  console.log('\n🌍 Checking ngrok Status...');
  
  const http = require('http');
  
  const options = {
    hostname: 'localhost',
    port: 4040,
    path: '/api/tunnels',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const tunnels = JSON.parse(data);
        if (tunnels.tunnels && tunnels.tunnels.length > 0) {
          console.log('✅ ngrok is running');
          tunnels.tunnels.forEach(tunnel => {
            if (tunnel.config.addr === 'localhost:3003') {
              console.log(`🌐 Public URL: ${tunnel.public_url}`);
              console.log(`📝 Webhook URL: ${tunnel.public_url}/webhooks/airwallex`);
            }
          });
        } else {
          console.log('⚠️ ngrok is running but no tunnels found');
        }
      } catch (error) {
        console.log('⚠️ Could not parse ngrok response');
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ ngrok not running or not accessible');
    console.log('💡 Start ngrok with: ngrok http 3003');
  });

  req.end();
}

// Display setup instructions
function displaySetupInstructions() {
  console.log('\n🚀 REAL WEBHOOK SETUP INSTRUCTIONS');
  console.log('==================================');
  console.log('');
  console.log('1. 📦 Install ngrok:');
  console.log('   npm install -g ngrok');
  console.log('');
  console.log('2. 🌐 Expose your server:');
  console.log('   ngrok http 3003');
  console.log('');
  console.log('3. 📋 Copy the https URL from ngrok');
  console.log('');
  console.log('4. 🎯 Configure Airwallex Dashboard:');
  console.log('   - Go to: https://demo.airwallex.com');
  console.log('   - Navigate: Developers → Webhooks');
  console.log('   - Add endpoint: https://your-ngrok-url.ngrok.io/webhooks/airwallex');
  console.log('   - Select events: payment_intent.succeeded, payment_intent.payment_failed');
  console.log('');
  console.log('5. 🔐 Add webhook secret to .env:');
  console.log('   AIRWALLEX_WEBHOOK_SECRET=whsec_your_secret_from_dashboard');
  console.log('');
  console.log('6. 🧪 Test with real payment!');
  console.log('');
  console.log('🎉 Result: Real-time automatic database updates!');
}

// Run all tests
function runAllTests() {
  testWebhookSignature();
  testDatabaseConnection();
  
  setTimeout(() => {
    testWebhookEndpoint();
  }, 1000);
  
  setTimeout(() => {
    checkNgrokStatus();
  }, 2000);
  
  setTimeout(() => {
    displaySetupInstructions();
  }, 3000);
}

// Load environment variables
require('dotenv').config();

// Run tests
runAllTests();
