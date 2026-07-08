/**
 * trainingCatalog.js — Built-in training content per CIS Control (1–18).
 *
 * These are the DEFAULTS. Admins can override any control's entry via
 * Admin → Training (stored in the `training_catalog` table / demo `_db`).
 * `getMergedCatalog()` overlays overrides on top of these defaults.
 *
 * Shape per control:
 *   { control_number, title, summary, topics: [{ topic, objective, resources: [{ label, url }] }] }
 *
 * Note: resource URLs point at public CIS / vendor-neutral references.
 */

export const DEFAULT_TRAINING = {
  1: {
    control_number: 1,
    title: 'Asset Inventory & Control',
    summary: 'Build and maintain an accurate inventory of all enterprise hardware so nothing connects to your network unnoticed.',
    topics: [
      { topic: 'Automated asset discovery', objective: 'Understand how to continuously detect devices joining the network.', resources: [{ label: 'CIS Control 1 overview', url: 'https://www.cisecurity.org/controls/inventory-and-control-of-enterprise-assets' }] },
      { topic: 'Handling unauthorized devices', objective: 'Define a process to detect, alert on, and remove rogue assets.', resources: [] },
    ],
  },
  2: {
    control_number: 2,
    title: 'Software Inventory & Allowlisting',
    summary: 'Track all installed software and prevent unauthorized or unsupported applications from running.',
    topics: [
      { topic: 'Software inventory tooling', objective: 'Maintain a live list of authorized software and versions.', resources: [{ label: 'CIS Control 2 overview', url: 'https://www.cisecurity.org/controls/inventory-and-control-of-software-assets' }] },
      { topic: 'Application allowlisting', objective: 'Restrict execution to approved software only.', resources: [] },
    ],
  },
  3: {
    control_number: 3,
    title: 'Data Protection',
    summary: 'Classify, handle, retain, and dispose of data securely across its lifecycle.',
    topics: [
      { topic: 'Data classification', objective: 'Label data by sensitivity and apply matching handling rules.', resources: [{ label: 'CIS Control 3 overview', url: 'https://www.cisecurity.org/controls/data-protection' }] },
      { topic: 'Encryption at rest & in transit', objective: 'Protect sensitive data with appropriate encryption.', resources: [] },
    ],
  },
  4: {
    control_number: 4,
    title: 'Secure Configuration',
    summary: 'Establish and maintain hardened, benchmark-based configurations for devices and software.',
    topics: [
      { topic: 'CIS Benchmarks', objective: 'Apply vendor-neutral hardening baselines to systems.', resources: [{ label: 'CIS Benchmarks', url: 'https://www.cisecurity.org/cis-benchmarks' }] },
      { topic: 'Configuration drift management', objective: 'Detect and remediate deviations from the baseline.', resources: [] },
    ],
  },
  5: {
    control_number: 5,
    title: 'Account Management',
    summary: 'Manage the lifecycle of user, admin, and service accounts to prevent orphaned or excessive access.',
    topics: [
      { topic: 'Account lifecycle', objective: 'Provision, review, and de-provision accounts promptly.', resources: [{ label: 'CIS Control 5 overview', url: 'https://www.cisecurity.org/controls/account-management' }] },
      { topic: 'Privileged account inventory', objective: 'Track and minimize administrative accounts.', resources: [] },
    ],
  },
  6: {
    control_number: 6,
    title: 'Access Control Management',
    summary: 'Grant, enforce, and revoke access rights following least-privilege principles.',
    topics: [
      { topic: 'Multi-factor authentication', objective: 'Require MFA for remote, admin, and sensitive access.', resources: [{ label: 'CIS Control 6 overview', url: 'https://www.cisecurity.org/controls/access-control-management' }] },
      { topic: 'Role-based access control', objective: 'Assign access by role and review it regularly.', resources: [] },
    ],
  },
  7: {
    control_number: 7,
    title: 'Continuous Vulnerability Management',
    summary: 'Continuously identify, prioritize, and remediate vulnerabilities.',
    topics: [
      { topic: 'Vulnerability scanning', objective: 'Run authenticated scans on a regular cadence.', resources: [{ label: 'CIS Control 7 overview', url: 'https://www.cisecurity.org/controls/continuous-vulnerability-management' }] },
      { topic: 'Patch management', objective: 'Remediate on a risk-based timeline.', resources: [] },
    ],
  },
  8: {
    control_number: 8,
    title: 'Audit Log Management',
    summary: 'Collect, protect, and review logs to detect and investigate incidents.',
    topics: [
      { topic: 'Centralized logging', objective: 'Aggregate logs to a protected central store.', resources: [{ label: 'CIS Control 8 overview', url: 'https://www.cisecurity.org/controls/audit-log-management' }] },
      { topic: 'Log review & retention', objective: 'Review logs and retain them per policy.', resources: [] },
    ],
  },
  9: {
    control_number: 9,
    title: 'Email & Web Browser Protections',
    summary: 'Reduce the attack surface from email and web browsing.',
    topics: [
      { topic: 'Phishing defenses', objective: 'Deploy anti-phishing and DNS/URL filtering.', resources: [{ label: 'CIS Control 9 overview', url: 'https://www.cisecurity.org/controls/email-and-web-browser-protections' }] },
      { topic: 'Browser hardening', objective: 'Restrict plugins and enforce safe browsing settings.', resources: [] },
    ],
  },
  10: {
    control_number: 10,
    title: 'Malware Defenses',
    summary: 'Prevent and control the installation and spread of malicious code.',
    topics: [
      { topic: 'Endpoint protection', objective: 'Deploy and centrally manage anti-malware.', resources: [{ label: 'CIS Control 10 overview', url: 'https://www.cisecurity.org/controls/malware-defenses' }] },
      { topic: 'Behavior-based detection', objective: 'Detect malware by behavior, not just signatures.', resources: [] },
    ],
  },
  11: {
    control_number: 11,
    title: 'Data Recovery',
    summary: 'Maintain and test backups so you can recover from ransomware and data loss.',
    topics: [
      { topic: 'Backup strategy', objective: 'Automate backups and keep offline/immutable copies.', resources: [{ label: 'CIS Control 11 overview', url: 'https://www.cisecurity.org/controls/data-recovery' }] },
      { topic: 'Recovery testing', objective: 'Regularly test restoration end-to-end.', resources: [] },
    ],
  },
  12: {
    control_number: 12,
    title: 'Network Infrastructure Management',
    summary: 'Securely manage network devices and architecture.',
    topics: [
      { topic: 'Secure network architecture', objective: 'Segment networks and manage device configs securely.', resources: [{ label: 'CIS Control 12 overview', url: 'https://www.cisecurity.org/controls/network-infrastructure-management' }] },
      { topic: 'Device firmware & config', objective: 'Keep infrastructure updated and version-controlled.', resources: [] },
    ],
  },
  13: {
    control_number: 13,
    title: 'Network Monitoring & Defense',
    summary: 'Operate detection and response across the network to spot intrusions.',
    topics: [
      { topic: 'Intrusion detection', objective: 'Deploy IDS/IPS and traffic monitoring.', resources: [{ label: 'CIS Control 13 overview', url: 'https://www.cisecurity.org/controls/network-monitoring-and-defense' }] },
      { topic: 'Security event correlation', objective: 'Correlate alerts to identify real incidents.', resources: [] },
    ],
  },
  14: {
    control_number: 14,
    title: 'Security Awareness & Skills Training',
    summary: 'Build a security-conscious workforce through ongoing training.',
    topics: [
      { topic: 'Awareness program', objective: 'Deliver role-based, recurring security training.', resources: [{ label: 'CIS Control 14 overview', url: 'https://www.cisecurity.org/controls/security-awareness-and-skills-training' }] },
      { topic: 'Phishing simulations', objective: 'Test and reinforce staff recognition of phishing.', resources: [] },
    ],
  },
  15: {
    control_number: 15,
    title: 'Service Provider Management',
    summary: 'Manage third-party providers that handle your data or systems.',
    topics: [
      { topic: 'Vendor inventory & assessment', objective: 'Track providers and assess their security.', resources: [{ label: 'CIS Control 15 overview', url: 'https://www.cisecurity.org/controls/service-provider-management' }] },
      { topic: 'Contractual security requirements', objective: 'Embed security terms in provider contracts.', resources: [] },
    ],
  },
  16: {
    control_number: 16,
    title: 'Application Software Security',
    summary: 'Build and maintain secure in-house and acquired software.',
    topics: [
      { topic: 'Secure development lifecycle', objective: 'Integrate security into every SDLC phase.', resources: [{ label: 'CIS Control 16 overview', url: 'https://www.cisecurity.org/controls/application-software-security' }] },
      { topic: 'Application security testing', objective: 'Run SAST/DAST and remediate findings.', resources: [] },
    ],
  },
  17: {
    control_number: 17,
    title: 'Incident Response Management',
    summary: 'Prepare to detect, respond to, and recover from security incidents.',
    topics: [
      { topic: 'IR plan & roles', objective: 'Document a plan and assign responsibilities.', resources: [{ label: 'CIS Control 17 overview', url: 'https://www.cisecurity.org/controls/incident-response-management' }] },
      { topic: 'Tabletop exercises', objective: 'Rehearse response scenarios regularly.', resources: [] },
    ],
  },
  18: {
    control_number: 18,
    title: 'Penetration Testing',
    summary: 'Validate defenses by simulating real-world attacks.',
    topics: [
      { topic: 'Penetration test scoping', objective: 'Plan tests that reflect realistic threats.', resources: [{ label: 'CIS Control 18 overview', url: 'https://www.cisecurity.org/controls/penetration-testing' }] },
      { topic: 'Remediation & retesting', objective: 'Fix findings and validate the fixes.', resources: [] },
    ],
  },
};

/**
 * Merge admin overrides (from getTrainingCatalog()) over the built-in defaults.
 * @param {Array} overrides rows like { control_number, title, summary, topics }
 * @returns object keyed by control_number
 */
export function mergeCatalog(overrides = []) {
  const merged = { ...DEFAULT_TRAINING };
  for (const row of overrides) {
    if (!row || !row.control_number) continue;
    merged[row.control_number] = {
      control_number: row.control_number,
      title: row.title ?? DEFAULT_TRAINING[row.control_number]?.title,
      summary: row.summary ?? DEFAULT_TRAINING[row.control_number]?.summary,
      topics: Array.isArray(row.topics) ? row.topics : (DEFAULT_TRAINING[row.control_number]?.topics || []),
      _customized: true,
    };
  }
  return merged;
}

export function getTrainingEntry(mergedCatalog, controlNumber) {
  return mergedCatalog[controlNumber] || DEFAULT_TRAINING[controlNumber] || null;
}
