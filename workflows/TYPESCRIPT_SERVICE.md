# TypeScript Email Summary Service - Setup Guide

Complete guide for setting up the TypeScript-based email summarization service.

---

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ PostgreSQL 14+ with pgvector extension
- ✅ Google Cloud project with Gmail API enabled
- ✅ Grok or OpenAI API key

---

## 🚀 Quick Setup (10 minutes)

### Step 1: Install Dependencies

```bash
npm install
# This installs: googleapis, pg, pgvector, node-cron, etc.
```

### Step 2: Set Up Gmail OAuth2

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create/Select Project:**
   - Create new project or select existing
   - Enable **Gmail API**

3. **Create OAuth2 Credentials:**
   - Navigate to: APIs & Services → Credentials
   - Click: Create Credentials → OAuth 2.0 Client ID
   - Application type: Desktop app (for testing) or Web app (for production)
   - Add authorized redirect URI:
     ```
     http://localhost:3000/oauth2callback
     ```
   - Download JSON credentials

4. **Get Refresh Token:**

   Create a temporary script `getToken.js`:
   ```javascript
   const { google } = require('googleapis');
   const http = require('http');
   const url = require('url');
   const open = require('open');

   const oauth2Client = new google.auth.OAuth2(
     'YOUR_CLIENT_ID',
     'YOUR_CLIENT_SECRET',
     'http://localhost:3000/oauth2callback'
   );

   const scopes = [
     'https://www.googleapis.com/auth/gmail.readonly',
     'https://www.googleapis.com/auth/gmail.send',
     'https://www.googleapis.com/auth/gmail.modify',
     'https://www.googleapis.com/auth/gmail.labels'
   ];

   const authorizeUrl = oauth2Client.generateAuthUrl({
     access_type: 'offline',
     scope: scopes,
   });

   console.log('Authorize this app by visiting:', authorizeUrl);
   open(authorizeUrl);

   const server = http.createServer(async (req, res) => {
     if (req.url.indexOf('/oauth2callback') > -1) {
       const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
       const code = qs.get('code');

       res.end('Authentication successful! Check your console.');

       const { tokens } = await oauth2Client.getToken(code);
       console.log('\n\nYour refresh token:');
       console.log(tokens.refresh_token);
       console.log('\n\nAdd this to your .env file as GMAIL_REFRESH_TOKEN');

       server.close();
     }
   }).listen(3000);
   ```

   Run it:
   ```bash
   node getToken.js
   ```

   Copy the refresh token from console.

### Step 3: Configure Environment

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trading_workflow
DB_USER=postgres
DB_PASSWORD=your_password

# Grok AI (for summarization)
GROK_API_KEY=your_grok_api_key
GROK_API_URL=https://api.x.ai/v1/chat/completions
GROK_MODEL=grok-beta

# OpenAI (for embeddings)
OPENAI_API_KEY=your_openai_api_key
EMBEDDING_MODEL=text-embedding-ada-002

# Gmail OAuth2
GMAIL_CLIENT_ID=your_client_id_from_step2
GMAIL_CLIENT_SECRET=your_client_secret_from_step2
GMAIL_REDIRECT_URI=http://localhost:3000/oauth2callback
GMAIL_REFRESH_TOKEN=your_refresh_token_from_step2

# Email Summary Settings
EMAIL_LABEL=ToSummarize
EMAIL_RECIPIENT=your-email@gmail.com
EMAIL_CONFIDENCE_THRESHOLD=0.6
EMAIL_SUMMARY_CRON=0 7 * * *
```

### Step 4: Initialize Database

```bash
# Create database and tables
npm run init-db
```

This creates:
- `email_summaries` table
- Vector indexes for RAG
- Sample queries

### Step 5: Test Manually

Add some emails to the "ToSummarize" label in Gmail, then:

```bash
# Run once manually
ts-node -e "
import EmailSummaryService from './src/services/emailSummaryService';
import { getPool } from './src/database/connection';

