import React from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
}

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map(n => n[0] || '').join('').toUpperCase();

const colorPalette = ['#2D6A4F', '#40916C', '#6C3FC6', '#0891B2', '#D97706'];
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colorPalette[Math.abs(hash) % colorPalette.length];
};

export const Avatar: React.FC<AvatarProps> = ({ src, name = 'User', size = 36, className = '' }) => {
  const style = { width: size, height: size };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={{ ...style, backgroundColor: stringToColor(name), fontSize: Math.max(10, size * 0.38) }}
      className={`rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 select-none ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};