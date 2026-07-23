import type { OptionMap } from "../../../../types";

export function Footer({ options }: { options: OptionMap }) {
  return (
    <footer class="footer">
      <div class="container">
        <div class="footer-copyright">
          © {new Date().getFullYear()} <a href="/">{options.site_title}</a>
          {options.footer_info ? (
            <>
              {" "}
              · Theme by{" "}
              <span
                class="footer-info"
                dangerouslySetInnerHTML={{ __html: options.footer_info }}
              />
            </>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
