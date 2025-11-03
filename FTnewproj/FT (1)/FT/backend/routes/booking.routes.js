// routes/booking.routes.js
const controller = require('../controllers/booking.controller');

module.exports = async function (fastify, opts) {
  // Define specific routes before parameterized routes
  fastify.get('/bookings/details', controller.getAllDetails);
  fastify.get('/bookings', controller.getAll);
  fastify.get('/bookings/:id', controller.getById);
  fastify.post('/bookings', controller.create);
  fastify.put('/bookings/:id', controller.update);
  fastify.delete('/bookings/:id', controller.remove);
};
