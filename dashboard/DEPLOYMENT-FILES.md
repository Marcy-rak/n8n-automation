# Deployment Files Overview

This directory contains several deployment configurations and scripts for deploying the Trading Dashboard to production environments.

## 📁 Files

### Deployment Scripts

#### `deploy.sh`
**Purpose:** Initial deployment automation script for Hostinger VPS

**What it does:**
- Checks prerequisites (Node.js 18+, PM2, nginx, PostgreSQL)
- Creates deployment directory structure
- Copies and configures backend and frontend
- Installs dependencies and builds both applications
- Configures and starts backend with PM2
- Configures nginx with SSL support
- Sets up Let's Encrypt SSL certificate

**Usage:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Prerequisites:**
- SSH access to VPS
- Node.js 18+ installed
- PostgreSQL database created
- Domain name with DNS configured

---

#### `update.sh`
**Purpose:** Update script for existing deployments

**What it does:**
- Allows selective updates (backend only, frontend only, or both)
- Pulls latest code from git (if applicable)
- Backs up environment files before updating
- Rebuilds and restarts services
- Shows logs and status after update

**Usage:**
```bash
chmod +x update.sh
./update.sh
```

Choose from menu:
1. Backend only
2. Frontend only
3. Both

---

### Configuration Files

#### `vps-nginx.conf`
**Purpose:** Production nginx configuration for VPS deployment

**Features:**
- HTTP to HTTPS redirect
- SSL/TLS configuration (ready for Let's Encrypt)
- Gzip and Brotli compression
- Rate limiting for API and general requests
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Static asset caching (1 year)
- API proxy to backend (port 3001)
- React Router support (SPA routing)
- Custom error pages
- Logging configuration

**Installation:**
```bash
sudo cp vps-nginx.conf /etc/nginx/sites-available/trading-dashboard
sudo ln -s /etc/nginx/sites-available/trading-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Customize:**
- Replace `dashboard.yourdomain.com` with your domain
- Adjust `/var/www/trading-dashboard` path if needed
- Modify rate limits based on your needs
- Adjust CSP (Content Security Policy) for your requirements

---

#### `nginx.conf` (frontend/)
**Purpose:** Docker nginx configuration (for containerized deployment)

**Differences from vps-nginx.conf:**
- Simpler configuration for Docker environment
- Uses `backend:3001` hostname (Docker service name)
- No SSL configuration (handled by reverse proxy)
- No rate limiting
- Basic caching only

**Usage:**
This is automatically used when running:
```bash
docker-compose up -d
```

---

### Documentation

#### `VPS-COMMANDS.md`
**Purpose:** Quick reference guide for managing dashboard on VPS

**Sections:**
- Initial deployment commands
- Backend management (PM2)
- nginx management
- SSL certificate management
- Database management
- Debugging and troubleshooting
- Manual rebuild procedures
- Cleanup and maintenance
- Emergency commands
- Automated maintenance (cron jobs)

**Usage:**
Keep this file open as a reference when managing your VPS deployment.

---

## 🚀 Deployment Workflows

### First Time Deployment

```bash
# 1. Clone repository on VPS
git clone https://github.com/yourusername/n8n-automation.git
cd n8n-automation/dashboard

# 2. Run deploy script
chmod +x deploy.sh
./deploy.sh

# 3. Follow prompts:
#    - Configure .env files
#    - Enter domain name
#    - Confirm DNS configuration
#    - Setup SSL certificate

# 4. Verify deployment
curl https://dashboard.yourdomain.com/api/health
```

### Updating Existing Deployment

```bash
# 1. Navigate to project
cd /path/to/n8n-automation

# 2. Pull latest changes
git pull

# 3. Run update script
cd dashboard
./update.sh

# 4. Choose what to update (backend/frontend/both)

# 5. Verify update
pm2 status
curl http://localhost:3001/api/health
```

### Using Docker (Development/Testing)

```bash
# From dashboard directory
docker-compose up -d

# Access at:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## 🔧 Configuration Comparison

| Feature | Docker (`nginx.conf`) | VPS (`vps-nginx.conf`) |
|---------|----------------------|------------------------|
| Environment | Docker container | VPS production |
| SSL | Via reverse proxy | Let's Encrypt |
| Backend URL | `http://backend:3001` | `http://localhost:3001` |
| Rate Limiting | No | Yes |
| Security Headers | Basic | Comprehensive |
| Caching | Basic | Advanced |
| Compression | Gzip | Gzip + Brotli |
| Error Pages | Default | Custom |
| Logging | Basic | Detailed |

## 📋 Deployment Checklist

### Pre-deployment
- [ ] VPS with Ubuntu/Debian
- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] Database schema initialized (`schema.sql`)
- [ ] Domain name purchased
- [ ] DNS A record configured
- [ ] SSH access configured

