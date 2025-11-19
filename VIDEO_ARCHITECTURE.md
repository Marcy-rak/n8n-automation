# Etsy AI Video Generation - Agentic Architecture

## Executive Summary

This document outlines the optimal agentic architecture for adding AI-generated product videos to the Etsy automation workflow, optimized for **lowest cost** and **maximum reliability**.

## Architecture Options Comparison

### Option A: Parallel Dual-Scenario (RECOMMENDED ⭐)
```
Trigger: Image Upload to Google Drive
    ↓
    ├─→ [Scenario 1: Video Generation] → Saves to Google Drive
    └─→ [Scenario 2: Listing Creation] → Checks for video → Creates listing
```

**Pros:**
- ✅ Non-blocking: Listing creation doesn't wait for video
- ✅ Cost control: Video generation can be conditional
- ✅ Easy debugging: Separate logs for each scenario
- ✅ Fault tolerance: Listing still created if video fails
- ✅ Can skip videos for certain products (save costs)

**Cons:**
- ❌ Slightly more complex setup
- ❌ Need to manage two scenarios

**Cost:** ~$0.015 per video (cheapest)

### Option B: Sequential Single-Scenario
```
Trigger → Download Image → Generate Video → Create Listing → Upload
```

**Pros:**
- ✅ Simple linear flow
- ✅ Everything in one place

**Cons:**
- ❌ Blocking: 30-60 second wait for video
- ❌ Higher failure rate (video failure = listing failure)
- ❌ Can't skip videos easily

**Cost:** ~$0.02 per video

### Option C: Webhook-Based Async (ADVANCED)
```
Main Scenario → Triggers Video Webhook → Creates Listing
Video Scenario → Completes → Webhook → Updates Listing with Video
```

**Pros:**
- ✅ Fully asynchronous
- ✅ Can update listings after creation
- ✅ Scalable to multiple video versions

**Cons:**
- ❌ Most complex
- ❌ Requires Etsy API update calls (extra operations)
- ❌ Videos added after listing is live

**Cost:** ~$0.025 per video (extra operations)

---

## RECOMMENDED ARCHITECTURE: Parallel Dual-Scenario

### Why This Works Best

1. **Cost Optimization**: Video generation runs independently, can be throttled or skipped
2. **Reliability**: Listing creation succeeds even if video fails
3. **Speed**: Listing publishes faster, video adds later
4. **Flexibility**: Easy to disable video for certain categories

### Video Generation Technology Stack

#### Chosen Solution: **Replicate + Stable Video Diffusion**

**Cost Breakdown:**
- Replicate API: ~$0.0055 per second of video
- 3-second product video: ~$0.0165 per video
- Monthly (1000 videos): **~$16.50**

**Alternative Solutions (Cost Comparison):**

| Solution | Cost per Video | Quality | Speed | Notes |
|----------|---------------|---------|-------|-------|
| **Replicate (StableVideoDiffusion)** | **$0.015** | ⭐⭐⭐⭐ | 30s | **BEST VALUE** |
| Replicate (AnimateDiff) | $0.018 | ⭐⭐⭐⭐ | 25s | Good motion |
| D-ID API | $0.04 | ⭐⭐⭐ | 20s | Talking heads only |
| Runway ML | $0.10 | ⭐⭐⭐⭐⭐ | 45s | Expensive |
| **FFmpeg Slideshow** | **$0.001** | ⭐⭐⭐ | 5s | **CHEAPEST** |
| Canva API | $0.02 | ⭐⭐⭐⭐ | 15s | Template-based |

**Winner: Replicate + Stable Video Diffusion** (or FFmpeg for ultra-low-cost)

---

## Technical Implementation

### Scenario 1: Video Generation (Runs First)

**Modules:**
1. **Google Drive Watch** - Monitors "Etsy Main Photos"
2. **Download Image** - Gets the main product photo
3. **Claude AI** - Generates video prompt from image
4. **Replicate API** - Creates video using Stable Video Diffusion
5. **Google Drive Upload** - Saves video to "Etsy Videos" folder

