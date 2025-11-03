-- Add columns to tbl_booking table to store passenger and contact details
-- Run these SQL commands on your database

-- Add passenger_details column to store JSON data of all passengers
ALTER TABLE tbl_booking 
ADD COLUMN passenger_details TEXT NULL COMMENT 'JSON string containing detailed passenger information';

-- Add contact_details column to store JSON data of contact information  
ALTER TABLE tbl_booking 
ADD COLUMN contact_details TEXT NULL COMMENT 'JSON string containing contact and emergency contact details';

-- Add payment_intent_id column for Airwallex integration (if not already exists)
ALTER TABLE tbl_booking 
ADD COLUMN payment_intent_id VARCHAR(255) NULL COMMENT 'Airwallex payment intent ID',
ADD COLUMN merchant_order_id VARCHAR(255) NULL COMMENT 'Unique merchant order identifier',
ADD COLUMN payment_status VARCHAR(50) NULL COMMENT 'Payment status from Airwallex',
ADD COLUMN payment_confirmed_at DATETIME NULL COMMENT 'When payment was confirmed',
ADD COLUMN payment_failure_reason TEXT NULL COMMENT 'Reason for payment failure',
ADD INDEX idx_payment_intent (payment_intent_id),
ADD INDEX idx_merchant_order (merchant_order_id),
ADD INDEX idx_payment_status (payment_status);

-- Update existing bookings to have default values (optional)
-- UPDATE tbl_booking SET passenger_details = NULL, contact_details = NULL WHERE passenger_details IS NULL;

-- Verify the changes
DESCRIBE tbl_booking;

-- Example of what the JSON data will look like:
/*
passenger_details JSON structure:
[
  {
    "id": "adult-1",
    "type": "adult",
    "title": "Mr",
    "firstName": "John",
    "lastName": "Doe", 
    "dateOfBirth": "1985-06-15",
    "nationality": "Singapore",
    "passportNumber": "E1234567",
    "passportExpiry": "2030-06-15",
    "gender": "Male",
    "specialRequests": "Vegetarian meal"
  },
  {
    "id": "child-1", 
    "type": "child",
    "title": "Miss",
    "firstName": "Jane",
    "lastName": "Doe",
    "dateOfBirth": "2015-03-20",
    "nationality": "Singapore", 
    "passportNumber": "E7654321",
    "passportExpiry": "2029-03-20",
    "gender": "Female",
    "specialRequests": ""
  }
]

contact_details JSON structure:
{
  "primaryContactName": "John Doe",
  "primaryContactEmail": "john.doe@email.com", 
  "primaryContactPhone": "+65 9123 4567",
  "emergencyContactName": "Jane Smith",
  "emergencyContactPhone": "+65 9876 5432",
  "emergencyContactRelation": "Spouse",
  "address": "123 Main Street",
  "city": "Singapore",
  "country": "Singapore",
  "postalCode": "123456"
}
*/
