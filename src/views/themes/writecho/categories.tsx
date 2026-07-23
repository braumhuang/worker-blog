import type { BlogMeta } from "../../../types";
import { PageHeading } from "./base";
export function Categories({ categories }: { categories: BlogMeta[] }) {
  return (
    <>
      <PageHeading title="分类" subtitle={`共 ${categories.length} 个分类`} />
      <div class="tag-cloud">
        {categories.map((category) => (
          <a href={`/category/${encodeURIComponent(category.slug)}/`}>
            {category.name}
            <span class="count">{category.count}</span>
          </a>
        ))}
      </div>
    </>
  );
}
