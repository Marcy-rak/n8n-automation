# Hostinger VPS Deployment Guide

Complete guide to deploy the Trading Dashboard on your Hostinger VPS alongside n8n.

## 🎯 Overview

This guide will help you deploy both the **backend API** and **frontend dashboard** on your Hostinger VPS that already hosts n8n.

**What you'll set up:**
- Backend API running on port 3001 (managed by PM2)
- Frontend served by nginx
- Access via subdomain: `dashboard.yourdomain.com`
- HTTPS with Let's Encrypt SSL
- Auto-restart on server reboot

## 📋 Prerequisites

### What You Already Have (on Hostinger VPS)
- ✅ n8n running
- ✅ PostgreSQL database (same one n8n might use)
- ✅ Domain name configured
- ✅ SSH access to VPS

### What You Need to Install
- Node.js 18+ (if not already installed)
- PM2 (process manager)
- nginx (if not already installed)

---

## 🚀 Step-by-Step Deployment

### Step 1: Connect to Your VPS

```bash
# SSH into your Hostinger VPS
ssh root@your-vps-ip
# Or with your username
ssh username@your-vps-ip
```

### Step 2: Check Node.js Version

```bash
# Check if Node.js is installed
node --version

# Should be v18 or higher
# If not installed or old version:
```

**Install Node.js 18:**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 3: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Step 4: Create Dashboard Directory

```bash
# Navigate to your apps directory (adjust path as needed)
cd /var/www  # or /home/username/apps

# Create dashboard directory
sudo mkdir -p trading-dashboard
cd trading-dashboard

# Set ownership (replace 'username' with your user)
sudo chown -R $USER:$USER /var/www/trading-dashboard
```

### Step 5: Upload Dashboard Files

**Option A: Using Git (Recommended)**

```bash
# Clone your repository
git clone https://github.com/yourusername/n8n-automation.git temp
cd temp

# Copy dashboard files
cp -r dashboard/* /var/www/trading-dashboard/
cd /var/www/trading-dashboard

# Clean up
rm -rf /var/www/trading-dashboard/temp
```

**Option B: Using SCP (from your local machine)**

```bash
# From your local machine, upload dashboard folder
scp -r dashboard/ username@your-vps-ip:/var/www/trading-dashboard/
```

**Option C: Using FTP/SFTP**
- Use FileZilla or similar
- Upload `dashboard/backend` and `dashboard/frontend` folders

### Step 6: Deploy Backend API

```bash
cd /var/www/trading-dashboard/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
```

**Backend .env configuration:**
```bash
# Database (same as n8n uses)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trading_workflow
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Server
PORT=3001
NODE_ENV=production

# Frontend URL (will be your subdomain)
FRONTEND_URL=https://dashboard.yourdomain.com
```

**Build and test backend:**
```bash
# Build TypeScript
npm run build

# Test run
npm start

# Should see: 🚀 Dashboard API running on port 3001
# Press Ctrl+C to stop
```

**Start with PM2:**
```bash
# Start backend with PM2
pm2 start dist/server.js --name trading-dashboard-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# You'll see a command like:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u username --hp /home/username
# Copy and run that command

# Verify it's running
pm2 status
pm2 logs trading-dashboard-api
```

**Test backend API:**
```bash
curl http://localhost:3001/api/health

# Should return: {"status":"ok","database":"connected"}
```

### Step 7: Deploy Frontend

```bash
cd /var/www/trading-dashboard/frontend

# Install dependencies
npm install

# Create production .env
echo "VITE_API_URL=https://dashboard.yourdomain.com/api" > .env

# Build for production
npm run build

# Built files are now in 'dist/' folder
ls -la dist/
```

### Step 8: Configure nginx

**Check if nginx is installed:**
```bash
nginx -v

# If not installed:
sudo apt-get update
sudo apt-get install nginx
```

**Create nginx configuration:**
```bash
sudo nano /etc/nginx/sites-available/trading-dashboard
```

