# n8n Workflow - Quick Start Guide

Get your automated trading workflow running in n8n in **under 15 minutes**.

## 🚀 Quick Start (Simple Workflow)

### 1. Prerequisites Checklist

- [ ] n8n installed (Cloud or Self-hosted)
- [ ] PostgreSQL database running
- [ ] Grok API key from X.AI
- [ ] Email SMTP credentials (Gmail recommended)

### 2. Import Workflow (2 minutes)

**In n8n:**
1. Click **"+"** button
2. Select **"Import from File"**
3. Choose `n8n-workflow-simple.json`
4. Click **"Import"**

### 3. Setup Database (5 minutes)

```bash
# Create database
createdb trading_workflow

# Download and run schema
psql -U postgres -d trading_workflow -f schema.sql
```

### 4. Configure Credentials (5 minutes)

**A. PostgreSQL**
- Settings → Credentials → New → "Postgres"
- Name: `PostgreSQL Trading DB`
- Host: `localhost`, Port: `5432`
- Database: `trading_workflow`
- User: `postgres`, Password: `your_password`

**B. Grok API**
- Settings → Credentials → New → "Header Auth"
- Name: `Grok API Key`
- Header Name: `Authorization`
- Header Value: `Bearer YOUR_GROK_API_KEY`

**C. Email SMTP**
- Settings → Credentials → New → "SMTP"
- Name: `Email SMTP`
- Host: `smtp.gmail.com`, Port: `587`
- User: `your-email@gmail.com`
- Password: `your-app-password` (NOT regular password!)

### 5. Set Environment Variables (2 minutes)

**n8n Cloud:**
Settings → Environments → Add:
```
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=recipient@example.com
```

**Self-hosted Docker:**
Edit `docker-compose.yml`:
```yaml
environment:
  - EMAIL_FROM=your-email@gmail.com
  - EMAIL_TO=recipient@example.com
```

### 6. Test Run (1 minute)

1. Open imported workflow
2. Click **"Execute Workflow"** button
3. Check each node for green checkmarks ✅
4. Check your email for trade signal

### 7. Activate (10 seconds)

Click **"Active"** toggle → Workflow runs every 30 minutes!

---

## 📊 Workflow Overview

### What It Does

1. **Triggers** every 30 minutes
2. **Queries** PostgreSQL for recent trades (historical context)
3. **Builds** prompt with market data + history
4. **Calls** Grok API for trade recommendation
5. **Validates** response (JSON, confidence, direction)
6. **Checks** confidence threshold (≥ 70%)
7. **Saves** to database (if confidence high enough)
8. **Sends** email notification (if saved)

### Node Breakdown

| Node | Purpose | Time |
|------|---------|------|
| Every 30 Minutes | Schedule trigger | 0s |
| Set Trading Symbols | Define symbols to analyze | <1s |
| Get Recent Trades | Fetch historical context | 1s |
| Build Grok Prompt | Create AI prompt | <1s |
| Call Grok API | Get recommendation | 3-5s |
| Parse Response | Validate JSON | <1s |
| Confidence Check | Apply 70% filter | <1s |
| Save Trade | Store in database | 1s |
| Build Email | Format HTML email | <1s |
| Send Email | SMTP delivery | 2s |

**Total execution time:** ~10-15 seconds per symbol

---

## ⚙️ Customization

### Change Symbols

Edit **"Set Trading Symbols"** node:

```javascript
const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];

return symbols.map(symbol => ({
  json: {
    symbol,
    timeframe: 'M30',
    marketSummary: `Market conditions for ${symbol}...`
  }
}));
```

### Change Schedule

Edit **"Every 30 Minutes"** node:
- Every 15 min: `*/15 * * * *`
- Every hour: `0 * * * *`
- Daily 9 AM: `0 9 * * *`

### Change Confidence Threshold

Edit **"Confidence >= 70%?"** node:
- Change `0.7` to `0.8` (80%)
- Or `0.6` (60%)

---

## 🔍 Monitoring

### View Executions

n8n → **Executions** tab
- See all workflow runs
- Click to see node-by-node results
- Filter by status (Success/Error)

### Check Database

```sql
-- View saved trades
SELECT symbol, direction, confidence, created_at
FROM trade_ideas
ORDER BY created_at DESC
LIMIT 10;

-- Check success rate
SELECT
  COUNT(*) as total,
  AVG(confidence) as avg_confidence
FROM trade_ideas
WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## 🐛 Troubleshooting

### "Credential not found"
→ Re-link credentials in each node (click node, select credential dropdown)

### "Database connection failed"
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d trading_workflow -c "SELECT 1;"
```

### "Grok API 401 Unauthorized"
→ Verify API key in credential (must start with `xai-`)

### "Email not sending"
→ Gmail users: Use **App Password**, not account password
1. Enable 2FA on Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use that password in SMTP credential

### "No data returned from RAG"
→ Normal on first run (no history yet). Run 2-3 times to build context.

---

## 📈 Upgrade to Full Workflow

When ready for production:

1. Install pgvector: `sudo apt install postgresql-14-pgvector`
2. Enable extension: `CREATE EXTENSION vector;`
3. Get OpenAI API key
4. Import `n8n-workflow.json`
5. Configure additional credentials

See `WORKFLOW-COMPARISON.md` for details.

---

## 💰 Costs (Simple Workflow)

| Service | Cost |
|---------|------|
| Grok API | ~$20-50/month |
| PostgreSQL | Free (self-hosted) |
| Email SMTP | Free (Gmail) |
| **Total** | **~$20-50/month** |

*Based on 30-minute intervals = 48 analyses/day*

---

## 📚 Next Steps

1. ✅ Run workflow for 24 hours
2. ✅ Check database for saved trades
3. ✅ Review email notifications
4. ✅ Customize symbols and schedule
5. ✅ Integrate real market data API
6. ✅ Consider upgrading to full workflow

---

## 🆘 Support

**Documentation:**
- `N8N-SETUP.md` - Detailed setup instructions
- `WORKFLOW-COMPARISON.md` - Compare simple vs full
- `README.md` - TypeScript implementation
- `SETUP.md` - Database and API setup

**Resources:**
- n8n Docs: https://docs.n8n.io
- n8n Community: https://community.n8n.io
- Grok API: https://x.ai/api

**Common Issues:**
- See `N8N-SETUP.md` → Troubleshooting section

---

## ✨ Tips

1. **Test first** with 1 symbol before adding more
2. **Monitor costs** - Grok API usage
3. **Check logs** regularly for errors
4. **Backup database** weekly
5. **Use test mode** before production

---

Happy trading! 🎯
