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
      <PageHeading title="友情链接" subtitle="这是一些值得一逛的角落" />
      <div class="links-grid">
        {links.map((link) => (
          <a
            class="link-card"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="link-card-avatar">
              {link.icon ? (
                <img
                  src={publicAttachmentUrl(link.icon, fileCdnUrl)}
                  alt={link.name}
                  loading="lazy"
                />
              ) : (
                <span>{link.name.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div class="link-card-body">
              <div class="link-card-name">{link.name}</div>
              {link.info.trim() ? (
                <div class="link-card-desc">{link.info}</div>
              ) : null}
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
