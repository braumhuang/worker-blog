import type { OptionMap } from "../../../../types";

export function Footer({ options }: { options: OptionMap }) {
  const footerInfo = options.footer_info.includes("/themes/kehua")
    ? "Vermillion · 朱砂落纸"
    : options.footer_info;
  return (
    <>
      <div class="folio">p. i</div>
      <footer class="vermillion-footer">
        <span>
          © {new Date().getFullYear()} {options.site_title}
        </span>
        {footerInfo ? (
          <span dangerouslySetInnerHTML={{ __html: footerInfo }} />
        ) : null}
      </footer>
    </>
  );
}
