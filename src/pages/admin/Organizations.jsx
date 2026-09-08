import React, { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, X, Check, AlertCircle, Building2,
  Copy, RefreshCw, Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getAllOrganizations, createOrganization, updateOrganization, deleteOrganization,
} from '../../lib/supabase';

function generateCode(name) {
  const words = name.toUpperCase().replace(/[^A-Z0-9 ]/g, '').split(' ').filter(Boolean);
  if (words.length >= 2) {
    return (words[0].slice(0, 3) + words[1].slice(0, 3)).toUpperCase() + Math.floor(Math.random() * 900 + 100);
  }
  return (words[0] || 'ORG').slice(0, 5).toUpperCase() + Math.floor(Math.random() * 900 + 100);
}

// Stored as-is in the DB, so kept as data rather than translated labels
const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance & Banking', 'Government', 'Education',
  'Manufacturing', 'Retail', 'Energy & Utilities', 'Transportation', 'Legal',
  'Non-Profit', 'Defense & Military', 'Other'
];

function OrgModal({ org, onClose, onSave }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: org?.name || '',
    code: org?.code || '',
    industry: org?.industry || '',
    contact_email: org?.contact_email || '',
    roster_enforced: org?.roster_enforced || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function generateNewCode() {
    if (form.name) setForm(f => ({ ...f, code: generateCode(f.name) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError(t('admin.orgsPage.errors.nameRequired')); return; }
    if (!form.code.trim()) { setError(t('admin.orgsPage.errors.codeRequired')); return; }
    if (!/^[A-Z0-9]{4,20}$/.test(form.code.toUpperCase())) {
      setError(t('admin.orgsPage.errors.codeFormat'));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.toUpperCase().trim(),
        industry: form.industry || null,
        contact_email: form.contact_email || null,
        roster_enforced: !!form.roster_enforced,
      };
      const { error: err } = org?.id
        ? await updateOrganization(org.id, payload)
        : await createOrganization(payload);
      if (err) throw err;
      onSave();
    } catch (err) {
      setError(err.message || t('admin.orgsPage.errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {org?.id ? t('admin.orgsPage.editOrg') : t('admin.orgsPage.newOrg')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label={t('admin.cancel')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="label">{t('admin.orgsPage.nameLabel')} *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field" placeholder="Acme Corporation" required />
          </div>

          <div>
            <label className="label">{t('admin.orgsPage.codeLabel')} *</label>
            <div className="flex gap-2">
              <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="input-field font-mono uppercase flex-1" placeholder="ACME001" maxLength={20} required />
              <button type="button" onClick={generateNewCode} title={t('admin.orgsPage.autoGenerate')} className="btn-secondary px-3 flex-shrink-0">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('admin.orgsPage.codeHint')}</p>
          </div>

          <div>
            <label className="label">{t('admin.cols.industry')}</label>
            <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className="input-field">
              <option value="">{t('admin.orgsPage.selectIndustry')}</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="label">{t('admin.orgsPage.contactEmail')}</label>
            <input type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
              className="input-field" placeholder="contact@organization.com" />
          </div>

          <label className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer">
            <input type="checkbox" checked={form.roster_enforced}
              onChange={e => setForm(f => ({ ...f, roster_enforced: e.target.checked }))} className="mt-0.5" />
            <span className="text-sm">
              <span className="font-medium text-gray-800">{t('admin.orgsPage.rosterLabel')}</span>
              <span className="block text-xs text-gray-500 mt-0.5">{t('admin.orgsPage.rosterHint')}</span>
            </span>
          </label>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">{t('admin.cancel')}</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving
                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> {t('admin.saving')}</>
                : <><Check className="w-4 h-4" /> {org?.id ? t('admin.orgsPage.update') : t('admin.orgsPage.create')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Organizations() {
  const { t, i18n } = useTranslation();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOrg, setModalOrg] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // org pending inline confirmation
  const [copiedCode, setCopiedCode] = useState(null);

  async function load() {
    setLoading(true);
    const { data } = await getAllOrganizations();
    setOrgs(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function handleNew() { setModalOrg({}); setModalOpen(true); }
  function handleEdit(org) { setModalOrg(org); setModalOpen(true); }

  async function handleDelete(org) {
    setConfirmDelete(null);
    setDeleting(org.id);
    await deleteOrganization(org.id);
    await load();
    setDeleting(null);
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  const q = search.toLowerCase();
  const filtered = orgs.filter(o =>
    o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q) || (o.industry || '').toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.organizations')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('admin.orgsPage.registered', { count: orgs.length })}</p>
        </div>
        <button onClick={handleNew} className="btn-primary">
          <Plus className="w-4 h-4" />
          {t('admin.orgsPage.newOrg')}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('admin.orgsPage.searchPlaceholder')} className="input-field pl-9" />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <th className="px-4 py-3 text-left">{t('admin.cols.organization')}</th>
                  <th className="px-4 py-3 text-left">{t('admin.cols.code')}</th>
                  <th className="px-4 py-3 text-left">{t('admin.cols.industry')}</th>
                  <th className="px-4 py-3 text-left">{t('admin.cols.contact')}</th>
                  <th className="px-4 py-3 text-left">{t('admin.cols.created')}</th>
                  <th className="px-4 py-3 text-right">{t('admin.cols.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(org => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{org.name}</div>
                          {org.roster_enforced && (
                            <div className="text-xs text-amber-700">{t('admin.orgsPage.rosterBadge')}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="font-mono bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-bold">{org.code}</code>
                        <button onClick={() => copyCode(org.code)} className="text-gray-400 hover:text-gray-600 transition-colors" title={t('admin.orgsPage.copyCode')}>
                          {copiedCode === org.code ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{org.industry || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{org.contact_email || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(org.created_at).toLocaleDateString(i18n.language)}</td>
                    <td className="px-4 py-3 text-right">
                      {confirmDelete === org.id ? (
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <span className="text-red-600">{t('admin.orgsPage.deleteConfirm')}</span>
                          <button onClick={() => handleDelete(org)} className="text-red-600 font-semibold hover:underline">{t('admin.yes')}</button>
                          <button onClick={() => setConfirmDelete(null)} className="text-gray-500 hover:underline">{t('admin.no')}</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(org)} title={t('admin.orgsPage.edit')}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(org.id)} disabled={deleting === org.id} title={t('admin.orgsPage.delete')}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                            {deleting === org.id
                              ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                      <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      {search ? t('admin.orgsPage.noMatch') : t('admin.orgsPage.empty')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <OrgModal
          org={modalOrg}
          onClose={() => { setModalOpen(false); setModalOrg(null); }}
          onSave={() => { setModalOpen(false); setModalOrg(null); load(); }}
        />
      )}
    </div>
  );
}
