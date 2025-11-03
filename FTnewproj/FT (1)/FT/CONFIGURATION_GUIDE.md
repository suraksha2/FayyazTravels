# ⚙️ Configuration Guide - FT Travel Booking System

## 📋 Overview

This guide covers all configuration aspects of the FT Travel Booking System, including environment variables, API integrations, payment setup, and email configuration.

## 🔧 Environment Variables

### Backend Configuration (.env)

Create `/backend/.env` file with the following variables:

```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DB_HOST=localhost
DB_USER=ft_user
DB_PASSWORD=FT_SecurePass2024!
DB_NAME=ft_travel_db
DB_PORT=3306

# ===========================================
# SERVER CONFIGURATION
# ===========================================
PORT=3003
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# ===========================================
# SECURITY CONFIGURATION
# ===========================================
JWT_SECRET=your_super_secure_jwt_secret_key_here_min_32_chars
JWT_EXPIRES_IN=7d

# ===========================================
# AIRWALLEX PAYMENT CONFIGURATION
# ===========================================
# Demo/Sandbox Configuration
AIRWALLEX_API_KEY=8d9c682b097318be09d63724c908d02d490ce74eba9970657a6ed403b89140d99315ffdbc7dac9b29b442c3357c8b48e
AIRWALLEX_CLIENT_ID=x2uUrKZcR8OXL3gQOICUKw
AIRWALLEX_ENV=demo
AIRWALLEX_WEBHOOK_SECRET=your_webhook_secret_from_airwallex_dashboard

# Production Configuration (uncomment for production)
# AIRWALLEX_API_KEY=your_production_api_key
# AIRWALLEX_CLIENT_ID=your_production_client_id
# AIRWALLEX_ENV=production
# AIRWALLEX_WEBHOOK_SECRET=your_production_webhook_secret

# ===========================================
# EMAIL CONFIGURATION - MICROSOFT GRAPH API
# ===========================================
MS_CLIENT_ID=7ed68eec-849f-447e-ac35-d58ff2f0e28f
MS_CLIENT_SECRET=cg98Q~7PMW210LPT~91FtCa2WVe4IJWBUyOS8aQo
MS_TENANT_ID=4e2ec943-aea7-468f-9eb5-2e7b5e5f7d9b
FROM_EMAIL=notifications@fayyaztravels.com
FROM_NAME=Fayyaz Travels
ADMIN_EMAIL=admin@fayyaztravels.com
CORPORATE_EMAIL=corporate@fayyaztravels.com

# ===========================================
# WHATSAPP INTEGRATION
# ===========================================
WHATSAPP_NUMBER=+6562352900
WHATSAPP_API_URL=https://wa.me/

# ===========================================
# LOGGING CONFIGURATION
# ===========================================
LOG_LEVEL=info
LOG_FILE=logs/server.log

# ===========================================
# RATE LIMITING
# ===========================================
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# ===========================================
# CORS CONFIGURATION
# ===========================================
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
CORS_CREDENTIALS=true
```

### Frontend Configuration (.env.local)

Create `/frontend/.env.local` file:

```env
# ===========================================
# API CONFIGURATION
# ===========================================
NEXT_PUBLIC_API_URL=http://localhost:3003
NEXT_PUBLIC_API_TIMEOUT=30000

# ===========================================
# PAYMENT CONFIGURATION
# ===========================================
NEXT_PUBLIC_AIRWALLEX_ENV=demo
# For production: NEXT_PUBLIC_AIRWALLEX_ENV=production

# ===========================================
# ANALYTICS CONFIGURATION
# ===========================================
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_google_analytics_id
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_facebook_pixel_id
NEXT_PUBLIC_HOTJAR_ID=your_hotjar_id

# ===========================================
# WHATSAPP CONFIGURATION
# ===========================================
NEXT_PUBLIC_WHATSAPP_NUMBER=+6562352900

# ===========================================
# APP CONFIGURATION
# ===========================================
NEXT_PUBLIC_APP_NAME=FT Travel Booking
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COMPANY_NAME=Fayyaz Travels
NEXT_PUBLIC_SUPPORT_EMAIL=support@fayyaztravels.com

# ===========================================
# FEATURE FLAGS
# ===========================================
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_WHATSAPP=true
NEXT_PUBLIC_ENABLE_CHAT=false
NEXT_PUBLIC_ENABLE_PWA=false
```

