import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { WinRateData } from '../types';
import { format } from 'date-fns';

interface WinRateChartProps {
  data: WinRateData[];
}

export const WinRateChart: React.FC<WinRateChartProps> = ({ data }) => {
  const formattedData = data.map((item) => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Win Rate Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#666"
            style={{ fontSize: '12px' }}
            label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="win_rate"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Win Rate (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
