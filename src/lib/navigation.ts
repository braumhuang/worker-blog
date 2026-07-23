import type {
  NavigationItem,
  NavigationSection,
  NavigationTemplate,
  OptionMap,
} from "../types";

export const FIXED_NAVIGATION_IDS = [
  "home",
  "memos",
  "archives",
  "categories",
  "tags",
  "links",
] as const;
export type FixedNavigationId = (typeof FIXED_NAVIGATION_IDS)[number];

export const DEFAULT_FIXED_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "home",
    name: "首页",
    url: "/",
    visible: true,
    section: "fixed",
    order: 10,
  },
  {
    id: "memos",
    name: "闪念",
    url: "/memos",
    visible: true,
    section: "fixed",
    order: 20,
  },
  {
    id: "archives",
    name: "归档",
    url: "/archives",
    visible: true,
    section: "fixed",
    order: 30,
  },
  {
    id: "categories",
    name: "分类",
    url: "/categories",
    visible: false,
    section: "fixed",
    order: 40,
  },
  {
    id: "tags",
    name: "标签",
    url: "/tags",
    visible: true,
    section: "fixed",
    order: 50,
  },
  {
    id: "links",
    name: "友链",
    url: "/links",
    visible: true,
    section: "fixed",
    order: 60,
  },
];

export const DEFAULT_CUSTOM_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "about",
    name: "关于",
    url: "/post/about",
    visible: true,
    section: "custom",
    template: "about",
    order: 10,
  },
];

export const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
  ...DEFAULT_FIXED_NAVIGATION_ITEMS,
  ...DEFAULT_CUSTOM_NAVIGATION_ITEMS,
];

const FIXED_BY_ID = new Map(
  DEFAULT_FIXED_NAVIGATION_ITEMS.map((item) => [item.id, item]),
);
const FIXED_IDS = new Set<string>(FIXED_NAVIGATION_IDS);

export function navigationItemRules(id: string): {
  section: NavigationSection;
  required: boolean;
  canDelete: boolean;
  canEditUrl: boolean;
  canHide: boolean;
  canEditTemplate: boolean;
} {
  const fixed = FIXED_IDS.has(id);
  return {
    section: fixed ? "fixed" : "custom",
    required: fixed,
    canDelete: !fixed,
    canEditUrl: !fixed,
    canHide: id !== "home",
    canEditTemplate: !fixed,
  };
}

function cleanNavigationName(value: unknown, fallback: string): string {
  const name = String(value ?? "")
    .trim()
    .slice(0, 40);
  return name || fallback;
}

export function normalizeNavigationUrl(value: unknown, fallback = "/"): string {
  const input = String(value ?? "")
    .trim()
    .slice(0, 1000);
  if (!input) return fallback;
  if (
    input.startsWith("/") &&
    !input.startsWith("//") &&
    !/[\s\\]/.test(input)
  ) {
    return input === "/" ? "/" : input.replace(/\/+$/, "") || "/";
  }
  try {
    const url = new URL(input);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
}

function normalizeTemplate(value: unknown): NavigationTemplate {
  return value === "about" ? "about" : "page";
}

export function normalizeNavigationOrder(value: unknown, fallback = 0): number {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(-2147483648, Math.min(2147483647, parsed));
}

function navigationItemCompare(
  left: NavigationItem,
  right: NavigationItem,
): number {
  const byOrder = left.order - right.order;
  if (byOrder !== 0) return byOrder;
  const byName = left.name.localeCompare(right.name, "zh-CN", {
    numeric: true,
    sensitivity: "base",
  });
  return byName || left.id.localeCompare(right.id);
}

function sortNavigationSections(
  fixed: NavigationItem[],
  custom: NavigationItem[],
): NavigationItem[] {
  return [
    ...fixed.sort(navigationItemCompare),
    ...custom.sort(navigationItemCompare),
  ];
}

function cloneDefaults(): NavigationItem[] {
  return DEFAULT_NAVIGATION_ITEMS.map((item) => ({ ...item }));
}

export function normalizeNavigationItems(
  raw: string | undefined,
): NavigationItem[] {
  if (!raw?.trim()) return cloneDefaults();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return cloneDefaults();
  }
  if (!Array.isArray(parsed)) return cloneDefaults();

  const fixed: NavigationItem[] = [];
  const custom: NavigationItem[] = [];
  const seen = new Set<string>();
  let fixedPosition = 0;
  let customPosition = 0;

  for (const value of parsed.slice(0, 60)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const source = value as Record<string, unknown>;
    const id = String(source.id ?? "")
      .trim()
      .slice(0, 100);
    if (!id || seen.has(id)) continue;

    const fallback = FIXED_BY_ID.get(id);
    const isCustom = id === "about" || /^custom-[A-Za-z0-9-]{1,90}$/.test(id);
    if (!fallback && !isCustom) continue;

    if (fallback) {
      fixedPosition += 1;
      fixed.push({
        id,
        name: cleanNavigationName(
          id === "links" && source.name === "导航" ? "友链" : source.name,
          fallback.name,
        ),
        url: fallback.url,
        visible: id === "home" ? true : source.visible !== false,
        section: "fixed",
        order: normalizeNavigationOrder(source.order, fixedPosition * 10),
      });
    } else {
      customPosition += 1;
      custom.push({
        id,
        name: cleanNavigationName(
          source.name,
          id === "about" ? "关于" : "新菜单",
        ),
        url: normalizeNavigationUrl(
          source.url,
          id === "about" ? "/post/about" : "/",
        ),
        visible: source.visible !== false,
        section: "custom",
        template: normalizeTemplate(
          source.template ?? (id === "about" ? "about" : "page"),
        ),
        order: normalizeNavigationOrder(source.order, customPosition * 10),
      });
    }
    seen.add(id);
  }

  for (const id of FIXED_NAVIGATION_IDS) {
    if (seen.has(id)) continue;
    const fallback = FIXED_BY_ID.get(id);
    if (fallback) fixed.push({ ...fallback });
  }

  return sortNavigationSections(fixed, custom);
}

export function navigationItemsFromOptions(
  options: OptionMap,
): NavigationItem[] {
  return normalizeNavigationItems(options.navigation_menu);
}

export function navigationSectionsFromOptions(options: OptionMap): {
  fixed: NavigationItem[];
  custom: NavigationItem[];
} {
  const items = navigationItemsFromOptions(options);
  return {
    fixed: items.filter((item) => item.section === "fixed"),
    custom: items.filter((item) => item.section === "custom"),
  };
}

export function serializeNavigationItems(items: NavigationItem[]): string {
  return JSON.stringify(
    items.map(({ id, name, url, visible, section, template, order }) => ({
      id,
      name,
      url,
      visible,
      section,
      order,
      ...(section === "custom"
        ? { template: template === "about" ? "about" : "page" }
        : {}),
    })),
  );
}

function postSlugFromUrl(url: string): string | null {
  if (!url.startsWith("/") || url.startsWith("//")) return null;
  const match = /^\/post\/([^/?#]+)\/?$/.exec(url);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function customNavigationItemForSlug(
  options: OptionMap,
  slug: string,
): NavigationItem | undefined {
  return navigationSectionsFromOptions(options).custom.find(
    (item) => postSlugFromUrl(item.url) === slug,
  );
}
