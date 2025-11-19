#!/bin/bash
# Subscription Optimizer - Example API Calls
# Replace YOUR_N8N_URL with your actual n8n instance URL

# Example 1: Basic test with manual subscriptions only (no Gmail scan)
echo "Example 1: Manual subscriptions only"
echo "======================================"

curl -X POST https://YOUR_N8N_URL/webhook/subscription-optimizer \
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
      },
      {
        "name": "Canva Pro",
        "cost": 16,
        "billing_cycle": "monthly",
        "category": "design"
      },
      {
        "name": "Grammarly Premium",
        "cost": 12,
        "billing_cycle": "monthly",
        "category": "productivity"
      }
    ]
  }'

echo -e "\n\n"

# Example 2: Full test with Gmail scan enabled
echo "Example 2: With Gmail scan enabled"
echo "===================================="

curl -X POST https://YOUR_N8N_URL/webhook/subscription-optimizer \
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
      },
      {
        "name": "Adobe Creative Cloud",
        "cost": 54.99,
        "billing_cycle": "monthly",
        "category": "design"
      },
      {
        "name": "Netflix Premium",
        "cost": 19.99,
        "billing_cycle": "monthly",
        "category": "entertainment"
      }
    ]
  }'

echo -e "\n\n"

# Example 3: Production test with multiple subscriptions
echo "Example 3: Production test - Multiple subscriptions"
echo "===================================================="

curl -X POST https://YOUR_N8N_URL/webhook/subscription-optimizer \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "prod_user_001",
    "scan_gmail": true,
    "manual_subscriptions": [
      {
        "name": "Spotify Premium",
        "cost": 10.99,
        "billing_cycle": "monthly",
        "category": "music"
      },
      {
        "name": "YouTube Premium",
        "cost": 13.99,
        "billing_cycle": "monthly",
        "category": "entertainment"
      },
      {
        "name": "ChatGPT Plus",
        "cost": 20,
        "billing_cycle": "monthly",
        "category": "ai"
      },
      {
        "name": "Midjourney",
        "cost": 30,
        "billing_cycle": "monthly",
        "category": "ai"
      },
      {
        "name": "Grammarly Premium",
        "cost": 12,
        "billing_cycle": "monthly",
        "category": "productivity"
      },
      {
        "name": "Canva Pro",
        "cost": 16,
        "billing_cycle": "monthly",
        "category": "design"
      },
      {
        "name": "Dropbox Plus",
        "cost": 11.99,
        "billing_cycle": "monthly",
        "category": "storage"
      },
      {
        "name": "Evernote Premium",
        "cost": 10.83,
        "billing_cycle": "monthly",
        "category": "productivity"
      },
      {
        "name": "1Password",
        "cost": 7.99,
        "billing_cycle": "monthly",
        "category": "security"
      },
      {
        "name": "Adobe Stock",
        "cost": 29.99,
        "billing_cycle": "monthly",
        "category": "design"
      }
    ]
  }'

echo -e "\n\n"

# Example 4: Test with annual subscriptions
echo "Example 4: Annual billing cycle subscriptions"
echo "=============================================="

curl -X POST https://YOUR_N8N_URL/webhook/subscription-optimizer \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "annual_user_001",
    "scan_gmail": false,
    "manual_subscriptions": [
      {
        "name": "Microsoft 365",
        "cost": 99.99,
        "billing_cycle": "annual",
        "category": "productivity"
      },
      {
        "name": "Adobe Creative Cloud",
        "cost": 599.88,
        "billing_cycle": "annual",
        "category": "design"
      },
      {
        "name": "JetBrains All Products",
        "cost": 249,
        "billing_cycle": "annual",
        "category": "development"
      }
    ]
  }'

echo -e "\n\n"

# Example 5: Minimal test (single subscription)
echo "Example 5: Single subscription test"
echo "===================================="

curl -X POST https://YOUR_N8N_URL/webhook/subscription-optimizer \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "minimal_test",
    "scan_gmail": false,
    "manual_subscriptions": [
      {
        "name": "Notion",
        "cost": 10,
        "billing_cycle": "monthly",
        "category": "productivity"
      }
    ]
  }'

echo -e "\n\n"

# Example 6: Test error handling (empty subscriptions)
echo "Example 6: Error handling test (empty subscriptions)"
echo "====================================================="

curl -X POST https://YOUR_N8N_URL/webhook/subscription-optimizer \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "error_test",
    "scan_gmail": false,
    "manual_subscriptions": []
  }'

echo -e "\n\n"

# Example 7: Using jq for pretty output (if jq is installed)
echo "Example 7: Pretty formatted output with jq"
echo "==========================================="

curl -s -X POST https://YOUR_N8N_URL/webhook/subscription-optimizer \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "pretty_test",
    "scan_gmail": false,
    "manual_subscriptions": [
      {
        "name": "Spotify",
        "cost": 10.99,
        "billing_cycle": "monthly",
        "category": "music"
      },
      {
        "name": "Netflix",
        "cost": 15.49,
        "billing_cycle": "monthly",
        "category": "entertainment"
      }
    ]
  }' | jq '.'

echo -e "\n\n"

# Example 8: Save response to file
echo "Example 8: Save response to JSON file"
echo "======================================"

curl -s -X POST https://YOUR_N8N_URL/webhook/subscription-optimizer \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "file_test",
    "scan_gmail": false,
    "manual_subscriptions": [
      {
        "name": "GitHub Copilot",
        "cost": 10,
        "billing_cycle": "monthly",
        "category": "development"
      }
    ]
  }' > subscription_report.json

echo "Response saved to subscription_report.json"

# Usage instructions
echo -e "\n\n"
echo "===================="
echo "Usage Instructions"
echo "===================="
echo ""
echo "1. Replace YOUR_N8N_URL with your actual n8n instance URL"
echo "   Example: https://n8n.example.com or http://localhost:5678"
echo ""
echo "2. Make sure your n8n workflow is active and the webhook is enabled"
echo ""
echo "3. Configure environment variables in n8n:"
echo "   - LLM_API_URL (e.g., https://api.openai.com/v1/chat/completions)"
echo "   - LLM_API_KEY (your API key)"
echo "   - GOOGLE_SHEETS_ID (your Google Sheet ID)"
echo ""
echo "4. Run individual examples by copying the curl command"
echo "   or run this entire script: bash subscription-optimizer-examples.sh"
echo ""
echo "5. For pretty output, install jq: sudo apt-get install jq"
echo ""
echo "===================="
