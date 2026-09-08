import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

// Visual config by score position. Labels/descriptions come from
// assessment.impacts.{ig1|ig23}.{mission|operational|obligations|financial}.{score}.*
const STYLE_3 = {
  1: { color: 'text-green-700', bg: 'bg-green-50 border-green-300', selectedBg: 'bg-green-100 border-green-500 ring-2 ring-green-400' },
  2: { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-300', selectedBg: 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-400' },
  3: { color: 'text-red-700', bg: 'bg-red-50 border-red-300', selectedBg: 'bg-red-100 border-red-500 ring-2 ring-red-400' },
};
const STYLE_5 = {
  1: { color: 'text-green-700', bg: 'bg-green-50 border-green-300', selectedBg: 'bg-green-100 border-green-500 ring-2 ring-green-400' },
  2: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-300', selectedBg: 'bg-blue-100 border-blue-500 ring-2 ring-blue-400' },
  3: { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-300', selectedBg: 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-400' },
  4: { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-300', selectedBg: 'bg-orange-100 border-orange-500 ring-2 ring-orange-400' },
  5: { color: 'text-red-700', bg: 'bg-red-50 border-red-300', selectedBg: 'bg-red-100 border-red-500 ring-2 ring-red-400' },
};

function ImpactRow({ label, value, onChange, options, required }) {
  const selected = options.find(o => o.score === value);
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {required && <span className="text-red-500 text-xs">*</span>}
        {selected && <span className="text-xs text-gray-500 ml-auto">{selected.label}</span>}
      </div>
      <div className="flex gap-2">
        {options.map(opt => (
          <button
            key={opt.score}
            type="button"
            onClick={() => onChange(opt.score)}
            title={`${opt.label}: ${opt.description}`}
            aria-pressed={value === opt.score}
            className={clsx(
              'flex-1 py-2 px-1 rounded-lg border-2 text-center transition-all duration-150',
              value === opt.score ? opt.selectedBg : `${opt.bg} hover:opacity-80`
            )}
          >
            <div className={clsx('text-lg font-bold', opt.color)}>{opt.score}</div>
            <div className="text-xs font-medium text-gray-600 hidden sm:block leading-tight mt-0.5">{opt.label}</div>
          </button>
        ))}
      </div>
      {selected && <p className="text-xs text-gray-500 mt-1 italic">{selected.description}</p>}
    </div>
  );
}

export default function ImpactSelector({ igLevel, values, onChange }) {
  const { t } = useTranslation();
  const scale = igLevel === 1 ? 'ig1' : 'ig23';
  const scores = igLevel === 1 ? [1, 2, 3] : [1, 2, 3, 4, 5];
  const styles = igLevel === 1 ? STYLE_3 : STYLE_5;

  const options = dim => scores.map(score => ({
    score,
    label: t(`assessment.impacts.${scale}.${dim}.${score}.label`),
    description: t(`assessment.impacts.${scale}.${dim}.${score}.description`),
    ...styles[score],
  }));

  // Pass only the changed field — spreading the (possibly stale) values prop
  // here can wipe selections made between renders; the parent merges into
  // its previous state
  const handleChange = (field, score) => onChange({ [field]: score });

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-gray-700 mb-1">{t('assessment.impacts.question')}</div>
      <div className="bg-gray-50 rounded-lg p-4 space-y-5 border">
        <ImpactRow label={t('assessment.impacts.dims.mission')} value={values.impact_mission}
          onChange={v => handleChange('impact_mission', v)} options={options('mission')} required />
        <ImpactRow label={t('assessment.impacts.dims.operational')} value={values.impact_operational}
          onChange={v => handleChange('impact_operational', v)} options={options('operational')} required />
        <ImpactRow label={t('assessment.impacts.dims.obligations')} value={values.impact_obligations}
          onChange={v => handleChange('impact_obligations', v)} options={options('obligations')} required />
        {igLevel >= 2 && (
          <ImpactRow label={t('assessment.impacts.dims.financial')} value={values.impact_financial}
            onChange={v => handleChange('impact_financial', v)} options={options('financial')} />
        )}
      </div>
    </div>
  );
}
