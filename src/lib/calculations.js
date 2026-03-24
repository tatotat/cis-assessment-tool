import { VCDB_INDEX, VCDB_EXPECTANCY_LOOKUP, getSafeguardsForIG, CONTROL_NAMES } from './safeguards';

// IG Determination from screening answers
export function determineIG(answers) {
  if (!answers || answers.length < 5) return null;
  const total = answers.reduce((sum, a) => sum + a, 0);
  const avg = total / answers.length;
  if (avg <= 1.6) return 1;
  if (avg <= 2.3) return 2;
  return 3;
}

export function getIGScore(answers) {
  if (!answers || answers.length < 5) return 0;
  return answers.reduce((sum, a) => sum + a, 0) / answers.length;
}

// IG1 expectancy calculation from maturity score and asset class
export function calculateIG1Expectancy(assetClass, maturityScore) {
  const vcdbIdx = VCDB_INDEX[assetClass] || 1;
  const lookup = VCDB_EXPECTANCY_LOOKUP[vcdbIdx];
  if (!lookup) return 1;
  const idx = Math.min(Math.max(maturityScore - 1, 0), 4);
  return lookup[idx];
}

// IG1 risk score calculation
export function calculateIG1RiskScore(maturityScore, assetClass, impactMission, impactOperational, impactObligations) {
  if (!maturityScore || !impactMission || !impactOperational || !impactObligations) return null;
  const expectancy = calculateIG1Expectancy(assetClass, maturityScore);
  const maxImpact = Math.max(impactMission, impactOperational, impactObligations);
  return expectancy * maxImpact;
}

// IG2/IG3 risk score calculation
export function calculateIG23RiskScore(expectancyScore, impactMission, impactOperational, impactObligations, impactFinancial) {
  if (!expectancyScore || !impactMission || !impactOperational || !impactObligations) return null;
  const impacts = [impactMission, impactOperational, impactObligations];
  if (impactFinancial) impacts.push(impactFinancial);
  const maxImpact = Math.max(...impacts);
  return expectancyScore * maxImpact;
}

// Determine risk level from score and IG
export function getRiskLevel(riskScore, igLevel) {
  if (riskScore === null || riskScore === undefined) return null;
  if (igLevel === 1) {
    if (riskScore < 6) return 'acceptable';
    if (riskScore === 6) return 'unacceptable';
    return 'high'; // 9
  } else {
    // IG2/IG3 threshold = 9
    if (riskScore < 9) return 'acceptable';
    if (riskScore < 16) return 'unacceptable';
    return 'high';
  }
}

// Max possible score per safeguard
export function getMaxScore(igLevel) {
  return igLevel === 1 ? 9 : 25;
}

// Calculate overall risk score for a single response
export function calculateRiskScore(response, igLevel) {
  if (igLevel === 1) {
    return calculateIG1RiskScore(
      response.maturity_score,
      response.asset_class,
      response.impact_mission,
      response.impact_operational,
      response.impact_obligations
    );
  } else {
    return calculateIG23RiskScore(
      response.expectancy_score,
      response.impact_mission,
      response.impact_operational,
      response.impact_obligations,
      response.impact_financial
    );
  }
}

// Organizational Risk Index
export function calculateORI(responses, igLevel) {
  if (!responses || responses.length === 0) return null;
  const maxScore = getMaxScore(igLevel);
  const scoredResponses = responses.filter(r => r.risk_score !== null && r.risk_score !== undefined);
  if (scoredResponses.length === 0) return null;
  const totalRisk = scoredResponses.reduce((sum, r) => sum + (r.risk_score || 0), 0);
  const totalMaxPossible = scoredResponses.length * maxScore;
  return (totalRisk / totalMaxPossible) * 100;
}

