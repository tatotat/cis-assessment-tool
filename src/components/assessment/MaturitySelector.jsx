import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

// Visual config only — labels/descriptions come from assessment.maturity.* keys
const MATURITY_STYLES = {
  1: { color: 'border-red-300 bg-red-50 hover:border-red-400', selectedColor: 'border-red-500 bg-red-100 ring-2 ring-red-400', dot: 'bg-red-500' },
  2: { color: 'border-orange-300 bg-orange-50 hover:border-orange-400', selectedColor: 'border-orange-500 bg-orange-100 ring-2 ring-orange-400', dot: 'bg-orange-500' },
  3: { color: 'border-yellow-300 bg-yellow-50 hover:border-yellow-400', selectedColor: 'border-yellow-500 bg-yellow-100 ring-2 ring-yellow-400', dot: 'bg-yellow-500' },
  4: { color: 'border-blue-300 bg-blue-50 hover:border-blue-400', selectedColor: 'border-blue-500 bg-blue-100 ring-2 ring-blue-400', dot: 'bg-blue-500' },
  5: { color: 'border-green-300 bg-green-50 hover:border-green-400', selectedColor: 'border-green-500 bg-green-100 ring-2 ring-green-400', dot: 'bg-green-500' },
};

export default function MaturitySelector({ value, onChange, label }) {
  const { t } = useTranslation();
  const levels = [1, 2, 3, 4, 5].map(score => ({
    score,
    label: t(`assessment.maturity.${score}.label`),
    description: t(`assessment.maturity.${score}.description`),
    ...MATURITY_STYLES[score],
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-gray-700">{label || t('assessment.maturityQuestion')}</label>
        {value && (
          <span className="text-sm font-medium text-primary-600">
            {t('assessment.maturity.scorePrefix', { score: value })} — {levels.find(m => m.score === value)?.label}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {levels.map(m => (
          <button
            key={m.score}
            type="button"
            onClick={() => onChange(m.score)}
            aria-pressed={value === m.score}
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
