import type {
  AttachmentTemplate,
  BlogContent,
  BlogMeta,
  OptionMap,
} from "../../types";
import { datetimeLocal, formatDate } from "../../lib/utils";
import { normalizeEmojiItems } from "../../lib/emojis";
import { AdminLayout } from "./base";
import { AttachmentRows, EditorToolbar } from "./shared";

export function ContentEditPage({
  content,
  options,
  categories,
  assignedCategoryIds,
  assignedTags,
  attachments,
  templates,
  saved,
}: {
  content: BlogContent;
  options: OptionMap;
  categories: BlogMeta[];
  assignedCategoryIds: Set<number>;
  assignedTags: BlogMeta[];
  attachments: Array<{
    content: BlogContent;
    info: import("../../types").AttachmentInfo;
  }>;
  templates: AttachmentTemplate[];
  saved: boolean;
}) {
  const label =
    content.type === "memo"
      ? "闪念"
      : content.type === "page"
        ? "页面"
        : "文章";
  const returnType = content.type === "memo" ? "memo" : "post";
  return (
    <AdminLayout
      title={`编辑${label}`}
      subtitle={`CID ${content.cid}`}
      actions={
        <a
          class="button"
          href={`/admin/contents?type=${returnType}${content.type === "page" ? "&filter=page" : ""}`}
        >
          返回列表
        </a>
      }
    >
      {saved ? <div class="notice">保存成功。</div> : null}
      <form
        method="post"
        action={`/admin/content/${content.cid}`}
        class="form-grid"
      >
        <div class="main-form">
          {content.type !== "memo" ? (
            <>
              <div class="field">
                <label for="title">标题</label>
                <input
                  class="input"
                  id="title"
                  name="title"
                  value={content.title}
                  placeholder="请输入标题"
                />
              </div>
              <div class="field">
                <label for="slug">URL 别名</label>
                <input
                  class="input"
                  id="slug"
                  name="slug"
                  value={content.slug.includes("-draft-") ? "" : content.slug}
                  placeholder="留空根据标题生成"
                />
              </div>
              <div class="field cover-url-field">
                <label for="cover">封面 URL</label>
                <div class="input-inline-action">
                  <input
                    class="input"
                    id="cover"
                    name="cover"
                    type="text"
                    inputMode="url"
                    value={content.cover || ""}
                    placeholder="https://example.com/cover.jpg 或 /2026/07/cover.jpg"
                    data-cover-url
                  />
                  <label class="input-inline-button" for="cover-upload">
                    上传
                  </label>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    data-cover-upload
                    data-cid={content.cid}
                    data-image-compression-quality={
                      options.image_compression_quality
                    }
                    hidden
                  />
                </div>
                <small class="muted" data-cover-status></small>
              </div>
            </>
          ) : (
            <div class="memo-editor-note">
              闪念标题会根据发布时间自动生成，格式为“
              {formatDate(content.released, true, options.site_timezone)}”。
            </div>
          )}
          <div class="editor-panel" data-editor-panel>
            <EditorToolbar emojis={normalizeEmojiItems(options.emoji_items)} />
            <div class="editor-workspace">
              <textarea class="editor-textarea" name="text" data-editor>
                {content.text}
              </textarea>
              <div class="editor-preview prose-preview" data-preview></div>
            </div>
          </div>
        </div>
        <aside class="side-form">
          <section class="side-box">
            <h3>发布</h3>
            <div class="side-box-body">
              {content.type !== "memo" ? (
                <div class="field">
                  <label for="content_type">类型</label>
                  <select class="select" id="content_type" name="content_type">
                    <option value="post" selected={content.type === "post"}>
                      文章
                    </option>
                    <option value="page" selected={content.type === "page"}>
                      页面
                    </option>
                  </select>
                </div>
              ) : null}
              <div class="field">
                <span>状态</span>
                <select class="select" name="status">
                  <option value="draft" selected={content.status === "draft"}>
                    草稿
                  </option>
                  <option
                    value="publish"
                    selected={content.status === "publish"}
                  >
                    发布
                  </option>
                </select>
              </div>
              <div class="field">
                <label>
                  <input
                    type="checkbox"
                    name="hidden"
                    value="1"
                    checked={content.status === "hidden"}
                  />{" "}
                  隐藏内容
                </label>
              </div>
              <div class="field">
                <label for="released">发布时间</label>
                <input
                  class="input"
                  id="released"
                  name="released"
                  type="datetime-local"
                  value={datetimeLocal(content.released, options.site_timezone)}
                />
              </div>
              <button class="button primary" type="submit">
                保存
              </button>
            </div>
          </section>
          {content.type !== "memo" ? (
            <section class="side-box">
              <h3>分类</h3>
              <div class="side-box-body checkbox-list">
                {categories.length ? (
                  categories.map((category) => (
                    <label>
                      <input
                        type="checkbox"
                        name="categories"
                        value={category.mid}
                        checked={assignedCategoryIds.has(category.mid)}
                      />{" "}
                      {category.name}
                    </label>
                  ))
                ) : (
                  <span class="muted">请先创建分类</span>
                )}
              </div>
            </section>
          ) : null}
          <section class="side-box">
            <h3>标签</h3>
            <div class="side-box-body">
              <div class="tags-input" data-tags>
                {assignedTags.map((tag) => (
                  <span class="tag-chip">
                    <span>{tag.name}</span>
                    <button type="button">×</button>
                  </span>
                ))}
                <input type="text" placeholder="输入后回车" />
                <input type="hidden" name="tags" data-tags-hidden />
              </div>
            </div>
          </section>
          <section class="side-box">
            <h3>附件</h3>
            <div class="side-box-body">
              <label class="button" for="content-upload">
                上传到 R2
              </label>
              <input
                id="content-upload"
                data-upload-input
                data-cid={content.cid}
                data-image-compression-quality={
                  options.image_compression_quality
                }
                type="file"
                multiple
                hidden
              />
              <div class="progress" data-upload-status></div>
              <hr />
              <AttachmentRows
                rows={attachments}
                fileCdnUrl={options.file_cdn_url}
                templates={templates}
              />
            </div>
          </section>
        </aside>
      </form>
    </AdminLayout>
  );
}
