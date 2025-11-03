// services/emailService.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Microsoft Graph credentials - these should be moved to environment variables
const clientId = process.env.MS_CLIENT_ID || "7ed68eec-849f-447e-ac35-d58ff2f0e28f";
const clientSecret = process.env.MS_CLIENT_SECRET || "cg98Q~7PMW210LPT~91FtCa2WVe4IJWBUyOS8aQo";
const tenantId = process.env.MS_TENANT_ID || "4e2ec943-aea7-468f-9eb5-2e7b5e5f7d9b";
const fromEmail = process.env.FROM_EMAIL || "notifications@fayyaztravels.com";
const fromName = process.env.FROM_NAME || "Fayyaz Travels";

const tokenCacheFile = path.join(process.cwd(), "email_token_cache.json");

// Helper: Get or refresh access token
async function getAccessToken() {
  try {
    // Check if we have a cached token that's still valid
    if (fs.existsSync(tokenCacheFile)) {
      const tokenData = JSON.parse(fs.readFileSync(tokenCacheFile, "utf8"));
      if (tokenData.expires_at > Date.now() / 1000) {
        return tokenData.access_token;
      }
    }

    // Get new token
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    });

    const { data } = await axios.post(tokenUrl, params);
    
    // Cache the token with 5-minute buffer before expiry
    const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in - 300;
    const tokenData = { access_token: data.access_token, expires_at: expiresAt };
    fs.writeFileSync(tokenCacheFile, JSON.stringify(tokenData, null, 2));
    
    return data.access_token;
  } catch (err) {
    console.error("Token fetch failed:", err.message);
    throw new Error("Failed to obtain access token");
  }
}

// Helper: Send email using Microsoft Graph API
async function sendEmail({ to, subject, htmlBody, cc = [], bcc = [] }) {
  const token = await getAccessToken();

  // Format recipients
  const toRecipients = [].concat(to).map((email) => ({
    emailAddress: { address: email },
  }));
  const ccRecipients = cc.map((email) => ({ emailAddress: { address: email } }));
  const bccRecipients = bcc.map((email) => ({ emailAddress: { address: email } }));

  const message = {
    message: {
      subject,
      body: { contentType: "HTML", content: htmlBody },
      toRecipients,
      ccRecipients,
      bccRecipients,
      from: { emailAddress: { address: fromEmail, name: fromName } },
    },
  };

  try {
    const res = await axios.post(
      `https://graph.microsoft.com/v1.0/users/${fromEmail}/sendMail`,
      message,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true, status: res.status, message: `Email sent to ${to}` };
  } catch (err) {
    const errorBody = err.response?.data || err.message;
    console.error('Email sending failed:', errorBody);
    return {
      success: false,
      status: err.response?.status || 500,
      message: "Email sending failed",
      error: errorBody,
    };
  }
}

