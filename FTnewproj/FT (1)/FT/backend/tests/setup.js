// Jest setup file
// This runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'rootroot';
process.env.DB_NAME = process.env.DB_NAME || 'fayyaz_It_sql';
process.env.AIRWALLEX_API_KEY = 'test_api_key';
process.env.AIRWALLEX_ENV = 'demo';

// Increase timeout for database operations
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  generateMockBookingData: () => ({
    package_id: 59,
    customer_name: 'Test User',
    customer_email: 'test@example.com',
    customer_phone: '1234567890',
    travel_date: '2025-12-25',
    adults: 2,
    children: 1,
    infants: 0,
    total_amount: 1500,
    special_requests: 'Test special request',
    passenger_details: JSON.stringify([
      {
        id: 'adult-1',
        type: 'adult',
        title: 'Mr',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        nationality: 'Singapore',
        passportNumber: 'A1234567',
        passportExpiry: '2030-01-01',
        gender: 'Male'
      }
    ]),
    contact_details: JSON.stringify({
      primaryContactName: 'Test User',
      primaryContactEmail: 'test@example.com',
      primaryContactPhone: '1234567890',
      emergencyContactName: 'Emergency Contact',
      emergencyContactPhone: '0987654321',
      emergencyContactRelation: 'Spouse',
      address: '123 Test Street',
      city: 'Singapore',
      country: 'Singapore',
      postalCode: '123456'
    })
  })
};
