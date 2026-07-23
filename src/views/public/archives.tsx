import type { ContentWithMeta } from "../../types";
import { isoDate } from "../../lib/utils";
import { PageHeading, Pagination } from "./base";

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
    <>
      <PageHeading title="归档" subtitle="站内全部文章，按发布时间倒序" />
      <div class="archive-stats">
        <div class="archive-stat">
          <div class="archive-stat-number">{total}</div>
          <div class="archive-stat-label">篇文章</div>
        </div>
        <div class="archive-stat">
          <div class="archive-stat-number">{tagTotal}</div>
          <div class="archive-stat-label">个标签</div>
        </div>
      </div>
      {[...years.entries()].map(([year, items]) => (
        <section class="archive-year">
          <h2 class="archive-year-title">{year}</h2>
          <ul class="archive-list">
            {items.map((post) => (
              <li class="archive-item">
                <time class="archive-date">
                  {isoDate(post.released, timeZone)}
                </time>
                <div class="archive-title">
                  <a href={`/post/${encodeURIComponent(post.slug)}/`}>
                    {post.title}
                  </a>
                </div>
                {post.categories?.[0]?.name ? (
                  <span class="archive-category">
                    {post.categories[0].name}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <Pagination page={page} totalPages={totalPages} path="/archives/" />
    </>
  );
}
