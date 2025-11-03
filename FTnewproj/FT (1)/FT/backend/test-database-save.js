#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🗄️ FT Travel Booking System - Database Save Verification');
console.log('='.repeat(60));
console.log('');
console.log('This test will:');
console.log('✅ Create a complete booking with passenger details');
console.log('✅ Save all data to the database');
console.log('✅ Verify data integrity and retrieval');
console.log('✅ Test payment status updates');
console.log('✅ Validate JSON data storage');
console.log('');
console.log('🔄 Starting database verification test...');
console.log('');

// Set environment variables
process.env.NODE_ENV = 'test';

// Run the specific database test
const command = 'npx mocha test/database-save-verification.test.js --timeout 30000 --reporter spec';

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Test execution failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ER_ACCESS_DENIED')) {
      console.log('');
      console.log('💡 Database Connection Issues:');
      console.log('   1. Make sure your MySQL/MariaDB server is running');
      console.log('   2. Check your database credentials in .env file:');
      console.log('      DB_HOST=localhost');
      console.log('      DB_USER=your_username');
      console.log('      DB_PASSWORD=your_password');
      console.log('      DB_NAME=your_database_name');
      console.log('   3. Ensure the database exists and has the tbl_booking table');
      console.log('   4. Run the database_updates.sql script if not done already');
    }
    
    process.exit(1);
  }

  if (stderr) {
    console.error('⚠️ Test warnings:', stderr);
  }

  console.log(stdout);
  
  if (stdout.includes('DATABASE INTEGRATION: FULLY FUNCTIONAL')) {
    console.log('');
    console.log('🎉 SUCCESS! Database save verification completed successfully!');
    console.log('');
    console.log('📊 What was verified:');
    console.log('   ✅ Complete booking data saved to database');
    console.log('   ✅ Passenger details stored as JSON');
    console.log('   ✅ Contact details stored as JSON');
    console.log('   ✅ Payment intent linking works');
    console.log('   ✅ Payment status updates work');
    console.log('   ✅ User-specific data retrieval works');
    console.log('');
    console.log('🚀 Your database integration is working perfectly!');
  } else {
    console.log('');
    console.log('⚠️ Some tests may have failed. Please review the output above.');
  }
});
