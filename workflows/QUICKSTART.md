# YouTube Content Manager - Quick Start Guide

Get your AI agent up and running in **15 minutes**! ⚡

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] n8n instance (cloud or self-hosted)
- [ ] Google account (for Gemini, Drive, Gmail)
- [ ] Notion account
- [ ] 15 minutes of your time

**Optional:**
- [ ] OpenAI account (for advanced features)

---

## Step 1: Get Your API Keys (5 minutes)

### A. Google Gemini API (FREE)

1. Go to: https://makersuite.google.com/app/apikey
2. Click **"Get API Key"** or **"Create API Key"**
3. Select your Google Cloud project (or create new one)
4. Copy the API key
5. ✅ Save it somewhere safe

**Cost**: FREE (60 requests/minute)

### B. Google Service Account (for Drive)

1. Go to: https://console.cloud.google.com
2. Select your project (or create new one)
3. Enable **Google Drive API**:
   - Click **"Enable APIs and Services"**
   - Search "Google Drive API"
   - Click **Enable**
4. Create Service Account:
   - **IAM & Admin** → **Service Accounts**
   - Click **"Create Service Account"**
   - Name: `youtube-content-manager`
   - Click **Create and Continue**
   - Skip optional steps, click **Done**
5. Create JSON Key:
   - Click on the service account you just created
   - Go to **Keys** tab
   - **Add Key** → **Create New Key**
   - Select **JSON**
   - Click **Create** (downloads automatically)
6. ✅ Save the JSON file
7. ✅ Copy the service account email (format: `xxx@xxx.iam.gserviceaccount.com`)

### C. Notion API

1. Go to: https://www.notion.so/my-integrations
2. Click **"+ New Integration"**
3. Name: `YouTube Content Manager`
4. Select your workspace
5. Click **Submit**
6. Copy the **Internal Integration Token**
7. ✅ Save it somewhere safe

### D. Gmail

No API key needed - we'll use OAuth2 in n8n (configured later).

---

## Step 2: Set Up Notion Database (3 minutes)

### Create Database

1. Open Notion
2. Create new page: **"YouTube Content Calendar"**
3. Type `/database` and select **"Database - Inline"**
4. Rename table to: `YouTube Content Calendar`

### Add Properties

Click **"+"** to add these properties:

| Property Name | Type | Options |
|--------------|------|---------|
| Status | Select | Draft, Script Ready, Metadata Done, Published |
| Niche | Text | - |
| Target Audience | Text | - |
| Created Date | Date | - |
| Publish Date | Date | - |
| Keywords | Multi-select | (add as you go) |
| Google Drive Link | URL | - |
| Viral Potential | Number | - |
| Video Length | Select | Short, Medium, Long |

### Share with Integration

1. Click **"Share"** (top right)
2. Search for your integration name: `YouTube Content Manager`
3. Click **Invite**
4. ✅ Done!

### Get Database ID

1. Click **"⋮"** menu → **"Copy link to view"**
2. URL looks like: `https://notion.so/xxxxx?v=yyyyy`
3. ✅ Save the `xxxxx` part (this is your database ID)

---

## Step 3: Set Up Google Drive (2 minutes)

1. Open Google Drive
2. Create new folder: **"YouTube Content"**
3. Right-click folder → **Share**
4. Paste your **service account email** (from Step 1B)
5. Give **Editor** permissions
6. Click **Share**
7. ✅ Done!

---

## Step 4: Import Workflow to n8n (2 minutes)

1. Open your n8n instance
2. Go to **Workflows**
3. Click **"Import from File"**
4. Select `youtube-content-manager.json`
5. Click **Import**
6. ✅ Workflow imported!

---

## Step 5: Configure Credentials in n8n (3 minutes)

### A. Google Gemini API

1. In n8n: **Credentials** → **New**
2. Search: `Google Gemini`
3. Name: `Google Gemini API`
4. Paste your Gemini API key (from Step 1A)
5. Click **Save**

### B. Google Service Account

1. **Credentials** → **New**
2. Search: `Google Service Account`
3. Name: `Google Service Account`
4. Upload your JSON key file (from Step 1B)
5. Click **Save**

### C. Notion API

1. **Credentials** → **New**
2. Search: `Notion API`
3. Name: `Notion API`
4. Paste your integration token (from Step 1C)
5. Click **Save**

### D. Gmail OAuth2

1. **Credentials** → **New**
2. Search: `Gmail OAuth2`
3. Name: `Gmail OAuth2`
4. Follow the OAuth2 setup wizard
5. Authenticate with your Google account
6. Click **Save**

---

## Step 6: Link Credentials to Nodes (5 minutes)

Now link your credentials to the workflow nodes:

### Gemini Nodes (4 nodes)

Find and update these nodes:
1. `Gemini: Generate Content Ideas`
2. `Gemini: Write Video Script`
3. `Gemini: Optimize Metadata`
4. `Gemini: Thumbnail Concepts`

For each:
- Click the node
- Under **Credentials**, select `Google Gemini API`
- Click **Save**

### Google Drive Node

1. Click `Save to Google Drive`
2. Select credential: `Google Service Account`
3. Under **Drive ID**: Select `My Drive`
4. Under **Folder**: Browse and select `YouTube Content`
5. Click **Save**

