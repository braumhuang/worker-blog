import type { BlogMeta } from "../../types";
import { PageHeading } from "./base";

export function Tags({ tags }: { tags: BlogMeta[] }) {
  return (
    <>
      <PageHeading title="标签" subtitle={`共 ${tags.length} 个标签`} />
      <div class="tag-cloud">
        {tags.map((tag) => (
          <a
            class="tag-cloud-item"
            href={`/tag/${encodeURIComponent(tag.slug)}/`}
          >
            <span class="tag-cloud-name">{tag.name}</span>
            <span class="tag-cloud-count">{tag.count}</span>
          </a>
        ))}
      </div>
    </>
  );
}
