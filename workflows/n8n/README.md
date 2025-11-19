# Receipt2Recipe – Meal Plan Generator

A production-ready n8n workflow that transforms grocery receipts into personalized 7-day meal plans using AI.

## Overview

This workflow accepts grocery receipts (image/PDF or text) and generates intelligent meal plans based on:
- What was actually purchased
- Dietary restrictions and preferences
- Cooking skill level
- Available prep time
- Household size

## Features

- **Multi-format Input**: Accepts receipt text directly or image/PDF URLs for OCR processing
- **AI-Powered Parsing**: Extracts and structures grocery items from unstructured receipt text
- **Smart Meal Planning**: Generates realistic, actionable 7-day meal plans
- **Waste Reduction**: Prioritizes using purchased ingredients to minimize food waste
- **User Profiles**: Stores and merges preferences from Google Sheets
- **Extensible Tiers**: Built-in support for basic/plus/coach pricing tiers
- **Error Handling**: Comprehensive error tracking and logging
- **Database Storage**: Saves all meal plans to Google Sheets for history tracking

## Architecture

```
┌─────────────────┐
│  Webhook POST   │ ← Entry point
│ /receipt2recipe │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│ Receipt Source  │──────│ OCR (if URL) │
│   Selection     │      └──────────────┘
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  LLM Parse Items    │ ← Extract grocery items
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Merge User Profile │ ← Google Sheets lookup
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Generate Meal Plan  │ ← AI meal planning
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐      ┌────────────┐
│  Save to Database   │──────│   Return   │
│  (Google Sheets)    │      │  Response  │
└─────────────────────┘      └────────────┘
```

## Prerequisites

### 1. n8n Installation
- n8n version 1.10+ (self-hosted or cloud)
- Access to n8n workflow editor

### 2. API Credentials

| Service | Purpose | Required |
|---------|---------|----------|
| **OCR API** | Extract text from receipt images | Yes (if using image/PDF input) |
| **LLM API** | Parse receipts & generate meal plans | Yes |
| **Google Sheets** | User profiles & meal plan storage | Yes |

### 3. Google Sheets Setup

Create a new Google Sheet with three tabs:

#### Tab 1: `Users`
| user_id | dietary_preferences | cooking_skill | max_prep_time_minutes | household_size | notes |
|---------|-------------------|---------------|---------------------|----------------|-------|
| user_12345 | ["vegetarian","no_dairy"] | intermediate | 30 | 3 | Loves Italian food |

#### Tab 2: `MealPlans`
| timestamp | user_id | plan_tier | week_label | plan_json | summary_text |
|-----------|---------|-----------|------------|-----------|--------------|
| *Auto-populated by workflow* |

#### Tab 3: `Errors` (optional)
| timestamp | error_type | message |
|-----------|------------|---------|
| *Auto-populated on errors* |

## Installation

### Step 1: Import Workflow

1. Open n8n workflow editor
2. Click **Import from File** or **Import from URL**
3. Select `receipt2recipe-meal-plan-generator.json`
4. Click **Import**

### Step 2: Configure Credentials

#### A. OCR API Credentials

1. Go to **Credentials** → **Create New**
2. Select **HTTP Header Auth**
3. Name: `OCR API Key`
4. Configure:
   - **Header Name**: `apikey` (or `Authorization` depending on provider)
   - **Header Value**: Your OCR API key

