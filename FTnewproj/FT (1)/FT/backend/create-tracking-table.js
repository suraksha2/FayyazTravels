// Create email tracking table for analytics
const db = require('./db');

const createTrackingTable = `
  CREATE TABLE IF NOT EXISTS email_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_id VARCHAR(255) UNIQUE NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    package_name VARCHAR(255),
    customer_name VARCHAR(255),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tracking_id (tracking_id),
    INDEX idx_customer_email (customer_email),
    INDEX idx_sent_at (sent_at)
  )
`;

const createClicksTable = `
  CREATE TABLE IF NOT EXISTS email_clicks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    INDEX idx_tracking_id (tracking_id),
    INDEX idx_action (action),
    INDEX idx_clicked_at (clicked_at),
    FOREIGN KEY (tracking_id) REFERENCES email_tracking(tracking_id) ON DELETE CASCADE
  )
`;

console.log('🚀 Creating email tracking tables...');

db.query(createTrackingTable, (err, result) => {
  if (err) {
    console.error('❌ Error creating email_tracking table:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Email tracking table created successfully');
    
    db.query(createClicksTable, (clickErr, clickResult) => {
      if (clickErr) {
        console.error('❌ Error creating email_clicks table:', clickErr.message);
        process.exit(1);
      } else {
        console.log('✅ Email clicks table created successfully');
        console.log('📊 Email tracking system ready for analytics!');
        process.exit(0);
      }
    });
  }
});
