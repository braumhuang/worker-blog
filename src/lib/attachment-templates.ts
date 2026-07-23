import type {
  AttachmentInfo,
  AttachmentTemplate,
  AttachmentTemplateType,
} from "../types";
import { fileKind } from "./utils";

export const DEFAULT_ATTACHMENT_TEMPLATES: AttachmentTemplate[] = [
  {
    id: "default-image",
    name: "图片",
    type: "image",
    template: "![FILE_NAME](RELATIVE_PATH)",
  },
  {
    id: "default-video",
    name: "视频",
    type: "video",
    template:
      '<video controls preload="metadata" src="RELATIVE_PATH">FILE_NAME</video>',
  },
  {
    id: "default-file",
    name: "文件",
    type: "file",
    template: "[FILE_NAME](RELATIVE_PATH)",
  },
];

const VALID_TYPES = new Set<AttachmentTemplateType>(["image", "video", "file"]);

export function normalizeAttachmentTemplateType(
  value: unknown,
): AttachmentTemplateType {
  return VALID_TYPES.has(value as AttachmentTemplateType)
    ? (value as AttachmentTemplateType)
    : "file";
}

export function normalizeAttachmentTemplates(
  raw: string | undefined,
): AttachmentTemplate[] {
  if (!raw?.trim())
    return DEFAULT_ATTACHMENT_TEMPLATES.map((item) => ({ ...item }));
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_ATTACHMENT_TEMPLATES.map((item) => ({ ...item }));
  }
  if (!Array.isArray(parsed))
    return DEFAULT_ATTACHMENT_TEMPLATES.map((item) => ({ ...item }));
  const items: AttachmentTemplate[] = [];
  const seen = new Set<string>();
  for (const value of parsed.slice(0, 100)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const source = value as Record<string, unknown>;
    const id = String(source.id ?? "")
      .trim()
      .slice(0, 100);
    const name = String(source.name ?? "")
      .trim()
      .slice(0, 80);
    const template = String(source.template ?? "")
      .trim()
      .slice(0, 10000);
    if (!id || seen.has(id) || !name || !template) continue;
    items.push({
      id,
      name,
      type: normalizeAttachmentTemplateType(source.type),
      template,
    });
    seen.add(id);
  }
  return items;
}

export function serializeAttachmentTemplates(
  items: AttachmentTemplate[],
): string {
  return JSON.stringify(
    items.map(({ id, name, type, template }) => ({ id, name, type, template })),
  );
}

export function defaultAttachmentTemplate(
  type: AttachmentTemplateType,
): AttachmentTemplate {
  return {
    ...(DEFAULT_ATTACHMENT_TEMPLATES.find((item) => item.type === type) ??
      DEFAULT_ATTACHMENT_TEMPLATES[2]),
  };
}

export function applyAttachmentTemplate(
  template: string,
  info: Pick<AttachmentInfo, "url" | "originalName">,
): string {
  return template
    .replaceAll("RELATIVE_PATH", info.url)
    .replaceAll("FILE_NAME", info.originalName);
}

export function attachmentTemplateTypeForMime(
  mime: string,
): AttachmentTemplateType {
  return fileKind(mime);
}
