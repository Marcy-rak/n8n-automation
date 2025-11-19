# YouTube Content Manager AI Agent Assistant

An intelligent n8n workflow that automates YouTube content creation from ideation to optimization using Google Gemini AI (free tier) and OpenAI for advanced analysis.

## Features

### Core Capabilities
- **Content Idea Generation**: AI-powered brainstorming with viral potential scoring
- **Script Writing**: Complete video scripts with timestamps, B-roll suggestions, and editing notes
- **Metadata Optimization**: SEO-optimized titles, descriptions, tags, and thumbnail concepts
- **Thumbnail Concepts**: Detailed visual designs with psychological triggers
- **Full Pipeline**: End-to-end content creation workflow

### Integrations
- **Google Gemini AI**: Primary AI engine (free tier - gemini-2.0-flash-exp)
- **OpenAI GPT-4**: Advanced analysis and fallback (optional, for complex tasks)
- **Google Drive**: Automatic document storage and organization
- **Notion**: Content calendar and project management
- **Gmail**: Automated notifications with quick links

### Workflow Actions

1. **Generate Content Ideas**
   - 10 unique video ideas with viral scoring
   - Target audience pain points
   - Trending angles and hooks
   - Estimated video length

2. **Write Video Script**
   - Hook (first 10 seconds)
   - Full structured script with timestamps
   - B-roll and visual suggestions
   - Editing notes and music cues
   - Engagement prompts (naturally integrated)

3. **Optimize Video Metadata**
   - 3 optimized title variations (SEO-friendly)
   - Complete 5000-character description
   - 30 relevant tags (broad + specific)
   - Thumbnail concepts (3 variations)
   - Best posting time recommendations
   - Playlist suggestions

4. **Generate Thumbnail Concepts**
   - 5 unique designs with color schemes
   - Text overlay suggestions
   - Psychological triggers
   - Design tool recommendations (Canva/Photoshop)

5. **Complete Content Pipeline**
   - Sequential execution of all steps
   - Ideas → Script → Metadata
   - Automated storage and notification

## Architecture

```
┌─────────────────────┐
│  Manual Trigger     │
│  (User initiates)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  User Input Handler │
│  (Collect info)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│         Route Selection                 │
│  - Content Ideas                        │
│  - Script Writing                       │
│  - Metadata Optimization                │
│  - Thumbnail Concepts                   │
│  - Full Pipeline                        │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│   Gemini AI         │  ← Primary (Free Tier)
│   Processing        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   OpenAI GPT-4      │  ← Advanced Analysis (Optional)
│   (Fallback)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│         Output Processing               │
│  1. Format data                         │
│  2. Save to Google Drive                │
│  3. Add to Notion calendar              │
│  4. Send Gmail notification             │
└─────────────────────────────────────────┘
```

## Prerequisites

### Required Services

1. **n8n Instance** (Cloud or Self-hosted)
   - Version 1.0.0 or higher
   - Access to install community nodes (if needed)

2. **Google Gemini API** (FREE)
   - Get API key: https://makersuite.google.com/app/apikey
   - Free tier: 60 requests per minute
   - Model: `gemini-2.0-flash-exp`

3. **Google Service Account** (for Drive)
   - Enable Google Drive API
   - Create service account credentials
   - Download JSON key file

4. **Notion Account**
   - Create integration: https://www.notion.so/my-integrations
   - Get API token
   - Set up "YouTube Content Calendar" database

5. **Gmail Account**
   - Enable OAuth2 in n8n
   - Allow less secure apps or use App Password

### Optional Services

6. **OpenAI API** (for advanced analysis)
   - Get API key: https://platform.openai.com/api-keys
   - Model: `gpt-4o`
   - Only used when you need deeper analysis

## Installation

### Step 1: Import Workflow into n8n

1. Open your n8n instance
2. Click **Workflows** → **Import from File**
3. Select `youtube-content-manager.json`
4. Click **Import**

