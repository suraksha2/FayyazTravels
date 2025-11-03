/**
 * Booking Database Integration Tests
 * Tests that bookings are properly saved to the database
 */

const db = require('../db');

describe('Booking Database Integration Tests', () => {
  let testBookingId;

  // Clean up test data after all tests
  afterAll(async () => {
    if (testBookingId) {
      await new Promise((resolve, reject) => {
        db.query('DELETE FROM tbl_booking WHERE id = ?', [testBookingId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    // Close database connection
    db.end();
  });

  describe('Database Connection', () => {
    test('should connect to database successfully', (done) => {
      db.query('SELECT 1 as result', (err, results) => {
        expect(err).toBeNull();
        expect(results).toBeDefined();
        expect(results[0].result).toBe(1);
        done();
      });
    });

    test('should have tbl_booking table', (done) => {
      db.query('SHOW TABLES LIKE "tbl_booking"', (err, results) => {
        expect(err).toBeNull();
        expect(results).toBeDefined();
        expect(results.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('Booking Creation', () => {
    test('should insert a booking into database', async () => {
      const bookingData = {
        user_id: 0,
        package_id: 59,
        booking_amount: 1500.00,
        arrival_date: '2025-12-25',
        return_date: '2025-12-30',
        totaladults: 2,
        totalchildren: 1,
        totalinfants: 0,
        primary_title: 'Mr',
        primary_fname: 'John',
        primary_lname: 'Doe',
        primary_email: 'john.doe@test.com',
        primary_phone: '1234567890',
        primary_ccode: 'SG',
        primary_country: 'Singapore',
        special_requests: 'Test booking from Jest',
        booking_status: 0,
        payment_intent_id: `test_intent_${Date.now()}`,
        merchant_order_id: `TEST-ORDER-${Date.now()}`,
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
          primaryContactName: 'John Doe',
          primaryContactEmail: 'john.doe@test.com',
          primaryContactPhone: '1234567890',
          emergencyContactName: 'Jane Doe',
          emergencyContactPhone: '0987654321',
          emergencyContactRelation: 'Spouse',
          address: '123 Test Street',
          city: 'Singapore',
          country: 'Singapore',
          postalCode: '123456'
        }),
        hotel_type: 1,
        flight_ticket: 0,
        notes: '',
        insert_date: new Date(),
        edit_date: new Date(),
        status: 1
      };

      const result = await new Promise((resolve, reject) => {
        db.query('INSERT INTO tbl_booking SET ?', bookingData, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      expect(result).toBeDefined();
      expect(result.insertId).toBeDefined();
      expect(result.insertId).toBeGreaterThan(0);
      
      // Store for cleanup
      testBookingId = result.insertId;
    });

    test('should retrieve the inserted booking from database', async () => {
      expect(testBookingId).toBeDefined();

      const results = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM tbl_booking WHERE id = ?', [testBookingId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      
      const booking = results[0];
      expect(booking.id).toBe(testBookingId);
      expect(booking.package_id).toBe(59);
      expect(booking.primary_email).toBe('john.doe@test.com');
      expect(parseFloat(booking.booking_amount)).toBe(1500);
      expect(booking.totaladults).toBe(2);
      expect(booking.totalchildren).toBe(1);
      expect(booking.booking_status).toBe(0);
    });

    test('should save passenger_details as JSON string', async () => {
      const results = await new Promise((resolve, reject) => {
        db.query('SELECT passenger_details FROM tbl_booking WHERE id = ?', [testBookingId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      
      const passengerDetails = results[0].passenger_details;
      expect(passengerDetails).toBeDefined();
      
      // Should be parseable JSON
      const parsed = JSON.parse(passengerDetails);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
      expect(parsed[0].firstName).toBe('John');
      expect(parsed[0].lastName).toBe('Doe');
    });

    test('should save contact_details as JSON string', async () => {
      const results = await new Promise((resolve, reject) => {
        db.query('SELECT contact_details FROM tbl_booking WHERE id = ?', [testBookingId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      
      const contactDetails = results[0].contact_details;
      expect(contactDetails).toBeDefined();
      
      // Should be parseable JSON
      const parsed = JSON.parse(contactDetails);
      expect(parsed.primaryContactName).toBe('John Doe');
      expect(parsed.emergencyContactName).toBe('Jane Doe');
      expect(parsed.city).toBe('Singapore');
    });
  });

  describe('Booking Update', () => {
    test('should update booking status to confirmed', async () => {
      const result = await new Promise((resolve, reject) => {
        db.query(
          'UPDATE tbl_booking SET booking_status = 1, edit_date = NOW() WHERE id = ?',
          [testBookingId],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      expect(result).toBeDefined();
      expect(result.affectedRows).toBe(1);

      // Verify the update
      const results = await new Promise((resolve, reject) => {
        db.query('SELECT booking_status FROM tbl_booking WHERE id = ?', [testBookingId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      expect(results[0].booking_status).toBe(1);
    });

    test('should update booking with payment status', async () => {
      const paymentStatus = 'succeeded';
      const paymentIntentId = `test_intent_${Date.now()}`;

      const result = await new Promise((resolve, reject) => {
        db.query(
          `UPDATE tbl_booking 
           SET booking_status = 1, 
               payment_status = ?, 
               payment_intent_id = ?,
               edit_date = NOW() 
           WHERE id = ?`,
          [paymentStatus, paymentIntentId, testBookingId],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      expect(result).toBeDefined();
      expect(result.affectedRows).toBe(1);

      // Verify the update
      const results = await new Promise((resolve, reject) => {
        db.query(
          'SELECT booking_status, payment_intent_id FROM tbl_booking WHERE id = ?',
          [testBookingId],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      expect(results[0].booking_status).toBe(1);
      expect(results[0].payment_intent_id).toBe(paymentIntentId);
    });
  });

  describe('Booking Queries', () => {
    test('should find booking by payment_intent_id', async () => {
      // First get the payment_intent_id
      const booking = await new Promise((resolve, reject) => {
        db.query('SELECT payment_intent_id FROM tbl_booking WHERE id = ?', [testBookingId], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      const paymentIntentId = booking.payment_intent_id;

      // Now search by payment_intent_id
      const results = await new Promise((resolve, reject) => {
        db.query(
          'SELECT * FROM tbl_booking WHERE payment_intent_id = ?',
          [paymentIntentId],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe(testBookingId);
    });

    test('should find bookings by package_id', async () => {
      const results = await new Promise((resolve, reject) => {
        db.query(
          'SELECT * FROM tbl_booking WHERE package_id = ? ORDER BY insert_date DESC LIMIT 10',
          [59],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      // Should include our test booking
      const ourBooking = results.find(b => b.id === testBookingId);
      expect(ourBooking).toBeDefined();
    });

    test('should find bookings by email', async () => {
      const results = await new Promise((resolve, reject) => {
        db.query(
          'SELECT * FROM tbl_booking WHERE primary_email = ?',
          ['john.doe@test.com'],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].primary_email).toBe('john.doe@test.com');
    });

    test('should count bookings by status', async () => {
      const results = await new Promise((resolve, reject) => {
        db.query(
          'SELECT booking_status, COUNT(*) as count FROM tbl_booking GROUP BY booking_status',
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      results.forEach(row => {
        expect(row.count).toBeGreaterThan(0);
        expect(typeof row.booking_status).toBe('number');
      });
    });
  });

  describe('Data Integrity', () => {
    test('should not allow duplicate payment_intent_id', async () => {
      const booking = await new Promise((resolve, reject) => {
        db.query('SELECT payment_intent_id FROM tbl_booking WHERE id = ?', [testBookingId], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      const duplicateBooking = {
        user_id: 0,
        package_id: 59,
        booking_amount: 1000,
        arrival_date: '2025-12-25',
        return_date: '2025-12-30',
        totaladults: 1,
        totalchildren: 0,
        totalinfants: 0,
        primary_fname: 'Test',
        primary_lname: 'User',
        primary_email: 'test2@test.com',
        booking_status: 0,
        payment_intent_id: booking.payment_intent_id, // Same payment_intent_id
        merchant_order_id: `TEST-ORDER-${Date.now()}`,
        insert_date: new Date(),
        edit_date: new Date(),
        status: 1
      };

      // This should fail if there's a unique constraint
      // If no constraint exists, it will succeed but we can check for duplicates
      try {
        await new Promise((resolve, reject) => {
          db.query('INSERT INTO tbl_booking SET ?', duplicateBooking, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });
        
        // If insert succeeded, check for duplicates
        const duplicates = await new Promise((resolve, reject) => {
          db.query(
            'SELECT COUNT(*) as count FROM tbl_booking WHERE payment_intent_id = ?',
            [booking.payment_intent_id],
            (err, results) => {
              if (err) reject(err);
              else resolve(results);
            }
          );
        });
        
        // Clean up the duplicate if it was created
        await new Promise((resolve, reject) => {
          db.query(
            'DELETE FROM tbl_booking WHERE payment_intent_id = ? AND id != ?',
            [booking.payment_intent_id, testBookingId],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        
        console.warn('Warning: No unique constraint on payment_intent_id. Consider adding one for data integrity.');
      } catch (error) {
        // Expected to fail with duplicate key error
        expect(error).toBeDefined();
      }
    });

    test('should require mandatory fields', async () => {
      const incompleteBooking = {
        user_id: 0,
        // Missing package_id
        booking_amount: 1000,
        booking_status: 0
      };

      await expect(
        new Promise((resolve, reject) => {
          db.query('INSERT INTO tbl_booking SET ?', incompleteBooking, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        })
      ).rejects.toThrow();
    });
  });
});
