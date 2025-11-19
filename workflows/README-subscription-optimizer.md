# Subscription Optimizer Workflow - Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Import Workflow
```bash
# In n8n UI:
# Workflows → Add Workflow → Import from File → Select subscription-optimizer-workflow.json
```

### 2. Set Environment Variables

In your n8n settings (Settings → Variables):

```bash
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=sk-your-key-here
GOOGLE_SHEETS_ID=your-google-sheet-id
```

### 3. Configure Google Sheets

Create a Google Sheet with two tabs:

**Tab 1: `Subscriptions`**
```
| user_id | name | cost | billing_cycle | category | renewal_date |
```

**Tab 2: `SubscriptionAlternatives`**
```
| timestamp | user_id | subscription | current_cost | best_alternative | alternative_cost | savings_month | savings_year | feature_match_percent | recommendation |
```

Share the sheet with your n8n service account email.

### 4. Test It!

```bash
# Replace YOUR_N8N_URL with your instance URL
curl -X POST https://YOUR_N8N_URL/webhook/subscription-optimizer \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test",
    "scan_gmail": false,
    "manual_subscriptions": [
      {
        "name": "ChatGPT Plus",
        "cost": 20,
        "billing_cycle": "monthly",
        "category": "ai"
      }
    ]
  }'
```

## 📊 Expected Response

```json
{
  "status": "success",
  "user_id": "test",
  "total_subscriptions": 1,
  "total_monthly_cost": 20.00,
  "total_monthly_savings": 20.00,
  "total_yearly_savings": 240.00,
  "savings_percentage": 100,
  "subscriptions": [
    {
      "name": "ChatGPT Plus",
      "current_cost": 20.00,
      "best_alternative": "Claude.ai Free Tier",
      "alternative_cost": 0,
      "savings_month": 20.00,
      "savings_year": 240.00,
      "feature_match_percent": 85,
      "worth_switching": true,
      "recommendation": "Claude.ai offers similar capabilities..."
    }
  ],
  "summary": "..."
}
```

## 🎯 Workflow Features

✅ Multi-source subscription collection (Webhook, Google Sheets, Gmail)
✅ AI-powered alternative discovery
✅ Feature comparison & savings calculation
✅ Automated Google Sheets logging
✅ Error handling & graceful degradation
✅ Production-ready JSON responses

## 📁 Files Included

- `subscription-optimizer-workflow.json` - Import this into n8n
- `subscription-optimizer-workflow.md` - Complete documentation
- `subscription-optimizer-examples.sh` - 8 example curl commands
- `README-subscription-optimizer.md` - This quick start guide

## 🔧 Supported LLM Providers

Change `LLM_API_URL` to use different providers:

| Provider | URL |
|----------|-----|
| OpenAI | `https://api.openai.com/v1/chat/completions` |
| Anthropic | `https://api.anthropic.com/v1/messages` |
| Groq | `https://api.groq.com/openai/v1/chat/completions` |
| Ollama (Local) | `http://localhost:11434/api/generate` |

Note: You may need to adjust the HTTP Request node for non-OpenAI APIs.

## 🐛 Troubleshooting

**Gmail not working?**
- Enable Gmail API in Google Cloud Console
- Add OAuth2 scopes: `https://www.googleapis.com/auth/gmail.readonly`
- Check the search query in the Gmail node

**LLM errors?**
- Verify API key is correct
- Check API URL matches your provider
- Ensure model supports JSON mode
- Review rate limits

**Google Sheets permissions?**
- Share sheet with service account email
- Enable Google Sheets API
- Verify sheet name matches exactly

## 📖 Full Documentation

See `subscription-optimizer-workflow.md` for complete details on:
- Workflow architecture
- Advanced configuration
- LLM prompt optimization
- Cost estimation
- Customization options

## 💡 Usage Tips

1. **Start simple**: Test with manual subscriptions first
2. **Add Gmail later**: Enable after basic workflow works
3. **Review results**: Check Google Sheets for detailed logs
4. **Customize prompts**: Edit LLM prompt for better results
5. **Batch processing**: Can handle 50+ subscriptions per run

## 🎓 Example Use Cases

- Personal subscription audit
- Team/company subscription optimization
- Monthly cost review automation
- Budget planning tool
- Subscription recommendation engine

---

**Need Help?** Check `subscription-optimizer-workflow.md` for detailed troubleshooting and advanced features.
