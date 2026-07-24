export function Icon({
  name,
  className,
}: {
  name: "menu" | "search" | "up" | "home" | "github" | "x" | "rss" | "mail";
  className?: string;
}) {
  const common = { class: className, viewBox: "0 0 24 24", "aria-hidden": "true" };
  if (name === "menu")
    return <svg {...common}><path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z" /></svg>;
  if (name === "search")
    return <svg {...common}><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="m20 20-4.35-4.35M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" /></svg>;
  if (name === "up")
    return <svg {...common}><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 19V5M5 12l7-7 7 7" /></svg>;
  if (name === "home")
    return <svg {...common}><path d="M12 3 2.5 11h2.2v9h5.2v-5.5h4.2V20h5.2v-9h2.2L12 3Z" /></svg>;
  if (name === "github")
    return <svg {...common}><path d="M12 .8a11.4 11.4 0 0 0-3.6 22.2c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.3.1 2 1.3 2 1.3 1.1 2 3 1.4 3.7 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6A4.7 4.7 0 0 1 5.4 8c-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.5 1.3a12 12 0 0 1 6.3 0c2.4-1.6 3.5-1.3 3.5-1.3.6 1.7.2 3 .1 3.3a4.7 4.7 0 0 1 1.3 3.3c0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3c0 .4.2.7.8.6A11.4 11.4 0 0 0 12 .8Z" /></svg>;
  if (name === "x")
    return <svg {...common}><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-6.5L6.3 22H3.2l7.2-8.3L.8 2h6.5l4.5 6 7.1-6Zm-1.1 17.8h1.7L6.4 4.1H4.6l13.2 15.7Z" /></svg>;
  if (name === "rss")
    return <svg {...common}><circle cx="5" cy="19" r="2" /><path d="M3 10a11 11 0 0 1 11 11h3A14 14 0 0 0 3 7v3Zm0-6a17 17 0 0 1 17 17h3A20 20 0 0 0 3 1v3Z" /></svg>;
  return <svg {...common}><path fill="none" stroke="currentColor" stroke-width="1.8" d="M3 5h18v14H3zM4 7l8 6 8-6" /></svg>;
}
