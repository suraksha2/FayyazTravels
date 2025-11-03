# 🔥 **REAL AIRWALLEX WEBHOOK SETUP - NO MORE SIMULATION!**

## 🚨 **Current Issue: Webhooks are Simulated**

You're right - the webhook should be **REAL**, not simulated! Here's how to set up **automatic real-time webhook processing** that will update your database instantly when payments are made.

## 🛠️ **Step 1: Expose Your Local Server to Internet**

Since you're running locally, Airwallex can't reach `http://localhost:3003`. You need to expose your server:

### **Option A: Using ngrok (Recommended)**
```bash
# Install ngrok
npm install -g ngrok

# In a new terminal, expose your backend
ngrok http 3003
```

This will give you a public URL like: `https://abc123.ngrok.io`

### **Option B: Using localtunnel**
```bash
# Install localtunnel
npm install -g localtunnel

# Expose your backend
lt --port 3003 --subdomain ft-travel-webhook
```

This will give you: `https://ft-travel-webhook.loca.lt`

## 🎯 **Step 2: Configure Airwallex Dashboard Webhooks**

1. **Go to Airwallex Dashboard**: https://demo.airwallex.com (for demo environment)
2. **Navigate to**: Developers → Webhooks
3. **Click**: "Add Endpoint"
4. **Enter Webhook URL**: `https://your-ngrok-url.ngrok.io/webhooks/airwallex`
5. **Select Events**:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.cancelled`
   - ✅ `payment_intent.requires_capture`

6. **Copy the Webhook Secret** (you'll need this)

## 🔐 **Step 3: Update Your Environment Variables**

Add the webhook secret to your `.env` file:

```bash
# Add this to your .env file
AIRWALLEX_WEBHOOK_SECRET=whsec_your_webhook_secret_from_dashboard
```

## 🚀 **Step 4: Start Your Server with Webhook Exposure**

```bash
# Terminal 1: Start your backend
cd backend
npm start

# Terminal 2: Expose to internet
ngrok http 3003
```

## ✅ **Step 5: Test Real Webhooks**

1. **Make a test payment** using your booking system
2. **Check your backend console** - you should see:
   ```
   Received Airwallex webhook: { headers: {...}, body: {...} }
   Processing webhook event: payment_intent.succeeded pi_xxx
   Booking confirmed for payment intent: pi_xxx
   ```

3. **Check your database** - booking status should automatically change from `0` (Pending) to `1` (Confirmed)

## 🔍 **How to Verify It's Working**

### **Backend Console Output (Real Webhook):**
```
✅ Received Airwallex webhook: {
  headers: {
    'x-signature': 'sha256=abc123...',
    'x-timestamp': '1697123456',
    'content-type': 'application/json'
  },
  body: {
    name: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_real_payment_123456789',
        status: 'succeeded',
        amount: 250000,
        currency: 'SGD'
      }
    }
  }
}
✅ Processing webhook event: payment_intent.succeeded pi_real_payment_123456789
✅ Booking confirmed for payment intent: pi_real_payment_123456789
```

### **Database Verification:**
```sql
SELECT 
  id, 
  booking_status, 
  payment_status, 
  payment_confirmed_at,
  payment_intent_id
FROM tbl_booking 
WHERE payment_intent_id = 'pi_real_payment_123456789';

-- Should show:
-- booking_status: 1 (Confirmed)
-- payment_status: 'succeeded'
-- payment_confirmed_at: 2024-10-15 07:00:00
```

## 🎯 **What Happens with Real Webhooks**

1. **User completes payment** → Airwallex processes payment
2. **Airwallex sends webhook** → Your server receives real-time notification
3. **Webhook updates database** → Booking status changes automatically
4. **Email sent** (if configured) → Customer gets confirmation
5. **Admin notified** → You know about the successful booking

## 🔧 **Webhook Controller Features (Already Implemented)**

Your webhook controller already handles:

- ✅ **Signature verification** for security
- ✅ **Payment success** → Updates booking to confirmed
- ✅ **Payment failure** → Updates booking to cancelled
- ✅ **Payment cancelled** → Updates booking status
- ✅ **Requires capture** → Handles authorization-only payments
- ✅ **Error handling** → Logs all webhook events
- ✅ **Database updates** → Real-time status changes

## 🚨 **Production Deployment**

For production, instead of ngrok:

1. **Deploy to cloud** (Heroku, AWS, DigitalOcean, etc.)
2. **Use your domain** (e.g., `https://api.fayyaztravels.com/webhooks/airwallex`)
3. **Configure SSL certificate** (required for webhooks)
4. **Update Airwallex dashboard** with production webhook URL

## 🎉 **Expected Result**

After setup, when users make payments:

1. ✅ **Payment processes in real-time**
2. ✅ **Database updates automatically** (no simulation!)
3. ✅ **Booking status changes instantly**
4. ✅ **Confirmation emails sent** (if configured)
5. ✅ **No manual intervention needed**

## 🔍 **Troubleshooting**

### **Webhook Not Received:**
- Check ngrok is running and URL is correct
- Verify webhook URL in Airwallex dashboard
- Check backend server is running on port 3003

### **Signature Verification Failed:**
- Ensure `AIRWALLEX_WEBHOOK_SECRET` is correct
- Check webhook secret in Airwallex dashboard matches `.env`

### **Database Not Updating:**
- Check database connection in backend
- Verify `payment_intent_id` matches between webhook and database
- Check backend console for error messages

## 🚀 **Quick Setup Commands**

```bash
# 1. Install ngrok
npm install -g ngrok

# 2. Start backend
cd backend && npm start

# 3. In new terminal, expose server
ngrok http 3003

# 4. Copy the https URL from ngrok
# 5. Add to Airwallex Dashboard: https://your-url.ngrok.io/webhooks/airwallex
# 6. Copy webhook secret to .env file
# 7. Test a payment!
```

## 🎯 **Result: Real-Time Payment Processing**

Once configured, your system will have **enterprise-grade real-time payment processing** with automatic database updates - no more simulation!

Your webhook controller is already perfect - you just need to connect it to the real Airwallex webhook system! 🚀
