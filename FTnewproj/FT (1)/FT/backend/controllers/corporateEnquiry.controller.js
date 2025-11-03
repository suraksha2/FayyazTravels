// controllers/corporateEnquiry.controller.js
const db = require('../db');
const emailService = require('../services/emailService');

// POST /corporate-enquiries – corporate travel request
exports.create = async (req, reply) => {
  const { 
    company, 
    contact_person, 
    email, 
    phone, 
    employees_count, 
    travel_dates, 
    message 
  } = req.body;
  
  // Validation
  if (!company || !contact_person || !email || !message) {
    return reply.status(400).send({ 
      error: 'company, contact_person, email and message are required' 
    });
  }
  
  const record = {
    company,
    contact_person,
    email,
    phone: phone || null,
    employees_count: employees_count ? parseInt(employees_count) : null,
    travel_dates: travel_dates || null,
    pax: employees_count ? parseInt(employees_count) : null, // Map employees_count to pax for compatibility
    budget: null, // Can be enhanced later if needed
    message,
    created_at: new Date()
  };
  
  db.query('INSERT INTO tbl_corporate_enquiries SET ?', record, async (err, res) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Failed to create corporate enquiry', details: err.message });
    }
    
    // Send email notification
    try {
      const emailResult = await emailService.sendCorporateEnquiryNotification(record);
      console.log('Corporate email notification result:', emailResult);
    } catch (emailErr) {
      console.error('Corporate email notification failed:', emailErr);
      // Don't fail the request if email fails, just log it
    }
    
    reply.status(201).send({ 
      success: true,
      id: res.insertId, 
      message: 'Corporate enquiry created successfully',
      enquiry: { ...record, id: res.insertId }
    });
  });
};
