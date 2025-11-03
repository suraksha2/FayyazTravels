// Create enquiries table in the existing database
const db = require('./db');

const createEnquiriesTable = `
  CREATE TABLE IF NOT EXISTS enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    package_name VARCHAR(255),
    package_type VARCHAR(100),
    destination VARCHAR(255),
    travel_dates VARCHAR(255),
    pax VARCHAR(100),
    message TEXT,
    status ENUM('new', 'contacted', 'quoted', 'booked', 'cancelled') DEFAULT 'new',
    admin_notes TEXT,
    source_page VARCHAR(500),
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_destination (destination),
    INDEX idx_created_at (created_at),
    INDEX idx_package_name (package_name)
  )
`;

console.log('Creating enquiries table...');

db.query(createEnquiriesTable, (err, result) => {
  if (err) {
    console.error(' Error creating enquiries table:', err.message);
  } else {
    console.log(' Enquiries table created successfully');
    
    // Test insert
    const testInsert = `
      INSERT INTO enquiries (name, email, phone, package_name, destination, message) 
      VALUES ('Test User', 'test@example.com', '+65 1234 5678', 'Test Package', 'Test Destination', 'Test message')
    `;
    
    db.query(testInsert, (insertErr, insertResult) => {
      if (insertErr) {
        console.error(' Test insert failed:', insertErr.message);
      } else {
        console.log(' Test enquiry inserted successfully, ID:', insertResult.insertId);
        
        // Check if data exists
        db.query('SELECT COUNT(*) as count FROM enquiries', (countErr, countResult) => {
          if (countErr) {
            console.error(' Count query failed:', countErr.message);
          } else {
            console.log(' Total enquiries in database:', countResult[0].count);
          }
          process.exit(0);
        });
      }
    });
  }
});