### Notion Node

1. Click `Save to Notion`
2. Select credential: `Notion API`
3. Under **Database ID**: Select `YouTube Content Calendar`
4. Click **Save**

### Gmail Node

1. Click `Send Gmail Notification`
2. Select credential: `Gmail OAuth2`
3. Under **Send To**: Enter your email
4. Click **Save**

---

## Step 7: Customize User Input (Optional - 2 minutes)

Edit the `User Input Handler` node to set your defaults:

```javascript
const options = {
  action: 'Please select an action',
  userInput: {
    niche: 'Tech Reviews',              // 👈 Change this
    targetAudience: 'Tech enthusiasts',  // 👈 Change this
    videoTopic: '',
    keywords: 'AI, tech, reviews',       // 👈 Change this
    userEmail: 'your-email@gmail.com'    // 👈 Change this
  }
};
```

---

## Step 8: Test Your Workflow! 🚀

1. **Activate** the workflow (toggle switch)
2. Click **"Execute Workflow"**
3. The workflow will run!

### First Test - Generate Content Ideas

The workflow will ask you to select an action. For your first test:

1. Select: `1. Generate Content Ideas`
2. Provide input (or use defaults):
   - Niche: `AI Tools`
   - Target Audience: `Content creators`
   - Keywords: `ChatGPT, automation, AI`
3. Execute!

**Expected Results** (in ~30-60 seconds):
- ✅ 10 content ideas generated
- ✅ Saved to Google Drive
- ✅ Added to Notion database
- ✅ Email notification sent

### Check Your Results

1. **Google Drive**: Open `YouTube Content` folder → You should see a new document
2. **Notion**: Open `YouTube Content Calendar` → You should see a new entry
3. **Gmail**: Check your inbox → You should have a notification email

---

## Troubleshooting

### "API key not valid" (Gemini)

- Verify API key from https://makersuite.google.com/app/apikey
- Make sure you copied the entire key (no spaces)
- Ensure Generative Language API is enabled in Google Cloud Console

### "Insufficient permissions" (Google Drive)

- Did you share the folder with your service account email?
- Service account email format: `xxx@xxx.iam.gserviceaccount.com`
- Give **Editor** permissions, not just Viewer

### "Database not found" (Notion)

- Did you share the database with your integration?
- Use the database ID from the URL (not the page ID)
- Make sure you're using the database view, not a page

### "Authentication failed" (Gmail)

- Re-authenticate OAuth2 in n8n
- Try using an App Password instead:
  - Go to https://myaccount.google.com/apppasswords
  - Create app password for "n8n"
  - Use this in n8n credentials

### Workflow times out

- Increase timeout: n8n Settings → Execution Timeout → 300 seconds
- Reduce `maxOutputTokens` in Gemini nodes (try 1024 instead of 2048)

---

## Next Steps

Now that your workflow is running:

### 1. Explore All Actions

Try each action:
- ✅ Generate Content Ideas (done!)
- ⬜ Write Video Script
- ⬜ Optimize Video Metadata
- ⬜ Generate Thumbnail Concepts
- ⬜ Complete Content Pipeline

### 2. Customize AI Prompts

Edit Gemini nodes to match your style:
- Click any Gemini node
- Modify the `text` parameter
- Adjust `temperature` (0.6 = focused, 0.9 = creative)

### 3. Set Up Your Workflow

Create your content creation routine:

**Monday**: Generate 10 content ideas
**Tuesday**: Review ideas, select 2-3 best
**Wednesday**: Write scripts for selected ideas
**Thursday**: Optimize metadata
**Friday**: Film videos

### 4. Advanced Features

Once comfortable, explore:
- **OpenAI Integration**: For advanced analysis (costs apply)
- **Full Pipeline**: Automate entire workflow
- **Custom Actions**: Add your own AI prompts
- **YouTube API**: Auto-publish (requires additional setup)

---

## Support

### Resources

- 📖 Full Documentation: `README-YOUTUBE-CONTENT-MANAGER.md`
- 🔧 Environment Template: `.env.youtube.example`
- 💬 n8n Community: https://community.n8n.io
- 🤖 Gemini Docs: https://ai.google.dev/docs

### Getting Help

1. Check the troubleshooting section above
2. Review full documentation
3. Search n8n community forum
4. Open GitHub issue

---

## Success Checklist

Before you're fully set up, verify:

- [x] All credentials configured in n8n
- [x] Google Drive folder created and shared
- [x] Notion database created with all properties
- [x] Workflow successfully executed once
- [x] Received test email notification
- [x] Content saved to Drive and Notion
- [x] All Gemini nodes linked to credentials

**All checked?** 🎉 **You're ready to create amazing YouTube content with AI!**

---

## Cost Summary

Your current setup costs:

| Service | Cost |
|---------|------|
| Google Gemini | $0/month (free tier) |
| Google Drive | $0/month (15GB free) |
| Notion | $0/month (free tier) |
| Gmail | $0/month |
| **Total** | **$0/month** 🎉 |

**Optional:**
- OpenAI GPT-4 (advanced analysis): ~$5-20/month

---

**Happy Content Creating!** 🎥✨

Need help? Check the full README or open an issue on GitHub.