// Template: Generate HTML email template (matches your original script format)
function generateEmailTemplate({ message, btnUrl = null, title = "Fayyaz Travels" }) {
  return `
    <html>
    <body style="font-family:Poppins,Arial,sans-serif; background:#f8f9fa;">
      <div style="max-width:650px;margin:auto;background:#fff;padding:30px;border-radius:12px;border:2px solid #14385C;">
        <div style="background:#14385C;color:#fff;padding:25px;text-align:center;">
          <img src="https://fayyaztravels.com/visa/assets/images/main-logo-white.png" alt="Fayyaz Travels" style="max-width:200px;">
        </div>
        <div style="padding:30px;color:#444;font-size:16px;line-height:1.7;">
          ${message}
          ${
            btnUrl
              ? `<div style="text-align:center;margin:25px 0;">
                  <a href="${btnUrl}" style="display:inline-block;padding:12px 24px;border-radius:50px;text-decoration:none;background:linear-gradient(135deg,#14385C,#1a4a7c);color:#fff;font-weight:500;">Click Here</a>
                </div>`
              : ""
          }
        </div>
        <div style="font-size:13px;text-align:center;color:#777;padding:20px;background:#f9f9f9;">
          &copy; ${new Date().getFullYear()} Fayyaz Travels | 
          <a href="mailto:unsubscribe@fayyaztravels.com?subject=Unsubscribe" style="color:#14385C;text-decoration:none;">Unsubscribe</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Service functions for different types of emails
const emailService = {
  // Send general enquiry notification
  async sendEnquiryNotification(enquiryData) {
    const { name, email, phone, travel_dates, pax, message, package_name, destination, package_type } = enquiryData;
    
    const adminEmail = process.env.ADMIN_EMAIL || "admin@fayyaztravels.com";
    const subject = `Start My Travel Plan with Fayyaz Travels - ${name}`;
    
    // Create tracking URL for email clicks
    const trackingId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const trackingUrl = `http://localhost:3003/track-email-click?id=${trackingId}&email=${encodeURIComponent(email)}&package=${encodeURIComponent(package_name || 'General')}`;
    
    const emailMessage = `
      <div style="background: linear-gradient(135deg, #14385C, #1a4a7c); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: white;">✈️ Start My Travel Plan with Fayyaz Travels</h2>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">New personalized trip planning request received</p>
      </div>
      
      <div style="background:#e8f4fd;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #14385C;">
        <h3 style="color:#14385C;margin-top:0;">📋 Travel Planning Request</h3>
        <p><strong>Hi Fayyaz Travels team,</strong></p>
        <p>I'd like help planning a personalized trip. Please find my details below:</p>
        
        <div style="background:white;padding:15px;border-radius:6px;border:1px solid #e0e0e0;margin:10px 0;">
          <p><strong>- Name:</strong> ${name}</p>
          <p><strong>- Contact number:</strong> ${phone || 'Not provided'}</p>
          <p><strong>- Number of travellers:</strong> ${pax || 'Not specified'}</p>
          <p><strong>- Nationality of travellers:</strong> [Customer to provide]</p>
          <p><strong>- Departure city:</strong> [Customer to provide]</p>
          <p><strong>- Destination(s):</strong> ${destination || package_name || 'Not specified'}</p>
          <p><strong>- Travel dates:</strong> ${travel_dates || 'Flexible'}</p>
          <p><strong>- Hotel preference:</strong> [Customer to provide]</p>
          <p><strong>- Flight requirements:</strong> [Customer to provide]</p>
          <p><strong>- Special requests:</strong> ${message || 'None specified'}</p>
        </div>
      </div>
      
      <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #28a745;">
        <h3 style="color:#14385C;margin-top:0;">👤 Contact Information</h3>
        <p><strong>Email:</strong> <a href="mailto:${email}?subject=Re: Your Travel Plan Request&body=Dear ${name},%0A%0AThank you for choosing Fayyaz Travels for your trip planning. We'd be delighted to create a personalized itinerary for you.%0A%0ATo provide you with the best recommendations, could you please provide:%0A- Your nationality%0A- Departure city%0A- Hotel preference (3*, 4*, 5*, or ultra-luxury)%0A- Flight requirements%0A%0AWe'll get back to you within 2 hours with a customized proposal.%0A%0ABest regards,%0AFayyaz Travels Team" style="color:#14385C;">${email}</a></p>
        <p><strong>Phone:</strong> ${phone ? `<a href="tel:${phone}" style="color:#14385C;">${phone}</a>` : 'Not provided'}</p>
        <p><strong>Interested Package:</strong> ${package_name || 'General Enquiry'}</p>
      </div>
      
      <div style="background:#d4edda;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #28a745;">
        <h3 style="color:#14385C;margin-top:0;">🚀 Quick Actions (Click Tracking Enabled)</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <a href="${trackingUrl}&action=email" 
             style="background:#14385C;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;font-weight:500;">
            📧 Reply via Email
          </a>
          <a href="${trackingUrl}&action=call" 
             style="background:#28a745;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;font-weight:500;">
            📞 Call Customer
          </a>
          <a href="${trackingUrl}&action=whatsapp" 
             style="background:#25d366;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;font-weight:500;">
            💬 WhatsApp
          </a>
          <a href="${trackingUrl}&action=plan" 
             style="background:#ffc107;color:#000;padding:10px 15px;text-decoration:none;border-radius:5px;font-weight:500;">
            🗺️ Start Planning
          </a>
        </div>
      </div>
      
      <div style="background:#fff3cd;padding:15px;border-radius:8px;margin:20px 0;border-left:4px solid #ffc107;">
        <p style="margin:0;color:#856404;font-weight:500;">📊 Tracking ID: ${trackingId}</p>
        <p style="margin:5px 0 0 0;color:#856404;font-size:14px;">All clicks on action buttons will be tracked for analytics</p>
      </div>
      
      <div style="background:#f8d7da;padding:15px;border-radius:8px;margin:20px 0;border-left:4px solid #dc3545;">
        <p style="margin:0;color:#721c24;font-weight:500;">⏰ Response Target: Within 2 hours for optimal conversion</p>
        <p style="margin:5px 0 0 0;color:#721c24;font-size:14px;">Quick responses increase booking probability by 60%</p>
      </div>
    `;
    
    const htmlBody = generateEmailTemplate({
      message: emailMessage,
      title: "Start My Travel Plan with Fayyaz Travels"
    });
    
    // Store tracking information in database
    this.storeEmailTracking(trackingId, email, package_name, name);
    
    return await sendEmail({
      to: adminEmail,
      subject,
      htmlBody,
      cc: [email] // CC the customer so they know we received their enquiry
    });
  },

  // Store email tracking information
  storeEmailTracking(trackingId, customerEmail, packageName, customerName) {
    const db = require('../db');
    const insertQuery = `
      INSERT INTO email_tracking (tracking_id, customer_email, package_name, customer_name, sent_at) 
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    db.query(insertQuery, [trackingId, customerEmail, packageName || 'General', customerName], (err, result) => {
      if (err) {
        console.error('⚠️ Failed to store email tracking:', err.message);
      } else {
        console.log('📊 Email tracking stored with ID:', trackingId);
      }
    });
  },

  // Send corporate enquiry notification
  async sendCorporateEnquiryNotification(enquiryData) {
    const { company, contact_person, email, phone, employees_count, travel_dates, message } = enquiryData;
    
    const adminEmail = process.env.ADMIN_EMAIL || "admin@fayyaztravels.com";
    const corporateEmail = process.env.CORPORATE_EMAIL || "corporate@fayyaztravels.com";
    const subject = `New Corporate Travel Enquiry from ${company}`;
    
    const emailMessage = `
      <h2>New Corporate Travel Enquiry Received</h2>
      <p>A new corporate travel enquiry has been submitted through your website:</p>
      
      <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
        <h3 style="color:#14385C;margin-top:0;">Company Details:</h3>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Contact Person:</strong> ${contact_person}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Number of Employees:</strong> ${employees_count || 'Not specified'}</p>
        <p><strong>Travel Dates:</strong> ${travel_dates || 'Not specified'}</p>
      </div>
      
      <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
        <h3 style="color:#14385C;margin-top:0;">Requirements:</h3>
        <p style="white-space:pre-wrap;">${message}</p>
      </div>
      
      <p style="color:#666;font-size:14px;margin-top:30px;">
        This is a corporate enquiry and should be prioritized. Please respond within 24 hours.
      </p>
    `;
    
    const htmlBody = generateEmailTemplate({
      message: emailMessage,
      title: "New Corporate Travel Enquiry"
    });
    
    return await sendEmail({
      to: [adminEmail, corporateEmail],
      subject,
      htmlBody,
      cc: [email] // CC the corporate contact so they know we received their enquiry
    });
  },

  // Send custom email (for general use)
  async sendCustomEmail({ to, subject, message, btnUrl = null, cc = [], bcc = [] }) {
    const htmlBody = generateEmailTemplate({ message, btnUrl });
    return await sendEmail({ to, subject, htmlBody, cc, bcc });
  },

  // Send booking confirmation email
  async sendBookingConfirmation(bookingData) {
    const { customer_email, customer_name, booking_id, package_name, total_amount } = bookingData;
    
    const subject = `Booking Confirmation - ${package_name}`;
    const emailMessage = `
      <h2>Booking Confirmation</h2>
      <p>Dear ${customer_name},</p>
      <p>Thank you for booking with Fayyaz Travels! Your booking has been confirmed.</p>
      
      <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
        <h3 style="color:#14385C;margin-top:0;">Booking Details:</h3>
        <p><strong>Booking ID:</strong> ${booking_id}</p>
        <p><strong>Package:</strong> ${package_name}</p>
        <p><strong>Total Amount:</strong> SGD ${total_amount}</p>
      </div>
      
      <p>We will contact you shortly with further details about your travel arrangements.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
    `;
    
    const htmlBody = generateEmailTemplate({
      message: emailMessage,
      title: "Booking Confirmation",
      btnUrl: `${process.env.FRONTEND_URL || 'https://fayyaztravels.com'}/my-bookings`
    });
    
    return await sendEmail({
      to: customer_email,
      subject,
      htmlBody
    });
  }
};

module.exports = emailService;
