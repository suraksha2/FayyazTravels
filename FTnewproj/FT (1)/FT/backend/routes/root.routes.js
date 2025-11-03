// routes/root.routes.js
/**
 * Root routes for the API
 * Provides basic information and health check endpoints
 */

module.exports = async function (fastify, opts) {
  // Root endpoint - Welcome message and API info
  fastify.get('/', async (request, reply) => {
    return {
      status: 'success',
      message: 'Welcome to the FT API',
      version: '1.0.0',
      endpoints: {
        bookings: '/bookings',
        bookingDetails: '/booking-details',
        bookingRooms: '/booking-rooms',
        categories: '/categories',
        cities: '/cities',
        packages: '/packages'
      }
    };
  });

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  });

  // Database health check endpoint
  fastify.get('/health/db', async (request, reply) => {
    const db = require('../db');
    
    return new Promise((resolve, reject) => {
      db.query('SELECT 1 as test', (err, results) => {
        if (err) {
          resolve({
            status: 'error',
            database: 'disconnected',
            error: err.message,
            timestamp: new Date().toISOString()
          });
        } else {
          resolve({
            status: 'healthy',
            database: 'connected',
            database_name: process.env.DB_NAME,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
  });

};
