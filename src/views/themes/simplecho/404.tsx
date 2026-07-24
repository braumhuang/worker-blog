import { Icon } from "./partials/icons";

export function NotFound() {
  return (
    <section class="sc-404">
      <div class="sc-404-num">404</div>
      <p class="sc-404-text">这页可能走丢了，也可能从未被写下。</p>
      <a class="sc-404-btn" href="/">
        <Icon name="home" /> 返回首页
      </a>
    </section>
  );
}
