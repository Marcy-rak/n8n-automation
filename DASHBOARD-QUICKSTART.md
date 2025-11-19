# Dashboard Quick Start Guide

## 🎯 What is the Dashboard?

A **modern, real-time web interface** to monitor your automated trading workflows. View all your trades, performance metrics, win rates, and P&L in a beautiful, responsive dashboard.

## ✨ Features

- 📊 **Real-time Stats** - Total trades, win rate, P&L, confidence
- 📈 **Interactive Charts** - Win rate trends, cumulative P&L visualization
- 📋 **Trade History** - View all trades with outcomes and details
- 🎯 **Symbol Performance** - Breakdown by trading pairs
- 🔄 **Auto-refresh** - Updates every 30 seconds
- 📱 **Responsive** - Works on desktop, tablet, mobile
- 🚀 **Fast** - Built with React + Vite

## 🚀 Quick Start (2 minutes)

### Using Docker (Easiest)

```bash
# From project root
cd dashboard

# Start everything (backend + frontend + database)
docker-compose up -d

# Open dashboard
open http://localhost:3000
```

That's it! Dashboard is running.

### Ports

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432

## 📸 What You'll See

### Dashboard Overview
```
┌─────────────────────────────────────────────────────────┐
│  Trading Dashboard - Automated Analysis System          │
│                                              [Refresh]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │  Total   │  │   Win    │  │  Total   │  │   Avg    ││
│  │  Trades  │  │   Rate   │  │   P&L    │  │Confidence││
│  │   150    │  │  65.5%   │  │  +245.3  │  │  78.2%   ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│                                                          │
│  ┌────────────────────┐  ┌─────────────────────────┐   │
│  │  Win Rate Chart    │  │   Cumulative P&L        │   │
│  │  (Last 30 days)    │  │   (Last 30 days)        │   │
│  │                    │  │                         │   │
│  │   [Line Chart]     │  │   [Area Chart]          │   │
│  └────────────────────┘  └─────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Performance by Symbol                           │  │
│  │  ┌──────┬────────┬──────┬────────┬──────────┐   │  │
│  │  │Symbol│ Trades │ Wins │ Losses │ Win Rate │   │  │
│  │  ├──────┼────────┼──────┼────────┼──────────┤   │  │
│  │  │EURUSD│   45   │  30  │   15   │  66.7%   │   │  │
│  │  │GBPUSD│   38   │  24  │   14   │  63.2%   │   │  │
│  │  └──────┴────────┴──────┴────────┴──────────┘   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Recent Trades                                   │  │
│  │  ┌────┬──────┬─────┬────────┬────────┬─────┐    │  │
│  │  │Sym │ Dir  │Entry│Confid. │Outcome │ P&L │    │  │
│  │  ├────┼──────┼─────┼────────┼────────┼─────┤    │  │
│  │  │EUR │📈LONG│1.095│ 85% ██ │✅ WIN  │+45.2│    │  │
│  │  │GBP │📉SHORT│1.273│ 72% ██│✅ WIN  │+32.1│    │  │
│  │  │USD │📈LONG│110.5│ 68% ██ │❌ LOSS│-18.5│    │  │
│  │  └────┴──────┴─────┴────────┴────────┴─────┘    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Dashboard Sections

### 1. Overview Cards
Four key metrics displayed prominently:
- **Total Trades**: All trades in database
- **Win Rate**: Percentage of winning trades
- **Total P&L**: Cumulative profit/loss in pips
- **Avg Confidence**: Average AI confidence score

### 2. Charts
- **Win Rate Chart**: Track how your win rate changes over time
- **P&L Chart**: Visual representation of cumulative profits

### 3. Symbol Performance
Table showing each trading pair's performance:
- Number of trades
- Wins vs losses
- Win rate percentage
- Total P&L
- Bar chart visualization

### 4. Recent Trades Table
Interactive table with latest trades:
- Symbol & timeframe
- Direction (🎯 LONG/SHORT/FLAT)
- Entry price
- Confidence bar (visual indicator)
- Outcome (✅ WIN / ❌ LOSS / ⏳ PENDING)
- P&L in pips
- Timestamp

## 🔧 Manual Setup (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL with `trading_workflow` database

### Backend (API Server)

```bash
cd dashboard/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Build and start
npm run build
npm start
```

Backend running on **http://localhost:3001**

### Frontend (Web Interface)

```bash
cd dashboard/frontend

# Install dependencies
npm install

# Configure API URL (optional)
echo "VITE_API_URL=http://localhost:3001/api" > .env

