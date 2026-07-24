export const THEME_NAMES = {
  kehua: "Kehua",
  writecho: "Writecho",
  printer: "Printer",
  vermillion: "Vermillion",
  // simplecho: "Simplecho",
  chatgpt: "ChatGPT",
} as const;

export type ThemeName = keyof typeof THEME_NAMES;

// 数据库读取失败、配置缺失或主题名无效时使用的前台主题。
export const CURRENT_THEME: ThemeName = "kehua";
export const DEFAULT_THEME: ThemeName = CURRENT_THEME;

export const THEME_OPTIONS = Object.entries(THEME_NAMES) as Array<
  [ThemeName, (typeof THEME_NAMES)[ThemeName]]
>;

export function normalizeThemeName(
  value: string | undefined | null,
): ThemeName {
  return value && Object.hasOwn(THEME_NAMES, value)
    ? (value as ThemeName)
    : DEFAULT_THEME;
}

export function themeAssetPath(theme: ThemeName, fileName: string): string {
  const normalized = fileName.replace(/^\/+/, "");
  return `/${theme}/${normalized}`;
}
