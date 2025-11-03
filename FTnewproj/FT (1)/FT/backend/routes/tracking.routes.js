// routes/tracking.routes.js
const trackingController = require('../controllers/tracking.controller');

module.exports = async function (fastify) {
  // Email click tracking
  fastify.get('/track-email-click', trackingController.trackEmailClick);
  
  // Analytics endpoints
  fastify.get('/analytics/email-tracking', trackingController.getEmailAnalytics);
};
