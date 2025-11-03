// routes/deals.routes.js
const dealsController = require('../controllers/deals.controller');

async function routes(fastify, options) {
  // Get all deals
  fastify.get('/deals', dealsController.getAll);
  
  // Get featured deals only
  fastify.get('/deals/featured', dealsController.getFeatured);
  
  // Get specific deal by ID
  fastify.get('/deals/:id', dealsController.getById);
}

module.exports = routes;
