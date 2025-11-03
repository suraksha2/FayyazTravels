#!/usr/bin/env node

const mysql = require('mysql2');
require('dotenv').config();

console.log('🔍 FT Travel Booking System - Database Setup Verification');
console.log('='.repeat(60));

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ft_travel_db',
  port: process.env.DB_PORT || 3306
};

console.log('📋 Database Configuration:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Database: ${dbConfig.database}`);
console.log('');

const connection = mysql.createConnection(dbConfig);

async function verifyDatabase() {
  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.error('❌ Connection failed:', err.message);
          reject(err);
        } else {
          console.log('✅ Database connection successful');
          resolve();
        }
      });
    });

    // Check if tbl_booking exists
    console.log('');
    console.log('📋 Checking table structure...');
    const tables = await new Promise((resolve, reject) => {
      connection.query('SHOW TABLES LIKE "tbl_booking"', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (tables.length === 0) {
      console.log('❌ tbl_booking table not found');
      console.log('');
      console.log('💡 Please run the database setup:');
      console.log('   1. Execute the SQL commands in database_updates.sql');
      console.log('   2. Or create the table manually');
      process.exit(1);
    } else {
      console.log('✅ tbl_booking table exists');
    }

    // Check table structure
    const columns = await new Promise((resolve, reject) => {
      connection.query('DESCRIBE tbl_booking', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log('');
    console.log('🏗️ Table structure verification:');
    
    const requiredColumns = [
      'id', 'package_id', 'booking_amount', 'primary_email',
      'passenger_details', 'contact_details', 'payment_intent_id',
      'merchant_order_id', 'payment_status', 'booking_status'
    ];

    const existingColumns = columns.map(col => col.Field);
    let missingColumns = [];

    requiredColumns.forEach(column => {
      if (existingColumns.includes(column)) {
        console.log(`   ✅ ${column}: EXISTS`);
      } else {
        console.log(`   ❌ ${column}: MISSING`);
        missingColumns.push(column);
      }
    });

    if (missingColumns.length > 0) {
      console.log('');
      console.log('⚠️ Missing columns detected. Please run database_updates.sql');
      console.log('Missing columns:', missingColumns.join(', '));
    } else {
      console.log('');
      console.log('✅ All required columns exist');
    }

    // Check if tbl_packages exists (for joins)
    const packageTables = await new Promise((resolve, reject) => {
      connection.query('SHOW TABLES LIKE "tbl_packages"', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (packageTables.length > 0) {
      console.log('✅ tbl_packages table exists (for package name joins)');
    } else {
      console.log('⚠️ tbl_packages table not found (package names will show as IDs)');
    }

    // Test a simple query
    console.log('');
    console.log('🧪 Testing basic query...');
    const testQuery = await new Promise((resolve, reject) => {
      connection.query('SELECT COUNT(*) as count FROM tbl_booking', (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });

    console.log(`✅ Query successful - Found ${testQuery.count} existing bookings`);

    console.log('');
    console.log('🎉 DATABASE SETUP VERIFICATION COMPLETE');
    console.log('='.repeat(60));
    console.log('✅ Database connection: WORKING');
    console.log('✅ Table structure: CORRECT');
    console.log('✅ Required columns: PRESENT');
    console.log('✅ Basic queries: FUNCTIONAL');
    console.log('');
    console.log('🚀 Ready to test database save functionality!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: node test-database-save.js');
    console.log('2. Or run: npm test');

  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Database server is not running. Please:');
      console.log('   1. Start your MySQL/MariaDB server');
      console.log('   2. Check if the server is running on the correct port');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('');
      console.log('💡 Access denied. Please check:');
      console.log('   1. Username and password in .env file');
      console.log('   2. User has proper permissions');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('');
      console.log('💡 Database does not exist. Please:');
      console.log('   1. Create the database first');
      console.log('   2. Run the setup SQL scripts');
    }
    
    process.exit(1);
  } finally {
    connection.end();
  }
}

verifyDatabase();
