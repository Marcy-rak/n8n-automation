# Automated Trading Workflow

A production-ready automated trading analysis system powered by Grok AI, PostgreSQL with pgvector for RAG-based context retrieval, and confidence-based filtering.

## Features

- **Scheduled Analysis**: Runs every 30 minutes to analyze market conditions
- **AI-Powered Insights**: Uses Grok API for intelligent trade recommendations
- **RAG Context**: Leverages historical trade data using pgvector similarity search
- **Confidence Filtering**: Only saves and notifies trades with ≥ 70% confidence (configurable)
- **Multi-Channel Notifications**: Email and WhatsApp alerts for high-confidence trades
- **Outcome Tracking**: Updates trade results and maintains performance statistics
- **Modular Architecture**: Easy integration with n8n, Make, or other automation platforms

## Architecture Overview

```
┌─────────────────┐
│   Scheduler     │  ← Runs every 30 minutes
│  (node-cron)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│     Trade Analysis Service              │
│  1. Fetch RAG context (pgvector)        │
│  2. Build prompt with history           │
│  3. Call Grok API                       │
│  4. Apply confidence threshold (≥ 0.7)  │
│  5. Generate embedding                  │
│  6. Save to database (if confident)     │
│  7. Send notifications                  │
└─────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐    ┌──────────────────┐
│   PostgreSQL     │    │  Notifications   │
│   + pgvector     │    │  - Email (SMTP)  │
│   (RAG storage)  │    │  - WhatsApp      │
└──────────────────┘    └──────────────────┘
```

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Database**: PostgreSQL 14+ with pgvector extension
- **AI Services**:
  - Grok API (trade analysis)
  - OpenAI API (embeddings for RAG)
- **Notifications**:
  - Nodemailer (email via SMTP)
  - Twilio (WhatsApp)
- **Scheduling**: node-cron
- **Logging**: Winston

## Prerequisites

1. **Node.js** 18+ and npm
2. **PostgreSQL** 14+ with **pgvector** extension
3. **Grok API Key** (from X.AI)
4. **OpenAI API Key** (for embeddings)
5. **Email SMTP** credentials (Gmail, SendGrid, etc.)
6. **Twilio Account** (optional, for WhatsApp)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

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

# Grok API
GROK_API_KEY=your_grok_api_key
GROK_API_URL=https://api.x.ai/v1/chat/completions

# OpenAI (for embeddings)
OPENAI_API_KEY=your_openai_api_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_TO=recipient@example.com

