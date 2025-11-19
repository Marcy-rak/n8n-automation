# Make.com Etsy AI Automation - Setup Guide

## Overview

This blueprint automates the complete workflow for creating Etsy listings and Pinterest pins from product photos uploaded to Google Drive.

## Workflow Summary

1. **Trigger**: New image uploaded to Google Drive folder "Etsy Main Photos"
2. **Fetch Additional Images**: Search for up to 9 related images in "Etsy Additional Photos" folder
3. **AI Analysis**: Claude analyzes the main image and generates listing data (title, description, tags, category)
4. **Category Lookup**: Google Sheets retrieves category-specific settings (materials, taxonomy, shipping)
5. **Create Draft**: Etsy draft listing created with all data
6. **Upload Images**: All 10 images uploaded with unique alt text
7. **Publish**: Listing activated and Etsy Ads enabled
8. **Pinterest**: Pin created for each image linking to the Etsy listing

## Prerequisites

### 1. Make.com Account
- Active Make.com account with sufficient operations quota
- Recommended: Professional plan for advanced features

### 2. Connected Services
You need to connect the following services in Make.com:
- **Google Drive** (OAuth connection)
- **Google Sheets** (OAuth connection)
- **Anthropic Claude** (API Key)
- **Etsy** (OAuth 2.0 connection)
- **Pinterest** (OAuth connection)

### 3. Google Drive Folder Structure
Create two folders in Google Drive:
```
/Etsy Main Photos/          (Main product images)
/Etsy Additional Photos/    (Additional product images, 9 max)
```

**File Naming Convention:**
- Main photo: `PRODUCT-001-main.jpg`
- Additional photos: `PRODUCT-001-alt1.jpg`, `PRODUCT-001-alt2.jpg`, etc.
- The prefix before the first hyphen (e.g., `PRODUCT-001`) must match

### 4. Google Sheets Configuration

Create a spreadsheet named "Etsy Rules" with the following columns:

| A: Category | B: Taxonomy ID | C: Materials | D: Shipping Profile ID |
|-------------|----------------|--------------|------------------------|
| jewelry | 1234567 | sterling silver, gemstone | 9876543210 |
| clothing | 2345678 | cotton, polyester | 9876543210 |
| art | 3456789 | canvas, acrylic paint | 9876543210 |
| home-decor | 4567890 | wood, metal | 9876543210 |