### Step 2: Configure Credentials

#### A. Google Gemini API

1. In n8n, go to **Credentials** → **New**
2. Search for "Google Gemini"
3. Add your API key from https://makersuite.google.com/app/apikey
4. Name it: `Google Gemini API`

#### B. Google Drive (Service Account)

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create new project or select existing
3. Enable **Google Drive API**
4. Create **Service Account**:
   - Go to **IAM & Admin** → **Service Accounts**
   - Create account
   - Download JSON key file
5. In n8n:
   - **Credentials** → **New**
   - Search "Google Service Account"
   - Upload JSON key file
   - Name it: `Google Service Account`
6. **Important**: Share your Google Drive folder with the service account email

#### C. Notion API

1. Create integration: https://www.notion.so/my-integrations
2. Create new integration, give it a name
3. Copy the "Internal Integration Token"
4. Create a database called "YouTube Content Calendar" with these properties:
   - Title (default)
   - Status (Select)
   - Niche (Text)
   - Target Audience (Text)
   - Created Date (Date)
   - Keywords (Multi-select)
   - Google Drive Link (URL)
5. Share your database with the integration
6. In n8n:
   - **Credentials** → **New**
   - Search "Notion API"
   - Paste integration token
   - Name it: `Notion API`

#### D. Gmail OAuth2

1. In n8n:
   - **Credentials** → **New**
   - Search "Gmail OAuth2"
   - Follow OAuth2 setup wizard
   - Name it: `Gmail OAuth2`

#### E. OpenAI API (Optional)

1. Get API key: https://platform.openai.com/api-keys
2. In n8n:
   - **Credentials** → **New**
   - Search "OpenAI"
   - Paste API key
   - Name it: `OpenAI API`

### Step 3: Configure Node Credentials

After importing, you need to link credentials to each node:

1. **Gemini Nodes** (4 nodes):
   - `Gemini: Generate Content Ideas`
   - `Gemini: Write Video Script`
   - `Gemini: Optimize Metadata`
   - `Gemini: Thumbnail Concepts`
   - Link to: `Google Gemini API`

2. **Google Drive Node**:
   - `Save to Google Drive`
   - Link to: `Google Service Account`
   - Configure folder: Create folder "YouTube Content" in your Drive

3. **Notion Node**:
   - `Save to Notion`
   - Link to: `Notion API`
   - Select database: `YouTube Content Calendar`

4. **Gmail Node**:
   - `Send Gmail Notification`
   - Link to: `Gmail OAuth2`
   - Set recipient email

5. **OpenAI Node** (Optional):
   - `OpenAI: Advanced Analysis`
   - Link to: `OpenAI API`

### Step 4: Customize User Input

Edit the `User Input Handler` node to match your needs:

```javascript
const options = {
  action: 'Please select an action',
  choices: [
    '1. Generate Content Ideas',
    '2. Write Video Script',
    '3. Optimize Video Metadata',
    '4. Complete Content Pipeline (Ideas → Script → Metadata)',
    '5. Generate Thumbnail Concepts'
  ],
  userInput: {
    niche: 'Your channel niche', // e.g., "Tech Reviews", "Cooking"
    targetAudience: 'Your target audience', // e.g., "Tech enthusiasts 18-35"
    videoTopic: 'Video topic (if applicable)',
    keywords: 'Keywords (comma-separated)',
    userEmail: 'your-email@gmail.com' // For notifications
  }
};

return { json: options };
```

## Usage Guide

### Quick Start

1. **Activate the workflow** in n8n (toggle on)
2. Click **Execute Workflow** (manual trigger)
3. The workflow will guide you through the process

### Action 1: Generate Content Ideas

**When to use**: Brainstorming session, content planning

**Input required**:
- Niche/Topic (e.g., "AI Tools for Productivity")
- Target Audience (e.g., "Content creators and entrepreneurs")
- Keywords (e.g., "ChatGPT, automation, productivity")