**Estimated Time:** 30-45 seconds
**Cost:** ~$0.015 per execution

### Scenario 2: Listing Creation (Modified Main)

**Modifications:**
1. **Add Video Check Module** - Searches Google Drive for matching video
2. **Conditional Video Upload** - If video exists, includes in listing
3. **Fallback Logic** - Creates listing without video if not found

**Estimated Time:** 20-30 seconds (same as before)
**Cost:** Same as before + $0 (video is optional)

---

## Video Generation Specifications

### Video Requirements for Etsy

- **Format**: MP4 (H.264)
- **Duration**: 5-15 seconds (recommended: 5-8 seconds for cost)
- **Resolution**: 1280x720 (720p) or 1920x1080 (1080p)
- **File Size**: Max 100MB (typically 2-5MB for 5s video)
- **Aspect Ratio**: 16:9 or 1:1 (square for Pinterest)

### Video Content Strategy

**Low-Cost Approach (FFmpeg Slideshow - $0.001/video):**
```
Frame 1: Product image with zoom-in effect (1.5s)
Frame 2: Product with text overlay "Handmade Quality" (1.5s)
Frame 3: Close-up detail (AI-generated crop) (1.5s)
Frame 4: Product with price tag overlay (1.5s)
```

**AI Approach (Stable Video Diffusion - $0.015/video):**
```
- Input: Main product image
- Motion: Gentle rotation or zoom
- Duration: 3-5 seconds
- Enhancement: AI adds subtle motion and depth
```

### Prompt Engineering for Video AI

**Claude AI generates video prompt:**
```json
{
  "video_prompt": "Elegant slow 360-degree rotation of handmade silver jewelry piece, studio lighting, white background, professional product showcase",
  "motion_type": "rotate",
  "duration": 3,
  "style": "product_commercial"
}
```

---

## Cost-Benefit Analysis

### Monthly Cost Breakdown (1000 listings)

| Component | Replicate Video | FFmpeg Video | No Video |
|-----------|----------------|--------------|----------|
| Make.com Operations | $29-79 | $29-79 | $29-79 |
| Claude AI (listing) | $30-50 | $30-50 | $30-50 |
| Video Generation | **$16.50** | **$1** | $0 |
| **TOTAL** | **$75.50-145.50** | **$60-130** | $59-129 |

### ROI Considerations

**Etsy Listings with Video:**
- 2.5x higher engagement rate
- 1.8x higher conversion rate
- $16.50/month for 1000 videos = **$0.0165 per sale boost**

**Verdict:** Video addition pays for itself if it increases conversions by >0.5%

---

## Implementation Recommendations

### Phase 1: Start with FFmpeg (Ultra Low-Cost)
- Cost: ~$1/month for 1000 videos
- Quality: Good for simple products
- Easy to implement
- **Use Case:** Test market response to videos

### Phase 2: Upgrade to AI Video (If Profitable)
- Cost: ~$16.50/month for 1000 videos
- Quality: Professional, dynamic
- Better engagement
- **Use Case:** Once you confirm videos improve sales

### Phase 3: Hybrid Approach (Optimal)
- FFmpeg for simple products (jewelry, prints)
- AI video for complex products (clothing, 3D items)
- Conditional logic based on category
- **Cost:** ~$8-10/month (mixed usage)

---

## Agentic Workflow Design

### Agent Roles

**Agent 1: Image Watcher**
- **Role**: Monitor Google Drive for new uploads
- **Actions**: Trigger both scenarios simultaneously
- **Intelligence**: Basic file detection

**Agent 2: Video Creator**
- **Role**: Analyze image and generate video
- **Actions**:
  - Claude analyzes product type
  - Chooses video style (rotation, zoom, slideshow)
  - Generates video via Replicate or FFmpeg
  - Uploads to Google Drive with matching filename