**How to find these values:**
- **Taxonomy ID**: Use [Etsy Taxonomy API](https://www.etsy.com/developers/documentation/reference/taxonomy)
- **Shipping Profile ID**: Found in Etsy Shop Manager > Settings > Shipping profiles (inspect URL)
- **Materials**: Comma-separated list of materials for the category

### 5. API Keys & Credentials

#### Anthropic Claude API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Add to Make.com connections

#### Etsy Shop ID
1. Go to Etsy Shop Manager
2. Your Shop ID is in the URL: `etsy.com/your-shop-name/shop-id-HERE`
3. Or use [Etsy Open API](https://www.etsy.com/developers/documentation) to find it

#### Pinterest Board ID
1. Go to Pinterest
2. Open your target board
3. Board ID is in the URL: `pinterest.com/username/board-name/BOARD-ID-HERE`
4. Or use Pinterest API to retrieve it

## Installation Steps

### Step 1: Import Blueprint
1. Open Make.com
2. Click "Create a new scenario"
3. Click the three dots menu (⋮) > "Import Blueprint"
4. Upload `etsy-automation-makecom-blueprint.json`

### Step 2: Configure Placeholders
Replace the following placeholders in the scenario:

#### Module 2 (Google Drive Search Files)
```
{{YOUR_ADDITIONAL_PHOTOS_FOLDER_ID}}
```
**How to find:**
1. Open Google Drive folder "Etsy Additional Photos"
2. Copy the folder ID from the URL: `drive.google.com/drive/folders/FOLDER-ID-HERE`

#### Module 7 (Google Sheets Search)
```
{{YOUR_ETSY_RULES_SPREADSHEET_ID}}
```
**How to find:**
1. Open your "Etsy Rules" spreadsheet
2. Copy the ID from the URL: `docs.google.com/spreadsheets/d/SPREADSHEET-ID-HERE/edit`

#### Module 10, 13, 14, 15 (Etsy Modules)
```
{{YOUR_ETSY_SHOP_ID}}
```
Replace with your Etsy Shop ID (numeric value)

#### Module 17 (Pinterest)
```
{{YOUR_PINTEREST_BOARD_ID}}
```
Replace with your Pinterest Board ID

### Step 3: Connect Services
1. Click on each module that shows a warning icon
2. Select or create a connection:
   - **Google Drive**: OAuth 2.0 connection
   - **Google Sheets**: OAuth 2.0 connection
   - **Anthropic**: API Key connection
   - **Etsy**: OAuth 2.0 connection (requires Etsy Developer App)
   - **Pinterest**: OAuth 2.0 connection

### Step 4: Configure Trigger
1. Click on Module 1 (Google Drive Watch Files)
2. Select the "Etsy Main Photos" folder
3. Set the watch type to "New Files Only"
4. Set file type filter to "Images"

### Step 5: Test the Scenario

1. **Turn on the scenario** (toggle switch in bottom-left)
2. **Upload a test image** to "Etsy Main Photos" folder
   - File name: `TEST-001-main.jpg`
3. **Upload 2-3 additional images** to "Etsy Additional Photos" folder
   - File names: `TEST-001-alt1.jpg`, `TEST-001-alt2.jpg`
4. **Monitor the execution** in Make.com
5. **Check the results**:
   - Draft listing created in Etsy
   - Images uploaded with alt text
   - Listing published and activated
   - Pinterest pins created

### Step 6: Troubleshooting

#### Common Issues

**Issue: "Folder not found" error**
- Solution: Verify folder IDs are correct and Make.com has access permissions

**Issue: "Invalid taxonomy ID" error**
- Solution: Check that taxonomy IDs in Google Sheets are valid Etsy taxonomy IDs

**Issue: AI returns invalid JSON**
- Solution: The scenario includes JSON parsing. If it fails, check Claude API response format

**Issue: No additional images found**
- Solution: Verify file naming convention matches (prefix before first hyphen must match)

**Issue: Pinterest pin creation fails**
- Solution: Verify Pinterest board exists and Make.com has write permissions

## Advanced Customization

### Modify AI Prompt
Edit Module 4 (Anthropic Claude) to customize the AI's behavior:
- Change the system prompt for different writing styles
- Adjust the user prompt for specific product types
- Modify the JSON schema for different data requirements

### Add Custom Fields
You can extend the Google Sheets lookup to include:
- Production partners
- Returns policy
- Personalization options
- Shop sections

### Adjust Image Count
Current setup: 1 main + 9 additional = 10 total

To change:
- Module 2: Modify `maxResults` parameter
- Module 11: Adjust array logic if needed

### Add Notification Module
Add a module after Module 15 to send notifications:
- Email notification with listing URL
- Slack message to team channel
- SMS alert for successful publish

## Cost Estimation

### Make.com Operations
- Approximate operations per run: 30-40
- Monthly cost (1000 listings): ~$29-79 depending on plan

### API Costs
- **Claude API**: ~$0.03-0.05 per image analysis
- **Etsy API**: Free for standard operations
- **Pinterest API**: Free for standard operations

### Total Cost (1000 listings/month)
- Make.com: $29-79
- Claude API: $30-50
- **Total: $59-129/month**

## Maintenance

### Weekly Tasks
- Review failed scenario runs
- Check Google Sheets for new categories
- Verify Etsy listings are publishing correctly

### Monthly Tasks
- Update AI prompts based on listing performance
- Review and optimize tags based on Etsy analytics
- Update materials list in Google Sheets

## Support Resources

- **Make.com Documentation**: https://www.make.com/en/help
- **Etsy API Documentation**: https://www.etsy.com/developers/documentation
- **Anthropic Claude API**: https://docs.anthropic.com/
- **Pinterest API**: https://developers.pinterest.com/

## Version History

- **v1.0** (2025-11-19): Initial release with complete automation workflow

## License

This blueprint is provided as-is for use with make.com scenarios.
