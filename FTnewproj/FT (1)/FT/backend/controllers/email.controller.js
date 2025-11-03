// controllers/email.controller.js
const emailService = require('../services/emailService');

// POST /sendMail - Send custom email (compatible with your original script)
exports.sendMail = async (req, reply) => {
  try {
    const { to, subject, message, btnUrl, cc, bcc } = req.body;

    // Validation
    if (!to || !subject || !message) {
      return reply.status(400).send({ 
        success: false, 
        message: "Missing required fields: to, subject, message" 
      });
    }

    // Send email using the email service
    const result = await emailService.sendCustomEmail({
      to,
      subject,
      message,
      btnUrl,
      cc: cc || [],
      bcc: bcc || []
    });

    // Return response in the format expected by your original script
    reply.status(result.success ? 200 : 500).send(result);
  } catch (err) {
    console.error("Email sending error:", err);
    reply.status(500).send({ 
      success: false, 
      message: err.message || "Failed to send email" 
    });
  }
};

// POST /sendEnquiryNotification - Send enquiry notification to admin
exports.sendEnquiryNotification = async (req, reply) => {
  try {
    const enquiryData = req.body;
    
    // Store enquiry in database using existing tbl_enquiries table
    const db = require('../db');
    
    // Prepare message with package details since tbl_enquiries doesn't have separate package fields
    const fullMessage = `
Package: ${enquiryData.package_name || 'Not specified'}
Package Type: ${enquiryData.package_type || 'Not specified'}
Destination: ${enquiryData.destination || 'Not specified'}

Customer Message:
${enquiryData.message || 'No additional message provided.'}

Additional Info:
- Source Page: ${req.headers.referer || 'Direct'}
- User Agent: ${req.headers['user-agent'] || 'Unknown'}
    `.trim();
    
    const insertQuery = `
      INSERT INTO tbl_enquiries (name, email, phone, travel_dates, pax, message) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      enquiryData.name,
      enquiryData.email,
      enquiryData.phone || null,
      enquiryData.travel_dates || null,
      parseInt(enquiryData.pax) || null, // Convert to integer as table expects int
      fullMessage
    ];
    
    // Save to database using callback format
    db.query(insertQuery, values, (dbErr, dbResult) => {
      if (dbErr) {
        console.error('⚠️ Failed to store enquiry in database:', dbErr.message);
      } else {
        console.log('✅ Enquiry stored in database with ID:', dbResult.insertId);
      }
    });
    
    console.log('📧 New enquiry received:', {
      name: enquiryData.name,
      email: enquiryData.email,
      package: enquiryData.package_name,
      destination: enquiryData.destination
    });
    
    // Send email notification
    const result = await emailService.sendEnquiryNotification(enquiryData);
    
    reply.status(result.success ? 200 : 500).send(result);
  } catch (err) {
    console.error("Enquiry notification error:", err);
    reply.status(500).send({ 
      success: false, 
      message: err.message || "Failed to send enquiry notification" 
    });
  }
};

// POST /sendCorporateEnquiryNotification - Send corporate enquiry notification to admin
exports.sendCorporateEnquiryNotification = async (req, reply) => {
  try {
    const enquiryData = req.body;
    
    const result = await emailService.sendCorporateEnquiryNotification(enquiryData);
    
    reply.status(result.success ? 200 : 500).send(result);
  } catch (err) {
    console.error("Corporate enquiry notification error:", err);
    reply.status(500).send({ 
      success: false, 
      message: err.message || "Failed to send corporate enquiry notification" 
    });
  }
};

// POST /sendBookingConfirmation - Send booking confirmation email
exports.sendBookingConfirmation = async (req, reply) => {
  try {
    const bookingData = req.body;
    
    const result = await emailService.sendBookingConfirmation(bookingData);
    
    reply.status(result.success ? 200 : 500).send(result);
  } catch (err) {
    console.error("Booking confirmation error:", err);
    reply.status(500).send({ 
      success: false, 
      message: err.message || "Failed to send booking confirmation" 
    });
  }
};
