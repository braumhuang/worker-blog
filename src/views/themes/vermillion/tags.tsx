import type { BlogMeta } from "../../../types";
import { Divider, Masthead } from "./partials/shared";

export function Tags({ tags }: { tags: BlogMeta[] }) {
  return (
    <>
      <Masthead en="Themes" zh="主题 · 标签" tagline="What you came back to, over and over." />
      <Divider>主题云 · Theme cloud</Divider>
      {tags.length ? (
        <div class="tag-cloud fade-in" style="animation-delay:0.3s">
          {tags.map((tag) => (
            <a class="tag-cloud-item" href={`/tag/${encodeURIComponent(tag.slug)}/`} style={`font-size:${tag.count > 10 ? 22 : tag.count > 5 ? 18 : tag.count > 2 ? 16 : 14}px`}>
              {tag.name}<span class="count">×{tag.count}</span>
            </a>
          ))}
        </div>
      ) : <div class="empty">— 还没有标签。</div>}
    </>
  );
}
