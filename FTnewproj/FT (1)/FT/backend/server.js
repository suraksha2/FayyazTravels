require('dotenv').config();
const fastify = require('fastify')({ logger: true });

// Import database connection
const db = require('./db');
fastify.register(require('@fastify/cors'), { 
  // Allow all origins for development
  origin: true
});

// Make database connection available to all routes
fastify.decorate('db', db);

// Register root routes first
fastify.register(require('./routes/root.routes'));

// Register resource routes
fastify.register(require('./routes/booking.routes'));
fastify.register(require('./routes/bookingRooms.routes'));
fastify.register(require('./routes/categories.routes'));
fastify.register(require('./routes/cities.routes'));
fastify.register(require('./routes/packages.routes'));
fastify.register(require('./routes/destinations.routes'));
fastify.register(require('./routes/deals.routes'));
fastify.register(require('./routes/auth.routes'));
fastify.register(require('./routes/enquiry.routes'));
fastify.register(require('./routes/corporateEnquiry.routes'));
fastify.register(require('./routes/email.routes'));
fastify.register(require('./routes/admin.routes'));
fastify.register(require('./routes/tracking.routes'));
fastify.register(require('./routes/subscription.routes'));
fastify.register(require('./routes/user.routes'));
fastify.register(require('./routes/posts.routes'));

// Register payment routes
fastify.register(require('./routes/payment.routes'));

fastify.listen({ port: process.env.PORT || 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`🚀 Server listening at ${address}`);
});
