import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Zap, Clock, TrendingUp } from 'lucide-react';
import { getRiskLevel, getRiskBgClass } from '../../lib/calculations';
import { CONTROL_NAMES, SAFEGUARDS } from '../../lib/safeguards';
import { getRecommendation } from '../../lib/recommendations';
import clsx from 'clsx';

function getSafeguardById(id) {
  return SAFEGUARDS.find(s => s.id === id);
}

function RiskBadge({ level }) {
  if (level === 'high') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
      <AlertTriangle className="w-3 h-3" />
      High Risk
    </span>
  );
  if (level === 'unacceptable') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
      <AlertCircle className="w-3 h-3" />
      Needs Attention
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
      Acceptable
    </span>
  );
}

function RecommendationItem({ response, igLevel }) {
  const [expanded, setExpanded] = useState(false);
  const riskLevel = getRiskLevel(response.risk_score, igLevel);
  const safeguard = getSafeguardById(response.safeguard_id);
  const controlName = CONTROL_NAMES[response.control_number];
  const recs = getRecommendation(response.safeguard_id);

  const primaryRec = riskLevel === 'high' ? recs.immediate : recs.shortTerm;
  const primaryLabel = riskLevel === 'high' ? 'Do this now' : 'Do this within 90 days';
  const primaryIcon = riskLevel === 'high' ? Zap : Clock;
  const PrimaryIcon = primaryIcon;

  return (
    <div className={clsx('border rounded-lg overflow-hidden', riskLevel === 'high' ? 'border-red-200' : 'border-yellow-200')}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-500">
              {response.safeguard_id}
            </span>
            <RiskBadge level={riskLevel} />
          </div>
          <div className="text-sm font-medium text-gray-800 mt-0.5">
            {safeguard?.friendlyTitle || safeguard?.title || response.safeguard_id}
          </div>
          {safeguard?.friendlyTitle && (
            <div className="text-xs text-gray-400 italic truncate">{safeguard.title}</div>
          )}
          <div className="text-xs text-gray-500 mt-0.5">
            Control {response.control_number}: {controlName}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className={clsx(
              'text-xl font-bold',
              riskLevel === 'high' ? 'text-red-600' : 'text-yellow-600'
            )}>
              {response.risk_score}
            </div>
            <div className="text-xs text-gray-400">risk score</div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className={clsx('px-4 pb-4 border-t', riskLevel === 'high' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100')}>
          <div className="pt-3 space-y-4">
            {/* Safeguard description */}
            {safeguard?.description && (
              <div className="text-sm text-gray-700 bg-white rounded-lg p-3 border">
                <div className="font-medium text-gray-600 text-xs uppercase tracking-wide mb-1">What this is about</div>
                <p>{safeguard.description}</p>
                {safeguard.whyItMatters && (
                  <p className="text-gray-500 italic mt-1 text-xs">{safeguard.whyItMatters}</p>
                )}
              </div>
            )}

            {/* Score details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <div className="text-gray-500 font-medium">Area</div>
                <div className="text-gray-800 font-semibold mt-0.5">{response.asset_class}</div>
              </div>
              <div>
                <div className="text-gray-500 font-medium">
                  {igLevel === 1 ? 'Implementation' : 'Likelihood'}
                </div>
                <div className="text-gray-800 font-semibold mt-0.5">
                  {igLevel === 1 ? response.maturity_score : response.expectancy_score}
                </div>
              </div>
              <div>
                <div className="text-gray-500 font-medium">Max Impact</div>
                <div className="text-gray-800 font-semibold mt-0.5">
                  {Math.max(
                    response.impact_mission || 0,
                    response.impact_operational || 0,
                    response.impact_obligations || 0,
                    response.impact_financial || 0
                  )}
                </div>
              </div>
              <div>
                <div className="text-gray-500 font-medium">Risk Score</div>
                <div className={clsx('font-bold text-base mt-0.5', riskLevel === 'high' ? 'text-red-600' : 'text-yellow-600')}>
                  {response.risk_score}
                </div>
              </div>
            </div>

            {/* Primary recommendation */}
            <div className={clsx(
              'rounded-lg p-3 border',
              riskLevel === 'high' ? 'bg-red-100 border-red-200' : 'bg-yellow-100 border-yellow-200'
            )}>
              <div className="flex items-center gap-2 mb-1.5">
                <PrimaryIcon className={clsx('w-4 h-4', riskLevel === 'high' ? 'text-red-700' : 'text-yellow-700')} />
                <span className={clsx('text-xs font-bold uppercase tracking-wide', riskLevel === 'high' ? 'text-red-700' : 'text-yellow-700')}>
                  {primaryLabel}
                </span>
              </div>
              <p className="text-sm text-gray-800">{primaryRec}</p>
            </div>

            {/* Long-term recommendation */}
            {recs.longTerm && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wide text-blue-600">Long-term best practice</span>
                </div>
                <p className="text-sm text-gray-700">{recs.longTerm}</p>
              </div>
            )}

            {response.notes && (
              <div className="text-xs text-gray-600 bg-white rounded p-2 border">
                <span className="font-medium">Your notes: </span>{response.notes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecommendationsPanel({ responses, igLevel, showHighOnly = false }) {
  const filtered = responses
    .filter(r => {
      const level = getRiskLevel(r.risk_score, igLevel);
      if (showHighOnly) return level === 'high';
      return level === 'high' || level === 'unacceptable';
    })
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No {showHighOnly ? 'high risk' : 'action-required'} items found.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filtered.map(r => (
        <RecommendationItem
          key={r.safeguard_id}
          response={r}
          igLevel={igLevel}
        />
      ))}
    </div>
  );
}
