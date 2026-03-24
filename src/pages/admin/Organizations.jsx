import React, { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, X, Check, AlertCircle, Building2,
  Copy, RefreshCw, Search
} from 'lucide-react';
import {
  getAllOrganizations, createOrganization, updateOrganization, deleteOrganization,
  getAssessmentsByOrg
} from '../../lib/supabase';
import clsx from 'clsx';

function generateCode(name) {
  const words = name.toUpperCase().replace(/[^A-Z0-9 ]/g, '').split(' ').filter(Boolean);
  if (words.length >= 2) {
    return (words[0].slice(0, 3) + words[1].slice(0, 3)).toUpperCase() + Math.floor(Math.random() * 900 + 100);
  }
  return (words[0] || 'ORG').slice(0, 5).toUpperCase() + Math.floor(Math.random() * 900 + 100);
}

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance & Banking', 'Government', 'Education',
  'Manufacturing', 'Retail', 'Energy & Utilities', 'Transportation', 'Legal',
  'Non-Profit', 'Defense & Military', 'Other'
];

function OrgModal({ org, onClose, onSave }) {
  const [form, setForm] = useState({
    name: org?.name || '',
    code: org?.code || '',
    industry: org?.industry || '',
    contact_email: org?.contact_email || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function generateNewCode() {
    if (form.name) {
      setForm(f => ({ ...f, code: generateCode(f.name) }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Organization name is required.'); return; }
    if (!form.code.trim()) { setError('Organization code is required.'); return; }
    if (!/^[A-Z0-9]{4,20}$/.test(form.code.toUpperCase())) {
      setError('Code must be 4–20 alphanumeric characters (no spaces).');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.toUpperCase().trim(),
        industry: form.industry || null,
        contact_email: form.contact_email || null,
      };
      if (org?.id) {
        const { error: err } = await updateOrganization(org.id, payload);
        if (err) throw err;
      } else {
        const { error: err } = await createOrganization(payload);
        if (err) throw err;
      }
      onSave();
    } catch (err) {
      setError(err.message || 'Failed to save. The organization code may already be in use.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {org?.id ? 'Edit Organization' : 'New Organization'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="label">Organization Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="Acme Corporation"
              required
            />
          </div>

          <div>
            <label className="label">Organization Code *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="input-field font-mono uppercase flex-1"
                placeholder="ACME001"
                maxLength={20}
                required
              />
              <button
                type="button"
                onClick={generateNewCode}
                title="Auto-generate code"
                className="btn-secondary px-3 flex-shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">4–20 alphanumeric characters, shared with assessors</p>
          </div>

          <div>
            <label className="label">Industry</label>
            <select
              value={form.industry}
              onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
              className="input-field"
            >
              <option value="">Select industry...</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Contact Email</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
              className="input-field"
              placeholder="contact@organization.com"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving...</>
              ) : (
                <><Check className="w-4 h-4" /> {org?.id ? 'Update' : 'Create'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Organizations() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOrg, setModalOrg] = useState(null); // null=closed, {}=new, org=edit
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  async function load() {
    setLoading(true);
    const { data } = await getAllOrganizations();
    setOrgs(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function handleNew() {
    setModalOrg({});
    setModalOpen(true);
  }

  function handleEdit(org) {
    setModalOrg(org);
    setModalOpen(true);
  }

  async function handleDelete(org) {
    if (!window.confirm(`Delete "${org.name}"? This will also delete all associated assessments.`)) return;
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

  const filtered = orgs.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.code.toLowerCase().includes(search.toLowerCase()) ||
    (o.industry || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-sm text-gray-500 mt-1">{orgs.length} organizations registered</p>
        </div>
        <button onClick={handleNew} className="btn-primary">
          <Plus className="w-4 h-4" />
          New Organization
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, code, or industry..."
          className="input-field pl-9"
        />
      </div>

      {/* Table */}
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
                  <th className="px-4 py-3 text-left">Organization</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Industry</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
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
                        <div className="font-medium text-gray-800">{org.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="font-mono bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-bold">
                          {org.code}
                        </code>
                        <button
                          onClick={() => copyCode(org.code)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy code"
                        >
                          {copiedCode === org.code
                            ? <Check className="w-3.5 h-3.5 text-green-500" />
                            : <Copy className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{org.industry || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{org.contact_email || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(org)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(org)}
                          disabled={deleting === org.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === org.id
                            ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                      <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      {search ? 'No organizations match your search.' : 'No organizations yet. Create one to get started.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
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
