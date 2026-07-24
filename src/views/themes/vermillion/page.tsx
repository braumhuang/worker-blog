import { Divider, Masthead } from "./partials/shared";

export function Page({ html }: { html: string }) {
  return (
    <>
      <Masthead
        en="Leaf"
        zh="单 · 页"
        tagline="A page kept outside the daily sequence."
      />
      <Divider>纸页 · A separate leaf</Divider>
      <section class="page-template fade-in" style="animation-delay:0.25s">
        <div
          class="prose post-content"
          data-code-copy
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>
      <button
        class="back-to-top"
        type="button"
        data-back-to-top
        aria-label="回到顶部"
      >
        ▲
      </button>
    </>
  );
}
