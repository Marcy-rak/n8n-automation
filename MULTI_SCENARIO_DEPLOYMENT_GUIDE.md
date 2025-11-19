# Multi-Scenario Deployment Guide
## Etsy AI Automation with Video Generation

This guide walks you through deploying the complete Etsy automation system with parallel video generation.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GOOGLE DRIVE                              │
│  ┌──────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ Etsy Main    │  │ Etsy Additional │  │ Etsy Videos    │  │
│  │ Photos       │  │ Photos          │  │                │  │
│  └──────┬───────┘  └─────────────────┘  └────────▲───────┘  │
└─────────┼──────────────────────────────────────────┼─────────┘
          │                                           │
          │ (New image uploaded)                      │
          │                                           │
          ├───────────────┬───────────────────────────┘
          │               │
          ▼               ▼
  ┌───────────────┐  ┌──────────────────┐
  │  SCENARIO 1   │  │   SCENARIO 2     │
  │ Video Gen     │  │ Listing Creation │
  │               │  │                  │
  │ • Watch Files │  │ • Watch Files    │
  │ • Download    │  │ • Search Images  │
  │ • AI Prompt   │  │ • Wait 10s       │
  │ • Replicate   │  │ • Search Video   │
  │ • Upload      │  │ • AI Listing     │
  │               │  │ • Sheets Lookup  │
  │ ~30-45 sec    │  │ • Create Draft   │
  └───────────────┘  │ • Upload Video   │
                     │ • Upload Images  │
                     │ • Publish        │
                     │ • Pinterest      │
                     │                  │
                     │ ~30-40 sec       │
                     └──────────────────┘
```

**Execution Flow:**
1. Image uploaded to "Etsy Main Photos"
2. Both scenarios trigger simultaneously
3. Scenario 1: Generates video (30-45s)
4. Scenario 2: Waits 10s, then checks for video
5. If video ready: includes in listing
6. If video not ready: creates listing without video
7. Listing published regardless of video status

---

## Deployment Options

### Option A: Replicate AI Video (Recommended)
**Cost:** ~$0.015 per video
**Quality:** ⭐⭐⭐⭐
**Best For:** Professional stores, higher-end products ($30+)

### Option B: FFmpeg Slideshow (Budget)
**Cost:** ~$0.001 per video
**Quality:** ⭐⭐⭐
**Best For:** High-volume stores, budget-conscious sellers

### Option C: Hybrid (Optimal)
**Cost:** ~$0.008 average per video
**Quality:** Mixed
**Best For:** Large catalogs with varied product types

---

## Pre-Deployment Checklist

### 1. Make.com Account
- [ ] Active Make.com account (Professional plan recommended)
- [ ] Minimum 10,000 operations/month available
- [ ] Team plan if using multiple scenarios

### 2. API Keys & Credentials
- [ ] Anthropic Claude API key (https://console.anthropic.com/)
- [ ] Replicate API key (https://replicate.com/account/api-tokens)
- [ ] Etsy Shop ID
- [ ] Pinterest Board ID
- [ ] Google account with Drive & Sheets access

### 3. Google Drive Folder Setup
Create three folders:
- [ ] `/Etsy Main Photos`
- [ ] `/Etsy Additional Photos`
- [ ] `/Etsy Videos`

Note the folder IDs from URLs:
```
https://drive.google.com/drive/folders/FOLDER_ID_HERE
```

### 4. Google Sheets Setup
- [ ] Created "Etsy Rules" spreadsheet
- [ ] Added category data (see format below)
- [ ] Noted spreadsheet ID from URL

### 5. Service Connections
Ensure you can connect:
- [ ] Google Drive (OAuth)
- [ ] Google Sheets (OAuth)
- [ ] Anthropic Claude (API Key)
- [ ] Etsy (OAuth - requires Developer App)
- [ ] Pinterest (OAuth)

---

## Step-by-Step Deployment

### Phase 1: Deploy Scenario 1 (Video Generation)

#### 1.1 Choose Your Video Method

**For Replicate AI (Recommended):**
```bash
# Use file: video-generation-scenario-ai.json
# Required: Replicate API key
# Cost: $0.015/video
```

**For FFmpeg (Budget):**
```bash
# Use file: video-generation-scenario-ffmpeg.json
# Required: Make.com private cloud or custom module
# Cost: $0.001/video
# Note: Not available on standard Make.com cloud!
```

#### 1.2 Import Scenario 1
1. Log into Make.com
2. Click "Scenarios" → "Create a new scenario"
3. Click ⋮ menu → "Import Blueprint"
4. Select `video-generation-scenario-ai.json` (or ffmpeg version)
5. Click "Import"

#### 1.3 Configure Replicate Connection (AI version only)
1. Click on Module 5 (HTTP - Replicate API)
2. Add Replicate API key to headers:
   ```
   Replace: {{YOUR_REPLICATE_API_KEY}}
   With: r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

