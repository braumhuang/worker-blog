import { Masthead } from "./partials/shared";

export function NotFound() {
  return (
    <>
      <Masthead
        en="Lost"
        zh="页面不见了"
        tagline="Some pages drift off the desk. Try the index."
      />
      <section class="not-found fade-in" style="animation-delay:0.2s">
        <div class="num">404</div>
        <div class="msg">这页可能被风吹走了 — 或者从未在这本册子上出现过。</div>
        <a class="back" href="/">
          ← 回到纸面 · Home
        </a>
      </section>
    </>
  );
}
