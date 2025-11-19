# 📧 Email Daily Summary Workflow - Setup Guide

## Overview

This n8n workflow automatically summarizes your emails every morning and sends you a beautiful HTML digest with:
- 🤖 AI-powered summary of all emails
- 📎 Direct links to each email in Gmail
- ✨ Beautiful, mobile-responsive HTML design
- 🏷️ Auto-labeling for organization

---

## 🎯 What This Workflow Does

1. **Runs every morning at 7 AM** (customizable)
2. **Fetches unread emails** from a specified Gmail label
3. **Summarizes them** using AI (OpenAI GPT-4 or Grok)
4. **Creates a beautiful HTML email** with all summaries and links
5. **Sends it to you** and applies "Mail Summary" label
6. **Marks original emails** as processed

---

## 📋 Prerequisites

### Required:
- ✅ n8n instance (self-hosted or cloud)
- ✅ Gmail account with OAuth2 setup
- ✅ OpenAI API key (or Grok API key)

### Recommended:
- Create Gmail labels before starting:
  - `ToSummarize` (for emails you want summarized)
  - `Mail Summary` (for the digest emails)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Import Workflow into n8n

1. Open your n8n instance
2. Click **"Import from File"** or **"Import from URL"**
3. Select `email-daily-summary.json`
4. Click **"Import"**

### Step 2: Configure Gmail Credentials

1. Click on any **Gmail node** (e.g., "Fetch Emails to Summarize")
2. Click **"Create New Credential"**
3. Choose **"Gmail OAuth2"**
4. Follow the Google OAuth setup:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable **Gmail API**
   - Create **OAuth 2.0 credentials**
   - Add authorized redirect URI: `https://your-n8n-instance.com/rest/oauth2-credential/callback`
   - Copy **Client ID** and **Client Secret** to n8n
   - Click **"Connect my account"** and authorize
5. **Save credential**
6. Apply the same credential to all Gmail nodes:
   - "Fetch Emails to Summarize"
   - "Send Summary Email"
   - "Apply 'Mail Summary' Label"
   - "Mark Original Emails as Processed"

### Step 3: Configure AI Provider

**Option A: OpenAI (Recommended)**

1. Click on **"AI Summarize Emails"** node
2. Click **"Create New Credential"**
3. Enter your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
4. Model: `gpt-4o-mini` (fast and cheap) or `gpt-4o` (more powerful)
5. Save

**Option B: Grok AI (Alternative)**

Replace the OpenAI node with HTTP Request node:

```json
{
  "method": "POST",
  "url": "https://api.x.ai/v1/chat/completions",
  "authentication": "predefinedCredentialType",
  "nodeCredentialType": "grokApi",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "model": "grok-beta",
    "messages": [
      {
        "role": "system",
        "content": "You are an expert email assistant..."
      },
      {
        "role": "user",
        "content": "={{ $json.promptText }}"
      }
    ]
  }
}
```

### Step 4: Create Gmail Labels

