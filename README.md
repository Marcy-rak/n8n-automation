# Gift Advisor Workflow for n8n

An intelligent n8n workflow that provides personalized gift recommendations based on user preferences and finds the best deals online.

## Features

- 🎁 AI-powered personalized gift suggestions
- 💰 Automated price comparison and deal finding
- 🔍 Multi-source product search
- 📊 Returns top 5 gift suggestions with detailed information
- 🚀 Simple webhook API integration
- 💻 Frontend-ready JSON response format
- 🎨 Beautiful HTML frontend included (see [FRONTEND.md](FRONTEND.md))

## Quick Links

- **[HTML Frontend Documentation](FRONTEND.md)** - Setup and use the included web interface
- **[API Examples](example-request.json)** - Sample requests for testing
- **[Environment Setup](.env.example)** - API keys configuration template

## Workflow Overview

```
Webhook (User Input)
    ↓
Extract Preferences
    ↓
AI Recommendations (OpenAI)
    ↓
Parse AI Response
    ↓
Product Search (SerpAPI / Fallback)
    ↓
Process & Rank Results
    ↓
Format JSON Response
    ↓
Send Response
```

## Prerequisites

### Required APIs (Free/Low-Cost Options)

1. **OpenAI API** (Required)
   - Get API key from: https://platform.openai.com/api-keys
   - Cost: ~$0.002 per request (GPT-3.5-turbo)
   - Alternative: Use Claude API, Anthropic, or any compatible LLM

2. **SerpAPI** (Optional but Recommended)
   - Get API key from: https://serpapi.com/
   - Free tier: 100 searches/month
   - Used for: Google Shopping product search
   - Alternative: Workflow includes fallback web scraping

## Installation

### 1. Import Workflow to n8n

1. Open your n8n instance
2. Click on "Workflows" → "Import from File"
3. Select `gift-advisor-workflow.json`
4. Click "Import"

### 2. Configure Credentials

#### OpenAI Credentials
1. In n8n, go to "Credentials" → "Create New"
2. Select "OpenAI API"
3. Name: `OpenAI Account`
4. Enter your OpenAI API key
5. Save

#### SerpAPI Credentials (Optional)
1. In n8n, go to "Credentials" → "Create New"
2. Select "HTTP Query Auth"
3. Name: `SerpAPI Key`
4. Add parameter:
   - Name: `api_key`
   - Value: `YOUR_SERPAPI_KEY`
5. Save

### 3. Activate Workflow

1. Open the imported workflow
2. Click "Activate" in the top right
3. Note the webhook URL (e.g., `https://your-n8n.com/webhook/gift-advisor`)

## API Usage

### Endpoint

**POST** `/webhook/gift-advisor`

### Request Format

```json
{
  "age": "30",
  "gender": "female",
  "interests": "yoga, reading, coffee",
  "budget": "$50-100",
  "occasion": "birthday",
  "relationship": "friend"
}
```

### Request Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `age` | string | Yes | Age of gift recipient | "30", "25-35" |
| `gender` | string | Yes | Gender of recipient | "male", "female", "non-binary" |
| `interests` | string | Yes | Hobbies and interests | "gaming, cooking, hiking" |
| `budget` | string | Yes | Budget range | "$50-100", "under $50" |
| `occasion` | string | Yes | Gift occasion | "birthday", "anniversary", "Christmas" |
| `relationship` | string | Yes | Relationship to recipient | "friend", "spouse", "colleague" |

### Response Format

```json
{
  "success": true,
  "requestedAt": "2025-11-19T00:00:00.000Z",
  "totalSuggestions": 5,
  "userPreferences": {
    "age": "30",
    "budget": "$50-100",
    "occasion": "birthday"
  },
  "suggestions": [
    {
      "giftIndex": 1,
      "giftName": "Premium Yoga Mat Set",
      "description": "High-quality eco-friendly yoga mat with carrying strap and blocks",
      "category": "Fitness & Wellness",
      "estimatedPrice": "$60-80",
      "products": [
        {
          "productName": "Manduka PRO Yoga Mat",
          "price": "$75.99",
          "link": "https://example.com/product",
          "source": "Amazon",
          "rating": "4.8",
          "thumbnail": "https://example.com/image.jpg"
        }
      ],
      "bestDeal": {
        "productName": "Manduka PRO Yoga Mat",
        "price": "$75.99",
        "link": "https://example.com/product",
        "source": "Amazon",
        "rating": "4.8",
        "thumbnail": "https://example.com/image.jpg"
      },
      "searchKeywords": "premium yoga mat set eco-friendly"
    }
  ]
}
```

