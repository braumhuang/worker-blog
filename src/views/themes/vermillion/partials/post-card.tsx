import type { ContentWithMeta } from "../../../../types";
import { excerptOf, formatDate, publicAttachmentUrl, readingMinutes, wordCount } from "../../../../lib/utils";

const emojis = ["📖", "🎵", "💡", "☕", "🌅"];

export function PostCard({
  post,
  timeZone,
  fileCdnUrl,
  feature = false,
  index = 0,
  eye = "Article · 文",
}: {
  post: ContentWithMeta;
  timeZone: string;
  fileCdnUrl: string;
  feature?: boolean;
  index?: number;
  eye?: string;
}) {
  const url = `/post/${encodeURIComponent(post.slug)}/`;
  const cover = post.cover ? publicAttachmentUrl(post.cover, fileCdnUrl) : "";
  return (
    <a class={`card${feature ? " card--feature" : ""} fade-in`} href={url} style={`animation-delay:${Math.min(1.4, 0.25 + index * 0.08).toFixed(2)}s`}>
      <div class="card-eye"><span class="ribbon" />{eye}</div>
      <div class="card-time">
        <span class="author">札</span><span class="sep">/</span><span>{formatDate(post.released, false, timeZone)}</span>
        {post.categories?.[0] ? <><span class="sep">·</span><span>{post.categories[0].name}</span></> : null}
      </div>
      {cover ? (
        <div class="card-cover" style={feature ? "margin:-36px -34px 22px" : undefined}>
          <img src={cover} alt={post.title} loading="lazy" />
        </div>
      ) : <span class="card-emoji">{emojis[index % emojis.length]}</span>}
      <div class="card-title">{post.title || "未命名文章"}</div>
      <div class={feature ? "card-body" : "card-excerpt"}>{excerptOf(post.text, feature ? 180 : 110)}</div>
      <div class="card-foot">
        <span class={`heart${feature ? " on" : ""}`}>{feature ? "♥" : "♡"} {readingMinutes(post.text)} min</span>
        <span class="pin">⌖ {wordCount(post.text)} 字</span>
        {post.tags?.[0] ? <span class="woven">— {post.tags[0].name}</span> : null}
      </div>
    </a>
  );
}
