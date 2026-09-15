import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANT: Record<string, string> = {
  primary:   'bg-primary hover:bg-primary-light text-white shadow-sm',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
  danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  ghost:     'hover:bg-gray-100 text-gray-600',
};

const SIZE: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-sm',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading, icon, children, disabled, className = '', ...rest
}) => (
  <button
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors
      focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
      disabled:opacity-50 disabled:cursor-not-allowed
      ${VARIANT[variant]} ${SIZE[size]} ${className}`}
    {...rest}
  >
    {loading ? <LoadingSpinner size="sm" /> : icon}
    {children}
  </button>
);