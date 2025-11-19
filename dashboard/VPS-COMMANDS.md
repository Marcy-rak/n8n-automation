# VPS Management Commands - Quick Reference

Quick reference for managing your Trading Dashboard on Hostinger VPS.

## 🚀 Initial Deployment

```bash
# Clone repository
git clone https://github.com/yourusername/n8n-automation.git
cd n8n-automation/dashboard

# Make scripts executable
chmod +x deploy.sh update.sh

# Run initial deployment
./deploy.sh
```

## 🔄 Update Dashboard

```bash
# Navigate to dashboard directory
cd /var/www/trading-dashboard

# Pull latest changes
git pull

# Run update script
cd /path/to/n8n-automation/dashboard
./update.sh
```

## 📊 Backend Management (PM2)

### Status & Monitoring
```bash
# View status
pm2 status

# View logs (real-time)
pm2 logs trading-dashboard-api

# View logs (last 100 lines)
pm2 logs trading-dashboard-api --lines 100

# Monitor resources
pm2 monit

# Process info
pm2 info trading-dashboard-api
```

### Control
```bash
# Restart backend
pm2 restart trading-dashboard-api

# Stop backend
pm2 stop trading-dashboard-api

# Start backend
pm2 start trading-dashboard-api

# Delete from PM2
pm2 delete trading-dashboard-api
```

### Maintenance
```bash
# Save PM2 configuration
pm2 save

# Update PM2
npm install -g pm2@latest
pm2 update

# Flush logs
pm2 flush

# Reset restart counter
pm2 reset trading-dashboard-api
```

## 🌐 nginx Management

### Control
```bash
# Test configuration
sudo nginx -t

# Reload (graceful)
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Stop
sudo systemctl stop nginx

# Start
sudo systemctl start nginx

# Status
sudo systemctl status nginx
```

### Logs
```bash
# Access logs (real-time)
sudo tail -f /var/log/nginx/trading-dashboard-access.log

# Error logs (real-time)
sudo tail -f /var/log/nginx/trading-dashboard-error.log

# Last 50 lines
sudo tail -n 50 /var/log/nginx/trading-dashboard-error.log

# Search for errors
sudo grep "error" /var/log/nginx/trading-dashboard-error.log
```

### Configuration
```bash
# Edit config
sudo nano /etc/nginx/sites-available/trading-dashboard

# Test after editing
sudo nginx -t

# Apply changes
sudo systemctl reload nginx

# View current config
cat /etc/nginx/sites-available/trading-dashboard
```

## 🔐 SSL Certificate (Let's Encrypt)

### Manage Certificates
```bash
# Renew certificates (manual)
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates

# Test auto-renewal
sudo certbot renew --dry-run
```

### Certificate Info
```bash
# View certificate details
sudo openssl x509 -in /etc/letsencrypt/live/dashboard.yourdomain.com/fullchain.pem -text -noout

# Check expiry date
sudo openssl x509 -in /etc/letsencrypt/live/dashboard.yourdomain.com/cert.pem -noout -dates
```

## 🗄️ Database Management

### Connect to PostgreSQL
```bash
# Connect to database
psql -U postgres -d trading_workflow

# Run query from command line
psql -U postgres -d trading_workflow -c "SELECT COUNT(*) FROM trade_ideas;"
```

### Backup Database
```bash
# Full backup
pg_dump -U postgres trading_workflow > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -U postgres trading_workflow | gzip > backup_$(date +%Y%m%d).sql.gz

# Backup to specific location
pg_dump -U postgres trading_workflow > /var/backups/trading_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
# Restore from backup
psql -U postgres trading_workflow < backup_20250119.sql

# Restore from compressed
gunzip -c backup_20250119.sql.gz | psql -U postgres trading_workflow
```

### Database Queries
```sql
-- View recent trades
SELECT * FROM trade_ideas ORDER BY created_at DESC LIMIT 10;

-- Count total trades
SELECT COUNT(*) FROM trade_ideas;

-- Win rate
SELECT
    COUNT(*) as total,
    SUM(CASE WHEN is_win = TRUE THEN 1 ELSE 0 END) as wins,
    ROUND(AVG(CASE WHEN is_win = TRUE THEN 1.0 ELSE 0.0 END) * 100, 2) as win_rate
FROM trade_ideas WHERE is_win IS NOT NULL;

-- Performance by symbol
SELECT
    symbol,
    COUNT(*) as trades,
    SUM(CASE WHEN is_win = TRUE THEN 1 ELSE 0 END) as wins,
    SUM(CASE WHEN is_win = FALSE THEN 1 ELSE 0 END) as losses,
    ROUND(AVG(CASE WHEN is_win = TRUE THEN 1.0 ELSE 0.0 END) * 100, 2) as win_rate
FROM trade_ideas
WHERE is_win IS NOT NULL
GROUP BY symbol
ORDER BY trades DESC;
```

## 🔍 Debugging & Troubleshooting

### Check if Services are Running
```bash
# Backend API
curl http://localhost:3001/api/health

# Full API test
curl -I https://dashboard.yourdomain.com/api/health

# Check port 3001
sudo lsof -i :3001
# or
sudo ss -tulpn | grep 3001
```

