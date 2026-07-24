import type { ContentWithMeta } from "../../../types";
import { isoDate } from "../../../lib/utils";
import { Answer, Pagination, Question } from "./partials/shared";
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
      <Question
        variants={
          "时间都去哪儿了？\n帮我把时光按年份叠好，可以吗？\n回头看看，这些年留下了什么足迹？"
        }
      >
        时间都去哪儿了？
      </Question>
      <Answer
        intro={`我把 ${total} 篇文字按年份叠好了，另有 ${tagTotal} 个标签。`}
      >
        <div class="timeline">
          {[...years.entries()].map(([year, items]) => (
            <section class="timeline__year">
              <div class="timeline__year-label">
                <span>{year}</span>
                <span class="timeline__year-count">{items.length} 篇</span>
              </div>
              <div class="timeline__items">
                {items.map((post) => {
                  const d = isoDate(post.released, timeZone);
                  return (
                    <a
                      class="timeline__item"
                      href={`/post/${encodeURIComponent(post.slug)}/`}
                    >
                      <span class="timeline__dot" />
                      <time class="timeline__date">{d.slice(5)}</time>
                      <span class="timeline__title">{post.title}</span>
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} path="/archives/" />
      </Answer>
    </>
  );
}
