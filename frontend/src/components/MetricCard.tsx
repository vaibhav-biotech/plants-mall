'use client';

import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  loading?: boolean;
}

export default function MetricCard({
  label,
  value,
  icon,
  trend,
  color = 'blue',
  loading = false,
}: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
    red: 'text-red-600 bg-red-50 border-red-200',
  };

  const trendColor = trend && trend > 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          {loading ? (
            <div className="h-8 w-32 animate-pulse rounded bg-gray-300 mt-2"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          )}
          {trend !== undefined && !loading && (
            <p className={`text-sm font-medium mt-2 flex items-center gap-1 ${trendColor}`}>
              {trend > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        {icon && <div className="text-3xl">{icon}</div>}
      </div>
    </div>
  );
}