**Paste this configuration:**
```nginx
# Trading Dashboard - nginx configuration
server {
    listen 80;
    server_name dashboard.yourdomain.com;  # Change to your domain

    # Frontend - Serve React build
    root /var/www/trading-dashboard/frontend/dist;
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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # React Router - Send all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
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
```

**Enable the site:**
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/trading-dashboard /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Should say: syntax is ok, test is successful

# Reload nginx
sudo systemctl reload nginx
```

### Step 9: Configure DNS (Hostinger Control Panel)

1. **Log in to Hostinger Control Panel**
2. **Go to DNS Zone Editor**
3. **Add A Record:**
   - Type: `A`
   - Name: `dashboard` (for dashboard.yourdomain.com)
   - Points to: `Your VPS IP`
   - TTL: `14400`

4. **Wait 5-10 minutes** for DNS propagation

5. **Test DNS:**
```bash
# From your VPS
nslookup dashboard.yourdomain.com

# Should return your VPS IP
```

### Step 10: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d dashboard.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Certbot will automatically:
# - Get SSL certificate
# - Update nginx config
# - Setup auto-renewal
```

**Test SSL renewal:**
```bash
sudo certbot renew --dry-run
```

### Step 11: Update Backend .env with HTTPS

```bash
nano /var/www/trading-dashboard/backend/.env
```

**Change FRONTEND_URL to HTTPS:**
```bash
FRONTEND_URL=https://dashboard.yourdomain.com
```

**Restart backend:**
```bash
pm2 restart trading-dashboard-api
```

### Step 12: Final Verification

**Test backend API:**
```bash
curl https://dashboard.yourdomain.com/api/health
```

**Test frontend in browser:**
```
https://dashboard.yourdomain.com
```

You should see the dashboard loading!

---

## 🔄 Managing the Dashboard

### PM2 Commands (Backend)

```bash
# View status
pm2 status

# View logs
pm2 logs trading-dashboard-api

# Restart backend
pm2 restart trading-dashboard-api

# Stop backend
pm2 stop trading-dashboard-api

# Start backend
pm2 start trading-dashboard-api

# Monitor (live view)
pm2 monit
```

### nginx Commands (Frontend)

```bash
# Test configuration
sudo nginx -t

# Reload (after config changes)
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/trading-dashboard-access.log
sudo tail -f /var/log/nginx/trading-dashboard-error.log
```

### Update Dashboard

**Update Backend:**
```bash
cd /var/www/trading-dashboard/backend

# Pull latest code (if using git)
git pull

# Install dependencies
npm install --production

# Rebuild
npm run build

# Restart with PM2
pm2 restart trading-dashboard-api
```

**Update Frontend:**
```bash
cd /var/www/trading-dashboard/frontend

# Pull latest code
git pull

# Install dependencies
npm install

# Rebuild
npm run build

# No restart needed - nginx serves static files
```

---

## 🔥 Firewall Configuration

If you have a firewall (UFW), allow necessary ports:

```bash
# Check firewall status
sudo ufw status

# If active, allow these ports
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH (if not already allowed)

# Port 3001 should NOT be exposed (backend accessed via nginx proxy)
```

---

## 📊 Monitoring & Logs

### Backend Logs (PM2)

```bash
# Real-time logs
pm2 logs trading-dashboard-api --lines 100

# Save logs to file
pm2 logs trading-dashboard-api > backend-logs.txt
```

### Frontend Logs (nginx)

```bash
# Access logs
sudo tail -f /var/log/nginx/trading-dashboard-access.log

# Error logs
sudo tail -f /var/log/nginx/trading-dashboard-error.log
```

### Database Connection

```bash
# Test PostgreSQL connection
psql -U postgres -d trading_workflow -c "SELECT COUNT(*) FROM trade_ideas;"
```

---

## 🐛 Troubleshooting

### Dashboard not loading

**Check nginx:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

**Check DNS:**
```bash
nslookup dashboard.yourdomain.com
```

