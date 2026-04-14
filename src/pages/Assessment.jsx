import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CheckCircle, AlertTriangle,
  Save, BarChart2, List, Info, Flag, ChevronDown, ChevronUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAssessmentStore from '../stores/assessmentStore';
import {
  calculateRiskScore, getRiskLevel, getRiskBgClass,
  calculateIG1Expectancy, isResponseComplete, calculateORI
} from '../lib/calculations';
import { CONTROL_NAMES, VCDB_INDEX } from '../lib/safeguards';
import MaturitySelector from '../components/assessment/MaturitySelector';
import ImpactSelector from '../components/assessment/ImpactSelector';
import ProgressBar from '../components/assessment/ProgressBar';
import clsx from 'clsx';

const NIST_COLORS = {
  Identify: 'nist-identify',
  Protect: 'nist-protect',
  Detect: 'nist-detect',
  Respond: 'nist-respond',
  Recover: 'nist-recover',
  Govern: 'nist-govern',
};

// These are now generated inside the component using t() — see getExpectancyOptions() / getRiskMeaning()

function getRiskScoreContext(score, igLevel) {
  const max = igLevel === 1 ? 9 : 25;
  const pct = Math.round((score / max) * 100);
  if (igLevel === 1) {
    if (score <= 2) return `Score ${score}/9 — Very low combined risk.`;
    if (score <= 4) return `Score ${score}/9 — Low risk, but worth monitoring.`;
    if (score === 6) return `Score ${score}/9 — This gap could cause real operational disruption if exploited.`;
    return `Score ${score}/9 — Maximum risk level. This gap could lead to severe or irreversible harm.`;
  }
  if (score <= 4) return `Score ${score}/25 — Very low combined risk.`;
  if (score <= 8) return `Score ${score}/25 — Manageable risk level.`;
  if (score <= 15) return `Score ${score}/25 — Meaningful risk. An incident here could disrupt operations or cause financial harm.`;
  if (score <= 20) return `Score ${score}/25 — Serious risk. An incident could cause major organizational disruption.`;
  return `Score ${score}/25 — Catastrophic risk level. An incident here could threaten the organization's viability.`;
}

function RiskScoreDisplay({ score, igLevel }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  if (score === null || score === undefined) return null;
  const level = getRiskLevel(score, igLevel);
  const meaning = {
    acceptable: { headline: t('assessment.riskScore.acceptable.headline'), icon: CheckCircle, what: t('assessment.riskScore.acceptable.what'), impact: t('assessment.riskScore.acceptable.impact'), orgEffect: t('assessment.riskScore.acceptable.orgEffect') },
    unacceptable: { headline: t('assessment.riskScore.unacceptable.headline'), icon: AlertTriangle, what: t('assessment.riskScore.unacceptable.what'), impact: t('assessment.riskScore.unacceptable.impact'), orgEffect: t('assessment.riskScore.unacceptable.orgEffect') },
    high: { headline: t('assessment.riskScore.high.headline'), icon: AlertTriangle, what: t('assessment.riskScore.high.what'), impact: t('assessment.riskScore.high.impact'), orgEffect: t('assessment.riskScore.high.orgEffect') },
  }[level];
  const Icon = meaning.icon;
  const context = getRiskScoreContext(score, igLevel);

  return (
    <div className={clsx(
      'rounded-xl border-2 overflow-hidden',
      level === 'acceptable' ? 'border-green-300' :
      level === 'unacceptable' ? 'border-yellow-400' :
      'border-red-400'
    )}>
      {/* Score bar */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className={clsx(
          'w-full flex items-center gap-3 px-4 py-3 text-left',
          level === 'acceptable' ? 'bg-green-50 hover:bg-green-100' :
          level === 'unacceptable' ? 'bg-yellow-50 hover:bg-yellow-100' :
          'bg-red-50 hover:bg-red-100'
        )}
      >
        <Icon className={clsx('w-5 h-5 flex-shrink-0',
          level === 'acceptable' ? 'text-green-600' :
          level === 'unacceptable' ? 'text-yellow-600' : 'text-red-600'
        )} />
        <div className="flex-1">
          <div className={clsx('font-bold text-sm',
            level === 'acceptable' ? 'text-green-800' :
            level === 'unacceptable' ? 'text-yellow-800' : 'text-red-800'
          )}>
            {meaning.headline}
          </div>
          <div className={clsx('text-xs mt-0.5',
            level === 'acceptable' ? 'text-green-700' :
            level === 'unacceptable' ? 'text-yellow-700' : 'text-red-700'
          )}>
            {context}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={clsx('text-2xl font-black',
            level === 'acceptable' ? 'text-green-700' :
            level === 'unacceptable' ? 'text-yellow-700' : 'text-red-700'
          )}>
            {score}
          </div>
          <div className="text-xs text-gray-400">/{igLevel === 1 ? 9 : 25}</div>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Expanded explanation */}
      {expanded && (
        <div className={clsx(
          'px-4 py-3 border-t text-sm space-y-2',
          level === 'acceptable' ? 'bg-green-50 border-green-200' :
          level === 'unacceptable' ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        )}>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <div className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">{t('assessment.riskScore.whatItMeans')}</div>
              <p className="text-gray-600 text-xs leading-relaxed">{meaning.what}</p>
            </div>
            <div>
              <div className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">{t('assessment.riskScore.requiredAction')}</div>
              <p className="text-gray-600 text-xs leading-relaxed">{meaning.impact}</p>
            </div>
            <div>
              <div className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">{t('assessment.riskScore.effectOnOrg')}</div>
              <p className="text-gray-600 text-xs leading-relaxed">{meaning.orgEffect}</p>
            </div>
          </div>
          <div className="text-xs text-gray-400 pt-1 border-t border-gray-200">
            {t('assessment.riskScore.formula', { max: igLevel === 1 ? 9 : 25 })}
          </div>
        </div>
      )}
    </div>
  );
}

