// controllers/enquiry.controller.js
const db = require('../db');
const emailService = require('../services/emailService');

// POST /enquiries – create a general contact / quote enquiry
exports.create = async (req, reply) => {
  const { name, email, phone, travel_dates, pax, message } = req.body;
  if (!name || !email || !message) {
    return reply.status(400).send({ error: 'name, email, and message are required' });
  }
  
  const enquiry = {
    name,
    email,
    phone: phone || null,
    travel_dates: travel_dates || null,
    pax: pax || null,
    message,
    created_at: new Date()
  };
  
  // Save to database
  db.query('INSERT INTO tbl_enquiries SET ?', enquiry, async (err, res) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Failed to save enquiry', details: err.message });
    }
    
    // Send email notification
    try {
      const emailResult = await emailService.sendEnquiryNotification(enquiry);
      console.log('Email notification result:', emailResult);
    } catch (emailErr) {
      console.error('Email notification failed:', emailErr);
      // Don't fail the request if email fails, just log it
    }
    
    reply.status(201).send({ 
      success: true,
      id: res.insertId, 
      message: 'Enquiry submitted successfully',
      enquiry: { ...enquiry, id: res.insertId }
    });
  });
};
