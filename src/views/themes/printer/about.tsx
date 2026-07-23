import type { OptionMap } from "../../../types";
import { publicAttachmentUrl } from "../../../lib/utils";
function n(v: string, e = false) {
  const x = v.trim();
  if (!x) return "";
  if (e) return x.startsWith("mailto:") ? x : `mailto:${x}`;
  return /^(https?:\/\/|\/)/i.test(x) ? x : `https://${x}`;
}
export function About({ options, html }: { options: OptionMap; html: string }) {
  const links = [
    ["GitHub", n(options.about_github || "")],
    ["X", n(options.about_x || "")],
    ["邮箱", n(options.about_email || "", true)],
    ["RSS", n(options.about_rss || "/atom.xml")],
  ];
  return (
    <article>
      <header class="about-page">
        <div class="about-avatar">
          {options.about_avatar ? (
            <img
              src={publicAttachmentUrl(
                options.about_avatar,
                options.file_cdn_url,
              )}
              alt={options.site_title}
            />
          ) : (
            <span>{options.site_title.slice(0, 1)}</span>
          )}
        </div>
        <h1 class="about-name">{options.site_title}</h1>
        {options.site_description ? (
          <p class="about-bio">{options.site_description}</p>
        ) : null}
        <div class="about-social">
          {links.map(([name, href]) =>
            href ? (
              <a
                href={href}
                target={name === "邮箱" ? undefined : "_blank"}
                rel={name === "邮箱" ? undefined : "noopener"}
              >
                {name}
              </a>
            ) : null,
          )}
        </div>
      </header>
      <div class="post-content" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
