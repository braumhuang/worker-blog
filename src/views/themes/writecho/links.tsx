import type { BlogLink } from "../../../types";
import { publicAttachmentUrl } from "../../../lib/utils";
import { PageHeading } from "./base";

export function Links({
  links,
  fileCdnUrl,
}: {
  links: BlogLink[];
  fileCdnUrl: string;
}) {
  return (
    <>
      <PageHeading title="友情链接" subtitle="笔尖之外，还有许多有趣的人" />
      <div class="links">
        {links.map((link) => {
          const description = link.info.trim();
          return (
            <a
              class={`link-card ${description ? "has-description" : "without-description"}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="link-avatar">
                {link.icon ? (
                  <img
                    src={publicAttachmentUrl(link.icon, fileCdnUrl)}
                    alt={link.name}
                    loading="lazy"
                  />
                ) : (
                  <span>{link.name.slice(0, 1).toUpperCase()}</span>
                )}
              </span>
              <span class="link-info">
                <span class="link-name">{link.name}</span>
                {description ? (
                  <span class="link-desc">{description}</span>
                ) : null}
              </span>
            </a>
          );
        })}
      </div>
    </>
  );
}