function SafeguardInfoBox({ safeguard }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  if (!safeguard?.description) return null;
  return (
    <div className="border border-blue-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-50 text-left text-sm font-medium text-blue-800 hover:bg-blue-100 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
          {t('assessment.whatDoesThisMean')}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-blue-500" />}
      </button>
      {open && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-200 space-y-2 text-sm text-blue-900">
          <p>{safeguard.description}</p>
          {safeguard.whyItMatters && (
            <p className="text-blue-700 italic">
              <strong>{t('assessment.whyItMatters')} </strong>{safeguard.whyItMatters}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Assessment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    sessionId, safeguards, currentIndex, responses, implementationGroup,
    saveResponse, setCurrentIndex, completeAssessment, saveStatus,
    organization, assessorName, status
  } = useAssessmentStore();

  // Build expectancy options from translations
  const EXPECTANCY_OPTIONS = [1, 2, 3, 4, 5].map(score => ({
    score,
    label: t(`assessment.expectancy.${score}.label`),
    detail: t(`assessment.expectancy.${score}.detail`),
  }));

  const [localResponse, setLocalResponse] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [completing, setCompleting] = useState(false);

  const ig = implementationGroup || 1;
  const currentSafeguard = safeguards[currentIndex];
  const totalSafeguards = safeguards.length;

  // Redirect if no session
  useEffect(() => {
    if (!sessionId) navigate('/');
    else if (status === 'screening') navigate('/screening');
    else if (status === 'completed') navigate('/report');
  }, [sessionId, status]);

  // Load existing response when index changes
  useEffect(() => {
    if (!currentSafeguard) return;
    const existing = responses[currentSafeguard.id];
    if (existing) {
      setLocalResponse(existing);
      setNotes(existing.notes || '');
    } else {
      setLocalResponse({});
      setNotes('');
    }
  }, [currentIndex, currentSafeguard?.id]);

  const impactValues = {
    impact_mission: localResponse.impact_mission || null,
    impact_operational: localResponse.impact_operational || null,
    impact_obligations: localResponse.impact_obligations || null,
    impact_financial: localResponse.impact_financial || null,
  };

  // Live risk score calculation
  const liveRiskScore = (() => {
    if (ig === 1) {
      if (!localResponse.maturity_score || !localResponse.impact_mission ||
          !localResponse.impact_operational || !localResponse.impact_obligations) return null;
      return calculateRiskScore({ ...localResponse, asset_class: currentSafeguard?.assetClass }, ig);
    } else {
      if (!localResponse.expectancy_score || !localResponse.impact_mission ||
          !localResponse.impact_operational || !localResponse.impact_obligations) return null;
      return calculateRiskScore(localResponse, ig);
    }
  })();

  const liveExpectancy = (ig === 1 && localResponse.maturity_score && currentSafeguard)
    ? calculateIG1Expectancy(currentSafeguard.assetClass, localResponse.maturity_score)
    : null;

  function handleImpactChange(vals) {
    setLocalResponse(prev => ({ ...prev, ...vals }));
  }

  async function handleSave(andNext = false) {
    if (!currentSafeguard) return;
    const payload = {
      ...localResponse,
      notes,
    };
    await saveResponse(currentSafeguard.id, payload);
    if (andNext) {
      if (currentIndex < totalSafeguards - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  }

  async function handleComplete() {
    // Save current response first
    if (currentSafeguard && Object.keys(localResponse).length > 0) {
      await saveResponse(currentSafeguard.id, { ...localResponse, notes });
    }
    setCompleting(true);
    await completeAssessment();
    navigate('/report');
  }

  const completedCount = Object.values(responses).filter(r =>
    r.risk_score !== null && r.risk_score !== undefined
  ).length;

  // Group safeguards by control
  const byControl = safeguards.reduce((acc, s, idx) => {
    if (!acc[s.control]) acc[s.control] = [];
    acc[s.control].push({ ...s, idx });
    return acc;
  }, {});

  if (!currentSafeguard) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">{t('assessment.noSafeguards')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {organization?.name || 'Assessment'}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <span className="bg-primary-100 text-primary-800 font-semibold px-2 py-0.5 rounded text-xs">IG{ig}</span>
            <span>{totalSafeguards} safeguards</span>
            {sessionId && (
              <span className="font-mono text-xs text-gray-400 truncate hidden sm:block">
                Session: {sessionId.slice(0, 8)}...
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="text-xs text-gray-500 animate-pulse">{t('assessment.saving')}</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> {t('assessment.saved')}
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-secondary text-sm py-2 px-3"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">{t('assessment.controls')}</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar
        current={completedCount}
        total={totalSafeguards}
        label={t('assessment.progressLabel')}
        className="mb-6"
      />

      <div className="flex gap-4">
        {/* Main assessment panel */}
        <div className="flex-1 min-w-0">
          <div className="card">
            {/* Safeguard header */}
            <div className="card-header">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-mono font-bold text-primary-600 text-sm bg-primary-50 px-2 py-0.5 rounded">
                      {currentSafeguard.id}
                    </span>
                    <span className={clsx('badge', NIST_COLORS[currentSafeguard.nistFunction] || 'badge-gray')}>
                      {currentSafeguard.nistFunction}
                    </span>
                    <span className="badge badge-gray">{currentSafeguard.assetClass}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentSafeguard.friendlyTitle || currentSafeguard.title}
                  </h2>
                  {currentSafeguard.friendlyTitle && (
                    <p className="text-xs text-gray-400 mt-0.5 italic">{currentSafeguard.title}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Control {currentSafeguard.control}: {CONTROL_NAMES[currentSafeguard.control]}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-black text-gray-300">{currentIndex + 1}</div>
                  <div className="text-xs text-gray-400">of {totalSafeguards}</div>
                </div>
              </div>

              {/* Collapsible description box */}
              <div className="mt-3">
                <SafeguardInfoBox safeguard={currentSafeguard} />
              </div>
            </div>

            <div className="card-body space-y-6">
              {/* IG1: Maturity Score */}
              {ig === 1 && (
                <MaturitySelector
                  value={localResponse.maturity_score || null}
                  onChange={(v) => setLocalResponse(prev => ({ ...prev, maturity_score: v }))}
                  label={t('assessment.maturityQuestion')}
                />
              )}

              {/* IG1: Auto-calculated expectancy */}
              {ig === 1 && liveExpectancy !== null && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-800">
                      <strong>{t('assessment.estimatedLikelihood', { value: liveExpectancy })}</strong>
                      {' '}— {t('assessment.estimatedLikelihoodNote')}
                    </span>
                  </div>
                </div>
              )}

              {/* IG2/IG3: Expectancy Score */}
              {ig >= 2 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-3">
                    {t('assessment.expectancyQuestion')}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {EXPECTANCY_OPTIONS.map(opt => (
                      <button
                        key={opt.score}
                        type="button"
                        onClick={() => setLocalResponse(prev => ({ ...prev, expectancy_score: opt.score }))}
                        className={clsx(
                          'flex flex-col items-start p-3 rounded-lg border-2 transition-all duration-150 text-left',
                          localResponse.expectancy_score === opt.score
                            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-400'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        )}
                      >
                        <div className="text-xl font-black text-gray-700 mb-1">{opt.score}</div>
                        <div className="text-xs font-semibold text-gray-800">{opt.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-tight">{opt.detail}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Impact Selector */}
              <ImpactSelector
                igLevel={ig}
                values={impactValues}
                onChange={handleImpactChange}
              />

              {/* Live Risk Score */}
              {liveRiskScore !== null && (
                <RiskScoreDisplay score={liveRiskScore} igLevel={ig} />
              )}

              {/* Notes */}
              <div>
                <label className="label flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5" />
                  {t('assessment.notesLabel')}
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t('assessment.notesPlaceholder')}
                  rows={3}
                  className="input-field resize-none text-sm"
                />
              </div>
            </div>

            {/* Navigation footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
                  else navigate('/screening');
                }}
                className="btn-secondary"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('assessment.buttons.previous')}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSave(false)}
                  className="btn-secondary text-sm py-2"
                >
                  <Save className="w-4 h-4" />
                  {t('assessment.buttons.save')}
                </button>

                {currentIndex < totalSafeguards - 1 ? (
                  <button
                    onClick={() => handleSave(true)}
                    className="btn-primary"
                  >
                    {t('assessment.buttons.saveAndNext')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="btn-primary bg-accent-500 hover:bg-accent-600"
                  >
                    {completing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        {t('assessment.buttons.finalizing')}
                      </>
                    ) : (
                      <>
                        <BarChart2 className="w-4 h-4" />
                        {t('assessment.buttons.complete')}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Control navigation */}
        {sidebarOpen && (
          <div className="w-72 flex-shrink-0 hidden lg:block">
            <div className="card sticky top-4 max-h-[calc(100vh-8rem)] flex flex-col">
              <div className="card-header">
                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <List className="w-4 h-4" />
                  {t('assessment.controls')} ({completedCount}/{totalSafeguards})
                </h3>
              </div>
              <div className="overflow-y-auto flex-1 scrollbar-thin">
                {Object.entries(byControl).map(([controlNum, items]) => {
                  const doneInControl = items.filter(s => responses[s.id]?.risk_score !== undefined).length;
                  return (
                    <div key={controlNum} className="border-b last:border-0">
                      <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 sticky top-0">
                        C{controlNum}: {CONTROL_NAMES[controlNum]?.slice(0, 28)}...
                        <span className="ml-1 text-gray-400">({doneInControl}/{items.length})</span>
                      </div>
                      {items.map(s => {
                        const existing = responses[s.id];
                        const scored = existing?.risk_score !== undefined && existing?.risk_score !== null;
                        const level = scored ? getRiskLevel(existing.risk_score, ig) : null;
                        const isCurrentSafeguard = s.idx === currentIndex;
                        return (
                          <button
                            key={s.id}
                            onClick={() => setCurrentIndex(s.idx)}
                            className={clsx(
                              'w-full text-left px-3 py-2 flex items-center gap-2 text-xs transition-colors',
                              isCurrentSafeguard
                                ? 'bg-primary-50 text-primary-800 font-medium'
                                : 'hover:bg-gray-50 text-gray-700'
                            )}
                          >
                            <div className={clsx(
                              'w-2 h-2 rounded-full flex-shrink-0',
                              !scored ? 'bg-gray-300' :
                              level === 'acceptable' ? 'bg-green-500' :
                              level === 'unacceptable' ? 'bg-yellow-500' :
                              'bg-red-500'
                            )} />
                            <span className="font-mono font-bold text-gray-500 flex-shrink-0">{s.id}</span>
                            <span className="truncate">{(s.friendlyTitle || s.title).slice(0, 30)}</span>
                            {scored && <span className="ml-auto font-bold text-gray-600">{existing.risk_score}</span>}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 inset-y-0 w-80 bg-white flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">Controls ({completedCount}/{totalSafeguards})</h3>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-500">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 scrollbar-thin">
              {Object.entries(byControl).map(([controlNum, items]) => (
                <div key={controlNum} className="border-b last:border-0">
                  <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600">
                    C{controlNum}: {CONTROL_NAMES[controlNum]?.slice(0, 30)}...
                  </div>
                  {items.map(s => {
                    const existing = responses[s.id];
                    const scored = existing?.risk_score !== undefined && existing?.risk_score !== null;
                    const level = scored ? getRiskLevel(existing.risk_score, ig) : null;
                    return (
                      <button
                        key={s.id}
                        onClick={() => { setCurrentIndex(s.idx); setSidebarOpen(false); }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 text-xs hover:bg-gray-50"
                      >
                        <div className={clsx(
                          'w-2 h-2 rounded-full flex-shrink-0',
                          !scored ? 'bg-gray-300' :
                          level === 'acceptable' ? 'bg-green-500' :
                          level === 'unacceptable' ? 'bg-yellow-500' : 'bg-red-500'
                        )} />
                        <span className="font-mono font-bold text-gray-500">{s.id}</span>
                        <span className="truncate flex-1">{(s.friendlyTitle || s.title).slice(0, 35)}</span>
                        {scored && <span className="font-bold">{existing.risk_score}</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
