import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download, RefreshCw, AlertTriangle, CheckCircle, AlertCircle,
  TrendingDown, Shield, Building2, Calendar, User, Hash,
  ChevronDown, ChevronUp, Filter, Search
} from 'lucide-react';
import useAssessmentStore from '../stores/assessmentStore';
import {
  calculateORI, getRiskSummary, getImmediateActions, getRecommendations,
  getControlScores, getORILevel, getORIDescription, getRiskLevel
} from '../lib/calculations';
import { SAFEGUARDS, CONTROL_NAMES } from '../lib/safeguards';
import { getRecommendation } from '../lib/recommendations';
import { getSettings } from '../lib/settings';
import RiskGauge from '../components/report/RiskGauge';
import ControlScores from '../components/report/ControlScores';
import RecommendationsPanel from '../components/report/RecommendationsPanel';
import clsx from 'clsx';

function SafeguardStatusList({ safeguards, responses, ig, getComplianceStatus, STATUS_META, filter, search }) {
  const [expanded, setExpanded] = useState({});

  const filtered = useMemo(() => {
    return safeguards
      .map(s => {
        const r = responses[s.id] || null;
        const status = getComplianceStatus(r?.risk_score, ig);
        return { safeguard: s, response: r, status };
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
      .sort((a, b) => {
        const order = { critical: 0, 'non-compliant': 1, 'needs-improvement': 2, 'not-assessed': 3, compliant: 4 };
        return (order[a.status] ?? 5) - (order[b.status] ?? 5);
      });
  }, [safeguards, responses, ig, filter, search]);

  if (filtered.length === 0) {
    return <div className="text-center py-10 text-gray-400 text-sm">No safeguards match the current filter.</div>;
  }

  return (
    <div className="space-y-2">
      {filtered.map(({ safeguard: s, response: r, status }) => {
        const meta = STATUS_META[status];
        const isOpen = !!expanded[s.id];
        const riskScore = r?.risk_score;
        const maxScore = ig === 1 ? 9 : 25;
        const riskPct = riskScore != null ? Math.round((riskScore / maxScore) * 100) : 0;

        return (
          <div key={s.id} className={clsx('rounded-xl border overflow-hidden transition-all', meta.color.includes('green') ? 'border-green-200' : meta.color.includes('yellow') ? 'border-yellow-200' : meta.color.includes('orange') ? 'border-orange-200' : meta.color.includes('red') ? 'border-red-200' : 'border-gray-200')}>
            <button
              type="button"
              onClick={() => setExpanded(e => ({ ...e, [s.id]: !e[s.id] }))}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              {/* Status dot */}
              <span className={clsx('w-3 h-3 rounded-full flex-shrink-0 mt-0.5', meta.dot)} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-gray-500">{s.id}</span>
                  <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border', meta.color)}>
                    {meta.label}
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
                    <div className="text-xs text-gray-400">risk score</div>
                  </div>
                )}
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 space-y-3">

                {/* Status meaning */}
                <div className={clsx('rounded-lg border px-3 py-2 text-sm', meta.color)}>
                  <strong>Status: {meta.label}</strong> — {meta.description}
                </div>

                {/* Safeguard description */}
                {s.description && (
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">What this covers: </span>{s.description}
                  </div>
                )}
                {s.whyItMatters && (
                  <div className="text-sm text-gray-600 italic">
                    <span className="font-semibold not-italic">Why it matters: </span>{s.whyItMatters}
                  </div>
                )}

                {/* Risk score bar */}
                {riskScore != null && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Risk exposure</span>
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

                {/* Score details */}
                {r && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="text-gray-400 mb-0.5">{ig === 1 ? 'Implementation level' : 'Incident likelihood'}</div>
                      <div className="font-bold text-gray-700">{ig === 1 ? r.maturity_score : r.expectancy_score} / {ig === 1 ? 5 : 5}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="text-gray-400 mb-0.5">Mission impact</div>
                      <div className="font-bold text-gray-700">{r.impact_mission ?? '—'} / {ig === 1 ? 3 : 5}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="text-gray-400 mb-0.5">Operational impact</div>
                      <div className="font-bold text-gray-700">{r.impact_operational ?? '—'} / {ig === 1 ? 3 : 5}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="text-gray-400 mb-0.5">Obligations impact</div>
                      <div className="font-bold text-gray-700">{r.impact_obligations ?? '—'} / {ig === 1 ? 3 : 5}</div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {r?.notes && (
                  <div className="text-xs text-gray-600 bg-white rounded-lg p-2 border border-gray-200">
                    <span className="font-semibold">Assessor notes: </span>{r.notes}
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
  const navigate = useNavigate();
  const {
    sessionId, organization, assessorEmail, assessorName,
    implementationGroup, responses, safeguards, screeningAnswers,
    igScore, status, reset
  } = useAssessmentStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusSearch, setStatusSearch] = useState('');

  const branding = useMemo(() => getSettings(), []);

  // Map risk level to compliance status label
  function getComplianceStatus(riskScore, igLevel) {
    if (riskScore === null || riskScore === undefined) return 'not-assessed';
    const level = getRiskLevel(riskScore, igLevel);
    const maxScore = igLevel === 1 ? 9 : 25;
    if (level === 'acceptable') return 'compliant';
    if (level === 'unacceptable') return 'needs-improvement';
    if (riskScore >= maxScore) return 'critical';
    return 'non-compliant';
  }

  const STATUS_META = {
    'compliant':        { label: 'Compliant',              color: 'bg-green-100 text-green-800 border-green-300',  dot: 'bg-green-500',  description: 'This safeguard is implemented at an acceptable level. Continue maintaining current practices.' },
    'needs-improvement':{ label: 'Needs Improvement',      color: 'bg-yellow-100 text-yellow-800 border-yellow-300', dot: 'bg-yellow-500', description: 'Risk is above acceptable levels. Improvement is needed within 90 days to reduce exposure.' },
    'non-compliant':    { label: 'Non-Compliant',           color: 'bg-orange-100 text-orange-800 border-orange-300', dot: 'bg-orange-500', description: 'This safeguard has high risk. Significant gaps exist that could be exploited. Address within 30 days.' },
    'critical':         { label: 'Critical — Act Now',      color: 'bg-red-100 text-red-800 border-red-300',       dot: 'bg-red-600',    description: 'Maximum risk score. This is the most severe finding. Immediate remediation is required — within 7 days.' },
    'not-assessed':     { label: 'Not Assessed',            color: 'bg-gray-100 text-gray-600 border-gray-300',    dot: 'bg-gray-400',   description: 'This safeguard was not scored during the assessment.' },
  };

  useEffect(() => {
    if (!sessionId) navigate('/');
  }, [sessionId]);

  const ig = implementationGroup || 1;
  const allResponses = Object.values(responses);
  const scoredResponses = allResponses.filter(r => r.risk_score !== null && r.risk_score !== undefined);
  const ori = calculateORI(scoredResponses, ig);
  const summary = getRiskSummary(scoredResponses, ig);
  const immediateActions = getImmediateActions(scoredResponses, ig);
  const recommendations = getRecommendations(scoredResponses, ig);
  const controlScores = getControlScores(scoredResponses, ig);
  const completionPct = safeguards.length > 0 ? Math.round((scoredResponses.length / safeguards.length) * 100) : 0;
  const assessmentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  async function handlePDFExport() {
    setPdfGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      // ---- COVER PAGE ----
      // Dark header band
      doc.setFillColor(13, 74, 74);
      doc.rect(0, 0, pageW, 60, 'F');

      // Try to embed branding logo (if URL is an image we can load)
      const logoUrl = branding.logoUrl;
      if (logoUrl) {
        try {
          // Load image via canvas to get base64
          await new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                const imgH = 14;
                const imgW = (img.width / img.height) * imgH;
                doc.addImage(dataUrl, 'PNG', pageW - imgW - 15, 4, imgW, imgH);
              } catch (_) { /* cross-origin, skip */ }
              resolve();
            };
            img.onerror = () => resolve();
            img.src = logoUrl;
          });
        } catch (_) { /* skip logo if unavailable */ }
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('CIS RAM v2.1', 20, 28);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Risk Assessment Report', 20, 40);
      doc.setFontSize(10);
      doc.setTextColor(180, 220, 220);
      doc.text('CIS Controls Risk Assessment Method', 20, 52);

      // Organization info
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(organization?.name || 'Organization', 20, 82);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`Assessment Date: ${assessmentDate}`, 20, 92);
      doc.text(`Assessor: ${assessorName || assessorEmail || 'N/A'}`, 20, 100);
      doc.text(`Implementation Group: IG${ig}`, 20, 108);
      doc.text(`Session ID: ${sessionId || 'N/A'}`, 20, 116);
      doc.text(`Safeguards Assessed: ${scoredResponses.length} / ${safeguards.length}`, 20, 124);

      // ORI box
      const oriLevelColors = {
        low: [34, 197, 94],
        moderate: [234, 179, 8],
        elevated: [249, 115, 22],
        critical: [239, 68, 68],
        unknown: [156, 163, 175],
      };
      const oriLevel = getORILevel(ori);
      const [r2, g2, b2] = oriLevelColors[oriLevel] || [156, 163, 175];
      doc.setFillColor(r2, g2, b2);
      doc.roundedRect(20, 140, 80, 40, 4, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text(ori !== null ? ori.toFixed(1) : '--', 35, 162);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Organizational Risk Index', 24, 173);

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(9);
      doc.text('ORI Range: 0 (best) to 100 (worst)', 20, 192);
      doc.text(getORIDescription(ori), 20, 200, { maxWidth: pageW - 40 });

      // ---- EXECUTIVE SUMMARY PAGE ----
      doc.addPage();
      doc.setFillColor(13, 74, 74);
      doc.rect(0, 0, pageW, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('EXECUTIVE SUMMARY', 20, 10);

      let y = 28;
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const summaryLines = [
        `This report presents the results of a CIS RAM v2.1 risk assessment conducted for ${organization?.name || 'the organization'} on ${assessmentDate}.`,
        `The assessment was performed against CIS Controls v8.1 Implementation Group ${ig} (IG${ig}), covering ${scoredResponses.length} of ${safeguards.length} applicable safeguards.`,
        `The Organizational Risk Index (ORI) is ${ori !== null ? ori.toFixed(1) : 'N/A'} out of 100, indicating a ${oriLevel?.toUpperCase()} risk posture.`,
      ];
      summaryLines.forEach(line => {
        const split = doc.splitTextToSize(line, pageW - 40);
        doc.text(split, 20, y);
        y += split.length * 6 + 4;
      });

      // Risk summary table
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.text('Risk Distribution', 20, y);
      y += 6;

      autoTable(doc, {
        startY: y,
        head: [['Risk Level', 'Count', 'Percentage']],
        body: [
          ['Acceptable', summary.acceptable, `${summary.total > 0 ? Math.round((summary.acceptable / summary.total) * 100) : 0}%`],
          ['Unacceptable', summary.unacceptable, `${summary.total > 0 ? Math.round((summary.unacceptable / summary.total) * 100) : 0}%`],
          ['High Risk', summary.high, `${summary.total > 0 ? Math.round((summary.high / summary.total) * 100) : 0}%`],
          ['Not Scored', summary.notScored, `${summary.total > 0 ? Math.round((summary.notScored / summary.total) * 100) : 0}%`],
          ['Total', summary.total, '100%'],
        ],
        headStyles: { fillColor: [13, 74, 74], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 250] },
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 },
      });

      y = doc.lastAutoTable.finalY + 12;

      // ---- CONTROL SCORES ----
      if (y > pageH - 60) { doc.addPage(); y = 24; }
      doc.setFillColor(13, 74, 74);
      doc.rect(0, 0, pageW, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTROL SCORES', 20, 10);
      y = 24;

      autoTable(doc, {
        startY: y,
        head: [['Control', 'Name', 'Avg Score', 'Max Score', 'Safeguards', 'Level']],
        body: controlScores.map(c => [
          `C${c.control}`,
          c.name.length > 35 ? c.name.slice(0, 35) + '…' : c.name,
          c.avgScore,
          c.maxScore,
          c.count,
          c.avgScore < (ig === 1 ? 6 : 9) ? 'Acceptable' :
          c.avgScore < (ig === 1 ? 9 : 16) ? 'Unacceptable' : 'High Risk',
        ]),
        headStyles: { fillColor: [13, 74, 74], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 250] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 12 },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
        },
        margin: { left: 20, right: 20 },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 5) {
            if (data.cell.raw === 'High Risk') data.cell.styles.textColor = [239, 68, 68];
            else if (data.cell.raw === 'Unacceptable') data.cell.styles.textColor = [202, 138, 4];
            else data.cell.styles.textColor = [22, 163, 74];
          }
        },
      });

      // ---- IMMEDIATE ACTIONS ----
      if (immediateActions.length > 0) {
        doc.addPage();
        doc.setFillColor(239, 68, 68);
        doc.rect(0, 0, pageW, 14, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('IMMEDIATE ACTIONS REQUIRED', 20, 10);

        autoTable(doc, {
          startY: 24,
          head: [['Safeguard', 'Title', 'Asset Class', 'Risk Score', 'Expectancy', 'Max Impact']],
          body: immediateActions.slice(0, 20).map(r => [
            r.safeguard_id,
            (r.title || r.safeguard_id).length > 30 ? (r.title || r.safeguard_id).slice(0, 30) + '…' : (r.title || r.safeguard_id),
            r.asset_class,
            r.risk_score,
            ig === 1 ? r.expectancy_score : r.expectancy_score,
            Math.max(r.impact_mission || 0, r.impact_operational || 0, r.impact_obligations || 0, r.impact_financial || 0),
          ]),
          headStyles: { fillColor: [239, 68, 68], textColor: 255 },
          alternateRowStyles: { fillColor: [255, 245, 245] },
          styles: { fontSize: 8 },
          margin: { left: 20, right: 20 },
        });
      }

      // ---- RECOMMENDATIONS ----
      const actionItems = scoredResponses.filter(r => {
        const level = getRiskLevel(r.risk_score, ig);
        return level === 'high' || level === 'unacceptable';
      }).sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));

      if (actionItems.length > 0) {
        doc.addPage();
        doc.setFillColor(202, 138, 4);
        doc.rect(0, 0, pageW, 14, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('RECOMMENDATIONS', 20, 10);

        let ry = 24;
        doc.setTextColor(30, 30, 30);

        for (const r of actionItems.slice(0, 25)) {
          const level = getRiskLevel(r.risk_score, ig);
          const safeguard = SAFEGUARDS.find(s => s.id === r.safeguard_id);
          const recs = getRecommendation(r.safeguard_id);
          const recText = level === 'high' ? recs.immediate : recs.shortTerm;
          const recLabel = level === 'high' ? 'Do now' : 'Do within 90 days';

          if (ry > pageH - 60) {
            doc.addPage();
            ry = 20;
          }

          // Safeguard header
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          const titleText = `${r.safeguard_id} — ${(safeguard?.friendlyTitle || safeguard?.title || r.safeguard_id).slice(0, 60)} [Risk: ${r.risk_score}, ${level.toUpperCase()}]`;
          doc.text(titleText, 20, ry);
          ry += 5;

          // Description
          if (safeguard?.description) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(80, 80, 80);
            const descLines = doc.splitTextToSize(safeguard.description, pageW - 40);
            doc.text(descLines, 20, ry);
            ry += descLines.length * 4 + 2;
          }

          // Recommendation
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(level === 'high' ? 180 : 140, level === 'high' ? 30 : 100, 0);
          doc.text(recLabel + ':', 20, ry);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 30, 30);
          const recLines = doc.splitTextToSize(recText, pageW - 40);
          doc.text(recLines, 20, ry + 4);
          ry += recLines.length * 4 + 10;
        }
      }

      // ---- ALL SAFEGUARDS STATUS ----
      doc.addPage();
      doc.setFillColor(13, 74, 74);
      doc.rect(0, 0, pageW, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('SAFEGUARD STATUS — FULL ASSESSMENT RESULTS', 20, 10);

      // Build full list: scored + not-scored safeguards from this IG
      const safeguardRows = safeguards.map(s => {
        const r = scoredResponses.find(x => x.safeguard_id === s.id);
        const riskScore = r?.risk_score ?? null;
        const level = riskScore != null ? getRiskLevel(riskScore, ig) : null;
        const maxScore = ig === 1 ? 9 : 25;
        let statusLabel;
        if (riskScore == null) statusLabel = 'Not Assessed';
        else if (level === 'acceptable') statusLabel = 'Compliant';
        else if (level === 'unacceptable') statusLabel = 'Needs Improvement';
        else if (riskScore >= maxScore) statusLabel = 'CRITICAL';
        else statusLabel = 'Non-Compliant';
        return [
          s.id,
          (s.friendlyTitle || s.title).slice(0, 40),
          s.assetClass,
          riskScore ?? '—',
          `${riskScore != null ? Math.round((riskScore / maxScore) * 100) : 0}%`,
          statusLabel,
        ];
      });

      autoTable(doc, {
        startY: 24,
        head: [['ID', 'Safeguard', 'Asset', 'Score', 'Exposure', 'Status']],
        body: safeguardRows,
        headStyles: { fillColor: [13, 74, 74], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 250] },
        styles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 10, fontStyle: 'bold' },
          1: { cellWidth: 70 },
          2: { cellWidth: 20 },
          3: { cellWidth: 12, halign: 'center' },
          4: { cellWidth: 18, halign: 'center' },
          5: { cellWidth: 28, halign: 'center' },
        },
        margin: { left: 20, right: 20 },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 5) {
            const v = data.cell.raw;
            if (v === 'CRITICAL')          { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.fontStyle = 'bold'; }
            else if (v === 'Non-Compliant'){ data.cell.styles.textColor = [234, 88, 12]; }
            else if (v === 'Needs Improvement') { data.cell.styles.textColor = [161, 98, 7]; }
            else if (v === 'Compliant')    { data.cell.styles.textColor = [22, 163, 74]; }
            else                            { data.cell.styles.textColor = [107, 114, 128]; }
          }
        },
      });

      // Page numbers
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pages} | CIS RAM v2.1 Assessment Report | ${organization?.name || ''} | ${assessmentDate}`,
          pageW / 2, pageH - 8, { align: 'center' });
      }

      const filename = `CIS-RAM-Report-${(organization?.name || 'Assessment').replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'controls', label: 'Control Scores' },
    { id: 'actions', label: `Immediate Actions (${immediateActions.length})` },
    { id: 'recommendations', label: `Recommendations (${recommendations.length})` },
    { id: 'safeguards', label: `Safeguard Status (${scoredResponses.length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Report Header */}
      <div className="bg-primary-600 rounded-2xl text-white p-6 mb-6 shadow-lg">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-8 w-auto object-contain rounded" onError={e => { e.target.style.display='none'; }} />
              ) : (
                <Shield className="w-6 h-6 text-primary-200" />
              )}
              <span className="text-primary-200 text-sm font-medium">CIS RAM v2.1 Assessment Report</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">{organization?.name || 'Assessment Report'}</h1>
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
                  Session: {sessionId.slice(0, 12)}...
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
                <><div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" /> Generating...</>
              ) : (
                <><Download className="w-4 h-4" /> Export PDF</>
              )}
            </button>
            <button
              onClick={() => { reset(); navigate('/'); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              New
            </button>
          </div>
        </div>
      </div>

      {/* ORI + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* ORI Gauge */}
        <div className="lg:col-span-2 card p-6 flex flex-col items-center">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Organizational Risk Index
          </h2>
          <RiskGauge ori={ori} size={220} />
          <div className="mt-3 text-center text-xs text-gray-400">
            {completionPct}% of assessment complete
          </div>
        </div>

        {/* Summary stats */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-3">
          <StatCard
            icon={Shield}
            label="Total Safeguards"
            value={summary.total}
            color="text-blue-800"
          />
          <StatCard
            icon={CheckCircle}
            label="Acceptable"
            value={summary.acceptable}
            color="text-green-700"
          />
          <StatCard
            icon={AlertCircle}
            label="Unacceptable"
            value={summary.unacceptable}
            color="text-yellow-700"
          />
          <StatCard
            icon={AlertTriangle}
            label="High Risk"
            value={summary.high}
            color="text-red-700"
          />
        </div>
      </div>

      {/* Immediate Actions Banner */}
      {immediateActions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-800">
              {immediateActions.length} safeguard{immediateActions.length > 1 ? 's' : ''} require immediate action
            </div>
            <div className="text-sm text-red-700 mt-0.5">
              These controls have the highest risk scores and should be prioritized for remediation.
            </div>
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
          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Assessment Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">IG Level</div>
                    <div className="font-bold text-lg">IG{ig}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">IG Score</div>
                    <div className="font-bold text-lg">{igScore?.toFixed(2) || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">Completion</div>
                    <div className="font-bold text-lg">{completionPct}%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">ORI</div>
                    <div className="font-bold text-lg">{ori !== null ? ori.toFixed(1) : 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">About IG{ig}</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  {ig === 1 && (
                    <p>Implementation Group 1 is designed for organizations with limited cybersecurity resources. It covers 56 essential safeguards using a 3-point impact scale and maturity-based expectancy scoring. Risk scores use VCDB incident data to auto-calculate expectancy from your maturity level.</p>
                  )}
                  {ig === 2 && (
                    <p>Implementation Group 2 covers 130 safeguards for organizations with moderate cybersecurity capabilities handling sensitive data. It uses a 5-point impact and expectancy scale, includes financial impact assessment, with a risk threshold of 9.</p>
                  )}
                  {ig === 3 && (
                    <p>Implementation Group 3 covers all 153 CIS Controls v8.1 safeguards for large organizations in high-risk environments. It includes comprehensive scoring with financial impact, and applies to critical infrastructure and highly regulated organizations.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Risk Score Formula</h3>
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                  <div className="text-gray-700">
                    <strong>Risk Score</strong> = Expectancy × MAX(Mission, Operational, Obligations{ig >= 2 ? ', Financial' : ''})
                  </div>
                  {ig === 1 && (
                    <div className="text-gray-500 text-xs mt-2">
                      Expectancy is auto-calculated from VCDB index (by asset class) and maturity score
                    </div>
                  )}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-green-100 text-green-800 rounded p-2 text-center">
                      <div className="font-bold">Acceptable</div>
                      <div>{ig === 1 ? '< 6' : '< 9'}</div>
                    </div>
                    <div className="bg-yellow-100 text-yellow-800 rounded p-2 text-center">
                      <div className="font-bold">Unacceptable</div>
                      <div>{ig === 1 ? '= 6' : '9–15'}</div>
                    </div>
                    <div className="bg-red-100 text-red-800 rounded p-2 text-center">
                      <div className="font-bold">High Risk</div>
                      <div>{ig === 1 ? '= 9' : '≥ 16'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Control Scores tab */}
          {activeTab === 'controls' && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Average Risk Score by CIS Control</h3>
              <ControlScores responses={scoredResponses} igLevel={ig} />
            </div>
          )}

          {/* Immediate Actions tab */}
          {activeTab === 'actions' && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Safeguards Requiring Immediate Action</h3>
              <p className="text-sm text-gray-500 mb-4">
                These safeguards scored at the highest risk level and should be addressed within 30 days.
              </p>
              <RecommendationsPanel responses={scoredResponses} igLevel={ig} showHighOnly={true} />
            </div>
          )}

          {/* Recommendations tab */}
          {activeTab === 'recommendations' && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">All Action-Required Safeguards</h3>
              <p className="text-sm text-gray-500 mb-4">
                All safeguards with unacceptable or high risk scores, sorted by priority.
              </p>
              <RecommendationsPanel responses={scoredResponses} igLevel={ig} showHighOnly={false} />
            </div>
          )}

          {/* Safeguard Status tab */}
          {activeTab === 'safeguards' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">Safeguard Status</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Full compliance status for every safeguard assessed. Click any row to see details and what the score means for your organization.
                  </p>
                </div>
                <div className="sm:ml-auto flex items-center gap-2 flex-shrink-0">
                  {/* Status legend pills */}
                  {Object.entries(STATUS_META).filter(([k]) => k !== 'not-assessed').map(([key, meta]) => (
                    <button key={key}
                      onClick={() => setStatusFilter(f => f === key ? 'all' : key)}
                      className={clsx('hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border transition-all',
                        statusFilter === key ? meta.color + ' font-bold ring-2 ring-offset-1' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      )}>
                      <span className={clsx('w-2 h-2 rounded-full', meta.dot)} />
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search + filter bar */}
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search safeguards..."
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
                  <option value="all">All statuses</option>
                  <option value="critical">Critical</option>
                  <option value="non-compliant">Non-Compliant</option>
                  <option value="needs-improvement">Needs Improvement</option>
                  <option value="compliant">Compliant</option>
                  <option value="not-assessed">Not Assessed</option>
                </select>
              </div>

              {/* Status summary counts */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                {Object.entries(STATUS_META).map(([key, meta]) => {
                  const count = safeguards.filter(s => {
                    const r = responses[s.id];
                    return getComplianceStatus(r?.risk_score, ig) === key;
                  }).length;
                  return (
                    <div key={key} className={clsx('rounded-lg border px-3 py-2 text-center cursor-pointer transition-all',
                      statusFilter === key ? 'ring-2 ring-primary-400 ' + meta.color : 'bg-white border-gray-200 hover:border-gray-300'
                    )} onClick={() => setStatusFilter(f => f === key ? 'all' : key)}>
                      <div className="text-xl font-black text-gray-700">{count}</div>
                      <div className="text-xs text-gray-500 leading-tight">{meta.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Safeguard rows */}
              <SafeguardStatusList
                safeguards={safeguards}
                responses={responses}
                ig={ig}
                getComplianceStatus={getComplianceStatus}
                STATUS_META={STATUS_META}
                filter={statusFilter}
                search={statusSearch}
              />
            </div>
          )}
        </div>
      </div>

      {/* Session info footer */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        Session ID: <span className="font-mono">{sessionId}</span> — Save this ID to resume your assessment later
      </div>
    </div>
  );
}
