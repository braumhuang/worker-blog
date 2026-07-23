import type { PropsWithChildren } from "hono/jsx";
import type { BlogMeta, OptionMap } from "../../../types";
import { themeAssetPath } from "../../../theme";
import { Header } from "./partials/header";
import { Footer } from "./partials/footer";

type BaseProps = PropsWithChildren<{
  options: OptionMap;
  title?: string;
  active?: string;
  canonical?: string;
  description?: string;
  categories?: BlogMeta[];
}>;

export function Base({
  options,
  title,
  active,
  canonical,
  description,
  categories = [],
  children,
}: BaseProps) {
  const fullTitle = title
    ? `${title} · ${options.site_title}`
    : options.site_title;
  return (
    <html lang="zh-CN" data-theme="">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
        <meta
          name="description"
          content={description || options.site_description}
        />
        <meta name="color-scheme" content="light dark" />
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
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css"
        />
        <link
          rel="stylesheet"
          href={themeAssetPath("writecho", "public.css")}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const s=localStorage.getItem('writecho-theme');const d=s||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');if(d==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`,
          }}
        />
      </head>
      <body>
        <div
          class="reading-progress"
          data-reading-progress
          style="display:none"
        />
        <Header options={options} active={active} categories={categories} />
        <main class="container" role="main">
          {children}
        </main>
        <Footer options={options} />
        <button
          class="back-to-top"
          type="button"
          data-back-to-top
          aria-label="返回顶部"
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
        <script src={themeAssetPath("writecho", "public.js")} defer></script>
      </body>
    </html>
  );
}

export function PageHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header class="page-header">
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
      <span class="deco" />
    </header>
  );
}