#### 1.4 Configure Google Drive Connection
1. Click Module 1 (Watch Files)
2. Connect your Google Drive account
3. Select "Etsy Main Photos" folder
4. Click Module 12 (Upload File)
5. Set folder to "Etsy Videos"
6. Replace: `{{YOUR_ETSY_VIDEOS_FOLDER_ID}}`
7. With your actual folder ID

#### 1.5 Test Scenario 1
1. Turn ON the scenario (toggle bottom-left)
2. Upload a test image: `TEST-001-main.jpg` to "Etsy Main Photos"
3. Monitor execution (should complete in 30-45 seconds)
4. Verify video appears in "Etsy Videos" folder
5. Video filename should be: `TEST-001-video.mp4`

**Troubleshooting:**
- If Replicate fails: Check API key and credits
- If upload fails: Verify folder permissions
- If no video generated: Check AI prompt module logs

---

### Phase 2: Deploy Scenario 2 (Listing Creation)

#### 2.1 Import Scenario 2
1. In Make.com, create another new scenario
2. Import `etsy-automation-with-video-blueprint.json`

#### 2.2 Configure All Placeholders

**Module 2 (Additional Photos Search):**
```
Replace: {{YOUR_ADDITIONAL_PHOTOS_FOLDER_ID}}
With: 1a2b3c4d5e6f7g8h9i0j (your folder ID)
```

**Module 7 (Google Sheets):**
```
Replace: {{YOUR_ETSY_RULES_SPREADSHEET_ID}}
With: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms (your sheet ID)
```

**Module 19 (Video Search):**
```
Replace: {{YOUR_ETSY_VIDEOS_FOLDER_ID}}
With: 1a2b3c4d5e6f7g8h9i0j (your folder ID)
```

**Modules 10, 13, 14, 15, 21 (Etsy):**
```
Replace: {{YOUR_ETSY_SHOP_ID}}
With: 12345678 (your shop ID - numeric)
```

**Module 17 (Pinterest):**
```
Replace: {{YOUR_PINTEREST_BOARD_ID}}
With: 987654321 (your board ID)
```

#### 2.3 Connect Services
1. **Google Drive** (Modules 1, 2, 12, 19, 20)
   - Click each module → Add connection
   - Authorize Google account
2. **Anthropic Claude** (Module 4)
   - Add API key connection
   - Paste your Claude API key
3. **Google Sheets** (Module 7)
   - Same Google connection as Drive
4. **Etsy** (Modules 10, 13, 14, 15, 21)
   - Create Etsy Developer App first
   - Add OAuth connection
   - Authorize shop access
5. **Pinterest** (Module 17)
   - Add OAuth connection
   - Select target board

#### 2.4 Configure Sleep Duration (Module 18)
The default 10-second wait may need adjustment:
- **Replicate AI**: Keep at 10 seconds (video usually done in 30-45s)
- **FFmpeg**: Reduce to 5 seconds (faster processing)
- **Slow connection**: Increase to 15 seconds

#### 2.5 Test Scenario 2 (Without Video First)
1. Turn ON Scenario 2
2. Turn OFF Scenario 1 temporarily
3. Upload `TEST-002-main.jpg` to "Etsy Main Photos"
4. Add 2-3 images to "Additional Photos": `TEST-002-alt1.jpg`, etc.
5. Monitor execution
6. Verify:
   - [ ] Draft listing created
   - [ ] All images uploaded
   - [ ] Listing published
   - [ ] Etsy Ads enabled
   - [ ] Pinterest pins created

#### 2.6 Test Full System (With Video)
1. Turn ON Scenario 1
2. Scenario 2 should already be ON
3. Upload `TEST-003-main.jpg`
4. Add additional images: `TEST-003-alt1.jpg`, etc.
5. Monitor BOTH scenarios running in parallel
6. Verify:
   - [ ] Scenario 1 creates video
   - [ ] Scenario 2 waits, finds video
   - [ ] Video included in Etsy listing
   - [ ] Pinterest pin has video