**Output**:
- 10 unique video ideas with:
  - SEO-optimized titles
  - Brief descriptions
  - Hook (first 10 seconds)
  - Viral potential score (1-10)
  - Target difficulty level
  - Estimated video length

**Saved to**:
- Google Drive: `Content Ideas - [Niche] - [Date].txt`
- Notion: New entry in Content Calendar

### Action 2: Write Video Script

**When to use**: After selecting a video idea

**Input required**:
- Video Title
- Video Topic
- Target Audience
- Desired video length (optional)
- Tone (optional)

**Output**:
- Complete video script with:
  - Hook (first 10 seconds)
  - Introduction
  - Main content (3-5 sections with timestamps)
  - Engagement prompts
  - Conclusion and CTA
  - Outro suggestions
  - B-roll and visual suggestions
  - Editing notes

**Saved to**:
- Google Drive: `Video Script - [Title] - [Date].txt`
- Notion: Updated entry with script link

### Action 3: Optimize Video Metadata

**When to use**: Before publishing a video

**Input required**:
- Video Title
- Video Topic
- Target Keywords
- Target Audience

**Output**:
- 3 optimized title variations
- Full 5000-character description with:
  - First 150 characters (preview-optimized)
  - Timestamps
  - Keywords naturally integrated
  - Links section
  - Hashtags
  - Call-to-action
- 30 relevant tags
- 3 thumbnail concepts
- Best posting time
- Playlist suggestions

**Saved to**:
- Google Drive: `Metadata - [Title] - [Date].txt`
- Notion: Metadata added to entry

### Action 4: Complete Content Pipeline

**When to use**: Full automation from idea to optimization

**Process**:
1. Generates 5 content ideas
2. Prompts you to select best idea
3. Writes complete script for selected idea
4. Optimizes metadata
5. Saves everything to Drive and Notion
6. Sends notification

**Note**: This is the most comprehensive option

### Action 5: Generate Thumbnail Concepts

**When to use**: Designing video thumbnails

**Input required**:
- Video Title
- Niche
- Target Audience

**Output**: 5 unique thumbnail concepts with:
- Main visual description
- Text overlay (exact text + styling)
- Color scheme (primary, secondary, accent)
- Design elements (icons, arrows, borders)
- Psychological triggers
- Design tool recommendations

**Saved to**:
- Google Drive: `Thumbnail Concepts - [Title] - [Date].txt`

## Advanced Features

### Using OpenAI for Advanced Analysis

The workflow includes an optional OpenAI node for deeper analysis. To enable:

1. Ensure you have OpenAI credentials configured
2. Connect the `OpenAI: Advanced Analysis` node output to `Process AI Output`
3. This provides:
   - Advanced SEO recommendations
   - Viral potential analysis
   - Competition analysis
   - Audience retention strategies
   - Monetization opportunities
   - Cross-promotion ideas

**Note**: OpenAI is optional and only used when you need more sophisticated analysis (costs apply).

### Notion Database Setup

Create a Notion database with these properties for best results:

| Property Name | Type | Purpose |
|--------------|------|---------|
| Title | Title | Video title |
| Status | Select | Draft, Script Ready, Metadata Done, Published |
| Niche | Text | Content category |
| Target Audience | Text | Demographic |
| Created Date | Date | When idea was generated |
| Publish Date | Date | Planned/actual publish date |
| Keywords | Multi-select | SEO keywords |
| Google Drive Link | URL | Link to script/metadata doc |
| Viral Potential | Number | 1-10 score |
| Video Length | Select | Short (<5m), Medium (5-15m), Long (15m+) |
| Notes | Text | Additional notes |

### Customizing AI Prompts

Each Gemini node has a customizable prompt. To modify:

