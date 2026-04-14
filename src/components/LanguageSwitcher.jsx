import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loadLanguageManifest } from '../i18n';

export default function LanguageSwitcher({ className = '' }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [languages, setLanguages] = useState([
    { code: 'en', name: 'English', nativeName: 'English' },
  ]);
  const ref = useRef(null);

  // Load manifest once on mount
  useEffect(() => {
    loadLanguageManifest()
      .then(manifest => {
        if (manifest?.languages?.length) setLanguages(manifest.languages);
      })
      .catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Don't render the switcher if there's only one language
  if (languages.length <= 1) return null;

  const current = languages.find(l => l.code === i18n.language) ||
                  languages.find(l => i18n.language?.startsWith(l.code)) ||
                  languages[0];

  function selectLanguage(code) {
    i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        title={t('languageSwitcher.tooltip', 'Change language')}
        className="flex items-center gap-1.5 text-sm text-primary-200 hover:text-white transition-colors px-1.5 py-1 rounded"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:inline font-medium">{current.nativeName || current.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => selectLanguage(lang.code)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{lang.nativeName || lang.name}</span>
                {lang.nativeName && lang.nativeName !== lang.name && (
                  <span className="text-xs text-gray-400">{lang.name}</span>
                )}
              </div>
              {(i18n.language === lang.code || i18n.language?.startsWith(lang.code + '-')) && (
                <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
