import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ClipboardList, Download, Zap, Clock, Calendar, TrendingUp,
  GraduationCap, AlertCircle, ArrowLeft, Users
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getAllOrganizations, getAssessmentsByOrg, getResponsesForAssessments, getTrainingCatalog,
} from '../../lib/supabase';
import { buildWorkPlan, PHASE_ORDER } from '../../lib/workplan';
import { mergeCatalog } from '../../lib/trainingCatalog';
import { useSettings } from '../../lib/settings';
import { loadLogoDataUrl, drawLogo } from '../../lib/pdf/logo';
import clsx from 'clsx';

const PHASE_META = {
  immediate: { icon: Zap, color: 'red', labelKey: 'admin.workplan.phase.immediate' },
  '30days': { icon: Clock, color: 'orange', labelKey: 'admin.workplan.phase.thirty' },
  '90days': { icon: Calendar, color: 'yellow', labelKey: 'admin.workplan.phase.ninety' },
  longterm: { icon: TrendingUp, color: 'green', labelKey: 'admin.workplan.phase.longterm' },
};

const COLOR_CLS = {
  red: 'border-red-300 bg-red-50', orange: 'border-orange-300 bg-orange-50',
  yellow: 'border-yellow-300 bg-yellow-50', green: 'border-green-300 bg-green-50',
};

