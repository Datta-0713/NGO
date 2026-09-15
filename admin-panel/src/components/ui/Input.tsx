import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...rest }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          {icon}
        </span>
      )}
      <input
        className={`w-full border rounded-lg py-2 text-sm transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          ${error ? 'border-red-400 bg-red-50 placeholder-red-300' : 'border-gray-300 bg-white placeholder-gray-400'}
          ${icon ? 'pl-9 pr-3' : 'px-3'}
          ${className}`}
        {...rest}
      />
    </div>
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);