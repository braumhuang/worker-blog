import type { OptionMap } from "../types";

const DEFAULT_FAVICON_COLOR = "#999999";

export function normalizeFaviconColor(
  value: string,
  fallback = DEFAULT_FAVICON_COLOR,
): string {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return fallback;
  const raw = match[1].toUpperCase();
  const hex =
    raw.length === 3
      ? raw
          .split("")
          .map((char) => char + char)
          .join("")
      : raw;
  return `#${hex}`;
}

export function normalizeFaviconText(value: string, fallback = "B"): string {
  const text = Array.from(value.trim()).slice(0, 2).join("");
  return text || Array.from(fallback.trim()).slice(0, 2).join("") || "B";
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function renderFaviconSvg(options: OptionMap): string {
  const fallbackText = Array.from(options.site_title?.trim() || "B")[0] || "B";
  const text = normalizeFaviconText(options.favicon_text, fallbackText);
  const color = normalizeFaviconColor(options.favicon_color);
  const fontSize = Array.from(text).length > 1 ? 28 : 40;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${escapeXml(text)}">
  <rect width="64" height="64" rx="14" fill="${color}"/>
  <text x="32" y="33" fill="#fff" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif" font-size="${fontSize}" font-weight="700" text-anchor="middle" dominant-baseline="middle">${escapeXml(text)}</text>
</svg>`;
}
