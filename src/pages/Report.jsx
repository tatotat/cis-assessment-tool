import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Download, RefreshCw, AlertTriangle, CheckCircle, AlertCircle,
  Shield, Calendar, User, Hash, ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAssessmentStore from '../stores/assessmentStore';
import {
  calculateORI, getRiskSummary, getImmediateActions, getRecommendations,
  getControlScores, getRiskLevel
} from '../lib/calculations';
import { CONTROL_NAMES } from '../lib/safeguards';
import { useSettings } from '../lib/settings';
import { buildReportPdf } from '../lib/pdf/reportPdf';
import RiskGauge from '../components/report/RiskGauge';
import ControlScores from '../components/report/ControlScores';
import RecommendationsPanel from '../components/report/RecommendationsPanel';
import TrainingPanel from '../components/report/TrainingPanel';
import clsx from 'clsx';

// Map risk level (+ max score) to a compliance status key
function getComplianceStatus(riskScore, igLevel) {
  if (riskScore === null || riskScore === undefined) return 'not-assessed';
  const level = getRiskLevel(riskScore, igLevel);
  const maxScore = igLevel === 1 ? 9 : 25;
  if (level === 'acceptable') return 'compliant';
  if (level === 'unacceptable') return 'needs-improvement';
  if (riskScore >= maxScore) return 'critical';
  return 'non-compliant';
}

const STATUS_STYLE = {
  'compliant':         { color: 'bg-green-100 text-green-800 border-green-300',   dot: 'bg-green-500',  border: 'border-green-200' },
  'needs-improvement': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', dot: 'bg-yellow-500', border: 'border-yellow-200' },
  'non-compliant':     { color: 'bg-orange-100 text-orange-800 border-orange-300', dot: 'bg-orange-500', border: 'border-orange-200' },
  'critical':          { color: 'bg-red-100 text-red-800 border-red-300',         dot: 'bg-red-600',    border: 'border-red-200' },
  'not-assessed':      { color: 'bg-gray-100 text-gray-600 border-gray-300',      dot: 'bg-gray-400',   border: 'border-gray-200' },
};
const STATUS_KEYS = ['compliant', 'needs-improvement', 'non-compliant', 'critical', 'not-assessed'];

