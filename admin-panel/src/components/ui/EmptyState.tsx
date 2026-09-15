import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
    {icon && <div className="mb-4 text-gray-300">{icon}</div>}
    <h3 className="text-base font-semibold text-gray-600 mb-1">{title}</h3>
    {description && <p className="text-sm text-muted max-w-xs mb-5">{description}</p>}
    {action && <div>{action}</div>}
  </div>
);