### API not responding

**Check PM2:**
```bash
pm2 status
pm2 logs trading-dashboard-api --lines 50
```

**Check if port 3001 is listening:**
```bash
sudo netstat -tulpn | grep 3001
# or
sudo ss -tulpn | grep 3001
```

### Database connection failed

**Check PostgreSQL:**
```bash
sudo systemctl status postgresql

# Test connection
psql -U postgres -d trading_workflow
```

**Check credentials in backend .env:**
```bash
cat /var/www/trading-dashboard/backend/.env
```

### CORS errors

**Update backend .env:**
```bash
FRONTEND_URL=https://dashboard.yourdomain.com
```

**Restart backend:**
```bash
pm2 restart trading-dashboard-api
```

### SSL certificate issues

**Renew certificate:**
```bash
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal
```

**Check certificate expiry:**
```bash
sudo certbot certificates
```

---

## 🔐 Security Best Practices

1. **Keep packages updated:**
```bash
sudo apt-get update
sudo apt-get upgrade
npm audit fix
```

2. **Secure PostgreSQL:**
```bash
# Don't expose port 5432 to internet
# Only allow local connections
```

3. **Use strong passwords:**
- Database password
- SSH keys instead of passwords

4. **Regular backups:**
```bash
# Backup database
pg_dump -U postgres trading_workflow > backup_$(date +%Y%m%d).sql

# Backup dashboard files
tar -czf dashboard-backup-$(date +%Y%m%d).tar.gz /var/www/trading-dashboard
```

5. **Monitor logs:**
```bash
# Setup log rotation if needed
sudo nano /etc/logrotate.d/trading-dashboard
```

---

## 📈 Performance Optimization

### Enable nginx caching

Add to nginx config:
```nginx
# Cache zone
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

# In location /api block:
proxy_cache api_cache;
proxy_cache_valid 200 1m;
proxy_cache_use_stale error timeout http_500 http_502 http_503;
```

### PM2 Cluster Mode

For better performance on multi-core VPS:
```bash
pm2 delete trading-dashboard-api
pm2 start dist/server.js --name trading-dashboard-api -i 2
pm2 save
```

---

## 🚀 Quick Commands Summary

```bash
# Start dashboard
pm2 start trading-dashboard-api
sudo systemctl start nginx

# Stop dashboard
pm2 stop trading-dashboard-api

# Restart dashboard
pm2 restart trading-dashboard-api
sudo systemctl reload nginx

# View logs
pm2 logs trading-dashboard-api
sudo tail -f /var/log/nginx/trading-dashboard-error.log

# Update dashboard
cd /var/www/trading-dashboard/backend && git pull && npm run build && pm2 restart trading-dashboard-api
cd /var/www/trading-dashboard/frontend && git pull && npm run build
```

---

## ✅ Checklist

- [ ] Node.js 18+ installed
- [ ] PM2 installed
- [ ] Dashboard files uploaded
- [ ] Backend .env configured
- [ ] Backend built and running (PM2)
- [ ] Frontend built
- [ ] nginx installed and configured
- [ ] DNS A record added
- [ ] SSL certificate installed
- [ ] Dashboard accessible via HTTPS
- [ ] PM2 auto-startup enabled

---

## 🆘 Need Help?

**Common Issues:**
1. **Port 3001 already in use**: Check what's using it: `sudo lsof -i :3001`
2. **Permission denied**: Run with sudo or fix ownership: `sudo chown -R $USER:$USER /var/www/trading-dashboard`
3. **npm install fails**: Clear cache: `npm cache clean --force`
4. **Database connection error**: Verify PostgreSQL is running and credentials are correct

**Still stuck?**
- Check PM2 logs: `pm2 logs trading-dashboard-api --lines 200`
- Check nginx error log: `sudo tail -f /var/log/nginx/error.log`
- Test API directly: `curl http://localhost:3001/api/health`

---

**Your dashboard is now live at: `https://dashboard.yourdomain.com`** 🎉
