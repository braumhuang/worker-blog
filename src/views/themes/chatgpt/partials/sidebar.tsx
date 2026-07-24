import type { OptionMap } from "../../../../types";
import { navigationItemsFromOptions } from "../../../../lib/navigation";
import { publicAttachmentUrl } from "../../../../lib/utils";
import { Icon, type IconName } from "./icons";

function normalized(value: string, email = false): string {
  const input = value.trim(); if (!input) return ""; if (email) return input.startsWith("mailto:") ? input : `mailto:${input}`; if (/^(https?:\/\/|\/)/i.test(input)) return input; return `https://${input}`;
}
function navIcon(id: string): IconName {
  if (id === "home") return "home"; if (id === "archives") return "archive"; if (id === "memos") return "memo"; if (id === "tags") return "tag"; if (id === "categories") return "category"; if (id === "links") return "link"; if (id === "about") return "about"; return "post";
}

export function Sidebar({ options, active }: { options: OptionMap; active?: string }) {
  const navigation = navigationItemsFromOptions(options).filter((item) => item.visible);
  const avatar = options.about_avatar ? publicAttachmentUrl(options.about_avatar, options.file_cdn_url) : "";
  const initial = Array.from(options.site_title.trim())[0]?.toUpperCase() || "C";
  const aboutUrl = navigation.find((item) => item.id === "about")?.url || "/post/about/";
  const social = [
    ["github", "GitHub", normalized(options.about_github || "")], ["x", "X", normalized(options.about_x || "")], ["rss", "RSS", normalized(options.about_rss || "/atom.xml")], ["mail", "邮箱", normalized(options.about_email || "", true)],
  ] as const;
  return <>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar__top"><a class="sidebar__brand" href="/" aria-label={`${options.site_title} 首页`}>{avatar ? <img class="sidebar__brand-logo" src={avatar} alt={options.site_title} /> : <span class="sidebar__brand-logo sidebar__brand-logo--fallback"><Icon name="brand" /></span>}</a><button class="icon-btn" id="sidebar-close" type="button" aria-label="收起侧边栏" title="收起侧边栏"><Icon name="sidebar" /></button></div>
      <button class="sidebar__search" id="sidebar-search" type="button"><Icon name="search" /><span>搜索</span><kbd class="sidebar__search-kbd">⌘ K</kbd></button>
      <nav class="sidebar__nav" aria-label="主导航">{navigation.map((item) => <a class={`sidebar__nav-item${active === item.id ? " is-active" : ""}`} href={item.url} data-link={item.url}><span class="sidebar__nav-icon"><Icon name={navIcon(item.id)} /></span><span class="sidebar__nav-label">{item.name}</span></a>)}</nav>
      <div class="sidebar__recent"><div class="sidebar__recent-title">最近</div><ul class="sidebar__recent-list" id="sidebar-recent-list"><li><a href="/archives/">正在读取会话…</a></li></ul></div>
      <div class="sidebar__foot"><button class="sidebar__user" id="sidebar-user" type="button" aria-expanded="false">{avatar ? <img class="sidebar__user-avatar" src={avatar} alt="" /> : <span class="sidebar__user-avatar sidebar__user-avatar--fallback">{initial}</span>}<span class="sidebar__user-meta"><span class="sidebar__user-name">{options.site_title}</span><span class="sidebar__user-desc">{options.site_description}</span></span><Icon name="chevron" className="sidebar__user-chevron" /></button>
        <div class="user-menu" id="user-menu" hidden><a class="user-menu__item" href={aboutUrl}><Icon name="about" /><span>关于本站</span></a><div class="user-menu__sep" />{social.map(([icon, label, href]) => href ? <a class="user-menu__item" href={href} target={icon === "mail" ? undefined : "_blank"} rel={icon === "mail" ? undefined : "noopener noreferrer"}><Icon name={icon} /><span>{label}</span></a> : null)}</div>
      </div>
      <div class="cg-sidebar-copyright">© {new Date().getFullYear()} <a href="/">{options.site_title}</a></div>
    </aside><div class="sidebar-overlay" id="sidebar-overlay" />
  </>;
}
