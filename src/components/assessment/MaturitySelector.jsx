import React from 'react';
import clsx from 'clsx';

const MATURITY_LEVELS = [
  {
    score: 1,
    label: 'Not in place',
    description: "We don't have this practice at all, or it's very inconsistent",
    color: 'border-red-300 bg-red-50 hover:border-red-400',
    selectedColor: 'border-red-500 bg-red-100 ring-2 ring-red-400',
    dot: 'bg-red-500',
  },
  {
    score: 2,
    label: 'Partially done',
    description: 'We do this for some systems or in some areas, but not everywhere',
    color: 'border-orange-300 bg-orange-50 hover:border-orange-400',
    selectedColor: 'border-orange-500 bg-orange-100 ring-2 ring-orange-400',
    dot: 'bg-orange-500',
  },
  {
    score: 3,
    label: 'Fully in place',
    description: 'We consistently do this across all our systems and people',
    color: 'border-yellow-300 bg-yellow-50 hover:border-yellow-400',
    selectedColor: 'border-yellow-500 bg-yellow-100 ring-2 ring-yellow-400',
    dot: 'bg-yellow-500',
  },
  {
    score: 4,
    label: 'Tested & verified',
    description: 'We regularly check that this is working correctly and fix issues when found',
    color: 'border-blue-300 bg-blue-50 hover:border-blue-400',
    selectedColor: 'border-blue-500 bg-blue-100 ring-2 ring-blue-400',
    dot: 'bg-blue-500',
  },
  {
    score: 5,
    label: 'Automated & assured',
    description: 'We have systems that automatically enforce and verify this continuously',
    color: 'border-green-300 bg-green-50 hover:border-green-400',
    selectedColor: 'border-green-500 bg-green-100 ring-2 ring-green-400',
    dot: 'bg-green-500',
  },
];

export default function MaturitySelector({ value, onChange, label = 'How well do we currently have this in place?' }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {value && (
          <span className="text-sm font-medium text-primary-600">
            Score: {value} — {MATURITY_LEVELS.find(m => m.score === value)?.label}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {MATURITY_LEVELS.map(m => (
          <button
            key={m.score}
            type="button"
            onClick={() => onChange(m.score)}
            className={clsx(
              'relative flex flex-col items-start p-3 rounded-lg border-2 transition-all duration-150 text-left',
              value === m.score ? m.selectedColor : m.color
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0', m.dot)} />
              <span className="font-bold text-gray-800 text-sm">{m.score}</span>
            </div>
            <div className="text-xs font-semibold text-gray-700">{m.label}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-tight">{m.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
