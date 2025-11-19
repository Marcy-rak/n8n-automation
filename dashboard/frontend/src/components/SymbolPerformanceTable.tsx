import React from 'react';
import { SymbolPerformance } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SymbolPerformanceTableProps {
  data: SymbolPerformance[];
}

export const SymbolPerformanceTable: React.FC<SymbolPerformanceTableProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Performance by Symbol</h2>

      {/* Bar Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="symbol" stroke="#666" style={{ fontSize: '12px' }} />
            <YAxis stroke="#666" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="win_rate" name="Win Rate (%)" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.win_rate >= 60 ? '#10b981' : entry.win_rate >= 50 ? '#3b82f6' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trades</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wins</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Losses</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Win Rate</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total P&L</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((symbol) => (
              <tr key={symbol.symbol} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{symbol.symbol}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {symbol.total_trades}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                  {symbol.wins}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-medium">
                  {symbol.losses}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    symbol.win_rate >= 60 ? 'bg-green-100 text-green-800' :
                    symbol.win_rate >= 50 ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {symbol.win_rate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-sm font-medium ${
                    symbol.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {symbol.total_pnl >= 0 ? '+' : ''}{symbol.total_pnl.toFixed(1)} pips
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
