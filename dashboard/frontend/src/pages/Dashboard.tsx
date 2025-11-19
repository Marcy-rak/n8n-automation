import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { StatCard } from '../components/StatCard';
import { WinRateChart } from '../components/WinRateChart';
import { PnlChart } from '../components/PnlChart';
import { RecentTradesTable } from '../components/RecentTradesTable';
import { SymbolPerformanceTable } from '../components/SymbolPerformanceTable';
import {
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  AlertCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    overview,
    recentTrades,
    symbolPerformance,
    winRateData,
    pnlData,
    loading,
    error,
    refetch,
  } = useDashboardData();

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error loading dashboard</p>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trading Dashboard</h1>
              <p className="text-gray-600 mt-1">Automated Analysis System</p>
            </div>
            <button
              onClick={refetch}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Trades"
            value={overview.total_trades}
            subtitle={`${overview.pending_trades} pending`}
            icon={Activity}
            color="blue"
          />
          <StatCard
            title="Win Rate"
            value={`${overview.win_rate?.toFixed(1) || 0}%`}
            subtitle={`${overview.total_wins} wins / ${overview.total_losses} losses`}
            icon={Target}
            color={overview.win_rate >= 60 ? 'green' : overview.win_rate >= 50 ? 'blue' : 'red'}
          />
          <StatCard
            title="Total P&L"
            value={`${overview.total_pnl >= 0 ? '+' : ''}${overview.total_pnl?.toFixed(1) || 0}`}
            subtitle="pips"
            icon={DollarSign}
            color={overview.total_pnl >= 0 ? 'green' : 'red'}
          />
          <StatCard
            title="Avg Confidence"
            value={`${overview.avg_confidence?.toFixed(1) || 0}%`}
            subtitle="Average confidence score"
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <WinRateChart data={winRateData} />
          <PnlChart data={pnlData} />
        </div>

        {/* Symbol Performance */}
        <div className="mb-8">
          <SymbolPerformanceTable data={symbolPerformance} />
        </div>

        {/* Recent Trades */}
        <div>
          <RecentTradesTable trades={recentTrades} />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>
              Last update: {overview.last_trade_date
                ? new Date(overview.last_trade_date).toLocaleString()
                : 'No trades yet'}
            </span>
          </div>
          <p className="mt-2">Dashboard auto-refreshes every 30 seconds</p>
        </div>
      </main>
    </div>
  );
};