function SafeguardStatusList({ safeguards, responses, ig, filter, search }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState({});

  const filtered = useMemo(() => {
    const order = { critical: 0, 'non-compliant': 1, 'needs-improvement': 2, 'not-assessed': 3, compliant: 4 };
    return safeguards
      .map(s => {
        const r = responses[s.id] || null;
        return { safeguard: s, response: r, status: getComplianceStatus(r?.risk_score, ig) };
      })
      .filter(({ safeguard: s, status }) => {
        if (filter !== 'all' && status !== filter) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            s.id.includes(q) ||
            (s.friendlyTitle || s.title).toLowerCase().includes(q) ||
            s.title.toLowerCase().includes(q) ||
            CONTROL_NAMES[s.control]?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => (order[a.status] ?? 5) - (order[b.status] ?? 5));
  }, [safeguards, responses, ig, filter, search]);

  if (filtered.length === 0) {
    return <div className="text-center py-10 text-gray-400 text-sm">{t('report.status.noMatch')}</div>;
  }

  const maxScore = ig === 1 ? 9 : 25;
  const impactMax = ig === 1 ? 3 : 5;

  return (
    <div className="space-y-2">
      {filtered.map(({ safeguard: s, response: r, status }) => {
        const style = STATUS_STYLE[status];
        const isOpen = !!expanded[s.id];
        const riskScore = r?.risk_score;
        const riskPct = riskScore != null ? Math.round((riskScore / maxScore) * 100) : 0;

        return (
          <div key={s.id} className={clsx('rounded-xl border overflow-hidden transition-all', style.border)}>
            <button
              type="button"
              onClick={() => setExpanded(e => ({ ...e, [s.id]: !e[s.id] }))}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className={clsx('w-3 h-3 rounded-full flex-shrink-0 mt-0.5', style.dot)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-gray-500">{s.id}</span>
                  <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border', style.color)}>
                    {t(`report.statusMeta.${status}.label`)}
                  </span>
                  <span className="text-xs text-gray-400">{CONTROL_NAMES[s.control]}</span>
                </div>
                <div className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                  {s.friendlyTitle || s.title}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {riskScore != null && (
                  <div className="text-right">
                    <div className="text-lg font-black text-gray-700">{riskScore}<span className="text-xs font-normal text-gray-400">/{maxScore}</span></div>
                    <div className="text-xs text-gray-400">{t('report.status.riskScoreLabel')}</div>
                  </div>
                )}
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 space-y-3">
                <div className={clsx('rounded-lg border px-3 py-2 text-sm', style.color)}>
                  <strong>{t('report.status.statusPrefix')} {t(`report.statusMeta.${status}.label`)}</strong> — {t(`report.statusMeta.${status}.description`)}
                </div>

                {s.description && (
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">{t('report.status.whatCovers')} </span>{s.description}
                  </div>
                )}
                {s.whyItMatters && (
                  <div className="text-sm text-gray-600 italic">
                    <span className="font-semibold not-italic">{t('report.status.whyMatters')} </span>{s.whyItMatters}
                  </div>
                )}

                {riskScore != null && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{t('report.status.riskExposure')}</span>
                      <span>{riskScore}/{maxScore} ({riskPct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full transition-all',
                          riskPct < 45 ? 'bg-green-500' : riskPct < 65 ? 'bg-yellow-400' : riskPct < 85 ? 'bg-orange-500' : 'bg-red-600'
                        )}
                        style={{ width: `${riskPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {r && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="text-gray-400 mb-0.5">{ig === 1 ? t('report.status.implLevel') : t('report.status.incidentLikelihood')}</div>
                      <div className="font-bold text-gray-700">{ig === 1 ? r.maturity_score : r.expectancy_score} / 5</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="text-gray-400 mb-0.5">{t('report.status.missionImpact')}</div>
                      <div className="font-bold text-gray-700">{r.impact_mission ?? '—'} / {impactMax}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="text-gray-400 mb-0.5">{t('report.status.operationalImpact')}</div>
                      <div className="font-bold text-gray-700">{r.impact_operational ?? '—'} / {impactMax}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="text-gray-400 mb-0.5">{t('report.status.obligationsImpact')}</div>
                      <div className="font-bold text-gray-700">{r.impact_obligations ?? '—'} / {impactMax}</div>
                    </div>
                  </div>
                )}

                {r?.notes && (
                  <div className="text-xs text-gray-600 bg-white rounded-lg p-2 border border-gray-200">
                    <span className="font-semibold">{t('report.status.assessorNotes')} </span>{r.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = 'text-gray-800', bg = 'bg-white' }) {
  return (
    <div className={clsx('card p-5 flex items-center gap-4', bg)}>
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', color.replace('text-', 'bg-').replace('800', '100'))}>
        <Icon className={clsx('w-5 h-5', color)} />
      </div>
      <div>
        <div className={clsx('text-2xl font-black', color)}>{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}

export default function Report() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { sessionId: routeSessionId } = useParams();
  const {
    sessionId, organization, assessorEmail, assessorName,
    implementationGroup, responses, safeguards,
    igScore, reset, loadSession
  } = useAssessmentStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusSearch, setStatusSearch] = useState('');

  const branding = useSettings();

  // /report/:sessionId (admin "View Report"): load that session into the store
  // if it isn't already the active one. Plain /report requires an active session.
  useEffect(() => {
    if (routeSessionId) {
      if (routeSessionId !== sessionId) {
        loadSession(routeSessionId).then(ok => { if (!ok) navigate('/admin/assessments'); });
      }
      return;
    }
    if (!sessionId) navigate('/');
  }, [routeSessionId, sessionId]);

  if (routeSessionId && routeSessionId !== sessionId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const ig = implementationGroup || 1;
  const allResponses = Object.values(responses);
  const scoredResponses = allResponses.filter(r => r.risk_score !== null && r.risk_score !== undefined);
  const ori = calculateORI(scoredResponses, ig);
  const summary = getRiskSummary(scoredResponses, ig);
  const immediateActions = getImmediateActions(scoredResponses, ig);
  const recommendations = getRecommendations(scoredResponses, ig);
  const controlScores = getControlScores(scoredResponses, ig);
  const completionPct = safeguards.length > 0 ? Math.round((scoredResponses.length / safeguards.length) * 100) : 0;
  const assessmentDate = new Date().toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' });

  async function handlePDFExport() {
    setPdfGenerating(true);
    setPdfError('');
    try {
      const { doc, filename } = await buildReportPdf(t, {
        organization, assessorName, assessorEmail, ig, sessionId,
        safeguards, scoredResponses, summary, ori, controlScores,
        immediateActions, assessmentDate, logoUrl: branding.logoUrl,
      });
      doc.save(filename);
    } catch (err) {
      console.error('PDF generation error:', err);
      setPdfError(t('report.pdfFailed'));
    } finally {
      setPdfGenerating(false);
    }
  }

  const tabs = [
    { id: 'overview', label: t('report.tabs.overview') },
    { id: 'controls', label: t('report.tabs.controls') },
    { id: 'actions', label: t('report.tabs.actions', { count: immediateActions.length }) },
    { id: 'recommendations', label: t('report.tabs.recommendations', { count: recommendations.length }) },
    { id: 'training', label: t('report.tabs.training') },
    { id: 'safeguards', label: t('report.tabs.safeguards', { count: scoredResponses.length }) },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Report Header */}
      <div className="bg-primary-600 rounded-2xl text-white p-6 mb-6 shadow-lg">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="" className="h-8 w-auto object-contain rounded" onError={e => { e.target.style.display='none'; }} />
              ) : (
                <Shield className="w-6 h-6 text-primary-200" />
              )}
              <span className="text-primary-200 text-sm font-medium">{t('report.header.badge')}</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">{organization?.name || t('report.header.untitled')}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-primary-200 mt-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {assessmentDate}
              </span>
              {(assessorName || assessorEmail) && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {assessorName || assessorEmail}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Hash className="w-4 h-4" />
                IG{ig}
              </span>
              {sessionId && (
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  {t('report.header.session', { id: sessionId.slice(0, 12) })}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePDFExport}
              disabled={pdfGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {pdfGenerating ? (
                <><div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" /> {t('report.buttons.generating')}</>
              ) : (
                <><Download className="w-4 h-4" /> {t('report.buttons.exportPdf')}</>
              )}
            </button>
            <button
              onClick={() => { reset(); navigate('/'); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('report.buttons.new')}
            </button>
          </div>
        </div>
        {pdfError && (
          <div className="mt-3 text-sm bg-white/15 rounded-lg px-3 py-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {pdfError}
          </div>
        )}
      </div>

      {/* ORI + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-2 card p-6 flex flex-col items-center">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
            {t('report.oriTitle')}
          </h2>
          <RiskGauge ori={ori} size={220} />
          <div className="mt-3 text-center text-xs text-gray-400">
            {t('report.completeNote', { pct: completionPct })}
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-2 gap-3">
          <StatCard icon={Shield} label={t('report.stats.total')} value={summary.total} color="text-blue-800" />
          <StatCard icon={CheckCircle} label={t('report.riskLevel.acceptable')} value={summary.acceptable} color="text-green-700" />
          <StatCard icon={AlertCircle} label={t('report.riskLevel.unacceptable')} value={summary.unacceptable} color="text-yellow-700" />
          <StatCard icon={AlertTriangle} label={t('report.riskLevel.high')} value={summary.high} color="text-red-700" />
        </div>
      </div>

      {/* Immediate Actions Banner */}
      {immediateActions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-800">
              {t('report.banner.title', { count: immediateActions.length })}
            </div>
            <div className="text-sm text-red-700 mt-0.5">{t('report.banner.text')}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div className="border-b overflow-x-auto">
          <div className="flex px-4 -mb-px gap-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">{t('report.overview.summary')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">{t('report.overview.igLevel')}</div>
                    <div className="font-bold text-lg">IG{ig}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">{t('report.overview.igScore')}</div>
                    <div className="font-bold text-lg">{igScore?.toFixed(2) || t('report.pdf.na')}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">{t('report.overview.completion')}</div>
                    <div className="font-bold text-lg">{completionPct}%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">ORI</div>
                    <div className="font-bold text-lg">{ori !== null ? ori.toFixed(1) : t('report.pdf.na')}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">{t('report.overview.aboutIg', { ig })}</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p>{t(`report.overview.igText.${ig}`)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">{t('report.overview.formulaTitle')}</h3>
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                  <div className="text-gray-700">
                    <strong>{t('report.overview.formulaLhs')}</strong> = {ig >= 2 ? t('report.overview.formulaRhsFinancial') : t('report.overview.formulaRhs')}
                  </div>
                  {ig === 1 && (
                    <div className="text-gray-500 text-xs mt-2">{t('report.overview.formulaNote')}</div>
                  )}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-green-100 text-green-800 rounded p-2 text-center">
                      <div className="font-bold">{t('report.riskLevel.acceptable')}</div>
                      <div>{ig === 1 ? '< 6' : '< 9'}</div>
                    </div>
                    <div className="bg-yellow-100 text-yellow-800 rounded p-2 text-center">
                      <div className="font-bold">{t('report.riskLevel.unacceptable')}</div>
                      <div>{ig === 1 ? '= 6' : '9–15'}</div>
                    </div>
                    <div className="bg-red-100 text-red-800 rounded p-2 text-center">
                      <div className="font-bold">{t('report.riskLevel.high')}</div>
                      <div>{ig === 1 ? '= 9' : '≥ 16'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">{t('report.controls.title')}</h3>
              <ControlScores responses={scoredResponses} igLevel={ig} />
            </div>
          )}

          {activeTab === 'actions' && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('report.actions.title')}</h3>
              <p className="text-sm text-gray-500 mb-4">{t('report.actions.desc')}</p>
              <RecommendationsPanel responses={scoredResponses} igLevel={ig} showHighOnly={true} />
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('report.recs.title')}</h3>
              <p className="text-sm text-gray-500 mb-4">{t('report.recs.desc')}</p>
              <RecommendationsPanel responses={scoredResponses} igLevel={ig} showHighOnly={false} />
            </div>
          )}

          {activeTab === 'training' && (
            <TrainingPanel responses={scoredResponses} igLevel={ig} />
          )}

          {activeTab === 'safeguards' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{t('report.status.title')}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{t('report.status.desc')}</p>
                </div>
                <div className="sm:ml-auto flex items-center gap-2 flex-shrink-0">
                  {STATUS_KEYS.filter(k => k !== 'not-assessed').map(key => (
                    <button key={key}
                      onClick={() => setStatusFilter(f => f === key ? 'all' : key)}
                      className={clsx('hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border transition-all',
                        statusFilter === key ? STATUS_STYLE[key].color + ' font-bold ring-2 ring-offset-1' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      )}>
                      <span className={clsx('w-2 h-2 rounded-full', STATUS_STYLE[key].dot)} />
                      {t(`report.statusMeta.${key}.label`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('report.status.searchPlaceholder')}
                    value={statusSearch}
                    onChange={e => setStatusSearch(e.target.value)}
                    className="input-field pl-9 py-2 text-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="input-field py-2 text-sm w-auto"
                >
                  <option value="all">{t('report.status.allStatuses')}</option>
                  {['critical', 'non-compliant', 'needs-improvement', 'compliant', 'not-assessed'].map(k => (
                    <option key={k} value={k}>{t(`report.statusMeta.${k}.label`)}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                {STATUS_KEYS.map(key => {
                  const count = safeguards.filter(s => getComplianceStatus(responses[s.id]?.risk_score, ig) === key).length;
                  return (
                    <div key={key} className={clsx('rounded-lg border px-3 py-2 text-center cursor-pointer transition-all',
                      statusFilter === key ? 'ring-2 ring-primary-400 ' + STATUS_STYLE[key].color : 'bg-white border-gray-200 hover:border-gray-300'
                    )} onClick={() => setStatusFilter(f => f === key ? 'all' : key)}>
                      <div className="text-xl font-black text-gray-700">{count}</div>
                      <div className="text-xs text-gray-500 leading-tight">{t(`report.statusMeta.${key}.label`)}</div>
                    </div>
                  );
                })}
              </div>

              <SafeguardStatusList
                safeguards={safeguards}
                responses={responses}
                ig={ig}
                filter={statusFilter}
                search={statusSearch}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400 text-center">
        {t('report.footer.sessionId')} <span className="font-mono">{sessionId}</span> — {t('report.footer.hint')}
      </div>
    </div>
  );
}
