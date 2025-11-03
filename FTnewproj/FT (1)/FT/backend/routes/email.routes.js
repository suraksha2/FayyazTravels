// routes/email.routes.js
const controller = require('../controllers/email.controller');

module.exports = async function (fastify) {
  // General email sending endpoint (compatible with your original script)
  fastify.post('/sendMail', controller.sendMail);
  
  // Specific notification endpoints
  fastify.post('/sendEnquiryNotification', controller.sendEnquiryNotification);
  fastify.post('/sendCorporateEnquiryNotification', controller.sendCorporateEnquiryNotification);
  fastify.post('/sendBookingConfirmation', controller.sendBookingConfirmation);
};