## 🏗️ API Integrations Setup

### 1. Airwallex Payment Integration

#### Demo/Sandbox Setup (Current)
The system is currently configured with Airwallex demo credentials:

- **API Key**: `8d9c682b097318be09d63724c908d02d490ce74eba9970657a6ed403b89140d99315ffdbc7dac9b29b442c3357c8b48e`
- **Client ID**: `x2uUrKZcR8OXL3gQOICUKw`
- **Environment**: `demo`

#### Production Setup
1. **Create Airwallex Account**: Sign up at [airwallex.com](https://airwallex.com)
2. **Get API Credentials**: Navigate to Developer > API Keys
3. **Update Environment Variables**:
```env
AIRWALLEX_API_KEY=your_production_api_key
AIRWALLEX_CLIENT_ID=your_production_client_id
AIRWALLEX_ENV=production
```

#### Webhook Configuration
1. **Login to Airwallex Dashboard**
2. **Navigate to**: Developer > Webhooks
3. **Add Endpoint**: `https://yourdomain.com/webhook/airwallex`
4. **Select Events**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.cancelled`
5. **Copy Webhook Secret** to `AIRWALLEX_WEBHOOK_SECRET`

### 2. Microsoft Graph Email Integration

#### Current Setup
The system uses Microsoft Graph API for enterprise email:

- **Client ID**: `7ed68eec-849f-447e-ac35-d58ff2f0e28f`
- **Tenant ID**: `4e2ec943-aea7-468f-9eb5-2e7b5e5f7d9b`
- **From Email**: `notifications@fayyaztravels.com`

#### Custom Setup
1. **Azure Portal Setup**:
   - Go to [portal.azure.com](https://portal.azure.com)
   - Navigate to Azure Active Directory > App registrations
   - Click "New registration"

2. **App Registration**:
   ```
   Name: FT Travel Email Service
   Supported account types: Single tenant
   Redirect URI: Not required for this setup
   ```

3. **API Permissions**:
   - Add permission: Microsoft Graph > Application permissions
   - Select: `Mail.Send`
   - Grant admin consent

4. **Client Secret**:
   - Go to Certificates & secrets
   - New client secret
   - Copy the secret value

5. **Update Configuration**:
```env
MS_CLIENT_ID=your_client_id
MS_CLIENT_SECRET=your_client_secret
MS_TENANT_ID=your_tenant_id
FROM_EMAIL=your_email@yourdomain.com
```

### 3. WhatsApp Integration

#### Current Setup
- **Number**: `+6562352900`
- **Integration**: Direct WhatsApp Web links

#### Custom Setup
1. **Business WhatsApp Account**:
   - Get WhatsApp Business account
   - Verify phone number

2. **Update Configuration**:
```env
WHATSAPP_NUMBER=+your_country_code_phone_number
```

3. **Advanced Integration** (Optional):
   - WhatsApp Business API
   - Third-party services like Twilio

## 🔐 Security Configuration

### 1. JWT Security
```env
# Generate strong JWT secret (minimum 32 characters)
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d  # Token expiration time
```

### 2. Database Security
```env
# Use strong database password
DB_PASSWORD=$(openssl rand -base64 16)

# Limit database access
DB_HOST=localhost  # Don't expose to public
```

### 3. CORS Configuration
```env
# Production CORS settings
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
CORS_CREDENTIALS=true
```

### 4. Rate Limiting
```env
# Prevent abuse
RATE_LIMIT_WINDOW=15      # minutes
RATE_LIMIT_MAX_REQUESTS=100  # requests per window
```

## 📊 Analytics Configuration

### 1. Google Analytics Setup
1. **Create GA4 Property**: [analytics.google.com](https://analytics.google.com)
2. **Get Measurement ID**: Format `G-XXXXXXXXXX`
3. **Update Configuration**:
```env
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### 2. Facebook Pixel Setup
1. **Create Facebook Pixel**: [business.facebook.com](https://business.facebook.com)
2. **Get Pixel ID**: Numeric ID
3. **Update Configuration**:
```env
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1234567890123456
```

### 3. Event Tracking
The system automatically tracks:
- Page views
- Enquiry form submissions
- Booking completions
- Payment events

## 🚀 Performance Configuration

### 1. Database Optimization
```sql
-- MySQL configuration (my.cnf)
[mysqld]
innodb_buffer_pool_size = 1G
max_connections = 200
query_cache_size = 64M
tmp_table_size = 64M
max_heap_table_size = 64M
```

### 2. Node.js Optimization
```env
# Memory limits
NODE_OPTIONS=--max-old-space-size=4096

# Process management
PM2_INSTANCES=max
PM2_EXEC_MODE=cluster
```

### 3. Frontend Optimization
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['localhost', 'yourdomain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
}
```

## 🌐 Production Configuration

### 1. Environment-Specific Settings

#### Development
```env
NODE_ENV=development
LOG_LEVEL=debug
AIRWALLEX_ENV=demo
NEXT_PUBLIC_API_URL=http://localhost:3003
```

#### Staging
```env
NODE_ENV=staging
LOG_LEVEL=info
AIRWALLEX_ENV=demo
NEXT_PUBLIC_API_URL=https://staging-api.yourdomain.com
```

#### Production
```env
NODE_ENV=production
LOG_LEVEL=warn
AIRWALLEX_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 2. SSL/HTTPS Configuration
```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔧 Configuration Validation

### 1. Backend Configuration Test
```bash
cd backend
node -e "
require('dotenv').config();
console.log('✅ Environment loaded');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('PORT:', process.env.PORT);
console.log('AIRWALLEX_ENV:', process.env.AIRWALLEX_ENV);
"
```

### 2. Database Connection Test
```bash
cd backend
node -e "
const db = require('./db');
db.execute('SELECT 1 as test')
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database error:', err.message));
"
```

### 3. Email Service Test
```bash
cd backend
node -e "
const emailService = require('./services/emailService');
emailService.sendTestEmail()
  .then(() => console.log('✅ Email service working'))
  .catch(err => console.error('❌ Email error:', err.message));
"
```

### 4. Payment Service Test
```bash
cd backend
node -e "
const airwallex = require('@airwallex/node-sdk');
console.log('✅ Airwallex SDK loaded');
console.log('Environment:', process.env.AIRWALLEX_ENV);
"
```

## 🚨 Troubleshooting Configuration

### Common Issues

#### 1. Environment Variables Not Loading
```bash
# Check .env file exists
ls -la backend/.env frontend/.env.local

# Check file permissions
chmod 600 backend/.env frontend/.env.local

# Verify syntax (no spaces around =)
cat backend/.env | grep -E "^[A-Z_]+=.*$"
```

#### 2. Database Connection Issues
```bash
# Test MySQL connection
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT 1;"

# Check MySQL service
sudo systemctl status mysql
```

#### 3. API Integration Issues
```bash
# Test Airwallex API
curl -X POST https://api-demo.airwallex.com/api/v1/authentication/login \
  -H "Content-Type: application/json" \
  -d "{\"x-client-id\": \"$AIRWALLEX_CLIENT_ID\", \"x-api-key\": \"$AIRWALLEX_API_KEY\"}"

# Test Microsoft Graph
curl -X POST https://login.microsoftonline.com/$MS_TENANT_ID/oauth2/v2.0/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=$MS_CLIENT_ID&client_secret=$MS_CLIENT_SECRET&scope=https://graph.microsoft.com/.default&grant_type=client_credentials"
```

## 📝 Configuration Checklist

### Pre-deployment Checklist
- [ ] All environment variables set
- [ ] Database connection tested
- [ ] Payment integration configured
- [ ] Email service working
- [ ] SSL certificates installed
- [ ] Analytics tracking setup
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] Logging configured
- [ ] Backup strategy in place

### Security Checklist
- [ ] Strong passwords used
- [ ] JWT secret is secure
- [ ] Database access restricted
- [ ] API keys are production-ready
- [ ] HTTPS enabled
- [ ] Rate limiting active
- [ ] Input validation enabled
- [ ] Error messages don't leak info

---

**✅ Your FT Travel Booking System is now properly configured!**

For additional help, refer to:
- `README.md` - General setup guide
- `DATABASE_SETUP.md` - Database configuration
- `DEPLOYMENT_GUIDE.md` - Production deployment
