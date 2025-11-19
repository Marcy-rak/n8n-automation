# Audience-Problem Matcher Workflow

An intelligent n8n workflow that automatically discovers problems, analyzes trends, identifies target personas, and matches opportunities to your unique skills.

## Overview

This workflow takes a topic/domain and your skills as input, then:
1. Discovers top problems from Google Autosuggest and Reddit
2. Analyzes trend data for each problem
3. Identifies target personas/audiences
4. Performs AI-powered root cause analysis
5. Matches opportunities to your strengths
6. Returns ranked niche opportunities with competition estimates

## Workflow Architecture

```
┌─────────────────┐
│ Manual Trigger  │
│   + User Input  │ ← topic_or_domain, user_strengths
└────────┬────────┘
         │
         ├─────────────────┐
         ▼                 ▼
┌──────────────────┐  ┌─────────────┐
│ Google           │  │   Reddit    │
│ Autosuggest API  │  │ Search API  │
└────────┬─────────┘  └──────┬──────┘
         │                   │
         └─────────┬─────────┘
                   ▼
         ┌──────────────────┐
         │ Merge & Rank     │
         │ Top 10 Problems  │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ Split In Batches │ ← Process each problem
         └────────┬─────────┘
                  │
      ┌───────────┴────────────┐
      ▼                        ▼
┌────────────┐        ┌─────────────────┐
│  Google    │        │    Identify     │
│  Trends    │        │    Personas     │
└─────┬──────┘        └────────┬────────┘
      │                        │
      ▼                        │
┌────────────┐                 │
│  Extract   │                 │
│  Trends    │─────────────────┘
└─────┬──────┘
      │
      ▼
┌──────────────────┐
│  Root Cause      │
│  Analysis (LLM)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Match User      │
│  Strengths (LLM) │
└────────┬─────────┘
         │
         ▼ (Loop back for next problem)
┌──────────────────┐
│   Aggregate      │
│   All Problems   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Estimate       │
│ Competition (LLM)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Final Niche      │
│ Recommendations  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Format Output   │
└──────────────────┘
```

## Features

### 1. **Multi-Source Problem Discovery**
- **Google Autosuggest**: Captures trending search queries
- **Reddit API**: Pulls real questions and discussions
- **Smart Filtering**: Ranks by frequency, popularity, and relevance
- **Output**: Top 10 problems

### 2. **Trend Analysis**
- **Google Trends Integration**: Real-time trend data
- **Metrics Extracted**:
  - Growth label (up/steady/down)
  - Popularity score (0-100)
  - Seasonality detection
  - Trend direction

### 3. **Persona Identification**
- **Keyword Analysis**: Detects personas from problem context
- **Subreddit Mapping**: Maps subreddits to target audiences
- **Smart Rules**: 13+ persona detection rules
- **Examples**: "New moms", "Side-hustlers", "Beginner programmers"

### 4. **AI Root Cause Analysis**
- **LLM-Powered**: Uses GPT-4o-mini for deep analysis
- **Output**: 3-5 specific root causes for each problem
- **Context-Aware**: Considers audience and problem context

### 5. **Strengths Matching**
- **Personalized Scoring**: 1-100 fit score for each opportunity
- **Detailed Reasoning**: Explains WHY you're a good match
- **Skills-Based**: Compares your strengths with problem requirements

### 6. **Competition Estimation**
- **AI-Driven**: Estimates competition (low/medium/high)
- **Multi-Factor Analysis**:
  - Trend popularity
  - Audience breadth
  - Market saturation indicators

### 7. **Ranked Recommendations**
- **Top 5 Opportunities**: Best matches based on fit score
- **Comprehensive Data**: All problems with full analysis
- **Insights Summary**: Best matches, trending problems, low competition niches

## Installation

### 1. Import into n8n

1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Select `audience-problem-matcher.json`
4. Click **Import**

### 2. Configure Credentials

You'll need to set up:

