import type { EmojiItem, EmojiType } from "../types";

export const DEFAULT_EMOJI_ITEMS: EmojiItem[] = [
  {
    type: "url",
    name: "滑稽",
    value: "https://tb3.bdstatic.com/emoji/image_emoticon25@2x.png",
  },
  { type: "str", name: "酷", value: "😎" },
  { type: "str", name: "笑脸", value: "😀" },
  { type: "str", name: "开心", value: "😃" },
  { type: "str", name: "大笑", value: "😄" },
  { type: "str", name: "嘻嘻", value: "😁" },
  { type: "str", name: "斜眼笑", value: "😆" },
  { type: "str", name: "汗笑", value: "😅" },
  { type: "str", name: "笑哭", value: "😂" },
  { type: "str", name: "笑翻", value: "🤣" },
  { type: "str", name: "微笑", value: "😊" },
  { type: "str", name: "天使", value: "😇" },
  { type: "str", name: "呵呵", value: "🙂" },
  { type: "str", name: "倒脸", value: "🙃" },
  { type: "str", name: "眨眼", value: "😉" },
  { type: "str", name: "轻松", value: "😌" },
  { type: "str", name: "花痴", value: "😍" },
  { type: "str", name: "喜爱", value: "🥰" },
  { type: "str", name: "飞吻", value: "😘" },
  { type: "str", name: "美味", value: "😋" },
  { type: "str", name: "吐舌", value: "😛" },
  { type: "str", name: "调皮", value: "😜" },
  { type: "str", name: "疯狂", value: "🤪" },
  { type: "str", name: "挑眉", value: "🤨" },
  { type: "str", name: "单片眼镜", value: "🧐" },
  { type: "str", name: "书呆子", value: "🤓" },
  { type: "str", name: "得意", value: "😏" },
  { type: "str", name: "无语", value: "😒" },
  { type: "str", name: "失望", value: "😞" },
  { type: "str", name: "沉思", value: "😔" },
  { type: "str", name: "担心", value: "😟" },
  { type: "str", name: "困惑", value: "😕" },
  { type: "str", name: "不悦", value: "🙁" },
  { type: "str", name: "难过", value: "☹️" },
  { type: "str", name: "忍耐", value: "😣" },
  { type: "str", name: "困扰", value: "😖" },
  { type: "str", name: "疲惫", value: "😫" },
  { type: "str", name: "累", value: "😩" },
  { type: "str", name: "可怜", value: "🥺" },
  { type: "str", name: "哭", value: "😢" },
  { type: "str", name: "大哭", value: "😭" },
  { type: "str", name: "傲娇", value: "😤" },
  { type: "str", name: "生气", value: "😠" },
  { type: "str", name: "愤怒", value: "😡" },
  { type: "str", name: "骂人", value: "🤬" },
  { type: "str", name: "爆炸", value: "🤯" },
  { type: "str", name: "脸红", value: "😳" },
  { type: "str", name: "热", value: "🥵" },
  { type: "str", name: "冷", value: "🥶" },
  { type: "str", name: "尖叫", value: "😱" },
  { type: "str", name: "害怕", value: "😨" },
  { type: "str", name: "冷汗", value: "😰" },
  { type: "str", name: "抱抱", value: "🤗" },
  { type: "str", name: "思考", value: "🤔" },
  { type: "str", name: "捂嘴", value: "🤭" },
  { type: "str", name: "嘘", value: "🤫" },
  { type: "str", name: "说谎", value: "🤥" },
  { type: "str", name: "无言", value: "😶" },
  { type: "str", name: "平静", value: "😐" },
  { type: "str", name: "面无表情", value: "😑" },
  { type: "str", name: "尴尬", value: "😬" },
  { type: "str", name: "白眼", value: "🙄" },
  { type: "str", name: "惊讶", value: "😯" },
  { type: "str", name: "震惊", value: "😲" },
  { type: "str", name: "哈欠", value: "🥱" },
  { type: "str", name: "睡觉", value: "😴" },
  { type: "str", name: "流口水", value: "🤤" },
  { type: "str", name: "困", value: "😪" },
  { type: "str", name: "晕", value: "😵" },
  { type: "str", name: "闭嘴", value: "🤐" },
  { type: "str", name: "恶心", value: "🤢" },
  { type: "str", name: "呕吐", value: "🤮" },
  { type: "str", name: "喷嚏", value: "🤧" },
  { type: "str", name: "口罩", value: "😷" },
  { type: "str", name: "发烧", value: "🤒" },
  { type: "str", name: "受伤", value: "🤕" },
  { type: "str", name: "赞", value: "👍" },
  { type: "str", name: "踩", value: "👎" },
  { type: "str", name: "鼓掌", value: "👏" },
  { type: "str", name: "谢谢", value: "🙏" },
  { type: "str", name: "庆祝", value: "🎉" },
  { type: "str", name: "红心", value: "❤️" },
];

const EMOJI_TYPES = new Set<EmojiType>(["url", "str"]);

function cloneDefaults(): EmojiItem[] {
  return DEFAULT_EMOJI_ITEMS.map((item) => ({ ...item }));
}

function normalizeEmojiUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || /[\s"'<>]/.test(trimmed)) return "";
  try {
    const parsed = new URL(trimmed, "https://example.invalid/");
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password ||
      !parsed.hostname
    )
      return "";
    return trimmed;
  } catch {
    return "";
  }
}

function normalizeEmojiItem(value: unknown): EmojiItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const type = String(source.type ?? "") as EmojiType;
  const name = String(source.name ?? "")
    .trim()
    .slice(0, 80);
  let itemValue = String(source.value ?? "")
    .trim()
    .slice(0, 2000);
  if (!EMOJI_TYPES.has(type) || !name || !itemValue) return null;
  if (type === "url") itemValue = normalizeEmojiUrl(itemValue);
  if (!itemValue) return null;
  return { type, name, value: itemValue };
}

function parseEmojiSource(raw: string): unknown[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    const values: unknown[] = [];
    const lines = raw.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].trim();
      if (!line) continue;
      try {
        const parsed = JSON.parse(line);
        if (Array.isArray(parsed)) values.push(...parsed);
        else values.push(parsed);
      } catch {
        throw new Error(`第 ${index + 1} 行不是有效 JSON`);
      }
    }
    return values;
  }
}

export function parseEmojiItems(raw: string): EmojiItem[] {
  const parsed = parseEmojiSource(raw);
  const items: EmojiItem[] = [];
  for (let index = 0; index < parsed.length && items.length < 500; index += 1) {
    const item = normalizeEmojiItem(parsed[index]);
    if (!item) throw new Error(`第 ${index + 1} 个 Emoji 配置无效`);
    items.push(item);
  }
  return items;
}

export function normalizeEmojiItems(raw: string | undefined): EmojiItem[] {
  if (raw === undefined) return cloneDefaults();
  try {
    return parseEmojiItems(raw);
  } catch {
    return cloneDefaults();
  }
}

export function serializeEmojiItems(items: EmojiItem[]): string {
  return JSON.stringify(
    items.map(({ type, name, value }) => ({ type, name, value })),
  );
}

export function formatEmojiItems(items: EmojiItem[]): string {
  return items.map((item) => JSON.stringify(item)).join("\n");
}
