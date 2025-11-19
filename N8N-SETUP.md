# n8n Workflow Setup Guide

Complete guide to importing and configuring the Automated Trading Workflow in n8n.

## Prerequisites

1. **n8n installed and running**
   - Cloud: https://n8n.io (easiest)
   - Self-hosted: Docker or npm installation

2. **PostgreSQL with pgvector**
   - Database created and initialized (see SETUP.md)
   - Network accessible from n8n instance

3. **API Keys**
   - Grok API key (X.AI)
   - OpenAI API key
   - Email SMTP credentials
   - Twilio account (optional, for WhatsApp)

## Step 1: Import Workflow

### Option A: n8n Cloud or Desktop

1. Open n8n
2. Click **"+"** button → **"Import from File"**
3. Select `n8n-workflow.json`
4. Click **"Import"**

### Option B: Self-hosted n8n

```bash
# Copy workflow file to n8n directory
cp n8n-workflow.json ~/.n8n/workflows/

# Or import via CLI
n8n import:workflow --input=n8n-workflow.json
```

## Step 2: Configure Credentials

You need to set up the following credentials in n8n:

### 2.1 PostgreSQL Credentials

1. Go to **Settings** → **Credentials** → **New**
2. Select **"Postgres"**
3. Name: `PostgreSQL Trading DB`
4. Fill in:
   ```
   Host: localhost (or your PostgreSQL host)
   Database: trading_workflow
   User: postgres
   Password: your_db_password
   Port: 5432
   SSL: false (or true if using SSL)
   ```
5. Click **"Save"**

### 2.2 Grok API Credentials (HTTP Header Auth)

1. **Settings** → **Credentials** → **New**
2. Select **"Header Auth"**
3. Name: `Grok API Key`
4. Configure:
   ```
   Name: Authorization
   Value: Bearer YOUR_GROK_API_KEY
   ```
5. Click **"Save"**

### 2.3 OpenAI API Credentials (HTTP Header Auth)

1. **Settings** → **Credentials** → **New**
2. Select **"Header Auth"**
3. Name: `OpenAI API Key`
4. Configure:
   ```
   Name: Authorization
   Value: Bearer YOUR_OPENAI_API_KEY
   ```
5. Click **"Save"**

### 2.4 Email SMTP Credentials

1. **Settings** → **Credentials** → **New**
2. Select **"SMTP"**
3. Name: `Email SMTP`
4. Fill in:
   ```
   User: your-email@gmail.com
   Password: your-app-password
   Host: smtp.gmail.com
   Port: 587
   Security: None/STARTTLS
   ```
5. Click **"Save"**

**Gmail Users**: Use App Password, not account password
- Enable 2FA on Google account
- Generate App Password: https://myaccount.google.com/apppasswords

### 2.5 Twilio Credentials (Optional - for WhatsApp)

1. **Settings** → **Credentials** → **New**
2. Select **"HTTP Basic Auth"**
3. Name: `Twilio Credentials`
4. Configure:
   ```
   User: YOUR_TWILIO_ACCOUNT_SID
   Password: YOUR_TWILIO_AUTH_TOKEN
   ```
5. Click **"Save"**

## Step 3: Set Environment Variables

n8n workflows access environment variables via `$env`. Set these in your n8n instance:

### For n8n Cloud:

1. Go to **Settings** → **Environments**
2. Add variables:

```
GROK_API_URL=https://api.x.ai/v1/chat/completions
GROK_MODEL=grok-beta
CONFIDENCE_THRESHOLD=0.7
EMBEDDING_MODEL=text-embedding-ada-002
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=recipient@example.com
WHATSAPP_ENABLED=false
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WHATSAPP_TO=whatsapp:+1234567890
```

### For Self-hosted n8n (Docker):

Add to your `docker-compose.yml`:

```yaml
services:
  n8n:
    image: n8nio/n8n
    environment:
      - GROK_API_URL=https://api.x.ai/v1/chat/completions
      - GROK_MODEL=grok-beta
      - CONFIDENCE_THRESHOLD=0.7
      - EMBEDDING_MODEL=text-embedding-ada-002
      - EMAIL_FROM=your-email@gmail.com
      - EMAIL_TO=recipient@example.com
      - WHATSAPP_ENABLED=false
      - TWILIO_ACCOUNT_SID=your_sid
      - TWILIO_AUTH_TOKEN=your_token
      - TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
      - TWILIO_WHATSAPP_TO=whatsapp:+1234567890
```

