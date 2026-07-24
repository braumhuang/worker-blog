import type { BlogMeta, OptionMap } from "../../../../types";
import { formatDate, isoDate } from "../../../../lib/utils";

export function roman(index: number): string {
  const values = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
  return values[index] ?? String(index + 1);
}

export function magazineDate(timestamp: number, timeZone: string): string {
  return isoDate(timestamp, timeZone).replaceAll("-", " · ");
}

export function magazineTime(timestamp: number, timeZone: string): string {
  const formatted = formatDate(timestamp, true, timeZone);
  return formatted.slice(-5);
}

export function Masthead({
  en,
  zh,
  subtitle,
  tagline,
  volume = "VOL. I · NO. 1",
  date,
  time,
  extra,
}: {
  en: string;
  zh?: string;
  subtitle?: string;
  tagline?: string;
  volume?: string;
  date?: string;
  time?: string;
  extra?: unknown;
}) {
  return (
    <header class="masthead fade-in" style="animation-delay:0.05s">
      <div>
        <h1>
          <span class="mh-en">{en}</span>
          {zh ? <span class="mh-zh">{zh}</span> : null}
        </h1>
        {subtitle ? <div class="masthead-subtitle">{subtitle}</div> : null}
        {tagline ? <div class="masthead-tagline">{tagline}</div> : null}
      </div>
      <div class="mh-meta">
        {volume}
        {date ? (
          <>
            <br />
            <span class="vermillion">{date}</span>
          </>
        ) : null}
        {time ? (
          <>
            <br />
            {time}
          </>
        ) : null}
        {extra ? (
          <>
            <br />
            {extra}
          </>
        ) : null}
      </div>
    </header>
  );
}

export function Divider({
  glyph = "i",
  children,
  delay = "0.2s",
}: {
  glyph?: string;
  children: unknown;
  delay?: string;
}) {
  return (
    <div class="divider fade-in" style={`animation-delay:${delay}`}>
      <span class="glyph">{glyph}</span>
      <span>{children}</span>
      <span class="glyph">{glyph}</span>
    </div>
  );
}

export function Seal({
  chars = ["朱", "砂", "落", "纸"],
}: {
  chars?: [string, string, string, string];
}) {
  const [c1, c2, c3, c4] = chars;
  return (
    <div class="seal" aria-label={chars.join("")}>
      <svg viewBox="0 0 132 132" xmlns="http://www.w3.org/2000/svg" role="img">
        <defs>
          <filter
            id="vermillion-stamp-distress"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="2"
              seed="3"
            />
            <feDisplacementMap in="SourceGraphic" scale="1.6" />
          </filter>
        </defs>
        <g
          filter="url(#vermillion-stamp-distress)"
          fill="currentColor"
          stroke="currentColor"
        >
          <rect
            x="8"
            y="8"
            width="116"
            height="116"
            rx="3"
            fill="none"
            stroke-width="3.5"
          />
          <rect
            x="14"
            y="14"
            width="104"
            height="104"
            rx="1"
            fill="none"
            stroke-width="1"
          />
          <line x1="66" y1="18" x2="66" y2="114" stroke-width="1" />
          <line x1="18" y1="66" x2="114" y2="66" stroke-width="1" />
          <text
            x="42"
            y="56"
            font-family="'Noto Serif SC',serif"
            font-size="28"
            font-weight="700"
            text-anchor="middle"
          >
            {c1}
          </text>
          <text
            x="90"
            y="56"
            font-family="'Noto Serif SC',serif"
            font-size="28"
            font-weight="700"
            text-anchor="middle"
          >
            {c2}
          </text>
          <text
            x="42"
            y="100"
            font-family="'Noto Serif SC',serif"
            font-size="28"
            font-weight="700"
            text-anchor="middle"
          >
            {c3}
          </text>
          <text
            x="90"
            y="100"
            font-family="'Noto Serif SC',serif"
            font-size="28"
            font-weight="700"
            text-anchor="middle"
          >
            {c4}
          </text>
        </g>
      </svg>
    </div>
  );
}

export function ThemeCloud({ tags }: { tags: BlogMeta[] }) {
  if (!tags.length) return null;
  return (
    <div class="themecloud">
      {tags.slice(0, 42).map((tag, index) => (
        <>
          <a href={`/tag/${encodeURIComponent(tag.slug)}/`}>{tag.name}</a>
          {index < Math.min(tags.length, 42) - 1 ? (
            <span class="sep">·</span>
          ) : null}
        </>
      ))}
    </div>
  );
}

export function siteVolume(_options: OptionMap): string {
  return "VOL. I · NO. 1";
}
