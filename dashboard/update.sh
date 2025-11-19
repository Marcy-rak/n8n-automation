#!/bin/bash

##############################################################################
# Trading Dashboard - Update Script for Hostinger VPS
##############################################################################
#
# This script automates updating the trading dashboard on your VPS.
# Use this when you pull new code changes from git.
#
# Usage:
#   chmod +x update.sh
#   ./update.sh
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
PM2_APP_NAME="trading-dashboard-api"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Trading Dashboard - Update${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if deployment exists
if [ ! -d "$DEPLOY_DIR" ]; then
    echo -e "${RED}Error: Dashboard not deployed yet${NC}"
    echo -e "Run ${BLUE}./deploy.sh${NC} first"
    exit 1
fi

# Ask what to update
echo -e "${YELLOW}What do you want to update?${NC}"
echo "1) Backend only"
echo "2) Frontend only"
echo "3) Both backend and frontend"
read -p "Enter choice (1-3): " CHOICE
echo ""

UPDATE_BACKEND=false
UPDATE_FRONTEND=false

case $CHOICE in
    1)
        UPDATE_BACKEND=true
        ;;
    2)
        UPDATE_FRONTEND=true
        ;;
    3)
        UPDATE_BACKEND=true
        UPDATE_FRONTEND=true
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Update Backend
if [ "$UPDATE_BACKEND" = true ]; then
    echo -e "${GREEN}[1] Updating Backend...${NC}"

    cd "$BACKEND_DIR"

    # Backup current .env
    echo -e "  - Backing up .env file..."
    cp .env .env.backup

    # Pull latest code (if using git)
    if [ -d ".git" ]; then
        echo -e "  - Pulling latest code..."
        git pull
    fi

    # Install dependencies
    echo -e "  - Installing dependencies..."
    npm install --production

    # Rebuild
    echo -e "  - Building TypeScript..."
    npm run build

    # Restore .env
    echo -e "  - Restoring .env..."
    cp .env.backup .env

    # Restart with PM2
    echo -e "  - Restarting backend with PM2..."
    pm2 restart "$PM2_APP_NAME"

    # Save PM2 config
    pm2 save

    echo -e "${GREEN}  ✓ Backend updated successfully${NC}"
    echo ""

    # Show logs
    echo -e "${YELLOW}Backend logs (Ctrl+C to exit):${NC}"
    pm2 logs "$PM2_APP_NAME" --lines 20 --nostream
    echo ""
fi

# Update Frontend
if [ "$UPDATE_FRONTEND" = true ]; then
    echo -e "${GREEN}[2] Updating Frontend...${NC}"

    cd "$FRONTEND_DIR"

    # Backup current .env
    echo -e "  - Backing up .env file..."
    if [ -f .env ]; then
        cp .env .env.backup
    fi

    # Pull latest code (if using git)
    if [ -d ".git" ]; then
        echo -e "  - Pulling latest code..."
        git pull
    fi

    # Install dependencies
    echo -e "  - Installing dependencies..."
    npm install

    # Restore .env
    if [ -f .env.backup ]; then
        echo -e "  - Restoring .env..."
        cp .env.backup .env
    fi

    # Rebuild
    echo -e "  - Building React app..."
    npm run build

    # No need to restart nginx - it serves static files
    echo -e "${GREEN}  ✓ Frontend updated successfully${NC}"
    echo ""
fi

# Final status
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✓ Update Complete!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

if [ "$UPDATE_BACKEND" = true ]; then
    echo -e "${GREEN}Backend Status:${NC}"
    pm2 status "$PM2_APP_NAME"
    echo ""
fi

echo -e "${GREEN}Quick Tests:${NC}"
echo -e "  Backend API: ${BLUE}curl http://localhost:3001/api/health${NC}"
echo -e "  Dashboard: ${BLUE}Open your browser and refresh${NC}"
echo ""

echo -e "${GREEN}Useful Commands:${NC}"
echo -e "  View backend logs: ${BLUE}pm2 logs $PM2_APP_NAME${NC}"
echo -e "  Monitor backend: ${BLUE}pm2 monit${NC}"
echo -e "  Restart backend: ${BLUE}pm2 restart $PM2_APP_NAME${NC}"
echo ""

echo -e "${GREEN}Done! 🚀${NC}"