### For Self-hosted n8n (npm):

Create `.env` file in n8n directory:

```bash
export GROK_API_URL=https://api.x.ai/v1/chat/completions
export GROK_MODEL=grok-beta
export CONFIDENCE_THRESHOLD=0.7
export EMBEDDING_MODEL=text-embedding-ada-002
export EMAIL_FROM=your-email@gmail.com
export EMAIL_TO=recipient@example.com
export WHATSAPP_ENABLED=false
```

Then source it before starting n8n:

```bash
source .env && n8n start
```

## Step 4: Configure Workflow Nodes

Open the imported workflow and update these nodes:

### 4.1 Update "Set Trading Symbols" Node

Edit the node to add your trading symbols:

```javascript
{
  "assignments": [
    { "name": "symbol", "value": "EURUSD", "type": "string" },
    { "name": "symbol", "value": "GBPUSD", "type": "string" },
    { "name": "symbol", "value": "USDJPY", "type": "string" },
    // Add more symbols as needed
  ]
}
```

Or use an array:

```javascript
const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
return symbols.map(symbol => ({
  json: {
    symbol,
    timeframe: 'M30',
    marketSummary: 'Current market conditions...'
  }
}));
```

### 4.2 Link Credentials to Nodes

Ensure each node has the correct credential:

1. **Get RAG Context (pgvector)** → `PostgreSQL Trading DB`
2. **Call Grok API** → `Grok API Key`
3. **Generate Embedding (OpenAI)** → `OpenAI API Key`
4. **Save Trade to Database** → `PostgreSQL Trading DB`
5. **Log Success** → `PostgreSQL Trading DB`
6. **Log Rejected** → `PostgreSQL Trading DB`
7. **Send Email Notification** → `Email SMTP`
8. **Send WhatsApp** → `Twilio Credentials`

## Step 5: Test the Workflow

### Manual Test Run

1. Click **"Execute Workflow"** button
2. Check execution log for each node
3. Verify:
   - RAG context retrieved from database
   - Grok API called successfully
   - Confidence threshold checked
   - If confidence ≥ 0.7:
     - Embedding generated
     - Trade saved to database
     - Email sent
     - WhatsApp sent (if enabled)
   - If confidence < 0.7:
     - Logged to analysis_logs
     - No notification sent

### Check Database

```sql
-- Check saved trades
SELECT * FROM trade_ideas ORDER BY created_at DESC LIMIT 5;

-- Check analysis logs
SELECT * FROM analysis_logs ORDER BY run_timestamp DESC LIMIT 10;

-- Check statistics
SELECT
  status,
  COUNT(*) as count,
  AVG(confidence) as avg_confidence
FROM analysis_logs
GROUP BY status;
```

## Step 6: Activate Scheduler

1. Click **"Active"** toggle in top-right corner
2. Workflow will now run every 30 minutes automatically
3. Monitor executions in **Executions** tab

### Customize Schedule

Edit the **"Every 30 Minutes"** node:

- **Every 15 minutes**: `*/15 * * * *`
- **Every hour**: `0 * * * *`
- **Every 4 hours**: `0 */4 * * *`
- **Daily at 9 AM**: `0 9 * * *`
- **Weekdays only at 9 AM**: `0 9 * * 1-5`

## Workflow Structure

```
┌─────────────────────────────────────────────────────┐
│ Every 30 Minutes (Schedule Trigger)                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Set Trading Symbols (EURUSD, GBPUSD, USDJPY...)    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Split Symbols (Process each symbol)                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Get RAG Context (pgvector similarity search)       │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Format RAG Context (Build historical context)      │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Build Grok Prompt (Combine market + RAG context)   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Call Grok API (Get trade recommendation)           │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Parse Grok Response (Validate JSON)                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ Confidence >= 0.7? (IF Node)                       │
└─────┬────────────────────────────────────────┬──────┘
      │ YES (≥ 0.7)                            │ NO (< 0.7)
      ▼                                        ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│ Generate Embedding       │      │ Log Rejected             │
│ (OpenAI)                 │      │ (Low Confidence)         │
└──────┬───────────────────┘      └──────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Merge Embedding + Trade  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Save Trade to Database   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Log Success              │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Build Email Content      │
└──────┬───────────────────┘
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
┌─────────────┐   ┌──────────────┐  ┌──────────────┐
│ Send Email  │   │ Build        │  │ WhatsApp     │
│             │   │ WhatsApp Msg │  │ Enabled?     │
└─────────────┘   └──────┬───────┘  └──────┬───────┘
                         │                 │
                         ▼                 ▼
                  ┌──────────────┐  ┌──────────────┐
                  │ Send         │  │ Send         │
                  │ WhatsApp     │  │ WhatsApp     │
                  └──────────────┘  └──────────────┘
```

