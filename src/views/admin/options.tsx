import type { OptionMap } from "../../types";
import { TIMEZONE_OPTIONS } from "../../lib/options";
import { THEME_OPTIONS } from "../../theme";
import { AdminLayout } from "./base";

export function OptionsPage({
  options,
  saved,
  imported,
}: {
  options: OptionMap;
  saved: boolean;
  imported?: string;
}) {
  return (
    <AdminLayout title="系统设置" subtitle="站点信息、评论、时区与分页配置">
      {saved ? <div class="notice">设置已保存。</div> : null}
      {imported ? (
        <div class="notice">数据已导入，共处理 {imported} 条记录。</div>
      ) : null}
      <section class="panel">
        <div class="panel-body">
          <form method="post" action="/admin/options" class="main-form">
            <div class="field">
              <label for="site_theme">站点主题</label>
              <select class="select" id="site_theme" name="site_theme">
                {THEME_OPTIONS.map(([value, label]) => (
                  <option value={value} selected={options.site_theme === value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div class="field">
              <label>站点标题</label>
              <input
                class="input"
                name="site_title"
                value={options.site_title}
              />
            </div>
            <div class="settings-inline">
              <div class="field">
                <label for="favicon_text">FAVICON 文本</label>
                <div class="favicon-text-row">
                  <input
                    class="input"
                    id="favicon_text"
                    name="favicon_text"
                    value={options.favicon_text}
                    maxLength={2}
                    data-favicon-text
                  />
                  <span
                    class="favicon-preview"
                    style={`--favicon-color:${options.favicon_color}`}
                    data-favicon-preview
                  >
                    {options.favicon_text}
                  </span>
                </div>
                <small class="muted">建议填写 1–2 个字符，例如 W、博。</small>
              </div>
              <div class="field">
                <label for="favicon_color">FAVICON 颜色</label>
                <div class="favicon-setting-row">
                  <input
                    class="input favicon-color-text"
                    id="favicon_color"
                    name="favicon_color"
                    value={options.favicon_color}
                    placeholder="#999999"
                    pattern="#[0-9A-Fa-f]{6}"
                    data-favicon-color-text
                  />
                  <input
                    class="favicon-color-picker"
                    type="color"
                    value={options.favicon_color}
                    aria-label="选择 FAVICON 颜色"
                    data-favicon-color-picker
                  />
                </div>
                <small class="muted">
                  可输入六位十六进制颜色或使用颜色选择器，默认 #999999。
                </small>
              </div>
            </div>
            <div class="field">
              <label>站点描述</label>
              <input
                class="input"
                name="site_description"
                value={options.site_description}
              />
            </div>
            <div class="field">
              <label>文件 CDN 域名</label>
              <input
                class="input"
                name="file_cdn_url"
                value={options.file_cdn_url}
                placeholder="https://static.example.com"
              />
              <small class="muted">
                留空时通过 /uploads 由 Worker 读取
                R2；填写后直接使用该域名+相对路径。
              </small>
            </div>
            <div class="settings-inline settings-four-columns">
              <div class="field">
                <label>前台文章分页数</label>
                <input
                  class="input"
                  name="posts_per_page"
                  type="number"
                  min="1"
                  max="100"
                  value={options.posts_per_page}
                />
              </div>
              <div class="field">
                <label>前台闪念分页数</label>
                <input
                  class="input"
                  name="memos_per_page"
                  type="number"
                  min="1"
                  max="100"
                  value={options.memos_per_page}
                />
              </div>
              <div class="field">
                <label>前台归档分页数</label>
                <input
                  class="input"
                  name="archives_per_page"
                  type="number"
                  min="1"
                  max="100"
                  value={options.archives_per_page}
                />
              </div>
              <div class="field">
                <label>前台评论分页数</label>
                <input
                  class="input"
                  name="comments_per_page"
                  type="number"
                  min="1"
                  max="100"
                  value={options.comments_per_page}
                />
              </div>
            </div>
            <div class="settings-inline settings-four-columns">
              <div class="field">
                <label>后台文章分页数</label>
                <input
                  class="input"
                  name="admin_contents_per_page"
                  type="number"
                  min="1"
                  max="100"
                  value={options.admin_contents_per_page}
                />
              </div>
              <div class="field">
                <label>后台闪念分页数</label>
                <input
                  class="input"
                  name="admin_memos_per_page"
                  type="number"
                  min="1"
                  max="100"
                  value={options.admin_memos_per_page}
                />
              </div>
              <div class="field">
                <label>后台评论分页数</label>
                <input
                  class="input"
                  name="admin_comments_per_page"
                  type="number"
                  min="1"
                  max="100"
                  value={options.admin_comments_per_page}
                />
              </div>
              <div class="field">
                <label>后台附件分页数</label>
                <input
                  class="input"
                  name="admin_attachments_per_page"
                  type="number"
                  min="1"
                  max="100"
                  value={options.admin_attachments_per_page}
                />
              </div>
            </div>
            <div class="field option-check">
              <label>
                <input
                  type="checkbox"
                  name="comments_enabled"
                  value="true"
                  checked={options.comments_enabled === "true"}
                />{" "}
                开启评论功能
              </label>
              <small class="muted">
                开启后，文章详情以及页面/关于模板内容会显示评论输入框与评论列表。
              </small>
            </div>
            <div class="field">
              <label for="about-avatar">头像 URL</label>
              <div class="input-inline-action">
                <input
                  class="input"
                  id="about-avatar"
                  name="about_avatar"
                  value={options.about_avatar}
                  placeholder="https://example.com/avatar.png 或 /2026/07/avatar.png"
                  data-avatar-url
                />
                <label class="input-inline-button" for="avatar-upload">
                  上传
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  data-avatar-upload
                  hidden
                />
              </div>
              <small class="muted" data-avatar-status></small>
            </div>
            <div class="field">
              <label>GitHub</label>
              <input
                class="input"
                name="about_github"
                value={options.about_github}
                placeholder="https://github.com/username"
              />
            </div>
            <div class="field">
              <label>X</label>
              <input
                class="input"
                name="about_x"
                value={options.about_x}
                placeholder="https://x.com/username"
              />
            </div>
            <div class="field">
              <label>RSS</label>
              <input
                class="input"
                name="about_rss"
                value={options.about_rss}
                placeholder="/atom.xml 或完整 URL"
              />
            </div>
            <div class="field">
              <label>邮箱</label>
              <input
                class="input"
                name="about_email"
                value={options.about_email}
                placeholder="name@example.com"
              />
            </div>
            <div class="field">
              <label for="site_timezone">时区</label>
              <select class="select" id="site_timezone" name="site_timezone">
                {TIMEZONE_OPTIONS.map(([value, label]) => (
                  <option
                    value={value}
                    selected={options.site_timezone === value}
                  >
                    {label}
                  </option>
                ))}
              </select>
              <small class="muted">
                默认使用 UTC+08:00 东八区（北京 / 上海）。
              </small>
            </div>
            <div class="field">
              <label>页脚信息</label>
              <textarea class="textarea" name="footer_info" rows={3}>
                {options.footer_info}
              </textarea>
              <small class="muted">支持 HTML；留空时只显示版权信息。</small>
            </div>
            <button class="button primary" type="submit">
              保存设置
            </button>
          </form>
        </div>
      </section>
      <section class="panel">
        <div class="panel-body">
          <h3>数据管理</h3>
          <p>
            <a class="button" href="/admin/data/export">
              导出 JSON
            </a>
          </p>
          <form
            method="post"
            action="/admin/data/import"
            enctype="multipart/form-data"
            class="main-form"
          >
            <div class="field">
              <label>导入 JSON</label>
              <input
                class="input"
                type="file"
                name="file"
                accept="application/json,.json"
                required
              />
            </div>
            <button
              class="button primary"
              type="submit"
              data-confirm="导入会写入或更新现有数据，确定继续吗？"
            >
              导入数据
            </button>
            <small class="muted">
              导出和导入不包含 blog_cookies，也不包含 R2
              文件本体。自增表保留主键直接 INSERT；非自增表按主键更新或插入。
            </small>
          </form>
        </div>
      </section>
    </AdminLayout>
  );
}
