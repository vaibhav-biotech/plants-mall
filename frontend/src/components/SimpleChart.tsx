'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SimpleChartProps {
  type: 'line' | 'bar' | 'pie';
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  title?: string;
  height?: number;
  colors?: string[];
  loading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function SimpleChart({
  type,
  data,
  dataKey,
  xAxisKey = 'name',
  title,
  height = 300,
  colors = COLORS,
  loading = false,
}: SimpleChartProps) {
  if (loading) {
    return (
      <div
        style={{ height }}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center"
      >
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center"
      >
        <div className="text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-4">
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' && (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              dot={{ fill: colors[0] }}
              strokeWidth={2}
            />
          </LineChart>
        )}

        {type === 'bar' && (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={dataKey} fill={colors[0]} />
          </BarChart>
        )}

        {type === 'pie' && (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
