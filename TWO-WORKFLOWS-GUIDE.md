# Two-Workflow Trading System Guide

This system uses **TWO SEPARATE n8n workflows** that work together to create a self-improving trading analysis system.

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW 1: ANALYSIS                         │
│                   (Every 30 minutes)                            │
├─────────────────────────────────────────────────────────────────┤
│ 1. Get historical trades with outcomes (RAG)                   │
│ 2. Ask Grok to research market in real-time                    │
│ 3. Get detailed analysis + confidence %                        │
│ 4. IF confidence >= 70%:                                       │
│    ✅ Save to database                                         │
│    ✅ Send Gmail notification                                  │
│    ELSE:                                                        │
│    ❌ Do nothing (no save, no notification)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (Trades saved to database)
                              ▼
                      ┌──────────────┐
                      │   DATABASE   │
                      │  trade_ideas │
                      │  (is_win=NULL)│
                      └──────┬───────┘
                              │
                              │ (Next day at 2 AM)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  WORKFLOW 2: OUTCOME UPDATER                    │
│                     (Daily at 2 AM)                             │
├─────────────────────────────────────────────────────────────────┤
│ 1. Get trades from yesterday (is_win = NULL)                   │
│ 2. For each trade:                                             │
│    - Ask Grok to research actual market results                │
│    - Determine if it was WIN or LOSS                           │
│    - Update database: is_win, actual_exit_price, pnl          │
│ 3. Send summary email with results                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (is_win updated)
                              ▼
                      ┌──────────────┐
                      │   DATABASE   │
                      │  trade_ideas │
                      │  (is_win set) │
                      └──────┬───────┘
                              │
                              │ (Used as RAG context)
                              ▼
                    ┌──────────────────┐
                    │  BACK TO         │
                    │  WORKFLOW 1      │
                    │  (Learning Loop) │
                    └──────────────────┘
```

## 🔄 How They Work Together

### The Learning Loop

1. **Day 1 - 9:00 AM**: Workflow 1 runs
   - Uses historical data (if any) as RAG context
   - Grok researches market and gives 85% confidence LONG on EURUSD
   - **Saves to database** with `is_win = NULL`
   - **Sends Gmail notification**

2. **Day 1 - Throughout day**: Workflow 1 continues running every 30 min
   - Each new analysis uses previous trades (with outcomes) as context
   - Only saves trades with confidence >= 70%

3. **Day 2 - 2:00 AM**: Workflow 2 runs
   - Finds yesterday's EURUSD trade
   - Asks Grok to research: "Did the trade hit TP or SL?"
   - Grok analyzes actual market data
   - **Updates database**: `is_win = TRUE`, `pnl = +45 pips`
   - Sends summary email

4. **Day 2 - 9:00 AM**: Workflow 1 runs again
   - Now includes yesterday's outcome in RAG context
   - Grok can see: "Last EURUSD LONG trade was a WIN (+45 pips)"
   - **Learns patterns** and improves future recommendations

5. **Repeat** → System gets smarter over time

---

## 📁 Workflow Files

| File | Purpose | Schedule |
|------|---------|----------|
| `workflow-1-analysis.json` | Real-time analysis + notification | Every 30 minutes |
| `workflow-2-outcome-updater.json` | Update trade outcomes | Daily at 2 AM |

---

## 🚀 Setup Instructions

### Prerequisites

- n8n installed (Cloud or Self-hosted)
- PostgreSQL database
- Grok API key (X.AI)
- Gmail account with App Password

### Step 1: Setup Database

```sql
-- Create database
CREATE DATABASE trading_workflow;

-- Connect to it
\c trading_workflow

