// routes/enquiry.routes.js
const controller = require('../controllers/enquiry.controller');

module.exports = async function (fastify) {
  fastify.post('/enquiries', controller.create);
};