const service = new EmailSummaryService(getPool());
service.runEmailSummaryWorkflow(
  'ToSummarize',
  'your-email@gmail.com',
  0.6
).then(() => console.log('Done!'));
"
```

### Step 6: Start Scheduler

```bash
# Run scheduled email summary (runs daily at 7 AM by default)
npm run email-scheduler
```

You'll see:
```
============================================================
EMAIL SUMMARY SCHEDULER STARTING
============================================================
✅ Database connection successful
============================================================
📧 Email Summary Scheduler is running
   Cron schedule: 0 7 * * *
   Email label: ToSummarize
   Recipient: your-email@gmail.com
============================================================
Press Ctrl+C to stop
```

---

## 🏗️ Architecture Overview

### Service Structure

```
src/services/
├── emailSummaryService.ts       # Main email service
│   ├── fetchEmailsFromLabel()   # Fetch from Gmail
│   ├── generateEmailSummary()   # AI summarization
│   ├── saveEmailSummary()       # Save to PostgreSQL
│   ├── sendSummaryEmail()       # Send digest
│   └── runEmailSummaryWorkflow() # Orchestrate all steps
│
├── scheduledEmailSummary.ts     # Cron scheduler
│   ├── runScheduledEmailSummary()
│   └── startEmailSummaryScheduler()
│
└── grokService.ts               # Grok API client (shared)
    embeddingService.ts          # OpenAI embeddings (shared)
    notificationService.ts       # Email sender (shared)
```

### Data Flow

```
1. Cron Trigger (7 AM daily)
        ↓
2. fetchEmailsFromLabel('ToSummarize', 50, '1d')
   → Gmail API OAuth2
   → Returns: EmailItem[] with links
        ↓
3. generateEmailSummary(emails)
   → Grok AI analysis
   → Returns: GrokEmailSummaryResponse
        ↓
4. Check confidence >= 0.6
        ↓
5. generateEmbedding(summary)
   → OpenAI embeddings
   → Returns: vector[1536]
        ↓
6. saveEmailSummary()
   → PostgreSQL + pgvector
   → Stores with embedding
        ↓
7. sendSummaryEmail()
   → Gmail API
   → Beautiful HTML email
   → Apply "Mail Summary" label
```

---

## 🎨 Customization

### Change Schedule

Edit `.env`:
```bash
# Every day at 9 AM
EMAIL_SUMMARY_CRON=0 9 * * *

# Every 4 hours
EMAIL_SUMMARY_CRON=0 */4 * * *

# Weekdays at 7 AM and 3 PM
EMAIL_SUMMARY_CRON=0 7,15 * * 1-5
```

Test cron expressions: https://crontab.guru/

### Change Email Filter

Edit `src/services/emailSummaryService.ts` in `fetchEmailsFromLabel()`:

```typescript
// Current: Unread emails from last 24 hours
const query = `is:unread label:${labelName} newer_than:${timeRange}`;