-- Run schema (from schema.sql file)
-- This creates trade_ideas and analysis_logs tables
```

### Step 2: Import Both Workflows

**In n8n:**

1. Click **"+"** → **"Import from File"**
2. Import `workflow-1-analysis.json`
3. Click **"+"** → **"Import from File"** again
4. Import `workflow-2-outcome-updater.json`

Now you have 2 workflows:
- ✅ Workflow 1: Real-time Trading Analysis (Every 30 min)
- ✅ Workflow 2: Daily Outcome Updater (Check Win/Loss)

### Step 3: Configure Credentials (Both Workflows Use Same Credentials)

**A. PostgreSQL**
- Settings → Credentials → New → "Postgres"
- Name: `PostgreSQL Trading DB`
- Host: `localhost`, Port: `5432`
- Database: `trading_workflow`
- User: `postgres`, Password: your password

**B. Grok API Key**
- Settings → Credentials → New → "Header Auth"
- Name: `Grok API Key`
- Header Name: `Authorization`
- Header Value: `Bearer YOUR_GROK_API_KEY`

**C. Gmail SMTP**
- Settings → Credentials → New → "SMTP"
- Name: `Gmail SMTP`
- Host: `smtp.gmail.com`, Port: `587`
- User: `your-email@gmail.com`
- Password: `your-app-password` (Generate at https://myaccount.google.com/apppasswords)

### Step 4: Set Environment Variables

Both workflows need:

```bash
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=recipient@example.com
```

**n8n Cloud:** Settings → Environments
**Self-hosted:** Add to `.env` or `docker-compose.yml`

### Step 5: Activate Both Workflows

1. Open **Workflow 1** → Click **"Active"** toggle
2. Open **Workflow 2** → Click **"Active"** toggle

✅ Done! System is running.

---

## 📧 Email Notifications

### Workflow 1: High-Confidence Trade Alert

**When:** Confidence >= 70%
**Subject:** `📈 HIGH CONFIDENCE (85.0%) - EURUSD LONG`

**Contains:**
- Trade details (entry, SL, TP, R/R)
- Real-time research summary
- Detailed analysis from Grok
- Risk notes

### Workflow 2: Daily Outcome Summary

**When:** Daily at 2 AM (after checking outcomes)
**Subject:** `📊 Daily Update: 3 Trades Verified - 66.7% Win Rate`

**Contains:**
- Total trades checked
- Wins vs Losses
- Win rate percentage
- Detailed table with each trade outcome
- P&L for each trade

---

## 🎯 Workflow 1 Details: Real-time Analysis

### Schedule
Runs **every 30 minutes**

### Process Flow

```
1. Set Trading Symbols (EURUSD, GBPUSD, USDJPY)
   ↓
2. Get Historical Trades (RAG Context)
   - Query: trades with is_win NOT NULL
   - Gets last 10 trades with outcomes
   ↓
3. Format RAG Context
   - Build text with win rate, past outcomes
   ↓
4. Build Research Prompt
   - Ask Grok to research market in real-time
   - Include historical patterns
   ↓
5. Call Grok API
   - Grok analyzes current market
   - Returns analysis + confidence %
   ↓
6. Parse & Validate Response
   - Validate JSON format
   - Check all required fields
   ↓
7. Check Confidence >= 70%?
   ├─ YES (>= 70%)
   │  ↓
   │  Save to Database
   │  ↓
   │  Build Email Notification
   │  ↓
   │  Send Gmail
   │
   └─ NO (< 70%)
      ↓
      Log to analysis_logs
      ↓
      Do Nothing (no save, no email)
```

### Key Features

**Grok Research Prompt:**
- Asks Grok to analyze real-time market conditions
- Considers technical indicators, support/resistance, sentiment
- Includes historical win/loss patterns as context
- Requests detailed multi-sentence analysis

**Confidence Threshold:**
```javascript
if (confidence >= 0.7) {
  // Save + Notify
} else {
  // Do nothing
}
```

**Database Save:**
- Only if confidence >= 70%
- Sets `is_win = NULL` (will be updated by Workflow 2)
- Saves full analysis, prices, confidence

**Gmail Notification:**
- Beautiful HTML email
- Shows confidence badge
- Includes real-time research summary
- Detailed analysis explanation
- Risk/reward ratio

### Example Grok Response (Workflow 1)

```json
{
  "symbol": "EURUSD",
  "timeframe": "M30",
  "direction": "LONG",
  "entry_price": 1.09450,
  "stop_loss": 1.09200,
  "take_profit": 1.09900,
  "confidence": 0.82,
  "analysis": "Current market shows strong bullish momentum on EURUSD. Price has broken above the 1.0940 resistance with high volume. RSI at 58 suggests room for upside. MACD showing bullish crossover. Historical data shows 75% win rate on similar LONG setups after resistance breakouts. Support at 1.0920 provides good risk management.",
  "research_summary": "Analyzed H1 and M30 charts, volume profile, and recent EUR economic data showing positive GDP growth.",
  "notes": "Watch for USD news at 2 PM EST which could cause volatility."
}
```

**Confidence: 82% >= 70%** → ✅ SAVED + EMAIL SENT

---

## ⏰ Workflow 2 Details: Daily Outcome Updater

### Schedule
Runs **daily at 2:00 AM**

### Process Flow

```
1. Get Unevaluated Trades
   - Query: is_win IS NULL AND created_at > 1 day ago
   ↓
