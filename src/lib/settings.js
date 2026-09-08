import { useState, useEffect } from 'react';
import { fetchAppSettings } from './supabase';

/**
 * Settings live in a single shared server document (app_settings table,
 * see fetchAppSettings/saveAppSettings in supabase.js). localStorage is only
 * a cache so the first paint is branded before the network round-trip, and
 * the demo-mode fallback. `useSettings()` re-renders consumers when the
 * cache is refreshed from the server or saved by an admin.
 */
const SETTINGS_KEY = 'cis_tool_branding';
const SETTINGS_EVENT = 'cis-settings-updated';

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

// Write the local cache and notify useSettings() subscribers.
export function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

// Pull the shared document from the server into the cache. Returns the
// settings object, or null if nothing came back (network error / demo empty).
export async function syncSettingsFromServer() {
  try {
    const { data, error } = await fetchAppSettings();
    if (error || !data || typeof data !== 'object') return null;
    if (Object.keys(data).length === 0) return null;
    saveSettings(data);
    if (data.primaryColor) applyPrimaryColor(data.primaryColor);
    return data;
  } catch {
    return null;
  }
}

// React hook: current settings, updated whenever the cache changes.
export function useSettings() {
  const [settings, setSettings] = useState(() => getSettings());
  useEffect(() => {
    const onChange = () => setSettings(getSettings());
    window.addEventListener(SETTINGS_EVENT, onChange);
    return () => window.removeEventListener(SETTINGS_EVENT, onChange);
  }, []);
  return settings;
}

// ── Primary color runtime theming ─────────────────────────────────────────────

/** Convert a 6-digit hex color to [r, g, b] (0-255 each). */
function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/**
 * Mix rgb [r,g,b] toward `target` (255 = white, 0 = black) by `factor` (0-1).
 * Returns a space-separated string like "13 74 74" for CSS variable use.
 */
function mixRgb(rgb, factor, target = 255) {
  return rgb
    .map(x => Math.round(Math.max(0, Math.min(255, x + (target - x) * factor))))
    .join(' ');
}

/**
 * Given a hex color treated as the "600" brand shade, generate all 10 shades
 * (50–900) as space-separated RGB strings ready for CSS variables.
 *
 * @param {string} hex  e.g. "#0d4a4a"
 * @returns {Record<string, string>}  e.g. { 600: "13 74 74", 700: "10 56 56", ... }
 */
export function generatePrimaryShades(hex) {
  const rgb = hexToRgb(hex);
  return {
    50:  mixRgb(rgb, 0.93),        // lightest — mix heavily toward white
    100: mixRgb(rgb, 0.82),
    200: mixRgb(rgb, 0.66),
    300: mixRgb(rgb, 0.50),
    400: mixRgb(rgb, 0.30),
    500: mixRgb(rgb, 0.12),
    600: rgb.join(' '),            // the input color (primary button / sidebar)
    700: mixRgb(rgb, 0.18, 0),    // mix toward black
    800: mixRgb(rgb, 0.35, 0),
    900: mixRgb(rgb, 0.52, 0),    // darkest
  };
}

/**
 * Apply a hex color as the primary theme color by setting CSS custom properties
 * on the document root. Takes effect immediately — no page reload needed.
 *
 * @param {string} hex  6-digit hex, e.g. "#1a6b6b"
 */
export function applyPrimaryColor(hex) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  const shades = generatePrimaryShades(hex);
  const root = document.documentElement;
  Object.entries(shades).forEach(([shade, rgb]) => {
    root.style.setProperty(`--primary-${shade}`, rgb);
  });
}

/**
 * Apply all branding settings that have visual side-effects (color, etc.)
 * Call this on app startup to restore persisted branding.
 */
export function applyStoredBranding() {
  const { primaryColor } = getSettings();
  if (primaryColor) applyPrimaryColor(primaryColor);
}
