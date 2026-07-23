import type { OptionMap } from "../../../types";
import { publicAttachmentUrl } from "../../../lib/utils";
function link(value: string, email = false) {
  const v = value.trim();
  if (!v) return "";
  if (email) return v.startsWith("mailto:") ? v : `mailto:${v}`;
  return /^(https?:\/\/|\/)/i.test(v) ? v : `https://${v}`;
}
export function About({ options, html }: { options: OptionMap; html: string }) {
  const socials = [
    ["GitHub", link(options.about_github || "")],
    ["X", link(options.about_x || "")],
    ["RSS", link(options.about_rss || "")],
    ["邮箱", link(options.about_email || "", true)],
  ];
  return (
    <article class="about post-detail">
      <header class="about-card">
        {options.about_avatar ? (
          <div class="about-avatar">
            <img
              src={publicAttachmentUrl(
                options.about_avatar,
                options.file_cdn_url,
              )}
              alt={options.site_title}
            />
          </div>
        ) : null}
        <h1 class="about-name">{options.site_title}</h1>
        {options.site_description ? (
          <p class="about-desc">{options.site_description}</p>
        ) : null}
        <div class="about-social-links">
          {socials.map(([name, href]) =>
            href ? (
              <a
                href={href}
                target={name === "邮箱" ? undefined : "_blank"}
                rel={name === "邮箱" ? undefined : "noopener noreferrer"}
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