# WhatsApp (optional)
WHATSAPP_ENABLED=false
```

### 3. Setup PostgreSQL

Install pgvector extension:

```sql
CREATE EXTENSION vector;
```

Initialize database schema:

```bash
npm run init-db
```

### 4. Build TypeScript

```bash
npm run build
```

### 5. Run

**Manual run** (analyze once):
```bash
npm start
```

**Scheduler** (runs every 30 minutes):
```bash
npm run scheduler
```

**Development mode** (with ts-node):
```bash
npm run dev
```

## Configuration

All configuration is in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `CONFIDENCE_THRESHOLD` | Minimum confidence to save/notify | `0.7` |
| `SCHEDULER_INTERVAL_MINUTES` | Analysis frequency | `30` |
| `DEFAULT_SYMBOLS` | Comma-separated symbols | `EURUSD,GBPUSD,USDJPY` |
| `GROK_MODEL` | Grok model name | `grok-beta` |
| `EMBEDDING_MODEL` | OpenAI embedding model | `text-embedding-ada-002` |

## Workflow Details

### A. Scheduled Analysis (`runScheduledAnalysis`)

Every 30 minutes, the workflow:

1. **Fetches RAG Context**: Retrieves similar historical trades using pgvector
2. **Builds Grok Prompt**: Combines market data + historical context
3. **Calls Grok API**: Gets trade recommendation in strict JSON format
4. **Applies Confidence Threshold**:
   - If `confidence < 0.7`: Log and stop (no save, no notification)
   - If `confidence ≥ 0.7`: Continue to next step
5. **Generates Embedding**: Creates vector for future RAG searches
6. **Saves to Database**: Persists trade idea with all metadata
7. **Sends Notifications**: Email and/or WhatsApp alert

### B. Grok Response Format

Grok returns this strict JSON schema:

```json
{
  "symbol": "EURUSD",
  "timeframe": "M30",
  "direction": "LONG",
  "entry_price": 1.12345,
  "stop_loss": 1.12000,
  "take_profit": 1.13000,
  "confidence": 0.85,
  "rationale": "Strong bullish momentum with RSI oversold reversal",
  "notes": "Watch for NFP data release on Friday"
}
```

### C. Trade Outcome Tracking

Run the outcome checker script to evaluate past trades:

```bash
npm run check-outcomes
```

This script:
- Finds trades older than 1 day with `is_win = NULL`
- Checks if stop loss or take profit was hit (using your market data API)
- Updates `is_win`, `actual_exit_price`, and `pnl`

**Note**: You must integrate with a market data provider (see placeholders in `checkOutcomes.ts`).

## Database Schema

### `trade_ideas` Table

Stores all high-confidence trade signals:

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `symbol` | VARCHAR | Trading pair (e.g., EURUSD) |
| `timeframe` | VARCHAR | Chart timeframe (e.g., M30) |
| `direction` | VARCHAR | LONG, SHORT, or FLAT |
| `entry_price` | DECIMAL | Entry price |
| `stop_loss` | DECIMAL | Stop loss price |
| `take_profit` | DECIMAL | Take profit price |
| `confidence` | DECIMAL | AI confidence (0.0 to 1.0) |
| `rationale` | TEXT | Trade reasoning |
| `notes` | TEXT | Additional comments |
| `is_win` | BOOLEAN | NULL (pending), TRUE (win), FALSE (loss) |
| `embedding` | vector(1536) | For RAG similarity search |
| `created_at` | TIMESTAMP | Trade creation time |

### `analysis_logs` Table

Tracks all analysis runs, including rejections:

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `status` | VARCHAR | SUCCESS, REJECTED_LOW_CONFIDENCE, ERROR |
| `confidence` | DECIMAL | AI confidence score |
| `grok_response` | JSONB | Full API response |
| `error_message` | TEXT | Error details (if any) |

## Notifications

### Email (SMTP)

Configure your SMTP provider in `.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Use App Password for Gmail
EMAIL_TO=recipient@example.com
```

### WhatsApp (Twilio)

1. Sign up for [Twilio](https://www.twilio.com/)
2. Enable WhatsApp sandbox or get approved number
3. Configure in `.env`:

```bash
WHATSAPP_ENABLED=true
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WHATSAPP_TO=whatsapp:+1234567890
```

## Logging

Logs are stored in `./logs/`:
- `trading-workflow.log`: All logs
- `error.log`: Errors only

Configure log level in `.env`:
```bash
LOG_LEVEL=info  # debug, info, warn, error
```

## Integration with n8n / Make

This system is designed as modular functions that can be easily integrated:

### n8n Integration

1. **HTTP Request Node**: Call your deployed API (wrap functions in Express endpoints)
2. **Schedule Trigger**: Set to 30-minute intervals
3. **PostgreSQL Node**: Direct database queries
4. **Function Node**: Import TypeScript modules

### Make Integration

1. **HTTP Module**: Call analysis endpoints
2. **PostgreSQL Module**: Read/write trades
3. **Webhook Trigger**: Receive notifications

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run analysis once (manual) |
| `npm run scheduler` | Start 30-minute scheduler |
| `npm run init-db` | Initialize database schema |
| `npm run check-outcomes` | Update trade outcomes |
| `npm run dev` | Development mode with ts-node |

## Project Structure

```
.
├── src/
│   ├── config/              # Environment configuration
│   │   └── index.ts
│   ├── database/            # Database layer
│   │   ├── connection.ts
│   │   ├── tradeRepository.ts
│   │   └── analysisLogRepository.ts
│   ├── models/              # TypeScript interfaces
│   │   └── TradeIdea.ts
│   ├── services/            # Business logic
│   │   ├── grokService.ts          # Grok API client
│   │   ├── ragService.ts           # RAG context retrieval
│   │   ├── embeddingService.ts     # OpenAI embeddings
│   │   ├── notificationService.ts  # Email/WhatsApp
│   │   ├── tradeAnalysisService.ts # Main orchestrator
│   │   └── scheduledAnalysis.ts    # Cron job logic
│   ├── utils/               # Utilities
│   │   └── logger.ts
│   ├── scripts/             # Standalone scripts
│   │   ├── initDatabase.ts
│   │   └── checkOutcomes.ts
│   ├── index.ts             # Manual run entry
│   └── scheduler.ts         # Scheduler entry
├── schema.sql               # PostgreSQL schema
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Security Best Practices

1. **Never commit `.env`** - Already in `.gitignore`
2. **Use app passwords** for Gmail (not account password)
3. **Rotate API keys** regularly
4. **Use read-only DB user** for queries
5. **Enable SSL** for PostgreSQL in production
6. **Rate limit** Grok API calls
7. **Validate all inputs** before database operations

## Troubleshooting

### pgvector not installed

```bash
# Ubuntu/Debian
sudo apt install postgresql-14-pgvector

# Mac (Homebrew)
brew install pgvector

# Then in PostgreSQL:
CREATE EXTENSION vector;
```

### Grok API errors

- Check API key validity
- Verify rate limits (wait between calls)
- Ensure JSON response parsing handles markdown blocks

### Email not sending

- Use **App Password** for Gmail (not account password)
- Check firewall rules for port 587/465
- Test with `nodemailer` test account first

### Database connection timeout

- Verify PostgreSQL is running: `pg_isready`
- Check firewall: `telnet localhost 5432`
- Increase `connectionTimeoutMillis` in `connection.ts`

## Production Deployment

### Docker (Recommended)

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "scheduler"]
```

### Environment Variables

Use secrets management:
- **AWS**: Secrets Manager
- **Google Cloud**: Secret Manager
- **Azure**: Key Vault
- **Docker**: `.env` files with `docker-compose`

### Monitoring

- Use Winston transports for external logging (Datadog, CloudWatch, etc.)
- Set up alerts for:
  - Analysis failures
  - Low confidence streaks
  - Database errors
  - API rate limits

## Performance Optimization

1. **Database Indexing**: Already included in `schema.sql`
2. **Connection Pooling**: Configured in `connection.ts` (max 20)
3. **Batch Processing**: Process multiple symbols concurrently
4. **Caching**: Cache embeddings for repeated queries
5. **Rate Limiting**: Add delays between Grok API calls

## Roadmap

- [ ] Add more market data sources (TradingView, Yahoo Finance)
- [ ] Implement backtesting module
- [ ] Create web dashboard (React + Chart.js)
- [ ] Add support for crypto pairs
- [ ] Implement risk management rules
- [ ] Add Telegram notifications
- [ ] Create n8n workflow templates
- [ ] Add Docker Compose setup

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests, please open a GitHub issue.

---

**Disclaimer**: This software is for educational purposes only. Trading involves substantial risk. Always do your own research and never invest more than you can afford to lose.
