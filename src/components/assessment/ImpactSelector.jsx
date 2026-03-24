import React from 'react';
import clsx from 'clsx';

const IG1_MISSION_IMPACTS = [
  { score: 1, label: 'Minor inconvenience', description: "We'd continue operating — minor inconvenience at most", color: 'text-green-700', bg: 'bg-green-50 border-green-300', selectedBg: 'bg-green-100 border-green-500 ring-2 ring-green-400' },
  { score: 2, label: 'Significant recovery needed', description: "We'd need significant time and money to recover, but we would", color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-300', selectedBg: 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-400' },
  { score: 3, label: 'Could destroy us', description: 'This could permanently shut down or seriously destroy our organization', color: 'text-red-700', bg: 'bg-red-50 border-red-300', selectedBg: 'bg-red-100 border-red-500 ring-2 ring-red-400' },
];

const IG1_OPERATIONAL_IMPACTS = [
  { score: 1, label: 'No disruption', description: 'Day-to-day operations would continue normally', color: 'text-green-700', bg: 'bg-green-50 border-green-300', selectedBg: 'bg-green-100 border-green-500 ring-2 ring-green-400' },
  { score: 2, label: 'Significant disruption', description: "We'd struggle operationally and need to reorganize to recover", color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-300', selectedBg: 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-400' },
  { score: 3, label: 'Cannot deliver services', description: "We wouldn't be able to deliver our services or products", color: 'text-red-700', bg: 'bg-red-50 border-red-300', selectedBg: 'bg-red-100 border-red-500 ring-2 ring-red-400' },
];

const IG1_OBLIGATIONS_IMPACTS = [
  { score: 1, label: 'No external harm', description: 'No one outside our organization would be harmed', color: 'text-green-700', bg: 'bg-green-50 border-green-300', selectedBg: 'bg-green-100 border-green-500 ring-2 ring-green-400' },
  { score: 2, label: 'Fixable harm', description: 'Some people could be harmed, but it would be fixable', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-300', selectedBg: 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-400' },
  { score: 3, label: 'Serious irreversible harm', description: "People could be seriously or permanently harmed, and we couldn't undo it", color: 'text-red-700', bg: 'bg-red-50 border-red-300', selectedBg: 'bg-red-100 border-red-500 ring-2 ring-red-400' },
];

const IG23_MISSION_IMPACTS = [
  { score: 1, label: 'No real impact', description: 'No real impact — business as usual', color: 'text-green-700', bg: 'bg-green-50 border-green-300', selectedBg: 'bg-green-100 border-green-500 ring-2 ring-green-400' },
  { score: 2, label: 'Minor setback', description: "Minor setback — we'd recover quickly within normal operations", color: 'text-blue-700', bg: 'bg-blue-50 border-blue-300', selectedBg: 'bg-blue-100 border-blue-500 ring-2 ring-blue-400' },
  { score: 3, label: 'Significant setback', description: "Significant setback — we'd need unplanned effort and expense to recover", color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-300', selectedBg: 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-400' },
  { score: 4, label: 'Major blow', description: "Major blow — would take years and major investment to recover", color: 'text-orange-700', bg: 'bg-orange-50 border-orange-300', selectedBg: 'bg-orange-100 border-orange-500 ring-2 ring-orange-400' },
  { score: 5, label: 'Catastrophic', description: 'Catastrophic — our organization could not survive this', color: 'text-red-700', bg: 'bg-red-50 border-red-300', selectedBg: 'bg-red-100 border-red-500 ring-2 ring-red-400' },
];

