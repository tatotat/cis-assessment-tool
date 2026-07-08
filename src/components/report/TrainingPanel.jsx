import React, { useEffect, useState, useMemo } from 'react';
import { GraduationCap, ExternalLink, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getControlScores } from '../../lib/calculations';
import { getTrainingCatalog } from '../../lib/supabase';
import { mergeCatalog } from '../../lib/trainingCatalog';

/**
 * Per-person training suggestions: the assessor's weakest controls mapped to
 * catalog entries. Works in the anonymous report flow (catalog via public RPC).
 */
export default function TrainingPanel({ responses, igLevel }) {
  const { t } = useTranslation();
  const [overrides, setOverrides] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getTrainingCatalog().then(({ data }) => { if (!cancelled) setOverrides(data || []); });
    return () => { cancelled = true; };
  }, []);

  const catalog = useMemo(() => mergeCatalog(overrides), [overrides]);

  // Worst controls above the acceptable threshold, by average risk score
  const focus = useMemo(() => {
    const scores = getControlScores(responses, igLevel);
    const acceptableMax = igLevel === 1 ? 6 : 9;
    return scores
      .filter(c => c.count > 0 && c.avgScore >= acceptableMax)
      .sort((a, b) => b.normalizedScore - a.normalizedScore)
      .slice(0, 5)
      .map(c => ({ ...c, entry: catalog[c.control] }));
  }, [responses, igLevel, catalog]);

  if (focus.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
        {t('report.training.none')}
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-primary-600" />
        {t('report.training.heading')}
      </h3>
      <p className="text-sm text-gray-500 mb-4">{t('report.training.intro')}</p>

      <div className="space-y-3">
        {focus.map(c => (
          <div key={c.control} className="border rounded-xl p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">C{c.control}</span>
              <span className="font-semibold text-gray-800">{c.entry?.title || c.name}</span>
              <span className="ml-auto text-xs text-gray-400">
                {t('report.training.exposure', { pct: Math.round(c.normalizedScore) })}
              </span>
            </div>
            {c.entry?.summary && <p className="text-sm text-gray-600 mt-2">{c.entry.summary}</p>}
            {c.entry?.topics?.length > 0 && (
              <ul className="mt-3 space-y-2">
                {c.entry.topics.map((tp, i) => (
                  <li key={i} className="text-sm">
                    <div className="font-medium text-gray-700">{tp.topic}</div>
                    {tp.objective && <div className="text-xs text-gray-500">{tp.objective}</div>}
                    {(tp.resources || []).filter(r => r.url).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {tp.resources.filter(r => r.url).map((r, j) => (
                          <a key={j} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline">
                            {r.label} <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