### Response Fields

Each suggestion includes:
- `giftIndex`: Suggestion ranking (1-5)
- `giftName`: Name of the gift idea
- `description`: Detailed description
- `category`: Gift category
- `estimatedPrice`: Price range estimate
- `products`: Array of found products (up to 3 per gift)
- `bestDeal`: Top recommended product
- `searchKeywords`: Keywords used for search

## Example Usage

### cURL

```bash
curl -X POST https://your-n8n.com/webhook/gift-advisor \
  -H "Content-Type: application/json" \
  -d '{
    "age": "30",
    "gender": "female",
    "interests": "yoga, reading, coffee",
    "budget": "$50-100",
    "occasion": "birthday",
    "relationship": "friend"
  }'
```

### JavaScript (Fetch)

```javascript
const response = await fetch('https://your-n8n.com/webhook/gift-advisor', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    age: '30',
    gender: 'female',
    interests: 'yoga, reading, coffee',
    budget: '$50-100',
    occasion: 'birthday',
    relationship: 'friend'
  })
});

const data = await response.json();
console.log(data.suggestions);
```

### Python

```python
import requests

url = 'https://your-n8n.com/webhook/gift-advisor'
data = {
    'age': '30',
    'gender': 'female',
    'interests': 'yoga, reading, coffee',
    'budget': '$50-100',
    'occasion': 'birthday',
    'relationship': 'friend'
}

response = requests.post(url, json=data)
suggestions = response.json()['suggestions']
print(suggestions)
```

## Frontend Integration Example

### React Component

```jsx
import React, { useState } from 'react';

function GiftAdvisor() {
  const [preferences, setPreferences] = useState({
    age: '',
    gender: '',
    interests: '',
    budget: '',
    occasion: '',
    relationship: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://your-n8n.com/webhook/gift-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button type="submit" disabled={loading}>
          {loading ? 'Finding Gifts...' : 'Get Recommendations'}
        </button>
      </form>

      {suggestions.map(gift => (
        <div key={gift.giftIndex}>
          <h3>{gift.giftName}</h3>
          <p>{gift.description}</p>
          {gift.bestDeal && (
            <a href={gift.bestDeal.link} target="_blank">
              {gift.bestDeal.productName} - {gift.bestDeal.price}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Customization

### Change Number of Suggestions

Edit the `Process & Rank Results` node:
```javascript
return processedGifts.slice(0, 5); // Change 5 to desired number
```

### Use Different AI Model

Edit the `AI Gift Recommendations` node:
- Change `model` from `gpt-3.5-turbo` to `gpt-4` (higher quality, higher cost)
- Or use Claude: change node type to Anthropic API

### Add More Product Sources

Add additional HTTP Request nodes after `Parse AI Response`:
- Amazon Product API
- eBay API
- Etsy API
- Your custom product database

## Cost Estimate

### Per Request (typical)
- OpenAI API (GPT-3.5): ~$0.002
- SerpAPI: 1 search credit (free tier: 100/month)
- **Total**: < $0.01 per request with free tier

### Monthly (1000 requests)
- OpenAI: ~$2.00
- SerpAPI: $50 (if exceeding free tier) or $0 (within free tier)

## Troubleshooting

### Common Issues

1. **"No products found"**
   - SerpAPI credits exhausted → Wait for monthly reset or upgrade
   - Try the fallback search option
   - Check search keywords in AI response

2. **"AI Response parsing failed"**
   - OpenAI returned unexpected format
   - Check API key and credits
   - Review AI response in workflow execution log

3. **"Webhook not responding"**
   - Ensure workflow is activated
   - Check webhook URL is correct
   - Verify request body format matches expected JSON

### Debug Mode

1. Open workflow in n8n
2. Click "Execute Workflow"
3. Manually input test data
4. Check each node's output in the execution panel

## Future Enhancements

Potential additions for v2:
- [ ] Price tracking and alerts
- [ ] User preference storage
- [ ] Gift history and recommendations based on past searches
- [ ] Image generation for custom gift cards
- [ ] Integration with more e-commerce platforms
- [ ] Multi-language support
- [ ] Gift wrapping service integration

## Support

For issues or questions:
1. Check n8n workflow execution logs
2. Verify API credentials and quotas
3. Test with sample data provided in this README

## License

MIT License - Feel free to modify and use for your projects!

---

**Created with n8n** - The workflow automation platform
