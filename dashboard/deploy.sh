#!/bin/bash

##############################################################################
# Trading Dashboard - Initial Deployment Script for Hostinger VPS
##############################################################################
#
# This script automates the initial deployment of the trading dashboard
# on your Hostinger VPS alongside n8n.
#
# Prerequisites:
# - Node.js 18+ installed
# - PM2 installed globally
# - nginx installed
# - PostgreSQL running
# - Git installed
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
#
##############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/var/www/trading-dashboard"
BACKEND_DIR="$DEPLOY_DIR/backend"
FRONTEND_DIR="$DEPLOY_DIR/frontend"
NGINX_CONFIG="/etc/nginx/sites-available/trading-dashboard"
PM2_APP_NAME="trading-dashboard-api"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Trading Dashboard - Initial Deployment${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   echo -e "${YELLOW}Warning: Running as root. Some commands may need adjustment.${NC}"
fi

# Step 1: Check prerequisites
echo -e "${GREEN}[1/10] Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js version must be 18 or higher (current: $(node -v))${NC}"
    exit 1
fi
echo -e "  ✓ Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi
echo -e "  ✓ npm $(npm -v)"

# Check PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Warning: PM2 is not installed. Installing now...${NC}"
    sudo npm install -g pm2
fi
echo -e "  ✓ PM2 $(pm2 -v)"

# Check nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Warning: nginx is not installed. Installing now...${NC}"
    sudo apt-get update
    sudo apt-get install -y nginx
fi
echo -e "  ✓ nginx $(nginx -v 2>&1 | grep -oP 'nginx/\K[0-9.]+')"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL is not installed${NC}"
    exit 1
fi
echo -e "  ✓ PostgreSQL installed"

echo ""

# Step 2: Create deployment directory
echo -e "${GREEN}[2/10] Creating deployment directory...${NC}"
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}Warning: Directory $DEPLOY_DIR already exists${NC}"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    sudo mkdir -p "$DEPLOY_DIR"
fi
sudo chown -R $USER:$USER "$DEPLOY_DIR"
echo -e "  ✓ Directory created: $DEPLOY_DIR"
echo ""

# Step 3: Copy files
echo -e "${GREEN}[3/10] Copying dashboard files...${NC}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cp -r "$SCRIPT_DIR/backend" "$DEPLOY_DIR/"
cp -r "$SCRIPT_DIR/frontend" "$DEPLOY_DIR/"
echo -e "  ✓ Files copied successfully"
echo ""

# Step 4: Configure backend environment
echo -e "${GREEN}[4/10] Configuring backend environment...${NC}"
if [ ! -f "$BACKEND_DIR/.env" ]; then
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        echo -e "${YELLOW}⚠ Created .env from .env.example${NC}"
        echo -e "${YELLOW}⚠ Please edit $BACKEND_DIR/.env with your configuration:${NC}"
        echo -e "  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD"
        echo -e "  - FRONTEND_URL"
        read -p "Press Enter to edit .env file now..." -r
        ${EDITOR:-nano} "$BACKEND_DIR/.env"
    else
        echo -e "${RED}Error: .env.example not found in backend directory${NC}"
        exit 1
    fi
else
    echo -e "  ✓ Backend .env already exists"
fi
echo ""

# Step 5: Install backend dependencies
echo -e "${GREEN}[5/10] Installing backend dependencies...${NC}"
cd "$BACKEND_DIR"
npm install --production
echo -e "  ✓ Backend dependencies installed"
echo ""

# Step 6: Build backend
echo -e "${GREEN}[6/10] Building backend...${NC}"
npm run build
echo -e "  ✓ Backend built successfully"
echo ""

# Step 7: Install frontend dependencies and build
echo -e "${GREEN}[7/10] Installing frontend dependencies...${NC}"
cd "$FRONTEND_DIR"
npm install
echo -e "  ✓ Frontend dependencies installed"
echo ""

