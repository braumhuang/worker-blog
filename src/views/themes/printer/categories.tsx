import type { BlogMeta } from "../../../types";
import { PageHeading } from "./base";
export function Categories({ categories }: { categories: BlogMeta[] }) {
  return (
    <>
      <PageHeading title="分类" subtitle={`共 ${categories.length} 个分类`} />
      <div class="categories-grid">
        {categories.map((c) => (
          <a
            href={`/category/${encodeURIComponent(c.slug)}/`}
            class="category-card"
          >
            <div class="category-card-name">{c.name}</div>
            <div class="category-card-count">{c.count} 篇</div>
          </a>
        ))}
      </div>
    </>
  );
}