2. Any Trades to Check?
   ├─ YES
   │  ↓
   │  For Each Trade:
   │  ↓
   │  Build Outcome Research Prompt
   │  - Ask Grok to research actual market results
   │  - "Did price hit SL or TP?"
   │  ↓
   │  Call Grok API
   │  - Grok analyzes historical price data
   │  - Determines WIN or LOSS
   │  ↓
   │  Parse Outcome Result
   │  - Validate is_win (boolean)
   │  - Validate actual_exit_price
   │  - Validate pnl
   │  ↓
   │  Update Database
   │  - SET is_win = true/false
   │  - SET actual_exit_price
   │  - SET pnl
   │  - SET evaluated_at = now
   │  ↓
   │  Aggregate Results
   │  ↓
   │  Build Summary Email
   │  ↓
   │  Send Gmail
   │
   └─ NO
      ↓
      No Trades to Check (end)
```

### Key Features

**Outcome Research Prompt:**
- Asks Grok to look up actual historical prices
- Determine if SL or TP was hit first
- Calculate actual P&L in pips
- Explain what happened in the market

**Database Update:**
```sql
UPDATE trade_ideas
SET
  is_win = true,  -- or false
  actual_exit_price = 1.09900,
  pnl = 45.0,  -- in pips
  evaluated_at = CURRENT_TIMESTAMP
WHERE id = 123
```

**Summary Email:**
- Total trades checked
- Win rate calculation
- Table showing each trade outcome
- P&L for each trade
- Note that data is now available for RAG

### Example Grok Response (Workflow 2)

```json
{
  "trade_id": 123,
  "symbol": "EURUSD",
  "is_win": true,
  "actual_exit_price": 1.09900,
  "pnl": 45.0,
  "outcome_explanation": "After entry at 1.09450, EURUSD rallied steadily throughout the day. Price reached the take profit level of 1.09900 at 14:35 UTC, resulting in a win. The stop loss at 1.09200 was never threatened. Strong EUR GDP data released at 10:00 UTC drove the upward movement.",
  "research_notes": "Analyzed TradingView historical data for EURUSD on the trade date. Clear bullish momentum confirmed."
}
```

**Updates database:** `is_win = TRUE`, `pnl = +45.0`

---

## 🔄 The RAG Learning Loop

### How the System Learns

1. **Initial State (Day 1)**
   - No historical data
   - Workflow 1 runs without RAG context
   - Makes first trades based solely on current analysis

2. **After First Outcome Check (Day 2)**
   - Workflow 2 updates `is_win` for Day 1 trades
   - Database now has outcome data

3. **Improved Analysis (Day 2+)**
   - Workflow 1 fetches historical trades with outcomes
   - Prompt includes: "Last 10 trades with win/loss results"
   - Grok can see patterns:
     - "LONG trades after resistance breakout: 3 wins, 1 loss"
     - "SHORT trades in ranging market: 2 losses"

4. **Pattern Recognition**
   - Over time, dataset grows
   - Grok learns which setups have higher win rates
   - Confidence levels become more accurate

### RAG Context Example

```
Historical Performance for EURUSD:
Win Rate: 75.0% (6/8 trades)

Recent Trades:
1. [2024-11-18] LONG - ✓ WIN
   Entry: 1.09450 | Exit: 1.09900
   P&L: +45.0 pips | Confidence: 82%
   Rationale: Bullish breakout above resistance

2. [2024-11-17] LONG - ✗ LOSS
   Entry: 1.08900 | Exit: 1.08650
   P&L: -25.0 pips | Confidence: 71%
   Rationale: False breakout

3. [2024-11-16] SHORT - ✓ WIN
   Entry: 1.09200 | Exit: 1.08700
   P&L: +50.0 pips | Confidence: 88%
   Rationale: Strong rejection at resistance
```

This context helps Grok make better decisions!

---

## 📊 Database Schema

### `trade_ideas` Table

| Column | Type | Purpose |
|--------|------|---------|
| `id` | SERIAL | Primary key |
| `symbol` | VARCHAR | EURUSD, GBPUSD, etc. |
| `direction` | VARCHAR | LONG, SHORT, FLAT |
| `entry_price` | DECIMAL | Entry price |
| `stop_loss` | DECIMAL | SL price |
| `take_profit` | DECIMAL | TP price |
| `confidence` | DECIMAL | 0.0 to 1.0 |
| `rationale` | TEXT | Analysis from Workflow 1 |
| `is_win` | BOOLEAN | NULL (pending), TRUE, FALSE |
| `actual_exit_price` | DECIMAL | Set by Workflow 2 |
| `pnl` | DECIMAL | Profit/loss in pips |
| `created_at` | TIMESTAMP | When trade was created |
| `evaluated_at` | TIMESTAMP | When outcome was checked |

### Workflow 1 Creates:
```sql
INSERT INTO trade_ideas (
  symbol, direction, entry_price, stop_loss, take_profit,
  confidence, rationale, is_win  -- is_win = NULL
)
```

### Workflow 2 Updates:
```sql
UPDATE trade_ideas
SET
  is_win = TRUE,
  actual_exit_price = 1.09900,
  pnl = 45.0,
  evaluated_at = NOW()
