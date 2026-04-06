import React, { useState, useEffect } from 'react';
import {
  Save, Eye, Shield, Palette, FileText, CheckSquare,
  Database, CheckCircle, XCircle, AlertTriangle, RefreshCw,
  Copy, Check, ExternalLink, AlignLeft, Mail, Globe, Users
} from 'lucide-react';
import { getSettings, saveSettings, applyPrimaryColor } from '../../lib/settings';
import { IS_DEMO_MODE, testConnection, checkIsAdmin, claimFirstAdmin } from '../../lib/supabase';

// ── Supabase diagnostics panel ────────────────────────────────────────────────

function SupabaseDiagnostics() {
  const [connStatus, setConnStatus] = useState(null); // null = not tested yet
  const [adminStatus, setAdminStatus] = useState(null);
  const [testing, setTesting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const [copied, setCopied] = useState(false);

  async function runTests() {
    setTesting(true);
    setClaimResult(null);
    const [conn, admin] = await Promise.all([testConnection(), checkIsAdmin()]);
    setConnStatus(conn);
    setAdminStatus(admin);
    setTesting(false);
  }

  async function handleClaimAdmin() {
    setClaiming(true);
    setClaimResult(null);
    const result = await claimFirstAdmin();
    setClaimResult(result);
    if (result.success) {
      // Re-check admin status
      const admin = await checkIsAdmin();
      setAdminStatus(admin);
    }
    setClaiming(false);
  }

  function copySQL(sql) {
    navigator.clipboard.writeText(sql).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const adminEmail = adminStatus?.email || '—';
  const adminSQL = `UPDATE profiles SET role = 'admin' WHERE email = '${adminEmail}';`;

  return (
    <div className="card">
      <div className="card-header flex items-center gap-2">
        <Database className="w-4 h-4 text-primary-600" />
        <h2 className="font-semibold text-gray-800">Supabase Connection & Admin Setup</h2>
      </div>
      <div className="card-body space-y-5">

        {/* Mode badge */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Mode:</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            IS_DEMO_MODE
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {IS_DEMO_MODE ? '🧪 Demo / Offline' : '🌐 Production (Supabase)'}
          </span>
          {IS_DEMO_MODE && (
            <span className="text-xs text-gray-500">
              Add <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_URL</code> + <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to <code className="bg-gray-100 px-1 rounded">.env.local</code> to connect.
            </span>
          )}
        </div>

        {!IS_DEMO_MODE && (
          <>
            {/* Test connection button */}
            <div className="flex items-center gap-3">
              <button
                onClick={runTests}
                disabled={testing}
                className="btn-secondary"
              >
                {testing
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" /> Testing...</>
                  : <><RefreshCw className="w-4 h-4" /> Run Diagnostics</>
                }
              </button>
              <span className="text-xs text-gray-500">
                Tests DB connection and checks if your account has admin privileges.
              </span>
            </div>

            {/* Results */}
            {connStatus && (
              <div className="space-y-3">
                {/* Connection result */}
                <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                  connStatus.ok
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  {connStatus.ok
                    ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  }
                  <div>
                    <div className={`text-sm font-medium ${connStatus.ok ? 'text-green-800' : 'text-red-800'}`}>
                      Database: {connStatus.ok ? 'Connected' : 'Connection Failed'}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">{connStatus.message}</div>
                  </div>
                </div>

                {/* Admin role result */}
                {adminStatus && (
                  <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                    adminStatus.isAdmin
                      ? 'bg-green-50 border-green-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    {adminStatus.isAdmin
                      ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      : <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    }
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${adminStatus.isAdmin ? 'text-green-800' : 'text-amber-800'}`}>
                        Admin Role: {adminStatus.isAdmin ? 'Granted ✓' : 'Not Set'}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {adminStatus.isAdmin
                          ? `${adminStatus.email} has admin privileges.`
                          : `${adminStatus.email || 'Your account'} does not have admin role. Operations like creating organizations will fail.`
                        }
                      </div>

                      {!adminStatus.isAdmin && (
                        <div className="mt-3 space-y-3">
                          {/* Claim admin button */}
                          <button
                            onClick={handleClaimAdmin}
                            disabled={claiming}
                            className="btn-primary text-sm py-1.5"
                          >
                            {claiming
                              ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" /> Claiming...</>
                              : 'Claim Admin Access (if first admin)'
                            }
                          </button>

                          {claimResult && (
                            <div className={`flex items-start gap-2 p-2 rounded text-xs ${
                              claimResult.success
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {claimResult.success
                                ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                : <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              }
                              {claimResult.message}
                            </div>
                          )}

                          {/* Manual SQL fallback */}
                          <div>
                            <p className="text-xs text-gray-600 mb-1">
                              Or run this in <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline inline-flex items-center gap-0.5">Supabase SQL Editor <ExternalLink className="w-3 h-3" /></a>:
                            </p>
                            <div className="relative bg-gray-900 rounded p-2.5">
                              <code className="text-green-400 text-xs font-mono">{adminSQL}</code>
                              <button
                                onClick={() => copySQL(adminSQL)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
                                title="Copy SQL"
                              >
                                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Schema reminder */}
                {connStatus.ok && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 border">
                    <strong>Schema not applied yet?</strong> Run <code className="bg-gray-200 px-1 rounded">supabase/schema.sql</code> in
                    your Supabase SQL Editor (Project → SQL Editor → New Query).
                    Make sure to also run the <code className="bg-gray-200 px-1 rounded">app_users</code> table creation snippet
                    if you're updating from an earlier version.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Settings page ────────────────────────────────────────────────────────

export default function Settings() {
  const [settings, setSettings] = useState({
    orgDisplayName: '',
    toolSubtitle: '',
    logoUrl: '',
    primaryColor: '',
    footerLeft: '',
    footerRight: '',
    contactEmail: '',
    contactUrl: '',
    guestOrgCode: '',
    disclaimer: '',
    requireDisclaimerAccept: false,
    disclaimerCheckboxLabel: 'I have read and agree to the terms of this assessment',
  });
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [colorPreview, setColorPreview] = useState('');

  useEffect(() => {
    const stored = getSettings();
    if (Object.keys(stored).length > 0) {
      setSettings(s => ({ ...s, ...stored }));
      setColorPreview(stored.primaryColor || '');
    }
  }, []);

  function handleChange(field, value) {
    setSettings(s => ({ ...s, [field]: value }));
    setSaved(false);
    // Live-preview color changes immediately
    if (field === 'primaryColor') {
      setColorPreview(value);
      applyPrimaryColor(value);
    }
  }

  function handleSave() {
    saveSettings(settings);
    // Apply the color right now so it persists after save
    if (settings.primaryColor) applyPrimaryColor(settings.primaryColor);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Branding & Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Customize how the assessment tool appears to users. Settings are saved locally in this browser.
        </p>
      </div>

      {/* Supabase diagnostics */}
      <SupabaseDiagnostics />

      {/* Organization Branding */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-800">Organization Branding</h2>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="label">Organization Display Name</label>
            <input
              type="text"
              value={settings.orgDisplayName}
              onChange={e => handleChange('orgDisplayName', e.target.value)}
              placeholder="e.g. Acme Corp Security Assessment"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Replaces "CIS RAM v2.1" as the tool name shown on the home page and header.
            </p>
          </div>

          <div>
            <label className="label">Tool Subtitle</label>
            <input
              type="text"
              value={settings.toolSubtitle}
              onChange={e => handleChange('toolSubtitle', e.target.value)}
              placeholder="Risk Assessment Tool"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Shown below the tool name in the header. Default: "Risk Assessment Tool".
            </p>
          </div>

          <div>
            <label className="label">Logo URL</label>
            <input
              type="url"
              value={settings.logoUrl}
              onChange={e => handleChange('logoUrl', e.target.value)}
              placeholder="https://example.com/your-logo.png"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              If set, displays your logo instead of the shield icon on the home page and report.
            </p>
            {settings.logoUrl && (
              <div className="mt-2">
                <img
                  src={settings.logoUrl}
                  alt="Logo preview"
                  className="h-12 object-contain border rounded p-1 bg-gray-50"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="label">Primary Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.primaryColor || '#0d4a4a'}
                onChange={e => handleChange('primaryColor', e.target.value)}
                className="h-9 w-16 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={e => handleChange('primaryColor', e.target.value)}
                placeholder="#0d4a4a"
                className="input-field flex-1 font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Changes buttons, sidebar, and accent colors across the tool. Preview updates live — click Save to persist.
            </p>
            {colorPreview && /^#[0-9a-fA-F]{6}$/.test(colorPreview) && (
              <div className="mt-2 flex items-center gap-2">
                {[50, 100, 200, 400, 600, 700, 900].map(shade => (
                  <div
                    key={shade}
                    className="w-6 h-6 rounded border border-gray-200 flex-shrink-0"
                    style={{ backgroundColor: colorPreview }}
                    title={`primary-${shade}`}
                  />
                ))}
                <span className="text-xs text-gray-400">Live preview — changes applied immediately</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-800">Footer Text</h2>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="label">Footer Left Text</label>
            <input
              type="text"
              value={settings.footerLeft}
              onChange={e => handleChange('footerLeft', e.target.value)}
              placeholder="CIS RAM v2.1 Risk Assessment Tool — Based on CIS Controls v8.1"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Displayed on the left side of the footer bar.
            </p>
          </div>
          <div>
            <label className="label">Footer Right Text</label>
            <input
              type="text"
              value={settings.footerRight}
              onChange={e => handleChange('footerRight', e.target.value)}
              placeholder="Center for Internet Security"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Displayed on the right side of the footer bar.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-800">Contact Information</h2>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="label">Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={e => handleChange('contactEmail', e.target.value)}
              placeholder="support@example.com"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Shown as a clickable <code className="bg-gray-100 px-1 rounded">mailto:</code> link in the footer. Leave blank to hide.
            </p>
          </div>
          <div>
            <label className="label">Contact URL</label>
            <input
              type="url"
              value={settings.contactUrl}
              onChange={e => handleChange('contactUrl', e.target.value)}
              placeholder="https://example.com/contact"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Shown as a clickable link in the footer. Leave blank to hide.
            </p>
          </div>
        </div>
      </div>

      {/* Guest Access */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Users className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-800">Guest Access</h2>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="label">Guest Organization Code</label>
            <input
              type="text"
              value={settings.guestOrgCode}
              onChange={e => handleChange('guestOrgCode', e.target.value.toUpperCase())}
              placeholder="e.g. GUEST or DEMO001"
              className="input-field font-mono uppercase"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              When set, a "Continue as Guest" link appears on the home page. Guests are assigned to this organization code automatically. The org code must exist in your organizations list. Leave blank to disable guest access.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-800">Disclaimer & Consent</h2>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="label">Disclaimer Text</label>
            <textarea
              value={settings.disclaimer}
              onChange={e => handleChange('disclaimer', e.target.value)}
              placeholder="Enter a disclaimer or terms statement to show above the assessment form. Leave blank to hide."
              rows={4}
              className="input-field resize-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Shown in a highlighted box above the start form on the home page.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="requireAccept"
              checked={settings.requireDisclaimerAccept}
              onChange={e => handleChange('requireDisclaimerAccept', e.target.checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="requireAccept" className="text-sm font-medium text-gray-700 cursor-pointer">
                Require users to check a box before starting
              </label>
              <p className="text-xs text-gray-500">
                If enabled, users must accept the disclaimer before they can submit the form.
              </p>
            </div>
          </div>

          {settings.requireDisclaimerAccept && (
            <div>
              <label className="label">Checkbox Label</label>
              <input
                type="text"
                value={settings.disclaimerCheckboxLabel}
                onChange={e => handleChange('disclaimerCheckboxLabel', e.target.value)}
                placeholder="I have read and agree to the terms of this assessment"
                className="input-field"
              />
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      {settings.disclaimer && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary-600" />
              <h2 className="font-semibold text-gray-800">Disclaimer Preview</h2>
            </div>
            <button
              onClick={() => setPreviewOpen(o => !o)}
              className="btn-secondary text-sm py-1.5"
            >
              {previewOpen ? 'Hide' : 'Show'} Preview
            </button>
          </div>
          {previewOpen && (
            <div className="card-body">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Important Notice
                </div>
                <p className="whitespace-pre-wrap">{settings.disclaimer}</p>
                {settings.requireDisclaimerAccept && (
                  <div className="flex items-start gap-2 mt-3 pt-3 border-t border-amber-200">
                    <input type="checkbox" className="mt-0.5" readOnly />
                    <label className="text-sm text-amber-800 cursor-pointer">
                      {settings.disclaimerCheckboxLabel}
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="btn-primary"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
        {saved && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <CheckSquare className="w-4 h-4" />
            Settings saved successfully
          </span>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Branding settings (color, logo, name, disclaimer) are saved in your browser's local storage.
        They apply to anyone using this browser. For multi-admin consistency, each admin browser needs
        to save their own copy. Color changes take effect immediately — no rebuild needed.
      </p>
    </div>
  );
}
