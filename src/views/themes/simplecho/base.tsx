import type { PropsWithChildren } from "hono/jsx";
import type { BlogMeta, OptionMap } from "../../../types";
import { themeAssetPath } from "../../../theme";
import { Header } from "./partials/header";
import { Footer } from "./partials/footer";
import { Icon } from "./partials/icons";

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
  categories = [],
  children,
}: BaseProps) {
  const fullTitle = title ? `${title} · ${options.site_title}` : `${options.site_title} · ${options.site_description}`;
  const runtimeConfig = JSON.stringify({
    themePalette: "gray",
    themeAutoDark: true,
    themeUserToggle: true,
    showReadingProgress: true,
    showBackToTop: true,
    showCodeCopy: true,
    showLazyLoad: true,
    showSearch: true,
  }).replaceAll("<", "\\u003c");
  return (
    <html lang="zh-CN" data-sc-palette="gray">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="description" content={description || options.site_description} />
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#f9f9f9" />
        <title>{fullTitle}</title>
        <link rel="icon" type="image/svg+xml" href={`/favicon.svg?v=${encodeURIComponent(`${options.favicon_text}-${options.favicon_color}`)}`} />
        {canonical ? <link rel="canonical" href={canonical} /> : null}
        <link rel="alternate" type="application/atom+xml" title={`${options.site_title} Atom Feed`} href="/atom.xml" />
        <style>{`:root{--sc-container:1000px;--sc-font:"PingFang SC",-apple-system,BlinkMacSystemFont,opensans,Optima,"Microsoft YaHei",sans-serif}`}</style>
        <script dangerouslySetInnerHTML={{ __html: `try{var s=localStorage.getItem('simplecho-palette');var p=(s==='gray'||s==='white'||s==='green'||s==='black')?s:(matchMedia('(prefers-color-scheme:dark)').matches?'black':'gray');document.documentElement.setAttribute('data-sc-palette',p)}catch(e){}` }} />
        <link rel="stylesheet" href={themeAssetPath("simplecho", "public.css")} />
        <script id="simplecho-config" type="application/json" dangerouslySetInnerHTML={{ __html: runtimeConfig }} />
      </head>
      <body>
        <div class="sc-reading-progress" id="sc-reading-progress" />
        <div class="sc-main">
          <div class="sc-main-content">
            <Header options={options} active={active} categories={categories} />
            <main class="sc-body">{children}</main>
            <Footer options={options} />
          </div>
        </div>
        <button id="sc-back-to-top" class="sc-back-to-top" type="button" aria-label="返回顶部" title="返回顶部"><Icon name="up" /></button>
        <script src={themeAssetPath("simplecho", "public.js")} defer />
      </body>
    </html>
  );
}

export function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header class="sc-page-heading">
      <h1 class="sc-post-title-detail">{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  );
}
