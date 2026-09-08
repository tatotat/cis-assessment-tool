/**
 * reportPdf.js — Executive assessment report (jsPDF + autotable).
 *
 * Pure of React: takes the computed report data plus the i18n `t` function
 * and returns the jsPDF document. The caller decides how to deliver it
 * (doc.save in the browser). All user-visible strings come from
 * `report.pdf.*`, `report.riskLevel.*`, `report.ori.*` translation keys.
 */

import { getORILevel, getRiskLevel } from '../calculations';
import { SAFEGUARDS } from '../safeguards';
import { getRecommendation } from '../recommendations';
import { loadLogoDataUrl, drawLogo } from './logo';

const BRAND = [13, 74, 74];
const ORI_COLORS = {
  low: [34, 197, 94],
  moderate: [234, 179, 8],
  elevated: [249, 115, 22],
  critical: [239, 68, 68],
  unknown: [156, 163, 175],
};

function sectionHeader(doc, pageW, text, fill = BRAND) {
  doc.setFillColor(...fill);
  doc.rect(0, 0, pageW, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(text, 20, 10);
}

/**
 * @param {Function} t  i18next translate function
 * @param {object} ctx  { organization, assessorName, assessorEmail, ig, sessionId,
 *                        safeguards, scoredResponses, summary, ori, controlScores,
 *                        immediateActions, assessmentDate, logoUrl }
 * @returns {Promise<{ doc: jsPDF, filename: string }>}
 */
export async function buildReportPdf(t, ctx) {
  const {
    organization, assessorName, assessorEmail, ig, sessionId,
    safeguards, scoredResponses, summary, ori, controlScores,
    immediateActions, assessmentDate, logoUrl,
  } = ctx;

  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const orgName = organization?.name || t('report.pdf.organization');
  const na = t('report.pdf.na');
  const oriText = ori !== null && ori !== undefined ? ori.toFixed(1) : null;

  const lvl = {
    acceptable: t('report.riskLevel.acceptable'),
    unacceptable: t('report.riskLevel.unacceptable'),
    high: t('report.riskLevel.high'),
  };
  const st = {
    notAssessed: t('report.statusMeta.not-assessed.label'),
    compliant: t('report.statusMeta.compliant.label'),
    needsImprovement: t('report.statusMeta.needs-improvement.label'),
    nonCompliant: t('report.statusMeta.non-compliant.label'),
    critical: t('report.pdf.criticalLabel'),
  };

  // ---- COVER PAGE ----
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, pageW, 60, 'F');
  drawLogo(doc, await loadLogoDataUrl(logoUrl), { pageW });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24); doc.setFont('helvetica', 'bold');
  doc.text(t('report.pdf.title'), 20, 28);
  doc.setFontSize(14); doc.setFont('helvetica', 'normal');
  doc.text(t('report.pdf.subtitle'), 20, 40);
  doc.setFontSize(10); doc.setTextColor(180, 220, 220);
  doc.text(t('report.pdf.method'), 20, 52);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text(orgName, 20, 82);

  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
  doc.text(t('report.pdf.assessmentDate', { date: assessmentDate }), 20, 92);
  doc.text(t('report.pdf.assessor', { name: assessorName || assessorEmail || na }), 20, 100);
  doc.text(t('report.pdf.ig', { ig }), 20, 108);
  doc.text(t('report.pdf.session', { id: sessionId || na }), 20, 116);
  doc.text(t('report.pdf.safeguardsAssessed', { scored: scoredResponses.length, total: safeguards.length }), 20, 124);

  const oriLevel = getORILevel(ori);
  doc.setFillColor(...(ORI_COLORS[oriLevel] || ORI_COLORS.unknown));
  doc.roundedRect(20, 140, 80, 40, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28); doc.setFont('helvetica', 'bold');
  doc.text(oriText ?? '--', 35, 162);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(t('report.pdf.oriLabel'), 24, 173);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.text(t('report.pdf.oriRange'), 20, 192);
  doc.text(t(`report.ori.${oriLevel}`), 20, 200, { maxWidth: pageW - 40 });

  // ---- EXECUTIVE SUMMARY ----
  doc.addPage();
  sectionHeader(doc, pageW, t('report.pdf.execSummary'));

  let y = 28;
  doc.setTextColor(30, 30, 30); doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  [
    t('report.pdf.summaryLine1', { org: orgName, date: assessmentDate }),
    t('report.pdf.summaryLine2', { ig, scored: scoredResponses.length, total: safeguards.length }),
    t('report.pdf.summaryLine3', { ori: oriText ?? na, level: t(`report.oriLevel.${oriLevel}`).toUpperCase() }),
  ].forEach(line => {
    const split = doc.splitTextToSize(line, pageW - 40);
    doc.text(split, 20, y);
    y += split.length * 6 + 4;
  });

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.text(t('report.pdf.riskDistribution'), 20, y);
  y += 6;

  const pct = n => `${summary.total > 0 ? Math.round((n / summary.total) * 100) : 0}%`;
  autoTable(doc, {
    startY: y,
    head: [[t('report.pdf.head.riskLevel'), t('report.pdf.head.count'), t('report.pdf.head.percentage')]],
    body: [
      [lvl.acceptable, summary.acceptable, pct(summary.acceptable)],
      [lvl.unacceptable, summary.unacceptable, pct(summary.unacceptable)],
      [lvl.high, summary.high, pct(summary.high)],
      [t('report.pdf.notScored'), summary.notScored, pct(summary.notScored)],
      [t('report.pdf.total'), summary.total, '100%'],
    ],
    headStyles: { fillColor: BRAND, textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 250] },
    styles: { fontSize: 9 },
    margin: { left: 20, right: 20 },
  });

  // ---- CONTROL SCORES ----
  doc.addPage();
  sectionHeader(doc, pageW, t('report.pdf.controlScores'));
  const accMax = ig === 1 ? 6 : 9;
  const unaccMax = ig === 1 ? 9 : 16;
  autoTable(doc, {
    startY: 24,
    head: [[
      t('report.pdf.head.control'), t('report.pdf.head.name'), t('report.pdf.head.avgScore'),
      t('report.pdf.head.maxScore'), t('report.pdf.head.safeguards'), t('report.pdf.head.level'),
    ]],
    body: controlScores.map(c => [
      `C${c.control}`,
      c.name.length > 35 ? c.name.slice(0, 35) + '…' : c.name,
      c.avgScore, c.maxScore, c.count,
      c.avgScore < accMax ? lvl.acceptable : c.avgScore < unaccMax ? lvl.unacceptable : lvl.high,
    ]),
    headStyles: { fillColor: BRAND, textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 250] },
    styles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 12 }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } },
    margin: { left: 20, right: 20 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const v = data.cell.raw;
        data.cell.styles.textColor = v === lvl.high ? [239, 68, 68] : v === lvl.unacceptable ? [202, 138, 4] : [22, 163, 74];
      }
    },
  });

  // ---- IMMEDIATE ACTIONS ----
  if (immediateActions.length > 0) {
    doc.addPage();
    sectionHeader(doc, pageW, t('report.pdf.immediateActions'), [239, 68, 68]);
    autoTable(doc, {
      startY: 24,
      head: [[
        t('report.pdf.head.safeguard'), t('report.pdf.head.title'), t('report.pdf.head.assetClass'),
        t('report.pdf.head.riskScore'), t('report.pdf.head.expectancy'), t('report.pdf.head.maxImpact'),
      ]],
      body: immediateActions.slice(0, 20).map(r => {
        const sg = SAFEGUARDS.find(s => s.id === r.safeguard_id);
        const title = sg?.friendlyTitle || sg?.title || r.safeguard_id;
        return [
          r.safeguard_id,
          title.length > 30 ? title.slice(0, 30) + '…' : title,
          r.asset_class, r.risk_score, r.expectancy_score,
          Math.max(r.impact_mission || 0, r.impact_operational || 0, r.impact_obligations || 0, r.impact_financial || 0),
        ];
      }),
      headStyles: { fillColor: [239, 68, 68], textColor: 255 },
      alternateRowStyles: { fillColor: [255, 245, 245] },
      styles: { fontSize: 8 },
      margin: { left: 20, right: 20 },
    });
  }

  // ---- RECOMMENDATIONS ----
  const actionItems = scoredResponses
    .filter(r => { const l = getRiskLevel(r.risk_score, ig); return l === 'high' || l === 'unacceptable'; })
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));

  if (actionItems.length > 0) {
    doc.addPage();
    sectionHeader(doc, pageW, t('report.pdf.recommendations'), [202, 138, 4]);
    let ry = 24;
    doc.setTextColor(30, 30, 30);

    for (const r of actionItems.slice(0, 25)) {
      const level = getRiskLevel(r.risk_score, ig);
      const safeguard = SAFEGUARDS.find(s => s.id === r.safeguard_id);
      const recs = getRecommendation(r.safeguard_id);
      const recText = level === 'high' ? recs.immediate : recs.shortTerm;
      const recLabel = level === 'high' ? t('report.pdf.doNow') : t('report.pdf.doWithin90');

      if (ry > pageH - 60) { doc.addPage(); ry = 20; }

      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      const name = (safeguard?.friendlyTitle || safeguard?.title || r.safeguard_id).slice(0, 60);
      doc.text(`${r.safeguard_id} — ${name} [${t('report.pdf.riskTag', { score: r.risk_score, level: lvl[level].toUpperCase() })}]`, 20, ry);
      ry += 5;

      if (safeguard?.description) {
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(80, 80, 80);
        const descLines = doc.splitTextToSize(safeguard.description, pageW - 40);
        doc.text(descLines, 20, ry);
        ry += descLines.length * 4 + 2;
      }

      doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      doc.setTextColor(level === 'high' ? 180 : 140, level === 'high' ? 30 : 100, 0);
      doc.text(recLabel + ':', 20, ry);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
      const recLines = doc.splitTextToSize(recText, pageW - 40);
      doc.text(recLines, 20, ry + 4);
      ry += recLines.length * 4 + 10;
    }
  }

  // ---- ALL SAFEGUARDS STATUS ----
  doc.addPage();
  sectionHeader(doc, pageW, t('report.pdf.safeguardStatus'));
  const maxScore = ig === 1 ? 9 : 25;
  const rows = safeguards.map(s => {
    const r = scoredResponses.find(x => x.safeguard_id === s.id);
    const riskScore = r?.risk_score ?? null;
    const level = riskScore != null ? getRiskLevel(riskScore, ig) : null;
    let status;
    if (riskScore == null) status = st.notAssessed;
    else if (level === 'acceptable') status = st.compliant;
    else if (level === 'unacceptable') status = st.needsImprovement;
    else if (riskScore >= maxScore) status = st.critical;
    else status = st.nonCompliant;
    return [
      s.id,
      (s.friendlyTitle || s.title).slice(0, 40),
      s.assetClass,
      riskScore ?? '—',
      `${riskScore != null ? Math.round((riskScore / maxScore) * 100) : 0}%`,
      status,
    ];
  });

  autoTable(doc, {
    startY: 24,
    head: [[
      t('report.pdf.head.id'), t('report.pdf.head.safeguard'), t('report.pdf.head.asset'),
      t('report.pdf.head.score'), t('report.pdf.head.exposure'), t('report.pdf.head.status'),
    ]],
    body: rows,
    headStyles: { fillColor: BRAND, textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 250] },
    styles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 10, fontStyle: 'bold' }, 1: { cellWidth: 70 }, 2: { cellWidth: 20 },
      3: { cellWidth: 12, halign: 'center' }, 4: { cellWidth: 18, halign: 'center' }, 5: { cellWidth: 28, halign: 'center' },
    },
    margin: { left: 20, right: 20 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const v = data.cell.raw;
        if (v === st.critical) { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.fontStyle = 'bold'; }
        else if (v === st.nonCompliant) data.cell.styles.textColor = [234, 88, 12];
        else if (v === st.needsImprovement) data.cell.styles.textColor = [161, 98, 7];
        else if (v === st.compliant) data.cell.styles.textColor = [22, 163, 74];
        else data.cell.styles.textColor = [107, 114, 128];
      }
    },
  });

  // Page numbers
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(150, 150, 150);
    doc.text(t('report.pdf.pageFooter', { page: i, pages, org: organization?.name || '', date: assessmentDate }),
      pageW / 2, pageH - 8, { align: 'center' });
  }

  const filename = `${t('report.pdf.filenamePrefix')}-${(organization?.name || 'Assessment').replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
  return { doc, filename };
}
