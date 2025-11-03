# 📡 API Documentation - FT Travel Booking System

## 📋 Overview

This document provides comprehensive API documentation for the FT Travel Booking System backend services.

**Base URL**: `http://localhost:3003` (Development) | `https://api.yourdomain.com` (Production)

## 🔐 Authentication

### JWT Token Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Authentication Flow
1. **Register/Login** to get JWT token
2. **Include token** in subsequent requests
3. **Token expires** in 7 days (configurable)

## 📚 API Endpoints

### 🔑 Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+65 1234 5678"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+65 1234 5678"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already exists",
  "error": "DUPLICATE_EMAIL"
}
```

#### POST /auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout
Logout user (invalidate token).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 📦 Package Endpoints

#### GET /packages
Get all travel packages with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `destination` (optional): Filter by destination
- `min_price` (optional): Minimum price filter
- `max_price` (optional): Maximum price filter
- `search` (optional): Search in package names

**Example Request:**
```
GET /packages?page=1&limit=10&category=Asia&min_price=1000&max_price=5000
```

**Response (200):**
```json
{
  "success": true,
  "packages": [
    {
      "id": 199,
      "p_name": "Taiwan Odyssey: 8 Days of Nature, Culture & Modern Marvel",
      "p_slug": "taiwan-odyssey-8-days",
      "p_description": "Experience the best of Taiwan...",
      "p_price": 4299.00,
      "p_currency": "SGD",
      "p_duration": 8,
      "p_category": "Asia",
      "p_destination": "Taiwan",
      "p_image": "/images/packages/taiwan-odyssey.jpg",
      "p_status": "active"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 45,
    "items_per_page": 10
  }
}
```

#### GET /packages/:id
Get specific package details by ID.

**Response (200):**
```json
{
  "success": true,
  "package": {
    "id": 199,
    "p_name": "Taiwan Odyssey: 8 Days of Nature, Culture & Modern Marvel",
    "p_slug": "taiwan-odyssey-8-days",
    "p_description": "Experience the best of Taiwan with this comprehensive 8-day tour...",
    "p_price": 4299.00,
    "p_currency": "SGD",
    "p_duration": 8,
    "p_category": "Asia",
    "p_destination": "Taiwan",
    "p_image": "/images/packages/taiwan-odyssey.jpg",
    "p_status": "active",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

#### GET /packages/category/:category
Get packages by category.

**Parameters:**
- `category`: Category name (e.g., "asia", "africa", "europe")

**Response (200):**
```json
{
  "success": true,
  "category": "Asia",
  "packages": [
    {
      "id": 199,
      "p_name": "Taiwan Odyssey",
      "p_price": 4299.00,
      "p_duration": 8,
      "p_destination": "Taiwan"
    }
  ],
  "count": 15
}
```

#### GET /packages/hot-deals
Get featured/hot deal packages.

**Response (200):**
```json
{
  "success": true,
  "packages": [
    {
      "id": 199,
      "p_name": "Taiwan Odyssey",
      "p_price": 4299.00,
      "original_price": 4999.00,
      "discount_percentage": 14,
      "p_duration": 8
    }
  ]
}
```

### 🎫 Booking Endpoints

#### POST /bookings
Create a new booking.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "package_id": 199,
  "primary_email": "john@example.com",
  "primary_fname": "John",
  "primary_lname": "Doe",
  "primary_phone": "+65 1234 5678",
  "primary_title": "Mr",
  "primary_ccode": "+65",
  "primary_country": "Singapore",
  "travel_date": "2024-03-15",
  "return_date": "2024-03-23",
  "adults": 2,
  "children": 0,
  "hotel_type": "4-star",
  "flight_ticket": "yes",
  "special_requests": "Vegetarian meals preferred",
  "notes": "Anniversary trip"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "id": 105,
    "package_id": 199,
    "primary_email": "john@example.com",
    "booking_amount": 8598.00,
    "currency": "SGD",
    "payment_status": "pending",
    "booking_status": 0,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /bookings
Get user's bookings.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `user_email` (required): User's email address
- `status` (optional): Filter by booking status
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200):**
```json
{
  "success": true,
  "bookings": [
    {
      "id": 105,
      "package_id": 199,
      "package_name": "Taiwan Odyssey",
      "primary_email": "john@example.com",
      "travel_date": "2024-03-15",
      "booking_amount": 8598.00,
      "payment_status": "succeeded",
      "booking_status": 1,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_items": 3
  }
}
```

#### GET /bookings/details
Get detailed booking information for admin.

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `booking_id` (optional): Specific booking ID
- `user_email` (optional): Filter by user email
- `status` (optional): Filter by status
- `date_from` (optional): Filter from date
- `date_to` (optional): Filter to date

**Response (200):**
```json
{
  "success": true,
  "bookings": [
    {
      "id": 105,
      "user_id": 1,
      "package_id": 199,
      "package_name": "Taiwan Odyssey",
      "primary_fname": "John",
      "primary_lname": "Doe",
      "primary_email": "john@example.com",
      "travel_date": "2024-03-15",
      "adults": 2,
      "children": 0,
      "booking_amount": 8598.00,
      "payment_intent_id": "pi_1234567890",
      "payment_status": "succeeded",
      "booking_status": 1,
      "special_requests": "Vegetarian meals",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 💳 Payment Endpoints

#### POST /create-payment-intent
Create Airwallex payment intent for booking.

**Request Body:**
```json
{
  "package_id": 199,
  "customer_details": {
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+65 1234 5678"
  },
  "travel_details": {
    "travel_date": "2024-03-15",
    "adults": 2,
    "children": 0
  },
  "amount": 8598.00,
  "currency": "SGD"
}
```

**Response (200):**
```json
{
  "success": true,
  "client_secret": "pi_1234567890_secret_abcdef123456",
  "payment_intent_id": "pi_1234567890",
  "booking_id": 105,
  "merchant_order_id": "FT-200-1234567890-abc123",
  "amount": 8598.00,
  "currency": "SGD"
}
```

#### POST /webhook/airwallex
Airwallex payment webhook endpoint.

**Headers:**
- `x-signature`: Webhook signature for verification

**Request Body:**
```json
{
  "id": "evt_1234567890",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "status": "succeeded",
      "amount": 8598.00,
      "currency": "SGD",
      "merchant_order_id": "FT-200-1234567890-abc123"
    }
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

### 👤 User Profile Endpoints

#### GET /user/profile/detailed
Get detailed user profile with booking statistics.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `user_email` (required): User's email address

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+65 1234 5678",
    "totalBookings": 5,
    "countriesVisited": 8,
    "memberSince": "2023-06-15",
    "created_at": "2023-06-15T10:30:00Z"
  }
}
```

#### PUT /profile
Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `user_email` (required): User's email address

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+65 9876 5432"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+65 9876 5432"
  }
}
```

