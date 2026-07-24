import type { BlogMeta } from "../../../types";

export function Categories({ categories }: { categories: BlogMeta[] }) {
  return (
    <div class="sc-post-container">
      <article class="sc-post-detail">
        <h1 class="sc-post-title-detail">分类</h1>
        <p class="sc-page-intro">共 {categories.length} 个分类</p>
        <div class="sc-tags-cloud sc-categories-cloud">
          {categories.length ? categories.map((category) => (
            <a class="sc-tag" href={`/category/${encodeURIComponent(category.slug)}/`} title={`${category.count} 篇文章`}>
              {category.name}<span class="sc-tag-count">({category.count})</span>
            </a>
          )) : <div class="sc-empty">还没有分类。</div>}
        </div>
      </article>
    </div>
  );
}
