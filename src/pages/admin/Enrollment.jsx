import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, Trash2, Copy, RefreshCw, Link2, Download,
  CheckCircle, AlertCircle, Clock, PlayCircle, ClipboardList, ListChecks
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getAllOrganizations, getEnrollmentsByOrg, bulkCreateEnrollments,
  deleteEnrollment, regenerateEnrollmentToken,
} from '../../lib/supabase';
import clsx from 'clsx';

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const map = {
    invited: { icon: Clock, cls: 'bg-gray-100 text-gray-700' },
    started: { icon: PlayCircle, cls: 'bg-blue-100 text-blue-800' },
    completed: { icon: CheckCircle, cls: 'bg-green-100 text-green-800' },
  };
  const m = map[status] || map.invited;
  const Icon = m.icon;
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', m.cls)}>
      <Icon className="w-3 h-3" />
      {t(`admin.enrollment.status.${status}`)}
    </span>
  );
}

function inviteLink(token) {
  return `${window.location.origin}/?invite=${token}`;
}

export default function AdminEnrollment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState('');
  const [labelFilter, setLabelFilter] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pasteText, setPasteText] = useState('');
  const [auditLabel, setAuditLabel] = useState('');
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    getAllOrganizations().then(({ data }) => {
      setOrgs(data || []);
      if (data && data.length) setOrgId(data[0].id);
      setLoading(false);
    });
  }, []);

  async function loadEnrollments(id) {
    if (!id) return;
    const { data } = await getEnrollmentsByOrg(id);
    setEnrollments(data || []);
  }

  useEffect(() => {
    if (orgId) loadEnrollments(orgId);
  }, [orgId]);

  const labels = useMemo(
    () => [...new Set(enrollments.map(e => e.audit_label).filter(Boolean))],
    [enrollments]
  );

  const filtered = useMemo(
    () => labelFilter ? enrollments.filter(e => (e.audit_label || '') === labelFilter) : enrollments,
    [enrollments, labelFilter]
  );

  const stats = useMemo(() => {
    const s = { total: filtered.length, invited: 0, started: 0, completed: 0 };
    filtered.forEach(e => { s[e.status] = (s[e.status] || 0) + 1; });
    return s;
  }, [filtered]);

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  function parseRows(text) {
    // One "email" or "email,name" per line; also accept tabs / semicolons
    return text.split(/\r?\n/).map(line => {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      return { email: parts[0], full_name: parts[1] || '' };
    }).filter(r => r.email);
  }

  async function handleImport(e) {
    e.preventDefault();
    setMessage(null);
    const rows = parseRows(pasteText);
    if (rows.length === 0) {
      setMessage({ type: 'error', text: t('admin.enrollment.noValidRows') });
      return;
    }
    setImporting(true);
    const { data, error } = await bulkCreateEnrollments(orgId, rows, auditLabel);
    setImporting(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    setMessage({ type: 'success', text: t('admin.enrollment.importResult', { inserted: data.inserted, skipped: data.skipped }) });
    setPasteText('');
    loadEnrollments(orgId);
  }

  function handleCsvUpload(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let text = String(reader.result || '');
      // Drop a header row if it looks like one
      const lines = text.split(/\r?\n/);
      if (lines[0] && /email/i.test(lines[0]) && !/@/.test(lines[0])) lines.shift();
      setPasteText(lines.join('\n'));
    };
    reader.readAsText(file);
    ev.target.value = '';
  }

  async function copy(text, id) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setMessage({ type: 'error', text: t('admin.enrollment.copyFailed') });
    }
  }

  function copyAllLinks() {
    const text = filtered.map(e => inviteLink(e.invite_token)).join('\n');
    copy(text, 'all');
  }

  function downloadCsv() {
    const header = 'email,name,status,invite_link\n';
    const body = filtered.map(e =>
      [e.email, e.full_name || '', e.status, inviteLink(e.invite_token)]
        .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const org = orgs.find(o => o.id === orgId);
    a.href = url;
    a.download = `enrollments-${org?.code || 'org'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleRegenerate(id) {
    await regenerateEnrollmentToken(id);
    loadEnrollments(orgId);
  }

  async function handleDelete(id) {
    await deleteEnrollment(id);
    loadEnrollments(orgId);
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-primary-600" />
            {t('admin.enrollment.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t('admin.enrollment.subtitle')}</p>
        </div>
        {orgId && (
          <button
            onClick={() => navigate(`/admin/workplan?org=${orgId}`)}
            className="btn-secondary text-sm"
          >
            <ClipboardList className="w-4 h-4" />
            {t('admin.enrollment.viewWorkPlan')}
          </button>
        )}
      </div>

      {/* Org + label selectors */}
      <div className="flex flex-wrap gap-3">
        <select value={orgId} onChange={e => { setOrgId(e.target.value); setLabelFilter(''); }} className="input-field w-auto">
          {orgs.map(o => <option key={o.id} value={o.id}>{o.name} ({o.code})</option>)}
        </select>
        {labels.length > 0 && (
          <select value={labelFilter} onChange={e => setLabelFilter(e.target.value)} className="input-field w-auto">
            <option value="">{t('admin.enrollment.allAudits')}</option>
            {labels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4"><div className="text-2xl font-black text-gray-800">{stats.total}</div><div className="text-sm text-gray-500">{t('admin.enrollment.stats.total')}</div></div>
        <div className="card p-4"><div className="text-2xl font-black text-gray-600">{stats.invited}</div><div className="text-sm text-gray-500">{t('admin.enrollment.status.invited')}</div></div>
        <div className="card p-4"><div className="text-2xl font-black text-blue-600">{stats.started}</div><div className="text-sm text-gray-500">{t('admin.enrollment.status.started')}</div></div>
        <div className="card p-4"><div className="text-2xl font-black text-green-600">{stats.completed}</div><div className="text-sm text-gray-500">{t('admin.enrollment.status.completed')} · {completionPct}%</div></div>
      </div>

      {/* Import */}
      <div className="card">
        <div className="card-header font-semibold text-gray-800 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> {t('admin.enrollment.importTitle')}
        </div>
        <form onSubmit={handleImport} className="card-body space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">{t('admin.enrollment.auditLabel')}</label>
              <input value={auditLabel} onChange={e => setAuditLabel(e.target.value)} placeholder={t('admin.enrollment.auditLabelPlaceholder')} className="input-field" />
            </div>
            <div>
              <label className="label">{t('admin.enrollment.uploadCsv')}</label>
              <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:text-sm" />
            </div>
          </div>
          <div>
            <label className="label">{t('admin.enrollment.pasteLabel')}</label>
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              rows={5}
              placeholder={"alice@example.com, Alice Smith\nbob@example.com"}
              className="input-field font-mono text-sm resize-y"
            />
            <p className="text-xs text-gray-500 mt-1">{t('admin.enrollment.pasteHint')}</p>
          </div>
          {message && (
            <div className={clsx('flex items-start gap-2 p-3 rounded-lg text-sm',
              message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700')}>
              {message.type === 'error' ? <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
              {message.text}
            </div>
          )}
          <button type="submit" disabled={importing} className="btn-primary">
            {importing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <UserPlus className="w-4 h-4" />}
            {t('admin.enrollment.importButton')}
          </button>
        </form>
      </div>

      {/* Roster table */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <span className="font-semibold text-gray-800">{t('admin.enrollment.rosterTitle')} ({filtered.length})</span>
          {filtered.length > 0 && (
            <div className="flex gap-2">
              <button onClick={copyAllLinks} className="btn-secondary text-xs py-1.5">
                <Link2 className="w-3.5 h-3.5" />
                {copiedId === 'all' ? t('admin.enrollment.copied') : t('admin.enrollment.copyAll')}
              </button>
              <button onClick={downloadCsv} className="btn-secondary text-xs py-1.5">
                <Download className="w-3.5 h-3.5" />
                {t('admin.enrollment.downloadCsv')}
              </button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">{t('admin.enrollment.empty')}</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">{t('admin.enrollment.col.person')}</th>
                  <th className="text-left px-4 py-2 font-medium">{t('admin.enrollment.col.audit')}</th>
                  <th className="text-left px-4 py-2 font-medium">{t('admin.enrollment.col.status')}</th>
                  <th className="text-right px-4 py-2 font-medium">{t('admin.enrollment.col.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-gray-800">{e.email}</div>
                      {e.full_name && <div className="text-xs text-gray-400">{e.full_name}</div>}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{e.audit_label || '—'}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={e.status} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => copy(inviteLink(e.invite_token), e.id)} title={t('admin.enrollment.copyLink')} className="p-1.5 text-gray-400 hover:text-primary-600">
                          {copiedId === e.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleRegenerate(e.id)} title={t('admin.enrollment.regenerate')} className="p-1.5 text-gray-400 hover:text-amber-600">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(e.id)} title={t('admin.enrollment.delete')} className="p-1.5 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
