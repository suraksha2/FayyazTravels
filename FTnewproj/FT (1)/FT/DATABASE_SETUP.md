# 🗄️ Database Setup Guide - FT Travel Booking System

## 📋 Overview

This guide provides comprehensive instructions for setting up and configuring the MySQL database for the FT Travel Booking System.

## 🔧 Prerequisites

- **MySQL Server** 8.0 or higher
- **MySQL Client** or **phpMyAdmin** for database management
- **Node.js** for running setup scripts
- **Administrative access** to MySQL server

## 🚀 Quick Setup

### 1. Install MySQL

#### On macOS (using Homebrew):
```bash
brew install mysql
brew services start mysql
```

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### On Windows:
Download and install from [MySQL Official Website](https://dev.mysql.com/downloads/mysql/)

### 2. Secure MySQL Installation
```bash
sudo mysql_secure_installation
```

## 🏗️ Database Creation

### 1. Connect to MySQL
```bash
mysql -u root -p
```

### 2. Create Database and User
```sql
-- Create database
CREATE DATABASE ft_travel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create dedicated user
CREATE USER 'ft_user'@'localhost' IDENTIFIED BY 'FT_SecurePass2024!';

-- Grant privileges
GRANT ALL PRIVILEGES ON ft_travel_db.* TO 'ft_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify user creation
SELECT User, Host FROM mysql.user WHERE User = 'ft_user';

-- Exit MySQL
EXIT;
```

### 3. Test Connection
```bash
mysql -u ft_user -p ft_travel_db
```

## 📊 Database Schema

### Core Tables Structure

#### 1. Users Table (tbl_users)
```sql
CREATE TABLE tbl_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);
```

#### 2. Packages Table (tbl_packages)
```sql
CREATE TABLE tbl_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    p_name VARCHAR(255) NOT NULL,
    p_slug VARCHAR(255) UNIQUE NOT NULL,
    p_description TEXT,
    p_price DECIMAL(10,2) NOT NULL,
    p_currency VARCHAR(3) DEFAULT 'SGD',
    p_duration INT NOT NULL COMMENT 'Duration in days',
    p_category VARCHAR(100),
    p_destination VARCHAR(255),
    p_image VARCHAR(500),
    p_status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (p_category),
    INDEX idx_destination (p_destination),
    INDEX idx_status (p_status),
    INDEX idx_slug (p_slug)
);
```

#### 3. Bookings Table (tbl_booking)
```sql
CREATE TABLE tbl_booking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    package_id INT NOT NULL,
    primary_email VARCHAR(255) NOT NULL,
    primary_fname VARCHAR(100) NOT NULL,
    primary_lname VARCHAR(100) NOT NULL,
    primary_phone VARCHAR(50),
    primary_title VARCHAR(10),
    primary_ccode VARCHAR(10),
    primary_country VARCHAR(100),
    
    -- Travel Details
    travel_date DATE NOT NULL,
    return_date DATE,
    adults INT NOT NULL DEFAULT 1,
    children INT DEFAULT 0,
    hotel_type VARCHAR(100),
    flight_ticket ENUM('yes', 'no') DEFAULT 'no',
    
    -- Pricing
    booking_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SGD',
    
    -- Payment Details
    payment_intent_id VARCHAR(255),
    payment_status ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled') DEFAULT 'pending',
    booking_status TINYINT DEFAULT 0 COMMENT '0=pending, 1=confirmed, 2=cancelled',
    
    -- Additional Info
    special_requests TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_package_id (package_id),
    INDEX idx_primary_email (primary_email),
    INDEX idx_payment_status (payment_status),
    INDEX idx_booking_status (booking_status),
    INDEX idx_travel_date (travel_date),
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE SET NULL,
    FOREIGN KEY (package_id) REFERENCES tbl_packages(id) ON DELETE CASCADE
);
```

#### 4. Enquiries Table
```sql
CREATE TABLE enquiries (
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
);
```

### Supporting Tables

#### 5. Categories Table (tbl_categories)
```sql
CREATE TABLE tbl_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(500),
    status ENUM('active', 'inactive') DEFAULT 'active',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order)
);
```

#### 6. Enquiry Analytics Table
```sql
CREATE TABLE enquiry_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type ENUM('modal_opened', 'form_started', 'form_submitted', 'form_completed') NOT NULL,
    package_name VARCHAR(255),
    destination VARCHAR(255),
    user_session VARCHAR(255),
    page_url VARCHAR(500),
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_event_type (event_type),
    INDEX idx_package_name (package_name),
    INDEX idx_destination (destination),
    INDEX idx_created_at (created_at)
);
```

#### 7. Enquiry Follow-ups Table
```sql
CREATE TABLE enquiry_follow_ups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enquiry_id INT NOT NULL,
    admin_user VARCHAR(255),
    action_type ENUM('email_sent', 'call_made', 'quote_sent', 'booking_created', 'note_added') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_enquiry_id (enquiry_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE
);
```

## 🔧 Automated Setup

### 1. Update Environment Variables
```bash
cd backend
cp .env.example .env
```

Edit `.env` file:
```env
DB_HOST=localhost
DB_USER=ft_user
DB_PASSWORD=FT_SecurePass2024!
DB_NAME=ft_travel_db
DB_PORT=3306
```

### 2. Run Setup Script
```bash
# Install dependencies first
npm install

# Run database setup
node setup-database.js
```

### 3. Verify Setup
```bash
# Check table creation
node verify-database-setup.js

# Test database connection
node -e "
const db = require('./db');
db.execute('SELECT COUNT(*) as count FROM tbl_packages')
  .then(([rows]) => console.log('Packages:', rows[0].count))
  .catch(console.error);
"
```

## 📝 Sample Data

### Insert Sample Packages
```sql
INSERT INTO tbl_packages (p_name, p_slug, p_description, p_price, p_duration, p_category, p_destination, p_image) VALUES
('Taiwan Odyssey: 8 Days of Nature, Culture & Modern Marvel', 'taiwan-odyssey-8-days', 'Experience the best of Taiwan with this comprehensive 8-day tour covering natural wonders, cultural sites, and modern attractions.', 4299.00, 8, 'Asia', 'Taiwan', '/images/packages/taiwan-odyssey.jpg'),
('9-Day China Ice & Snow Tour', 'china-ice-snow-tour-9-days', 'Discover the winter wonderland of China with visits to ice festivals, snow sculptures, and winter landscapes.', 4900.00, 9, 'Asia', 'China', '/images/packages/china-winter.jpg'),
('Sapa and Ha Long Bay Exploration', 'sapa-halong-bay-exploration', 'Explore the stunning landscapes of Northern Vietnam including the terraced fields of Sapa and the limestone karsts of Ha Long Bay.', 4495.00, 8, 'Southeast Asia', 'Vietnam', '/images/packages/vietnam-sapa.jpg');
```

### Insert Sample Categories
```sql
INSERT INTO tbl_categories (name, slug, description, status, sort_order) VALUES
('Asia Packages', 'asia', 'Discover the diverse cultures and landscapes of Asia', 'active', 1),
('Africa Packages', 'africa', 'Experience the wildlife and natural beauty of Africa', 'active', 2),
('Europe Packages', 'europe', 'Explore the rich history and culture of Europe', 'active', 3),
('Adventure Tours', 'adventure', 'Thrilling adventure packages for the adventurous spirit', 'active', 4),
('Group Tours', 'group-tours', 'Special packages designed for group travel', 'active', 5);
```

### Insert Sample Users
```sql
INSERT INTO tbl_users (name, email, password, phone) VALUES
('John Doe', 'john@example.com', '$2b$10$hashed_password_here', '+65 1234 5678'),
('Sarah Smith', 'sarah@example.com', '$2b$10$hashed_password_here', '+65 9876 5432'),
('Mike Johnson', 'mike@example.com', '$2b$10$hashed_password_here', '+65 5555 1234');
```

## 🔍 Database Maintenance

### Regular Maintenance Tasks

#### 1. Backup Database
```bash
# Create backup
mysqldump -u ft_user -p ft_travel_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
mysql -u ft_user -p ft_travel_db < backup_20241015_143000.sql
```

#### 2. Optimize Tables
```sql
-- Analyze tables
ANALYZE TABLE tbl_packages, tbl_booking, enquiries;

-- Optimize tables
OPTIMIZE TABLE tbl_packages, tbl_booking, enquiries;

-- Check table status
SHOW TABLE STATUS LIKE 'tbl_%';
```

#### 3. Monitor Performance
```sql
-- Check slow queries
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';

-- View process list
SHOW PROCESSLIST;

-- Check table sizes
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES 
WHERE table_schema = 'ft_travel_db'
ORDER BY (data_length + index_length) DESC;
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check MySQL service status
sudo systemctl status mysql

# Start MySQL service
sudo systemctl start mysql

# Check port availability
netstat -tlnp | grep :3306
```

#### 2. Access Denied
```sql
-- Reset user password
ALTER USER 'ft_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;

-- Check user privileges
SHOW GRANTS FOR 'ft_user'@'localhost';
```

#### 3. Table Doesn't Exist
```bash
# Run setup script again
node setup-database.js

# Check table existence
mysql -u ft_user -p ft_travel_db -e "SHOW TABLES;"
```

#### 4. Foreign Key Constraints
```sql
-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Your operations here

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
```

### Performance Issues

#### 1. Slow Queries
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Check slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

#### 2. Index Optimization
```sql
-- Check index usage
SHOW INDEX FROM tbl_packages;

-- Analyze query performance
EXPLAIN SELECT * FROM tbl_packages WHERE p_category = 'Asia';
```

## 📊 Database Monitoring

### Key Metrics to Monitor

1. **Connection Count**
2. **Query Performance**
3. **Table Sizes**
4. **Index Efficiency**
5. **Backup Status**

### Monitoring Queries
```sql
-- Active connections
SHOW STATUS LIKE 'Threads_connected';

-- Query cache hit ratio
SHOW STATUS LIKE 'Qcache_hits';
SHOW STATUS LIKE 'Qcache_inserts';

-- Table lock status
SHOW STATUS LIKE 'Table_locks_waited';
```

## 🔐 Security Best Practices

1. **Use strong passwords** for database users
2. **Limit user privileges** to minimum required
3. **Regular security updates** for MySQL
4. **Enable SSL connections** for production
5. **Regular backups** with encryption
6. **Monitor access logs** for suspicious activity

---

**✅ Your database is now ready for the FT Travel Booking System!**
