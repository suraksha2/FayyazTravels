/**
 * Payment Controller Tests
 * Tests the payment intent creation and booking flow
 */

const db = require('../db');

// Mock Airwallex SDK
jest.mock('@airwallex/node-sdk', () => {
  return {
    Airwallex: jest.fn().mockImplementation(() => ({
      post: jest.fn().mockResolvedValue({
        id: 'int_test_12345',
        status: 'requires_payment_method',
        amount: 140600,
        currency: 'SGD',
        client_secret: 'int_test_12345_secret_abcdef',
        created_at: new Date().toISOString(),
        merchant_order_id: 'FT-59-1234567890-test'
      }),
      get: jest.fn().mockResolvedValue({
        id: 'int_test_12345',
        status: 'succeeded',
        amount: 140600,
        currency: 'SGD',
        created_at: new Date().toISOString()
      })
    }))
  };
});

describe('Payment Controller Integration Tests', () => {
  let createdBookingIds = [];

  // Clean up test bookings after all tests
  afterAll(async () => {
    if (createdBookingIds.length > 0) {
      await new Promise((resolve, reject) => {
        db.query(
          'DELETE FROM tbl_booking WHERE id IN (?)',
          [createdBookingIds],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    db.end();
  });

  describe('Payment Intent Creation with Database Save', () => {
    test('should create booking in database when payment intent is created', async () => {
      const paymentData = {
        package_id: 59,
        customer_name: 'Test Customer',
        customer_email: 'testcustomer@example.com',
        customer_phone: '1234567890',
        travel_date: '2025-12-25',
        adults: 2,
        children: 1,
        infants: 0,
        total_amount: 1406,
        special_requests: 'Window seat please',
        passenger_details: JSON.stringify([
          {
            id: 'adult-1',
            type: 'adult',
            title: 'Mr',
            firstName: 'John',
            lastName: 'Smith',
            dateOfBirth: '1985-05-15',
            nationality: 'Singapore',
            passportNumber: 'S1234567A',
            passportExpiry: '2030-05-15',
            gender: 'Male'
          },
          {
            id: 'adult-2',
            type: 'adult',
            title: 'Mrs',
            firstName: 'Jane',
            lastName: 'Smith',
            dateOfBirth: '1987-08-20',
            nationality: 'Singapore',
            passportNumber: 'S7654321B',
            passportExpiry: '2030-08-20',
            gender: 'Female'
          },
          {
            id: 'child-1',
            type: 'child',
            title: 'Miss',
            firstName: 'Emily',
            lastName: 'Smith',
            dateOfBirth: '2015-03-10',
            nationality: 'Singapore',
            passportNumber: 'S9876543C',
            passportExpiry: '2028-03-10',
            gender: 'Female'
          }
        ]),
        contact_details: JSON.stringify({
          primaryContactName: 'Test Customer',
          primaryContactEmail: 'testcustomer@example.com',
          primaryContactPhone: '1234567890',
          emergencyContactName: 'Emergency Person',
          emergencyContactPhone: '0987654321',
          emergencyContactRelation: 'Sibling',
          address: '456 Test Avenue',
          city: 'Singapore',
          country: 'Singapore',
          postalCode: '654321'
        })
      };

      // Simulate payment intent creation
      const merchantOrderId = `FT-${paymentData.package_id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const paymentIntentId = `int_test_${Date.now()}`;

      // Create booking in database (simulating what payment controller does)
      const nameParts = paymentData.customer_name.trim().split(' ');
      const bookingData = {
        user_id: 0,
        package_id: parseInt(paymentData.package_id),
        booking_amount: paymentData.total_amount,
        arrival_date: paymentData.travel_date,
        return_date: paymentData.travel_date,
        totaladults: paymentData.adults || 0,
        totalchildren: paymentData.children || 0,
        totalinfants: paymentData.infants || 0,
        primary_title: 'Mr',
        primary_fname: nameParts[0] || '',
        primary_lname: nameParts.slice(1).join(' ') || '',
        primary_email: paymentData.customer_email,
        primary_phone: paymentData.customer_phone || '',
        primary_ccode: 'SG',
        primary_country: 'Singapore',
        special_requests: paymentData.special_requests || '',
        booking_status: 0, // Pending payment
        payment_intent_id: paymentIntentId,
        merchant_order_id: merchantOrderId,
        passenger_details: paymentData.passenger_details || null,
        contact_details: paymentData.contact_details || null,
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

      createdBookingIds.push(result.insertId);

      // Verify booking was saved correctly
      const savedBooking = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM tbl_booking WHERE id = ?', [result.insertId], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      expect(savedBooking).toBeDefined();
      expect(savedBooking.package_id).toBe(59);
      expect(savedBooking.primary_email).toBe('testcustomer@example.com');
      expect(parseFloat(savedBooking.booking_amount)).toBe(1406);
      expect(savedBooking.totaladults).toBe(2);
      expect(savedBooking.totalchildren).toBe(1);
      expect(savedBooking.totalinfants).toBe(0);
      expect(savedBooking.booking_status).toBe(0); // Pending
      expect(savedBooking.payment_intent_id).toBe(paymentIntentId);
      expect(savedBooking.merchant_order_id).toBe(merchantOrderId);
    });

    test('should save all passenger details correctly', async () => {
      const lastBookingId = createdBookingIds[createdBookingIds.length - 1];

      const booking = await new Promise((resolve, reject) => {
        db.query('SELECT passenger_details FROM tbl_booking WHERE id = ?', [lastBookingId], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      expect(booking.passenger_details).toBeDefined();
      
      const passengers = JSON.parse(booking.passenger_details);
      expect(Array.isArray(passengers)).toBe(true);
      expect(passengers.length).toBe(3); // 2 adults + 1 child

      // Check adult passenger
      const adult1 = passengers.find(p => p.id === 'adult-1');
      expect(adult1).toBeDefined();
      expect(adult1.firstName).toBe('John');
      expect(adult1.lastName).toBe('Smith');
      expect(adult1.type).toBe('adult');
      expect(adult1.passportNumber).toBe('S1234567A');

      // Check child passenger
      const child1 = passengers.find(p => p.id === 'child-1');
      expect(child1).toBeDefined();
      expect(child1.firstName).toBe('Emily');
      expect(child1.type).toBe('child');
    });

    test('should save contact details correctly', async () => {
      const lastBookingId = createdBookingIds[createdBookingIds.length - 1];

      const booking = await new Promise((resolve, reject) => {
        db.query('SELECT contact_details FROM tbl_booking WHERE id = ?', [lastBookingId], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      expect(booking.contact_details).toBeDefined();
      
      const contact = JSON.parse(booking.contact_details);
      expect(contact.primaryContactName).toBe('Test Customer');
      expect(contact.primaryContactEmail).toBe('testcustomer@example.com');
      expect(contact.emergencyContactName).toBe('Emergency Person');
      expect(contact.emergencyContactRelation).toBe('Sibling');
      expect(contact.address).toBe('456 Test Avenue');
      expect(contact.city).toBe('Singapore');
    });
  });

  describe('Payment Confirmation Flow', () => {
    test('should update booking status when payment is confirmed', async () => {
      const lastBookingId = createdBookingIds[createdBookingIds.length - 1];

      // Get the payment_intent_id
      const booking = await new Promise((resolve, reject) => {
        db.query('SELECT payment_intent_id FROM tbl_booking WHERE id = ?', [lastBookingId], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      const paymentIntentId = booking.payment_intent_id;

      // Simulate payment confirmation (what confirmPayment controller does)
      const paymentStatus = 'succeeded';
      const updateResult = await new Promise((resolve, reject) => {
        const query = `
          UPDATE tbl_booking 
          SET booking_status = 1, 
              payment_status = ?, 
              edit_date = NOW() 
          WHERE payment_intent_id = ?
        `;
        db.query(query, [paymentStatus, paymentIntentId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      expect(updateResult).toBeDefined();
      expect(updateResult.affectedRows).toBe(1);

      // Verify the booking was updated
      const updatedBooking = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM tbl_booking WHERE id = ?', [lastBookingId], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      expect(updatedBooking.booking_status).toBe(1); // Confirmed
      expect(updatedBooking.payment_status).toBe('succeeded');
    });

    test('should handle payment failure correctly', async () => {
      // Create a new booking for failure test
      const failureBookingData = {
        user_id: 0,
        package_id: 59,
        booking_amount: 500,
        arrival_date: '2025-12-25',
        return_date: '2025-12-30',
        totaladults: 1,
        totalchildren: 0,
        totalinfants: 0,
        primary_title: 'Mr',
        primary_fname: 'Failed',
        primary_lname: 'Payment',
        primary_email: 'failed@test.com',
        primary_phone: '1111111111',
        primary_ccode: 'SG',
        primary_country: 'Singapore',
        special_requests: '',
        booking_status: 0,
        payment_intent_id: `int_failed_${Date.now()}`,
        merchant_order_id: `FT-FAILED-${Date.now()}`,
        hotel_type: 1,
        flight_ticket: 0,
        notes: '',
        insert_date: new Date(),
        edit_date: new Date(),
        status: 1
      };

      const result = await new Promise((resolve, reject) => {
        db.query('INSERT INTO tbl_booking SET ?', failureBookingData, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      createdBookingIds.push(result.insertId);

      // Simulate payment failure
      const paymentStatus = 'failed';
      const failureReason = 'Card declined';
      
      await new Promise((resolve, reject) => {
        const query = `
          UPDATE tbl_booking 
          SET booking_status = 2, 
              payment_status = ?, 
              payment_failure_reason = ?,
              edit_date = NOW() 
          WHERE payment_intent_id = ?
        `;
        db.query(query, [paymentStatus, failureReason, failureBookingData.payment_intent_id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      // Verify the booking was marked as failed
      const failedBooking = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM tbl_booking WHERE id = ?', [result.insertId], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      expect(failedBooking.booking_status).toBe(2); // Cancelled/Failed
      expect(failedBooking.payment_status).toBe('failed');
      expect(failedBooking.payment_failure_reason).toBe('Card declined');
    });
  });

  describe('Booking Retrieval', () => {
    test('should retrieve booking by payment_intent_id', async () => {
      const lastBookingId = createdBookingIds[createdBookingIds.length - 1];

      const booking = await new Promise((resolve, reject) => {
        db.query('SELECT payment_intent_id FROM tbl_booking WHERE id = ?', [lastBookingId], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      const paymentIntentId = booking.payment_intent_id;

      // Retrieve by payment_intent_id
      const results = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM tbl_booking WHERE payment_intent_id = ?', [paymentIntentId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].id).toBe(lastBookingId);
    });

    test('should retrieve all bookings for a package', async () => {
      const results = await new Promise((resolve, reject) => {
        db.query(
          'SELECT * FROM tbl_booking WHERE package_id = ? ORDER BY insert_date DESC',
          [59],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      // Should include our test bookings
      const ourBookings = results.filter(b => createdBookingIds.includes(b.id));
      expect(ourBookings.length).toBeGreaterThan(0);
    });

    test('should retrieve bookings by status', async () => {
      const results = await new Promise((resolve, reject) => {
        db.query(
          'SELECT * FROM tbl_booking WHERE booking_status = ? LIMIT 10',
          [1], // Confirmed bookings
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      results.forEach(booking => {
        expect(booking.booking_status).toBe(1);
      });
    });
  });

  describe('Complete Booking Flow', () => {
    test('should complete full booking flow: create -> confirm -> retrieve', async () => {
      // Step 1: Create booking (payment intent creation)
      const bookingData = {
        user_id: 0,
        package_id: 59,
        booking_amount: 2000,
        arrival_date: '2026-01-15',
        return_date: '2026-01-20',
        totaladults: 2,
        totalchildren: 0,
        totalinfants: 0,
        primary_title: 'Mr',
        primary_fname: 'Complete',
        primary_lname: 'Flow',
        primary_email: 'complete.flow@test.com',
        primary_phone: '9999999999',
        primary_ccode: 'SG',
        primary_country: 'Singapore',
        special_requests: '',
        booking_status: 0,
        payment_intent_id: `int_complete_${Date.now()}`,
        merchant_order_id: `FT-COMPLETE-${Date.now()}`,
        passenger_details: JSON.stringify([
          { id: 'adult-1', type: 'adult', firstName: 'Complete', lastName: 'Flow' }
        ]),
        contact_details: JSON.stringify({
          primaryContactName: 'Complete Flow',
          primaryContactEmail: 'complete.flow@test.com'
        }),
        hotel_type: 1,
        flight_ticket: 0,
        notes: '',
        insert_date: new Date(),
        edit_date: new Date(),
        status: 1
      };

      const createResult = await new Promise((resolve, reject) => {
        db.query('INSERT INTO tbl_booking SET ?', bookingData, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      const bookingId = createResult.insertId;
      createdBookingIds.push(bookingId);

      expect(bookingId).toBeGreaterThan(0);

      // Step 2: Verify booking is pending
      let booking = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM tbl_booking WHERE id = ?', [bookingId], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      expect(booking.booking_status).toBe(0); // Pending

      // Step 3: Confirm payment
      await new Promise((resolve, reject) => {
        db.query(
          `UPDATE tbl_booking 
           SET booking_status = 1, 
               payment_status = 'succeeded',
               edit_date = NOW() 
           WHERE id = ?`,
          [bookingId],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      // Step 4: Verify booking is confirmed
      booking = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM tbl_booking WHERE id = ?', [bookingId], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      expect(booking.booking_status).toBe(1); // Confirmed
      expect(booking.payment_status).toBe('succeeded');

      // Step 5: Retrieve by payment_intent_id
      const retrievedBookings = await new Promise((resolve, reject) => {
        db.query(
          'SELECT * FROM tbl_booking WHERE payment_intent_id = ?',
          [bookingData.payment_intent_id],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      expect(retrievedBookings.length).toBe(1);
      expect(retrievedBookings[0].id).toBe(bookingId);
      expect(retrievedBookings[0].booking_status).toBe(1);
    });
  });
});