#### OpenAI API (Required)
- Used for LLM nodes (Root Cause Analysis, Strengths Matching, Competition Estimation)
- Get API key from: https://platform.openai.com/api-keys
- Add to n8n: **Credentials** → **OpenAI** → Add your API key

#### Optional API Keys
- **Google Trends**: Uses public endpoint (no key needed, but may have rate limits)
- **Reddit**: Uses public API (consider Reddit API key for higher rate limits)

### 3. Update Node Settings

After import, check these nodes:

1. **Root Cause Analysis** (node)
   - Ensure OpenAI credentials are connected
   - Model: `gpt-4o-mini` (or `gpt-4` for better quality)

2. **Match User Strengths** (node)
   - Ensure OpenAI credentials are connected
   - Model: `gpt-4o-mini`

3. **Estimate Competition** (node)
   - Ensure OpenAI credentials are connected
   - Model: `gpt-4o-mini`

## Usage

### Basic Usage

1. **Open the workflow** in n8n
2. **Click** on the "User Input" node
3. **Set your parameters**:
   ```json
   {
     "topic_or_domain": "digital marketing for small businesses",
     "user_strengths": "SEO, content writing, social media management, 5 years freelance experience"
   }
   ```
4. **Click "Execute Workflow"**
5. **View results** in the "Format Final Output" node

### Input Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `topic_or_domain` | string | The market/topic to analyze | "fitness apps", "sustainable fashion", "remote work tools" |
| `user_strengths` | string | Your skills, experience, expertise | "Python developer, 3 years ML experience, passion for education" |

### Example Inputs

#### Example 1: SaaS Founder
```json
{
  "topic_or_domain": "project management tools",
  "user_strengths": "Full-stack developer, 10 years building SaaS products, UI/UX design, team leadership"
}
```

#### Example 2: Content Creator
```json
{
  "topic_or_domain": "personal finance",
  "user_strengths": "Financial analyst, certified planner, excellent communicator, YouTube creator with 50k subs"
}
```

#### Example 3: E-commerce Entrepreneur
```json
{
  "topic_or_domain": "sustainable products",
  "user_strengths": "Supply chain management, eco-friendly product sourcing, social media marketing, Shopify expert"
}
```

## Output Format

### Summary Section
```json
{
  "summary": {
    "topic_analyzed": "digital marketing for small businesses",
    "user_strengths": "SEO, content writing...",
    "total_problems_found": 10,
    "top_opportunities_count": 5,
    "average_fit_score": 78,
    "high_growth_opportunities": 4,
    "low_competition_opportunities": 2,
    "generated_at": "2024-11-19T00:00:00.000Z"
  }
}
```

### Top 5 Recommendations
```json
{
  "top_5_recommendations": [
    {
      "rank": 1,
      "niche": "How to do SEO for local businesses with limited budget",
      "audience": "Small business owners, Entrepreneurs",
      "trend": "up (popularity: 72/100)",
      "competition": "medium",
      "root_cause": "Lack of affordable SEO resources; Technical complexity; Limited marketing budgets",
      "fit_score": 92,
      "fit_reason": "Your SEO expertise and content writing skills are perfectly aligned with this need. Small businesses desperately need affordable, understandable SEO guidance.",
      "recommendation_quality": "High"
    }
  ]
}
```

### Raw Data
All problems with complete analysis:
- Problem text
- Source (Google/Reddit)
- Personas
- Trend metrics
- Competition level
- Root causes
- Fit score

### Insights
```json
{
  "insights": {
    "best_match": "How to do SEO for local businesses...",
    "best_match_score": 92,
    "trending_problems": ["Problem 1", "Problem 2", "Problem 3"],
    "low_competition_niches": ["Niche 1", "Niche 2", "Niche 3"]
  }
}
```

## Workflow Nodes Explained

### Input & Discovery Nodes

1. **Manual Trigger**
   - Starts the workflow manually
   - Can be replaced with Webhook or Schedule trigger

2. **User Input**
   - Captures `topic_or_domain` and `user_strengths`
   - Edit values here before execution

