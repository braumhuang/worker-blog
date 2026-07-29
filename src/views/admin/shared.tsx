import type {
  AttachmentInfo,
  AttachmentTemplate,
  BlogContent,
  EmojiItem,
  NavigationItem,
  NavigationSection,
} from "../../types";
import { attachmentTemplateTypeForMime } from "../../lib/attachment-templates";
import { navigationItemRules } from "../../lib/navigation";
import { fileKind, publicAttachmentUrl } from "../../lib/utils";

export function EditorToolbar({ emojis }: { emojis: EmojiItem[] }) {
  const buttons = [
    ["bold", "B", "粗体"],
    ["italic", "I", "斜体"],
    ["heading", "H", "标题"],
    ["quote", "❞", "引用"],
    ["ul", "•", "无序列表"],
    ["ol", "1.", "有序列表"],
    ["code", "</>", "代码"],
    ["link", "↗", "链接"],
    ["a", "A", "A标签"],
    ["image", "▧", "图片"],
    ["more", "…", "摘要分隔"],
    ["hr", "—", "分割线"],
    ["emoji", "☺︎", "Emoji表情"],
  ];
  return (
    <div class="md-toolbar" data-emojis={JSON.stringify(emojis)}>
      {buttons.map(([action, label, title]) => (
        <button type="button" data-md-action={action} title={title}>
          {label}
        </button>
      ))}
      <button type="button" data-preview-toggle title="预览">
        ◫
      </button>
      <button type="button" data-fullscreen title="全屏">
        ⛶
      </button>
    </div>
  );
}

export function NavigationRows({
  items,
  section,
}: {
  items: NavigationItem[];
  section: NavigationSection;
}) {
  return (
    <div
      class="navigation-list"
      data-navigation-list
      data-navigation-section={section}
    >
      {items.map((item) => {
        const rules = navigationItemRules(item.id);
        return (
          <div
            class={`navigation-row navigation-row-${section}`}
            data-navigation-row
            data-navigation-id={item.id}
          >
            <input type="hidden" name="nav_id" value={item.id} />
            <input
              type="hidden"
              name={`nav_section:${item.id}`}
              value={section}
            />
            <div class="field navigation-order-field">
              <label>次序</label>
              <input
                class="input"
                name={`nav_order:${item.id}`}
                type="number"
                step="1"
                value={item.order}
                required
              />
            </div>
            <div class="field navigation-name-field">
              <label>菜单名</label>
              <input
                class="input"
                name={`nav_name:${item.id}`}
                value={item.name}
                maxLength={40}
                required
              />
            </div>
            <div class="field navigation-url-field">
              <label>页面 URL</label>
              <input
                class="input"
                name={`nav_url:${item.id}`}
                value={item.url}
                maxLength={1000}
                readOnly={section === "fixed" ? true : undefined}
                required
              />
            </div>
            {section === "custom" ? (
              <div class="field navigation-template-field">
                <label>模板</label>
                <select class="select" name={`nav_template:${item.id}`}>
                  <option value="page" selected={item.template !== "about"}>
                    页面
                  </option>
                  <option value="about" selected={item.template === "about"}>
                    关于
                  </option>
                </select>
              </div>
            ) : null}
            <div class="navigation-visible-field">
              <label>
                <input
                  type="checkbox"
                  name={`nav_visible:${item.id}`}
                  value="true"
                  checked={item.visible}
                  disabled={!rules.canHide}
                />{" "}
                显示
              </label>
              {!rules.canHide ? <small>始终显示</small> : null}
            </div>
            <div class="navigation-delete-field">
              {rules.canDelete ? (
                <button
                  class="button small danger"
                  type="button"
                  data-navigation-delete
                >
                  删除
                </button>
              ) : (
                <span class="muted">自带</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AttachmentRows({
  rows,
  fileCdnUrl,
  templates,
}: {
  rows: Array<{ content: BlogContent; info: AttachmentInfo }>;
  fileCdnUrl: string;
  templates: AttachmentTemplate[];
}) {
  return (
    <div
      class="attachment-list"
      data-attachment-list
      data-attachment-templates={JSON.stringify(templates)}
    >
      {rows.map(({ content, info }) => {
        const kind = fileKind(info.mime);
        const templateType = attachmentTemplateTypeForMime(info.mime);
        const displayUrl = publicAttachmentUrl(info.url, fileCdnUrl);
        return (
          <div class="attachment-item">
            <div class="attachment-thumb">
              {kind === "image" ? (
                <img src={displayUrl} alt="" loading="lazy" />
              ) : kind === "video" ? (
                "VIDEO"
              ) : (
                "FILE"
              )}
            </div>
            <div>
              <div class="attachment-name" title={info.originalName}>
                {info.originalName}
              </div>
              <small class="muted">{Math.ceil(info.size / 1024)} KB</small>
            </div>
            <div>
              <button
                type="button"
                class="button small"
                data-attachment-insert
                data-attachment-path={info.url}
                data-attachment-name={info.originalName}
                data-attachment-kind={templateType}
              >
                插入
              </button>{" "}
              <button
                type="button"
                class="button small danger"
                data-attachment-delete={content.cid}
              >
                删除
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
