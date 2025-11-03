# 🚀 Deployment Guide - FT Travel Booking System

## 📋 Overview

This guide covers deployment strategies for the FT Travel Booking System across different environments and platforms.

## 🎯 Deployment Options

### 1. Traditional Server Deployment
### 2. Docker Containerization
### 3. Cloud Platform Deployment (AWS, Google Cloud, Azure)
### 4. Serverless Deployment

## 🖥️ Traditional Server Deployment

### Prerequisites
- **Ubuntu 20.04+ / CentOS 8+ / Amazon Linux 2**
- **Node.js 16+**
- **MySQL 8.0+**
- **Nginx** (reverse proxy)
- **PM2** (process manager)
- **SSL Certificate**

### 1. Server Setup

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Install MySQL
```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

#### Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
```

#### Install PM2
```bash
sudo npm install -g pm2
```

### 2. Application Deployment

#### Clone Repository
```bash
cd /var/www
sudo git clone <repository-url> ft-travel
sudo chown -R $USER:$USER /var/www/ft-travel
cd ft-travel
```

#### Backend Setup
```bash
cd backend
npm install --production
cp .env.example .env
# Edit .env with production values
```

#### Frontend Setup
```bash
cd ../frontend
npm install
npm run build
```

#### Database Setup
```bash
cd ../backend
# Create production database
mysql -u root -p
CREATE DATABASE ft_travel_prod;
CREATE USER 'ft_prod'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON ft_travel_prod.* TO 'ft_prod'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Run setup
node setup-database.js
```

### 3. Process Management with PM2

#### Create PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'ft-backend',
      script: './backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'ft-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
```

#### Start Applications
```bash
# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup

# Monitor processes
pm2 monit
```

### 4. Nginx Configuration

#### Create Nginx Configuration
```nginx
# /etc/nginx/sites-available/ft-travel
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # API Rate Limiting
        limit_req zone=api burst=20 nodelay;
    }

    # Static Files
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Webhook endpoint
    location /webhook {
        proxy_pass http://localhost:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Rate Limiting
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
```

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/ft-travel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL Certificate Setup

#### Using Let's Encrypt (Certbot)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐳 Docker Deployment

### 1. Dockerfile for Backend
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3003/health || exit 1

# Start application
CMD ["npm", "start"]
```

### 2. Dockerfile for Frontend
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
```

### 3. Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: ft-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/database_updates.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    networks:
      - ft-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ft-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
    env_file:
      - ./backend/.env
    ports:
      - "3003:3003"
    depends_on:
      - mysql
    networks:
      - ft-network
    volumes:
      - ./backend/logs:/app/logs

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: ft-frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    env_file:
      - ./frontend/.env.local
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - ft-network

  nginx:
    image: nginx:alpine
    container_name: ft-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - ft-network

volumes:
  mysql_data:

networks:
  ft-network:
    driver: bridge
```

### 4. Docker Deployment Commands
```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Scale backend service
docker-compose up -d --scale backend=3

# Update services
docker-compose pull
docker-compose up -d --build

# Backup database
docker exec ft-mysql mysqldump -u root -p${DB_ROOT_PASSWORD} ft_travel_db > backup.sql
```

## ☁️ Cloud Platform Deployment

### AWS Deployment

#### 1. EC2 Instance Setup
```bash
# Launch EC2 instance (t3.medium or larger)
# Configure security groups:
# - HTTP (80)
# - HTTPS (443)
# - SSH (22)
# - MySQL (3306) - if using RDS

# Connect and setup
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 2. RDS Database Setup
```bash
# Create RDS MySQL instance
aws rds create-db-instance \
    --db-instance-identifier ft-travel-db \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --master-username admin \
    --master-user-password SecurePassword123 \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxxx
```

#### 3. S3 for Static Assets
```bash
# Create S3 bucket for images
aws s3 mb s3://ft-travel-assets
aws s3 sync ./frontend/public/images s3://ft-travel-assets/images
```

#### 4. CloudFront CDN Setup
```json
{
  "Origins": [
    {
      "DomainName": "ft-travel-assets.s3.amazonaws.com",
      "OriginPath": "",
      "CustomOriginConfig": {
        "HTTPPort": 80,
        "HTTPSPort": 443,
        "OriginProtocolPolicy": "https-only"
      }
    }
  ]
}
```

### Google Cloud Platform

#### 1. Compute Engine Setup
```bash
# Create VM instance
gcloud compute instances create ft-travel-vm \
    --zone=us-central1-a \
    --machine-type=e2-medium \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=20GB
```

#### 2. Cloud SQL Database
```bash
# Create Cloud SQL instance
gcloud sql instances create ft-travel-db \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=us-central1
```

### Azure Deployment

#### 1. App Service Setup
```bash
# Create resource group
az group create --name ft-travel-rg --location eastus

# Create App Service plan
az appservice plan create \
    --name ft-travel-plan \
    --resource-group ft-travel-rg \
    --sku B1 \
    --is-linux

# Create web apps
az webapp create \
    --resource-group ft-travel-rg \
    --plan ft-travel-plan \
    --name ft-travel-frontend \
    --runtime "NODE|18-lts"
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy FT Travel System

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: ft_test
        ports:
          - 3306:3306

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: |
          backend/package-lock.json
          frontend/package-lock.json
    
    - name: Install backend dependencies
      run: |
        cd backend
        npm ci
    
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Run backend tests
      run: |
        cd backend
        npm test
      env:
        DB_HOST: localhost
        DB_USER: root
        DB_PASSWORD: test
        DB_NAME: ft_test
    
    - name: Build frontend
      run: |
        cd frontend
        npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/ft-travel
          git pull origin main
          cd backend && npm ci --production
          cd ../frontend && npm ci && npm run build
          pm2 restart ecosystem.config.js
```

## 📊 Monitoring & Logging

### 1. Application Monitoring
```javascript
// backend/middleware/monitoring.js
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

module.exports = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
};
```

### 2. Log Management
```bash
# Centralized logging with ELK Stack
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  elasticsearch:7.14.0

docker run -d \
  --name kibana \
  -p 5601:5601 \
  --link elasticsearch:elasticsearch \
  kibana:7.14.0
```

### 3. Health Checks
```javascript
// backend/routes/health.js
fastify.get('/health', async (request, reply) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      email: 'unknown',
      payment: 'unknown'
    }
  };

  try {
    await db.execute('SELECT 1');
    health.services.database = 'ok';
  } catch (error) {
    health.services.database = 'error';
    health.status = 'degraded';
  }

  return health;
});
```

## 🔧 Maintenance & Updates

### 1. Automated Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/ft-travel"

# Database backup
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/ft-travel

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$DATE.sql s3://ft-travel-backups/
aws s3 cp $BACKUP_DIR/app_$DATE.tar.gz s3://ft-travel-backups/

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### 2. Zero-Downtime Deployment
```bash
#!/bin/bash
# deploy.sh
echo "Starting deployment..."

# Pull latest code
git pull origin main

# Build frontend
cd frontend
npm ci
npm run build
cd ..

# Install backend dependencies
cd backend
npm ci --production
cd ..

# Restart services with zero downtime
pm2 reload ecosystem.config.js

echo "Deployment completed successfully!"
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database setup completed
- [ ] SSL certificates installed
- [ ] DNS records configured
- [ ] Firewall rules set
- [ ] Backup strategy implemented

### Post-deployment
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Logs are being collected
- [ ] Performance metrics baseline
- [ ] Security scan completed
- [ ] Load testing performed

---

**🎉 Your FT Travel Booking System is now successfully deployed!**

For ongoing maintenance and support, refer to the monitoring dashboards and log files.
