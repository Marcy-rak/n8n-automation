# Subscription Optimizer – Cost Saver AI

## Overview

This n8n workflow helps users identify and analyze their subscription expenses, then uses AI to find cheaper alternatives with feature comparisons, calculating potential savings.

## Features

- **Multi-source subscription collection:**
  - Manual input via webhook
  - Google Sheets database
  - Optional Gmail inbox scanning

- **AI-powered analysis:**
  - Finds cheaper alternatives
  - Compares features
  - Suggests free/open-source options
  - Calculates potential savings

- **Automated reporting:**
  - Stores results in Google Sheets
  - Returns detailed JSON report
  - Includes monthly and annual savings projections

## Workflow Architecture

```
┌─────────────┐
│   Webhook   │ (Trigger)
└──────┬──────┘
       │
       v
┌──────────────────┐
│ Initialize Data  │
└──────┬───────────┘
       │
       v
┌──────────────────┐     YES     ┌─────────────┐
│ Check Gmail Scan?├────────────>│ Gmail Scan  │
└──────┬───────────┘             └──────┬──────┘
       │ NO                              │
       │                                 │
       v                                 v
┌──────────────────────────────────────────┐
│    Read Google Sheets Subscriptions      │
└──────┬───────────────────────────────────┘
       │
       v
┌──────────────────────────────────────────┐
│  Merge & Deduplicate All Sources         │
└──────┬───────────────────────────────────┘
       │
       v
┌──────────────────────────────────────────┐
│  Loop: LLM Alternative Analysis          │
│  (For each subscription)                 │
└──────┬───────────────────────────────────┘
       │
       v
┌──────────────────────────────────────────┐
│  Calculate Total Savings                 │
└──────┬───────────────────────────────────┘
       │
       v
┌──────────────────────────────────────────┐
│  Write Results to Google Sheets          │
└──────┬───────────────────────────────────┘
       │
       v
┌──────────────────────────────────────────┐
│  Format & Return Response                │
└──────────────────────────────────────────┘
```

## Setup Instructions

### 1. Environment Variables

Set these in your n8n environment:

```bash
# LLM API Configuration
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=your_api_key_here

# Google Sheets Configuration
GOOGLE_SHEETS_ID=your_sheet_id_here

# Optional: Gmail
GMAIL_ACCOUNT=your_email@gmail.com
```

### 2. Google Sheets Setup

Create a Google Sheet with two sheets:

#### Sheet 1: `Subscriptions`
| user_id | name | cost | billing_cycle | category | renewal_date |
|---------|------|------|---------------|----------|--------------|
| 12345 | Netflix | 15.49 | monthly | entertainment | 2025-12-01 |
| 12345 | Adobe Creative Cloud | 54.99 | monthly | design | 2025-11-25 |

#### Sheet 2: `SubscriptionAlternatives`
| timestamp | user_id | subscription | current_cost | best_alternative | alternative_cost | savings_month | savings_year | feature_match_percent | recommendation |
|-----------|---------|--------------|--------------|------------------|------------------|---------------|--------------|----------------------|----------------|

### 3. Google Cloud Credentials

1. Create a Google Cloud project
2. Enable Gmail API (if using Gmail scan) and Google Sheets API
3. Create OAuth2 credentials or Service Account
4. Share your Google Sheet with the service account email
5. Configure credentials in n8n

### 4. Import Workflow

1. Copy the JSON from `subscription-optimizer-workflow.json`
2. In n8n: **Workflows** → **Import from File** or **Import from URL**
3. Paste the JSON
4. Configure credentials for:
   - Gmail (optional)
   - Google Sheets
   - HTTP Request (LLM API)

## API Usage

### Request Schema

**POST** `/webhook/subscription-optimizer`

```json
{
  "user_id": "12345",
  "scan_gmail": true,
  "manual_subscriptions": [
    {
      "name": "Canva Pro",
      "cost": 16,
      "billing_cycle": "monthly",
      "category": "design"
    },
    {
      "name": "Spotify Premium",
      "cost": 10.99,
      "billing_cycle": "monthly",
      "category": "music"
    }
  ]
}
```

### Response Schema