3. **Google Autosuggest API**
   - URL: `http://suggestqueries.google.com/complete/search`
   - Returns: Related search queries
   - No authentication required

4. **Reddit Search API**
   - URL: `https://www.reddit.com/search.json`
   - Returns: Top 25 relevant posts
   - Public endpoint (no auth needed)

5. **Merge & Rank Problems**
   - Combines Google + Reddit results
   - Filters for questions (how/why/what)
   - Ranks by upvotes, comments, relevance
   - Returns: Top 10 problems

### Analysis Pipeline (Loop)

6. **Split Problems**
   - Processes each problem individually
   - Batch size: 1
   - Enables parallel data enrichment

7. **Google Trends API**
   - Fetches trend data for each problem
   - Extracts: Interest over time, popularity
   - Note: May need alternative service for production

8. **Extract Trend Insights**
   - Calculates growth direction
   - Detects seasonality
   - Assigns trend score

9. **Identify Personas**
   - 13+ persona detection rules
   - Keyword analysis
   - Subreddit mapping
   - Returns: Target audience array

10. **Root Cause Analysis (LLM)**
    - GPT-4o-mini analysis
    - Identifies 3-5 root causes
    - Context: Problem + audience + snippet

11. **Parse Root Causes**
    - Extracts JSON from LLM response
    - Error handling for malformed responses

12. **Match User Strengths (LLM)**
    - Compares user skills with opportunity
    - Returns: Fit score (1-100) + reasoning
    - Personalized recommendations

13. **Parse Fit Score**
    - Extracts fit score and explanation
    - Validates score range

14. **Loop Back**
    - Continues to next problem
    - When done, proceeds to aggregation

### Final Processing

15. **Aggregate Problems**
    - Collects all enriched problems
    - Prepares for competition analysis

16. **Estimate Competition (LLM)**
    - Analyzes all problems together
    - Returns: Competition level for each

17. **Create Final Recommendations**
    - Sorts by fit score and popularity
    - Selects top 5
    - Combines all data

18. **Format Final Output**
    - Creates structured output
    - Adds summary statistics
    - Generates insights

## Customization

### Adjust Number of Problems

In **Merge & Rank Problems** node, change:
```javascript
.slice(0, 10)  // Change 10 to your desired number
```

### Change LLM Model

Update model in LLM nodes:
```json
{
  "model": "gpt-4o-mini"  // or "gpt-4", "gpt-3.5-turbo"
}
```

### Modify Persona Rules

In **Identify Personas** node, add custom rules:
```javascript
{
  keywords: ['your', 'keywords'],
  personas: ['Your Target Persona']
}
```

### Adjust Fit Score Weighting

In **Create Final Recommendations**, change sort logic:
```javascript
// Current: fit_score primary, popularity secondary
// Custom: Add your weighting logic
```

### Add More Data Sources

Add new HTTP Request nodes parallel to Google/Reddit:
- Quora API
- Twitter/X API
- Stack Overflow
- Industry forums

## API Alternatives

