import React, { useState, useEffect } from 'react';
import {
  Save, Eye, Shield, Palette, FileText, CheckSquare,
  Database, CheckCircle, XCircle, AlertTriangle, RefreshCw,
  Copy, Check, ExternalLink, AlignLeft, Mail, Globe, Users
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getSettings, saveSettings, applyPrimaryColor, syncSettingsFromServer } from '../../lib/settings';
import { IS_DEMO_MODE, testConnection, checkIsAdmin, claimFirstAdmin, saveAppSettings } from '../../lib/supabase';

// ── Supabase diagnostics panel ────────────────────────────────────────────────

function SupabaseDiagnostics() {
  const { t } = useTranslation();
  const [connStatus, setConnStatus] = useState(null);
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
    if (result.success) setAdminStatus(await checkIsAdmin());
    setClaiming(false);
  }

  function copySQL(sql) {
    navigator.clipboard.writeText(sql).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const adminEmail = adminStatus?.email || '—';
  const adminSQL = `UPDATE profiles SET role = 'admin' WHERE email = '${adminEmail}';`;
  const d = k => t(`admin.settingsPage.diag.${k}`);

  return (
    <div className="card">
      <div className="card-header flex items-center gap-2">
        <Database className="w-4 h-4 text-primary-600" />
        <h2 className="font-semibold text-gray-800">{d('title')}</h2>
      </div>
      <div className="card-body space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">{d('mode')}</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            IS_DEMO_MODE ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
            {IS_DEMO_MODE ? `🧪 ${d('demo')}` : `🌐 ${d('production')}`}
          </span>
          {IS_DEMO_MODE && (
            <span className="text-xs text-gray-500">
              {d('demoHint')} <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_URL</code> + <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> → <code className="bg-gray-100 px-1 rounded">.env.local</code>
            </span>
          )}
        </div>

        {!IS_DEMO_MODE && (
          <>
            <div className="flex items-center gap-3">
              <button onClick={runTests} disabled={testing} className="btn-secondary">
                {testing
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" /> {d('running')}</>
                  : <><RefreshCw className="w-4 h-4" /> {d('run')}</>}
              </button>
              <span className="text-xs text-gray-500">{d('runHint')}</span>
            </div>

            {connStatus && (
              <div className="space-y-3">
                <div className={`flex items-start gap-3 p-3 rounded-lg border ${connStatus.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  {connStatus.ok
                    ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
                  <div>
                    <div className={`text-sm font-medium ${connStatus.ok ? 'text-green-800' : 'text-red-800'}`}>
                      {d('dbLabel')} {connStatus.ok ? d('connected') : d('failed')}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">{connStatus.message}</div>
                  </div>
                </div>

                {adminStatus && (
                  <div className={`flex items-start gap-3 p-3 rounded-lg border ${adminStatus.isAdmin ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                    {adminStatus.isAdmin
                      ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      : <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${adminStatus.isAdmin ? 'text-green-800' : 'text-amber-800'}`}>
                        {d('adminRole')} {adminStatus.isAdmin ? d('granted') : d('notSet')}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {adminStatus.isAdmin
                          ? t('admin.settingsPage.diag.hasAdmin', { email: adminStatus.email })
                          : t('admin.settingsPage.diag.noAdmin', { email: adminStatus.email || d('yourAccount') })}
                      </div>

                      {!adminStatus.isAdmin && (
                        <div className="mt-3 space-y-3">
                          <button onClick={handleClaimAdmin} disabled={claiming} className="btn-primary text-sm py-1.5">
                            {claiming
                              ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" /> {d('claiming')}</>
                              : d('claim')}
                          </button>

                          {claimResult && (
                            <div className={`flex items-start gap-2 p-2 rounded text-xs ${claimResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {claimResult.success
                                ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                : <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                              {claimResult.message}
                            </div>
                          )}

                          <div>
                            <p className="text-xs text-gray-600 mb-1">
                              {d('orRun')} <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline inline-flex items-center gap-0.5">{d('sqlEditor')} <ExternalLink className="w-3 h-3" /></a>:
                            </p>
                            <div className="relative bg-gray-900 rounded p-2.5">
                              <code className="text-green-400 text-xs font-mono">{adminSQL}</code>
                              <button onClick={() => copySQL(adminSQL)} className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors" title={d('copySql')}>
                                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {connStatus.ok && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 border">
                    <strong>{d('schemaHintStrong')}</strong> {d('schemaHint')} <code className="bg-gray-200 px-1 rounded">supabase/schema.sql</code>
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

// ── Reusable field ────────────────────────────────────────────────────────────

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="card">
      <div className="card-header flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary-600" />
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="card-body space-y-4">{children}</div>
    </div>
  );
}

// ── Main Settings page ────────────────────────────────────────────────────────

export default function Settings() {
  const { t } = useTranslation();
  const s = k => t(`admin.settingsPage.${k}`);

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
    publicBaseUrl: '',
    disclaimer: '',
    requireDisclaimerAccept: false,
    disclaimerCheckboxLabel: '',
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [colorPreview, setColorPreview] = useState('');

  useEffect(() => {
    // Cached copy first (instant), then the authoritative server document
    const stored = getSettings();
    if (Object.keys(stored).length > 0) {
      setSettings(prev => ({ ...prev, ...stored }));
      setColorPreview(stored.primaryColor || '');
    }
    syncSettingsFromServer().then(server => {
      if (server) {
        setSettings(prev => ({ ...prev, ...server }));
        setColorPreview(server.primaryColor || '');
      }
    });
  }, []);

  function handleChange(field, value) {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
    if (field === 'primaryColor') {
      setColorPreview(value);
      applyPrimaryColor(value);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    const { error } = await saveAppSettings(settings);
    setSaving(false);
    if (error) {
      setSaveError(error.message || s('saveFailed'));
      return;
    }
    saveSettings(settings);
    if (settings.primaryColor) applyPrimaryColor(settings.primaryColor);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const input = (field, extra = {}) => (
    <input
      type={extra.type || 'text'}
      value={settings[field] ?? ''}
      onChange={e => handleChange(field, extra.transform ? extra.transform(e.target.value) : e.target.value)}
      placeholder={extra.placeholder || ''}
      className={`input-field ${extra.className || ''}`}
      maxLength={extra.maxLength}
    />
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{s('title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{s('subtitle')}</p>
      </div>

      <SupabaseDiagnostics />

      <Section icon={Palette} title={s('branding.title')}>
        <Field label={s('branding.nameLabel')} hint={s('branding.nameHint')}>
          {input('orgDisplayName', { placeholder: s('branding.namePlaceholder') })}
        </Field>
        <Field label={s('branding.subtitleLabel')} hint={s('branding.subtitleHint')}>
          {input('toolSubtitle', { placeholder: 'Risk Assessment Tool' })}
        </Field>
        <Field label={s('branding.logoLabel')} hint={s('branding.logoHint')}>
          {input('logoUrl', { type: 'url', placeholder: 'https://example.com/your-logo.png' })}
          {settings.logoUrl && (
            <div className="mt-2">
              <img src={settings.logoUrl} alt="" className="h-12 object-contain border rounded p-1 bg-gray-50"
                onError={e => { e.target.style.display = 'none'; }} />
            </div>
          )}
        </Field>
        <Field label={s('branding.colorLabel')} hint={s('branding.colorHint')}>
          <div className="flex gap-2 items-center">
            <input type="color" value={settings.primaryColor || '#0d4a4a'} onChange={e => handleChange('primaryColor', e.target.value)}
              className="h-9 w-16 rounded border cursor-pointer" aria-label={s('branding.colorLabel')} />
            <input type="text" value={settings.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)}
              placeholder="#0d4a4a" className="input-field flex-1 font-mono" />
          </div>
          {colorPreview && /^#[0-9a-fA-F]{6}$/.test(colorPreview) && (
            <div className="mt-2 flex items-center gap-2">
              {[50, 100, 200, 400, 600, 700, 900].map(shade => (
                <div key={shade} className="w-6 h-6 rounded border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: `rgb(var(--primary-${shade}, ${colorPreview}))` }} title={`primary-${shade}`} />
              ))}
              <span className="text-xs text-gray-400">{s('branding.livePreview')}</span>
            </div>
          )}
        </Field>
      </Section>

      <Section icon={AlignLeft} title={s('footer.title')}>
        <Field label={s('footer.leftLabel')} hint={s('footer.leftHint')}>
          {input('footerLeft', { placeholder: 'CIS RAM v2.1 Risk Assessment Tool — Based on CIS Controls v8.1' })}
        </Field>
        <Field label={s('footer.rightLabel')} hint={s('footer.rightHint')}>
          {input('footerRight', { placeholder: 'Center for Internet Security' })}
        </Field>
      </Section>

      <Section icon={Mail} title={s('contact.title')}>
        <Field label={s('contact.emailLabel')} hint={s('contact.emailHint')}>
          {input('contactEmail', { type: 'email', placeholder: 'support@example.com' })}
        </Field>
        <Field label={s('contact.urlLabel')} hint={s('contact.urlHint')}>
          {input('contactUrl', { type: 'url', placeholder: 'https://example.com/contact' })}
        </Field>
      </Section>

      <Section icon={Users} title={s('guest.title')}>
        <Field label={s('guest.label')} hint={s('guest.hint')}>
          {input('guestOrgCode', { placeholder: 'e.g. GUEST or DEMO001', className: 'font-mono uppercase', maxLength: 20, transform: v => v.toUpperCase() })}
        </Field>
      </Section>

      <Section icon={Globe} title={s('publicUrl.title')}>
        <Field label={s('publicUrl.label')} hint={s('publicUrl.hint')}>
          {input('publicBaseUrl', { type: 'url', placeholder: typeof window !== 'undefined' ? window.location.origin : 'https://assess.example.org', className: 'font-mono', transform: v => v.trim() })}
        </Field>
      </Section>

      <Section icon={FileText} title={s('disclaimer.title')}>
        <Field label={s('disclaimer.textLabel')} hint={s('disclaimer.textHint')}>
          <textarea value={settings.disclaimer} onChange={e => handleChange('disclaimer', e.target.value)}
            placeholder={s('disclaimer.textPlaceholder')} rows={4} className="input-field resize-none text-sm" />
        </Field>
        <div className="flex items-start gap-3">
          <input type="checkbox" id="requireAccept" checked={settings.requireDisclaimerAccept}
            onChange={e => handleChange('requireDisclaimerAccept', e.target.checked)} className="mt-1" />
          <div className="flex-1">
            <label htmlFor="requireAccept" className="text-sm font-medium text-gray-700 cursor-pointer">{s('disclaimer.requireLabel')}</label>
            <p className="text-xs text-gray-500">{s('disclaimer.requireHint')}</p>
          </div>
        </div>
        {settings.requireDisclaimerAccept && (
          <Field label={s('disclaimer.checkboxLabel')}>
            {input('disclaimerCheckboxLabel', { placeholder: t('home.disclaimerDefaultLabel') })}
          </Field>
        )}
      </Section>

      {settings.disclaimer && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary-600" />
              <h2 className="font-semibold text-gray-800">{s('preview.title')}</h2>
            </div>
            <button onClick={() => setPreviewOpen(o => !o)} className="btn-secondary text-sm py-1.5">
              {previewOpen ? s('preview.hide') : s('preview.show')}
            </button>
          </div>
          {previewOpen && (
            <div className="card-body">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t('home.importantNotice')}
                </div>
                <p className="whitespace-pre-wrap">{settings.disclaimer}</p>
                {settings.requireDisclaimerAccept && (
                  <div className="flex items-start gap-2 mt-3 pt-3 border-t border-amber-200">
                    <input type="checkbox" className="mt-0.5" readOnly />
                    <label className="text-sm text-amber-800">{settings.disclaimerCheckboxLabel || t('home.disclaimerDefaultLabel')}</label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Save className="w-4 h-4" />}
          {s('save')}
        </button>
        {saved && (
          <span className="text-sm text-green-600 flex items-center gap-1"><CheckSquare className="w-4 h-4" />{s('saved')}</span>
        )}
        {saveError && (
          <span className="text-sm text-red-600 flex items-center gap-1"><XCircle className="w-4 h-4" />{saveError}</span>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {s('footnote')}{IS_DEMO_MODE && ` ${s('footnoteDemo')}`}
      </p>
    </div>
  );
}
