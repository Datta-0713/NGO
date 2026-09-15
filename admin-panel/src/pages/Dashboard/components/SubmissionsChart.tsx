import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface ChartData { _id: string; count: number; }

export const SubmissionsChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
  const formatted = data.map(d => ({
    date: format(parseISO(d._id), 'MMM d'),
    count: d.count,
  }));

  if (formatted.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted">
        No submission data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#2D6A4F" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '13px' }}
          labelStyle={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}
          formatter={(v: number) => [v, 'Submissions']}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#2D6A4F"
          strokeWidth={2.5}
          fill="url(#colorCount)"
          dot={{ fill: '#2D6A4F', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#2D6A4F' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};