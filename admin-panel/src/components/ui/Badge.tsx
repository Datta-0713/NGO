import React from 'react';

type BadgeVariant = 'published' | 'pending' | 'rejected' | 'admin' | 'user' | 'default';

const STYLES: Record<BadgeVariant, string> = {
  published: 'bg-green-100 text-green-700 border border-green-200',
  pending:   'bg-yellow-100 text-yellow-700 border border-yellow-200',
  rejected:  'bg-red-100 text-red-600 border border-red-200',
  admin:     'bg-purple-100 text-purple-700 border border-purple-200',
  user:      'bg-gray-100 text-gray-600 border border-gray-200',
  default:   'bg-gray-100 text-gray-500 border border-gray-200',
};

const LABELS: Record<BadgeVariant, string> = {
  published: 'Published',
  pending:   'Pending',
  rejected:  'Rejected',
  admin:     'Admin',
  user:      'User',
  default:   'Unknown',
};

interface BadgeProps {
  status: string;
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label }) => {
  const variant: BadgeVariant = status in STYLES ? (status as BadgeVariant) : 'default';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STYLES[variant]}`}>
      {label ?? LABELS[variant]}
    </span>
  );
};