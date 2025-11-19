# Quick Reference Card

## 🚀 Two Workflows System

| Workflow | File | Schedule | Purpose |
|----------|------|----------|---------|
| **1: Analysis** | `workflow-1-analysis.json` | Every 30 min | Research market → If >70% confident → Save + Notify |
| **2: Outcomes** | `workflow-2-outcome-updater.json` | Daily 2 AM | Check yesterday's trades → Update wins/losses |

## ⚡ Quick Setup (10 minutes)

```bash
# 1. Database
createdb trading_workflow
psql -U postgres -d trading_workflow -f schema.sql

# 2. n8n - Import both workflows
# - workflow-1-analysis.json
# - workflow-2-outcome-updater.json

# 3. Configure 3 credentials (both workflows use same):
# - PostgreSQL Trading DB
# - Grok API Key (Header Auth)
# - Gmail SMTP

# 4. Set environment:
# EMAIL_FROM=your-email@gmail.com
# EMAIL_TO=recipient@example.com

# 5. Activate both workflows ✅
```

## 🔄 How It Works

```
WORKFLOW 1 (Every 30 min)
  ↓
Get historical trades (RAG)
  ↓
Grok researches market
  ↓
Get confidence %
  ↓
IF >= 70%:
  → Save to DB (is_win=NULL)
  → Send email
ELSE:
  → Do nothing

  ↓ (Next day 2 AM)

WORKFLOW 2 (Daily)
  ↓
Get yesterday's trades
  ↓
For each: Grok researches outcome
  ↓
Update DB: is_win, pnl
  ↓
Send summary email

  ↓ (Learning loop)

BACK TO WORKFLOW 1
  → Now has outcome data as RAG context
  → Makes better predictions
```

## 📊 Workflow 1: Real-time Analysis

**Nodes:** 13
**Purpose:** Analyze market and notify if confident

```
Trigger (30 min)
  → Set Symbols
  → Get Historical (RAG)
  → Format RAG
  → Build Prompt
  → Call Grok
  → Parse Response
  → Check >= 70%?
      ├─ YES → Save → Email
      └─ NO  → Log → Stop
```

**Grok Prompt:**
- "Research EURUSD market in real-time"
- "Consider past wins/losses"
- "Return detailed analysis + confidence"

**Output if >= 70%:**
- ✅ Database record
- ✅ Gmail with analysis
- ✅ is_win = NULL (pending)

**Output if < 70%:**
- ❌ Nothing (no save, no email)
- ✅ Log to analysis_logs

## ⏰ Workflow 2: Outcome Updater

**Nodes:** 10
**Purpose:** Update trade outcomes daily

```
Trigger (Daily 2 AM)
  → Get Unevaluated Trades
  → For Each:
      → Build Outcome Prompt
      → Call Grok (research market result)
      → Parse Outcome
      → Update DB (is_win, pnl)
  → Aggregate Results
  → Send Summary Email
```

**Grok Prompt:**
- "What happened to this trade?"
- "Did it hit SL or TP?"
- "Return: is_win (boolean), pnl"

**Database Update:**
```sql
UPDATE trade_ideas
SET
  is_win = true/false,
  actual_exit_price = X,
  pnl = +/- Y pips,
  evaluated_at = NOW()
```

**Summary Email:**
- Total checked: 5
- Wins: 3, Losses: 2
- Win rate: 60%
- Detailed table

## 📧 Email Notifications

### From Workflow 1 (High-Confidence Trade)
```
Subject: 📈 HIGH CONFIDENCE (85%) - EURUSD LONG
When: Immediately when confidence >= 70%
Contains:
  - Trade details (entry, SL, TP, R/R)
  - Real-time research summary
  - Detailed analysis
  - Risk notes
```

### From Workflow 2 (Daily Summary)
```
Subject: 📊 Daily Update: 5 Trades Verified - 60% Win Rate
When: Daily at 2 AM (after outcome checks)
Contains:
  - Total trades checked
  - Wins vs Losses
  - Win rate percentage
  - Detailed outcome table
```

## 🎯 Confidence Logic

```javascript
// Workflow 1
if (confidence >= 0.7) {  // 70%
  saveToDatabase();
  sendEmail();
} else {
  logOnly();  // No save, no email
}
```

## 🗄️ Database Flow

