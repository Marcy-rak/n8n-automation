import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PnlData } from '../types';
import { format } from 'date-fns';

interface PnlChartProps {
  data: PnlData[];
}

export const PnlChart: React.FC<PnlChartProps> = ({ data }) => {
  const formattedData = data.map((item) => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Cumulative P&L</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#666"
            style={{ fontSize: '12px' }}
            label={{ value: 'P&L (pips)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulative_pnl"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#pnlGradient)"
            name="Cumulative P&L"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
