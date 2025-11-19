# Trading Dashboard

Modern, real-time web dashboard for monitoring your automated trading workflow system.

## Features

- **Real-time Overview Stats**: Total trades, win rate, P&L, average confidence
- **Interactive Charts**: Win rate over time, cumulative P&L visualization
- **Recent Trades Table**: View latest trades with outcomes, confidence, and P&L
- **Symbol Performance**: Breakdown by trading pairs with win rates
- **Auto-refresh**: Dashboard updates every 30 seconds
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Beautiful UI**: Modern design with Tailwind CSS

## Screenshots

### Dashboard Overview
- 📊 Key stats cards (total trades, win rate, P&L, confidence)
- 📈 Win rate trend chart
- 💰 Cumulative P&L chart
- 📋 Symbol performance table
- 📑 Recent trades with outcomes

## Tech Stack

### Backend (Port 3001)
- **Express.js** - REST API
- **TypeScript** - Type safety
- **PostgreSQL** - Database queries
- **CORS** - Cross-origin support

### Frontend (Port 3000)
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - API client

## Quick Start

### Option 1: Docker (Recommended)

```bash
# From dashboard directory
cd dashboard

# Start all services (backend + frontend + postgres)
docker-compose up -d

# View logs
docker-compose logs -f

# Access dashboard
open http://localhost:3000
```

### Option 2: Manual Setup

**Prerequisites:**
- Node.js 18+
- PostgreSQL running with `trading_workflow` database

**Backend:**
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

# Backend running on http://localhost:3001
```

**Frontend:**
```bash
cd dashboard/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend running on http://localhost:3000
```

## Environment Variables

### Backend (.env)
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trading_workflow
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001/api
```

## API Endpoints

### Dashboard Stats
- `GET /api/dashboard/overview` - Overview statistics
- `GET /api/dashboard/trades/recent?limit=20` - Recent trades
- `GET /api/dashboard/trades/:id` - Trade details
- `GET /api/dashboard/performance/symbol` - Performance by symbol
- `GET /api/dashboard/analytics/win-rate?days=30` - Win rate over time
- `GET /api/dashboard/analytics/pnl?days=30` - P&L chart data
- `GET /api/dashboard/analytics/confidence` - Confidence distribution
- `GET /api/dashboard/workflow/status` - Workflow execution status
- `GET /api/health` - Health check

## Dashboard Components

### StatCard
Displays key metrics with icons and colors:
- Total Trades
- Win Rate
- Total P&L
- Average Confidence

### WinRateChart
Line chart showing win rate percentage over time (last 30 days).

### PnlChart
Area chart displaying cumulative profit/loss in pips.

### RecentTradesTable
Interactive table with:
- Symbol & timeframe
- Direction (LONG/SHORT/FLAT)
- Entry price
- Confidence score (progress bar)
- Outcome (WIN/LOSS/PENDING)
- P&L in pips
- Timestamp

### SymbolPerformanceTable
Shows performance metrics for each trading pair:
- Total trades count
- Wins vs Losses
- Win rate percentage
- Total P&L
- Bar chart visualization

## Development

### Backend Development
```bash
cd backend
npm run dev  # Watch mode with nodemon
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### Build for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Remove all (including volumes)
docker-compose down -v
```

## Database Requirements

The dashboard reads from the `trade_ideas` and `analysis_logs` tables created by the workflows.

**Required tables:**
- `trade_ideas` - Trade data with outcomes
- `analysis_logs` - Workflow execution logs

Make sure your database is initialized with `schema.sql`.

## Troubleshooting

### Backend won't start
```bash
# Check database connection
psql -U postgres -d trading_workflow -c "SELECT 1;"

# Check if port 3001 is available
lsof -i :3001

# View backend logs
docker-compose logs backend
```

### Frontend can't reach API
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check CORS settings in backend
# Ensure FRONTEND_URL matches your frontend URL

# Check .env file in frontend
cat frontend/.env
```

### No data showing
```bash
# Check if trades exist in database
psql -U postgres -d trading_workflow -c "SELECT COUNT(*) FROM trade_ideas;"

# Run workflows first to generate data
# Then refresh dashboard
```

### Docker networking issues
```bash
# Restart network
docker-compose down
docker-compose up -d

# Check services can communicate
docker exec trading_dashboard_frontend ping backend
```

## Performance

- **Auto-refresh**: Dashboard fetches new data every 30 seconds
- **Lazy loading**: Only loads visible data
- **Optimized queries**: Indexed database queries
- **Gzip compression**: Enabled in nginx
- **Asset caching**: Static assets cached for 1 year

## Customization

### Change Refresh Interval
Edit `frontend/src/hooks/useDashboardData.ts`:
```typescript
const interval = setInterval(fetchDashboardData, 60000); // 60 seconds
```

### Change Chart Time Range
Default is 30 days. Modify API calls:
```typescript
dashboardAPI.getWinRateOverTime(60)  // 60 days
dashboardAPI.getPnlChart(60)
```

### Add More Symbols
Dashboard automatically shows all symbols from database. No configuration needed.

### Customize Colors
Edit `frontend/tailwind.config.js` to change color scheme.

## Security Considerations

- **CORS**: Configured to allow only frontend URL
- **Helmet**: Security headers enabled in backend
- **Environment Variables**: Sensitive data in .env files
- **Read-only**: Dashboard only reads data, no writes
- **Input Validation**: API validates all query parameters

## Production Deployment

### Using Docker
```bash
# Set production environment variables
cp .env.example .env
# Edit .env with production values

# Deploy with docker-compose
docker-compose -f docker-compose.yml up -d

# Behind reverse proxy (nginx/traefik)
# Configure SSL termination
# Point domain to port 3000
```

### Manual Deployment

**Backend (PM2):**
```bash
npm install -g pm2
cd backend
npm run build
pm2 start dist/server.js --name trading-dashboard-api
pm2 save
```

**Frontend (nginx):**
```bash
cd frontend
npm run build
# Copy dist/ to /var/www/html
# Configure nginx to serve static files
```

## Monitoring

- Check `/api/health` endpoint for backend status
- Monitor docker logs: `docker-compose logs -f`
- Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- Check database performance with `EXPLAIN ANALYZE` on slow queries

## Future Enhancements

- [ ] User authentication
- [ ] Trade filtering and search
- [ ] Export data to CSV/Excel
- [ ] Dark mode toggle
- [ ] Real-time WebSocket updates
- [ ] Trade alerts and notifications
- [ ] Detailed trade analysis modal
- [ ] Backtesting visualization
- [ ] Mobile app (React Native)

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Verify database connection
3. Ensure workflows are running
4. Check API health endpoint

## License

MIT License - See parent project LICENSE

---

**Built with ❤️ for automated trading analysis**
