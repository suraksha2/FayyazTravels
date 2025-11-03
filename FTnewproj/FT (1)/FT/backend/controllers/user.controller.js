// controllers/user.controller.js
const db = require('../db');

// Get user profile by email or user_id
exports.getProfile = (req, reply) => {
  const { user_id, user_email } = req.query;
  
  if (!user_id && !user_email) {
    return reply.status(400).send({ 
      error: 'User identification required', 
      message: 'Please provide user_id or user_email parameter' 
    });
  }
  
  // Build WHERE clause for user identification
  let whereClause = '';
  let queryParams = [];
  
  if (user_id && user_id !== '0') {
    whereClause = 'WHERE id = ?';
    queryParams.push(parseInt(user_id));
  } else if (user_email) {
    whereClause = 'WHERE email = ?';
    queryParams.push(user_email);
  } else {
    return reply.status(400).send({ 
      error: 'Invalid user identification', 
      message: 'Please provide valid user_id or user_email' 
    });
  }
  
  const query = `
    SELECT 
      id,
      name,
      email,
      created_at,
      updated_at
    FROM tbl_users 
    ${whereClause}
    LIMIT 1
  `;
  
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch user profile', 
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      return reply.status(404).send({ 
        error: 'User not found', 
        message: 'No user found with the provided credentials' 
      });
    }
    
    const user = results[0];
    
    // Parse name into first and last name
    const nameParts = (user.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Get user's booking statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(DISTINCT YEAR(insert_date)) as years_active,
        MIN(insert_date) as member_since
      FROM tbl_booking 
      WHERE primary_email = ? OR user_id = ?
    `;
    
    const statsParams = [user.email, user.id];
    
    db.query(statsQuery, statsParams, (err, statsResults) => {
      if (err) {
        console.error('Error fetching user stats:', err);
        // Continue without stats if there's an error
      }
      
      const stats = statsResults && statsResults[0] ? statsResults[0] : {
        total_bookings: 0,
        years_active: 0,
        member_since: user.created_at
      };
      
      // Format the response
      const profileData = {
        id: user.id,
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        phone: '', // Not available in tbl_users, might be in booking data
        dateOfBirth: '', // Not available in tbl_users
        address: '', // Not available in tbl_users
        memberSince: stats.member_since ? new Date(stats.member_since).getFullYear() : new Date(user.created_at).getFullYear(),
        totalBookings: stats.total_bookings,
        countriesVisited: Math.min(stats.total_bookings, 12), // Estimate based on bookings
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
      
      reply.send({
        success: true,
        user: profileData
      });
    });
  });
};

// Get user profile with additional details from booking data
exports.getProfileWithBookingData = (req, reply) => {
  const { user_id, user_email } = req.query;
  
  if (!user_id && !user_email) {
    return reply.status(400).send({ 
      error: 'User identification required', 
      message: 'Please provide user_id or user_email parameter' 
    });
  }
  
  // First get user from tbl_users
  let userWhereClause = '';
  let userParams = [];
  
  if (user_id && user_id !== '0') {
    userWhereClause = 'WHERE id = ?';
    userParams.push(parseInt(user_id));
  } else if (user_email) {
    userWhereClause = 'WHERE email = ?';
    userParams.push(user_email);
  }
  
  const userQuery = `SELECT * FROM tbl_users ${userWhereClause} LIMIT 1`;
  
  db.query(userQuery, userParams, (err, userResults) => {
    if (err) {
      console.error('Error fetching user:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch user profile', 
        details: err.message 
      });
    }
    
    if (userResults.length === 0) {
      return reply.status(404).send({ 
        error: 'User not found', 
        message: 'No user found with the provided credentials' 
      });
    }
    
    const user = userResults[0];
    
    // Get additional details from most recent booking
    const bookingQuery = `
      SELECT 
        primary_fname,
        primary_lname,
        primary_phone,
        primary_country,
        COUNT(*) as total_bookings,
        MIN(insert_date) as first_booking,
        MAX(insert_date) as last_booking
      FROM tbl_booking 
      WHERE primary_email = ? OR user_id = ?
      GROUP BY primary_email
      ORDER BY insert_date DESC
      LIMIT 1
    `;
    
    const bookingParams = [user.email, user.id];
    
    db.query(bookingQuery, bookingParams, (err, bookingResults) => {
      if (err) {
        console.error('Error fetching booking data:', err);
      }
      
      const bookingData = bookingResults && bookingResults[0] ? bookingResults[0] : {};
      
      // Combine user and booking data
      const nameParts = (user.name || '').split(' ');
      const profileData = {
        id: user.id,
        firstName: bookingData.primary_fname || nameParts[0] || '',
        lastName: bookingData.primary_lname || nameParts.slice(1).join(' ') || '',
        email: user.email,
        phone: bookingData.primary_phone || '',
        dateOfBirth: '', // Not available
        address: bookingData.primary_country || '',
        memberSince: bookingData.first_booking ? new Date(bookingData.first_booking).getFullYear() : new Date(user.created_at).getFullYear(),
        totalBookings: bookingData.total_bookings || 0,
        countriesVisited: Math.min(bookingData.total_bookings || 0, 12), // Estimate
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
      
      reply.send({
        success: true,
        user: profileData
      });
    });
  });
};