### Deployment
- [ ] Run `deploy.sh`
- [ ] Configure `.env` files
- [ ] Backend starts successfully (PM2)
- [ ] Frontend builds successfully
- [ ] nginx configuration valid
- [ ] SSL certificate installed
- [ ] Dashboard accessible via domain

### Post-deployment
- [ ] Test API endpoints
- [ ] Verify database connection
- [ ] Check PM2 auto-startup
- [ ] Setup monitoring
- [ ] Configure backups (cron)
- [ ] Import n8n workflows
- [ ] Test workflow execution

## 🔐 Security Notes

### Environment Files
**Never commit these files:**
- `backend/.env` (contains database credentials)
- `frontend/.env` (contains API URLs)

Always use `.env.example` as template.

### nginx Security
The `vps-nginx.conf` includes:
- HSTS headers (force HTTPS)
- CSP (Content Security Policy)
- X-Frame-Options (prevent clickjacking)
- X-Content-Type-Options (prevent MIME sniffing)
- Rate limiting (prevent DoS)
- Hidden file protection

### Database Security
- Use strong PostgreSQL password
- Don't expose port 5432 to internet
- Regular backups (see `VPS-COMMANDS.md`)
- Use read-only user if possible

### SSL/TLS
- Auto-renewal configured via Certbot
- TLS 1.2 and 1.3 only
- Modern cipher suites
- OCSP stapling enabled

## 🆘 Troubleshooting

### deploy.sh fails
```bash
# Check prerequisites
node --version  # Should be 18+
pm2 --version
nginx -v
psql --version

# Check permissions
ls -la /var/www/
```

### nginx configuration error
```bash
# Test configuration
sudo nginx -t

# Check syntax errors
sudo nginx -T | less
```

### Backend won't start
```bash
# Check PM2 logs
pm2 logs trading-dashboard-api

# Check if port 3001 is available
sudo lsof -i :3001

# Test backend manually
cd /var/www/trading-dashboard/backend
npm start
```

### SSL certificate fails
```bash
# Check DNS propagation
nslookup dashboard.yourdomain.com

# Test with dry-run
sudo certbot certonly --nginx --dry-run -d dashboard.yourdomain.com

# Check firewall
sudo ufw status
```

## 📚 Additional Resources

- **Full Deployment Guide:** `HOSTINGER-VPS-DEPLOYMENT.md`
- **Dashboard Quick Start:** `DASHBOARD-QUICKSTART.md`
- **Main README:** `README.md`
- **Two Workflows Guide:** `../TWO-WORKFLOWS-GUIDE.md`
- **n8n Quick Start:** `../N8N-QUICKSTART.md`

## 💡 Tips

1. **Always test nginx config** before reloading:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

2. **Monitor logs during deployment:**
   ```bash
   pm2 logs trading-dashboard-api --lines 50
   ```

3. **Keep backups** before major updates:
   ```bash
   pg_dump -U postgres trading_workflow > backup_before_update.sql
   ```

4. **Use PM2 monitoring:**
   ```bash
   pm2 monit
   ```

5. **Setup automated backups** (see VPS-COMMANDS.md for cron examples)

---

**For questions or issues, refer to `HOSTINGER-VPS-DEPLOYMENT.md` troubleshooting section.**