### Check Disk Space
```bash
# Disk usage
df -h

# Dashboard directory size
du -sh /var/www/trading-dashboard

# Find large files
find /var/www/trading-dashboard -type f -size +10M -exec ls -lh {} \;
```

### Check Memory Usage
```bash
# Overall memory
free -h

# Process memory
pm2 ls
ps aux | grep node
```

### Network Checks
```bash
# DNS lookup
nslookup dashboard.yourdomain.com

# Test from outside
ping dashboard.yourdomain.com

# Check open ports
sudo netstat -tulpn | grep LISTEN
```

### Log Analysis
```bash
# Find errors in PM2 logs
pm2 logs trading-dashboard-api --err --lines 50

# Count errors
sudo grep -c "error" /var/log/nginx/trading-dashboard-error.log

# View access by IP
sudo awk '{print $1}' /var/log/nginx/trading-dashboard-access.log | sort | uniq -c | sort -nr | head -10
```

## 🛠️ Manual Rebuild

### Backend Only
```bash
cd /var/www/trading-dashboard/backend

# Install dependencies
npm install --production

# Build
npm run build

# Restart
pm2 restart trading-dashboard-api
```

### Frontend Only
```bash
cd /var/www/trading-dashboard/frontend

# Install dependencies
npm install

# Build
npm run build

# No restart needed - nginx serves static files
```

## 🧹 Cleanup & Maintenance

### Clear Logs
```bash
# Clear PM2 logs
pm2 flush

# Rotate nginx logs
sudo logrotate -f /etc/logrotate.d/nginx

# Clear old logs manually
sudo truncate -s 0 /var/log/nginx/trading-dashboard-access.log
sudo truncate -s 0 /var/log/nginx/trading-dashboard-error.log
```

### Clean npm Cache
```bash
# Backend
cd /var/www/trading-dashboard/backend
npm cache clean --force

# Frontend
cd /var/www/trading-dashboard/frontend
npm cache clean --force
```

### Remove Old Backups
```bash
# Delete backups older than 30 days
find /var/backups -name "trading_*.sql" -mtime +30 -delete
```

## 🔧 Environment Variables

### View Current Config
```bash
# Backend
cat /var/www/trading-dashboard/backend/.env

# Frontend
cat /var/www/trading-dashboard/frontend/.env
```

### Edit Config
```bash
# Backend
nano /var/www/trading-dashboard/backend/.env

# After editing, restart backend
pm2 restart trading-dashboard-api

# Frontend
nano /var/www/trading-dashboard/frontend/.env

# After editing, rebuild frontend
cd /var/www/trading-dashboard/frontend
npm run build
```

## 📦 System Updates

### Update Node.js
```bash
# Check current version
node --version

# Update to latest LTS (using nvm)
nvm install --lts
nvm use --lts
nvm alias default node
```

### Update System Packages
```bash
# Update package list
sudo apt-get update

# Upgrade packages
sudo apt-get upgrade

# Update nginx
sudo apt-get update
sudo apt-get install --only-upgrade nginx
```

## 🚨 Emergency Commands

### Dashboard Not Responding
```bash
# 1. Check backend
pm2 status
pm2 restart trading-dashboard-api

# 2. Check nginx
sudo nginx -t
sudo systemctl restart nginx

# 3. Check database
sudo systemctl status postgresql

# 4. Check logs
pm2 logs trading-dashboard-api --lines 50
sudo tail -f /var/log/nginx/trading-dashboard-error.log
```

### Server Running Out of Memory
```bash
# Check memory
free -h

# Restart backend with lower memory
pm2 delete trading-dashboard-api
pm2 start /var/www/trading-dashboard/backend/dist/server.js --name trading-dashboard-api --max-memory-restart 500M
pm2 save
```

### Complete Reset
```bash
# Stop everything
pm2 stop trading-dashboard-api
sudo systemctl stop nginx

# Start fresh
pm2 start trading-dashboard-api
sudo systemctl start nginx

# Verify
pm2 status
sudo systemctl status nginx
curl http://localhost:3001/api/health
```

## 📝 Automated Maintenance

### Cron Jobs

```bash
# Edit crontab
crontab -e

# Daily database backup at 2 AM
0 2 * * * pg_dump -U postgres trading_workflow | gzip > /var/backups/trading_$(date +\%Y\%m\%d).sql.gz

# Weekly log cleanup (keep last 30 days)
0 3 * * 0 find /var/backups -name "trading_*.sql.gz" -mtime +30 -delete

# Monthly SSL renewal check
0 4 1 * * sudo certbot renew --quiet

# Daily PM2 log flush
0 5 * * * pm2 flush
```

## 🔗 Quick Links

**Dashboard:** https://dashboard.yourdomain.com
**API Health:** https://dashboard.yourdomain.com/api/health

**Common Paths:**
- Deployment: `/var/www/trading-dashboard`
- Backend: `/var/www/trading-dashboard/backend`
- Frontend: `/var/www/trading-dashboard/frontend`
- nginx Config: `/etc/nginx/sites-available/trading-dashboard`
- Logs: `/var/log/nginx/`

---

**Keep this file handy for quick reference!** 📖
