export function Page({ html }: { html: string }) {
  return (
    <article class="post-detail page-detail">
      <div class="post-content" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
