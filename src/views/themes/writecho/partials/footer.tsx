import type { OptionMap } from "../../../../types";
export function Footer({ options }: { options: OptionMap }) {
  return (
    <footer class="site-footer">
      <div class="container">
        <p class="footer-slogan">笔尖之下，皆是回声</p>
        <p>
          © {new Date().getFullYear()} <a href="/">{options.site_title}</a>
          {options.footer_info ? (
            <>
              {" "}
              ·{" "}
              <span dangerouslySetInnerHTML={{ __html: options.footer_info }} />
            </>
          ) : null}
        </p>
      </div>
    </footer>
  );
}
