// controllers/enquiryDashboard.controller.js
const db = require('../db');

// GET /admin/enquiries - Get all enquiries with analytics
exports.getEnquiries = async (req, reply) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR package_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Get enquiries with pagination
    const enquiriesQuery = `
      SELECT 
        id,
        name,
        email,
        phone,
        package_name,
        destination,
        travel_dates,
        pax,
        message,
        status,
        created_at,
        updated_at
      FROM enquiries 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `SELECT COUNT(*) as total FROM enquiries ${whereClause}`;

    const [enquiries] = await db.execute(enquiriesQuery, [...params, parseInt(limit), offset]);
    const [countResult] = await db.execute(countQuery, params);
    const total = countResult[0].total;

    // Get analytics data
    const analyticsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        destination,
        package_name
      FROM enquiries 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at), destination, package_name
      ORDER BY date DESC
    `;

    const [analytics] = await db.execute(analyticsQuery);

    reply.send({
      success: true,
      data: {
        enquiries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        analytics
      }
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch enquiries'
    });
  }
};

// PUT /admin/enquiries/:id/status - Update enquiry status
exports.updateEnquiryStatus = async (req, reply) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['new', 'contacted', 'quoted', 'booked', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid status'
      });
    }

    const updateQuery = `
      UPDATE enquiries 
      SET status = ?, admin_notes = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await db.execute(updateQuery, [status, notes || null, id]);

    reply.send({
      success: true,
      message: 'Enquiry status updated successfully'
    });
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to update enquiry status'
    });
  }
};

// GET /admin/enquiries/stats - Get enquiry statistics
exports.getEnquiryStats = async (req, reply) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_enquiries,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_enquiries,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_enquiries,
        COUNT(CASE WHEN status = 'quoted' THEN 1 END) as quoted_enquiries,
        COUNT(CASE WHEN status = 'booked' THEN 1 END) as booked_enquiries,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as this_week,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as this_month
      FROM enquiries
    `;

    const topDestinationsQuery = `
      SELECT 
        destination,
        COUNT(*) as count
      FROM enquiries 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY destination
      ORDER BY count DESC
      LIMIT 5
    `;

    const [stats] = await db.execute(statsQuery);
    const [topDestinations] = await db.execute(topDestinationsQuery);

    reply.send({
      success: true,
      data: {
        stats: stats[0],
        topDestinations
      }
    });
  } catch (error) {
    console.error('Error fetching enquiry stats:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch enquiry statistics'
    });
  }
};
