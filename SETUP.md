# Setup Guide

Complete step-by-step setup instructions for the Automated Trading Workflow.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed
- [ ] pgvector extension available
- [ ] Grok API access (X.AI account)
- [ ] OpenAI API key
- [ ] Email SMTP credentials
- [ ] (Optional) Twilio account for WhatsApp

## Step 1: Database Setup

### Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### Install pgvector Extension

**Ubuntu/Debian:**
```bash
sudo apt install postgresql-14-pgvector
```

**macOS:**
```bash
brew install pgvector
```

**From source:**
```bash
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

### Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE trading_workflow;

# Connect to database
\c trading_workflow

# Enable pgvector
CREATE EXTENSION vector;

# Exit
\q
```

## Step 2: Project Setup

### Clone or Create Project

```bash
git clone <your-repo>
cd n8n-automation
```

### Install Dependencies

```bash
npm install
```

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
nano .env  # or use your preferred editor
```

**Required variables:**
- `DB_PASSWORD`: Your PostgreSQL password
- `GROK_API_KEY`: Get from https://x.ai/api
- `OPENAI_API_KEY`: Get from https://platform.openai.com/api-keys
- `SMTP_USER` and `SMTP_PASSWORD`: Your email credentials

### Initialize Database Schema

```bash
npm run init-db
```

Expected output:
```
✅ Database initialized successfully
📊 trade_ideas: 0 rows
📊 analysis_logs: 0 rows
📊 market_context: 0 rows
```

## Step 3: API Keys Setup

### Grok API (X.AI)

1. Visit https://x.ai/
2. Sign up or login
3. Navigate to API section
4. Generate API key
5. Add to `.env`: `GROK_API_KEY=xai-...`

### OpenAI API

1. Visit https://platform.openai.com/
2. Create account or login
3. Go to API Keys: https://platform.openai.com/api-keys
4. Create new secret key
5. Add to `.env`: `OPENAI_API_KEY=sk-...`

**Note:** You'll need credits for embeddings (~$0.0001 per 1k tokens)

## Step 4: Email Configuration

### Gmail Setup (Recommended for Testing)

1. Enable 2-Factor Authentication on your Google account
2. Generate App Password:
   - Go to https://myaccount.google.com/security
   - Select "2-Step Verification"
   - Scroll to "App passwords"
   - Select "Mail" and your device
   - Copy the 16-character password

3. Configure `.env`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=recipient@example.com
```

### Alternative SMTP Providers

**SendGrid:**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

**Mailgun:**
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

## Step 5: WhatsApp Setup (Optional)

### Using Twilio

1. Sign up at https://www.twilio.com/
2. Get phone number with WhatsApp enabled
3. Configure WhatsApp sandbox:
   - Go to Messaging > Try it out > Send a WhatsApp message
   - Follow instructions to join sandbox

4. Get credentials:
   - Account SID: https://console.twilio.com/
   - Auth Token: Same page (click to reveal)

5. Configure `.env`:
```bash
WHATSAPP_ENABLED=true
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WHATSAPP_TO=whatsapp:+1234567890
```

## Step 6: Build and Test

### Build TypeScript

```bash
npm run build
```

### Test Manual Run

```bash
npm start
```

Expected output:
```
🚀 Automated Trading Workflow - Manual Run
✅ Configuration validated
✅ Database connection test successful
=== Starting scheduled analysis ===
Analyzing EURUSD...
Analyzing GBPUSD...
Analyzing USDJPY...
=== Analysis complete ===
```

### Check Logs

```bash
tail -f logs/trading-workflow.log
```

## Step 7: Start Scheduler

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run scheduler
```

### Using Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## Step 8: Verify Everything Works

### Check Database

```bash
psql -U postgres -d trading_workflow

SELECT COUNT(*) FROM trade_ideas;
SELECT COUNT(*) FROM analysis_logs;

\q
```

### Monitor Logs

```bash
# Real-time log monitoring
tail -f logs/trading-workflow.log

# Error logs only
tail -f logs/error.log
```

### Test Notifications

Check your email and WhatsApp for trade alerts.

## Troubleshooting

### Database Connection Fails

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start if stopped
sudo systemctl start postgresql

# Test connection
psql -U postgres -c "SELECT version();"
```

### pgvector Extension Error

```sql
-- Login to PostgreSQL
psql -U postgres -d trading_workflow

-- Check if extension exists
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- If exists but not enabled
CREATE EXTENSION IF NOT EXISTS vector;
```

### SMTP Authentication Failed

- Verify App Password (not account password)
- Check 2FA is enabled
- Try different SMTP port (465 with `SMTP_SECURE=true`)
- Disable antivirus/firewall temporarily

### Grok API Rate Limits

Add delays in `scheduledAnalysis.ts`:

```typescript
await sleep(5000); // 5 seconds between calls
```

### TypeScript Build Errors

```bash
# Clear node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Rebuild
npm run build
```

## Production Deployment

### Environment Variables

Use secrets management:

```bash
# AWS Systems Manager
aws ssm put-parameter --name /trading/DB_PASSWORD --value "xxx" --type SecureString

# Google Cloud Secret Manager
gcloud secrets create DB_PASSWORD --data-file=-

# Azure Key Vault
az keyvault secret set --vault-name myVault --name DB_PASSWORD --value xxx
```

### Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start scheduler
pm2 start npm --name "trading-scheduler" -- run scheduler

# Auto-restart on system reboot
pm2 startup
pm2 save

# Monitor
pm2 logs trading-scheduler
```

### Systemd Service

Create `/etc/systemd/system/trading-workflow.service`:

```ini
[Unit]
Description=Automated Trading Workflow
After=network.target postgresql.service

[Service]
Type=simple
User=node
WorkingDirectory=/opt/trading-workflow
ExecStart=/usr/bin/npm run scheduler
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable trading-workflow
sudo systemctl start trading-workflow
sudo systemctl status trading-workflow
```

## Next Steps

1. ✅ Verify first analysis run completes
2. ✅ Check email/WhatsApp notifications arrive
3. ✅ Monitor for 24 hours
4. ✅ Run outcome checker: `npm run check-outcomes`
5. ✅ Review trade statistics in database
6. ✅ Customize symbols and timeframes
7. ✅ Integrate with your market data provider
8. ✅ Set up monitoring/alerting

## Support

If you encounter issues not covered here:

1. Check logs: `logs/trading-workflow.log`
2. Review error logs: `logs/error.log`
3. Open GitHub issue with:
   - Error message
   - Relevant logs
   - Environment details (OS, Node version, etc.)

---

Happy trading! 🚀