# Start dev server
npm run dev
```

Frontend running on **http://localhost:3000**

## 🌐 API Endpoints

The backend provides these REST endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/dashboard/overview` | Overall statistics |
| `GET /api/dashboard/trades/recent` | Recent trades list |
| `GET /api/dashboard/performance/symbol` | Performance by symbol |
| `GET /api/dashboard/analytics/win-rate` | Win rate chart data |
| `GET /api/dashboard/analytics/pnl` | P&L chart data |
| `GET /api/health` | Health check |

## 🔄 Auto-Refresh

Dashboard automatically refreshes data every **30 seconds**.

You can also manually refresh by clicking the **"Refresh"** button in the header.

## 📊 Data Requirements

Dashboard reads from your PostgreSQL database:
- **trade_ideas** table - Trade data with outcomes
- **analysis_logs** table - Workflow execution logs

Make sure:
1. Database is initialized (run `schema.sql`)
2. Workflows are running and creating trades
3. Workflow 2 is updating outcomes daily

## 🐛 Troubleshooting

### Dashboard shows "Loading..." forever

**Problem**: Can't connect to backend API

**Solution**:
```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Should return: {"status":"ok","database":"connected"}

# If not, restart backend
cd dashboard/backend
npm start
```

### "No data" or empty charts

**Problem**: No trades in database

**Solution**:
```bash
# Check database
psql -U postgres -d trading_workflow -c "SELECT COUNT(*) FROM trade_ideas;"

# If 0 rows: Run your workflows first to generate trades
# Import and activate workflow-1-analysis.json and workflow-2-outcome-updater.json
```

### Docker containers won't start

**Problem**: Port conflicts or missing .env

**Solution**:
```bash
# Check what's using ports
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # PostgreSQL

# Stop conflicting services or change ports in docker-compose.yml

# Recreate containers
docker-compose down -v
docker-compose up -d
```

### Charts not displaying

**Problem**: Missing data for date range

**Solution**:
- Default is last 30 days
- If you just started, you may not have 30 days of data
- Dashboard will show data for whatever is available

### CORS errors in browser console

**Problem**: Backend not allowing frontend origin

**Solution**:
```bash
# Check backend .env file
cat dashboard/backend/.env

# Ensure FRONTEND_URL matches your frontend
FRONTEND_URL=http://localhost:3000

# Restart backend
docker-compose restart backend
```

## 🎯 Customization

### Change Refresh Interval

Edit `dashboard/frontend/src/hooks/useDashboardData.ts`:

```typescript
// Change from 30 seconds to 60 seconds
const interval = setInterval(fetchDashboardData, 60000);
```

### Change Chart Time Range

Modify API calls in the same file:

```typescript
// Change from 30 days to 60 days
dashboardAPI.getWinRateOverTime(60),
dashboardAPI.getPnlChart(60),
```

### Customize Colors

Edit `dashboard/frontend/tailwind.config.js` to change the color scheme.

## 📦 Production Deployment

### Docker (Recommended)

```bash
# Production environment
cp .env.example .env
# Edit .env with production credentials

# Deploy
docker-compose up -d

# Behind reverse proxy (nginx/traefik)
# Point your domain to port 3000
# Configure SSL
```

### Manual Deployment

**Backend:**
```bash
# Build
cd dashboard/backend
npm run build

# Run with PM2
pm2 start dist/server.js --name trading-dashboard-api

# Or run with systemd
# Create service file at /etc/systemd/system/trading-dashboard.service
```

**Frontend:**
```bash
# Build
cd dashboard/frontend
npm run build

# Serve with nginx
# Copy dist/ to /var/www/html
# Configure nginx to serve static files
```

## 🔐 Security

- Dashboard is **read-only** - it only displays data
- No authentication built-in (add nginx basic auth if needed)
- CORS restricted to frontend URL
- Database user should have read-only permissions
- Use environment variables for secrets

## 💡 Tips

1. **First Time**: Run workflows for a few days to build up data
2. **Best View**: Desktop browser (1920x1080 or higher)
3. **Performance**: Dashboard handles thousands of trades smoothly
4. **Mobile**: Fully responsive, works on phones/tablets
5. **Real-time**: Leave dashboard open, it auto-updates every 30s

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. Verify database connection
3. Test API: `curl http://localhost:3001/api/health`
4. Check browser console for errors
5. See full docs: `dashboard/README.md`

---

## 🎉 That's It!

You now have a beautiful, real-time dashboard monitoring your trading workflows!

**Quick Commands:**
```bash
# Start dashboard
cd dashboard && docker-compose up -d

# View logs
docker-compose logs -f

# Stop dashboard
docker-compose down

# Access dashboard
open http://localhost:3000
```

**Happy monitoring! 📊**
