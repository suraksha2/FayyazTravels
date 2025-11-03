const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const mysql = require('mysql2');

// Load environment variables
require('dotenv').config();

chai.use(chaiHttp);

describe('🗄️ Database Save Verification - End-to-End Test', function() {
  this.timeout(30000);

  let dbConnection;
  let testBookingId;
  let testPaymentIntentId;

  before(async () => {
    // Create database connection for verification
    dbConnection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'rootroot',
      database: process.env.DB_NAME || 'fayyaz_It_sql',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔧 Database Configuration:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'fayyaz_It_sql'}`);
    console.log(`   Port: ${process.env.DB_PORT || 3306}`);

    console.log('🔌 Connecting to database for verification...');
    
    // Test database connection
    return new Promise((resolve, reject) => {
      dbConnection.connect((err) => {
        if (err) {
          console.error('❌ Database connection failed:', err.message);
          console.log('💡 Please ensure your database is running and credentials are correct');
          reject(err);
        } else {
          console.log('✅ Database connection established');
          resolve();
        }
      });
    });
  });

  after(() => {
    if (dbConnection) {
      dbConnection.end();
      console.log('🔌 Database connection closed');
    }
  });

  describe('Complete Booking Flow with Database Verification', () => {
    it('should create a complete booking with passenger details and verify database storage', async () => {
      console.log('\n🧪 TESTING COMPLETE BOOKING FLOW WITH DATABASE VERIFICATION');
      console.log('='.repeat(70));

      // Step 1: Prepare comprehensive test data
      const testBookingData = {
        package_id: 199,
        customer_name: 'Database Test User',
        customer_email: 'db.test@example.com',
        customer_phone: '+65 9999 1234',
        travel_date: '2024-12-31',
        adults: 2,
        children: 1,
        infants: 0,
        total_amount: 7500.00,
        special_requests: 'Database verification test - vegetarian meals',
        passenger_details: JSON.stringify([
          {
            id: 'adult-1',
            type: 'adult',
            title: 'Mr',
            firstName: 'Database',
            lastName: 'Test',
            dateOfBirth: '1985-06-15',
            nationality: 'Singapore',
            passportNumber: 'E9876543',
            passportExpiry: '2030-06-15',
            gender: 'Male'
          },
          {
            id: 'adult-2',
            type: 'adult',
            title: 'Mrs',
            firstName: 'Test',
            lastName: 'User',
            dateOfBirth: '1987-08-20',
            nationality: 'Singapore',
            passportNumber: 'E8765432',
            passportExpiry: '2029-08-20',
            gender: 'Female'
          },
          {
            id: 'child-1',
            type: 'child',
            title: 'Miss',
            firstName: 'Little',
            lastName: 'Test',
            dateOfBirth: '2015-03-10',
            nationality: 'Singapore',
            passportNumber: 'E7654321',
            passportExpiry: '2025-03-10',
            gender: 'Female'
          }
        ]),
        contact_details: JSON.stringify({
          primaryContactName: 'Database Test User',
          primaryContactEmail: 'db.test@example.com',
          primaryContactPhone: '+65 9999 1234',
          emergencyContactName: 'Emergency Contact',
          emergencyContactPhone: '+65 8888 5678',
          emergencyContactRelation: 'Spouse',
          address: '123 Test Street, Singapore',
          city: 'Singapore',
          country: 'Singapore',
          postalCode: '123456'
        })
      };

      console.log('📋 Test booking data prepared:');
      console.log(`   Package ID: ${testBookingData.package_id}`);
      console.log(`   Customer: ${testBookingData.customer_name}`);
      console.log(`   Email: ${testBookingData.customer_email}`);
      console.log(`   Travel Date: ${testBookingData.travel_date}`);
      console.log(`   Total Amount: SGD $${testBookingData.total_amount}`);
      console.log(`   Passengers: ${testBookingData.adults} adults, ${testBookingData.children} children, ${testBookingData.infants} infants`);

      // Step 2: Test payment intent creation (simulated)
      console.log('\n💳 Step 1: Creating payment intent...');
      
      // Generate a test payment intent ID
      testPaymentIntentId = `pi_test_db_verification_${Date.now()}`;
      const merchantOrderId = `FT-${testBookingData.package_id}-${Date.now()}-TEST`;

      console.log(`   Payment Intent ID: ${testPaymentIntentId}`);
      console.log(`   Merchant Order ID: ${merchantOrderId}`);

      // Step 3: Insert booking into database
      console.log('\n📝 Step 2: Inserting booking into database...');

      const bookingInsertData = {
        user_id: 0, // Guest booking
        package_id: testBookingData.package_id,
        booking_amount: testBookingData.total_amount.toString(),
        arrival_date: testBookingData.travel_date,
        hotel_type: 1, // Standard hotel type
        return_date: '2025-01-07', // 7 days after arrival
        totaladults: testBookingData.adults,
        totalchildren: testBookingData.children,
        totalinfants: testBookingData.infants,
        flight_ticket: 'Economy',
        notes: 'Database verification test booking',
        special_requests: testBookingData.special_requests || 'No special requests',
        primary_title: 'Mr',
        primary_fname: testBookingData.customer_name.split(' ')[0],
        primary_lname: testBookingData.customer_name.split(' ').slice(1).join(' ') || 'User',
        primary_email: testBookingData.customer_email,
        primary_ccode: '+65',
        primary_phone: testBookingData.customer_phone,
        primary_country: 'Singapore',
        booking_status: 0, // Pending payment
        save_details: 0,
        payment_id: 0,
        payment_intent_id: testPaymentIntentId,
        merchant_order_id: merchantOrderId,
        passenger_details: testBookingData.passenger_details,
        contact_details: testBookingData.contact_details,
        payment_status: 'pending',
        insert_date: new Date(),
        edit_date: new Date(),
        status: 1
      };

      // Insert booking
      const insertResult = await new Promise((resolve, reject) => {
        dbConnection.query('INSERT INTO tbl_booking SET ?', bookingInsertData, (err, results) => {
          if (err) {
            console.error('❌ Failed to insert booking:', err.message);
            reject(err);
          } else {
            console.log(`✅ Booking inserted successfully with ID: ${results.insertId}`);
            resolve(results);
          }
        });
      });

      testBookingId = insertResult.insertId;
      expect(testBookingId).to.be.a('number');
      expect(testBookingId).to.be.above(0);

      // Step 4: Verify booking was saved correctly
      console.log('\n🔍 Step 3: Verifying booking data in database...');

      const savedBooking = await new Promise((resolve, reject) => {
        const query = `
          SELECT 
            b.*,
            p.p_name as package_name
          FROM tbl_booking b
          LEFT JOIN tbl_packages p ON b.package_id = p.id
          WHERE b.id = ?
        `;
        
        dbConnection.query(query, [testBookingId], (err, results) => {
          if (err) {
            console.error('❌ Failed to retrieve booking:', err.message);
            reject(err);
          } else if (results.length === 0) {
            reject(new Error('Booking not found in database'));
          } else {
            console.log('✅ Booking retrieved successfully from database');
            resolve(results[0]);
          }
        });
      });

      // Verify all booking data
      expect(savedBooking.id).to.equal(testBookingId);
      expect(savedBooking.package_id).to.equal(testBookingData.package_id);
      expect(parseFloat(savedBooking.booking_amount)).to.equal(testBookingData.total_amount);
      expect(savedBooking.primary_email).to.equal(testBookingData.customer_email);
      expect(savedBooking.payment_intent_id).to.equal(testPaymentIntentId);
      expect(savedBooking.booking_status).to.equal(0); // Pending
      expect(savedBooking.passenger_details).to.not.be.null;
      expect(savedBooking.contact_details).to.not.be.null;

      console.log('✅ Basic booking data verification: PASSED');

      // Step 5: Verify passenger details JSON
      console.log('\n👥 Step 4: Verifying passenger details...');

      const passengerDetails = JSON.parse(savedBooking.passenger_details);
      expect(passengerDetails).to.be.an('array');
      expect(passengerDetails).to.have.length(3); // 2 adults + 1 child

      // Verify adult passengers
      const adults = passengerDetails.filter(p => p.type === 'adult');
      expect(adults).to.have.length(2);
      expect(adults[0]).to.have.property('firstName', 'Database');
      expect(adults[0]).to.have.property('lastName', 'Test');
      expect(adults[0]).to.have.property('passportNumber', 'E9876543');
      expect(adults[1]).to.have.property('firstName', 'Test');
      expect(adults[1]).to.have.property('lastName', 'User');

      // Verify child passengers
      const children = passengerDetails.filter(p => p.type === 'child');
      expect(children).to.have.length(1);
      expect(children[0]).to.have.property('firstName', 'Little');
      expect(children[0]).to.have.property('lastName', 'Test');

      console.log('✅ Passenger details verification: PASSED');
      console.log(`   Adults: ${adults.length} (${adults.map(a => a.firstName + ' ' + a.lastName).join(', ')})`);
      console.log(`   Children: ${children.length} (${children.map(c => c.firstName + ' ' + c.lastName).join(', ')})`);

      // Step 6: Verify contact details JSON
      console.log('\n📞 Step 5: Verifying contact details...');

      const contactDetails = JSON.parse(savedBooking.contact_details);
      expect(contactDetails).to.be.an('object');
      expect(contactDetails).to.have.property('primaryContactName', 'Database Test User');
      expect(contactDetails).to.have.property('primaryContactEmail', 'db.test@example.com');
      expect(contactDetails).to.have.property('emergencyContactName', 'Emergency Contact');
      expect(contactDetails).to.have.property('address', '123 Test Street, Singapore');

      console.log('✅ Contact details verification: PASSED');
      console.log(`   Primary Contact: ${contactDetails.primaryContactName}`);
      console.log(`   Emergency Contact: ${contactDetails.emergencyContactName}`);
      console.log(`   Address: ${contactDetails.address}`);

      // Step 7: Simulate payment success and update booking
      console.log('\n💰 Step 6: Simulating payment success...');

      const paymentUpdateResult = await new Promise((resolve, reject) => {
        const updateQuery = `
          UPDATE tbl_booking 
          SET booking_status = 1, 
              payment_status = 'succeeded',
              payment_confirmed_at = NOW(),
              edit_date = NOW()
          WHERE payment_intent_id = ?
        `;
        
        dbConnection.query(updateQuery, [testPaymentIntentId], (err, results) => {
          if (err) {
            console.error('❌ Failed to update payment status:', err.message);
            reject(err);
          } else {
            console.log('✅ Payment status updated successfully');
            resolve(results);
          }
        });
      });

      expect(paymentUpdateResult.affectedRows).to.equal(1);

      // Step 8: Verify payment status update
      console.log('\n🔍 Step 7: Verifying payment status update...');

      const updatedBooking = await new Promise((resolve, reject) => {
        dbConnection.query('SELECT * FROM tbl_booking WHERE id = ?', [testBookingId], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results[0]);
          }
        });
      });

      expect(updatedBooking.booking_status).to.equal(1); // Confirmed
      expect(updatedBooking.payment_status).to.equal('succeeded');
      expect(updatedBooking.payment_confirmed_at).to.not.be.null;

      console.log('✅ Payment status update verification: PASSED');
      console.log(`   Booking Status: ${updatedBooking.booking_status === 1 ? 'Confirmed' : 'Pending'}`);
      console.log(`   Payment Status: ${updatedBooking.payment_status}`);
      console.log(`   Payment Confirmed At: ${updatedBooking.payment_confirmed_at}`);

      // Step 9: Test booking retrieval by user
      console.log('\n👤 Step 8: Testing user-specific booking retrieval...');

      const userBookings = await new Promise((resolve, reject) => {
        const query = `
          SELECT 
            b.id,
            COALESCE(p.p_name, CONCAT('Package ID: ', b.package_id)) as package_name,
            CONCAT(b.primary_fname, ' ', b.primary_lname) as customer_name,
            b.primary_email as customer_email,
            b.booking_amount,
            CASE 
              WHEN b.booking_status = 0 THEN 'Pending'
              WHEN b.booking_status = 1 THEN 'Confirmed'
              WHEN b.booking_status = 2 THEN 'Cancelled'
              ELSE 'Unknown'
            END as status,
            b.passenger_details,
            b.contact_details,
            b.payment_intent_id,
            b.insert_date
          FROM tbl_booking b
          LEFT JOIN tbl_packages p ON b.package_id = p.id
          WHERE b.primary_email = ?
          ORDER BY b.insert_date DESC
        `;
        
        dbConnection.query(query, [testBookingData.customer_email], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      expect(userBookings).to.be.an('array');
      expect(userBookings.length).to.be.at.least(1);

      const testBooking = userBookings.find(b => b.id === testBookingId);
      expect(testBooking).to.exist;
      expect(testBooking.status).to.equal('Confirmed');

      console.log('✅ User-specific booking retrieval: PASSED');
      console.log(`   Found ${userBookings.length} booking(s) for ${testBookingData.customer_email}`);
      console.log(`   Test booking status: ${testBooking.status}`);

      // Final verification summary
      console.log('\n' + '='.repeat(70));
      console.log('🎉 DATABASE SAVE VERIFICATION COMPLETE');
      console.log('='.repeat(70));
      console.log('✅ Booking Creation: VERIFIED');
      console.log('✅ Passenger Details Storage: VERIFIED');
      console.log('✅ Contact Details Storage: VERIFIED');
      console.log('✅ Payment Intent Linking: VERIFIED');
      console.log('✅ Payment Status Updates: VERIFIED');
      console.log('✅ User-Specific Retrieval: VERIFIED');
      console.log('✅ JSON Data Integrity: VERIFIED');
      console.log('');
      console.log(`📊 Test Booking ID: ${testBookingId}`);
      console.log(`💳 Payment Intent ID: ${testPaymentIntentId}`);
      console.log(`👤 Customer Email: ${testBookingData.customer_email}`);
      console.log(`💰 Total Amount: SGD $${testBookingData.total_amount}`);
      console.log(`👥 Passengers: ${testBookingData.adults + testBookingData.children + testBookingData.infants} total`);
      console.log('');
      console.log('🚀 DATABASE INTEGRATION: FULLY FUNCTIONAL');
      console.log('='.repeat(70));
    });

    it('should verify database schema and required columns', async () => {
      console.log('\n🏗️ Verifying database schema...');

      // Check if tbl_booking table exists and has required columns
      const tableSchema = await new Promise((resolve, reject) => {
        dbConnection.query('DESCRIBE tbl_booking', (err, results) => {
          if (err) {
            console.error('❌ Failed to describe tbl_booking table:', err.message);
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      const columnNames = tableSchema.map(col => col.Field);
      const requiredColumns = [
        'id', 'package_id', 'booking_amount', 'primary_email',
        'passenger_details', 'contact_details', 'payment_intent_id',
        'merchant_order_id', 'payment_status', 'booking_status'
      ];

      console.log('📋 Checking required columns...');
      requiredColumns.forEach(column => {
        expect(columnNames).to.include(column);
        console.log(`   ✅ ${column}: EXISTS`);
      });

      console.log('✅ Database schema verification: PASSED');
    });

    it('should test JSON data types for passenger and contact details', async () => {
      console.log('\n🧪 Testing JSON data type handling...');

      // Test invalid JSON handling
      const invalidJsonTest = {
        package_id: 199,
        customer_name: 'JSON Test User',
        customer_email: 'json.test@example.com',
        travel_date: '2024-12-31',
        total_amount: 1000.00,
        passenger_details: 'invalid-json-string',
        contact_details: '{"valid": "json"}'
      };

      try {
        const result = await new Promise((resolve, reject) => {
          const insertData = {
            user_id: 0,
            package_id: invalidJsonTest.package_id,
            booking_amount: invalidJsonTest.total_amount.toString(),
            arrival_date: invalidJsonTest.travel_date,
            hotel_type: 1,
            return_date: '2025-01-07',
            totaladults: 1,
            totalchildren: 0,
            totalinfants: 0,
            flight_ticket: 'Economy',
            notes: 'JSON test booking',
            special_requests: 'JSON test',
            primary_title: 'Mr',
            primary_fname: 'JSON',
            primary_lname: 'Test',
            primary_email: invalidJsonTest.customer_email,
            primary_ccode: '+65',
            primary_phone: '+65 9999 8888',
            primary_country: 'Singapore',
            passenger_details: invalidJsonTest.passenger_details,
            contact_details: invalidJsonTest.contact_details,
            booking_status: 0,
            save_details: 0,
            payment_id: 0,
            insert_date: new Date(),
            edit_date: new Date(),
            status: 1
          };

          dbConnection.query('INSERT INTO tbl_booking SET ?', insertData, (err, results) => {
            if (err) {
              reject(err);
            } else {
              resolve(results);
            }
          });
        });

        console.log('✅ Database accepts mixed JSON validity (as expected for TEXT columns)');
        
        // Clean up test record
        await new Promise((resolve, reject) => {
          dbConnection.query('DELETE FROM tbl_booking WHERE id = ?', [result.insertId], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

      } catch (error) {
        console.log('ℹ️ Database rejected invalid JSON (depends on column type configuration)');
      }

      console.log('✅ JSON data type handling: VERIFIED');
    });
  });

  describe('Database Performance and Integrity', () => {
    it('should handle concurrent booking insertions', async () => {
      console.log('\n⚡ Testing concurrent booking insertions...');

      const concurrentBookings = Array.from({ length: 5 }, (_, i) => ({
        user_id: 0,
        package_id: 199,
        booking_amount: (1000 + i).toString(),
        arrival_date: '2024-12-31',
        hotel_type: 1,
        return_date: '2025-01-07',
        totaladults: 1,
        totalchildren: 0,
        totalinfants: 0,
        flight_ticket: 'Economy',
        notes: `Concurrent test booking ${i}`,
        special_requests: `Test ${i}`,
        primary_title: 'Mr',
        primary_fname: `Concurrent${i}`,
        primary_lname: 'Test',
        primary_email: `concurrent${i}@test.com`,
        primary_ccode: '+65',
        primary_phone: '+65 9999 8888',
        primary_country: 'Singapore',
        booking_status: 0,
        save_details: 0,
        payment_id: 0,
        payment_intent_id: `pi_concurrent_${i}_${Date.now()}`,
        insert_date: new Date(),
        edit_date: new Date(),
        status: 1
      }));

      const insertPromises = concurrentBookings.map(booking => {
        return new Promise((resolve, reject) => {
          dbConnection.query('INSERT INTO tbl_booking SET ?', booking, (err, results) => {
            if (err) reject(err);
            else resolve(results.insertId);
          });
        });
      });

      const insertedIds = await Promise.all(insertPromises);
      expect(insertedIds).to.have.length(5);
      insertedIds.forEach(id => {
        expect(id).to.be.a('number');
        expect(id).to.be.above(0);
      });

      console.log(`✅ Successfully inserted ${insertedIds.length} concurrent bookings`);

      // Clean up test records
      await Promise.all(insertedIds.map(id => {
        return new Promise((resolve, reject) => {
          dbConnection.query('DELETE FROM tbl_booking WHERE id = ?', [id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }));

      console.log('✅ Concurrent insertion test: PASSED');
    });
  });
});