#### GET /profile/updated
Get updated user profile after modifications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `user_email` (required): User's email address

**Response (200):**
```json
{
  "success": true,
  "user": {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@example.com",
    "phone": "+65 9876 5432",
    "totalBookings": 5,
    "countriesVisited": 8,
    "memberSince": "2023-06-15"
  }
}
```

### 📧 Email & Enquiry Endpoints

#### POST /sendMail
Send general email using Microsoft Graph API.

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "message": "<h2>Hello World</h2><p>This is a test email.</p>",
  "cc": "cc@example.com"
}
```

**Response (202):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "msg_1234567890"
}
```

#### POST /sendEnquiryNotification
Send enquiry notification email to admin.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+65 9876 5432",
  "package_name": "Asia Travel Packages",
  "destination": "Asia",
  "travel_dates": "March 2024",
  "pax": "2 Adults",
  "message": "Interested in Taiwan and Japan packages",
  "source_page": "/packages/asia"
}
```

**Response (202):**
```json
{
  "success": true,
  "message": "Enquiry notification sent successfully",
  "enquiry_id": "enq_1234567890"
}
```

### 🔍 Search & Filter Endpoints

#### GET /search/packages
Advanced package search with multiple filters.

**Query Parameters:**
- `q` (optional): Search query
- `category` (optional): Package category
- `destination` (optional): Destination filter
- `min_price` (optional): Minimum price
- `max_price` (optional): Maximum price
- `min_duration` (optional): Minimum duration in days
- `max_duration` (optional): Maximum duration in days
- `sort_by` (optional): Sort field (price, duration, name)
- `sort_order` (optional): Sort order (asc, desc)

**Example Request:**
```
GET /search/packages?q=taiwan&category=asia&min_price=3000&max_price=5000&sort_by=price&sort_order=asc
```

**Response (200):**
```json
{
  "success": true,
  "results": [
    {
      "id": 199,
      "p_name": "Taiwan Odyssey",
      "p_price": 4299.00,
      "p_duration": 8,
      "p_destination": "Taiwan",
      "relevance_score": 0.95
    }
  ],
  "total_results": 3,
  "search_time": "0.05s"
}
```

### 📊 Analytics Endpoints

#### POST /analytics/track
Track user events for analytics.

**Request Body:**
```json
{
  "event_type": "enquiry_form_submitted",
  "package_name": "Taiwan Odyssey",
  "destination": "Taiwan",
  "user_session": "sess_1234567890",
  "page_url": "/packages/asia/taiwan",
  "user_agent": "Mozilla/5.0...",
  "ip_address": "192.168.1.1"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Event tracked successfully",
  "event_id": "evt_1234567890"
}
```

#### GET /analytics/dashboard
Get analytics dashboard data (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)
- `metric` (optional): Specific metric to fetch

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_bookings": 150,
    "total_enquiries": 320,
    "conversion_rate": 0.47,
    "popular_destinations": [
      {"destination": "Taiwan", "bookings": 45},
      {"destination": "Japan", "bookings": 32}
    ],
    "revenue": {
      "total": 645750.00,
      "currency": "SGD"
    }
  }
}
```

