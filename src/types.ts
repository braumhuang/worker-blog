export type ContentType = "post" | "page" | "atta" | "memo";
export type ContentStatus = "publish" | "draft" | "hidden";
export type MetaType = "tag" | "category";
export type AttachmentTemplateType = "image" | "video" | "file";

export type Bindings = {
  BLOG_DB: D1Database;
  BLOG_R2: R2Bucket;
  ADMIN_NAME: string;
  ADMIN_PSWD: string;
  MAX_UPLOAD_MB?: string;
};

export type Variables = {
  adminSession: string;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};

export interface BlogContent {
  cid: number;
  parent: number;
  title: string;
  slug: string;
  created: number;
  modified: number;
  released: number;
  text: string;
  cover: string;
  type: ContentType;
  status: ContentStatus;
}

export interface BlogMeta {
  mid: number;
  name: string;
  slug: string;
  type: MetaType;
  description: string;
  count: number;
}

export interface BlogLink {
  id: number;
  name: string;
  url: string;
  icon: string;
  info: string;
  order: number;
}

export interface BlogComment {
  id: number;
  name: string;
  email: string;
  site: string;
  text: string;
  created: number;
  cid: number;
}

export type NavigationSection = "fixed" | "custom";
export type NavigationTemplate = "page" | "about";

export interface NavigationItem {
  id: string;
  name: string;
  url: string;
  visible: boolean;
  section: NavigationSection;
  template?: NavigationTemplate;
  order: number;
}

export interface AttachmentTemplate {
  id: string;
  name: string;
  type: AttachmentTemplateType;
  template: string;
}

export interface AttachmentInfo {
  key: string;
  url: string;
  mime: string;
  size: number;
  originalName: string;
}

export type OptionMap = Record<string, string>;

export interface ContentWithMeta extends BlogContent {
  categories?: BlogMeta[];
  tags?: BlogMeta[];
}
