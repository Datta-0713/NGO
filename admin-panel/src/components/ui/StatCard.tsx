import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trendUp?: boolean;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title, value, change, trendUp, icon: Icon,
  iconBg = 'bg-green-50', iconColor = 'text-primary',
}) => (
  <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-muted">{title}</span>
      <div className={`${iconBg} ${iconColor} p-2.5 rounded-xl`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="text-3xl font-bold text-gray-900">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    {change !== undefined && (
      <div className={`flex items-center gap-1.5 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
        <span>{trendUp ? '↑' : '↓'} {Math.abs(change)}%</span>
        <span className="text-muted font-normal">from last month</span>
      </div>
    )}
  </div>
);