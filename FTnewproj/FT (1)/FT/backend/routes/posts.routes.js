const controller = require('../controllers/posts.controller');

module.exports = async function (fastify, opts) {
  // Get all posts
  fastify.get('/posts', controller.getAllPosts);
  
  // Get single post by slug
  fastify.get('/posts/:slug', controller.getPostBySlug);
};
