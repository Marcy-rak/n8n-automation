import { Router } from 'express';
import dashboardController from '../controllers/dashboardController';

const router = Router();

// Overview stats
router.get('/overview', dashboardController.getOverview.bind(dashboardController));

// Recent trades
router.get('/trades/recent', dashboardController.getRecentTrades.bind(dashboardController));

// Trade details
router.get('/trades/:id', dashboardController.getTradeDetails.bind(dashboardController));

// Performance by symbol
router.get('/performance/symbol', dashboardController.getPerformanceBySymbol.bind(dashboardController));

// Win rate over time
router.get('/analytics/win-rate', dashboardController.getWinRateOverTime.bind(dashboardController));

// Confidence distribution
router.get('/analytics/confidence', dashboardController.getConfidenceDistribution.bind(dashboardController));

// Workflow status
router.get('/workflow/status', dashboardController.getWorkflowStatus.bind(dashboardController));

// P&L chart
router.get('/analytics/pnl', dashboardController.getPnlChart.bind(dashboardController));

export default router;
