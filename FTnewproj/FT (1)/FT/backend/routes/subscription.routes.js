// routes/subscription.routes.js
const controller = require('../controllers/subscription.controller');

module.exports = async function (fastify) {
  fastify.post('/subscriptions', controller.create);
};
