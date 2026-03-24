import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Filter, ChevronDown, ExternalLink, ClipboardList,
  CheckCircle, Clock, AlertTriangle, FileText
} from 'lucide-react';
import { getAllAssessments } from '../../lib/supabase';
import { getORILevel } from '../../lib/calculations';
import clsx from 'clsx';

function StatusBadge({ status }) {
  const configs = {
    completed: { label: 'Completed', class: 'badge-green', icon: CheckCircle },
    in_progress: { label: 'In Progress', class: 'badge-blue', icon: Clock },
    screening: { label: 'Screening', class: 'badge-yellow', icon: Clock },
  };
  const cfg = configs[status] || { label: status, class: 'badge-gray', icon: null };
  const Icon = cfg.icon;
  return (
    <span className={clsx('badge flex items-center gap-1', cfg.class)}>
      {Icon && <Icon className="w-3 h-3" />}
      {cfg.label}
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

  function handleViewReport(assessment) {
    // Store the session id in localStorage so the report page can reload it
    localStorage.setItem('cis_admin_view_session', assessment.session_id);
    // Navigate to report page
    navigate('/report');
  }

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
      if (sortBy === 'organizational_risk_index') {
        av = av ?? 999;
        bv = bv ?? 999;
      }
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
        className={clsx(
          'flex items-center gap-1 font-semibold transition-colors text-xs uppercase',
          isActive ? 'text-primary-700' : 'text-gray-500 hover:text-gray-700'
        )}
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
        <p className="text-sm text-gray-500 mt-1">{assessments.length} total assessments</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: ClipboardList, color: 'text-gray-700' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-700' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-blue-700' },
          { label: 'High ORI (≥50)', value: stats.highRisk, icon: AlertTriangle, color: 'text-red-700' },
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by org, email, session..."
            className="input-field pl-9"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="screening">Screening</option>
        </select>
        <select
          value={filterIG}
          onChange={e => setFilterIG(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All IGs</option>
          <option value="1">IG1</option>
          <option value="2">IG2</option>
          <option value="3">IG3</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left"><SortHeader field="organizations" label="Organization" /></th>
                <th className="px-4 py-3 text-left"><SortHeader field="assessor_email" label="Assessor" /></th>
                <th className="px-4 py-3 text-center">IG</th>
                <th className="px-4 py-3 text-center"><SortHeader field="organizational_risk_index" label="ORI" /></th>
                <th className="px-4 py-3 text-center"><SortHeader field="status" label="Status" /></th>
                <th className="px-4 py-3 text-center">Progress</th>
                <th className="px-4 py-3 text-left"><SortHeader field="created_at" label="Created" /></th>
                <th className="px-4 py-3 text-center">Session</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(a => {
                const progress = a.total_safeguards
                  ? Math.round(((a.completed_safeguards || 0) / a.total_safeguards) * 100)
                  : 0;
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{a.organizations?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-400 font-mono">{a.organizations?.code}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700 text-xs">{a.assessor_email}</div>
                      {a.assessor_name && <div className="text-gray-400 text-xs">{a.assessor_name}</div>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {a.implementation_group && (
                        <span className="badge badge-blue">IG{a.implementation_group}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ORIBadge ori={a.organizational_risk_index} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 bg-primary-500 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      <div>{new Date(a.created_at).toLocaleDateString()}</div>
                      {a.completed_at && (
                        <div className="text-green-600">
                          Done: {new Date(a.completed_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-xs text-gray-400">
                        {a.session_id?.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {a.status === 'completed' ? (
                        <button
                          onClick={() => handleViewReport(a)}
                          title="Open the report page for this assessment. Use Export PDF on that page to download."
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200 rounded hover:bg-primary-100 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          View Report
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    {search || filterStatus !== 'all' || filterIG !== 'all'
                      ? 'No assessments match your filters.'
                      : 'No assessments yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-500">
            Showing {filtered.length} of {assessments.length} assessments
            {' '}— Click "View Report" on completed assessments to open the full report and export PDF.
          </div>
        )}
      </div>
    </div>
  );
}
