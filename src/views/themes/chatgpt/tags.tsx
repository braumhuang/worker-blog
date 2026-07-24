import type { BlogMeta } from "../../../types";
import { Answer, Question } from "./partials/shared";
export function Tags({ tags }: { tags: BlogMeta[] }) { return <><Question variants={'如果给你的文字贴上标签，会有哪些？\n这些文字，都围绕着什么打转？'}>如果给你的文字贴上标签，会有哪些？</Question><Answer intro={`大概是这 ${tags.length} 个词，圈住了我反复思考的事：`}><div class="tag-cloud">{tags.length?tags.map((tag)=><a class="chip chip--lg" href={`/tag/${encodeURIComponent(tag.slug)}/`}>{tag.name}<span class="chip__count">{tag.count}</span></a>):<div class="cg-empty">还没有标签。</div>}</div></Answer></>; }
