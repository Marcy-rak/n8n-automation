# n8n Workflow Comparison

This project includes **two n8n workflow versions**. Choose the one that fits your needs.

## Available Workflows

| Feature | **Full Workflow** | **Simple Workflow** |
|---------|-------------------|---------------------|
| **File** | `n8n-workflow.json` | `n8n-workflow-simple.json` |
| **Nodes** | 20 nodes | 12 nodes |
| **Complexity** | Advanced | Beginner-friendly |
| **RAG Implementation** | pgvector similarity search | Recent trades only |
| **Embeddings** | OpenAI embeddings | None |
| **Email Notifications** | ✅ Yes | ✅ Yes |
| **WhatsApp** | ✅ Yes (optional) | ❌ No |
| **Confidence Filtering** | ✅ Yes (0.7 threshold) | ✅ Yes (0.7 threshold) |
| **Logging** | Detailed (analysis_logs table) | Basic |
| **Best For** | Production use | Testing/learning |

---

## 1. Full Workflow (`n8n-workflow.json`)

### Features

✅ **Advanced RAG** - Uses pgvector for semantic similarity search
✅ **OpenAI Embeddings** - Generates vectors for each trade
✅ **Comprehensive Logging** - Tracks all analysis runs
✅ **Multi-channel Notifications** - Email + WhatsApp
✅ **Batch Processing** - Handles multiple symbols efficiently
✅ **Error Handling** - Robust validation and parsing

### Node Flow

```
Schedule Trigger (30 min)
    ↓
Set Trading Symbols
    ↓
Split Symbols (batch processing)
    ↓
Get RAG Context (pgvector similarity)
    ↓
Format RAG Context
    ↓
Build Grok Prompt
    ↓
Call Grok API
    ↓
Parse & Validate Response
    ↓
Confidence Check (>= 0.7?)
    ├─ YES → Generate Embedding (OpenAI)
    │         ↓
    │     Merge Embedding + Trade
    │         ↓
    │     Save to Database
    │         ↓
    │     Log Success
    │         ↓
    │     Build Email Content
    │         ├─ Send Email
    │         └─ Build WhatsApp
    │             ↓
    │         WhatsApp Enabled?
    │             └─ Send WhatsApp
    │
    └─ NO → Log Rejected (Low Confidence)
```

### Requirements

- PostgreSQL with **pgvector** extension
- **Grok API** key
- **OpenAI API** key (for embeddings)
- SMTP credentials
- (Optional) Twilio account for WhatsApp

### When to Use

- ✅ Production deployment
- ✅ You want semantic similarity search
- ✅ Need WhatsApp notifications
- ✅ Require detailed audit logs
- ✅ Managing multiple symbols (5+)

### Estimated Costs (per month, 30-min intervals)

- **Grok API**: ~$20-50 (depends on usage)
- **OpenAI Embeddings**: ~$5-10 (text-embedding-ada-002)
- **Twilio WhatsApp**: $0.005/message (~$72/month for 48 messages/day)

---

## 2. Simple Workflow (`n8n-workflow-simple.json`)

### Features

✅ **Simplified RAG** - Uses recent trades (no embeddings)
✅ **Email Notifications** - SMTP only
✅ **Easy Setup** - Fewer dependencies
✅ **Fast Execution** - No embedding generation
✅ **Cost-effective** - Only Grok API required

### Node Flow

```
Schedule Trigger (30 min)
    ↓
Set Trading Symbols (Code node)
    ↓
Get Recent Trades (SQL query)
    ↓
Build Grok Prompt (with recent trades)
    ↓
Call Grok API
    ↓
Parse & Validate Response
    ↓
Confidence Check (>= 70%?)
    ├─ YES → Save Trade to DB
    │         ↓
    │     Build Email HTML
    │         ↓
    │     Send Email
    │
    └─ NO → Log Rejected
```

### Requirements

- PostgreSQL (standard, no pgvector needed)
- **Grok API** key
- SMTP credentials

### When to Use

- ✅ Testing and learning n8n
- ✅ Budget-conscious deployment
- ✅ Don't need WhatsApp
- ✅ Processing 1-3 symbols
- ✅ Getting started quickly

### Estimated Costs (per month, 30-min intervals)

- **Grok API**: ~$20-50 (depends on usage)
- **OpenAI**: $0 (not used)
- **Twilio**: $0 (not used)

---

## Setup Comparison

### Full Workflow Setup

```bash
# 1. Install pgvector
sudo apt install postgresql-14-pgvector

# 2. Create database with vector extension
psql -U postgres -d trading_workflow -c "CREATE EXTENSION vector;"

# 3. Initialize schema
npm run init-db

# 4. Configure n8n credentials
- PostgreSQL Trading DB
- Grok API Key (Header Auth)
- OpenAI API Key (Header Auth)
- Email SMTP
- Twilio Credentials (HTTP Basic Auth)

# 5. Set environment variables
GROK_API_KEY=...
OPENAI_API_KEY=...
EMAIL_FROM=...
EMAIL_TO=...
WHATSAPP_ENABLED=true
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=...
TWILIO_WHATSAPP_TO=...

# 6. Import workflow
n8n import:workflow --input=n8n-workflow.json
```