1. Open the node (e.g., `Gemini: Generate Content Ideas`)
2. Edit the `text` parameter
3. Adjust temperature (0.6 = focused, 0.9 = creative)
4. Modify maxOutputTokens (higher = longer responses)

**Example**: To generate more ideas, change:
```
Generate 10 creative video ideas
```
to:
```
Generate 20 creative video ideas
```

### Error Handling

The workflow includes an `Error Handler` node that:
- Catches failures in AI processing
- Attempts retry with OpenAI (if configured)
- Logs errors for debugging
- Sends error notifications via Gmail

## Cost Optimization

### Free Tier Usage

**Google Gemini** (Primary AI):
- ✅ Free tier: 60 requests/minute
- ✅ No credit card required
- ✅ Sufficient for most users
- Cost: **$0/month**

**Google Drive**:
- ✅ 15 GB free storage
- Cost: **$0/month** (for most users)

**Notion**:
- ✅ Free tier: Unlimited pages
- Cost: **$0/month**

**Gmail**:
- ✅ Free
- Cost: **$0/month**

**Total Free Tier Cost**: **$0/month** 🎉

### Paid Options (Optional)

**OpenAI GPT-4o**:
- Used only for advanced analysis
- ~$0.01 per request (150K input tokens)
- Recommended: Disable unless needed
- Estimated cost: **$5-20/month** (heavy usage)

### Best Practices for Free Usage

1. **Batch your requests**: Generate multiple ideas at once
2. **Use Gemini primarily**: Only use OpenAI for complex analysis
3. **Monitor API usage**: Check Gemini console for limits
4. **Rate limiting**: Add 1-2 second delays between requests (if needed)

## Troubleshooting

### Common Issues

#### 1. Gemini API Error: "API key not valid"

**Solution**:
- Verify API key from https://makersuite.google.com/app/apikey
- Ensure Gemini API is enabled in Google Cloud Console
- Check for extra spaces in credential configuration

#### 2. Google Drive: "Insufficient permissions"

**Solution**:
- Share your Google Drive folder with service account email
- Service account email format: `xxx@xxx.iam.gserviceaccount.com`
- Give "Editor" permissions

#### 3. Notion: "Database not found"

**Solution**:
- Share the Notion database with your integration
- Use database ID, not page ID
- Database ID is in URL: `notion.so/xxxxx?v=yyyyy` (xxxxx is database ID)

#### 4. Gmail: "Authentication failed"

**Solution**:
- Re-authenticate OAuth2 in n8n
- If using Gmail, enable "Less secure app access" or use App Password
- Check OAuth2 redirect URI in Google Cloud Console

#### 5. Workflow execution timeout

**Solution**:
- Increase timeout in n8n settings (Settings → Execution Timeout)
- Reduce maxOutputTokens in Gemini nodes
- Split long operations into multiple workflow runs

### Debugging Tips

1. **Enable verbose logging**:
   - n8n Settings → Executions → Save execution progress
   - Check execution logs for detailed errors

2. **Test nodes individually**:
   - Click "Execute Node" on each node
   - Verify output before running full workflow

3. **Check API quotas**:
   - Gemini: https://makersuite.google.com/app/apikey (usage tab)
   - OpenAI: https://platform.openai.com/usage
   - Google Drive: https://one.google.com/storage

4. **Validate JSON output**:
   - Sometimes AI returns malformed JSON
   - The `Process AI Output` node handles this
   - Check "rawContent" field if parsing fails

## Workflow Customization

### Adding New Actions

1. Create new route in `User Input Handler`
2. Add corresponding IF condition node
3. Create Gemini node with custom prompt
4. Connect to `Process AI Output`

**Example**: Add "Generate Video Outline" action

```javascript
// In User Input Handler
choices: [
  '1. Generate Content Ideas',
  '2. Write Video Script',
  '3. Optimize Video Metadata',
  '4. Generate Video Outline', // NEW
  '5. Complete Content Pipeline'
]
```

