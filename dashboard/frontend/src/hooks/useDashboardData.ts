import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import type {
  Overview,
  Trade,
  SymbolPerformance,
  WinRateData,
  PnlData,
} from '../types';

export const useDashboardData = () => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [symbolPerformance, setSymbolPerformance] = useState<SymbolPerformance[]>([]);
  const [winRateData, setWinRateData] = useState<WinRateData[]>([]);
  const [pnlData, setPnlData] = useState<PnlData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        overviewData,
        tradesData,
        performanceData,
        winRateChartData,
        pnlChartData,
      ] = await Promise.all([
        dashboardAPI.getOverview(),
        dashboardAPI.getRecentTrades(20),
        dashboardAPI.getPerformanceBySymbol(),
        dashboardAPI.getWinRateOverTime(30),
        dashboardAPI.getPnlChart(30),
      ]);

      setOverview(overviewData);
      setRecentTrades(tradesData);
      setSymbolPerformance(performanceData);
      setWinRateData(winRateChartData);
      setPnlData(pnlChartData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    overview,
    recentTrades,
    symbolPerformance,
    winRateData,
    pnlData,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};