**Supported OCR Providers:**
- [OCR.space](https://ocr.space/ocrapi) - Free tier available
- [Google Cloud Vision API](https://cloud.google.com/vision/docs/ocr)
- [Azure Computer Vision](https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/)
- [AWS Textract](https://aws.amazon.com/textract/)

#### B. LLM API Credentials

1. Go to **Credentials** → **Create New**
2. Select **HTTP Header Auth**
3. Name: `LLM API Key`
4. Configure:
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer YOUR_API_KEY`

**Supported LLM Providers:**
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Self-hosted (Ollama, LM Studio)

#### C. Google Sheets Credentials

1. Go to **Credentials** → **Create New**
2. Select **Google Sheets OAuth2 API**
3. Follow OAuth setup wizard
4. Name: `Google Sheets Account`

### Step 3: Set Environment Variables

In n8n settings or `.env` file:

```bash
# OCR Configuration
OCR_API_URL=https://api.ocr.space/parse/image

# LLM Configuration
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4  # or claude-3-5-sonnet-20241022

# Google Sheets
GOOGLE_SHEET_ID=1a2b3c4d5e6f7g8h9i0j  # Your sheet ID from URL
```

### Step 4: Connect Credentials to Nodes

1. Open each HTTP Request node
2. Select the appropriate credential from dropdowns:
   - `HTTP Request – OCR` → `OCR API Key`
   - `HTTP Request – LLM Parse Receipt Items` → `LLM API Key`
   - `HTTP Request – LLM Generate Meal Plan` → `LLM API Key`
3. Open Google Sheets nodes
4. Select `Google Sheets Account` credential

### Step 5: Activate Workflow

1. Toggle **Active** switch in top-right
2. Copy the webhook URL (appears in Webhook node)

## Usage

### API Endpoint

```
POST https://your-n8n-instance.com/webhook/receipt2recipe
Content-Type: application/json
```

### Request Body Schema

```json
{
  "user_id": "string",                    // Required
  "plan_tier": "basic|plus|coach",        // Optional, default: "basic"
  "household_size": number,               // Optional, default: 2
  "dietary_preferences": ["string"],      // Optional, default: ["no_restrictions"]
  "cooking_skill": "beginner|intermediate|advanced",  // Optional, default: "beginner"
  "max_prep_time_minutes": number,        // Optional, default: 30
  "receipt_text": "string",               // Optional if receipt_file_url provided
  "receipt_file_url": "string"            // Optional if receipt_text provided
}
```

### Example 1: Text Receipt

```bash
curl -X POST https://your-n8n-instance.com/webhook/receipt2recipe \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_12345",
    "plan_tier": "basic",
    "household_size": 3,
    "dietary_preferences": ["vegetarian", "no_dairy"],
    "cooking_skill": "intermediate",
    "max_prep_time_minutes": 30,
    "receipt_text": "WHOLE FOODS MARKET\n123 Main St\nDate: 2025-01-18\n\nOrganic Bananas    $3.49\nSpinach 16oz       $4.99\nChickpeas 2 cans   $2.98\nWhole Wheat Pasta  $2.49\nTomato Sauce       $3.99\nOlive Oil          $8.99\nGarlic             $0.89\nOnions 3lb         $2.49\nBell Peppers       $4.99\nAlmond Milk        $4.49\nOats 42oz          $5.99\nPeanut Butter      $6.99\n\nTOTAL: $52.76"
  }'
```

### Example 2: Receipt Image URL

```bash
curl -X POST https://your-n8n-instance.com/webhook/receipt2recipe \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_67890",
    "plan_tier": "plus",
    "household_size": 2,
    "dietary_preferences": ["no_pork", "low_carb"],
    "cooking_skill": "beginner",
    "max_prep_time_minutes": 20,
    "receipt_file_url": "https://example.com/receipts/grocery-receipt-2025-01-18.jpg"
  }'
```

### Response Format

#### Success Response (200 OK)

```json
{
  "status": "success",
  "user_id": "user_12345",
  "plan_tier": "basic",
  "summary": "7-day vegetarian, no_dairy meal plan for household of 3, max 30 min prep time. Tier: basic. Week: 2025-01-19 to 2025-01-25. Est. food waste reduction: 85%.",
  "plan": {
    "plan_metadata": {
      "week_label": "2025-01-19 to 2025-01-25",
      "household_size": 3,
      "dietary_preferences": ["vegetarian", "no_dairy"],
      "max_prep_time_minutes": 30,
      "estimated_food_waste_reduction_percent": 85,
      "tier": "basic"
    },
    "days": [
      {
        "day": "Monday",
        "meals": [
          {
            "type": "breakfast",
            "title": "Overnight Oats with Banana",
            "description": "Creamy oats soaked in almond milk with sliced bananas",
            "uses_ingredients": ["oats", "almond milk", "bananas", "peanut butter"],
            "additional_ingredients_to_buy": ["honey", "cinnamon"],
            "prep_time_minutes": 5,
            "difficulty": "easy",
            "instructions": [
              "Mix oats with almond milk in a jar",
              "Refrigerate overnight",
              "Top with sliced banana and peanut butter in the morning"
            ]
          },
          {
            "type": "dinner",
            "title": "Chickpea Pasta Primavera",
            "description": "Whole wheat pasta with roasted vegetables and chickpeas",
            "uses_ingredients": ["pasta", "chickpeas", "bell peppers", "onions", "garlic", "tomato sauce", "olive oil"],
            "additional_ingredients_to_buy": [],
            "prep_time_minutes": 25,
            "difficulty": "easy",
            "instructions": [
              "Cook pasta according to package directions",
              "Sauté garlic and onions in olive oil",
              "Add bell peppers and chickpeas",
              "Stir in tomato sauce and cooked pasta",
              "Season and serve"
            ]
          }
        ]
      }
      // ... 6 more days
    ],
    "shopping_suggestions": [
      {
        "ingredient": "fresh herbs (basil, parsley)",
        "reason": "Enhance flavor of vegetarian dishes"
      },
      {
        "ingredient": "lemon",
        "reason": "Add brightness to meals throughout the week"
      }
    ]
  }
}
```

#### Error Response (500 Internal Server Error)

```json
{
  "status": "error",
  "error_type": "ValidationError",
  "message": "No receipt text available from either source",
  "timestamp": "2025-01-19T12:34:56.789Z"
}
```

## Workflow Nodes Explained

### Main Flow

1. **Webhook – Receipt2Recipe**
   Entry point that receives POST requests

2. **IF – Has Receipt File URL?**
   Branches logic based on input type (text vs. file)

3. **HTTP Request – Download Receipt** (conditional)
   Downloads image/PDF from provided URL

4. **HTTP Request – OCR** (conditional)
   Extracts text from receipt file using OCR API

5. **Code – Choose Receipt Source**
   Merges both paths and selects appropriate text source

6. **HTTP Request – LLM Parse Receipt Items**
   Sends receipt text to LLM for structured item extraction

7. **Code – Validate JSON Items**
   Validates LLM output and ensures proper structure

8. **Google Sheets – Get User Profile**
   Looks up user preferences from Users sheet

9. **Code – Merge Preferences**
   Combines webhook data with stored user profile

10. **IF – Tier Logic**
    Extensibility point for tier-based feature branching

11. **HTTP Request – LLM Generate Meal Plan**
    Sends items + profile to LLM for meal plan generation

12. **Code – Validate Meal Plan**
    Validates meal plan structure and content

13. **Code – Build Summary Text**
    Creates human-readable summary for storage

14. **Google Sheets – Save Meal Plan**
    Appends meal plan to MealPlans sheet

15. **Code – Build API Response**
    Formats final JSON response

16. **Respond to Webhook**
    Returns response to API caller

### Error Handling

17. **Error Trigger**
    Catches any errors from main workflow

18. **Code – Format Error Response**
    Standardizes error message format

19. **Google Sheets – Log Error** (optional)
    Saves error details to Errors sheet

20. **Respond Error to Webhook**
    Returns error response to caller

## Customization

### Adding New Pricing Tiers

The workflow includes a branching node **IF – Tier Logic** that can be extended:

1. Open the **IF – Tier Logic** node
2. Add new conditions for `plus` or `coach` tiers
3. Connect to modified LLM prompt nodes with tier-specific instructions

Example tier differences:
- **Basic**: Standard 7-day meal plan (breakfast, lunch, dinner)
- **Plus**: Enhanced plan with snacks, detailed nutrition info, shopping list optimization
- **Coach**: All Plus features + readiness for nutritionist review, macro tracking

### Modifying LLM Prompts

#### Receipt Parsing Prompt
Edit in **HTTP Request – LLM Parse Receipt Items** node:

```javascript
// Add new fields to output schema
{
  "raw_name": "string",
  "normalized_name": "string",
  "quantity": number|null,
  "unit": "string|null",
  "category": "produce|meat|dairy|frozen|pantry|bakery|snacks|beverages|other",
  "estimated_shelf_life_days": number,
  "price": number|null,
  "currency": "string|null",
  // NEW FIELDS
  "brand": "string|null",
  "organic": boolean,
  "nutritional_highlights": ["string"]
}
```

#### Meal Planning Prompt
Edit in **HTTP Request – LLM Generate Meal Plan** node:

Add constraints like:
- "Include at least 3 servings of vegetables per day"
- "Ensure protein in every meal"
- "Minimize added sugars"

### Switching LLM Providers

#### OpenAI → Anthropic Claude

1. Update `LLM_API_URL`:
   ```bash
   LLM_API_URL=https://api.anthropic.com/v1/messages
   ```

2. Modify request body in LLM nodes:
   ```json
   {
     "model": "claude-3-5-sonnet-20241022",
     "max_tokens": 4096,
     "messages": [...]
   }
   ```

3. Update response parsing in **Code – Validate** nodes:
   ```javascript
   // Anthropic format
   const textContent = llmResponse.content.find(c => c.type === 'text');
   const data = JSON.parse(textContent.text);
   ```

### Adding Notifications

Add after **Google Sheets – Save Meal Plan**:

1. **Email Node**:
   - Send meal plan summary to user
   - Include PDF attachment option

2. **Slack/Discord/WhatsApp Node**:
   - Notify user of new meal plan
   - Include quick link to view details

## Monitoring & Logging

### View Workflow Executions

1. Open workflow in n8n
2. Click **Executions** tab
3. Filter by status (Success/Error)
4. Click execution to see full data flow

### Check Error Logs

View errors in Google Sheets:
1. Open your Google Sheet
2. Navigate to **Errors** tab
3. Sort by timestamp descending

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| "No receipt text available" | Both `receipt_text` and `receipt_file_url` empty | Ensure one input is provided |
| "OCR API returned empty text" | OCR failed or low-quality image | Use higher resolution image or provide text directly |
| "No items extracted from receipt" | LLM couldn't parse receipt | Improve receipt formatting or use different LLM |
| "Invalid meal plan structure" | LLM didn't return proper JSON | Adjust temperature parameter or retry |
| "User not found in sheet" | `user_id` doesn't exist in Users sheet | Create user row or use fallback defaults |

## Performance Optimization

### Reduce Latency

1. **Use faster LLM models**:
   - GPT-3.5 Turbo instead of GPT-4
   - Claude Haiku instead of Sonnet

2. **Skip OCR when possible**:
   - Prefer `receipt_text` input over `receipt_file_url`

3. **Cache user profiles**:
   - Implement Redis/memory cache for frequent users

### Reduce Costs

1. **Lower LLM temperature** (0.1-0.3 for parsing)
2. **Use smaller context windows**
3. **Batch multiple requests** if processing many receipts
4. **Implement rate limiting** to prevent abuse

## Security Best Practices

1. **API Key Protection**:
   - Never commit credentials to version control
   - Use n8n's credential encryption
   - Rotate keys regularly

2. **Input Validation**:
   - Validate all webhook inputs
   - Sanitize receipt text before LLM processing
   - Limit file upload sizes for OCR

3. **Access Control**:
   - Use webhook authentication if exposing publicly
   - Implement rate limiting (n8n Rate Limit node)
   - Log all requests for audit trail

4. **Data Privacy**:
   - Encrypt Google Sheets data at rest
   - Implement GDPR-compliant data deletion
   - Don't log sensitive user information

## Integration Examples

### Frontend Integration (React)

```javascript
async function generateMealPlan(receiptData) {
  const response = await fetch('https://your-n8n.com/webhook/receipt2recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      plan_tier: 'basic',
      household_size: 3,
      dietary_preferences: ['vegetarian'],
      cooking_skill: 'intermediate',
      max_prep_time_minutes: 30,
      receipt_text: receiptData
    })
  });

  return await response.json();
}
```

### Mobile App (React Native)

```javascript
import DocumentPicker from 'react-native-document-picker';

