import React, { useState, useEffect, useRef } from 'react';
import {
  Globe, Upload, Download, Plus, Trash2, Save, CheckCircle,
  AlertCircle, Info, Languages as LanguagesIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase, IS_DEMO_MODE } from '../../lib/supabase';
import { loadLanguageManifest } from '../../i18n';

const BUCKET = 'locales';

async function uploadToStorage(filename, content, mimeType = 'application/json') {
  if (IS_DEMO_MODE) {
    // Simulate success in demo mode
    await new Promise(r => setTimeout(r, 600));
    return { ok: true };
  }
  const blob = new Blob([content], { type: mimeType });
  const { error } = await supabase.storage.from(BUCKET).upload(filename, blob, {
    contentType: mimeType,
    upsert: true,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export default function Languages() {
  const { t, i18n } = useTranslation();

  // State
  const [manifest, setManifest] = useState({ languages: [] });
  const [loadingManifest, setLoadingManifest] = useState(true);

  // Upload pack
  const [packFile, setPackFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // { ok, message }

  // Add language form
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newNative, setNewNative] = useState('');

  // Save manifest
  const [savingManifest, setSavingManifest] = useState(false);
  const [manifestResult, setManifestResult] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadLanguageManifest()
      .then(m => setManifest(m || { languages: [] }))
      .finally(() => setLoadingManifest(false));
  }, []);

  // ── Upload pack ──────────────────────────────────────────────────────────────

  async function handleUpload() {
    if (!packFile) return;
    setUploading(true);
    setUploadResult(null);

    // Validate it's valid JSON
    try {
      const text = await packFile.text();
      JSON.parse(text); // validate

      const filename = packFile.name.endsWith('.json') ? packFile.name : packFile.name + '.json';
      const result = await uploadToStorage(filename, text);

      if (result.ok) {
        setUploadResult({ ok: true, message: t('languages.uploadSuccess') });
        setPackFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setUploadResult({ ok: false, message: `${t('languages.uploadError')}: ${result.error}` });
      }
    } catch (e) {
      setUploadResult({ ok: false, message: `Invalid JSON file: ${e.message}` });
    }

    setUploading(false);
  }

  // ── Manage manifest ──────────────────────────────────────────────────────────

  function handleAddLanguage() {
    const code = newCode.trim().toLowerCase();
    const name = newName.trim();
    const nativeName = newNative.trim();
    if (!code || !name) return;

    // Prevent duplicates
    if (manifest.languages.find(l => l.code === code)) return;

    setManifest(prev => ({
      ...prev,
      languages: [...prev.languages, { code, name, nativeName: nativeName || name }],
    }));
    setNewCode('');
    setNewName('');
    setNewNative('');
    setManifestResult(null);
  }

  function handleRemoveLanguage(code) {
    if (code === 'en') return; // never remove English
    setManifest(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l.code !== code),
    }));
    setManifestResult(null);
  }

  async function handleSaveManifest() {
    setSavingManifest(true);
    setManifestResult(null);

    const content = JSON.stringify(manifest, null, 2);
    const result = await uploadToStorage('manifest.json', content);

    if (result.ok) {
      setManifestResult({ ok: true, message: t('languages.manifestSaved') });
    } else {
      setManifestResult({ ok: false, message: result.error || 'Save failed.' });
    }
    setSavingManifest(false);
  }

  // ── Download English template ───────────────────────────────────────────────

  async function handleDownloadTemplate() {
    try {
      const res = await fetch('/locales/en.json');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'en.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallback: open in new tab
      window.open('/locales/en.json', '_blank');
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LanguagesIcon className="w-6 h-6 text-primary-600" />
          {t('languages.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('languages.description')}</p>
      </div>

      {/* Demo mode notice */}
      {IS_DEMO_MODE && (
        <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{t('languages.demoWarning')}</span>
        </div>
      )}

      {/* How it works */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Info className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-800">{t('languages.howItWorksTitle')}</h2>
        </div>
        <div className="card-body">
          <ol className="space-y-1.5 text-sm text-gray-700">
            {(t('languages.howItWorksSteps', { returnObjects: true }) || []).map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
            {t('languages.storageNote')}
          </p>
        </div>
      </div>

      {/* Upload language pack */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-800">{t('languages.uploadSection')}</h2>
        </div>
        <div className="card-body space-y-4">
          <p className="text-sm text-gray-600">{t('languages.uploadInstructions')}</p>

          {/* Download template */}
          <button
            onClick={handleDownloadTemplate}
            className="btn-secondary text-sm py-2 gap-2"
          >
            <Download className="w-4 h-4" />
            {t('languages.downloadTemplate')}
          </button>

          {/* File input + upload */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex-1 min-w-0">
              <span className="sr-only">{t('languages.selectFile')}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={e => { setPackFile(e.target.files?.[0] || null); setUploadResult(null); }}
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors"
              />
            </label>
            <button
              onClick={handleUpload}
              disabled={!packFile || uploading}
              className="btn-primary text-sm py-2 flex-shrink-0 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {t('languages.uploading')}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {t('languages.uploadButton')}
                </>
              )}
            </button>
          </div>

          {packFile && !uploadResult && (
            <p className="text-xs text-gray-500">
              Selected: <strong>{packFile.name}</strong> ({Math.round(packFile.size / 1024)} KB)
            </p>
          )}

          {uploadResult && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              uploadResult.ok
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {uploadResult.ok
                ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              }
              {uploadResult.message}
            </div>
          )}
        </div>
      </div>

      {/* Manage language list */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-800">{t('languages.manifestSection')}</h2>
        </div>
        <div className="card-body space-y-4">
          <p className="text-sm text-gray-600">{t('languages.manifestInstructions')}</p>

          {/* Current languages */}
          {loadingManifest ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
              Loading...
            </div>
          ) : manifest.languages.length === 0 ? (
            <p className="text-sm text-gray-400 italic">{t('languages.noLanguages')}</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs uppercase tracking-wide">Code</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs uppercase tracking-wide">Name</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs uppercase tracking-wide">Native</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {manifest.languages.map(lang => (
                    <tr key={lang.code} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-gray-700">{lang.code}</td>
                      <td className="px-3 py-2 text-gray-700">{lang.name}</td>
                      <td className="px-3 py-2 text-gray-700">{lang.nativeName}</td>
                      <td className="px-3 py-2 text-right">
                        {lang.code === 'en' ? (
                          <span className="text-xs text-gray-400">{t('languages.builtInLabel')}</span>
                        ) : (
                          <button
                            onClick={() => handleRemoveLanguage(lang.code)}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t('languages.removeLanguage')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add language */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">{t('languages.addLanguageTitle')}</h3>
            <div className="flex items-end gap-2 flex-wrap">
              <div className="w-20">
                <label className="label text-xs">{t('languages.codeLabel')}</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  placeholder={t('languages.codePlaceholder')}
                  className="input-field text-sm font-mono"
                  maxLength={5}
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="label text-xs">{t('languages.nameLabel')}</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder={t('languages.namePlaceholder')}
                  className="input-field text-sm"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="label text-xs">{t('languages.nativeLabel')}</label>
                <input
                  type="text"
                  value={newNative}
                  onChange={e => setNewNative(e.target.value)}
                  placeholder={t('languages.nativePlaceholder')}
                  className="input-field text-sm"
                />
              </div>
              <button
                onClick={handleAddLanguage}
                disabled={!newCode.trim() || !newName.trim()}
                className="btn-secondary text-sm py-2 flex-shrink-0 self-end disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {t('languages.addButton')}
              </button>
            </div>
          </div>

          {/* Save manifest */}
          <div className="flex items-center gap-3 pt-2 border-t">
            <button
              onClick={handleSaveManifest}
              disabled={savingManifest}
              className="btn-primary"
            >
              {savingManifest ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {t('languages.savingManifest')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('languages.saveManifest')}
                </>
              )}
            </button>
            {manifestResult && (
              <span className={`text-sm flex items-center gap-1 ${manifestResult.ok ? 'text-green-600' : 'text-red-600'}`}>
                {manifestResult.ok
                  ? <CheckCircle className="w-4 h-4" />
                  : <AlertCircle className="w-4 h-4" />
                }
                {manifestResult.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
