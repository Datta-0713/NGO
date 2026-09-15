import React from 'react';
import { format } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { NewsItem } from '@/types';

export const RecentSubmissionsTable: React.FC<{ items: NewsItem[] }> = ({ items }) => {
  if (items.length === 0) {
    return <p className="text-sm text-muted text-center py-10">No recent submissions</p>;
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          {['Story', 'Contributor', 'Status', 'Date'].map(h => (
            <th key={h} className="pb-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {items.map(item => (
          <tr key={item._id} className="hover:bg-gray-50 transition-colors">
            <td className="py-3 pr-4">
              <div className="flex items-center gap-3">
                {item.media?.[0]?.url ? (
                  <img
                    src={item.media[0].url}
                    alt=""
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                  <p className="text-xs text-muted truncate">📍 {item.location}</p>
                </div>
              </div>
            </td>
            <td className="py-3 pr-4">
              {item.submittedBy ? (
                <div className="flex items-center gap-2">
                  <Avatar
                    src={(item.submittedBy as any)?.profilePhoto}
                    name={(item.submittedBy as any)?.name ?? 'User'}
                    size={26}
                  />
                  <span className="text-sm text-gray-700 truncate max-w-[100px]">
                    {(item.submittedBy as any)?.name}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted">NGO Team</span>
              )}
            </td>
            <td className="py-3 pr-4"><Badge status={item.status} /></td>
            <td className="py-3 text-xs text-muted whitespace-nowrap">
              {format(new Date(item.createdAt), 'MMM d, yyyy')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};