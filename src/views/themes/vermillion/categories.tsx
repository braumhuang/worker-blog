import type { BlogMeta } from "../../../types";
import { Divider, Masthead } from "./partials/shared";

export function Categories({ categories }: { categories: BlogMeta[] }) {
  return (
    <>
      <Masthead
        en="Folders"
        zh="分类"
        tagline="Every entry placed into a quiet drawer."
      />
      <Divider>分类云 · Folder cloud</Divider>
      {categories.length ? (
        <div class="tag-cloud fade-in" style="animation-delay:0.3s">
          {categories.map((category) => (
            <a
              class="tag-cloud-item"
              href={`/category/${encodeURIComponent(category.slug)}/`}
              style={`font-size:${Math.min(22, 14 + category.count)}px`}
            >
              {category.name}
              <span class="count">×{category.count}</span>
            </a>
          ))}
        </div>
      ) : (
        <div class="empty">— 还没有分类。</div>
      )}
    </>
  );
}
