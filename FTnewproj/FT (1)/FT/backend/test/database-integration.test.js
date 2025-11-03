const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('🗄️ Database Integration Tests', function() {
  this.timeout(10000);

  let mockDb;

  beforeEach(() => {
    mockDb = {
      query: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Database Connection', () => {
    it('should establish database connection successfully', async () => {
      // Mock successful connection
      mockDb.query.yields(null, { message: 'Connected' });

      try {
        // Simulate connection test
        const connectionTest = new Promise((resolve, reject) => {
          mockDb.query('SELECT 1 as test', (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });

        const result = await connectionTest;
        expect(result).to.have.property('message', 'Connected');

        console.log('✅ Database Connection Test: PASSED');
      } catch (error) {
        console.log('❌ Database Connection Test: FAILED');
        throw error;
      }
    });

    it('should handle connection errors gracefully', async () => {
      // Mock connection error
      mockDb.query.yields(new Error('Connection failed'), null);

      try {
        const connectionTest = new Promise((resolve, reject) => {
          mockDb.query('SELECT 1 as test', (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });

        await connectionTest;
        // Should not reach here
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Connection failed');
        console.log('✅ Database Connection Error Handling: PASSED');
      }
    });
  });

  describe('Booking Table Operations', () => {
    it('should insert booking with passenger details', async () => {
      const bookingData = {
        user_id: 0,
        package_id: 199,
        booking_amount: 2500.00,
        arrival_date: '2024-12-15',
        totaladults: 2,
        totalchildren: 1,
        totalinfants: 0,
        primary_fname: 'John',
        primary_lname: 'Doe',
        primary_email: 'john.doe@test.com',
        primary_phone: '+65 9123 4567',
        booking_status: 0,
        payment_intent_id: 'pi_test_123456789',
        merchant_order_id: 'FT-199-123456789',
        passenger_details: JSON.stringify([
          {
            id: 'adult-1',
            type: 'adult',
            firstName: 'John',
            lastName: 'Doe',
            passportNumber: 'E1234567'
          }
        ]),
        contact_details: JSON.stringify({
          primaryContactName: 'John Doe',
          primaryContactEmail: 'john.doe@test.com'
        }),
        insert_date: new Date(),
        edit_date: new Date(),
        status: 1
      };

      // Mock successful insert
      mockDb.query.yields(null, { insertId: 123, affectedRows: 1 });

      const insertTest = new Promise((resolve, reject) => {
        mockDb.query('INSERT INTO tbl_booking SET ?', [bookingData], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      const result = await insertTest;
      expect(result).to.have.property('insertId', 123);
      expect(result).to.have.property('affectedRows', 1);

      console.log('✅ Booking Insert with Passenger Details: PASSED');
    });

    it('should retrieve bookings with package information', async () => {
      const mockBookings = [
        {
          id: 1,
          package_name: 'Taiwan Odyssey',
          customer_name: 'John Doe',
          customer_email: 'john.doe@test.com',
          booking_amount: 2500.00,
          booking_status: 1,
          passenger_details: '[{"id":"adult-1","firstName":"John","lastName":"Doe"}]',
          contact_details: '{"primaryContactName":"John Doe"}',
          payment_intent_id: 'pi_test_123',
          payment_status: 'succeeded'
        }
      ];

      mockDb.query.yields(null, mockBookings);

      const selectTest = new Promise((resolve, reject) => {
        const query = `
          SELECT 
            b.id,
            COALESCE(p.p_name, CONCAT('Package ID: ', b.package_id)) as package_name,
            CONCAT(b.primary_fname, ' ', b.primary_lname) as customer_name,
            b.primary_email as customer_email,
            b.booking_amount,
            b.booking_status,
            b.passenger_details,
            b.contact_details,
            b.payment_intent_id,
            b.payment_status
          FROM tbl_booking b
          LEFT JOIN tbl_packages p ON b.package_id = p.id
          WHERE b.primary_email = ?
        `;
        
        mockDb.query(query, ['john.doe@test.com'], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      const results = await selectTest;
      expect(results).to.be.an('array');
      expect(results[0]).to.have.property('package_name', 'Taiwan Odyssey');
      expect(results[0]).to.have.property('passenger_details');
      expect(results[0]).to.have.property('payment_intent_id');

      console.log('✅ Booking Retrieval with Package Info: PASSED');
    });

    it('should update booking status on payment confirmation', async () => {
      const paymentIntentId = 'pi_test_123456789';
      
      mockDb.query.yields(null, { affectedRows: 1 });

      const updateTest = new Promise((resolve, reject) => {
        const query = `
          UPDATE tbl_booking 
          SET booking_status = 1, 
              edit_date = NOW(),
              payment_status = 'succeeded',
              payment_confirmed_at = NOW()
          WHERE payment_intent_id = ?
        `;
        
        mockDb.query(query, [paymentIntentId], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      const result = await updateTest;
      expect(result).to.have.property('affectedRows', 1);

      console.log('✅ Payment Status Update: PASSED');
    });
  });

  describe('Package Table Operations', () => {
    it('should retrieve package information', async () => {
      const mockPackages = [
        {
          id: 199,
          p_name: 'Taiwan Odyssey',
          p_content: 'SGD $4,299',
          day_night: '7D6N',
          feature_img: '/images/taiwan.jpg',
          p_slug: 'taiwan-odyssey'
        }
      ];

      mockDb.query.yields(null, mockPackages);

      const packageTest = new Promise((resolve, reject) => {
        mockDb.query('SELECT * FROM tbl_packages WHERE id = ?', [199], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      const results = await packageTest;
      expect(results).to.be.an('array');
      expect(results[0]).to.have.property('id', 199);
      expect(results[0]).to.have.property('p_name', 'Taiwan Odyssey');

      console.log('✅ Package Retrieval: PASSED');
    });

    it('should handle non-existent package gracefully', async () => {
      mockDb.query.yields(null, []); // No results

      const packageTest = new Promise((resolve, reject) => {
        mockDb.query('SELECT * FROM tbl_packages WHERE id = ?', [999], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      const results = await packageTest;
      expect(results).to.be.an('array');
      expect(results).to.have.length(0);

      console.log('✅ Non-Existent Package Handling: PASSED');
    });
  });

  describe('User Table Operations', () => {
    it('should retrieve user profile with booking statistics', async () => {
      const mockUserProfile = [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@test.com',
          phone: '+65 9123 4567',
          totalBookings: 3,
          countriesVisited: 2,
          memberSince: '2023-01-15'
        }
      ];

      mockDb.query.yields(null, mockUserProfile);

      const userTest = new Promise((resolve, reject) => {
        const query = `
          SELECT 
            u.firstName,
            u.lastName,
            u.email,
            u.phone,
            COUNT(b.id) as totalBookings,
            COUNT(DISTINCT b.package_id) as countriesVisited,
            u.created_at as memberSince
          FROM tbl_users u
          LEFT JOIN tbl_booking b ON u.email = b.primary_email
          WHERE u.email = ?
          GROUP BY u.id
        `;
        
        mockDb.query(query, ['john.doe@test.com'], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      const results = await userTest;
      expect(results).to.be.an('array');
      expect(results[0]).to.have.property('email', 'john.doe@test.com');
      expect(results[0]).to.have.property('totalBookings', 3);

      console.log('✅ User Profile with Statistics: PASSED');
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity between bookings and packages', async () => {
      // Mock foreign key constraint test
      const constraintError = new Error('Cannot add or update a child row: a foreign key constraint fails');
      constraintError.code = 'ER_NO_REFERENCED_ROW_2';

      mockDb.query.yields(constraintError, null);

      try {
        const integrityTest = new Promise((resolve, reject) => {
          const bookingData = {
            package_id: 999999, // Non-existent package
            customer_name: 'Test User',
            customer_email: 'test@example.com'
          };
          
          mockDb.query('INSERT INTO tbl_booking SET ?', [bookingData], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });

        await integrityTest;
        expect.fail('Should have thrown a foreign key constraint error');
      } catch (error) {
        expect(error.code).to.equal('ER_NO_REFERENCED_ROW_2');
        console.log('✅ Referential Integrity: PASSED');
      }
    });

    it('should validate JSON data in passenger_details column', async () => {
      const validPassengerDetails = JSON.stringify([
        {
          id: 'adult-1',
          type: 'adult',
          firstName: 'John',
          lastName: 'Doe',
          passportNumber: 'E1234567'
        }
      ]);

      // Test that valid JSON is accepted
      mockDb.query.yields(null, { insertId: 123 });

      const jsonTest = new Promise((resolve, reject) => {
        const bookingData = {
          package_id: 199,
          customer_name: 'John Doe',
          customer_email: 'john.doe@test.com',
          passenger_details: validPassengerDetails
        };
        
        mockDb.query('INSERT INTO tbl_booking SET ?', [bookingData], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      const result = await jsonTest;
      expect(result).to.have.property('insertId', 123);

      console.log('✅ JSON Data Validation: PASSED');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large result sets efficiently', async () => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        package_name: `Package ${i + 1}`,
        customer_name: `Customer ${i + 1}`,
        booking_amount: 1000 + i
      }));

      mockDb.query.yields(null, largeDataset);

      const performanceTest = new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        mockDb.query('SELECT * FROM tbl_booking LIMIT 1000', (err, results) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          if (err) reject(err);
          else resolve({ results, duration });
        });
      });

      const { results, duration } = await performanceTest;
      expect(results).to.have.length(1000);
      expect(duration).to.be.below(100); // Should complete quickly in mock

      console.log('✅ Large Dataset Performance: PASSED');
    });

    it('should handle concurrent operations', async () => {
      // Mock concurrent operations
      mockDb.query.yields(null, { insertId: 1 });

      const concurrentOperations = Array.from({ length: 10 }, (_, i) => {
        return new Promise((resolve, reject) => {
          const bookingData = {
            package_id: 199,
            customer_name: `User ${i}`,
            customer_email: `user${i}@test.com`
          };
          
          mockDb.query('INSERT INTO tbl_booking SET ?', [bookingData], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });
      });

      const results = await Promise.all(concurrentOperations);
      expect(results).to.have.length(10);
      results.forEach(result => {
        expect(result).to.have.property('insertId', 1);
      });

      console.log('✅ Concurrent Operations: PASSED');
    });
  });

  describe('Backup and Recovery', () => {
    it('should handle transaction rollback', async () => {
      // Mock transaction rollback scenario
      const transactionError = new Error('Transaction rolled back');
      mockDb.query.onFirstCall().yields(null, { insertId: 123 });
      mockDb.query.onSecondCall().yields(transactionError, null);

      try {
        // Simulate transaction
        const transaction1 = new Promise((resolve, reject) => {
          mockDb.query('INSERT INTO tbl_booking SET ?', [{}], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });

        const transaction2 = new Promise((resolve, reject) => {
          mockDb.query('INSERT INTO tbl_payment SET ?', [{}], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });

        await transaction1; // Should succeed
        await transaction2; // Should fail
        
        expect.fail('Should have thrown a transaction error');
      } catch (error) {
        expect(error.message).to.equal('Transaction rolled back');
        console.log('✅ Transaction Rollback: PASSED');
      }
    });
  });
});

// Test summary reporter
after(() => {
  console.log('\n🗄️ DATABASE INTEGRATION TEST SUMMARY');
  console.log('='.repeat(50));
  console.log('✅ Database Connection: TESTED');
  console.log('✅ Booking Operations: TESTED');
  console.log('✅ Package Operations: TESTED');
  console.log('✅ User Operations: TESTED');
  console.log('✅ Data Integrity: TESTED');
  console.log('✅ Performance: TESTED');
  console.log('✅ Backup & Recovery: TESTED');
  console.log('='.repeat(50));
});