Then create:
- Route node: `Route: Video Outline`
- Gemini node: `Gemini: Generate Outline`
- Custom prompt for outline generation

### Integrating with YouTube API

To auto-publish videos (future enhancement):

1. Add YouTube OAuth2 credentials
2. Add YouTube node after metadata generation
3. Configure upload parameters:
   - Title from metadata
   - Description from metadata
   - Tags from metadata
   - Privacy status

**Note**: This requires YouTube Data API v3 access.

### Adding More AI Providers

The workflow is designed to be extensible:

1. **Anthropic Claude**: Add HTTP Request node with Claude API
2. **Cohere**: Use HTTP Request node
3. **Local LLM**: Use HTTP Request to local Ollama instance

## Best Practices

### Content Creation Workflow

1. **Weekly Planning**:
   - Run "Generate Content Ideas" on Monday
   - Review ideas in Notion, select 2-3 best
   - Mark selected ideas as "Approved"

2. **Script Writing**:
   - Run "Write Video Script" for approved ideas
   - Review and edit scripts in Google Drive
   - Update Notion status to "Script Ready"

3. **Pre-Production**:
   - Run "Generate Thumbnail Concepts"
   - Create actual thumbnails in Canva/Photoshop
   - Film video using script as guide

4. **Pre-Publishing**:
   - Run "Optimize Video Metadata"
   - Copy title, description, tags to YouTube
   - Upload thumbnail
   - Update Notion status to "Published"

### Prompt Engineering Tips

For better AI outputs:

1. **Be specific**: "Generate 10 video ideas for tech channel targeting developers" vs "Generate ideas"
2. **Provide context**: Include your channel's style, tone, existing content
3. **Use examples**: "Like this video: [URL]" helps AI understand your style
4. **Iterate**: If output isn't perfect, refine your input and re-run

### Data Management

1. **Organize Drive**:
   - Create subfolders: `/Scripts`, `/Metadata`, `/Ideas`, `/Thumbnails`
   - Name files consistently: `[Type] - [Title] - [Date].txt`

2. **Notion Views**:
   - Create filtered views: "Ideas to Review", "Scripts Ready", "Published"
   - Add calendar view for publish schedule
   - Use Board view for Kanban-style workflow

3. **Regular Cleanup**:
   - Archive old ideas monthly
   - Delete duplicate files in Drive
   - Export execution logs if needed

## Examples

### Example 1: Tech Channel - Content Ideas

**Input**:
```json
{
  "action": "1. Generate Content Ideas",
  "niche": "AI and Machine Learning",
  "targetAudience": "Developers and tech enthusiasts (25-40)",
  "keywords": "ChatGPT, GPT-4, AI coding tools, automation"
}
```

**Output** (sample):
```json
{
  "ideas": [
    {
      "title": "I Automated My Entire Coding Workflow with GPT-4 - Here's How",
      "description": "Step-by-step guide to setting up AI-powered coding assistants...",
      "hook": "I replaced 90% of my Stack Overflow searches with this one AI trick...",
      "targetPainPoint": "Developers waste hours searching for code solutions",
      "trendingAngle": "AI coding assistants trend",
      "estimatedLength": "12-15 minutes",
      "difficulty": "Intermediate",
      "viralPotential": 8
    }
    // ... 9 more ideas
  ]
}
```

### Example 2: Cooking Channel - Video Script

**Input**:
```json
{
  "action": "2. Write Video Script",
  "videoTitle": "5-Minute Gourmet Pasta That Looks Expensive",
  "videoTopic": "Quick and impressive pasta recipe",
  "targetAudience": "Home cooks, busy professionals",
  "videoLength": "8-10 minutes",
  "tone": "Friendly and encouraging"
}
```

