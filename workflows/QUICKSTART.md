# Audience-Problem Matcher - Quick Start Guide

Get started with the Audience-Problem Matcher workflow in 5 minutes!

## Prerequisites

- ✅ n8n instance running (self-hosted or cloud)
- ✅ OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Installation Steps

### Step 1: Import Workflow

1. Open your n8n instance
2. Navigate to **Workflows** in the left sidebar
3. Click **Add workflow** → **Import from File**
4. Select `audience-problem-matcher.json` from this directory
5. Click **Import**

### Step 2: Configure OpenAI Credentials

1. In n8n, go to **Credentials** (top right corner)
2. Click **Add Credential**
3. Search for "OpenAI"
4. Select **OpenAI API**
5. Enter your API key
6. Click **Save**

### Step 3: Connect Credentials to Nodes

The workflow uses OpenAI in 3 nodes. Connect credentials to each:

1. Click on **Root Cause Analysis** node
2. In the right panel, find **Credential to connect with**
3. Select your OpenAI credential
4. Repeat for:
   - **Match User Strengths** node
   - **Estimate Competition** node

### Step 4: Test Run

1. Click on the **User Input** node
2. Edit the parameters:
   ```json
   {
     "topic_or_domain": "productivity apps",
     "user_strengths": "Software developer, 5 years experience, React and Node.js expert"
   }
   ```
3. Click **Execute Workflow** (top right)
4. Wait 30-60 seconds for completion
5. Check results in **Format Final Output** node

## Expected Output

You should see:

```json
{
  "summary": {
    "topic_analyzed": "productivity apps",
    "total_problems_found": 10,
    "top_opportunities_count": 5,
    "average_fit_score": 75
  },
  "top_5_recommendations": [
    {
      "rank": 1,
      "niche": "How to build custom productivity workflows",
      "audience": "Developers, Tech professionals",
      "trend": "up (popularity: 68/100)",
      "competition": "medium",
      "fit_score": 87,
      "fit_reason": "Your React and Node.js skills align perfectly..."
    }
  ]
}
```

## Troubleshooting

### "OpenAI credentials not set"
- Go back to Step 3 and ensure all LLM nodes have credentials connected

### "Reddit API returned no results"
- Try a different topic (more mainstream topics work better)
- Reddit may be rate-limiting - wait a minute and try again

### "Google Trends failed"
- This is expected for some queries (optional data source)
- The workflow continues without it

### "LLM returned invalid JSON"
- Rare parsing error - click **Execute Workflow** again
- Usually works on second try

## Cost Estimate

Per workflow execution:
- **API Calls**: ~30 OpenAI API calls
- **Model**: gpt-4o-mini
- **Cost**: ~$0.05 - $0.15 USD per run

To reduce costs:
- Process fewer problems (change from 10 to 5)
- Use cached results for repeated topics

## Next Steps

### Customize for Your Use Case

**For Product Ideation:**
```json
{
  "topic_or_domain": "B2B SaaS tools for remote teams",
  "user_strengths": "Product manager, 8 years in SaaS, UX design background"
}
```

**For Content Strategy:**
```json
{
  "topic_or_domain": "sustainable living",
  "user_strengths": "Environmental scientist, blogger, public speaker"
}
```

**For Service Business:**
```json
{
  "topic_or_domain": "social media marketing",
  "user_strengths": "Digital marketer, 10k Instagram followers, video editing"
}
```

### Automate with Webhooks

1. Replace **Manual Trigger** with **Webhook** node
2. Get webhook URL
3. Call from external apps:

```bash
curl -X POST https://your-n8n.com/webhook/audience-matcher \
  -H "Content-Type: application/json" \
  -d '{
    "topic_or_domain": "your topic",
    "user_strengths": "your skills"
  }'
```

### Save Results to Database

Add a **PostgreSQL** node after **Format Final Output**:
1. Connect to your database
2. Insert results into `opportunities` table
3. Track trends over time

### Send Email Reports

Add **Send Email** node:
1. Connect after **Format Final Output**
2. Format top 5 recommendations as HTML
3. Send to your email

## Example Use Cases

### 1. Weekly Niche Discovery
- Schedule workflow to run weekly
- Analyze trending topics in your industry
- Store results in database
- Email top opportunities

### 2. Client Research Tool
- Input: Client's industry
- Strengths: Your agency's services
- Output: Pitch-ready niche opportunities

### 3. Personal Career Planning
- Input: Target job market
- Strengths: Your skills and experience
- Output: Where you can add most value

## Support

- 📖 Full documentation: See [README.md](./README.md)
- 🐛 Issues: Report on GitHub
- 💡 Ideas: Submit feature requests

## Quick Reference

| Node Name | Purpose | Requires Setup |
|-----------|---------|----------------|
| Manual Trigger | Start workflow | ❌ No |
| User Input | Set topic + strengths | ✅ Edit values |
| Google Autosuggest API | Find trending queries | ❌ No |
| Reddit Search API | Find real discussions | ❌ No |
| Merge & Rank Problems | Combine sources | ❌ No |
| Google Trends API | Get trend data | ❌ No (optional) |
| Identify Personas | Detect audiences | ❌ No |
| Root Cause Analysis | LLM analysis | ✅ OpenAI creds |
| Match User Strengths | LLM matching | ✅ OpenAI creds |
| Estimate Competition | LLM estimation | ✅ OpenAI creds |
| Format Final Output | Structure results | ❌ No |

---

**Ready to discover your next big opportunity?** 🚀

Start exploring niches that match your unique strengths!
