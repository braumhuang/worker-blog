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
  const bodyClass = active || (!title ? "home" : "page");
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1"
        />
        <meta name="format-detection" content="telephone=no" />
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
        <link rel="stylesheet" href={themeAssetPath("printer", "public.css")} />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const s=localStorage.getItem('printer-theme-mode');const d=s||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');if(d==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body class={bodyClass}>
        <div class="site-wrap">
          <Header options={options} active={active} categories={categories} />
          <main class="paper">{children}</main>
          <Footer options={options} />
        </div>
        <script src={themeAssetPath("printer", "public.js")} defer></script>
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
    <>
      <h2 class="paper-title">{title}</h2>
      {subtitle ? <p class="paper-subtitle">{subtitle}</p> : null}
    </>
  );
}