## Troubleshooting

### "Credential not found" Error

1. Check credential names match exactly
2. Re-link credentials in each node
3. Save workflow after changes

### PostgreSQL Connection Error

```
Error: connect ECONNREFUSED
```

**Solutions:**
- Verify PostgreSQL is running
- Check host/port in credentials
- Ensure n8n can reach PostgreSQL (firewall, network)
- For Docker: Use `host.docker.internal` instead of `localhost`

### Grok API 401 Unauthorized

- Verify API key is correct
- Check header format: `Bearer YOUR_KEY`
- Ensure key has not expired

### pgvector Query Error

```
Error: operator does not exist: vector <=>
```

**Solution:** Install pgvector extension:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Email Not Sending

- **Gmail:** Use App Password, enable 2FA
- **Port:** Try 465 with SSL instead of 587
- Check SMTP credentials
- Test with n8n's built-in "Email Send" node test

### "No data returned" from RAG Context

This is normal on first run (no historical data).

**Solution:** Run workflow a few times to build up history.

### Workflow Times Out

Increase timeout in HTTP Request nodes:
- Click node → **Settings** → **Timeout** → `30000` ms

## Monitoring

### View Executions

1. Go to **Executions** tab
2. Filter by:
   - Status (Success, Error, Running)
   - Time range
   - Workflow name

### Set Up Error Notifications

Add an **Error Trigger** workflow:

1. Create new workflow
2. Add **Error Trigger** node
3. Add **Send Email** node
4. Configure to email you on workflow errors

### Check Logs

Self-hosted n8n:

```bash
# Docker
docker logs n8n

# npm
tail -f ~/.n8n/logs/n8n.log
```

## Advanced Configuration

### Add More Symbols

Edit **"Set Trading Symbols"** node to process more pairs dynamically:

```javascript
// Fetch from database or API
const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD'];

return symbols.map(symbol => ({
  json: {
    symbol,
    timeframe: 'M30',
    marketSummary: `Current conditions for ${symbol}...`
  }
}));
```

### Integrate Real Market Data

Replace placeholder market summary with real data:

**Option 1: Add HTTP Request node before Grok**

```javascript
// Call your market data API
GET https://api.yourprovider.com/market/${symbol}

// Extract summary
const marketSummary = $json.analysis || 'No data available';
```

**Option 2: Use n8n's built-in integrations**

- TradingView (if available)
- Alpha Vantage
- Yahoo Finance
- Twelve Data

### Customize Confidence Threshold

Change threshold dynamically:

```javascript
// In "Confidence >= 0.7?" node
const threshold = parseFloat($env.CONFIDENCE_THRESHOLD || '0.7');
const confidence = $json.confidence;

return confidence >= threshold;
```

### Add Slack Notifications

1. Add **Slack** node after email
2. Configure with Slack webhook URL
3. Format message similar to WhatsApp

## Production Best Practices

1. **Error Handling**: Add Error Trigger workflow
2. **Retry Logic**: Enable retries in HTTP Request nodes
3. **Rate Limiting**: Add delays between API calls
4. **Monitoring**: Set up execution alerts
5. **Backups**: Export workflow regularly
6. **Credentials**: Use n8n's credential encryption
7. **Database**: Regular backups of PostgreSQL
8. **Logging**: Enable detailed execution logging

## Next Steps

1. ✅ Import workflow
2. ✅ Configure credentials
3. ✅ Set environment variables
4. ✅ Test manual execution
5. ✅ Activate scheduler
6. ✅ Monitor first 24 hours
7. ✅ Integrate real market data
8. ✅ Customize to your needs

## Support Resources

- n8n Documentation: https://docs.n8n.io
- n8n Community: https://community.n8n.io
- GitHub Issues: https://github.com/n8n-io/n8n/issues
- This project's README.md for TypeScript implementation details

---

Happy trading! 🚀
