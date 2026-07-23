export function Page({ html }: { html: string }) {
  return (
    <article class="printer-page">
      <div class="post-content" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
