import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, ClipboardList, CheckCircle, TrendingUp, ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const map = { completed: 'badge-green', in_progress: 'badge-blue', screening: 'badge-yellow' };
  return <span className={clsx('badge', map[status] || 'badge-gray')}>{t(`admin.assessmentStatus.${status}`, status)}</span>;
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
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
    : t('report.pdf.na');

  const recent = [...assessments].slice(0, 8);
  const fmtDate = d => new Date(d).toLocaleDateString(i18n.language);

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
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboardPage.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('admin.dashboardPage.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label={t('admin.organizations')} value={orgs.length} color="text-blue-800" link="/admin/organizations" />
        <StatCard icon={ClipboardList} label={t('admin.dashboardPage.totalAssessments')} value={assessments.length} color="text-purple-800" link="/admin/assessments" />
        <StatCard icon={CheckCircle} label={t('admin.assessmentStatus.completed')} value={completed.length}
          sub={t('admin.dashboardPage.inProgressSub', { count: inProgress.length })} color="text-green-700" link="/admin/assessments" />
        <StatCard icon={TrendingUp} label={t('admin.dashboardPage.avgOri')} value={avgORI} sub={t('admin.dashboardPage.lowerIsBetter')} color="text-orange-700" />
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">{t('admin.dashboardPage.recent')}</h2>
          <Link to="/admin/assessments" className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
            {t('admin.dashboardPage.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 text-left">{t('admin.cols.organization')}</th>
                <th className="px-4 py-3 text-left">{t('admin.cols.assessor')}</th>
                <th className="px-4 py-3 text-center">IG</th>
                <th className="px-4 py-3 text-center">ORI</th>
                <th className="px-4 py-3 text-center">{t('admin.cols.status')}</th>
                <th className="px-4 py-3 text-center">{t('admin.cols.progress')}</th>
                <th className="px-4 py-3 text-left">{t('admin.cols.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{a.organizations?.name || t('admin.unknownOrg')}</div>
                    <div className="text-xs text-gray-400 font-mono">{a.organizations?.code}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{a.assessor_email}</td>
                  <td className="px-4 py-3 text-center">
                    {a.implementation_group && <span className="badge badge-blue">IG{a.implementation_group}</span>}
                  </td>
                  <td className="px-4 py-3 text-center font-bold">
                    {a.organizational_risk_index !== null && a.organizational_risk_index !== undefined
                      ? a.organizational_risk_index.toFixed(1) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    {a.completed_safeguards || 0}/{a.total_safeguards || '?'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(a.created_at)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">{t('admin.dashboardPage.empty')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/organizations" className="card p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <div className="font-semibold text-gray-800 group-hover:text-primary-700">{t('admin.dashboardPage.manageOrgs')}</div>
              <div className="text-sm text-gray-500">{t('admin.dashboardPage.manageOrgsDesc')}</div>
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
              <div className="font-semibold text-gray-800 group-hover:text-primary-700">{t('admin.dashboardPage.viewAssessments')}</div>
              <div className="text-sm text-gray-500">{t('admin.dashboardPage.viewAssessmentsDesc')}</div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-primary-600" />
          </div>
        </Link>
      </div>
    </div>
  );
}