WHERE id = 123
```

---

## 🎛️ Customization

### Change Analysis Frequency (Workflow 1)

Edit **"Every 30 Minutes"** node:
- Every 15 min: `*/15 * * * *`
- Every hour: `0 * * * *`
- Every 2 hours: `0 */2 * * *`

### Change Outcome Check Time (Workflow 2)

Edit **"Daily at 2 AM"** node:
- 6 AM: `0 6 * * *`
- Noon: `0 12 * * *`
- Twice daily (2 AM & 2 PM): Run workflow 2 twice

### Change Confidence Threshold (Workflow 1)

Edit **"Confidence > 70%?"** node:
- Change `0.7` to `0.8` (80%)
- Or `0.6` (60%)

### Add More Symbols (Workflow 1)

Edit **"Set Trading Symbols"** node:
```javascript
const symbols = [
  'EURUSD', 'GBPUSD', 'USDJPY',
  'AUDUSD', 'USDCAD', 'NZDUSD',
  'EURGBP', 'EURJPY'
];
```

---

## 🐛 Troubleshooting

### Workflow 1 Issues

**"No historical data in RAG context"**
- Normal on first run
- After Workflow 2 runs, context will be populated

**"Email not sent even though confidence is 75%"**
- Check SMTP credentials
- Verify `EMAIL_FROM` and `EMAIL_TO` are set
- Test email node separately

**"Grok returns invalid JSON"**
- Check Parse & Validate node for error details
- Grok sometimes adds markdown - parser handles this

### Workflow 2 Issues

**"No trades to check"**
- Normal if no trades were saved yesterday
- Only trades with confidence >= 70% get saved

**"Grok can't determine outcome"**
- Grok may not have access to all historical data
- Falls back to `is_win = false` if uncertain

**"Database update failed"**
- Check PostgreSQL connection
- Verify trade_id exists

---

## 📈 Monitoring

### Check Workflow Executions

n8n → **Executions** tab
- See all runs for both workflows
- Filter by workflow name
- Check success/error status

### Check Database

```sql
-- Pending trades (awaiting Workflow 2)
SELECT COUNT(*) FROM trade_ideas WHERE is_win IS NULL;

-- Recent outcomes
SELECT symbol, direction, is_win, pnl, created_at
FROM trade_ideas
WHERE is_win IS NOT NULL
ORDER BY evaluated_at DESC
LIMIT 10;

-- Win rate by symbol
SELECT
  symbol,
  COUNT(*) as trades,
  SUM(CASE WHEN is_win THEN 1 ELSE 0 END) as wins,
  ROUND(AVG(CASE WHEN is_win THEN 1.0 ELSE 0.0 END) * 100, 1) as win_rate
FROM trade_ideas
WHERE is_win IS NOT NULL
GROUP BY symbol;
```

---

## 💡 Best Practices

1. **Start with 1-3 symbols** - Don't overwhelm system initially
2. **Monitor first week** - Check emails, verify database updates
3. **Adjust confidence threshold** - If too many/few trades
4. **Review outcomes** - Check if Workflow 2 is accurate
5. **Let it learn** - Give system 2-3 weeks to build good RAG data

---

## 🎯 Expected Timeline

| Day | What Happens |
|-----|-------------|
| **Day 1** | Workflow 1 runs every 30 min. No RAG context yet. Saves high-confidence trades. |
| **Day 2 (2 AM)** | Workflow 2 runs for first time. Updates Day 1 outcomes. Sends summary email. |
| **Day 2 (9 AM+)** | Workflow 1 now has RAG context! Uses Day 1 outcomes in analysis. |
| **Week 1** | Building initial dataset. 30-50 trades with outcomes. |
| **Week 2+** | System has good RAG data. Grok makes better predictions based on patterns. |
| **Month 1+** | Robust dataset. Clear pattern recognition. Improving win rates. |

---

## 🔐 Security

- Never commit `.env` files
- Use App Passwords for Gmail
- Rotate Grok API key periodically
- Backup database regularly
- Review email recipients

---

## 📚 Summary

✅ **Workflow 1** - Real-time analysis every 30 min
✅ **Workflow 2** - Daily outcome checker at 2 AM
✅ **RAG Loop** - System learns from outcomes
✅ **Gmail Notifications** - For trades + summaries
✅ **70% Threshold** - Only save high-confidence trades
✅ **Self-Improving** - Gets smarter over time

**Import both workflows → Configure credentials → Activate → Done!** 🚀
