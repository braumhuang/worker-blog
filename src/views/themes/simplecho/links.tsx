import type { BlogLink } from "../../../types";
import { publicAttachmentUrl } from "../../../lib/utils";

export function Links({
  links,
  fileCdnUrl,
}: {
  links: BlogLink[];
  fileCdnUrl: string;
}) {
  return (
    <div class="sc-post-container">
      <article class="sc-post-detail">
        <h1 class="sc-post-title-detail">友情链接</h1>
        {links.length ? (
          <div class="sc-friends-grid">
            {links.map((link) => {
              const description = link.info.trim();
              return (
                <a
                  class="sc-friend-box"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.icon ? (
                    <img
                      class="sc-friend-avatar"
                      src={publicAttachmentUrl(link.icon, fileCdnUrl)}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <span class="sc-friend-avatar sc-friend-initial">
                      {Array.from(link.name)[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                  <span
                    class={`sc-friend-info${description ? "" : " is-name-only"}`}
                  >
                    <span class="sc-friend-name">{link.name}</span>
                    {description ? (
                      <span class="sc-friend-desc">{description}</span>
                    ) : null}
                  </span>
                </a>
              );
            })}
          </div>
        ) : (
          <div class="sc-empty">还没有友链。</div>
        )}
      </article>
    </div>
  );
}
