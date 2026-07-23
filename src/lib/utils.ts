import type { AttachmentInfo, BlogContent, ContentType } from "../types";

export const SESSION_SECONDS = 10 * 24 * 60 * 60;
export const RENEW_BEFORE_SECONDS = 2 * 24 * 60 * 60;

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function positiveInt(
  value: unknown,
  fallback: number,
  max = 1000,
): number {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

export function intValue(value: unknown, fallback = 0): number {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function slugify(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return slug || crypto.randomUUID().slice(0, 8);
}

export function draftSlug(type: ContentType): string {
  return `${type}-draft-${crypto.randomUUID()}`;
}

export function formatDate(
  timestamp: number,
  includeTime = false,
  timeZone = "Asia/Shanghai",
): string {
  const options: Intl.DateTimeFormatOptions = includeTime
    ? {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone,
      }
    : { year: "numeric", month: "2-digit", day: "2-digit", timeZone };
  return new Intl.DateTimeFormat("zh-CN", options)
    .format(new Date(timestamp * 1000))
    .replaceAll("/", "-");
}

export function isoDate(timestamp: number, timeZone = "Asia/Shanghai"): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(new Date(timestamp * 1000));
  const pick = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

function dateParts(
  timestampMs: number,
  timeZone: string,
): Record<string, number> {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(new Date(timestampMs));
  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
}

export function datetimeLocal(
  timestamp: number,
  timeZone = "Asia/Shanghai",
): string {
  const parts = dateParts(timestamp * 1000, timeZone);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

export function parseDatetimeLocal(
  value: string,
  fallback: number,
  timeZone = "Asia/Shanghai",
): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return fallback;
  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const wallTime = Date.UTC(
    Number(yearText),
    Number(monthText) - 1,
    Number(dayText),
    Number(hourText),
    Number(minuteText),
    0,
  );
  let instant = wallTime;
  try {
    for (let index = 0; index < 3; index += 1) {
      const parts = dateParts(instant, timeZone);
      const represented = Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
      );
      instant += wallTime - represented;
    }
  } catch {
    return fallback;
  }
  return Math.floor(instant / 1000);
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/<!--\s*more\s*-->/gi, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[>*_~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerptOf(text: string, limit = 200): string {
  const beforeMore = text.split(/<!--\s*more\s*-->/i)[0];
  const clean = stripMarkdown(beforeMore);
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).trim()}…`;
}

export function readingMinutes(text: string): number {
  const clean = stripMarkdown(text);
  const cjk = (clean.match(/[\u3400-\u9fff]/g) ?? []).length;
  const words = (
    clean.replace(/[\u3400-\u9fff]/g, " ").match(/[A-Za-z0-9]+/g) ?? []
  ).length;
  return Math.max(1, Math.ceil(cjk / 400 + words / 220));
}

export function wordCount(text: string): number {
  const clean = stripMarkdown(text);
  const cjk = (clean.match(/[\u3400-\u9fff]/g) ?? []).length;
  const words = (
    clean.replace(/[\u3400-\u9fff]/g, " ").match(/[A-Za-z0-9]+/g) ?? []
  ).length;
  return cjk + words;
}

export function safeJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function attachmentInfo(content: BlogContent): AttachmentInfo | null {
  if (content.type !== "atta") return null;
  return safeJson<AttachmentInfo | null>(content.text, null);
}

export function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export function createSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export function constantTimeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aa = encoder.encode(a);
  const bb = encoder.encode(b);
  const length = Math.max(aa.length, bb.length);
  let diff = aa.length ^ bb.length;
  for (let i = 0; i < length; i += 1) diff |= (aa[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

export function safeReturnTo(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//"))
    return "/admin";
  return value;
}

export function attachmentPath(key: string): string {
  return `/${key.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/")}`;
}

export function publicAttachmentUrl(
  path: string,
  configuredBase?: string,
): string {
  const value = path.trim();
  if (
    !value ||
    /^(?:https?:)?\/\//i.test(value) ||
    /^(?:data|blob):/i.test(value)
  )
    return value;
  const clean = value.startsWith("/uploads/")
    ? value.slice("/uploads".length)
    : value.startsWith("/")
      ? value
      : `/${value}`;
  const base = configuredBase?.trim().replace(/\/+$/, "");
  return base ? `${base}${clean}` : `/uploads${clean}`;
}

export function resolveUploadedUrls(
  html: string,
  configuredBase?: string,
): string {
  return html.replace(
    /(src|href|poster)=(['"])(\/(?:uploads\/)?(?:\d{4}\/\d{2}|seed)\/[^'"<>]+)\2/g,
    (_m, attr, quote, path) =>
      `${attr}=${quote}${publicAttachmentUrl(path, configuredBase)}${quote}`,
  );
}

export function fileKind(mime: string): "image" | "video" | "file" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "file";
}

export function insertionForAttachment(info: AttachmentInfo): string {
  const safeName = info.originalName
    .replaceAll("\\", "\\\\")
    .replaceAll("]", "\\]")
    .replace(/[\r\n]+/g, " ");
  if (fileKind(info.mime) === "image") return `![${safeName}](${info.url})`;
  if (fileKind(info.mime) === "video")
    return `<video controls preload="metadata" src="${info.url}">${safeName}</video>`;
  return `[${safeName}](${info.url})`;
}
