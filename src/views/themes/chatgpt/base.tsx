import type { PropsWithChildren } from "hono/jsx";
import type { BlogMeta, OptionMap } from "../../../types";
import { themeAssetPath } from "../../../theme";
import { Sidebar } from "./partials/sidebar";
import { Topbar } from "./partials/topbar";
import { Composer, SearchModal } from "./partials/composer";

type BaseProps = PropsWithChildren<{
  options: OptionMap;
  title?: string;
  active?: string;
  canonical?: string;
  description?: string;
  categories?: BlogMeta[];
  tags?: BlogMeta[];
}>;

export function Base({
  options,
  title,
  active,
  canonical,
  description,
  children,
}: BaseProps) {
  const fullTitle = title
    ? `${title} - ${options.site_title}`
    : options.site_title;
  const accent = /^#[0-9a-f]{6}$/i.test(options.theme_color || "")
    ? options.theme_color
    : "#10a37f";
  const boot = `try{var t=localStorage.getItem('chatgpt-theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);if(localStorage.getItem('chatgpt-sidebar')==='closed'&&innerWidth>900)document.documentElement.classList.add('sidebar-collapsed')}catch(e){}`;
  return (
    <html lang="zh-CN" data-theme="light">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta
          name="description"
          content={description || options.site_description}
        />
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content={accent} />
        <title>{fullTitle}</title>
        <link
          rel="icon"
          type="image/svg+xml"
          href={`/favicon.svg?v=${encodeURIComponent(`${options.favicon_text}-${options.favicon_color}`)}`}
        />
        {canonical ? <link rel="canonical" href={canonical} /> : null}
        <link
          rel="alternate"
          type="application/atom+xml"
          title={`${options.site_title} Atom Feed`}
          href="/atom.xml"
        />
        <style>{`:root{--accent:${accent};--content-w:56rem}`}</style>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <link rel="stylesheet" href={themeAssetPath("chatgpt", "public.css")} />
      </head>
      <body>
        <div
          id="cg-reading-progress"
          style="position:fixed;left:0;top:0;width:100%;height:2px;background:var(--accent);transform:scaleX(0);transform-origin:left;z-index:100;transition:transform .08s linear"
        />
        <Sidebar options={options} active={active} />
        <div class="main">
          <Topbar options={options} />
          <main class="content" id="content">
            <div class="chat-thread" id="chat-thread">
              {children}
            </div>
          </main>
          <Composer options={options} />
        </div>
        <SearchModal />
        <script src={themeAssetPath("chatgpt", "public.js")} defer />
      </body>
    </html>
  );
}
