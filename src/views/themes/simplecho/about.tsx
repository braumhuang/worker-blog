import type { OptionMap } from "../../../types";
import { publicAttachmentUrl } from "../../../lib/utils";
import { Icon } from "./partials/icons";

function n(value: string, email = false): string {
  const input = value.trim();
  if (!input) return "";
  if (email) return input.startsWith("mailto:") ? input : `mailto:${input}`;
  if (/^(https?:\/\/|\/)/i.test(input)) return input;
  return `https://${input}`;
}

export function About({ options, html }: { options: OptionMap; html: string }) {
  const links = [
    ["github", "GitHub", n(options.about_github || "")],
    ["x", "X", n(options.about_x || "")],
    ["rss", "RSS", n(options.about_rss || "/atom.xml")],
    ["mail", "邮箱", n(options.about_email || "", true)],
  ] as const;
  return (
    <div class="sc-post-container">
      <article class="sc-post-detail sc-about-page">
        <div class="sc-about-profile">
          {options.about_avatar ? (
            <img
              src={publicAttachmentUrl(
                options.about_avatar,
                options.file_cdn_url,
              )}
              alt={options.site_title}
            />
          ) : (
            <div class="sc-about-initial">
              {Array.from(options.site_title)[0] || "S"}
            </div>
          )}
          <h1>{options.site_title}</h1>
          {options.site_description ? <p>{options.site_description}</p> : null}
          <div class="sc-about-social">
            {links.map(([icon, label, href]) =>
              href ? (
                <a
                  href={href}
                  aria-label={label}
                  title={label}
                  target={icon === "mail" ? undefined : "_blank"}
                  rel={icon === "mail" ? undefined : "noopener noreferrer"}
                >
                  <Icon name={icon} />
                </a>
              ) : null,
            )}
          </div>
        </div>
        <div
          class="sc-post-content"
          id="sc-post-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </div>
  );
}