**Output** (abbreviated):
```text
VIDEO SCRIPT

[00:00-00:10] HOOK
"This pasta dish costs $3 to make, takes 5 minutes, but your guests
will think you spent hours on it. Let me show you the secret..."

[Visual: Close-up of beautiful plated pasta, garnished perfectly]

[00:10-00:40] INTRODUCTION
"Hey everyone! Today I'm sharing my go-to recipe when I need to
impress but don't have time..."

[Continue with full script...]
```

### Example 3: Finance Channel - Metadata Optimization

**Input**:
```json
{
  "action": "3. Optimize Video Metadata",
  "videoTitle": "How I Saved $10,000 in 6 Months",
  "videoTopic": "Practical money-saving strategies",
  "keywords": "save money, budgeting, personal finance, money tips",
  "targetAudience": "Young professionals 22-35"
}
```

**Output** (sample):
```json
{
  "optimizedTitles": [
    "How I Saved $10,000 in 6 Months (Anyone Can Do This)",
    "My $10K Savings Challenge: 6-Month Results + Exact Strategy",
    "Save $10,000 Fast: 6 Simple Steps I Actually Used"
  ],
  "description": "I saved $10,000 in just 6 months using these 6 simple strategies...\n\n📍 TIMESTAMPS\n00:00 - Intro\n01:23 - Strategy #1: The 50/30/20 Rule\n...",
  "tags": [
    "save money",
    "personal finance",
    "budgeting tips",
    "how to save 10000",
    "money saving challenge"
    // ... 25 more
  ],
  "thumbnailConcepts": [
    {
      "mainVisual": "Split screen: empty wallet vs full piggy bank",
      "textOverlay": "$10K in 6 MONTHS",
      "colorScheme": {
        "primary": "#2ECC71 (success green)",
        "secondary": "#ECF0F1 (light gray)",
        "accent": "#F39C12 (gold)"
      }
    }
    // ... 2 more concepts
  ]
}
```

## Performance Metrics

Track your workflow efficiency:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Ideas generated per run | 10 | Check output JSON |
| Script generation time | <2 minutes | n8n execution logs |
| Metadata optimization time | <1 minute | n8n execution logs |
| API error rate | <5% | Execution history |
| Notion sync success rate | >95% | Manual verification |

## Roadmap

Future enhancements planned:

- [ ] YouTube API integration (auto-publish)
- [ ] Competitor analysis module
- [ ] Trend detection from YouTube/Google Trends
- [ ] Video performance tracking and AI insights
- [ ] Automatic thumbnail generation (using DALL-E or Midjourney)
- [ ] Multi-language support
- [ ] Voice-over script formatting
- [ ] Collaboration features (team workflows)
- [ ] Mobile app trigger (via webhook)
- [ ] Slack/Discord notifications

## Support & Community

### Getting Help

1. **n8n Community**: https://community.n8n.io/
2. **Gemini AI Docs**: https://ai.google.dev/docs
3. **GitHub Issues**: [Create an issue](https://github.com/yourusername/n8n-automation/issues)

### Contributing

Contributions welcome! To improve this workflow:

1. Fork the repository
2. Make improvements to the workflow
3. Test thoroughly
4. Submit a pull request with description

### License

MIT License - Free to use, modify, and distribute

---

## Quick Reference

### Essential Links
- **Gemini API**: https://makersuite.google.com/app/apikey
- **Google Cloud Console**: https://console.cloud.google.com
- **Notion Integrations**: https://www.notion.so/my-integrations
- **n8n Documentation**: https://docs.n8n.io

### Default Gemini Settings
- Model: `gemini-2.0-flash-exp`
- Temperature: `0.7-0.8` (creative tasks)
- Max Tokens: `2048-4096`

### Workflow Execution Time
- Content Ideas: ~30-60 seconds
- Script Writing: ~45-90 seconds
- Metadata Optimization: ~30-60 seconds
- Full Pipeline: ~3-5 minutes

---

**Happy Content Creating! 🎥✨**

For questions or feature requests, open an issue or reach out to the community.