### Google Trends
- **Current**: Public endpoint (unreliable)
- **Alternatives**:
  - SerpApi (https://serpapi.com/google-trends-api)
  - DataForSEO (https://dataforseo.com/)
  - Trend API (paid service)

### Reddit
- **Current**: Public JSON endpoint
- **Upgrade**: Official Reddit API (requires OAuth)
- **Alternatives**: Pushshift Reddit API

### Google Autosuggest
- **Current**: Public endpoint
- **Alternatives**:
  - Answer The Public API
  - Ubersuggest API
  - SEMrush API

## Performance Optimization

### 1. Reduce API Calls
- Cache trend data for frequently searched topics
- Batch multiple problems to same LLM call

### 2. Parallel Processing
- Already implemented: Google + Reddit run in parallel
- Trends + Personas run in parallel

### 3. Cost Optimization
- Use `gpt-4o-mini` instead of `gpt-4` (90% cheaper)
- Reduce temperature for more deterministic (cheaper) results
- Limit problems processed to top 5 instead of 10

### 4. Rate Limiting
Add delay between API calls:
```javascript
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
```

## Troubleshooting

### Google Trends Returns Empty
**Cause**: Rate limiting or query format
**Fix**:
- Add delay between calls
- Use alternative API (SerpApi)
- Simplify query strings

### LLM Returns Non-JSON
**Cause**: LLM doesn't follow format
**Fix**: Already handled in Parse nodes with regex extraction

### Reddit API Rate Limited
**Cause**: Too many requests
**Fix**:
- Add Reddit API credentials
- Reduce limit from 25 to 10
- Add retry logic with backoff

### No Personas Detected
**Cause**: Keywords don't match rules
**Fix**: Add more keyword rules or use LLM for persona detection

### Low Fit Scores
**Cause**: User strengths don't match problems
**Fix**:
- Try different topic/domain
- Expand user strengths description
- Adjust LLM prompt for more generous scoring

## Production Deployment

### 1. Add Error Handling
- Wrap HTTP requests in try-catch
- Add fallback values for failed API calls
- Log errors to external service

### 2. Use Webhooks
Replace Manual Trigger with Webhook:
- Public URL for API access
- Authentication via API key
- POST request with JSON body

### 3. Schedule Regular Analysis
Add Schedule Trigger:
- Analyze trending topics weekly
- Store results in database
- Send email reports

### 4. Database Integration
Add PostgreSQL nodes:
- Store all opportunities
- Track trends over time
- Build historical database

### 5. Notification Integration
Add notification nodes:
- Email top opportunities
- Slack/Discord alerts
- WhatsApp summaries

## Use Cases

### 1. Product Ideation
- Input: Product category
- Strengths: Your technical skills
- Output: Market gaps + fit analysis

### 2. Content Strategy
- Input: Content niche
- Strengths: Your expertise areas
- Output: Topics to cover + audience insights

### 3. Freelance Service Design
- Input: Industry you want to serve
- Strengths: Your service offerings
- Output: Specific services to offer

### 4. Startup Validation
- Input: Broad problem space
- Strengths: Your founding team's skills
- Output: Validated problems + competition landscape

### 5. Career Pivoting
- Input: Target industry
- Strengths: Your transferable skills
- Output: Opportunities where you can add value

## Integration Examples

### Webhook API
```bash
curl -X POST https://your-n8n.com/webhook/audience-matcher \
  -H "Content-Type: application/json" \
  -d '{
    "topic_or_domain": "AI productivity tools",
    "user_strengths": "AI/ML engineer, 5 years experience, Python expert"
  }'
```

### Scheduled Analysis
Set up weekly reports:
1. Replace Manual Trigger with Schedule Trigger
2. Add predefined topics in Set node
3. Connect to Email node for reports

### Multi-Topic Batch
Process multiple topics:
1. Add Loop over topics
2. Store results in array
3. Compare opportunities across topics

## Advanced Features

### Custom Scoring Algorithm
Modify final ranking to include custom weights:
```javascript
const customScore = (
  (fitScore * 0.4) +
  (popularity * 0.3) +
  (trendScore * 0.2) +
  (competitionBonus * 0.1)
);
```

### Sentiment Analysis
Add sentiment scoring for Reddit posts:
- Integrate sentiment API
- Weight problems by sentiment
- Identify pain vs. opportunity

### Historical Trend Tracking
Store results over time:
- Track how trends evolve
- Identify emerging opportunities early
- Build predictive models

## License

MIT License - See main repository LICENSE file

## Support

For issues or questions:
- Check the main repository README
- Review n8n documentation: https://docs.n8n.io
- Open an issue on GitHub

## Contributing

Improvements welcome:
- Better persona detection rules
- Additional data sources
- Enhanced LLM prompts
- Performance optimizations

---

**Created for**: n8n automation enthusiasts
**Version**: 1.0
**Last Updated**: November 2024