const IG23_OPERATIONAL_IMPACTS = [
  { score: 1, label: 'No impact', description: 'No impact on our goals or plans', color: 'text-green-700', bg: 'bg-green-50 border-green-300', selectedBg: 'bg-green-100 border-green-500 ring-2 ring-green-400' },
  { score: 2, label: 'Minor variance', description: 'Minor variance — still on track overall', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-300', selectedBg: 'bg-blue-100 border-blue-500 ring-2 ring-blue-400' },
  { score: 3, label: 'Significant deviation', description: 'Significant deviation — recovery possible within this fiscal year', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-300', selectedBg: 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-400' },
  { score: 4, label: 'Major deviation', description: 'Major deviation — recovery would take multiple years', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-300', selectedBg: 'bg-orange-100 border-orange-500 ring-2 ring-orange-400' },
  { score: 5, label: 'Total failure', description: 'Total failure of our operational plans', color: 'text-red-700', bg: 'bg-red-50 border-red-300', selectedBg: 'bg-red-100 border-red-500 ring-2 ring-red-400' },
];

const IG23_FINANCIAL_IMPACTS = [
  { score: 1, label: 'No financial impact', description: 'No financial impact', color: 'text-green-700', bg: 'bg-green-50 border-green-300', selectedBg: 'bg-green-100 border-green-500 ring-2 ring-green-400' },
  { score: 2, label: 'Minor expense', description: 'Minor unplanned expense — within our normal budget variance', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-300', selectedBg: 'bg-blue-100 border-blue-500 ring-2 ring-blue-400' },
  { score: 3, label: 'Significant expense', description: 'Significant expense — requires unplanned budget reallocation', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-300', selectedBg: 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-400' },
  { score: 4, label: 'Severe impact', description: 'Severe financial impact — may require external funding or long-term recovery plan', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-300', selectedBg: 'bg-orange-100 border-orange-500 ring-2 ring-orange-400' },
  { score: 5, label: 'Financial catastrophe', description: 'Financial catastrophe — could threaten organizational viability', color: 'text-red-700', bg: 'bg-red-50 border-red-300', selectedBg: 'bg-red-100 border-red-500 ring-2 ring-red-400' },
];

const IG23_OBLIGATIONS_IMPACTS = [
  { score: 1, label: 'No harm to others', description: 'No harm to anyone outside our organization', color: 'text-green-700', bg: 'bg-green-50 border-green-300', selectedBg: 'bg-green-100 border-green-500 ring-2 ring-green-400' },
  { score: 2, label: 'Minor inconvenience', description: 'Minor inconvenience to others — nothing that requires correction', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-300', selectedBg: 'bg-blue-100 border-blue-500 ring-2 ring-blue-400' },
  { score: 3, label: 'Correctable harm', description: 'One or a few people could be meaningfully harmed — but it could be corrected', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-300', selectedBg: 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-400' },
  { score: 4, label: 'Many harmed', description: 'Many people harmed, or some people permanently affected', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-300', selectedBg: 'bg-orange-100 border-orange-500 ring-2 ring-orange-400' },
  { score: 5, label: 'Irreparable harm', description: 'Many people would be permanently and irreparably harmed', color: 'text-red-700', bg: 'bg-red-50 border-red-300', selectedBg: 'bg-red-100 border-red-500 ring-2 ring-red-400' },
];

function ImpactRow({ label, value, onChange, options, required }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {required && <span className="text-red-500 text-xs">*</span>}
        {value && (
          <span className="text-xs text-gray-500 ml-auto">
            {options.find(o => o.score === value)?.label}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {options.map(opt => (
          <button
            key={opt.score}
            type="button"
            onClick={() => onChange(opt.score)}
            title={`${opt.label}: ${opt.description}`}
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
      {value && (
        <p className="text-xs text-gray-500 mt-1 italic">{options.find(o => o.score === value)?.description}</p>
      )}
    </div>
  );
}

export default function ImpactSelector({ igLevel, values, onChange }) {
  const handleChange = (field, score) => {
    onChange({ ...values, [field]: score });
  };

  const missionOptions = igLevel === 1 ? IG1_MISSION_IMPACTS : IG23_MISSION_IMPACTS;
  const operationalOptions = igLevel === 1 ? IG1_OPERATIONAL_IMPACTS : IG23_OPERATIONAL_IMPACTS;
  const obligationsOptions = igLevel === 1 ? IG1_OBLIGATIONS_IMPACTS : IG23_OBLIGATIONS_IMPACTS;

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-gray-700 mb-1">If this area were compromised, how badly would it affect us?</div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-5 border">
        <ImpactRow
          label="Effect on our organization's ability to operate"
          value={values.impact_mission}
          onChange={(v) => handleChange('impact_mission', v)}
          options={missionOptions}
          required
        />
        <ImpactRow
          label="Effect on our day-to-day operations and goals"
          value={values.impact_operational}
          onChange={(v) => handleChange('impact_operational', v)}
          options={operationalOptions}
          required
        />
        <ImpactRow
          label="Effect on people outside our organization (customers, public, partners)"
          value={values.impact_obligations}
          onChange={(v) => handleChange('impact_obligations', v)}
          options={obligationsOptions}
          required
        />
        {igLevel >= 2 && (
          <ImpactRow
            label="Financial impact to our organization"
            value={values.impact_financial}
            onChange={(v) => handleChange('impact_financial', v)}
            options={IG23_FINANCIAL_IMPACTS}
          />
        )}
      </div>
    </div>
  );
}