export default function AdminWorkPlan() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const orgId = searchParams.get('org') || '';

  const [orgs, setOrgs] = useState([]);
  const [org, setOrg] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [responses, setResponses] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const branding = useSettings();

  useEffect(() => {
    getAllOrganizations().then(({ data }) => {
      setOrgs(data || []);
      if (!orgId && data && data.length) setSearchParams({ org: data[0].id });
    });
  }, []);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    (async () => {
      const [{ data: asmData }, { data: catData }] = await Promise.all([
        getAssessmentsByOrg(orgId),
        getTrainingCatalog(),
      ]);
      const completed = (asmData || []).filter(a => a.status === 'completed');
      const { data: respData } = await getResponsesForAssessments(completed.map(a => a.id));
      setAssessments(asmData || []);
      setResponses(respData || []);
      setOverrides(catData || []);
      setLoading(false);
    })();
  }, [orgId]);

  useEffect(() => {
    setOrg(orgs.find(o => o.id === orgId) || null);
  }, [orgs, orgId]);

  const plan = useMemo(() => buildWorkPlan(assessments, responses), [assessments, responses]);
  const catalog = useMemo(() => mergeCatalog(overrides), [overrides]);
  const trainingFocus = useMemo(
    () => plan.controlFocus.slice(0, 5).map(c => ({ ...c, entry: catalog[c.controlNumber] })),
    [plan, catalog]
  );

  async function handleExport() {
    setExporting(true);
    setExportError('');
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();

      doc.setFillColor(13, 74, 74);
      doc.rect(0, 0, pageW, 30, 'F');
      drawLogo(doc, await loadLogoDataUrl(branding.logoUrl), { pageW, top: 8 });
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18); doc.setFont('helvetica', 'bold');
      doc.text(t('admin.workplan.title'), 15, 15);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.text(`${org?.name || ''} — ${new Date().toLocaleDateString(i18n.language)}`, 15, 23);

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(9);
      doc.text(`${t('admin.workplan.basedOn', { count: plan.stats.assessorCount })} · ${t('admin.workplan.safeguardsAnalyzed', { count: plan.stats.safeguardsAssessed })}`, 15, 40);

      let startY = 46;
      for (const phase of PHASE_ORDER) {
        const items = plan.phases[phase];
        if (!items.length) continue;
        doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        doc.text(t(PHASE_META[phase].labelKey), 15, startY);
        autoTable(doc, {
          startY: startY + 3,
          head: [[t('admin.workplan.pdf.safeguard'), t('admin.workplan.pdf.title'), t('admin.workplan.pdf.affected'), t('admin.workplan.pdf.action')]],
          body: items.map(it => [it.safeguardId, it.title, `${it.affected}/${it.total}`, it.action]),
          headStyles: { fillColor: [13, 74, 74], textColor: 255 },
          styles: { fontSize: 7, cellWidth: 'wrap' },
          columnStyles: { 1: { cellWidth: 45 }, 3: { cellWidth: 80 } },
          margin: { left: 15, right: 15 },
        });
        startY = doc.lastAutoTable.finalY + 8;
        if (startY > 260) { doc.addPage(); startY = 20; }
      }

      // Training focus
      if (trainingFocus.length) {
        if (startY > 240) { doc.addPage(); startY = 20; }
        doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        doc.text(t('admin.workplan.trainingFocus'), 15, startY);
        autoTable(doc, {
          startY: startY + 3,
          head: [[t('admin.workplan.pdf.control'), t('admin.workplan.pdf.exposure'), t('admin.workplan.pdf.training')]],
          body: trainingFocus.map(c => [
            `C${c.controlNumber}: ${c.name}`,
            `${c.exposure}%`,
            c.entry ? `${c.entry.title} — ${(c.entry.topics || []).map(tp => tp.topic).join('; ')}` : '',
          ]),
          headStyles: { fillColor: [13, 74, 74], textColor: 255 },
          styles: { fontSize: 7 },
          columnStyles: { 2: { cellWidth: 90 } },
          margin: { left: 15, right: 15 },
        });
      }

      doc.save(`WorkPlan-${org?.code || 'org'}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Work plan PDF error:', err);
      setExportError(t('admin.workplan.pdf.failed'));
    } finally {
      setExporting(false);
    }
  }

  const hasData = plan.stats.assessorCount > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={() => navigate('/admin/assessments')} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3 h-3" /> {t('admin.workplan.back')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary-600" />
            {t('admin.workplan.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t('admin.workplan.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={orgId} onChange={e => setSearchParams({ org: e.target.value })} className="input-field w-auto">
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name} ({o.code})</option>)}
          </select>
          {hasData && (
            <button onClick={handleExport} disabled={exporting} className="btn-primary text-sm">
              {exporting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Download className="w-4 h-4" />}
              {t('admin.workplan.exportPdf')}
            </button>
          )}
        </div>
      </div>

      {exportError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {exportError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : !hasData ? (
        <div className="card p-10 text-center text-gray-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          {t('admin.workplan.noData')}
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="card p-4 flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-primary-500" />
              {t('admin.workplan.basedOn', { count: plan.stats.assessorCount })}
            </div>
            <div className="text-sm text-gray-600">{t('admin.workplan.safeguardsAnalyzed', { count: plan.stats.safeguardsAssessed })}</div>
          </div>

          {/* Phases */}
          {PHASE_ORDER.map(phase => {
            const items = plan.phases[phase];
            if (!items.length) return null;
            const meta = PHASE_META[phase];
            const Icon = meta.icon;
            return (
              <div key={phase} className={clsx('rounded-xl border-2 overflow-hidden', COLOR_CLS[meta.color])}>
                <div className="px-4 py-3 flex items-center gap-2 font-semibold text-gray-800">
                  <Icon className="w-5 h-5" />
                  {t(meta.labelKey)}
                  <span className="text-sm font-normal text-gray-500">({items.length})</span>
                </div>
                <div className="bg-white divide-y">
                  {items.map(it => (
                    <div key={it.safeguardId} className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-gray-500">{it.safeguardId}</span>
                        <span className="font-medium text-gray-800 text-sm">{it.title}</span>
                        <span className="text-xs text-gray-400">{it.controlName}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          {t('admin.workplan.affected', { affected: it.affected, total: it.total })} · {it.avgExposure}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{it.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Training focus */}
          {trainingFocus.length > 0 && (
            <div className="card">
              <div className="card-header font-semibold text-gray-800 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> {t('admin.workplan.trainingFocus')}
              </div>
              <div className="card-body space-y-3">
                {trainingFocus.map(c => (
                  <div key={c.controlNumber} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">C{c.controlNumber}</span>
                      <span className="font-medium text-gray-800 text-sm">{c.entry?.title || c.name}</span>
                      <span className="ml-auto text-xs text-gray-400">{c.exposure}% {t('admin.workplan.exposure')}</span>
                    </div>
                    {c.entry?.summary && <p className="text-sm text-gray-600 mt-1">{c.entry.summary}</p>}
                    {c.entry?.topics?.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {c.entry.topics.map((tp, i) => (
                          <li key={i} className="text-xs text-gray-600">
                            <span className="font-medium text-gray-700">{tp.topic}</span>
                            {tp.objective ? ` — ${tp.objective}` : ''}
                            {(tp.resources || []).map((r, j) => r.url ? (
                              <a key={j} href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline ml-1">[{r.label}]</a>
                            ) : null)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
