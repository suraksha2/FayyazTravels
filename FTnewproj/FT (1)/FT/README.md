# 🌟 FT Travel Booking System - Complete Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Database Configuration](#database-configuration)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Features](#features)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

FT Travel Booking System is a comprehensive travel booking platform built with modern web technologies. It features a complete booking flow with payment processing, user authentication, enquiry management, and admin dashboard.

### 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   Next.js       │◄──►│   Node.js       │◄──►│     MySQL       │
│   Port 3000     │    │   Port 3003     │    │   Port 3306     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Frontend Stack:**
- Next.js 13.5.1 with TypeScript
- Tailwind CSS + shadcn/ui components
- Airwallex Payment SDK
- React Hook Form + Zod validation

**Backend Stack:**
- Node.js with Fastify framework
- MySQL database with mysql2 driver
- Airwallex Node SDK for payments
- Microsoft Graph API for emails
- JWT authentication

## 🔧 Prerequisites

Before installation, ensure you have:

- **Node.js** (v16.0.0 or higher)
- **npm** or **yarn** package manager
- **MySQL** (v8.0 or higher)
- **Git** for version control

### System Requirements
- **RAM:** Minimum 4GB, Recommended 8GB
- **Storage:** Minimum 2GB free space
- **OS:** Windows 10+, macOS 10.15+, or Linux Ubuntu 18.04+

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd FT
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env file with your configurations
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Database Setup
```bash
cd ../backend
# Create MySQL database first
mysql -u root -p
CREATE DATABASE ft_travel_db;
exit

# Run database setup
node setup-database.js
```

## 🗄️ Database Configuration

### Database Schema

The system uses the following main tables:

#### Core Tables
- **tbl_users** - User accounts and profiles
- **tbl_packages** - Travel packages and tours
- **tbl_booking** - Booking records and payments
- **enquiries** - Customer enquiries and leads

#### Supporting Tables
- **enquiry_analytics** - Enquiry tracking and analytics
- **enquiry_follow_ups** - Admin follow-up actions
- **tbl_categories** - Package categories

### Database Connection Setup

1. **Create MySQL Database:**
```sql
CREATE DATABASE ft_travel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ft_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON ft_travel_db.* TO 'ft_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Update .env file:**
```env
DB_HOST=localhost
DB_USER=ft_user
DB_PASSWORD=secure_password
DB_NAME=ft_travel_db
DB_PORT=3306
```

3. **Run Setup Script:**
```bash
cd backend
node setup-database.js
```

## ⚙️ Environment Variables

### Backend (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ft_travel_db
DB_PORT=3306

# Server Configuration
PORT=3003
NODE_ENV=development

# Airwallex Payment Configuration
AIRWALLEX_API_KEY=your_airwallex_api_key
AIRWALLEX_CLIENT_ID=your_client_id
AIRWALLEX_ENV=demo  # or 'production'
AIRWALLEX_WEBHOOK_SECRET=your_webhook_secret

# Security
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration - Microsoft Graph API
MS_CLIENT_ID=your_microsoft_client_id
MS_CLIENT_SECRET=your_microsoft_client_secret
MS_TENANT_ID=your_microsoft_tenant_id
FROM_EMAIL=notifications@yourdomain.com
FROM_NAME=Your Company Name
ADMIN_EMAIL=admin@yourdomain.com
CORPORATE_EMAIL=corporate@yourdomain.com
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3003
NEXT_PUBLIC_AIRWALLEX_ENV=demo
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id
```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start Backend Server:**
```bash
cd backend
npm start
# Server runs on http://localhost:3003
```

2. **Start Frontend Server:**
```bash
cd frontend
npm run dev
# Application runs on http://localhost:3000
```

### Production Mode

1. **Build Frontend:**
```bash
cd frontend
npm run build
npm start
```

2. **Start Backend:**
```bash
cd backend
NODE_ENV=production npm start
```

## 🔌 API Documentation

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Package Endpoints
- `GET /packages` - List all packages
- `GET /packages/:id` - Get package details
- `GET /packages/category/:category` - Get packages by category
- `GET /packages/hot-deals` - Get featured packages

