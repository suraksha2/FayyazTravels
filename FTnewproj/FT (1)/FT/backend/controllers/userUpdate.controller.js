// controllers/userUpdate.controller.js
const db = require('../db');

// Get updated user profile (prioritizes user table data over booking data)
exports.getUpdatedProfile = (req, reply) => {
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
  }
  
  // First get user from tbl_users
  const userQuery = `SELECT * FROM tbl_users ${whereClause} LIMIT 1`;
  
  db.query(userQuery, queryParams, (err, userResults) => {
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
    
    // Get booking statistics only
    const statsQuery = `
      SELECT 
        primary_phone,
        primary_country,
        COUNT(*) as total_bookings,
        MIN(insert_date) as first_booking
      FROM tbl_booking 
      WHERE primary_email = ? OR user_id = ?
      GROUP BY primary_email
      ORDER BY insert_date DESC
      LIMIT 1
    `;
    
    const statsParams = [user.email, user.id];
    
    db.query(statsQuery, statsParams, (err, statsResults) => {
      if (err) {
        console.error('Error fetching booking stats:', err);
      }
      
      const stats = statsResults && statsResults[0] ? statsResults[0] : {};
      
      // Prioritize user table data over booking data
      const nameParts = (user.name || '').split(' ');
      const profileData = {
        id: user.id,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email,
        phone: stats.primary_phone || '',
        dateOfBirth: '', // Not available
        address: stats.primary_country || '',
        memberSince: stats.first_booking ? new Date(stats.first_booking).getFullYear() : new Date(user.created_at).getFullYear(),
        totalBookings: stats.total_bookings || 0,
        countriesVisited: Math.min(stats.total_bookings || 0, 12), // Estimate
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

// Update user profile
exports.updateProfile = (req, reply) => {
  const { user_id, user_email } = req.query;
  const { firstName, lastName, phone, dateOfBirth, address } = req.body;
  
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
  }
  
  // First, check if user exists
  const checkUserQuery = `SELECT id, name, email FROM tbl_users ${whereClause} LIMIT 1`;
  
  db.query(checkUserQuery, queryParams, (err, userResults) => {
    if (err) {
      console.error('Error checking user:', err);
      return reply.status(500).send({ 
        error: 'Failed to update user profile', 
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
    
    // Update user name in tbl_users if firstName and lastName are provided
    if (firstName || lastName) {
      const fullName = `${firstName || ''} ${lastName || ''}`.trim();
      const updateUserQuery = `UPDATE tbl_users SET name = ?, updated_at = NOW() WHERE id = ?`;
      
      db.query(updateUserQuery, [fullName, user.id], (err) => {
        if (err) {
          console.error('Error updating user name:', err);
          return reply.status(500).send({ 
            error: 'Failed to update user name', 
            details: err.message 
          });
        }
        
        // Return success response after successful update
        reply.send({
          success: true,
          message: 'Profile updated successfully',
          user: {
            id: user.id,
            firstName: firstName || '',
            lastName: lastName || '',
            email: user.email,
            phone: phone || '',
            dateOfBirth: dateOfBirth || '',
            address: address || ''
          }
        });
      });
    } else {
      // If no name update needed, just return success
      reply.send({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          firstName: firstName || '',
          lastName: lastName || '',
          email: user.email,
          phone: phone || '',
          dateOfBirth: dateOfBirth || '',
          address: address || ''
        }
      });
    }
  });
};
