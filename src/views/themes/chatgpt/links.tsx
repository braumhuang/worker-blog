import type { BlogLink } from "../../../types";
import { publicAttachmentUrl } from "../../../lib/utils";
import { Answer, Question } from "./partials/shared";
export function Links({
  links,
  fileCdnUrl,
}: {
  links: BlogLink[];
  fileCdnUrl: string;
}) {
  return (
    <>
      <Question
        variants={
          "在互联网的茫茫人海里，你和谁相遇过？\n介绍几个你的朋友给我认识吧？"
        }
      >
        在互联网的茫茫人海里，你和谁相遇过？
      </Question>
      <Answer intro="互联网很大，能相遇是缘分。这些是我的朋友们：">
        <div class="link-list">
          {links.length ? (
            links.map((link) => {
              const description = link.info.trim();
              return (
                <a
                  class={`link-row${description ? "" : " cg-link-name-only"}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.icon ? (
                    <img
                      class="link-row__avatar"
                      src={publicAttachmentUrl(link.icon, fileCdnUrl)}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <span class="link-row__avatar link-row__avatar--fallback">
                      {Array.from(link.name)[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                  <span class="link-row__meta">
                    <strong class="link-row__name">{link.name}</strong>
                    {description ? (
                      <span class="link-row__desc">{description}</span>
                    ) : null}
                  </span>
                  <span class="link-row__arrow">↗</span>
                </a>
              );
            })
          ) : (
            <div class="cg-empty">还没有友链。</div>
          )}
        </div>
      </Answer>
    </>
  );
}