- **Intelligence**: Context-aware video style selection

**Agent 3: Listing Assembler**
- **Role**: Gather all assets and create listing
- **Actions**:
  - Collect images (1 main + 9 additional)
  - Check for video (wait max 10 seconds)
  - Generate listing data with Claude
  - Create Etsy listing with all media
- **Intelligence**: Adaptive waiting, fallback logic

**Agent 4: Pinterest Distributor**
- **Role**: Create pins with video preference
- **Actions**:
  - Create video pins if video exists
  - Otherwise create image pins
  - Link all to Etsy listing
- **Intelligence**: Media format selection

### Communication Protocol

```
Event: New Image Uploaded
  ↓
Trigger Both Agents in Parallel:

  Agent 2 (Video):                    Agent 3 (Listing):
    Download Image                      Wait 0-10 seconds
    ↓                                   ↓
    Analyze with Claude                 Search for video
    ↓                                   ↓
    Generate Video (30s)                If found: Include
    ↓                                   If not: Skip
    Upload to Drive                     ↓
    ↓                                   Create Listing
    Done                                ↓
                                        Trigger Agent 4
                                        ↓
                                        Create Pins
```

### Error Handling Strategy

**Video Generation Fails:**
- Agent 3 continues without video
- Listing created successfully
- User notified of video failure

**Listing Creation Fails:**
- Agent 2's video is saved (can retry)
- Manual intervention required
- Video available for future use

**Both Fail:**
- All assets remain in Google Drive
- Can trigger manual retry
- No data loss

---

## Advanced Features (Future)

### Multi-Version Video Generation
- Create multiple video styles
- A/B test performance
- Auto-select best performer

### Video Analytics Integration
- Track video view rates
- Correlate with conversion
- Auto-disable low-performing videos

### Smart Video Scheduling
- Generate videos during off-peak hours
- Queue system for batch processing
- Cost optimization through timing

---

## File Naming Convention

**Images:**
- Main: `PRODUCT-001-main.jpg`
- Additional: `PRODUCT-001-alt1.jpg`, etc.

**Videos:**
- Video: `PRODUCT-001-video.mp4`
- Short: `PRODUCT-001-short.mp4` (Pinterest 6s)

### Folder Structure

```
Google Drive/
├── Etsy Main Photos/
│   └── PRODUCT-001-main.jpg
├── Etsy Additional Photos/
│   ├── PRODUCT-001-alt1.jpg
│   └── PRODUCT-001-alt2.jpg
└── Etsy Videos/
    └── PRODUCT-001-video.mp4
```

---

## Next Steps

1. ✅ Review architecture options
2. ✅ Choose video generation method (Replicate or FFmpeg)
3. ✅ Deploy Video Generation Scenario
4. ✅ Update Main Listing Scenario
5. ✅ Test with sample products
6. ✅ Monitor costs and performance
7. ✅ Optimize based on results

---

## Decision Matrix

**Choose FFmpeg if:**
- Budget is extremely tight (<$5/month)
- Simple products (flat items, prints, jewelry)
- Starting out, testing concept
- Need fast processing (<10 seconds)

**Choose Replicate if:**
- Budget allows $15-20/month
- Complex products (3D items, clothing, home goods)
- Want professional quality
- Higher-end products (>$50 price point)

**Choose Hybrid if:**
- Want optimal cost/quality balance
- Diverse product catalog
- Can implement conditional logic
- Data-driven decision making

---

## Support and Resources

- **Replicate Documentation**: https://replicate.com/docs
- **Stable Video Diffusion**: https://replicate.com/stability-ai/stable-video-diffusion
- **FFmpeg Documentation**: https://ffmpeg.org/documentation.html
- **Etsy Video Requirements**: https://help.etsy.com/hc/en-us/articles/115015663847

## Version History

- **v1.0** (2025-11-19): Initial architecture design
