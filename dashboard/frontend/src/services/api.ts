import axios from 'axios';
import type {
  Overview,
  Trade,
  SymbolPerformance,
  WinRateData,
  ConfidenceDistribution,
  WorkflowStatus,
  PnlData,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const dashboardAPI = {
  getOverview: async (): Promise<Overview> => {
    const { data } = await api.get('/dashboard/overview');
    return data;
  },

  getRecentTrades: async (limit: number = 20): Promise<Trade[]> => {
    const { data } = await api.get('/dashboard/trades/recent', { params: { limit } });
    return data;
  },

  getTradeDetails: async (id: number): Promise<Trade> => {
    const { data } = await api.get(`/dashboard/trades/${id}`);
    return data;
  },

  getPerformanceBySymbol: async (): Promise<SymbolPerformance[]> => {
    const { data } = await api.get('/dashboard/performance/symbol');
    return data;
  },

  getWinRateOverTime: async (days: number = 30): Promise<WinRateData[]> => {
    const { data } = await api.get('/dashboard/analytics/win-rate', { params: { days } });
    return data;
  },

  getConfidenceDistribution: async (): Promise<ConfidenceDistribution[]> => {
    const { data } = await api.get('/dashboard/analytics/confidence');
    return data;
  },

  getWorkflowStatus: async (): Promise<WorkflowStatus[]> => {
    const { data } = await api.get('/dashboard/workflow/status');
    return data;
  },

  getPnlChart: async (days: number = 30): Promise<PnlData[]> => {
    const { data } = await api.get('/dashboard/analytics/pnl', { params: { days } });
    return data;
  },

  healthCheck: async (): Promise<{ status: string; database: string }> => {
    const { data } = await api.get('/health');
    return data;
  },
};
