// routes/admin.routes.js
const enquiryController = require('../controllers/enquiryDashboard.controller');

module.exports = async function (fastify) {
  // Admin enquiry management routes
  fastify.get('/admin/enquiries', enquiryController.getEnquiries);
  fastify.get('/admin/enquiries/stats', enquiryController.getEnquiryStats);
  fastify.put('/admin/enquiries/:id/status', enquiryController.updateEnquiryStatus);
};
