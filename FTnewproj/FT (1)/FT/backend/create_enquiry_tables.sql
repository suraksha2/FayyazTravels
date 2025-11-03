-- Create missing tables for complete booking, pre-booking, and subscription functionality

-- General enquiries table (for pre-booking)
CREATE TABLE IF NOT EXISTS tbl_enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    travel_dates VARCHAR(255),
    pax INT,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Corporate enquiries table (for corporate pre-booking)
CREATE TABLE IF NOT EXISTS tbl_corporate_enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    employees_count INT,
    travel_dates VARCHAR(255),
    pax INT,
    budget DECIMAL(10,2),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table (for newsletter)
CREATE TABLE IF NOT EXISTS tbl_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Show all created tables to verify
SHOW TABLES LIKE '%enquir%';
SHOW TABLES LIKE '%subscription%';
