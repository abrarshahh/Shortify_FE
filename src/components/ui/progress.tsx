import * as React from 'react';

interface ProgressProps {
  value?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercent?: boolean;
}

export function Progress({ value = 0, className = '', size = 'md', showPercent = false }: ProgressProps) {
  const percent = Math.min(Math.max(value, 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        {showPercent && (
          <span className="text-xs font-semibold text-purple-400 font-mono ml-auto">
            {percent}%
          </span>
        )}
      </div>
      <div className={`w-full bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-700/30 ${sizeClasses[size]}`}>
        <div
          className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 h-full rounded-full transition-all duration-350 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
