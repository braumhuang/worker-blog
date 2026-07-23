import type { BlogMeta } from "../../../types";
import { PageHeading } from "./base";
export function Tags({ tags }: { tags: BlogMeta[] }) {
  return (
    <>
      <PageHeading title="标签" subtitle="用关键字找回相关的字句" />
      <div class="tag-cloud">
        {tags.map((tag) => (
          <a href={`/tag/${encodeURIComponent(tag.slug)}/`}>
            {tag.name}
            <span class="count">{tag.count}</span>
          </a>
        ))}
      </div>
    </>
  );
}
