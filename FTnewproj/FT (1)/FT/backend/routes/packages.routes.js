// routes/packages.routes.js
const controller = require('../controllers/packages.controller');

module.exports = async function (fastify, opts) {
  // Define specific routes before parameterized routes
  fastify.get('/packages/search-suggestions', controller.getSearchSuggestions);
  fastify.get('/packages/grouped-destinations', controller.getGroupedDestinations);
  fastify.get('/packages/hot-deals', controller.getHotDeals);
  fastify.get('/packages/south-east-asia', controller.getSouthEastAsiaPackages);
  fastify.get('/packages/south-east-europe', controller.getSouthEastEuropePackages);
  fastify.get('/packages/scandinavia', controller.getScandinaviaPackages);
  fastify.get('/packages/oceania', controller.getOceaniaPackages);
  fastify.get('/packages/europe', controller.getEuropePackages);
  fastify.get('/packages/middle-east', controller.getMiddleEastPackages);
  fastify.get('/packages/africa', controller.getAfricaPackages);
  fastify.get('/packages/caribbean', controller.getCaribbeanPackages);
  fastify.get('/packages/the-caribbean', controller.getCaribbeanPackages); // Alias for frontend
  fastify.get('/packages/south-america', controller.getSouthAmericaPackages);
  fastify.get('/packages/group-tours', controller.getGroupTours);
  fastify.get('/packages/multi-city-packages', controller.getMultiCityPackages);
  fastify.get('/packages/north-america', controller.getNorthAmericaPackages);
  fastify.get('/packages/asia', controller.getAsiaPackages);
  fastify.get('/packages/categories', controller.getCategories);
  fastify.get('/packages/destinations', controller.getDestinations);
  fastify.get('/packages/multi-city', controller.getMultiCityDestinations);
  fastify.get('/packages/category/:category', controller.getByCategory);
  fastify.get('/packages/booking/:id', controller.getForBooking);
  fastify.get('/packages/slug/:slug', controller.getBySlug);
  fastify.get('/packages/:id', controller.getById);
  fastify.get('/packages', controller.getAll);
  fastify.post('/packages', controller.create);
};