### Booking Endpoints
- `POST /bookings` - Create new booking
- `GET /bookings` - Get user bookings
- `POST /create-payment-intent` - Create Airwallex payment
- `POST /webhook/airwallex` - Payment webhook

### User Endpoints
- `GET /user/profile/detailed` - Get user profile
- `PUT /profile` - Update user profile

### Enquiry Endpoints
- `POST /sendEnquiryNotification` - Send enquiry email
- `POST /sendMail` - Send general email

## ✨ Features

### 🎫 Booking System
- **Complete Booking Flow** with Airwallex payment integration
- **Package Selection** from multiple categories
- **User Authentication** and profile management
- **Booking History** and status tracking

### 📧 Enquiry Management
- **Professional Enquiry Forms** on 30+ package pages
- **Microsoft Graph Email Integration** for notifications
- **WhatsApp Integration** with floating button
- **Analytics Tracking** for conversion optimization

### 👤 User Management
- **Registration/Login System** with JWT authentication
- **Profile Management** with real-time updates
- **My Account Dashboard** with booking statistics
- **Password Reset** functionality

### 💳 Payment Processing
- **Airwallex Integration** for secure payments
- **Multiple Payment Methods** support
- **Payment Status Tracking** and webhooks
- **Refund Management** capabilities

### 📊 Admin Features
- **Booking Management Dashboard**
- **Enquiry Tracking System**
- **User Management Interface**
- **Analytics and Reporting**

## 🚀 Deployment

### Production Checklist

1. **Environment Setup:**
   - Update all `.env` files with production values
   - Set `NODE_ENV=production`
   - Configure production database

2. **Security Configuration:**
   - Use strong JWT secrets
   - Enable HTTPS
   - Configure CORS for production domains
   - Set up rate limiting

3. **Database Migration:**
   - Run production database setup
   - Import initial data
   - Set up database backups

4. **Payment Configuration:**
   - Switch Airwallex to production mode
   - Update API keys and secrets
   - Configure production webhooks

5. **Email Configuration:**
   - Verify Microsoft Graph API credentials
   - Test email delivery
   - Configure production email templates

### Deployment Options

#### Option 1: Traditional Server
```bash
# Build application
cd frontend && npm run build
cd ../backend && npm install --production

# Start with PM2
npm install -g pm2
pm2 start server.js --name "ft-backend"
pm2 start npm --name "ft-frontend" -- start
```

#### Option 2: Docker Deployment
```dockerfile
# Dockerfile example for backend
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3003
CMD ["npm", "start"]
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check MySQL service
sudo systemctl status mysql

# Test connection
mysql -u ft_user -p ft_travel_db

# Reset password if needed
ALTER USER 'ft_user'@'localhost' IDENTIFIED BY 'new_password';
```

#### Payment Integration Issues
```bash
# Verify Airwallex credentials
curl -X POST https://api-demo.airwallex.com/api/v1/authentication/login \
  -H "Content-Type: application/json" \
  -d '{"x-client-id": "your_client_id", "x-api-key": "your_api_key"}'
```

#### Email Service Not Working
```bash
# Test Microsoft Graph API
node -e "
const axios = require('axios');
// Test authentication with your credentials
"
```

### Performance Optimization

1. **Database Indexing:**
   - Ensure proper indexes on frequently queried columns
   - Monitor slow query log
   - Use connection pooling

2. **Frontend Optimization:**
   - Enable Next.js image optimization
   - Implement lazy loading
   - Use CDN for static assets

3. **Backend Optimization:**
   - Implement caching strategies
   - Use compression middleware
   - Monitor memory usage

### Monitoring & Logging

1. **Application Logs:**
```bash
# View backend logs
tail -f backend/logs/server.log

# View PM2 logs
pm2 logs ft-backend
```

2. **Database Monitoring:**
```sql
-- Check database performance
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Slow_queries';
```

## 📞 Support

For technical support or questions:
- **Documentation:** Check existing `.md` files in project
- **Issues:** Create GitHub issues for bugs
- **Email:** Contact development team

## 📄 License

This project is proprietary software. All rights reserved.

---

**🎉 Your FT Travel Booking System is now ready for production use!**
