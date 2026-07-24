import type { OptionMap } from "../../../types";
import { publicAttachmentUrl } from "../../../lib/utils";
import { Answer, Question } from "./partials/shared";
function n(value: string, email = false): string {
  const input = value.trim();
  if (!input) return "";
  if (email) return input.startsWith("mailto:") ? input : `mailto:${input}`;
  return /^(https?:\/\/|\/)/i.test(input) ? input : `https://${input}`;
}
export function About({ options, html }: { options: OptionMap; html: string }) {
  const avatar = options.about_avatar
    ? publicAttachmentUrl(options.about_avatar, options.file_cdn_url)
    : "";
  const links = [
    ["GitHub", n(options.about_github || "")],
    ["X", n(options.about_x || "")],
    ["RSS", n(options.about_rss || "/atom.xml")],
    ["邮箱", n(options.about_email || "", true)],
  ] as const;
  return (
    <>
      <Question
        variants={"屏幕背后的你，是个怎样的人？\n说说你自己吧，我想认识你。"}
      >
        屏幕背后的你，是个怎样的人？
      </Question>
      <Answer options={options} intro="很高兴认识你。">
        <div class="cg-about-card">
          {avatar ? (
            <img
              class="cg-about-avatar"
              src={avatar}
              alt={options.site_title}
            />
          ) : (
            <div class="cg-about-avatar">
              {Array.from(options.site_title)[0] || "C"}
            </div>
          )}
          <div>
            <h2>{options.site_title}</h2>
            <p>{options.site_description}</p>
            <div class="cg-social-row">
              {links.map(([label, href]) =>
                href ? (
                  <a
                    href={href}
                    target={label === "邮箱" ? undefined : "_blank"}
                    rel={label === "邮箱" ? undefined : "noopener noreferrer"}
                  >
                    {label}
                  </a>
                ) : null,
              )}
            </div>
          </div>
        </div>
        <article
          class="article-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Answer>
    </>
  );
}
