// Test setup and configuration
require('dotenv').config({ path: '.env.test' });

const chai = require('chai');
const chaiHttp = require('chai-http');

// Configure chai
chai.use(chaiHttp);
chai.should();

// Global test configuration
global.expect = chai.expect;
global.assert = chai.assert;

// Test database configuration
process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.DB_NAME || 'ft_test_db';

// Airwallex test configuration
process.env.AIRWALLEX_ENV = 'demo';
process.env.AIRWALLEX_API_KEY = process.env.AIRWALLEX_API_KEY || '8d9c682b097318be09d63724c908d02d490ce74eba9970657a6ed403b89140d99315ffdbc7dac9b29b442c3357c8b48e';
process.env.AIRWALLEX_CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID || 'x2uUrKZcR8OXL3gQOICUKw';

console.log('Test environment configured');
console.log('Database:', process.env.DB_NAME);
console.log('Airwallex Environment:', process.env.AIRWALLEX_ENV);
