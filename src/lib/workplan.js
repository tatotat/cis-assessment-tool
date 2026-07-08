/**
 * workplan.js — Aggregate an organization's completed assessments into a
 * phased remediation work plan plus a training focus list.
 *
 * Pure functions (no I/O) so they are easy to test and reuse in the PDF export.
 */

import { SAFEGUARDS, CONTROL_NAMES } from './safeguards';
import { getRecommendation } from './recommendations';

const MAX_SCORE = { 1: 9, 2: 25, 3: 25 };

function safeguardById(id) {
  return SAFEGUARDS.find(s => s.id === id);
}

/**
 * Pick the latest completed assessment per assessor (by lowercased email).
 * @param {Array} assessments
 * @returns {Array} one assessment per distinct assessor
 */
export function latestCompletedPerAssessor(assessments) {
  const byEmail = {};
  for (const a of assessments) {
    if (a.status !== 'completed') continue;
    const key = (a.assessor_email || '').toLowerCase();
    const existing = byEmail[key];
    if (!existing || (a.completed_at || a.created_at) > (existing.completed_at || existing.created_at)) {
      byEmail[key] = a;
    }
  }
  return Object.values(byEmail);
}

/**
 * Build the phased work plan.
 * @param {Array} assessments  completed assessments for the org
 * @param {Array} responses    assessment_responses rows for those assessments
 * @returns {{ phases, stats, controlFocus }}
 */
export function buildWorkPlan(assessments, responses) {
  const chosen = latestCompletedPerAssessor(assessments);
  const chosenIds = new Set(chosen.map(a => a.id));
  const igByAssessment = {};
  chosen.forEach(a => { igByAssessment[a.id] = a.implementation_group || 1; });

  const rows = responses.filter(r => chosenIds.has(r.assessment_id));
  const assessorCount = chosen.length;

  // Group by safeguard
  const bySafeguard = {};
  for (const r of rows) {
    if (r.risk_score === null || r.risk_score === undefined) continue;
    const ig = igByAssessment[r.assessment_id] || 1;
    const norm = r.risk_score / (MAX_SCORE[ig] || 25);
    const s = bySafeguard[r.safeguard_id] || (bySafeguard[r.safeguard_id] = {
      safeguardId: r.safeguard_id, controlNumber: r.control_number,
      normSum: 0, count: 0, affected: 0, highCount: 0,
    });
    s.normSum += norm;
    s.count += 1;
    if (r.risk_level === 'high' || r.risk_level === 'unacceptable') s.affected += 1;
    if (r.risk_level === 'high') s.highCount += 1;
  }

  const phases = { immediate: [], '30days': [], '90days': [], longterm: [] };

  for (const s of Object.values(bySafeguard)) {
    const avgNorm = s.count > 0 ? s.normSum / s.count : 0;
    const priority = avgNorm * s.affected;
    const affectedRatio = s.count > 0 ? s.affected / s.count : 0;

    let phase;
    if (s.highCount > 0 && affectedRatio >= 0.5) phase = 'immediate';
    else if (s.highCount > 0) phase = '30days';
    else if (s.affected > 0) phase = '90days';
    else phase = 'longterm';

    const sg = safeguardById(s.safeguardId);
    const rec = getRecommendation(s.safeguardId);
    const actionText = phase === 'immediate' || phase === '30days'
      ? rec.immediate
      : (phase === '90days' ? rec.shortTerm : rec.longTerm);

    phases[phase].push({
      safeguardId: s.safeguardId,
      controlNumber: s.controlNumber,
      controlName: CONTROL_NAMES[s.controlNumber] || `Control ${s.controlNumber}`,
      title: sg?.friendlyTitle || sg?.title || s.safeguardId,
      description: sg?.description || '',
      affected: s.affected,
      total: s.count,
      priority,
      avgExposure: Math.round(avgNorm * 100),
      action: actionText,
    });
  }

  // Sort each phase by priority (highest first)
  Object.keys(phases).forEach(k => phases[k].sort((a, b) => b.priority - a.priority));

  // Control-level focus: average normalized exposure per control, worst first
  const byControl = {};
  for (const s of Object.values(bySafeguard)) {
    const avgNorm = s.count > 0 ? s.normSum / s.count : 0;
    const c = byControl[s.controlNumber] || (byControl[s.controlNumber] = { controlNumber: s.controlNumber, sum: 0, n: 0 });
    c.sum += avgNorm;
    c.n += 1;
  }
  const controlFocus = Object.values(byControl)
    .map(c => ({
      controlNumber: c.controlNumber,
      name: CONTROL_NAMES[c.controlNumber] || `Control ${c.controlNumber}`,
      exposure: Math.round((c.sum / c.n) * 100),
    }))
    .sort((a, b) => b.exposure - a.exposure);

  const stats = {
    assessorCount,
    safeguardsAssessed: Object.keys(bySafeguard).length,
    immediate: phases.immediate.length,
    thirty: phases['30days'].length,
    ninety: phases['90days'].length,
    longterm: phases.longterm.length,
  };

  return { phases, stats, controlFocus };
}

export const PHASE_ORDER = ['immediate', '30days', '90days', 'longterm'];
