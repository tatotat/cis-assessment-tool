/**
 * i18n.js — Runtime language loading for CIS RAM Assessment Tool
 *
 * Architecture:
 *  - Uses i18next-http-backend with a custom `request` function
 *  - For each language, tries Supabase Storage first (admin-uploaded packs)
 *  - Falls back to /locales/{lng}.json (static files on the server)
 *  - English (/locales/en.json) is always the fallback — no rebuild needed for new languages
 *
 * To add a language:
 *  1. Upload a translated JSON file to Supabase Storage bucket "locales"
 *  2. Update manifest.json in the same bucket (or via Admin → Languages page)
 *  3. Done — users see the new language immediately
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { supabase, IS_DEMO_MODE } from './lib/supabase';

/**
 * Try to load a translation file from Supabase Storage public bucket "locales".
 * Returns the parsed JSON, or null if unavailable / demo mode.
 */
async function trySupabaseStorage(lng) {
  if (IS_DEMO_MODE) return null;
  try {
    const { data } = supabase.storage.from('locales').getPublicUrl(`${lng}.json`);
    if (!data?.publicUrl) return null;
    // Add cache-buster so admins see fresh uploads immediately
    const res = await fetch(`${data.publicUrl}?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Load the language manifest (list of available languages).
 * Tries Supabase Storage first, falls back to /locales/manifest.json.
 */
export async function loadLanguageManifest() {
  const fromStorage = await trySupabaseStorage('manifest');
  if (fromStorage) return fromStorage;

  try {
    const res = await fetch('/locales/manifest.json');
    if (res.ok) return res.json();
  } catch {}

  // Hard fallback
  return { languages: [{ code: 'en', name: 'English', nativeName: 'English' }] };
}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: false,          // allow any language code
    nonExplicitSupportedLngs: true,

    ns: ['translation'],
    defaultNS: 'translation',

    interpolation: { escapeValue: false },

    // Persist user's language choice in localStorage
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'cis_tool_language',
    },

    backend: {
      loadPath: '/locales/{{lng}}.json',
      /**
       * Custom request function:
       *   1. Try Supabase Storage (admin-uploaded pack)
       *   2. Fall back to static /locales/ file
       */
      request: async (_options, url, _payload, callback) => {
        // Extract language code from the URL pattern
        const lngMatch = url.match(/\/locales\/([^/]+)\.json/);
        const lng = lngMatch?.[1];

        // 1. Try Supabase Storage
        if (lng) {
          const fromStorage = await trySupabaseStorage(lng);
          if (fromStorage) {
            callback(null, { status: 200, data: JSON.stringify(fromStorage) });
            return;
          }
        }

        // 2. Static file fallback
        try {
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            callback(null, { status: 200, data: text });
          } else {
            callback(new Error(`HTTP ${res.status} for ${url}`), { status: res.status, data: '' });
          }
        } catch (err) {
          callback(err, { status: 0, data: '' });
        }
      },
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;