### Simple Workflow Setup

```bash
# 1. Create database (standard PostgreSQL)
createdb trading_workflow

# 2. Initialize schema (skip pgvector parts)
psql -U postgres -d trading_workflow < schema.sql

# 3. Configure n8n credentials
- PostgreSQL Trading DB
- Grok API Key (Header Auth)
- Email SMTP

# 4. Set environment variables
GROK_API_KEY=...
EMAIL_FROM=...
EMAIL_TO=...

# 5. Import workflow
n8n import:workflow --input=n8n-workflow-simple.json
```

---

## Migration Path

### Start Simple → Upgrade to Full

1. **Start with Simple Workflow**
   - Get familiar with n8n
   - Test Grok API integration
   - Validate email notifications

2. **Upgrade to Full Workflow**
   - Install pgvector extension
   - Add OpenAI API key
   - Generate embeddings for existing trades
   - Import full workflow
   - (Optional) Add WhatsApp

### Migrate Existing Data

```sql
-- If upgrading from simple to full, add vector column
ALTER TABLE trade_ideas ADD COLUMN embedding vector(1536);

-- Create vector index
CREATE INDEX idx_trade_ideas_embedding ON trade_ideas
  USING hnsw (embedding vector_cosine_ops);
```

Then run a script to generate embeddings for existing trades:

```typescript
// Generate embeddings for all trades without them
const trades = await db.query('SELECT id, symbol, timeframe, direction, rationale FROM trade_ideas WHERE embedding IS NULL');

for (const trade of trades.rows) {
  const embeddingText = `Symbol: ${trade.symbol}, Timeframe: ${trade.timeframe}, Direction: ${trade.direction}. ${trade.rationale}`;
  const embedding = await embeddingService.generateEmbedding(embeddingText);

  await db.query(
    'UPDATE trade_ideas SET embedding = $1::vector WHERE id = $2',
    [JSON.stringify(embedding), trade.id]
  );
}
```

---

## Performance Comparison

### Execution Time (average)

| Workflow | Avg Time (1 symbol) | Avg Time (3 symbols) |
|----------|---------------------|----------------------|
| **Full** | 8-12 seconds | 20-30 seconds |
| **Simple** | 4-6 seconds | 10-15 seconds |

### Database Queries

| Workflow | Queries per Run | Complexity |
|----------|-----------------|------------|
| **Full** | 4-6 | High (vector similarity) |
| **Simple** | 2-3 | Low (simple SELECT) |

---

## Recommendations

### Choose **Full Workflow** if:

- ✅ You need production-grade RAG with semantic search
- ✅ Processing 5+ symbols regularly
- ✅ Want WhatsApp + Email notifications
- ✅ Need detailed audit trails
- ✅ Have budget for OpenAI embeddings
- ✅ Can maintain pgvector extension

### Choose **Simple Workflow** if:

- ✅ Just getting started with n8n
- ✅ Testing the concept
- ✅ Processing 1-3 symbols
- ✅ Email notifications are sufficient
- ✅ Want to minimize costs
- ✅ Prefer simpler setup

---

## Customization Examples

### Add More Symbols (Both Workflows)

Edit the **"Set Trading Symbols"** node:

```javascript
const symbols = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD',
  'USDCAD', 'NZDUSD', 'EURGBP', 'EURJPY'
];

return symbols.map(symbol => ({
  json: {
    symbol,
    timeframe: 'M30',
    marketSummary: `Current market for ${symbol}...`
  }
}));
```

### Change Confidence Threshold

Both workflows use `0.7` (70%). To change:

**Full Workflow**: Set environment variable
```bash
CONFIDENCE_THRESHOLD=0.8
```

**Simple Workflow**: Edit "Confidence >= 70%?" node
```javascript
{
  "value2": 0.8  // Change from 0.7 to 0.8
}
```

### Add Telegram Notifications

Add a new node after email in either workflow:

```javascript
// HTTP Request to Telegram Bot API
{
  "method": "POST",
  "url": "https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/sendMessage",
  "body": {
    "chat_id": "{{ $env.TELEGRAM_CHAT_ID }}",
    "text": "🚨 Trade Signal: {{ $json.symbol }} {{ $json.direction }}\nConfidence: {{ $json.confidence * 100 }}%",
    "parse_mode": "HTML"
  }
}
```

---

## Support

- **Full Workflow Issues**: Check OpenAI API quota, pgvector installation
- **Simple Workflow Issues**: Verify PostgreSQL connection, Grok API key
- **Both**: See `N8N-SETUP.md` for detailed troubleshooting

---

## Summary

| Aspect | Full | Simple |
|--------|------|--------|
| **Setup Time** | 30-45 min | 15-20 min |
| **Monthly Cost** | $100-150 | $20-50 |
| **Maintenance** | Medium | Low |
| **Scalability** | High | Medium |
| **Best For** | Production | Testing |

Choose the workflow that matches your current needs - you can always upgrade later! 🚀
