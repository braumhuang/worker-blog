import type { BlogLink } from "../../types";
import { AdminLayout } from "./base";

export function LinksPage({
  rows,
  edit,
}: {
  rows: BlogLink[];
  edit: BlogLink | null;
}) {
  return (
    <AdminLayout title="友链管理" subtitle={`${rows.length} 条友链`}>
      <div class="two-columns link-columns">
        <section class="panel link-list-panel">
          <table class="admin-table">
            <thead>
              <tr>
                <th>名字</th>
                <th>网址</th>
                <th>次序</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((link) => (
                <tr>
                  <td>
                    {link.name}
                    <div class="row-actions">
                      <a href={`/admin/links?edit=${link.id}`}>编辑</a>
                      <form
                        class="inline-form"
                        method="post"
                        action={`/admin/links/${link.id}/delete`}
                      >
                        <button
                          class="button small danger"
                          type="submit"
                          data-confirm={`确定删除“${link.name}”吗？`}
                        >
                          删除
                        </button>
                      </form>
                    </div>
                  </td>
                  <td>
                    <a href={link.url} target="_blank">
                      {link.url}
                    </a>
                  </td>
                  <td>{link.order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section class="panel link-form-panel">
          <div class="panel-body">
            <h3>{edit ? "编辑友链" : "新增友链"}</h3>
            <form method="post" action="/admin/links" class="main-form">
              <input type="hidden" name="id" value={edit?.id ?? ""} />
              <div class="field">
                <label>名字</label>
                <input
                  class="input"
                  name="name"
                  value={edit?.name ?? ""}
                  required
                />
              </div>
              <div class="field">
                <label>网址</label>
                <input
                  class="input"
                  name="url"
                  type="url"
                  value={edit?.url ?? ""}
                  required
                />
              </div>
              <div class="field">
                <label for="link-icon">图标链接</label>
                <div class="input-inline-action">
                  <input
                    class="input"
                    id="link-icon"
                    name="icon"
                    data-icon-url
                    value={edit?.icon ?? ""}
                  />
                  <label class="input-inline-button" for="icon-upload">
                    上传
                  </label>
                  <input
                    id="icon-upload"
                    type="file"
                    accept="image/*"
                    data-icon-upload
                    hidden
                  />
                </div>
              </div>
              <div class="field">
                <label>描述</label>
                <textarea class="textarea" name="info">
                  {edit?.info ?? ""}
                </textarea>
              </div>
              <div class="field">
                <label>次序（越大越靠前）</label>
                <input
                  class="input"
                  name="order"
                  type="number"
                  value={edit?.order ?? 0}
                />
              </div>
              <div>
                <button class="button primary" type="submit">
                  保存
                </button>
                {edit ? (
                  <a class="button" href="/admin/links">
                    取消
                  </a>
                ) : null}
              </div>
            </form>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