async function uploadReceiptImage() {
  const file = await DocumentPicker.pick({
    type: [DocumentPicker.types.images]
  });

  // Upload to your storage (S3, Cloudinary, etc.)
  const uploadedUrl = await uploadFile(file);

  // Call n8n workflow
  const mealPlan = await fetch('https://your-n8n.com/webhook/receipt2recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      receipt_file_url: uploadedUrl
    })
  });

  return mealPlan;
}
```

## Roadmap

- [ ] Add nutrition facts calculation
- [ ] Implement calorie tracking
- [ ] Support for multi-week planning
- [ ] Recipe video integration
- [ ] Grocery delivery API integration (Instacart, Amazon Fresh)
- [ ] Mobile app with receipt scanning
- [ ] AI chef mode (voice-guided cooking)
- [ ] Family sharing features
- [ ] Meal prep batch cooking mode

## Contributing

To improve this workflow:

1. Fork the repository
2. Make your changes to the workflow JSON
3. Test thoroughly with various receipt types
4. Submit a pull request with detailed description

## License

MIT License - Free to use and modify

## Support

For issues or questions:
- Open a GitHub issue
- Check n8n community forum
- Consult [n8n documentation](https://docs.n8n.io)

---

**Built with n8n** - The workflow automation platform for technical people
