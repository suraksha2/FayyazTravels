#!/usr/bin/env node

const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootroot',
  database: process.env.DB_NAME || 'fayyaz_It_sql',
  port: process.env.DB_PORT || 3306
});

console.log('🔍 Verifying saved test data in database...');
console.log('');

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }

  // Query for test bookings
  const query = `
    SELECT 
      b.id,
      b.package_id,
      CONCAT(b.primary_fname, ' ', b.primary_lname) as customer_name,
      b.primary_email,
      b.booking_amount,
      CASE 
        WHEN b.booking_status = 0 THEN 'Pending'
        WHEN b.booking_status = 1 THEN 'Confirmed'
        WHEN b.booking_status = 2 THEN 'Cancelled'
        ELSE 'Unknown'
      END as status,
      b.payment_intent_id,
      b.payment_status,
      b.passenger_details IS NOT NULL as has_passengers,
      b.contact_details IS NOT NULL as has_contacts,
      b.insert_date
    FROM tbl_booking b
    WHERE b.primary_email LIKE '%test%' OR b.primary_fname LIKE '%Test%' OR b.primary_fname LIKE '%Database%'
    ORDER BY b.insert_date DESC
    LIMIT 10
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('❌ Query failed:', err.message);
      process.exit(1);
    }

    console.log('📊 Recent test bookings found in database:');
    console.log('');

    if (results.length === 0) {
      console.log('   No test bookings found');
    } else {
      console.log('| ID | Customer | Email | Amount | Status | Payment Intent | Passengers | Contacts |');
      console.log('|----|----------|-------|--------|--------|----------------|------------|----------|');
      
      results.forEach(booking => {
        const id = booking.id.toString().padEnd(3);
        const customer = booking.customer_name.substring(0, 15).padEnd(15);
        const email = booking.primary_email.substring(0, 20).padEnd(20);
        const amount = `SGD $${booking.booking_amount}`.padEnd(10);
        const status = booking.status.padEnd(9);
        const paymentIntent = booking.payment_intent_id ? booking.payment_intent_id.substring(0, 15) + '...' : 'None';
        const passengers = booking.has_passengers ? '✅' : '❌';
        const contacts = booking.has_contacts ? '✅' : '❌';
        
        console.log(`| ${id} | ${customer} | ${email} | ${amount} | ${status} | ${paymentIntent.padEnd(18)} | ${passengers.padEnd(10)} | ${contacts.padEnd(8)} |`);
      });

      console.log('');
      console.log(`✅ Found ${results.length} test booking(s) in database`);
      
      // Get detailed info for the most recent test booking
      if (results.length > 0) {
        const latestBooking = results[0];
        console.log('');
        console.log('🔍 Latest test booking details:');
        console.log(`   ID: ${latestBooking.id}`);
        console.log(`   Customer: ${latestBooking.customer_name}`);
        console.log(`   Email: ${latestBooking.primary_email}`);
        console.log(`   Amount: SGD $${latestBooking.booking_amount}`);
        console.log(`   Status: ${latestBooking.status}`);
        console.log(`   Payment Intent: ${latestBooking.payment_intent_id}`);
        console.log(`   Payment Status: ${latestBooking.payment_status || 'None'}`);
        console.log(`   Has Passengers: ${latestBooking.has_passengers ? 'Yes' : 'No'}`);
        console.log(`   Has Contacts: ${latestBooking.has_contacts ? 'Yes' : 'No'}`);
        console.log(`   Created: ${latestBooking.insert_date}`);

        // Get passenger details if available
        if (latestBooking.has_passengers) {
          connection.query('SELECT passenger_details FROM tbl_booking WHERE id = ?', [latestBooking.id], (err, passengerResults) => {
            if (!err && passengerResults.length > 0) {
              try {
                const passengers = JSON.parse(passengerResults[0].passenger_details);
                console.log('');
                console.log('👥 Passenger Details:');
                passengers.forEach((passenger, index) => {
                  console.log(`   ${index + 1}. ${passenger.title} ${passenger.firstName} ${passenger.lastName}`);
                  console.log(`      Type: ${passenger.type}, DOB: ${passenger.dateOfBirth}`);
                  console.log(`      Passport: ${passenger.passportNumber}, Nationality: ${passenger.nationality}`);
                });
              } catch (parseError) {
                console.log('   ⚠️ Could not parse passenger details JSON');
              }
            }
            connection.end();
          });
        } else {
          connection.end();
        }
      } else {
        connection.end();
      }
    }
  });
});
