import React from 'react';
import { safeFormat } from '@/utils/date';
import { MapPin, Calendar, Eye } from 'lucide-react';
import type { NewsItem } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

interface Props {
  item: NewsItem;
  onView: () => void;
}

export const SubmissionCard: React.FC<Props> = ({ item, onView }) => {
  const author = item.submittedBy as any;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
        {item.media?.[0]?.url && (
          <img src={item.media[0].url} alt={item.title} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1.5">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1">{item.title}</h3>
          <Badge status={item.status} />
        </div>
        <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
          <span className="flex items-center gap-1"><MapPin size={12} />{item.location}</span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {safeFormat(item.createdAt, 'MMM d, yyyy')}
          </span>
          <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{item.category}</span>
        </div>
      </div>

      {/* Contributor */}
      {author && (
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <Avatar src={author.profilePhoto} name={author.name} size={28} />
          <span className="text-sm text-gray-600 max-w-[100px] truncate">{author.name}</span>
        </div>
      )}

      {/* CTA */}
      <Button
        variant="secondary"
        size="sm"
        icon={<Eye size={14} />}
        onClick={onView}
        className="flex-shrink-0"
      >
        Review
      </Button>
    </div>
  );
};
