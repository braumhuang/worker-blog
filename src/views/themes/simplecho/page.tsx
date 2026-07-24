export function Page({ html }: { html: string }) {
  return (
    <div class="sc-post-container">
      <article class="sc-post-detail sc-page-detail">
        <div class="sc-post-content" id="sc-post-content" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  );
}