// Examples:
const query = `from:boss@company.com newer_than:1d`; // From specific sender
const query = `label:Important newer_than:1d`;        // Important only
const query = `is:starred newer_than:1d`;             // Starred emails
```

### Customize AI Prompt

Edit `src/services/emailSummaryService.ts` in `generateEmailSummary()`:

```typescript
const prompt = `You are an expert email triage assistant.

For each email, identify:
1. Urgency level (CRITICAL/HIGH/MEDIUM/LOW)
2. Action required and deadline
3. Key decision points
4. Stakeholders involved

Format as JSON with priority-based sorting.

Emails:
${emailTexts}

Response format:
{
  "overallSummary": "...",
  "emailSummaries": [...],
  "actionItems": [...],
  "confidence": 0.9
}`;
```

### Change HTML Template

Edit `generateSummaryHTML()` in `src/services/emailSummaryService.ts`:

```typescript
// Change theme color
.header { border-bottom: 3px solid #2196F3; } // Blue instead of green

// Add company logo
<div class="header">
  <img src="https://your-company.com/logo.png" alt="Logo" height="40">
  <h1>📧 Daily Email Summary</h1>
</div>

// Add custom sections
<div class="custom-section">
  <h2>🎯 Today's Priorities</h2>
  <ul>
    ${highPriorityEmails.map(email => `<li>${email.subject}</li>`).join('')}
  </ul>
</div>
```

---

## 🔍 Vector Search (RAG)

The TypeScript service stores email summaries with vector embeddings, enabling semantic search.

### Find Similar Email Patterns

```typescript
import { getPool } from './src/database/connection';
import embeddingService from './src/services/embeddingService';

async function findSimilarSummaries(searchText: string) {
  const pool = getPool();

  // Generate embedding for search query
  const queryEmbedding = await embeddingService.generateEmbedding(searchText);

  // Vector similarity search
  const result = await pool.query(`
    SELECT
      id,
      summary_date,
      total_emails,
      summary,
      confidence,
      embedding <=> $1::vector AS distance
    FROM email_summaries
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $1::vector
    LIMIT 10
  `, [JSON.stringify(queryEmbedding)]);

  return result.rows;
}

// Example usage
const similar = await findSimilarSummaries('urgent customer complaints');
console.log(similar);
```

### Email Analytics Queries

```sql
-- Summary stats by date
SELECT
  summary_date,
  total_emails,
  confidence,
  created_at
FROM email_summaries
ORDER BY summary_date DESC
LIMIT 30;

-- Average emails per day
SELECT
  AVG(total_emails) as avg_per_day,
  MAX(total_emails) as busiest_day,
  MIN(total_emails) as slowest_day
FROM email_summaries;

-- Confidence trends
SELECT
  DATE_TRUNC('week', summary_date) as week,
  AVG(confidence) as avg_confidence,
  COUNT(*) as summary_count
FROM email_summaries
GROUP BY week
ORDER BY week DESC;

-- Find high-volume weeks
SELECT
  DATE_TRUNC('week', summary_date) as week,
  SUM(total_emails) as total_emails_week
FROM email_summaries
GROUP BY week
ORDER BY total_emails_week DESC
LIMIT 10;
```

---

## 📊 Monitoring & Logs

### Log Files

Logs are stored in `./logs/`:
```bash
tail -f logs/trading-workflow.log  # Real-time logs
grep ERROR logs/trading-workflow.log  # Find errors
```

### Log Levels

Edit `.env`:
```bash
LOG_LEVEL=debug  # Verbose debugging
LOG_LEVEL=info   # Standard (default)
LOG_LEVEL=warn   # Warnings only
LOG_LEVEL=error  # Errors only
```

### Custom Logging

Add to `src/services/emailSummaryService.ts`:

```typescript
import logger from '../utils/logger';

logger.info('Processing email:', { subject: email.subject });
logger.warn('Low confidence summary:', { confidence });
logger.error('Failed to send email:', error);
```

---

## 🔐 Security Best Practices

### 1. Secure Credentials

```bash
# Use environment variables, never commit .env
echo ".env" >> .gitignore

# Rotate refresh tokens every 90 days
# Set up Google Cloud Console alert
```

### 2. Database Security

```sql
-- Create read-only user for analytics
CREATE USER analyst WITH PASSWORD 'secure_password';
GRANT SELECT ON email_summaries TO analyst;

-- Encrypt sensitive fields
ALTER TABLE email_summaries
ADD COLUMN encrypted_data BYTEA;
```

### 3. API Rate Limits

Edit `src/services/emailSummaryService.ts`:

```typescript
// Add rate limiting
import rateLimit from 'axios-rate-limit';

const http = rateLimit(axios.create(), {
  maxRequests: 10,
  perMilliseconds: 1000
});
```

### 4. Input Validation

```typescript
// Validate email count
if (emails.length > 100) {
  logger.warn('Too many emails, limiting to 100');
  emails = emails.slice(0, 100);
}

// Sanitize HTML output
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(htmlContent);
```

---

## 🐛 Troubleshooting

### Gmail API Errors

**Error:** `invalid_grant`
```bash
# Refresh token expired, regenerate:
node getToken.js
# Update GMAIL_REFRESH_TOKEN in .env
```

**Error:** `insufficient_permissions`
```bash
# Re-authenticate with correct scopes:
# Make sure getToken.js includes:
# - gmail.readonly
# - gmail.send
# - gmail.modify
# - gmail.labels
```

### Database Errors

**Error:** `relation "email_summaries" does not exist`
```bash
# Run migrations:
npm run init-db
```

**Error:** `extension "vector" does not exist`
```bash
# Install pgvector:
# Ubuntu/Debian:
sudo apt install postgresql-14-pgvector

# macOS:
brew install pgvector

# Then in PostgreSQL:
CREATE EXTENSION vector;
```

### AI API Errors

**Error:** `401 Unauthorized`
```bash
# Check API key:
echo $GROK_API_KEY
echo $OPENAI_API_KEY

# Verify in .env file
```

**Error:** `Rate limit exceeded`
```bash
# Reduce frequency in .env:
EMAIL_SUMMARY_CRON=0 7 * * *  # Once daily instead of every 4 hours

# Or increase API limits (paid tier)
```

### Cron Not Running

```bash
# Test cron expression:
curl https://crontab.guru/0%207%20*%20*%20*

# Check logs:
grep "email summary" logs/trading-workflow.log

# Run manually to test:
npm run email-scheduler
# Then check if scheduler starts
```

---

## 🚀 Production Deployment

### 1. Use Process Manager

```bash
# Install PM2
npm install -g pm2

# Start service
pm2 start dist/emailScheduler.js --name email-summary

# Auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 logs email-summary
pm2 monit
```

### 2. Docker Deployment

Create `Dockerfile.email`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

CMD ["node", "dist/emailScheduler.js"]
```

Build and run:
```bash
docker build -f Dockerfile.email -t email-summary .
docker run -d --env-file .env email-summary
```

### 3. Environment Variables (Production)

```bash
# Use secrets management
# AWS Secrets Manager, HashiCorp Vault, etc.

# Or encrypted .env
npm install dotenv-vault
npx dotenv-vault encrypt
```

### 4. Health Checks

Add to `src/emailScheduler.ts`:

```typescript
import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    lastRun: lastRunTime,
    nextRun: nextScheduledRun
  });
});

app.listen(3000);
```

---

## 📈 Performance Optimization

### 1. Batch Processing

```typescript
// Process emails in batches
const BATCH_SIZE = 10;
for (let i = 0; i < emails.length; i += BATCH_SIZE) {
  const batch = emails.slice(i, i + BATCH_SIZE);
  await processBatch(batch);
}
```

### 2. Caching

```typescript
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 3600 });

// Cache embeddings
const cached = cache.get(`embedding:${text}`);
if (cached) return cached;
```

### 3. Parallel Processing

```typescript
// Process embeddings in parallel
const embeddings = await Promise.all(
  emails.map(email => embeddingService.generateEmbedding(email.snippet))
);
```

---

## 🎯 Next Steps

After basic setup:

1. ✅ **Add analytics dashboard** (Grafana + PostgreSQL)
2. ✅ **Set up alerts** (Slack/Discord for high-priority emails)
3. ✅ **Implement auto-replies** (for common patterns)
4. ✅ **Build REST API** (expose summaries to other apps)
5. ✅ **Train custom models** (fine-tune on your email patterns)

---

## 📚 Additional Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Grok API Reference](https://docs.x.ai/api)
- [pgvector Guide](https://github.com/pgvector/pgvector)
- [Node-cron Documentation](https://www.npmjs.com/package/node-cron)

---

**Questions?** Check logs first:
```bash
tail -50 logs/trading-workflow.log
```

Happy automating! 🚀
