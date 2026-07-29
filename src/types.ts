export type ContentType = "post" | "page" | "atta" | "memo";
export type ContentStatus = "publish" | "draft" | "hidden";
export type MetaType = "tag" | "category";
export type AttachmentTemplateType = "image" | "video" | "file";
export type EmojiType = "url" | "str";

export type EmailAddress = {
  email: string;
  name?: string;
};

export type EmailMessageInput = {
  to: string | EmailAddress | Array<string | EmailAddress>;
  from: string | EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | EmailAddress;
  headers?: Record<string, string>;
};

export interface EmailSendBinding {
  send(message: EmailMessageInput): Promise<{ messageId?: string }>;
}

export type Bindings = {
  BLOG_DB: D1Database;
  BLOG_R2: R2Bucket;
  ADMIN_NAME: string;
  ADMIN_PSWD: string;
  MAX_UPLOAD_MB?: string;
  BLOG_EMAIL: EmailSendBinding;
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

export interface EmojiItem {
  type: EmojiType;
  name: string;
  value: string;
}

export interface AttachmentInfo {
  key: string;
  url: string;
  mime: string;
  size: number;
  originalName: string;
}

export interface CommentNotificationPayload {
  from: string;
  to: string;
  siteTitle: string;
  content: BlogContent;
  commenter: Pick<BlogComment, "name" | "email" | "site" | "text">;
  commentUrl: string;
}

export type OptionMap = Record<string, string>;

export interface ContentWithMeta extends BlogContent {
  categories?: BlogMeta[];
  tags?: BlogMeta[];
}
