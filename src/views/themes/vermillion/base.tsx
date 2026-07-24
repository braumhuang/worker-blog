import type { PropsWithChildren } from "hono/jsx";
import type { BlogMeta, OptionMap } from "../../../types";
import { themeAssetPath } from "../../../theme";
import { Rail } from "./partials/rail";
import { Toolbar } from "./partials/toolbar";
import { Footer } from "./partials/footer";

export type BaseProps = PropsWithChildren<{
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
  tags = [],
  children,
}: BaseProps) {
  const fullTitle = title
    ? `${title} · ${options.site_title}`
    : `${options.site_title} · ${options.site_description}`;
  const bodyClass = !title
    ? "page-index"
    : active
      ? `page-${active}`
      : "page-post post-detail";
  return (
    <html lang="zh-CN" data-default-mode="auto">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#c2331c" />
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..700,0..100,0..1;1,9..144,300..700,0..100,0..1&family=Noto+Serif+SC:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href={themeAssetPath("vermillion", "public.css")}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const s=localStorage.getItem('vermillion-theme');const d=s||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');if(d==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`,
          }}
        />
      </head>
      <body class={bodyClass}>
        <div class="paper">
          <div class="grain" aria-hidden="true" />
          <div class="layout">
            <Rail
              options={options}
              active={active}
              categories={categories}
              tags={tags}
            />
            <main class="page">
              {children}
              <Footer options={options} />
            </main>
          </div>
        </div>
        <Toolbar options={options} />
        <script src={themeAssetPath("vermillion", "public.js")} defer />
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
  return <MastheadProxy title={title} subtitle={subtitle} />;
}

function MastheadProxy({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header class="masthead fade-in" style="animation-delay:0.05s">
      <div>
        <h1>
          <span class="mh-en">Journal</span>
          <span class="mh-zh">{title}</span>
        </h1>
        {subtitle ? <div class="masthead-tagline">{subtitle}</div> : null}
      </div>
      <div class="mh-meta">VOL. I · NO. 1</div>
    </header>
  );
}
