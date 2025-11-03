-- Create enquiries table for tracking all enquiry submissions
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
);

-- Create enquiry_analytics table for tracking user interactions
CREATE TABLE IF NOT EXISTS enquiry_analytics (
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

-- Create enquiry_follow_ups table for tracking admin actions
CREATE TABLE IF NOT EXISTS enquiry_follow_ups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enquiry_id INT NOT NULL,
  admin_user VARCHAR(255),
  action_type ENUM('email_sent', 'call_made', 'quote_sent', 'booking_created', 'note_added') NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE,
  INDEX idx_enquiry_id (enquiry_id),
  INDEX idx_action_type (action_type),
  INDEX idx_created_at (created_at)
);

-- Insert sample data for testing
INSERT INTO enquiries (name, email, phone, package_name, destination, travel_dates, pax, message, status) VALUES
('John Doe', 'john@example.com', '+65 1234 5678', 'Asia Travel Packages', 'Asia', 'March 2024', '2 Adults', 'Interested in Taiwan and China packages', 'new'),
('Sarah Smith', 'sarah@example.com', '+65 9876 5432', 'Africa Safari Packages', 'Africa', 'June 2024', '4 Adults', 'Looking for family safari experience', 'contacted'),
('Mike Johnson', 'mike@example.com', '+65 5555 1234', 'China Travel Packages', 'China', 'April 2024', '2 Adults, 1 Child', 'Want to see Great Wall and modern cities', 'quoted');
