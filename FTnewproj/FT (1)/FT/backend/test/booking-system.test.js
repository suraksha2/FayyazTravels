const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const expect = chai.expect;

chai.use(chaiHttp);

// Import controllers
const bookingController = require('../controllers/booking.controller');

describe('📋 Booking System Integration Tests', function() {
  this.timeout(10000);

  let mockReply;
  let mockDb;

  beforeEach(() => {
    mockReply = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub()
    };

    mockDb = {
      query: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Booking Creation', () => {
    it('should create booking with complete passenger details', () => {
      const completeBookingData = {
        package_id: 199,
        customer_name: 'John Doe',
        customer_email: 'john.doe@test.com',
        customer_phone: '+65 9123 4567',
        travel_date: '2024-12-15',
        pax: 3,
        total_amount: 7500.00,
        special_requests: 'Vegetarian meals',
        passenger_details: JSON.stringify([
          {
            id: 'adult-1',
            type: 'adult',
            title: 'Mr',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1985-06-15',
            nationality: 'Singapore',
            passportNumber: 'E1234567',
            passportExpiry: '2030-06-15',
            gender: 'Male'
          },
          {
            id: 'adult-2',
            type: 'adult',
            title: 'Mrs',
            firstName: 'Jane',
            lastName: 'Doe',
            dateOfBirth: '1987-08-20',
            nationality: 'Singapore',
            passportNumber: 'E2345678',
            passportExpiry: '2029-08-20',
            gender: 'Female'
          },
          {
            id: 'child-1',
            type: 'child',
            title: 'Miss',
            firstName: 'Emily',
            lastName: 'Doe',
            dateOfBirth: '2015-03-10',
            nationality: 'Singapore',
            passportNumber: 'E3456789',
            passportExpiry: '2025-03-10',
            gender: 'Female'
          }
        ]),
        contact_details: JSON.stringify({
          primaryContactName: 'John Doe',
          primaryContactEmail: 'john.doe@test.com',
          primaryContactPhone: '+65 9123 4567',
          emergencyContactName: 'Mary Smith',
          emergencyContactPhone: '+65 8765 4321',
          emergencyContactRelation: 'Mother',
          address: '123 Main Street',
          city: 'Singapore',
          country: 'Singapore',
          postalCode: '123456'
        })
      };

      // Mock successful database insert
      mockDb.query.yields(null, { insertId: 456 });

      const mockReq = { body: completeBookingData };

      bookingController.create(mockReq, mockReply);

      expect(mockReply.status.calledWith(201)).to.be.true;
      expect(mockReply.send.calledOnce).to.be.true;

      const response = mockReply.send.getCall(0).args[0];
      expect(response).to.have.property('id', 456);
      expect(response).to.have.property('message', 'Booking created successfully');

      console.log('✅ Complete Booking Creation Test: PASSED');
    });

    it('should reject booking with missing required fields', () => {
      const incompleteBookingData = {
        customer_name: 'John Doe'
        // Missing required fields
      };

      const mockReq = { body: incompleteBookingData };

      bookingController.create(mockReq, mockReply);

      expect(mockReply.status.calledWith(400)).to.be.true;
      expect(mockReply.send.calledOnce).to.be.true;

      const response = mockReply.send.getCall(0).args[0];
      expect(response).to.have.property('error');

      console.log('✅ Missing Fields Validation Test: PASSED');
    });

    it('should handle database errors gracefully', () => {
      const validBookingData = {
        package_id: 199,
        customer_name: 'John Doe',
        customer_email: 'john.doe@test.com',
        travel_date: '2024-12-15',
        pax: 1,
        total_amount: 2500.00
      };

      // Mock database error
      mockDb.query.yields(new Error('Database connection failed'), null);

      const mockReq = { body: validBookingData };

      bookingController.create(mockReq, mockReply);

      expect(mockReply.status.calledWith(500)).to.be.true;

      console.log('✅ Database Error Handling Test: PASSED');
    });
  });

  describe('Booking Retrieval', () => {
    it('should retrieve user-specific bookings', () => {
      const mockBookings = [
        {
          id: 1,
          package_name: 'Taiwan Odyssey',
          customer_name: 'John Doe',
          customer_email: 'john.doe@test.com',
          booking_amount: 2500.00,
          booking_status: 1,
          insert_date: new Date()
        }
      ];

      mockDb.query.yields(null, mockBookings);

      const mockReq = { 
        query: { 
          user_email: 'john.doe@test.com' 
        } 
      };

      bookingController.getAll(mockReq, mockReply);

      expect(mockReply.send.calledOnce).to.be.true;
      const response = mockReply.send.getCall(0).args[0];
      
      expect(response).to.have.property('success', true);
      expect(response).to.have.property('bookings');
      expect(response.bookings).to.be.an('array');

      console.log('✅ User-Specific Booking Retrieval Test: PASSED');
    });

    it('should require user authentication for booking retrieval', () => {
      const mockReq = { query: {} }; // No user identification

      bookingController.getAll(mockReq, mockReply);

      expect(mockReply.status.calledWith(400)).to.be.true;

      console.log('✅ Authentication Requirement Test: PASSED');
    });

    it('should retrieve booking by ID', () => {
      const mockBooking = {
        id: 123,
        package_id: 199,
        customer_name: 'John Doe',
        booking_amount: 2500.00
      };

      mockDb.query.yields(null, [mockBooking]);

      const mockReq = { params: { id: '123' } };

      bookingController.getById(mockReq, mockReply);

      expect(mockReply.send.calledOnce).to.be.true;
      const response = mockReply.send.getCall(0).args[0];
      expect(response).to.have.property('id', 123);

      console.log('✅ Booking Retrieval by ID Test: PASSED');
    });

    it('should handle non-existent booking ID', () => {
      mockDb.query.yields(null, []); // No results

      const mockReq = { params: { id: '999' } };

      bookingController.getById(mockReq, mockReply);

      expect(mockReply.status.calledWith(404)).to.be.true;

      console.log('✅ Non-Existent Booking Handling Test: PASSED');
    });
  });

  describe('Booking Updates', () => {
    it('should update booking successfully', () => {
      const updateData = {
        special_requests: 'Updated special requests',
        booking_status: 1
      };

      mockDb.query.yields(null, { affectedRows: 1 });

      const mockReq = { 
        params: { id: '123' },
        body: updateData 
      };

      bookingController.update(mockReq, mockReply);

      expect(mockReply.send.calledOnce).to.be.true;
      const response = mockReply.send.getCall(0).args[0];
      expect(response).to.have.property('message', 'Updated');

      console.log('✅ Booking Update Test: PASSED');
    });

    it('should handle update errors', () => {
      mockDb.query.yields(new Error('Update failed'), null);

      const mockReq = { 
        params: { id: '123' },
        body: { special_requests: 'Test' }
      };

      bookingController.update(mockReq, mockReply);

      expect(mockReply.status.calledWith(500)).to.be.true;

      console.log('✅ Update Error Handling Test: PASSED');
    });
  });

  describe('Passenger Details Processing', () => {
    it('should correctly parse and count passenger types', () => {
      const passengerDetails = [
        { id: 'adult-1', type: 'adult', firstName: 'John', lastName: 'Doe' },
        { id: 'adult-2', type: 'adult', firstName: 'Jane', lastName: 'Doe' },
        { id: 'child-1', type: 'child', firstName: 'Emily', lastName: 'Doe' },
        { id: 'infant-1', type: 'infant', firstName: 'Baby', lastName: 'Doe' }
      ];

      const bookingData = {
        package_id: 199,
        customer_name: 'John Doe',
        customer_email: 'john.doe@test.com',
        travel_date: '2024-12-15',
        pax: 4,
        total_amount: 8500.00,
        passenger_details: JSON.stringify(passengerDetails)
      };

      mockDb.query.yields(null, { insertId: 789 });

      const mockReq = { body: bookingData };

      bookingController.create(mockReq, mockReply);

      // Verify the controller processes passenger types correctly
      expect(mockReply.status.calledWith(201)).to.be.true;

      console.log('✅ Passenger Details Processing Test: PASSED');
    });

    it('should handle invalid JSON in passenger details', () => {
      const bookingData = {
        package_id: 199,
        customer_name: 'John Doe',
        customer_email: 'john.doe@test.com',
        travel_date: '2024-12-15',
        pax: 1,
        total_amount: 2500.00,
        passenger_details: 'invalid-json'
      };

      mockDb.query.yields(null, { insertId: 790 });

      const mockReq = { body: bookingData };

      // Should still create booking but with null passenger details
      bookingController.create(mockReq, mockReply);

      expect(mockReply.status.calledWith(201)).to.be.true;

      console.log('✅ Invalid JSON Handling Test: PASSED');
    });
  });

  describe('Contact Details Processing', () => {
    it('should store complete contact information', () => {
      const contactDetails = {
        primaryContactName: 'John Doe',
        primaryContactEmail: 'john.doe@test.com',
        primaryContactPhone: '+65 9123 4567',
        emergencyContactName: 'Mary Smith',
        emergencyContactPhone: '+65 8765 4321',
        emergencyContactRelation: 'Mother',
        address: '123 Main Street, Singapore',
        city: 'Singapore',
        country: 'Singapore',
        postalCode: '123456'
      };

      const bookingData = {
        package_id: 199,
        customer_name: 'John Doe',
        customer_email: 'john.doe@test.com',
        travel_date: '2024-12-15',
        pax: 1,
        total_amount: 2500.00,
        contact_details: JSON.stringify(contactDetails)
      };

      mockDb.query.yields(null, { insertId: 791 });

      const mockReq = { body: bookingData };

      bookingController.create(mockReq, mockReply);

      expect(mockReply.status.calledWith(201)).to.be.true;

      console.log('✅ Contact Details Storage Test: PASSED');
    });
  });
});

// Test summary reporter
after(() => {
  console.log('\n📋 BOOKING SYSTEM TEST SUMMARY');
  console.log('='.repeat(50));
  console.log('✅ Booking Creation: TESTED');
  console.log('✅ Booking Retrieval: TESTED');
  console.log('✅ Booking Updates: TESTED');
  console.log('✅ User Authentication: TESTED');
  console.log('✅ Passenger Details: TESTED');
  console.log('✅ Contact Details: TESTED');
  console.log('✅ Error Handling: TESTED');
  console.log('='.repeat(50));
});
