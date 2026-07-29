import type {
  BlogContent,
  CommentNotificationPayload,
  EmailSendBinding,
} from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeNotificationEmail(value: string): string {
  const trimmed = value.trim();
  return EMAIL_PATTERN.test(trimmed) ? trimmed : "";
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] ?? char,
  );
}

function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function contentTitle(content: BlogContent): string {
  return oneLine(content.title) || "未命名内容";
}

export async function sendCommentNotification(
  email: EmailSendBinding,
  payload: CommentNotificationPayload,
): Promise<void> {
  const { from, to, siteTitle, content, commenter, commentUrl } = payload;
  const title = contentTitle(content);
  const subject =
    `[${oneLine(siteTitle) || "Worker Blog"}] 新评论：${title}`.slice(0, 240);
  const textLines = [
    "你的博客收到一条新评论。",
    "",
    `内容：${title}`,
    `评论者：${commenter.name}`,
    `邮箱：${commenter.email}`,
  ];
  if (commenter.site) textLines.push(`网站：${commenter.site}`);
  textLines.push(
    "",
    "评论内容：",
    commenter.text,
    "",
    `查看评论：${commentUrl}`,
  );
  const text = textLines.join("\n");
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.7;color:#333">
      <h2 style="margin:0 0 16px">你的博客收到一条新评论</h2>
      <p><strong>内容：</strong>${escapeHtml(title)}</p>
      <p><strong>评论者：</strong>${escapeHtml(commenter.name)}</p>
      <p><strong>邮箱：</strong>${escapeHtml(commenter.email)}</p>
      ${commenter.site ? `<p><strong>网站：</strong>${escapeHtml(commenter.site)}</p>` : ""}
      <div style="margin:18px 0;padding:14px 16px;border-left:3px solid #999;background:#f6f6f3;white-space:pre-wrap">${escapeHtml(commenter.text)}</div>
      <p><a href="${escapeHtml(commentUrl)}">查看文章与评论</a></p>
    </div>
  `.trim();

  await email.send({
    from,
    to,
    subject,
    text,
    html,
    replyTo: commenter.email,
  });
}
