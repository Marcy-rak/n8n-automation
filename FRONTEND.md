# Gift Advisor Frontend

A beautiful, responsive HTML frontend for the Gift Advisor n8n workflow.

## Features

✨ **Modern Design**
- Clean, gradient-based UI
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and transitions

🎯 **User-Friendly**
- Simple form with dropdowns and text fields
- Quick example buttons for testing
- Real-time validation

📊 **Rich Results Display**
- Gift suggestions shown as cards
- Product listings with images, prices, and links
- "Best Deal" highlighting
- Rating display

⚙️ **Easy Configuration**
- Built-in webhook URL configuration
- Settings saved in browser's local storage
- No backend required (static HTML)

## Quick Start

### Method 1: Open Directly in Browser

1. Simply open `index.html` in your web browser:
   ```bash
   # From the project directory
   open index.html
   # or
   firefox index.html
   # or
   chrome index.html
   ```

2. Click "⚙️ Configure Webhook URL" and enter your n8n webhook URL

3. Fill out the form and click "Find Perfect Gifts 🎁"

### Method 2: Serve with Python HTTP Server

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: http://localhost:8000

### Method 3: Serve with Node.js

```bash
# Install a simple server
npx http-server

# Or if you have it installed globally
http-server
```

Then open the URL shown in the terminal.

### Method 4: Deploy to Hosting

Upload `index.html` to any static hosting service:
- **Netlify**: Drag and drop the file
- **Vercel**: Deploy with `vercel --prod`
- **GitHub Pages**: Push to a `gh-pages` branch
- **AWS S3**: Upload as a static website

## Configuration

### Setting the Webhook URL

1. Open the frontend in your browser
2. Click the "⚙️ Configure Webhook URL" button
3. Enter your n8n webhook URL (e.g., `https://your-n8n.com/webhook/gift-advisor`)
4. The URL is automatically saved in your browser

**Finding your webhook URL:**
1. Open your n8n workflow
2. Click on the "Webhook" node
3. Copy the "Production URL" or "Test URL"

## Usage

### Form Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Age** | Recipient's age or age range | "30" or "25-35" |
| **Gender** | Recipient's gender | Male, Female, Non-binary |
| **Interests** | Hobbies and interests (comma-separated) | "yoga, reading, coffee" |
| **Budget** | Price range you want to spend | "$50-100" |
| **Occasion** | What's the occasion? | Birthday, Anniversary, etc. |
| **Relationship** | Your relationship to recipient | Friend, Spouse, Parent, etc. |

### Quick Examples

The frontend includes 3 pre-filled examples:
- **Friend's Birthday**: 30yr old female who likes yoga and reading
- **Anniversary**: 35yr old male who likes gaming and tech
- **Parent's Gift**: 60yr old female who likes gardening and cooking

Just click any example button to auto-fill the form!

## Results Display

Each gift suggestion shows:

📦 **Gift Card** containing:
- Gift number (1-5)
- Gift name and category badge
- Estimated price range
- Detailed description
- Available products section (if found)

🛍️ **Product Items** include:
- Product thumbnail image
- Product name with "Best Deal" badge for top pick
- Store name and rating
- Current price
- "View Deal" button linking to the product

## Customization

### Change Colors

Edit the CSS variables in the `<style>` section:

```css
/* Main gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your preferred colors */
background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
```

### Modify Form Fields

Add or remove fields in the HTML `<form>` section. Update the corresponding JavaScript in the form submit handler:

```javascript
const formData = {
    age: document.getElementById('age').value,
    // Add your custom field here
    customField: document.getElementById('customField').value,
};
```

### Change Number of Suggestions

The frontend displays all suggestions returned by the API (default: 5). To change this, modify the n8n workflow, not the frontend.

## Troubleshooting

### "Please configure your webhook URL"
- Click the settings button and enter your n8n webhook URL
- Make sure the workflow is activated in n8n

### "Failed to fetch" or CORS errors
- **Development**: Use a local server (don't open file:// directly)
- **Production**: Ensure n8n allows requests from your domain
- **n8n Cloud**: CORS should work automatically
- **Self-hosted n8n**: May need to configure CORS headers

### No products showing in results
- SerpAPI might be out of credits (free tier: 100/month)
- API key might be missing or invalid
- Products still show with estimated prices from AI

### Results not displaying
- Open browser DevTools (F12) and check Console for errors
- Verify the webhook URL is correct
- Check that the API response format matches expected structure

## Browser Compatibility

✅ Tested and works on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

⚠️ May have issues with:
- Internet Explorer (not supported)
- Very old browser versions

## Mobile Experience

The frontend is fully responsive:
- **Desktop**: Form on left, results on right (2-column layout)
- **Tablet/Mobile**: Stacked layout (form above results)
- Touch-friendly buttons and inputs
- Optimized font sizes and spacing

## Security Notes

🔒 **Privacy**
- Webhook URL stored in browser's localStorage (client-side only)
- No data is stored on any server by the frontend
- All requests go directly from browser to your n8n instance

🌐 **HTTPS Recommended**
- Use HTTPS for both frontend and webhook URL in production
- Prevents man-in-the-middle attacks
- Required for some modern browser features

## Advanced: Adding Analytics

To track usage, add analytics scripts before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR_ID');
</script>
```

## Example Deployment Scripts

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir .
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Deploy to GitHub Pages
```bash
# Create gh-pages branch
git checkout -b gh-pages

# Push to GitHub
git push origin gh-pages

# Enable in repo settings > Pages > Source: gh-pages branch
```

## Performance

⚡ **Fast Loading**
- Single HTML file (~20KB)
- No external dependencies
- Inline CSS and JavaScript
- Images loaded only for results

## Accessibility

♿ **WCAG Compliant**
- Semantic HTML
- Proper form labels
- Keyboard navigation support
- Color contrast ratios meet AA standards

## Future Enhancements

Ideas for v2:
- [ ] Dark mode toggle
- [ ] Save favorite gifts
- [ ] Share results via URL/email
- [ ] Print-friendly gift list
- [ ] Compare multiple gift options
- [ ] Budget calculator
- [ ] Gift occasion calendar

---

**Enjoy finding the perfect gifts!** 🎁
