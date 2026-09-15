import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4 border-2' : size === 'lg' ? 'w-12 h-12 border-4' : 'w-8 h-8 border-[3px]';
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClass} border-green-100 border-t-primary rounded-full animate-spin`} />
    </div>
  );
};