```
WORKFLOW 1 CREATES:
INSERT INTO trade_ideas (
  symbol: 'EURUSD',
  direction: 'LONG',
  confidence: 0.85,
  is_win: NULL,  ← Pending
  ...
)

↓ (Next day)

WORKFLOW 2 UPDATES:
UPDATE trade_ideas
SET
  is_win = TRUE,  ← Now known
  actual_exit_price = 1.09900,
  pnl = 45.0,
  evaluated_at = NOW()

↓ (Back to Workflow 1)

WORKFLOW 1 USES AS RAG:
SELECT * FROM trade_ideas
WHERE is_win IS NOT NULL  ← Has outcomes
ORDER BY created_at DESC
LIMIT 10
```

## 🎛️ Common Customizations

### Change Frequency (Workflow 1)
```javascript
// Node: "Every 30 Minutes"
Every 15 min: */15 * * * *
Every hour:   0 * * * *
Every 2 hours: 0 */2 * * *
```

### Change Outcome Time (Workflow 2)
```javascript
// Node: "Daily at 2 AM"
6 AM:  0 6 * * *
Noon:  0 12 * * *
8 PM:  0 20 * * *
```

### Change Confidence (Workflow 1)
```javascript
// Node: "Confidence > 70%?"
value2: 0.8  // 80%
value2: 0.6  // 60%
```

### Add Symbols (Workflow 1)
```javascript
// Node: "Set Trading Symbols"
const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
```

## 🔍 Monitoring

### n8n Executions Tab
- See all workflow runs
- Check success/error status
- View node-by-node results

### Database Queries
```sql
-- Pending trades
SELECT COUNT(*) FROM trade_ideas WHERE is_win IS NULL;

-- Recent wins/losses
SELECT symbol, direction, is_win, pnl
FROM trade_ideas
WHERE is_win IS NOT NULL
ORDER BY evaluated_at DESC
LIMIT 10;

-- Win rate
SELECT
  symbol,
  COUNT(*) as trades,
  ROUND(AVG(CASE WHEN is_win THEN 1.0 ELSE 0 END) * 100, 1) as win_rate
FROM trade_ideas
WHERE is_win IS NOT NULL
GROUP BY symbol;
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No RAG context | Normal first run. Wait for Workflow 2 to update outcomes. |
| Email not sent | Check SMTP credentials, verify EMAIL_FROM/TO set |
| No trades to check (W2) | Normal if no high-confidence trades yesterday |
| Grok JSON error | Check Parse node - handles markdown automatically |
| Database error | Verify PostgreSQL connection, check credentials |

## 📈 Timeline

| Day | Activity |
|-----|----------|
| **Day 1** | W1 runs, saves first trades (no RAG yet) |
| **Day 2 (2 AM)** | W2 runs, updates outcomes |
| **Day 2 (9 AM+)** | W1 now has RAG context! |
| **Week 1** | Building dataset (30-50 trades) |
| **Week 2+** | System learning patterns |
| **Month 1+** | Robust predictions |

## 🎯 Success Metrics

After 1 month, you should see:
- ✅ 100-200 trades in database
- ✅ Win rate stabilizing (50-70% typical)
- ✅ Confidence scores correlating with outcomes
- ✅ Grok referencing past patterns in analysis
- ✅ Fewer low-confidence trades over time

## 💡 Tips

1. **Start small**: 1-3 symbols first week
2. **Monitor daily**: Check emails, review outcomes
3. **Trust the threshold**: Don't lower below 60%
4. **Be patient**: Takes 2-3 weeks to build good data
5. **Review patterns**: Check which setups have high win rates

## 🔐 Security Checklist

- [ ] Gmail App Password (not account password)
- [ ] Grok API key secured
- [ ] Database password strong
- [ ] Environment variables set
- [ ] .env not committed to git
- [ ] Email recipients verified

## 📚 Full Documentation

- **TWO-WORKFLOWS-GUIDE.md** - Complete detailed guide
- **N8N-SETUP.md** - n8n setup instructions
- **SETUP.md** - Database and API setup
- **README.md** - Project overview

---

## 🚀 Quick Start Command

```bash
# One-liner setup
createdb trading_workflow && \
psql -U postgres -d trading_workflow -f schema.sql && \
echo "✅ Database ready! Now import workflows in n8n."
```

---

**Need help?** See `TWO-WORKFLOWS-GUIDE.md` for detailed documentation.
