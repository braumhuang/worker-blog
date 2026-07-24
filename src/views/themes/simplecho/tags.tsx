import type { BlogMeta } from "../../../types";

export function Tags({ tags }: { tags: BlogMeta[] }) {
  return (
    <div class="sc-post-container">
      <article class="sc-post-detail">
        <h1 class="sc-post-title-detail">标签</h1>
        <div class="sc-tags-cloud">
          {tags.length ? tags.map((tag) => (
            <a class="sc-tag" href={`/tag/${encodeURIComponent(tag.slug)}/`} title={`${tag.count} 篇文章`}>
              {tag.name}<span class="sc-tag-count">({tag.count})</span>
            </a>
          )) : <div class="sc-empty">还没有标签。</div>}
        </div>
      </article>
    </div>
  );
}
