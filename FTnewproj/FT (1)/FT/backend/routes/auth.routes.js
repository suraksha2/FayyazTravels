// routes/auth.routes.js
const controller = require('../controllers/auth.controller');

module.exports = async function (fastify) {
  fastify.post('/auth/signup', controller.signup);
  fastify.post('/auth/login', controller.login);
};
