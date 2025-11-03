// routes/user.routes.js
const controller = require('../controllers/user.controller');
const updateController = require('../controllers/userUpdate.controller');

module.exports = async function (fastify, opts) {
  // Get user profile
  fastify.get('/profile', controller.getProfile);
  
  // Get user profile with booking data
  fastify.get('/profile/detailed', controller.getProfileWithBookingData);
  
  // Get updated user profile (prioritizes user data)
  fastify.get('/profile/updated', updateController.getUpdatedProfile);
  
  // Update user profile
  fastify.put('/profile', updateController.updateProfile);
};
