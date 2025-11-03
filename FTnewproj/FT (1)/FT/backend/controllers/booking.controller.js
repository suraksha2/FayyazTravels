// controllers/booking.controller.js
const db = require('../db');

exports.getAll = (req, reply) => {
  // Get user identification from query params or headers
  const { user_id, user_email } = req.query;
  
  if (!user_id && !user_email) {
    return reply.status(400).send({ 
      error: 'User identification required', 
      message: 'Please provide user_id or user_email parameter' 
    });
  }
  
  // Build WHERE clause for user filtering
  let whereClause = '';
  let queryParams = [];
  
  if (user_id && user_id !== '0') {
    whereClause = 'WHERE b.user_id = ?';
    queryParams.push(parseInt(user_id));
  } else if (user_email) {
    whereClause = 'WHERE b.primary_email = ?';
    queryParams.push(user_email);
  } else {
    // For guest users (user_id = 0), we need email to identify them
    return reply.status(400).send({ 
      error: 'Email required for guest users', 
      message: 'Guest users must provide email for identification' 
    });
  }
  
  // Enhanced query to fetch booking details with actual package names for specific user
  const query = `
    SELECT 
      b.id,
      b.id as order_number,
      COALESCE(p.p_name, CONCAT('Package ID: ', b.package_id)) as package_name,
      CONCAT(b.primary_fname, ' ', b.primary_lname) as customer_name,
      b.primary_email as customer_email,
      b.primary_phone as customer_phone,
      b.arrival_date as date_ordered,
      b.booking_amount as price,
      CASE 
        WHEN b.booking_status = 0 THEN 'Pending'
        WHEN b.booking_status = 1 THEN 'Confirmed'
        WHEN b.booking_status = 2 THEN 'Cancelled'
        ELSE 'Unknown'
      END as status,
      b.totaladults as pax,
      b.special_requests,
      b.insert_date as created_at,
      b.edit_date as updated_at
    FROM tbl_booking b
    LEFT JOIN tbl_packages p ON b.package_id = p.id
    ${whereClause}
    ORDER BY b.insert_date DESC
  `;
  
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching booking details:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch booking details', 
        details: err.message 
      });
    }
    
    // Format the results for better frontend consumption
    const formattedResults = results.map(booking => ({
      ...booking,
      order_number: `FT${String(booking.id).padStart(6, '0')}`, // Format as FT000001, FT000002, etc.
      price: parseFloat(booking.price || 0).toFixed(2),
      date_ordered: booking.date_ordered ? new Date(booking.date_ordered).toISOString().split('T')[0] : null
    }));
    
    reply.send({
      success: true,
      count: formattedResults.length,
      bookings: formattedResults
    });
  });
};

// Enhanced method for fetching detailed booking information with filtering
exports.getAllDetails = (req, reply) => {
  const { status, limit = 50, offset = 0, search, user_id, user_email } = req.query;
  
  // User authentication check
  if (!user_id && !user_email) {
    return reply.status(400).send({ 
      error: 'User identification required', 
      message: 'Please provide user_id or user_email parameter' 
    });
  }
  
  let whereClause = 'WHERE 1=1';
  const queryParams = [];
  
  // Add user filtering - MOST IMPORTANT FILTER
  if (user_id && user_id !== '0') {
    whereClause += ' AND b.user_id = ?';
    queryParams.push(parseInt(user_id));
  } else if (user_email) {
    whereClause += ' AND b.primary_email = ?';
    queryParams.push(user_email);
  } else {
    // For guest users (user_id = 0), we need email to identify them
    return reply.status(400).send({ 
      error: 'Email required for guest users', 
      message: 'Guest users must provide email for identification' 
    });
  }
  
  // Add status filter if provided
  if (status && status !== 'all') {
    whereClause += ' AND b.booking_status = ?';
    const statusMap = { 'pending': 0, 'confirmed': 1, 'cancelled': 2 };
    queryParams.push(statusMap[status.toLowerCase()] || 0);
  }
  
  // Add search filter if provided
  if (search) {
    whereClause += ' AND (CONCAT(b.primary_fname, " ", b.primary_lname) LIKE ? OR b.primary_email LIKE ?)';
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm);
  }
  
  const query = `
    SELECT 
      b.id,
      CONCAT('FT', LPAD(b.id, 6, '0')) as order_number,
      COALESCE(p.p_name, CONCAT('Package ID: ', b.package_id)) as package_name,
      CONCAT(b.primary_fname, ' ', b.primary_lname) as customer_name,
      b.primary_email as customer_email,
      b.primary_phone as customer_phone,
      DATE_FORMAT(b.arrival_date, '%Y-%m-%d') as date_ordered,
      COALESCE(b.booking_amount, 0) as price,
      CASE 
        WHEN b.booking_status = 0 THEN 'Pending'
        WHEN b.booking_status = 1 THEN 'Confirmed'
        WHEN b.booking_status = 2 THEN 'Cancelled'
        ELSE 'Unknown'
      END as status,
      b.totaladults as pax,
      b.special_requests,
      b.insert_date as created_at,
      b.edit_date as updated_at,
      0 as original_price,
      COALESCE(p.day_night, '7 days') as duration
    FROM tbl_booking b
    LEFT JOIN tbl_packages p ON b.package_id = p.id
    ${whereClause}
    ORDER BY b.insert_date DESC
    LIMIT ? OFFSET ?
  `;
  
  queryParams.push(parseInt(limit), parseInt(offset));
  
  // Also get total count for pagination
  const countQuery = `
    SELECT COUNT(*) as total
    FROM tbl_booking b
    LEFT JOIN tbl_packages p ON b.package_id = p.id
    ${whereClause}
  `;
  
  // Execute count query first
  db.query(countQuery, queryParams.slice(0, -2), (err, countResult) => {
    if (err) {
      console.error('Error fetching booking count:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch booking count', 
        details: err.message 
      });
    }
    
    const totalCount = countResult[0].total;
    
    // Execute main query
    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Error fetching detailed booking information:', err);
        return reply.status(500).send({ 
          error: 'Failed to fetch booking details', 
          details: err.message 
        });
      }
      
      // Format the results
      const formattedResults = results.map(booking => ({
        ...booking,
        price: parseFloat(booking.price || 0).toFixed(2),
        original_price: parseFloat(booking.original_price || 0).toFixed(2)
      }));
      
      reply.send({
        success: true,
        count: formattedResults.length,
        total: totalCount,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
        bookings: formattedResults
      });
    });
  });
};

