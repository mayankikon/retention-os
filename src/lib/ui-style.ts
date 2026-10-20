/**
 * App-wide visual style, independent of light/dark mode.
 * - `shift`: Shift 2.0 look (neutral grooved shell, Saira).
 * - `toolbox`: Smart Marketing 2026 Figma look (green sidebar, flat page, Barlow).
 */
export const UI_STYLE_IDS = ["shift", "toolbox"] as const;
export type UiStyleId = (typeof UI_STYLE_IDS)[number];

export const DEFAULT_UI_STYLE_ID: UiStyleId = "shift";
export const UI_STYLE_STORAGE_KEY = "retention-os-ui-style";
/** Set on `<html>`; `globals.css` keys the toolbox palette and fonts off it. */
export const UI_STYLE_ATTRIBUTE = "data-ui-style";

export function isUiStyleId(value: unknown): value is UiStyleId {
  return (UI_STYLE_IDS as readonly unknown[]).includes(value);
}

export function readStoredUiStyle(): UiStyleId {
  try {
    const stored = window.localStorage.getItem(UI_STYLE_STORAGE_KEY);
    return isUiStyleId(stored) ? stored : DEFAULT_UI_STYLE_ID;
  } catch {
    return DEFAULT_UI_STYLE_ID;
  }
}

export function writeStoredUiStyle(uiStyle: UiStyleId) {
  try {
    window.localStorage.setItem(UI_STYLE_STORAGE_KEY, uiStyle);
  } catch {
    // Storage can be blocked (private mode); the in-memory style still applies.
  }
}

export function applyUiStyleToDocument(uiStyle: UiStyleId) {
  document.documentElement.setAttribute(UI_STYLE_ATTRIBUTE, uiStyle);
}

/**
 * Inline `<head>` script so the stored style lands on `<html>` before first
 * paint (no Shift → Toolbox flash on reload).
 */
export const UI_STYLE_BOOTSTRAP_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  UI_STYLE_STORAGE_KEY,
)});document.documentElement.setAttribute(${JSON.stringify(
  UI_STYLE_ATTRIBUTE,
)},s===${JSON.stringify("toolbox")}?s:${JSON.stringify(
  DEFAULT_UI_STYLE_ID,
)});}catch(e){}})();`;