---

## Google Sheets Configuration

### Etsy Rules Spreadsheet Format

Create a sheet with these exact column headers:

| A | B | C | D |
|---|---|---|---|
| Category | Taxonomy ID | Materials | Shipping Profile ID |

**Example Data:**
```
jewelry     | 1234567 | sterling silver, gemstone, chain          | 9876543210
clothing    | 2345678 | cotton, polyester, elastic                | 9876543210
art         | 3456789 | canvas, acrylic paint, wood frame         | 9876543210
home-decor  | 4567890 | ceramic, glaze, porcelain                 | 9876543210
accessories | 5678901 | leather, metal hardware, fabric           | 9876543210
```

**How to Get These Values:**

**Taxonomy ID:**
```bash
# Use Etsy API to find taxonomy IDs
curl -X GET "https://openapi.etsy.com/v3/application/seller-taxonomy/nodes" \
  -H "x-api-key: YOUR_ETSY_API_KEY"
```
Or browse: https://www.etsy.com/sellers/handbook/article/taxonomy-changes/586437536588

**Shipping Profile ID:**
1. Go to Etsy Shop Manager
2. Settings → Shipping settings
3. Click on a shipping profile
4. ID is in the URL: `/settings/shipping/profiles/123456789`

**Materials:**
- Comma-separated list
- Must be valid Etsy materials
- Max 13 materials per listing

---

## Operational Guidelines

### Daily Operations

**Morning Routine:**
1. Check both scenarios are ON
2. Review overnight executions for errors
3. Verify Google Drive folders accessible
4. Check API rate limits (Claude, Replicate)

**Image Upload Process:**
1. Name main image: `PRODUCT-XXX-main.jpg`
2. Upload to "Etsy Main Photos" folder
3. Upload additional images: `PRODUCT-XXX-alt1.jpg`, `PRODUCT-XXX-alt2.jpg` to "Additional Photos"
4. Wait 60 seconds for complete processing
5. Verify listing on Etsy

**Bulk Upload Process:**
1. Prepare all images with proper naming
2. Upload main images (triggers scenarios)
3. Space uploads 30-60 seconds apart
4. Monitor Make.com execution queue
5. Don't exceed 50 uploads/hour (to avoid rate limits)

### Monitoring & Alerts

**Set up Make.com Notifications:**
1. Scenario Settings → Error Handling
2. Enable "Email notification on error"
3. Set max consecutive errors: 3
4. Add Slack webhook for real-time alerts (optional)

**Key Metrics to Track:**
- Execution success rate (target: >95%)
- Average execution time (target: <60s)
- Video generation success rate (target: >90%)
- Cost per listing (target: <$0.10)

### Error Handling

**Common Errors & Fixes:**

| Error | Scenario | Fix |
|-------|----------|-----|
| "Folder not found" | Both | Re-authorize Google Drive |
| "Invalid API key" | Video Gen | Check Replicate key, verify credits |
| "Taxonomy ID invalid" | Listing | Update Google Sheets with valid IDs |
| "Video not found" | Listing | Increase wait time (Module 18) |
| "Rate limit exceeded" | Both | Add delays, reduce upload frequency |
| "Image too large" | Listing | Resize images to <10MB |

**Rollback Procedure:**
1. Turn OFF both scenarios
2. Check last successful execution
3. Manually delete failed listings from Etsy
4. Fix configuration issue
5. Re-run with corrected data

---

## Cost Management

### Monthly Cost Calculator

```
Variables:
- Listings per month: L
- Make.com plan: $29-79
- Claude API: $0.04 per listing
- Replicate API: $0.015 per video
- Pinterest API: Free

Total Monthly Cost:
= Make.com plan + (L × $0.04) + (L × $0.015)
= Make.com plan + (L × $0.055)

Examples:
- 100 listings: $29 + $5.50 = $34.50
- 500 listings: $49 + $27.50 = $76.50
- 1000 listings: $79 + $55.00 = $134.00
```

### Cost Optimization Tips

1. **Use Haiku for Video Prompts** (Module 3 in video scenario)
   - Saves ~$0.03 per video
   - Change model from Sonnet to Haiku

