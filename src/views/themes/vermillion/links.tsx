import type { BlogLink } from "../../../types";
import { publicAttachmentUrl } from "../../../lib/utils";
import { Divider, Masthead } from "./partials/shared";

export function Links({ links, fileCdnUrl }: { links: BlogLink[]; fileCdnUrl: string }) {
  return (
    <>
      <Masthead en="Friends" zh="友 · 链" tagline="Places where other versions of the same hush live." />
      <Divider>邻人 · Neighbouring quietness</Divider>
      {links.length ? (
        <div class="links-grid fade-in" style="animation-delay:0.3s">
          {links.map((link) => (
            <a class="flink" href={link.url} target="_blank" rel="noopener noreferrer">
              <div class="flink-avatar">
                {link.icon ? <img src={publicAttachmentUrl(link.icon, fileCdnUrl)} alt={link.name} loading="lazy" /> : (Array.from(link.name)[0] || "友")}
              </div>
              <div class="flink-body">
                <div class="flink-name">{link.name}</div>
                {link.info.trim() ? <div class="flink-desc">{link.info}</div> : null}
              </div>
            </a>
          ))}
        </div>
      ) : <div class="empty">— 还没有添加友链。</div>}
    </>
  );
}
