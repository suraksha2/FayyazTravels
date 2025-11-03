# Enquiry Email Integration - FT Travel Booking System

## Overview
Successfully integrated the provided email service script into the FT travel booking system. All "Enquire Now" buttons across the website now trigger a professional enquiry modal that sends emails using Microsoft Graph API.

## ✅ What Was Implemented

### 1. **Email Service Integration**
- **Backend**: Updated existing email service to match your provided script exactly
- **API Endpoints**: 
  - `POST /sendMail` - General email sending (matches your script)
  - `POST /sendEnquiryNotification` - Sends enquiry notifications to admin
- **Template**: Updated HTML email template to match your script's format
- **Credentials**: Uses existing Microsoft Graph API credentials

### 2. **Reusable Components Created**
- **`EnquiryModal.tsx`**: Professional modal component for all enquiry forms
- **`useEnquiryModal.ts`**: Custom hook for modal state management
- **Features**:
  - Responsive design with company branding
  - Form validation and error handling
  - Success confirmation with options
  - Package-specific information display

### 3. **Integration Across Website**
- **30+ Pages Updated**: All package pages with "Enquire Now" buttons
- **Categories Covered**:
  - Asia country pages (17 pages)
  - Africa country pages (8 pages) 
  - Group tour pages (3 pages)
  - Special package pages (2 pages)
- **Smart Context**: Each button passes relevant package/destination info

## 🚀 How It Works

### User Journey
1. **User clicks "Enquire Now"** on any package page
2. **Modal opens** with package-specific information pre-filled
3. **User fills form** with their details and requirements
4. **Email sent** to admin with enquiry details
5. **Success confirmation** shown to user
6. **Admin receives** formatted email with customer details

### Email Flow
```
Frontend Form → EnquiryModal → API Call → Backend Service → Microsoft Graph → Admin Email
```

### Email Content
- **To**: Admin email (admin@fayyaztravels.com)
- **CC**: Customer email (so they know we received it)
- **Subject**: "New Travel Enquiry from [Customer Name]"
- **Content**: Professional HTML template with:
  - Customer details (name, email, phone)
  - Travel preferences (dates, travelers)
  - Package information (name, destination, type)
  - Customer message/requirements

## 📁 Files Modified/Created

### New Files
- `/frontend/components/EnquiryModal.tsx`
- `/frontend/hooks/useEnquiryModal.ts`
- `/frontend/scripts/update-enquiry-buttons.js`

### Updated Files
- `/backend/services/emailService.js` - Updated template format
- 30+ package pages with EnquiryModal integration

## 🧪 Testing Results

### Email Service Tests
```bash
# General email endpoint
curl -X POST http://localhost:3003/sendMail \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "subject": "Test", "message": "<h2>Test</h2>"}'
# ✅ Response: {"success":true,"status":202,"message":"Email sent to test@example.com"}

# Enquiry notification endpoint  
curl -X POST http://localhost:3003/sendEnquiryNotification \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "message": "Test enquiry"}'
# ✅ Response: {"success":true,"status":202,"message":"Email sent to admin@fayyaztravels.com"}
```

### Frontend Integration
- ✅ Modal opens on button click
- ✅ Form validation works
- ✅ Package context passed correctly
- ✅ Success/error states handled
- ✅ Responsive design on all devices

## 🔧 Configuration

### Environment Variables (Already Set)
```env
MS_CLIENT_ID=7ed68eec-849f-447e-ac35-d58ff2f0e28f
MS_CLIENT_SECRET=cg98Q~7PMW210LPT~91FtCa2WVe4IJWBUyOS8aQo
MS_TENANT_ID=4e2ec943-aea7-468f-9eb5-2e7b5e5f7d9b
FROM_EMAIL=notifications@fayyaztravels.com
FROM_NAME=Fayyaz Travels
ADMIN_EMAIL=admin@fayyaztravels.com
```

### Servers Running
- **Backend**: http://localhost:3003 ✅
- **Frontend**: http://localhost:3000 ✅

## 📋 Usage Examples

### Basic Enquiry Button
```tsx
<Button 
  onClick={() => openModal({
    packageName: "Asia Travel Packages",
    packageType: "Regional Packages", 
    destination: "Asia"
  })}
  className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
>
  Enquire Now
</Button>
```

### Custom Package Enquiry
```tsx
<Button 
  onClick={() => openModal({
    packageName: "Custom China Trip",
    packageType: "Customized Package",
    destination: "China"
  })}
>
  Get in touch
</Button>
```

## 🎯 Benefits Achieved

1. **Unified Experience**: All enquiry buttons now have consistent, professional behavior
2. **Better Lead Capture**: Structured form captures all necessary customer information
3. **Automated Notifications**: Admin receives immediate email alerts for new enquiries
4. **Customer Confirmation**: Customers get confirmation their enquiry was received
5. **Package Context**: Each enquiry includes specific package/destination information
6. **Mobile Friendly**: Responsive design works on all devices
7. **Error Handling**: Proper feedback for success/failure scenarios

## 🔄 Maintenance

### Adding New Pages
To add enquiry functionality to new pages:
1. Import the components:
   ```tsx
   import EnquiryModal from "@/components/EnquiryModal"
   import { useEnquiryModal } from "@/hooks/useEnquiryModal"
   ```
2. Add the hook: `const { isOpen, modalData, openModal, closeModal } = useEnquiryModal()`
3. Add onClick handler to button: `onClick={() => openModal({...})}`
4. Add modal component: `<EnquiryModal isOpen={isOpen} onClose={closeModal} .../>`

### Bulk Updates
Use the provided script: `node scripts/update-enquiry-buttons.js`

---

## ✨ Integration Complete!

All "Enquire Now" buttons across the FT travel booking system are now fully functional with professional email integration. The system is ready for production use and will help capture and convert more travel enquiries into bookings.
