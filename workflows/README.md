# 📧 Email Summary Workflows

This directory contains two complete implementations of an automated email summarization system:

1. **n8n Visual Workflow** (Recommended for beginners)
2. **TypeScript Service** (Advanced, code-based approach)

---

## 🎯 Which Approach Should You Use?

### Use **n8n Workflow** if you:
- ✅ Want a **quick, visual** setup (5 minutes)
- ✅ Prefer **drag-and-drop** workflow building
- ✅ Need to **iterate quickly** without coding
- ✅ Want a standalone solution (no database required)
- ✅ Are **new to automation** or n8n

### Use **TypeScript Service** if you:
- ✅ Want **full control** and customization
- ✅ Need to **integrate** with existing TypeScript codebase
- ✅ Want **RAG (vector search)** for historical email patterns
- ✅ Need **PostgreSQL storage** for analytics
- ✅ Plan to build **advanced features** (ML, analytics, etc.)

---

## 📂 Files Overview

| File | Type | Description |
|------|------|-------------|
| `email-daily-summary.json` | n8n Workflow | Import-ready n8n workflow |
| `EMAIL_SUMMARY_SETUP.md` | Documentation | Complete setup guide for n8n workflow |
| `COMPARISON.md` | Guide | Detailed comparison of both approaches |
| `../src/services/emailSummaryService.ts` | TypeScript | Email service implementation |
| `../src/services/scheduledEmailSummary.ts` | TypeScript | Cron scheduler for email service |
| `../src/emailScheduler.ts` | TypeScript | Entry point for email scheduler |

---

## 🚀 Quick Start

### Option 1: n8n Workflow (5 minutes)

1. **Import workflow:**
   ```bash
   # In n8n UI: Import from file → email-daily-summary.json
   ```

2. **Configure credentials:**
   - Gmail OAuth2
   - OpenAI API key

3. **Activate workflow:**
   - Click "Active" toggle in n8n

**That's it!** 🎉 You'll receive daily summaries every morning at 7 AM.

See [`EMAIL_SUMMARY_SETUP.md`](./EMAIL_SUMMARY_SETUP.md) for detailed instructions.

---

### Option 2: TypeScript Service (10 minutes)

1. **Install dependencies:**
   ```bash
   npm install googleapis
   ```

2. **Set up Gmail OAuth2:**
   - Follow Google Cloud Console setup
   - Add credentials to `.env`

3. **Run database migrations:**
   ```bash
   npm run init-db
   ```

4. **Start scheduler:**
   ```bash
   npm run email-scheduler
   ```

See [`TYPESCRIPT_SERVICE.md`](./TYPESCRIPT_SERVICE.md) for detailed instructions.

---

## 🎨 Features Comparison

| Feature | n8n Workflow | TypeScript Service |
|---------|-------------|-------------------|
| **Setup Time** | 5 minutes | 10-15 minutes |
| **Visual Editor** | ✅ Yes | ❌ No (code only) |
| **Database Storage** | ❌ No | ✅ Yes (PostgreSQL) |
| **Vector Search (RAG)** | ❌ No | ✅ Yes |
| **Custom Logic** | Limited | ✅ Full control |
| **Auto-scaling** | ✅ n8n handles it | Manual |
| **Debugging** | ✅ Visual logs | Code debugging |
| **Cost** | n8n hosting fee | Self-hosted (free) |
| **Email Analytics** | Manual export | ✅ Built-in SQL |
| **ML Integration** | External only | ✅ Native |

---

## 📊 Architecture Comparison

### n8n Workflow Architecture

```
Schedule Trigger (7 AM)
    ↓
Gmail: Fetch Emails (label: ToSummarize)
    ↓
Code: Format & Extract Links
    ↓
OpenAI: Generate AI Summary
    ↓
Code: Create HTML Email
    ↓
Gmail: Send Email + Apply Label
```

**Data Flow:** All in-memory, no persistence

---

### TypeScript Service Architecture

```
Cron Scheduler (7 AM)
    ↓
EmailSummaryService.fetchEmails()
    ├── Gmail API (OAuth2)
    └── Returns: EmailItem[]
    ↓
EmailSummaryService.generateSummary()
    ├── Grok AI API
    └── Returns: GrokEmailSummaryResponse
    ↓
EmbeddingService.generateEmbedding()
    ├── OpenAI Embeddings
    └── Returns: vector[1536]
    ↓
EmailSummaryService.saveToDatabase()
    ├── PostgreSQL + pgvector
    └── Stores: summary + embedding
    ↓
EmailSummaryService.sendEmail()
    ├── Gmail API
    └── Sends: HTML digest + applies label
```

**Data Flow:** Persistent storage with vector embeddings for RAG

---

