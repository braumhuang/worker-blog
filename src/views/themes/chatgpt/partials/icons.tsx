export type IconName = "brand" | "sidebar" | "search" | "home" | "post" | "archive" | "memo" | "tag" | "category" | "link" | "about" | "sun" | "moon" | "chevron" | "github" | "x" | "rss" | "mail" | "copy" | "up" | "comment";

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const common = { class: className, viewBox: "0 0 24 24", "aria-hidden": "true" };
  if (name === "brand") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3.2 17.4 6v6L12 14.8 6.6 12V6L12 3.2Z"/><path d="m6.6 9 5.4 2.8L17.4 9M12 11.8v6M7.1 13.8 12 20.5l4.9-6.7"/></svg>;
  if (name === "sidebar") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9.5 3v18"/></svg>;
  if (name === "search") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
  if (name === "home") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="m3 11 9-8 9 8"/><path d="M5.5 9.5V21h13V9.5M9.5 21v-7h5v7"/></svg>;
  if (name === "post") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 11h6M9 15h6"/></svg>;
  if (name === "archive") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v4H4zM6 8v12h12V8M9 12h6"/></svg>;
  if (name === "memo") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5"/></svg>;
  if (name === "tag") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="7.5" cy="8.5" r="1"/></svg>;
  if (name === "category") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  if (name === "link") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M10 14 8.5 15.5a4 4 0 1 1-5.7-5.7L6 6.6a4 4 0 0 1 5.7 0"/><path d="m14 10 1.5-1.5a4 4 0 1 1 5.7 5.7L18 17.4a4 4 0 0 1-5.7 0"/><path d="m8.5 15.5 7-7"/></svg>;
  if (name === "about") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>;
  if (name === "sun") return <svg {...common} fill="currentColor"><circle cx="12" cy="12" r="4"/><path d="M11 1h2v3h-2zM11 20h2v3h-2zM20 11h3v2h-3zM1 11h3v2H1zM18.4 4.2l1.4 1.4-2.1 2.1-1.4-1.4zM4.2 18.4l1.4 1.4 2.1-2.1-1.4-1.4zM18.4 19.8l1.4-1.4-2.1-2.1-1.4 1.4zM4.2 5.6l1.4-1.4 2.1 2.1-1.4 1.4z"/></svg>;
  if (name === "moon") return <svg {...common} fill="currentColor"><path d="M21 14.2A8.5 8.5 0 0 1 9.8 3 9 9 0 1 0 21 14.2Z"/></svg>;
  if (name === "chevron") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.8"><path d="m8 10 4 4 4-4"/></svg>;
  if (name === "github") return <svg {...common} fill="currentColor"><path d="M12 .8a11.4 11.4 0 0 0-3.6 22.2c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.3.1 2 1.3 2 1.3 1.1 2 3 1.4 3.7 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6A4.7 4.7 0 0 1 5.4 8c-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.5 1.3a12 12 0 0 1 6.3 0c2.4-1.6 3.5-1.3 3.5-1.3.6 1.7.2 3 .1 3.3a4.7 4.7 0 0 1 1.3 3.3c0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3c0 .4.2.7.8.6A11.4 11.4 0 0 0 12 .8Z"/></svg>;
  if (name === "x") return <svg {...common} fill="currentColor"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-6.5L6.3 22H3.2l7.2-8.3L.8 2h6.5l4.5 6 7.1-6Zm-1.1 17.8h1.7L6.4 4.1H4.6l13.2 15.7Z"/></svg>;
  if (name === "rss") return <svg {...common} fill="currentColor"><circle cx="5" cy="19" r="2"/><path d="M3 10a11 11 0 0 1 11 11h3A14 14 0 0 0 3 7v3Zm0-6a17 17 0 0 1 17 17h3A20 20 0 0 0 3 1v3Z"/></svg>;
  if (name === "mail") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 5h18v14H3z"/><path d="m4 7 8 6 8-6"/></svg>;
  if (name === "copy") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.7"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>;
  if (name === "comment") return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v12H8l-4 4V4Z"/></svg>;
  return <svg {...common} fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20V4M5 11l7-7 7 7"/></svg>;
}
