import React, { useEffect, useState } from 'react';
import {
  GraduationCap, ChevronDown, ChevronUp, Plus, Trash2, Save, RotateCcw, CheckCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTrainingCatalog, upsertTrainingEntry, resetTrainingEntry } from '../../lib/supabase';
import { DEFAULT_TRAINING, mergeCatalog } from '../../lib/trainingCatalog';
import clsx from 'clsx';

// Serialize resources [{label,url}] <-> textarea "label | url" per line
function resourcesToText(resources = []) {
  return resources.map(r => `${r.label || ''} | ${r.url || ''}`).join('\n');
}
function textToResources(text) {
  return text.split(/\r?\n/).map(line => {
    const [label, url] = line.split('|').map(s => s.trim());
    return label || url ? { label: label || url, url: url || '' } : null;
  }).filter(Boolean);
}

function ControlEditor({ entry, isCustom, onSave, onReset }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(entry);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setDraft(entry); }, [entry]);

  function updateTopic(idx, patch) {
    setDraft(d => ({ ...d, topics: d.topics.map((tp, i) => i === idx ? { ...tp, ...patch } : tp) }));
  }
  function addTopic() {
    setDraft(d => ({ ...d, topics: [...(d.topics || []), { topic: '', objective: '', resources: [] }] }));
  }
  function removeTopic(idx) {
    setDraft(d => ({ ...d, topics: d.topics.filter((_, i) => i !== idx) }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
      >
        <span className="font-mono text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">C{entry.control_number}</span>
        <span className="flex-1 font-medium text-gray-800">{draft.title}</span>
        {isCustom && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{t('admin.training.customized')}</span>}
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 py-4 border-t bg-gray-50 space-y-4">
          <div>
            <label className="label">{t('admin.training.fieldTitle')}</label>
            <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="label">{t('admin.training.fieldSummary')}</label>
            <textarea value={draft.summary || ''} onChange={e => setDraft(d => ({ ...d, summary: e.target.value }))} rows={2} className="input-field resize-y" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">{t('admin.training.topics')}</span>
              <button type="button" onClick={addTopic} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> {t('admin.training.addTopic')}
              </button>
            </div>
            {(draft.topics || []).map((tp, idx) => (
              <div key={idx} className="bg-white border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input value={tp.topic} onChange={e => updateTopic(idx, { topic: e.target.value })} placeholder={t('admin.training.topicName')} className="input-field text-sm flex-1" />
                  <button type="button" onClick={() => removeTopic(idx)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
                <input value={tp.objective} onChange={e => updateTopic(idx, { objective: e.target.value })} placeholder={t('admin.training.objective')} className="input-field text-sm" />
                <textarea
                  value={resourcesToText(tp.resources)}
                  onChange={e => updateTopic(idx, { resources: textToResources(e.target.value) })}
                  rows={2}
                  placeholder={t('admin.training.resourcesPlaceholder')}
                  className="input-field text-xs font-mono resize-y"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary text-sm">
              {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? t('admin.training.saved') : t('admin.training.save')}
            </button>
            {isCustom && (
              <button type="button" onClick={() => onReset(entry.control_number)} className="btn-secondary text-sm">
                <RotateCcw className="w-4 h-4" /> {t('admin.training.reset')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTraining() {
  const { t } = useTranslation();
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = getTrainingCatalog ? await getTrainingCatalog() : { data: [] };
    setOverrides(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const merged = mergeCatalog(overrides);

  async function handleSave(entry) {
    await upsertTrainingEntry(entry);
    load();
  }
  async function handleReset(controlNumber) {
    await resetTrainingEntry(controlNumber);
    load();
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary-600" />
          {t('admin.training.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('admin.training.subtitle')}</p>
      </div>

      <div className="space-y-2">
        {Object.values(DEFAULT_TRAINING).map(def => (
          <ControlEditor
            key={def.control_number}
            entry={merged[def.control_number]}
            isCustom={!!merged[def.control_number]?._customized}
            onSave={handleSave}
            onReset={handleReset}
          />
        ))}
      </div>
    </div>
  );
}
