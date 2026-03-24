import React, { useState, useEffect } from 'react';
import { Save, Eye, Shield, Palette, FileText, CheckSquare } from 'lucide-react';
import { getSettings, saveSettings } from '../../lib/settings';

export default function Settings() {
  const [settings, setSettings] = useState({
    orgDisplayName: '',
    logoUrl: '',
    primaryColor: '',
    disclaimer: '',
    requireDisclaimerAccept: false,
    disclaimerCheckboxLabel: 'I have read and agree to the terms of this assessment',
  });
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const stored = getSettings();
    if (Object.keys(stored).length > 0) {
      setSettings(s => ({ ...s, ...stored }));
    }
  }, []);

  function handleChange(field, value) {
    setSettings(s => ({ ...s, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveSettings(settings);
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
              Replaces "CIS RAM v2.1" as the tool name shown on the home page.
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
              If set, displays your logo instead of the shield icon on the home page.
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
            <label className="label">Primary Color (optional)</label>
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
              Stored for reference — used in customizations if you extend the tool.
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
        Settings are saved in your browser's local storage. They will apply to anyone using this browser.
        For organization-wide settings, you would need to configure these in the application code or a shared settings store.
      </p>
    </div>
  );
}
