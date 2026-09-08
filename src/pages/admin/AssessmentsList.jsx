import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ChevronDown, ClipboardList, CheckCircle, Clock, AlertTriangle, FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAllAssessments } from '../../lib/supabase';
import { getORILevel } from '../../lib/calculations';
import clsx from 'clsx';

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const configs = {
    completed: { class: 'badge-green', icon: CheckCircle },
    in_progress: { class: 'badge-blue', icon: Clock },
    screening: { class: 'badge-yellow', icon: Clock },
  };
  const cfg = configs[status] || { class: 'badge-gray', icon: null };
  const Icon = cfg.icon;
  return (
    <span className={clsx('badge flex items-center gap-1', cfg.class)}>
      {Icon && <Icon className="w-3 h-3" />}
      {t(`admin.assessmentStatus.${status}`, status)}
    </span>
  );
}

function ORIBadge({ ori }) {
  if (ori === null || ori === undefined) return <span className="text-gray-400 text-xs">—</span>;
  const level = getORILevel(ori);
  const colorMap = {
    low: 'text-green-700 bg-green-50',
    moderate: 'text-yellow-700 bg-yellow-50',
    elevated: 'text-orange-700 bg-orange-50',
    critical: 'text-red-700 bg-red-50',
  };
  return (
    <span className={clsx('px-2 py-0.5 rounded font-bold text-sm', colorMap[level] || 'text-gray-700')}>
      {ori.toFixed(1)}
    </span>
  );
}

export default function AssessmentsList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterIG, setFilterIG] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    async function load() {
      const { data } = await getAllAssessments();
      setAssessments(data || []);
      setLoading(false);
    }
    load();
  }, []);

  function toggleSort(field) {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  }

  const fmtDate = d => new Date(d).toLocaleDateString(i18n.language);

  const filtered = assessments
    .filter(a => {
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (filterIG !== 'all' && String(a.implementation_group) !== filterIG) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          a.assessor_email?.toLowerCase().includes(s) ||
          a.organizations?.name?.toLowerCase().includes(s) ||
          a.organizations?.code?.toLowerCase().includes(s) ||
          a.session_id?.includes(s)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let av = a[sortBy];
      let bv = b[sortBy];
      if (sortBy === 'organizational_risk_index') { av = av ?? 999; bv = bv ?? 999; }
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  function SortHeader({ field, label }) {
    const isActive = sortBy === field;
    return (
      <button
        onClick={() => toggleSort(field)}
        className={clsx('flex items-center gap-1 font-semibold transition-colors text-xs uppercase',
          isActive ? 'text-primary-700' : 'text-gray-500 hover:text-gray-700')}
      >
        {label}
        <ChevronDown className={clsx('w-3 h-3 transition-transform', isActive && sortDir === 'asc' && 'rotate-180')} />
      </button>
    );
  }

  const stats = {
    total: assessments.length,
    completed: assessments.filter(a => a.status === 'completed').length,
    inProgress: assessments.filter(a => a.status === 'in_progress').length,
    highRisk: assessments.filter(a => a.organizational_risk_index !== null && a.organizational_risk_index >= 50).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const noFilters = !search && filterStatus === 'all' && filterIG === 'all';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.assessments')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('admin.assessmentsPage.total', { count: assessments.length })}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('admin.assessmentsPage.statTotal'), value: stats.total, icon: ClipboardList, color: 'text-gray-700' },
          { label: t('admin.assessmentStatus.completed'), value: stats.completed, icon: CheckCircle, color: 'text-green-700' },
          { label: t('admin.assessmentStatus.in_progress'), value: stats.inProgress, icon: Clock, color: 'text-blue-700' },
          { label: t('admin.assessmentsPage.highOri'), value: stats.highRisk, icon: AlertTriangle, color: 'text-red-700' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <Icon className={clsx('w-5 h-5', s.color)} />
              <div>
                <div className={clsx('text-xl font-black', s.color)}>{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.assessmentsPage.searchPlaceholder')} className="input-field pl-9" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field w-auto">
          <option value="all">{t('admin.assessmentsPage.allStatus')}</option>
          <option value="completed">{t('admin.assessmentStatus.completed')}</option>
          <option value="in_progress">{t('admin.assessmentStatus.in_progress')}</option>
          <option value="screening">{t('admin.assessmentStatus.screening')}</option>
        </select>
        <select value={filterIG} onChange={e => setFilterIG(e.target.value)} className="input-field w-auto">
          <option value="all">{t('admin.assessmentsPage.allIgs')}</option>
          <option value="1">IG1</option>
          <option value="2">IG2</option>
          <option value="3">IG3</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left"><SortHeader field="organizations" label={t('admin.cols.organization')} /></th>
                <th className="px-4 py-3 text-left"><SortHeader field="assessor_email" label={t('admin.cols.assessor')} /></th>
                <th className="px-4 py-3 text-center">IG</th>
                <th className="px-4 py-3 text-center"><SortHeader field="organizational_risk_index" label="ORI" /></th>
                <th className="px-4 py-3 text-center"><SortHeader field="status" label={t('admin.cols.status')} /></th>
                <th className="px-4 py-3 text-center">{t('admin.cols.progress')}</th>
                <th className="px-4 py-3 text-left"><SortHeader field="created_at" label={t('admin.cols.created')} /></th>
                <th className="px-4 py-3 text-center">{t('admin.cols.session')}</th>
                <th className="px-4 py-3 text-center">{t('admin.cols.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(a => {
                const progress = a.total_safeguards
                  ? Math.round(((a.completed_safeguards || 0) / a.total_safeguards) * 100) : 0;
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{a.organizations?.name || t('admin.unknownOrg')}</div>
                      <div className="text-xs text-gray-400 font-mono">{a.organizations?.code}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700 text-xs">{a.assessor_email}</div>
                      {a.assessor_name && <div className="text-gray-400 text-xs">{a.assessor_name}</div>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {a.implementation_group && <span className="badge badge-blue">IG{a.implementation_group}</span>}
                    </td>
                    <td className="px-4 py-3 text-center"><ORIBadge ori={a.organizational_risk_index} /></td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div className="h-1.5 bg-primary-500 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      <div>{fmtDate(a.created_at)}</div>
                      {a.completed_at && (
                        <div className="text-green-600">{t('admin.assessmentsPage.done', { date: fmtDate(a.completed_at) })}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-xs text-gray-400">{a.session_id?.slice(0, 8)}...</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        {a.status === 'completed' ? (
                          <button
                            onClick={() => navigate(`/report/${a.session_id}`)}
                            title={t('admin.assessmentsPage.viewReportTitle')}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200 rounded hover:bg-primary-100 transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            {t('admin.assessmentsPage.viewReport')}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                        {a.organization_id && (
                          <button
                            onClick={() => navigate(`/admin/workplan?org=${a.organization_id}`)}
                            title={t('admin.assessmentsPage.workPlanTitle')}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                          >
                            <ClipboardList className="w-3 h-3" />
                            {t('admin.assessmentsPage.workPlan')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    {noFilters ? t('admin.assessmentsPage.empty') : t('admin.assessmentsPage.noMatch')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-500">
            {t('admin.assessmentsPage.showing', { shown: filtered.length, total: assessments.length })}
            {' '}— {t('admin.assessmentsPage.showingHint')}
          </div>
        )}
      </div>
    </div>
  );
}
