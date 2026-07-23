import type { OptionMap } from "../../../../types";
function normalized(value: string, email = false) {
  const v = value.trim();
  if (!v) return "";
  if (email) return v.startsWith("mailto:") ? v : `mailto:${v}`;
  return /^(https?:\/\/|\/)/i.test(v) ? v : `https://${v}`;
}
export function Footer({ options }: { options: OptionMap }) {
  const social = [
    ["GitHub", normalized(options.about_github || "")],
    ["X", normalized(options.about_x || "")],
    ["邮箱", normalized(options.about_email || "", true)],
    ["RSS", normalized(options.about_rss || "/atom.xml")],
  ];
  return (
    <footer class="site-footer">
      <div class="site-footer-card">
        <div class="site-footer-social">
          {social.map(([name, href]) =>
            href ? (
              <a
                href={href}
                class="social-link"
                target={name === "邮箱" ? undefined : "_blank"}
                rel={name === "邮箱" ? undefined : "noopener"}
                title={name}
                aria-label={name}
              >
                {name.slice(0, 1)}
              </a>
            ) : null,
          )}
        </div>
        <div class="site-footer-divider">
          <span class="divider-line" />
          <span class="divider-dot" />
          <span class="divider-line" />
        </div>
        <div class="site-footer-copyright">
          © {new Date().getFullYear()} {options.site_title}
        </div>
        {options.footer_info ? (
          <div
            class="site-footer-powered"
            dangerouslySetInnerHTML={{ __html: options.footer_info }}
          />
        ) : (
          <div class="site-footer-powered">
            <span>Theme</span>
            <strong>Printer</strong>
            <span>·</span>
            <span>Worker Blog</span>
          </div>
        )}
      </div>
      <button
        type="button"
        class="back-to-top"
        data-back-to-top
        aria-label="返回顶部"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
        </svg>
      </button>
    </footer>
  );
}