## 🔧 Customization Examples

### n8n: Change Schedule

Edit the "Every Morning at 7 AM" node:
```javascript
// Every 4 hours
"0 */4 * * *"

// Weekdays only at 9 AM
"0 9 * * 1-5"
```

### TypeScript: Change Schedule

Edit `.env`:
```bash
EMAIL_SUMMARY_CRON=0 9 * * 1-5
```

---

### n8n: Change AI Provider

Replace "OpenAI" node with "HTTP Request" node:
```json
{
  "url": "https://api.x.ai/v1/chat/completions",
  "method": "POST",
  "body": {
    "model": "grok-beta",
    "messages": [...]
  }
}
```

### TypeScript: Change AI Provider

Already uses Grok by default! Edit `src/services/emailSummaryService.ts`:
```typescript
const response = await grokService.analyzeMarket(prompt);
```

---

## 💰 Cost Breakdown

### n8n Workflow

| Service | Cost |
|---------|------|
| n8n Cloud | $20/mo (Starter) or Free (self-hosted) |
| OpenAI API | ~$0.01/day (GPT-4o-mini, 30 emails) |
| Gmail API | Free |
| **Total** | **$0.30/mo** + n8n hosting |

### TypeScript Service

| Service | Cost |
|---------|------|
| Self-hosting | Free (or your server cost) |
| PostgreSQL | Free (self-hosted) |
| Grok API | ~$0.005/day (cheaper than OpenAI) |
| Gmail API | Free |
| **Total** | **$0.15/mo** + server costs |

---

## 🔐 Security Comparison

### n8n Workflow
- ✅ OAuth2 for Gmail (secure)
- ✅ Encrypted credential storage in n8n
- ⚠️ Data passes through n8n cloud (if using cloud version)
- ✅ No persistent storage of emails

### TypeScript Service
- ✅ OAuth2 for Gmail (secure)
- ✅ Environment variable credentials
- ✅ Fully self-hosted (100% privacy)
- ✅ Encrypted vector embeddings in PostgreSQL
- ⚠️ Requires proper server security setup

---

## 📈 When to Migrate

**Start with n8n**, then migrate to TypeScript if you need:

1. **Historical Analysis:**
   - "Show me email patterns from last quarter"
   - Vector search for similar email summaries

2. **Advanced Analytics:**
   - Dashboard with email trends
   - Sender analytics and priority scoring

3. **Custom ML Models:**
   - Fine-tuned classification
   - Custom embeddings

4. **API Integration:**
   - Expose email summaries via REST API
   - Integrate with other services

---

## 🛠️ Troubleshooting

### Common Issues (Both Approaches)

| Issue | Solution |
|-------|----------|
| Gmail auth fails | Re-authenticate OAuth2, check scopes |
| No emails received | Check label exists, verify workflow is active |
| AI errors | Verify API key, check rate limits |
| Links broken | Enable HTML in email client |

### n8n Specific

| Issue | Solution |
|-------|----------|
| Workflow not triggering | Check schedule, ensure workflow is activated |
| Node execution fails | Check logs in execution view |

### TypeScript Specific

| Issue | Solution |
|-------|----------|
| Database connection fails | Check PostgreSQL is running, verify credentials |
| Import errors | Run `npm install googleapis` |
| Cron not running | Check syntax with crontab.guru |

---

## 📚 Next Steps

### After Setup:

1. **Test manually first** (don't wait for cron)
2. **Monitor the first few runs** (check logs)
3. **Adjust AI prompt** based on summary quality
4. **Fine-tune schedule** (maybe every 4 hours instead of daily)
5. **Add filters** (specific senders, keywords, etc.)

### Advanced Features to Add:

- 🔔 **Slack/Discord notifications**
- 📊 **Dashboard** for email analytics
- 🤖 **Auto-reply** to certain emails
- 📅 **Calendar integration** (extract meeting times)
- 🏷️ **Smart labeling** (auto-categorize emails)

---

## 🆘 Support

- **n8n Workflow Issues:** [community.n8n.io](https://community.n8n.io)
- **TypeScript Service Issues:** Check logs in `./logs/trading-workflow.log`
- **Gmail API Issues:** [Google Cloud Console](https://console.cloud.google.com)
- **AI API Issues:** Check provider documentation (OpenAI/Grok)

---

## 📝 License

Both implementations are MIT licensed. Free to use and modify!

---

**Happy Automating!** 🚀

Got questions? Open an issue or check the detailed setup guides:
- [`EMAIL_SUMMARY_SETUP.md`](./EMAIL_SUMMARY_SETUP.md) - n8n workflow
- [`TYPESCRIPT_SERVICE.md`](./TYPESCRIPT_SERVICE.md) - TypeScript service
