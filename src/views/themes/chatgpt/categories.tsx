import type { BlogMeta } from "../../../types";
import { Answer, Question } from "./partials/shared";
export function Categories({ categories }: { categories: BlogMeta[] }) { return <><Question>这些文字被放进了哪些抽屉？</Question><Answer intro={`一共有 ${categories.length} 个分类：`}><div class="tag-cloud">{categories.length?categories.map((category)=><a class="chip chip--lg" href={`/category/${encodeURIComponent(category.slug)}/`}>{category.name}<span class="chip__count">{category.count}</span></a>):<div class="cg-empty">还没有分类。</div>}</div></Answer></>; }
