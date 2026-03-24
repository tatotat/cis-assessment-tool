import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, ClipboardList, CheckCircle, TrendingUp,
  Clock, AlertTriangle, ArrowRight
} from 'lucide-react';
import { getAllOrganizations, getAllAssessments } from '../../lib/supabase';
import clsx from 'clsx';

function StatCard({ icon: Icon, label, value, sub, color, link }) {
  const content = (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className={clsx('text-3xl font-black mb-1', color)}>{value}</div>
          <div className="text-sm font-medium text-gray-700">{label}</div>
          {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        </div>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', color.replace('text-', 'bg-').replace('800', '100').replace('700', '100'))}>
          <Icon className={clsx('w-5 h-5', color)} />
        </div>
      </div>
    </div>
  );
  if (link) return <Link to={link}>{content}</Link>;
  return content;
}

function RiskBadge({ level }) {
  const map = {
    acceptable: 'badge-green',
    low: 'badge-green',
    moderate: 'badge-yellow',
    elevated: 'badge-red',
    critical: 'badge-red',
  };
  return <span className={clsx('badge', map[level] || 'badge-gray')}>{level}</span>;
}

function StatusBadge({ status }) {
  const map = {
    completed: 'badge-green',
    in_progress: 'badge-blue',
    screening: 'badge-yellow',
  };
  return <span className={clsx('badge capitalize', map[status] || 'badge-gray')}>{status?.replace('_', ' ')}</span>;
}

export default function Dashboard() {
  const [orgs, setOrgs] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: orgsData }, { data: assmData }] = await Promise.all([
        getAllOrganizations(),
        getAllAssessments(),
      ]);
      setOrgs(orgsData || []);
      setAssessments(assmData || []);
      setLoading(false);
    }
    load();
  }, []);

  const completed = assessments.filter(a => a.status === 'completed');
  const inProgress = assessments.filter(a => a.status === 'in_progress');
  const avgORI = completed.length > 0
    ? (completed.reduce((sum, a) => sum + (a.organizational_risk_index || 0), 0) / completed.length).toFixed(1)
    : 'N/A';

  const recent = [...assessments].slice(0, 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">CIS RAM v2.1 Assessment Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Organizations"
          value={orgs.length}
          color="text-blue-800"
          link="/admin/organizations"
        />
        <StatCard
          icon={ClipboardList}
          label="Total Assessments"
          value={assessments.length}
          color="text-purple-800"
          link="/admin/assessments"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={completed.length}
          sub={`${inProgress.length} in progress`}
          color="text-green-700"
          link="/admin/assessments"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg ORI"
          value={avgORI}
          sub="Lower is better"
          color="text-orange-700"
        />
      </div>

      {/* Recent Assessments */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recent Assessments</h2>
          <Link to="/admin/assessments" className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 text-left">Organization</th>
                <th className="px-4 py-3 text-left">Assessor</th>
                <th className="px-4 py-3 text-center">IG</th>
                <th className="px-4 py-3 text-center">ORI</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Progress</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {a.organizations?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">{a.organizations?.code}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{a.assessor_email}</td>
                  <td className="px-4 py-3 text-center">
                    {a.implementation_group && (
                      <span className="badge badge-blue">IG{a.implementation_group}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-bold">
                    {a.organizational_risk_index !== null && a.organizational_risk_index !== undefined
                      ? a.organizational_risk_index.toFixed(1)
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    {a.completed_safeguards || 0}/{a.total_safeguards || '?'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No assessments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/organizations" className="card p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <div className="font-semibold text-gray-800 group-hover:text-primary-700">Manage Organizations</div>
              <div className="text-sm text-gray-500">Add, edit, or remove organizations</div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-primary-600" />
          </div>
        </Link>
        <Link to="/admin/assessments" className="card p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <div className="font-semibold text-gray-800 group-hover:text-primary-700">View Assessments</div>
              <div className="text-sm text-gray-500">Browse and filter all assessments</div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-primary-600" />
          </div>
        </Link>
      </div>
    </div>
  );
}
