import type { ContentWithMeta } from "../../../../types";
import { excerptOf, formatDate } from "../../../../lib/utils";
export function PostCard({
  post,
  timeZone,
}: {
  post: ContentWithMeta;
  timeZone: string;
  fileCdnUrl: string;
}) {
  return (
    <li class="post-item">
      <p class="post-date">{formatDate(post.released, false, timeZone)}</p>
      <h3 class="post-title">
        <a href={`/post/${encodeURIComponent(post.slug)}/`}>
          {post.title || "未命名文章"}
        </a>
      </h3>
      <p class="post-excerpt">{excerptOf(post.text)}</p>
    </li>
  );
}
