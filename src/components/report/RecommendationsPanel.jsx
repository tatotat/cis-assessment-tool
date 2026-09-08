import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Zap, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getRiskLevel } from '../../lib/calculations';
import { CONTROL_NAMES, SAFEGUARDS } from '../../lib/safeguards';
import { getRecommendation } from '../../lib/recommendations';
import clsx from 'clsx';

function getSafeguardById(id) {
  return SAFEGUARDS.find(s => s.id === id);
}

function RiskBadge({ level }) {
  const { t } = useTranslation();
  if (level === 'high') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
      <AlertTriangle className="w-3 h-3" />
      {t('report.riskLevel.high')}
    </span>
  );
  if (level === 'unacceptable') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
      <AlertCircle className="w-3 h-3" />
      {t('report.recs.needsAttention')}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
      {t('report.riskLevel.acceptable')}
    </span>
  );
}

function RecommendationItem({ response, igLevel }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const riskLevel = getRiskLevel(response.risk_score, igLevel);
  const safeguard = getSafeguardById(response.safeguard_id);
  const controlName = CONTROL_NAMES[response.control_number];
  const recs = getRecommendation(response.safeguard_id);
  const isHigh = riskLevel === 'high';

  const primaryRec = isHigh ? recs.immediate : recs.shortTerm;
  const primaryLabel = isHigh ? t('report.recs.doNow') : t('report.recs.doWithin90');
  const PrimaryIcon = isHigh ? Zap : Clock;

  return (
    <div className={clsx('border rounded-lg overflow-hidden', isHigh ? 'border-red-200' : 'border-yellow-200')}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-500">{response.safeguard_id}</span>
            <RiskBadge level={riskLevel} />
          </div>
          <div className="text-sm font-medium text-gray-800 mt-0.5">
            {safeguard?.friendlyTitle || safeguard?.title || response.safeguard_id}
          </div>
          {safeguard?.friendlyTitle && (
            <div className="text-xs text-gray-400 italic truncate">{safeguard.title}</div>
          )}
          <div className="text-xs text-gray-500 mt-0.5">
            {t('report.controls.control', { n: response.control_number })}: {controlName}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className={clsx('text-xl font-bold', isHigh ? 'text-red-600' : 'text-yellow-600')}>
              {response.risk_score}
            </div>
            <div className="text-xs text-gray-400">{t('report.status.riskScoreLabel')}</div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className={clsx('px-4 pb-4 border-t', isHigh ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100')}>
          <div className="pt-3 space-y-4">
            {safeguard?.description && (
              <div className="text-sm text-gray-700 bg-white rounded-lg p-3 border">
                <div className="font-medium text-gray-600 text-xs uppercase tracking-wide mb-1">{t('report.recs.about')}</div>
                <p>{safeguard.description}</p>
                {safeguard.whyItMatters && (
                  <p className="text-gray-500 italic mt-1 text-xs">{safeguard.whyItMatters}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <div className="text-gray-500 font-medium">{t('report.recs.area')}</div>
                <div className="text-gray-800 font-semibold mt-0.5">{response.asset_class}</div>
              </div>
              <div>
                <div className="text-gray-500 font-medium">
                  {igLevel === 1 ? t('report.recs.implementation') : t('report.recs.likelihood')}
                </div>
                <div className="text-gray-800 font-semibold mt-0.5">
                  {igLevel === 1 ? response.maturity_score : response.expectancy_score}
                </div>
              </div>
              <div>
                <div className="text-gray-500 font-medium">{t('report.recs.maxImpact')}</div>
                <div className="text-gray-800 font-semibold mt-0.5">
                  {Math.max(response.impact_mission || 0, response.impact_operational || 0,
                    response.impact_obligations || 0, response.impact_financial || 0)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 font-medium">{t('report.recs.riskScore')}</div>
                <div className={clsx('font-bold text-base mt-0.5', isHigh ? 'text-red-600' : 'text-yellow-600')}>
                  {response.risk_score}
                </div>
              </div>
            </div>

            <div className={clsx('rounded-lg p-3 border', isHigh ? 'bg-red-100 border-red-200' : 'bg-yellow-100 border-yellow-200')}>
              <div className="flex items-center gap-2 mb-1.5">
                <PrimaryIcon className={clsx('w-4 h-4', isHigh ? 'text-red-700' : 'text-yellow-700')} />
                <span className={clsx('text-xs font-bold uppercase tracking-wide', isHigh ? 'text-red-700' : 'text-yellow-700')}>
                  {primaryLabel}
                </span>
              </div>
              <p className="text-sm text-gray-800">{primaryRec}</p>
            </div>

            {recs.longTerm && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wide text-blue-600">{t('report.recs.longTerm')}</span>
                </div>
                <p className="text-sm text-gray-700">{recs.longTerm}</p>
              </div>
            )}

            {response.notes && (
              <div className="text-xs text-gray-600 bg-white rounded p-2 border">
                <span className="font-medium">{t('report.recs.yourNotes')} </span>{response.notes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecommendationsPanel({ responses, igLevel, showHighOnly = false }) {
  const { t } = useTranslation();
  const filtered = responses
    .filter(r => {
      const level = getRiskLevel(r.risk_score, igLevel);
      if (showHighOnly) return level === 'high';
      return level === 'high' || level === 'unacceptable';
    })
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));

  if (filtered.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
        {showHighOnly ? t('report.recs.noneHigh') : t('report.recs.none')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map(r => (
        <RecommendationItem key={r.safeguard_id} response={r} igLevel={igLevel} />
      ))}
    </div>
  );
}
