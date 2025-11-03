const controller = require('../controllers/categories.controller');
module.exports = async function (fastify, opts) {
  fastify.get('/categories', controller.getAll);
  fastify.get('/categories/:id', controller.getById);
  fastify.post('/categories', controller.create);
  fastify.put('/categories/:id', controller.update);
  fastify.delete('/categories/:id', controller.remove);
};