2. **Conditional Video Generation**
   - Add filter: Only generate video if price > $30
   - Saves video costs on low-value items

3. **Batch Processing**
   - Upload images during off-peak hours
   - Reduces API rate limit issues

4. **Hybrid Approach**
   - Use Replicate for jewelry, clothing
   - Use FFmpeg for art prints, digital items
   - Average cost: ~$0.008 per video

---

## Advanced Configurations

### Conditional Video by Category

Add filter in Scenario 1 (Module 4):
```javascript
// Only generate video for specific categories
{{if(
  contains(1.name, "jewelry") OR
  contains(1.name, "clothing") OR
  contains(1.name, "handmade"),
  true,
  false
)}}
```

### Multiple Video Styles

Create 3 separate video scenarios:
1. **Jewelry**: Slow rotation (3s, subtle motion)
2. **Clothing**: Moderate zoom (5s, moderate motion)
3. **Dynamic Products**: Fast pan (3s, dynamic motion)

Route by filename prefix or category.

### A/B Testing Video Performance

Add Google Sheets logging:
1. After listing publish (Module 14)
2. Add "Append Row" module
3. Log: Listing ID, Has Video (Y/N), Timestamp
4. Analyze conversion rates weekly

### Webhook Integration

Replace Watch Files trigger with webhook:
1. Module 1: Replace with "Webhooks → Custom Webhook"
2. Get webhook URL from Make.com
3. Use Google Apps Script to trigger on file upload:

```javascript
function onFileUpload(e) {
  var file = e.source.getActiveFolder().getFiles();
  var webhookUrl = "https://hook.us1.make.com/xxxxx";

  UrlFetchApp.fetch(webhookUrl, {
    method: 'post',
    payload: JSON.stringify({
      fileId: file.getId(),
      fileName: file.getName()
    })
  });
}
```

---

## Security Best Practices

### API Key Management
- [ ] Store API keys in Make.com data stores (not hardcoded)
- [ ] Rotate Replicate API key every 90 days
- [ ] Use separate Claude key for production vs. testing
- [ ] Enable Etsy OAuth scope restrictions

### Google Drive Permissions
- [ ] Use dedicated Google account for automation
- [ ] Set folders to "Only me" access
- [ ] Enable 2FA on Google account
- [ ] Audit sharing permissions monthly

### Etsy Security
- [ ] Never commit listings with placeholder data
- [ ] Test in Etsy sandbox environment first
- [ ] Limit Etsy OAuth scopes to minimum required
- [ ] Monitor for suspicious listing activity

---

## Scaling Guidelines

### Handling High Volume (1000+ listings/month)

**Make.com Plan:**
- Upgrade to Professional ($79/month)
- Minimum 20,000 operations/month
- Consider Team plan for collaboration

**API Rate Limits:**
- Claude: 50 requests/minute (Tier 1)
- Replicate: 30 requests/minute
- Etsy: 10,000 requests/day
- Google Drive: 1,000 uploads/day

**Optimization Strategies:**
1. Add sleep modules between batches (5-10s)
2. Use queue system for uploads
3. Implement retry logic with exponential backoff
4. Cache Google Sheets data locally

**Infrastructure:**
- Consider Make.com private cloud for FFmpeg
- Use Cloud Storage for video processing
- Implement CDN for image delivery

---

## Maintenance Schedule

### Weekly Tasks
- [ ] Review error logs
- [ ] Check API credit balances (Claude, Replicate)
- [ ] Verify listing quality (spot check 10 random listings)
- [ ] Update Google Sheets with new categories

### Monthly Tasks
- [ ] Analyze conversion rates (with/without video)
- [ ] Review and optimize AI prompts
- [ ] Update Etsy taxonomy if changed
- [ ] Clean up old test files from Google Drive
- [ ] Review Make.com operation usage

### Quarterly Tasks
- [ ] Audit all API keys and rotate
- [ ] Review and update video generation prompts
- [ ] Analyze cost vs. benefit of video generation
- [ ] Update materials list in Google Sheets
- [ ] Performance review and optimization

---

## Troubleshooting Guide

### Video Not Generated

**Symptoms:** Scenario 1 completes but no video in Drive

**Diagnosis:**
1. Check Replicate API response in Module 7
2. Look for error status in Module 10
3. Verify video download succeeded (Module 11)