### 🏥 Health & Status Endpoints

#### GET /health
System health check endpoint.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "ok",
    "email": "ok",
    "payment": "ok"
  },
  "version": "1.0.0",
  "uptime": "5d 12h 30m"
}
```

#### GET /status
Detailed system status information.

**Response (200):**
```json
{
  "status": "operational",
  "services": {
    "api": {
      "status": "operational",
      "response_time": "45ms"
    },
    "database": {
      "status": "operational",
      "connections": 5,
      "max_connections": 100
    },
    "email_service": {
      "status": "operational",
      "last_email_sent": "2024-01-15T10:25:00Z"
    },
    "payment_service": {
      "status": "operational",
      "environment": "demo"
    }
  }
}
```

## 🚨 Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": {
    "field": "specific error details"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 202 | Accepted - Request accepted for processing |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation errors |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Common Error Codes

| Error Code | Description |
|------------|-------------|
| `INVALID_CREDENTIALS` | Login credentials are incorrect |
| `TOKEN_EXPIRED` | JWT token has expired |
| `DUPLICATE_EMAIL` | Email already exists |
| `PACKAGE_NOT_FOUND` | Package ID does not exist |
| `BOOKING_NOT_FOUND` | Booking ID does not exist |
| `PAYMENT_FAILED` | Payment processing failed |
| `VALIDATION_ERROR` | Request validation failed |
| `DATABASE_ERROR` | Database operation failed |
| `EMAIL_SEND_FAILED` | Email sending failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

## 🔒 Rate Limiting

### Default Limits
- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 10 requests per 15 minutes per IP
- **Payment**: 20 requests per 15 minutes per IP
- **Email**: 5 requests per 15 minutes per IP

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## 📝 Request/Response Examples

### Complete Booking Flow Example

#### 1. Get Package Details
```bash
curl -X GET "http://localhost:3003/packages/199" \
  -H "Content-Type: application/json"
```

#### 2. Create Payment Intent
```bash
curl -X POST "http://localhost:3003/create-payment-intent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "package_id": 199,
    "customer_details": {
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "amount": 4299.00,
    "currency": "SGD"
  }'
```

#### 3. Create Booking
```bash
curl -X POST "http://localhost:3003/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "package_id": 199,
    "primary_email": "john@example.com",
    "primary_fname": "John",
    "primary_lname": "Doe",
    "travel_date": "2024-03-15",
    "adults": 2
  }'
```

## 🧪 Testing the API

### Using cURL
```bash
# Test health endpoint
curl -X GET "http://localhost:3003/health"

# Test authentication
curl -X POST "http://localhost:3003/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Test with authentication
curl -X GET "http://localhost:3003/bookings?user_email=test@example.com" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman
Import the following collection for comprehensive API testing:

```json
{
  "info": {
    "name": "FT Travel API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3003"
    },
    {
      "key": "jwt_token",
      "value": ""
    }
  ]
}
```

---

**📡 Your FT Travel Booking System API is fully documented and ready for integration!**

For additional support or questions about the API, refer to the health endpoints or contact the development team.
