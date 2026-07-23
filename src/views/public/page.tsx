export function Page({ html }: { html: string }) {
  return <section class="page-template"><div class="article-content" dangerouslySetInnerHTML={{ __html: html }}/></section>
}
