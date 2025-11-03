const controller = require('../controllers/bookingRooms.controller');
module.exports = async function (fastify, opts) {
  fastify.get('/booking-rooms', controller.getAll);
  fastify.get('/booking-rooms/:id', controller.getById);
  fastify.post('/booking-rooms', controller.create);
  fastify.put('/booking-rooms/:id', controller.update);
  fastify.delete('/booking-rooms/:id', controller.remove);
};