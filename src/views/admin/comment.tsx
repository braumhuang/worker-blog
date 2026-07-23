import type { OptionMap } from "../../types";
import { formatDate } from "../../lib/utils";
import { AdminLayout } from "./base";
import type { AdminCommentRow } from "./comments";

export function CommentEditPage({
  comment,
  options,
  saved,
}: {
  comment: AdminCommentRow;
  options: OptionMap;
  saved: boolean;
}) {
  return (
    <AdminLayout
      title="编辑评论"
      subtitle={`评论 #${comment.id}`}
      actions={
        <a class="button" href="/admin/comments">
          返回列表
        </a>
      }
    >
      {saved ? <div class="notice">评论已保存。</div> : null}
      <section class="panel">
        <div class="panel-body">
          <form
            method="post"
            action={`/admin/comment/${comment.id}`}
            class="main-form comment-edit-form"
          >
            <div class="settings-inline">
              <div class="field">
                <label>名字</label>
                <input
                  class="input"
                  name="name"
                  maxLength={100}
                  value={comment.name}
                  required
                />
              </div>
              <div class="field">
                <label>邮箱</label>
                <input
                  class="input"
                  name="email"
                  type="email"
                  maxLength={200}
                  value={comment.email}
                  required
                />
              </div>
            </div>
            <div class="field">
              <label>网站</label>
              <input
                class="input"
                name="site"
                maxLength={500}
                value={comment.site}
              />
            </div>
            <div class="field">
              <label>评论内容</label>
              <textarea
                class="textarea comment-edit-text"
                name="text"
                maxLength={5000}
                required
              >
                {comment.text}
              </textarea>
            </div>
            <div class="comment-context">
              <strong>评论对象：</strong>
              <a href={`/admin/content/${comment.cid}`}>
                {comment.content_title || `CID ${comment.cid}`}
              </a>
              <span>
                {" "}
                · {formatDate(comment.created, true, options.site_timezone)}
              </span>
            </div>
            <div>
              <button class="button primary" type="submit">
                保存评论
              </button>{" "}
              <button
                class="button danger"
                type="submit"
                formaction={`/admin/comment/${comment.id}/delete`}
                formmethod="post"
                data-confirm="确定删除这条评论吗？"
              >
                删除
              </button>
            </div>
          </form>
        </div>
      </section>
    </AdminLayout>
  );
}
