import React from 'react';
import clsx from 'clsx';

export default function ProgressBar({ current, total, label, className }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={clsx('space-y-1', className)}>
      {label && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 font-medium">{label}</span>
          <span className="text-gray-500">{current} / {total} ({pct}%)</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
