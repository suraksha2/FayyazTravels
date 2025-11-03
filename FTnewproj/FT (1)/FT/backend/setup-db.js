require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ DB connected successfully');
});

// Check if tbl_users table exists
connection.query("SHOW TABLES LIKE 'tbl_users'", (err, results) => {
  if (err) {
    console.error('❌ Error checking tables:', err.message);
    process.exit(1);
  }
  
  if (results.length === 0) {
    console.log('📝 Creating tbl_users table...');
    
    const createTableQuery = `
      CREATE TABLE tbl_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    connection.query(createTableQuery, (err, result) => {
      if (err) {
        console.error('❌ Error creating table:', err.message);
        process.exit(1);
      }
      console.log('✅ tbl_users table created successfully');
      connection.end();
    });
  } else {
    console.log('✅ tbl_users table already exists');
    
    // Show table structure
    connection.query("DESCRIBE tbl_users", (err, results) => {
      if (err) {
        console.error('❌ Error describing table:', err.message);
      } else {
        console.log('📋 Table structure:');
        console.table(results);
      }
      connection.end();
    });
  }
});