1. Go to [Gmail](https://mail.google.com)
2. Create these labels:
   - **"ToSummarize"** - Apply this to emails you want in the daily digest
   - **"Mail Summary"** - Auto-applied to digest emails
3. Update the workflow's label IDs:
   - In **"Fetch Emails to Summarize"** node, change `label:ToSummarize` to your label name
   - In **"Apply 'Mail Summary' Label"** node, update `Label_MailSummary` to your label ID

**Finding Gmail Label IDs:**
```javascript
// Run this in Gmail API Explorer or n8n Code node
GET https://gmail.googleapis.com/gmail/v1/users/me/labels
```

### Step 5: Customize Schedule

1. Click on **"Every Morning at 7 AM"** node
2. Change cron expression:
   - `0 7 * * *` = 7:00 AM daily
   - `0 9 * * 1-5` = 9:00 AM weekdays only
   - `0 */4 * * *` = Every 4 hours
3. Save

### Step 6: Test the Workflow

1. **Manually add emails to "ToSummarize" label** in Gmail
2. Click **"Execute Workflow"** in n8n
3. Check execution log for errors
4. Verify you received the summary email
5. Check if "Mail Summary" label was applied

---

## ⚙️ Customization Options

### Change Email Filter

Edit **"Fetch Emails to Summarize"** node:

```javascript
// Current filter: Unread emails from last 24 hours with label "ToSummarize"
"q": "is:unread label:ToSummarize newer_than:1d"

// Alternatives:
"q": "from:boss@company.com newer_than:1d"  // From specific sender
"q": "label:Important newer_than:1d"         // Important label only
"q": "is:starred newer_than:1d"              // Starred emails
"q": "subject:invoice newer_than:7d"         // Invoices from last week
```

### Change AI Prompt

Edit **"AI Summarize Emails"** system prompt:

```javascript
// For urgent/action items focus:
"You are an email triage assistant. For each email, identify:
1. Urgency level (Critical/High/Medium/Low)
2. Action required (Yes/No) and deadline
3. Key decision needed
Format as: [URGENCY] Summary - Action: deadline"

// For meeting-focused summaries:
"You are a calendar assistant. For each email, extract:
1. Meeting requests with date/time
2. Agenda items
3. Who's attending
Highlight any conflicts or urgent RSVPs needed."
```

### Change Email Design

Edit **"Create Summary Email HTML"** node to customize colors, fonts, layout:

```css
/* Change theme colors */
--primary-color: #4CAF50;  /* Green - change to your brand */
--text-color: #333;
--background: #f5f5f5;

/* Examples: */
/* Blue theme: #2196F3 */
/* Purple theme: #9C27B0 */
/* Red theme: #F44336 */
```

### Limit Email Count

Edit **"Fetch Emails to Summarize"** node:

```json
{
  "limit": 50  // Change to 10, 20, or 100
}
```

---

## 🎨 Advanced Features

### Feature 1: Priority Sorting

Add a Code node after AI summary to sort by priority:

```javascript
const summary = $json.message.content;

// Extract priority from AI response
const emails = $('Format Emails with Links').item(0).json.emails;
const prioritized = emails.sort((a, b) => {
  // Your priority logic here
  return b.priority - a.priority;
});

return { emails: prioritized };
```

### Feature 2: Auto-Archive After Summary

Add Gmail node at the end:

```json
{
  "operation": "addLabels",
  "messageId": "={{ $json.messageId }}",
  "labelIds": ["ARCHIVED"]
}
```

### Feature 3: Send to Multiple Recipients

Edit **"Send Summary Email"** node:

```json
{
  "toEmail": "you@gmail.com",
  "options": {
    "ccList": "team@company.com,manager@company.com"
  }
}
```

### Feature 4: Weekly Digest Instead

Change schedule trigger:

```bash
# Weekly digest every Monday at 8 AM
"cronExpression": "0 8 * * 1"

# Bi-weekly on Mondays
"cronExpression": "0 8 */14 * 1"
```

And update email filter:

```javascript
"q": "is:unread label:ToSummarize newer_than:7d"  // Last 7 days
```

---

## 🐛 Troubleshooting

### Issue: No emails received

**Check:**
1. Workflow is **activated** (toggle in top-right)
2. Schedule trigger shows next execution time
3. Gmail credentials are connected
4. Emails exist with correct label
5. Check workflow execution history for errors

**Solution:**
- Click "Execute Workflow" manually to test
- Check n8n logs: Settings → Log Streaming

### Issue: Gmail authentication failed

**Fix:**
1. Reconnect Gmail OAuth2 credential
2. Make sure Gmail API is enabled in Google Cloud
3. Check redirect URI matches your n8n instance
4. Verify OAuth consent screen is configured

### Issue: AI node fails

**Check:**
1. OpenAI API key is valid and has credits
2. Model name is correct (`gpt-4o-mini` not `gpt-4-mini`)
3. Request isn't too large (max ~8000 tokens for input)

**Solution:**
- Reduce email limit to 20-30 emails max
- Use `gpt-4o-mini` instead of `gpt-4o` for speed/cost

### Issue: Email doesn't have "Mail Summary" label

**Fix:**
1. Create the label in Gmail first
2. Get the label ID:
   ```bash
   # In n8n Code node or API explorer:
   GET https://gmail.googleapis.com/gmail/v1/users/me/labels
   ```
3. Update node with correct `labelId`

### Issue: Links don't work in summary email

**Check:**
1. Email is being viewed in HTML mode (not plain text)
2. Links are properly formatted with `https://`
3. Message IDs are correctly extracted

**Solution:**
- Test with Gmail web interface first
- Check browser console for errors
- Verify message ID format in execution log

---

## 💰 Cost Estimate

### OpenAI Costs (GPT-4o-mini)

- **Input:** ~500 tokens per email (50 emails = 25,000 tokens)
- **Output:** ~100 tokens per summary
- **Cost:** ~$0.01 per day (30 emails/day)
- **Monthly:** ~$0.30/month

### n8n Costs

- **Cloud:** Free tier allows 5,000 workflow executions/month
- **Self-hosted:** Free (only server costs)

**Total:** Less than $1/month for typical use

---

## 🔒 Security & Privacy

### Best Practices:

1. **Use OAuth2** (not API keys) for Gmail
2. **Limit email access** to specific labels only
3. **Don't log sensitive data** in n8n execution logs
4. **Rotate API keys** every 90 days
5. **Use environment variables** for credentials

### Data Privacy:

- ✅ Emails are processed in-memory only
- ✅ No data is permanently stored (except in your Gmail)
- ✅ AI provider (OpenAI) may log requests for 30 days
- ✅ Use self-hosted n8n for complete control

---

## 📊 Performance Tips

### Optimize for Speed:

1. **Use `gpt-4o-mini`** instead of `gpt-4o` (10x faster, 1/10th cost)
2. **Limit to 30 emails** per run
3. **Fetch only necessary fields** in Gmail node
4. **Use shorter AI prompts** (<500 tokens)

### Optimize for Accuracy:

1. **Use `gpt-4o`** for better summaries
2. **Add examples** in system prompt
3. **Increase temperature** to 0.5 for more natural language
4. **Include email metadata** (sender reputation, thread context)

---

## 🔄 Alternative Approaches

### Option 1: Use Grok Instead of OpenAI

**Pros:**
- Potentially lower cost
- Real-time information access
- Longer context window

**Setup:**
1. Replace OpenAI node with HTTP Request
2. Use Grok API endpoint: `https://api.x.ai/v1/chat/completions`
3. Model: `grok-beta`

### Option 2: Use Local LLM (Free)

**Pros:**
- Completely private
- Zero API costs
- Full control

**Setup:**
1. Run Ollama locally: `ollama serve`
2. Pull model: `ollama pull llama3.1:8b`
3. Replace OpenAI node with HTTP Request to `http://localhost:11434/api/chat`

### Option 3: TypeScript Service (Advanced)

For developers who want to extend the existing TypeScript codebase:

See `/home/user/n8n-automation/workflows/email-summary-service/` for:
- Full TypeScript implementation
- PostgreSQL storage for summaries
- RAG integration for context
- Advanced analytics

---

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Gmail API Reference](https://developers.google.com/gmail/api)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Cron Expression Generator](https://crontab.guru/)

---

## 🎯 Next Steps

After setup, you can:

1. **Add more labels** to track different email categories
2. **Create multiple workflows** for different time periods (morning/evening)
3. **Integrate with Slack/Discord** for team summaries
4. **Add sentiment analysis** to identify urgent/important emails
5. **Build a dashboard** to visualize email patterns

---

## 💡 Smart Tips

1. **Use filters wisely:** Don't summarize ALL emails, just important ones
2. **Start small:** Begin with 10-20 emails, then scale up
3. **Iterate on the prompt:** Refine AI instructions based on output quality
4. **Monitor costs:** Set up OpenAI usage alerts
5. **Test before scheduling:** Run manually a few times first

---

## 🎉 You're All Set!

Your email summary workflow is ready to save you hours every week!

**Need help?**
- Check n8n community forum: [community.n8n.io](https://community.n8n.io)
- Review execution logs in n8n interface
- Test each node individually to isolate issues

**Happy automating!** 🚀
