const controller = require('../controllers/cities.controller');
module.exports = async function (fastify, opts) {
  fastify.get('/destinations', controller.getAll);
  fastify.get('/destinations/countries', controller.getCountries);
  fastify.get('/destinations/:id', controller.getById);
  fastify.post('/destinations', controller.create);
  fastify.put('/destinations/:id', controller.update);
  fastify.delete('/destinations/:id', controller.remove);
};