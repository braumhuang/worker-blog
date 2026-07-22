import type { AttachmentInfo, BlogContent, ContentType } from '../types'

export const SESSION_SECONDS = 10 * 24 * 60 * 60
export const RENEW_BEFORE_SECONDS = 2 * 24 * 60 * 60

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

export function positiveInt(value: unknown, fallback: number, max = 1000): number {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.min(parsed, max)
}

export function intValue(value: unknown, fallback = 0): number {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function slugify(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
  return slug || crypto.randomUUID().slice(0, 8)
}

export function draftSlug(type: ContentType): string {
  return `${type}-draft-${crypto.randomUUID()}`
}

export function formatDate(timestamp: number, includeTime = false, timeZone = 'Asia/Shanghai'): string {
  const options: Intl.DateTimeFormatOptions = includeTime
    ? { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone }
    : { year: 'numeric', month: '2-digit', day: '2-digit', timeZone }
  return new Intl.DateTimeFormat('zh-CN', options).format(new Date(timestamp * 1000)).replaceAll('/', '-')
}

export function isoDate(timestamp: number, timeZone = 'Asia/Shanghai'): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone,
  }).formatToParts(new Date(timestamp * 1000))
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return `${pick('year')}-${pick('month')}-${pick('day')}`
}

export function datetimeLocal(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const pad = (v: number) => String(v).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function parseDatetimeLocal(value: string, fallback: number): number {
  if (!value) return fallback
  const ms = Date.parse(value)
  return Number.isNaN(ms) ? fallback : Math.floor(ms / 1000)
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/<!--\s*more\s*-->/gi, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function excerptOf(text: string, limit = 200): string {
  const beforeMore = text.split(/<!--\s*more\s*-->/i)[0]
  const clean = stripMarkdown(beforeMore)
  if (clean.length <= limit) return clean
  return `${clean.slice(0, limit).trim()}…`
}

export function readingMinutes(text: string): number {
  const clean = stripMarkdown(text)
  const cjk = (clean.match(/[\u3400-\u9fff]/g) ?? []).length
  const words = (clean.replace(/[\u3400-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []).length
  return Math.max(1, Math.ceil(cjk / 400 + words / 220))
}

export function wordCount(text: string): number {
  const clean = stripMarkdown(text)
  const cjk = (clean.match(/[\u3400-\u9fff]/g) ?? []).length
  const words = (clean.replace(/[\u3400-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []).length
  return cjk + words
}

export function safeJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function attachmentInfo(content: BlogContent): AttachmentInfo | null {
  if (content.type !== 'attachment') return null
  return safeJson<AttachmentInfo | null>(content.text, null)
}

export function base64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

export function createSessionToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return base64Url(bytes)
}

export function constantTimeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const aa = encoder.encode(a)
  const bb = encoder.encode(b)
  const length = Math.max(aa.length, bb.length)
  let diff = aa.length ^ bb.length
  for (let i = 0; i < length; i += 1) diff |= (aa[i] ?? 0) ^ (bb[i] ?? 0)
  return diff === 0
}

export function safeReturnTo(value: string | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/admin'
  return value
}

export function publicAttachmentUrl(origin: string, key: string, configuredBase?: string): string {
  const base = configuredBase?.trim().replace(/\/$/, '')
  return base ? `${base}/${key.split('/').map(encodeURIComponent).join('/')}` : `${origin}/uploads/${key.split('/').map(encodeURIComponent).join('/')}`
}

export function fileKind(mime: string): 'image' | 'video' | 'file' {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  return 'file'
}

export function insertionForAttachment(info: AttachmentInfo): string {
  const safeName = info.originalName.replaceAll('\\', '\\\\').replaceAll(']', '\\]').replace(/[\r\n]+/g, ' ')
  if (fileKind(info.mime) === 'image') return `![${safeName}](${info.url})`
  if (fileKind(info.mime) === 'video') return `<video controls preload="metadata" src="${info.url}"></video>`
  return `[下载 ${safeName}](${info.url})`
}
