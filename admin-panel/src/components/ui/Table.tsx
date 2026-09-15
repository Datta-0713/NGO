import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => (
  <div className={`w-full overflow-x-auto bg-white rounded-xl border border-gray-100 ${className}`}>
    <table className="w-full border-collapse">{children}</table>
  </div>
);