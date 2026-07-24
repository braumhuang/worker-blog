import { Answer, Question } from "./partials/shared";
export function Page({ html }: { html: string }) { return <><Question>请把这个页面的内容告诉我。</Question><Answer intro="当然，内容都整理在这里："><article class="article-content cg-page-content" dangerouslySetInnerHTML={{ __html: html }} /></Answer></>; }