**Solutions:**
- Replicate error: Check API credits
- Timeout: Increase retry count (Module 8)
- Upload failed: Check folder permissions

### Listing Created Without Video

**Symptoms:** Listing publishes but video missing

**Diagnosis:**
1. Check Module 18 sleep duration
2. Verify Module 19 search query
3. Check Module 20 filter condition

**Solutions:**
- Increase wait time to 15-20 seconds
- Verify video filename matches: `PRODUCT-XXX-video.mp4`
- Check video folder ID is correct

### Pinterest Pin Fails

**Symptoms:** Listing created but Pinterest pin not posted

**Diagnosis:**
1. Check Pinterest OAuth connection
2. Verify board ID exists
3. Check image URL accessibility

**Solutions:**
- Re-authorize Pinterest connection
- Verify board is public/accessible
- Ensure Etsy image URLs are public

---

## Performance Benchmarks

### Expected Execution Times

| Scenario | Min | Avg | Max | Notes |
|----------|-----|-----|-----|-------|
| Video Gen (Replicate) | 25s | 35s | 60s | Depends on queue |
| Video Gen (FFmpeg) | 8s | 12s | 20s | Faster, lower quality |
| Listing Creation (no video) | 18s | 25s | 40s | Standard flow |
| Listing Creation (with video) | 25s | 35s | 50s | Includes video upload |
| Full Pipeline | 35s | 50s | 90s | Both scenarios |

### Success Rate Targets

| Metric | Target | Good | Needs Improvement |
|--------|--------|------|-------------------|
| Video Generation | >90% | 85-90% | <85% |
| Listing Creation | >95% | 90-95% | <90% |
| Image Upload | >98% | 95-98% | <95% |
| Pinterest Posting | >92% | 88-92% | <88% |

---

## Support & Resources

### Official Documentation
- **Make.com**: https://www.make.com/en/help
- **Replicate**: https://replicate.com/docs
- **Anthropic Claude**: https://docs.anthropic.com/
- **Etsy API**: https://www.etsy.com/developers/documentation
- **Pinterest API**: https://developers.pinterest.com/

### Community Resources
- Make.com Community: https://community.make.com/
- Etsy Seller Forums: https://community.etsy.com/
- Reddit r/EtsySellers: https://reddit.com/r/EtsySellers

### Getting Help
1. Check Make.com execution logs
2. Review this troubleshooting guide
3. Search Make.com community forums
4. Contact Make.com support (Professional plan)
5. Hire Make.com certified consultant

---

## Appendix

### A. File Naming Conventions

```
Main Image:       PRODUCT-001-main.jpg
Additional 1:     PRODUCT-001-alt1.jpg
Additional 2:     PRODUCT-001-alt2.jpg
...
Additional 9:     PRODUCT-001-alt9.jpg
Generated Video:  PRODUCT-001-video.mp4
```

**Rules:**
- Product ID must be consistent across files
- Use `-main` suffix for main image
- Use `-alt` + number for additional images
- Video automatically named by scenario

### B. Etsy Listing Limits

- **Title**: 140 characters max
- **Description**: 1000 characters max (5000 for some categories)
- **Tags**: Exactly 13 tags, 20 characters each
- **Images**: 10 max
- **Videos**: 1 per listing
- **Materials**: 13 max
- **Price**: $0.20 minimum

### C. Make.com Operation Costs

| Module Type | Operations | Notes |
|-------------|-----------|-------|
| Trigger (Watch Files) | 1 | Per execution |
| Google Drive Download | 1 | Per file |
| HTTP Request | 1 | Per request |
| Anthropic API | 1 | Per message |
| Iterator | 0 | Free |
| Aggregator | 1 | Per aggregation |
| Filter | 0 | Free |
| Sleep | 0 | Free |

**Estimated Operations per Listing:**
- Video Scenario: ~12 operations
- Listing Scenario: ~25 operations
- **Total: ~37 operations per listing**

**Monthly Breakdown:**
- 100 listings = 3,700 operations (~$29 plan)
- 500 listings = 18,500 operations (~$49 plan)
- 1000 listings = 37,000 operations (~$79 plan)

---

## Version History

- **v1.0** (2025-11-19): Initial multi-scenario deployment guide
- Architecture design complete
- Cost analysis included
- Full troubleshooting guide

---

**Last Updated:** 2025-11-19
**Document Owner:** AI Automation Team
**Next Review:** 2025-12-19
