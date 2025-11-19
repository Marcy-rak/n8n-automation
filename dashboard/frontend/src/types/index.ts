export interface Overview {
  total_trades: number;
  total_wins: number;
  total_losses: number;
  pending_trades: number;
  win_rate: number;
  avg_confidence: number;
  total_pnl: number;
  last_trade_date: string;
}

export interface Trade {
  id: number;
  symbol: string;
  timeframe: string;
  direction: 'LONG' | 'SHORT' | 'FLAT';
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  confidence: number;
  rationale: string;
  is_win: boolean | null;
  actual_exit_price: number | null;
  pnl: number | null;
  created_at: string;
  evaluated_at: string | null;
}

export interface SymbolPerformance {
  symbol: string;
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl: number;
  avg_confidence: number;
}

export interface WinRateData {
  date: string;
  total_trades: number;
  wins: number;
  win_rate: number;
  daily_pnl: number;
}

export interface ConfidenceDistribution {
  confidence_range: string;
  count: number;
  win_rate: number;
}

export interface WorkflowStatus {
  status: string;
  count: number;
  last_run: string;
}

export interface PnlData {
  date: string;
  cumulative_pnl: number;
  daily_pnl: number;
}
