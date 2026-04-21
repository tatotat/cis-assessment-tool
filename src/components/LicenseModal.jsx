import React, { useEffect } from 'react';
import { X, Scale, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LicenseModal({ open, onClose }) {
  const { t } = useTranslation();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="license-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary-600" />
            <h2 id="license-title" className="font-bold text-gray-900 text-lg">
              {t('license.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label={t('license.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm text-gray-700">
          {/* AGPL section */}
          <section>
            <h3 className="font-semibold text-gray-900 mb-1.5">
              {t('license.softwareHeading')}
            </h3>
            <p className="mb-2">{t('license.softwareLine1')}</p>
            <p className="mb-2">{t('license.softwareLine2')}</p>
            <p className="text-xs text-gray-500 italic">{t('license.softwareAgplNote')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="https://www.gnu.org/licenses/agpl-3.0.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 underline"
              >
                {t('license.fullAgplLink')}
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 underline"
              >
                {t('license.repoLicenseLink')}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </section>

          {/* Third-party content */}
          <section className="pt-4 border-t">
            <h3 className="font-semibold text-gray-900 mb-1.5">
              {t('license.thirdPartyHeading')}
            </h3>
            <p className="mb-3 text-xs text-gray-600">{t('license.thirdPartyIntro')}</p>

            <ul className="space-y-3">
              <li className="pl-3 border-l-2 border-gray-200">
                <div className="font-medium text-gray-800">{t('license.cisControls.title')}</div>
                <div className="text-xs text-gray-600 mt-0.5">{t('license.cisControls.copyright')}</div>
                <div className="text-xs text-gray-600 mt-1">{t('license.cisControls.terms')}</div>
              </li>
              <li className="pl-3 border-l-2 border-gray-200">
                <div className="font-medium text-gray-800">{t('license.cisRam.title')}</div>
                <div className="text-xs text-gray-600 mt-0.5">{t('license.cisRam.copyright')}</div>
                <div className="text-xs text-gray-600 mt-1">{t('license.cisRam.terms')}</div>
              </li>
              <li className="pl-3 border-l-2 border-gray-200">
                <div className="font-medium text-gray-800">{t('license.vcdb.title')}</div>
                <div className="text-xs text-gray-600 mt-0.5">{t('license.vcdb.copyright')}</div>
              </li>
            </ul>

            <a
              href="https://www.cisecurity.org/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 underline mt-3"
            >
              {t('license.cisTermsLink')}
              <ExternalLink className="w-3 h-3" />
            </a>
          </section>

          {/* Trademarks */}
          <section className="pt-4 border-t">
            <h3 className="font-semibold text-gray-900 mb-1.5">
              {t('license.trademarksHeading')}
            </h3>
            <p className="text-xs text-gray-600">{t('license.trademarksText')}</p>
          </section>

          {/* Warranty */}
          <section className="pt-4 border-t">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
              <strong className="uppercase text-xs tracking-wide">
                {t('license.noWarrantyHeading')}
              </strong>
              <p className="mt-1">{t('license.noWarrantyText')}</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-gray-50 rounded-b-xl flex justify-end">
          <button onClick={onClose} className="btn-secondary text-sm py-1.5">
            {t('license.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