// Get risk summary stats
export function getRiskSummary(responses, igLevel) {
  const summary = {
    total: responses.length,
    acceptable: 0,
    unacceptable: 0,
    high: 0,
    notScored: 0,
  };
  responses.forEach(r => {
    if (r.risk_score === null || r.risk_score === undefined) {
      summary.notScored++;
    } else {
      const level = getRiskLevel(r.risk_score, igLevel);
      if (level === 'acceptable') summary.acceptable++;
      else if (level === 'unacceptable') summary.unacceptable++;
      else if (level === 'high') summary.high++;
    }
  });
  return summary;
}

// Get control-level aggregated scores
export function getControlScores(responses, igLevel) {
  const byControl = {};
  responses.forEach(r => {
    const controlNum = r.control_number;
    if (!byControl[controlNum]) {
      byControl[controlNum] = {
        control: controlNum,
        name: CONTROL_NAMES[controlNum] || `Control ${controlNum}`,
        scores: [],
        avgScore: 0,
        maxScore: 0,
        count: 0,
      };
    }
    if (r.risk_score !== null && r.risk_score !== undefined) {
      byControl[controlNum].scores.push(r.risk_score);
    }
  });

  return Object.values(byControl).map(c => {
    const maxPossible = getMaxScore(igLevel);
    const avg = c.scores.length > 0 ? c.scores.reduce((a, b) => a + b, 0) / c.scores.length : 0;
    return {
      ...c,
      avgScore: Math.round(avg * 10) / 10,
      maxScore: maxPossible,
      count: c.scores.length,
      normalizedScore: maxPossible > 0 ? (avg / maxPossible) * 100 : 0,
    };
  }).sort((a, b) => a.control - b.control);
}

// Get high-risk safeguards (immediate actions)
export function getImmediateActions(responses, igLevel) {
  return responses
    .filter(r => getRiskLevel(r.risk_score, igLevel) === 'high')
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));
}

// Get recommendations for unacceptable and high risk items
export function getRecommendations(responses, igLevel) {
  return responses
    .filter(r => {
      const level = getRiskLevel(r.risk_score, igLevel);
      return level === 'unacceptable' || level === 'high';
    })
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));
}

// Validate screening answers completeness
export function isScreeningComplete(answers) {
  return answers && answers.length === 5 && answers.every(a => a >= 1 && a <= 3);
}

// Check if a response is complete
export function isResponseComplete(response, igLevel) {
  if (!response) return false;
  if (igLevel === 1) {
    return response.maturity_score && response.impact_mission && response.impact_operational && response.impact_obligations;
  } else {
    return response.expectancy_score && response.impact_mission && response.impact_operational && response.impact_obligations && response.impact_financial;
  }
}

// Generate a unique session ID
export function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get risk color class
export function getRiskColorClass(level) {
  if (level === 'acceptable') return 'text-green-600';
  if (level === 'unacceptable') return 'text-yellow-600';
  if (level === 'high') return 'text-red-600';
  return 'text-gray-400';
}

export function getRiskBgClass(level) {
  if (level === 'acceptable') return 'bg-green-100 text-green-800';
  if (level === 'unacceptable') return 'bg-yellow-100 text-yellow-800';
  if (level === 'high') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-500';
}

export function getRiskBorderClass(level) {
  if (level === 'acceptable') return 'border-green-400';
  if (level === 'unacceptable') return 'border-yellow-400';
  if (level === 'high') return 'border-red-400';
  return 'border-gray-300';
}

// ORI interpretation
export function getORILevel(ori) {
  if (ori === null || ori === undefined) return 'unknown';
  if (ori < 25) return 'low';
  if (ori < 50) return 'moderate';
  if (ori < 75) return 'elevated';
  return 'critical';
}

export function getORIDescription(ori) {
  const level = getORILevel(ori);
  if (level === 'low') return 'Low risk posture — organization demonstrates strong security controls.';
  if (level === 'moderate') return 'Moderate risk — some controls need improvement.';
  if (level === 'elevated') return 'Elevated risk — significant improvements required across multiple areas.';
  if (level === 'critical') return 'Critical risk — immediate action required across most control areas.';
  return 'Assessment incomplete.';
}