exports.getById = (req, reply) => {
  db.query('SELECT * FROM tbl_booking WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return reply.status(500).send(err);
    if (!results.length) return reply.status(404).send({ message: 'Not found' });
    reply.send(results[0]);
  });
};

exports.create = (req, reply) => {
  const {
    package_id,
    customer_name,
    customer_email,
    customer_phone,
    travel_date,
    pax,
    total_amount,
    special_requests,
    passenger_details,
    contact_details
  } = req.body;

  // Validation
  if (!package_id || !customer_name || !customer_email || !travel_date || !pax) {
    return reply.status(400).send({ 
      error: 'Missing required fields: package_id, customer_name, customer_email, travel_date, pax' 
    });
  }

  // Split customer_name into first and last name
  const nameParts = customer_name.trim().split(' ');
  const primary_fname = nameParts[0] || '';
  const primary_lname = nameParts.slice(1).join(' ') || '';

  // Parse passenger and contact details if provided
  let parsedPassengerDetails = [];
  let parsedContactDetails = null;
  
  try {
    if (passenger_details && typeof passenger_details === 'string') {
      parsedPassengerDetails = JSON.parse(passenger_details);
    }
    if (contact_details && typeof contact_details === 'string') {
      parsedContactDetails = JSON.parse(contact_details);
    }
  } catch (error) {
    console.error('Error parsing passenger/contact details:', error);
  }
  
  // Count passengers by type
  const adults = parsedPassengerDetails.filter(p => p.type === 'adult').length || Math.floor(parseInt(pax) * 0.7) || 1;
  const children = parsedPassengerDetails.filter(p => p.type === 'child').length || 0;
  const infants = parsedPassengerDetails.filter(p => p.type === 'infant').length || 0;

  // Map frontend fields to database schema
  const bookingData = {
    user_id: 0, // Default for guest bookings
    package_id: parseInt(package_id),
    booking_amount: parseFloat(total_amount) || 0,
    coupon_code: null,
    arrival_date: travel_date,
    hotel_type: 3, // Default hotel type
    return_date: travel_date, // Same as arrival for now, can be enhanced later
    totaladults: adults,
    totalchildren: children,
    totalinfants: infants,
    flight_booking: 1,
    flight_ticket: '',
    notes: '',
    special_requests: special_requests || '',
    primary_title: parsedContactDetails?.primaryContactName ? 'Mr' : '',
    primary_fname,
    primary_lname,
    primary_email: customer_email,
    primary_ccode: '+65', // Default country code
    primary_phone: customer_phone || '',
    primary_country: 'SG', // Default country
    booking_status: 0,
    save_details: 0,
    payment_id: 0,
    passenger_details: passenger_details || null, // Store as JSON string
    contact_details: contact_details || null, // Store as JSON string
    insert_date: new Date(),
    edit_date: new Date(),
    status: 1
  };

  db.query('INSERT INTO tbl_booking SET ?', bookingData, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Failed to create booking', details: err.message });
    }
    
    reply.status(201).send({ 
      id: results.insertId, 
      message: 'Booking created successfully',
      booking: { ...bookingData, id: results.insertId }
    });
  });
};

exports.update = (req, reply) => {
  db.query('UPDATE tbl_booking SET ? WHERE id = ?', [req.body, req.params.id], (err) => {
    if (err) return reply.status(500).send(err);
    reply.send({ message: 'Updated' });
  });
};

exports.remove = (req, reply) => {
  db.query('DELETE FROM tbl_booking WHERE id = ?', [req.params.id], (err) => {
    if (err) return reply.status(500).send(err);
    reply.send({ message: 'Deleted' });
  });
};
