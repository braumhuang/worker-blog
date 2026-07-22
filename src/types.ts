export type ContentType = 'post' | 'page' | 'attachment' | 'memo'
export type ContentStatus = 'publish' | 'draft' | 'hidden'
export type MetaType = 'tag' | 'category'

export type Bindings = {
  BLOG_DB: D1Database
  BLOG_R2: R2Bucket
  ADMIN_NAME: string
  ADMIN_PSWD: string
  R2_PUBLIC_URL?: string
  MAX_UPLOAD_MB?: string
}

export type Variables = {
  adminSession: string
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}

export interface BlogContent {
  cid: number
  title: string
  slug: string
  created: number
  modified: number
  text: string
  cover: string
  type: ContentType
  status: ContentStatus
}

export interface BlogMeta {
  mid: number
  name: string
  slug: string
  type: MetaType
  description: string
  count: number
}

export interface BlogLink {
  id: number
  name: string
  url: string
  icon: string
  info: string
  order: number
}

export interface AttachmentInfo {
  key: string
  url: string
  mime: string
  size: number
  parentCid: number | null
  originalName: string
}

export type OptionMap = Record<string, string>

export interface ContentWithMeta extends BlogContent {
  categories?: BlogMeta[]
  tags?: BlogMeta[]
}
