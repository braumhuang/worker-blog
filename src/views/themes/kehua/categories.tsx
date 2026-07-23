import type { BlogMeta } from "../../../types";
import { PageHeading } from "./base";

export function Categories({ categories }: { categories: BlogMeta[] }) {
  return (
    <>
      <PageHeading title="分类" subtitle={`共 ${categories.length} 个分类`} />
      <div class="tag-cloud categories-cloud">
        {categories.map((category) => (
          <a
            class="tag-cloud-item"
            href={`/category/${encodeURIComponent(category.slug)}/`}
          >
            <span class="tag-cloud-name">{category.name}</span>
            <span class="tag-cloud-count">{category.count}</span>
          </a>
        ))}
      </div>
    </>
  );
}
