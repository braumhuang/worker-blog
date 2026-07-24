import type { ContentWithMeta } from "../../../types";
import { isoDate } from "../../../lib/utils";
import { Pagination } from "./partials/pagination";

export function Archives({
  years,
  total,
  tagTotal,
  page,
  totalPages,
  timeZone,
}: {
  years: Map<string, ContentWithMeta[]>;
  total: number;
  tagTotal: number;
  page: number;
  totalPages: number;
  timeZone: string;
}) {
  return (
    <div class="sc-post-container">
      <article class="sc-post-detail">
        <h1 class="sc-post-title-detail">归档</h1>
        <p class="sc-page-intro">
          共 {total} 篇文章 · {tagTotal} 个标签
        </p>
        <div class="sc-archives-container">
          {[...years.entries()].map(([year, items]) => (
            <section class="sc-archive-year-block">
              <h2 class="sc-year">{year}</h2>
              {items.map((post) => {
                const date = isoDate(post.released, timeZone);
                return (
                  <div class="sc-archive-post">
                    <time class="sc-archive-date">{date.slice(5)}</time>
                    <a href={`/post/${encodeURIComponent(post.slug)}/`}>
                      {post.title}
                    </a>
                    {post.categories?.[0] ? (
                      <span class="sc-archive-category">
                        # {post.categories[0].name}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </article>
      <Pagination page={page} totalPages={totalPages} path="/archives/" />
    </div>
  );
}
