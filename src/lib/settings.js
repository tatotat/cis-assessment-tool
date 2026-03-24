const SETTINGS_KEY = 'cis_tool_branding';

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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
