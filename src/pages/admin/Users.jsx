import React, { useEffect, useState } from 'react';
import {
  Users, UserPlus, Trash2, Building2, Shield, User,
  CheckCircle, AlertCircle, Search, Mail
} from 'lucide-react';
import { getAllUsers, createUser, updateUser, deleteUser, getAllOrganizations } from '../../lib/supabase';
import clsx from 'clsx';

function RoleBadge({ role }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
        <Shield className="w-3 h-3" />
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
      <User className="w-3 h-3" />
      Assessor
    </span>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteOrgId, setInviteOrgId] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function load() {
    const [{ data: usersData }, { data: orgsData }] = await Promise.all([
      getAllUsers(),
      getAllOrganizations(),
    ]);
    setUsers(usersData || []);
    setOrgs(orgsData || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleInvite(e) {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    if (!inviteEmail || !inviteOrgId) {
      setInviteError('Email and organization are required.');
      return;
    }
    setInviting(true);
    const { data, error } = await createUser(inviteEmail, inviteOrgId, inviteRole);
    setInviting(false);
    if (error) {
      setInviteError(error.message);
    } else {
      setInviteSuccess(`User ${inviteEmail} has been added successfully.`);
      setInviteEmail('');
      setInviteOrgId('');
      setInviteRole('user');
      await load();
      setTimeout(() => {
        setShowInvite(false);
        setInviteSuccess('');
      }, 2000);
    }
  }

  async function handleRoleChange(userId, newRole) {
    await updateUser(userId, { role: newRole });
    await load();
  }

  async function handleOrgChange(userId, newOrgId) {
    await updateUser(userId, { organization_id: newOrgId });
    await load();
  }

  async function handleDelete(userId) {
    await deleteUser(userId);
    setDeleteConfirm(null);
    await load();
  }

  const filtered = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return u.email?.toLowerCase().includes(s) ||
      u.organizations?.name?.toLowerCase().includes(s);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} users in the system</p>
        </div>
        <button
          onClick={() => setShowInvite(o => !o)}
          className="btn-primary"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary-600" />
            <h2 className="font-semibold text-gray-800">Add New User</h2>
          </div>
          <form onSubmit={handleInvite} className="card-body space-y-4">
            <div>
              <label className="label">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="user@organization.com"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">
                <Building2 className="w-4 h-4 inline mr-1" />
                Organization
              </label>
              <select
                value={inviteOrgId}
                onChange={e => setInviteOrgId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select an organization...</option>
                {orgs.map(o => (
                  <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Role</label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="input-field"
              >
                <option value="user">Assessor (can complete assessments)</option>
                <option value="admin">Admin (can view all assessments and admin panel)</option>
              </select>
            </div>

            {inviteError && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {inviteError}
              </div>
            )}
            {inviteSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {inviteSuccess}
              </div>
            )}

            <div className="flex gap-2">
              <button type="submit" disabled={inviting} className="btn-primary">
                {inviting ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Adding...</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Add User</>
                )}
              </button>
              <button type="button" onClick={() => setShowInvite(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by email or organization..."
          className="input-field pl-9"
        />
      </div>

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Organization</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Assessments</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Last Active</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{u.email}</div>
                    <div className="text-xs text-gray-400 font-mono">
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.organization_id || ''}
                      onChange={e => handleOrgChange(u.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1 bg-white text-gray-700"
                    >
                      <option value="">No organization</option>
                      {orgs.map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={u.role || 'user'}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1 bg-white text-gray-700"
                    >
                      <option value="user">Assessor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-gray-700">{u.assessment_count || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.last_assessment_at
                      ? new Date(u.last_assessment_at).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {deleteConfirm === u.id ? (
                      <div className="flex items-center gap-1 justify-center">
                        <span className="text-xs text-red-600">Confirm?</span>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-xs text-red-600 font-semibold hover:underline"
                        >Yes</button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-gray-500 hover:underline"
                        >No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(u.id)}
                        title="Remove user"
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    {search ? 'No users match your search.' : 'No users found. Add one above.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-500">
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </div>
    </div>
  );
}