```json
{
  "status": "success",
  "user_id": "12345",
  "total_subscriptions": 5,
  "total_monthly_cost": 87.47,
  "total_monthly_savings": 43.00,
  "total_yearly_savings": 516.00,
  "savings_percentage": 49.2,
  "subscriptions": [
    {
      "name": "Canva Pro",
      "current_cost": 16.00,
      "billing_cycle": "monthly",
      "best_alternative": "Adobe Express Free",
      "alternative_cost": 0,
      "savings_month": 16.00,
      "savings_year": 192.00,
      "feature_match_percent": 82,
      "recommendation": "High savings potential with good feature match"
    }
  ],
  "timestamp": "2025-11-19T10:30:00Z"
}
```

### Error Response

```json
{
  "status": "error",
  "error": "Gmail API authentication failed",
  "message": "Unable to scan Gmail inbox. Proceeding with manual input only.",
  "timestamp": "2025-11-19T10:30:00Z"
}
```

## LLM Prompt Strategy

The workflow sends this prompt to the LLM for each subscription:

```
You are a subscription cost optimization expert. Analyze this subscription and find cheaper alternatives.

Subscription Details:
- Name: {name}
- Current Cost: ${cost}/{billing_cycle}
- Category: {category}

Task:
1. Identify 3-5 cheaper alternatives (including free options)
2. Compare key features
3. Calculate savings
4. Rate feature match (0-100%)

Return JSON only:
{
  "subscription": "...",
  "current_cost": 0,
  "alternatives": [
    {
      "name": "...",
      "cost": 0,
      "billing_cycle": "monthly",
      "savings_month": 0,
      "savings_year": 0,
      "feature_match_percent": 0,
      "key_features": ["..."],
      "limitations": ["..."]
    }
  ],
  "recommendation": "..."
}
```

## Testing

### Example 1: Basic Test (Manual Input Only)

```bash
curl -X POST https://your-n8n-instance.com/webhook/subscription-optimizer \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_001",
    "scan_gmail": false,
    "manual_subscriptions": [
      {
        "name": "ChatGPT Plus",
        "cost": 20,
        "billing_cycle": "monthly",
        "category": "ai"
      },
      {
        "name": "GitHub Copilot",
        "cost": 10,
        "billing_cycle": "monthly",
        "category": "development"
      }
    ]
  }'
```

### Example 2: Full Test (With Gmail Scan)

```bash
curl -X POST https://your-n8n-instance.com/webhook/subscription-optimizer \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_12345",
    "scan_gmail": true,
    "manual_subscriptions": [
      {
        "name": "Notion",
        "cost": 10,
        "billing_cycle": "monthly",
        "category": "productivity"
      }
    ]
  }'
```

## Configuration Options

### Customizing the LLM

The workflow uses environment variables for LLM configuration:

- **OpenAI:** `LLM_API_URL=https://api.openai.com/v1/chat/completions`
- **Anthropic Claude:** `LLM_API_URL=https://api.anthropic.com/v1/messages`
- **Local (Ollama):** `LLM_API_URL=http://localhost:11434/api/generate`
- **Groq:** `LLM_API_URL=https://api.groq.com/openai/v1/chat/completions`

### Gmail Search Customization

Modify the Gmail search query in the Gmail node:

```
subject:(subscription OR renewal OR invoice OR receipt OR membership)
newer_than:6m
```

### Savings Threshold

Adjust the "worth switching" threshold in the Calculate Savings node:

```javascript
// Current default: $10/month or 70% feature match
const SAVINGS_THRESHOLD = 10;
const FEATURE_MATCH_THRESHOLD = 70;
```

## Troubleshooting

### Gmail Returns No Results

- Check Gmail API is enabled
- Verify OAuth2 scopes include `https://www.googleapis.com/auth/gmail.readonly`
- Adjust search date range (default: 6 months)

### LLM Returns Invalid JSON

- Check API key is valid
- Verify API URL is correct
- Ensure model supports JSON mode (GPT-4, Claude 3+)
- Check rate limits

### Google Sheets Permission Denied

- Share sheet with service account email
- Verify Sheet ID is correct
- Check API is enabled in Google Cloud Console

## Cost Estimation

### Per Execution

- **LLM API calls:** ~$0.01-0.05 per subscription (varies by model)
- **Gmail API:** Free (within quotas)
- **Google Sheets API:** Free (within quotas)

Example: Analyzing 10 subscriptions ≈ $0.10-0.50 per run

## Roadmap

- [ ] Add support for CSV upload
- [ ] Implement category-specific recommendations
- [ ] Add email notifications for high-savings opportunities
- [ ] Create dashboard visualization
- [ ] Support for annual billing conversions
- [ ] Integration with banking APIs for auto-detection

## License

MIT License - Feel free to modify and use in your projects.