echo -e "${GREEN}[7.5/10] Building frontend...${NC}"
# Set API URL
read -p "Enter your domain (e.g., dashboard.yourdomain.com): " DOMAIN
echo "VITE_API_URL=https://$DOMAIN/api" > "$FRONTEND_DIR/.env"
npm run build
echo -e "  ✓ Frontend built successfully"
echo ""

# Step 8: Setup PM2
echo -e "${GREEN}[8/10] Setting up PM2 for backend...${NC}"
cd "$BACKEND_DIR"

# Stop if already running
pm2 delete "$PM2_APP_NAME" 2>/dev/null || true

# Start with PM2
pm2 start dist/server.js --name "$PM2_APP_NAME"

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
echo -e "${YELLOW}Setting up PM2 to start on boot...${NC}"
pm2 startup || echo -e "${YELLOW}Please run the command shown above to enable PM2 startup${NC}"

echo -e "  ✓ Backend started with PM2"
pm2 status
echo ""

# Step 9: Configure nginx
echo -e "${GREEN}[9/10] Configuring nginx...${NC}"

# Create nginx config from template
cat > /tmp/trading-dashboard-nginx.conf <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend - Serve React build
    root $FRONTEND_DIR/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # React Router - Send all requests to index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/trading-dashboard-access.log;
    error_log /var/log/nginx/trading-dashboard-error.log;
}
EOF

# Copy to nginx sites-available
sudo cp /tmp/trading-dashboard-nginx.conf "$NGINX_CONFIG"
rm /tmp/trading-dashboard-nginx.conf

# Enable site
sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/trading-dashboard

# Test nginx configuration
echo -e "${YELLOW}Testing nginx configuration...${NC}"
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

echo -e "  ✓ nginx configured and reloaded"
echo ""

# Step 10: Setup SSL
echo -e "${GREEN}[10/10] Setting up SSL with Let's Encrypt...${NC}"
echo -e "${YELLOW}Make sure DNS is configured first!${NC}"
echo -e "${YELLOW}Add an A record for $DOMAIN pointing to your VPS IP${NC}"
echo ""

read -p "Is your DNS configured and propagated? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v certbot &> /dev/null; then
        sudo certbot --nginx -d "$DOMAIN"
        echo -e "  ✓ SSL certificate installed"
    else
        echo -e "${YELLOW}Certbot not installed. Installing...${NC}"
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
        sudo certbot --nginx -d "$DOMAIN"
        echo -e "  ✓ SSL certificate installed"
    fi

    # Update backend .env with HTTPS URL
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|g" "$BACKEND_DIR/.env"
    pm2 restart "$PM2_APP_NAME"
else
    echo -e "${YELLOW}Skipping SSL setup. You can run this later:${NC}"
    echo -e "  sudo certbot --nginx -d $DOMAIN"
fi
echo ""

# Final checks
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

echo -e "${GREEN}Backend API Status:${NC}"
pm2 status "$PM2_APP_NAME"
echo ""

echo -e "${GREEN}Test Commands:${NC}"
echo -e "  Backend API health: ${BLUE}curl http://localhost:3001/api/health${NC}"
echo -e "  Frontend: ${BLUE}https://$DOMAIN${NC}"
echo ""

echo -e "${GREEN}Management Commands:${NC}"
echo -e "  View backend logs: ${BLUE}pm2 logs $PM2_APP_NAME${NC}"
echo -e "  Restart backend: ${BLUE}pm2 restart $PM2_APP_NAME${NC}"
echo -e "  View nginx logs: ${BLUE}sudo tail -f /var/log/nginx/trading-dashboard-error.log${NC}"
echo -e "  Reload nginx: ${BLUE}sudo systemctl reload nginx${NC}"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Verify dashboard is accessible at: https://$DOMAIN"
echo -e "2. Check backend API: curl https://$DOMAIN/api/health"
echo -e "3. Monitor logs: pm2 logs $PM2_APP_NAME"
echo -e "4. Import n8n workflows (workflow-1-analysis.json, workflow-2-outcome-updater.json)"
echo ""

echo -e "${GREEN}Happy trading! 📊${NC}"
