// Real-time notification service for enquiries
const WebSocket = require('ws');

class NotificationService {
  constructor() {
    this.clients = new Set();
    this.wss = null;
  }

  // Initialize WebSocket server
  initialize(server) {
    this.wss = new WebSocket.Server({ server });
    
    this.wss.on('connection', (ws, req) => {
      console.log('📡 Admin client connected for notifications');
      this.clients.add(ws);

      ws.on('close', () => {
        console.log('📡 Admin client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to enquiry notifications',
        timestamp: new Date().toISOString()
      }));
    });
  }

  // Broadcast new enquiry to all connected admin clients
  broadcastNewEnquiry(enquiryData) {
    const notification = {
      type: 'new_enquiry',
      data: {
        id: enquiryData.id || Date.now(),
        name: enquiryData.name,
        email: enquiryData.email,
        phone: enquiryData.phone,
        package_name: enquiryData.package_name,
        destination: enquiryData.destination,
        message: enquiryData.message?.substring(0, 100) + (enquiryData.message?.length > 100 ? '...' : ''),
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    this.broadcast(notification);
  }

  // Broadcast enquiry status updates
  broadcastStatusUpdate(enquiryId, status, adminUser) {
    const notification = {
      type: 'status_update',
      data: {
        enquiry_id: enquiryId,
        status: status,
        updated_by: adminUser,
        timestamp: new Date().toISOString()
      }
    };

    this.broadcast(notification);
  }

  // Send notification to specific client
  sendToClient(clientId, notification) {
    // Implementation for targeted notifications
    this.broadcast(notification);
  }

  // Broadcast to all connected clients
  broadcast(notification) {
    const message = JSON.stringify(notification);
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('Error sending notification:', error);
          this.clients.delete(client);
        }
      } else {
        this.clients.delete(client);
      }
    });

    console.log(`📢 Broadcasted ${notification.type} to ${this.clients.size} clients`);
  }

  // Get connected clients count
  getConnectedClientsCount() {
    return this.clients.size;
  }
}

// Singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;
