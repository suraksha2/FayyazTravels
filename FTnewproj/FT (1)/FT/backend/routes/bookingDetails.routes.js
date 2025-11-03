const controller = require('../controllers/bookingDetails.controller');
module.exports = async function (fastify, opts) {
  fastify.get('/booking-details', controller.getAll);
  fastify.get('/booking-details/:id', controller.getById);
  fastify.post('/booking-details', controller.create);
  fastify.put('/booking-details/:id', controller.update);
  fastify.delete('/booking-details/:id', controller.remove);
};