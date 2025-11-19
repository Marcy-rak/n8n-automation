import React from 'react';
import { Trade } from '../types';
import { TrendingUp, TrendingDown, Minus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface RecentTradesTableProps {
  trades: Trade[];
}

export const RecentTradesTable: React.FC<RecentTradesTableProps> = ({ trades }) => {
  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'LONG':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'SHORT':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getOutcomeIcon = (isWin: boolean | null) => {
    if (isWin === true) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (isWin === false) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const getOutcomeText = (isWin: boolean | null) => {
    if (isWin === true) return 'WIN';
    if (isWin === false) return 'LOSS';
    return 'PENDING';
  };

  const getOutcomeColor = (isWin: boolean | null) => {
    if (isWin === true) return 'text-green-600 bg-green-50';
    if (isWin === false) return 'text-red-600 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Recent Trades</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Direction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Outcome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                P&L
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{trade.symbol}</div>
                  <div className="text-xs text-gray-500">{trade.timeframe}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getDirectionIcon(trade.direction)}
                    <span className={`text-sm font-medium ${
                      trade.direction === 'LONG' ? 'text-green-600' :
                      trade.direction === 'SHORT' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {trade.direction}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trade.entry_price.toFixed(5)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${trade.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-700">
                      {(trade.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOutcomeColor(trade.is_win)}`}>
                    {getOutcomeIcon(trade.is_win)}
                    <span className="ml-1">{getOutcomeText(trade.is_win)}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {trade.pnl !== null ? (
                    <span className={`text-sm font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(1)} pips
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(trade.created_at), 'MMM dd, HH:mm')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
