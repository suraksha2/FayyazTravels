// routes/corporateEnquiry.routes.js
const controller = require('../controllers/corporateEnquiry.controller');

module.exports = async function (fastify) {
  fastify.post('/corporate-enquiries', controller.create);
};
