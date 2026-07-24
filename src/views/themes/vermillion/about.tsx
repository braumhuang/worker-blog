import type { OptionMap } from "../../../types";
import { publicAttachmentUrl } from "../../../lib/utils";
import { Masthead, Seal } from "./partials/shared";

function normalizedUrl(value: string, email = false): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (email) return trimmed.startsWith("mailto:") ? trimmed : `mailto:${trimmed}`;
  if (/^(https?:\/\/|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function About({ options, html }: { options: OptionMap; html: string }) {
  const links = [
    ["GitHub", normalizedUrl(options.about_github || "")],
    ["X", normalizedUrl(options.about_x || "")],
    ["RSS", normalizedUrl(options.about_rss || "/atom.xml")],
    ["Email", normalizedUrl(options.about_email || "", true)],
  ] as const;
  return (
    <>
      <Masthead en="Colophon" zh="关于" tagline="Who keeps this paper, and why." />
      <section class="about-page fade-in" style="animation-delay:0.2s">
        <div class="about-seal">
          <Seal />
          <div class="seal-cap">编 · 验</div>
          {options.about_avatar ? <div class="about-avatar"><img src={publicAttachmentUrl(options.about_avatar, options.file_cdn_url)} alt={options.site_title} /></div> : null}
        </div>
        <div class="about-prose">
          <div class="prose" dangerouslySetInnerHTML={{ __html: html }} />
          <p class="about-contact-line">
            纸面札记 · Paper Journal<br />
            {links.map(([label, href], index) => href ? <>{index ? " · " : ""}<a href={href} target={label === "Email" ? undefined : "_blank"} rel={label === "Email" ? undefined : "noopener noreferrer"}>{label}</a></> : null)}
          </p>
        </div>
      </section>
    </>
  );
}
