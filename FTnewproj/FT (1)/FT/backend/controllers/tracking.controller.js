// controllers/tracking.controller.js
const db = require('../db');

// GET /track-email-click - Track email button clicks
exports.trackEmailClick = async (req, reply) => {
  try {
    const { id: trackingId, action, email, package: packageName } = req.query;
    
    if (!trackingId) {
      return reply.status(400).send({ success: false, message: 'Tracking ID required' });
    }
    
    // Store click data
    const insertQuery = `
      INSERT INTO email_clicks (tracking_id, action, ip_address, user_agent) 
      VALUES (?, ?, ?, ?)
    `;
    
    const values = [
      trackingId,
      action || 'unknown',
      req.ip || null,
      req.headers['user-agent'] || null
    ];
    
    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error('⚠️ Failed to store click tracking:', err.message);
      } else {
        console.log(`📊 Click tracked: ${action} for tracking ID: ${trackingId}`);
      }
    });
    
    // Redirect based on action
    let redirectUrl = 'https://fayyaztravels.com';
    
    switch (action) {
      case 'email':
        redirectUrl = `mailto:${email}?subject=Re: Your Travel Plan Request&body=Dear Customer,%0A%0AThank you for choosing Fayyaz Travels for your trip planning.%0A%0ABest regards,%0AFayyaz Travels Team`;
        break;
      case 'call':
        redirectUrl = `tel:${email}`; // This should be phone number, but using email as fallback
        break;
      case 'whatsapp':
        redirectUrl = `https://wa.me/6562352900?text=Hi! Thank you for your travel enquiry. We'd love to help you plan your perfect trip.`;
        break;
      case 'plan':
        redirectUrl = 'https://fayyaztravels.com/contact';
        break;
      default:
        redirectUrl = 'https://fayyaztravels.com';
    }
    
    // Return tracking pixel or redirect
    if (req.headers.accept && req.headers.accept.includes('image')) {
      // Return 1x1 transparent pixel for tracking
      const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      reply.type('image/gif').send(pixel);
    } else {
      // Redirect to appropriate action
      reply.redirect(302, redirectUrl);
    }
    
  } catch (err) {
    console.error('Email click tracking error:', err);
    reply.status(500).send({ 
      success: false, 
      message: 'Failed to track click' 
    });
  }
};

// GET /analytics/email-tracking - Get email tracking analytics
exports.getEmailAnalytics = async (req, reply) => {
  try {
    const { startDate, endDate, packageName } = req.query;
    
    // Get email tracking stats
    let whereClause = '1=1';
    const params = [];
    
    if (startDate) {
      whereClause += ' AND sent_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      whereClause += ' AND sent_at <= ?';
      params.push(endDate);
    }
    
    if (packageName) {
      whereClause += ' AND package_name LIKE ?';
      params.push(`%${packageName}%`);
    }
    
    // Get email stats
    const emailStatsQuery = `
      SELECT 
        COUNT(*) as total_emails_sent,
        COUNT(DISTINCT customer_email) as unique_customers,
        package_name,
        DATE(sent_at) as date
      FROM email_tracking 
      WHERE ${whereClause}
      GROUP BY package_name, DATE(sent_at)
      ORDER BY sent_at DESC
    `;
    
    db.query(emailStatsQuery, params, (emailErr, emailStats) => {
      if (emailErr) {
        console.error('Error fetching email stats:', emailErr.message);
        return reply.status(500).send({ success: false, message: 'Failed to fetch email stats' });
      }
      
      // Get click stats
      const clickStatsQuery = `
        SELECT 
          ec.action,
          COUNT(*) as click_count,
          et.package_name,
          DATE(ec.clicked_at) as date
        FROM email_clicks ec
        JOIN email_tracking et ON ec.tracking_id = et.tracking_id
        WHERE ${whereClause.replace('sent_at', 'et.sent_at')}
        GROUP BY ec.action, et.package_name, DATE(ec.clicked_at)
        ORDER BY ec.clicked_at DESC
      `;
      
      db.query(clickStatsQuery, params, (clickErr, clickStats) => {
        if (clickErr) {
          console.error('Error fetching click stats:', clickErr.message);
          return reply.status(500).send({ success: false, message: 'Failed to fetch click stats' });
        }
        
        // Calculate click-through rates
        const totalEmails = emailStats.reduce((sum, stat) => sum + stat.total_emails_sent, 0);
        const totalClicks = clickStats.reduce((sum, stat) => sum + stat.click_count, 0);
        const clickThroughRate = totalEmails > 0 ? ((totalClicks / totalEmails) * 100).toFixed(2) : 0;
        
        reply.send({
          success: true,
          data: {
            summary: {
              total_emails_sent: totalEmails,
              total_clicks: totalClicks,
              click_through_rate: `${clickThroughRate}%`,
              unique_customers: emailStats.reduce((sum, stat) => sum + stat.unique_customers, 0)
            },
            email_stats: emailStats,
            click_stats: clickStats,
            actions_breakdown: clickStats.reduce((acc, stat) => {
              acc[stat.action] = (acc[stat.action] || 0) + stat.click_count;
              return acc;
            }, {})
          }
        });
      });
    });
    
  } catch (err) {
    console.error('Analytics error:', err);
    reply.status(500).send({ 
      success: false, 
      message: 'Failed to fetch analytics' 
    });
  }
};
